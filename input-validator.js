// 入力検証ユーティリティ

class InputValidator {
    constructor() {
        this.validationRules = {
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '有効なメールアドレスを入力してください'
            },
            phone: {
                pattern: /^[0-9\-\(\)\+\s]+$/,
                message: '有効な電話番号を入力してください'
            },
            url: {
                pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
                message: '有効なURLを入力してください'
            },
            alphanumeric: {
                pattern: /^[a-zA-Z0-9]+$/,
                message: '英数字のみ使用できます'
            },
            japanese: {
                pattern: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\s]+$/,
                message: '日本語のみ使用できます'
            }
        };
    }

    // 汎用バリデーション
    validate(value, rules) {
        const errors = [];

        // 必須チェック
        if (rules.required && !value) {
            errors.push('この項目は必須です');
        }

        // 最小長チェック
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${rules.minLength}文字以上入力してください`);
        }

        // 最大長チェック
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${rules.maxLength}文字以下で入力してください`);
        }

        // パターンチェック
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(rules.patternMessage || '入力形式が正しくありません');
        }

        // カスタムバリデーション
        if (rules.custom && typeof rules.custom === 'function') {
            const customError = rules.custom(value);
            if (customError) {
                errors.push(customError);
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // メールアドレスバリデーション
    validateEmail(email) {
        const rule = this.validationRules.email;
        
        if (!email) {
            return { valid: false, error: 'メールアドレスを入力してください' };
        }
        
        if (!rule.pattern.test(email)) {
            return { valid: false, error: rule.message };
        }
        
        // 追加のチェック
        if (email.length > 254) {
            return { valid: false, error: 'メールアドレスが長すぎます' };
        }
        
        return { valid: true };
    }

    // 電話番号バリデーション
    validatePhone(phone) {
        const rule = this.validationRules.phone;
        
        if (!phone) {
            return { valid: false, error: '電話番号を入力してください' };
        }
        
        // 数字とハイフン、括弧、プラス記号のみ許可
        if (!rule.pattern.test(phone)) {
            return { valid: false, error: rule.message };
        }
        
        // 最小桁数チェック
        const digits = phone.replace(/[^0-9]/g, '');
        if (digits.length < 10) {
            return { valid: false, error: '電話番号の桁数が不足しています' };
        }
        
        return { valid: true };
    }

    // パスワードバリデーション
    validatePassword(password, confirmPassword = null) {
        const errors = [];
        
        if (!password) {
            return { valid: false, errors: ['パスワードを入力してください'] };
        }
        
        // 長さチェック
        if (password.length < 8) {
            errors.push('パスワードは8文字以上必要です');
        }
        
        // 複雑性チェック
        if (!/[A-Z]/.test(password)) {
            errors.push('大文字を含めてください');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('小文字を含めてください');
        }
        
        if (!/[0-9]/.test(password)) {
            errors.push('数字を含めてください');
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('特殊文字を含めてください');
        }
        
        // 確認パスワードチェック
        if (confirmPassword !== null && password !== confirmPassword) {
            errors.push('パスワードが一致しません');
        }
        
        // 一般的な弱いパスワードのチェック
        const weakPasswords = ['password', '12345678', 'password123', 'admin123'];
        if (weakPasswords.includes(password.toLowerCase())) {
            errors.push('このパスワードは安全ではありません');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // URL バリデーション
    validateURL(url) {
        const rule = this.validationRules.url;
        
        if (!url) {
            return { valid: false, error: 'URLを入力してください' };
        }
        
        if (!rule.pattern.test(url)) {
            return { valid: false, error: rule.message };
        }
        
        return { valid: true };
    }

    // 日付バリデーション
    validateDate(date, options = {}) {
        if (!date) {
            return { valid: false, error: '日付を入力してください' };
        }
        
        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            return { valid: false, error: '有効な日付を入力してください' };
        }
        
        // 最小日付チェック
        if (options.minDate && dateObj < new Date(options.minDate)) {
            return { valid: false, error: `${options.minDate}以降の日付を選択してください` };
        }
        
        // 最大日付チェック
        if (options.maxDate && dateObj > new Date(options.maxDate)) {
            return { valid: false, error: `${options.maxDate}以前の日付を選択してください` };
        }
        
        return { valid: true };
    }

    // 数値バリデーション
    validateNumber(value, options = {}) {
        if (value === '' || value === null || value === undefined) {
            return { valid: false, error: '数値を入力してください' };
        }
        
        const num = Number(value);
        
        if (isNaN(num)) {
            return { valid: false, error: '有効な数値を入力してください' };
        }
        
        // 最小値チェック
        if (options.min !== undefined && num < options.min) {
            return { valid: false, error: `${options.min}以上の値を入力してください` };
        }
        
        // 最大値チェック
        if (options.max !== undefined && num > options.max) {
            return { valid: false, error: `${options.max}以下の値を入力してください` };
        }
        
        // 整数チェック
        if (options.integer && !Number.isInteger(num)) {
            return { valid: false, error: '整数を入力してください' };
        }
        
        return { valid: true };
    }

    // ファイルバリデーション
    validateFile(file, options = {}) {
        if (!file) {
            return { valid: false, error: 'ファイルを選択してください' };
        }
        
        // サイズチェック
        const maxSize = options.maxSize || 10 * 1024 * 1024; // デフォルト10MB
        if (file.size > maxSize) {
            const sizeMB = Math.round(maxSize / 1024 / 1024);
            return { valid: false, error: `ファイルサイズは${sizeMB}MB以下にしてください` };
        }
        
        // 拡張子チェック
        if (options.allowedExtensions) {
            const fileName = file.name.toLowerCase();
            const extension = fileName.substring(fileName.lastIndexOf('.'));
            
            if (!options.allowedExtensions.includes(extension)) {
                return { 
                    valid: false, 
                    error: `許可されているファイル形式: ${options.allowedExtensions.join(', ')}`
                };
            }
        }
        
        // MIMEタイプチェック
        if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.type)) {
            return { valid: false, error: '許可されていないファイル形式です' };
        }
        
        return { valid: true };
    }

    // クレジットカード番号バリデーション（Luhnアルゴリズム）
    validateCreditCard(cardNumber) {
        if (!cardNumber) {
            return { valid: false, error: 'カード番号を入力してください' };
        }
        
        // 数字以外を除去
        const cleaned = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
        
        if (!/^\d+$/.test(cleaned)) {
            return { valid: false, error: '有効なカード番号を入力してください' };
        }
        
        if (cleaned.length < 13 || cleaned.length > 19) {
            return { valid: false, error: 'カード番号の桁数が正しくありません' };
        }
        
        // Luhnアルゴリズム
        let sum = 0;
        let isEven = false;
        
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned.charAt(i), 10);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        if (sum % 10 !== 0) {
            return { valid: false, error: '有効なカード番号を入力してください' };
        }
        
        return { valid: true };
    }

    // フォーム全体のバリデーション
    validateForm(formData, validationRules) {
        const errors = {};
        let isValid = true;
        
        for (const [fieldName, rules] of Object.entries(validationRules)) {
            const value = formData[fieldName];
            const result = this.validate(value, rules);
            
            if (!result.valid) {
                errors[fieldName] = result.errors;
                isValid = false;
            }
        }
        
        return {
            valid: isValid,
            errors: errors
        };
    }

    // リアルタイムバリデーションの設定
    setupRealtimeValidation(formElement, validationRules) {
        const inputs = formElement.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const fieldName = input.name;
            const rules = validationRules[fieldName];
            
            if (!rules) return;
            
            // フォーカスアウト時のバリデーション
            input.addEventListener('blur', () => {
                this.validateField(input, rules);
            });
            
            // 入力時のバリデーション（デバウンス付き）
            let timeout;
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.validateField(input, rules);
                }, 500);
            });
        });
    }

    // フィールドのバリデーションと表示
    validateField(input, rules) {
        const value = input.value;
        const result = this.validate(value, rules);
        const errorElement = input.parentElement.querySelector('.error-message');
        
        if (result.valid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
            if (errorElement) {
                errorElement.textContent = result.errors[0];
                errorElement.style.display = 'block';
            }
        }
        
        return result.valid;
    }
}

// グローバルインスタンス
const inputValidator = new InputValidator();

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputValidator;
}