-- connectionsテーブルの更新
-- 拒否された時刻を記録するカラムを追加

-- rejected_atカラムを追加（存在しない場合）
ALTER TABLE connections 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- responded_atカラムを追加（承認/拒否した時刻）
ALTER TABLE connections 
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- statusの値に'cancelled'を追加
ALTER TABLE connections 
DROP CONSTRAINT IF EXISTS connections_status_check;

ALTER TABLE connections 
ADD CONSTRAINT connections_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'blocked'));

-- インデックスの追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_connections_status_user 
ON connections(status, user_id);

CREATE INDEX IF NOT EXISTS idx_connections_status_connected 
ON connections(status, connected_user_id);

-- RLSポリシーの更新（拒否されたコネクションも見られるように）
DROP POLICY IF EXISTS "Users can view their connections" ON connections;
CREATE POLICY "Users can view their connections"
    ON connections FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- 結果確認
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'connections'
ORDER BY ordinal_position;