// ダッシュボードナビゲーション修正
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard nav fix loaded');
    
    // ダッシュボードナビゲーションのリンクを修正
    function setupDashboardNavigation() {
        const dashboardNav = document.querySelector('.dashboard-nav');
        if (!dashboardNav) {
            console.warn('Dashboard nav not found');
            return;
        }
        
        // 各ナビゲーションアイテムに適切なURLを設定
        const navItems = [
            { selector: 'a:nth-child(1)', href: 'dashboard.html', text: '概要' },
            { selector: 'a:nth-child(2)', href: 'members.html', text: 'メンバー' },
            { selector: 'a:nth-child(3)', href: 'events.html', text: 'イベント' },
            { selector: 'a:nth-child(4)', href: 'settings.html', text: '設定' }
        ];
        
        navItems.forEach(item => {
            const link = dashboardNav.querySelector(item.selector);
            if (link) {
                // href属性を設定
                link.href = item.href;
                
                // タッチイベントの追加（モバイル対応）
                link.addEventListener('touchstart', function(e) {
                    e.stopPropagation();
                    this.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                });
                
                link.addEventListener('touchend', function(e) {
                    e.stopPropagation();
                    this.style.backgroundColor = '';
                    
                    // 遅延なくページ遷移
                    const href = this.getAttribute('href');
                    if (href && href !== '#') {
                        window.location.href = href;
                    }
                });
                
                // クリックイベントも追加（デスクトップ対応）
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href && href !== '#') {
                        e.preventDefault();
                        window.location.href = href;
                    }
                });
                
                console.log(`Nav item "${item.text}" setup with href: ${item.href}`);
            }
        });
    }
    
    // サイドバーナビゲーションの修正
    function setupSidebarNavigation() {
        const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        
        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // ハッシュリンクをファイルリンクに変換
            if (href && href.startsWith('#')) {
                switch(href) {
                    case '#dashboard':
                        link.href = 'dashboard.html';
                        break;
                    case '#profile':
                        link.href = 'profile.html';
                        break;
                    case '#members':
                        link.href = 'members.html';
                        break;
                    case '#events':
                        link.href = 'events.html';
                        break;
                    case '#messages':
                        link.href = 'messages.html';
                        break;
                    case '#business':
                        link.href = 'business.html';
                        break;
                    case '#admin':
                        link.href = 'admin.html';
                        break;
                }
            }
            
            // タッチイベントの追加
            link.addEventListener('touchstart', function(e) {
                this.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            });
            
            link.addEventListener('touchend', function(e) {
                this.style.backgroundColor = '';
                const finalHref = this.getAttribute('href');
                if (finalHref && !finalHref.startsWith('#')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // サイドバーを閉じる
                    const sidebar = document.querySelector('.sidebar');
                    const overlay = document.querySelector('.sidebar-overlay');
                    if (sidebar) sidebar.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                    document.body.style.overflow = '';
                    
                    // ページ遷移
                    setTimeout(() => {
                        window.location.href = finalHref;
                    }, 100);
                }
            });
            
            // クリックイベントの改善
            link.addEventListener('click', function(e) {
                const finalHref = this.getAttribute('href');
                if (finalHref && !finalHref.startsWith('#')) {
                    e.preventDefault();
                    window.location.href = finalHref;
                }
            });
        });
    }
    
    // モバイルでのタップフィードバック改善
    function improveTapFeedback() {
        // すべてのボタンとリンクにタップフィードバックを追加
        const interactiveElements = document.querySelectorAll('button, a, .clickable');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('tapped');
            });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('tapped');
                }, 150);
            });
            
            element.addEventListener('touchcancel', function() {
                this.classList.remove('tapped');
            });
        });
    }
    
    // 初期化
    setupDashboardNavigation();
    setupSidebarNavigation();
    improveTapFeedback();
    
    // 動的に追加される要素にも対応
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                setupDashboardNavigation();
                setupSidebarNavigation();
                improveTapFeedback();
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// タップフィードバック用のCSS
const tapStyles = document.createElement('style');
tapStyles.textContent = `
/* タップフィードバック */
.tapped {
    opacity: 0.7 !important;
    transform: scale(0.98) !important;
    transition: all 0.1s ease !important;
}

/* ダッシュボードナビゲーションのタップ改善 */
.dashboard-nav a {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    cursor: pointer;
}

.dashboard-nav a:active {
    background: rgba(0, 0, 0, 0.1) !important;
}

/* サイドバーリンクのタップ改善 */
.sidebar-nav .nav-link {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    cursor: pointer;
}

.sidebar-nav .nav-link:active {
    background: rgba(0, 0, 0, 0.05) !important;
}

/* iOS Safari用の最適化 */
@supports (-webkit-touch-callout: none) {
    .dashboard-nav a,
    .sidebar-nav .nav-link {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
    }
}

/* タッチデバイスでのホバー無効化 */
@media (hover: none) and (pointer: coarse) {
    .dashboard-nav a:hover,
    .sidebar-nav .nav-link:hover {
        background: transparent !important;
    }
}
`;
document.head.appendChild(tapStyles);