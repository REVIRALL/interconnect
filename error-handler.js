// グローバルエラーハンドリング
class ErrorHandler {
    static instance = null;
    
    constructor() {
        if (ErrorHandler.instance) {
            return ErrorHandler.instance;
        }
        
        this.errors = [];
        this.setupGlobalHandlers();
        ErrorHandler.instance = this;
    }
    
    static getInstance() {
        if (!this.instance) {
            this.instance = new ErrorHandler();
        }
        return this.instance;
    }
    
    setupGlobalHandlers() {
        // グローバルエラーハンドラー
        window.addEventListener('error', (event) => {
            this.handleError({
                message: event.message,
                source: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        // Promise rejection ハンドラー
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                message: 'Unhandled Promise Rejection',
                error: event.reason
            });
        });
    }
    
    handleError(errorInfo) {
        // エラーログに記録
        this.errors.push({
            ...errorInfo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
        
        // 開発環境ではコンソールに出力
        if (this.isDevelopment()) {
            console.error('Error caught:', errorInfo);
        }
        
        // ユーザーフレンドリーなエラーメッセージを表示
        this.showUserError(errorInfo);
        
        // エラーレポートの送信（本番環境）
        if (!this.isDevelopment()) {
            this.reportError(errorInfo);
        }
    }
    
    showUserError(errorInfo) {
        let message = 'エラーが発生しました。';
        
        // エラータイプに応じたメッセージ
        if (errorInfo.error) {
            if (errorInfo.error.name === 'NetworkError' || errorInfo.message.includes('fetch')) {
                message = 'ネットワークエラーが発生しました。接続を確認してください。';
            } else if (errorInfo.error.name === 'TypeError') {
                message = 'システムエラーが発生しました。ページを再読み込みしてください。';
            } else if (errorInfo.error.name === 'SecurityError') {
                message = 'セキュリティエラーが発生しました。';
            }
        }
        
        // 通知表示
        if (window.showError) {
            window.showError(message, 5000);
        } else {
            console.error(message);
        }
    }
    
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:';
    }
    
    reportError(errorInfo) {
        // エラーレポートをサーバーに送信（実装例）
        // 実際の本番環境では、Sentry等のエラー監視サービスを使用
        const errorReport = {
            ...errorInfo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            user: this.getCurrentUser()
        };
        
        // ローカルストレージに保存（オフライン対応）
        const errors = JSON.parse(localStorage.getItem('errorReports') || '[]');
        errors.push(errorReport);
        if (errors.length > 100) {
            errors.shift(); // 古いエラーを削除
        }
        localStorage.setItem('errorReports', JSON.stringify(errors));
    }
    
    getCurrentUser() {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            return {
                id: user.id,
                email: user.email
            };
        } catch {
            return null;
        }
    }
    
    // 手動でエラーを記録
    logError(error, context = {}) {
        this.handleError({
            message: error.message || error,
            error: error,
            context: context
        });
    }
    
    // エラーログをクリア
    clearErrors() {
        this.errors = [];
        localStorage.removeItem('errorReports');
    }
    
    // エラーログを取得
    getErrors() {
        return this.errors;
    }
}

// APIコール用のラッパー関数
async function safeApiCall(url, options = {}) {
    try {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'same-origin'
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    } catch (error) {
        // エラーハンドリング
        ErrorHandler.getInstance().logError(error, { url, options });
        
        // ネットワークエラーの場合
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('ネットワークエラーが発生しました');
        }
        
        // その他のエラー
        throw error;
    }
}

// Try-Catchラッパー
function tryCatch(fn, errorHandler = null) {
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            if (errorHandler) {
                return errorHandler(error);
            }
            ErrorHandler.getInstance().logError(error);
            throw error;
        }
    };
}

// デバウンス付きエラーハンドリング
function debounceWithErrorHandling(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            try {
                func(...args);
            } catch (error) {
                ErrorHandler.getInstance().logError(error);
            }
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// グローバルに公開
window.ErrorHandler = ErrorHandler;
window.safeApiCall = safeApiCall;
window.tryCatch = tryCatch;

// 初期化
ErrorHandler.getInstance();