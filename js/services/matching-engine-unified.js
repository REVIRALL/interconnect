/**
 * 統合マッチングエンジン
 * 本番環境とモック環境の両方に対応
 */

class MatchingEngineUnified {
    constructor() {
        this.difyService = null;
        this.supabase = window.supabase;
        this.initialized = false;
        this.mockMode = false;
        this.mockUsers = null;
        this.mockTranscripts = null;
    }

    /**
     * 初期化
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Supabaseの可用性をチェック
            const hasSupabase = this.supabase && this.supabase.auth;
            
            if (!hasSupabase) {
                console.warn('🔧 Supabaseが利用できません。モックモードで動作します。');
                this.mockMode = true;
                this.initializeMockData();
            } else {
                // 本番モードの初期化
                this.difyService = new DifyService(
                    await this.getConfig('DIFY_API_KEY'),
                    await this.getConfig('DIFY_WORKFLOW_ID')
                );
                console.log('✅ MatchingEngine initialized (Production mode)');
            }
            
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize MatchingEngine:', error);
            // エラー時はモックモードにフォールバック
            this.mockMode = true;
            this.initializeMockData();
        }
    }

    /**
     * モックデータの初期化
     */
    initializeMockData() {
        console.log('🔧 MatchingEngineMock initialized (Development mode)');
        this.mockUsers = this.generateMockUsers();
        this.mockTranscripts = this.generateMockTranscripts();
    }

    /**
     * 設定値取得
     */
    async getConfig(key) {
        if (this.mockMode) {
            const configs = {
                'DIFY_API_KEY': 'mock-dify-api-key',
                'DIFY_WORKFLOW_ID': 'mock-workflow-id'
            };
            return configs[key];
        }
        
        // 本番環境では適切な設定管理を実装
        const configs = {
            'DIFY_API_KEY': process.env.DIFY_API_KEY || 'your-dify-api-key',
            'DIFY_WORKFLOW_ID': process.env.DIFY_WORKFLOW_ID || 'your-workflow-id'
        };
        return configs[key];
    }

    /**
     * 2人のユーザー間のシナジーを計算
     */
    async calculateUserSynergy(userId1, userId2) {
        if (this.mockMode) {
            return this.calculateMockSynergy(userId1, userId2);
        }
        
        try {
            // 実際のユーザープロファイルを取得
            const [user1, user2] = await Promise.all([
                this.getUserProfile(userId1),
                this.getUserProfile(userId2)
            ]);

            if (!user1 || !user2) {
                throw new Error('ユーザープロファイルの取得に失敗しました');
            }

            // Difyワークフローを使用してシナジーを計算
            const synergyResult = await this.difyService.calculateSynergy(user1, user2);
            
            return {
                score: synergyResult.score,
                factors: synergyResult.factors,
                recommendations: synergyResult.recommendations,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('シナジー計算エラー:', error);
            throw error;
        }
    }

    /**
     * モックシナジー計算
     */
    calculateMockSynergy(userId1, userId2) {
        const user1 = this.mockUsers.find(u => u.id === userId1);
        const user2 = this.mockUsers.find(u => u.id === userId2);
        
        if (!user1 || !user2) {
            throw new Error('ユーザーが見つかりません');
        }

        // 業界マッチング
        const industryMatch = user1.profile.industry === user2.profile.industry ? 30 : 0;
        
        // スキル補完性
        const skillComplementarity = this.calculateSkillComplementarity(
            user1.profile.skills, 
            user2.profile.skills
        );
        
        // 関心の共通性
        const interestCommonality = this.calculateInterestCommonality(
            user1.profile.interests, 
            user2.profile.interests
        );
        
        const totalScore = Math.min(100, industryMatch + skillComplementarity + interestCommonality);
        
        return {
            score: totalScore,
            factors: {
                industryMatch,
                skillComplementarity,
                interestCommonality
            },
            recommendations: this.generateRecommendations(user1, user2, totalScore),
            timestamp: new Date()
        };
    }

    /**
     * スキル補完性の計算
     */
    calculateSkillComplementarity(skills1, skills2) {
        const uniqueSkills = new Set([...skills1, ...skills2]);
        const commonSkills = skills1.filter(skill => skills2.includes(skill));
        
        // 重複が少なく、総合スキルが多い方が良い
        const complementarity = (uniqueSkills.size - commonSkills.length) * 5;
        return Math.min(30, complementarity);
    }

    /**
     * 関心の共通性の計算
     */
    calculateInterestCommonality(interests1, interests2) {
        const commonInterests = interests1.filter(interest => interests2.includes(interest));
        return commonInterests.length * 20; // 共通の関心1つにつき20点
    }

    /**
     * 推薦事項の生成
     */
    generateRecommendations(user1, user2, score) {
        const recommendations = [];
        
        if (score >= 80) {
            recommendations.push('非常に高いシナジーが期待できます。ぜひ積極的な協業をお勧めします。');
        } else if (score >= 60) {
            recommendations.push('良好なシナジーが見込めます。具体的な協業案を検討してみてください。');
        } else if (score >= 40) {
            recommendations.push('部分的なシナジーがあります。特定の分野での連携を検討できます。');
        } else {
            recommendations.push('現時点では直接的なシナジーは限定的ですが、将来的な可能性を探ってみてください。');
        }
        
        return recommendations;
    }

    /**
     * ユーザープロファイル取得
     */
    async getUserProfile(userId) {
        if (this.mockMode) {
            return this.mockUsers.find(u => u.id === userId);
        }
        
        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('ユーザープロファイル取得エラー:', error);
            throw error;
        }
    }

    /**
     * モックユーザーデータ生成
     */
    generateMockUsers() {
        const industries = ['テクノロジー', 'マーケティング', 'ファイナンス', '製造業', 'コンサルティング'];
        const skills = ['AI', 'データ分析', 'プロジェクト管理', 'デザイン', '営業', 'マーケティング', '財務', '開発'];
        const interests = ['DX推進', 'サステナビリティ', 'グローバル展開', '新規事業', 'イノベーション'];
        
        const users = [];
        const firstNames = ['田中', '佐藤', '鈴木', '高橋', '伊藤', '渡辺', '山本', '中村', '小林', '加藤'];
        const givenNames = ['太郎', '花子', '一郎', '美香', '健太', '愛子', '大輔', '由美', '翔太', '麻衣'];
        
        for (let i = 0; i < 20; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
            
            users.push({
                id: `user-${i + 1}`,
                name: `${firstName}${givenName}`,
                email: `${firstName.toLowerCase()}${i}@example.com`,
                profile: {
                    display_name: `${firstName}${givenName}`,
                    bio: `${industries[i % industries.length]}業界で活躍中。${interests[i % interests.length]}に注力しています。`,
                    company: `株式会社${firstName}商事`,
                    position: ['CEO', 'CTO', 'マネージャー', 'ディレクター', 'コンサルタント'][i % 5],
                    industry: industries[i % industries.length],
                    interests: this.getRandomItems(interests, 2),
                    skills: this.getRandomItems(skills, 3),
                    avatar_url: `https://ui-avatars.com/api/?name=${firstName}${givenName}&background=0052cc&color=fff&rounded=true`
                }
            });
        }
        
        return users;
    }

    /**
     * モックトランスクリプトデータ生成
     */
    generateMockTranscripts() {
        // 実装省略 - 必要に応じて追加
        return [];
    }

    /**
     * 配列からランダムなアイテムを取得
     */
    getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

// グローバルインスタンス
window.matchingEngine = new MatchingEngineUnified();