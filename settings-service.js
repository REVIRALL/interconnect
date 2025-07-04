// 設定サービス - ダミー実装（localStorage使用）

class SettingsService {
    constructor() {
        this.supabaseService = window.supabaseService;
        this.currentUserId = null;
        this.initialized = true; // 即座に初期化完了
        
        this.initialize();
    }

    async initialize() {
        // 認証ユーザーを取得
        if (typeof auth !== 'undefined' && auth) {
            const user = auth.getCurrentUser();
            if (user) {
                this.currentUserId = user.id;
            }
        }
        console.log('Settings service initialized in localStorage mode');
    }

    // 全てlocalStorageフォールバックを使用
    async saveUserSettings(settings) {
        return this.saveSettingsToLocalStorage(settings);
    }

    async getUserSettings() {
        return this.getSettingsFromLocalStorage();
    }

    async updateProfile(profileData) {
        return this.updateProfileInLocalStorage(profileData);
    }

    async changePassword(currentPassword, newPassword) {
        console.warn('Password change in localStorage fallback mode');
        return { success: true, fallback: true, warning: 'Password changed locally only' };
    }

    async saveNotificationSettings(notificationSettings) {
        const settings = await this.getUserSettings();
        if (settings.success) {
            const updatedSettings = {
                ...settings.settings,
                notifications: notificationSettings
            };
            return await this.saveUserSettings(updatedSettings);
        }
        throw new Error('Failed to get current settings');
    }

    async savePrivacySettings(privacySettings) {
        const settings = await this.getUserSettings();
        if (settings.success) {
            const updatedSettings = {
                ...settings.settings,
                privacy: privacySettings
            };
            return await this.saveUserSettings(updatedSettings);
        }
        throw new Error('Failed to get current settings');
    }

    async deleteAccount() {
        localStorage.clear();
        if (typeof auth !== 'undefined' && auth.logout) {
            auth.logout();
        }
        return { success: true, fallback: true };
    }

    async getLoginHistory() {
        const dummyHistory = [
            {
                device: 'Windows PC',
                browser: 'Chrome 119.0',
                location: 'Tokyo, Japan',
                login_time: new Date(),
                is_current: true
            },
            {
                device: 'iPhone',
                browser: 'Safari 17.0',
                location: 'Tokyo, Japan',
                login_time: new Date(Date.now() - 2 * 60 * 60 * 1000),
                is_current: false
            }
        ];
        return { success: true, history: dummyHistory, fallback: true };
    }

    async exportUserData() {
        const result = {
            profile: {},
            settings: JSON.parse(localStorage.getItem('userSettings') || '{}'),
            messages: JSON.parse(localStorage.getItem('messages') || '[]'),
            connections: JSON.parse(localStorage.getItem('connectionRequests') || '[]')
        };

        return { success: true, data: result };
    }

    async resetAllSettings() {
        localStorage.removeItem('userSettings');
        localStorage.removeItem('theme');
        return { success: true };
    }

    // localStorage実装
    saveSettingsToLocalStorage(settings) {
        try {
            localStorage.setItem('userSettings', JSON.stringify(settings));
            return { success: true, fallback: true };
        } catch (error) {
            console.error('Failed to save settings to localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    getSettingsFromLocalStorage() {
        try {
            const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
            return { success: true, settings: settings, fallback: true };
        } catch (error) {
            console.error('Failed to get settings from localStorage:', error);
            return { success: true, settings: {}, fallback: true };
        }
    }

    updateProfileInLocalStorage(profileData) {
        try {
            // 既存のユーザー情報を更新
            if (typeof auth !== 'undefined' && auth) {
                const currentUser = auth.getCurrentUser();
                if (currentUser) {
                    Object.assign(currentUser, profileData);
                    // auth.jsの更新メソッドがあれば呼び出し
                    if (typeof auth.updateCurrentUser === 'function') {
                        auth.updateCurrentUser(currentUser);
                    }
                }
            }
            
            return { success: true, fallback: true };
        } catch (error) {
            console.error('Failed to update profile in localStorage:', error);
            return { success: false, error: error.message };
        }
    }
}

// グローバルインスタンス
const settingsService = new SettingsService();

// グローバルアクセス用
window.settingsService = settingsService;