// フォームバリデーション用のユーティリティ

// グローバル設定
const ValidationConfig = {
    messages: {
        required: 'この項目は必須です',
        email: '有効なメールアドレスを入力してください',
        minLength: '最低{min}文字以上入力してください',
        maxLength: '最大{max}文字以内で入力してください',
        pattern: '正しい形式で入力してください',
        passwordMatch: 'パスワードが一致しません',
        passwordStrength: 'パスワードが弱すぎます',
        phoneNumber: '有効な電話番号を入力してください',
        url: '有効なURLを入力してください',
        number: '数値を入力してください',
        min: '{min}以上の値を入力してください',
        max: '{max}以下の値を入力してください'
    }
};

// バリデーションルール
const ValidationRules = {
    required: (value) => {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },
    
    email: (value) => {
        if (!value) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },
    
    minLength: (value, min) => {
        if (!value) return true;
        return value.toString().length >= min;
    },
    
    maxLength: (value, max) => {
        if (!value) return true;
        return value.toString().length <= max;
    },
    
    pattern: (value, pattern) => {
        if (!value) return true;
        const regex = new RegExp(pattern);
        return regex.test(value);
    },
    
    phoneNumber: (value) => {
        if (!value) return true;
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    },
    
    url: (value) => {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },
    
    number: (value) => {
        if (!value) return true;
        return !isNaN(value) && isFinite(value);
    },
    
    min: (value, min) => {
        if (!value) return true;
        return Number(value) >= Number(min);
    },
    
    max: (value, max) => {
        if (!value) return true;
        return Number(value) <= Number(max);
    }
};

// フォームバリデータークラス
class FormValidator {
    constructor(formElement, rules) {
        this.form = formElement;
        this.rules = rules;
        this.errors = {};
        this.isSubmitting = false;
        
        this.init();
    }
    
