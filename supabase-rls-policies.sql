
-- INTERCONNECT RLS（Row Level Security）ポリシー設定
-- カラム構造に合わせた完全な互換性ありのバージョン

-- RLSを有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ========================================
-- user_profiles ポリシー
-- ========================================
CREATE POLICY "Public profiles are viewable by everyone"
    ON user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ========================================
-- user_settings ポリシー
-- ========================================
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- login_history ポリシー
-- ========================================
CREATE POLICY "Users can view own login history"
    ON login_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert login history"
    ON login_history FOR INSERT
    WITH CHECK (true);

-- ========================================
-- conversations ポリシー
-- ========================================
CREATE POLICY "Participants can view conversations"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversations.id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ========================================
-- messages ポリシー
-- ========================================
CREATE POLICY "Participants can view messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Participants can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Senders can update own messages"
    ON messages FOR UPDATE
    USING (auth.uid() = sender_id);

-- ========================================
-- notifications ポリシー
-- ========================================
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ========================================
-- events ポリシー
-- ========================================
CREATE POLICY "Participants can view events"
    ON events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM event_participants ep
            WHERE ep.event_id = events.id
            AND ep.user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can update events"
    ON events FOR UPDATE
    USING (auth.uid() = organizer_id);

-- ========================================
-- business_opportunities ポリシー
-- ========================================
-- 制限をかけないポリシー（仮設定）
CREATE POLICY "Allow read access to all opportunities"
    ON business_opportunities FOR SELECT
    USING (true);

-- ========================================
-- documents ポリシー
-- ========================================
-- アップロード者のみアクセス許可（シンプルな制限）
CREATE POLICY "Users can view own documents"
    ON documents FOR SELECT
    USING (uploaded_by = auth.uid());
