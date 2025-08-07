/**
 * v_referral_historyビューのカラム名修正
 * created_at -> sent_at への変換
 * 
 * v_referral_historyビューには以下のカラムが存在:
 * - sent_at: 招待送信日時
 * - accepted_at: 招待受諾日時
 * created_atカラムは存在しない
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
            // order=created_at を order=sent_at に変換
            if (url.includes('order=created_at')) {
                const originalUrl = url;
                url = url.replace(/order=created_at\.(desc|asc)/g, 'order=sent_at.$1');
                console.log('[ReferralHistoryFix] v_referral_history URLを修正 (created_at -> sent_at):', {
                    元: originalUrl,
                    修正後: url
                });
                args[0] = url;
            }
            
            // order=accepted_at も念のため処理（データが存在しない場合があるため）
            // sent_atの方が確実に存在する
            if (url.includes('order=accepted_at') && url.includes('v_referral_history')) {
                // accepted_atがnullの場合があるので、sent_atを優先する方が安全
                console.log('[ReferralHistoryFix] v_referral_history: accepted_atでのソートを検出（そのまま使用）');
            }
        }

        return originalFetch.apply(this, args);
    };

    console.log('[ReferralHistoryFix] 修正スクリプトの読み込み完了');
})();