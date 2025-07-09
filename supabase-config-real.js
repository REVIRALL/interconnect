// 本物のSupabase設定とクライアント
// フロントエンド用（anon keyのみ使用）

// Supabase設定
const SUPABASE_CONFIG = {
    url: 'https://whyoqhhzwtlxprhizmor.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoeW9xaGh6d3RseHByaGl6bW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjMyNzUsImV4cCI6MjA2NzA5OTI3NX0.HI03HObR6GkTmYh4Adm_DRkUOAssA8P1dhqzCH-mLrw'
};

class RealSupabaseService {
    constructor() {
        this.supabaseUrl = SUPABASE_CONFIG.url;
        this.supabaseKey = SUPABASE_CONFIG.anonKey;
        this.client = null;
        this.initialized = false;
        
        this.initializeClient();
    }

    // Supabaseクライアントの初期化
    async initializeClient() {
        try {
            // Supabase JSライブラリが読み込まれているかチェック
            if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
                this.client = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
                this.initialized = true;
                console.log('✅ Supabase接続成功');
            } else {
                console.warn('⚠️ Supabase JSライブラリが見つかりません。フォールバックモードで動作します。');
                this.initialized = false;
            }
        } catch (error) {
            console.error('❌ Supabase初期化エラー:', error);
            this.initialized = false;
        }
    }

    // 接続状態確認
    isReady() {
        return this.initialized && this.client !== null;
    }

    // 現在のユーザー取得
    async getCurrentUser() {
        if (!this.isReady()) {
            console.warn('Supabase未接続 - ローカルストレージから取得');
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        }

        try {
            const { data: { user } } = await this.client.auth.getUser();
            return user;
        } catch (error) {
            console.error('ユーザー取得エラー:', error);
            return null;
        }
    }

    // メッセージ保存
    async saveMessage(messageData) {
        if (!this.isReady()) {
            return this.saveMessageToLocalStorage(messageData);
        }

        try {
            const { data, error } = await this.client
                .from('messages')
                .insert([messageData]);

            if (error) throw error;
            
            console.log('✅ メッセージをSupabaseに保存しました');
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('❌ メッセージ保存エラー:', error);
            // フォールバックとしてローカルストレージに保存
            return this.saveMessageToLocalStorage(messageData);
        }
    }

    // メッセージ取得
    async getMessages(conversationId, limit = 50) {
        if (!this.isReady()) {
            return this.getMessagesFromLocalStorage(conversationId);
        }

        try {
            const { data, error } = await this.client
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) throw error;
            
            return { success: true, messages: data };
        } catch (error) {
            console.error('❌ メッセージ取得エラー:', error);
            return this.getMessagesFromLocalStorage(conversationId);
        }
    }

    // 会話一覧取得
    async getConversations(userId) {
        if (!this.isReady()) {
            return this.getConversationsFromLocalStorage();
        }

        try {
            const { data, error } = await this.client
                .from('conversations')
                .select('*')
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            
            return { success: true, conversations: data };
        } catch (error) {
            console.error('❌ 会話一覧取得エラー:', error);
            return this.getConversationsFromLocalStorage();
        }
    }

    // 既読マーク
    async markAsRead(messageId, userId) {
        if (!this.isReady()) {
            return this.markAsReadInLocalStorage(messageId, userId);
        }

        try {
            const { data, error } = await this.client
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', messageId);

            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ 既読マークエラー:', error);
            return this.markAsReadInLocalStorage(messageId, userId);
        }
    }

    // リアルタイム購読
    subscribeToMessages(conversationId, callback) {
        if (!this.isReady()) {
            console.warn('リアルタイム機能はSupabase接続時のみ利用可能');
            return null;
        }

        return this.client
            .channel(`messages:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, callback)
            .subscribe();
    }

    // 購読解除
    unsubscribe(subscription) {
        if (subscription && this.client) {
            this.client.removeChannel(subscription);
        }
    }

    // フォールバック実装（既存のコードを再利用）
    saveMessageToLocalStorage(messageData) {
        try {
            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            const newMessage = {
                id: Date.now(),
                ...messageData,
                created_at: new Date().toISOString(),
                is_read: false
            };
            messages.push(newMessage);
            localStorage.setItem('messages', JSON.stringify(messages));
            
            console.log('📱 メッセージをローカルストレージに保存しました');
            return { success: true, data: newMessage, fallback: true };
        } catch (error) {
            console.error('ローカルストレージ保存エラー:', error);
            return { success: false, error: error.message };
        }
    }

    getMessagesFromLocalStorage(conversationId) {
        try {
            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            const conversationMessages = messages.filter(msg => 
                msg.conversationId === conversationId
            );
            
            return { success: true, messages: conversationMessages, fallback: true };
        } catch (error) {
            console.error('ローカルストレージ取得エラー:', error);
            return { success: false, error: error.message };
        }
    }

    getConversationsFromLocalStorage() {
        try {
            const conversations = JSON.parse(localStorage.getItem('conversations') || '{}');
            return { success: true, conversations: Object.values(conversations), fallback: true };
        } catch (error) {
            console.error('ローカルストレージ取得エラー:', error);
            return { success: false, error: error.message };
        }
    }

    markAsReadInLocalStorage(messageId, userId) {
        try {
            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            const messageIndex = messages.findIndex(msg => msg.id === messageId);
            
            if (messageIndex !== -1) {
                messages[messageIndex].is_read = true;
                messages[messageIndex].read_at = new Date().toISOString();
                localStorage.setItem('messages', JSON.stringify(messages));
            }
            
            return { success: true, fallback: true };
        } catch (error) {
            console.error('ローカルストレージ更新エラー:', error);
            return { success: false, error: error.message };
        }
    }
}

// グローバルインスタンス
const realSupabaseService = new RealSupabaseService();

// グローバルアクセス用
window.realSupabaseService = realSupabaseService;

// 設定をエクスポート
window.SUPABASE_CONFIG = SUPABASE_CONFIG;