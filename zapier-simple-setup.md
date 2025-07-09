# 🎯 Zapier設定 - 超シンプル版

## 必要な3つのZap

### 📹 Zap 1: TL;DV録画をSupabaseに保存

```
TL;DV (New Recording) 
    ↓
Supabase (Create Row in transcripts)
```

**設定するフィールド：**
- meeting_id = TL;DV Meeting ID
- meeting_title = TL;DV Title  
- raw_transcript = TL;DV Transcript
- meeting_date = TL;DV Date

### 🤖 Zap 2: トランスクリプトをDifyで分析

```
Supabase (New Row in transcripts)
    ↓
Webhook (POST to Dify)
```

**Webhook設定：**
```
URL: https://api.dify.ai/v1/workflows/YOUR_ID/run
Headers:
  Authorization: Bearer YOUR_DIFY_KEY
Body:
  {
    "inputs": {
      "transcript": "{{transcript from Supabase}}"
    }
  }
```

### 💾 Zap 3: 分析結果を保存

```
Webhook (Catch from Dify)
    ↓
Supabase (Update Row in transcripts)
```

## 🚀 最初にやること

1. **Zapierにログイン**
   - https://zapier.com

2. **アプリを接続**
   - TL;DV → Connect
   - Supabase → URL + API Key入力

3. **Zap 1だけ先に作る**
   - これだけでトランスクリプト保存は完成！

## 💡 ポイント

- 最初は**Zap 1だけ**作ればOK
- Dify連携は後からでも大丈夫
- 無料プランなら月100件まで処理可能

## ❓ 困ったら

**Q: Supabaseの接続情報は？**
```
URL: https://あなたのプロジェクトID.supabase.co
Key: Supabaseダッシュボード → Settings → API → anon key
```

**Q: エラーが出る**
- APIキーをもう一度確認
- テーブル名が「transcripts」になってるか確認

これだけで始められます！