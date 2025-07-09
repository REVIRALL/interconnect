// メッセージサービス - ダミー実装（localStorage使用）

class MessageService {
    constructor() {
        this.supabaseService = window.supabaseService;
        this.subscriptions = new Map();
        this.currentUserId = null;
        this.conversations = new Map();
        
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

        // 会話データをロード（常にローカル）
        this.loadLocalConversations();
        console.log('Message service initialized in localStorage mode');
    }

    // ローカル会話データのロード
    loadLocalConversations() {
        const localConversations = {
            1: {
                id: 1,
                name: '佐藤次郎',
                avatar: this.generateSVGAvatar('佐藤次郎', 40),
                status: 'online',
                lastMessage: 'ありがとうございます！明日14時頃はいかがでしょうか？',
                lastMessageTime: '15:20',
                unreadCount: 0
            },
            2: {
                id: 2,
                name: '山田花子',
                avatar: this.generateSVGAvatar('山田花子', 40),
                status: 'away',
                lastMessage: '詳細は後ほどメールでお送りします。',
                lastMessageTime: '13:02',
                unreadCount: 1
            },
            3: {
                id: 3,
                name: '鈴木三郎',
                avatar: this.generateSVGAvatar('鈴木三郎', 40),
                status: 'offline',
                lastMessage: 'お役に立てて良かったです。',
                lastMessageTime: '15:30',
                unreadCount: 0
            },
            4: {
                id: 4,
                name: '田中一郎',
                avatar: this.generateSVGAvatar('田中一郎', 40),
                status: 'online',
                lastMessage: '順調に進んでいます。来週には完成予定です。',
                lastMessageTime: '昨日',
                unreadCount: 0
            }
        };

        Object.values(localConversations).forEach(conv => {
            this.conversations.set(conv.id, conv);
        });
    }

    // メッセージの送信（常にローカル）
    async sendMessage(conversationId, content, type = 'text') {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        const receiverId = this.getOtherParticipantId(conversationId);

        const messageData = {
            conversationId: conversationId,
            senderId: this.currentUserId,
            receiverId: receiverId,
            content: content,
            type: type
        };

        // 常にlocalStorageに保存
        const result = await this.supabaseService.saveMessage(messageData);
        
        if (result.success) {
            // UI更新用のメッセージオブジェクト
            const uiMessage = {
                id: result.data.id,
                type: 'sent',
                content: content,
                time: this.formatMessageTime(result.data.created_at),
                timestamp: result.data.created_at
            };

            // 会話の最新メッセージを更新
            conversation.lastMessage = content;
            conversation.lastMessageTime = uiMessage.time;

            return { success: true, message: uiMessage, fallback: true };
        } else {
            throw new Error(result.error);
        }
    }

    // 会話のメッセージを取得（常にローカル）
    async getConversationMessages(conversationId) {
        return this.getLocalMessages(conversationId);
    }

    // ローカルメッセージの取得
    getLocalMessages(conversationId) {
        const localMessages = {
            1: [
                { id: 1, type: 'received', content: 'こんにちは田中さん。新規事業の件でご相談があります。', time: '14:30', avatar: this.generateSVGAvatar('佐藤次郎', 30) },
                { id: 2, type: 'received', content: 'お時間があるときにお電話でお話しできればと思います。よろしくお願いします。', time: '14:32', avatar: this.generateSVGAvatar('佐藤次郎', 30) },
                { id: 3, type: 'sent', content: '佐藤さん、お疲れ様です。明日の午後でしたらお時間作れます。', time: '14:45' },
                { id: 4, type: 'received', content: 'ありがとうございます！明日14時頃はいかがでしょうか？', time: '15:20', avatar: this.generateSVGAvatar('佐藤次郎', 30) },
                { id: 5, type: 'sent', content: '14時で大丈夫です。よろしくお願いします。', time: '15:25' }
            ],
            2: [
                { id: 6, type: 'received', content: '来週のイベントについてですが、会場の変更があります。', time: '13:00', avatar: this.generateSVGAvatar('山田花子', 30) },
                { id: 7, type: 'received', content: '詳細は後ほどメールでお送りします。', time: '13:02', avatar: this.generateSVGAvatar('山田花子', 30) }
            ],
            3: [
                { id: 8, type: 'received', content: '資料をお送りいただき、ありがとうございました。', time: '15:00', avatar: this.generateSVGAvatar('鈴木三郎', 30) },
                { id: 9, type: 'sent', content: 'お役に立てて良かったです。', time: '15:30' }
            ],
            4: [
                { id: 10, type: 'received', content: 'プロジェクトの進捗はいかがでしょうか？', time: '昨日', avatar: this.generateSVGAvatar('田中一郎', 30) },
                { id: 11, type: 'sent', content: '順調に進んでいます。来週には完成予定です。', time: '昨日' }
            ]
        };

        return localMessages[conversationId] || [];
    }

    async markAsRead(messageId) {
        // ダミー実装
        return { success: true };
    }

    subscribeToConversation(conversationId, callback) {
        console.warn('Real-time subscriptions not available in fallback mode');
        return null;
    }

    unsubscribeFromConversation(conversationId) {
        // ダミー実装
    }

    unsubscribeAll() {
        // ダミー実装
    }

    getConversation(conversationId) {
        return this.conversations.get(conversationId);
    }

    getAllConversations() {
        return Array.from(this.conversations.values());
    }

    getOtherParticipantId(conversationId) {
        const participantMap = {
            1: 'user-sato',
            2: 'user-yamada',
            3: 'user-suzuki',
            4: 'user-tanaka'
        };
        return participantMap[conversationId] || 'unknown-user';
    }

    generateSVGAvatar(name, size = 40) {
        let firstChar = name.charAt(0) || 'U';
        if (firstChar.charCodeAt(0) > 127) {
            firstChar = 'U';
        } else {
            firstChar = firstChar.toUpperCase();
        }
        
        const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad-${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1e5ba8;stop-opacity:1" /><stop offset="100%" style="stop-color:#4a90e2;stop-opacity:1" /></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#grad-${Date.now()})"/><text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="${size/2.5}" font-weight="600">${firstChar}</text></svg>`;
        
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
    }

    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('ja-JP', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (diffDays === 1) {
            return '昨日';
        } else if (diffDays < 7) {
            return `${diffDays}日前`;
        } else {
            return date.toLocaleDateString('ja-JP', { 
                month: 'numeric', 
                day: 'numeric' 
            });
        }
    }
}

// グローバルインスタンス
const messageService = new MessageService();

// グローバルアクセス用
window.messageService = messageService;