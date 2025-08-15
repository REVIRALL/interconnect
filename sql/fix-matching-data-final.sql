-- マッチングページのデータ修正（認証システム対応版）
-- Supabase SQLエディタで実行してください

-- ==========================================
-- 1. 既存ユーザーのデータを充実させる（INSERTはしない）
-- ==========================================

-- あなたのプロフィールを更新
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
-- 2. 他の既存ユーザーのデータを多様化
-- ==========================================

-- 2番目のユーザーを更新（存在する場合）
WITH second_user AS (
    SELECT id FROM user_profiles 
    WHERE email != 'ooxmichaelxoo@gmail.com'
    ORDER BY created_at
    LIMIT 1
)
UPDATE user_profiles
SET 
    name = CASE 
        WHEN name = 'りゅう' THEN '田中 太郎'
        WHEN name = 'guest' THEN '佐藤 花子'
        WHEN name = 'テストユーザー' THEN '田中 太郎'
        ELSE COALESCE(name, '田中 太郎')
    END,
    company = COALESCE(company, 'テクノロジー株式会社'),
    position = COALESCE(position, 'エンジニアリングマネージャー'),
    industry = 'IT・通信',
    bio = '10年以上のエンジニアリング経験を活かし、技術とビジネスの橋渡しをしています。',
    skills = ARRAY['Python', 'AWS', 'Docker', 'Kubernetes', 'チーム管理'],
    full_name = COALESCE(full_name, '田中 太郎'),
    updated_at = NOW()
WHERE id IN (SELECT id FROM second_user);

-- 3番目のユーザーを更新（存在する場合）
WITH third_user AS (
    SELECT id FROM user_profiles 
    WHERE email != 'ooxmichaelxoo@gmail.com'
    ORDER BY created_at
    LIMIT 1 OFFSET 1
)
UPDATE user_profiles
SET 
    name = COALESCE(NULLIF(name, 'guest'), NULLIF(name, 'りゅう'), '佐藤 花子'),
    company = COALESCE(company, 'デザインスタジオ'),
    position = COALESCE(position, 'クリエイティブディレクター'),
    industry = 'デザイン・クリエイティブ',
    bio = 'ユーザー中心のデザインで、ビジネスの成長を支援します。',
    skills = ARRAY['UI/UX', 'Figma', 'Adobe Creative Suite', 'ブランディング'],
    full_name = COALESCE(full_name, '佐藤 花子'),
    updated_at = NOW()
WHERE id IN (SELECT id FROM third_user);

-- 4番目のユーザーを更新（存在する場合）
WITH fourth_user AS (
    SELECT id FROM user_profiles 
    WHERE email != 'ooxmichaelxoo@gmail.com'
    ORDER BY created_at
    LIMIT 1 OFFSET 2
)
UPDATE user_profiles
SET 
    name = COALESCE(NULLIF(name, 'guest'), NULLIF(name, 'りゅう'), '山田 次郎'),
    company = COALESCE(company, 'ファイナンス株式会社'),
    position = COALESCE(position, 'CFO'),
    industry = '金融・保険',
    bio = '財務戦略とスタートアップ支援の専門家です。',
    skills = ARRAY['財務分析', '資金調達', 'M&A', 'Excel'],
    full_name = COALESCE(full_name, '山田 次郎'),
    updated_at = NOW()
WHERE id IN (SELECT id FROM fourth_user);

-- 5番目のユーザーを更新（存在する場合）
WITH fifth_user AS (
    SELECT id FROM user_profiles 
    WHERE email != 'ooxmichaelxoo@gmail.com'
    ORDER BY created_at
    LIMIT 1 OFFSET 3
)
UPDATE user_profiles
SET 
    name = COALESCE(NULLIF(name, 'guest'), NULLIF(name, 'りゅう'), '鈴木 美咲'),
    company = COALESCE(company, 'マーケティングエージェンシー'),
    position = COALESCE(position, 'マーケティングディレクター'),
    industry = '広告・メディア',
    bio = 'データドリブンマーケティングの実践者です。',
    skills = ARRAY['デジタルマーケティング', 'SEO/SEM', 'SNS運用'],
    full_name = COALESCE(full_name, '鈴木 美咲'),
    updated_at = NOW()
