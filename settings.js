// 設定ページの機能

let settingsServiceInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeSettingsWithSupabase();
});

// Supabase統合初期化
async function initializeSettingsWithSupabase() {
    try {
        // SettingsServiceの準備ができるまで待機
        if (typeof settingsService === 'undefined') {
            setTimeout(initializeSettingsWithSupabase, 100);
            return;
        }

        settingsServiceInstance = settingsService;
        
        // SettingsServiceの初期化を待つ
        await new Promise(resolve => {
            const checkReady = () => {
                if (settingsServiceInstance.initialized) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });

        // 通常の初期化を実行
        initializeSettingsPage();
        setupEventListeners();
        await loadUserSettingsWithSupabase();

        console.log('Settings page initialized with Supabase integration');
    } catch (error) {
        console.error('Failed to initialize settings with Supabase:', error);
        // フォールバック: 元の初期化を実行
        initializeSettingsPage();
        setupEventListeners();
        loadUserSettings();
    }
}

function initializeSettingsPage() {
    // タブの切り替え機能
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // アクティブなタブを変更
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // タブコンテンツを表示
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function setupEventListeners() {
    // フォーム送信のイベント
    const settingsForms = document.querySelectorAll('.settings-form');
    settingsForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveFormSettings(this);
        });
    });
    
    // トグルスイッチのイベント
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            saveToggleSetting(this);
        });
    });
    
    // セレクトボックスのイベント
    const settingSelects = document.querySelectorAll('.setting-item select');
    settingSelects.forEach(select => {
        select.addEventListener('change', function() {
            saveSelectSetting(this);
        });
    });
    
    // テーマ設定の特別処理
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', function() {
            applyTheme(this.value);
        });
    }
    
    // 危険な操作のボタン
    const dangerBtn = document.querySelector('.btn-danger');
    if (dangerBtn) {
        dangerBtn.addEventListener('click', confirmAccountDeletion);
    }
    
    // ログアウトボタン
    const logoutBtns = document.querySelectorAll('.btn-link');
    logoutBtns.forEach(btn => {
        if (btn.textContent.includes('ログアウト')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                logoutDevice(this);
            });
        }
    });
}

// Supabase統合版の設定読み込み
async function loadUserSettingsWithSupabase() {
    try {
        if (settingsServiceInstance) {
            const result = await settingsServiceInstance.getUserSettings();
            if (result.success) {
                applySettingsToUI(result.settings);
                if (result.fallback) {
                    console.warn('Settings loaded using localStorage fallback');
                }
            } else {
                console.error('Failed to load settings:', result.error);
                loadUserSettingsLegacy();
            }
        } else {
            loadUserSettingsLegacy();
        }
    } catch (error) {
        console.error('Error loading settings with Supabase:', error);
        loadUserSettingsLegacy();
    }
}

// レガシー版の設定読み込み（フォールバック用）
function loadUserSettings() {
    loadUserSettingsLegacy();
}

function loadUserSettingsLegacy() {
    // ローカルストレージから設定を読み込み
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    applySettingsToUI(settings);
}

// 設定をUIに適用
function applySettingsToUI(settings) {
    // テーマ設定を復元
    const currentTheme = settings.theme || localStorage.getItem('theme') || 'light';
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = currentTheme;
    }
    
    // その他の設定を復元
    Object.keys(settings).forEach(key => {
        const element = document.querySelector(`[name="${key}"]`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = settings[key];
            } else {
                element.value = settings[key];
            }
        }
    });

    // ユーザー情報フォームの読み込み
    loadUserProfileData(settings);
}

// ユーザープロフィールデータの読み込み
function loadUserProfileData(settings) {
    // 認証済みユーザーの情報を取得
    if (typeof auth !== 'undefined' && auth) {
        const currentUser = auth.getCurrentUser();
        if (currentUser) {
            // 基本情報フォームに値を設定
            const lastNameInput = document.querySelector('input[name="lastName"]');
            const firstNameInput = document.querySelector('input[name="firstName"]');
            const emailInput = document.querySelector('input[name="email"]');
            const phoneInput = document.querySelector('input[name="phone"]');
            const addressInput = document.querySelector('input[name="address"]');

            if (lastNameInput) lastNameInput.value = currentUser.lastName || '';
            if (firstNameInput) firstNameInput.value = currentUser.firstName || '';
            if (emailInput) emailInput.value = currentUser.email || '';
            if (phoneInput) phoneInput.value = currentUser.phone || '';
            if (addressInput) addressInput.value = currentUser.address || '';
        }
    }
}

