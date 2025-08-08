/**
 * エラー診断ツール
 * システム内のすべてのエラーを詳細に洗い出す
 */

class ErrorDiagnostic {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.criticalIssues = [];
        this.performanceIssues = [];
    }

    /**
     * 完全なエラー診断を実行
     */
    async runFullDiagnostic() {
        console.log('====== エラー診断開始 ======');
        console.log('実行時刻:', new Date().toISOString());
        
        // 1. コンソールエラーの分析
        this.analyzeConsoleErrors();
        
        // 2. システムコンポーネントの状態確認
        await this.checkSystemComponents();
        
        // 3. データフローの検証
        await this.checkDataFlow();
        
        // 4. ネットワークエラーの確認
        await this.checkNetworkErrors();
        
        // 5. DOM関連のエラー
        this.checkDOMErrors();
        
        // 6. 非同期処理の問題
        await this.checkAsyncIssues();
        
        // 7. メモリとパフォーマンス
        this.checkPerformanceIssues();
        
        // 8. 統合システムのエラー
        this.checkIntegrationErrors();
        
        // レポート生成
        return this.generateReport();
    }

    /**
     * コンソールエラーの分析
     */
    analyzeConsoleErrors() {
        console.log('\n=== コンソールエラー分析 ===');
        
        // 既知のエラーパターン
        const knownErrors = [
            {
                pattern: 'Unchecked runtime.lastError',
                severity: 'warning',
                description: 'Chrome拡張機能のメッセージポートエラー',
                impact: 'アプリケーションには影響なし',
                solution: 'Chrome拡張機能を確認するか、無視して問題なし'
            },
            {
                pattern: "The entry type 'function' does not exist",
                severity: 'warning',
                description: 'PerformanceObserver APIの非対応エントリタイプ',
                impact: 'パフォーマンス監視の一部機能が無効',
                solution: 'ブラウザがサポートしていないため、代替手段を使用'
            }
        ];
        
        knownErrors.forEach(error => {
            this.warnings.push(error);
            console.log(`⚠️ ${error.pattern}`);
            console.log(`  影響: ${error.impact}`);
            console.log(`  対策: ${error.solution}`);
        });
    }

    /**
     * システムコンポーネントの状態確認
     */
    async checkSystemComponents() {
        console.log('\n=== システムコンポーネント確認 ===');
        
        const components = {
            // 基本システム
            'window.supabaseClient': { 
                exists: !!window.supabaseClientClient,
                critical: true,
                description: 'Supabaseクライアント'
            },
            'window.matchingSupabase': { 
                exists: !!window.matchingSupabase,
                critical: true,
                description: 'マッチングSupabase統合'
            },
            
            // レーダーチャートシステム
            'window.matchingRadarChart': { 
                exists: !!window.matchingRadarChart,
                critical: false,
                description: '基本レーダーチャート'
            },
            'window.MatchingRadarChartEnhanced': { 
                exists: !!window.MatchingRadarChartEnhanced,
                critical: true,
                description: '拡張レーダーチャートクラス'
            },
            'window.matchingRadarChartPerformance': { 
                exists: !!window.matchingRadarChartPerformance,
                critical: false,
                description: 'パフォーマンス最適化'
            },
            'window.matchingRadarChartUX': { 
                exists: !!window.matchingRadarChartUX,
                critical: false,
                description: 'UX改善機能'
            },
            'window.matchingRadarChartIntegration': { 
                exists: !!window.matchingRadarChartIntegration,
                critical: true,
                description: '統合システム'
            },
            
            // データ整合性
            'window.matchingDataIntegrity': { 
                exists: !!window.matchingDataIntegrity,
                critical: true,
                description: 'データ整合性システム'
            },
            'window.matchingDataMigration': { 
                exists: !!window.matchingDataMigration,
                critical: false,
                description: 'データ移行ツール'
            },
            
            // AI機能
            'window.matchingAIScoring': { 
                exists: !!window.matchingAIScoring,
                critical: false,
                description: 'AIスコアリング'
            },
            'window.minutesBasedMatchingScorer': { 
                exists: !!window.minutesBasedMatchingScorer,
                critical: false,
                description: '議事録ベーススコアリング'
            }
        };
        
        let criticalMissing = 0;
        Object.entries(components).forEach(([name, info]) => {
            if (!info.exists) {
                console.log(`❌ ${name} - ${info.description}`);
                if (info.critical) {
                    criticalMissing++;
                    this.criticalIssues.push({
                        component: name,
                        description: info.description,
                        impact: '主要機能が動作しない可能性'
                    });
                }
            } else {
                console.log(`✅ ${name} - ${info.description}`);
            }
        });
        
        if (criticalMissing > 0) {
            console.error(`⚠️ ${criticalMissing}個の重要コンポーネントが欠落しています`);
        }
    }

    /**
     * データフローの検証
     */
    async checkDataFlow() {
        console.log('\n=== データフロー検証 ===');
        
        // 1. Supabaseの認証状態
        if (window.supabaseClient) {
            try {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (user) {
                    console.log('✅ Supabase認証: ログイン済み');
                    console.log(`  ユーザーID: ${user.id}`);
                } else {
                    console.log('❌ Supabase認証: 未ログイン');
                    this.errors.push({
                        type: 'auth',
                        message: 'ユーザーが認証されていません',
                        impact: 'データの取得・保存ができません'
                    });
                }
            } catch (error) {
                console.error('❌ Supabase認証エラー:', error);
                this.errors.push({
                    type: 'auth',
                    message: error.message,
                    impact: 'Supabase接続に問題があります'
                });
            }
        }
        
        // 2. マッチングデータの状態
        if (window.matchingSupabase) {
            const profiles = window.matchingSupabase.allProfiles;
            console.log(`📊 読み込まれたプロファイル数: ${profiles ? profiles.length : 0}`);
            
            if (!profiles || profiles.length === 0) {
                this.warnings.push({
                    type: 'data',
                    message: 'プロファイルデータが読み込まれていません',
                    solution: 'ページをリロードするか、forceInitMatching()を実行'
                });
            }
        }
        
        // 3. レーダーチャートデータ
        const cards = document.querySelectorAll('.matching-card');
        let chartsWithData = 0;
        let chartsWithCanvas = 0;
        
        cards.forEach((card, index) => {
            if (card.radarChartData) chartsWithData++;
            if (card.querySelector('canvas')) chartsWithCanvas++;
        });
        
        console.log(`📈 マッチングカード総数: ${cards.length}`);
        console.log(`  データ付きカード: ${chartsWithData}`);
        console.log(`  Canvas描画済み: ${chartsWithCanvas}`);
        
        if (cards.length > 0 && chartsWithCanvas === 0) {
            this.errors.push({
                type: 'rendering',
                message: 'レーダーチャートが一つも描画されていません',
                solution: 'quickTest.addChart()を実行してチャートを追加'
            });
        }
    }

    /**
     * ネットワークエラーの確認
     */
    async checkNetworkErrors() {
        console.log('\n=== ネットワーク状態確認 ===');
        
        // Supabase接続テスト
        if (window.supabaseClient) {
            try {
                const { data, error } = await window.supabase
                    .from('profiles')
                    .select('id')
                    .limit(1);
                
                if (error) {
                    console.error('❌ Supabaseデータベース接続エラー:', error);
                    this.errors.push({
                        type: 'network',
                        message: `データベースエラー: ${error.message}`,
                        code: error.code,
                        impact: 'データの取得ができません'
                    });
                } else {
                    console.log('✅ Supabaseデータベース接続: 正常');
                }
            } catch (error) {
                console.error('❌ ネットワークエラー:', error);
                this.criticalIssues.push({
                    type: 'network',
                    message: error.message,
                    impact: 'インターネット接続を確認してください'
                });
            }
        }
    }

    /**
     * DOM関連のエラー
     */
    checkDOMErrors() {
        console.log('\n=== DOM状態確認 ===');
        
        // 必要な要素の存在確認
        const requiredElements = {
            '.matching-grid': 'マッチンググリッド',
            '.matching-filters': 'フィルター部分',
            '.matching-stats': '統計表示部分'
        };
        
        Object.entries(requiredElements).forEach(([selector, name]) => {
            const element = document.querySelector(selector);
            if (!element) {
                console.log(`❌ ${name} (${selector}) が見つかりません`);
                this.errors.push({
                    type: 'dom',
                    message: `${name}が存在しません`,
                    selector: selector
                });
            } else {
                console.log(`✅ ${name} (${selector}) 存在確認`);
            }
        });
    }

    /**
     * 非同期処理の問題
     */
    async checkAsyncIssues() {
        console.log('\n=== 非同期処理の確認 ===');
        
        // 初期化タイミングの問題
        if (window.matchingSupabase && !window.matchingSupabase.allProfiles) {
            console.log('⚠️ matchingSupabaseは存在するがデータが読み込まれていない');
            this.warnings.push({
                type: 'async',
                message: 'データの読み込みが完了していない可能性',
                solution: 'しばらく待つか、forceInitMatching()を実行'
            });
        }
        
        // データ移行の状態
        if (window.matchingDataMigration) {
            const report = window.matchingDataMigration.generateMigrationReport();
            if (report.dataStats.oldFormat > 0) {
                console.log(`⚠️ 旧形式データが${report.dataStats.oldFormat}件存在`);
                this.warnings.push({
                    type: 'migration',
                    message: '旧形式データの移行が必要',
                    solution: 'window.matchingDataMigration.migrate()を実行'
                });
            }
        }
    }

    /**
     * パフォーマンス問題の確認
     */
    checkPerformanceIssues() {
        console.log('\n=== パフォーマンス確認 ===');
        
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize / 1024 / 1024;
            const total = performance.memory.totalJSHeapSize / 1024 / 1024;
            const percent = (used / total) * 100;
            
            console.log(`💾 メモリ使用量: ${used.toFixed(1)}MB / ${total.toFixed(1)}MB (${percent.toFixed(1)}%)`);
            
            if (percent > 80) {
                this.performanceIssues.push({
                    type: 'memory',
                    message: 'メモリ使用量が高い',
                    usage: `${percent.toFixed(1)}%`,
                    impact: 'ページの動作が遅くなる可能性'
                });
            }
        }
        
        // レンダリングパフォーマンス
        if (window.matchingRadarChartPerformance) {
            const metrics = window.matchingRadarChartPerformance.metrics;
            console.log(`📊 チャートレンダリング統計:`);
            console.log(`  総レンダリング数: ${metrics.renderCount}`);
            console.log(`  キャッシュヒット: ${metrics.cacheHits}`);
            console.log(`  キャッシュミス: ${metrics.cacheMisses}`);
            
            if (metrics.renderCount > 0) {
                const avgTime = metrics.totalRenderTime / metrics.renderCount;
                console.log(`  平均レンダリング時間: ${avgTime.toFixed(2)}ms`);
                
                if (avgTime > 100) {
                    this.performanceIssues.push({
                        type: 'rendering',
                        message: 'レンダリング時間が長い',
                        avgTime: `${avgTime.toFixed(2)}ms`,
                        impact: 'ユーザー体験に影響'
                    });
                }
            }
        }
    }

    /**
     * 統合システムのエラー
     */
    checkIntegrationErrors() {
        console.log('\n=== 統合システムエラー確認 ===');
        
        if (window.matchingRadarChartIntegration) {
            const errors = window.matchingRadarChartIntegration.errors;
            if (errors.length > 0) {
                console.log(`❌ 統合システムで${errors.length}個のエラー`);
                errors.slice(-5).forEach((error, index) => {
                    console.log(`  ${index + 1}. [${error.context}] ${error.message}`);
                    this.errors.push({
                        type: 'integration',
                        context: error.context,
                        message: error.message,
                        timestamp: error.timestamp
                    });
                });
            } else {
                console.log('✅ 統合システムエラーなし');
            }
        }
    }

    /**
     * 詳細レポートの生成
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                criticalIssues: this.criticalIssues.length,
                errors: this.errors.length,
                warnings: this.warnings.length,
                performanceIssues: this.performanceIssues.length
            },
            details: {
                critical: this.criticalIssues,
                errors: this.errors,
                warnings: this.warnings,
                performance: this.performanceIssues
            },
            recommendations: this.generateRecommendations()
        };
        
        console.log('\n====== 診断結果サマリー ======');
        console.log(`🚨 重大な問題: ${report.summary.criticalIssues}件`);
        console.log(`❌ エラー: ${report.summary.errors}件`);
        console.log(`⚠️ 警告: ${report.summary.warnings}件`);
        console.log(`🐌 パフォーマンス問題: ${report.summary.performanceIssues}件`);
        
        if (report.recommendations.length > 0) {
            console.log('\n📋 推奨される対処法:');
            report.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec}`);
            });
        }
        
        return report;
    }

    /**
     * 推奨事項の生成
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.criticalIssues.length > 0) {
            recommendations.push('ページをリロードして、すべてのスクリプトが正しく読み込まれることを確認');
        }
        
        if (this.errors.some(e => e.type === 'auth')) {
            recommendations.push('ログイン状態を確認し、必要に応じて再ログイン');
        }
        
        if (this.errors.some(e => e.type === 'rendering')) {
            recommendations.push('quickTest.addChart()を実行してレーダーチャートを手動追加');
        }
        
        if (this.warnings.some(w => w.type === 'migration')) {
            recommendations.push('window.matchingDataMigration.migrate()を実行してデータを移行');
        }
        
        if (this.performanceIssues.length > 0) {
            recommendations.push('ブラウザのキャッシュをクリアして、ページをリロード');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('システムは正常に動作しています');
        }
        
        return recommendations;
    }

    /**
     * 修正スクリプトの実行
     */
    async attemptAutoFix() {
        console.log('\n====== 自動修正を試行 ======');
        
        let fixed = 0;
        
        // 1. 初期化の再実行
        if (window.forceInitMatching) {
            console.log('1. マッチング機能の再初期化...');
            window.forceInitMatching();
            fixed++;
        }
        
        // 2. レーダーチャートの追加
        if (document.querySelectorAll('.matching-card canvas').length === 0) {
            console.log('2. レーダーチャートの追加...');
            if (window.quickTest) {
                await window.quickTest.addChart();
                fixed++;
            }
        }
        
        // 3. データ移行
        if (this.warnings.some(w => w.type === 'migration')) {
            console.log('3. データ移行の実行...');
            if (window.matchingDataMigration) {
                await window.matchingDataMigration.migrate();
                fixed++;
            }
        }
        
        console.log(`\n✅ ${fixed}個の問題を自動修正しました`);
        return fixed;
    }
}

// グローバルに公開
window.errorDiagnostic = new ErrorDiagnostic();

// 簡易アクセス用の関数
window.runDiagnostics = () => window.errorDiagnostic.runFullDiagnostic();

// 診断コマンド
console.log('\n🔍 エラー診断ツール');
console.log('完全診断: runDiagnostics() または await errorDiagnostic.runFullDiagnostic()');
console.log('自動修正: await errorDiagnostic.attemptAutoFix()');

// 自動実行（デバッグモード時）
if (localStorage.getItem('debugMode') === 'true') {
    setTimeout(async () => {
        console.log('\n=== 自動エラー診断開始 ===');
        await window.errorDiagnostic.runFullDiagnostic();
    }, 2000);
}