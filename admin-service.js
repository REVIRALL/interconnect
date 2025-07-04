// 管理パネル専用サービス

class AdminService {
    constructor() {
        this.users = new Map();
        this.events = new Map();
        this.content = new Map();
        this.systemSettings = {};
        this.reports = new Map();
        this.announcements = new Map();
        this.resources = new Map();
        
        this.initialize();
    }

    async initialize() {
        this.loadDemoData();
        this.loadStoredData();
        console.log('Admin service initialized');
    }

    // ========== ユーザー管理 ==========

    loadDemoData() {
        // デモユーザーデータ
        const demoUsers = [
            {
                id: '001',
                name: '山田太郎',
                company: '株式会社サンプル',
                email: 'yamada@example.com',
                status: 'active',
                role: 'member',
                registeredDate: '2024-01-15',
                lastLogin: '2024-02-10 14:30',
                avatar: this.generateAvatar('山田太郎'),
                phone: '090-1234-5678',
                department: 'システム開発部',
                position: 'エンジニア'
            },
            {
                id: '002',
                name: '鈴木花子',
                company: '合同会社テスト',
                email: 'suzuki@example.com',
                status: 'active',
                role: 'premium',
                registeredDate: '2024-01-10',
                lastLogin: '2024-02-11 09:15',
                avatar: this.generateAvatar('鈴木花子'),
                phone: '080-9876-5432',
                department: 'マーケティング部',
                position: 'マネージャー'
            },
            {
                id: '003',
                name: '佐藤次郎',
                company: '株式会社デモ',
                email: 'sato@example.com',
                status: 'suspended',
                role: 'member',
                registeredDate: '2023-12-20',
                lastLogin: '2024-01-28 16:45',
                avatar: this.generateAvatar('佐藤次郎'),
                phone: '070-1111-2222',
                department: '営業部',
                position: '営業担当'
            },
            {
                id: '004',
                name: '田中美希',
                company: 'フリーランス',
                email: 'tanaka@example.com',
                status: 'active',
                role: 'member',
                registeredDate: '2024-02-01',
                lastLogin: '2024-02-11 13:20',
                avatar: this.generateAvatar('田中美希'),
                phone: '090-3333-4444',
                department: 'デザイン',
                position: 'フリーランスデザイナー'
            },
            {
                id: '005',
                name: '高橋健太',
                company: '株式会社イノベーション',
                email: 'takahashi@example.com',
                status: 'pending',
                role: 'member',
                registeredDate: '2024-02-11',
                lastLogin: 'まだログインなし',
                avatar: this.generateAvatar('高橋健太'),
                phone: '080-5555-6666',
                department: '事業開発部',
                position: 'プロダクトマネージャー'
            }
        ];

        demoUsers.forEach(user => {
            this.users.set(user.id, user);
        });

        // デモイベントデータ
        const demoEvents = [
            {
                id: 'evt001',
                title: '定例交流会',
                description: '毎月開催の交流イベント',
                date: '2024-02-13',
                time: '19:00',
                duration: '2時間',
                location: '東京都渋谷区サンプル会議室',
                maxParticipants: 50,
                currentParticipants: 45,
                status: 'approved',
                organizer: '山田太郎',
                category: '交流会',
                createdDate: '2024-01-20'
            },
            {
                id: 'evt002',
                title: 'ビジネスピッチ会',
                description: '新規事業のピッチイベント',
                date: '2024-03-15',
                time: '18:00',
                duration: '3時間',
                location: '東京都新宿区イノベーションハブ',
                maxParticipants: 40,
                currentParticipants: 30,
                status: 'preparing',
                organizer: '鈴木花子',
                category: 'ピッチ',
                createdDate: '2024-02-01'
            },
            {
                id: 'evt003',
                title: 'テクノロジーセミナー',
                description: '最新技術トレンドについて',
                date: '2024-02-20',
                time: '14:00',
                duration: '4時間',
                location: 'オンライン開催',
                maxParticipants: 100,
                currentParticipants: 78,
                status: 'approved',
                organizer: '田中美希',
                category: 'セミナー',
                createdDate: '2024-01-25'
            }
        ];

        demoEvents.forEach(event => {
            this.events.set(event.id, event);
        });

        // システム設定のデフォルト値
        this.systemSettings = {
            siteName: 'INTERCONNECT',
            adminEmail: 'admin@interconnect.jp',
            maxFileSize: '10MB',
            allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'xls'],
            maintenanceMode: false,
            registrationEnabled: true,
            emailNotifications: true,
            autoApproval: false
        };

