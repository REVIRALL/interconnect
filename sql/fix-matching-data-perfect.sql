-- マッチングページのデータを完璧に修正するSQL
-- 実際のテーブル構造に100%対応
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
-- 2. 他のユーザーに多様なデータを設定
-- ==========================================

-- LINEユーザーがいる場合の更新
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
WHERE email LIKE 'line_%@interconnect.com'
  AND email != 'ooxmichaelxoo@gmail.com'
LIMIT 1;

-- ゲストユーザーがいる場合の更新
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
-- 3. 新規テストユーザーを追加（多様性のため）
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
    '20年以上の財務経験を持ち、スタートアップの成長を財務面から支援しています。資金調達とIPO準備が専門。',
    ARRAY['財務分析', '資金調達', 'M&A', 'リスク管理', 'Excel', 'データビジュアライゼーション'],
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
    'データドリブンなマーケティングで、確実な成果を提供します。デジタルマーケティングとグロースハックが専門。',
    ARRAY['デジタルマーケティング', 'SEO/SEM', 'コンテンツマーケティング', 'SNS運用', 'Google Analytics'],
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
    '医療とテクノロジーの融合で、新しい価値を創造します。遠隔医療とAI診断支援システムの開発経験豊富。',
    ARRAY['医療IT', 'AI', '機械学習', 'プロダクトマネジメント', '規制対応'],
    '高橋 健一',
    true,
    1,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'watanabe@test.interconnect.com',
    '渡辺 さくら',
    'エコソリューションズ',
    'サステナビリティ責任者',
    '環境・エネルギー',
    '持続可能な社会の実現に向けて、環境技術を推進しています。カーボンニュートラルとサーキュラーエコノミーが専門。',
    ARRAY['環境マネジメント', 'ESG', 'カーボンニュートラル', 'プロジェクト管理'],
    '渡辺 さくら',
    true,
    1,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'ito@test.interconnect.com',
    '伊藤 大輔',
    'ロボティクス研究所',
    'CTO',
    '製造業',
    'ロボティクスとAIを活用した製造業のDXを推進。スマートファクトリーの実装経験多数。',
    ARRAY['ロボティクス', 'IoT', 'Python', 'C++', '制御システム', 'AI'],
    '伊藤 大輔',
    true,
    1,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'nakamura@test.interconnect.com',
    '中村 優子',
    'EdTechベンチャー',
    'プロダクトマネージャー',
    '教育',
    'テクノロジーを活用した新しい学習体験の創造。オンライン教育プラットフォームの企画・開発を担当。',
    ARRAY['EdTech', 'プロダクトマネジメント', 'UXデザイン', 'データ分析', 'アジャイル'],
    '中村 優子',
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
-- 4. 既存ユーザーのスキルを多様化
-- ==========================================

-- スキルが基本的なもののみのユーザーを更新
UPDATE user_profiles
SET 
    skills = CASE 
        WHEN industry = 'IT・通信' AND (skills IS NULL OR array_length(skills, 1) <= 2) 
            THEN ARRAY['プログラミング', 'システム設計', 'プロジェクト管理', 'ビジネス', 'コミュニケーション']
        WHEN industry = '金融・保険' AND (skills IS NULL OR array_length(skills, 1) <= 2)
            THEN ARRAY['財務分析', 'リスク管理', '投資戦略', 'ビジネス', 'コミュニケーション']
        WHEN industry = '医療・ヘルスケア' AND (skills IS NULL OR array_length(skills, 1) <= 2)
            THEN ARRAY['医療知識', 'データ分析', '研究開発', 'ビジネス', 'コミュニケーション']
        WHEN skills IS NULL OR array_length(skills, 1) = 0
            THEN ARRAY['ビジネス', 'コミュニケーション', 'プロジェクト管理']
        ELSE skills
    END,
    updated_at = NOW()
WHERE (skills IS NULL OR array_length(skills, 1) <= 2 OR skills = ARRAY['ビジネス', 'コミュニケーション'])
  AND email NOT IN ('ooxmichaelxoo@gmail.com');

-- ==========================================
-- 5. 名前の正規化（「りゅう」や「guest」を修正）
-- ==========================================
UPDATE user_profiles
SET 
    name = CASE 
        WHEN name = 'りゅう' THEN '竜崎 太郎'
        WHEN name = 'guest' THEN 'ゲストユーザー'
        WHEN name IS NULL OR name = '' THEN 
            CASE 
                WHEN email LIKE 'line_%' THEN 'LINEユーザー'
                ELSE 'ユーザー'
            END
        ELSE name
    END,
    full_name = CASE 
        WHEN name = 'りゅう' THEN '竜崎 太郎'
        WHEN name = 'guest' THEN 'ゲストユーザー'
        WHEN full_name IS NULL OR full_name = '' THEN name
        ELSE full_name
    END,
    updated_at = NOW()
WHERE name IN ('りゅう', 'guest') OR name IS NULL OR name = '';

-- ==========================================
-- 6. 結果を確認
-- ==========================================
SELECT 
    id,
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
        WHEN skills IS NOT NULL AND array_length(skills, 1) > 2 
             AND NOT (skills = ARRAY['ビジネス', 'コミュニケーション'])
        THEN '充実'
        WHEN skills IS NOT NULL AND array_length(skills, 1) > 0
        THEN '基本'
        ELSE 'なし'
    END as data_quality,
    LEFT(bio, 50) as bio_preview
FROM user_profiles
ORDER BY updated_at DESC
LIMIT 15;

-- ==========================================
-- 7. スキルの分布を確認
-- ==========================================
SELECT 
    'スキル分布' as check_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN skills IS NOT NULL AND array_length(skills, 1) > 2 THEN 1 END) as users_with_rich_skills,
    COUNT(CASE WHEN skills = ARRAY['ビジネス', 'コミュニケーション'] THEN 1 END) as users_with_basic_skills,
    COUNT(CASE WHEN skills IS NULL OR array_length(skills, 1) = 0 THEN 1 END) as users_without_skills
FROM user_profiles;