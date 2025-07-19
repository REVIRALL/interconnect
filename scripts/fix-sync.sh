#!/bin/bash

echo "🔧 同期の問題を修正します..."

# Git同期を修正
cd /home/ooxmichaelxoo/INTERCONNECT_project
git pull origin main --rebase
git push origin main --force-with-lease

# Windowsフォルダから再度完全コピー
echo "📋 Windowsフォルダから完全コピー..."
rm -rf ./* 
cp -r "/mnt/c/Users/ooxmi/Downloads/Ver.006【コード】INTERCONNECT"/* .

# コミットとプッシュ
git add .
git commit -m "Fix: Complete sync from Windows folder"
git push origin main

echo "✅ 修正完了！"