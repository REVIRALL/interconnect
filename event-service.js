// イベントサービス - データ管理と永続化

class EventService {
    constructor() {
        this.events = new Map();
        this.participants = new Map(); // eventId -> Set of userIds
        this.loadEvents();
        this.initializeDefaultEvents();
    }

    // イベントデータの読み込み
    loadEvents() {
        const savedEvents = localStorage.getItem('events');
        if (savedEvents) {
            const eventsArray = JSON.parse(savedEvents);
            eventsArray.forEach(event => {
                this.events.set(event.id, event);
            });
        }

        const savedParticipants = localStorage.getItem('eventParticipants');
        if (savedParticipants) {
            const participantsData = JSON.parse(savedParticipants);
            Object.entries(participantsData).forEach(([eventId, participants]) => {
                this.participants.set(eventId, new Set(participants));
            });
        }
    }

    // デフォルトイベントの初期化
    initializeDefaultEvents() {
        if (this.events.size === 0) {
            const defaultEvents = [
                {
                    id: 'evt001',
                    title: '定例交流会',
                    category: 'networking',
                    description: '毎月開催している定例の交流会です。新しいビジネスの出会いと情報交換の場として、多くの経営者の方にご参加いただいています。',
                    date: '2024-02-15',
                    startTime: '19:00',
                    endTime: '21:00',
                    location: '東京都渋谷区クロスタワー 5F',
                    maxAttendees: 50,
                    organizerId: 'user-001',
                    organizerName: '田中太郎',
                    status: 'upcoming',
                    createdAt: new Date().toISOString(),
                    agenda: [
                        { time: '19:00-19:15', content: '受付・名刺交換' },
                        { time: '19:15-19:30', content: 'オープニング・主催者挨拶' },
                        { time: '19:30-20:00', content: 'ゲストスピーカー講演' },
                        { time: '20:00-20:45', content: 'フリー交流タイム' },
                        { time: '20:45-21:00', content: 'クロージング' }
                    ],
                    tags: ['ネットワーキング', '交流会', '経営者']
                },
                {
                    id: 'evt002',
                    title: 'ビジネスセミナー',
                    category: 'seminar',
                    description: '最新のビジネストレンドと実践的な経営手法を学ぶセミナーです。',
                    date: '2024-02-20',
                    startTime: '14:00',
                    endTime: '17:00',
                    location: 'オンライン開催（Zoom）',
                    maxAttendees: 100,
                    organizerId: 'user-002',
                    organizerName: '鈴木花子',
                    status: 'upcoming',
                    createdAt: new Date().toISOString(),
                    agenda: [
                        { time: '14:00-15:00', content: '第1部：市場トレンド分析' },
                        { time: '15:00-16:00', content: '第2部：成功事例紹介' },
                        { time: '16:00-17:00', content: '第3部：Q&Aセッション' }
                    ],
                    tags: ['セミナー', 'ビジネス', 'オンライン']
                },
                {
                    id: 'evt003',
                    title: 'ピッチイベント',
                    category: 'pitch',
                    description: '新規事業のアイデアをプレゼンし、投資家や協業パートナーを見つけるイベントです。',
                    date: '2024-02-25',
                    startTime: '13:00',
                    endTime: '18:00',
                    location: '品川インターシティ',
                    maxAttendees: 80,
                    organizerId: 'user-003',
                    organizerName: '佐藤次郎',
                    status: 'upcoming',
                    createdAt: new Date().toISOString(),
                    tags: ['ピッチ', '投資', 'スタートアップ']
                }
            ];

            defaultEvents.forEach(event => {
                this.events.set(event.id, event);
            });

            this.saveEvents();
        }
    }

    // イベントデータの保存
    saveEvents() {
        const eventsArray = Array.from(this.events.values());
        localStorage.setItem('events', JSON.stringify(eventsArray));

        const participantsData = {};
        this.participants.forEach((participants, eventId) => {
            participantsData[eventId] = Array.from(participants);
        });
        localStorage.setItem('eventParticipants', JSON.stringify(participantsData));
    }

