#!/bin/bash

# Claude Code自動デプロイスクリプト

set -e

echo "🚀 Starting deployment process..."

# 環境変数チェック
if [ -z "$DEPLOY_TOKEN" ]; then
    echo "❌ Error: DEPLOY_TOKEN is not set"
    exit 1
fi

# ビルドプロセス
echo "📦 Building application..."
if [ -f "package.json" ]; then
    npm install
    npm run build
elif [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
elif [ -f "go.mod" ]; then
    go build -o app
else
    echo "⚠️  No recognized build configuration found"
fi

# テスト実行
echo "🧪 Running tests..."
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    npm test
elif [ -f "pytest.ini" ] || [ -f "tests/" ]; then
    pytest
elif [ -f "go.mod" ]; then
    go test ./...
fi

# デプロイ実行
echo "🎯 Deploying to GitHub Pages..."

# GitHub Pages用のディレクトリ準備
if [ -d "dist" ]; then
    DEPLOY_DIR="dist"
elif [ -d "build" ]; then
    DEPLOY_DIR="build"
elif [ -d "public" ]; then
    DEPLOY_DIR="public"
else
    DEPLOY_DIR="."
fi

echo "📁 Deploying from: $DEPLOY_DIR"

# GitHub Pagesにデプロイ
git config --global user.name "github-actions[bot]"
git config --global user.email "github-actions[bot]@users.noreply.github.com"

# gh-pagesブランチの準備
git checkout --orphan gh-pages
git rm -rf .
cp -r $DEPLOY_DIR/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push -f origin gh-pages

# mainブランチに戻る
git checkout main

echo "✅ Deployment completed successfully!"
echo "🌐 Your site will be available at: https://revirall.github.io/[repository-name]/"