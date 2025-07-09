#!/bin/bash
# INTERCONNECT自動コミット・プッシュスクリプト

cd "/mnt/c/Users/ooxmi/Downloads/【コード】INTERCONNECT"

# .envファイルから設定を読み込む
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 変更があるかチェック
if [[ -z $(git status -s) ]]; then
    echo "📝 変更はありません"
    exit 0
fi

# Gitユーザー設定（.envから読み込むか、デフォルト値を使用）
git config user.name "${GIT_USER_NAME:-REVIRALL}"
git config user.email "${GIT_USER_EMAIL:-revirall@example.com}"

# 変更内容を表示
echo "📋 変更内容:"
git status -s

# 変更を追加
git add -A

# 変更されたファイルの概要を取得
CHANGED_FILES=$(git diff --cached --name-only | head -5 | tr '\n' ', ' | sed 's/,$//')
FILE_COUNT=$(git diff --cached --name-only | wc -l)

if [ $FILE_COUNT -gt 5 ]; then
    CHANGED_FILES="${CHANGED_FILES} 他$((FILE_COUNT - 5))ファイル"
fi

# コミットメッセージを生成
COMMIT_MSG="🔄 自動更新: $(date '+%Y-%m-%d %H:%M:%S')

更新ファイル: ${CHANGED_FILES}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# コミット
git commit -m "$COMMIT_MSG"

echo "✅ コミット完了"

# プッシュ
if [ -n "$GITHUB_TOKEN" ]; then
    echo "🚀 GitHubへプッシュ中..."
    git push https://${GITHUB_TOKEN}@github.com/REVIRALL/interconnect.git main 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ プッシュ成功！"
    else
        echo "❌ プッシュ失敗"
        echo "手動でプッシュしてください: git push origin main"
    fi
else
    echo "⚠️  GITHUB_TOKENが設定されていません"
    echo "通常のプッシュを試みます..."
    git push origin main
fi