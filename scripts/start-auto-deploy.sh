#!/bin/bash

# INTERCONNECT 自動デプロイ開始スクリプト

echo "🚀 INTERCONNECT 自動デプロイシステムを開始します..."

# 必要なパッケージのインストール
if ! command -v inotifywait &> /dev/null; then
    echo "📦 必要なパッケージをインストールしています..."
    sudo apt-get update
    sudo apt-get install -y inotify-tools
fi

# ディレクトリとログの準備
mkdir -p /home/ooxmichaelxoo/INTERCONNECT_project/logs

# 自動同期サービスの設定と開始
echo "⚙️  自動同期サービスを設定しています..."
/home/ooxmichaelxoo/INTERCONNECT_project/scripts/setup-auto-sync.sh

echo ""
echo "✅ 自動デプロイシステムが開始されました！"
echo ""
echo "📋 動作確認方法："
echo "1. Windowsフォルダ内のファイルを編集"
echo "   C:\\Users\\ooxmi\\Downloads\\Ver.006【コード】INTERCONNECT"
echo ""
echo "2. 自動的に以下が実行されます："
echo "   - ローカルプロジェクトへのコピー"
echo "   - GitHubへの自動プッシュ"
echo "   - Netlifyでの自動デプロイ（設定済みの場合）"
echo ""
echo "📊 ログ確認："
echo "   tail -f /home/ooxmichaelxoo/INTERCONNECT_project/logs/sync.log"
echo ""
echo "🛑 停止方法："
echo "   sudo systemctl stop interconnect-sync"