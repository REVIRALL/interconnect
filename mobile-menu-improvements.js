// モバイルメニュー改善 - ヘッダーアクションをハンバーガーメニューに移動

document.addEventListener('DOMContentLoaded', function() {
    // モバイルかどうかを判定
    const isMobile = () => window.innerWidth <= 768;
    
    // ハンバーガーメニュー内にヘッダーアクションを追加
    function setupMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu || !isMobile()) return;
        
        // 既存のモバイルアクションエリアがあれば削除
        const existingMobileActions = navMenu.querySelector('.mobile-actions');
        if (existingMobileActions) {
            existingMobileActions.remove();
        }
        
        // モバイルアクションエリアを作成
        const mobileActions = document.createElement('div');
        mobileActions.className = 'mobile-actions';
        mobileActions.innerHTML = `
            <div class="mobile-action-item" onclick="handleNotifications()">
                <i class="fas fa-bell"></i>
                <span>通知</span>
                <span class="mobile-badge" id="mobileNotificationCount">5</span>
            </div>
            <div class="mobile-action-item" onclick="handleConnectionRequests()">
                <i class="fas fa-user-plus"></i>
                <span>接続リクエスト</span>
                <span class="mobile-badge" id="mobileConnectionCount">0</span>
            </div>
            <div class="mobile-action-item" onclick="handleProfile()">
                <i class="fas fa-user-circle"></i>
                <span>プロフィール</span>
            </div>
            <div class="mobile-action-item" onclick="handleSettings()">
                <i class="fas fa-cog"></i>
                <span>設定</span>
            </div>
            <div class="mobile-action-item" onclick="handleHelp()">
                <i class="fas fa-question-circle"></i>
                <span>ヘルプ</span>
            </div>
            <div class="mobile-action-item logout" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                <span>ログアウト</span>
            </div>
        `;
        
        // ナビメニューの最後に追加
        navMenu.appendChild(mobileActions);
        
        // バッジ数を同期
        syncBadgeCounts();
    }
    
    // バッジ数を同期
    function syncBadgeCounts() {
        const notificationCount = document.querySelector('.notification-count');
        const connectionCount = document.querySelector('.connection-request-count');
        const mobileNotificationCount = document.getElementById('mobileNotificationCount');
        const mobileConnectionCount = document.getElementById('mobileConnectionCount');
        
        if (notificationCount && mobileNotificationCount) {
            mobileNotificationCount.textContent = notificationCount.textContent;
            mobileNotificationCount.style.display = notificationCount.textContent === '0' ? 'none' : 'flex';
        }
        
        if (connectionCount && mobileConnectionCount) {
            mobileConnectionCount.textContent = connectionCount.textContent;
            mobileConnectionCount.style.display = connectionCount.textContent === '0' ? 'none' : 'flex';
        }
    }
    
    // 通知ハンドラー
    window.handleNotifications = function() {
        // ハンバーガーメニューを閉じる
        closeHamburgerMenu();
        
        // 通知パネルを表示
        const notificationPanel = document.createElement('div');
        notificationPanel.className = 'notification-panel mobile';
        notificationPanel.innerHTML = `
            <div class="panel-header">
                <h3>通知</h3>
                <button onclick="closeNotificationPanel()" class="panel-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="panel-content">
                <div class="notification-item">
                    <div class="notification-icon">
                        <i class="fas fa-calendar"></i>
                    </div>
                    <div class="notification-content">
                        <p>明日の定例交流会の参加申込締切が迫っています</p>
                        <span class="notification-time">1時間前</span>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notification-icon">
                        <i class="fas fa-handshake"></i>
                    </div>
                    <div class="notification-content">
                        <p>新しいビジネスマッチングの提案があります</p>
                        <span class="notification-time">3時間前</span>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notification-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="notification-content">
                        <p>田中様からメッセージが届いています</p>
                        <span class="notification-time">5時間前</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notificationPanel);
        setTimeout(() => notificationPanel.classList.add('active'), 10);
        
        // バッジをリセット
        updateBadgeCount('notification', 0);
    };
    
    // 接続リクエストハンドラー
    window.handleConnectionRequests = function() {
        closeHamburgerMenu();
        
        const requestPanel = document.createElement('div');
        requestPanel.className = 'notification-panel mobile';
        requestPanel.innerHTML = `
            <div class="panel-header">
                <h3>接続リクエスト</h3>
                <button onclick="closeNotificationPanel()" class="panel-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="panel-content">
                <p style="text-align: center; color: #666; padding: 40px;">
                    現在、新しい接続リクエストはありません
                </p>
            </div>
        `;
        
        document.body.appendChild(requestPanel);
        setTimeout(() => requestPanel.classList.add('active'), 10);
    };
    
    // その他のハンドラー
    window.handleProfile = function() {
        closeHamburgerMenu();
        window.location.href = 'profile.html';
    };
    
    window.handleSettings = function() {
        closeHamburgerMenu();
        window.location.href = 'settings.html';
    };
    
    window.handleHelp = function() {
        closeHamburgerMenu();
        window.location.href = 'help.html';
    };
    
    // パネルを閉じる
    window.closeNotificationPanel = function() {
        const panels = document.querySelectorAll('.notification-panel');
        panels.forEach(panel => {
            panel.classList.remove('active');
            setTimeout(() => panel.remove(), 300);
        });
    };
    
    // ハンバーガーメニューを閉じる
    function closeHamburgerMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        const menuOverlay = document.querySelector('.menu-overlay');
        
        if (navMenu) navMenu.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
        if (menuOverlay) menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // バッジカウントを更新
    function updateBadgeCount(type, count) {
        if (type === 'notification') {
            const notificationCount = document.querySelector('.notification-count');
            const mobileNotificationCount = document.getElementById('mobileNotificationCount');
            
            if (notificationCount) {
                notificationCount.textContent = count;
                notificationCount.style.display = count === 0 ? 'none' : 'flex';
            }
            if (mobileNotificationCount) {
                mobileNotificationCount.textContent = count;
                mobileNotificationCount.style.display = count === 0 ? 'none' : 'flex';
            }
        } else if (type === 'connection') {
            const connectionCount = document.querySelector('.connection-request-count');
            const mobileConnectionCount = document.getElementById('mobileConnectionCount');
            
            if (connectionCount) {
                connectionCount.textContent = count;
                connectionCount.style.display = count === 0 ? 'none' : 'flex';
            }
            if (mobileConnectionCount) {
                mobileConnectionCount.textContent = count;
                mobileConnectionCount.style.display = count === 0 ? 'none' : 'flex';
            }
        }
    }
    
    // デスクトップの通知ボタンとリクエストボタンにもハンドラーを追加
    const notificationBtn = document.querySelector('.notification-btn');
    const connectionBtn = document.querySelector('.connection-requests-btn');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', handleNotifications);
    }
    
    if (connectionBtn) {
        connectionBtn.addEventListener('click', handleConnectionRequests);
    }
    
    // 初期設定
    setupMobileMenu();
    
    // ウィンドウリサイズ時に再設定
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setupMobileMenu();
        }, 250);
    });
});

// スタイルを追加
const mobileMenuStyles = document.createElement('style');
mobileMenuStyles.textContent = `
/* モバイルアクションエリア */
.mobile-actions {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding-top: 20px;
    margin-top: 20px;
}

.mobile-action-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 25px;
    margin: 0 -25px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    position: relative;
}

