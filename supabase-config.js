// Supabaseの設定とクライアントの初期化（ダミー実装）

class SupabaseService {
    constructor() {
        // ダミー設定
        this.supabaseUrl = 'dummy';
        this.supabaseKey = 'dummy';
        this.client = null;
        this.initialized = false;
        
        this.initializeClient();
    }

    // ダミーの初期化（常にフォールバックモード）
    async initializeClient() {
        console.log('Supabase running in fallback mode - using localStorage only');
        this.initialized = false; // 常にfalseでフォールバックを使用
    }

    // ダミーメソッド群 - 全てフォールバックを使用
    isReady() {
        return false;
    }

    async getCurrentUser() {
        return null;
    }

    async saveMessage(messageData) {
        return this.saveMessageToLocalStorage(messageData);
    }

    async getMessages(conversationId, limit = 50) {
        return this.getMessagesFromLocalStorage(conversationId);
    }

    async getConversations(userId) {
        return this.getConversationsFromLocalStorage();
    }

    async markAsRead(messageId, userId) {
        return this.markAsReadInLocalStorage(messageId, userId);
    }

    // フォールバック実装
    saveMessageToLocalStorage(messageData) {
        try {
            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            const newMessage = {
                id: Date.now(),
                ...messageData,
                created_at: new Date().toISOString(),
                is_read: false
            };
            messages.push(newMessage);
            localStorage.setItem('messages', JSON.stringify(messages));
            
            return { success: true, data: newMessage, fallback: true };
        } catch (error) {
            console.error('Failed to save message to localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    getMessagesFromLocalStorage(conversationId) {
        try {
            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            const conversationMessages = messages.filter(msg => 
                msg.conversationId === conversationId
            );
            
            return { success: true, messages: conversationMessages, fallback: true };
        } catch (error) {
            console.error('Failed to get messages from localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    getConversationsFromLocalStorage() {
        try {
            const conversations = JSON.parse(localStorage.getItem('conversations') || '{}');
            return { success: true, conversations: Object.values(conversations), fallback: true };
        } catch (error) {
            console.error('Failed to get conversations from localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    markAsReadInLocalStorage(messageId, userId) {
        try {
            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            const messageIndex = messages.findIndex(msg => msg.id === messageId);
            
            if (messageIndex !== -1) {
                messages[messageIndex].is_read = true;
                messages[messageIndex].read_at = new Date().toISOString();
                localStorage.setItem('messages', JSON.stringify(messages));
            }
            
            return { success: true, fallback: true };
        } catch (error) {
            console.error('Failed to mark message as read in localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    subscribeToMessages(conversationId, callback) {
        console.warn('Real-time subscriptions not available in fallback mode');
        return null;
    }

    unsubscribe(subscription) {
        // ダミー実装
    }
}

// グローバルインスタンス
const supabaseService = new SupabaseService();

// グローバルアクセス用
window.supabaseService = supabaseService;