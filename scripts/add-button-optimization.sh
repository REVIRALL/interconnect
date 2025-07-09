#!/bin/bash

# 全HTMLファイルにbutton-section-optimization.cssを追加するスクリプト

echo "Adding button-section-optimization.css to all HTML files..."

# HTMLファイルのリスト
html_files=(
    "index.html"
    "dashboard.html"
    "members.html"
    "events.html"
    "settings.html"
    "profile.html"
    "messages.html"
    "business.html"
    "invite.html"
    "admin.html"
    "login.html"
    "register.html"
    "forgot-password.html"
    "privacy.html"
    "terms.html"
    "company.html"
    "member-profile.html"
    "point-exchange.html"
)

# 各ファイルを処理
for file in "${html_files[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # button-section-optimization.cssが既に含まれているかチェック
        if grep -q "button-section-optimization.css" "$file"; then
            echo "  Already includes button-section-optimization.css"
        else
            # responsive-design-fix.cssの後に追加
            if grep -q "responsive-design-fix.css" "$file"; then
                sed -i '/<link rel="stylesheet" href="responsive-design-fix.css">/a\    <link rel="stylesheet" href="button-section-optimization.css">' "$file"
                echo "  Added button-section-optimization.css after responsive-design-fix.css"
            # unified-colors.cssの後に追加（代替）
            elif grep -q "unified-colors.css" "$file"; then
                sed -i '/<link rel="stylesheet" href="unified-colors.css">/a\    <link rel="stylesheet" href="button-section-optimization.css">' "$file"
                echo "  Added button-section-optimization.css after unified-colors.css"
            # styles.cssの後に追加（最終手段）
            elif grep -q "styles.css" "$file"; then
                sed -i '/<link rel="stylesheet" href="styles.css">/a\    <link rel="stylesheet" href="button-section-optimization.css">' "$file"
                echo "  Added button-section-optimization.css after styles.css"
            else
                echo "  WARNING: Could not find a suitable location to add the CSS"
            fi
        fi
    else
        echo "File not found: $file"
    fi
done

echo "Done!"