# 🤖 Difyワークフロー設定ガイド

## 1. Difyにログイン
https://cloud.dify.ai/

## 2. 新しいワークフローを作成

### ステップ1: ワークフロー作成
```
1. 左メニューの「Studio」をクリック
2. 「Create from Blank」をクリック  
3. 「Workflow」を選択
4. 名前を入力: 「INTERCONNECT Transcript Analysis」
```

### ステップ2: ワークフローの構築

#### 入力ノードの設定
1. **Start**ノードをクリック
2. **Input**に以下を追加：
   ```
   - transcript (Text) - Required
   - user_id (Text) - Required
   - analysis_type (Text) - Default: "interest_extraction"
   ```

#### LLMノードの追加
1. 「+」ボタンクリック → 「LLM」を選択
2. **Model**: GPT-4を選択（またはClaude）
3. **Prompt**に以下を設定：

```
あなたは会議トランスクリプトを分析する専門家です。
以下のトランスクリプトから、ビジネスマッチングに役立つ情報を抽出してください。

トランスクリプト：
{{transcript}}

以下のJSON形式で出力してください：
{
  "keywords": [重要なキーワードを10-20個],
  "topics": [主要なトピックを5-10個],
  "interests": [
    {
      "category": "カテゴリ名（technology/marketing/finance等）",
      "keywords": ["関連キーワード"],
      "strength": 0.1-1.0の数値
    }
  ],
  "business_areas": ["関連するビジネス分野"],
  "summary": "200文字程度の要約"
}

注意事項：
- 日本語のキーワードも英語のキーワードも抽出する
- strengthは話題に出た頻度や重要度で判断
- ビジネスに関連する内容を重視
```

#### 出力ノードの設定
1. 「+」ボタン → 「End」を選択
2. **Output**に設定：
   ```
   - keywords (Array)
   - topics (Array)
   - interests (Array)
   - business_areas (Array)
   - summary (Text)
   ```

## 3. APIキーとワークフローIDの取得

### APIキーの取得
1. 右上のアカウントアイコンをクリック
2. 「API Keys」を選択
3. 「+ Create」をクリック
4. 名前を入力：「INTERCONNECT」
5. 生成されたキーをコピー

例：`app-1234567890abcdefghijklmnop`

### ワークフローIDの取得
1. 作成したワークフローを開く
2. 右上の「Publish」をクリック
3. 「Access API」をクリック
4. URLに含まれるworkflow IDをコピー

例：URL `https://api.dify.ai/v1/workflows/abc123def456/run`
→ ワークフローID: `abc123def456`

## 4. マッチングスコア計算用ワークフロー（オプション）

### 別のワークフローを作成
名前：「INTERCONNECT Matching Score」

#### 入力設定
```
- user1 (Object) - ユーザー1のデータ
- user2 (Object) - ユーザー2のデータ
- scoring_criteria (Object) - スコア配分
```

#### LLMプロンプト
```
2人のユーザーのプロフィールとトランスクリプト分析結果を基に、
ビジネスマッチングスコアを計算してください。

ユーザー1: {{user1}}
ユーザー2: {{user2}}

評価基準:
1. ビジネスシナジー (30点): 事業の相乗効果
2. 興味の一致 (25点): 共通の関心事
3. コミュニケーションスタイル (15点): 話し方の相性
4. スキル補完性 (20点): お互いの強みが補完関係
5. 活動頻度 (10点): ミーティング頻度の類似性

出力JSON:
{
  "total_score": 0-100の整数,
  "business_synergy": 0-30,
  "interest_overlap": 0-25,
  "communication_style": 0-15,
  "skill_complementarity": 0-20,
  "activity_similarity": 0-10,
  "match_reasons": ["理由1", "理由2", "理由3"],
  "collaboration_opportunities": ["機会1", "機会2"],
  "conversation_starters": ["話題1", "話題2", "話題3"]
}
```

## 5. env-config.jsを更新

取得したAPIキーとワークフローIDを設定：

```javascript
window.ENV_CONFIG = {
    // TL;DV設定
    TLDV_API_KEY: 'a5d33c1e-8313-44e7-a023-02d179e190d1',
    
    // Dify設定（ここを更新！）
    DIFY_API_KEY: 'app-ここに取得したAPIキー',
    DIFY_WORKFLOW_ID: 'ここに取得したワークフローID',
    
    // Supabase設定
    SUPABASE_URL: 'https://bzlefmhaupyjxjhfrvtm.supabase.co',
    SUPABASE_ANON_KEY: 'eyJ...'
};
```

## 6. テスト方法

### Difyでテスト実行
1. ワークフローページで「Run」をクリック
2. テストデータを入力：
   ```json
   {
     "transcript": "本日はAI活用について議論しました。マーケティングへの応用..."
   }
   ```
3. 実行結果を確認

### ブラウザでテスト
```javascript
// コンソールで実行
const dify = new DifyService(
  window.ENV_CONFIG.DIFY_API_KEY,
  window.ENV_CONFIG.DIFY_WORKFLOW_ID
);

const result = await dify.analyzeTranscript(
  "テストトランスクリプト"
);
console.log(result);
```

## よくあるエラー

### "Invalid API Key"
→ APIキーが正しくコピーされているか確認

### "Workflow not found"
→ ワークフローIDが正しいか確認
→ ワークフローがPublishされているか確認

### "Rate limit exceeded"
→ 無料プランの制限（200リクエスト/月）
→ 有料プランへのアップグレードを検討

## 完了！

これでDifyの設定が完了しました。
matching.htmlで「トランスクリプト同期」ボタンを押すと、
自動的にAI分析が実行されます！