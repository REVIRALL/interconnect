#!/bin/bash

echo "全ページの「メンバー」を「コネクション」に更新中..."

# members.htmlをconnections-old.htmlとしてバックアップ
if [ -f "members.html" ]; then
    cp members.html members-backup.html
    echo "members.htmlをバックアップしました"
fi

# 主要なHTMLファイルを更新
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
    "admin.html"
    "super-admin.html"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "更新中: $file"
        
        # サイドバーとモバイルナビのメンバーをコネクションに変更
        # ただし、総メンバー数やメンバー間などの文脈では変更しない
        
        # リンクテキストの変更（サイドバー）
        sed -i 's|<span>メンバー</span>|<span>コネクション</span>|g' "$file"
        
        # アイコンも確実に変更
        sed -i 's|class="fas fa-users"></i>\s*<span>コネクション|class="fas fa-link"></i>\n                            <span>コネクション|g' "$file"
    fi
done

# connections.html自体の修正
if [ -f "connections.html" ]; then
    echo "connections.html内の残りの表記を修正..."
    # もし残っている「メンバー」があれば「コネクション」に
    sed -i 's|<span>メンバー</span>|<span>コネクション</span>|g' "connections.html"
fi

echo "✅ 全ページの表記更新完了"