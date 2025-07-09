// Supabase統合サービス
import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 認証サービス
export const authService = {
    // サインアップ
    async signUp(userData) {
        try {
            // Supabase Authでユーザー作成
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        first_name: userData.firstName,
                        last_name: userData.lastName
                    }
                }
            });

            if (authError) throw authError;

            // プロファイル作成
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: authData.user.id,
                    email: userData.email,
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    company: userData.company,
                    position: userData.position,
                    phone: userData.phone,
                    industry: userData.industry,
                    company_size: userData.companySize,
                    referred_by: userData.referrerId || null
                });

            if (profileError) throw profileError;

            // 招待コードがある場合、招待履歴を作成
            if (userData.referralCode) {
                await this.trackReferral(authData.user.id, userData.referralCode);
            }

            return { success: true, user: authData.user };
        } catch (error) {
            console.error('SignUp error:', error);
            throw error;
        }
    },

    // ログイン
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    },

    // ログアウト
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // 現在のユーザー取得
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // プロファイル情報も取得
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return { ...user, profile };
    },

    // 招待トラッキング
    async trackReferral(inviteeId, referralCode) {
        // 招待コードから招待者を特定
        const { data: inviteLink } = await supabase
            .from('invite_links')
            .select('user_id')
            .eq('invite_code', referralCode)
            .eq('is_active', true)
            .single();

        if (inviteLink) {
            // 招待履歴を作成
            await supabase
                .from('invite_history')
                .insert({
                    referrer_id: inviteLink.user_id,
                    invitee_id: inviteeId,
                    invite_code: referralCode,
                    status: 'registered',
                    points_awarded: 1000
                });
        }
    }
};

// 招待管理サービス
export const inviteService = {
    // 招待リンク生成
    async generateInviteLink(userId) {
        // 既存のアクティブなリンクを無効化
        await supabase
            .from('invite_links')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('is_active', true);

        // 新しいリンクを生成
        const { data, error } = await supabase
            .rpc('generate_invite_code', { user_id_param: userId })
            .single();

        if (error) throw error;

        // 招待リンクを保存
        const { data: inviteLink, error: insertError } = await supabase
            .from('invite_links')
            .insert({
                user_id: userId,
                invite_code: data
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return inviteLink;
    },

    // 招待履歴取得
    async getInviteHistory(userId) {
        const { data, error } = await supabase
            .from('invite_history')
            .select(`
                *,
                invitee:invitee_id(
                    first_name,
                    last_name,
                    email,
                    company
                )
            `)
            .eq('referrer_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // ユーザーポイント取得
    async getUserPoints(userId) {
        const { data, error } = await supabase
            .from('user_points')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // レコードがない場合は初期値を返す
            return {
                total_points: 0,
                available_points: 0,
                pending_points: 0,
                lifetime_points: 0,
                current_rank: 'bronze',
                rank_progress: 0
            };
        }

        if (error) throw error;
        return data;
    },

    // ポイント履歴取得
    async getPointHistory(userId) {
        const { data, error } = await supabase
            .from('point_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data;
    }
};

// イベントサービス
export const eventService = {
    // イベント一覧取得
    async getEvents(filters = {}) {
        let query = supabase
            .from('events')
            .select(`
                *,
                host:host_id(
                    first_name,
                    last_name,
                    company
                ),
                participants:event_participants(count)
            `);

        // フィルター適用
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query.order('event_date', { ascending: true });
        
        if (error) throw error;
        return data;
    },

    // イベント参加登録
    async registerForEvent(eventId, userId) {
        const { error } = await supabase
            .from('event_participants')
            .insert({
                event_id: eventId,
                user_id: userId
            });

        if (error) throw error;

        // 参加者数を更新
        await supabase.rpc('increment_event_participants', { 
            event_id: eventId 
        });
    }
};

// ビジネスマッチングサービス
export const businessService = {
    // 案件一覧取得
    async getOpportunities(filters = {}) {
        let query = supabase
            .from('business_opportunities')
            .select(`
                *,
                poster:user_id(
                    first_name,
                    last_name,
                    company
                ),
                interests:business_interests(count)
            `);

        // フィルター適用
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.industry) {
            query = query.eq('industry', filters.industry);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    // 興味を示す
    async addInterest(opportunityId, userId, message = '') {
        const { error } = await supabase
            .from('business_interests')
            .insert({
                opportunity_id: opportunityId,
                user_id: userId,
                message
            });

        if (error) throw error;

        // 興味カウントを更新
        await supabase.rpc('increment_interest_count', { 
            opportunity_id: opportunityId 
        });
    }
};

// メッセージサービス
export const messageService = {
    // 会話一覧取得
    async getConversations(userId) {
        const { data, error } = await supabase
            .from('conversation_participants')
            .select(`
                conversation:conversation_id(
                    id,
                    messages(
                        content,
                        created_at,
                        sender_id
                    )
                ),
                other_participants:conversation_id(
                    conversation_participants!inner(
                        user:user_id(
                            id,
                            first_name,
                            last_name,
                            profile_image
                        )
                    )
                )
            `)
            .eq('user_id', userId)
            .order('conversation.messages.created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // メッセージ送信
    async sendMessage(conversationId, senderId, content) {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // 新しい会話を開始
    async startConversation(userId1, userId2) {
        // 会話を作成
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .insert({})
            .select()
            .single();

        if (convError) throw convError;

        // 参加者を追加
        const { error: participantError } = await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: conversation.id, user_id: userId1 },
                { conversation_id: conversation.id, user_id: userId2 }
            ]);

        if (participantError) throw participantError;

        return conversation;
    }
};

// リアルタイム購読
export const realtimeService = {
    // メッセージのリアルタイム購読
    subscribeToMessages(conversationId, callback) {
        return supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                callback
            )
            .subscribe();
    },

    // 通知のリアルタイム購読
    subscribeToNotifications(userId, callback) {
        return supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                callback
            )
            .subscribe();
    }
};