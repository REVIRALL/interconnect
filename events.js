// イベントページの機能

// ページネーション用の変数
let currentPage = 1;
const itemsPerPage = 4;

// ページ読み込み時のイベント一覧更新
function loadEventCards() {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid) return;
    
    // eventServiceが存在しない場合は終了
    if (typeof eventService === 'undefined') {
        console.error('EventService is not loaded');
        eventsGrid.innerHTML = '<p>システムエラー：EventServiceが読み込まれていません</p>';
        return;
    }
    
    let events = eventService.getAllEvents();
    const currentUser = eventService.getCurrentUser();
    
    // ページネーション処理
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    events = events.slice(startIndex, endIndex);
    
    eventsGrid.innerHTML = events.map(event => {
        const eventDate = new Date(event.date);
        const isParticipating = currentUser && currentUser.id ? eventService.isUserParticipating(event.id, currentUser.id) : false;
        const participantCount = eventService.getParticipantCount(event.id);
        const isFull = participantCount >= event.maxAttendees;
        
        return `
            <div class="event-card" data-event-id="${event.id}" data-category="${event.category}">
                <div class="event-date-badge">
                    <span class="date">${eventDate.getDate()}</span>
                    <span class="month">${eventDate.toLocaleDateString('ja-JP', { month: 'short' })}</span>
                </div>
                <div class="event-image">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 150'%3E%3Crect width='300' height='150' fill='%23e0e0e0'/%3E%3Ctext x='150' y='75' text-anchor='middle' dominant-baseline='middle' fill='%23999' font-family='Arial,sans-serif' font-size='14'%3Eイベント画像%3C/text%3E%3C/svg%3E" 
                         alt="イベント画像" 
                         class="lazy">
                    <div class="event-status ${isParticipating ? 'joined' : 'upcoming'}">
                        ${isParticipating ? '参加予定' : '開催予定'}
                    </div>
                </div>
                <div class="event-content">
                    <div class="event-category ${event.category}">${getCategoryLabel(event.category)}</div>
                    <h3>${event.title}</h3>
                    <p class="event-description">${event.description}</p>
                    <div class="event-details">
                        <div class="event-time">
                            <i class="fas fa-clock"></i>
                            ${event.startTime} - ${event.endTime}
                        </div>
                        <div class="event-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${event.location}
                        </div>
                        <div class="event-attendees">
                            <i class="fas fa-users"></i>
                            ${participantCount}/${event.maxAttendees}名
                        </div>
                    </div>
                    <div class="event-host">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' fill='%23e0e0e0'/%3E%3Ctext x='15' y='15' text-anchor='middle' dominant-baseline='middle' fill='%23999' font-family='Arial,sans-serif' font-size='10'%3E主催者%3C/text%3E%3C/svg%3E" alt="主催者">
                        <span>${event.organizerName}</span>
                    </div>
                </div>
                <div class="event-actions">
                    ${isParticipating ? 
                        `<button class="btn-secondary" onclick="cancelEventParticipation('${event.id}')">キャンセル</button>` :
                        `<button class="btn-primary event-register-btn" data-event-id="${event.id}" onclick="joinEvent('${event.id}')" ${isFull ? 'disabled' : ''}>
                            ${isFull ? '満席' : '参加申込'}
                        </button>`
                    }
                    <button class="btn-outline" onclick="showEventDetails('${event.id}')">詳細</button>
                    ${currentUser && currentUser.id && (event.organizerId === currentUser.id || currentUser.role === 'admin') ? 
                        `<button class="btn-outline" onclick="editEvent('${event.id}')"><i class="fas fa-edit"></i></button>` : ''
                    }
                </div>
            </div>
        `;
    }).join('');
}

// カテゴリラベル取得
function getCategoryLabel(category) {
    const labels = {
        networking: 'ネットワーキング',
        seminar: 'セミナー',
        workshop: 'ワークショップ',
        conference: 'カンファレンス',
        social: '懇親会',
        pitch: 'ピッチ'
    };
    return labels[category] || category;
}

