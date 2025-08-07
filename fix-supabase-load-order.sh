#!/bin/bash

# Supabaseの読み込み順序を修正するスクリプト

echo "Supabaseの読み込み順序を修正しています..."

# 対象ファイル一覧
files=(
    "events.html"
    "members.html"
    "messages.html"
    "notifications.html"
    "profile.html"
    "settings.html"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "修正中: $file"
        
        # バックアップを作成
        cp "$file" "${file}.bak"
        
        # 既存のsupabase-unified.jsの行を削除して、最初に追加
        # 1. <!-- Scripts -->の後に新しい読み込み順序を挿入
        sed -i '/<!-- Scripts -->/a\    <!-- Supabase統一初期化（最初に読み込む） -->\n    <script src="js/supabase-unified.js?v=1.0"></script>\n    <!-- Supabase参照修正 -->\n    <script src="js/supabase-wait-fix.js"></script>' "$file"
        
        # 2. 後ろにある重複したsupabase-unified.jsを削除
        sed -i '/<!-- Supabase統一初期化（最初に読み込む） -->/!{/supabase-unified.js/d;}' "$file"
        
        echo "完了: $file"
    fi
done

echo "すべてのファイルの修正が完了しました。"