    // イベントの作成
    createEvent(eventData) {
        const event = {
            id: 'evt' + Date.now(),
            ...eventData,
            status: 'upcoming',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.events.set(event.id, event);
        this.participants.set(event.id, new Set());
        this.saveEvents();

        return event;
    }

    // イベントの更新
    updateEvent(eventId, updates) {
        const event = this.events.get(eventId);
        if (!event) {
            throw new Error('イベントが見つかりません');
        }

        const updatedEvent = {
            ...event,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.events.set(eventId, updatedEvent);
        this.saveEvents();

        return updatedEvent;
    }

    // イベントの削除
    deleteEvent(eventId) {
        const event = this.events.get(eventId);
        if (!event) {
            throw new Error('イベントが見つかりません');
        }

        // 現在のユーザーが主催者かチェック
        const currentUser = this.getCurrentUser();
        if (event.organizerId !== currentUser.id && currentUser.role !== 'admin') {
            throw new Error('このイベントを削除する権限がありません');
        }

        this.events.delete(eventId);
        this.participants.delete(eventId);
        this.saveEvents();

        return true;
    }

    // イベント取得
    getEvent(eventId) {
        return this.events.get(eventId);
    }

    // すべてのイベント取得
    getAllEvents() {
        return Array.from(this.events.values());
    }

    // フィルタリングされたイベント取得
    getFilteredEvents(filters = {}) {
        let events = Array.from(this.events.values());

        // カテゴリフィルター
        if (filters.category) {
            events = events.filter(event => event.category === filters.category);
        }

        // 場所フィルター
        if (filters.location) {
            events = events.filter(event => {
                if (filters.location === 'online') {
                    return event.location.toLowerCase().includes('オンライン');
                }
                return event.location.includes(filters.location);
            });
        }

        // 日付フィルター
        if (filters.startDate) {
            events = events.filter(event => new Date(event.date) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            events = events.filter(event => new Date(event.date) <= new Date(filters.endDate));
        }

        // ステータスフィルター
        if (filters.status) {
            const currentUser = this.getCurrentUser();
            const userId = currentUser?.id;

            switch (filters.status) {
                case 'upcoming':
                    events = events.filter(event => new Date(event.date) >= new Date());
                    break;
                case 'past':
                    events = events.filter(event => new Date(event.date) < new Date());
                    break;
                case 'joined':
                    events = events.filter(event => {
                        const participants = this.participants.get(event.id);
                        return participants && participants.has(userId);
                    });
                    break;
                case 'hosted':
                    events = events.filter(event => event.organizerId === userId);
                    break;
            }
        }

        // 検索クエリ
        if (filters.search) {
            const query = filters.search.toLowerCase();
            events = events.filter(event => 
                event.title.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query) ||
                (event.tags && event.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }

        // ソート
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'date':
                    events.sort((a, b) => new Date(a.date) - new Date(b.date));
                    break;
                case 'title':
                    events.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'participants':
                    events.sort((a, b) => {
                        const aCount = this.getParticipantCount(a.id);
                        const bCount = this.getParticipantCount(b.id);
                        return bCount - aCount;
                    });
                    break;
            }
        } else {
            // デフォルトは日付順
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        return events;
    }

    // イベント参加
    joinEvent(eventId, userId) {
        const event = this.events.get(eventId);
        if (!event) {
            throw new Error('イベントが見つかりません');
        }

        // 定員チェック
        const currentParticipants = this.getParticipantCount(eventId);
        if (currentParticipants >= event.maxAttendees) {
            throw new Error('このイベントは満席です');
        }

        // 参加者リストに追加
        if (!this.participants.has(eventId)) {
            this.participants.set(eventId, new Set());
        }

        const eventParticipants = this.participants.get(eventId);
        if (eventParticipants.has(userId)) {
            throw new Error('既にこのイベントに参加申込済みです');
        }

        eventParticipants.add(userId);
        this.saveEvents();

        return true;
    }

    // イベント参加キャンセル
    cancelParticipation(eventId, userId) {
        const participants = this.participants.get(eventId);
        if (!participants || !participants.has(userId)) {
            throw new Error('このイベントに参加していません');
        }

        participants.delete(userId);
        this.saveEvents();

        return true;
    }

    // 参加者数取得
    getParticipantCount(eventId) {
        const participants = this.participants.get(eventId);
        return participants ? participants.size : 0;
    }

    // 参加者リスト取得
    getParticipants(eventId) {
        const participants = this.participants.get(eventId);
        if (!participants) return [];

        // ユーザー情報を取得（簡易実装）
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const participantList = [];

        participants.forEach(userId => {
            const user = users.find(u => u.id === userId);
            if (user) {
                participantList.push({
                    id: user.id,
                    name: `${user.lastName} ${user.firstName}`,
                    company: user.company,
                    position: user.position
                });
            }
        });

        return participantList;
    }

    // ユーザーが参加しているか確認
    isUserParticipating(eventId, userId) {
        const participants = this.participants.get(eventId);
        return participants ? participants.has(userId) : false;
    }

    // 現在のユーザー取得
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // 統計情報取得
    getEventStatistics() {
        const stats = {
            total: this.events.size,
            upcoming: 0,
            past: 0,
            totalParticipants: 0,
            byCategory: {}
        };

        const now = new Date();

        this.events.forEach(event => {
            if (new Date(event.date) >= now) {
                stats.upcoming++;
            } else {
                stats.past++;
            }

            // カテゴリ別集計
            if (!stats.byCategory[event.category]) {
                stats.byCategory[event.category] = 0;
            }
            stats.byCategory[event.category]++;

            // 参加者数集計
            stats.totalParticipants += this.getParticipantCount(event.id);
        });

        return stats;
    }

    // 今後のイベント取得
    getUpcomingEvents(limit = 5) {
        const now = new Date();
        const upcoming = Array.from(this.events.values())
            .filter(event => new Date(event.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, limit);

        return upcoming;
    }
}

// グローバルインスタンス
const eventService = new EventService();

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventService;
}