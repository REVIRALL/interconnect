# INTERCONNECT 自動デプロイ設定ガイド

## 🚀 概要
このガイドでは、ローカル → GitHub → Netlifyの自動デプロイの設定方法を説明します。

## ✅ 完了した設定

### 1. GitHubリポジトリ設定
- リポジトリURL: https://github.com/REVIRALL/interconnect
- 認証設定完了（Personal Access Token使用）
- 自動プッシュ設定済み

### 2. ローカル自動同期
以下のスクリプトが作成されています：
- `/scripts/watch-and-sync.sh` - ファイル監視と自動同期
- `/scripts/setup-auto-sync.sh` - systemdサービス設定

## 📋 Netlify設定手順

### 1. Netlifyでサイトを作成
1. [Netlify](https://app.netlify.com)にログイン
2. 「Add new site」→「Import an existing project」
3. GitHubを選択し、`REVIRALL/interconnect`リポジトリを選択
4. デプロイ設定：
   - Build command: （空欄）
   - Publish directory: `.`
5. 「Deploy site」をクリック

### 2. 環境変数の設定
Site settings > Environment variables で以下を追加：
```
SUPABASE_URL=あなたのSupabaseプロジェクトURL
SUPABASE_ANON_KEY=あなたのSupabase匿名キー
```

### 3. デプロイフックの作成
1. Site settings > Build & deploy > Build hooks
2. 「Add build hook」をクリック
3. 名前: `github-push`
4. ブランチ: `main`
5. URLをコピー

### 4. GitHub Actionsの設定
GitHubリポジトリで：
1. Settings > Secrets and variables > Actions
2. 以下のシークレットを追加：
   - `NETLIFY_AUTH_TOKEN`: Netlifyのトークン
   - `NETLIFY_SITE_ID`: NetlifyのサイトID

## 🔧 自動同期の開始

### 方法1: systemdサービスとして実行（推奨）
```bash
cd /home/ooxmichaelxoo/INTERCONNECT_project
./scripts/setup-auto-sync.sh
```

### 方法2: 手動で実行
```bash
cd /home/ooxmichaelxoo/INTERCONNECT_project
./scripts/watch-and-sync.sh
```

## 📁 自動同期の仕組み

1. **Windowsフォルダの監視**
   - `C:\Users\ooxmi\Downloads\Ver.006【コード】INTERCONNECT`内の変更を検出

2. **自動コピー**
   - 変更をINTERCONNECT_projectディレクトリにコピー

3. **Git自動コミット・プッシュ**
   - 変更を自動的にコミット
   - GitHubへプッシュ

4. **Netlify自動デプロイ**
   - GitHubへのプッシュを検出
   - 自動的に本番環境へデプロイ

## 🔍 動作確認

### ログの確認
```bash
# 同期ログ
tail -f /home/ooxmichaelxoo/INTERCONNECT_project/logs/sync.log

# エラーログ
tail -f /home/ooxmichaelxoo/INTERCONNECT_project/logs/sync-error.log
```

### サービスステータス
```bash
sudo systemctl status interconnect-sync
```

### テスト手順
1. Windowsフォルダ内のHTMLファイルを編集
2. 数秒待つ
3. GitHubリポジトリで変更を確認
4. Netlifyで自動デプロイを確認

## ⚠️ 注意事項

- Windowsフォルダ内のファイルが「マスター」として扱われます
- プロジェクトディレクトリ内での直接編集は上書きされます
- 大量のファイル変更時は少し時間がかかる場合があります

## 🛠️ トラブルシューティング

### 同期が動作しない場合
```bash
# サービス再起動
sudo systemctl restart interconnect-sync

# 手動同期テスト
cd /home/ooxmichaelxoo/INTERCONNECT_project
git add . && git commit -m "Test" && git push
```

### Netlifyデプロイが失敗する場合
- netlify.tomlの設定を確認
- GitHubとの連携を再設定
- 環境変数が正しく設定されているか確認