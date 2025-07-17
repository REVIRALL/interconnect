#!/bin/bash

# INTERCONNECT プロジェクト自動同期スクリプト
# Windowsフォルダの変更を監視して自動的にGitHubへプッシュ

WINDOWS_DIR="/mnt/c/Users/ooxmi/Downloads/Ver.006【コード】INTERCONNECT"
PROJECT_DIR="/home/ooxmichaelxoo/INTERCONNECT_project"
LOG_FILE="$PROJECT_DIR/logs/sync.log"

# ログディレクトリ作成
mkdir -p "$PROJECT_DIR/logs"

# ログ関数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 初期化
log "=== 自動同期サービス開始 ==="

# inotify-toolsのインストール確認
if ! command -v inotifywait &> /dev/null; then
    log "inotify-toolsをインストールしています..."
    sudo apt-get update && sudo apt-get install -y inotify-tools
fi

# 同期関数
sync_files() {
    log "ファイル変更を検出しました。同期を開始します..."
    
    # Windowsフォルダからプロジェクトへコピー
    cd "$PROJECT_DIR"
    
    # 既存ファイルを削除（.gitディレクトリは除外）
    find . -mindepth 1 -not -path './.git*' -not -path './logs*' -not -path './scripts*' -delete
    
    # Windowsフォルダから新しいファイルをコピー
    cp -r "$WINDOWS_DIR"/* . 2>/dev/null || true
    
    # Gitの状態確認
    if [ -n "$(git status --porcelain)" ]; then
        log "変更をGitにコミットしています..."
        
        git add .
        git commit -m "$(cat <<EOF
Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')

Windowsフォルダからの自動同期
変更されたファイル: $(git status --porcelain | wc -l)個
EOF
)"
        
        # GitHubへプッシュ（リモートが設定されている場合）
        if git remote get-url origin &>/dev/null; then
            log "GitHubへプッシュしています..."
            git push origin main
            log "GitHubへのプッシュが完了しました"
        else
            log "警告: GitHubリモートが設定されていません"
        fi
    else
        log "変更はありませんでした"
    fi
    
    log "同期完了"
}

# 初回同期
sync_files

# ファイル監視ループ
log "Windowsフォルダの監視を開始します: $WINDOWS_DIR"

while true; do
    # Windowsフォルダの変更を監視
    inotifywait -r -e modify,create,delete,move "$WINDOWS_DIR" 2>/dev/null
    
    # 少し待機（連続した変更をまとめるため）
    sleep 2
    
    # 同期実行
    sync_files
done