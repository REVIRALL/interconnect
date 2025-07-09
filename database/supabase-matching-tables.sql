-- ================================================
-- TL;DV マッチングシステム用テーブル
-- ================================================

-- トランスクリプトテーブル
CREATE TABLE IF NOT EXISTS transcripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    meeting_id TEXT NOT NULL,
    meeting_title TEXT,
    meeting_date TIMESTAMP,
    meeting_duration INTEGER, -- 分単位
    participants TEXT[],
    raw_transcript TEXT,
    summary TEXT,
    keywords TEXT[],
    topics TEXT[],
    language TEXT DEFAULT 'ja',
    platform TEXT, -- 'zoom', 'teams', 'meet' など
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX idx_transcripts_meeting_date ON transcripts(meeting_date);
CREATE INDEX idx_transcripts_keywords ON transcripts USING GIN(keywords);

-- ユーザー興味・関心テーブル
CREATE TABLE IF NOT EXISTS user_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    interest_category TEXT NOT NULL,
    interest_keywords TEXT[],
    strength DECIMAL(3,2) CHECK (strength >= 0 AND strength <= 1), -- 0.00 to 1.00
    source TEXT CHECK (source IN ('transcript', 'profile', 'manual', 'ai_analysis')),
    source_id UUID, -- 元データのID（transcript_idなど）
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, interest_category)
);

-- インデックス
CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_category ON user_interests(interest_category);

-- マッチングスコアテーブル
CREATE TABLE IF NOT EXISTS matching_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
    category_scores JSONB DEFAULT '{}', -- 各カテゴリ別スコア
    match_reasons TEXT[],
    strengths TEXT[], -- マッチングの強み
    opportunities TEXT[], -- 協業の可能性
    calculation_date TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
    CONSTRAINT unique_user_pair UNIQUE(user1_id, user2_id),
    CONSTRAINT different_users CHECK (user1_id != user2_id),
    CONSTRAINT ordered_users CHECK (user1_id < user2_id)
);

-- インデックス
CREATE INDEX idx_matching_scores_users ON matching_scores(user1_id, user2_id);
CREATE INDEX idx_matching_scores_total ON matching_scores(total_score DESC);
CREATE INDEX idx_matching_scores_active ON matching_scores(is_active) WHERE is_active = true;

-- マッチング推薦テーブル
CREATE TABLE IF NOT EXISTS matching_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    recommended_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    match_type TEXT DEFAULT 'synergy', -- 'synergy', 'complementary', 'similar'
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'contacted', 'connected', 'dismissed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    created_at TIMESTAMP DEFAULT NOW(),
    viewed_at TIMESTAMP,
    contacted_at TIMESTAMP,
    connected_at TIMESTAMP,
    dismissed_at TIMESTAMP,
    dismiss_reason TEXT,
    CONSTRAINT different_recommendation_users CHECK (user_id != recommended_user_id)
);

-- インデックス
CREATE INDEX idx_recommendations_user ON matching_recommendations(user_id);
CREATE INDEX idx_recommendations_status ON matching_recommendations(status);
CREATE INDEX idx_recommendations_score ON matching_recommendations(score DESC);

-- マッチング履歴テーブル
CREATE TABLE IF NOT EXISTS matching_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'viewed', 'contacted', 'connected'
    action_by UUID REFERENCES user_profiles(id),
    action_date TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    metadata JSONB DEFAULT '{}'
);

-- AI分析結果キャッシュテーブル
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_type TEXT NOT NULL, -- 'transcript', 'profile', 'matching'
    source_id UUID NOT NULL,
    analysis_type TEXT NOT NULL, -- 'keywords', 'topics', 'interests', 'matching'
    provider TEXT DEFAULT 'dify', -- 'dify', 'openai', etc.
    input_data JSONB,
    output_data JSONB,
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

