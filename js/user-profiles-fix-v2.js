/**
 * user_profilesテーブルのカラム名修正 v2
 * より安全なアプローチで実装
 */

(function() {
    'use strict';

    console.log('[UserProfilesFix v2] 初期化開始');

    // オリジナルのfetch関数を保存
    const originalFetch = window.fetch;

    // fetchをオーバーライドしてURLを修正
    window.fetch = function(...args) {
        let [url, options] = args;
        
        // Supabase APIのURLかチェック
        if (typeof url === 'string' && url.includes('supabase.co/rest/v1/')) {
            // user_profilesテーブルへのアクセス
            if (url.includes('/user_profiles')) {
                // user_id=eq.xxx を id=eq.xxx に変換
                if (url.includes('user_id=eq.')) {
                    const originalUrl = url;
                    url = url.replace(/user_id=eq\./g, 'id=eq.');
                    console.log('[UserProfilesFix v2] user_profiles URLを修正:', {
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
                            console.log('[UserProfilesFix v2] SELECT句を修正:', {
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
                
                // フィルタ内のuser_idをidに変換
                if (url.includes('filter=')) {
                    const originalUrl = url;
                    url = url.replace(/filter=([^&]*)/g, (match, filterPart) => {
                        if (filterPart.includes('user_id')) {
                            const newFilterPart = filterPart.replace(/user_id/g, 'id');
                            console.log('[UserProfilesFix v2] FILTER句を修正:', {
                                元: filterPart,
                                修正後: newFilterPart
                            });
                            return `filter=${newFilterPart}`;
                        }
                        return match;
                    });
                    if (originalUrl !== url) {
                        args[0] = url;
                    }
                }
            }
            
            // profilesテーブルへのアクセス
            if (url.includes('/profiles')) {
                if (url.includes('user_id=eq.')) {
                    const originalUrl = url;
                    url = url.replace(/user_id=eq\./g, 'id=eq.');
                    console.log('[UserProfilesFix v2] profiles URLを修正:', {
                        元: originalUrl,
                        修正後: url
                    });
                    args[0] = url;
                }
            }
        }

        // POSTリクエストのbody内のuser_idも修正
        if (options && options.body) {
            try {
                let bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
                let modified = false;
                
                // user_profilesまたはprofilesテーブルへのINSERT/UPDATE
                if (typeof url === 'string' && (url.includes('/user_profiles') || url.includes('/profiles'))) {
                    if (bodyData.user_id !== undefined) {
                        bodyData.id = bodyData.user_id;
                        delete bodyData.user_id;
                        modified = true;
                        console.log('[UserProfilesFix v2] POSTボディのuser_idをidに変換');
                    }
                }
                
                if (modified) {
                    options.body = JSON.stringify(bodyData);
                }
            } catch (e) {
                // JSONパースエラーは無視
            }
        }

        return originalFetch.apply(this, args);
    };

    // グローバル修正関数
    window.UserProfilesFixV2 = {
        // デバッグ情報表示
        debug: function() {
            console.log('[UserProfilesFix v2] 状態:');
            console.log('- fetch関数のオーバーライド: 有効');
            console.log('- 対象テーブル: user_profiles, profiles');
            console.log('- 修正内容: user_id -> id');
        },
        
        // テスト用: 直接URLを修正
        fixUrl: function(url) {
            if (typeof url === 'string' && url.includes('user_id=eq.')) {
                return url.replace(/user_id=eq\./g, 'id=eq.');
            }
            return url;
        }
    };

    console.log('[UserProfilesFix v2] 初期化完了 - fetch関数のオーバーライドのみを使用');
})();