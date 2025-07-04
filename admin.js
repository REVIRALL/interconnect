// 管理パネルの完全実装

class AdminPanelManager {
    constructor() {
        this.currentTab = 'users';
        this.selectedUsers = new Set();
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilters = {};
        this.currentSearchQuery = '';
        
        this.initialize();
    }

    async initialize() {
        this.setupEventListeners();
        this.loadInitialData();
        this.animateStats();
        this.checkAdminPermissions();
        console.log('Admin panel initialized');
    }

    // ========== イベントリスナー設定 ==========

    setupEventListeners() {
        // タブ切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // ユーザー管理のイベント
        this.setupUserManagementEvents();
        
        // イベント管理のイベント
        this.setupEventManagementEvents();
        
        // レポート管理のイベント
        this.setupReportEvents();
        
        // システム設定のイベント
        this.setupSystemSettingsEvents();
        
        // コンテンツ管理のイベント
        this.setupContentManagementEvents();

        // モーダル管理
        this.setupModalEvents();

        // 一括操作
        this.setupBulkOperations();
    }

    setupUserManagementEvents() {
        // 検索
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearchQuery = e.target.value;
                this.filterAndDisplayUsers();
            });
        }

        // 新規ユーザー追加ボタン
        const addUserBtn = document.querySelector('.btn-primary');
        if (addUserBtn && addUserBtn.textContent.includes('新規ユーザー追加')) {
            addUserBtn.addEventListener('click', () => this.openUserModal());
        }

        // ユーザーアクションの委譲
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-action.edit')) {
                const userId = this.getUserIdFromRow(e.target.closest('tr'));
                this.editUser(userId);
            }
            
            if (e.target.closest('.btn-action.delete')) {
                const userId = this.getUserIdFromRow(e.target.closest('tr'));
                this.deleteUser(userId);
            }

            if (e.target.closest('.btn-action.view')) {
                const userId = this.getUserIdFromRow(e.target.closest('tr'));
                this.viewUserDetail(userId);
            }
        });
    }

    setupEventManagementEvents() {
        // 新規イベント作成
        document.addEventListener('click', (e) => {
            if (e.target.textContent.includes('新規イベント作成')) {
                this.openEventModal();
            }

            if (e.target.classList.contains('btn-edit')) {
                const eventId = this.getEventIdFromCard(e.target.closest('.event-admin-card'));
                this.editEvent(eventId);
            }

            if (e.target.classList.contains('btn-view')) {
                const eventId = this.getEventIdFromCard(e.target.closest('.event-admin-card'));
                this.viewEventDetail(eventId);
            }

            if (e.target.classList.contains('btn-delete')) {
                const eventId = this.getEventIdFromCard(e.target.closest('.event-admin-card'));
                this.deleteEvent(eventId);
            }
        });
    }

    setupReportEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.textContent.includes('レポート出力')) {
                this.generateReport();
            }
        });
    }

    setupSystemSettingsEvents() {
        const settingsTab = document.getElementById('settings-tab');
        if (settingsTab) {
            const saveBtn = settingsTab.querySelector('.btn-primary');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveSystemSettings());
            }
        }
    }

    setupContentManagementEvents() {
        // コンテンツ管理のイベント委譲
        document.addEventListener('click', (e) => {
            // 新規コンテンツ作成
            if (e.target.closest('.btn-create-content')) {
                const contentType = e.target.closest('.btn-create-content').dataset.type;
                this.openContentModal(null, contentType);
            }

            // コンテンツ編集
            if (e.target.closest('.btn-edit-content')) {
                const contentId = e.target.closest('.content-item').dataset.id;
                const contentType = e.target.closest('.content-item').dataset.type;
                this.editContent(contentId, contentType);
            }

            // コンテンツ削除
            if (e.target.closest('.btn-delete-content')) {
                const contentId = e.target.closest('.content-item').dataset.id;
                const contentType = e.target.closest('.content-item').dataset.type;
                this.deleteContent(contentId, contentType);
            }

            // コンテンツ公開/非公開
            if (e.target.closest('.btn-publish-content')) {
                const contentId = e.target.closest('.content-item').dataset.id;
                this.togglePublishContent(contentId);
            }
        });
    }

    setupModalEvents() {
        // モーダル外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });

        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    setupBulkOperations() {
        // 全選択チェックボックス
        document.addEventListener('change', (e) => {
            if (e.target.id === 'selectAll') {
                this.toggleSelectAll(e.target.checked);
            }
            
            if (e.target.classList.contains('user-checkbox')) {
                this.updateSelectedUsers();
            }
        });
    }

    // ========== タブ管理 ==========

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // タブボタンの切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // タブコンテンツの切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });

        // タブ別のデータ読み込み
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'users':
                this.loadUsersData();
                break;
            case 'events':
                this.loadEventsData();
                break;
            case 'content':
                this.loadContentData();
                break;
            case 'reports':
                this.loadReportsData();
                break;
            case 'settings':
                this.loadSystemSettings();
                break;
        }
    }

    // ========== ユーザー管理 ==========

    loadUsersData() {
        this.filterAndDisplayUsers();
    }

    filterAndDisplayUsers() {
        const users = adminService.searchUsers(this.currentSearchQuery, this.currentFilters);
        this.displayUsersTable(users);
        this.updateUserStats(users);
    }

    displayUsersTable(users) {
        const tbody = document.querySelector('.admin-table tbody');
        if (!tbody) return;

        // ページネーション計算
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedUsers = users.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        paginatedUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="user-checkbox" value="${user.id}">
                </td>
                <td>#${user.id}</td>
                <td>
                    <div class="user-info">
                        <img src="${user.avatar}" alt="${user.name}" class="user-avatar-small">
                        <span>${user.name}</span>
                    </div>
                </td>
                <td>${user.company}</td>
                <td>${user.email}</td>
                <td><span class="status-badge ${user.status}">${this.getStatusText(user.status)}</span></td>
                <td>${user.registeredDate}</td>
                <td>${user.lastLogin}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action view" title="詳細"><i class="fas fa-eye"></i></button>
                        <button class="btn-action edit" title="編集"><i class="fas fa-edit"></i></button>
                        <button class="btn-action delete" title="削除"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.updatePagination(users.length);
    }

    getStatusText(status) {
        const statusMap = {
            'active': 'アクティブ',
            'suspended': '停止中',
            'pending': '承認待ち',
            'inactive': '非アクティブ'
        };
        return statusMap[status] || status;
    }

    updateUserStats(users) {
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            // 総メンバー数
            statCards[0].querySelector('h3').textContent = users.length.toLocaleString();
            
            // アクティブユーザー数
            const activeUsers = users.filter(u => u.status === 'active').length;
            statCards[0].querySelector('h3').textContent = activeUsers.toLocaleString();
        }
    }

    openUserModal(userId = null) {
        const isEdit = userId !== null;
        const user = isEdit ? adminService.getUserDetail(userId) : null;

        const modalHTML = `
            <div class="modal-overlay" id="userModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>${isEdit ? 'ユーザー編集' : '新規ユーザー追加'}</h3>
                        <button class="close-modal" onclick="adminPanel.closeAllModals()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="userForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>名前 <span class="required">*</span></label>
                                    <input type="text" name="name" value="${user?.name || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>メールアドレス <span class="required">*</span></label>
                                    <input type="email" name="email" value="${user?.email || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>会社名</label>
                                    <input type="text" name="company" value="${user?.company || ''}">
                                </div>
                                <div class="form-group">
                                    <label>電話番号</label>
                                    <input type="tel" name="phone" value="${user?.phone || ''}">
                                </div>
                                <div class="form-group">
                                    <label>部署</label>
                                    <input type="text" name="department" value="${user?.department || ''}">
                                </div>
                                <div class="form-group">
                                    <label>役職</label>
                                    <input type="text" name="position" value="${user?.position || ''}">
                                </div>
                                <div class="form-group">
                                    <label>ロール</label>
                                    <select name="role">
                                        <option value="member" ${user?.role === 'member' ? 'selected' : ''}>メンバー</option>
                                        <option value="premium" ${user?.role === 'premium' ? 'selected' : ''}>プレミアム</option>
                                        <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>管理者</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>ステータス</label>
                                    <select name="status">
                                        <option value="active" ${user?.status === 'active' ? 'selected' : ''}>アクティブ</option>
                                        <option value="suspended" ${user?.status === 'suspended' ? 'selected' : ''}>停止中</option>
                                        <option value="pending" ${user?.status === 'pending' ? 'selected' : ''}>承認待ち</option>
                                    </select>
                                </div>
                            </div>
                            ${isEdit ? `
                                <div class="user-statistics">
                                    <h4>ユーザー統計</h4>
                                    <div class="stats-grid">
                                        <div class="stat-item">
                                            <span class="stat-number">${user?.statistics?.totalLogins || 0}</span>
                                            <span class="stat-label">総ログイン数</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number">${user?.statistics?.eventsAttended || 0}</span>
                                            <span class="stat-label">参加イベント数</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number">${user?.statistics?.connectionsCount || 0}</span>
                                            <span class="stat-label">接続数</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number">${user?.statistics?.messagesCount || 0}</span>
                                            <span class="stat-label">メッセージ数</span>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="adminPanel.closeAllModals()">キャンセル</button>
                        <button class="btn-primary" onclick="adminPanel.saveUser('${userId || ''}')">${isEdit ? '更新' : '作成'}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    saveUser(userId) {
        const form = document.getElementById('userForm');
        const formData = new FormData(form);
        const userData = {};
        
        for (let [key, value] of formData.entries()) {
            userData[key] = value;
        }

        try {
            if (userId) {
                // 更新
                adminService.updateUser(userId, userData);
                this.showNotification('ユーザー情報を更新しました', 'success');
            } else {
                // 新規作成
                adminService.createUser(userData);
                this.showNotification('新規ユーザーを作成しました', 'success');
            }

            this.closeAllModals();
            this.loadUsersData();
        } catch (error) {
            this.showNotification('エラーが発生しました: ' + error.message, 'error');
        }
    }

    editUser(userId) {
        this.openUserModal(userId);
    }

    deleteUser(userId) {
        const user = adminService.getUserDetail(userId);
        if (!user) return;

        if (confirm(`ユーザー「${user.name}」を削除しますか？この操作は取り消せません。`)) {
            try {
                adminService.deleteUser(userId);
                this.showNotification('ユーザーを削除しました', 'success');
                this.loadUsersData();
            } catch (error) {
                this.showNotification('削除に失敗しました: ' + error.message, 'error');
            }
        }
    }

    viewUserDetail(userId) {
        const user = adminService.getUserDetail(userId);
        if (!user) return;

        const modalHTML = `
            <div class="modal-overlay" id="userDetailModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>ユーザー詳細 - ${user.name}</h3>
                        <button class="close-modal" onclick="adminPanel.closeAllModals()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="user-detail-content">
                            <div class="user-profile-section">
                                <div class="user-avatar-large">
                                    <img src="${user.avatar}" alt="${user.name}">
                                </div>
                                <div class="user-basic-info">
                                    <h4>${user.name}</h4>
                                    <p class="user-title">${user.position} - ${user.company}</p>
                                    <span class="status-badge ${user.status}">${this.getStatusText(user.status)}</span>
                                </div>
                            </div>
                            
                            <div class="user-details-grid">
                                <div class="detail-section">
                                    <h5>基本情報</h5>
                                    <div class="detail-item">
                                        <span class="label">メール:</span>
                                        <span class="value">${user.email}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">電話:</span>
                                        <span class="value">${user.phone || 'なし'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">部署:</span>
                                        <span class="value">${user.department || 'なし'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">登録日:</span>
                                        <span class="value">${user.registeredDate}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">最終ログイン:</span>
                                        <span class="value">${user.lastLogin}</span>
                                    </div>
                                </div>
                                
                                <div class="detail-section">
                                    <h5>統計情報</h5>
                                    <div class="stats-grid-small">
                                        <div class="stat-item">
                                            <span class="stat-number">${user.statistics?.totalLogins || 0}</span>
                                            <span class="stat-label">総ログイン数</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number">${user.statistics?.eventsAttended || 0}</span>
                                            <span class="stat-label">参加イベント</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number">${user.statistics?.connectionsCount || 0}</span>
                                            <span class="stat-label">接続数</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number">${user.statistics?.messagesCount || 0}</span>
                                            <span class="stat-label">メッセージ数</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="adminPanel.closeAllModals()">閉じる</button>
                        <button class="btn-primary" onclick="adminPanel.editUser('${user.id}')">編集</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ========== イベント管理 ==========

    loadEventsData() {
        const events = adminService.searchEvents('', {});
        this.displayEventsGrid(events);
        this.updateEventStats(events);
    }

    displayEventsGrid(events) {
        const eventsGrid = document.querySelector('.events-grid');
        if (!eventsGrid) return;

        eventsGrid.innerHTML = '';

        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-admin-card';
            eventCard.dataset.eventId = event.id;
            
            const participationRate = Math.round((event.currentParticipants / event.maxParticipants) * 100);
            const progressClass = participationRate >= 80 ? 'high' : participationRate >= 50 ? 'medium' : 'low';
            
            eventCard.innerHTML = `
                <div class="event-header">
                    <h4>${event.title}</h4>
                    <span class="event-status ${event.status}">${this.getEventStatusText(event.status)}</span>
                </div>
                <div class="event-details">
                    <p><i class="fas fa-calendar"></i> ${event.date} ${event.time}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                    <p><i class="fas fa-user"></i> ${event.organizer}</p>
                </div>
                <div class="event-stats">
                    <div class="participation-info">
                        <span><i class="fas fa-users"></i> 参加者: ${event.currentParticipants}/${event.maxParticipants}名</span>
                        <div class="participation-progress">
                            <div class="progress-bar ${progressClass}" style="width: ${participationRate}%"></div>
                        </div>
                    </div>
                    <span><i class="fas fa-tag"></i> ${event.category}</span>
                </div>
                <div class="event-actions">
                    <button class="btn-view">詳細</button>
                    <button class="btn-edit">編集</button>
                    <button class="btn-delete">削除</button>
                </div>
            `;
            
            eventsGrid.appendChild(eventCard);
        });
    }

    updateEventStats(events) {
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 2) {
            // 今月のイベント数
            const thisMonth = new Date().getMonth();
            const thisMonthEvents = events.filter(e => {
                const eventMonth = new Date(e.date).getMonth();
                return eventMonth === thisMonth;
            });
            statCards[1].querySelector('h3').textContent = thisMonthEvents.length.toLocaleString();
        }
    }

    getEventStatusText(status) {
        const statusMap = {
            'approved': '承認済み',
            'preparing': '準備中',
            'cancelled': 'キャンセル',
            'completed': '完了'
        };
        return statusMap[status] || status;
    }

    openEventModal(eventId = null) {
        const isEdit = eventId !== null;
        const event = isEdit ? adminService.events.get(eventId) : null;

        const modalHTML = `
            <div class="modal-overlay" id="eventModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>${isEdit ? 'イベント編集' : '新規イベント作成'}</h3>
                        <button class="close-modal" onclick="adminPanel.closeAllModals()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="eventForm">
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label>イベントタイトル <span class="required">*</span></label>
                                    <input type="text" name="title" value="${event?.title || ''}" required>
                                </div>
                                <div class="form-group full-width">
                                    <label>説明 <span class="required">*</span></label>
                                    <textarea name="description" rows="3" required>${event?.description || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label>開催日 <span class="required">*</span></label>
                                    <input type="date" name="date" value="${event?.date || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>開始時間 <span class="required">*</span></label>
                                    <input type="time" name="time" value="${event?.time || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>所要時間</label>
                                    <input type="text" name="duration" value="${event?.duration || '2時間'}">
                                </div>
                                <div class="form-group">
                                    <label>開催場所 <span class="required">*</span></label>
                                    <input type="text" name="location" value="${event?.location || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>最大参加人数 <span class="required">*</span></label>
                                    <input type="number" name="maxParticipants" value="${event?.maxParticipants || 50}" min="1" required>
                                </div>
                                <div class="form-group">
                                    <label>カテゴリー</label>
                                    <select name="category">
                                        <option value="交流会" ${event?.category === '交流会' ? 'selected' : ''}>交流会</option>
                                        <option value="セミナー" ${event?.category === 'セミナー' ? 'selected' : ''}>セミナー</option>
                                        <option value="ピッチ" ${event?.category === 'ピッチ' ? 'selected' : ''}>ピッチ</option>
                                        <option value="ワークショップ" ${event?.category === 'ワークショップ' ? 'selected' : ''}>ワークショップ</option>
                                        <option value="その他" ${event?.category === 'その他' ? 'selected' : ''}>その他</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>主催者</label>
                                    <input type="text" name="organizer" value="${event?.organizer || ''}">
                                </div>
                                <div class="form-group">
                                    <label>ステータス</label>
                                    <select name="status">
                                        <option value="preparing" ${event?.status === 'preparing' ? 'selected' : ''}>準備中</option>
                                        <option value="approved" ${event?.status === 'approved' ? 'selected' : ''}>承認済み</option>
                                        <option value="cancelled" ${event?.status === 'cancelled' ? 'selected' : ''}>キャンセル</option>
                                        <option value="completed" ${event?.status === 'completed' ? 'selected' : ''}>完了</option>
                                    </select>
                                </div>
                            </div>
                            ${isEdit ? `
                                <div class="event-participants">
                                    <h4>参加者管理</h4>
                                    <div class="participants-info">
                                        <p>現在の参加者数: <strong>${event?.currentParticipants || 0}名</strong></p>
                                        <button type="button" class="btn-secondary" onclick="adminPanel.viewEventParticipants('${eventId}')">
                                            参加者一覧を見る
                                        </button>
                                    </div>
                                </div>
                            ` : ''}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="adminPanel.closeAllModals()">キャンセル</button>
                        <button class="btn-primary" onclick="adminPanel.saveEvent('${eventId || ''}')">保存</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    saveEvent(eventId) {
        const form = document.getElementById('eventForm');
        const formData = new FormData(form);
        const eventData = {};
        
        for (let [key, value] of formData.entries()) {
            eventData[key] = value;
        }

        try {
            if (eventId) {
                // 更新
                adminService.updateEvent(eventId, eventData);
                this.showNotification('イベント情報を更新しました', 'success');
            } else {
                // 新規作成
                adminService.createEvent(eventData);
                this.showNotification('新規イベントを作成しました', 'success');
            }

            this.closeAllModals();
            this.loadEventsData();
        } catch (error) {
            this.showNotification('エラーが発生しました: ' + error.message, 'error');
        }
    }

    editEvent(eventId) {
        this.openEventModal(eventId);
    }

    deleteEvent(eventId) {
        const event = adminService.events.get(eventId);
        if (!event) return;

        if (confirm(`イベント「${event.title}」を削除しますか？この操作は取り消せません。`)) {
            try {
                adminService.deleteEvent(eventId);
                this.showNotification('イベントを削除しました', 'success');
                this.loadEventsData();
            } catch (error) {
                this.showNotification('削除に失敗しました: ' + error.message, 'error');
            }
        }
    }

    viewEventDetail(eventId) {
        const event = adminService.events.get(eventId);
        if (!event) return;

        const modalHTML = `
            <div class="modal-overlay" id="eventDetailModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>イベント詳細 - ${event.title}</h3>
                        <button class="close-modal" onclick="adminPanel.closeAllModals()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="event-detail-content">
                            <div class="event-detail-header">
                                <div class="event-title-section">
                                    <h4>${event.title}</h4>
                                    <span class="event-status ${event.status}">${this.getEventStatusText(event.status)}</span>
                                </div>
                                <p class="event-description">${event.description}</p>
                            </div>
                            
                            <div class="event-details-grid">
                                <div class="detail-section">
                                    <h5>開催情報</h5>
                                    <div class="detail-item">
                                        <span class="label">開催日時:</span>
                                        <span class="value">${event.date} ${event.time}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">所要時間:</span>
                                        <span class="value">${event.duration}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">場所:</span>
                                        <span class="value">${event.location}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">主催者:</span>
                                        <span class="value">${event.organizer}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">カテゴリー:</span>
                                        <span class="value">${event.category}</span>
                                    </div>
                                </div>
                                
                                <div class="detail-section">
                                    <h5>参加状況</h5>
                                    <div class="participation-status">
                                        <div class="participation-numbers">
                                            <span class="current-participants">${event.currentParticipants}</span>
                                            <span class="separator">/</span>
                                            <span class="max-participants">${event.maxParticipants}名</span>
                                        </div>
                                        <div class="participation-progress-large">
                                            <div class="progress-bar" style="width: ${(event.currentParticipants / event.maxParticipants) * 100}%"></div>
                                        </div>
                                        <p class="participation-rate">${Math.round((event.currentParticipants / event.maxParticipants) * 100)}% 埋まっています</p>
                                    </div>
                                    
                                    <div class="event-actions-detail">
                                        <button class="btn-primary" onclick="adminPanel.viewEventParticipants('${event.id}')">
                                            <i class="fas fa-users"></i> 参加者一覧
                                        </button>
                                        <button class="btn-secondary" onclick="adminPanel.exportEventData('${event.id}')">
                                            <i class="fas fa-download"></i> データエクスポート
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="event-metadata">
                                <p>作成日: ${event.createdDate}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="adminPanel.closeAllModals()">閉じる</button>
                        <button class="btn-primary" onclick="adminPanel.editEvent('${event.id}')">編集</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    viewEventParticipants(eventId) {
        const event = adminService.events.get(eventId);
        if (!event) return;

        // デモ参加者データ
        const participants = [
            { id: 1, name: '田中太郎', company: '株式会社A', email: 'tanaka@example.com', status: 'confirmed' },
            { id: 2, name: '佐藤花子', company: '株式会社B', email: 'sato@example.com', status: 'confirmed' },
            { id: 3, name: '鈴木一郎', company: 'フリーランス', email: 'suzuki@example.com', status: 'pending' }
        ];

        const modalHTML = `
            <div class="modal-overlay" id="participantsModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>${event.title} - 参加者一覧</h3>
                        <button class="close-modal" onclick="adminPanel.closeAllModals()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="participants-table-wrapper">
                            <table class="participants-table">
                                <thead>
                                    <tr>
                                        <th>名前</th>
                                        <th>会社</th>
                                        <th>メール</th>
                                        <th>ステータス</th>
                                        <th>アクション</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${participants.map(p => `
                                        <tr>
                                            <td>${p.name}</td>
                                            <td>${p.company}</td>
                                            <td>${p.email}</td>
                                            <td>
                                                <span class="participant-status ${p.status}">
                                                    ${p.status === 'confirmed' ? '確定' : '保留'}
                                                </span>
                                            </td>
                                            <td>
                                                <button class="btn-action" onclick="adminPanel.removeParticipant(${p.id}, '${eventId}')">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div class="participants-actions">
                            <button class="btn-primary" onclick="adminPanel.addParticipant('${eventId}')">
                                <i class="fas fa-user-plus"></i> 参加者を追加
                            </button>
                            <button class="btn-secondary" onclick="adminPanel.sendEventNotification('${eventId}')">
                                <i class="fas fa-envelope"></i> 一括通知送信
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-primary" onclick="adminPanel.closeAllModals()">閉じる</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    exportEventData(eventId) {
        const event = adminService.events.get(eventId);
        if (!event) return;

        this.showNotification(`「${event.title}」のデータをエクスポートしました`, 'success');
    }

    removeParticipant(participantId, eventId) {
        if (confirm('この参加者を削除しますか？')) {
            this.showNotification('参加者を削除しました', 'success');
            // 実際の実装では参加者リストを更新
        }
    }

    addParticipant(eventId) {
        // 参加者追加モーダル（実装省略）
        this.showNotification('参加者追加機能は実装予定です', 'info');
    }

    sendEventNotification(eventId) {
        if (confirm('全参加者に通知を送信しますか？')) {
            this.showNotification('通知を送信しました', 'success');
        }
    }

    // ========== レポート管理 ==========

    loadReportsData() {
        this.generateReport();
    }

    generateReport() {
        const period = document.getElementById('reportPeriod')?.value || 'monthly';
        const type = document.getElementById('reportType')?.value || 'all';
        
        // レポートデータを取得
        const userReport = adminService.generateUserReport(period);
        const eventReport = adminService.generateEventReport(period);
        
        // サマリーカードを更新
        this.updateReportSummaryCards(userReport, eventReport);
        
        // チャートを更新
        this.updateReportCharts(userReport, eventReport, period);
    }

    updateReportSummaryCards(userReport, eventReport) {
        const summaryCards = document.querySelectorAll('.report-summary-cards .summary-card h4');
        if (summaryCards.length >= 4) {
            summaryCards[0].textContent = userReport.newUsers.toLocaleString();
            summaryCards[1].textContent = eventReport.totalEvents.toLocaleString();
            summaryCards[2].textContent = Math.floor(Math.random() * 50 + 20); // マッチング成立数（デモ）
            
            // 成長率の計算
            const growthRate = userReport.totalUsers > 0 ? 
                Math.round((userReport.newUsers / userReport.totalUsers) * 100) : 0;
            summaryCards[3].textContent = growthRate + '%';
        }
    }

    updateReportCharts(userReport, eventReport, period) {
        // ユーザー登録推移チャート
        this.createUserGrowthChart(userReport.registrationTrend, period);
        
        // イベント参加者数チャート
        this.createEventParticipationChart(eventReport);
        
        // ユーザーロール別分布チャート
        this.createUserRoleChart(userReport.usersByRole);
        
        // アクティビティヒートマップ
        this.createActivityHeatmap();
    }

    createUserGrowthChart(data, period) {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;

        // 既存のチャートを破棄
        if (this.userGrowthChart) {
            this.userGrowthChart.destroy();
        }

        // データの準備
        const labels = [];
        const values = [];
        const dates = Object.keys(data).sort();
        
        dates.forEach(date => {
            labels.push(this.formatDateLabel(date, period));
            values.push(data[date]);
        });

        // デモデータを追加（データが少ない場合）
        if (labels.length < 5) {
            const now = new Date();
            for (let i = 0; i < 7; i++) {
                const date = new Date(now);
                date.setDate(date.getDate() - (6 - i));
                labels.push(date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }));
                values.push(Math.floor(Math.random() * 10 + 2));
            }
        }

        this.userGrowthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '新規ユーザー数',
                    data: values,
                    borderColor: 'rgb(52, 144, 220)',
                    backgroundColor: 'rgba(52, 144, 220, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + '名';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    createEventParticipationChart(eventReport) {
        const ctx = document.getElementById('eventParticipationChart');
        if (!ctx) return;

        if (this.eventParticipationChart) {
            this.eventParticipationChart.destroy();
        }

        // イベントデータからチャートデータを作成
        const events = eventReport.popularEvents || [];
        const labels = events.map(e => e.title);
        const data = events.map(e => e.currentParticipants);

        // デモデータを追加
        if (labels.length === 0) {
            labels.push('定例交流会', 'ビジネスピッチ会', 'テクノロジーセミナー');
            data.push(45, 30, 78);
        }

        this.eventParticipationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '参加者数',
                    data: data,
                    backgroundColor: [
                        'rgba(52, 144, 220, 0.8)',
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(220, 53, 69, 0.8)',
                        'rgba(23, 162, 184, 0.8)'
                    ],
                    borderColor: [
                        'rgb(52, 144, 220)',
                        'rgb(40, 167, 69)',
                        'rgb(255, 193, 7)',
                        'rgb(220, 53, 69)',
                        'rgb(23, 162, 184)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createUserRoleChart(usersByRole) {
        const ctx = document.getElementById('userRoleChart');
        if (!ctx) return;

        if (this.userRoleChart) {
            this.userRoleChart.destroy();
        }

        const labels = Object.keys(usersByRole).map(role => this.getRoleLabel(role));
        const data = Object.values(usersByRole);

        this.userRoleChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(52, 144, 220, 0.8)',
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)'
                    ],
                    borderColor: [
                        'rgb(52, 144, 220)',
                        'rgb(40, 167, 69)',
                        'rgb(255, 193, 7)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value}名 (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    createActivityHeatmap() {
        const ctx = document.getElementById('activityHeatmapChart');
        if (!ctx) return;

        if (this.activityHeatmap) {
            this.activityHeatmap.destroy();
        }

        // ヒートマップ用のデモデータ
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const hours = Array.from({length: 24}, (_, i) => i + '時');
        
        // ランダムなアクティビティデータを生成
        const data = [];
        days.forEach((day, dayIndex) => {
            hours.forEach((hour, hourIndex) => {
                const activity = Math.floor(Math.random() * 100);
                if (activity > 20) { // 20%以上のアクティビティのみ表示
                    data.push({
                        x: hourIndex,
                        y: dayIndex,
                        v: activity
                    });
                }
            });
        });

        this.activityHeatmap = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'アクティビティ',
                    data: data,
                    backgroundColor: function(context) {
                        const value = context.parsed.v;
                        const alpha = value / 100;
                        return `rgba(52, 144, 220, ${alpha})`;
                    },
                    pointRadius: function(context) {
                        const value = context.parsed.v;
                        return Math.max(5, value / 10);
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: 0,
                        max: 23,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return value + '時';
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        min: 0,
                        max: 6,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return days[value] || '';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const day = days[context.parsed.y];
                                const hour = context.parsed.x;
                                const value = context.parsed.v;
                                return `${day}曜日 ${hour}時: ${value}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    formatDateLabel(dateStr, period) {
        const date = new Date(dateStr);
        switch (period) {
            case 'weekly':
            case 'monthly':
                return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
            case 'quarterly':
            case 'yearly':
                return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' });
            default:
                return dateStr;
        }
    }

    getRoleLabel(role) {
        const roleMap = {
            'member': 'メンバー',
            'premium': 'プレミアム',
            'admin': '管理者'
        };
        return roleMap[role] || role;
    }

    exportFullReport() {
        const period = document.getElementById('reportPeriod').value;
        const type = document.getElementById('reportType').value;
        
        this.showNotification(`${this.getPeriodLabel(period)}レポートをエクスポートしました`, 'success');
    }

    getPeriodLabel(period) {
        const periodMap = {
            'monthly': '月次',
            'quarterly': '四半期',
            'yearly': '年次'
        };
        return periodMap[period] || period;
    }

    showReportModal(data, reportType) {
        const modalHTML = `
            <div class="modal-overlay" id="reportModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>${reportType}</h3>
                        <button class="close-modal" onclick="adminPanel.closeAllModals()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="report-content">
                            <div class="report-summary">
                                <div class="summary-grid">
                                    <div class="summary-item">
                                        <span class="summary-number">${data.totalUsers}</span>
                                        <span class="summary-label">総ユーザー数</span>
                                    </div>
                                    <div class="summary-item">
                                        <span class="summary-number">${data.newUsers}</span>
                                        <span class="summary-label">新規ユーザー</span>
                                    </div>
                                    <div class="summary-item">
                                        <span class="summary-number">${data.activeUsers}</span>
                                        <span class="summary-label">アクティブユーザー</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="report-charts">
                                <div class="chart-section">
                                    <h5>ロール別ユーザー数</h5>
                                    <div class="role-chart">
                                        ${Object.entries(data.usersByRole).map(([role, count]) => `
                                            <div class="role-item">
                                                <span class="role-name">${role}</span>
                                                <span class="role-count">${count}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div class="chart-section">
                                    <h5>企業別ユーザー数（上位10社）</h5>
                                    <div class="company-chart">
                                        ${data.usersByCompany.map(([company, count]) => `
                                            <div class="company-item">
                                                <span class="company-name">${company}</span>
                                                <span class="company-count">${count}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="adminPanel.closeAllModals()">閉じる</button>
                        <button class="btn-primary" onclick="adminPanel.exportReport('${reportType}')">
                            <i class="fas fa-download"></i> PDFエクスポート
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    exportReport(reportType) {
        // 実際の実装ではPDF生成ライブラリを使用
        this.showNotification(`${reportType}をエクスポートしました`, 'success');
    }


    // ========== システム設定 ==========

    loadSystemSettings() {
        const settings = adminService.getSystemSettings();
        const settingsTab = document.getElementById('settings-tab');
        
        if (settingsTab) {
            // 既存の設定値を入力フィールドに反映
            const inputs = settingsTab.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (settings[input.name]) {
                    if (input.type === 'checkbox') {
                        input.checked = settings[input.name];
                    } else {
                        input.value = settings[input.name];
                    }
                }
            });
        }
    }

    saveSystemSettings() {
        const settingsTab = document.getElementById('settings-tab');
        const inputs = settingsTab.querySelectorAll('input, select, textarea');
        const settings = {};
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                settings[input.name] = input.checked;
            } else {
                settings[input.name] = input.value;
            }
        });
        
        try {
            adminService.updateSystemSettings(settings);
            this.showNotification('システム設定を保存しました', 'success');
        } catch (error) {
            this.showNotification('設定の保存に失敗しました: ' + error.message, 'error');
        }
    }

    // ========== ユーティリティ ==========

    getUserIdFromRow(row) {
        return row.querySelector('td:nth-child(2)').textContent.replace('#', '');
    }

    getEventIdFromCard(card) {
        return card.dataset.eventId;
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        // ページネーション UI の更新（実装省略）
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.remove();
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // 自動削除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-content h3');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent.replace(/,/g, ''));
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current).toLocaleString();
            }, 30);
        });
    }

    checkAdminPermissions() {
        // 管理者権限チェック
        const currentUser = auth?.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            this.showNotification('管理者権限が必要です', 'error');
            // 実際の実装では適切なページにリダイレクト
        }
    }

    loadInitialData() {
        this.loadUsersData();
        this.updateDashboardStats();
    }

    updateDashboardStats() {
        const users = Array.from(adminService.users.values());
        const events = Array.from(adminService.events.values());
        
        // 統計カードの更新
        const statCards = document.querySelectorAll('.stat-card h3');
        if (statCards.length >= 4) {
            statCards[0].textContent = users.length.toLocaleString();
            statCards[1].textContent = events.length.toLocaleString();
            statCards[2].textContent = Math.floor(Math.random() * 100 + 50); // ビジネスマッチング数
            statCards[3].textContent = users.filter(u => u.status === 'pending').length; // 要対応案件
        }
    }

    // 一括操作関連
    toggleSelectAll(checked) {
        document.querySelectorAll('.user-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateSelectedUsers();
    }

    updateSelectedUsers() {
        this.selectedUsers.clear();
        document.querySelectorAll('.user-checkbox:checked').forEach(checkbox => {
            this.selectedUsers.add(checkbox.value);
        });
        
        // 一括操作ボタンの表示/非表示
        this.updateBulkActionButtons();
    }

    updateBulkActionButtons() {
        // 一括操作ボタンの表示制御（実装省略）
    }

    // コンテンツ管理
    loadContentData() {
        // コンテンツ統計の取得
        const stats = adminService.getContentStats();
        this.displayContentStats(stats);
        this.displayContentList();
    }

    displayContentStats(stats) {
        const contentTab = document.getElementById('content-tab');
        if (!contentTab) return;

        const statCards = contentTab.querySelectorAll('.content-stat-card');
        if (statCards.length >= 3) {
            statCards[0].querySelector('p').textContent = stats.totalArticles;
            statCards[1].querySelector('p').textContent = stats.activeAnnouncements;
            statCards[2].querySelector('p').textContent = stats.totalResources;
        }
    }

    displayContentList() {
        const contentTab = document.getElementById('content-tab');
        if (!contentTab) return;

        // 既存のコンテンツリストをクリア
        const existingList = contentTab.querySelector('.content-list');
        if (existingList) {
            existingList.remove();
        }

        // コンテンツタブ別のセクションを作成
        const contentListHTML = `
            <div class="content-list">
                <!-- 記事セクション -->
                <div class="content-section">
                    <div class="section-header">
                        <h3>投稿記事</h3>
                        <button class="btn-primary btn-create-content" data-type="article">
                            <i class="fas fa-plus"></i> 新規記事作成
                        </button>
                    </div>
                    <div class="content-grid">
                        ${this.renderArticles()}
                    </div>
                </div>

                <!-- お知らせセクション -->
                <div class="content-section">
                    <div class="section-header">
                        <h3>お知らせ</h3>
                        <button class="btn-primary btn-create-content" data-type="announcement">
                            <i class="fas fa-bullhorn"></i> 新規お知らせ作成
                        </button>
                    </div>
                    <div class="announcement-list">
                        ${this.renderAnnouncements()}
                    </div>
                </div>

                <!-- リソースセクション -->
                <div class="content-section">
                    <div class="section-header">
                        <h3>リソース</h3>
                        <button class="btn-primary btn-create-content" data-type="resource">
                            <i class="fas fa-file"></i> 新規リソース追加
                        </button>
                    </div>
                    <div class="resource-list">
                        ${this.renderResources()}
                    </div>
                </div>
            </div>
        `;

        contentTab.insertAdjacentHTML('beforeend', contentListHTML);
    }

    renderArticles() {
        const articles = adminService.searchContent();
        
        if (articles.length === 0) {
            return '<p class="empty-message">記事がありません</p>';
        }

        return articles.map(article => `
            <div class="content-item article-card" data-id="${article.id}" data-type="article">
                <div class="article-header">
                    <h4>${article.title}</h4>
                    <span class="status-badge ${article.status}">
                        ${article.status === 'published' ? '公開中' : '下書き'}
                    </span>
                </div>
                <p class="article-excerpt">${article.content.substring(0, 100)}...</p>
                <div class="article-meta">
                    <span><i class="fas fa-user"></i> ${article.author}</span>
                    <span><i class="fas fa-calendar"></i> ${article.publishDate}</span>
                    <span><i class="fas fa-eye"></i> ${article.views} views</span>
                </div>
                <div class="article-tags">
                    ${article.tags ? article.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="content-actions">
                    <button class="btn-edit-content">編集</button>
                    <button class="btn-publish-content">
                        ${article.status === 'published' ? '非公開' : '公開'}
                    </button>
                    <button class="btn-delete-content">削除</button>
                </div>
            </div>
        `).join('');
    }

    renderAnnouncements() {
        const announcements = adminService.searchAnnouncements();
        
        if (announcements.length === 0) {
            return '<p class="empty-message">お知らせがありません</p>';
        }

        return announcements.map(announcement => `
            <div class="content-item announcement-item" data-id="${announcement.id}" data-type="announcement">
                <div class="announcement-header">
                    <h4>${announcement.title}</h4>
                    <span class="priority-badge ${announcement.priority}">
                        ${announcement.priority === 'high' ? '重要' : announcement.priority === 'medium' ? '中' : '低'}
                    </span>
                    <span class="status-badge ${announcement.status}">
                        ${announcement.status === 'active' ? 'アクティブ' : '無効'}
                    </span>
                </div>
                <p class="announcement-content">${announcement.content}</p>
                <div class="announcement-period">
                    <i class="fas fa-clock"></i>
                    ${announcement.startDate} ～ ${announcement.endDate}
                </div>
                <div class="content-actions">
                    <button class="btn-edit-content">編集</button>
                    <button class="btn-delete-content">削除</button>
                </div>
            </div>
        `).join('');
    }

    renderResources() {
        const resources = adminService.searchResources();
        
        if (resources.length === 0) {
            return '<p class="empty-message">リソースがありません</p>';
        }

        return resources.map(resource => `
            <div class="content-item resource-item" data-id="${resource.id}" data-type="resource">
                <div class="resource-icon">
                    <i class="fas fa-${this.getResourceIcon(resource.type)}"></i>
                </div>
                <div class="resource-details">
                    <h4>${resource.title}</h4>
                    <p>${resource.description}</p>
                    <div class="resource-meta">
                        <span><i class="fas fa-file-alt"></i> ${resource.type}</span>
                        <span><i class="fas fa-weight"></i> ${resource.fileSize}</span>
                        <span><i class="fas fa-download"></i> ${resource.downloadCount} ダウンロード</span>
                    </div>
                </div>
                <div class="content-actions">
                    <button class="btn-edit-content">編集</button>
                    <button class="btn-delete-content">削除</button>
                </div>
            </div>
        `).join('');
    }

    getResourceIcon(type) {
        const iconMap = {
            document: 'file-word',
            template: 'file-powerpoint',
            image: 'file-image',
            video: 'file-video',
            pdf: 'file-pdf'
        };
        return iconMap[type] || 'file';
    }

    // コンテンツ作成/編集モーダル
    openContentModal(contentId = null, contentType = 'article') {
        let content = null;
        let isEdit = false;

        if (contentId) {
            isEdit = true;
            switch (contentType) {
                case 'article':
                    content = adminService.content.get(contentId);
                    break;
                case 'announcement':
                    content = adminService.announcements.get(contentId);
                    break;
                case 'resource':
                    content = adminService.resources.get(contentId);
                    break;
            }
        }

        const modalHTML = this.getContentModalHTML(content, contentType, isEdit);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    getContentModalHTML(content, contentType, isEdit) {
        switch (contentType) {
            case 'article':
                return this.getArticleModalHTML(content, isEdit);
            case 'announcement':
                return this.getAnnouncementModalHTML(content, isEdit);
            case 'resource':
                return this.getResourceModalHTML(content, isEdit);
            default:
                return '';
        }
    }

    getArticleModalHTML(article, isEdit) {
        return `
            <div class="modal-overlay" id="contentModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>${isEdit ? '記事編集' : '新規記事作成'}</h3>
                        <button class="close-modal" onclick="adminPanel.closeAllModals()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="articleForm">
                            <div class="form-group">
                                <label>タイトル <span class="required">*</span></label>
                                <input type="text" name="title" value="${article?.title || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>本文 <span class="required">*</span></label>
                                <textarea name="content" rows="10" required>${article?.content || ''}</textarea>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>カテゴリ <span class="required">*</span></label>
                                    <select name="category" required>
                                        <option value="お知らせ" ${article?.category === 'お知らせ' ? 'selected' : ''}>お知らせ</option>
                                        <option value="成功事例" ${article?.category === '成功事例' ? 'selected' : ''}>成功事例</option>
                                        <option value="レポート" ${article?.category === 'レポート' ? 'selected' : ''}>レポート</option>
                                        <option value="コラム" ${article?.category === 'コラム' ? 'selected' : ''}>コラム</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>著者 <span class="required">*</span></label>
                                    <input type="text" name="author" value="${article?.author || ''}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>タグ (カンマ区切り)</label>
                                <input type="text" name="tags" value="${article?.tags?.join(', ') || ''}" placeholder="ビジネス, マッチング, 成功事例">
                            </div>
                            <div class="form-group">
                                <label>ステータス</label>
                                <select name="status">
                                    <option value="draft" ${article?.status === 'draft' ? 'selected' : ''}>下書き</option>
                                    <option value="published" ${article?.status === 'published' ? 'selected' : ''}>公開</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="adminPanel.closeAllModals()">キャンセル</button>
                        <button class="btn-primary" onclick="adminPanel.saveContent('${article?.id || ''}', 'article')">
                            ${isEdit ? '更新' : '作成'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getAnnouncementModalHTML(announcement, isEdit) {
        const today = new Date().toISOString().split('T')[0];
        return `
            <div class="modal-overlay" id="contentModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${isEdit ? 'お知らせ編集' : '新規お知らせ作成'}</h3>
                        <button class="close-modal" onclick="adminPanel.closeAllModals()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="announcementForm">
                            <div class="form-group">
                                <label>タイトル <span class="required">*</span></label>
                                <input type="text" name="title" value="${announcement?.title || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>内容 <span class="required">*</span></label>
                                <textarea name="content" rows="5" required>${announcement?.content || ''}</textarea>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>優先度 <span class="required">*</span></label>
                                    <select name="priority" required>
                                        <option value="high" ${announcement?.priority === 'high' ? 'selected' : ''}>高</option>
                                        <option value="medium" ${announcement?.priority === 'medium' ? 'selected' : ''}>中</option>
                                        <option value="low" ${announcement?.priority === 'low' ? 'selected' : ''}>低</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>ステータス</label>
                                    <select name="status">
                                        <option value="active" ${announcement?.status === 'active' ? 'selected' : ''}>アクティブ</option>
                                        <option value="inactive" ${announcement?.status === 'inactive' ? 'selected' : ''}>非アクティブ</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>開始日 <span class="required">*</span></label>
                                    <input type="date" name="startDate" value="${announcement?.startDate || today}" required>
                                </div>
                                <div class="form-group">
                                    <label>終了日 <span class="required">*</span></label>
                                    <input type="date" name="endDate" value="${announcement?.endDate || ''}" required>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="adminPanel.closeAllModals()">キャンセル</button>
                        <button class="btn-primary" onclick="adminPanel.saveContent('${announcement?.id || ''}', 'announcement')">
                            ${isEdit ? '更新' : '作成'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getResourceModalHTML(resource, isEdit) {
        return `
            <div class="modal-overlay" id="contentModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${isEdit ? 'リソース編集' : '新規リソース追加'}</h3>
                        <button class="close-modal" onclick="adminPanel.closeAllModals()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="resourceForm">
                            <div class="form-group">
                                <label>タイトル <span class="required">*</span></label>
                                <input type="text" name="title" value="${resource?.title || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>説明 <span class="required">*</span></label>
                                <textarea name="description" rows="3" required>${resource?.description || ''}</textarea>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>タイプ <span class="required">*</span></label>
                                    <select name="type" required>
                                        <option value="document" ${resource?.type === 'document' ? 'selected' : ''}>ドキュメント</option>
                                        <option value="template" ${resource?.type === 'template' ? 'selected' : ''}>テンプレート</option>
                                        <option value="image" ${resource?.type === 'image' ? 'selected' : ''}>画像</option>
                                        <option value="video" ${resource?.type === 'video' ? 'selected' : ''}>ビデオ</option>
                                        <option value="pdf" ${resource?.type === 'pdf' ? 'selected' : ''}>PDF</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>カテゴリ <span class="required">*</span></label>
                                    <input type="text" name="category" value="${resource?.category || ''}" required>
                                </div>
                            </div>
                            ${!isEdit ? `
                                <div class="form-group">
                                    <label>ファイル <span class="required">*</span></label>
                                    <input type="file" name="file" required>
                                </div>
                            ` : `
                                <div class="form-group">
                                    <label>ファイルサイズ</label>
                                    <input type="text" name="fileSize" value="${resource?.fileSize || ''}" readonly>
                                </div>
                            `}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="adminPanel.closeAllModals()">キャンセル</button>
                        <button class="btn-primary" onclick="adminPanel.saveContent('${resource?.id || ''}', 'resource')">
                            ${isEdit ? '更新' : 'アップロード'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    saveContent(contentId, contentType) {
        let form, data = {};
        
        switch (contentType) {
            case 'article':
                form = document.getElementById('articleForm');
                const formData = new FormData(form);
                for (let [key, value] of formData.entries()) {
                    if (key === 'tags') {
                        data[key] = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    } else {
                        data[key] = value;
                    }
                }
                
                if (contentId) {
                    adminService.updateContent(contentId, data);
                } else {
                    adminService.createContent(data);
                }
                break;
                
            case 'announcement':
                form = document.getElementById('announcementForm');
                const annFormData = new FormData(form);
                for (let [key, value] of annFormData.entries()) {
                    data[key] = value;
                }
                
                if (contentId) {
                    adminService.updateAnnouncement(contentId, data);
                } else {
                    adminService.createAnnouncement(data);
                }
                break;
                
            case 'resource':
                form = document.getElementById('resourceForm');
                const resFormData = new FormData(form);
                for (let [key, value] of resFormData.entries()) {
                    if (key === 'file' && value instanceof File && value.size > 0) {
                        data.fileSize = this.formatFileSize(value.size);
                    } else if (key !== 'file') {
                        data[key] = value;
                    }
                }
                
                if (contentId) {
                    adminService.updateResource(contentId, data);
                } else {
                    adminService.createResource(data);
                }
                break;
        }
        
        this.showNotification(`${this.getContentTypeName(contentType)}を${contentId ? '更新' : '作成'}しました`, 'success');
        this.closeAllModals();
        this.loadContentData();
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    }

    getContentTypeName(type) {
        const typeNames = {
            article: '記事',
            announcement: 'お知らせ',
            resource: 'リソース'
        };
        return typeNames[type] || type;
    }

    editContent(contentId, contentType) {
        this.openContentModal(contentId, contentType);
    }

    deleteContent(contentId, contentType) {
        const confirmMessage = `この${this.getContentTypeName(contentType)}を削除しますか？`;
        
        if (confirm(confirmMessage)) {
            switch (contentType) {
                case 'article':
                    adminService.deleteContent(contentId);
                    break;
                case 'announcement':
                    adminService.deleteAnnouncement(contentId);
                    break;
                case 'resource':
                    adminService.deleteResource(contentId);
                    break;
            }
            
            this.showNotification(`${this.getContentTypeName(contentType)}を削除しました`, 'success');
            this.loadContentData();
        }
    }

    togglePublishContent(contentId) {
        const content = adminService.content.get(contentId);
        if (!content) return;
        
        const newStatus = content.status === 'published' ? 'draft' : 'published';
        adminService.updateContent(contentId, { status: newStatus });
        
        this.showNotification(`記事を${newStatus === 'published' ? '公開' : '非公開'}にしました`, 'success');
        this.loadContentData();
    }
}

// グローバルインスタンス
const adminPanel = new AdminPanelManager();
window.adminPanel = adminPanel;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // 管理サービスが読み込まれるまで待機
    if (typeof adminService === 'undefined') {
        setTimeout(() => {
            adminPanel.initialize();
        }, 100);
    } else {
        adminPanel.initialize();
    }
});