# Zapier vs TL;DV API 比較ガイド

## 🔄 Zapierを使う場合

### メリット
- **設定が簡単**（コード不要）
- **TL;DVの有料APIキー不要**
- **他のアプリとも連携可能**

### デメリット
- **Zapierの料金がかかる**（月額$19.99〜）
- **処理速度が遅い**（5-15分の遅延）
- **カスタマイズに制限**
- **月間実行回数に制限**（無料プランは100回/月）

### Zapierでの実装方法

1. **Zapを作成**
   ```
   トリガー: TL;DV - New Recording
   ↓
   アクション1: Supabase - Create Row (transcripts)
   ↓
   アクション2: Webhooks - POST to Dify
   ↓
   アクション3: Supabase - Update Row (matching_scores)
   ```

2. **必要な設定**
   - ZapierアカウントでTL;DVを連携
   - Supabaseの接続情報
   - DifyのWebhook URL

## 🔑 TL;DV API直接利用の場合

### メリット
- **リアルタイム処理**
- **完全なカスタマイズ可能**
- **追加料金なし**（TL;DV Pro以上なら）
- **実行回数制限なし**

### デメリット
- **TL;DV有料プラン必須**
- **コーディングが必要**
- **エラー処理を自分で実装**

## 💡 どちらを選ぶべき？

### Zapierがおすすめの場合
- プログラミングができない/したくない
- 少量のトランスクリプト処理（月100件以下）
- 既にZapierの有料プランを使っている
- すぐに始めたい

### TL;DV APIがおすすめの場合
- 大量のトランスクリプト処理
- リアルタイム性が重要
- カスタマイズしたい
- 長期的にコストを抑えたい

## 🛠️ Zapier実装ガイド

### ステップ1: Zapを作成

1. **Zapierにログイン**
   ```
   https://zapier.com
   ```

2. **新しいZapを作成**
   - 「Create Zap」をクリック

### ステップ2: TL;DVトリガー設定

```yaml
Trigger App: TL;DV
Trigger Event: New Recording
Account: [TL;DVアカウントを連携]
```

### ステップ3: Supabaseアクション追加

```yaml
Action App: PostgreSQL (Supabase)
Action Event: New Row
Table: transcripts
Fields:
  user_id: {{TL;DV User ID}}
  meeting_id: {{TL;DV Meeting ID}}
  meeting_title: {{TL;DV Meeting Title}}
  raw_transcript: {{TL;DV Transcript}}
  meeting_date: {{TL;DV Meeting Date}}
```

### ステップ4: Dify連携

```yaml
Action App: Webhooks by Zapier
Action Event: POST
URL: https://api.dify.ai/v1/workflows/[WORKFLOW_ID]/run
Headers:
  Authorization: Bearer [DIFY_API_KEY]
  Content-Type: application/json
Data:
  transcript: {{TL;DV Transcript}}
  user_id: {{TL;DV User ID}}
```

## 📊 コスト比較

### Zapier利用の場合
```
Zapier Starter: $19.99/月（750タスク/月）
TL;DV Free: $0
合計: $19.99/月
```

### API直接利用の場合
```
TL;DV Pro: $20/月（API込み）
Zapier: $0
合計: $20/月
```

## 🔧 ハイブリッド実装案

最もコスパが良い方法：

1. **初期設定はZapierで**
   - テスト段階
   - 少量処理

2. **本番はAPIで**
   - 大量処理
   - パフォーマンス重視

## 📝 結論

**とりあえず始めるなら**: Zapier
**本格運用なら**: TL;DV API

どちらでも実装可能ですが、将来的な拡張性を考えるとAPIがおすすめです。