        // デモコンテンツデータ
        this.loadDemoContent();
    }

    loadDemoContent() {
        // デモ記事データ
        const demoArticles = [
            {
                id: 'art001',
                title: 'ビジネスマッチングの成功事例',
                content: '今月のビジネスマッチングで3社の新規取引が成立しました。',
                category: '成功事例',
                author: '山田太郎',
                publishDate: '2024-02-10',
                status: 'published',
                views: 234,
                tags: ['ビジネス', 'マッチング', '成功事例']
            },
            {
                id: 'art002',
                title: '新機能リリースのお知らせ',
                content: 'メッセージ機能に新しい機能が追加されました。',
                category: 'お知らせ',
                author: '管理者',
                publishDate: '2024-02-08',
                status: 'published',
                views: 456,
                tags: ['お知らせ', '新機能']
            },
            {
                id: 'art003',
                title: '起業家向けセミナーレポート',
                content: '先週開催された起業家向けセミナーの内容をレポートします。',
                category: 'レポート',
                author: '鈴木花子',
                publishDate: '2024-02-05',
                status: 'draft',
                views: 0,
                tags: ['セミナー', 'レポート', '起業']
            }
        ];

        demoArticles.forEach(article => {
            this.content.set(article.id, article);
        });

        // デモお知らせデータ
        const demoAnnouncements = [
            {
                id: 'ann001',
                title: 'システムメンテナンスのお知らせ',
                content: '2月15日深夜にシステムメンテナンスを実施します。',
                priority: 'high',
                startDate: '2024-02-12',
                endDate: '2024-02-16',
                status: 'active'
            },
            {
                id: 'ann002',
                title: '新規会員募集キャンペーン',
                content: '今月末まで入会金無料キャンペーンを実施中です。',
                priority: 'medium',
                startDate: '2024-02-01',
                endDate: '2024-02-29',
                status: 'active'
            }
        ];

        demoAnnouncements.forEach(announcement => {
            this.announcements.set(announcement.id, announcement);
        });

        // デモリソースデータ
        const demoResources = [
            {
                id: 'res001',
                title: 'ビジネスプラン作成ガイド',
                description: '事業計画書の作成方法をまとめたガイドブック',
                type: 'document',
                fileSize: '2.5MB',
                downloadCount: 89,
                uploadDate: '2024-01-20',
                category: 'ガイド'
            },
            {
                id: 'res002',
                title: 'ピッチデック テンプレート',
                description: 'プレゼンテーション用のテンプレート集',
                type: 'template',
                fileSize: '5.2MB',
                downloadCount: 156,
                uploadDate: '2024-01-15',
                category: 'テンプレート'
            }
        ];

        demoResources.forEach(resource => {
            this.resources.set(resource.id, resource);
        });
    }

    generateAvatar(name) {
        const firstChar = name.charAt(0) || 'U';
        const svgContent = `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad-${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1e5ba8;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#4a90e2;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="40" height="40" fill="url(#grad-${Date.now()})"/>
            <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="16" font-weight="600">${firstChar}</text>
        </svg>`;
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
    }

    // ユーザー検索とフィルタリング
    searchUsers(query, filters = {}) {
        let results = Array.from(this.users.values());

        // テキスト検索
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(user => 
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.company.toLowerCase().includes(searchTerm)
            );
        }

        // ステータスフィルター
        if (filters.status) {
            results = results.filter(user => user.status === filters.status);
        }

        // ロールフィルター
        if (filters.role) {
            results = results.filter(user => user.role === filters.role);
        }

        // 登録日フィルター
        if (filters.dateFrom) {
            results = results.filter(user => new Date(user.registeredDate) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            results = results.filter(user => new Date(user.registeredDate) <= new Date(filters.dateTo));
        }

        return results;
    }

    // ユーザー詳細取得
    getUserDetail(userId) {
        const user = this.users.get(userId);
        if (!user) return null;

        // 追加統計情報も含める
        return {
            ...user,
            statistics: {
                totalLogins: Math.floor(Math.random() * 100) + 10,
                eventsAttended: Math.floor(Math.random() * 20) + 1,
                connectionsCount: Math.floor(Math.random() * 50) + 5,
                messagesCount: Math.floor(Math.random() * 200) + 10
            }
        };
    }

    // ユーザー作成
    createUser(userData) {
        const newId = String(this.users.size + 1).padStart(3, '0');
        const newUser = {
            id: newId,
            ...userData,
            status: 'pending',
            registeredDate: new Date().toISOString().split('T')[0],
            lastLogin: 'まだログインなし',
            avatar: this.generateAvatar(userData.name)
        };

        this.users.set(newId, newUser);
        this.saveUsersToStorage();
        return newUser;
    }

    // ユーザー更新
    updateUser(userId, updates) {
        const user = this.users.get(userId);
        if (!user) return false;

        Object.assign(user, updates);
        this.users.set(userId, user);
        this.saveUsersToStorage();
        return user;
    }

    // ユーザー削除
    deleteUser(userId) {
        const deleted = this.users.delete(userId);
        if (deleted) {
            this.saveUsersToStorage();
        }
        return deleted;
    }

    // ユーザーステータス変更
    changeUserStatus(userId, newStatus) {
        const user = this.users.get(userId);
        if (!user) return false;

        user.status = newStatus;
        this.users.set(userId, user);
        this.saveUsersToStorage();
        return true;
    }

    // 一括ユーザー操作
    bulkUserAction(userIds, action, data = {}) {
        let affectedCount = 0;

        userIds.forEach(userId => {
            const user = this.users.get(userId);
            if (!user) return;

            switch (action) {
                case 'activate':
                    user.status = 'active';
                    affectedCount++;
                    break;
                case 'suspend':
                    user.status = 'suspended';
                    affectedCount++;
                    break;
                case 'delete':
                    this.users.delete(userId);
                    affectedCount++;
                    break;
                case 'changeRole':
                    user.role = data.role;
                    affectedCount++;
                    break;
            }
        });

        this.saveUsersToStorage();
        return affectedCount;
    }

    // ========== イベント管理 ==========

    searchEvents(query, filters = {}) {
        let results = Array.from(this.events.values());

        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(event => 
                event.title.toLowerCase().includes(searchTerm) ||
                event.description.toLowerCase().includes(searchTerm) ||
                event.organizer.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.status) {
            results = results.filter(event => event.status === filters.status);
        }

        if (filters.category) {
            results = results.filter(event => event.category === filters.category);
        }

        return results;
    }

    createEvent(eventData) {
        const newId = 'evt' + String(this.events.size + 1).padStart(3, '0');
        const newEvent = {
            id: newId,
            ...eventData,
            status: 'preparing',
            currentParticipants: 0,
            createdDate: new Date().toISOString().split('T')[0]
        };

        this.events.set(newId, newEvent);
        this.saveEventsToStorage();
        return newEvent;
    }

    updateEvent(eventId, updates) {
        const event = this.events.get(eventId);
        if (!event) return false;

        Object.assign(event, updates);
        this.events.set(eventId, event);
        this.saveEventsToStorage();
        return event;
    }

    deleteEvent(eventId) {
        const deleted = this.events.delete(eventId);
        if (deleted) {
            this.saveEventsToStorage();
        }
        return deleted;
    }

    // ========== レポート生成 ==========

    generateUserReport(period = 'monthly') {
        const users = Array.from(this.users.values());
        const now = new Date();
        let startDate;

        switch (period) {
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarterly':
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case 'yearly':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
        }

        const newUsers = users.filter(user => 
            new Date(user.registeredDate) >= startDate
        );

        const activeUsers = users.filter(user => user.status === 'active');
        const suspendedUsers = users.filter(user => user.status === 'suspended');

        return {
            period,
            totalUsers: users.length,
            newUsers: newUsers.length,
            activeUsers: activeUsers.length,
            suspendedUsers: suspendedUsers.length,
            usersByRole: {
                member: users.filter(u => u.role === 'member').length,
                premium: users.filter(u => u.role === 'premium').length,
                admin: users.filter(u => u.role === 'admin').length
            },
            usersByCompany: this.getUsersByCompany(users),
            registrationTrend: this.getRegistrationTrend(users, startDate)
        };
    }

    getUsersByCompany(users) {
        const companies = {};
        users.forEach(user => {
            companies[user.company] = (companies[user.company] || 0) + 1;
        });
        return Object.entries(companies)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
    }

    getRegistrationTrend(users, startDate) {
        const trend = {};
        users.forEach(user => {
            const regDate = user.registeredDate;
            if (new Date(regDate) >= startDate) {
                trend[regDate] = (trend[regDate] || 0) + 1;
            }
        });
        return trend;
    }

    generateEventReport(period = 'monthly') {
        const events = Array.from(this.events.values());
        
        return {
            period,
            totalEvents: events.length,
            approvedEvents: events.filter(e => e.status === 'approved').length,
            preparingEvents: events.filter(e => e.status === 'preparing').length,
            totalParticipants: events.reduce((sum, e) => sum + e.currentParticipants, 0),
            averageParticipants: events.length > 0 
                ? Math.round(events.reduce((sum, e) => sum + e.currentParticipants, 0) / events.length)
                : 0,
            eventsByCategory: this.getEventsByCategory(events),
            popularEvents: events
                .sort((a, b) => b.currentParticipants - a.currentParticipants)
                .slice(0, 5)
        };
    }

    getEventsByCategory(events) {
        const categories = {};
        events.forEach(event => {
            categories[event.category] = (categories[event.category] || 0) + 1;
        });
        return categories;
    }

    // ========== システム設定 ==========

    getSystemSettings() {
        return { ...this.systemSettings };
    }

    updateSystemSettings(updates) {
        Object.assign(this.systemSettings, updates);
        this.saveSettingsToStorage();
        return this.systemSettings;
    }

    // ========== データ永続化 ==========

    saveUsersToStorage() {
        try {
            const usersArray = Array.from(this.users.entries());
            localStorage.setItem('adminUsers', JSON.stringify(usersArray));
        } catch (error) {
            console.error('Failed to save users:', error);
        }
    }

    saveEventsToStorage() {
        try {
            const eventsArray = Array.from(this.events.entries());
            localStorage.setItem('adminEvents', JSON.stringify(eventsArray));
        } catch (error) {
            console.error('Failed to save events:', error);
        }
    }

    saveSettingsToStorage() {
        try {
            localStorage.setItem('systemSettings', JSON.stringify(this.systemSettings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    loadStoredData() {
        try {
            // ユーザーデータの読み込み
            const storedUsers = localStorage.getItem('adminUsers');
            if (storedUsers) {
                const usersArray = JSON.parse(storedUsers);
                usersArray.forEach(([id, user]) => {
                    this.users.set(id, user);
                });
            }

            // イベントデータの読み込み
            const storedEvents = localStorage.getItem('adminEvents');
            if (storedEvents) {
                const eventsArray = JSON.parse(storedEvents);
                eventsArray.forEach(([id, event]) => {
                    this.events.set(id, event);
                });
            }

            // 設定データの読み込み
            const storedSettings = localStorage.getItem('systemSettings');
            if (storedSettings) {
                this.systemSettings = { ...this.systemSettings, ...JSON.parse(storedSettings) };
            }

            // コンテンツデータの読み込み
            const storedContent = localStorage.getItem('adminContent');
            if (storedContent) {
                const contentArray = JSON.parse(storedContent);
                contentArray.forEach(([id, content]) => {
                    this.content.set(id, content);
                });
            }

            // お知らせデータの読み込み
            const storedAnnouncements = localStorage.getItem('adminAnnouncements');
            if (storedAnnouncements) {
                const announcementsArray = JSON.parse(storedAnnouncements);
                announcementsArray.forEach(([id, announcement]) => {
                    this.announcements.set(id, announcement);
                });
            }

            // リソースデータの読み込み
            const storedResources = localStorage.getItem('adminResources');
            if (storedResources) {
                const resourcesArray = JSON.parse(storedResources);
                resourcesArray.forEach(([id, resource]) => {
                    this.resources.set(id, resource);
                });
            }
        } catch (error) {
            console.error('Failed to load stored data:', error);
        }
    }

    saveContentToStorage() {
        try {
            const contentArray = Array.from(this.content.entries());
            localStorage.setItem('adminContent', JSON.stringify(contentArray));
        } catch (error) {
            console.error('Failed to save content:', error);
        }
    }

    saveAnnouncementsToStorage() {
        try {
            const announcementsArray = Array.from(this.announcements.entries());
            localStorage.setItem('adminAnnouncements', JSON.stringify(announcementsArray));
        } catch (error) {
            console.error('Failed to save announcements:', error);
        }
    }

    saveResourcesToStorage() {
        try {
            const resourcesArray = Array.from(this.resources.entries());
            localStorage.setItem('adminResources', JSON.stringify(resourcesArray));
        } catch (error) {
            console.error('Failed to save resources:', error);
        }
    }

    // ========== コンテンツ管理 ==========

    searchContent(query, filters = {}) {
        let results = Array.from(this.content.values());

        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(content => 
                content.title.toLowerCase().includes(searchTerm) ||
                content.content.toLowerCase().includes(searchTerm) ||
                content.author.toLowerCase().includes(searchTerm) ||
                (content.tags && content.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        if (filters.category) {
            results = results.filter(content => content.category === filters.category);
        }

        if (filters.status) {
            results = results.filter(content => content.status === filters.status);
        }

        if (filters.author) {
            results = results.filter(content => content.author === filters.author);
        }

        return results;
    }

    createContent(contentData) {
        const newId = 'art' + String(this.content.size + 1).padStart(3, '0');
        const newContent = {
            id: newId,
            ...contentData,
            publishDate: new Date().toISOString().split('T')[0],
            views: 0,
            status: contentData.status || 'draft'
        };

        this.content.set(newId, newContent);
        this.saveContentToStorage();
        return newContent;
    }

    updateContent(contentId, updates) {
        const content = this.content.get(contentId);
        if (!content) return false;

        Object.assign(content, updates);
        this.content.set(contentId, content);
        this.saveContentToStorage();
        return content;
    }

    deleteContent(contentId) {
        const deleted = this.content.delete(contentId);
        if (deleted) {
            this.saveContentToStorage();
        }
        return deleted;
    }

    publishContent(contentId) {
        const content = this.content.get(contentId);
        if (!content) return false;

        content.status = 'published';
        content.publishDate = new Date().toISOString().split('T')[0];
        this.content.set(contentId, content);
        this.saveContentToStorage();
        return true;
    }

    // お知らせ管理
    searchAnnouncements(query, filters = {}) {
        let results = Array.from(this.announcements.values());

        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(announcement => 
                announcement.title.toLowerCase().includes(searchTerm) ||
                announcement.content.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.priority) {
            results = results.filter(announcement => announcement.priority === filters.priority);
        }

        if (filters.status) {
            results = results.filter(announcement => announcement.status === filters.status);
        }

        return results;
    }

    createAnnouncement(announcementData) {
        const newId = 'ann' + String(this.announcements.size + 1).padStart(3, '0');
        const newAnnouncement = {
            id: newId,
            ...announcementData,
            createdDate: new Date().toISOString().split('T')[0]
        };

        this.announcements.set(newId, newAnnouncement);
        this.saveAnnouncementsToStorage();
        return newAnnouncement;
    }

    updateAnnouncement(announcementId, updates) {
        const announcement = this.announcements.get(announcementId);
        if (!announcement) return false;

        Object.assign(announcement, updates);
        this.announcements.set(announcementId, announcement);
        this.saveAnnouncementsToStorage();
        return announcement;
    }

    deleteAnnouncement(announcementId) {
        const deleted = this.announcements.delete(announcementId);
        if (deleted) {
            this.saveAnnouncementsToStorage();
        }
        return deleted;
    }

    // リソース管理
    searchResources(query, filters = {}) {
        let results = Array.from(this.resources.values());

        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(resource => 
                resource.title.toLowerCase().includes(searchTerm) ||
                resource.description.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.type) {
            results = results.filter(resource => resource.type === filters.type);
        }

        if (filters.category) {
            results = results.filter(resource => resource.category === filters.category);
        }

        return results;
    }

    createResource(resourceData) {
        const newId = 'res' + String(this.resources.size + 1).padStart(3, '0');
        const newResource = {
            id: newId,
            ...resourceData,
            uploadDate: new Date().toISOString().split('T')[0],
            downloadCount: 0
        };

        this.resources.set(newId, newResource);
        this.saveResourcesToStorage();
        return newResource;
    }

    updateResource(resourceId, updates) {
        const resource = this.resources.get(resourceId);
        if (!resource) return false;

        Object.assign(resource, updates);
        this.resources.set(resourceId, resource);
        this.saveResourcesToStorage();
        return resource;
    }

    deleteResource(resourceId) {
        const deleted = this.resources.delete(resourceId);
        if (deleted) {
            this.saveResourcesToStorage();
        }
        return deleted;
    }

    incrementDownloadCount(resourceId) {
        const resource = this.resources.get(resourceId);
        if (!resource) return false;

        resource.downloadCount = (resource.downloadCount || 0) + 1;
        this.resources.set(resourceId, resource);
        this.saveResourcesToStorage();
        return true;
    }

    // コンテンツ統計
    getContentStats() {
        const articles = Array.from(this.content.values());
        const announcements = Array.from(this.announcements.values());
        const resources = Array.from(this.resources.values());

        return {
            totalArticles: articles.length,
            publishedArticles: articles.filter(a => a.status === 'published').length,
            draftArticles: articles.filter(a => a.status === 'draft').length,
            totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0),
            activeAnnouncements: announcements.filter(a => a.status === 'active').length,
            totalResources: resources.length,
            totalDownloads: resources.reduce((sum, r) => sum + (r.downloadCount || 0), 0),
            popularArticles: articles
                .filter(a => a.status === 'published')
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 5),
            popularResources: resources
                .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
                .slice(0, 5)
        };
    }

    // ========== ユーティリティ ==========

    exportData(type = 'all') {
        const data = {};
        
        if (type === 'all' || type === 'users') {
            data.users = Array.from(this.users.values());
        }
        
        if (type === 'all' || type === 'events') {
            data.events = Array.from(this.events.values());
        }
        
        if (type === 'all' || type === 'settings') {
            data.settings = this.systemSettings;
        }

        if (type === 'all' || type === 'content') {
            data.content = Array.from(this.content.values());
            data.announcements = Array.from(this.announcements.values());
            data.resources = Array.from(this.resources.values());
        }

        return data;
    }

    importData(data) {
        try {
            if (data.users) {
                this.users.clear();
                data.users.forEach(user => {
                    this.users.set(user.id, user);
                });
                this.saveUsersToStorage();
            }

            if (data.events) {
                this.events.clear();
                data.events.forEach(event => {
                    this.events.set(event.id, event);
                });
                this.saveEventsToStorage();
            }

            if (data.settings) {
                this.systemSettings = { ...data.settings };
                this.saveSettingsToStorage();
            }

            if (data.content) {
                this.content.clear();
                data.content.forEach(content => {
                    this.content.set(content.id, content);
                });
                this.saveContentToStorage();
            }

            if (data.announcements) {
                this.announcements.clear();
                data.announcements.forEach(announcement => {
                    this.announcements.set(announcement.id, announcement);
                });
                this.saveAnnouncementsToStorage();
            }

            if (data.resources) {
                this.resources.clear();
                data.resources.forEach(resource => {
                    this.resources.set(resource.id, resource);
                });
                this.saveResourcesToStorage();
            }

            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}

// グローバルインスタンス
const adminService = new AdminService();
window.adminService = adminService;