    init() {
        // フォーム送信時のバリデーション
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // リアルタイムバリデーション
        Object.keys(this.rules).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => {
                    if (this.errors[fieldName]) {
                        this.validateField(fieldName);
                    }
                });
            }
        });
    }
    
    validateField(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return true;
        
        const value = field.value;
        const fieldRules = this.rules[fieldName];
        let isValid = true;
        let errorMessage = '';
        
        // 各ルールをチェック
        for (const rule of fieldRules) {
            if (rule.rule === 'required' && !ValidationRules.required(value)) {
                isValid = false;
                errorMessage = rule.message || ValidationConfig.messages.required;
                break;
            }
            
            if (rule.rule === 'email' && !ValidationRules.email(value)) {
                isValid = false;
                errorMessage = rule.message || ValidationConfig.messages.email;
                break;
            }
            
            if (rule.rule === 'minLength' && !ValidationRules.minLength(value, rule.value)) {
                isValid = false;
                errorMessage = rule.message || ValidationConfig.messages.minLength.replace('{min}', rule.value);
                break;
            }
            
            if (rule.rule === 'maxLength' && !ValidationRules.maxLength(value, rule.value)) {
                isValid = false;
                errorMessage = rule.message || ValidationConfig.messages.maxLength.replace('{max}', rule.value);
                break;
            }
            
            if (rule.rule === 'pattern' && !ValidationRules.pattern(value, rule.value)) {
                isValid = false;
                errorMessage = rule.message || ValidationConfig.messages.pattern;
                break;
            }
            
            if (rule.rule === 'custom' && typeof rule.validator === 'function') {
                const result = rule.validator(value, this.form);
                if (result !== true) {
                    isValid = false;
                    errorMessage = result || rule.message || 'バリデーションエラー';
                    break;
                }
            }
        }
        
        // エラー表示の更新
        if (isValid) {
            delete this.errors[fieldName];
            this.clearFieldError(field);
        } else {
            this.errors[fieldName] = errorMessage;
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    validateForm() {
        let isValid = true;
        
        Object.keys(this.rules).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    showFieldError(field, message) {
        // エラークラスを追加
        field.classList.add('error');
        
        // 既存のエラーメッセージを削除
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // 新しいエラーメッセージを追加
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        field.parentElement.appendChild(errorElement);
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        this.isSubmitting = true;
        const submitButton = this.form.querySelector('[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : '';
        
        if (submitButton) {
            submitButton.disabled = true;
            // ログインフォームの場合は専用のテキストを表示
            if (this.form.id === 'loginForm') {
                submitButton.textContent = 'ログイン中...';
            } else if (this.form.id === 'registerForm') {
                submitButton.textContent = '登録中...';
            } else {
                submitButton.textContent = '送信中...';
            }
        }
        
        // バリデーション実行
        if (this.validateForm()) {
            // カスタムサブミットハンドラーがある場合は実行
            if (this.onSubmit) {
                this.onSubmit(this.getFormData())
                    .then(() => {
                        this.form.reset();
                        this.errors = {};
                        if (this.onSuccess) {
                            this.onSuccess();
                        }
                    })
                    .catch((error) => {
                        if (this.onError) {
                            this.onError(error);
                        }
                    })
                    .finally(() => {
                        this.isSubmitting = false;
                        if (submitButton) {
                            submitButton.disabled = false;
                            submitButton.textContent = originalText;
                        }
                    });
            } else {
                // デフォルトの送信処理
                this.form.submit();
            }
        } else {
            this.isSubmitting = false;
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
            
            // 最初のエラーフィールドにフォーカス
            const firstErrorField = this.form.querySelector('.error');
            if (firstErrorField) {
                firstErrorField.focus();
            }
        }
    }
    
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
    
    setSubmitHandler(handler) {
        this.onSubmit = handler;
    }
    
    setSuccessHandler(handler) {
        this.onSuccess = handler;
    }
    
    setErrorHandler(handler) {
        this.onError = handler;
    }
}

// 特定フォーム用のバリデーション設定

// 登録フォーム
function setupRegisterFormValidation() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    const validator = new FormValidator(form, {
        name: [
            { rule: 'required' },
            { rule: 'minLength', value: 2, message: '名前は2文字以上入力してください' }
        ],
        email: [
            { rule: 'required' },
            { rule: 'email' }
        ],
        password: [
            { rule: 'required' },
            { rule: 'minLength', value: 8, message: 'パスワードは8文字以上にしてください' },
            { 
                rule: 'custom', 
                validator: (value) => {
                    const strength = window.SecurityUtils?.checkPasswordStrength(value);
                    if (strength && strength.score < 3) {
                        return 'パスワードが弱すぎます。大文字、小文字、数字、記号を含めてください';
                    }
                    return true;
                }
            }
        ],
        confirmPassword: [
            { rule: 'required' },
            {
                rule: 'custom',
                validator: (value, form) => {
                    const password = form.querySelector('[name="password"]').value;
                    return value === password || 'パスワードが一致しません';
                }
            }
        ],
        companyName: [
            { rule: 'required' }
        ],
        position: [
            { rule: 'required' }
        ],
        phone: [
            { rule: 'phoneNumber', message: '有効な電話番号を入力してください' }
        ],
        revenue: [
            { rule: 'required' }
        ],
        budget: [
            { rule: 'required' }
        ],
        challenges: [
            { rule: 'required' },
            { rule: 'minLength', value: 150, message: '事業課題は150文字以上で記入してください' }
        ],
        terms: [
            {
                rule: 'custom',
                validator: (value) => {
                    const checkbox = document.querySelector('[name="terms"]');
                    return checkbox.checked || '利用規約に同意してください';
                }
            }
        ]
    });
    
    return validator;
}

// ログインフォーム
function setupLoginFormValidation() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    const validator = new FormValidator(form, {
        email: [
            { rule: 'required' },
            { rule: 'email' }
        ],
        password: [
            { rule: 'required' }
        ]
    });
    
    return validator;
}

// お問い合わせフォーム
function setupContactFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const validator = new FormValidator(form, {
        name: [
            { rule: 'required' }
        ],
        company: [
            { rule: 'required' }
        ],
        email: [
            { rule: 'required' },
            { rule: 'email' }
        ],
        phone: [
            { rule: 'phoneNumber' }
        ],
        message: [
            { rule: 'required' },
            { rule: 'minLength', value: 10, message: 'お問い合わせ内容は10文字以上入力してください' }
        ]
    });
    
    return validator;
}

// グローバルに公開
window.FormValidator = FormValidator;
window.setupRegisterFormValidation = setupRegisterFormValidation;
window.setupLoginFormValidation = setupLoginFormValidation;
window.setupContactFormValidation = setupContactFormValidation;