// Supabase設定とセットアップ
class SupabaseSetup {
    constructor() {
        // 環境変数から設定を取得
        this.supabaseUrl = this.getEnvVar('SUPABASE_URL', 'https://your-project.supabase.co');
        this.supabaseKey = this.getEnvVar('SUPABASE_ANON_KEY', 'your-anon-key');
        
        console.log('🚀 Supabase Setup 開始');
        console.log('設定状況:', {
            url: this.supabaseUrl !== 'https://your-project.supabase.co' ? '✅ 設定済み' : '❌ 未設定',
            key: this.supabaseKey !== 'your-anon-key' ? '✅ 設定済み' : '❌ 未設定'
        });
        
        this.options = {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                storage: window.localStorage,
                storageKey: 'interconnect-auth'
            },
            realtime: {
                params: {
                    eventsPerSecond: 10
                }
            }
        };
        
        this.useLocalStorageMode = false;
        this.supabase = null;
        
        this.initializeSupabase();
    }
    
    // 環境変数取得
    getEnvVar(name, defaultValue) {
        // 1. window.env から取得（動的設定用）
        if (window.env && window.env[name]) {
            return window.env[name];
        }
        
        // 2. meta タグから取得
        const metaElement = document.querySelector(`meta[name="env-${name.toLowerCase()}"]`);
        if (metaElement) {
            return metaElement.getAttribute('content');
        }
        
        // 3. localStorage から取得（テスト用）
        const storedValue = localStorage.getItem(`env_${name}`);
        if (storedValue) {
            return storedValue;
        }
        
        return defaultValue;
    }
    
    async initializeSupabase() {
        // 設定の検証
        if (!this.validateConfig()) {
            console.warn('⚠️ Supabase設定が不完全です。LocalStorageモードで動作します。');
            this.useLocalStorageMode = true;
            this.showSetupInstructions();
            return;
        }
        
        try {
            // Supabase SDK の動的読み込み
            await this.loadSupabaseSDK();
            
            // Supabase クライアントの初期化
            this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey, this.options);
            
            // 接続テスト
            const connectionTest = await this.testConnection();
            if (connectionTest.success) {
                console.log('✅ Supabase接続成功');
                this.useLocalStorageMode = false;
                
                // 認証状態の監視開始
                this.setupAuthListener();
                
                // データベース状態確認
                this.checkDatabaseTables();
            } else {
                throw new Error('接続テスト失敗: ' + connectionTest.error);
            }
            
        } catch (error) {
            console.error('❌ Supabase初期化エラー:', error);
            console.warn('LocalStorageモードに切り替えます。');
            this.useLocalStorageMode = true;
            this.showSetupInstructions();
        }
    }
    
    // Supabase SDK の動的読み込み
    async loadSupabaseSDK() {
        if (window.supabase) {
            return; // 既に読み込み済み
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                console.log('📦 Supabase SDK読み込み完了');
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Supabase SDK読み込み失敗'));
            };
            document.head.appendChild(script);
        });
    }
    
    // 設定の検証
    validateConfig() {
        return this.supabaseUrl !== 'https://your-project.supabase.co' && 
               this.supabaseKey !== 'your-anon-key' &&
               this.supabaseUrl && this.supabaseKey;
    }
    
    // 接続テスト
    async testConnection() {
        if (!this.supabase) {
            return { success: false, error: 'Supabase client not initialized' };
        }
        
        try {
            // 軽量なクエリでテスト
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('id')
                .limit(1);
            
            // テーブルが存在しなくても接続は成功とみなす
            if (error && error.message.includes('relation "user_profiles" does not exist')) {
                console.log('🔄 データベーステーブルが未作成です。setup-database.sql を実行してください。');
                return { success: true, needsSetup: true };
            }
            
            if (error) {
                throw error;
            }
            
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 認証状態の監視
    setupAuthListener() {
        if (!this.supabase) return;
        
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Auth状態変更:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN' && session) {
                this.syncSupabaseUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                if (window.auth) {
                    window.auth.currentUser = null;
                    localStorage.removeItem('currentUser');
                }
            }
        });
    }
    
    // Supabaseユーザーとローカル認証の同期
    async syncSupabaseUser(supabaseUser) {
        try {
            if (window.auth) {
                let existingUser = window.auth.users.find(user => user.email === supabaseUser.email);
                
                if (!existingUser) {
                    // 新規ユーザーをローカルにも作成
                    const newUser = {
                        id: supabaseUser.id,
                        email: supabaseUser.email,
                        firstName: supabaseUser.user_metadata?.first_name || 'Supabase',
                        lastName: supabaseUser.user_metadata?.last_name || 'ユーザー',
                        company: supabaseUser.user_metadata?.company || 'Supabase経由',
                        position: supabaseUser.user_metadata?.position || 'メンバー',
                        industry: 'IT・テクノロジー',
                        role: 'member',
                        status: 'approved',
                        createdAt: supabaseUser.created_at,
                        provider: supabaseUser.app_metadata?.provider || 'email',
                        profileImage: supabaseUser.user_metadata?.avatar_url || null
                    };
                    
                    window.auth.users.push(newUser);
                    window.auth.saveUsers();
                    existingUser = newUser;
                }
                
                // 現在のユーザーとして設定
                window.auth.currentUser = existingUser;
                localStorage.setItem('currentUser', JSON.stringify(existingUser));
                
                console.log('👤 ユーザー同期完了:', existingUser.email);
            }
        } catch (error) {
            console.error('❌ ユーザー同期エラー:', error);
        }
    }
    
    // データベーステーブルの状態確認
    async checkDatabaseTables() {
        if (!this.supabase) return;
        
        const tables = [
            'user_profiles',
            'invite_links', 
            'invite_history',
            'user_points',
            'point_transactions',
            'events',
            'event_participants',
            'messages',
            'conversations',
            'business_opportunities'
        ];
        
        console.log('📊 データベーステーブル状態確認中...');
        
        const tableStatus = {};
        
        for (const table of tables) {
            try {
                const { data, error } = await this.supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    if (error.message.includes('does not exist')) {
                        tableStatus[table] = '❌ 未作成';
                    } else {
                        tableStatus[table] = '⚠️ エラー: ' + error.message;
                    }
                } else {
                    tableStatus[table] = '✅ 正常';
                }
            } catch (err) {
                tableStatus[table] = '❌ アクセス不可';
            }
        }
        
        console.table(tableStatus);
        
        // 未作成テーブルがある場合の案内
        const missingTables = Object.entries(tableStatus)
            .filter(([table, status]) => status.includes('未作成'))
            .map(([table]) => table);
            
        if (missingTables.length > 0) {
            console.warn('⚠️ 以下のテーブルが未作成です:', missingTables);
            console.log('💡 supabase-schema.sql を実行してテーブルを作成してください。');
        }
    }
    
    // セットアップ手順の表示
    showSetupInstructions() {
        if (this.supabaseUrl === 'https://your-project.supabase.co') {
            console.log(`
🚀 Supabase セットアップ手順:

1. Supabase プロジェクト作成
   - https://supabase.com でプロジェクト作成
   - プロジェクトURL と Anon Key を取得

2. 設定方法（いずれかを選択）:
   
   方法A: HTML meta タグ
   <meta name="env-supabase_url" content="あなたのURL">
   <meta name="env-supabase_anon_key" content="あなたのキー">
   
   方法B: JavaScript設定
   window.env = {
       SUPABASE_URL: 'あなたのURL',
       SUPABASE_ANON_KEY: 'あなたのキー'
   };
   
   方法C: テスト用（コンソールで実行）
   localStorage.setItem('env_SUPABASE_URL', 'あなたのURL');
   localStorage.setItem('env_SUPABASE_ANON_KEY', 'あなたのキー');

3. データベースセットアップ
   - supabase-schema.sql を実行
   - テーブルとセキュリティポリシーを作成

詳細な手順は SUPABASE_SETUP.md を参照してください。
            `);
        }
    }
    
    // 接続情報の取得
    getConnectionInfo() {
        return {
            mode: this.useLocalStorageMode ? 'localStorage' : 'supabase',
            url: this.supabaseUrl,
            configured: this.validateConfig(),
            connected: !this.useLocalStorageMode,
            client: this.supabase ? 'initialized' : 'not initialized'
        };
    }
    
    // ダッシュボード表示用の簡易情報
    getStatusForDashboard() {
        if (this.useLocalStorageMode) {
            return {
                status: 'localStorage',
                message: 'ローカルストレージモード',
                color: 'orange',
                action: 'Supabase設定が必要'
            };
        } else {
            return {
                status: 'supabase',
                message: 'Supabase接続済み',
                color: 'green',
                action: 'データ同期中'
            };
        }
    }
}

// グローバルインスタンス
const supabaseSetup = new SupabaseSetup();

// ダッシュボードからアクセス可能にする
window.supabaseSetup = supabaseSetup;

// 接続状態をグローバルで確認可能にする
window.checkSupabaseStatus = () => {
    const info = supabaseSetup.getConnectionInfo();
    console.table(info);
    return info;
};

// テスト用のクイックセットアップ関数
window.quickSupabaseSetup = (url, key) => {
    if (url && key) {
        localStorage.setItem('env_SUPABASE_URL', url);
        localStorage.setItem('env_SUPABASE_ANON_KEY', key);
        console.log('💾 Supabase設定を保存しました。ページを再読み込みしてください。');
        setTimeout(() => window.location.reload(), 1000);
    } else {
        console.log('使用方法: quickSupabaseSetup("YOUR_URL", "YOUR_KEY")');
    }
};