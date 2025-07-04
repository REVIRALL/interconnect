// 統一された通知管理システム
class NotificationManager {
    static instance = null;
    
    constructor() {
        if (NotificationManager.instance) {
            return NotificationManager.instance;
        }
        
        this.notifications = [];
        this.container = this.createContainer();
        NotificationManager.instance = this;
    }
    
    static getInstance() {
        if (!this.instance) {
            this.instance = new NotificationManager();
        }
        return this.instance;
    }
    
    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        return container;
    }
    
    show(message, type = 'info', duration = 5000, options = {}) {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const notification = this.createNotification(id, message, type, options);
        
        this.container.appendChild(notification);
        this.notifications.push({ id, element: notification });
        
        // アニメーション
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });
        
        // 自動削除
        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
        
        return id;
    }
    
    createNotification(id, message, type, options) {
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `notification notification-${type}`;
        
        // XSS対策: テキストコンテンツとして設定
        const messageEl = document.createElement('div');
        messageEl.className = 'notification-message';
        messageEl.textContent = message;
        
        // スタイル設定
        const colors = {
            success: { bg: '#4caf50', text: '#ffffff' },
            error: { bg: '#f44336', text: '#ffffff' },
            warning: { bg: '#ff9800', text: '#ffffff' },
            info: { bg: '#2196f3', text: '#ffffff' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            position: relative;
            margin-bottom: 10px;
            padding: 16px 20px;
            background: ${color.bg};
            color: ${color.text};
            border-radius: 8px;
            box-shadow: 0 3px 12px rgba(0,0,0,0.15);
            pointer-events: auto;
            cursor: pointer;
            transform: translateX(120%);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
            max-width: 100%;
        `;
        
        // アイコン追加
        if (options.icon !== false) {
            const icon = document.createElement('i');
            const iconClasses = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                warning: 'fas fa-exclamation-triangle',
                info: 'fas fa-info-circle'
            };
            icon.className = iconClasses[type] || iconClasses.info;
            icon.style.fontSize = '20px';
            notification.appendChild(icon);
        }
        
        notification.appendChild(messageEl);
        
        // 閉じるボタン
        if (options.closable !== false) {
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.cssText = `
                position: absolute;
                top: 4px;
                right: 8px;
                background: none;
                border: none;
                color: ${color.text};
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.8;
                transition: opacity 0.2s;
            `;
            closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
            closeBtn.onmouseout = () => closeBtn.style.opacity = '0.8';
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                this.remove(id);
            };
            notification.appendChild(closeBtn);
        }
        
        // クリックで削除
        notification.onclick = () => this.remove(id);
        
        return notification;
    }
    
    remove(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index === -1) return;
        
        const notification = this.notifications[index];
        notification.element.style.transform = 'translateX(120%)';
        notification.element.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.splice(index, 1);
        }, 300);
    }
    
    clear() {
        this.notifications.forEach(n => this.remove(n.id));
    }
    
    // 便利なメソッド
    success(message, duration = 5000, options = {}) {
        return this.show(message, 'success', duration, options);
    }
    
    error(message, duration = 5000, options = {}) {
        return this.show(message, 'error', duration, options);
    }
    
    warning(message, duration = 5000, options = {}) {
        return this.show(message, 'warning', duration, options);
    }
    
    info(message, duration = 5000, options = {}) {
        return this.show(message, 'info', duration, options);
    }
}

// グローバル関数として公開
window.showNotification = function(message, type = 'info', duration = 5000, options = {}) {
    return NotificationManager.getInstance().show(message, type, duration, options);
};

// エイリアス
window.showSuccess = function(message, duration, options) {
    return NotificationManager.getInstance().success(message, duration, options);
};

window.showError = function(message, duration, options) {
    return NotificationManager.getInstance().error(message, duration, options);
};

window.showWarning = function(message, duration, options) {
    return NotificationManager.getInstance().warning(message, duration, options);
};

window.showInfo = function(message, duration, options) {
    return NotificationManager.getInstance().info(message, duration, options);
};