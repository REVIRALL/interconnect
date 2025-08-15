#!/bin/bash

# メンバーページへのリンクをコネクションページに変更
# アイコンとテキストも更新

echo "サイドバーのリンクを更新中..."

# 主要なHTMLファイルのリストを作成
files=(
    "dashboard.html"
    "matching.html"
    "events.html"
    "messages.html"
    "notifications.html"
    "profile.html"
    "settings.html"
    "referral.html"
    "billing.html"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "更新中: $file"
        
        # メンバーリンクをコネクションリンクに変更（デスクトップサイドバー）
        sed -i 's|href="members\.html"|href="connections.html"|g' "$file"
        sed -i 's|<i class="fas fa-users"></i>|<i class="fas fa-link"></i>|g' "$file"
        sed -i 's|<span>メンバー</span>|<span>コネクション</span>|g' "$file"
        
        # モバイルナビゲーションも更新
        sed -i 's|href="members\.html" class="mobile-nav-link"|href="connections.html" class="mobile-nav-link"|g' "$file"
    fi
done

# connections.html自体も修正（メンバーという表記が残っていれば）
if [ -f "connections.html" ]; then
    echo "更新中: connections.html (self-reference)"
    sed -i 's|href="members\.html"|href="connections.html"|g' "connections.html"
fi

echo "✅ サイドバーのリンク更新完了"