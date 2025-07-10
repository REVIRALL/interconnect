# Render自動デプロイ設定ガイド

## 🚀 Renderでの自動デプロイを設定する手順

### 1. Renderアカウント作成・ログイン
1. [Render.com](https://render.com) にアクセス
2. GitHubアカウントでサインアップ/ログイン

### 2. 新しいWebサービス作成
1. Renderダッシュボードで「New +」→「Web Service」をクリック
2. GitHubリポジトリ「REVIRALL/interconnect」を選択
3. 設定を入力:

```
Name: interconnect
Environment: Static Site
Build Command: npm run build
Publish Directory: ./ 
```

### 3. 環境変数設定
Renderサービス設定で以下を追加:
```
NODE_ENV=production
```

### 4. GitHub Secrets設定
GitHubリポジトリの Settings → Secrets and variables → Actions で以下を追加:

#### RENDER_API_KEY
1. Render Dashboard → Account Settings → API Keys
2. 「Create API Key」でキー生成
3. GitHubに `RENDER_API_KEY` として追加

#### RENDER_SERVICE_ID  
1. Renderサービスページで URL を確認
2. `https://dashboard.render.com/web/srv-xxxxxxxxx` の `srv-xxxxxxxxx` 部分
3. GitHubに `RENDER_SERVICE_ID` として追加

### 5. 自動デプロイの動作
- **main/masterブランチ**にプッシュすると自動デプロイ
- **Pull Request**作成時にテスト実行
- **ビルド失敗**時は自動的にロールバック

### 6. デプロイURL
設定完了後、以下URLでアクセス可能:
- **メインURL**: `https://interconnect.onrender.com`
- **カスタムドメイン**: 設定可能

## 📋 必要ファイル一覧

### ✅ 作成済みファイル
- `render.yaml` - Render設定ファイル
- `package.json` - 更新済み（静的サイト対応）
- `.github/workflows/render-deploy.yml` - GitHub Actions設定

### 🔧 主要コマンド
```bash
# ローカル開発
npm run dev

# プレビュー
npm run preview  

# ビルド
npm run build

# テスト
npm run test
```

## 🎯 自動化される処理

### Push時
1. **依存関係インストール** (`npm ci`)
2. **テスト実行** (`npm run test`)
3. **ビルド実行** (`npm run build`)
4. **Renderデプロイ** (API経由)
5. **ヘルスチェック** (デプロイ確認)

### 特徴
- **ゼロダウンタイム**デプロイ
- **自動ロールバック** (失敗時)
- **キャッシュクリア** (各デプロイ時)
- **SSL証明書** 自動設定

## 🏆 完了後の確認

1. GitHubでリポジトリにプッシュ
2. Actions タブでワークフロー実行確認
3. Renderダッシュボードでデプロイ状況確認
4. `https://interconnect.onrender.com` でサイト確認

## ⚡ 高速化設定

### render.yaml の最適化
- **静的ファイルキャッシュ**: CSS/JS/画像ファイル
- **CDN配信**: 自動的にグローバル配信
- **Gzip圧縮**: 自動適用

これで完全自動デプロイシステムが完成です！🎉