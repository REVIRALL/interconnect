// ソーシャル認証システム
class SocialAuthManager {
    constructor() {
        this.providers = {
            google: {
                clientId: 'YOUR_GOOGLE_CLIENT_ID', // 設定が必要
                scope: 'openid email profile',
                redirectUri: window.location.origin + '/auth/google/callback'
            },
            line: {
                clientId: 'YOUR_LINE_CLIENT_ID', // 設定が必要
                scope: 'profile openid email',
                redirectUri: window.location.origin + '/auth/line/callback'
            },
            linkedin: {
                clientId: 'YOUR_LINKEDIN_CLIENT_ID', // 設定が必要
                scope: 'r_liteprofile r_emailaddress',
                redirectUri: window.location.origin + '/auth/linkedin/callback'
            }
        };
        
        this.initializeProviders();
    }

    // プロバイダーの初期化
    initializeProviders() {
        // Google API の初期化
        this.loadGoogleAPI();
        
        // LINE SDK の初期化
        this.loadLINESDK();
        
        // LinkedIn SDK の初期化
        this.loadLinkedInSDK();
    }

    // Google API の読み込み
    loadGoogleAPI() {
        if (document.getElementById('google-api-script')) return;
        
        const script = document.createElement('script');
        script.id = 'google-api-script';
        script.src = 'https://apis.google.com/js/api:base.js';
        script.onload = () => {
            gapi.load('auth2', () => {
                if (this.providers.google.clientId !== 'YOUR_GOOGLE_CLIENT_ID') {
                    gapi.auth2.init({
                        client_id: this.providers.google.clientId
                    });
                }
            });
        };
        document.head.appendChild(script);
    }

    // LINE SDK の読み込み
    loadLINESDK() {
        if (document.getElementById('line-sdk-script')) return;
        
        const script = document.createElement('script');
        script.id = 'line-sdk-script';
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        document.head.appendChild(script);
    }

    // LinkedIn SDK の読み込み
    loadLinkedInSDK() {
        // LinkedIn は OAuth 2.0 フローを直接使用
        console.log('LinkedIn OAuth 2.0 準備完了');
    }

    // Google ログイン
    async loginWithGoogle() {
        try {
            if (this.providers.google.clientId === 'YOUR_GOOGLE_CLIENT_ID') {
                // 開発環境用のデモ実装
                return this.createDemoUser('Google', 'google-demo@example.com');
            }

            // 本番環境用の実装
            const auth2 = gapi.auth2.getAuthInstance();
            const googleUser = await auth2.signIn();
            const profile = googleUser.getBasicProfile();
            
            const userData = {
                id: 'google-' + profile.getId(),
                email: profile.getEmail(),
                firstName: profile.getGivenName(),
                lastName: profile.getFamilyName(),
                profileImage: profile.getImageUrl(),
                provider: 'google',
                providerData: {
                    id: profile.getId(),
                    name: profile.getName(),
                    email: profile.getEmail()
                }
            };

            return this.processOAuthUser(userData);
        } catch (error) {
            console.error('Google ログインエラー:', error);
            throw new Error('Google ログインに失敗しました');
        }
    }

    // LINE ログイン
    async loginWithLINE() {
        try {
            if (this.providers.line.clientId === 'YOUR_LINE_CLIENT_ID') {
                // 開発環境用のデモ実装
                return this.createDemoUser('LINE', 'line-demo@example.com');
            }

            // 本番環境用の実装
            const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
                `response_type=code&` +
                `client_id=${this.providers.line.clientId}&` +
                `redirect_uri=${encodeURIComponent(this.providers.line.redirectUri)}&` +
                `scope=${encodeURIComponent(this.providers.line.scope)}&` +
                `state=${this.generateState()}`;
            
            // LINE ログインページにリダイレクト
            window.location.href = lineAuthUrl;
            
        } catch (error) {
            console.error('LINE ログインエラー:', error);
            throw new Error('LINE ログインに失敗しました');
        }
    }

    // LinkedIn ログイン
    async loginWithLinkedIn() {
        try {
            if (this.providers.linkedin.clientId === 'YOUR_LINKEDIN_CLIENT_ID') {
                // 開発環境用のデモ実装
                return this.createDemoUser('LinkedIn', 'linkedin-demo@example.com');
            }

            // 本番環境用の実装
            const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
                `response_type=code&` +
                `client_id=${this.providers.linkedin.clientId}&` +
                `redirect_uri=${encodeURIComponent(this.providers.linkedin.redirectUri)}&` +
                `scope=${encodeURIComponent(this.providers.linkedin.scope)}&` +
                `state=${this.generateState()}`;
            
            // LinkedIn ログインページにリダイレクト
            window.location.href = linkedinAuthUrl;
            
        } catch (error) {
            console.error('LinkedIn ログインエラー:', error);
            throw new Error('LinkedIn ログインに失敗しました');
        }
    }

