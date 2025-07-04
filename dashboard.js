// ダッシュボード機能
class Dashboard {
    constructor() {
        // authが存在しない場合は直接localStorageから取得
        if (typeof auth === 'undefined' || !auth) {
            console.warn('Auth system not available, using localStorage directly');
            const userStr = localStorage.getItem('currentUser');
            this.currentUser = userStr ? JSON.parse(userStr) : null;
        } else {
            this.currentUser = auth.getCurrentUser();
        }
        
        if (!this.currentUser) {
            console.error('No authenticated user found');
            // ログインページにリダイレクトする代わりに、警告を表示
            this.showLoginWarning();
            return;
        }
        
        this.notifications = [];
        this.initializeDashboard();
    }

    // ダッシュボード初期化
    initializeDashboard() {
        try {
            this.setupEventListeners();
            this.loadUserData();
            this.loadNotifications();
            this.setupSidebar();
            this.loadDashboardData();
            console.info('Dashboard initialization completed');
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            throw error;
        }
    }

    // イベントリスナー設定
    setupEventListeners() {
        // サイドバートグル
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', this.toggleSidebar.bind(this));
        }

        // ユーザーメニュー
        const userMenuBtn = document.querySelector('.user-menu-btn');
        const userMenuDropdown = document.querySelector('.user-menu-dropdown');
        
