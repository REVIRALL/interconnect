// 確実に動作するモバイルナビゲーション

window.mobileNavGuaranteed = {
    initialized: false,
    
    init: function() {
        if (this.initialized) return;
        if (window.INTERCONNECT && window.INTERCONNECT.modules && window.INTERCONNECT.modules.mobileNav) return;
        
        this.initialized = true;
        console.log('モバイルナビゲーション確実版開始');
        
        this.initializeNavigation();
    },
    
    initializeNavigation: function() {
    
    // 強制的にナビゲーションを作成
    function forceCreateMobileNav() {
        // 既存のナビゲーションをすべて削除
        document.querySelectorAll('.nav-buttons, .mobile-nav-final, .mobile-nav-complete').forEach(el => el.remove());
        
        // ヘッダーを探す
        let header = document.querySelector('.dashboard-header');
        if (!header) {
            // ヘッダーがない場合は作成
            const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
            header = document.createElement('div');
            header.className = 'dashboard-header';
            header.innerHTML = '<h1>ダッシュボード</h1>';
            mainContent.insertBefore(header, mainContent.firstChild);
        }
        
        // ナビゲーションHTMLを直接作成
        const navHTML = `
            <div class="mobile-nav-guaranteed" style="
                background: #2d3748;
                padding: 8px;
                border-radius: 12px;
                margin-top: 12px;
                width: 100%;
            ">
                <div style="
                    display: flex;
                    gap: 6px;
                    overflow-x: auto;
                    padding: 4px;
                ">
                    <a href="dashboard.html" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 10px 16px;
                        background: #4a5568;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 500;
                        white-space: nowrap;
                    ">
                        <i class="fas fa-chart-line"></i>
                        <span>概要</span>
                    </a>
                    
                    <a href="members.html" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 10px 16px;
                        background: #4a5568;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 500;
                        white-space: nowrap;
                    ">
                        <i class="fas fa-users"></i>
                        <span>メンバー</span>
                    </a>
                    
                    <a href="events.html" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 10px 16px;
                        background: #4a5568;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 500;
                        white-space: nowrap;
                    ">
                        <i class="fas fa-calendar"></i>
                        <span>イベント</span>
                    </a>
                    
                    <a href="messages.html" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 10px 16px;
                        background: #4a5568;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 500;
                        white-space: nowrap;
                        position: relative;
                    ">
                        <i class="fas fa-envelope"></i>
                        <span>メッセージ</span>
                        <span style="
                            position: absolute;
                            top: -4px;
                            right: -4px;
                            background: #ef4444;
                            color: white;
                            font-size: 10px;
                            padding: 2px 6px;
                            border-radius: 10px;
                            font-weight: 600;
                        ">3</span>
                    </a>
                    
                    <a href="business.html" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 10px 16px;
                        background: #4a5568;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 500;
                        white-space: nowrap;
                    ">
                        <i class="fas fa-handshake"></i>
                        <span>ビジネス</span>
                    </a>
                    
                    <a href="invite.html" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 10px 16px;
                        background: #4a5568;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 500;
                        white-space: nowrap;
                        position: relative;
                    ">
                        <i class="fas fa-share-alt"></i>
                        <span>招待</span>
                        <span style="
                            position: absolute;
                            top: -4px;
                            right: -4px;
                            background: #10b981;
                            color: white;
                            font-size: 10px;
                            padding: 2px 6px;
                            border-radius: 10px;
                            font-weight: 600;
                        ">NEW</span>
                    </a>
                    
                    <a href="settings.html" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 10px 16px;
                        background: #4a5568;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 500;
                        white-space: nowrap;
                    ">
                        <i class="fas fa-cog"></i>
                        <span>設定</span>
                    </a>
                </div>
            </div>
        `;
        
        // ナビゲーションを追加
        header.insertAdjacentHTML('beforeend', navHTML);
        
        // 現在のページをハイライト
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        const links = header.querySelectorAll('a[href]');
        links.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.style.background = '#3b82f6';
                link.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.4)';
            }
        });
        
        console.log('モバイルナビゲーションを強制作成しました');
    }
    
    // 即座に実行
    forceCreateMobileNav();
    
    // DOMContentLoaded後にも実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceCreateMobileNav);
    }
    
    // 遅延実行でも確実に
    setTimeout(forceCreateMobileNav, 500);
    setTimeout(forceCreateMobileNav, 1000);
    setTimeout(forceCreateMobileNav, 2000);
    
})();