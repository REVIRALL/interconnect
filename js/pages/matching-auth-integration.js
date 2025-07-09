/**
 * マッチングページ認証統合
 */

// サイドバー制御
function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            
            // 状態を保存
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
        
        // 保存された状態を復元
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }
}

// ユーザーメニュー
function setupUserMenu() {
    const userMenuBtn = document.querySelector('.user-menu-btn');
    const userMenuDropdown = document.querySelector('.user-menu-dropdown');
    
    if (userMenuBtn && userMenuDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userMenuDropdown.classList.toggle('active');
        });
        
        // クリック外で閉じる
        document.addEventListener('click', function() {
            userMenuDropdown.classList.remove('active');
        });
    }
}

// ログアウト
function logout() {
    if (confirm('ログアウトしますか？')) {
        // セッションクリア
        sessionStorage.clear();
        localStorage.removeItem('userProfile');
        
        // ログインページへ
        window.location.href = 'login.html';
    }
}

// モバイルナビゲーション設定
function setupMobileNav() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMobileItems = document.querySelector('.nav-mobile-items');
    
    if (mobileMenuToggle && navMobileItems) {
        mobileMenuToggle.addEventListener('click', function() {
            navMobileItems.classList.toggle('active');
        });
    }
}

// 初期化時に呼び出し
document.addEventListener('DOMContentLoaded', function() {
    setupUserMenu();
    setupMobileNav();
});