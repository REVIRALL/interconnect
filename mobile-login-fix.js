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
        
        // モバイルでのクリックイベント強化
        if (isMobile) {
            loginBtn.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            });
            
            loginBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = 'login.html';
            });
        }
        
        // デスクトップでのクリックイベント
        loginBtn.addEventListener('click', function(e) {
            if (!isMobile) {
                e.preventDefault();
                window.location.href = 'login.html';
            }
        });
    }
    
    // レジスターボタンの処理
    if (registerBtn) {
        // href属性が正しく設定されているか確認
        if (!registerBtn.getAttribute('href')) {
            registerBtn.setAttribute('href', 'register.html');
        }
        
        // モバイルでのクリックイベント強化
        if (isMobile) {
            registerBtn.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            });
            
            registerBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = 'register.html';
            });
        }
        
        // デスクトップでのクリックイベント
        registerBtn.addEventListener('click', function(e) {
            if (!isMobile) {
                e.preventDefault();
                window.location.href = 'register.html';
            }
        });
    }
    
    // ナビメニュー内のリンクも修正
    const navMenuLinks = document.querySelectorAll('.nav-menu a');
    navMenuLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // 外部リンクでない場合の処理
        if (href && !href.startsWith('#') && !href.startsWith('http')) {
            if (isMobile) {
                link.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = href;
                });
            }
        }
    });
    
    // デバッグ情報
    console.log('Mobile login fix loaded');
    console.log('Is mobile device:', isMobile);
    console.log('Login button found:', !!loginBtn);
    console.log('Register button found:', !!registerBtn);
});