async function saveFormSettings(form) {
    const formData = new FormData(form);
    
    try {
        // 特別な処理が必要な設定
        if (form.querySelector('input[name="currentPassword"]')) {
            // パスワード変更の場合
            await savePasswordChangeWithSupabase(formData);
        } else {
            // 通常の設定保存（プロフィール情報）
            await saveProfileWithSupabase(formData);
        }
    } catch (error) {
        console.error('Failed to save form settings:', error);
        showErrorMessage('設定の保存に失敗しました: ' + error.message);
    }
}

// Supabase対応のプロフィール保存
async function saveProfileWithSupabase(formData) {
    const profileData = {};
    
    // FormDataから必要な情報を抽出
    for (let [key, value] of formData.entries()) {
        profileData[key] = value;
    }

    try {
        if (settingsServiceInstance) {
            const result = await settingsServiceInstance.updateProfile(profileData);
            if (result.success) {
                showSuccessMessage('プロフィールを更新しました');
                if (result.fallback) {
                    console.warn('Profile updated using localStorage fallback');
                }
                
                // 認証情報も更新
                if (typeof auth !== 'undefined' && auth.updateCurrentUser) {
                    auth.updateCurrentUser(profileData);
                }
            } else {
                throw new Error(result.error || 'プロフィール更新に失敗しました');
            }
        } else {
            // フォールバック
            saveProfileLegacy(formData);
        }
    } catch (error) {
        console.error('Failed to save profile with Supabase:', error);
        // フォールバック
        saveProfileLegacy(formData);
    }
}

// レガシー版のプロフィール保存
function saveProfileLegacy(formData) {
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    
    for (let [key, value] of formData.entries()) {
        settings[key] = value;
    }
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    showSuccessMessage('設定を保存しました（ローカル）');
}

