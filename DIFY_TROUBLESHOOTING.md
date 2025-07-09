# Difyトラブルシューティング

## 「Studio」や「Create」が見つからない場合

### 新しいDify UIの場合（2024年版）

1. **アプリ作成**
   ```
   ホーム画面 → 「+ Create Application」または「+ 新規作成」
   ```

2. **タイプ選択**
   ```
   - Chatbot
   - Workflow ← これを選択！
   - Agent
   - Completion
   ```

3. **もし日本語表示の場合**
   ```
   「アプリケーション」→「新規作成」→「ワークフロー」
   ```

## ワークフローエディタが開かない場合

### 方法1: 直接作成
```
1. 「My Apps」または「マイアプリ」をクリック
2. 右上の「+ Create」ボタン
3. 「Create from template」の下の「Blank Workflow」を選択
```

### 方法2: テンプレートから
```
1. 「Explore」または「探索」タブ
2. 「Workflow Templates」
3. 適当なテンプレートを選んで「Use this template」
4. 後で中身を全部削除して作り直す
```

## ノードが追加できない場合

### ノードの追加方法
```
1. キャンバスの空白部分を右クリック
2. または「+」ボタンをクリック
3. または左サイドバーからドラッグ&ドロップ
```

### 必要なノード
```
- Input/Start（開始）
- LLM（大規模言語モデル）
- Output/End（終了）
```

## LLMノードの設定がわからない場合

### 基本設定
```
1. LLMノードをダブルクリック
2. Model: GPT-3.5かGPT-4を選択
3. Temperature: 0.7（デフォルトでOK）
```

### プロンプト入力欄が見つからない場合
```
1. 「System Prompt」または「システムプロンプト」欄
2. または「Prompt Template」欄
3. または「Message」欄
```

## APIキーが見つからない場合

### 場所を探す
```
1. 右上のプロフィールアイコン
2. 「Settings」または「設定」
3. 「API Access」または「API Keys」
4. または左サイドバーの「🔑」アイコン
```

### もしなければ
```
1. アプリの詳細ページ
2. 「API Access」タブ
3. 「Create API Key」
```

## スクリーンショットを送ってください

どの画面で困っているか、スクリーンショットを共有していただければ、
具体的な手順をお教えします！

## 最悪の場合の代替案

Difyが難しければ、まず以下の簡易実装でも動きます：

```javascript
// Difyを使わない簡易版
async analyzeTranscript(transcriptText) {
    // 簡易的なキーワード抽出
    const keywords = this.extractKeywords(transcriptText);
    const topics = this.extractTopics(transcriptText);
    
    return {
        keywords: keywords,
        topics: topics,
        summary: transcriptText.substring(0, 200) + '...'
    };
}
```

これでまず動作確認して、後からDifyを追加することも可能です。