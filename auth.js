// 認証システム
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // currentUserの初期化（ローカルストレージから）
        try {
            const storedUser = localStorage.getItem('currentUser');
            this.currentUser = storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Failed to parse stored user data during initialization:', error);
            this.currentUser = null;
            localStorage.removeItem('currentUser');
        }
        
        this.initializeAuth();
    }

    // 初期化
    initializeAuth() {
        // デモ用管理者アカウントを追加
        if (this.users.length === 0) {
            // 初期化時に非同期処理を実行
            this.initializeDefaultUsers();
        }
    }

    // デフォルトユーザーの初期化（非同期）
    async initializeDefaultUsers() {
        if (this.users.length === 0) {
            this.users.push({
                id: 'admin-001',
                email: 'admin@interconnect.jp',
                password: await this.hashPassword('admin123'),
                firstName: '管理者',
                lastName: 'システム',
                company: 'INTERCONNECT',
                position: 'システム管理者',
                industry: 'IT・テクノロジー',
                phone: '03-1234-5678',
                companySize: '11-50名',
                motivation: 'システム管理',
                role: 'admin',
                status: 'approved',
                createdAt: new Date().toISOString(),
                profileImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e0e0e0"/%3E%3Ctext x="50" y="50" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-family="Arial,sans-serif" font-size="30"%3EUser%3C/text%3E%3C/svg%3E'
            });
            
            // デモ用一般ユーザーを追加
            this.users.push({
                id: 'user-001',
                email: 'tanaka@example.com',
                password: await this.hashPassword('password123'),
                firstName: '太郎',
                lastName: '田中',
                company: '田中商事株式会社',
                position: 'CEO',
                industry: '製造業',
                phone: '03-9876-5432',
                companySize: '51-100名',
                motivation: 'ビジネスネットワークの拡大',
                role: 'member',
                status: 'approved',
                createdAt: new Date().toISOString(),
                profileImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e0e0e0"/%3E%3Ctext x="50" y="50" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-family="Arial,sans-serif" font-size="30"%3EUser%3C/text%3E%3C/svg%3E'
            });
            
            this.saveUsers();
        }
    }

    // 招待トラッキング
    trackReferral(referralCode, newUser) {
        try {
            // 使用済みコードチェック
            const usedCodes = JSON.parse(localStorage.getItem('usedInviteCodes') || '[]');
            if (usedCodes.includes(referralCode)) {
                console.warn('この招待コードは既に使用されています:', referralCode);
                return;
            }
            
            // 招待データを取得
            const inviteData = JSON.parse(localStorage.getItem('inviteData') || '{"inviteLinks":{},"inviteHistory":[]}');
            
            // 招待コードから招待者を特定
            let referrerId = null;
            for (const [userId, code] of Object.entries(inviteData.inviteLinks)) {
                if (code === referralCode) {
                    referrerId = userId;
                    break;
                }
            }
            
            if (referrerId) {
                // 同一IPチェック（簡易版）
                const registrationIPs = JSON.parse(localStorage.getItem('registrationIPs') || '{}');
                const currentIP = this.getSimulatedIP(); // 実際にはサーバーサイドで取得
                const referrerIPs = registrationIPs[referrerId] || [];
                
                if (referrerIPs.includes(currentIP)) {
                    console.warn('同一IPからの複数登録が検出されました');
                    // 実際の実装では登録を拒否
                }
                // 招待履歴に追加
                inviteData.inviteHistory.push({
                    id: 'invite-' + Date.now(),
                    referrerId: referrerId,
                    inviteeId: newUser.id,
                    inviteeName: newUser.firstName + ' ' + newUser.lastName,
                    inviteeEmail: newUser.email,
                    inviteeCompany: newUser.company,
                    date: new Date().toISOString(),
                    status: 'registered',
                    points: 1000,
                    referralCode: referralCode
                });
                
                // 保存
                localStorage.setItem('inviteData', JSON.stringify(inviteData));
                
                // ポイントデータも更新
                const pointsData = JSON.parse(localStorage.getItem('pointsData') || '{}');
                if (!pointsData[referrerId]) {
                    pointsData[referrerId] = {
                        totalPoints: 0,
                        monthlyPoints: 0,
                        pendingPoints: 0,
                        rank: 'bronze',
                        rankProgress: 0,
                        inviteCount: 0
                    };
                }
                
                // セキュアなポイント追加
                if (window.secureAddPoints) {
                    window.secureAddPoints(referrerId, 1000, '招待報酬');
                    pointsData[referrerId].inviteCount += 1;
                } else {
                    // フォールバック
                    pointsData[referrerId].totalPoints += 1000;
                    pointsData[referrerId].monthlyPoints += 1000;
                    pointsData[referrerId].inviteCount += 1;
                }
                
                // ランク更新
                const count = pointsData[referrerId].inviteCount;
                if (count >= 30) {
                    pointsData[referrerId].rank = 'diamond';
                    pointsData[referrerId].rankProgress = 100;
                } else if (count >= 20) {
                    pointsData[referrerId].rank = 'platinum';
                    pointsData[referrerId].rankProgress = ((count - 20) / 10) * 100;
                } else if (count >= 15) {
                    pointsData[referrerId].rank = 'gold';
                    pointsData[referrerId].rankProgress = ((count - 15) / 5) * 100;
                } else if (count >= 10) {
                    pointsData[referrerId].rank = 'silver';
                    pointsData[referrerId].rankProgress = ((count - 10) / 5) * 100;
                } else if (count >= 5) {
                    pointsData[referrerId].rank = 'bronze';
                    pointsData[referrerId].rankProgress = ((count - 5) / 5) * 100;
                }
                
                localStorage.setItem('pointsData', JSON.stringify(pointsData));
                
                // 招待コードを使用済みにマーク
                usedCodes.push(referralCode);
                localStorage.setItem('usedInviteCodes', JSON.stringify(usedCodes));
                
                // IPアドレスを記録（簡易版）
                if (!registrationIPs[referrerId]) {
                    registrationIPs[referrerId] = [];
                }
                registrationIPs[referrerId].push(currentIP);
                localStorage.setItem('registrationIPs', JSON.stringify(registrationIPs));
                
                // 招待成功通知を送信（シミュレーション）
                this.sendInviteNotification(referrerId, newUser);
                
                console.log('招待トラッキング成功:', referrerId, newUser.email);
            }
        } catch (error) {
            console.error('招待トラッキングエラー:', error);
        }
    }
    
    // IPアドレスシミュレーション（実際はサーバーサイドで取得）
    getSimulatedIP() {
        const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3', '10.0.0.1'];
        return ips[Math.floor(Math.random() * ips.length)];
    }
    
    // 招待成功通知（シミュレーション）
    sendInviteNotification(referrerId, invitee) {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
        if (!notifications[referrerId]) {
            notifications[referrerId] = [];
        }
        
        notifications[referrerId].push({
            id: 'notif-' + Date.now(),
            type: 'invite_success',
            title: '招待が成功しました！',
            message: `${invitee.firstName} ${invitee.lastName}さん（${invitee.company}）が登録を完了しました。1000ポイントを獲得しました！`,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                inviteeId: invitee.id,
                points: 1000
            }
        });
        
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    // パスワードハッシュ化（セキュリティ強化版）
    async hashPassword(password) {
        if (window.securityManager) {
            return await window.securityManager.hashPassword(password);
        }
        // フォールバック（セキュリティマネージャーが利用できない場合）
        return btoa(password + 'salt').replace(/[^a-zA-Z0-9]/g, '');
    }

    // ユーザー登録
    async register(userData) {
        try {
            // バリデーション
            if (!this.validateEmail(userData.email)) {
                throw new Error('無効なメールアドレスです');
            }

            if (!this.validatePassword(userData.password)) {
                throw new Error('パスワードは8文字以上で、英数字を含む必要があります');
            }

            if (userData.password !== userData.confirmPassword) {
                throw new Error('パスワードが一致しません');
            }

            // 既存ユーザーチェック
            if (this.users.find(user => user.email === userData.email)) {
                throw new Error('このメールアドレスは既に登録されています');
            }

            // 新規ユーザー作成
            const newUser = {
                id: 'user-' + Date.now(),
                email: userData.email,
                password: await this.hashPassword(userData.password),
                firstName: userData.firstName,
                lastName: userData.lastName,
                company: userData.company,
                position: userData.position,
                industry: userData.industry,
                phone: userData.phone,
                companySize: userData.companySize,
                annualRevenue: userData.annualRevenue,
                businessChallenges: userData.businessChallenges,
                investmentBudget: userData.investmentBudget,
                motivation: userData.motivation,
                newsletter: userData.newsletter || false,
                role: 'member',
                status: 'pending', // 承認待ち
                createdAt: new Date().toISOString(),
                profileImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e0e0e0"/%3E%3Ctext x="50" y="50" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-family="Arial,sans-serif" font-size="30"%3EUser%3C/text%3E%3C/svg%3E',
                referralCode: userData.referralCode || null
            };

            this.users.push(newUser);
            this.saveUsers();
            
            // 招待リンク経由の場合、招待履歴を更新
            if (userData.referralCode) {
                this.trackReferral(userData.referralCode, newUser);
            }

            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        message: '登録申請を受け付けました。審査完了まで2-3営業日お待ちください。',
                        user: { ...newUser, password: undefined }
                    });
                }, 1500);
            });
        } catch (error) {
            throw error;
        }
    }

    // ログイン
    async login(email, password, remember = false) {
        return new Promise(async (resolve, reject) => {
            // レート制限チェック
            if (window.securityManager) {
                const rateLimitResult = window.securityManager.trackLoginAttempt(email, false);
                if (!rateLimitResult.allowed) {
                    reject(new Error(rateLimitResult.message));
                    return;
                }
            }
            
            setTimeout(async () => {
                const user = this.users.find(u => u.email === email);
                
                if (!user) {
                    reject(new Error('メールアドレスまたはパスワードが正しくありません'));
                    return;
                }

                // パスワード検証
                let passwordValid = false;
                if (window.securityManager && user.password.includes(':')) {
                    passwordValid = await window.securityManager.verifyPassword(password, user.password);
                } else {
                    passwordValid = user.password === await this.hashPassword(password);
                }
                
                if (!passwordValid) {
                    reject(new Error('メールアドレスまたはパスワードが正しくありません'));
                    return;
                }

                if (user.status === 'pending') {
                    reject(new Error('アカウントが承認待ちです。承認完了まで今しばらくお待ちください。'));
                    return;
                }

                if (user.status === 'rejected') {
                    reject(new Error('アカウントが承認されませんでした。詳細についてはサポートにお問い合わせください。'));
                    return;
                }

                // ログイン成功
                const userData = { ...user, password: undefined };
                this.currentUser = userData;
                localStorage.setItem('currentUser', JSON.stringify(userData));

                if (remember) {
                    localStorage.setItem('rememberLogin', 'true');
                } else {
                    sessionStorage.setItem('currentUser', JSON.stringify(userData));
                }

                // ログイン成功を記録
                if (window.securityManager) {
                    window.securityManager.trackLoginAttempt(email, true);
                    window.securityManager.logSecurityEvent('login_success', { email });
                }

                resolve({
                    success: true,
                    message: 'ログインしました',
                    user: userData
                });
            }, 1000);
        });
    }

    // ログアウト
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('rememberLogin');
        window.location.href = 'index.html';
    }

    // 現在のユーザーを取得
    getCurrentUser() {
        // currentUserがnullの場合、ローカルストレージから再取得を試行
        if (!this.currentUser) {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                try {
                    this.currentUser = JSON.parse(storedUser);
                } catch (error) {
                    console.error('Failed to parse stored user data:', error);
                    localStorage.removeItem('currentUser');
                    return null;
                }
            }
        }
        return this.currentUser;
    }

    // ログイン状態チェック
    isLoggedIn() {
        // currentUserの存在をまず確認
        const user = this.getCurrentUser();
        return user !== null;
    }

    // 管理者権限チェック
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    // ユーザー保存
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // メールバリデーション
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // パスワードバリデーション
    validatePassword(password) {
        return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    }

    // パスワード強度チェック
    getPasswordStrength(password) {
        let strength = 0;
        const checks = [
            password.length >= 8,
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /[0-9]/.test(password),
            /[^a-zA-Z0-9]/.test(password)
        ];

        strength = checks.filter(Boolean).length;

        if (strength < 3) return 'weak';
        if (strength < 4) return 'medium';
        return 'strong';
    }


    // ソーシャルログイン（デモ）
    async socialLogin(provider) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // デモ用のソーシャルログイン
                const demoUser = {
                    id: 'social-' + Date.now(),
                    email: `demo@${provider}.com`,
                    firstName: 'デモ',
                    lastName: 'ユーザー',
                    company: `${provider}株式会社`,
                    position: 'CEO',
                    industry: 'IT・テクノロジー',
                    phone: '03-0000-0000',
                    companySize: '51-100名',
                    motivation: 'ソーシャルログインテスト',
                    role: 'member',
                    status: 'approved',
                    createdAt: new Date().toISOString(),
                    profileImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e0e0e0"/%3E%3Ctext x="50" y="50" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-family="Arial,sans-serif" font-size="30"%3EUser%3C/text%3E%3C/svg%3E',
                    provider: provider
                };

                this.currentUser = demoUser;
                localStorage.setItem('currentUser', JSON.stringify(demoUser));

                resolve({
                    success: true,
                    message: `${provider}でログインしました`,
                    user: demoUser
                });
            }, 1500);
        });
    }

    // パスワードリセットリクエスト
    async requestPasswordReset(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // メールアドレスの検証
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    reject(new Error('有効なメールアドレスを入力してください'));
                    return;
                }

                // ユーザーの存在確認（デモ用）
                const userExists = this.users.some(u => u.email === email);
                
                if (!userExists) {
                    // セキュリティのため、ユーザーが存在しない場合も成功を返す
                    console.log('User not found, but returning success for security');
                }

                // リセットトークンの生成（デモ用）
                const resetToken = this.generateResetToken(email);
                
                // トークンを保存（実際の実装ではサーバー側で管理）
                const resetTokens = JSON.parse(localStorage.getItem('resetTokens') || '{}');
                resetTokens[email] = {
                    token: resetToken,
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };
                localStorage.setItem('resetTokens', JSON.stringify(resetTokens));

                // メール送信のシミュレーション
                console.log(`Password reset link: password-reset.html?token=${resetToken}`);
                
                resolve({
                    success: true,
                    message: 'パスワードリセット用のリンクをメールアドレスに送信しました。'
                });
            }, 1500);
        });
    }

    // リセットトークンの生成
    generateResetToken(email) {
        // 実際の実装では、暗号的に安全なトークンを生成
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        return btoa(`${email}:${timestamp}:${random}`).replace(/=/g, '');
    }

    // パスワードリセットの実行
    async resetPasswordWithToken(token, newPassword) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                // トークンの検証
                const resetTokens = JSON.parse(localStorage.getItem('resetTokens') || '{}');
                let validEmail = null;
                
                for (const [email, tokenData] of Object.entries(resetTokens)) {
                    if (tokenData.token === token) {
                        // 有効期限チェック
                        if (new Date(tokenData.expires) > new Date()) {
                            validEmail = email;
                            break;
                        }
                    }
                }
                
                if (!validEmail) {
                    reject(new Error('無効または期限切れのトークンです'));
                    return;
                }
                
                // パスワードの更新
                const userIndex = this.users.findIndex(u => u.email === validEmail);
                
                if (userIndex !== -1) {
                    this.users[userIndex].password = await this.hashPassword(newPassword);
                    this.saveUsers();
                    
                    // トークンを削除
                    delete resetTokens[validEmail];
                    localStorage.setItem('resetTokens', JSON.stringify(resetTokens));
                    
                    resolve({
                        success: true,
                        message: 'パスワードが正常に変更されました'
                    });
                } else {
                    reject(new Error('ユーザーが見つかりません'));
                }
            }, 1500);
        });
    }

    // 全ユーザー取得（管理者用）
    getAllUsers() {
        if (!this.isAdmin()) {
            throw new Error('管理者権限が必要です');
        }
        return this.users.map(user => ({ ...user, password: undefined }));
    }

    // ユーザー承認（管理者用）
    approveUser(userId) {
        if (!this.isAdmin()) {
            throw new Error('管理者権限が必要です');
        }
        
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.status = 'approved';
            this.saveUsers();
            return true;
        }
        return false;
    }

    // ユーザー拒否（管理者用）
    rejectUser(userId) {
        if (!this.isAdmin()) {
            throw new Error('管理者権限が必要です');
        }
        
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.status = 'rejected';
            this.saveUsers();
            return true;
        }
        return false;
    }
}

