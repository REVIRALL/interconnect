// パスワードリセット機能

class PasswordResetManager {
    constructor() {
        this.token = this.getTokenFromURL();
        this.passwordRequirements = {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false
        };
        
        this.initialize();
    }

    initialize() {
        // トークンの検証
        if (!this.validateToken()) {
            this.showInvalidTokenError();
            return;
        }

        this.setupEventListeners();
    }

    // URLからトークンを取得
    getTokenFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('token');
    }

    // トークンの検証
    validateToken() {
        if (!this.token) {
            return false;
        }

        // トークンの形式チェック（実際の実装では署名検証など）
        const tokenRegex = /^[a-zA-Z0-9-_]{32,}$/;
        if (!tokenRegex.test(this.token)) {
            return false;
        }

        // トークンの有効期限チェック（デモ用）
        const tokenData = this.decodeToken(this.token);
        if (tokenData && tokenData.expires) {
            const expiryDate = new Date(tokenData.expires);
            return expiryDate > new Date();
        }

        return true;
    }

    // トークンのデコード（デモ用）
    decodeToken(token) {
        try {
            // 実際の実装ではJWTなどを使用
            const mockData = {
                email: 'user@example.com',
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            return mockData;
        } catch (error) {
            console.error('Token decode error:', error);
            return null;
        }
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // フォーム送信
        const form = document.getElementById('resetPasswordForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // パスワード入力の監視
        const newPasswordInput = document.getElementById('newPassword');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
            newPasswordInput.addEventListener('input', (e) => this.validatePasswords());
        }

        // 確認パスワードの監視
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => this.validatePasswords());
        }
    }

    // パスワード強度チェック
    checkPasswordStrength(password) {
        // 要件チェック
        this.passwordRequirements.length = password.length >= 8;
        this.passwordRequirements.uppercase = /[A-Z]/.test(password);
        this.passwordRequirements.lowercase = /[a-z]/.test(password);
        this.passwordRequirements.number = /[0-9]/.test(password);
        this.passwordRequirements.special = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        // 要件の表示更新
        this.updateRequirementDisplay();

        // 強度の計算
        const strength = this.calculateStrength();
        this.updateStrengthDisplay(strength);
    }

    // 要件表示の更新
    updateRequirementDisplay() {
        Object.keys(this.passwordRequirements).forEach(req => {
            const element = document.getElementById(`req-${req}`);
            if (element) {
                if (this.passwordRequirements[req]) {
                    element.classList.add('valid');
                } else {
                    element.classList.remove('valid');
                }
            }
        });
    }

    // 強度計算
    calculateStrength() {
        const validRequirements = Object.values(this.passwordRequirements).filter(v => v).length;
        
        if (validRequirements <= 2) return 'weak';
        if (validRequirements <= 4) return 'medium';
        return 'strong';
    }

    // 強度表示の更新
    updateStrengthDisplay(strength) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');

        if (strengthFill) {
            strengthFill.className = `strength-fill ${strength}`;
        }

        if (strengthText) {
            strengthText.className = `strength-text ${strength}`;
            const strengthLabels = {
                weak: '弱い',
                medium: '普通',
                strong: '強い'
            };
            strengthText.textContent = `パスワード強度: ${strengthLabels[strength]}`;
        }
    }

    // パスワード一致確認
    validatePasswords() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmError = document.getElementById('confirmError');

        if (confirmPassword && newPassword !== confirmPassword) {
            confirmError.textContent = 'パスワードが一致しません';
            confirmError.classList.add('show');
            return false;
        } else {
            confirmError.textContent = '';
            confirmError.classList.remove('show');
            return true;
        }
    }

    // フォーム送信処理
    async handleSubmit(e) {
        e.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // バリデーション
        if (!this.validateForm(newPassword, confirmPassword)) {
            return;
        }

        // ボタンを無効化
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>変更中...</span> <i class="fas fa-spinner fa-spin"></i>';

        try {
            // パスワードリセットAPI呼び出し（デモ）
            await this.resetPassword(newPassword);

            // 成功モーダル表示
            document.getElementById('successModal').style.display = 'flex';
        } catch (error) {
            this.showError('パスワードの変更に失敗しました。もう一度お試しください。');
            
            // ボタンを元に戻す
            submitButton.disabled = false;
            submitButton.innerHTML = '<span>パスワードを変更</span> <i class="fas fa-check"></i>';
        }
    }

    // フォームバリデーション
    validateForm(newPassword, confirmPassword) {
        // パスワード要件チェック
        const allRequirementsMet = Object.values(this.passwordRequirements).every(v => v);
        if (!allRequirementsMet) {
            this.showError('すべてのパスワード要件を満たしてください');
            return false;
        }

        // パスワード一致チェック
        if (newPassword !== confirmPassword) {
            this.showError('パスワードが一致しません');
            return false;
        }

        return true;
    }

    // パスワードリセットAPI（デモ）
    async resetPassword(newPassword) {
        // 実際の実装ではAPIエンドポイントに送信
        return new Promise((resolve) => {
            setTimeout(() => {
                // パスワードをハッシュ化して保存（デモでは仮の処理）
                const hashedPassword = this.hashPassword(newPassword);
                
                // トークンに紐づくユーザーのパスワードを更新
                console.log('Password reset successful');
                
                // トークンを無効化
                this.invalidateToken();
                
                resolve();
            }, 2000);
        });
    }

    // パスワードのハッシュ化（デモ用）
    hashPassword(password) {
        // 実際の実装ではbcryptなどを使用
        return btoa(password);
    }

    // トークンの無効化
    invalidateToken() {
        // 実際の実装ではサーバー側でトークンを無効化
        console.log('Token invalidated');
    }

    // エラー表示
    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // 無効なトークンエラー
    showInvalidTokenError() {
        document.querySelector('.auth-form-wrapper').innerHTML = `
            <div class="error-container" style="text-align: center; padding: 3rem;">
                <div class="error-icon" style="font-size: 4rem; color: #dc3545; margin-bottom: 1rem;">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h2 style="color: var(--dark-gray); margin-bottom: 1rem;">無効なリンクです</h2>
                <p style="color: var(--gray-text); margin-bottom: 2rem;">
                    パスワードリセットリンクが無効または期限切れです。<br>
                    もう一度パスワードリセットをリクエストしてください。
                </p>
                <a href="forgot-password.html" class="auth-button" style="display: inline-block; text-decoration: none;">
                    <span>パスワードリセットを再リクエスト</span>
                    <i class="fas fa-redo"></i>
                </a>
            </div>
        `;
    }
}

// パスワード表示/非表示切り替え
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.toggle-password');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ログインページへリダイレクト
function redirectToLogin() {
    window.location.href = 'login.html';
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', function() {
    new PasswordResetManager();
});

// アニメーションスタイル追加
if (!document.getElementById('passwordResetAnimations')) {
    const style = document.createElement('style');
    style.id = 'passwordResetAnimations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}