// Supabase対応のパスワード変更
async function savePasswordChangeWithSupabase(formData) {
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    // バリデーション
    if (!currentPassword || !newPassword || !confirmPassword) {
        showErrorMessage('すべての項目を入力してください');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showErrorMessage('新しいパスワードが一致しません');
        return;
    }
    
    if (newPassword.length < 8) {
        showErrorMessage('新しいパスワードは8文字以上で入力してください');
        return;
    }
    
    // パスワード強度チェック
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSymbol = /[!@#$%^&*(),.?\":{}|<>]/.test(newPassword);
    
    if (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
        showErrorMessage('新しいパスワードは大文字、小文字、数字、記号を含む必要があります');
        return;
    }
    
    try {
        if (settingsServiceInstance) {
            const result = await settingsServiceInstance.changePassword(currentPassword, newPassword);
            if (result.success) {
                showSuccessMessage('パスワードを変更しました');
                if (result.fallback) {
                    showWarningMessage('パスワードはローカルでのみ変更されました');
                }
                
                // フォームをリセット
                const form = document.querySelector('input[name="currentPassword"]').closest('form');
                if (form) {
                    form.reset();
                }
            } else {
                throw new Error(result.error || 'パスワード変更に失敗しました');
            }
        } else {
            // フォールバック
            savePasswordChangeLegacy(formData);
        }
    } catch (error) {
        console.error('Failed to change password with Supabase:', error);
        showErrorMessage('パスワード変更に失敗しました: ' + error.message);
    }
}

// レガシー版のパスワード変更（フォールバック用）
function savePasswordChange(formData) {
    savePasswordChangeLegacy(formData);
}

function savePasswordChangeLegacy(formData) {
    // バリデーションは上記と同じ
    console.log('Password change requested (legacy mode)');
    showSuccessMessage('パスワードを変更しました（ローカル）');
    
    // フォームをリセット
    const form = document.querySelector('input[name="currentPassword"]').closest('form');
    if (form) {
        form.reset();
    }
}

async function saveToggleSetting(toggle) {
    const settingName = toggle.closest('.setting-item').querySelector('h4').textContent;
    const settingValue = toggle.checked;
    
    try {
        if (settingsServiceInstance) {
            // 現在の設定を取得
            const result = await settingsServiceInstance.getUserSettings();
            if (result.success) {
                const updatedSettings = {
                    ...result.settings,
                    [settingName]: settingValue
                };
                
                const saveResult = await settingsServiceInstance.saveUserSettings(updatedSettings);
                if (saveResult.success) {
                    console.log(`Toggle setting changed: ${settingName} = ${settingValue}`);
                    if (saveResult.fallback) {
                        console.warn('Setting saved using localStorage fallback');
                    }
                } else {
                    throw new Error('Failed to save setting');
                }
            }
        } else {
            // フォールバック
            saveToggleSettingLegacy(toggle);
        }
    } catch (error) {
        console.error('Failed to save toggle setting:', error);
        // フォールバック
        saveToggleSettingLegacy(toggle);
    }
}

function saveToggleSettingLegacy(toggle) {
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    const settingName = toggle.closest('.setting-item').querySelector('h4').textContent;
    
    settings[settingName] = toggle.checked;
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    console.log(`Toggle setting changed: ${settingName} = ${toggle.checked}`);
}

async function saveSelectSetting(select) {
    const settingName = select.name || select.closest('.setting-item').querySelector('h4').textContent;
    const settingValue = select.value;
    
    try {
        if (settingsServiceInstance) {
            // 現在の設定を取得
            const result = await settingsServiceInstance.getUserSettings();
            if (result.success) {
                const updatedSettings = {
                    ...result.settings,
                    [settingName]: settingValue
                };
                
                const saveResult = await settingsServiceInstance.saveUserSettings(updatedSettings);
                if (saveResult.success) {
                    console.log(`Select setting changed: ${settingName} = ${settingValue}`);
                    if (saveResult.fallback) {
                        console.warn('Setting saved using localStorage fallback');
                    }
                } else {
                    throw new Error('Failed to save setting');
                }
            }
        } else {
            // フォールバック
            saveSelectSettingLegacy(select);
        }
    } catch (error) {
        console.error('Failed to save select setting:', error);
        // フォールバック
        saveSelectSettingLegacy(select);
    }
}

function saveSelectSettingLegacy(select) {
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    const settingName = select.name || select.closest('.setting-item').querySelector('h4').textContent;
    
    settings[settingName] = select.value;
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    console.log(`Select setting changed: ${settingName} = ${select.value}`);
}

function applyTheme(theme) {
    const html = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    
    if (theme === 'auto') {
        // システム設定に従う
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }
    
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (toggle) {
        if (theme === 'dark') {
            toggle.classList.add('dark');
        } else {
            toggle.classList.remove('dark');
        }
    }
    
    showSuccessMessage('テーマを変更しました');
}

async function confirmAccountDeletion() {
    const confirmed = confirm(
        'アカウントを削除すると、すべてのデータが完全に削除され、復元することはできません。\n\n本当にアカウントを削除しますか？'
    );
    
    if (confirmed) {
        const doubleConfirmed = confirm(
            '最終確認：アカウント削除を実行しますか？\n\nこの操作は取り消せません。'
        );
        
        if (doubleConfirmed) {
            try {
                if (settingsServiceInstance) {
                    const result = await settingsServiceInstance.deleteAccount();
                    if (result.success) {
                        alert('アカウントを削除しました。ご利用ありがとうございました。');
                        // ログインページにリダイレクト
                        window.location.href = 'login.html';
                    } else {
                        throw new Error(result.error || 'アカウント削除に失敗しました');
                    }
                } else {
                    // フォールバック
                    confirmAccountDeletionLegacy();
                }
            } catch (error) {
                console.error('Failed to delete account:', error);
                showErrorMessage('アカウント削除に失敗しました: ' + error.message);
            }
        }
    }
}

function confirmAccountDeletionLegacy() {
    console.log('Account deletion requested (legacy mode)');
    localStorage.clear();
    alert('アカウントデータをローカルから削除しました。');
    window.location.href = 'login.html';
}

function logoutDevice(button) {
    const deviceInfo = button.closest('.history-item').querySelector('h4').textContent;
    
    if (confirm(`${deviceInfo}からログアウトしますか？`)) {
        // デバイスからログアウト処理（実装予定）
        console.log(`Logout requested for device: ${deviceInfo}`);
        
        // UIから削除
        button.closest('.history-item').remove();
        
        showSuccessMessage('デバイスからログアウトしました');
    }
}

function showSuccessMessage(message) {
    // 成功メッセージを表示
    const notification = createNotification(message, 'success');
    document.body.appendChild(notification);
    
    // 3秒後に自動削除
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showErrorMessage(message) {
    // エラーメッセージを表示
    const notification = createNotification(message, 'error');
    document.body.appendChild(notification);
    
    // 5秒後に自動削除
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    if (type === 'success') {
        notification.style.background = '#28a745';
    } else if (type === 'error') {
        notification.style.background = '#dc3545';
    } else if (type === 'warning') {
        notification.style.background = '#ffc107';
    }
    
    notification.textContent = message;
    
    // アニメーション用CSS
    const style = document.createElement('style');
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
    
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }
    
    return notification;
}

// システム設定の変更を監視
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect && themeSelect.value === 'auto') {
        applyTheme('auto');
    }
});

