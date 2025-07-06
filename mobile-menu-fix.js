// モバイルメニューの修正 - ログイン前のページでは余分な要素を表示しない

document.addEventListener('DOMContentLoaded', function() {
    // ログイン状態を確認
    const isLoggedIn = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    // ログイン前のページかどうかを判定
    const isAuthPage = window.location.pathname.includes('login.html') || 
                      window.location.pathname.includes('register.html') ||
                      window.location.pathname.includes('forgot-password.html') ||
                      window.location.pathname.includes('password-reset.html');
    
    const isIndexPage = window.location.pathname.endsWith('/') || 
                       window.location.pathname.endsWith('index.html') ||
                       window.location.pathname.endsWith('interconnect/');
    
    // ログイン前のページまたはインデックスページで、ログインしていない場合
    if ((isAuthPage || (isIndexPage && !isLoggedIn))) {
        // mobile-menu-improvements.jsの影響を無効化
        const mobileActions = document.querySelector('.mobile-actions');
        if (mobileActions) {
            mobileActions.remove();
        }
        
        // 不要なスタイルを削除
        const styles = document.querySelectorAll('style');
        styles.forEach(style => {
            if (style.textContent && style.textContent.includes('mobile-actions')) {
                style.remove();
            }
        });
        
        // ハンバーガーメニューの挙動を修正
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            // 既存のイベントリスナーを削除して新しいものを追加
            const newHamburger = hamburger.cloneNode(true);
            hamburger.parentNode.replaceChild(newHamburger, hamburger);
            
            newHamburger.addEventListener('click', function(e) {
                e.stopPropagation();
                navMenu.classList.toggle('active');
                newHamburger.classList.toggle('active');
                
                // オーバーレイを管理
                let overlay = document.querySelector('.menu-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'menu-overlay';
                    document.body.appendChild(overlay);
                }
                
                if (navMenu.classList.contains('active')) {
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // オーバーレイクリックでメニューを閉じる
                overlay.addEventListener('click', function() {
                    navMenu.classList.remove('active');
                    newHamburger.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
        }
    }
    
    // インデックスページ専用のスタイル調整
    if (isIndexPage && !isLoggedIn) {
        const style = document.createElement('style');
        style.textContent = `
            /* インデックスページのモバイルメニュー調整 */
            @media (max-width: 768px) {
                .nav-menu {
                    position: fixed;
                    top: 80px;
                    left: -100%;
                    width: 100%;
                    height: calc(100vh - 80px);
                    background-color: white;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    padding: 2rem;
                    transition: left 0.3s ease;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                    z-index: 1000;
                }
                
                .nav-menu.active {
                    left: 0;
                }
                
                .nav-menu li {
                    margin: 1.5rem 0;
                    width: 100%;
                    text-align: center;
                }
                
                .nav-menu a {
                    font-size: 18px;
                    padding: 12px 24px;
                    display: block;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }
                
                .nav-menu a:hover {
                    background-color: rgba(0, 123, 255, 0.1);
                    transform: translateX(5px);
                }
                
                .nav-menu .login-btn,
                .nav-menu .register-btn,
                .nav-menu .contact-btn {
                    width: 80%;
                    margin: 10px auto;
                    text-align: center;
                }
                
                /* ハンバーガーメニューのアニメーション */
                .hamburger {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    width: 30px;
                    height: 25px;
                    cursor: pointer;
                    z-index: 1001;
                }
                
                .hamburger span {
                    display: block;
                    height: 3px;
                    width: 100%;
                    background-color: #333;
                    border-radius: 3px;
                    transition: all 0.3s ease;
                }
                
                .hamburger.active span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }
                
                .hamburger.active span:nth-child(2) {
                    opacity: 0;
                }
                
                .hamburger.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(7px, -6px);
                }
                
                /* メニューオーバーレイ */
                .menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                
                .menu-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
            }
        `;
        document.head.appendChild(style);
    }
});