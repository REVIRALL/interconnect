/**
 * キャッシュクリア & 404エラー解決スクリプト
 */

console.log('🧹 キャッシュクリア開始');

// Service Workerを無効化
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
            console.log('🗑️ Service Worker unregistered:', registration);
        }
    });
}

// ローカルストレージクリア
try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('🗑️ Local/Session storage cleared');
} catch(e) {
    console.log('Storage clear error:', e);
}

// 削除されたCSSファイルへのリクエストを防止
const blockedCSS = [
    'design-system-effects.css',
    'design-system-integration.css', 
    'button-section-optimization.css',
    'fix-invisible-buttons.css'
];

// 既存のlinkタグをチェック
document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && blockedCSS.some(blocked => href.includes(blocked))) {
        console.log('🚫 Removing blocked CSS:', href);
        link.remove();
    }
});

// 動的CSS読み込みを防止
const originalCreateElement = document.createElement;
document.createElement = function(tagName) {
    const element = originalCreateElement.call(this, tagName);
    if (tagName.toLowerCase() === 'link') {
        const originalSetAttribute = element.setAttribute;
        element.setAttribute = function(name, value) {
            if (name === 'href' && blockedCSS.some(blocked => value.includes(blocked))) {
                console.log('🚫 Blocked dynamic CSS load:', value);
                return;
            }
            return originalSetAttribute.call(this, name, value);
        };
    }
    return element;
};

console.log('✅ キャッシュクリア完了');