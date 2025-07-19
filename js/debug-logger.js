// Debug Logger - すべてのクリックイベントとプログラムの動作を記録

(function() {
    'use strict';
    
    console.log('🔍 Debug Logger Started at', new Date().toLocaleTimeString());
    console.log('📍 Current Page:', window.location.pathname);
    
    // ページ読み込み完了時の要素チェック
    document.addEventListener('DOMContentLoaded', function() {
        console.log('✅ DOM Content Loaded');
        
        // 重要な要素の存在確認
        const elements = {
            'notification-btn': document.querySelectorAll('.notification-btn'),
            'mobile-menu-toggle': document.querySelector('.mobile-menu-toggle'),
            'mobile-nav': document.querySelector('.mobile-nav'),
            'sidebar-links': document.querySelectorAll('.sidebar-link'),
            'user-menu-btn': document.querySelector('.user-menu-btn')
        };
        
        console.log('📋 Element Check:');
        for (const [name, el] of Object.entries(elements)) {
            if (el) {
                const count = el.length !== undefined ? el.length : 1;
                console.log(`  ✓ ${name}: ${count} found`);
            } else {
                console.log(`  ✗ ${name}: NOT FOUND`);
            }
        }
    });
    
    // すべてのクリックイベントをキャプチャ (デバッグモード時のみ)
    if (window.DEBUG_MODE || localStorage.getItem('debugMode') === 'true') {
        document.addEventListener('click', function(e) {
            const target = e.target;
            const tagName = target.tagName;
            const className = target.className || 'no-class';
            const id = target.id || 'no-id';
            const href = target.href || (target.closest('a') ? target.closest('a').href : 'no-href');
            
            console.group(`🖱️ Click Event at ${new Date().toLocaleTimeString()}`);
            console.log('Element:', tagName);
            console.log('Class:', className);
            console.log('ID:', id);
            if (href !== 'no-href') {
                console.log('Href:', href);
            }
            console.log('Prevented:', e.defaultPrevented);
            console.log('Target HTML:', target.outerHTML.substring(0, 100) + '...');
            
            // 親要素の情報も表示
            if (target.parentElement) {
                console.log('Parent:', target.parentElement.tagName, target.parentElement.className);
            }
            
            console.groupEnd();
        }, true); // capture phase で早期にイベントを捕捉
    } else {
        console.log('🔇 Debug mode disabled. Set DEBUG_MODE=true or localStorage.debugMode=true to enable full logging.');
    }
    
    // リンククリックの特別な監視
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link) {
            console.group(`🔗 Link Click Detected`);
            console.log('Link URL:', link.href);
            console.log('Link Text:', link.textContent.trim());
            console.log('Default Prevented:', e.defaultPrevented);
            console.log('Will Navigate:', !e.defaultPrevented);
            console.groupEnd();
        }
    }, true);
    
    // 通知ボタンの特別な監視
    document.addEventListener('click', function(e) {
        const notificationBtn = e.target.closest('.notification-btn');
        if (notificationBtn) {
            console.group(`🔔 Notification Button Clicked`);
            console.log('Button Type:', notificationBtn.tagName);
            console.log('Button HTML:', notificationBtn.outerHTML);
            console.log('Has href:', !!notificationBtn.href);
            console.log('Href value:', notificationBtn.href);
            console.log('Event prevented:', e.defaultPrevented);
            console.log('Will navigate to:', notificationBtn.href);
            
            // リンクが動作しない場合の強制遷移
            if (notificationBtn.tagName === 'A' && notificationBtn.href && !e.defaultPrevented) {
                console.log('🚀 Force navigation in 100ms...');
                setTimeout(() => {
                    console.log('🚀 Navigating to:', notificationBtn.href);
                    window.location.href = notificationBtn.href;
                }, 100);
            }
            console.groupEnd();
        }
    }, true);
    
    // JavaScriptエラーのキャッチ
    window.addEventListener('error', function(e) {
        console.error('❌ JavaScript Error:', e.message);
        console.error('File:', e.filename);
        console.error('Line:', e.lineno, 'Column:', e.colno);
    });
    
    // ナビゲーションイベントの監視
    window.addEventListener('beforeunload', function(e) {
        console.log('🚪 Page is about to unload/navigate');
    });
    
    // Ajax/Fetchリクエストの監視（もしあれば）
    const originalFetch = window.fetch;
    if (originalFetch) {
        window.fetch = function(...args) {
            console.log('📡 Fetch request:', args[0]);
            return originalFetch.apply(this, args);
        };
    }
    
    // 読み込まれたスクリプトファイルのリスト
    console.log('📜 Loaded Scripts:');
    Array.from(document.querySelectorAll('script[src]')).forEach(script => {
        console.log('  -', script.src.split('/').pop());
    });
    
    // デバッグ用グローバル関数
    window.debugCheckElement = function(selector) {
        const elements = document.querySelectorAll(selector);
        console.group(`🔍 Checking: ${selector}`);
        console.log(`Found: ${elements.length} elements`);
        elements.forEach((el, index) => {
            console.log(`[${index}]`, el);
        });
        console.groupEnd();
    };
    
    window.debugListAllLinks = function() {
        const links = document.querySelectorAll('a');
        console.group('📋 All Links on Page');
        links.forEach((link, index) => {
            console.log(`[${index}] ${link.textContent.trim()} -> ${link.href}`);
        });
        console.groupEnd();
    };
    
    console.log('💡 Debug functions available:');
    console.log('  - debugCheckElement(selector)');
    console.log('  - debugListAllLinks()');
    
})();