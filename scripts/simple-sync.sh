#!/bin/bash

# シンプルな自動同期スクリプト

WINDOWS_DIR="/mnt/c/Users/ooxmi/Downloads/Ver.006【コード】INTERCONNECT"
PROJECT_DIR="/home/ooxmichaelxoo/INTERCONNECT_project"

echo "🔄 自動同期を開始します..."

while true; do
    # Windowsフォルダからコピー
    echo "📋 ファイルをコピー中..."
    
    # プロジェクトディレクトリに移動
    cd "$PROJECT_DIR"
    
    # 既存ファイルを削除（.gitとscriptsは除外）
    find . -mindepth 1 -maxdepth 1 -not -name '.git' -not -name 'scripts' -not -name 'logs' -exec rm -rf {} \;
    
    # Windowsフォルダからコピー
    cp -r "$WINDOWS_DIR"/* . 2>/dev/null || true
    
    # 変更があるかチェック
    if [ -n "$(git status --porcelain)" ]; then
        echo "✅ 変更を検出しました"
        
        # コミットとプッシュ
        git add .
        git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
        
        echo "🚀 GitHubへプッシュ完了"
    else
        echo "ℹ️  変更なし"
    fi
    
    # 10秒待機
    echo "⏳ 10秒後に再チェックします..."
    sleep 10
done