/**
 * グローバルuser_profilesテーブルカラム名修正
 * 全ページで使用可能な汎用修正スクリプト
 */

(function() {
    'use strict';

    console.log('[GlobalUserProfilesFix] グローバル修正スクリプト初期化');

    // 修正が必要なテーブルとカラムのマッピング
    const TABLE_COLUMN_MAPPING = {
        'user_profiles': {
            'user_id': 'id'  // user_profilesテーブルではuser_idではなくidを使用
        },
        'profiles': {
            'user_id': 'id'  // profilesテーブルも同様
        }
    };

    // Supabaseクライアントの修正を適用
    function applySupabaseFixes() {
        // 両方のクライアント名をチェック
        const clients = ['supabaseClient', 'supabase'];
        
        for (const clientName of clients) {
            if (window[clientName]) {
                patchSupabaseClient(window[clientName], clientName);
            }
        }
    }

    // Supabaseクライアントにパッチを適用
    function patchSupabaseClient(client, clientName) {
        if (client._patched) return; // 既にパッチ適用済み
        
        const originalFrom = client.from.bind(client);
        
        client.from = function(tableName) {
            const query = originalFrom(tableName);
            
            // 対象テーブルの場合のみパッチを適用
            if (TABLE_COLUMN_MAPPING[tableName]) {
                const columnMapping = TABLE_COLUMN_MAPPING[tableName];
                
                // eqメソッドをパッチ
                const originalEq = query.eq.bind(query);
                query.eq = function(column, value) {
                    const newColumn = columnMapping[column] || column;
                    if (column !== newColumn) {
                        console.log(`[GlobalUserProfilesFix] ${tableName}.${column} → ${tableName}.${newColumn}`);
                    }
                    return originalEq(newColumn, value);
                };
                
                // filterメソッドをパッチ
                const originalFilter = query.filter.bind(query);
                query.filter = function(column, operator, value) {
                    const newColumn = columnMapping[column] || column;
                    if (column !== newColumn) {
                        console.log(`[GlobalUserProfilesFix] filter: ${tableName}.${column} → ${tableName}.${newColumn}`);
                    }
                    return originalFilter(newColumn, operator, value);
                };
                
                // selectメソッドをパッチ
                const originalSelect = query.select.bind(query);
                query.select = function(columns = '*', options) {
                    if (typeof columns === 'string' && columns !== '*') {
                        let newColumns = columns;
                        for (const [oldCol, newCol] of Object.entries(columnMapping)) {
                            if (columns.includes(oldCol)) {
                                // 単語境界を考慮した置換
                                const regex = new RegExp(`\\b${oldCol}\\b`, 'g');
                                newColumns = newColumns.replace(regex, newCol);
                                console.log(`[GlobalUserProfilesFix] SELECT: ${oldCol} → ${newCol}`);
                            }
                        }
                        return originalSelect(newColumns, options);
                    }
                    return originalSelect(columns, options);
                };
                
                // orderメソッドをパッチ
                const originalOrder = query.order.bind(query);
                query.order = function(column, options) {
                    const newColumn = columnMapping[column] || column;
                    if (column !== newColumn) {
                        console.log(`[GlobalUserProfilesFix] order: ${tableName}.${column} → ${tableName}.${newColumn}`);
                    }
                    return originalOrder(newColumn, options);
                };
            }
            
            return query;
        };
        
        client._patched = true;
        console.log(`[GlobalUserProfilesFix] ${clientName}にパッチ適用完了`);
    }

    // URLのクエリパラメータを修正
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        let [url, options] = args;
        
        if (typeof url === 'string') {
            // Supabase REST APIのURLパターン
            const supabasePattern = /supabase\.co\/rest\/v1\/(user_profiles|profiles)/;
            
            if (supabasePattern.test(url)) {
                const match = url.match(supabasePattern);
                const tableName = match[1];
                
                if (TABLE_COLUMN_MAPPING[tableName]) {
                    const columnMapping = TABLE_COLUMN_MAPPING[tableName];
                    let modifiedUrl = url;
                    
                    // URLパラメータのuser_idをidに変換
                    for (const [oldCol, newCol] of Object.entries(columnMapping)) {
                        // eq演算子の場合
                        const eqPattern = new RegExp(`${oldCol}=eq\\.`, 'g');
                        if (eqPattern.test(modifiedUrl)) {
                            modifiedUrl = modifiedUrl.replace(eqPattern, `${newCol}=eq.`);
                            console.log(`[GlobalUserProfilesFix] URL修正: ${oldCol}=eq. → ${newCol}=eq.`);
                        }
                        
                        // その他の演算子
                        const patterns = ['neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in'];
                        for (const op of patterns) {
                            const pattern = new RegExp(`${oldCol}=${op}\\.`, 'g');
                            if (pattern.test(modifiedUrl)) {
                                modifiedUrl = modifiedUrl.replace(pattern, `${newCol}=${op}.`);
                                console.log(`[GlobalUserProfilesFix] URL修正: ${oldCol}=${op}. → ${newCol}=${op}.`);
                            }
                        }
                        
                        // select句の修正
                        if (modifiedUrl.includes('select=')) {
                            modifiedUrl = modifiedUrl.replace(/select=([^&]*)/, (match, selectClause) => {
                                if (selectClause.includes(oldCol)) {
                                    const regex = new RegExp(`\\b${oldCol}\\b`, 'g');
                                    const newSelectClause = selectClause.replace(regex, newCol);
                                    console.log(`[GlobalUserProfilesFix] SELECT修正: ${oldCol} → ${newCol}`);
                                    return `select=${newSelectClause}`;
                                }
                                return match;
                            });
                        }
                        
                        // order句の修正
                        if (modifiedUrl.includes('order=')) {
                            modifiedUrl = modifiedUrl.replace(/order=([^&]*)/, (match, orderClause) => {
                                if (orderClause.includes(oldCol)) {
                                    const regex = new RegExp(`\\b${oldCol}\\b`, 'g');
                                    const newOrderClause = orderClause.replace(regex, newCol);
                                    console.log(`[GlobalUserProfilesFix] ORDER修正: ${oldCol} → ${newCol}`);
                                    return `order=${newOrderClause}`;
                                }
                                return match;
                            });
                        }
                    }
                    
                    if (modifiedUrl !== url) {
                        args[0] = modifiedUrl;
                    }
                }
            }
        }
        
        return originalFetch.apply(this, args);
    };

    // 定期的にSupabaseクライアントをチェック
    function checkAndPatchClients() {
        applySupabaseFixes();
        
        // まだパッチが適用されていない場合は再試行
        if (!window.supabaseClient?._patched && !window.supabase?._patched) {
            setTimeout(checkAndPatchClients, 500);
        }
    }

    // 初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndPatchClients);
    } else {
        checkAndPatchClients();
    }

    // デバッグ用のグローバル関数
    window.GlobalUserProfilesFix = {
        status: function() {
            console.log('[GlobalUserProfilesFix] 修正状態:');
            console.log('- fetch: パッチ適用済み');
            console.log('- supabaseClient:', window.supabaseClient?._patched ? 'パッチ適用済み' : '未適用');
            console.log('- supabase:', window.supabase?._patched ? 'パッチ適用済み' : '未適用');
        },
        
        testQuery: async function() {
            const client = window.supabaseClient || window.supabase;
            if (!client) {
                console.error('Supabaseクライアントが見つかりません');
                return;
            }
            
            try {
                // テストクエリ（user_idを使用してもidに自動変換される）
                const { data, error } = await client
                    .from('user_profiles')
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.error('クエリエラー:', error);
                } else {
                    console.log('テストクエリ成功:', data);
                }
            } catch (e) {
                console.error('実行エラー:', e);
            }
        }
    };

    console.log('[GlobalUserProfilesFix] グローバル修正スクリプト準備完了');
})();