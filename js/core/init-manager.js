/**
 * INTERCONNECT 統一初期化マネージャー
 * 全てのモジュールの初期化を管理し、重複を防ぐ
 */

// グローバル名前空間の定義
window.INTERCONNECT = {
    // 初期化状態
    initialized: false,
    digitalEffectsInitialized: false,
    
    // モジュールインスタンス
    dashboard: null,
    notifications: null,
    messageService: null,
    
    // 初期化完了フラグ
    modules: {
        auth: false,
        dashboard: false,
        messages: false,
        notifications: false,
        digitalEffects: false
    },
    
    // 初期化キュー
    initQueue: [],
    
    // 初期化マネージャー
    init: function() {
        if (this.initialized) return;
        
        console.log('🚀 INTERCONNECT 初期化開始');
        
        // DOM準備完了時の初期化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeModules());
        } else {
            this.initializeModules();
        }
        
        this.initialized = true;
    },
    
    // モジュール初期化
    initializeModules: function() {
        const currentPage = this.getCurrentPage();
        console.log(`📄 現在のページ: ${currentPage}`);
        
        // 基本モジュールの初期化
        this.initializeCore();
        
        // ページ固有の初期化
        switch(currentPage) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'messages':
                this.initializeMessages();
                break;
            case 'matching':
                this.initializeMatching();
                break;
            case 'index':
                this.initializeDigitalEffects();
                break;
        }
        
        // 初期化完了
        this.onInitComplete();
    },
    
    // 現在のページを判定
    getCurrentPage: function() {
        const path = window.location.pathname;
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('messages')) return 'messages';
        if (path.includes('matching')) return 'matching';
        if (path.includes('index') || path === '/') return 'index';
        return 'unknown';
    },
    
    // 基本モジュール初期化
    initializeCore: function() {
        // 認証システム
        if (window.authSystem && !this.modules.auth) {
            try {
                window.authSystem.init();
                this.modules.auth = true;
                console.log('✅ 認証システム初期化完了');
            } catch (error) {
                console.error('❌ 認証システム初期化エラー:', error);
            }
        }
        
        // 通知システム
        if (window.notificationService && !this.modules.notifications) {
            try {
                this.notifications = window.notificationService;
                this.modules.notifications = true;
                console.log('✅ 通知システム初期化完了');
            } catch (error) {
                console.error('❌ 通知システム初期化エラー:', error);
            }
        }
    },
    
    // ダッシュボード初期化
    initializeDashboard: function() {
        if (this.modules.dashboard) return;
        
        try {
            // モバイルナビゲーション
            if (window.mobileNavGuaranteed) {
                window.mobileNavGuaranteed.init();
            }
            
            // ダッシュボード固有の処理
            if (window.dashboardInit) {
                window.dashboardInit();
            }
            
            this.modules.dashboard = true;
            console.log('✅ ダッシュボード初期化完了');
        } catch (error) {
            console.error('❌ ダッシュボード初期化エラー:', error);
        }
    },
    
    // メッセージ初期化
    initializeMessages: function() {
        if (this.modules.messages) return;
        
        try {
            if (window.messageService) {
                this.messageService = window.messageService;
                this.messageService.init();
            }
            
            this.modules.messages = true;
            console.log('✅ メッセージシステム初期化完了');
        } catch (error) {
            console.error('❌ メッセージシステム初期化エラー:', error);
        }
    },
    
    // マッチング初期化
    initializeMatching: function() {
        try {
            if (window.matchingEngine) {
                window.matchingEngine.init();
            }
            
            console.log('✅ マッチングシステム初期化完了');
        } catch (error) {
            console.error('❌ マッチングシステム初期化エラー:', error);
        }
    },
    
    // デジタルエフェクト初期化
    initializeDigitalEffects: function() {
        if (this.digitalEffectsInitialized) return;
        
        try {
            // デジタルエフェクトの初期化
            if (window.digitalEffects) {
                window.digitalEffects.init();
            }
            
            this.digitalEffectsInitialized = true;
            this.modules.digitalEffects = true;
            console.log('✅ デジタルエフェクト初期化完了');
        } catch (error) {
            console.error('❌ デジタルエフェクト初期化エラー:', error);
        }
    },
    
    // 初期化完了処理
    onInitComplete: function() {
        console.log('🎉 INTERCONNECT 初期化完了');
        console.log('📊 初期化状態:', this.modules);
        
        // カスタムイベントの発火
        document.dispatchEvent(new CustomEvent('interconnectReady', {
            detail: { modules: this.modules }
        }));
    },
    
    // 安全な関数実行
    safeExecute: function(func, context = null) {
        try {
            return func.call(context);
        } catch (error) {
            console.error('❌ 実行エラー:', error);
            return null;
        }
    }
};

// 自動初期化
window.INTERCONNECT.init();