WHERE id IN (SELECT id FROM fifth_user);

-- ==========================================
-- 3. 名前の正規化（「りゅう」「guest」問題を解決）
-- ==========================================
UPDATE user_profiles
SET 
    name = CASE 
        WHEN name = 'りゅう' THEN '竜崎 太郎'
        WHEN name = 'guest' THEN 'ゲストユーザー'
        WHEN name IS NULL OR name = '' THEN 'ユーザー'
        ELSE name
    END,
    full_name = CASE 
        WHEN full_name = 'りゅう' THEN '竜崎 太郎'
        WHEN full_name = 'guest' THEN 'ゲストユーザー'
        WHEN full_name IS NULL OR full_name = '' THEN name
        ELSE full_name
    END,
    updated_at = NOW()
WHERE name IN ('りゅう', 'guest') OR name IS NULL OR name = '';

-- ==========================================
-- 4. 基本スキルのみのユーザーを少し充実させる
-- ==========================================
UPDATE user_profiles
SET 
    skills = CASE 
        WHEN skills = ARRAY['ビジネス', 'コミュニケーション'] AND industry = 'IT・通信'
            THEN ARRAY['ビジネス', 'コミュニケーション', 'プログラミング', 'データ分析']
        WHEN skills = ARRAY['ビジネス', 'コミュニケーション'] AND industry = '金融・保険'
            THEN ARRAY['ビジネス', 'コミュニケーション', '財務知識', 'リスク管理']
        WHEN skills = ARRAY['ビジネス', 'コミュニケーション']
            THEN ARRAY['ビジネス', 'コミュニケーション', 'プロジェクト管理']
        ELSE skills
    END,
    updated_at = NOW()
WHERE skills = ARRAY['ビジネス', 'コミュニケーション'];

-- ==========================================
-- 5. 空のプロフィールに最低限のデータを設定
-- ==========================================
UPDATE user_profiles
SET 
    company = COALESCE(company, '未設定'),
    position = COALESCE(position, '未設定'),
    bio = COALESCE(NULLIF(bio, ''), 'よろしくお願いいたします。'),
    skills = CASE 
        WHEN skills IS NULL OR array_length(skills, 1) = 0 
        THEN ARRAY['ビジネス', 'コミュニケーション']
        ELSE skills
    END,
    updated_at = NOW()
WHERE company IS NULL OR position IS NULL OR bio IS NULL OR bio = '';

-- ==========================================
-- 6. 結果を確認
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
        WHEN skills IS NOT NULL AND array_length(skills, 1) >= 4 THEN '★★★ 充実'
        WHEN skills IS NOT NULL AND array_length(skills, 1) = 3 THEN '★★☆ 中級'
        WHEN skills IS NOT NULL AND array_length(skills, 1) = 2 THEN '★☆☆ 基本'
        ELSE '☆☆☆ なし'
    END as data_quality,
    LEFT(bio, 30) || '...' as bio_preview
FROM user_profiles
ORDER BY 
    CASE WHEN email = 'ooxmichaelxoo@gmail.com' THEN 0 ELSE 1 END,
    updated_at DESC
LIMIT 10;

-- ==========================================
-- 7. データ分布の最終確認
-- ==========================================
SELECT 
    'データ分布' as check_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN array_length(skills, 1) >= 4 THEN 1 END) as "充実データ",
    COUNT(CASE WHEN array_length(skills, 1) = 3 THEN 1 END) as "中級データ",
    COUNT(CASE WHEN array_length(skills, 1) <= 2 THEN 1 END) as "基本データ"
FROM user_profiles;