// Profile JavaScript

// デバッグモードの判定
const DEBUG_MODE = window.location.hostname === 'localhost' || 
                   window.location.search.includes('debug=true');

// デバッグログ関数
function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log('[Profile]', ...args);
    }
}

debugLog('profile.js loading started');

// 名前空間を使用してグローバル汚染を防ぐ
window.InterConnect = window.InterConnect || {};
debugLog('InterConnect namespace:', window.InterConnect);

window.InterConnect.Profile = {
    currentTab: 'about',
    profileData: null,
    isOwnProfile: true, // 自分のプロフィールかどうか
    targetUserId: null, // 表示対象のユーザーID
    currentUserId: null, // ログイン中のユーザーID
    profileCache: {}, // プロフィールデータのキャッシュ
    cacheExpiry: 5 * 60 * 1000, // 5分間のキャッシュ
    isLoading: false, // ローディング状態
    initialized: false, // 初期化済みフラグ
    
    // 初期化
    init: async function() {
        debugLog('初期化開始...');
        debugLog('現在のURL:', window.location.href);
        debugLog('URLパラメータ:', window.location.search);
        
        // 重複初期化を防ぐ
        if (this.initialized || this.isLoading) {
            debugLog('既に初期化済みまたは初期化中');
            return;
        }
        
        this.isLoading = true;
        this.showLoadingState();
        
        try {
            // URLパラメータからユーザーIDを取得
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('user');
            debugLog('URLから取得したユーザーID:', userId);
            
            // 現在のユーザーIDを取得
            await this.getCurrentUser();
            debugLog('現在のユーザーID:', this.currentUserId);
        
        if (userId) {
            // userパラメータが指定されている場合
            if (userId !== this.currentUserId) {
                // 他のユーザーのプロフィール
                debugLog('他のユーザーのプロフィールを表示:', userId);
                this.isOwnProfile = false;
                this.targetUserId = userId;
                await this.loadOtherUserProfile(userId);
            } else {
                // 自分のプロフィール（userパラメータで指定された場合）
                debugLog('自分のプロフィールを表示 (userパラメータ指定)');
                this.isOwnProfile = true;
                this.targetUserId = this.currentUserId;
                await this.loadProfileData();
            }
        } else {
            // userパラメータがない場合は自分のプロフィール
            debugLog('自分のプロフィールを表示 (デフォルト)');
            this.isOwnProfile = true;
            this.targetUserId = this.currentUserId;
            await this.loadProfileData();
        }
        
            // UIの初期化
            this.updateUIMode();
            this.initializeTabs();
            this.initializeEditModal();
            
            this.initialized = true;
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    },
    
    // 現在のユーザー情報を取得
    getCurrentUser: async function() {
        try {
            // 統一されたクライアント名を使用
            const client = window.supabaseClient?Client;
            if (client) {
                const { data: { user } } = await client.auth.getUser();
                if (user) {
                    this.currentUserId = user.id;
                    debugLog('現在のユーザーID:', this.currentUserId);
                    return;
                }
            }
            
            // フォールバック: localStorageから取得
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                this.currentUserId = userData.id;
            }
        } catch (error) {
            debugLog('ユーザー情報取得エラー:', error);
        }
    },
    
    // 他のユーザーのプロフィールを読み込む
    loadOtherUserProfile: async function(userId) {
        debugLog('loadOtherUserProfile開始:', userId);
        try {
            // SQLインジェクション対策：UUIDの検証
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(userId)) {
                debugLog('無効なユーザーID:', userId);
                this.showError('無効なユーザーIDです');
                return;
            }
            
            // キャッシュをチェック
            const cached = this.getFromCache(userId);
            if (cached) {
                debugLog('キャッシュからデータを使用:', userId);
                this.profileData = cached;
                await this.checkConnectionStatus(userId);
                this.updateProfileInfo();
                return;
            }
            
            const client = window.supabaseClient?Client;
            if (!client) {
                debugLog('Supabaseが初期化されていません');
                // フォールバック：localStorageから基本情報を取得
                this.showFallbackProfile(userId);
                return;
            }
            
            // user_profilesテーブルから他のユーザー情報を取得（公開情報のみ）
            const { data, error } = await client
                .from('user_profiles')
                .select(`
                    id,
                    name,
                    full_name,
                    email,
                    company,
                    position,
                    avatar_url,
                    industry,
                    skills,
                    bio,
                    is_online,
                    last_login_at
                `)
                .eq('id', userId)
                .eq('is_active', true)
                .single();
            
            if (error) {
                debugLog('プロフィール取得エラー:', error);
                debugLog('エラー詳細:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                this.showError('ユーザーが見つかりません');
                return;
            }
            
            if (!data) {
                this.showError('ユーザーが見つかりません');
                return;
            }
            
            debugLog('他のユーザーデータ:', data);
            
            // プロフィールデータを設定
            this.profileData = {
                id: data.id,
                name: data.full_name || data.name || 'ユーザー',
                email: data.email,
                company: data.company || '未設定',
                position: data.position || '未設定',
                title: data.position || '役職未設定', // titleカラムは存在しないのでpositionを使用
                profileImage: data.avatar_url || 'assets/user-placeholder.svg',
                industry: data.industry || '未設定',
                skills: data.skills || [],
                bio: data.bio || '',
                connectionCount: 0, // 後で別途取得
                isOnline: data.is_online || false,
                lastLoginAt: data.last_login_at
            };
            
            // コネクション数を別途取得
            await this.loadConnectionCount(userId);
            
            // キャッシュに保存
            this.saveToCache(userId, this.profileData);
            
            // コネクションステータスを確認
            await this.checkConnectionStatus(userId);
            
            // UIを更新
            this.updateProfileInfo();
            
        } catch (error) {
            debugLog('プロフィール読み込みエラー:', error);
            this.showError('プロフィールの読み込みに失敗しました');
        }
    },
    
    // コネクション数を取得
    loadConnectionCount: async function(userId) {
        try {
            const client = window.supabaseClient?Client;
            if (!client) return;
            
            // connectionsテーブルの構造: user_id, connected_user_id, status
            const { data, error } = await client
                .from('connections')
                .select('id')
                .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
                .eq('status', 'connected');
            
            if (!error && data) {
                this.profileData.connectionCount = data.length;
                debugLog('コネクション数:', data.length);
            } else if (error) {
                debugLog('コネクション数取得エラー:', error);
                // user_profilesテーブルから直接取得を試みる
                const { data: profileData } = await client
                    .from('user_profiles')
                    .select('connection_count')
                    .eq('id', userId)
                    .single();
                
                if (profileData && profileData.connection_count !== null) {
                    this.profileData.connectionCount = profileData.connection_count;
                    debugLog('コネクション数（プロフィールから）:', profileData.connection_count);
                }
            }
        } catch (error) {
            debugLog('コネクション数取得エラー:', error);
        }
    },
    
    // コネクションステータスを確認
    checkConnectionStatus: async function(userId) {
        try {
            const client = window.supabaseClient?Client;
            if (!client || !this.currentUserId) return;
            
            const { data } = await client
                .from('connections')
                .select('status')
                .or(`and(user_id.eq.${this.currentUserId},connected_user_id.eq.${userId}),and(user_id.eq.${userId},connected_user_id.eq.${this.currentUserId})`)
                .single();
            
            if (data) {
                this.connectionStatus = data.status;
                debugLog('コネクションステータス:', this.connectionStatus);
            }
        } catch (error) {
            debugLog('コネクションステータス確認エラー:', error);
            // エラーの場合はステータスをnullに設定
            this.connectionStatus = null;
        }
    },
    
    // プロフィールデータの読み込み（自分用）
    loadProfileData: async function() {
        debugLog('loadProfileData開始');
        try {
            // プロフィールデータを初期化
            this.profileData = {
                id: this.currentUserId,
                name: 'ユーザー',
                email: '',
                company: '未設定',
                position: '未設定',
                profileImage: 'assets/user-placeholder.svg',
                industry: '未設定',
                skills: [],
                bio: '',
                connectionCount: 0,
                isOnline: false
            };
            
            // Supabaseから最新のプロフィールデータを取得（これが最優先）
            const client = window.supabaseClient?Client;
            if (client && this.currentUserId) {
                const { data, error } = await client
                    .from('user_profiles')
                    .select(`
                        id,
                        name,
                        full_name,
                        email,
                        company,
                        position,
                        avatar_url,
                        industry,
                        skills,
                        bio,
                        is_online,
                        created_at,
                        updated_at
                    `)
                    .eq('id', this.currentUserId)
                    .single();
                
                if (data && !error) {
                    debugLog('Supabaseデータ取得成功:', data);
                    // Supabaseのデータでプロフィールを更新
                    this.profileData = {
                        id: data.id,
                        name: data.full_name || data.name || 'ユーザー',
                        email: data.email || '',
                        company: data.company || '未設定',
                        position: data.position || '未設定',
                        profileImage: data.avatar_url || 'assets/user-placeholder.svg',
                        industry: data.industry || '未設定',
                        skills: data.skills || [],
                        bio: data.bio || '',
                        connectionCount: 0, // 後で別途取得
                        isOnline: data.is_online || false,
                        createdAt: data.created_at,
                        updatedAt: data.updated_at
                    };
                } else if (error) {
                    debugLog('Supabaseエラー:', error);
                }
            }
            
            // localStorageから追加情報を取得（画像URLなど）
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const userData = JSON.parse(userStr);
                    // 画像URLが存在し、Supabaseにない場合のみ更新
                    if ((userData.picture || userData.picture_url) && 
                        this.profileData.profileImage === 'assets/user-placeholder.svg') {
                        this.profileData.profileImage = userData.picture || userData.picture_url;
                    }
                } catch (e) {
                    debugLog('localStorage解析エラー:', e);
                }
            }
            
            // コネクション数を取得
            if (this.currentUserId) {
                await this.loadConnectionCount(this.currentUserId);
            }
            
            // UIを更新
            this.updateProfileInfo();
            
        } catch (error) {
            debugLog('プロフィールデータ読み込みエラー:', error);
            // エラーが発生してもUIは更新
            this.updateProfileInfo();
        }
    },
    
    // UIモードの更新
    updateUIMode: function() {
        debugLog('UIモード更新 - isOwnProfile:', this.isOwnProfile);
        debugLog('targetUserId:', this.targetUserId);
        debugLog('connectionStatus:', this.connectionStatus);
        
        const editAvatarBtn = document.querySelector('.btn-edit-avatar');
        const editCoverBtn = document.querySelector('.btn-edit-cover');
        
        if (this.isOwnProfile) {
            // 自分のプロフィール
            // 編集ボタンを表示
            if (editAvatarBtn) editAvatarBtn.style.display = 'flex';
            if (editCoverBtn) editCoverBtn.style.display = 'flex';
        } else {
            // 他人のプロフィール
            // すべての編集ボタンを非表示
            if (editAvatarBtn) editAvatarBtn.style.display = 'none';
            if (editCoverBtn) editCoverBtn.style.display = 'none';
        }
    },
    
    // コネクト申請を送る
    sendConnectionRequest: async function() {
        try {
            const client = window.supabaseClient?Client;
            if (!client || !this.currentUserId || !this.targetUserId) {
                alert('ログインが必要です');
                return;
            }
            
            // connectionsテーブルの正しいカラム名を使用
            const { error } = await client
                .from('connections')
                .insert({
                    user_id: this.currentUserId,
                    connected_user_id: this.targetUserId,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            
            if (error) throw error;
            
            alert('コネクト申請を送信しました');
            this.connectionStatus = 'pending';
            this.updateUIMode();
            
        } catch (error) {
            debugLog('コネクト申請エラー:', error);
            alert('コネクト申請の送信に失敗しました');
        }
    },
    
    // メッセージを送る
    sendMessage: function() {
        // メッセージページへ遷移
        window.location.href = `messages.html?user=${this.targetUserId}`;
    },
    
    // エラー表示
    showError: function(message) {
        const container = document.querySelector('.profile-container');
        if (container) {
            // XSS対策: テキストをエスケープ
            const escapeHtml = (text) => {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            };
            
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
                    <h2 style="color: #dc3545; margin-bottom: 0.5rem;">エラー</h2>
                    <p style="color: #6c757d;">${escapeHtml(message)}</p>
                    <a href="members.html" class="btn btn-primary" style="margin-top: 1rem;">メンバー一覧へ戻る</a>
                </div>
            `;
        }
    },
    
    // プロフィール情報の更新
    updateProfileInfo: function() {
        debugLog('updateProfileInfo called');
        const data = this.profileData;
        debugLog('Profile data:', data);
        
        if (!data) {
            debugLog('No profile data found');
            return;
        }
        
        // ユーザー名の更新（nullチェック強化）
        const userNameElements = document.querySelectorAll('.user-name, .profile-details h2');
        debugLog('User name elements found:', userNameElements.length);
        if (userNameElements && userNameElements.length > 0) {
            userNameElements.forEach(el => {
                if (el && el.textContent !== undefined) {
                    el.textContent = data.name || 'ユーザー名';
                }
            });
        }
        
        // 会社名（nullチェック強化）
        const companyElement = document.querySelector('.profile-company');
        if (companyElement && companyElement.textContent !== undefined) {
            companyElement.textContent = data.company || '会社名';
        }
        
        // 役職（nullチェック強化）
        const positionElement = document.querySelector('.profile-title');
        if (positionElement && positionElement.textContent !== undefined) {
            positionElement.textContent = data.title || data.position || '役職・肩書き';
        }
        
        // 統計情報の更新
        this.updateProfileStats(data);
        
        // オンラインステータスの更新
        if (!this.isOwnProfile && data.isOnline !== undefined) {
            const onlineIndicator = document.querySelector('.online-indicator');
            if (onlineIndicator) {
                onlineIndicator.style.display = data.isOnline ? 'block' : 'none';
            }
        }
        
        // プロフィール画像の更新
        if (data.profileImage) {
            // プロフィールページのアバター画像
            const profileAvatar = document.querySelector('.profile-avatar img');
            if (profileAvatar) {
                profileAvatar.src = data.profileImage;
                profileAvatar.onerror = function() {
                    this.src = 'assets/user-placeholder.svg';
                };
                debugLog('Profile avatar updated:', data.profileImage);
            }
            
            // ヘッダーのユーザーアバター
            const headerAvatar = document.querySelector('.user-menu-btn img');
            if (headerAvatar) {
                headerAvatar.src = data.profileImage;
                headerAvatar.onerror = function() {
                    this.src = 'assets/user-placeholder.svg';
                };
                debugLog('Header avatar updated:', data.profileImage);
            }
        }
        
        // カバー画像の更新
        if (data.coverImage) {
            const coverImg = document.querySelector('.profile-cover img');
            if (coverImg) {
                coverImg.src = data.coverImage;
                coverImg.onerror = function() {
                    this.style.display = 'none';
                };
                debugLog('Cover image updated:', data.coverImage);
            }
        }
        
        // 基本情報タブの内容を更新
        this.updateAboutTab();
        
        // スキルタブの更新
        this.updateSkillsTab();
        
        // プロジェクトタブの更新
        this.updateProjectsTab();
        
        // コネクションタブの更新
        this.updateConnectionsTab();
    },
    
    // タブの初期化
    initializeTabs: function() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // アクティブクラスの切り替え
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // タブコンテンツの表示切り替え
                tabContents.forEach(content => {
                    if (content.getAttribute('data-tab') === targetTab) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
                
                this.currentTab = targetTab;
            });
        });
    },
    
    // 編集モーダルの初期化
    initializeEditModal: function() {
        if (!this.isOwnProfile) return; // 他人のプロフィールでは初期化しない
        
        // モーダルの閉じるボタン
        const closeButtons = document.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeEditModal();
            });
        });
        
        // 保存ボタンはHTML側でonclick属性で処理されるため不要
        
        // 画像アップロードはprofile-image-upload.jsで処理
    },
    
    // 編集モーダルを開く
    openEditModal: function() {
        const modal = document.getElementById('profileEditModal');
        if (!modal) {
            debugLog('編集モーダルが見つかりません');
            return;
        }
        
        // 自分のプロフィールでない場合は編集不可
        if (!this.isOwnProfile) {
            alert('他のユーザーのプロフィールは編集できません');
            return;
        }
        
        // 現在のデータをフォームに反映
        const data = this.profileData || {};
        
        // 各フィールドに値を設定（IDを修正）
        const nameInput = document.getElementById('edit-name');
        if (nameInput) nameInput.value = data.name || '';
        
        const companyInput = document.getElementById('edit-company');
        if (companyInput) companyInput.value = data.company || '';
        
        const positionInput = document.getElementById('edit-position');
        if (positionInput) positionInput.value = data.position || '';
        
        const bioInput = document.getElementById('edit-bio');
        if (bioInput) bioInput.value = data.bio || '';
        
        const emailInput = document.getElementById('edit-email');
        if (emailInput) emailInput.value = data.email || '';
        
        // モーダルを表示
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    },
    
    // 編集モーダルを閉じる
    closeEditModal: function() {
        const modal = document.getElementById('profileEditModal');
        if (!modal) return;
        
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    },
    
    // プロフィールを保存
    saveProfile: async function() {
        debugLog('saveProfile called');
        
        // フォームからデータを取得（正しいIDを使用）
        const nameInput = document.getElementById('edit-name');
        const companyInput = document.getElementById('edit-company');
        const positionInput = document.getElementById('edit-position');
        const bioInput = document.getElementById('edit-bio');
        const emailInput = document.getElementById('edit-email');
        const phoneInput = document.getElementById('edit-phone');
        
        if (!this.currentUserId) {
            alert('ユーザー情報を取得できません。再度ログインしてください。');
            return;
        }
        
        // バリデーション
        const validationResult = this.validateProfileData({
            name: nameInput?.value,
            email: emailInput?.value,
            company: companyInput?.value,
            phone: phoneInput?.value
        });
        
        if (!validationResult.isValid) {
            alert(validationResult.message);
            return;
        }
        
        // 更新データを準備
        const updateData = {
            full_name: nameInput?.value?.trim() || '',
            email: emailInput?.value?.trim() || '',
            company: companyInput?.value?.trim() || '',
            position: positionInput?.value?.trim() || '',
            bio: bioInput?.value?.trim() || '',
            updated_at: new Date().toISOString()
        };
        
        try {
            // Supabaseに保存
            const client = window.supabaseClient?Client;
            if (client) {
                const { data, error } = await client
                    .from('user_profiles')
                    .update(updateData)
                    .eq('id', this.currentUserId)
                    .select()
                    .single();
                
                if (error) {
                    debugLog('プロフィール更新エラー:', error);
                    alert('プロフィールの更新に失敗しました: ' + error.message);
                    return;
                }
                
                debugLog('プロフィール更新成功:', data);
                
                // ローカルのプロフィールデータも更新
                if (this.profileData) {
                    this.profileData.name = updateData.full_name;
                    this.profileData.company = updateData.company;
                    this.profileData.position = updateData.position;
                    this.profileData.bio = updateData.bio;
                }
            }
            
            // localStorageにも保存（キャッシュ用）
            if (window.safeLocalStorage && this.profileData) {
                window.safeLocalStorage.setJSON('userProfile', this.profileData);
                debugLog('Profile saved to localStorage');
            }
            
            // UIを更新
            this.updateProfileInfo();
            
            // モーダルを閉じる
            this.closeEditModal();
            
            // 成功メッセージ
            this.showSuccessMessage('プロフィールを更新しました');
            
        } catch (error) {
            debugLog('プロフィール保存エラー:', error);
            alert('プロフィールの保存中にエラーが発生しました');
        }
    },
    
    // 画像アップロードの処理
    handleImageUpload: function(event, type) {
        const file = event.target.files[0];
        if (!file) return;
        
        // ファイルサイズチェック（5MB以下）
        if (file.size > 5 * 1024 * 1024) {
            alert('ファイルサイズは5MB以下にしてください');
            return;
        }
        
        // 画像ファイルチェック
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            if (!this.profileData) {
                this.profileData = {};
            }
            
            if (type === 'avatar') {
                this.profileData.profileImage = e.target.result;
                // プレビュー更新
                const preview = document.querySelector('.avatar-preview');
                if (preview) preview.style.backgroundImage = `url(${e.target.result})`;
            } else if (type === 'cover') {
                this.profileData.coverImage = e.target.result;
                // プレビュー更新
                const preview = document.querySelector('.cover-preview');
                if (preview) preview.style.backgroundImage = `url(${e.target.result})`;
            }
        };
        reader.readAsDataURL(file);
    },
    
    // 基本情報タブの更新
    updateAboutTab: function() {
        debugLog('updateAboutTab called');
        const data = this.profileData;
        if (!data) return;
        
        // 各フィールドを更新
        const bioElement = document.getElementById('profileBioDisplay');
        if (bioElement) bioElement.textContent = data.bio || '自己紹介が登録されていません。';
        
        // 売上情報の更新
        const revenueDetailElement = document.getElementById('revenueDetailText');
        if (revenueDetailElement) {
            const revenueDetail = data['revenue-details'] || '詳細情報なし';
            debugLog('Setting revenue detail:', revenueDetail);
            revenueDetailElement.textContent = revenueDetail;
        }
        
        // 人事課題の更新
        const hrDetailElement = document.getElementById('hrDetailText');
        if (hrDetailElement) {
            const hrDetail = data['hr-details'] || '詳細情報なし';
            debugLog('Setting HR detail:', hrDetail);
            hrDetailElement.textContent = hrDetail;
        }
        
        // DX推進状況の更新
        const dxDetailElement = document.getElementById('dxDetailText');
        if (dxDetailElement) {
            const dxDetail = data['dx-details'] || '詳細情報なし';
            debugLog('Setting DX detail:', dxDetail);
            dxDetailElement.textContent = dxDetail;
        }
        
        // 経営戦略の更新
        const strategyDetailElement = document.getElementById('strategyDetailText');
        if (strategyDetailElement) {
            const strategyDetail = data['strategy-details'] || '詳細情報なし';
            debugLog('Setting strategy detail:', strategyDetail);
            strategyDetailElement.textContent = strategyDetail;
        }
    },
    
    // スキルタブの更新
    updateSkillsTab: function() {
        const data = this.profileData;
        if (!data) return;
        
        const skillsContainer = document.querySelector('.skills-grid');
        if (!skillsContainer) return;
        
        // スキルがある場合
        if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
            // XSS対策: HTMLエスケープ
            const escapeHtml = (text) => {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            };
            
            skillsContainer.innerHTML = data.skills.map(skill => `
                <div class="skill-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${escapeHtml(skill)}</span>
                </div>
            `).join('');
        } else {
            // スキルがない場合
            skillsContainer.innerHTML = `
                <div class="no-skills-message" style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem; color: #9ca3af;"></i>
                    <p>スキルが登録されていません</p>
                    ${this.isOwnProfile ? '<button class="btn btn-outline" onclick="window.InterConnect?.Profile?.openSkillsModal()">スキルを追加</button>' : ''}
                </div>
            `;
        }
    },
    
    // プロジェクトタブの更新
    updateProjectsTab: function() {
        const projectsContainer = document.querySelector('.projects-grid');
        if (!projectsContainer) return;
        
        // 将来的にプロジェクトデータを表示
        projectsContainer.innerHTML = `
            <div class="no-projects-message" style="text-align: center; padding: 2rem; color: #6b7280;">
                <i class="fas fa-briefcase" style="font-size: 2rem; margin-bottom: 1rem; color: #9ca3af;"></i>
                <p>プロジェクト機能は準備中です</p>
            </div>
        `;
    },
    
    // コネクションタブの更新
    updateConnectionsTab: function() {
        const connectionsContainer = document.querySelector('.connections-grid');
        if (!connectionsContainer) return;
        
        // コネクション数を表示
        const connectionCount = this.profileData?.connectionCount || 0;
        connectionsContainer.innerHTML = `
            <div class="connections-summary" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; font-weight: bold; color: #0066ff; margin-bottom: 0.5rem;">
                    ${connectionCount}
                </div>
                <p style="color: #6b7280;">コネクション</p>
                ${!this.isOwnProfile ? '' : '<a href="members.html" class="btn btn-primary" style="margin-top: 1rem;">メンバーを探す</a>'}
            </div>
        `;
    },
    
    // プロフィール統計情報の更新
    updateProfileStats: function(data) {
        debugLog('統計情報更新:', data);
        
        // コネクション数
        const connectionCountEl = document.querySelector('.stat-value.connection-count');
        if (connectionCountEl && data.connectionCount !== undefined) {
            connectionCountEl.textContent = data.connectionCount;
        }
        
        // メッセージ数（今は固定値）
        const messageCountEl = document.querySelector('.stat-value.message-count');
        if (messageCountEl) {
            messageCountEl.textContent = data.messageCount || 0;
        }
        
        // マッチング率（今は固定値）
        const matchingRateEl = document.querySelector('.stat-value.matching-rate');
        if (matchingRateEl) {
            matchingRateEl.textContent = data.matchingRate || '0%';
        }
    },
    
    // キャッシュから取得
    getFromCache: function(userId) {
        const cached = this.profileCache[userId];
        if (cached && (Date.now() - cached.timestamp < this.cacheExpiry)) {
            return cached.data;
        }
        // 期限切れの場合は削除
        if (cached) {
            delete this.profileCache[userId];
        }
        return null;
    },
    
    // キャッシュに保存
    saveToCache: function(userId, data) {
        this.profileCache[userId] = {
            data: data,
            timestamp: Date.now()
        };
    },
    
    // キャッシュをクリア
    clearCache: function() {
        this.profileCache = {};
    },
    
    // ローディング状態を表示
    showLoadingState: function() {
        const container = document.querySelector('.profile-container');
        if (container && !container.querySelector('.loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>プロフィールを読み込んでいます...</p>
                </div>
            `;
            container.appendChild(overlay);
        }
    },
    
    // ローディング状態を非表示
    hideLoadingState: function() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    },
    
    // フォールバックプロフィール表示
    showFallbackProfile: function(userId) {
        debugLog('フォールバックモードでプロフィール表示');
        
        // エラーバナーを表示
        const container = document.querySelector('.content-container');
        if (container && !container.querySelector('.warning-banner')) {
            const warningBanner = document.createElement('div');
            warningBanner.className = 'warning-banner';
            warningBanner.innerHTML = `
                <div class="warning-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>データベースに接続できません。一部の情報が表示されない可能性があります。</span>
                    <button class="btn btn-small btn-outline" onclick="window.location.reload()">
                        再読み込み
                    </button>
                </div>
            `;
            container.insertBefore(warningBanner, container.firstChild);
        }
        
        // 基本的なダミーデータを設定
        this.profileData = {
            id: userId,
            name: 'ユーザー情報を読み込み中...',
            company: '---',
            position: '---',
            title: '---',
            profileImage: 'assets/user-placeholder.svg',
            skills: [],
            bio: 'プロフィール情報を読み込めませんでした。',
            connectionCount: 0,
            isOnline: false
        };
        
        this.updateProfileInfo();
    },
    
    // 成功メッセージを表示
    showSuccessMessage: function(message) {
        // 既存のメッセージを削除
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 新しいメッセージを作成
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        // 3秒後に自動で削除
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    },
    
    // クリーンアップ（メモリリーク対策）
    cleanup: function() {
        debugLog('プロフィールクリーンアップ開始');
        
        // キャッシュをクリア
        this.clearCache();
        
        // イベントリスナーを削除
        const closeButtons = document.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        // タイマーをクリア
        if (window._profileTimers) {
            window._profileTimers.forEach(timerId => clearTimeout(timerId));
            window._profileTimers = [];
        }
        
        // データをリセット
        this.profileData = null;
        this.targetUserId = null;
        this.initialized = false;
        this.isLoading = false;
        
        debugLog('プロフィールクリーンアップ完了');
    },
    
    // プロフィールデータのバリデーション
    validateProfileData: function(data) {
        // 名前の検証
        if (!data.name || data.name.trim().length === 0) {
            return {
                isValid: false,
                message: '名前を入力してください'
            };
        }
        
        if (data.name.length > 100) {
            return {
                isValid: false,
                message: '名前は100文字以内で入力してください'
            };
        }
        
        // メールアドレスの検証
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return {
                    isValid: false,
                    message: '有効なメールアドレスを入力してください'
                };
            }
        }
        
        // 会社名の検証
        if (data.company && data.company.length > 100) {
            return {
                isValid: false,
                message: '会社名は100文字以内で入力してください'
            };
        }
        
        // 電話番号の検証
        if (data.phone) {
            const phoneRegex = /^[\d\-\+\(\)\s]+$/;
            if (!phoneRegex.test(data.phone)) {
                return {
                    isValid: false,
                    message: '電話番号は数字、ハイフン、カッコ、プラス記号のみ使用できます'
                };
            }
            
            if (data.phone.length > 20) {
                return {
                    isValid: false,
                    message: '電話番号は20文字以内で入力してください'
                };
            }
        }
        
        return {
            isValid: true,
            message: ''
        };
    }
};

