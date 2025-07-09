// プロフィール管理システム
class ProfileManager {
    constructor() {
        this.isEditMode = false;
        this.currentUser = auth.getCurrentUser();
        this.originalData = {};
        this.achievementCount = 3; // デフォルトの実績数
        this.initializeProfile();
    }

    // プロフィール初期化
    initializeProfile() {
        this.loadUserProfile();
        this.setupEventListeners();
    }

    // ユーザープロフィール読み込み
    loadUserProfile() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // デモデータで拡張
        const extendedProfile = {
            ...this.currentUser,
            bio: "製造業で20年以上の経験を持つ経営者です。特に品質管理と生産効率の向上に注力し、会社を成長させてきました。\n\n最近はデジタル変革に取り組んでおり、IoTやAIを活用した製造プロセスの改善を進めています。\n\n同じような課題を抱える経営者の皆様との情報交換や、新しいビジネス機会の創出を期待しています。",
            businessChallenges: ["売上拡大", "人材採用・育成", "デジタル変革", "新規事業開発"],
            annualRevenue: "10-50億円",
            investmentBudget: "1000-3000万円",
            connections: 127,
            eventsAttended: 45,
            businessMatches: 12,
            rating: 4.9,
            matchingSettings: {
                connectionApproval: "auto", // auto or manual
                profileVisibility: "public" // public, connections, limited
            },
            achievements: [
                {
                    year: 2020,
                    title: "品質向上プロジェクト完了",
                    description: "ISO9001認証取得により品質管理体制を強化。不良品率を30%削減。"
                },
                {
                    year: 2021,
                    title: "デジタル変革開始",
                    description: "生産ラインにIoTセンサーを導入し、リアルタイムでの品質監視を実現。"
                },
                {
                    year: 2022,
                    title: "売上20%増達成",
                    description: "新製品開発と営業体制強化により、前年比20%の売上向上を実現。"
                }
            ],
            contactInfo: {
                email: "tanaka@tanaka-shohi.co.jp",
                phone: "03-1234-5678",
                website: "https://tanaka-shohi.co.jp",
                linkedin: "linkedin.com/in/taro-tanaka"
            }
        };

