-- テーブル構造を確認するSQL
-- Supabase SQLエディタで実行して、実際のカラム名を確認してください

-- user_profilesテーブルの構造を確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 実際のデータを1件確認
SELECT * FROM user_profiles LIMIT 1;