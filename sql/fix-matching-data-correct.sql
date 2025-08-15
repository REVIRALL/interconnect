-- マッチングページのデータを正しく修正するSQL
-- PostgreSQL文法に完全準拠
-- Supabase SQLエディタで実行してください

-- ==========================================
-- 1. あなたのプロフィールを充実させる
-- ==========================================
UPDATE user_profiles
SET 
    name = 'Michael',
    company = 'INTERCONNECT株式会社',
    position = '代表取締役',
    industry = 'IT・通信',
    bio = 'INTERCONNECTプラットフォームを通じて、ビジネスマッチングの新しい形を創造しています。技術とビジネスの両面から革新を推進。',
    skills = ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'ビジネス戦略', 'プロジェクト管理', 'UI/UX', 'データ分析'],
    full_name = 'Michael Oox',
    updated_at = NOW()
WHERE email = 'ooxmichaelxoo@gmail.com';

-- ==========================================
-- 2. LINEユーザーを更新（最初の1件）
-- ==========================================
UPDATE user_profiles
SET 
    name = '田中 太郎',
    company = 'テクノロジー株式会社',
    position = 'エンジニアリングマネージャー',
    industry = 'IT・通信',
    bio = '10年以上のエンジニアリング経験を活かし、技術とビジネスの橋渡しをしています。クラウドアーキテクチャとチーム管理が専門。',
    skills = ARRAY['Python', 'AWS', 'Docker', 'Kubernetes', 'アーキテクチャ設計', 'チーム管理'],
    full_name = '田中 太郎',
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM user_profiles 
    WHERE email LIKE 'line_%@interconnect.com'
    AND email != 'ooxmichaelxoo@gmail.com'
    ORDER BY created_at
    LIMIT 1
);

-- ==========================================
-- 3. ゲストユーザーを更新
-- ==========================================
UPDATE user_profiles
SET 
    name = '佐藤 花子',
    company = 'デザインスタジオ',
    position = 'クリエイティブディレクター',
    industry = 'デザイン・クリエイティブ',
    bio = 'ユーザー中心のデザインで、ビジネスの成長を支援します。ブランディングとUXデザインを専門としています。',
    skills = ARRAY['UI/UX', 'Figma', 'Adobe Creative Suite', 'ブランディング', 'マーケティング'],
    full_name = '佐藤 花子',
    updated_at = NOW()
WHERE email = 'guest@interconnect.com';

-- ==========================================
-- 4. 新規テストユーザーを追加
-- ==========================================
INSERT INTO user_profiles (
    id, 
    email, 
    name, 
    company, 
    position, 
    industry, 
    bio, 
    skills,
    full_name,
    is_active,
    registration_step,
    created_at, 
    updated_at
)
VALUES 
(
    gen_random_uuid(),
    'yamada@test.interconnect.com',
    '山田 次郎',
    'ファイナンス株式会社',
    'CFO',
    '金融・保険',
    '20年以上の財務経験を持ち、スタートアップの成長を財務面から支援しています。',
    ARRAY['財務分析', '資金調達', 'M&A', 'リスク管理', 'Excel'],
    '山田 次郎',
    true,
    1,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'suzuki@test.interconnect.com',
    '鈴木 美咲',
    'マーケティングエージェンシー',
    'マーケティングディレクター',
    '広告・メディア',
    'データドリブンなマーケティングで、確実な成果を提供します。',
    ARRAY['デジタルマーケティング', 'SEO/SEM', 'SNS運用', 'Google Analytics'],
    '鈴木 美咲',
    true,
    1,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'takahashi@test.interconnect.com',
    '高橋 健一',
    'ヘルスケアイノベーション',
    '事業開発部長',
    '医療・ヘルスケア',
    '医療とテクノロジーの融合で、新しい価値を創造します。',
    ARRAY['医療IT', 'AI', '機械学習', 'プロダクトマネジメント'],
    '高橋 健一',
    true,
    1,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    company = EXCLUDED.company,
    position = EXCLUDED.position,
    industry = EXCLUDED.industry,
    bio = EXCLUDED.bio,
    skills = EXCLUDED.skills,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

-- ==========================================
-- 5. 「りゅう」と「guest」の名前を修正
-- ==========================================
UPDATE user_profiles
SET 
    name = CASE 
        WHEN name = 'りゅう' THEN '竜崎 太郎'
        WHEN name = 'guest' THEN 'ゲストユーザー'
        ELSE name
    END,
    full_name = CASE 
        WHEN name = 'りゅう' THEN '竜崎 太郎'
        WHEN name = 'guest' THEN 'ゲストユーザー'
        WHEN full_name IS NULL THEN name
        ELSE full_name
    END,
    updated_at = NOW()
WHERE name IN ('りゅう', 'guest');

-- ==========================================
-- 6. スキルが基本的なもののみのユーザーを更新
-- ==========================================
UPDATE user_profiles
SET 
    skills = CASE 
        WHEN skills IS NULL OR array_length(skills, 1) = 0 
            THEN ARRAY['ビジネス', 'コミュニケーション', 'プロジェクト管理']
        WHEN skills = ARRAY['ビジネス', 'コミュニケーション']
            THEN ARRAY['ビジネス', 'コミュニケーション', 'データ分析', 'マネジメント']
        ELSE skills
    END,
    updated_at = NOW()
WHERE (skills IS NULL OR array_length(skills, 1) <= 2)
  AND email NOT IN ('ooxmichaelxoo@gmail.com', 'guest@interconnect.com')
  AND email NOT LIKE '%@test.interconnect.com';

-- ==========================================
-- 7. 結果を確認
-- ==========================================
SELECT 
    name,
    email,
    company,
    position,
    industry,
    CASE 
        WHEN skills IS NOT NULL THEN array_length(skills, 1)
        ELSE 0
    END as skill_count,
    CASE 
        WHEN skills IS NOT NULL AND array_length(skills, 1) > 3 THEN '充実'
        WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 THEN '基本'
        ELSE 'なし'
    END as data_quality
FROM user_profiles
ORDER BY updated_at DESC;

-- ==========================================
-- 8. データ分布の確認
-- ==========================================
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN array_length(skills, 1) > 3 THEN 1 END) as rich_data_users,
    COUNT(CASE WHEN array_length(skills, 1) <= 2 THEN 1 END) as basic_data_users
FROM user_profiles;