// ページ初期化関数
function initializeEventsPage() {
    // イベント一覧を読み込み
    loadEventCards();
    updatePagination();
    
    // フィルタータブの設定
    const filterTabs = document.querySelectorAll('.filter-tab');
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            applyEventFilter(filter);
        });
    });
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (locationFilter) {
        locationFilter.addEventListener('change', applyFilters);
    }
}

// イベントフィルターの適用
function applyEventFilter(filter) {
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        const status = card.querySelector('.event-status');
        let show = true;
        
        if (filter === 'upcoming') {
            show = status && status.classList.contains('upcoming');
        } else if (filter === 'joined') {
            show = status && status.classList.contains('joined');
        } else if (filter === 'hosted') {
            show = status && status.classList.contains('hosted');
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

// カテゴリ・場所フィルターの適用
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');
    const eventCards = document.querySelectorAll('.event-card');
    
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    const selectedLocation = locationFilter ? locationFilter.value : '';
    
    eventCards.forEach(card => {
        const category = card.querySelector('.event-category');
        const location = card.querySelector('.event-location');
        
        let showCategory = !selectedCategory || (category && category.textContent.includes(selectedCategory));
        let showLocation = !selectedLocation;
        
        if (selectedLocation && location) {
            const locationText = location.textContent.toLowerCase();
            if (selectedLocation === 'online') {
                showLocation = locationText.includes('オンライン');
            } else {
                showLocation = locationText.includes(selectedLocation);
            }
        }
        
        card.style.display = (showCategory && showLocation) ? 'block' : 'none';
    });
}

// カレンダー表示の切り替え
function toggleCalendarView() {
    const gridView = document.querySelector('.events-grid');
    const calendarView = document.getElementById('calendarView');
    const calendarBtn = document.querySelector('.view-toggle .btn-outline');
    
    if (!calendarView) {
        // カレンダービューを作成
        createCalendarView();
        return;
    }
    
    // ビューの切り替え
    if (gridView.style.display === 'none') {
        gridView.style.display = 'grid';
        calendarView.style.display = 'none';
        calendarBtn.innerHTML = '<i class="fas fa-calendar"></i> カレンダー表示';
    } else {
        gridView.style.display = 'none';
        calendarView.style.display = 'block';
        calendarBtn.innerHTML = '<i class="fas fa-th"></i> グリッド表示';
        updateCalendarView();
    }
}

// カレンダービューの作成
function createCalendarView() {
    const eventsSection = document.querySelector('.events-section');
    const calendarHTML = `
        <div id="calendarView" style="display: none;">
            <div class="calendar-header">
                <button class="btn-calendar-nav" onclick="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                <h3 id="currentMonth"></h3>
                <button class="btn-calendar-nav" onclick="changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-weekdays"></div>
                <div class="calendar-days"></div>
            </div>
        </div>
    `;
    
    eventsSection.insertAdjacentHTML('beforeend', calendarHTML);
    
    // カレンダー用のスタイルを追加
    if (!document.getElementById('calendarStyles')) {
        const style = document.createElement('style');
        style.id = 'calendarStyles';
        style.textContent = `
            #calendarView {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }
            .calendar-header h3 {
                margin: 0;
                font-size: 1.5rem;
                color: var(--primary-blue);
            }
            .btn-calendar-nav {
                background: var(--light-blue);
                border: none;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                color: var(--primary-blue);
            }
            .btn-calendar-nav:hover {
                background: var(--primary-blue);
                color: white;
            }
            .calendar-grid {
                display: grid;
                grid-template-rows: auto 1fr;
                gap: 1rem;
            }
            .calendar-weekdays {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1px;
                background: #e9ecef;
                padding: 1px;
                border-radius: 8px;
            }
            .calendar-weekday {
                background: white;
                padding: 1rem;
                text-align: center;
                font-weight: 600;
                color: var(--dark-gray);
            }
            .calendar-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1px;
                background: #e9ecef;
                padding: 1px;
                border-radius: 8px;
                min-height: 500px;
            }
            .calendar-day {
                background: white;
                padding: 0.5rem;
                min-height: 100px;
                position: relative;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .calendar-day:hover {
                background: var(--light-blue);
            }
            .calendar-day.other-month {
                background: #f8f9fa;
                color: #adb5bd;
            }
            .calendar-day.today {
                background: #e3f2fd;
            }
            .calendar-day-number {
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            .calendar-event {
                background: var(--primary-blue);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                margin-bottom: 0.25rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                cursor: pointer;
            }
            .calendar-event.online {
                background: #28a745;
            }
            .calendar-event.full {
                background: #dc3545;
            }
        `;
        document.head.appendChild(style);
    }
    
    toggleCalendarView();
}

// 現在の月を管理
let currentCalendarDate = new Date();

// 月を変更
function changeMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    updateCalendarView();
}

