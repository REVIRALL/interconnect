/**
 * 自動同期システム
 * GitHubとローカルフォルダの自動更新
 */

class AutoSyncSystem {
    constructor() {
        this.syncInterval = 5 * 60 * 1000; // 5分間隔
        this.isRunning = false;
        this.lastSync = null;
        this.init();
    }

    init() {
        console.log('🔄 自動同期システム開始');
        
        // ページ読み込み時にチェック
        this.checkForUpdates();
        
        // 定期的な同期
        this.startAutoSync();
        
        // ページ離脱時の処理
        window.addEventListener('beforeunload', () => {
            this.stopAutoSync();
        });
    }

    async checkForUpdates() {
        try {
            console.log('📡 アップデートをチェック中...');
            
            // GitHub APIで最新コミットを取得
            const response = await fetch('https://api.github.com/repos/REVIRALL/interconnect/commits/main');
            const latestCommit = await response.json();
            
            if (latestCommit.sha !== this.getLocalCommitHash()) {
                console.log('🆕 新しいアップデートが利用可能です');
                this.notifyUpdate(latestCommit);
            } else {
                console.log('✅ 最新状態です');
            }
            
            this.lastSync = new Date();
        } catch (error) {
            console.error('❌ アップデートチェックエラー:', error);
        }
    }

    getLocalCommitHash() {
        // ローカルコミットハッシュを取得（実際の実装では別の方法が必要）
        return localStorage.getItem('local_commit_hash') || 'unknown';
    }

    notifyUpdate(commit) {
        // 更新通知を表示
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🆕 新しいアップデート</h3>
                <p>${commit.commit.message}</p>
                <div class="notification-actions">
                    <button onclick="autoSyncSystem.applyUpdate()" class="btn btn-primary">
                        更新を適用
                    </button>
                    <button onclick="autoSyncSystem.dismissNotification()" class="btn btn-secondary">
                        後で
                    </button>
                </div>
            </div>
        `;
        
        // 通知スタイル
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
    }

    applyUpdate() {
        console.log('🔄 アップデートを適用中...');
        
        // 実際の更新処理
        this.performUpdate();
        
        // 通知を削除
        this.dismissNotification();
    }

    async performUpdate() {
        try {
            // Service Worker経由でキャッシュを更新
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.update();
            }
            
            // ページを再読み込み
            window.location.reload();
        } catch (error) {
            console.error('❌ 更新エラー:', error);
        }
    }

    dismissNotification() {
        const notification = document.querySelector('.update-notification');
        if (notification) {
            notification.remove();
        }
    }

    startAutoSync() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.syncTimer = setInterval(() => {
            this.checkForUpdates();
        }, this.syncInterval);
        
        console.log('✅ 自動同期開始（5分間隔）');
    }

    stopAutoSync() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
        
        console.log('⏹️ 自動同期停止');
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            lastSync: this.lastSync,
            syncInterval: this.syncInterval / 1000 / 60 // 分単位
        };
    }
}

// 自動起動
window.autoSyncSystem = new AutoSyncSystem();

// 手動同期関数
window.manualSync = () => {
    window.autoSyncSystem.checkForUpdates();
};

// CSS追加
const style = document.createElement('style');
style.textContent = `
    .update-notification {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .notification-content h3 {
        margin: 0 0 10px 0;
        color: #333;
    }
    
    .notification-content p {
        margin: 0 0 15px 0;
        color: #666;
        font-size: 14px;
    }
    
    .notification-actions {
        display: flex;
        gap: 10px;
    }
    
    .notification-actions .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .notification-actions .btn-primary {
        background: #007bff;
        color: white;
    }
    
    .notification-actions .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .notification-actions .btn:hover {
        opacity: 0.9;
    }
`;
document.head.appendChild(style);