#!/bin/bash

# クイックデプロイスクリプト
# 使い方: ./quick-deploy.sh "コミットメッセージ"

echo "🚀 クイックデプロイを開始します..."

# コミットメッセージを取得
if [ -z "$1" ]; then
    MESSAGE="クイック更新: $(date '+%Y-%m-%d %H:%M:%S')"
else
    MESSAGE="$1"
fi

# Git操作
git add -A
git commit -m "$MESSAGE

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main

echo "✅ デプロイが完了しました！"
echo "📊 進捗: https://github.com/revirall0320/INTERCONNECT/actions"