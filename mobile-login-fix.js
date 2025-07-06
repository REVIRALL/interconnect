// モバイルログインリンク修正
document.addEventListener('DOMContentLoaded', function() {
    // ログインボタンとレジスターボタンの取得
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    
    // モバイルデバイスの判定
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // ログインボタンの処理
    if (loginBtn) {
        // href属性が正しく設定されているか確認
        if (!loginBtn.getAttribute('href')) {
            loginBtn.setAttribute('href', 'login.html');
        }
    }
    
    // レジスターボタンの処理
    if (registerBtn) {
        // href属性が正しく設定されているか確認
        if (!registerBtn.getAttribute('href')) {
            registerBtn.setAttribute('href', 'register.html');
        }
    }
    
    // デバッグ情報
    console.log('Mobile login fix loaded');
    console.log('Is mobile device:', isMobile);
    console.log('Login button found:', !!loginBtn);
    console.log('Register button found:', !!registerBtn);
});