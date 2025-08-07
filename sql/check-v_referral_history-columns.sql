-- v_referral_historyビューのカラム確認
-- このビューにcreated_atカラムが存在しないことを確認

-- ビューの定義を確認
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'v_referral_history'
ORDER BY ordinal_position;

-- もし上記で結果が出ない場合、ビューが存在しない可能性があるので
-- 関連テーブルを確認
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('invitations', 'referral_history', 'v_referral_history')
ORDER BY table_name, ordinal_position;