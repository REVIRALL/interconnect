// CSPエラーとリソース読み込みエラーの修正

document.addEventListener('DOMContentLoaded', function() {
    // Material Design Liteのスタイルシートを削除（CSPエラーの原因）
    const mdlLinks = document.querySelectorAll('link[href*="code.getmdl.io"]');
    mdlLinks.forEach(link => {
        console.log('Removing MDL stylesheet:', link.href);
        link.remove();
    });
    
    // 404エラーの原因となる存在しないリソースをチェック
    const checkResources = () => {
        // スタイルシートのチェック
        const styleSheets = document.querySelectorAll('link[rel="stylesheet"]');
        styleSheets.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('//')) {
                // ローカルファイルの場合、存在確認
                fetch(href, { method: 'HEAD' })
                    .then(response => {
                        if (!response.ok) {
                            console.warn(`Stylesheet not found: ${href}`);
                            link.remove();
                        }
                    })
                    .catch(() => {
                        console.warn(`Failed to check stylesheet: ${href}`);
                    });
            }
        });
        
        // フォントファイルのプリロードを調整
        const fontPreloads = document.querySelectorAll('link[rel="preload"][as="font"]');
        fontPreloads.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes('NotoSansJP')) {
                // Google Fontsから直接読み込むように変更
                link.remove();
                console.log('Removed local font preload:', href);
            }
        });
    };
    
    // リソースチェックを実行
    checkResources();
    
    // フォント読み込みの最適化
    const optimizeFonts = () => {
        // Google Fontsの読み込みを確認
        const fontLink = document.querySelector('link[href*="fonts.googleapis.com"]');
        if (fontLink) {
            // display=swapを追加して読み込みを最適化
            const href = fontLink.getAttribute('href');
            if (!href.includes('display=swap')) {
                fontLink.setAttribute('href', href + '&display=swap');
            }
        }
    };
    
    optimizeFonts();
});

// エラーハンドリングの改善
window.addEventListener('error', function(event) {
    // リソース読み込みエラーの場合
    if (event.target && event.target.tagName) {
        const tagName = event.target.tagName.toLowerCase();
        const src = event.target.src || event.target.href;
        
        console.warn(`Resource loading error: ${tagName} - ${src}`);
        
        // 404エラーの要素を非表示にする
        if (tagName === 'link' || tagName === 'script') {
            event.target.style.display = 'none';
        }
    }
}, true);

// パフォーマンス警告の抑制
if (window.performance && window.performance.getEntriesByType) {
    // 使用されていないプリロードリソースをクリーンアップ
    setTimeout(() => {
        const entries = performance.getEntriesByType('resource');
        entries.forEach(entry => {
            if (entry.name.includes('preload') && entry.transferSize === 0) {
                console.log('Unused preload detected:', entry.name);
            }
        });
    }, 5000);
}