// INTERCONNECT マスターシステム - 全機能の統合管理

class InterconnectMasterSystem {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        this.systems = {};
        this.currentUser = null;
        this.globalSettings = this.loadGlobalSettings();
        this.init();
    }

    async init() {
        console.log(`🚀 INTERCONNECT Master System v${this.version} 初期化開始`);
        
        try {
            // 1. 基本システムの初期化
            await this.initializeCore();
            
            // 2. 各システムの登録
            this.registerSystems();
            
            // 3. グローバル設定の適用
            this.applyGlobalSettings();
            
            // 4. イベントリスナーの設定
            this.setupGlobalEventListeners();
            
            // 5. 定期実行タスクの開始
            this.startPeriodicTasks();
            
            this.initialized = true;
            console.log('✅ INTERCONNECT Master System 初期化完了');
            
            // 初期化完了イベントを発火
            this.dispatchEvent('system:initialized', { version: this.version });
            
        } catch (error) {
            console.error('❌ INTERCONNECT Master System 初期化エラー:', error);
            this.handleInitializationError(error);
        }
    }

    // =============================================================================
    // 基本システム初期化
    // =============================================================================

    async initializeCore() {
        // Supabaseサービスの確認
        if (window.completeSupabaseService) {
            this.systems.supabase = window.completeSupabaseService;
            console.log('✅ Supabaseサービス登録完了');
        } else {
            console.warn('⚠️ Supabaseサービスが見つかりません');
        }

        // 認証システムの確認
        if (window.authSystem) {
            this.systems.auth = window.authSystem;
            this.currentUser = this.systems.auth.getCurrentUser();
            console.log('✅ 認証システム登録完了');
        } else {
            console.warn('⚠️ 認証システムが見つかりません');
        }
    }

    registerSystems() {
        // 各システムの登録
        const systemsToRegister = [
            { name: 'messages', instance: window.messagesSystem, label: 'メッセージシステム' },
            { name: 'events', instance: window.eventsSystem, label: 'イベントシステム' },
            { name: 'business', instance: window.businessMatching, label: 'ビジネスマッチング' },
            { name: 'members', instance: window.membersSystem, label: 'メンバーシステム' }
        ];

        systemsToRegister.forEach(system => {
            if (system.instance) {
                this.systems[system.name] = system.instance;
                console.log(`✅ ${system.label}登録完了`);
            } else {
                console.log(`ℹ️ ${system.label}は現在のページでは利用できません`);
            }
        });
    }

    // =============================================================================
    // グローバル設定
    // =============================================================================

    loadGlobalSettings() {
        const defaultSettings = {
            theme: 'light',
            language: 'ja',
            notifications: {
                sound: true,
                push: true,
                email: false
            },
            privacy: {
                profileVisibility: 'members',
                showOnlineStatus: true,
                allowDirectMessages: true
            },
            display: {
                itemsPerPage: 12,
                defaultView: 'grid',
                timezone: 'Asia/Tokyo'
            }
        };

        try {
            const saved = localStorage.getItem('interconnect_settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.warn('設定の読み込みに失敗しました。デフォルト設定を使用します。');
            return defaultSettings;
        }
    }

    saveGlobalSettings() {
        try {
            localStorage.setItem('interconnect_settings', JSON.stringify(this.globalSettings));
        } catch (error) {
            console.error('設定の保存に失敗しました:', error);
        }
    }

    applyGlobalSettings() {
        // テーマの適用
        document.body.className = document.body.className.replace(/theme-\w+/, '');
        document.body.classList.add(`theme-${this.globalSettings.theme}`);

        // 言語の適用
        document.documentElement.lang = this.globalSettings.language;

        // その他の設定適用
        this.applyDisplaySettings();
        this.applyNotificationSettings();
    }

    applyDisplaySettings() {
        const { display } = this.globalSettings;
        
        // CSS変数として設定値を適用
        document.documentElement.style.setProperty('--items-per-page', display.itemsPerPage);
        document.documentElement.style.setProperty('--default-view', `"${display.defaultView}"`);
    }

    applyNotificationSettings() {
        const { notifications } = this.globalSettings;
        
        // 通知音の設定
        if (typeof Audio !== 'undefined') {
            this.notificationSound = notifications.sound ? new Audio('/sounds/notification.mp3') : null;
        }
        
        // プッシュ通知の設定
        if (notifications.push && 'Notification' in window) {
            this.requestNotificationPermission();
        }
    }

    // =============================================================================
    // グローバルイベント管理
    // =============================================================================

    setupGlobalEventListeners() {
        // ページ離脱時の処理
        window.addEventListener('beforeunload', () => {
            this.handlePageUnload();
        });

        // ページフォーカス/ブラー
        window.addEventListener('focus', () => {
            this.handlePageFocus();
        });

        window.addEventListener('blur', () => {
            this.handlePageBlur();
        });

        // オンライン/オフライン状態の監視
        window.addEventListener('online', () => {
            this.handleOnlineStatusChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleOnlineStatusChange(false);
        });

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });

        // エラーハンドリング
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }

    handlePageUnload() {
        // 最後のアクティブ時間を更新
        if (this.currentUser) {
            this.updateLastActive();
        }

        // 設定を保存
        this.saveGlobalSettings();

        // WebSocket接続をクリーンアップ
        this.cleanupConnections();
    }

    handlePageFocus() {
        console.log('ページがアクティブになりました');
        
        // データの再取得
        this.refreshDataOnFocus();
        
        // オンライン状態の更新
        if (this.currentUser) {
            this.updateOnlineStatus(true);
        }
    }

    handlePageBlur() {
        console.log('ページが非アクティブになりました');
        
        // 最後のアクティブ時間を更新
        if (this.currentUser) {
            this.updateLastActive();
        }
    }

    handleOnlineStatusChange(isOnline) {
        console.log(`インターネット接続: ${isOnline ? 'オンライン' : 'オフライン'}`);
        
        // UI状態の更新
        document.body.classList.toggle('offline', !isOnline);
        
        // システムに通知
        this.dispatchEvent('network:statusChange', { isOnline });
        
        if (isOnline) {
            // オンライン復帰時にデータを同期
            this.syncDataOnReconnect();
        }
    }

    handleGlobalKeydown(e) {
        // Ctrl/Cmd + K: グローバル検索
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openGlobalSearch();
        }

        // Ctrl/Cmd + /: ヘルプ
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.openHelp();
        }

        // ESC: モーダルを閉じる
        if (e.key === 'Escape') {
            this.closeActiveModals();
        }
    }

    handleGlobalError(e) {
        console.error('グローバルエラー:', e.error);
        
        // エラーレポートの送信（本番環境では実装）
        this.reportError({
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.currentUser?.id
        });
    }

    handleUnhandledRejection(e) {
        console.error('未処理のPromise拒否:', e.reason);
        
        // Promise拒否のレポート
        this.reportError({
            type: 'unhandledRejection',
            reason: e.reason,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userId: this.currentUser?.id
        });
    }

    // =============================================================================
    // 定期実行タスク
    // =============================================================================

    startPeriodicTasks() {
        // 5分ごとに最後のアクティブ時間を更新
        setInterval(() => {
            if (this.currentUser && document.hasFocus()) {
                this.updateLastActive();
            }
        }, 5 * 60 * 1000);

        // 30秒ごとにオンライン状態を確認
        setInterval(() => {
            this.checkOnlineStatus();
        }, 30 * 1000);

        // 1分ごとに通知をチェック
        setInterval(() => {
            this.checkNotifications();
        }, 60 * 1000);

        // 10分ごとにデータを同期
        setInterval(() => {
            this.periodicDataSync();
        }, 10 * 60 * 1000);
    }

    // =============================================================================
    // データ管理
    // =============================================================================

    async refreshDataOnFocus() {
        if (!this.currentUser) return;

        try {
            // 各システムのデータを更新
            const refreshPromises = [];

            if (this.systems.messages) {
                refreshPromises.push(this.systems.messages.loadConversations());
            }

            if (this.systems.events) {
                refreshPromises.push(this.systems.events.loadEvents());
            }

            if (this.systems.business) {
                refreshPromises.push(this.systems.business.loadMatches());
            }

            await Promise.allSettled(refreshPromises);
            console.log('✅ フォーカス時のデータ更新完了');
        } catch (error) {
            console.error('データ更新エラー:', error);
        }
    }

    async syncDataOnReconnect() {
        if (!this.currentUser) return;

        console.log('🔄 オンライン復帰時のデータ同期開始');
        
        try {
            // ローカルストレージの未送信データを同期
            await this.syncPendingData();
            
            // 最新データを取得
            await this.refreshDataOnFocus();
            
            console.log('✅ データ同期完了');
        } catch (error) {
            console.error('データ同期エラー:', error);
        }
    }

    async syncPendingData() {
        // ローカルストレージから未送信データを取得して送信
        const pendingData = this.getPendingData();
        
        for (const item of pendingData) {
            try {
                await this.sendPendingItem(item);
            } catch (error) {
                console.error('未送信データの送信エラー:', error);
            }
        }
    }

    async periodicDataSync() {
        if (!this.currentUser || !navigator.onLine) return;

        console.log('🔄 定期データ同期実行');
        
        try {
            // 重要でないデータの同期
            await this.syncLowPriorityData();
        } catch (error) {
            console.error('定期同期エラー:', error);
        }
    }

    // =============================================================================
    // 通知管理
    // =============================================================================

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log(`通知許可: ${permission}`);
        }
    }

    showNotification(title, options = {}) {
        if (!this.globalSettings.notifications.push) return;

        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/images/icon-192.png',
                badge: '/images/badge-72.png',
                ...options
            });

            // 通知音を再生
            if (this.notificationSound && this.globalSettings.notifications.sound) {
                this.notificationSound.play().catch(() => {
                    // 音声再生に失敗した場合は無視
                });
            }

            return notification;
        }
    }

    async checkNotifications() {
        if (!this.currentUser) return;

        try {
            // 新しい通知をチェック
            // TODO: 通知取得APIの実装
            // const result = await this.systems.supabase.getNotifications(this.currentUser.id);
            
        } catch (error) {
            console.error('通知チェックエラー:', error);
        }
    }

    // =============================================================================
    // ユーティリティ機能
    // =============================================================================

    async updateLastActive() {
        if (!this.systems.supabase || !this.currentUser) return;

        try {
            await this.systems.supabase.updateUserProfile({
                last_active: new Date().toISOString()
            });
        } catch (error) {
            console.error('最終アクティブ時間更新エラー:', error);
        }
    }

    async updateOnlineStatus(isOnline) {
        // TODO: オンライン状態の更新実装
        console.log(`オンライン状態更新: ${isOnline}`);
    }

    checkOnlineStatus() {
        // ネットワーク接続状態のチェック
        const isOnline = navigator.onLine;
        
        if (isOnline !== this.lastOnlineStatus) {
            this.lastOnlineStatus = isOnline;
            this.handleOnlineStatusChange(isOnline);
        }
    }

    openGlobalSearch() {
        // グローバル検索モーダルを開く
        console.log('グローバル検索を開く');
        // TODO: 実装
    }

    openHelp() {
        // ヘルプページまたはモーダルを開く
        window.open('/help.html', '_blank');
    }

    closeActiveModals() {
        // 開いているモーダルをすべて閉じる
        const modals = document.querySelectorAll('.modal[style*="flex"], .modal[style*="block"]');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    cleanupConnections() {
        // WebSocket接続やリアルタイム購読をクリーンアップ
        Object.values(this.systems).forEach(system => {
            if (system.cleanup && typeof system.cleanup === 'function') {
                system.cleanup();
            }
        });
    }

    // =============================================================================
    // イベント管理
    // =============================================================================

    dispatchEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    addEventListener(eventName, callback) {
        window.addEventListener(eventName, callback);
    }

    removeEventListener(eventName, callback) {
        window.removeEventListener(eventName, callback);
    }

    // =============================================================================
    // エラー処理
    // =============================================================================

    handleInitializationError(error) {
        console.error('初期化エラーの詳細:', error);
        
        // ユーザーにエラーを通知
        this.showErrorMessage('システムの初期化に失敗しました。ページを再読み込みしてください。');
        
        // エラーレポート
        this.reportError({
            type: 'initialization',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }

    reportError(errorData) {
        // 本番環境では外部エラー追跡サービスに送信
        console.error('エラーレポート:', errorData);
        
        // TODO: 本番環境でのエラー追跡実装
        // 例: Sentry, Bugsnag, etc.
    }

    showErrorMessage(message) {
        // ユーザーにエラーメッセージを表示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'global-error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #dc2626;
            color: white;
            padding: 12px;
            z-index: 10000;
            text-align: center;
        `;
        
        document.body.appendChild(errorDiv);
        
        // 10秒後に自動削除
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 10000);
    }

    // =============================================================================
    // パブリックAPI
    // =============================================================================

    getSystem(systemName) {
        return this.systems[systemName];
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateSettings(newSettings) {
        this.globalSettings = { ...this.globalSettings, ...newSettings };
        this.saveGlobalSettings();
        this.applyGlobalSettings();
    }

    getSettings() {
        return { ...this.globalSettings };
    }

    isInitialized() {
        return this.initialized;
    }

    // =============================================================================
    // ダミー実装（TODO: 実際のAPIで置き換え）
    // =============================================================================

    getPendingData() {
        try {
            return JSON.parse(localStorage.getItem('pendingData') || '[]');
        } catch {
            return [];
        }
    }

    async sendPendingItem(item) {
        // TODO: 実際の送信処理
        console.log('未送信データを送信:', item);
    }

    async syncLowPriorityData() {
        // TODO: 低優先度データの同期
        console.log('低優先度データを同期');
    }
}

// グローバルインスタンスの作成と初期化
const interconnectMaster = new InterconnectMasterSystem();

// グローバルアクセス用
window.interconnectMaster = interconnectMaster;
window.INTERCONNECT = interconnectMaster; // 短縮形

console.log('🎯 INTERCONNECT Master System読み込み完了');