-- connectionsテーブルにmessageカラムを追加
ALTER TABLE connections 
ADD COLUMN IF NOT EXISTS message TEXT;

-- 確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'connections' 
ORDER BY ordinal_position;