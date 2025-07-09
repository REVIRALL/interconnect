# GitHub自動プッシュ設定ガイド

## セットアップ手順

### 1. GitHub Personal Access Token (PAT) の作成

1. GitHubにログイン
2. 右上のプロフィールアイコン → **Settings**
3. 左メニュー最下部の **Developer settings**
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token** → **Generate new token (classic)**
6. 設定：
   - **Note**: INTERCONNECT Auto Push
   - **Expiration**: 90 days（お好みで）
   - **Select scopes**: ☑️ **repo** (Full control of private repositories)
7. **Generate token** をクリック
8. 表示されたトークンをコピー（一度しか表示されません！）

### 2. 環境変数の設定

#### 方法A: .envファイル（推奨）

1. `.env.example`をコピーして`.env`を作成：
```bash
cp .env.example .env
```

2. `.env`ファイルを編集：
```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GIT_USER_NAME=Your Name
GIT_USER_EMAIL=your-email@example.com
```

#### 方法B: Windows環境変数

1. Windowsキー + R → `sysdm.cpl` → 詳細設定 → 環境変数
2. ユーザー環境変数に追加：
   - 変数名: `GITHUB_TOKEN`
   - 変数値: あなたのトークン

### 3. Git認証ヘルパーの設定

コマンドプロンプトまたはGit Bashで実行：

```bash
# Credential Managerを使用（Windows推奨）
git config --global credential.helper manager-core

# または、一時的にメモリに保存（15分）
git config --global credential.helper cache
```

### 4. リモートURLの更新（オプション）

トークンを含むURLに変更する場合：

```bash
cd /mnt/c/Users/ooxmi/Downloads/【コード】INTERCONNECT
git remote set-url origin https://[YOUR_TOKEN]@github.com/REVIRALL/interconnect.git
```

## 自動プッシュスクリプト

`auto-commit.sh`または`auto-commit.bat`を作成：

### Bashスクリプト (auto-commit.sh)
```bash
#!/bin/bash
cd "/mnt/c/Users/ooxmi/Downloads/【コード】INTERCONNECT"

# .envファイルから設定を読み込む
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Gitユーザー設定
git config user.name "${GIT_USER_NAME:-REVIRALL}"
git config user.email "${GIT_USER_EMAIL:-your-email@example.com}"

# 変更を追加
git add -A

# コミット
git commit -m "🔄 自動更新: $(date '+%Y-%m-%d %H:%M:%S')

自動コミットによる更新

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# プッシュ
if [ -n "$GITHUB_TOKEN" ]; then
    git push https://${GITHUB_TOKEN}@github.com/REVIRALL/interconnect.git main
else
    git push origin main
fi
```

### Windowsバッチファイル (auto-commit.bat)
```batch
@echo off
cd /d "C:\Users\ooxmi\Downloads\【コード】INTERCONNECT"

:: 変更を追加
git add -A

:: コミット
git commit -m "🔄 自動更新: %date% %time%"

:: プッシュ
git push origin main
```

## セキュリティ注意事項

⚠️ **重要**:
- `.env`ファイルは絶対にGitにコミットしないでください
- `.gitignore`に`.env`が含まれていることを確認
- トークンは定期的に更新してください
- トークンが漏洩した場合は直ちに無効化してください

## トラブルシューティング

### エラー: "fatal: Authentication failed"
- トークンの有効期限を確認
- トークンのスコープ（repo権限）を確認
- トークンが正しくコピーされているか確認

### エラー: "error: failed to push some refs"
- `git pull origin main`でリモートの変更を取得
- コンフリクトがある場合は解決してから再プッシュ

## 使用方法

設定完了後、以下のコマンドで自動コミット・プッシュ：

```bash
# Bash
./auto-commit.sh

# Windows
auto-commit.bat
```

または、Claude Codeから直接実行することも可能です。