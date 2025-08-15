-- ダミーユーザー名を修正するSQL
-- Supabase SQLエディタで実行してください

-- 「りゅう」ユーザーの名前を更新
UPDATE user_profiles 
SET 
    name = CASE 
        WHEN company IS NOT NULL THEN company || ' ユーザー'
        WHEN email LIKE 'line_%' THEN 'LINEユーザー'
        ELSE 'ユーザー'
    END,
    updated_at = NOW()
WHERE name = 'りゅう';

-- 「guest」ユーザーの名前を更新
UPDATE user_profiles 
SET 
    name = 'ゲストユーザー',
    updated_at = NOW()
WHERE name = 'guest';

-- テストユーザーの情報も充実させる（オプション）
UPDATE user_profiles
SET 
    company = COALESCE(company, 'サンプル株式会社'),
    position = COALESCE(position, '一般社員'),
    bio = COALESCE(bio, 'よろしくお願いします'),
    industry = COALESCE(industry, 'IT'),
    updated_at = NOW()
WHERE name IN ('りゅう', 'guest') OR email LIKE '%@interconnect.com';

-- 結果を確認
SELECT id, name, email, company, position 
FROM user_profiles 
WHERE email LIKE '%interconnect.com%'
ORDER BY created_at DESC;