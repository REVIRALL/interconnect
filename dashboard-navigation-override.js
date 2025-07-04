// ダッシュボードナビゲーション完全オーバーライド
// 既存のイベントリスナーとの競合を防ぎ、確実にページ遷移を実行

(function() {
    'use strict';
    
    console.log('Dashboard navigation override loading...');
    
    // DOMContentLoadedとwindow.onloadの両方で実行
    function initNavigation() {
        console.log('Initializing navigation override...');
        
        // 既存のイベントリスナーを無効化してから新しいものを追加
        const dashboardNav = document.querySelector('.dashboard-nav');
        if (!dashboardNav) {
            console.warn('Dashboard nav not found, retrying...');
            setTimeout(initNavigation, 100);
            return;
        }
        
        // ナビゲーションアイテムのマッピング
        const navMap = {
            '概要': 'dashboard.html',
            'メンバー': 'members.html',
            'イベント': 'events.html',
            '設定': 'settings.html'
        };
        
        const navLinks = dashboardNav.querySelectorAll('a');
        console.log(`Found ${navLinks.length} navigation links`);
        
        navLinks.forEach((link, index) => {
            // 既存のイベントリスナーを削除
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            // テキストコンテンツからURLを決定
            const linkText = newLink.textContent.trim();
            const targetUrl = navMap[linkText];
            
            if (targetUrl) {
                newLink.href = targetUrl;
                console.log(`Setting ${linkText} -> ${targetUrl}`);
            }
            
            // 新しいイベントリスナーを追加（キャプチャフェーズで最優先）
            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const href = this.getAttribute('href');
                console.log(`Navigation clicked: ${linkText} -> ${href}`);
                
                if (href && href !== '#') {
                    // アクティブ状態を更新
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    // 即座にページ遷移
                    window.location.href = href;
                }
            }, true); // キャプチャフェーズで実行
            
            // タッチイベントも追加（モバイル用）
            newLink.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const href = this.getAttribute('href');
                console.log(`Touch navigation: ${linkText} -> ${href}`);
                
                if (href && href !== '#') {
                    window.location.href = href;
                }
            }, { passive: false, capture: true });
            
            // ポインターイベントも追加（統一的なタッチ/マウス処理）
            newLink.addEventListener('pointerup', function(e) {
                if (e.pointerType === 'touch' || e.pointerType === 'mouse') {
                    e.preventDefault();
                    const href = this.getAttribute('href');
                    if (href && href !== '#') {
                        console.log(`Pointer navigation: ${linkText} -> ${href}`);
                        window.location.href = href;
                    }
                }
            }, { passive: false });
        });
        
        // サイドバーナビゲーションも修正
        fixSidebarNavigation();
    }
    
    function fixSidebarNavigation() {
        const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        console.log(`Found ${sidebarLinks.length} sidebar links`);
        
        const sidebarMap = {
            'ダッシュボード': 'dashboard.html',
            'プロフィール': 'profile.html',
            'メンバー': 'members.html',
            'イベント': 'events.html',
            'メッセージ': 'messages.html',
            'ビジネス': 'business.html',
            '招待': 'invite.html',
            '管理': 'admin.html'
        };
        
        sidebarLinks.forEach(link => {
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            const linkText = newLink.querySelector('span')?.textContent.trim();
            const targetUrl = sidebarMap[linkText];
            
            if (targetUrl) {
                newLink.href = targetUrl;
                console.log(`Sidebar: ${linkText} -> ${targetUrl}`);
            }
            
            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                
                if (href && href !== '#' && href.endsWith('.html')) {
                    // サイドバーを閉じる
                    const sidebar = document.querySelector('.sidebar');
                    const overlay = document.querySelector('.sidebar-overlay');
                    if (sidebar) sidebar.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                    document.body.style.overflow = '';
                    
                    // ページ遷移
                    setTimeout(() => {
                        window.location.href = href;
                    }, 100);
                }
            }, true);
        });
    }
    
    // 複数のタイミングで初期化を試行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }
    
    // 念のため遅延実行も
    setTimeout(initNavigation, 500);
    window.addEventListener('load', initNavigation);
    
    // デバッグ用: クリックイベントの監視
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
        document.addEventListener('click', function(e) {
            if (e.target.closest('.dashboard-nav a') || e.target.closest('.sidebar-nav .nav-link')) {
                console.log('Navigation click detected:', {
                    target: e.target,
                    href: e.target.href || e.target.closest('a')?.href,
                    prevented: e.defaultPrevented
                });
            }
        }, true);
    }
})();