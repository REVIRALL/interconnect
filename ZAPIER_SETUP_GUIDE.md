# 🚀 Zapierで始めるTL;DVマッチングシステム設定ガイド

## 📋 必要なもの
- Zapierアカウント（無料でOK、でも有料推奨）
- TL;DVアカウント
- Supabaseプロジェクト
- Difyアカウント

## 🔧 Zap作成手順

### ステップ1: Zapierにログイン
1. https://zapier.com にアクセス
2. ログイン（アカウントがなければ新規登録）

### ステップ2: 新しいZapを作成

```
Dashboard → Create Zap → 名前を付ける「TL;DV to INTERCONNECT」
```

## 📝 Zap 1: TL;DV → Supabase（トランスクリプト保存）

### 1️⃣ トリガー設定（TL;DV）

```yaml
App: TL;DV
Trigger Event: New Recording
```

**設定手順：**
1. 「Choose app」で「TL;DV」を検索
2. 「New Recording」を選択
3. 「Continue」をクリック
4. TL;DVアカウントを接続（初回のみ）
5. テスト録画を選択してテスト

### 2️⃣ アクション設定（Supabase）

```yaml
App: Supabase
Action Event: Create Row
```

**設定手順：**
1. 「Choose app」で「Supabase」を検索
2. 「Create Row」を選択
3. Supabaseアカウントを接続
   - URL: `https://あなたのプロジェクト.supabase.co`
   - API Key: `あなたのanon key`

**フィールドマッピング：**
```
Table: transcripts
Fields:
  meeting_id: {{TL;DV Meeting ID}}
  meeting_title: {{TL;DV Meeting Title}}
  raw_transcript: {{TL;DV Transcript Text}}
  summary: {{TL;DV Summary}}
  meeting_date: {{TL;DV Recording Date}}
  user_id: {{固定値またはTL;DV User Email}}
```

### 3️⃣ テストと有効化
1. 「Test action」をクリック
2. Supabaseでデータが作成されたか確認
3. 「Publish Zap」をクリック

## 📝 Zap 2: Supabase → Dify（AI分析）

### 1️⃣ トリガー設定（Supabase）

```yaml
App: Supabase
Trigger Event: New Row
Table: transcripts
```

### 2️⃣ アクション設定（Webhooks）

```yaml
App: Webhooks by Zapier
Action Event: POST
```

**設定内容：**
```
URL: https://api.dify.ai/v1/workflows/{{あなたのワークフローID}}/run
Headers:
  Authorization: Bearer {{DifyのAPIキー}}
  Content-Type: application/json
Data:
  {
    "inputs": {
      "transcript": "{{Transcript from Supabase}}",
      "transcript_id": "{{ID from Supabase}}",
      "user_id": "{{User ID from Supabase}}",
      "analysis_type": "interest_extraction"
    }
  }
```

### 3️⃣ フィルター追加（オプション）

```yaml
Only continue if:
Transcript Text | (Text) Contains | 分析したいキーワード
```

## 📝 Zap 3: Dify → Supabase（分析結果保存）

### 1️⃣ トリガー設定（Webhooks）

```yaml
App: Webhooks by Zapier
Trigger Event: Catch Hook
```

**Webhook URL（Difyに設定）：**
```
https://hooks.zapier.com/hooks/catch/{{あなたのID}}/{{あなたのキー}}/
```

### 2️⃣ アクション設定（Supabase）

```yaml
App: Supabase
Action Event: Update Row
```

**設定内容：**
```
Table: transcripts
Row ID: {{transcript_id from webhook}}
Fields:
  keywords: {{keywords from Dify}}
  topics: {{topics from Dify}}
```

## 🎯 Difyワークフロー設定

### Difyでワークフローを作成

1. **Difyにログイン**
   - https://dify.ai

2. **新規ワークフロー作成**
   ```
   Workflows → Create → 「Transcript Analysis」
   ```

3. **ノード構成**
   ```
   Start → LLM → Data Processing → Webhook
   ```

### LLMノードの設定

**プロンプト例：**
```
以下のトランスクリプトを分析して、JSONフォーマットで結果を返してください：

トランスクリプト：
{{transcript}}

出力フォーマット：
{
  "keywords": ["キーワード1", "キーワード2", ...],
  "topics": ["トピック1", "トピック2", ...],
  "interests": [
    {
      "category": "カテゴリ名",
      "keywords": ["関連キーワード"],
      "strength": 0.8
    }
  ],
  "business_areas": ["ビジネス分野1", "ビジネス分野2"]
}
```

## 💰 コスト計算

### Zapier料金プラン
- **Free**: 100タスク/月（テストには十分）
- **Starter**: $19.99/月（750タスク/月）
- **Professional**: $49/月（2,000タスク/月）

### 1ミーティングあたりのタスク消費
- Zap 1: 1タスク（TL;DV → Supabase）
- Zap 2: 1タスク（Supabase → Dify）
- Zap 3: 1タスク（Dify → Supabase）
- **合計**: 3タスク/ミーティング

### 月間処理可能数
- Free: 約33ミーティング
- Starter: 約250ミーティング
- Professional: 約666ミーティング

## 🔍 動作確認

### 1. TL;DVで録画
1. ミーティングを録画
2. 録画が完了するまで待つ

### 2. Zapierダッシュボードで確認
1. Task History を確認
2. 各Zapが正常に実行されたか確認

### 3. Supabaseで確認
```sql
SELECT * FROM transcripts ORDER BY created_at DESC LIMIT 1;
```

### 4. エラーが出た場合
- Zapier Task Historyでエラー詳細を確認
- 各アプリの接続を再確認
- APIキーの有効期限を確認

## 🎉 完成！

これで自動的に：
1. TL;DVの録画が完了すると
2. トランスクリプトがSupabaseに保存され
3. Difyで分析され
4. 結果がSupabaseに戻ってきます

## 📞 トラブルシューティング

### よくあるエラー

**「Authentication failed」**
→ APIキーを再確認

**「Table not found」**
→ Supabaseのテーブル名を確認

**「Webhook timeout」**
→ Difyの処理時間を短縮

### サポート
- Zapier Help: https://help.zapier.com
- Supabase Docs: https://supabase.io/docs
- Dify Docs: https://docs.dify.ai