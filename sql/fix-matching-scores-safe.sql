-- マッチングスコアを修正する安全なSQL
-- 存在するカラムのみを使用
-- Supabase SQLエディタで実行してください

-- ステップ1: 現在のカラムを確認（情報確認用）
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('skills', 'interests', 'business_challenges', 'industry', 'position', 'title', 'bio');

-- ステップ2: 存在するカラムのみ更新（安全版）

-- 2-1. あなたのプロフィールを更新
UPDATE user_profiles
SET 
    name = COALESCE(name, 'Michael'),
    company = COALESCE(company, 'INTERCONNECT株式会社'),
    bio = 'INTERCONNECTプラットフォームを通じて、ビジネスマッチングの新しい形を創造しています。技術とビジネスの両面から革新を推進。',
    updated_at = NOW()
WHERE email = 'ooxmichaelxoo@gmail.com';

-- 2-2. スキルカラムが存在する場合のみ更新
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_profiles' AND column_name = 'skills') THEN
        UPDATE user_profiles
        SET skills = ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript', 'ビジネス戦略', 'プロジェクト管理']
        WHERE email = 'ooxmichaelxoo@gmail.com';
    END IF;
END $$;

-- 2-3. LINEユーザーのデータを更新
UPDATE user_profiles
SET 
    name = CASE 
        WHEN name = 'りゅう' THEN '田中 太郎'
        WHEN name IS NULL OR name = '' THEN 'LINEユーザー'
        ELSE name
    END,
    company = COALESCE(company, 'テクノロジー株式会社'),
    bio = COALESCE(bio, '10年以上のエンジニアリング経験を活かし、技術とビジネスの橋渡しをしています。'),
    updated_at = NOW()
WHERE email LIKE 'line_%@interconnect.com';

-- 2-4. ゲストユーザーのデータを更新
UPDATE user_profiles
SET 
    name = CASE 
        WHEN name = 'guest' THEN '佐藤 花子'
        WHEN name IS NULL OR name = '' THEN 'ゲストユーザー'
        ELSE name
    END,
    company = COALESCE(company, 'デザインスタジオ'),
    bio = COALESCE(bio, 'ユーザー中心のデザインで、ビジネスの成長を支援します。'),
    updated_at = NOW()
WHERE email = 'guest@interconnect.com';

-- ステップ3: industryカラムが存在する場合のみ更新
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_profiles' AND column_name = 'industry') THEN
        UPDATE user_profiles SET industry = 'IT・テクノロジー' 
        WHERE email = 'ooxmichaelxoo@gmail.com';
        
        UPDATE user_profiles SET industry = 'IT・テクノロジー' 
        WHERE email LIKE 'line_%@interconnect.com';
        
        UPDATE user_profiles SET industry = 'デザイン・クリエイティブ' 
        WHERE email = 'guest@interconnect.com';
    END IF;
END $$;

-- ステップ4: positionまたはtitleカラムが存在する場合の更新
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_profiles' AND column_name = 'position') THEN
        UPDATE user_profiles SET position = '代表取締役' 
        WHERE email = 'ooxmichaelxoo@gmail.com';
        
        UPDATE user_profiles SET position = 'エンジニアリングマネージャー' 
        WHERE email LIKE 'line_%@interconnect.com';
        
        UPDATE user_profiles SET position = 'クリエイティブディレクター' 
        WHERE email = 'guest@interconnect.com';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_profiles' AND column_name = 'title') THEN
        UPDATE user_profiles SET title = '代表取締役' 
        WHERE email = 'ooxmichaelxoo@gmail.com';
        
        UPDATE user_profiles SET title = 'エンジニアリングマネージャー' 
        WHERE email LIKE 'line_%@interconnect.com';
        
        UPDATE user_profiles SET title = 'クリエイティブディレクター' 
        WHERE email = 'guest@interconnect.com';
    END IF;
END $$;

-- ステップ5: 追加の多様なテストユーザーを作成
INSERT INTO user_profiles (id, email, name, company, bio, created_at, updated_at)
VALUES 
(
    gen_random_uuid(),
    'yamada@test.interconnect.com',
    '山田 次郎',
    'ファイナンス株式会社',
    '20年以上の財務経験を持ち、スタートアップの成長を財務面から支援しています。',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'suzuki@test.interconnect.com',
    '鈴木 美咲',
    'マーケティングエージェンシー',
    'データドリブンなマーケティングで、確実な成果を提供します。',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'takahashi@test.interconnect.com',
    '高橋 健一',
    'ヘルスケアイノベーション',
    '医療とテクノロジーの融合で、新しい価値を創造します。',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'watanabe@test.interconnect.com',
    '渡辺 さくら',
    'エコソリューションズ',
    '持続可能な社会の実現に向けて、環境技術を推進しています。',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    company = EXCLUDED.company,
    bio = EXCLUDED.bio,
    updated_at = NOW();

-- ステップ6: 結果を確認
SELECT 
    id,
    name,
    email,
    company,
    bio,
    CASE 
        WHEN bio IS NOT NULL AND LENGTH(bio) > 50 THEN 'データあり（充実）'
        WHEN bio IS NOT NULL THEN 'データあり（基本）'
        ELSE 'データなし'
    END as data_status
FROM user_profiles
ORDER BY updated_at DESC
LIMIT 10;