        this.updateProfileDisplay(extendedProfile);
    }

    // プロフィール表示更新
    updateProfileDisplay(profile) {
        // 基本情報
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = `${profile.lastName} ${profile.firstName}`;
        }

        const profileTitle = document.querySelector('.profile-title');
        if (profileTitle) {
            profileTitle.textContent = `${profile.position} | ${profile.company}`;
        }

        const profileIndustry = document.querySelector('.profile-industry');
        if (profileIndustry) {
            profileIndustry.textContent = `${profile.industry} | 従業員数: ${profile.companySize} | 年商: ${profile.annualRevenue || 'N/A'}`;
        }

        // 統計情報
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 4) {
            statNumbers[0].textContent = profile.connections || 127;
            statNumbers[1].textContent = profile.eventsAttended || 45;
            statNumbers[2].textContent = profile.businessMatches || 12;
            statNumbers[3].textContent = profile.rating || 4.9;
        }

        // 会社情報
        this.updateInfoField('company', profile.company);
        this.updateInfoField('position', profile.position);
        this.updateInfoField('industry', profile.industry);
        this.updateInfoField('companySize', profile.companySize);
        this.updateInfoField('annualRevenue', profile.annualRevenue);
        this.updateInfoField('investmentBudget', profile.investmentBudget);

        // 事業課題
        this.updateBusinessChallenges(profile.businessChallenges);

        // 自己紹介
        const bioContent = document.getElementById('bio');
        if (bioContent && profile.bio) {
            bioContent.innerHTML = profile.bio.split('\n').map(p => `<p>${p}</p>`).join('');
        }

        // 実績・経歴
        this.updateAchievements(profile.achievements);

        // マッチング設定
        this.updateMatchingSettings(profile.matchingSettings);

        // 連絡先情報
        this.updateContactInfo(profile.contactInfo);

        // プロフィール画像
        const avatars = document.querySelectorAll('.profile-avatar, .user-avatar');
        avatars.forEach(avatar => {
            if (profile.profileImage) {
                avatar.src = profile.profileImage;
            }
        });
    }

    // 情報フィールド更新
    updateInfoField(fieldId, value) {
        const displayElement = document.getElementById(fieldId);
        const editElement = document.getElementById(`edit-${fieldId}`);
        
        if (displayElement) displayElement.textContent = value || 'N/A';
        if (editElement) editElement.value = value || '';
    }

    // 事業課題更新
    updateBusinessChallenges(challenges) {
        const container = document.getElementById('businessChallenges');
        if (container && challenges) {
            container.innerHTML = challenges.map(challenge => 
                `<span class="challenge-tag">${challenge}</span>`
            ).join('');
        }

        // 編集モード用チェックボックス更新
        const checkboxes = document.querySelectorAll('#edit-businessChallenges input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = challenges && challenges.includes(checkbox.value);
        });
    }

    // 実績・経歴更新
    updateAchievements(achievements) {
        const container = document.getElementById('achievements');
        if (container && achievements) {
            container.innerHTML = achievements.map(achievement => `
                <div class="achievement-item">
                    <div class="achievement-year">${achievement.year}</div>
                    <div class="achievement-content">
                        <h4>${achievement.title}</h4>
                        <p>${achievement.description}</p>
                    </div>
                </div>
            `).join('');
        }

        // 編集フォーム更新
        if (achievements) {
            achievements.forEach((achievement, index) => {
                const yearInput = document.getElementById(`achievement-year-${index}`);
                const titleInput = document.getElementById(`achievement-title-${index}`);
                const descInput = document.getElementById(`achievement-desc-${index}`);
                
                if (yearInput) yearInput.value = achievement.year;
                if (titleInput) titleInput.value = achievement.title;
                if (descInput) descInput.value = achievement.description;
            });
        }
    }

    // 連絡先情報更新
    updateContactInfo(contactInfo) {
        if (!contactInfo) return;

        // 表示用更新
        const emailDisplay = document.getElementById('contact-email');
        const phoneDisplay = document.getElementById('contact-phone');
        const websiteDisplay = document.getElementById('contact-website');
        const linkedinDisplay = document.getElementById('contact-linkedin');

        if (emailDisplay) emailDisplay.textContent = contactInfo.email || '';
        if (phoneDisplay) phoneDisplay.textContent = contactInfo.phone || '';
        if (websiteDisplay) websiteDisplay.textContent = contactInfo.website || '';
        if (linkedinDisplay) linkedinDisplay.textContent = contactInfo.linkedin || '';

        // 編集用更新
        const emailEdit = document.getElementById('edit-contact-email');
        const phoneEdit = document.getElementById('edit-contact-phone');
        const websiteEdit = document.getElementById('edit-contact-website');
        const linkedinEdit = document.getElementById('edit-contact-linkedin');

        if (emailEdit) emailEdit.value = contactInfo.email || '';
        if (phoneEdit) phoneEdit.value = contactInfo.phone || '';
        if (websiteEdit) websiteEdit.value = contactInfo.website || '';
        if (linkedinEdit) linkedinEdit.value = contactInfo.linkedin || '';
    }

    // マッチング設定更新
    updateMatchingSettings(matchingSettings) {
        if (!matchingSettings) return;

        // 表示用更新
        const connectionApprovalDisplay = document.getElementById('connectionApproval');
        const profileVisibilityDisplay = document.getElementById('profileVisibility');

        if (connectionApprovalDisplay) {
            connectionApprovalDisplay.textContent = matchingSettings.connectionApproval === 'auto' ? '自動承認' : '手動承認';
        }

        if (profileVisibilityDisplay) {
            let visibilityText;
            switch (matchingSettings.profileVisibility) {
                case 'public':
                    visibilityText = '全メンバーに公開';
                    break;
                case 'connections':
                    visibilityText = '接続済みメンバーのみ';
                    break;
                case 'limited':
                    visibilityText = '基本情報のみ公開';
                    break;
                default:
                    visibilityText = '全メンバーに公開';
            }
            profileVisibilityDisplay.textContent = visibilityText;
        }

        // 編集用更新
        const connectionApprovalEdit = document.getElementById('edit-connectionApproval');
        const profileVisibilityEdit = document.getElementById('edit-profileVisibility');

        if (connectionApprovalEdit) {
            connectionApprovalEdit.value = matchingSettings.connectionApproval || 'auto';
        }
        if (profileVisibilityEdit) {
            profileVisibilityEdit.value = matchingSettings.profileVisibility || 'public';
        }
    }

    // イベントリスナー設定
    setupEventListeners() {
        // プロフィール画像変更
        const avatarWrapper = document.querySelector('.profile-avatar-wrapper');
        const avatarInput = document.getElementById('avatarInput');
        
        if (avatarWrapper && avatarInput) {
            avatarWrapper.addEventListener('click', () => {
                if (this.isEditMode) {
                    avatarInput.click();
                }
            });

            avatarInput.addEventListener('change', (e) => {
                this.handleAvatarChange(e);
            });
        }

        // サイドバー同期
        this.syncSidebarState();
    }

    // サイドバー状態同期
    syncSidebarState() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            if (link && link.getAttribute('href') === 'profile.html') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // アバター画像変更処理
    handleAvatarChange(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB制限
                showNotification('画像サイズは5MB以下にしてください', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const avatars = document.querySelectorAll('.profile-avatar, .user-avatar');
                avatars.forEach(avatar => {
                    avatar.src = e.target.result;
                });
                showNotification('プロフィール画像を更新しました', 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    // 編集モード切り替え
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        
        if (this.isEditMode) {
            this.enterEditMode();
        } else {
            this.exitEditMode();
        }
    }

    // 編集モード開始
    enterEditMode() {
        // 現在のデータを保存
        this.saveOriginalData();

        // 表示要素を非表示、編集要素を表示
        const displayElements = document.querySelectorAll('[id^="company"], [id^="position"], [id^="industry"], [id^="companySize"], [id^="annualRevenue"], [id^="investmentBudget"], #bio, #businessChallenges, #matchingSettings, #achievements, #contact-info');
        const editElements = document.querySelectorAll('[id^="edit-"]');

        displayElements.forEach(el => {
            if (!el.id.startsWith('edit-')) {
                el.style.display = 'none';
            }
        });

        editElements.forEach(el => {
            if (el.tagName === 'TEXTAREA') {
                el.style.display = 'block';
            } else if (el.classList.contains('edit-achievements') || el.classList.contains('edit-contact') || el.classList.contains('matching-settings-edit')) {
                el.style.display = 'block';
            } else {
                el.style.display = 'inline-block';
            }
        });

        // 編集アクションボタン表示
        const editActions = document.getElementById('editActions');
        if (editActions) {
            editActions.style.display = 'flex';
        }

        // ヘッダーボタン更新
        const headerBtn = document.querySelector('.header-actions .btn-primary');
        if (headerBtn) {
            headerBtn.innerHTML = '<i class="fas fa-times"></i> キャンセル';
            headerBtn.onclick = () => this.cancelEdit();
        }

        // アバターオーバーレイ有効化
        const avatarOverlay = document.getElementById('avatarOverlay');
        if (avatarOverlay) {
            avatarOverlay.style.display = 'flex';
        }

        showNotification('編集モードになりました', 'info');
    }

    // 編集モード終了
    exitEditMode() {
        // 表示要素を表示、編集要素を非表示
        const displayElements = document.querySelectorAll('[id^="company"], [id^="position"], [id^="industry"], [id^="companySize"], [id^="annualRevenue"], [id^="investmentBudget"], #bio, #businessChallenges, #matchingSettings, #achievements, #contact-info');
        const editElements = document.querySelectorAll('[id^="edit-"]');

        displayElements.forEach(el => {
            if (!el.id.startsWith('edit-')) {
                el.style.display = '';
            }
        });

        editElements.forEach(el => {
            el.style.display = 'none';
        });

        // 編集アクションボタン非表示
        const editActions = document.getElementById('editActions');
        if (editActions) {
            editActions.style.display = 'none';
        }

        // ヘッダーボタン更新
        const headerBtn = document.querySelector('.header-actions .btn-primary');
        if (headerBtn) {
            headerBtn.innerHTML = '<i class="fas fa-edit"></i> 編集';
            headerBtn.onclick = () => this.toggleEditMode();
        }

        this.isEditMode = false;
    }

    // 元データ保存
    saveOriginalData() {
        this.originalData = {
            company: document.getElementById('company').textContent,
            position: document.getElementById('position').textContent,
            industry: document.getElementById('industry').textContent,
            companySize: document.getElementById('companySize').textContent,
            annualRevenue: document.getElementById('annualRevenue').textContent,
            investmentBudget: document.getElementById('investmentBudget').textContent,
            bio: document.getElementById('edit-bio').value,
            businessChallenges: Array.from(document.querySelectorAll('#edit-businessChallenges input:checked')).map(cb => cb.value),
            matchingSettings: this.getMatchingSettingsFromForm(),
            achievements: this.getAchievementsFromForm(),
            contactInfo: this.getContactInfoFromForm()
        };
    }

    // 編集キャンセル
    cancelEdit() {
        // 元のデータに戻す
        if (this.originalData) {
            Object.keys(this.originalData).forEach(key => {
                if (key === 'businessChallenges') {
                    const checkboxes = document.querySelectorAll('#edit-businessChallenges input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        cb.checked = this.originalData[key].includes(cb.value);
                    });
                } else {
                    const editElement = document.getElementById(`edit-${key}`);
                    const displayElement = document.getElementById(key);
                    if (editElement) editElement.value = this.originalData[key];
                    if (displayElement) displayElement.textContent = this.originalData[key];
                }
            });
        }

        this.exitEditMode();
        showNotification('編集をキャンセルしました', 'info');
    }

    // プロフィール保存
    saveProfile() {
        const updatedData = {
            company: document.getElementById('edit-company').value,
            position: document.getElementById('edit-position').value,
            industry: document.getElementById('edit-industry').value,
            companySize: document.getElementById('edit-companySize').value,
            annualRevenue: document.getElementById('edit-annualRevenue').value,
            investmentBudget: document.getElementById('edit-investmentBudget').value,
            bio: document.getElementById('edit-bio').value,
            businessChallenges: Array.from(document.querySelectorAll('#edit-businessChallenges input:checked')).map(cb => cb.value),
            matchingSettings: this.getMatchingSettingsFromForm(),
            achievements: this.getAchievementsFromForm(),
            contactInfo: this.getContactInfoFromForm()
        };

        // バリデーション
        if (!updatedData.company.trim()) {
            showNotification('会社名は必須です', 'error');
            return;
        }

        if (!updatedData.position) {
            showNotification('役職は必須です', 'error');
            return;
        }

        if (updatedData.businessChallenges.length === 0) {
            showNotification('事業課題を少なくとも1つ選択してください', 'error');
            return;
        }

        // 連絡先のバリデーション
        if (updatedData.contactInfo.email && !this.isValidEmail(updatedData.contactInfo.email)) {
            showNotification('有効なメールアドレスを入力してください', 'error');
            return;
        }

        // データ更新
        this.updateDisplayFromEditData(updatedData);
        
        // 実績、マッチング設定、連絡先の更新
        this.updateAchievements(updatedData.achievements);
        this.updateMatchingSettings(updatedData.matchingSettings);
        this.updateContactInfo(updatedData.contactInfo);

        // ローカルストレージに保存（実際の実装ではAPIに送信）
        const currentUser = auth.getCurrentUser();
        if (currentUser) {
            Object.assign(currentUser, updatedData);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        this.exitEditMode();
        showNotification('プロフィールを更新しました', 'success');
    }

    // 編集データから表示更新
    updateDisplayFromEditData(data) {
        // 基本情報更新
        Object.keys(data).forEach(key => {
            if (key === 'businessChallenges') {
                this.updateBusinessChallenges(data[key]);
            } else if (key === 'bio') {
                const bioContent = document.getElementById('bio');
                if (bioContent) {
                    bioContent.innerHTML = data[key].split('\n').map(p => `<p>${p}</p>`).join('');
                }
            } else {
                const displayElement = document.getElementById(key);
                if (displayElement) {
                    displayElement.textContent = data[key];
                }
            }
        });

        // プロフィールタイトル更新
        const profileTitle = document.querySelector('.profile-title');
        if (profileTitle) {
            profileTitle.textContent = `${data.position} | ${data.company}`;
        }

        const profileIndustry = document.querySelector('.profile-industry');
        if (profileIndustry) {
            profileIndustry.textContent = `${data.industry} | 従業員数: ${data.companySize} | 年商: ${data.annualRevenue}`;
        }
    }

    // フォームから実績データを取得
    getAchievementsFromForm() {
        const achievements = [];
        for (let i = 0; i < this.achievementCount; i++) {
            const yearInput = document.getElementById(`achievement-year-${i}`);
            const titleInput = document.getElementById(`achievement-title-${i}`);
            const descInput = document.getElementById(`achievement-desc-${i}`);
            
            if (yearInput && titleInput && descInput && 
                yearInput.value && titleInput.value && descInput.value) {
                achievements.push({
                    year: parseInt(yearInput.value),
                    title: titleInput.value.trim(),
                    description: descInput.value.trim()
                });
            }
        }
        return achievements.sort((a, b) => b.year - a.year);
    }

    // フォームから連絡先データを取得
    getContactInfoFromForm() {
        return {
            email: document.getElementById('edit-contact-email')?.value.trim() || '',
            phone: document.getElementById('edit-contact-phone')?.value.trim() || '',
            website: document.getElementById('edit-contact-website')?.value.trim() || '',
            linkedin: document.getElementById('edit-contact-linkedin')?.value.trim() || ''
        };
    }

    // フォームからマッチング設定データを取得
    getMatchingSettingsFromForm() {
        return {
            connectionApproval: document.getElementById('edit-connectionApproval')?.value || 'auto',
            profileVisibility: document.getElementById('edit-profileVisibility')?.value || 'public'
        };
    }

    // メールアドレス検証
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 実績追加
    addAchievement() {
        const achievementForm = document.querySelector('.achievement-form');
        if (!achievementForm) return;

        const newIndex = this.achievementCount;
        const currentYear = new Date().getFullYear();
        
        const newAchievementHTML = `
            <div class="achievement-form-item">
                <label>年</label>
                <input type="number" id="achievement-year-${newIndex}" value="${currentYear}" min="1950" max="2030">
                <label>タイトル</label>
                <input type="text" id="achievement-title-${newIndex}" placeholder="実績のタイトルを入力">
                <label>説明</label>
                <textarea id="achievement-desc-${newIndex}" rows="2" placeholder="実績の詳細説明を入力"></textarea>
                <button type="button" class="btn-remove" onclick="removeAchievement(${newIndex})">削除</button>
            </div>
        `;
        
        achievementForm.insertAdjacentHTML('beforeend', newAchievementHTML);
        this.achievementCount++;
        
        showNotification('新しい実績項目を追加しました', 'success');
    }

    // 実績削除
    removeAchievement(index) {
        const achievementItem = document.getElementById(`achievement-year-${index}`)?.closest('.achievement-form-item');
        if (achievementItem) {
            achievementItem.remove();
            showNotification('実績項目を削除しました', 'info');
        }
    }
}

// グローバル関数
function toggleEditMode() {
    if (window.profileManager) {
        window.profileManager.toggleEditMode();
    }
}

function cancelEdit() {
    if (window.profileManager) {
        window.profileManager.cancelEdit();
    }
}

function saveProfile() {
    if (window.profileManager) {
        window.profileManager.saveProfile();
    }
}

function addAchievement() {
    if (window.profileManager) {
        window.profileManager.addAchievement();
    }
}

function removeAchievement(index) {
    if (window.profileManager) {
        window.profileManager.removeAchievement(index);
    }
}

// 通知表示関数
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#ffc107';
        notification.style.color = '#212529';
    } else {
        notification.style.backgroundColor = '#17a2b8';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // 認証チェック
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // プロフィールマネージャー初期化
    window.profileManager = new ProfileManager();
});