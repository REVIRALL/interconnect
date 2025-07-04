// セキュリティ設定ファイル

const SECURITY_CONFIG = {
    // セッション設定
    session: {
        timeout: 30 * 60 * 1000, // 30分
        warningTime: 5 * 60 * 1000, // 5分前に警告
        checkInterval: 60 * 1000 // 1分ごとにチェック
    },
    
    // レート制限設定
    rateLimit: {
        login: {
            maxAttempts: 3,
            windowMs: 5 * 60 * 1000, // 5分
            blockDuration: 15 * 60 * 1000 // 15分
        },
        api: {
            maxRequests: 100,
            windowMs: 15 * 60 * 1000 // 15分あたり100リクエスト
        },
        fileUpload: {
            maxUploads: 10,
            windowMs: 60 * 60 * 1000 // 1時間あたり10ファイル
        }
    },
    
    // ファイルアップロード設定
    fileUpload: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedExtensions: [
            '.jpg', '.jpeg', '.png', '.gif', '.webp',
            '.pdf', '.doc', '.docx', '.xls', '.xlsx',
            '.ppt', '.pptx', '.txt', '.csv'
        ],
        allowedMimeTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain', 'text/csv'
        ]
    },
    
    // パスワードポリシー
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        specialChars: '!@#$%^&*(),.?":{}|<>',
        preventCommon: true,
        preventUserInfo: true,
        historyCount: 5 // 過去5つのパスワードは再利用不可
    },
    
    // CORS設定
    cors: {
        allowedOrigins: [
            'https://interconnect.jp',
            'https://www.interconnect.jp'
        ],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
        credentials: true
    },
    
    // CSP（Content Security Policy）設定
    csp: {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'",
            "'unsafe-inline'", // 一時的に許可（本番では削除推奨）
            'https://cdnjs.cloudflare.com',
            'https://cdn.jsdelivr.net'
        ],
        styleSrc: [
            "'self'",
            "'unsafe-inline'", // 一時的に許可（本番では削除推奨）
            'https://fonts.googleapis.com',
            'https://cdnjs.cloudflare.com'
        ],
        fontSrc: [
            "'self'",
            'https://fonts.gstatic.com',
            'https://cdnjs.cloudflare.com'
        ],
        imgSrc: [
            "'self'",
            'data:',
            'https:',
            'blob:'
        ],
        connectSrc: [
            "'self'",
            'https://api.interconnect.jp',
            'wss://ws.interconnect.jp'
        ],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        workerSrc: ["'self'"],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: true
    },
    
    // セキュリティヘッダー
    headers: {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    },
    
    // 暗号化設定
    encryption: {
        algorithm: 'AES-GCM',
        keyLength: 256,
        saltLength: 16,
        iterations: 100000,
        tagLength: 128
    },
    
    // ログ設定
    logging: {
        enabled: true,
        level: 'info', // debug, info, warn, error
        securityEvents: true,
        retentionDays: 90,
        sensitiveDataMask: true
    },
    
    // 2要素認証設定
    twoFactor: {
        enabled: false, // 本番環境では有効化推奨
        methods: ['totp', 'sms', 'email'],
        backupCodes: 10,
        window: 1 // TOTPの許容ウィンドウ
    },
    
    // アカウントロックアウト設定
    accountLockout: {
        enabled: true,
        threshold: 5, // 5回失敗でロック
        duration: 30 * 60 * 1000, // 30分
        resetOnSuccess: true
    },
    
    // 監査ログ設定
    audit: {
        enabled: true,
        events: [
            'login', 'logout', 'password_change',
            'profile_update', 'permission_change',
            'data_export', 'data_delete',
            'admin_action', 'security_event'
        ],
        includeIpAddress: true,
        includeUserAgent: true
    }
};

// 環境に応じた設定の上書き
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // 開発環境用の設定
    SECURITY_CONFIG.session.timeout = 60 * 60 * 1000; // 1時間
    SECURITY_CONFIG.csp.scriptSrc.push("'unsafe-eval'"); // 開発時のみ
    SECURITY_CONFIG.logging.level = 'debug';
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SECURITY_CONFIG;
}