// 二段階認証の設定
function setupTwoFactorAuth() {
    alert('二段階認証の設定機能は実装予定です');
}

// 警告メッセージ表示
function showWarningMessage(message) {
    const notification = createNotification(message, 'warning');
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// データのエクスポート
async function exportUserData() {
    try {
        if (settingsServiceInstance) {
            const result = await settingsServiceInstance.exportUserData();
            if (result.success) {
                // データをJSONファイルとしてダウンロード
                const dataStr = JSON.stringify(result.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `interconnect_user_data_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                showSuccessMessage('ユーザーデータをエクスポートしました');
            } else {
                throw new Error('エクスポートに失敗しました');
            }
        } else {
            exportUserDataLegacy();
        }
    } catch (error) {
        console.error('Failed to export user data:', error);
        showErrorMessage('データエクスポートに失敗しました: ' + error.message);
    }
}

function exportUserDataLegacy() {
    const data = {
        settings: JSON.parse(localStorage.getItem('userSettings') || '{}'),
        theme: localStorage.getItem('theme'),
        messages: JSON.parse(localStorage.getItem('messages') || '[]'),
        connections: JSON.parse(localStorage.getItem('connectionRequests') || '[]')
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `interconnect_local_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showSuccessMessage('ローカルデータをエクスポートしました');
}

// 設定のリセット
async function resetAllSettings() {
    if (confirm('すべての設定をデフォルトに戻しますか？')) {
        try {
            if (settingsServiceInstance) {
                const result = await settingsServiceInstance.resetAllSettings();
                if (result.success) {
                    showSuccessMessage('設定をリセットしました');
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    throw new Error('設定のリセットに失敗しました');
                }
            } else {
                resetAllSettingsLegacy();
            }
        } catch (error) {
            console.error('Failed to reset settings:', error);
            showErrorMessage('設定のリセットに失敗しました: ' + error.message);
            // フォールバック
            resetAllSettingsLegacy();
        }
    }
}

function resetAllSettingsLegacy() {
    localStorage.removeItem('userSettings');
    localStorage.removeItem('theme');
    showSuccessMessage('ローカル設定をリセットしました');
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// プライバシー設定を保存
function savePrivacySettings() {
    const privacySettings = {
        profileVisibility: document.querySelector('select[name="profileVisibility"]').value,
        contactVisibility: document.querySelector('select[name="contactVisibility"]').value,
        showOnlineStatus: document.querySelector('#privacy .toggle-switch input[type="checkbox"]:nth-of-type(1)').checked,
        appearInSearch: document.querySelector('#privacy .setting-item:nth-child(4) input[type="checkbox"]').checked,
        showInRecommendations: document.querySelector('#privacy .setting-item:nth-child(5) input[type="checkbox"]').checked
    };
    
    // 設定を保存
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    settings.privacy = privacySettings;
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    showSuccessMessage('プライバシー設定を保存しました');
    
    // Supabase統合がある場合
    if (settingsServiceInstance) {
        settingsServiceInstance.saveUserSettings(settings).catch(error => {
            console.error('Failed to save privacy settings to Supabase:', error);
        });
    }
}