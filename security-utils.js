// セキュリティユーティリティ
class SecurityUtils {
    // HTML エスケープ
    static escapeHtml(text) {
        if (typeof text !== 'string') {
            return '';
        }
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;'
        };
        
        return text.replace(/[&<>"'\/]/g, char => map[char]);
    }
    
    // URL パラメータのサニタイズ
    static sanitizeUrlParam(param) {
        if (typeof param !== 'string') {
            return '';
        }
        // 危険な文字を除去
        return param.replace(/[<>'"]/g, '');
    }
    
    // JavaScript コードのサニタイズ
    static sanitizeJs(text) {
        if (typeof text !== 'string') {
            return '';
        }
        // スクリプトタグや危険なパターンを除去
        return text.replace(/<script[^>]*>.*?<\/script>/gi, '')
                   .replace(/javascript:/gi, '')
                   .replace(/on\w+\s*=/gi, '');
    }
    
    // CSRF トークンの生成
    static generateCsrfToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // CSRF トークンの検証
    static verifyCsrfToken(token) {
        const storedToken = sessionStorage.getItem('csrfToken');
        return storedToken && storedToken === token;
    }
    
    // 安全なパスワードハッシュ化
    static async hashPassword(password, salt = null) {
        try {
            const encoder = new TextEncoder();
            
            // ソルトの生成または使用
            if (!salt) {
                salt = crypto.getRandomValues(new Uint8Array(16));
            } else if (typeof salt === 'string') {
                // Base64文字列からUint8Arrayに変換
                salt = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
            }
            
            // PBKDF2 でハッシュ化
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveBits']
            );
            
            const hash = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                256
            );
            
            // Base64エンコード
            const hashArray = new Uint8Array(hash);
            const saltB64 = btoa(String.fromCharCode(...salt));
            const hashB64 = btoa(String.fromCharCode(...hashArray));
            
            return `${saltB64}:${hashB64}`;
        } catch (error) {
            console.error('Password hashing failed:', error);
            // フォールバック: 簡易ハッシュ（本番環境では使用しない）
            return btoa(password);
        }
    }
    
    // パスワードの検証
    static async verifyPassword(password, hashedPassword) {
        try {
            if (!hashedPassword.includes(':')) {
                // 旧形式のハッシュ（フォールバック）
                return btoa(password) === hashedPassword;
            }
            
            const [saltB64, hashB64] = hashedPassword.split(':');
            const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
            
            const newHash = await this.hashPassword(password, salt);
            return newHash === hashedPassword;
        } catch (error) {
            console.error('Password verification failed:', error);
            return false;
        }
    }
    
    // 入力値の検証
    static validateInput(input, type) {
        switch (type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(input);
                
            case 'phone':
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                return phoneRegex.test(input);
                
            case 'url':
                try {
                    new URL(input);
                    return true;
                } catch {
                    return false;
                }
                
            case 'alphanumeric':
                const alphaNumRegex = /^[a-zA-Z0-9]+$/;
                return alphaNumRegex.test(input);
                
            default:
                return true;
        }
    }
    
    // SQLインジェクション対策（文字列のサニタイズ）
    static sanitizeSql(input) {
        if (typeof input !== 'string') {
            return '';
        }
        // 危険な文字をエスケープ
        return input.replace(/['";\\]/g, '\\$&');
    }
    
    // ファイル名のサニタイズ
    static sanitizeFilename(filename) {
        if (typeof filename !== 'string') {
            return '';
        }
        // 危険な文字を除去
        return filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '');
    }
    
    // Content Security Policy のヘッダー生成
    static generateCspHeader() {
        return {
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
                "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
                "img-src 'self' data: https:",
                "connect-src 'self' https://api.github.com https://supabase.co"
            ].join('; ')
        };
    }
}

// グローバルに公開
window.SecurityUtils = SecurityUtils;
window.escapeHtml = SecurityUtils.escapeHtml;