-- INTERCONNECT Supabase 不足テーブルの追加
-- 設計仕様に基づいて不足しているテーブルを追加

-- 1. ユーザー設定テーブル
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- 通知設定
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    message_notifications BOOLEAN DEFAULT true,
    event_notifications BOOLEAN DEFAULT true,
    -- プライバシー設定
    profile_visibility VARCHAR(20) DEFAULT 'members' CHECK (profile_visibility IN ('public', 'members', 'connections', 'private')),
    show_online_status BOOLEAN DEFAULT true,
    allow_messages_from VARCHAR(20) DEFAULT 'connections' CHECK (allow_messages_from IN ('everyone', 'connections', 'nobody')),
    -- UI設定
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) DEFAULT 'ja',
    timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
    -- メタデータ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. ログイン履歴テーブル
CREATE TABLE IF NOT EXISTS login_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- デバイス情報
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    -- 位置情報（オプション）
    country VARCHAR(2),
    city VARCHAR(100),
    -- ログイン方法
    login_method VARCHAR(50) DEFAULT 'password' CHECK (login_method IN ('password', 'google', 'line', 'linkedin', 'magic_link')),
    -- セキュリティ
    success BOOLEAN DEFAULT true,
    failure_reason TEXT,
    suspicious_activity BOOLEAN DEFAULT false,
    -- インデックス用
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. messagesとchat_historyの統合（提案）
-- 現在の実装では役割が不明確なため、以下の改善を提案：
COMMENT ON TABLE messages IS 'リアルタイムチャットメッセージ - conversations内でのメッセージ';
COMMENT ON TABLE chat_history IS 'アーカイブされたメッセージまたは削除されたメッセージの履歴';

-- インデックスの作成
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_created_at ON login_history(created_at DESC);
CREATE INDEX idx_login_history_ip_address ON login_history(ip_address);

-- トリガー関数：updated_atの自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- user_settingsのupdated_atトリガー
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- デフォルト設定の自動作成トリガー
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- auth.usersに新規ユーザーが作成されたときの設定
-- 注意: Supabaseではauth.usersへの直接的なトリガーは制限されているため、
-- user_profilesが作成されたときに実行
CREATE TRIGGER create_user_settings_on_profile_create
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_user_settings();