-- INTERCONNECT リアルタイム機能設定
-- 仕様に基づいてconversationsとmessagesテーブルのリアルタイム同期を有効化

-- ========================================
-- リアルタイム機能の有効化
-- ========================================

-- Supabase Dashboard経由での設定が推奨されますが、
-- SQLでの設定方法も記載します

-- 1. Realtimeパブリケーションの作成（存在しない場合）
CREATE PUBLICATION IF NOT EXISTS supabase_realtime;

-- 2. conversationsテーブルのリアルタイム有効化
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- 3. messagesテーブルのリアルタイム有効化
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 4. conversation_participantsテーブルのリアルタイム有効化
-- （参加者の追加/削除をリアルタイムで反映）
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- 5. notificationsテーブルのリアルタイム有効化
-- （新着通知をリアルタイムで受信）
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ========================================
-- リアルタイム用のヘルパー関数
-- ========================================

-- メッセージ送信時に参加者全員に通知を送る関数
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    participant_record RECORD;
BEGIN
    -- 会話の全参加者に通知を作成（送信者以外）
    FOR participant_record IN
        SELECT user_id FROM conversation_participants
        WHERE conversation_id = NEW.conversation_id
        AND user_id != NEW.sender_id
    LOOP
        INSERT INTO notifications (
            user_id,
            type,
            title,
            content,
            related_type,
            related_id,
            is_read
        ) VALUES (
            participant_record.user_id,
            'new_message',
            '新しいメッセージ',
            LEFT(NEW.content, 100), -- 最初の100文字
            'message',
            NEW.id,
            false
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- メッセージ送信時のトリガー
CREATE TRIGGER on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();

-- ========================================
-- パフォーマンス最適化
-- ========================================

-- リアルタイムクエリ用のインデックス
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
    ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
    ON notifications(user_id, created_at DESC)
    WHERE is_read = false;

-- ========================================
-- リアルタイム接続の設定例（JavaScript）
-- ========================================
COMMENT ON TABLE messages IS '
リアルタイム接続の実装例:

// Supabase Client
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// メッセージのリアルタイム購読
const channel = supabase
  .channel("messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      console.log("New message:", payload.new);
      // UIを更新
    }
  )
  .subscribe();

// 購読解除
channel.unsubscribe();
';

-- ========================================
-- テスト用データ作成関数
-- ========================================
CREATE OR REPLACE FUNCTION create_test_conversation(
    user1_id UUID,
    user2_id UUID,
    conversation_name TEXT DEFAULT 'Test Conversation'
)
RETURNS UUID AS $$
DECLARE
    new_conversation_id UUID;
BEGIN
    -- 会話を作成
    INSERT INTO conversations (name, type, created_by)
    VALUES (conversation_name, 'direct', user1_id)
    RETURNING id INTO new_conversation_id;
    
    -- 参加者を追加
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
        (new_conversation_id, user1_id),
        (new_conversation_id, user2_id);
    
    RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql;