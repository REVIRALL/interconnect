// リアルタイム通知サービス

class NotificationService {
    constructor() {
        this.notifications = [];
        this.subscribers = new Map();
        this.isPermissionGranted = false;
        this.isInitialized = false;
        
        this.initialize();
    }

    async initialize() {
        try {
            // ブラウザ通知の許可を確認・要求
            await this.requestNotificationPermission();
            
            // Service Workerの登録
            await this.registerServiceWorker();
            
            // 既存の通知をロード
            this.loadStoredNotifications();
            
            // 定期的な通知チェック（リアルタイムの代替）
            this.startPeriodicCheck();
            
            this.isInitialized = true;
            console.log('Notification service initialized');
        } catch (error) {
            console.error('Failed to initialize notification service:', error);
        }
    }

    // ブラウザ通知の許可を要求
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            this.isPermissionGranted = true;
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.isPermissionGranted = permission === 'granted';
        }
    }

    // Service Workerの登録
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // 簡単なService Workerを動的に作成
                const swCode = `
                    self.addEventListener('notificationclick', function(event) {
                        event.notification.close();
                        event.waitUntil(
                            clients.openWindow(event.notification.data?.url || '/')
                        );
                    });
                `;
                
                const blob = new Blob([swCode], { type: 'application/javascript' });
                const swUrl = URL.createObjectURL(blob);
                
                const registration = await navigator.serviceWorker.register(swUrl);
                console.log('Service Worker registered successfully');
                
                // URLを解放
                URL.revokeObjectURL(swUrl);
                
                return registration;
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    // 通知の作成と配信
    async createNotification(notification) {
        const newNotification = {
            id: Date.now(),
            type: notification.type || 'info',
            title: notification.title,
            message: notification.message,
            icon: notification.icon || '/favicon.ico',
            url: notification.url || window.location.origin,
            data: notification.data || {},
            timestamp: new Date().toISOString(),
            read: false,
            persistent: notification.persistent || false
        };

        // 通知を保存
        this.notifications.unshift(newNotification);
        this.saveNotifications();

        // 購読者に通知
        this.notifySubscribers('new', newNotification);

        // ブラウザ通知を表示
        if (this.isPermissionGranted && notification.showBrowser !== false) {
            this.showBrowserNotification(newNotification);
        }

        // インアプリ通知を表示
        if (notification.showInApp !== false) {
            this.showInAppNotification(newNotification);
        }

        return newNotification;
    }

    // ブラウザ通知の表示
    showBrowserNotification(notification) {
        if (!this.isPermissionGranted) return;

        const options = {
            body: notification.message,
            icon: notification.icon,
            badge: '/favicon.ico',
            tag: notification.type,
            data: {
                id: notification.id,
                url: notification.url,
                ...notification.data
            },
            requireInteraction: notification.persistent,
            silent: false
        };

        try {
            const browserNotification = new Notification(notification.title, options);
            
            browserNotification.onclick = () => {
                window.focus();
                if (notification.url && notification.url !== window.location.href) {
                    window.location.href = notification.url;
                }
                this.markAsRead(notification.id);
                browserNotification.close();
            };

            // 5秒後に自動で閉じる（persistent以外）
            if (!notification.persistent) {
                setTimeout(() => {
                    browserNotification.close();
                }, 5000);
            }
        } catch (error) {
            console.error('Failed to show browser notification:', error);
        }
    }

    // インアプリ通知の表示
    showInAppNotification(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `in-app-notification ${notification.type}`;
        notificationElement.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <h4>${this.escapeHtml(notification.title)}</h4>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="notification-body">
                    <p>${this.escapeHtml(notification.message)}</p>
                    <small>${this.formatTime(notification.timestamp)}</small>
                </div>
                ${notification.url ? `<div class="notification-action">
                    <button onclick="window.location.href='${notification.url}'; this.closest('.in-app-notification').remove();">
                        詳細を見る
                    </button>
                </div>` : ''}
            </div>
        `;

        // スタイルを設定
        notificationElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            max-width: 400px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            border-left: 4px solid ${this.getNotificationColor(notification.type)};
        `;

        // CSS アニメーションを追加
        if (!document.getElementById('notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .in-app-notification {
                    padding: 1rem;
                    margin-bottom: 0.5rem;
                }
                .in-app-notification .notification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .in-app-notification h4 {
                    margin: 0;
                    font-size: 1rem;
                    color: #333;
                }
                .in-app-notification .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: #666;
                }
                .in-app-notification p {
                    margin: 0 0 0.5rem 0;
                    color: #666;
                    font-size: 0.9rem;
                }
                .in-app-notification small {
                    color: #999;
                    font-size: 0.8rem;
                }
                .in-app-notification .notification-action {
                    margin-top: 0.5rem;
                }
                .in-app-notification button {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notificationElement);

        // 自動削除（persistent以外）
        if (!notification.persistent) {
            setTimeout(() => {
                if (notificationElement.parentNode) {
                    notificationElement.remove();
                }
            }, 5000);
        }

        // クリックで既読にマーク
        notificationElement.addEventListener('click', () => {
            this.markAsRead(notification.id);
        });
    }

    // 通知の色を取得
    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8',
            message: '#007bff',
            connection: '#28a745'
        };
        return colors[type] || colors.info;
    }

    // 通知を既読にマーク
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.saveNotifications();
            this.notifySubscribers('read', notification);
        }
    }

    // すべての通知を既読にマーク
    markAllAsRead() {
        let hasUnread = false;
        this.notifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
                hasUnread = true;
            }
        });

        if (hasUnread) {
            this.saveNotifications();
            this.notifySubscribers('allRead', this.notifications);
        }
    }

    // 通知の削除
    deleteNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            const deleted = this.notifications.splice(index, 1)[0];
            this.saveNotifications();
            this.notifySubscribers('delete', deleted);
        }
    }

    // すべての通知をクリア
    clearAllNotifications() {
        this.notifications = [];
        this.saveNotifications();
        this.notifySubscribers('clear', null);
    }

    // 通知の取得
    getNotifications(filter = 'all') {
        switch (filter) {
            case 'unread':
                return this.notifications.filter(n => !n.read);
            case 'read':
                return this.notifications.filter(n => n.read);
            default:
                return [...this.notifications];
        }
    }

    // 未読数の取得
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    // 購読者の登録
    subscribe(callback) {
        const id = Date.now() + Math.random();
        this.subscribers.set(id, callback);
        return id;
    }

    // 購読者の解除
    unsubscribe(subscriptionId) {
        this.subscribers.delete(subscriptionId);
    }

    // 購読者への通知
    notifySubscribers(event, data) {
        this.subscribers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in notification subscriber:', error);
            }
        });
    }

    // 定期的な通知チェック（リアルタイムの代替）
    startPeriodicCheck() {
        setInterval(() => {
            this.checkForNewNotifications();
        }, 30000); // 30秒ごと
    }

    // 新しい通知のチェック
    async checkForNewNotifications() {
        try {
            // 接続リクエストのチェック
            await this.checkConnectionRequests();
            
            // メッセージのチェック
            await this.checkNewMessages();
            
            // システム通知のチェック
            await this.checkSystemNotifications();
        } catch (error) {
            console.error('Error checking for new notifications:', error);
        }
    }

    // 接続リクエストのチェック
    async checkConnectionRequests() {
        const connectionRequests = JSON.parse(localStorage.getItem('connectionRequests') || '[]');
        const currentUser = auth?.getCurrentUser();
        
        if (currentUser) {
            const pendingRequests = connectionRequests.filter(request => 
                request.receiverId === currentUser.id && 
                request.status === 'pending' &&
                !this.hasNotificationForRequest(request.id)
            );

            for (const request of pendingRequests) {
                await this.createNotification({
                    type: 'connection',
                    title: '新しい接続リクエスト',
                    message: `${request.senderName || 'ユーザー'}さんから接続リクエストが届いています`,
                    url: '/dashboard.html',
                    data: { requestId: request.id, type: 'connection_request' },
                    showBrowser: true,
                    showInApp: true
                });
            }
        }
    }

    // メッセージのチェック
    async checkNewMessages() {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const currentUser = auth?.getCurrentUser();
        
        if (currentUser) {
            const recentMessages = messages.filter(message => 
                message.receiverId === currentUser.id &&
                !message.is_read &&
                new Date(message.created_at) > new Date(Date.now() - 60000) && // 1分以内
                !this.hasNotificationForMessage(message.id)
            );

            for (const message of recentMessages) {
                await this.createNotification({
                    type: 'message',
                    title: '新しいメッセージ',
                    message: `${message.senderName || 'ユーザー'}さんからメッセージが届いています`,
                    url: '/messages.html',
                    data: { messageId: message.id, type: 'new_message' },
                    showBrowser: true,
                    showInApp: true
                });
            }
        }
    }

    // システム通知のチェック
    async checkSystemNotifications() {
        // システムメンテナンス、アップデート情報など
        const systemNotifications = JSON.parse(localStorage.getItem('systemNotifications') || '[]');
        
        for (const notification of systemNotifications) {
            if (!this.hasNotificationForSystem(notification.id)) {
                await this.createNotification({
                    type: 'info',
                    title: notification.title,
                    message: notification.message,
                    data: { systemId: notification.id, type: 'system' },
                    persistent: notification.important || false,
                    showBrowser: true,
                    showInApp: true
                });
            }
        }
    }

    // 重複通知のチェック
    hasNotificationForRequest(requestId) {
        return this.notifications.some(n => 
            n.data.requestId === requestId && n.data.type === 'connection_request'
        );
    }

    hasNotificationForMessage(messageId) {
        return this.notifications.some(n => 
            n.data.messageId === messageId && n.data.type === 'new_message'
        );
    }

    hasNotificationForSystem(systemId) {
        return this.notifications.some(n => 
            n.data.systemId === systemId && n.data.type === 'system'
        );
    }

    // 通知の保存
    saveNotifications() {
        try {
            // 最新100件のみ保存
            const toSave = this.notifications.slice(0, 100);
            localStorage.setItem('notifications', JSON.stringify(toSave));
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    }

    // 保存された通知の読み込み
    loadStoredNotifications() {
        try {
            const stored = localStorage.getItem('notifications');
            if (stored) {
                this.notifications = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load stored notifications:', error);
            this.notifications = [];
        }
    }

    // ユーティリティメソッド
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = now - date;
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffMinutes < 1) {
            return 'たった今';
        } else if (diffMinutes < 60) {
            return `${diffMinutes}分前`;
        } else if (diffMinutes < 1440) {
            const hours = Math.floor(diffMinutes / 60);
            return `${hours}時間前`;
        } else {
            return date.toLocaleDateString('ja-JP');
        }
    }
}

// グローバルインスタンス
const notificationService = new NotificationService();

// グローバルアクセス用
window.notificationService = notificationService;