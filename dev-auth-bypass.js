/**
 * 開発用: 認証バイパススクリプト
 * 本番環境では絶対に使用しないでください！
 */

// テストユーザーデータ
const testUser = {
    id: 'test-user-001',
    email: 'test@interconnect.com',
    name: 'テストユーザー',
    profile: {
        display_name: 'テストユーザー',
        bio: '開発テスト用アカウント',
        interests: ['AI', 'マッチング', 'ビジネス'],
        skills: ['プログラミング', 'マーケティング']
    }
};

// セッションに認証情報を設定
sessionStorage.setItem('isLoggedIn', 'true');
sessionStorage.setItem('userId', testUser.id);
sessionStorage.setItem('userEmail', testUser.email);
sessionStorage.setItem('userName', testUser.name);
sessionStorage.setItem('userRole', 'CEO'); // 開発用のロール
sessionStorage.setItem('userProfile', JSON.stringify(testUser.profile));

// Supabaseのモックユーザー
if (window.supabase) {
    window.supabase.auth.getUser = async () => ({
        data: { user: testUser },
        error: null
    });
    
    window.supabase.auth.getSession = async () => ({
        data: {
            session: {
                user: testUser,
                access_token: 'test-token',
                expires_at: Date.now() + 3600000
            }
        },
        error: null
    });
}

console.log('🔓 開発モード: 認証をバイパスしました');
console.log('テストユーザーID:', testUser.id);
console.log('⚠️  本番環境では使用しないでください！');