// カレンダービューの更新
function updateCalendarView() {
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    
    // 現在の月を表示
    document.getElementById('currentMonth').textContent = 
        `${currentCalendarDate.getFullYear()}年 ${monthNames[currentCalendarDate.getMonth()]}`;
    
    // 曜日を表示
    const weekdaysContainer = document.querySelector('.calendar-weekdays');
    weekdaysContainer.innerHTML = weekdays.map(day => 
        `<div class="calendar-weekday">${day}</div>`
    ).join('');
    
    // 日付を表示
    const daysContainer = document.querySelector('.calendar-days');
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();
    
    let daysHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 前月の日付
    for (let i = firstDay - 1; i >= 0; i--) {
        daysHTML += `<div class="calendar-day other-month">
            <div class="calendar-day-number">${prevLastDate - i}</div>
        </div>`;
    }
    
    // 今月の日付
    for (let day = 1; day <= lastDate; day++) {
        const currentDate = new Date(year, month, day);
        const isToday = currentDate.getTime() === today.getTime();
        const events = getEventsForDate(currentDate);
        
        daysHTML += `<div class="calendar-day ${isToday ? 'today' : ''}" onclick="showDayEvents('${currentDate.toISOString()}')">
            <div class="calendar-day-number">${day}</div>
            ${events.map(event => `
                <div class="calendar-event ${event.location.includes('オンライン') ? 'online' : ''} ${event.isFull ? 'full' : ''}" 
                     onclick="event.stopPropagation(); showEventDetails('${event.id}')">
                    ${event.time} ${event.title}
                </div>
            `).join('')}
        </div>`;
    }
    
    // 次月の日付
    const remainingDays = 42 - (firstDay + lastDate);
    for (let day = 1; day <= remainingDays; day++) {
        daysHTML += `<div class="calendar-day other-month">
            <div class="calendar-day-number">${day}</div>
        </div>`;
    }
    
    daysContainer.innerHTML = daysHTML;
}

// 特定の日付のイベントを取得
function getEventsForDate(date) {
    const events = eventService.getAllEvents();
    const dateStr = date.toISOString().split('T')[0];
    
    return events
        .filter(event => event.date === dateStr)
        .map(event => {
            const participants = eventService.getParticipantCount(event.id);
            return {
                id: event.id,
                title: event.title,
                date: new Date(event.date),
                time: event.startTime,
                location: event.location,
                isFull: participants >= event.maxAttendees
            };
        });
}

// 元の関数をコメントアウト
/*
function getEventsForDate_old(date) {
    // デモイベントデータ
    const events = [
        {
            id: '1',
            title: '定例交流会',
            date: new Date(2024, 1, 15),
            time: '19:00',
            location: '東京都渋谷区',
            isFull: false
        },
        {
            id: '2',
            title: 'ビジネスセミナー',
            date: new Date(2024, 1, 20),
            time: '14:00',
            location: 'オンライン開催',
            isFull: false
        },
        {
            id: '3',
            title: '新年会',
            date: new Date(2024, 1, 25),
            time: '18:00',
            location: '東京都新宿区',
            isFull: true
        }
    ];
    
    return events.filter(event => 
        event.date.getFullYear() === date.getFullYear() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getDate() === date.getDate()
    );
}
*/

