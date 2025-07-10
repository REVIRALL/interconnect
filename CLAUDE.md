# Claude Code プロジェクト設定

このプロジェクトでは、Claude Codeを使用して自動デプロイを行います。

## コーディング規約

- TypeScript/JavaScriptを使用
- ESLintとPrettierに従う
- 関数は単一責任の原則に従う
- エラーハンドリングを適切に行う
- 環境変数は.envファイルで管理

## デプロイ設定

### 自動デプロイの条件
- mainブランチへのpush時
- PRでの@claudeメンション時
- issueコメントでの@claudeメンション時

### デプロイ前チェック
- すべてのテストが通過すること
- ビルドが成功すること
- ESLintエラーがないこと

## Claude使用方法

### Issue対応
```
@claude このissueを解決してください
```

### PR作成
```
@claude この機能を実装してください
```

### バグ修正
```
@claude このエラーを修正してください
```

## 環境変数

必要な環境変数:
- ANTHROPIC_API_KEY: Claude APIキー
- DEPLOY_TOKEN: デプロイ用トークン
- GITHUB_TOKEN: GitHub Actions用（自動設定）