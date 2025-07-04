// Common utilities and initialization for INTERCONNECT

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

// Ensure console methods exist (for older browsers)
if (!window.console) {
    window.console = {
        log: function() {},
        error: function() {},
        warn: function() {},
        info: function() {}
    };
}

// Common utility functions
const CommonUtils = {
    // Check if user is logged in
    isLoggedIn: function() {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser !== null;
    },

    // Get current user
    getCurrentUser: function() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    // Format date
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Format time
    formatTime: function(timeString) {
        return timeString || '';
    },

    // Show loading indicator
    showLoading: function() {
        const loader = document.getElementById('preloader');
        if (loader) {
            loader.style.display = 'flex';
        }
    },

    // Hide loading indicator
    hideLoading: function() {
        const loader = document.getElementById('preloader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Common.js initialized');
    
    // Hide any preloader that might be showing
    setTimeout(() => {
        CommonUtils.hideLoading();
    }, 500);
});

// 通知システム
function showNotification(message, type) {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // スタイルを適用
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#ffc107';
        notification.style.color = '#212529';
    } else if (type === 'info') {
        notification.style.backgroundColor = '#17a2b8';
    }
    
    document.body.appendChild(notification);
    
    // アニメーション
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自動削除
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// グローバルに公開
window.showNotification = showNotification;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ...CommonUtils, showNotification };
}