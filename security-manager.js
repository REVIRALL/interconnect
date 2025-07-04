// セキュリティ管理システム

// セキュリティ設定を読み込み
const SECURITY_CONFIG = window.SECURITY_CONFIG || {};

class SecurityManager {
    constructor() {
        this.csrfToken = this.generateCSRFToken();
        this.loginAttempts = new Map();
        this.rateLimitStore = new Map();
        this.initialize();
    }

    initialize() {
        // CSRFトークンの設定
        this.setupCSRFProtection();
        
        // XSS対策の初期化
        this.setupXSSProtection();
        
        // セキュリティヘッダーの監視
        this.monitorSecurityHeaders();
        
        // セッション管理の初期化
        this.initializeSessionManagement();
    }

    // CSRFトークン生成
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // CSRF保護の設定
    setupCSRFProtection() {
        // すべてのフォームにCSRFトークンを追加
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                if (!form.querySelector('input[name="csrf_token"]')) {
                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = 'csrf_token';
                    csrfInput.value = this.csrfToken;
                    form.appendChild(csrfInput);
                }
            });
        });

        // AJAXリクエストにCSRFトークンを追加
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
                options.headers = {
                    ...options.headers,
                    'X-CSRF-Token': this.csrfToken
                };
            }
            return originalFetch(url, options);
        };
    }

    // XSS対策
    setupXSSProtection() {
        // DOMPurifyの代替実装（簡易版）
        window.sanitizeHTML = (html) => {
            return this.sanitizeInput(html);
        };

        // 自動的にユーザー入力をサニタイズ
        document.addEventListener('DOMContentLoaded', () => {
            // テキスト入力のサニタイズ
            const textInputs = document.querySelectorAll('input[type="text"], textarea');
            textInputs.forEach(input => {
                input.addEventListener('blur', (e) => {
                    e.target.value = this.sanitizeInput(e.target.value);
                });
            });
        });
    }

    // 入力のサニタイズ
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // 危険なHTMLタグとJavaScriptを除去
        const dangerous = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        let sanitized = input.replace(dangerous, '');
        
        // イベントハンドラを除去
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        
        // 危険な属性を除去
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/vbscript:/gi, '');
        
        // HTMLエンティティのエスケープ
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };
        
        return sanitized.replace(/[&<>"'\/]/g, char => escapeMap[char]);
    }

    // レート制限
    rateLimit(identifier, action, maxAttempts = null, windowMs = null) {
        // 設定から取得
        const config = SECURITY_CONFIG.rateLimit?.[action] || {};
        maxAttempts = maxAttempts || config.maxAttempts || 5;
        windowMs = windowMs || config.windowMs || 15 * 60 * 1000;
        const key = `${identifier}:${action}`;
        const now = Date.now();
        
        if (!this.rateLimitStore.has(key)) {
            this.rateLimitStore.set(key, []);
        }
        
        const attempts = this.rateLimitStore.get(key);
        const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
        
        if (recentAttempts.length >= maxAttempts) {
            const oldestAttempt = Math.min(...recentAttempts);
            const waitTime = windowMs - (now - oldestAttempt);
            return {
                allowed: false,
                waitTime: Math.ceil(waitTime / 1000),
                message: `レート制限に達しました。${Math.ceil(waitTime / 60000)}分後に再試行してください。`
            };
        }
        
        recentAttempts.push(now);
        this.rateLimitStore.set(key, recentAttempts);
        
        return { allowed: true };
    }

    // ログイン試行の追跡
    trackLoginAttempt(email, success) {
        const rateLimitResult = this.rateLimit(email, 'login', 3, 5 * 60 * 1000);
        
        if (!rateLimitResult.allowed) {
            return rateLimitResult;
        }
        
        if (!success) {
            if (!this.loginAttempts.has(email)) {
                this.loginAttempts.set(email, []);
            }
            this.loginAttempts.get(email).push(new Date());
        } else {
            // 成功時はカウンターをリセット
            this.loginAttempts.delete(email);
            this.rateLimitStore.delete(`${email}:login`);
        }
        
        return { allowed: true };
    }

    // パスワードハッシュ化（改良版）
    async hashPassword(password) {
        // PBKDF2の簡易実装
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        
        // 実際の実装ではWeb Crypto APIのsubtle.deriveKeyを使用
        const hashBuffer = await crypto.subtle.digest('SHA-256', 
            new Uint8Array([...salt, ...data])
        );
        
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
        
        return `${saltHex}:${hashHex}`;
    }

    // パスワード検証
    async verifyPassword(password, hash) {
        const [saltHex, storedHashHex] = hash.split(':');
        const salt = new Uint8Array(saltHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
        
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', 
            new Uint8Array([...salt, ...data])
        );
        
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex === storedHashHex;
    }

    // セッション管理
    initializeSessionManagement() {
        // セッションタイムアウト（設定から取得）
        const SESSION_TIMEOUT = SECURITY_CONFIG.session?.timeout || 30 * 60 * 1000;
        let lastActivity = Date.now();
        
        // アクティビティの追跡
        ['click', 'keypress', 'mousemove', 'scroll'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
            }, { passive: true });
        });
        
        // セッションチェック
        setInterval(() => {
            if (Date.now() - lastActivity > SESSION_TIMEOUT) {
                this.handleSessionTimeout();
            }
        }, 60000); // 1分ごとにチェック
        
        // セッションIDの生成
        if (!sessionStorage.getItem('sessionId')) {
            sessionStorage.setItem('sessionId', this.generateSessionId());
        }
    }

    // セッションID生成
    generateSessionId() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // セッションタイムアウト処理
    handleSessionTimeout() {
        // セッションをクリア
        sessionStorage.clear();
        
        // ログアウト警告を表示
        if (window.auth && window.auth.isLoggedIn()) {
            alert('セッションがタイムアウトしました。再度ログインしてください。');
            window.auth.logout();
        }
    }

    // セキュリティヘッダーの監視
    monitorSecurityHeaders() {
        // Content Security Policy
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:;";
        document.head.appendChild(cspMeta);
        
        // その他のセキュリティヘッダー（metaタグで設定可能なもののみ）
        const headers = {
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        };
        
        // X-Frame-Optionsはmetaタグでは設定できないため、JSで代替手段を使用
        try {
            // フレーム内で実行されていることを検出
            if (window.self !== window.top) {
                console.warn('Page loaded in frame - frame busting disabled for development');
                // 開発環境では無効化：window.top.location = window.self.location;
            }
        } catch (e) {
            // クロスオリジンの場合はエラーが発生するが、それは正常
        }
        
        Object.entries(headers).forEach(([name, value]) => {
            const meta = document.createElement('meta');
            meta.httpEquiv = name;
            meta.content = value;
            document.head.appendChild(meta);
        });
    }

    // SQLインジェクション対策（クエリパラメータのサニタイズ）
    sanitizeQueryParam(param) {
        if (typeof param !== 'string') return param;
        
        // 危険な文字をエスケープ
        return param
            .replace(/['";\\]/g, '') // クォートとバックスラッシュを除去
            .replace(/--/g, '') // SQLコメントを除去
            .replace(/\/\*/g, '') // 複数行コメントを除去
            .replace(/\*\//g, '')
            .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, ''); // SQLキーワードを除去
    }

    // ファイルアップロードのセキュリティチェック
    validateFileUpload(file) {
        // ファイルサイズ制限（設定から取得）
        const maxSize = SECURITY_CONFIG.fileUpload?.maxSize || 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return {
                valid: false,
                message: 'ファイルサイズは10MB以下にしてください'
            };
        }
        
        // 許可される拡張子（設定から取得）
        const allowedExtensions = SECURITY_CONFIG.fileUpload?.allowedExtensions || ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
        const fileName = file.name.toLowerCase();
        const extension = fileName.substring(fileName.lastIndexOf('.'));
        
        if (!allowedExtensions.includes(extension)) {
            return {
                valid: false,
                message: '許可されていないファイル形式です'
            };
        }
        
        // MIMEタイプのチェック（設定から取得）
        const allowedMimeTypes = SECURITY_CONFIG.fileUpload?.allowedMimeTypes || [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        
        if (!allowedMimeTypes.includes(file.type)) {
            return {
                valid: false,
                message: '不正なファイル形式です'
            };
        }
        
        return { valid: true };
    }

    // 安全なランダム文字列生成
    generateSecureRandom(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // クリックジャッキング対策
    preventClickjacking() {
        if (window.self !== window.top) {
            // iframe内で実行されている場合
            document.body.style.display = 'none';
            window.top.location = window.self.location;
        }
    }

    // セキュリティログ
    logSecurityEvent(event, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            userAgent: navigator.userAgent,
            sessionId: sessionStorage.getItem('sessionId')
        };
        
        // ローカルストレージに保存（実際の実装ではサーバーに送信）
        const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
        logs.push(logEntry);
        
        // 最新100件のみ保持
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('securityLogs', JSON.stringify(logs));
    }
}

// グローバルインスタンス
const securityManager = new SecurityManager();

// クリックジャッキング対策を即座に実行
securityManager.preventClickjacking();

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}