// DOMContentLoadedイベントでプロフィール機能を初期化
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOMContentLoaded - initializing profile');
    debugLog('現在のURL:', window.location.href);
    debugLog('URLパラメータ:', window.location.search);
    
    // URLパラメータを早期に確認
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    debugLog('userパラメータ:', userParam);
    
    // 初期化タイマーIDを保持（レースコンディション対策）
    let initTimerId = null;
    
    // Supabaseの準備を待つ
    function initWhenReady() {
        // 既に初期化済みならスキップ
        if (window.InterConnect.Profile.initialized || window.InterConnect.Profile.isLoading) {
            debugLog('既に初期化済みまたは初期化中');
            return;
        }
        
        if (window.supabaseClient?Client || window.supabaseClient?Client) {
            debugLog('Supabase準備完了、初期化開始');
            // タイマーをクリア
            if (initTimerId) {
                clearTimeout(initTimerId);
                initTimerId = null;
            }
            window.InterConnect.Profile.init();
        } else {
            debugLog('Supabase未準備、イベント待機');
            
            // イベントリスナー（一度だけ実行）
            window.addEventListener('supabaseReady', function handleSupabaseReady() {
                debugLog('supabaseReadyイベント受信、初期化開始');
                // タイマーをクリア
                if (initTimerId) {
                    clearTimeout(initTimerId);
                    initTimerId = null;
                }
                // リスナーを削除
                window.removeEventListener('supabaseReady', handleSupabaseReady);
                
                if (!window.InterConnect.Profile.initialized && !window.InterConnect.Profile.isLoading) {
                    window.InterConnect.Profile.init();
                }
            });
            
            // フォールバック（一度だけ）
            if (!initTimerId) {
                initTimerId = setTimeout(() => {
                    if (!window.InterConnect.Profile.initialized && !window.InterConnect.Profile.isLoading) {
                        debugLog('タイムアウトによる初期化');
                        window.InterConnect.Profile.init();
                    }
                    initTimerId = null;
                }, 2000);
            }
        }
    }
    
    initWhenReady();
});

debugLog('profile.js loaded successfully');
// Cache buster: 1753750334
