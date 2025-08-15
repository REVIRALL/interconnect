-- マッチングページのテストデータを充実させるSQL
-- Supabase SQLエディタで実行してください

-- 1. 現在のユーザー（あなた）のデータを充実させる
UPDATE user_profiles
SET 
    company = COALESCE(company, 'INTERCONNECT株式会社'),
    position = COALESCE(position, '代表取締役'),
    industry = 'IT・テクノロジー',
    skills = ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript', 'ビジネス戦略', 'プロジェクト管理', 'UI/UX', 'データ分析'],
    interests = ARRAY['Web開発', 'AI', 'スタートアップ', 'イノベーション', 'DX推進'],
    business_challenges = ARRAY['スケール拡大', '人材採用', '技術革新'],
    bio = 'INTERCONNECTプラットフォームを通じて、ビジネスマッチングの新しい形を創造しています。',
    updated_at = NOW()
WHERE email = 'ooxmichaelxoo@gmail.com';

-- 2. LINEユーザーのデータを多様化
UPDATE user_profiles
SET 
    name = '田中 太郎',
    company = 'テクノロジー株式会社',
    position = 'エンジニアリングマネージャー',
    industry = 'IT・テクノロジー',
    skills = ARRAY['Python', 'AWS', 'Docker', 'Kubernetes', 'アーキテクチャ設計', 'チーム管理'],
    interests = ARRAY['クラウド', 'DevOps', 'マイクロサービス', 'セキュリティ'],
    business_challenges = ARRAY['技術負債解消', 'CI/CD改善', 'チーム生産性向上'],
    bio = '10年以上のエンジニアリング経験を活かし、技術とビジネスの橋渡しをしています。',
    updated_at = NOW()
WHERE email LIKE 'line_u69dbde5ed63402471a32977ebfd298f4@interconnect.com';

-- 3. ゲストユーザーのデータを充実
UPDATE user_profiles
SET 
    name = '佐藤 花子',
    company = 'デザインスタジオ',
    position = 'クリエイティブディレクター',
    industry = 'デザイン・クリエイティブ',
    skills = ARRAY['UI/UX', 'Figma', 'Adobe Creative Suite', 'ブランディング', 'マーケティング'],
    interests = ARRAY['デザイン思考', 'ユーザー体験', 'ブランド戦略', 'サステナビリティ'],
    business_challenges = ARRAY['ブランド認知度向上', '新規顧客獲得', 'デジタルマーケティング'],
    bio = 'ユーザー中心のデザインで、ビジネスの成長を支援します。',
    updated_at = NOW()
WHERE email = 'guest@interconnect.com';

-- 4. 追加のテストユーザーを作成（もし必要なら）
INSERT INTO user_profiles (id, email, name, company, position, industry, skills, interests, business_challenges, bio, created_at, updated_at)
VALUES 
(
    gen_random_uuid(),
    'yamada@example.com',
    '山田 次郎',
    'ファイナンス株式会社',
    'CFO',
    '金融・フィンテック',
    ARRAY['財務分析', '資金調達', 'M&A', 'リスク管理', 'Excel', 'データビジュアライゼーション'],
    ARRAY['フィンテック', 'ブロックチェーン', '投資', 'スタートアップ支援'],
    ARRAY['資金調達', '財務体質改善', 'IPO準備'],
    '20年以上の財務経験を持ち、スタートアップの成長を財務面から支援しています。',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'suzuki@example.com',
    '鈴木 美咲',
    'マーケティングエージェンシー',
    'マーケティングディレクター',
    'マーケティング・広告',
    ARRAY['デジタルマーケティング', 'SEO/SEM', 'コンテンツマーケティング', 'SNS運用', 'Google Analytics'],
    ARRAY['グロースハック', 'D2C', 'インフルエンサーマーケティング', 'CRM'],
    ARRAY['新規顧客獲得', 'LTV向上', 'ブランド認知度向上'],
    'データドリブンなマーケティングで、確実な成果を提供します。',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    company = EXCLUDED.company,
    position = EXCLUDED.position,
    industry = EXCLUDED.industry,
    skills = EXCLUDED.skills,
    interests = EXCLUDED.interests,
    business_challenges = EXCLUDED.business_challenges,
    bio = EXCLUDED.bio,
    updated_at = NOW();

-- 5. 結果を確認
SELECT 
    id,
    name,
    email,
    company,
    position,
    industry,
    array_length(skills, 1) as skill_count,
    array_length(interests, 1) as interest_count,
    array_length(business_challenges, 1) as challenge_count
FROM user_profiles
ORDER BY created_at DESC;