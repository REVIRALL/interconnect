// イベント参加履歴管理システム

class EventHistoryManager {
    constructor() {
        this.participationHistory = this.loadHistory();
        this.currentUser = this.getCurrentUser();
        this.initialize();
    }

    initialize() {
        // 既存のイベントデータを取得
        this.events = this.loadEvents();
        
        // UIの初期化
        if (document.getElementById('eventHistoryContainer')) {
            this.renderHistory();
        }
        
        // イベントリスナーの設定
        this.setupEventListeners();
    }

    // 現在のユーザーを取得
    getCurrentUser() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        return user || null;
    }

    // 履歴データの読み込み
    loadHistory() {
        const history = localStorage.getItem('eventParticipationHistory');
        return history ? JSON.parse(history) : {};
    }

    // 履歴データの保存
    saveHistory() {
        localStorage.setItem('eventParticipationHistory', JSON.stringify(this.participationHistory));
    }

    // イベントデータの読み込み
    loadEvents() {
        // 実際のイベントデータを取得（デモ用）
        return [
            {
                id: 'evt001',
                title: '定例交流会',
                date: '2024-02-15',
                time: '18:00',
                location: '東京都渋谷区',
                category: '交流会'
            },
            {
                id: 'evt002',
                title: 'ビジネスセミナー',
                date: '2024-02-20',
                time: '14:00',
                location: 'オンライン',
                category: 'セミナー'
            },
            {
                id: 'evt003',
                title: 'ピッチイベント',
                date: '2024-02-25',
                time: '13:00',
                location: '品川区',
                category: 'ピッチ'
            }
        ];
    }

    // イベント参加の記録
    recordParticipation(eventId, status = 'registered') {
        if (!this.currentUser) {
            console.error('ユーザーがログインしていません');
            return false;
        }

        const userId = this.currentUser.id;
        const event = this.events.find(e => e.id === eventId);
        
        if (!event) {
            console.error('イベントが見つかりません');
            return false;
        }

        // ユーザーの履歴を初期化
        if (!this.participationHistory[userId]) {
            this.participationHistory[userId] = [];
        }

        // 既存の参加記録をチェック
        const existingIndex = this.participationHistory[userId].findIndex(
            p => p.eventId === eventId
        );

        const participationRecord = {
            eventId: eventId,
            eventTitle: event.title,
            eventDate: event.date,
            eventTime: event.time,
            eventLocation: event.location,
            eventCategory: event.category,
            status: status, // registered, attended, cancelled, no-show
            registeredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (existingIndex !== -1) {
            // 既存の記録を更新
            this.participationHistory[userId][existingIndex] = {
                ...this.participationHistory[userId][existingIndex],
                ...participationRecord,
                updatedAt: new Date().toISOString()
            };
        } else {
            // 新規記録を追加
            this.participationHistory[userId].push(participationRecord);
        }

        this.saveHistory();
        this.renderHistory();
        
        return true;
    }

    // 参加状態の更新
    updateParticipationStatus(eventId, newStatus) {
        if (!this.currentUser) return false;

        const userId = this.currentUser.id;
        const userHistory = this.participationHistory[userId];
        
        if (!userHistory) return false;

        const recordIndex = userHistory.findIndex(p => p.eventId === eventId);
        
        if (recordIndex === -1) return false;

        userHistory[recordIndex].status = newStatus;
        userHistory[recordIndex].updatedAt = new Date().toISOString();

        // 出席の場合、追加情報を記録
        if (newStatus === 'attended') {
            userHistory[recordIndex].attendedAt = new Date().toISOString();
        }

        this.saveHistory();
        this.renderHistory();
        
        return true;
    }

    // 参加をキャンセル
    cancelParticipation(eventId) {
        return this.updateParticipationStatus(eventId, 'cancelled');
    }

    // ユーザーの参加履歴を取得
    getUserHistory(userId = null) {
        const targetUserId = userId || this.currentUser?.id;
        
        if (!targetUserId) return [];

        const history = this.participationHistory[targetUserId] || [];
        
        // 日付でソート（新しい順）
        return history.sort((a, b) => 
            new Date(b.eventDate) - new Date(a.eventDate)
        );
    }

    // 統計情報を取得
    getStatistics(userId = null) {
        const history = this.getUserHistory(userId);
        
        const stats = {
            total: history.length,
            attended: history.filter(h => h.status === 'attended').length,
            registered: history.filter(h => h.status === 'registered').length,
            cancelled: history.filter(h => h.status === 'cancelled').length,
            noShow: history.filter(h => h.status === 'no-show').length,
            attendanceRate: 0,
            categoryCounts: {},
            monthlyAttendance: {}
        };

        // 出席率の計算
        const eligibleEvents = history.filter(h => 
            h.status === 'attended' || h.status === 'no-show'
        );
        
        if (eligibleEvents.length > 0) {
            stats.attendanceRate = Math.round(
                (stats.attended / eligibleEvents.length) * 100
            );
        }

        // カテゴリ別集計
        history.forEach(record => {
            const category = record.eventCategory;
            stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;
        });

        // 月別集計
        history.filter(h => h.status === 'attended').forEach(record => {
            const date = new Date(record.eventDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            stats.monthlyAttendance[monthKey] = (stats.monthlyAttendance[monthKey] || 0) + 1;
        });

        return stats;
    }

    // 履歴のレンダリング
    renderHistory() {
        const container = document.getElementById('eventHistoryContainer');
        if (!container) return;

        const history = this.getUserHistory();
        const stats = this.getStatistics();

        let html = `
            <div class="history-header">
                <h2>イベント参加履歴</h2>
                <button class="btn-export" onclick="eventHistoryManager.exportHistory()">
                    <i class="fas fa-download"></i> エクスポート
                </button>
            </div>

            <!-- 統計情報 -->
            <div class="history-stats">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">総参加数</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.attended}</div>
                        <div class="stat-label">出席</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.attendanceRate}%</div>
                        <div class="stat-label">出席率</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.cancelled}</div>
                        <div class="stat-label">キャンセル</div>
                    </div>
                </div>
            </div>

            <!-- フィルター -->
            <div class="history-filters">
                <select id="statusFilter" class="filter-select">
                    <option value="">すべての状態</option>
                    <option value="attended">出席</option>
                    <option value="registered">申込済み</option>
                    <option value="cancelled">キャンセル</option>
                    <option value="no-show">欠席</option>
                </select>
                <select id="categoryFilter" class="filter-select">
                    <option value="">すべてのカテゴリ</option>
                    <option value="交流会">交流会</option>
                    <option value="セミナー">セミナー</option>
                    <option value="ピッチ">ピッチ</option>
                    <option value="その他">その他</option>
                </select>
                <input type="month" id="monthFilter" class="filter-input">
            </div>

            <!-- 履歴リスト -->
            <div class="history-list" id="historyList">
                ${this.renderHistoryItems(history)}
            </div>
        `;

        // 安全な HTML 挿入
        if (window.SecurityUtils) {
            window.SecurityUtils.safeSetHTML(container, html);
        } else {
            container.innerHTML = html; // フォールバック
        }
        
        // フィルターイベントの設定
        this.setupFilterEvents();
    }

    // 履歴アイテムのレンダリング
    renderHistoryItems(history) {
        if (history.length === 0) {
            return `
                <div class="no-history">
                    <i class="fas fa-calendar-times"></i>
                    <p>参加履歴がありません</p>
                </div>
            `;
        }

        return history.map(record => `
            <div class="history-item ${record.status}">
                <div class="history-date">
                    <div class="date-month">${new Date(record.eventDate).toLocaleDateString('ja-JP', { month: 'short' })}</div>
                    <div class="date-day">${new Date(record.eventDate).getDate()}</div>
                </div>
                <div class="history-content">
                    <h3>${record.eventTitle}</h3>
                    <div class="history-meta">
                        <span><i class="fas fa-clock"></i> ${record.eventTime}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${record.eventLocation}</span>
                        <span><i class="fas fa-folder"></i> ${record.eventCategory}</span>
                    </div>
                    <div class="history-status">
                        ${this.getStatusBadge(record.status)}
                    </div>
                </div>
                <div class="history-actions">
                    ${this.getActionButtons(record)}
                </div>
            </div>
        `).join('');
    }

    // ステータスバッジの取得
    getStatusBadge(status) {
        const badges = {
            attended: '<span class="badge badge-success"><i class="fas fa-check"></i> 出席</span>',
            registered: '<span class="badge badge-info"><i class="fas fa-clock"></i> 申込済み</span>',
            cancelled: '<span class="badge badge-warning"><i class="fas fa-times"></i> キャンセル</span>',
            'no-show': '<span class="badge badge-danger"><i class="fas fa-user-times"></i> 欠席</span>'
        };
        
        return badges[status] || '<span class="badge">不明</span>';
    }

    // アクションボタンの取得
    getActionButtons(record) {
        const eventDate = new Date(record.eventDate);
        const now = new Date();
        const isPast = eventDate < now;

        if (isPast && record.status === 'registered') {
            return `
                <button class="btn-small btn-success" onclick="eventHistoryManager.markAsAttended('${record.eventId}')">
                    出席確認
                </button>
                <button class="btn-small btn-danger" onclick="eventHistoryManager.markAsNoShow('${record.eventId}')">
                    欠席
                </button>
            `;
        } else if (!isPast && record.status === 'registered') {
            return `
                <button class="btn-small btn-warning" onclick="eventHistoryManager.cancelParticipation('${record.eventId}')">
                    キャンセル
                </button>
            `;
        } else if (record.status === 'attended') {
            return `
                <button class="btn-small btn-primary" onclick="eventHistoryManager.downloadCertificate('${record.eventId}')">
                    <i class="fas fa-certificate"></i> 証明書
                </button>
            `;
        }
        
        return '';
    }

    // 出席としてマーク
    markAsAttended(eventId) {
        if (this.updateParticipationStatus(eventId, 'attended')) {
            this.showNotification('出席を記録しました', 'success');
        }
    }

    // 欠席としてマーク
    markAsNoShow(eventId) {
        if (this.updateParticipationStatus(eventId, 'no-show')) {
            this.showNotification('欠席を記録しました', 'info');
        }
    }

    // 参加証明書のダウンロード
    downloadCertificate(eventId) {
        if (!this.currentUser) return;

        const userId = this.currentUser.id;
        const history = this.participationHistory[userId];
        const record = history?.find(h => h.eventId === eventId);

        if (!record || record.status !== 'attended') {
            this.showNotification('参加証明書は出席したイベントのみ発行できます', 'error');
            return;
        }

        // 証明書の生成（デモ）
        const certificate = {
            userName: `${this.currentUser.lastName} ${this.currentUser.firstName}`,
            eventTitle: record.eventTitle,
            eventDate: record.eventDate,
            issuedDate: new Date().toISOString(),
            certificateId: `CERT-${eventId}-${userId}-${Date.now()}`
        };

        // 実際の実装ではPDF生成やダウンロード処理
        console.log('Certificate:', certificate);
        this.showNotification('参加証明書をダウンロードしました', 'success');
    }

    // 履歴のエクスポート
    exportHistory() {
        const history = this.getUserHistory();
        
        if (history.length === 0) {
            this.showNotification('エクスポートする履歴がありません', 'warning');
            return;
        }

        // CSV形式でエクスポート
        const headers = ['イベント名', '日時', '場所', 'カテゴリ', '状態', '登録日'];
        const rows = history.map(record => [
            record.eventTitle,
            `${record.eventDate} ${record.eventTime}`,
            record.eventLocation,
            record.eventCategory,
            this.getStatusText(record.status),
            new Date(record.registeredAt).toLocaleDateString('ja-JP')
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        // BOMを追加（Excelで開く際の文字化け対策）
        const bom = '\uFEFF';
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `event_history_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('履歴をエクスポートしました', 'success');
    }

    // ステータステキストの取得
    getStatusText(status) {
        const texts = {
            attended: '出席',
            registered: '申込済み',
            cancelled: 'キャンセル',
            'no-show': '欠席'
        };
        
        return texts[status] || '不明';
    }

    // フィルターイベントの設定
    setupFilterEvents() {
        const statusFilter = document.getElementById('statusFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const monthFilter = document.getElementById('monthFilter');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (monthFilter) {
            monthFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    // フィルターの適用
    applyFilters() {
        const statusFilter = document.getElementById('statusFilter')?.value;
        const categoryFilter = document.getElementById('categoryFilter')?.value;
        const monthFilter = document.getElementById('monthFilter')?.value;

        let history = this.getUserHistory();

        // ステータスフィルター
        if (statusFilter) {
            history = history.filter(h => h.status === statusFilter);
        }

        // カテゴリフィルター
        if (categoryFilter) {
            history = history.filter(h => h.eventCategory === categoryFilter);
        }

        // 月フィルター
        if (monthFilter) {
            const [year, month] = monthFilter.split('-').map(Number);
            history = history.filter(h => {
                const date = new Date(h.eventDate);
                return date.getFullYear() === year && date.getMonth() + 1 === month;
            });
        }

        // 結果を表示
        const listContainer = document.getElementById('historyList');
        if (listContainer) {
            // 安全な HTML 挿入
            if (window.SecurityUtils) {
                window.SecurityUtils.safeSetHTML(listContainer, this.renderHistoryItems(history));
            } else {
                listContainer.innerHTML = this.renderHistoryItems(history); // フォールバック
            }
        }
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // イベント申込ボタンのリスナー
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('event-register-btn')) {
                const eventId = e.target.dataset.eventId;
                if (eventId) {
                    this.recordParticipation(eventId, 'registered');
                    this.showNotification('イベントに申し込みました', 'success');
                }
            }
        });
    }

    // 通知の表示
    showNotification(message, type = 'info') {
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
            animation: slideIn 0.3s ease;
        `;
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// グローバルインスタンス
const eventHistoryManager = new EventHistoryManager();

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventHistoryManager;
}