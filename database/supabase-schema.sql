-- INTERCONNECT Supabase データベーススキーマ

-- ユーザー拡張情報（Supabase Authと連携）
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT,
  phone TEXT,
  industry TEXT,
  company_size TEXT,
  profile_image TEXT,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 招待リンク管理
CREATE TABLE invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, is_active) -- アクティブなコードは1つだけ
);

-- 招待履歴
CREATE TABLE invite_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL,
  status TEXT DEFAULT 'registered', -- registered, pending, expired
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ポイント管理
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  pending_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  current_rank TEXT DEFAULT 'bronze',
  rank_progress INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ポイント履歴
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- earned, spent, pending, cancelled
  amount INTEGER NOT NULL,
  description TEXT,
  reference_type TEXT, -- invite, event, exchange
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- イベント
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  host_id UUID REFERENCES auth.users(id),
  image_url TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- イベント参加者
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered', -- registered, attended, cancelled
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ビジネスマッチング案件
CREATE TABLE business_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  industry TEXT,
  budget TEXT,
  area TEXT,
  requirements TEXT[],
  tags TEXT[],
  status TEXT DEFAULT 'active',
  interest_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ビジネス案件への興味
CREATE TABLE business_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES business_opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(opportunity_id, user_id)
);

-- メッセージ/会話
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 会話参加者
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(conversation_id, user_id)
);

-- メッセージ
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text', -- text, image, file
  file_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- invite, message, event, points
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) ポリシー

-- ユーザープロファイル
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 招待リンク
ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invite links" ON invite_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invite links" ON invite_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 招待履歴
ALTER TABLE invite_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invite history" ON invite_history
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = invitee_id);

-- ポイント
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

-- メッセージ
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- リアルタイム購読の有効化
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE invite_history;

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_invite_links_user_id ON invite_links(user_id);
CREATE INDEX idx_invite_history_referrer_id ON invite_history(referrer_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_business_opportunities_user_id ON business_opportunities(user_id);
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);

-- 関数：招待コード生成
CREATE OR REPLACE FUNCTION generate_invite_code(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- ユーザーIDの一部を含むコード生成
    code := UPPER(SUBSTRING(user_id_param::TEXT, 1, 3)) || '-' || 
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 5));
    
    -- 重複チェック
    SELECT COUNT(*) INTO exists_count 
    FROM invite_links 
    WHERE invite_code = code;
    
    EXIT WHEN exists_count = 0;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- トリガー：招待成功時のポイント付与
CREATE OR REPLACE FUNCTION award_referral_points()
RETURNS TRIGGER AS $$
BEGIN
  -- 招待者にポイント付与
  INSERT INTO point_transactions (user_id, type, amount, description, reference_type, reference_id)
  VALUES (NEW.referrer_id, 'earned', 1000, '招待報酬', 'invite', NEW.id);
  
  -- ユーザーポイントを更新
  INSERT INTO user_points (user_id, total_points, available_points, lifetime_points)
  VALUES (NEW.referrer_id, 1000, 1000, 1000)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_points = user_points.total_points + 1000,
    available_points = user_points.available_points + 1000,
    lifetime_points = user_points.lifetime_points + 1000,
    updated_at = NOW();
  
  -- 通知を送信
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.referrer_id,
    'points',
    '招待報酬を獲得しました',
    '招待が完了し、1000ポイントを獲得しました',
    jsonb_build_object('points', 1000, 'invitee_id', NEW.invitee_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_award_referral_points
AFTER INSERT ON invite_history
FOR EACH ROW
WHEN (NEW.status = 'registered')
EXECUTE FUNCTION award_referral_points();