-- INTERCONNECT用Supabaseデータベース設定
-- このSQLをSupabaseのSQL Editorで実行してください

-- 1. ユーザープロフィールテーブル
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    position VARCHAR(100),
    industry VARCHAR(50),
    bio TEXT,
    avatar_url TEXT,
    phone VARCHAR(20),
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    location VARCHAR(100),
    membership_type VARCHAR(20) DEFAULT 'basic', -- basic, premium, executive
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 会話テーブル
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255),
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 重複防止のための一意制約
    UNIQUE(user1_id, user2_id)
);

-- 3. メッセージテーブル
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, file
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. イベントテーブル
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- networking, seminar, workshop, meetup
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    is_online BOOLEAN DEFAULT FALSE,
    meeting_url TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    organizer_id UUID REFERENCES user_profiles(id),
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. イベント参加テーブル
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attendance_status VARCHAR(20) DEFAULT 'registered', -- registered, attended, no_show
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 重複防止
    UNIQUE(event_id, user_id)
);

-- 6. ビジネスマッチングテーブル
CREATE TABLE IF NOT EXISTS business_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    target_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    match_type VARCHAR(50) NOT NULL, -- partnership, investment, mentoring, collaboration
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 重複防止
    UNIQUE(requester_id, target_id, match_type)
);

-- 7. 招待テーブル
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    invited_email VARCHAR(255) NOT NULL,
    invited_name VARCHAR(100),
    invitation_code VARCHAR(50) UNIQUE NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, expired
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- 8. 通知テーブル
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- message, event, match, system
    related_id UUID, -- 関連するレコードのID
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- 9. Row Level Security (RLS) を有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 10. RLSポリシー設定

-- ユーザープロフィール: 自分のプロフィールは全権限、他人のは読み取りのみ
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 会話: 参加者のみアクセス可能
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (
        user1_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid()) OR 
        user2_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        user1_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid()) OR 
        user2_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

-- メッセージ: 会話参加者のみアクセス可能
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE user1_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid()) 
               OR user2_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (
        sender_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid()) OR
        receiver_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

-- イベント: 全ユーザー閲覧可能、作成者のみ編集可能
CREATE POLICY "Users can view all events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON events
    FOR INSERT WITH CHECK (
        organizer_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Organizers can update own events" ON events
    FOR UPDATE USING (
        organizer_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

-- イベント参加: 全ユーザー閲覧可能、自分の参加情報のみ編集可能
CREATE POLICY "Users can view event participants" ON event_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can register for events" ON event_participants
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own participation" ON event_participants
    FOR UPDATE USING (
        user_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

-- ビジネスマッチング: 関係者のみアクセス可能
CREATE POLICY "Users can view own matches" ON business_matches
    FOR SELECT USING (
        requester_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid()) OR
        target_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create match requests" ON business_matches
    FOR INSERT WITH CHECK (
        requester_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own matches" ON business_matches
    FOR UPDATE USING (
        requester_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid()) OR
        target_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

-- 招待: 招待者のみ閲覧・編集可能、招待コードでの登録は全ユーザー可能
CREATE POLICY "Users can view own invitations" ON invitations
    FOR SELECT USING (
        inviter_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create invitations" ON invitations
    FOR INSERT WITH CHECK (
        inviter_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

-- 通知: 自分の通知のみアクセス可能
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (
        user_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (
        user_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

-- 11. インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_business_matches_requester ON business_matches(requester_id);
CREATE INDEX IF NOT EXISTS idx_business_matches_target ON business_matches(target_id);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);

-- 12. トリガー関数：updated_atの自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atトリガーを各テーブルに適用
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_matches_updated_at BEFORE UPDATE ON business_matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. サンプルデータ（テスト用）
-- 注意: 本番環境では削除してください
INSERT INTO user_profiles (user_id, email, full_name, company, position, industry, bio, membership_type, points) VALUES
(gen_random_uuid(), 'demo1@interconnect.jp', '田中太郎', '株式会社テックイノベーション', 'CEO', 'IT・テクノロジー', '革新的なテクノロジーソリューションを提供しています。', 'executive', 1500),
(gen_random_uuid(), 'demo2@interconnect.jp', '佐藤花子', '佐藤コンサルティング', '代表取締役', 'コンサルティング', '企業の成長戦略をサポートしています。', 'premium', 800),
(gen_random_uuid(), 'demo3@interconnect.jp', '山田次郎', '山田製作所', '取締役', '製造業', '高品質な製品作りに取り組んでいます。', 'basic', 300)
ON CONFLICT (email) DO NOTHING;