// グローバルインスタンス
const auth = new AuthSystem();

// パスワード表示切り替え
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// パスワード強度表示
function updatePasswordStrength(password) {
    const strengthElement = document.getElementById('passwordStrength');
    if (!strengthElement) return;

    const strength = auth.getPasswordStrength(password);
    strengthElement.className = `password-strength ${strength}`;
}

// フォームエラー表示
function showFormError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    const formGroup = field.closest('.form-group');
    formGroup.classList.add('error');

    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

// フォームエラークリア
function clearFormErrors() {
    document.querySelectorAll('.form-group.error').forEach(group => {
        group.classList.remove('error');
    });
}

// 通知表示はcommon.jsに移動済み

// ソーシャルログイン
async function loginWithGoogle() {
    try {
        showNotification('Googleアカウントで認証中...', 'info');
        const result = await auth.socialLogin('Google');
        showNotification(result.message, 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function loginWithLinkedIn() {
    try {
        showNotification('LinkedInアカウントで認証中...', 'info');
        const result = await auth.socialLogin('LinkedIn');
        showNotification(result.message, 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function loginWithLine() {
    try {
        showNotification('LINEアカウントで認証中...', 'info');
        const result = await auth.socialLogin('LINE');
        showNotification(result.message, 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // URLパラメータから招待コードを取得
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    // 登録フォーム
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // 招待コードがある場合、フォームに追加
        if (referralCode) {
            const referralInput = document.createElement('input');
            referralInput.type = 'hidden';
            referralInput.name = 'referralCode';
            referralInput.value = referralCode;
            registerForm.appendChild(referralInput);
            
            // 招待コード表示（オプション）
            const referralNotice = document.createElement('div');
            referralNotice.className = 'referral-notice';
            referralNotice.innerHTML = `
                <i class="fas fa-gift"></i> 
                招待コード: <strong>${referralCode}</strong> が適用されています
            `;
            referralNotice.style.cssText = `
                background: #e3f2fd;
                color: #1976d2;
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            registerForm.insertBefore(referralNotice, registerForm.firstChild);
        }
        // パスワード強度チェック
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                updatePasswordStrength(this.value);
            });
        }

        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearFormErrors();

            const formData = new FormData(this);
            const userData = Object.fromEntries(formData.entries());
            
            // 利用規約チェック
            if (!userData.terms) {
                showFormError('terms', '利用規約への同意が必要です');
                return;
            }

            // 追加バリデーション
            if (!userData.annualRevenue) {
                showFormError('annualRevenue', '年商の選択は必須です');
                return;
            }

            if (!userData.investmentBudget) {
                showFormError('investmentBudget', '投資予算の選択は必須です');
                return;
            }

            // 事業課題の文字数チェック
            if (!userData.businessChallenges || userData.businessChallenges.length < 150) {
                showFormError('businessChallenges', '事業課題は150文字以上で入力してください');
                return;
            }

            const submitButton = this.querySelector('.auth-button');
            const originalText = submitButton.textContent;
            submitButton.textContent = '登録中...';
            submitButton.classList.add('loading');
            submitButton.disabled = true;

            try {
                const result = await auth.register(userData);
                showNotification(result.message, 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                showNotification(error.message, 'error');
                submitButton.textContent = originalText;
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        });
    }

    // ログインフォームバリデーション設定
    if (typeof setupLoginFormValidation === 'function') {
        const validator = setupLoginFormValidation();
        if (validator) {
            validator.setSubmitHandler(async (data) => {
                try {
                    const result = await auth.login(data.email, data.password, data.remember);
                    showNotification(result.message, 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } catch (error) {
                    throw error; // バリデーターのエラーハンドラーに渡す
                }
            });
            
            validator.setErrorHandler((error) => {
                showNotification(error.message, 'error');
            });
        }
    } else {
        // フォールバック：バリデーション関数が利用できない場合の直接処理
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                clearFormErrors();

                const formData = new FormData(this);
                const email = formData.get('email');
                const password = formData.get('password');
                const remember = formData.get('remember');

                const submitButton = this.querySelector('.auth-button');
                const originalText = submitButton.textContent;
                submitButton.textContent = 'ログイン中...';
                submitButton.classList.add('loading');
                submitButton.disabled = true;

                try {
                    const result = await auth.login(email, password, remember);
                    showNotification(result.message, 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } catch (error) {
                    showNotification(error.message, 'error');
                    submitButton.textContent = originalText;
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                }
            });
        }
    }

    // ダッシュボードアクセス制御
    if (window.location.pathname.includes('dashboard.html')) {
        if (!auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }
    }

    // 管理者ページアクセス制御
    if (window.location.pathname.includes('admin')) {
        if (!auth.isAdmin()) {
            window.location.href = 'dashboard.html';
            return;
        }
    }
});

// ソーシャルログイン機能（デモ版）
function loginWithGoogle() {
    showNotification('Google ログインは開発中です', 'info');
    // 実装時は Google OAuth 2.0 を使用
}

function loginWithLinkedIn() {
    showNotification('LinkedIn ログインは開発中です', 'info');
    // 実装時は LinkedIn OAuth を使用
}

function loginWithLine() {
    showNotification('LINE ログインは開発中です', 'info');
    // 実装時は LINE Login を使用
}

// パスワード表示切り替え
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = document.querySelector(`[onclick="togglePassword('${inputId}')"]`);
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// グローバルに公開
window.loginWithGoogle = loginWithGoogle;
window.loginWithLinkedIn = loginWithLinkedIn;
window.loginWithLine = loginWithLine;
window.togglePassword = togglePassword;

// ログアウト関数（グローバル）
function logout() {
    if (confirm('ログアウトしますか？')) {
        auth.logout();
    }
}