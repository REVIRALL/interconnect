-- 修正版：列名エラーを解決したテーブル作成
-- 既存のテーブルと重複しないよう、存在確認してから作成

-- 1. user_profilesテーブル（修正版）
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
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
    member_type VARCHAR(20) DEFAULT 'basic',
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. eventsテーブル
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
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
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. business_matchesテーブル
CREATE TABLE IF NOT EXISTS business_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    target_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    match_type VARCHAR(50) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. invitationsテーブル
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    invited_email VARCHAR(255) NOT NULL,
    invited_name VARCHAR(100),
    invitation_code VARCHAR(50) UNIQUE NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- 5. 基本的なインデックス作成
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_member_type ON user_profiles(member_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_business_matches_requester ON business_matches(requester_id);
CREATE INDEX IF NOT EXISTS idx_business_matches_target ON business_matches(target_id);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(invited_email);

-- 6. Row Level Security有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- 7. シンプルなRLSポリシー
CREATE POLICY "Allow all access to user_profiles" ON user_profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to events" ON events FOR ALL USING (true);
CREATE POLICY "Allow all access to business_matches" ON business_matches FOR ALL USING (true);
CREATE POLICY "Allow all access to invitations" ON invitations FOR ALL USING (true);

-- 8. テストデータ（修正版）
INSERT INTO user_profiles (email, password_hash, full_name, company, position, industry, bio, member_type, points) VALUES
('admin@interconnect.jp', 'temp_hash_admin', 'システム管理者', 'INTERCONNECT', 'システム管理者', 'IT・テクノロジー', 'INTERCONNECTの運営を行っています。', 'executive', 2000),
('demo1@interconnect.jp', 'temp_hash_demo1', '田中太郎', '株式会社テックイノベーション', 'CEO', 'IT・テクノロジー', '革新的なテクノロジーソリューションを提供しています。', 'executive', 1500),
('demo2@interconnect.jp', 'temp_hash_demo2', '佐藤花子', '佐藤コンサルティング', '代表取締役', 'コンサルティング', '企業の成長戦略をサポートしています。', 'premium', 800),
('demo3@interconnect.jp', 'temp_hash_demo3', '山田次郎', '山田製作所', '取締役', '製造業', '高品質な製品作りに取り組んでいます。', 'basic', 300)
ON CONFLICT (email) DO NOTHING;

-- 9. サンプルイベント
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM user_profiles WHERE email = 'admin@interconnect.jp';
    
    IF admin_id IS NOT NULL THEN
        INSERT INTO events (title, description, event_type, start_date, end_date, location, max_participants, organizer_id) VALUES
        ('経営戦略セミナー', 'DX時代の経営戦略について学びます', 'seminar', 
         NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week' + INTERVAL '2 hours', 
         '東京都港区', 50, admin_id),
        ('定例交流会', '月次の経営者交流会です', 'networking', 
         NOW() + INTERVAL '2 weeks', NOW() + INTERVAL '2 weeks' + INTERVAL '3 hours', 
         '東京都渋谷区', 30, admin_id),
        ('ビジネスピッチ会', '新規事業のピッチ会です', 'workshop', 
         NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '2 hours', 
         'オンライン', 100, admin_id);
    END IF;
END $$;

-- 10. サンプル招待コード
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM user_profiles WHERE email = 'admin@interconnect.jp';
    
    IF admin_id IS NOT NULL THEN
        INSERT INTO invitations (inviter_id, invited_email, invited_name, invitation_code, message) VALUES
        (admin_id, 'test1@example.com', '招待テスト1', 'INVITE001', 'INTERCONNECTにご参加ください'),
        (admin_id, 'test2@example.com', '招待テスト2', 'INVITE002', 'ビジネスネットワークを広げましょう');
    END IF;
END $$;

-- 11. 統計情報の更新
ANALYZE user_profiles;
ANALYZE events;
ANALYZE business_matches;
ANALYZE invitations;

SELECT 'INTERCONNECTの基本テーブル作成完了！' as status;
SELECT '作成されたテーブル:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_profiles', 'events', 'business_matches', 'invitations');