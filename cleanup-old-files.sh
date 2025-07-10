#!/bin/bash

# INTERCONNECT Project Cleanup Script
# This script removes old, redundant CSS and JS files after consolidation

echo "🧹 INTERCONNECT クリーンアップを開始します..."

# Create backup directory
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 バックアップディレクトリを作成: $BACKUP_DIR"

# List of CSS files to remove (keeping only the new consolidated ones)
OLD_CSS_FILES=(
    "styles.css"
    "loading.css"
    "dark-mode.css"
    "index-improvements.css"
    "text-layout-improvements.css"
    "unified-colors.css"
    "join-section-design.css"
    "digital-effects.css"
    "digital-effects-override.css"
    "index-final-fixes.css"
    "logo-blue-update.css"
    "logo-consistent.css"
    "remove-white-effects.css"
    "testimonial-clean.css"
    "accessibility-improvements.css"
    "auth.css"
    "dashboard-improvements.css"
    "event-history.css"
    "legal.css"
    "notification.css"
    "sidebar-perfect-colors.css"
)

# List of JavaScript files to remove (keeping only essential ones)
OLD_JS_FILES=(
    "preloader-killer.js"
    "cache-clear.js"
    "video-fix.js"
    "cache-killer-final.js"
    "cache-killer-permanent.js"
    "cache-killer-supreme.js"
    "dev-auth-bypass.js"
    "mobile-nav-guaranteed.js"
    "scroll-animations.js"
)

# Backup and remove old CSS files
echo "🎨 CSSファイルをクリーンアップ中..."
for file in "${OLD_CSS_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        rm "$file"
        echo "  ✅ 削除: $file"
    fi
done

# Backup and remove old JS files
echo "📜 JavaScriptファイルをクリーンアップ中..."
for file in "${OLD_JS_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        rm "$file"
        echo "  ✅ 削除: $file"
    fi
done

# Create a summary of what was cleaned up
echo "📊 クリーンアップ完了！"
echo ""
echo "新しいファイル構成:"
echo "  CSS:"
echo "    - css/interconnect-design-system.css (デザインシステム)"
echo "    - css/main.css (メインスタイル)"
echo ""
echo "  JavaScript:"
echo "    - js/app.js (統合されたアプリケーション)"
echo ""
echo "バックアップは $BACKUP_DIR に保存されました。"
echo ""
echo "次のステップ:"
echo "1. index-clean.html を確認してください"
echo "2. 問題がなければ、index.html を index-clean.html で置き換えてください"
echo "3. 他のHTMLファイルも同様に更新してください"

# Create a file list for reference
echo "# Cleaned up files - $(date)" > "$BACKUP_DIR/cleanup-log.txt"
echo "## CSS Files:" >> "$BACKUP_DIR/cleanup-log.txt"
printf '%s\n' "${OLD_CSS_FILES[@]}" >> "$BACKUP_DIR/cleanup-log.txt"
echo "" >> "$BACKUP_DIR/cleanup-log.txt"
echo "## JavaScript Files:" >> "$BACKUP_DIR/cleanup-log.txt"
printf '%s\n' "${OLD_JS_FILES[@]}" >> "$BACKUP_DIR/cleanup-log.txt"

echo ""
echo "✨ クリーンアップが完了しました！"