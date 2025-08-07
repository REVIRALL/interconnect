/**
 * v_referral_historyビューのカラム名修正
 * created_at -> accepted_at への変換
 */

(function() {
    'use strict';

    console.log('[ReferralHistoryFix] v_referral_historyビューの修正を開始');

    // オリジナルのfetch関数を保存
    const originalFetch = window.fetch;

    // fetchをオーバーライドしてURLを修正
    window.fetch = function(...args) {
        let [url, options] = args;
        
        // v_referral_historyビューへのアクセスを検出
        if (typeof url === 'string' && url.includes('/v_referral_history')) {
            // order=created_at.desc を order=accepted_at.desc に変換
            if (url.includes('order=created_at')) {
                const originalUrl = url;
                url = url.replace(/order=created_at\.(desc|asc)/g, 'order=accepted_at.$1');
                console.log('[ReferralHistoryFix] v_referral_history URLを修正:', {
                    元: originalUrl,
                    修正後: url
                });
                args[0] = url;
            }
        }

        return originalFetch.apply(this, args);
    };

    console.log('[ReferralHistoryFix] 修正スクリプトの読み込み完了');
})();