        if (userMenuBtn && userMenuDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenuDropdown.style.display = 
                    userMenuDropdown.style.display === 'block' ? 'none' : 'block';
            });

            document.addEventListener('click', () => {
                userMenuDropdown.style.display = 'none';
            });
        }

        // ナビゲーションリンク
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });

        // 通知ボタン
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            // クリック時のフィードバック改善
            notificationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // ボタンにアクティブクラス追加（視覚的フィードバック）
                notificationBtn.classList.add('active');
                setTimeout(() => {
                    notificationBtn.classList.remove('active');
                }, 150);
                
                this.showNotifications();
            });
            
            // ホバー時のフィードバック
            notificationBtn.addEventListener('mouseenter', () => {
                notificationBtn.style.transform = 'translateY(-2px)';
            });
            
            notificationBtn.addEventListener('mouseleave', () => {
                notificationBtn.style.transform = 'translateY(0)';
            });
        }
        
        // 接続リクエストボタン
        const connectionRequestBtn = document.querySelector('.connection-requests-btn');
        if (connectionRequestBtn) {
            connectionRequestBtn.addEventListener('click', this.showConnectionRequests.bind(this));
        }
    }

    // ユーザーデータ読み込み
    loadUserData() {
        if (!this.currentUser) {
            console.error('Current user not found');
            window.location.href = 'login.html';
            return;
        }

        // ユーザー名表示
        const userName = this.currentUser.name || 
            `${this.currentUser.lastName || ''} ${this.currentUser.firstName || ''}`.trim() || 
            'ユーザー';
            
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = userName;
        });

        // ユーザー画像表示
        const userAvatars = document.querySelectorAll('.user-avatar, .user-menu-btn img');
        userAvatars.forEach(avatar => {
            this.setDefaultAvatar(avatar, userName);
        });

        // 管理者メニュー表示制御
        const adminMenus = document.querySelectorAll('.admin-only');
        try {
            if (auth && typeof auth.isAdmin === 'function' && auth.isAdmin()) {
                adminMenus.forEach(menu => menu.style.display = 'block');
            } else {
                adminMenus.forEach(menu => menu.style.display = 'none');
            }
        } catch (error) {
            console.warn('Admin check failed:', error);
            adminMenus.forEach(menu => menu.style.display = 'none');
        }

        // ダッシュボードタイトル更新
        const dashboardTitle = document.querySelector('.dashboard-header h1');
        if (dashboardTitle) {
            dashboardTitle.textContent = `ダッシュボード - ${userName}`;
        }
    }

    // デフォルトアバター設定
    setDefaultAvatar(img, userName) {
        if (!img) return;
        
        // 安全な文字を取得（日本語対応）
        let firstChar = userName.charAt(0) || 'U';
        // ASCII文字以外の場合は'U'を使用
        if (firstChar.charCodeAt(0) > 127) {
            firstChar = 'U';
        } else {
            firstChar = firstChar.toUpperCase();
        }
        const hasValidImage = this.currentUser.profileImage && 
            !this.currentUser.profileImage.includes('placeholder') &&
            !this.currentUser.profileImage.includes('data:image/svg+xml');
        
        if (!hasValidImage) {
            // スタイルを設定
            img.style.background = 'linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%)';
            img.style.color = 'white';
            img.style.display = 'flex';
            img.style.alignItems = 'center';
            img.style.justifyContent = 'center';
            img.style.fontWeight = '600';
            img.style.fontSize = '0.9rem';
            img.style.border = '2px solid #e1e5e9';
            img.alt = firstChar;
            img.setAttribute('data-initial', firstChar);
            
            // より安全なSVGアバター生成（URL エンコード方式）
            const svgContent = `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1e5ba8;stop-opacity:1" /><stop offset="100%" style="stop-color:#4a90e2;stop-opacity:1" /></linearGradient></defs><rect width="40" height="40" fill="url(#grad)"/><text x="20" y="27" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="16" font-weight="600">${firstChar}</text></svg>`;
            
            // UTF-8エンコードSVG
            const svgAvatar = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
            
            // エラーハンドラーを設定
            img.onerror = function() {
                console.warn('SVG avatar failed, using fallback');
                this.style.backgroundImage = 'none';
                this.style.display = 'flex';
                this.style.alignItems = 'center';
                this.style.justifyContent = 'center';
                this.innerHTML = `<i class="fas fa-user" style="color: white; font-size: 1rem;"></i>`;
                this.removeAttribute('src');
            };
            
            try {
                img.src = svgAvatar;
            } catch (error) {
                console.error('Failed to set SVG avatar:', error);
                // フォールバック実行
                img.onerror();
            }
        } else {
            // 有効なプロフィール画像がある場合
            img.style.background = '';
            img.style.color = '';
            img.onerror = () => {
                // 画像読み込み失敗時はデフォルトアバターにフォールバック
                this.setDefaultAvatar(img, userName);
            };
            img.src = this.currentUser.profileImage;
        }
    }

    // 通知読み込み
    loadNotifications() {
        // 接続リクエストをチェック
        const connectionRequests = this.getConnectionRequests();
        const connectionNotifications = connectionRequests.map(request => ({
            id: `connection-${request.id}`,
            type: 'connection_request',
            title: '新しい接続リクエスト',
            message: `${request.senderName}さんから接続リクエストが届いています`,
            time: new Date(request.createdAt),
            read: false,
            actionRequired: true,
            requestId: request.id,
            senderId: request.senderId
        }));
        
        // デモ用通知データ
        const demoNotifications = [
            {
                id: 1,
                type: 'info',
                title: '新しいメンバーが参加しました',
                message: '山田花子さんが新規登録しました',
                time: new Date(Date.now() - 2 * 60 * 60 * 1000),
                read: false
            },
            {
                id: 2,
                type: 'event',
                title: 'イベントリマインダー',
                message: '明日の定例交流会の準備をお忘れなく',
                time: new Date(Date.now() - 4 * 60 * 60 * 1000),
                read: false
            },
            {
                id: 3,
                type: 'message',
                title: '新しいメッセージ',
                message: '佐藤次郎さんからメッセージが届いています',
                time: new Date(Date.now() - 6 * 60 * 60 * 1000),
                read: true
            }
        ];
        
        // 接続リクエスト通知とデモ通知を結合
        this.notifications = [...connectionNotifications, ...demoNotifications];
        
        this.updateNotificationCount();
        this.updateConnectionRequestCount();
    }

    // 通知数更新
    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const notificationCount = document.querySelector('.notification-count');
        if (notificationCount) {
            notificationCount.textContent = unreadCount;
            notificationCount.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }
    
    // 接続リクエスト数更新
    updateConnectionRequestCount() {
        const pendingRequests = this.getConnectionRequests();
        const connectionCount = document.querySelector('.connection-request-count');
        if (connectionCount) {
            connectionCount.textContent = pendingRequests.length;
            connectionCount.style.display = pendingRequests.length > 0 ? 'block' : 'none';
        }
        
        // メンバーページのバッジも更新
        const membersBadge = document.querySelector('.nav-item a[href="members.html"] .badge');
        if (membersBadge) {
            if (pendingRequests.length > 0) {
                membersBadge.textContent = pendingRequests.length;
                membersBadge.style.display = 'inline';
            } else {
                membersBadge.style.display = 'none';
            }
        }
    }
    
    // 接続リクエスト取得
    getConnectionRequests() {
        const connectionRequests = JSON.parse(localStorage.getItem('connectionRequests') || '[]');
        const currentUserId = this.currentUser.id;
        
        // 自分が受信者であり、ステータスがpendingのリクエストをフィルター
        const pendingRequests = connectionRequests.filter(request => 
            request.receiverId === currentUserId && request.status === 'pending'
        );
        
        // 送信者の情報を付加（メンバーデータから取得）
        return pendingRequests.map(request => {
            const senderInfo = this.getMemberInfo(request.senderId);
            return {
                ...request,
                senderName: senderInfo ? senderInfo.name : '不明なユーザー',
                senderAvatar: senderInfo ? senderInfo.avatar : null,
                senderCompany: senderInfo ? senderInfo.company : ''
            };
        });
    }
    
    // メンバー情報取得（簡略版）
    getMemberInfo(memberId) {
        // 実際の実装ではメンバーデータベースから取得
        // ここではデモデータを使用
        const demoMembers = {
            'member-1': { name: '佐藤太郎', company: '株式会社サンプル', avatar: this.generateSVGAvatar('佐藤太郎') },
            'member-2': { name: '鈴木花子', company: '合同会社テスト', avatar: this.generateSVGAvatar('鈴木花子') },
            'member-3': { name: '田中一郎', company: '株式会社デモ', avatar: this.generateSVGAvatar('田中一郎') }
        };
        
        return demoMembers[memberId] || null;
    }
    
    // ログイン警告表示
    showLoginWarning() {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2>ログインが必要です</h2>
                    <p>このページを表示するにはログインが必要です。</p>
                    <a href="login.html" class="btn-primary">ログインページへ</a>
                </div>
            `;
        }
    }
    
    // SVGアバター生成
    generateSVGAvatar(name, size = 40) {
        let firstChar = name.charAt(0) || 'U';
        if (firstChar.charCodeAt(0) > 127) {
            firstChar = 'U';
        } else {
            firstChar = firstChar.toUpperCase();
        }
        
        const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad-${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1e5ba8;stop-opacity:1" /><stop offset="100%" style="stop-color:#4a90e2;stop-opacity:1" /></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#grad-${Date.now()})"/><text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="${size/2.5}" font-weight="600">${firstChar}</text></svg>`;
        
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
    }

    // サイドバートグル
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay') || this.createSidebarOverlay();
        
        if (!sidebar) {
            console.error('Sidebar element not found');
            return;
        }
        
        const isActive = sidebar.classList.contains('active');
        
        if (isActive) {
            // サイドバーを閉じる
            sidebar.classList.remove('active');
            sidebar.style.left = '-100%';
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            // サイドバーを開く
            sidebar.classList.add('active');
            sidebar.style.left = '0';
            overlay.classList.add('active');
            // モバイルでスクロールを禁止
            if (window.innerWidth <= 768) {
                document.body.style.overflow = 'hidden';
            }
        }
        
        // アニメーション用のクラスを追加
        sidebar.classList.add('transitioning');
        setTimeout(() => {
            sidebar.classList.remove('transitioning');
        }, 300);
    }

    // サイドバーオーバーレイ作成
    createSidebarOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', () => {
            this.toggleSidebar();
        });
        document.body.appendChild(overlay);
        return overlay;
    }

    // サイドバーを閉じる
    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ナビゲーション処理
    handleNavigation(e) {
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        if (!href) {
            console.warn('Navigation link has no href attribute');
            return;
        }
        
        // 外部ファイルへのリンクの場合は通常のナビゲーションを許可
        if (href.endsWith('.html')) {
            // ローディング状態を表示
            this.showLoadingState(link);
            
            // アクティブ状態を更新してからページ遷移
            this.updateActiveNavItem(link);
            
            // 少し遅延してページ遷移（アニメーションのため）
            setTimeout(() => {
                window.location.href = href;
            }, 150);
            
            return;
        }
        
        // ハッシュリンクの場合のみpreventDefault
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = href.substring(1); // # を除去

            // アクティブ状態更新
            this.updateActiveNavItem(link);

            // コンテンツ切り替え
            this.loadContent(target);
        }
    }

    // アクティブナビゲーションアイテム更新
    updateActiveNavItem(activeLink) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = activeLink.closest('.nav-item');
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    // ローディング状態表示
    showLoadingState(link) {
        const icon = link.querySelector('i');
        if (icon) {
            const originalClass = icon.className;
            icon.className = 'fas fa-spinner fa-spin';
            
            // 3秒後に元に戻す（フェールセーフ）
            setTimeout(() => {
                icon.className = originalClass;
            }, 3000);
        }
    }

    // コンテンツ読み込み
    loadContent(section) {
        const mainContent = document.querySelector('.dashboard-content');
        
        switch (section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'profile':
                this.loadProfile();
                break;
            case 'members':
                this.loadMembers();
                break;
            case 'events':
                this.loadEvents();
                break;
            case 'messages':
                this.loadMessages();
                break;
            case 'business':
                this.loadBusiness();
                break;
            case 'admin':
                if (auth.isAdmin()) {
                    this.loadAdmin();
                }
                break;
            default:
                console.log('Unknown section:', section);
        }
    }

    // ダッシュボードデータ読み込み
    loadDashboardData() {
        // 統計データの更新
        this.updateStats();
        
        // 最近の活動更新
        this.updateRecentActivity();
        
        // イベント更新
        this.updateUpcomingEvents();
        
        // おすすめメンバー更新
        this.updateRecommendedMembers();
        
        // メッセージ更新
        this.updateRecentMessages();
    }

    // 統計データ更新
    updateStats() {
        const stats = [
            { value: 152, label: '総メンバー数', change: '+8 今月', type: 'positive' },
            { value: 12, label: '今月のイベント', change: '+3 先月比', type: 'positive' },
            { value: 28, label: 'ビジネスマッチング', change: '+5 今月', type: 'positive' },
            { value: 4.8, label: '満足度', change: '変更なし', type: 'neutral' }
        ];

        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            if (stats[index]) {
                const stat = stats[index];
                const valueElement = card.querySelector('h3');
                const changeElement = card.querySelector('.stat-change');
                
                if (valueElement) valueElement.textContent = stat.value;
                if (changeElement) {
                    changeElement.textContent = stat.change;
                    changeElement.className = `stat-change ${stat.type}`;
                }
            }
        });
    }

    // 最近の活動更新
    updateRecentActivity() {
        const activities = [
            {
                icon: 'fas fa-user-plus',
                content: '<strong>山田花子</strong>さんが新規登録しました',
                time: '2時間前'
            },
            {
                icon: 'fas fa-calendar',
                content: '新しいイベント「経営戦略セミナー」が追加されました',
                time: '4時間前'
            },
            {
                icon: 'fas fa-handshake',
                content: '新しいビジネスマッチングが成立しました',
                time: '6時間前'
            }
        ];

        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <p>${activity.content}</p>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // 今後のイベント更新
    updateUpcomingEvents() {
        const events = [
            {
                date: '12',
                month: '7月',
                title: '定例交流会',
                time: '19:00 - 21:00',
                location: '東京都港区'
            },
            {
                date: '15',
                month: '7月',
                title: 'ビジネスピッチ会',
                time: '18:30 - 20:30',
                location: 'オンライン'
            }
        ];

        const eventList = document.querySelector('.event-list');
        if (eventList) {
            eventList.innerHTML = events.map(event => `
                <div class="event-item">
                    <div class="event-date">
                        <span class="date">${event.date}</span>
                        <span class="month">${event.month}</span>
                    </div>
                    <div class="event-content">
                        <h4>${event.title}</h4>
                        <p>${event.time}</p>
                        <span class="event-location">${event.location}</span>
                    </div>
                    <button class="event-action" onclick="joinEvent('${event.title}')">参加</button>
                </div>
            `).join('');
        }
    }

    // おすすめメンバー更新
    updateRecommendedMembers() {
        const members = [
            {
                name: '佐藤次郎',
                info: 'IT・テクノロジー | CEO',
                company: '株式会社テックイノベーション',
                avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="%23e0e0e0"/%3E%3Ctext x="25" y="25" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-family="Arial,sans-serif" font-size="14"%3E佐%3C/text%3E%3C/svg%3E'
            },
            {
                name: '鈴木三郎',
                info: '製造業 | 代表取締役',
                company: '鈴木製作所',
                avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="%23e0e0e0"/%3E%3Ctext x="25" y="25" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-family="Arial,sans-serif" font-size="14"%3E鈴%3C/text%3E%3C/svg%3E'
            }
        ];

        const memberList = document.querySelector('.member-list');
        if (memberList) {
            memberList.innerHTML = members.map(member => `
                <div class="member-item">
                    <img src="${member.avatar}" alt="メンバー画像" class="member-avatar">
                    <div class="member-content">
                        <h4>${member.name}</h4>
                        <p>${member.info}</p>
                        <span class="member-company">${member.company}</span>
                    </div>
                    <button class="member-action" onclick="connectWithMember('${member.name}')">繋がる</button>
                </div>
            `).join('');
        }
    }

    // 最近のメッセージ更新
    updateRecentMessages() {
        const messages = [
            {
                sender: '田中一郎',
                content: '新規事業の件でご相談があります。お時間ありますでしょうか？',
                time: '30分前',
                avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23e0e0e0"/%3E%3Ctext x="20" y="20" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-family="Arial,sans-serif" font-size="12"%3E田%3C/text%3E%3C/svg%3E'
            },
            {
                sender: '山田太郎',
                content: '来週のイベントについてですが...',
                time: '1時間前',
                avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23e0e0e0"/%3E%3Ctext x="20" y="20" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-family="Arial,sans-serif" font-size="12"%3E山%3C/text%3E%3C/svg%3E'
            }
        ];

        const messageList = document.querySelector('.message-list');
        if (messageList) {
            messageList.innerHTML = messages.map(message => `
                <div class="message-item">
                    <img src="${message.avatar}" alt="送信者画像" class="message-avatar">
                    <div class="message-content">
                        <h4>${message.sender}</h4>
                        <p>${message.content}</p>
                        <span class="message-time">${message.time}</span>
                    </div>
                    <div class="message-unread">●</div>
                </div>
            `).join('');
        }
    }

    // 通知表示
    showNotifications() {
        console.log('📱 通知ボタンがクリックされました');
        
        // 既存の通知パネルがあれば削除
        const existingPanel = document.querySelector('.notification-panel');
        if (existingPanel) {
            console.log('🔄 通知パネルを閉じます');
            existingPanel.remove();
            return;
        }
        
        console.log('📂 通知パネルを開きます');

        const notificationPanel = document.createElement('div');
        notificationPanel.className = 'notification-panel';
        
        // パネルコンテンツを作成
        const notificationContent = this.notifications.length > 0 ? 
            this.notifications.map(notification => {
                const iconClass = this.getNotificationIcon(notification.type);
                const timeFormatted = this.formatTime(notification.time);
                return `
                    <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
                         onclick="dashboard.markNotificationAsRead(${notification.id}, this)">
                        <div class="notification-icon">
                            <i class="fas fa-${iconClass}"></i>
                        </div>
                        <div class="notification-text">
                            <h4>${this.escapeHtml(notification.title)}</h4>
                            <p>${this.escapeHtml(notification.message)}</p>
                            <span class="notification-time">${timeFormatted}</span>
                        </div>
                    </div>
                `;
            }).join('') : 
            '<div class="no-notifications">新しい通知はありません</div>';
        
        notificationPanel.innerHTML = `
            <div class="notification-header">
                <h3>通知</h3>
                <button type="button" onclick="dashboard.closeNotificationPanel()" 
                        aria-label="通知パネルを閉じる">×</button>
            </div>
            <div class="notification-content">
                ${notificationContent}
            </div>
        `;

        document.body.appendChild(notificationPanel);

        // アニメーションで表示
        requestAnimationFrame(() => {
            notificationPanel.style.opacity = '1';
            notificationPanel.style.transform = 'translateX(0)';
        });

        // 外部クリックで閉じる
        this.setupNotificationPanelCloseHandler(notificationPanel);
    }

    // 通知パネル閉じるハンドラー設定
    setupNotificationPanelCloseHandler(panel) {
        const closeHandler = (e) => {
            if (!panel.contains(e.target) && !e.target.closest('.notification-btn')) {
                this.closeNotificationPanel();
                document.removeEventListener('click', closeHandler);
                document.removeEventListener('keydown', keyHandler);
            }
        };
        
        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeNotificationPanel();
                document.removeEventListener('click', closeHandler);
                document.removeEventListener('keydown', keyHandler);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeHandler);
            document.addEventListener('keydown', keyHandler);
        }, 100);
    }

    // 通知パネルを閉じる
    closeNotificationPanel() {
        const panel = document.querySelector('.notification-panel');
        if (panel) {
            panel.style.opacity = '0';
            panel.style.transform = 'translateX(100%)';
            setTimeout(() => panel.remove(), 300);
        }
    }

    // 通知を既読にマーク
    markNotificationAsRead(notificationId, element) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            element.classList.remove('unread');
            element.classList.add('read');
            this.updateNotificationCount();
        }
    }

    // HTMLエスケープ
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 通知アイコン取得
    getNotificationIcon(type) {
        switch (type) {
            case 'info': return 'info-circle';
            case 'event': return 'calendar';
            case 'message': return 'envelope';
            case 'connection_request': return 'user-plus';
            default: return 'bell';
        }
    }

    // 時刻フォーマット
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes}分前`;
        } else if (hours < 24) {
            return `${hours}時間前`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days}日前`;
        }
    }

    // 接続リクエスト表示
    showConnectionRequests() {
        // 既存のモーダルがあれば削除
        const existingModal = document.querySelector('.connection-requests-modal');
        if (existingModal) {
            existingModal.remove();
            return;
        }

        const connectionRequests = this.getConnectionRequests();
        
        const modal = document.createElement('div');
        modal.className = 'connection-requests-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 15px;
            max-width: 600px;
            width: 90%;
            max-height: 80%;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;
        
        const requestsHtml = connectionRequests.length > 0 ? 
            connectionRequests.map(request => `
                <div class="connection-request-item" style="
                    display: flex;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e1e5e9;
                    gap: 1rem;
                ">
                    <img src="${request.senderAvatar || this.generateSVGAvatar(request.senderName)}" 
                         alt="${request.senderName}" 
                         style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 0.5rem 0; color: var(--primary-blue);">${request.senderName}</h4>
                        <p style="margin: 0 0 0.5rem 0; color: var(--gray-text); font-size: 0.9rem;">${request.senderCompany}</p>
                        <span style="color: #6c757d; font-size: 0.8rem;">${this.formatTime(new Date(request.createdAt))}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="dashboard.approveConnectionRequest('${request.id}', this)" 
                                style="
                                    background: #28a745;
                                    color: white;
                                    border: none;
                                    padding: 0.5rem 1rem;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-weight: 600;
                                    transition: all 0.3s;
                                ">
                            <i class="fas fa-check"></i> 承認
                        </button>
                        <button onclick="dashboard.rejectConnectionRequest('${request.id}', this)" 
                                style="
                                    background: #dc3545;
                                    color: white;
                                    border: none;
                                    padding: 0.5rem 1rem;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-weight: 600;
                                    transition: all 0.3s;
                                ">
                            <i class="fas fa-times"></i> 拒否
                        </button>
                    </div>
                </div>
            `).join('') : 
            '<div style="padding: 2rem; text-align: center; color: var(--gray-text);">新しい接続リクエストはありません</div>';
        
        modalContent.innerHTML = `
            <div style="padding: 1.5rem; border-bottom: 1px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: var(--primary-blue);">接続リクエスト (${connectionRequests.length})</h3>
                <button onclick="dashboard.closeConnectionRequestsModal()" 
                        style="background: none; border: none; font-size: 1.5rem; color: #6c757d; cursor: pointer;">×</button>
            </div>
            <div>
                ${requestsHtml}
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // アニメーションで表示
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        });
        
        // 外部クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeConnectionRequestsModal();
            }
        });
    }
    
    // 接続リクエストモーダルを閉じる
    closeConnectionRequestsModal() {
        const modal = document.querySelector('.connection-requests-modal');
        if (modal) {
            modal.style.opacity = '0';
            modal.querySelector('div').style.transform = 'scale(0.9)';
            setTimeout(() => modal.remove(), 300);
        }
    }
    
    // 接続リクエスト承認
    approveConnectionRequest(requestId, buttonElement) {
        const connectionRequests = JSON.parse(localStorage.getItem('connectionRequests') || '[]');
        const requestIndex = connectionRequests.findIndex(req => req.id === requestId);
        
        if (requestIndex !== -1) {
            // リクエストを承認済みに更新
            connectionRequests[requestIndex].status = 'approved';
            connectionRequests[requestIndex].approvedAt = new Date().toISOString();
            
            localStorage.setItem('connectionRequests', JSON.stringify(connectionRequests));
            
            // UIから削除
            const requestItem = buttonElement.closest('.connection-request-item');
            if (requestItem) {
                requestItem.style.opacity = '0';
                requestItem.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    requestItem.remove();
                    
                    // モーダルが空になったら閉じる
                    const remainingRequests = document.querySelectorAll('.connection-request-item');
                    if (remainingRequests.length === 0) {
                        this.closeConnectionRequestsModal();
                    }
                }, 300);
            }
            
            // カウント更新
            this.updateConnectionRequestCount();
            this.loadNotifications(); // 通知も更新
            
            // 成功メッセージ
            const senderName = connectionRequests[requestIndex].senderName || 'ユーザー';
            this.showNotification(`${senderName}さんと繋がりました`, 'success');
        }
    }
    
    // 接続リクエスト拒否
    rejectConnectionRequest(requestId, buttonElement) {
        const connectionRequests = JSON.parse(localStorage.getItem('connectionRequests') || '[]');
        const requestIndex = connectionRequests.findIndex(req => req.id === requestId);
        
        if (requestIndex !== -1) {
            // リクエストを拒否済みに更新
            connectionRequests[requestIndex].status = 'rejected';
            connectionRequests[requestIndex].rejectedAt = new Date().toISOString();
            
            localStorage.setItem('connectionRequests', JSON.stringify(connectionRequests));
            
            // UIから削除
            const requestItem = buttonElement.closest('.connection-request-item');
            if (requestItem) {
                requestItem.style.opacity = '0';
                requestItem.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    requestItem.remove();
                    
                    // モーダルが空になったら閉じる
                    const remainingRequests = document.querySelectorAll('.connection-request-item');
                    if (remainingRequests.length === 0) {
                        this.closeConnectionRequestsModal();
                    }
                }, 300);
            }
            
            // カウント更新
            this.updateConnectionRequestCount();
            this.loadNotifications(); // 通知も更新
            
            // 情報メッセージ
            this.showNotification('接続リクエストを拒否しました', 'info');
        }
    }
    
    // 通知表示メソッド
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        if (type === 'success') {
            notification.style.backgroundColor = '#28a745';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#dc3545';
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#212529';
        } else {
            notification.style.backgroundColor = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // サイドバー設定
    setupSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        
        // モバイルではサイドバーをデフォルトで非表示
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            sidebar.style.position = 'fixed';
            sidebar.style.left = '-100%';
        }
        
        // サイドバートグルボタンの表示制御
        if (sidebarToggle) {
            if (window.innerWidth <= 768) {
                sidebarToggle.style.display = 'block';
            } else {
                sidebarToggle.style.display = 'none';
            }
        }
        
        // レスポンシブ対応
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                // モバイルサイズ
                sidebar.style.position = 'fixed';
                sidebar.style.left = sidebar.classList.contains('active') ? '0' : '-100%';
                if (sidebarToggle) sidebarToggle.style.display = 'block';
            } else {
                // デスクトップサイズ
                sidebar.style.position = 'fixed';
                sidebar.style.left = '0';
                sidebar.classList.remove('active');
                if (sidebarToggle) sidebarToggle.style.display = 'none';
                
                // オーバーレイを削除
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
    }
}

// グローバル関数
function joinEvent(eventTitle) {
    showNotification(`「${eventTitle}」への参加申し込みを受け付けました`, 'success');
}

function connectWithMember(memberName) {
    showNotification(`${memberName}さんに接続リクエストを送信しました`, 'success');
}

// グローバルダッシュボードインスタンス
let dashboard = null;

// ダッシュボード初期化関数
function initializeDashboard() {
    try {
        console.log('Starting dashboard initialization...');
        
        // 認証チェック - 最大10回まで試行
        if (typeof auth === 'undefined' || !auth) {
            if (!initializeDashboard.retryCount) {
                initializeDashboard.retryCount = 0;
            }
            if (initializeDashboard.retryCount < 10) {
                console.warn('Auth module not loaded or not ready, retrying...', initializeDashboard.retryCount + 1);
                initializeDashboard.retryCount++;
                setTimeout(initializeDashboard, 100);
                return;
            } else {
                console.warn('Auth module failed to load after 10 attempts, proceeding without auth');
                // auth無しで初期化を続行
            }
        }
        
        console.log('Auth module loaded successfully');
        
        // currentUserを取得して再チェック
        const currentUser = auth.getCurrentUser();
        console.log('Current user:', currentUser ? 'Found' : 'Not found');
        
        if (!currentUser) {
            console.info('User not logged in, redirecting to login');
            window.location.href = 'login.html';
            return;
        }

        console.log('User authenticated, initializing dashboard...');
        
        // ダッシュボード初期化
        dashboard = new Dashboard();
        
        // グローバルアクセスのためにwindowに設定
        window.dashboard = dashboard;
        
        // ページタイトル更新
        const userName = currentUser.lastName && currentUser.firstName ? 
            `${currentUser.lastName} ${currentUser.firstName}` : 
            currentUser.name || 'ユーザー';
        document.title = `ダッシュボード - ${userName} | INTERCONNECT`;
        
        // リサイズイベントリスナー追加
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                dashboard.closeSidebar();
            }
        });
        
        console.info('Dashboard initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        
        // エラー通知を表示
        if (typeof showNotification === 'function') {
            showNotification('ダッシュボードの初期化に失敗しました: ' + error.message, 'error');
        } else {
            alert('ダッシュボードの初期化に失敗しました: ' + error.message);
        }
        
        // フォールバックとしてログインページにリダイレクト
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', function() {
    // 少し遅延して初期化を実行（auth.jsの読み込みを待つ）
    setTimeout(initializeDashboard, 100);
});

// ウィンドウのアンロード時のクリーンアップ
window.addEventListener('beforeunload', () => {
    // サイドバーを閉じる
    if (dashboard) {
        dashboard.closeSidebar();
    }
    
    // ボディのスタイルをリセット
    document.body.style.overflow = '';
});

// ログアウト関数
function logout() {
    try {
        if (dashboard) {
            dashboard.closeSidebar();
        }
        
        if (typeof auth !== 'undefined' && typeof auth.logout === 'function') {
            auth.logout();
        } else {
            // フォールバック
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
        }
        
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = 'login.html';
    }
}

// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// DOMContentLoadedで安全に初期化
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Dashboardクラスが存在し、ユーザーがログインしている場合のみ初期化
        if (typeof Dashboard !== 'undefined') {
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                window.dashboard = new Dashboard();
            } else {
                console.warn('No user logged in, dashboard not initialized');
            }
        }
    } catch (error) {
        console.error('Dashboard initialization failed:', error);
    }
});