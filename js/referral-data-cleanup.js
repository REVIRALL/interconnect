/**
 * 紹介リンクデータのクリーンアップ
 * テストデータやデバッグ用リンクを検出して警告
 */

(function() {
    'use strict';

    console.log('[ReferralCleanup] データクリーンアップ開始');

    // テストデータのパターン
    const testPatterns = [
        /^test/i,
        /^debug/i,
        /^sql/i,
        /テスト/,
        /デバッグ/,
        /^[あ-ん]$/,  // 単一ひらがな
        /^[ア-ン]$/,  // 単一カタカナ
        /^[A-Z]{1,2}$/,  // 1-2文字の英字
        /^[①-⑳]/,  // 丸数字
        /^[\d]+$/,  // 数字のみ
    ];

    // 不適切な説明のパターン
    const inappropriateDescriptions = [
        'SQLエディタから作成したテストリンク',
        'え',
        'ｓｄ',
        'A',
        'AA',
        '①',
        'あああ',
        'test',
        'debug'
    ];

    // DOM監視
    function checkReferralLinks() {
        const linkItems = document.querySelectorAll('.link-item');
        let testLinksFound = [];
        
        linkItems.forEach(item => {
            const titleElement = item.querySelector('.link-info h3');
            if (titleElement) {
                const title = titleElement.textContent.trim();
                
                // テストパターンチェック
                const isTestLink = testPatterns.some(pattern => pattern.test(title)) ||
                                  inappropriateDescriptions.includes(title);
                
                if (isTestLink) {
                    testLinksFound.push({
                        title: title,
                        element: item
                    });
                    
                    // 視覚的な警告を追加
                    if (!item.querySelector('.test-warning')) {
                        const warning = document.createElement('div');
                        warning.className = 'test-warning';
                        warning.innerHTML = `
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>テスト/デバッグ用リンクの可能性があります</span>
                        `;
                        warning.style.cssText = `
                            background: #fef2f2;
                            color: #dc2626;
                            padding: 0.5rem;
                            border-radius: 4px;
                            font-size: 0.75rem;
                            margin-top: 0.5rem;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        `;
                        item.querySelector('.link-header').appendChild(warning);
                    }
                }
            }
        });
        
        if (testLinksFound.length > 0) {
            console.warn('[ReferralCleanup] テスト/デバッグ用リンクを検出:', testLinksFound);
            
            // 管理者向けの通知
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('[ReferralCleanup] 開発環境のため、テストリンクを許可');
            } else {
                console.warn('[ReferralCleanup] 本番環境でテストリンクが検出されました。削除を推奨します。');
            }
        }
    }

    // 重複リンクの検出
    function checkDuplicateLinks() {
        const linkItems = document.querySelectorAll('.link-item');
        const linkTitles = {};
        const duplicates = [];
        
        linkItems.forEach(item => {
            const titleElement = item.querySelector('.link-info h3');
            if (titleElement) {
                const title = titleElement.textContent.trim();
                if (linkTitles[title]) {
                    linkTitles[title]++;
                    duplicates.push(title);
                } else {
                    linkTitles[title] = 1;
                }
            }
        });
        
        if (duplicates.length > 0) {
            console.warn('[ReferralCleanup] 重複したリンク名を検出:', duplicates);
        }
    }

    // ページ読み込み時にチェック
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            checkReferralLinks();
            checkDuplicateLinks();
        });
    } else {
        checkReferralLinks();
        checkDuplicateLinks();
    }

    // MutationObserverでDOM変更を監視
    const observer = new MutationObserver(() => {
        checkReferralLinks();
        checkDuplicateLinks();
    });

    const linksContainer = document.getElementById('links-list');
    if (linksContainer) {
        observer.observe(linksContainer, {
            childList: true,
            subtree: true
        });
    }

    // グローバル関数として公開
    window.ReferralCleanup = {
        checkTestLinks: checkReferralLinks,
        checkDuplicates: checkDuplicateLinks,
        getTestPatterns: () => testPatterns,
        getInappropriateDescriptions: () => inappropriateDescriptions
    };

    console.log('[ReferralCleanup] 初期化完了');
})();