/**
 * コネクション管理システム
 * 申請の送受信、承認、拒否、一覧表示を統合管理
 */

(function() {
    'use strict';

    class ConnectionsManager {
        constructor() {
            this.currentUserId = null;
            this.connections = {
                received: [],
                sent: [],
                connected: [],
                rejected: []
            };
            this.init();
        }

        async init() {
            try {
                // Supabase初期化を待つ
                await window.waitForSupabase();
                
                // 現在のユーザーを取得
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) {
                    window.location.href = 'login.html';
                    return;
                }
                
                this.currentUserId = user.id;
                
                // UIの初期化
                this.setupEventListeners();
                
                // データの読み込み
                await this.loadAllConnections();
                
                // リアルタイム更新の設定
                this.setupRealtimeSubscription();
                
            } catch (error) {
                console.error('[ConnectionsManager] 初期化エラー:', error);
            }
        }

        setupEventListeners() {
            // タブ切り替え
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.switchTab(e.target.dataset.tab);
                });
            });
        }

        switchTab(tabName) {
            // タブボタンの切り替え
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabName);
            });
            
            // コンテンツの切り替え
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === tabName);
            });
        }

        async loadAllConnections() {
            try {
                // 受信した申請（承認待ち）
                const { data: received } = await window.supabaseClient
                    .from('connections')
                    .select(`
                        *,
                        sender:user_id(
                            id,
                            name,
                            email,
                            company,
                            position,
                            avatar_url,
                            phone,
                            line_id
                        )
                    `)
                    .eq('connected_user_id', this.currentUserId)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });

                // 送信した申請（承認待ち）
                const { data: sent } = await window.supabaseClient
                    .from('connections')
                    .select(`
                        *,
                        receiver:connected_user_id(
                            id,
                            name,
                            email,
                            company,
                            position,
                            avatar_url,
                            phone,
                            line_id
                        )
                    `)
                    .eq('user_id', this.currentUserId)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });

                // コネクト済み（双方向チェック）
                const { data: connected } = await window.supabaseClient
                    .from('connections')
                    .select(`
                        *,
                        user:user_id(
                            id,
                            name,
                            email,
                            company,
                            position,
                            avatar_url,
                            phone,
                            line_id
                        ),
                        connected_user:connected_user_id(
                            id,
                            name,
                            email,
                            company,
                            position,
                            avatar_url,
                            phone,
                            line_id
                        )
                    `)
                    .or(`user_id.eq.${this.currentUserId},connected_user_id.eq.${this.currentUserId}`)
                    .eq('status', 'accepted')
                    .order('updated_at', { ascending: false });

                // 拒否済み
                const { data: rejected } = await window.supabaseClient
                    .from('connections')
                    .select(`
                        *,
                        user:user_id(
                            id,
                            name,
                            email,
                            company,
                            position,
                            avatar_url
                        ),
                        connected_user:connected_user_id(
                            id,
                            name,
                            email,
                            company,
                            position,
                            avatar_url
                        )
                    `)
                    .or(`user_id.eq.${this.currentUserId},connected_user_id.eq.${this.currentUserId}`)
                    .eq('status', 'rejected')
                    .order('updated_at', { ascending: false });

                // データを保存
                this.connections.received = received || [];
                this.connections.sent = sent || [];
                this.connections.connected = connected || [];
                this.connections.rejected = rejected || [];

                // UIを更新
                this.updateUI();

            } catch (error) {
                console.error('[ConnectionsManager] データ読み込みエラー:', error);
            }
        }

        updateUI() {
            // 統計を更新
            this.updateStats();
            
            // 各タブのコンテンツを更新
            this.renderReceivedPending();
            this.renderSentPending();
            this.renderConnected();
            this.renderRejected();
        }

        updateStats() {
            // カウントを更新
            document.getElementById('connectedCount').textContent = this.connections.connected.length;
            document.getElementById('pendingReceivedCount').textContent = this.connections.received.length;
            document.getElementById('pendingSentCount').textContent = this.connections.sent.length;
            document.getElementById('rejectedCount').textContent = this.connections.rejected.length;
            
            // バッジを更新
            document.getElementById('receivedBadge').textContent = this.connections.received.length;
            document.getElementById('sentBadge').textContent = this.connections.sent.length;
            document.getElementById('connectedBadge').textContent = this.connections.connected.length;
            document.getElementById('rejectedBadge').textContent = this.connections.rejected.length;
        }

        renderReceivedPending() {
            const container = document.getElementById('receivedList');
            
            if (this.connections.received.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h3>承認待ちの申請はありません</h3>
                        <p>新しいコネクト申請が届くとここに表示されます</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = this.connections.received.map(conn => {
                const user = conn.sender;
                return `
                    <div class="connection-item" data-connection-id="${conn.id}">
                        <img src="${user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=4A90E2&color=fff`}" 
                             alt="${user.name}" 
                             class="connection-avatar">
                        <div class="connection-info">
                            <div class="connection-name">${user.name || '名前未設定'}</div>
                            <div class="connection-company">${user.company || ''} ${user.position || ''}</div>
                            ${conn.message ? `<div class="connection-message">${conn.message}</div>` : ''}
                            <div class="connection-time">${this.formatDate(conn.created_at)}</div>
                        </div>
                        <div class="connection-actions">
                            <button class="btn-accept" onclick="connectionsManager.acceptConnection('${conn.id}', '${user.id}', '${user.name}')">
                                <i class="fas fa-check"></i> 承認
                            </button>
                            <button class="btn-reject" onclick="connectionsManager.rejectConnection('${conn.id}', '${user.id}', '${user.name}')">
                                <i class="fas fa-times"></i> 拒否
                            </button>
                            <button class="btn-view-profile" onclick="window.location.href='profile.html?id=${user.id}'">
                                <i class="fas fa-user"></i> プロフィール
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        renderSentPending() {
            const container = document.getElementById('sentList');
            
            if (this.connections.sent.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-paper-plane"></i>
                        <h3>申請中のコネクトはありません</h3>
                        <p>送信した申請がここに表示されます</p>
                        <button class="btn-find-connections" onclick="window.location.href='matching.html'">
                            新しいコネクションを探す
                        </button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = this.connections.sent.map(conn => {
                const user = conn.receiver;
                return `
                    <div class="connection-item" data-connection-id="${conn.id}">
                        <img src="${user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=4A90E2&color=fff`}" 
                             alt="${user.name}" 
                             class="connection-avatar">
                        <div class="connection-info">
                            <div class="connection-name">${user.name || '名前未設定'}</div>
                            <div class="connection-company">${user.company || ''} ${user.position || ''}</div>
                            ${conn.message ? `<div class="connection-message">送信メッセージ: ${conn.message}</div>` : ''}
                            <div class="connection-time">申請日: ${this.formatDate(conn.created_at)}</div>
                        </div>
                        <div class="connection-actions">
                            <button class="btn-cancel" onclick="connectionsManager.cancelConnection('${conn.id}')">
                                <i class="fas fa-ban"></i> 取り消し
                            </button>
                            <button class="btn-view-profile" onclick="window.location.href='profile.html?id=${user.id}'">
                                <i class="fas fa-user"></i> プロフィール
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        renderConnected() {
            const container = document.getElementById('connectedList');
            
            if (this.connections.connected.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>コネクションがまだありません</h3>
                        <p>承認されたコネクションがここに表示されます</p>
                        <button class="btn-find-connections" onclick="window.location.href='matching.html'">
                            新しいコネクションを探す
                        </button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = this.connections.connected.map(conn => {
                // 相手のユーザー情報を取得
                const user = conn.user_id === this.currentUserId ? conn.connected_user : conn.user;
                return `
                    <div class="connection-item" data-connection-id="${conn.id}">
                        <img src="${user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=4A90E2&color=fff`}" 
                             alt="${user.name}" 
                             class="connection-avatar">
                        <div class="connection-info">
                            <div class="connection-name">${user.name || '名前未設定'}</div>
                            <div class="connection-company">${user.company || ''} ${user.position || ''}</div>
                            <div class="contact-info-card">
                                <div class="contact-info-item">
                                    <i class="fas fa-envelope"></i>
                                    <a href="mailto:${user.email}">${user.email}</a>
                                </div>
                                ${user.phone ? `
                                    <div class="contact-info-item">
                                        <i class="fas fa-phone"></i>
                                        <a href="tel:${user.phone}">${user.phone}</a>
                                    </div>
                                ` : ''}
                                ${user.line_id ? `
                                    <div class="contact-info-item">
                                        <i class="fab fa-line"></i>
                                        <span>LINE: ${user.line_id}</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="connection-time">コネクト日: ${this.formatDate(conn.updated_at)}</div>
                        </div>
                        <div class="connection-actions">
                            <button class="btn-message" onclick="window.location.href='messages.html?to=${user.id}'">
                                <i class="fas fa-envelope"></i> メッセージ
                            </button>
                            <button class="btn-view-profile" onclick="window.location.href='profile.html?id=${user.id}'">
                                <i class="fas fa-user"></i> プロフィール
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        renderRejected() {
            const container = document.getElementById('rejectedList');
            
            if (this.connections.rejected.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-ban"></i>
                        <h3>拒否された申請はありません</h3>
                        <p>拒否またはキャンセルされた申請がここに表示されます</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = this.connections.rejected.map(conn => {
                const user = conn.user_id === this.currentUserId ? conn.connected_user : conn.user;
                const isSentByMe = conn.user_id === this.currentUserId;
                return `
                    <div class="connection-item" data-connection-id="${conn.id}">
                        <img src="${user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=adb5bd&color=fff`}" 
                             alt="${user.name}" 
                             class="connection-avatar" style="filter: grayscale(100%);">
                        <div class="connection-info">
                            <div class="connection-name">${user.name || '名前未設定'}</div>
                            <div class="connection-company">${user.company || ''} ${user.position || ''}</div>
                            <div class="connection-time">
                                ${isSentByMe ? '申請を拒否されました' : '申請を拒否しました'}: 
                                ${this.formatDate(conn.updated_at)}
                            </div>
                        </div>
                        <div class="connection-actions">
                            <button class="btn-view-profile" onclick="window.location.href='profile.html?id=${user.id}'">
                                <i class="fas fa-user"></i> プロフィール
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        async acceptConnection(connectionId, userId, userName) {
            try {
                // コネクションを承認
                const { error } = await window.supabaseClient
                    .from('connections')
                    .update({ 
                        status: 'accepted',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', connectionId);

                if (error) throw error;

                // 承認通知を送信
                await window.supabaseClient
                    .from('notifications')
                    .insert({
                        user_id: userId,
                        type: 'connection_accepted',
                        title: 'コネクト承認',
                        message: `あなたのコネクト申請が承認されました`,
                        related_id: this.currentUserId,
                        is_read: false
                    });

                // UI更新
                await this.loadAllConnections();
                
                // 成功メッセージ
                if (window.showToast) {
                    window.showToast(`${userName}さんとコネクトしました！`, 'success');
                }

            } catch (error) {
                console.error('[ConnectionsManager] 承認エラー:', error);
                if (window.showToast) {
                    window.showToast('承認に失敗しました', 'error');
                }
            }
        }

        async rejectConnection(connectionId, userId, userName) {
            try {
                // コネクションを拒否（削除ではなく更新）
                const { error } = await window.supabaseClient
                    .from('connections')
                    .update({ 
                        status: 'rejected',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', connectionId);

                if (error) throw error;

                // UI更新
                await this.loadAllConnections();
                
                // 情報メッセージ
                if (window.showToast) {
                    window.showToast('コネクト申請を拒否しました', 'info');
                }

            } catch (error) {
                console.error('[ConnectionsManager] 拒否エラー:', error);
                if (window.showToast) {
                    window.showToast('拒否に失敗しました', 'error');
                }
            }
        }

        async cancelConnection(connectionId) {
            try {
                // 申請を取り消し
                const { error } = await window.supabaseClient
                    .from('connections')
                    .delete()
                    .eq('id', connectionId);

                if (error) throw error;

                // UI更新
                await this.loadAllConnections();
                
                // 情報メッセージ
                if (window.showToast) {
                    window.showToast('申請を取り消しました', 'info');
                }

            } catch (error) {
                console.error('[ConnectionsManager] 取り消しエラー:', error);
                if (window.showToast) {
                    window.showToast('取り消しに失敗しました', 'error');
                }
            }
        }

        setupRealtimeSubscription() {
            // リアルタイム更新の購読
            this.subscription = window.supabaseClient
                .channel('connections-changes')
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'connections',
                        filter: `user_id=eq.${this.currentUserId}`
                    }, 
                    () => {
                        this.loadAllConnections();
                    }
                )
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'connections',
                        filter: `connected_user_id=eq.${this.currentUserId}`
                    }, 
                    () => {
                        this.loadAllConnections();
                    }
                )
                .subscribe();
        }

        formatDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor(diff / (1000 * 60));

            if (minutes < 60) {
                return `${minutes}分前`;
            } else if (hours < 24) {
                return `${hours}時間前`;
            } else if (days < 7) {
                return `${days}日前`;
            } else {
                return date.toLocaleDateString('ja-JP');
            }
        }
    }

    // グローバルに公開
    window.connectionsManager = new ConnectionsManager();

})();