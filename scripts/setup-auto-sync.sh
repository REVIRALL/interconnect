#!/bin/bash

# INTERCONNECT 自動同期セットアップスクリプト

PROJECT_DIR="/home/ooxmichaelxoo/INTERCONNECT_project"
SERVICE_NAME="interconnect-sync"
USER=$(whoami)

echo "=== INTERCONNECT 自動同期セットアップ ==="

# systemdサービスファイル作成
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=INTERCONNECT Auto Sync Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=$PROJECT_DIR/scripts/watch-and-sync.sh
Restart=always
RestartSec=10
StandardOutput=append:$PROJECT_DIR/logs/sync.log
StandardError=append:$PROJECT_DIR/logs/sync-error.log

[Install]
WantedBy=multi-user.target
EOF

# サービスを有効化して開始
echo "サービスを設定しています..."
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}.service
sudo systemctl start ${SERVICE_NAME}.service

# ステータス確認
echo ""
echo "サービスステータス:"
sudo systemctl status ${SERVICE_NAME}.service --no-pager

echo ""
echo "=== セットアップ完了 ==="
echo ""
echo "使用方法:"
echo "  - サービス開始: sudo systemctl start ${SERVICE_NAME}"
echo "  - サービス停止: sudo systemctl stop ${SERVICE_NAME}"
echo "  - サービス再起動: sudo systemctl restart ${SERVICE_NAME}"
echo "  - ログ確認: tail -f $PROJECT_DIR/logs/sync.log"
echo ""
echo "Windowsフォルダ内のファイルを変更すると、自動的にGitHubへプッシュされます。"