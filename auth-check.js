// 認証チェックシステム - 保護されたページへのアクセス制御
class AuthCheck {
    constructor() {
        this.protectedPages = [
            'dashboard.html',
            'members.html',
            'events.html',
            'messages.html',
            'settings.html',
            'profile.html',
            'admin.html',
            'business.html',
            'invite.html',
            'help.html',
            'member-profile.html'
        ];
        
        this.publicPages = [
            'index.html',
            'login.html',
            'register.html',
            'forgot-password.html',
            'password-reset.html',
            'terms.html',
            'privacy.html',
            'company.html',
            '404.html',
            'offline.html'
        ];
        
        this.adminPages = [
            'admin.html'
        ];
        
        this.initialized = false;
    }
    
    // 初期化
    init() {
        if (this.initialized) return;
        
        // ページ読み込み時に認証チェック
        document.addEventListener('DOMContentLoaded', () => {
            this.checkPageAccess();
        });
        
        // 既にDOMが読み込まれている場合
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            this.checkPageAccess();
        }
        
        this.initialized = true;
    }
    
    // 現在のページ名を取得
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf('/') + 1);
        return filename || 'index.html';
    }
    
    // ログイン状態をチェック
    isLoggedIn() {
        try {
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) return false;
            
            const user = JSON.parse(currentUser);
            return user && user.id && user.email;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }
    
    // 管理者権限をチェック
    isAdmin() {
        try {
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) return false;
            
            const user = JSON.parse(currentUser);
            return user && user.role === 'admin';
        } catch (error) {
            console.error('Admin check error:', error);
            return false;
        }
    }
    
    // ページアクセス権限をチェック
    checkPageAccess() {
        const currentPage = this.getCurrentPage();
        const isLoggedIn = this.isLoggedIn();
        const isAdmin = this.isAdmin();
        
        // 保護されたページへのアクセスチェック
        if (this.protectedPages.includes(currentPage)) {
            if (!isLoggedIn) {
                console.log('Unauthorized access to protected page:', currentPage);
                this.redirectToLogin();
                return;
            }
            
            // 管理者ページへのアクセスチェック
            if (this.adminPages.includes(currentPage) && !isAdmin) {
                console.log('Unauthorized access to admin page:', currentPage);
                this.redirectToDashboard();
                return;
            }
        }
        
        // ログイン済みユーザーが認証ページにアクセスした場合
        if (isLoggedIn && ['login.html', 'register.html'].includes(currentPage)) {
            this.redirectToDashboard();
        }
    }
    
    // ログインページへリダイレクト
    redirectToLogin() {
        const currentUrl = window.location.href;
        const returnUrl = encodeURIComponent(currentUrl);
        window.location.href = `/mnt/c/Users/ooxmi/Downloads/【コード】INTERCONNECT/login.html?returnUrl=${returnUrl}`;
    }
    
    // ダッシュボードへリダイレクト
    redirectToDashboard() {
        window.location.href = '/mnt/c/Users/ooxmi/Downloads/【コード】INTERCONNECT/dashboard.html';
    }
    
    // ページ遷移時の認証チェック（動的に呼び出し可能）
    checkBeforeNavigation(targetPage) {
        if (this.protectedPages.includes(targetPage)) {
            if (!this.isLoggedIn()) {
                this.redirectToLogin();
                return false;
            }
            
            if (this.adminPages.includes(targetPage) && !this.isAdmin()) {
                if (window.showNotification) {
                    window.showNotification('管理者権限が必要です', 'error');
                }
                return false;
            }
        }
        return true;
    }
    
    // セッションタイムアウトチェック
    checkSessionTimeout() {
        const lastActivity = localStorage.getItem('lastActivity');
        if (lastActivity) {
            const now = Date.now();
            const lastActivityTime = parseInt(lastActivity);
            const timeout = 30 * 60 * 1000; // 30分
            
            if (now - lastActivityTime > timeout) {
                this.logout();
                if (window.showNotification) {
                    window.showNotification('セッションがタイムアウトしました。再度ログインしてください。', 'info');
                }
                return false;
            }
        }
        
        // アクティビティを更新
        localStorage.setItem('lastActivity', Date.now().toString());
        return true;
    }
    
    // ログアウト処理
    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('lastActivity');
        sessionStorage.clear();
        this.redirectToLogin();
    }
}

// グローバルインスタンスを作成
const authCheck = new AuthCheck();
authCheck.init();

// グローバルに公開
window.authCheck = authCheck;

// ユーザーアクティビティを追跡
document.addEventListener('click', () => {
    if (authCheck.isLoggedIn()) {
        localStorage.setItem('lastActivity', Date.now().toString());
    }
});

// 定期的にセッションをチェック（5分ごと）
setInterval(() => {
    if (authCheck.isLoggedIn() && authCheck.protectedPages.includes(authCheck.getCurrentPage())) {
        authCheck.checkSessionTimeout();
    }
}, 5 * 60 * 1000);