-- インデックス
CREATE INDEX idx_ai_cache_source ON ai_analysis_cache(source_type, source_id);
CREATE INDEX idx_ai_cache_expires ON ai_analysis_cache(expires_at);

-- ================================================
-- ビューの作成
-- ================================================

-- アクティブなマッチング推薦ビュー
CREATE OR REPLACE VIEW active_recommendations AS
SELECT 
    mr.*,
    up1.name as user_name,
    up1.company as user_company,
    up2.name as recommended_name,
    up2.company as recommended_company,
    up2.position as recommended_position,
    up2.avatar_url as recommended_avatar,
    ms.total_score,
    ms.category_scores,
    ms.match_reasons
FROM matching_recommendations mr
JOIN user_profiles up1 ON mr.user_id = up1.id
JOIN user_profiles up2 ON mr.recommended_user_id = up2.id
LEFT JOIN matching_scores ms ON 
    ((ms.user1_id = mr.user_id AND ms.user2_id = mr.recommended_user_id) OR
     (ms.user1_id = mr.recommended_user_id AND ms.user2_id = mr.user_id))
WHERE mr.status IN ('pending', 'viewed')
AND ms.is_active = true;

-- ================================================
-- トリガー関数
-- ================================================

-- トランスクリプト更新時のタイムスタンプ更新
CREATE OR REPLACE FUNCTION update_transcript_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transcript_timestamp
BEFORE UPDATE ON transcripts
FOR EACH ROW
EXECUTE FUNCTION update_transcript_timestamp();

-- マッチング推薦のステータス更新時のタイムスタンプ記録
CREATE OR REPLACE FUNCTION update_recommendation_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        CASE NEW.status
            WHEN 'viewed' THEN
                NEW.viewed_at = NOW();
            WHEN 'contacted' THEN
                NEW.contacted_at = NOW();
            WHEN 'connected' THEN
                NEW.connected_at = NOW();
            WHEN 'dismissed' THEN
                NEW.dismissed_at = NOW();
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recommendation_status_timestamp
BEFORE UPDATE ON matching_recommendations
FOR EACH ROW
EXECUTE FUNCTION update_recommendation_status_timestamp();

-- ================================================
-- RLS (Row Level Security) ポリシー
-- ================================================

-- トランスクリプトのRLS
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transcripts" ON transcripts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transcripts" ON transcripts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transcripts" ON transcripts
    FOR UPDATE USING (auth.uid() = user_id);

-- マッチング推薦のRLS
ALTER TABLE matching_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations" ON matching_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations" ON matching_recommendations
    FOR INSERT WITH CHECK (true); -- システムのみが作成

CREATE POLICY "Users can update own recommendations" ON matching_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- 初期データ（テスト用）
-- ================================================

-- 興味カテゴリのマスターデータ
CREATE TABLE IF NOT EXISTS interest_categories (
    id SERIAL PRIMARY KEY,
    category_name TEXT UNIQUE NOT NULL,
    category_name_ja TEXT NOT NULL,
    description TEXT,
    parent_category TEXT,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO interest_categories (category_name, category_name_ja, description) VALUES
    ('technology', 'テクノロジー', 'IT、AI、ブロックチェーンなど'),
    ('marketing', 'マーケティング', 'デジタルマーケティング、ブランディングなど'),
    ('finance', 'ファイナンス', '投資、資金調達、財務戦略など'),
    ('sales', '営業・セールス', 'B2B営業、営業戦略など'),
    ('hr', '人事・組織', '採用、組織開発、人材育成など'),
    ('strategy', '経営戦略', 'ビジネスモデル、成長戦略など'),
    ('innovation', 'イノベーション', '新規事業、R&Dなど'),
    ('global', 'グローバル', '海外展開、国際ビジネスなど'),
    ('sustainability', 'サステナビリティ', 'SDGs、ESG、社会貢献など'),
    ('manufacturing', '製造業', '生産管理、品質管理など')
ON CONFLICT (category_name) DO NOTHING;