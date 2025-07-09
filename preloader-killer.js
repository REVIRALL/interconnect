/**
 * プリローダー強制削除スクリプト
 * 白い画面問題を解決
 */

// ページ読み込み時に実行
window.addEventListener('load', function() {
    console.log('🔧 Preloader Killer activated');
    
    // プリローダーを強制的に削除
    const preloaders = document.querySelectorAll('.preloader, .loading, .loader, .progress-bar');
    preloaders.forEach(element => {
        console.log('Removing preloader:', element.className);
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
        element.remove();
    });
    
    // 高いz-indexを持つ要素をチェック
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        const zIndex = window.getComputedStyle(element).zIndex;
        if (zIndex && parseInt(zIndex) > 1000) {
            console.warn('High z-index element found:', element, 'z-index:', zIndex);
            // 白い背景を持つ高z-index要素を修正
            const bgColor = window.getComputedStyle(element).backgroundColor;
            if (bgColor && (bgColor.includes('255, 255, 255') || bgColor === 'white' || bgColor === '#ffffff')) {
                console.log('Fixing white overlay:', element);
                element.style.display = 'none';
            }
        }
    });
    
    // bodyのオーバーフローを確実に有効化
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflow = 'visible';
    
    // 白い::before, ::after要素を削除
    const style = document.createElement('style');
    style.textContent = `
        /* 白いオーバーレイを強制削除 */
        *::before, *::after {
            background-color: transparent !important;
        }
        
        /* プリローダー関連を完全に非表示 */
        .preloader, .loading, .loader, .progress-bar {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
        
        /* 高z-indexの白い要素を透明化 */
        [style*="z-index"] {
            background-color: transparent !important;
        }
        
        /* ボディの背景を確実に設定 */
        body {
            background-color: var(--bg-primary, #0a0a0a) !important;
            overflow: visible !important;
        }
    `;
    document.head.appendChild(style);
});

// DOMContentLoadedでも実行（より早い段階で）
document.addEventListener('DOMContentLoaded', function() {
    // 500ms後に再度チェック
    setTimeout(() => {
        const preloaders = document.querySelectorAll('.preloader, .loading, .loader');
        preloaders.forEach(el => el.remove());
    }, 500);
});