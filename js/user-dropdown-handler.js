/**
 * ユーザードロップダウンと通知メニューの統一ハンドラー
 * すべてのページで動作する統一された処理
 */

(function() {
    'use strict';

    console.log('[UserDropdown] ハンドラー初期化開始');

    // 初期化
    function initialize() {
        console.log('[UserDropdown] DOM初期化');
        
        // ユーザープロファイルドロップダウン
        setupUserProfileDropdown();
        
        // 通知ドロップダウン
        setupNotificationDropdown();
        
        // ログアウトボタン
        setupLogoutButtons();
        
        // クリック外で閉じる処理
        setupOutsideClickHandler();
    }

    // ユーザープロファイルドロップダウンの設定
    function setupUserProfileDropdown() {
        const userProfiles = document.querySelectorAll('.user-profile');
        console.log(`[UserDropdown] ${userProfiles.length}個のユーザープロファイル要素を検出`);
        
        userProfiles.forEach((profile, index) => {
            // クリックイベントを設定
            profile.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log(`[UserDropdown] ユーザープロファイル${index}がクリックされました`);
                
                // 他のドロップダウンを閉じる
                closeAllDropdowns();
                
                // このドロップダウンをトグル
                const dropdown = this.querySelector('.user-dropdown');
                if (dropdown) {
                    const isOpen = dropdown.classList.contains('active');
                    if (isOpen) {
                        dropdown.classList.remove('active');
                        this.classList.remove('active');
                        console.log('[UserDropdown] ユーザードロップダウンを閉じました');
                    } else {
                        dropdown.classList.add('active');
                        this.classList.add('active');
                        console.log('[UserDropdown] ユーザードロップダウンを開きました');
                    }
                } else {
                    console.error('[UserDropdown] user-dropdown要素が見つかりません');
                }
            });
        });
    }

    // 通知ドロップダウンの設定
    function setupNotificationDropdown() {
        const notificationBtns = document.querySelectorAll('.notification-wrapper .notification-btn');
        console.log(`[UserDropdown] ${notificationBtns.length}個の通知ボタンを検出`);
        
        notificationBtns.forEach((btn, index) => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log(`[UserDropdown] 通知ボタン${index}がクリックされました`);
                
                // 他のドロップダウンを閉じる
                closeAllDropdowns();
                
                // 通知ドロップダウンをトグル
                const wrapper = this.closest('.notification-wrapper');
                const dropdown = wrapper?.querySelector('.notification-dropdown');
                
                if (dropdown) {
                    const isOpen = dropdown.classList.contains('active');
                    if (isOpen) {
                        dropdown.classList.remove('active');
                        wrapper.classList.remove('active');
                        console.log('[UserDropdown] 通知ドロップダウンを閉じました');
                    } else {
                        dropdown.classList.add('active');
                        wrapper.classList.add('active');
                        console.log('[UserDropdown] 通知ドロップダウンを開きました');
                        
                        // 通知を読み込む（必要に応じて）
                        loadNotifications(dropdown);
                    }
                } else {
                    console.error('[UserDropdown] notification-dropdown要素が見つかりません');
                }
            });
        });
        
        // すべて既読にするボタン
        const markAllReadBtns = document.querySelectorAll('.mark-all-read');
        markAllReadBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('[UserDropdown] すべて既読にするボタンがクリックされました');
                markAllNotificationsAsRead();
            });
        });
    }

    // ログアウトボタンの設定
    function setupLogoutButtons() {
        const logoutBtns = document.querySelectorAll('#logoutBtn, [href="#"][onclick*="logout"]');
        console.log(`[UserDropdown] ${logoutBtns.length}個のログアウトボタンを検出`);
        
        logoutBtns.forEach((btn, index) => {
            // 既存のonclickを削除
            btn.onclick = null;
            
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`[UserDropdown] ログアウトボタン${index}がクリックされました`);
                
                if (confirm('ログアウトしますか？')) {
                    console.log('[UserDropdown] ログアウト処理を開始');
                    
                    try {
                        // グローバルなlogout関数があれば使用
                        if (typeof window.logout === 'function') {
                            await window.logout();
                        } else {
                            // Supabaseログアウト
                            if (window.supabaseClient) {
                                const { error } = await window.supabaseClient.auth.signOut();
                                if (error) {
                                    console.error('[UserDropdown] ログアウトエラー:', error);
                                    throw error;
                                }
                            }
                            
                            // セッションクリア
                            sessionStorage.clear();
                            localStorage.removeItem('supabase.auth.token');
                            
                            // ログインページへリダイレクト
                            window.location.href = '/login.html';
                        }
                        
                        console.log('[UserDropdown] ログアウト完了');
                    } catch (error) {
                        console.error('[UserDropdown] ログアウト失敗:', error);
                        alert('ログアウトに失敗しました');
                    }
                }
            });
        });
    }

    // 外側クリックで閉じる処理
    function setupOutsideClickHandler() {
        document.addEventListener('click', function(e) {
            // ドロップダウン要素内のクリックは無視
            if (e.target.closest('.user-dropdown') || 
                e.target.closest('.notification-dropdown')) {
                return;
            }
            
            // すべてのドロップダウンを閉じる
            closeAllDropdowns();
        });
    }

    // すべてのドロップダウンを閉じる
    function closeAllDropdowns() {
        // ユーザードロップダウン
        document.querySelectorAll('.user-profile.active').forEach(profile => {
            profile.classList.remove('active');
            const dropdown = profile.querySelector('.user-dropdown');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        });
        
        // 通知ドロップダウン
        document.querySelectorAll('.notification-wrapper.active').forEach(wrapper => {
            wrapper.classList.remove('active');
            const dropdown = wrapper.querySelector('.notification-dropdown');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        });
        
        console.log('[UserDropdown] すべてのドロップダウンを閉じました');
    }

    // 通知を読み込む
    async function loadNotifications(dropdownElement) {
        console.log('[UserDropdown] 通知を読み込み中...');
        
        const notificationList = dropdownElement.querySelector('.notification-list');
        if (!notificationList) return;
        
        try {
            // Supabaseから通知を取得
            if (window.supabaseClient) {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) {
                    console.log('[UserDropdown] ユーザーが認証されていません');
                    return;
                }
                
                const { data: notifications, error } = await window.supabaseClient
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_read', false)
                    .order('created_at', { ascending: false })
                    .limit(5);
                
                if (error) throw error;
                
                if (notifications && notifications.length > 0) {
                    console.log(`[UserDropdown] ${notifications.length}件の通知を取得`);
                    
                    // 通知を表示
                    notificationList.innerHTML = notifications.map(notif => `
                        <div class="notification-item" data-id="${notif.id}">
                            <div class="notification-icon ${notif.type || 'system'}">
                                <i class="fas fa-${getNotificationIcon(notif.type)}"></i>
                            </div>
                            <div class="notification-content">
                                <div class="notification-title">${escapeHtml(notif.title)}</div>
                                <div class="notification-time">${formatTime(notif.created_at)}</div>
                            </div>
                        </div>
                    `).join('');
                    
                    // 通知バッジを更新
                    updateNotificationBadge(notifications.length);
                } else {
                    console.log('[UserDropdown] 新しい通知はありません');
                }
            }
        } catch (error) {
            console.error('[UserDropdown] 通知の読み込みエラー:', error);
        }
    }

    // すべての通知を既読にする
    async function markAllNotificationsAsRead() {
        console.log('[UserDropdown] すべての通知を既読にしています...');
        
        try {
            if (window.supabaseClient) {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) return;
                
                const { error } = await window.supabaseClient
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('user_id', user.id)
                    .eq('is_read', false);
                
                if (error) throw error;
                
                console.log('[UserDropdown] すべての通知を既読にしました');
                
                // UIを更新
                document.querySelectorAll('.notification-list').forEach(list => {
                    list.innerHTML = `
                        <div class="empty-notifications">
                            <i class="fas fa-bell-slash"></i>
                            <p>新しい通知はありません</p>
                        </div>
                    `;
                });
                
                // バッジを非表示
                updateNotificationBadge(0);
            }
        } catch (error) {
            console.error('[UserDropdown] 既読処理エラー:', error);
        }
    }

    // 通知バッジを更新
    function updateNotificationBadge(count) {
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    // ユーティリティ関数
    function getNotificationIcon(type) {
        const icons = {
            'event': 'calendar-alt',
            'message': 'envelope',
            'match': 'handshake',
            'system': 'bell',
            'referral': 'user-plus'
        };
        return icons[type] || 'bell';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'たった今';
        if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}日前`;
        
        return date.toLocaleDateString('ja-JP');
    }

    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // グローバルAPIとして公開
    window.UserDropdownHandler = {
        closeAllDropdowns,
        loadNotifications,
        markAllNotificationsAsRead
    };

})();