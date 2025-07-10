# GitHub + Claude自動デプロイ設定ガイド

## 初回設定（1回だけ）

### 1. GitHubリポジトリの設定
```bash
# このファイルをGitHubにプッシュ
git add .github/workflows/claude-auto-deploy.yml
git add CLAUDE.md
git add deploy.sh
git commit -m "Add Claude auto-deploy workflow"
git push origin main
```

### 2. GitHub Secretsの設定
GitHubリポジトリページで:
1. Settings → Secrets and variables → Actions
2. New repository secret で追加:
   - `ANTHROPIC_API_KEY`: Claude APIキー
   - `DEPLOY_TOKEN`: デプロイ先のトークン（Vercel/Netlify等）

### 3. Claude GitHub Appのインストール（任意）
- https://github.com/apps/claude で必要に応じてインストール

## 設定後の動作

**Claude Codeの起動は不要です！**

以下は自動で動作します:

### 自動デプロイ
- mainブランチへのpush → 自動でデプロイ実行
- PRでの`@claude`メンション → Claudeが自動応答
- Issueでの`@claude fix this` → Claudeが修正PR作成

### 仕組み
- GitHub Actions（サーバー側）で実行
- あなたのPCの電源OFF時も動作
- 24時間365日稼働

## よくある質問

**Q: 毎回Claude Codeを起動する必要は？**
A: いいえ、一度設定すれば完全自動です。

**Q: ローカルでClaude Codeを使うには？**
A: 通常通り`claude`コマンドで使用可能。GitHub Actionsとは独立して動作します。

**Q: 料金は？**
A: GitHub Actions無料枠（月2000分）+ Claude API使用料のみ