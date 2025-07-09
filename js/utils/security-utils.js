/**
 * セキュリティユーティリティ
 * XSS攻撃を防ぐための安全な DOM 操作関数
 */

class SecurityUtils {
    /**
     * HTMLエスケープ
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 安全なHTML挿入
     * innerHTMLの代替
     */
    static safeSetHTML(element, htmlString) {
        // HTMLをサニタイズ
        const sanitized = this.sanitizeHTML(htmlString);
        element.innerHTML = sanitized;
    }

    /**
     * HTMLサニタイズ
     */
    static sanitizeHTML(html) {
        // 危険なタグを除去
        const dangerousTags = /<script[^>]*>.*?<\/script>/gi;
        const dangerousEvents = /on\w+\s*=\s*["'][^"']*["']/gi;
        const dangerousUrls = /javascript:|data:|vbscript:/gi;
        
        return html
            .replace(dangerousTags, '')
            .replace(dangerousEvents, '')
            .replace(dangerousUrls, '#');
    }

    /**
     * 安全なテキスト挿入
     * textContentを使用
     */
    static safeSetText(element, text) {
        element.textContent = text;
    }

    /**
     * 安全な要素作成
     */
    static createElement(tagName, options = {}) {
        const element = document.createElement(tagName);
        
        // 属性を安全に設定
        if (options.text) {
            element.textContent = options.text;
        }
        
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                // 危険な属性をチェック
                if (!key.startsWith('on') && key !== 'href' || this.isSafeUrl(value)) {
                    element.setAttribute(key, value);
                }
            });
        }
        
        return element;
    }

    /**
     * 安全なURL判定
     */
    static isSafeUrl(url) {
        if (!url) return false;
        const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
        try {
            const urlObj = new URL(url, window.location.origin);
            return safeProtocols.includes(urlObj.protocol);
        } catch (e) {
            return false;
        }
    }

    /**
     * CSPヘッダーの設定確認
     */
    static checkCSP() {
        const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
        if (metaTags.length === 0) {
            console.warn('⚠️ CSP (Content Security Policy) が設定されていません。');
            return false;
        }
        return true;
    }

    /**
     * XSS攻撃のパターン検出
     */
    static detectXSSPatterns(input) {
        const xssPatterns = [
            /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            /expression\s*\(/gi
        ];
        
        return xssPatterns.some(pattern => pattern.test(input));
    }

    /**
     * フォーム入力の検証
     */
    static validateInput(input, type = 'text') {
        if (this.detectXSSPatterns(input)) {
            throw new Error('不正な入力が検出されました');
        }
        
        switch (type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(input);
            case 'url':
                return this.isSafeUrl(input);
            case 'text':
            default:
                return true;
        }
    }
}

// グローバルに公開
window.SecurityUtils = SecurityUtils;