.mobile-action-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.mobile-action-item i {
    font-size: 20px;
    width: 24px;
    color: #666;
}

.mobile-action-item span {
    font-size: 16px;
    color: #333;
    flex: 1;
}

.mobile-action-item.logout {
    color: #dc3545;
    margin-top: 10px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding-top: 25px;
}

.mobile-action-item.logout i,
.mobile-action-item.logout span {
    color: #dc3545;
}

.mobile-badge {
    background: #ff4444;
    color: white;
    font-size: 12px;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    font-weight: 600;
}

/* 通知パネル */
.notification-panel {
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    max-width: 400px;
    height: 100vh;
    background: white;
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
    z-index: 1200;
    transition: right 0.3s ease;
    overflow-y: auto;
}

.notification-panel.mobile {
    max-width: 100%;
}

.notification-panel.active {
    right: 0;
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
}

.panel-header h3 {
    font-size: 20px;
    margin: 0;
}

.panel-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #666;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
}

.panel-close:hover {
    background-color: #f0f0f0;
}

.panel-content {
    padding: 20px;
}

.notification-item {
    display: flex;
    gap: 15px;
    padding: 15px;
    border-radius: 12px;
    background: #f8f9fa;
    margin-bottom: 12px;
    transition: background-color 0.2s ease;
    cursor: pointer;
}

.notification-item:hover {
    background: #e9ecef;
}

.notification-icon {
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-blue);
    flex-shrink: 0;
}

.notification-content {
    flex: 1;
}

.notification-content p {
    margin: 0 0 5px 0;
    color: #333;
    font-size: 14px;
    line-height: 1.5;
}

.notification-time {
    font-size: 12px;
    color: #999;
}

/* デスクトップでヘッダーアクションを表示 */
@media (min-width: 769px) {
    .mobile-actions {
        display: none !important;
    }
}
`;
document.head.appendChild(mobileMenuStyles);