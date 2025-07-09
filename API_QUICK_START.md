# 🚀 TL;DV API クイックスタートガイド

## 1. 環境変数ファイルを作成

**`.env`ファイルを作成**（プロジェクトのルートに）

```bash
# TL;DV設定
TLDV_API_KEY=tldv_sk_ここにあなたのAPIキー

# Dify設定  
DIFY_API_KEY=app-ここにDifyのAPIキー
DIFY_WORKFLOW_ID=ここにワークフローID

# Supabase設定（既に持ってるはず）
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 2. APIキーの取得

### TL;DV APIキー
1. https://tldv.io にログイン
2. Settings → API
3. Generate API Key
4. コピーして`.env`に貼り付け

### Dify APIキー  
1. https://dify.ai にログイン
2. ワークフロー作成
3. API Keyをコピー

## 3. 実装済みのコードを使う

**すでに作成済みのファイル：**
- `js/services/tldv-service.js` - TL;DV連携
- `js/services/dify-service.js` - AI分析
- `js/services/matching-engine.js` - マッチング計算
- `matching.html` - 結果表示画面

## 4. 使い方

### トランスクリプト同期

```javascript
// 既に実装済み！matching.htmlの同期ボタンを押すだけ
const tldvService = new TldvService(process.env.TLDV_API_KEY);
await tldvService.syncUserMeetings(userId);
```

### マッチング実行

```javascript
// 自動的に実行される
const matchingEngine = new MatchingEngine();
await matchingEngine.calculateUserSynergy(user1Id, user2Id);
```

## 5. 実際の流れ

1. **ユーザーがログイン**
2. **「マッチング」ページを開く**
3. **「トランスクリプト同期」ボタンをクリック**
4. **TL;DVから自動でデータ取得**
5. **AIが分析してスコア計算**
6. **マッチング結果が表示される**

## 6. テスト方法

```javascript
// ブラウザのコンソールでテスト
const tldv = new TldvService('あなたのAPIキー');
const meetings = await tldv.getMeetings('user-id');
console.log(meetings);
```

## 完了！

これでAPI実装の準備が整いました。
`matching.html`を開いて同期ボタンを押すだけで動きます。