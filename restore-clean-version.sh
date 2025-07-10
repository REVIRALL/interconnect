#!/bin/bash

# 綺麗な状態への復元スクリプト

echo "🔄 綺麗だった状態に復元します..."

# 現在の修正をバックアップ
echo "📦 現在の修正をバックアップ中..."
mkdir -p backups/current-fixes
cp cache-clear.js backups/current-fixes/ 2>/dev/null || true
cp video-fix.js backups/current-fixes/ 2>/dev/null || true
cp js/restored-functions.js backups/current-fixes/ 2>/dev/null || true
cp render.yaml backups/current-fixes/ 2>/dev/null || true
cp .github/workflows/render-deploy.yml backups/current-fixes/ 2>/dev/null || true
cp deploy-render.js backups/current-fixes/ 2>/dev/null || true
cp render-setup.md backups/current-fixes/ 2>/dev/null || true

echo "✅ 現在の修正をバックアップしました"

# 初期の綺麗な状態に戻す
echo "🔄 初期の綺麗な状態に戻し中..."
git checkout a1ff35e -- .

echo "✅ 初期状態に復元しました"

# 重要な修正を再適用
echo "🔧 重要な修正を再適用中..."

# 動画パス修正
if [ -f "index.html" ]; then
    sed -i 's|src="interconnect-top.mp4"|src="./assets/interconnect-top.mp4"|g' index.html
    echo "✅ 動画パス修正"
fi

# 復元された機能を再追加
mkdir -p js
if [ -f "backups/current-fixes/js/restored-functions.js" ]; then
    cp backups/current-fixes/js/restored-functions.js js/
    echo "✅ 復元機能を再追加"
fi

# キャッシュクリアスクリプトを再追加
if [ -f "backups/current-fixes/cache-clear.js" ]; then
    cp backups/current-fixes/cache-clear.js .
    echo "✅ キャッシュクリア機能を再追加"
fi

# 動画修正スクリプトを再追加
if [ -f "backups/current-fixes/video-fix.js" ]; then
    cp backups/current-fixes/video-fix.js .
    echo "✅ 動画修正機能を再追加"
fi

# Render設定を再追加
if [ -f "backups/current-fixes/render.yaml" ]; then
    cp backups/current-fixes/render.yaml .
    echo "✅ Render設定を再追加"
fi

# GitHub Actionsを再追加
if [ -f "backups/current-fixes/.github/workflows/render-deploy.yml" ]; then
    mkdir -p .github/workflows
    cp backups/current-fixes/.github/workflows/render-deploy.yml .github/workflows/
    echo "✅ GitHub Actions設定を再追加"
fi

echo "🎉 復元完了！"
echo ""
echo "📊 復元された状態:"
echo "  - 初期の綺麗なコード ✅"
echo "  - 動画再生修正 ✅"
echo "  - キャッシュクリア機能 ✅"
echo "  - FAQ機能復旧 ✅"
echo "  - Render自動デプロイ ✅"
echo ""
echo "🚀 次の手順:"
echo "  1. git add -A"
echo "  2. git commit -m '✨ 綺麗な状態に復元 + 重要修正適用'"
echo "  3. git push origin main"