// 特定の日のイベント一覧を表示
function showDayEvents(dateString) {
    const date = new Date(dateString);
    const events = getEventsForDate(date);
    
    if (events.length === 0) {
        showNotification(`${date.toLocaleDateString('ja-JP')}にイベントはありません`, 'info');
    } else {
        const eventsList = events.map(e => `・${e.time} ${e.title}`).join('\n');
        showNotification(`${date.toLocaleDateString('ja-JP')}のイベント:\n${eventsList}`, 'info');
    }
}

// イベント作成モーダルを開く
function openCreateEvent() {
    const modal = document.getElementById('createEventModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// イベント作成モーダルを閉じる
function closeCreateEvent() {
    const modal = document.getElementById('createEventModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // フォームをリセット
        const form = document.getElementById('createEventForm');
        if (form) {
            form.reset();
        }
    }
}

// イベントを作成
function createNewEvent() {
    console.log('createEvent function called');
    
    const form = document.getElementById('createEventForm');
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    const formData = new FormData(form);
    const currentUser = eventService.getCurrentUser();
    
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
        alert('ログインが必要です');
        return;
    }
    
    const eventData = {
        title: formData.get('eventName'),
        category: formData.get('category'),
        date: formData.get('eventDate'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        location: formData.get('location'),
        maxAttendees: parseInt(formData.get('maxAttendees')),
        description: formData.get('description'),
        organizerId: currentUser.id,
        organizerName: `${currentUser.lastName} ${currentUser.firstName}`
    };
    
    // 基本バリデーション
    if (!eventData.title || !eventData.category || !eventData.date || 
        !eventData.startTime || !eventData.endTime || !eventData.location ||
        !eventData.maxAttendees || !eventData.description) {
        alert('すべての項目を入力してください');
        return;
    }
    
    // 日付の妥当性チェック
    const eventDate = new Date(eventData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
        alert('開催日は今日以降を選択してください');
        return;
    }
    
    // 時間の妥当性チェック
    if (eventData.startTime >= eventData.endTime) {
        alert('終了時間は開始時間より後に設定してください');
        return;
    }
    
    try {
        console.log('Creating event with data:', eventData);
        
        // イベント作成
        const newEvent = eventService.createEvent(eventData);
        
        console.log('Event created successfully:', newEvent);
        
        // 成功通知
        showNotification('イベントが作成されました！', 'success');
        
        // モーダルを閉じる
        closeCreateEvent();
        
        // イベント一覧を更新
        loadEventCards();
        
        // ページネーション更新
        updatePagination();
        
    } catch (error) {
        console.error('Error creating event:', error);
        alert('エラー: ' + error.message);
    }
}

// イベント参加申込
function joinEvent(eventId) {
    if (!eventService) {
        alert('システムエラー：EventServiceが利用できません');
        return;
    }
    
    const currentUser = eventService.getCurrentUser();
    if (!currentUser) {
        alert('ログインが必要です');
        return;
    }
    
    if (confirm('このイベントに参加申し込みしますか？')) {
        try {
            // 参加申込処理
            eventService.joinEvent(eventId, currentUser.id);
            
            // イベント履歴に記録
            if (window.eventHistoryManager) {
                window.eventHistoryManager.recordParticipation(eventId, 'registered');
            }
            
            alert('参加申し込みが完了しました！');
            
            // モーダルを閉じる
            if (typeof closeEventDetail === 'function') {
                closeEventDetail();
            }
            
            // イベント一覧を更新
            loadEventCards();
            
        } catch (error) {
            alert('エラー: ' + error.message);
        }
    }
}

// イベント詳細表示
function showEventDetails(eventId) {
    // EventServiceからデータを取得
    const event = eventService.getEvent(eventId);
    
    if (!event) {
        // デモイベントデータ（フォールバック）
        const eventData = {
        '1': {
            id: '1',
            title: '定例交流会',
            category: '交流会',
            date: '2024-02-15',
            startTime: '19:00',
            endTime: '21:00',
            location: '東京都渋谷区クロスタワー 5F',
            organizer: '田中太郎',
            maxAttendees: 50,
            currentAttendees: 35,
            description: '毎月開催している定例の交流会です。新しいビジネスの出会いと情報交換の場として、多くの経営者の方にご参加いただいています。\n\n今回のテーマは「デジタル変革時代の経営戦略」です。',
            agenda: [
                { time: '19:00-19:15', content: '受付・名刺交換' },
                { time: '19:15-19:30', content: 'オープニング・主催者挨拶' },
                { time: '19:30-20:00', content: 'ゲストスピーカー講演' },
                { time: '20:00-20:45', content: 'フリー交流タイム' },
                { time: '20:45-21:00', content: 'クロージング' }
            ],
            attendees: [
                { name: '山田花子', company: '山田商事株式会社' },
                { name: '佐藤次郎', company: '佐藤工業' },
                { name: '鈴木三郎', company: '鈴木システムズ' }
            ]
        },
        '2': {
            id: '2',
            title: 'ビジネスセミナー',
            category: 'セミナー',
            date: '2024-02-20',
            startTime: '14:00',
            endTime: '17:00',
            location: 'オンライン開催（Zoom）',
            organizer: '鈴木花子',
            maxAttendees: 100,
            currentAttendees: 78,
            description: '最新のビジネストレンドと実践的な経営手法を学ぶセミナーです。',
            agenda: [
                { time: '14:00-15:00', content: '第1部：市場トレンド分析' },
                { time: '15:00-16:00', content: '第2部：成功事例紹介' },
                { time: '16:00-17:00', content: '第3部：Q&Aセッション' }
            ],
            attendees: []
        }
    };
    
        const event = eventData[eventId] || eventData['1'];
    } else {
        // EventServiceから取得したデータを整形
        const participants = eventService.getParticipants(eventId);
        const participantCount = eventService.getParticipantCount(eventId);
        
        event.organizer = event.organizerName;
        event.currentAttendees = participantCount;
        event.attendees = participants.slice(0, 3).map(p => ({
            name: p.name,
            company: p.company
        }));
    }
    
    // 既存のモーダルを削除
    const existingModal = document.getElementById('eventDetailModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // モーダルHTML作成
    const modalHTML = `
        <div id="eventDetailModal" class="modal-overlay" style="display: flex;">
            <div class="modal-content event-detail-modal">
                <div class="modal-header">
                    <h2>${event.title}</h2>
                    <button class="close-modal" onclick="closeEventDetail()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="event-detail-info">
                        <div class="detail-section">
                            <h3>基本情報</h3>
                            <div class="info-grid">
                                <div class="info-item">
                                    <i class="fas fa-folder"></i>
                                    <span>カテゴリ: ${event.category}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>日時: ${new Date(event.date).toLocaleDateString('ja-JP')} ${event.startTime}-${event.endTime}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>場所: ${event.location}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-user"></i>
                                    <span>主催者: ${event.organizer}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-users"></i>
                                    <span>参加者: ${event.currentAttendees}/${event.maxAttendees}名</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>概要</h3>
                            <p>${event.description.replace(/\n/g, '<br>')}</p>
                        </div>
                        
                        ${event.agenda ? `
                        <div class="detail-section">
                            <h3>タイムスケジュール</h3>
                            <div class="agenda-list">
                                ${event.agenda.map(item => `
                                    <div class="agenda-item">
                                        <span class="agenda-time">${item.time}</span>
                                        <span class="agenda-content">${item.content}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${event.attendees && event.attendees.length > 0 ? `
                        <div class="detail-section">
                            <h3>参加予定者（一部）</h3>
                            <div class="attendees-list">
                                ${event.attendees.map(attendee => `
                                    <div class="attendee-item">
                                        <i class="fas fa-user-circle"></i>
                                        <span>${attendee.name} - ${attendee.company}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeEventDetail()">閉じる</button>
                    ${event.currentAttendees < event.maxAttendees ? 
                        `<button class="btn-primary" onclick="joinEvent('${event.id}')">参加申込</button>` :
                        `<button class="btn-primary" disabled>満席</button>`
                    }
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // モーダル用スタイル追加
    if (!document.getElementById('eventDetailStyles')) {
        const style = document.createElement('style');
        style.id = 'eventDetailStyles';
        style.textContent = `
            .event-detail-modal {
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
            }
            .modal-header h2 {
                margin: 0;
                color: var(--primary-blue);
            }
            .event-detail-info {
                padding: 1rem 0;
            }
            .detail-section {
                margin-bottom: 2rem;
            }
            .detail-section h3 {
                color: var(--primary-blue);
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid var(--light-blue);
            }
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
            }
            .info-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: var(--gray-text);
            }
            .info-item i {
                color: var(--primary-blue);
                width: 20px;
            }
            .agenda-list {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 8px;
            }
            .agenda-item {
                display: flex;
                gap: 1rem;
                padding: 0.75rem 0;
                border-bottom: 1px solid #e9ecef;
            }
            .agenda-item:last-child {
                border-bottom: none;
            }
            .agenda-time {
                font-weight: 600;
                color: var(--primary-blue);
                min-width: 120px;
            }
            .attendees-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 0.75rem;
            }
            .attendee-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                background: #f8f9fa;
                border-radius: 6px;
            }
            .attendee-item i {
                color: var(--primary-blue);
            }
        `;
        document.head.appendChild(style);
    }
}

// イベント詳細モーダルを閉じる
function closeEventDetail() {
    const modal = document.getElementById('eventDetailModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
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
        white-space: pre-line;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
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

// モーダル外クリックで閉じる
document.addEventListener('click', function(event) {
    const modal = document.getElementById('createEventModal');
    if (modal && event.target === modal) {
        closeCreateEvent();
    }
});

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCreateEvent();
        closeEventDetail();
    }
});

// ページネーション機能

function changePage(direction) {
    // eventServiceが存在しない場合は終了
    if (typeof eventService === 'undefined') {
        console.error('EventService not available');
        return;
    }
    
    const totalEvents = eventService.getAllEvents().length;
    const totalPages = Math.ceil(totalEvents / itemsPerPage);
    
    currentPage += direction;
    
    // ページ範囲チェック
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    updatePagination();
    loadEventCards();
}

function updatePagination() {
    // eventServiceが存在しない場合は終了
    if (typeof eventService === 'undefined') {
        console.error('EventService not available for pagination');
        return;
    }
    
    const totalEvents = eventService.getAllEvents().length;
    const totalPages = Math.ceil(totalEvents / itemsPerPage);
    
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `${currentPage} / ${totalPages}`;
    }
    
    // ボタンの有効/無効を更新
    const prevBtn = document.querySelector('.pagination-btn:first-child');
    const nextBtn = document.querySelector('.pagination-btn:last-child');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }
}

// イベント参加のキャンセル
function cancelEventParticipation(eventId) {
    const currentUser = eventService.getCurrentUser();
    if (!currentUser) {
        alert('ログインが必要です');
        return;
    }
    
    if (confirm('このイベントの参加をキャンセルしますか？')) {
        try {
            eventService.cancelParticipation(eventId, currentUser.id);
            showNotification('参加をキャンセルしました', 'success');
            loadEventCards();
        } catch (error) {
            alert('エラー: ' + error.message);
        }
    }
}

// イベントカードのアクションボタンにイベントリスナーを追加
document.addEventListener('DOMContentLoaded', function() {
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach((card, index) => {
        const joinBtn = card.querySelector('.btn-primary');
        const detailBtn = card.querySelector('.btn-outline');
        
        if (joinBtn && joinBtn.textContent.includes('参加申込')) {
            joinBtn.addEventListener('click', () => joinEvent(index));
        }
        
        if (detailBtn) {
            detailBtn.addEventListener('click', () => showEventDetails(index));
        }
    });
});