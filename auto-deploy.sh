#!/bin/bash

# INTERCONNECT 自動デプロイスクリプト
# このスクリプトは変更を自動的にGitHubにプッシュし、デプロイを実行します

echo "🚀 INTERCONNECT 自動デプロイを開始します..."

# 現在のディレクトリを保存
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Git設定の確認
if ! git config user.name > /dev/null; then
    git config user.name "INTERCONNECT Auto Deploy"
    git config user.email "deploy@interconnect.jp"
fi

# 変更をステージング
echo "📝 変更をステージング中..."
git add -A

# 変更があるかチェック
if git diff --staged --quiet; then
    echo "ℹ️  変更はありません。"
    exit 0
fi

# コミットメッセージを生成
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="自動更新: $TIMESTAMP

変更内容:
$(git diff --staged --name-status | head -20)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# コミット
echo "💾 変更をコミット中..."
git commit -m "$COMMIT_MSG"

# メインブランチ名を取得
MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')
if [ -z "$MAIN_BRANCH" ]; then
    MAIN_BRANCH="main"
fi

# 現在のブランチを取得
CURRENT_BRANCH=$(git branch --show-current)

# メインブランチにいない場合は切り替え
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]; then
    echo "🔄 $MAIN_BRANCH ブランチに切り替え中..."
    git checkout $MAIN_BRANCH
    git merge $CURRENT_BRANCH --no-edit
fi

# リモートの最新を取得
echo "📥 リモートの最新情報を取得中..."
git fetch origin

# マージ（競合がある場合は中止）
if ! git merge origin/$MAIN_BRANCH --no-edit; then
    echo "❌ マージ競合が発生しました。手動で解決してください。"
    exit 1
fi

# プッシュ
echo "📤 GitHubにプッシュ中..."
if ! git push origin $MAIN_BRANCH; then
    echo "❌ プッシュに失敗しました。認証情報を確認してください。"
    exit 1
fi

echo "✅ GitHubへのプッシュが完了しました！"

# デプロイトリガー
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "🔄 GitHub Actionsによるデプロイが開始されます..."
    echo "📊 進捗はこちらで確認できます: https://github.com/revirall0320/INTERCONNECT/actions"
fi

# Netlifyの場合
if [ -f "netlify.toml" ]; then
    echo "🔄 Netlifyによる自動デプロイが開始されます..."
fi

# Renderの場合
if [ -f "render.yaml" ]; then
    echo "🔄 Renderによる自動デプロイが開始されます..."
fi

echo "🎉 自動デプロイプロセスが完了しました！"
echo ""
echo "📝 次回から変更後に以下のコマンドを実行するだけで自動デプロイされます:"
echo "   ./auto-deploy.sh"
echo ""
echo "または、エイリアスを設定して簡単に実行:"
echo "   alias deploy='cd $(pwd) && ./auto-deploy.sh'"