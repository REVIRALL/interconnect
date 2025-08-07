/**
 * user_profilesテーブルのカラム名修正
 * user_id -> id への統一対応
 */

(function() {
    'use strict';

    console.log('[UserProfilesFix] user_profilesテーブルのカラム名修正を開始');

    // オリジナルのfetch関数を保存
    const originalFetch = window.fetch;

    // fetchをオーバーライドしてURLを修正
    window.fetch = function(...args) {
        let [url, options] = args;
        
        // Supabase APIのURLかチェック
        if (typeof url === 'string' && url.includes('supabase.co/rest/v1/user_profiles')) {
            // user_id=eq.xxx を id=eq.xxx に変換
            if (url.includes('user_id=eq.')) {
                const originalUrl = url;
                url = url.replace(/user_id=eq\./g, 'id=eq.');
                console.log('[UserProfilesFix] URLを修正:', {
                    元: originalUrl,
                    修正後: url
                });
                args[0] = url;
            }
            
            // select文内のuser_idをidに変換
            if (url.includes('select=')) {
                const originalUrl = url;
                url = url.replace(/select=([^&]*)/g, (match, selectPart) => {
                    if (selectPart.includes('user_id')) {
                        const newSelectPart = selectPart.replace(/user_id/g, 'id');
                        console.log('[UserProfilesFix] SELECT句を修正:', {
                            元: selectPart,
                            修正後: newSelectPart
                        });
                        return `select=${newSelectPart}`;
                    }
                    return match;
                });
                if (originalUrl !== url) {
                    args[0] = url;
                }
            }
        }

        // profilesテーブルへのアクセスも同様に修正
        if (typeof url === 'string' && url.includes('supabase.co/rest/v1/profiles')) {
            if (url.includes('user_id=eq.')) {
                const originalUrl = url;
                url = url.replace(/user_id=eq\./g, 'id=eq.');
                console.log('[UserProfilesFix] profiles URLを修正:', {
                    元: originalUrl,
                    修正後: url
                });
                args[0] = url;
            }
        }

        return originalFetch.apply(this, args);
    };

    // Supabaseクライアントのラッパー関数
    function wrapSupabaseQuery() {
        if (!window.supabaseClient && !window.supabase) {
            console.log('[UserProfilesFix] Supabaseクライアントがまだ準備できていません');
            setTimeout(wrapSupabaseQuery, 100);
            return;
        }

        const client = window.supabaseClient || window.supabase;
        
        // fromメソッドをラップ
        const originalFrom = client.from.bind(client);
        
        client.from = function(table) {
            const query = originalFrom(table);
            
            // user_profilesまたはprofilesテーブルの場合
            if (table === 'user_profiles' || table === 'profiles') {
                // eqメソッドをラップ
                const originalEq = query.eq.bind(query);
                query.eq = function(column, value) {
                    // user_idカラムをidに変換
                    if (column === 'user_id') {
                        console.log(`[UserProfilesFix] ${table}.user_id を ${table}.id に変換`);
                        return originalEq('id', value);
                    }
                    return originalEq(column, value);
                };

                // selectメソッドをラップ
                const originalSelect = query.select.bind(query);
                query.select = function(columns = '*', options) {
                    // columnsがstring型の場合、user_idをidに置換
                    if (typeof columns === 'string' && columns.includes('user_id')) {
                        const newColumns = columns.replace(/user_id/g, 'id');
                        console.log(`[UserProfilesFix] SELECT句のuser_idをidに変換:`, {
                            元: columns,
                            修正後: newColumns
                        });
                        return originalSelect(newColumns, options);
                    }
                    return originalSelect(columns, options);
                };

                // filterメソッドをラップ
                const originalFilter = query.filter.bind(query);
                query.filter = function(column, operator, value) {
                    if (column === 'user_id') {
                        console.log(`[UserProfilesFix] filter: user_id を id に変換`);
                        return originalFilter('id', operator, value);
                    }
                    return originalFilter(column, operator, value);
                };
            }
            
            return query;
        };

        console.log('[UserProfilesFix] Supabaseクライアントのラッピング完了');
    }

    // 初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wrapSupabaseQuery);
    } else {
        wrapSupabaseQuery();
    }

    // グローバル修正関数（デバッグ用）
    window.UserProfilesFix = {
        // user_profilesテーブルのカラム情報を表示
        showColumns: async function() {
            console.log('[UserProfilesFix] user_profilesテーブルのカラム構造:');
            console.log('プライマリキー: id (uuid)');
            console.log('その他のカラム: email, name, company, position, phone, etc.');
            console.log('注意: user_idカラムは存在しません。idを使用してください。');
        },
        
        // テスト用クエリ
        testQuery: async function(userId) {
            if (!window.supabaseClient && !window.supabase) {
                console.error('[UserProfilesFix] Supabaseクライアントが利用できません');
                return;
            }
            
            const client = window.supabaseClient || window.supabase;
            
            try {
                // 正しいクエリ（idを使用）
                const { data, error } = await client
                    .from('user_profiles')
                    .select('*')
                    .eq('id', userId);
                
                if (error) {
                    console.error('[UserProfilesFix] クエリエラー:', error);
                } else {
                    console.log('[UserProfilesFix] クエリ成功:', data);
                }
            } catch (e) {
                console.error('[UserProfilesFix] 実行エラー:', e);
            }
        }
    };

    console.log('[UserProfilesFix] 修正スクリプトの読み込み完了');
})();