// セキュリティ関連のユーティリティ関数

/**
 * HTMLエスケープ関数（XSS対策）
 * @param {string} text - エスケープする文字列
 * @returns {string} エスケープされた文字列
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * URLパラメータのサニタイゼーション
 * @param {string} param - パラメータ値
 * @returns {string} サニタイズされた値
 */
function sanitizeUrlParam(param) {
    // 危険な文字を除去
    return param.replace(/[<>'"]/g, '');
}

/**
 * メールアドレスの検証
 * @param {string} email - 検証するメールアドレス
 * @returns {boolean} 有効なメールアドレスかどうか
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * パスワードの強度チェック
 * @param {string} password - チェックするパスワード
 * @returns {object} 強度レベルとメッセージ
 */
function checkPasswordStrength(password) {
    let strength = 0;
    const messages = [];

    if (password.length >= 8) {
        strength++;
    } else {
        messages.push('8文字以上にしてください');
    }

    if (/[a-z]/.test(password)) {
        strength++;
    } else {
        messages.push('小文字を含めてください');
    }

    if (/[A-Z]/.test(password)) {
        strength++;
    } else {
        messages.push('大文字を含めてください');
    }

    if (/[0-9]/.test(password)) {
        strength++;
    } else {
        messages.push('数字を含めてください');
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
        strength++;
    } else {
        messages.push('記号を含めてください');
    }

    const levels = ['弱い', '普通', '強い', '非常に強い', '最強'];
    return {
        level: levels[Math.min(strength - 1, 4)],
        score: strength,
        messages: messages
    };
}

/**
 * CSRFトークンの生成（デモ用）
 * @returns {string} CSRFトークン
 */
function generateCsrfToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * 入力値の長さ制限チェック
 * @param {string} value - チェックする値
 * @param {number} maxLength - 最大長
 * @returns {boolean} 制限内かどうか
 */
function checkMaxLength(value, maxLength) {
    return value.length <= maxLength;
}

/**
 * SQLインジェクション対策用の基本的なサニタイゼーション
 * 注意：実際のプロダクションではプリペアドステートメントを使用すること
 * @param {string} input - サニタイズする文字列
 * @returns {string} サニタイズされた文字列
 */
function sanitizeSqlInput(input) {
    return input.replace(/['";\\]/g, '');
}

/**
 * ファイル名のサニタイゼーション
 * @param {string} filename - ファイル名
 * @returns {string} サニタイズされたファイル名
 */
function sanitizeFilename(filename) {
    // 危険な文字を除去
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * JSONの安全なパース
 * @param {string} jsonString - パースするJSON文字列
 * @returns {object|null} パースされたオブジェクトまたはnull
 */
function safeJsonParse(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('JSON parse error:', e);
        return null;
    }
}

/**
 * ローカルストレージへの安全な保存
 * @param {string} key - キー
 * @param {any} value - 保存する値
 */
function safeLocalStorageSet(key, value) {
    try {
        const sanitizedKey = sanitizeUrlParam(key);
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(sanitizedKey, stringValue);
    } catch (e) {
        console.error('LocalStorage set error:', e);
    }
}

/**
 * ローカルストレージからの安全な取得
 * @param {string} key - キー
 * @returns {any} 取得した値
 */
function safeLocalStorageGet(key) {
    try {
        const sanitizedKey = sanitizeUrlParam(key);
        const value = localStorage.getItem(sanitizedKey);
        return value ? safeJsonParse(value) || value : null;
    } catch (e) {
        console.error('LocalStorage get error:', e);
        return null;
    }
}

/**
 * イベントリスナーの安全な追加（メモリリーク対策）
 * @param {Element} element - 要素
 * @param {string} event - イベント名
 * @param {Function} handler - ハンドラー関数
 * @returns {Function} リスナーを削除する関数
 */
function safeAddEventListener(element, event, handler) {
    if (!element || typeof handler !== 'function') {
        return () => {};
    }
    
    element.addEventListener(event, handler);
    
    // クリーンアップ関数を返す
    return () => {
        element.removeEventListener(event, handler);
    };
}

// グローバルに公開
window.SecurityUtils = {
    escapeHtml,
    sanitizeUrlParam,
    validateEmail,
    checkPasswordStrength,
    generateCsrfToken,
    checkMaxLength,
    sanitizeSqlInput,
    sanitizeFilename,
    safeJsonParse,
    safeLocalStorageSet,
    safeLocalStorageGet,
    safeAddEventListener
};