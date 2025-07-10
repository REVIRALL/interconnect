# 🚀 INTERCONNECT 自動デプロイガイド

## 概要
このプロジェクトは、変更を自動的にGitHubにプッシュし、サーバーに反映する仕組みが設定されています。

## 使い方

### 1. クイックデプロイ（推奨）
最も簡単な方法です：
```bash
./quick-deploy.sh "変更内容の説明"
```

例：
```bash
./quick-deploy.sh "ホームページのデザインを更新"
```

### 2. 自動デプロイスクリプト
より詳細な制御が必要な場合：
```bash
./auto-deploy.sh
```

### 3. 手動でGit操作
従来通りの方法：
```bash
git add .
git commit -m "変更内容"
git push origin main
```

## 自動化された処理

1. **変更の検出** - 修正されたファイルを自動検出
2. **コミット** - タイムスタンプ付きで自動コミット
3. **プッシュ** - GitHubに自動プッシュ
4. **デプロイ** - サーバーへの自動反映

## 設定ファイル

`.auto-deploy-config`で以下を設定できます：
- デプロイ先（GitHub Pages、Netlify、Render等）
- 自動コミットの有効/無効
- テストの実行有無

## トラブルシューティング

### プッシュが失敗する場合
```bash
git config user.name "あなたの名前"
git config user.email "your-email@example.com"
```

### 権限エラーが出る場合
```bash
chmod +x auto-deploy.sh
chmod +x quick-deploy.sh
```

### GitHub Actionsのワークフローを追加する場合
GitHubのPersonal Access Tokenに`workflow`スコープを追加する必要があります。

## 今後の使い方

変更を加えた後、以下のコマンドを実行するだけです：
```bash
./quick-deploy.sh "今日の変更内容"
```

これで自動的に：
- ✅ GitHubにプッシュ
- ✅ サーバーに反映
- ✅ 変更履歴の記録

が完了します！