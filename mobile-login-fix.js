// モバイルログインリンク修正
document.addEventListener('DOMContentLoaded', function() {
    // ログインボタンとレジスターボタンの取得
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    
    // モバイルデバイスの判定
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // 現在のパスを取得
    const currentPath = window.location.pathname;
    const pathDepth = (currentPath.match(/\//g) || []).length - 1;
    const basePath = '../'.repeat(pathDepth);
    
    // ログインボタンの処理
    if (loginBtn) {
        // iOSデバイスでの相対パスの問題を修正
        const href = loginBtn.getAttribute('href');
        if (href && href.indexOf('http') !== 0 && href.indexOf('/') !== 0) {
            // 相対パスの場合、現在のディレクトリからの相対パスを設定
            const absolutePath = new URL(href, window.location.href).pathname;
            loginBtn.setAttribute('href', absolutePath);
        }
        
        // クリックイベントも追加（フォールバック）
        loginBtn.addEventListener('click', function(e) {
            if (isMobile) {
                e.preventDefault();
                const targetPath = new URL('login.html', window.location.href).pathname;
                window.location.href = targetPath;
            }
        });
    }
    
    // レジスターボタンの処理
    if (registerBtn) {
        // iOSデバイスでの相対パスの問題を修正
        const href = registerBtn.getAttribute('href');
        if (href && href.indexOf('http') !== 0 && href.indexOf('/') !== 0) {
            // 相対パスの場合、現在のディレクトリからの相対パスを設定
            const absolutePath = new URL(href, window.location.href).pathname;
            registerBtn.setAttribute('href', absolutePath);
        }
        
        // クリックイベントも追加（フォールバック）
        registerBtn.addEventListener('click', function(e) {
            if (isMobile) {
                e.preventDefault();
                const targetPath = new URL('register.html', window.location.href).pathname;
                window.location.href = targetPath;
            }
        });
    }
    
    // デバッグ情報
    console.log('Mobile login fix loaded');
    console.log('Is mobile device:', isMobile);
    console.log('Current path:', currentPath);
    console.log('Login button found:', !!loginBtn);
    console.log('Register button found:', !!registerBtn);
    if (loginBtn) console.log('Login href:', loginBtn.getAttribute('href'));
    if (registerBtn) console.log('Register href:', registerBtn.getAttribute('href'));
});