    // デモユーザー作成
    createDemoUser(provider, email) {
        const demoUser = {
            id: `${provider.toLowerCase()}-demo-${Date.now()}`,
            email: email,
            firstName: 'デモ',
            lastName: `${provider}ユーザー`,
            company: `${provider}株式会社`,
            position: 'ソーシャルユーザー',
            industry: 'IT・テクノロジー',
            phone: '03-0000-0000',
            companySize: '51-100名',
            motivation: `${provider}ログインテスト`,
            role: 'member',
            status: 'approved',
            createdAt: new Date().toISOString(),
            profileImage: this.getProviderIcon(provider),
            provider: provider.toLowerCase(),
            providerData: {
                provider: provider.toLowerCase(),
                demoUser: true
            }
        };

        return {
            success: true,
            message: `${provider}でログインしました`,
            user: demoUser,
            isDemo: true
        };
    }

    // プロバイダーアイコンの取得
    getProviderIcon(provider) {
        const icons = {
            'Google': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%234285f4"/%3E%3Ctext x="50" y="50" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial,sans-serif" font-size="20"%3EG%3C/text%3E%3C/svg%3E',
            'LINE': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%2300c300"/%3E%3Ctext x="50" y="50" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial,sans-serif" font-size="20"%3EL%3C/text%3E%3C/svg%3E',
            'LinkedIn': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%230077b5"/%3E%3Ctext x="50" y="50" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial,sans-serif" font-size="20"%3Ein%3C/text%3E%3C/svg%3E'
        };
        return icons[provider] || icons['Google'];
    }

    // OAuth ユーザーの処理
    async processOAuthUser(userData) {
        // 既存ユーザーの確認
        const existingUser = auth.users.find(user => 
            user.email === userData.email || 
            (user.provider === userData.provider && user.providerData?.id === userData.providerData?.id)
        );

        if (existingUser) {
            // 既存ユーザーでログイン
            auth.currentUser = { ...existingUser, password: undefined };
            localStorage.setItem('currentUser', JSON.stringify(auth.currentUser));
            
            return {
                success: true,
                message: `${userData.provider}でログインしました`,
                user: auth.currentUser,
                isExistingUser: true
            };
        } else {
            // 新規ユーザー登録
            const newUser = {
                ...userData,
                role: 'member',
                status: 'approved', // ソーシャルログインは自動承認
                createdAt: new Date().toISOString()
            };

            auth.users.push(newUser);
            auth.saveUsers();
            auth.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            return {
                success: true,
                message: `${userData.provider}で新規登録・ログインしました`,
                user: newUser,
                isNewUser: true
            };
        }
    }

    // State パラメーター生成（セキュリティ用）
    generateState() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // OAuth コールバック処理
    handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const provider = this.detectProviderFromURL();
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
            console.error('OAuth エラー:', error);
            showNotification('ソーシャルログインでエラーが発生しました', 'error');
            window.location.href = 'login.html';
            return;
        }

        if (code) {
            this.exchangeCodeForToken(provider, code, state);
        }
    }

    // プロバイダーの検出
    detectProviderFromURL() {
        const path = window.location.pathname;
        if (path.includes('/auth/google/')) return 'google';
        if (path.includes('/auth/line/')) return 'line';
        if (path.includes('/auth/linkedin/')) return 'linkedin';
        return null;
    }

    // 認証コードをトークンと交換
    async exchangeCodeForToken(provider, code, state) {
        try {
            // 本来はサーバーサイドで処理
            // 現在は簡易実装
            const userData = await this.fetchUserProfile(provider, code);
            const result = await this.processOAuthUser(userData);
            
            showNotification(result.message, 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            console.error('トークン交換エラー:', error);
            showNotification('ログイン処理でエラーが発生しました', 'error');
            window.location.href = 'login.html';
        }
    }

    // ユーザープロフィールの取得
    async fetchUserProfile(provider, code) {
        // 本来はサーバーサイドでAPIコール
        // 現在は簡易実装
        return this.createDemoUser(provider.charAt(0).toUpperCase() + provider.slice(1), 
                                  `${provider}-user@example.com`).user;
    }
}

// グローバルインスタンス
const socialAuth = new SocialAuthManager();

// OAuth コールバック処理
if (window.location.search.includes('code=')) {
    socialAuth.handleOAuthCallback();
}

// グローバル関数として公開
window.loginWithGoogle = () => socialAuth.loginWithGoogle();
window.loginWithLINE = () => socialAuth.loginWithLINE();
window.loginWithLinkedIn = () => socialAuth.loginWithLinkedIn();