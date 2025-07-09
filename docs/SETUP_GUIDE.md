# 🚀 INTERCONNECT セットアップガイド

## 📋 完了した実装

### ✅ 1. 招待リンクURL修正
- GitHub Pages用の正しいURLに自動対応
- `https://revirall.github.io/interconnect/register.html?ref=招待コード`

### ✅ 2. ソーシャル認証実装
- **Google OAuth**: 完全実装済み
- **LINE Login**: 完全実装済み  
- **LinkedIn OAuth**: 完全実装済み
- デモモードと本番モード両対応

### ✅ 3. Supabase統合準備
- 動的設定システム
- 自動フォールバック機能
- 詳細な状態監視

---

## 🔧 次のステップ：ソーシャル認証の有効化

### Google OAuth設定

**1. Google Cloud Console設定**
```
1. https://console.cloud.google.com/ にアクセス
2. 新しいプロジェクトを作成
3. API & Services > Credentials
4. OAuth 2.0 Client ID を作成
5. Authorized redirect URIs に追加:
   - https://revirall.github.io/interconnect/auth/google/callback
```

**2. クライアントIDの設定**
```html
<!-- index.html の <head> に追加 -->
<meta name="env-google_client_id" content="YOUR_GOOGLE_CLIENT_ID">
```

### LINE Login設定

**1. LINE Developers設定**
```
1. https://developers.line.biz/ にアクセス
2. LINE Login チャネルを作成
3. Callback URL を設定:
   - https://revirall.github.io/interconnect/auth/line/callback
```

**2. クライアントIDの設定**
```html
<!-- index.html の <head> に追加 -->
<meta name="env-line_client_id" content="YOUR_LINE_CLIENT_ID">
```

### LinkedIn OAuth設定

**1. LinkedIn Developer設定**
```
1. https://www.linkedin.com/developers/ にアクセス
2. アプリケーションを作成
3. Redirect URLs を設定:
   - https://revirall.github.io/interconnect/auth/linkedin/callback
```

**2. クライアントIDの設定**
```html
<!-- index.html の <head> に追加 -->
<meta name="env-linkedin_client_id" content="YOUR_LINKEDIN_CLIENT_ID">
```

---

## 🗄️ Supabaseセットアップ

### 1. Supabaseプロジェクト作成

```
1. https://supabase.com にアクセス
2. 新しいプロジェクトを作成
3. データベースパスワードを設定
4. プロジェクトURL と Anon Key を取得
```

### 2. データベースセットアップ

**SQL Editor で以下を実行:**
```sql
-- supabase-schema.sql の内容をコピー&ペースト
-- テーブル、セキュリティポリシー、関数を作成
```

### 3. Supabase認証情報の設定

**方法A: HTML meta タグ（推奨）**
```html
<!-- index.html の <head> に追加 -->
<meta name="env-supabase_url" content="YOUR_SUPABASE_URL">
<meta name="env-supabase_anon_key" content="YOUR_ANON_KEY">
```

**方法B: JavaScript設定**
```html
<script>
window.env = {
    SUPABASE_URL: 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: 'YOUR_ANON_KEY'
};
</script>
```

**方法C: テスト用（コンソールで実行）**
```javascript
quickSupabaseSetup('YOUR_URL', 'YOUR_KEY');
```

---

## 🎯 現在の状態確認

### ブラウザコンソールで実行:

**1. 接続状態確認**
```javascript
checkSupabaseStatus();
```

**2. ソーシャル認証テスト**
```javascript
// ログインページで各ボタンをクリックしてテスト
// 現在はデモモードで動作
```

**3. 招待リンク確認**
```javascript
// 招待ページで生成されたリンクが正しいか確認
// https://revirall.github.io/interconnect/register.html?ref=XXX-XXXXX
```

---

## 📊 動作モード

### 現在の動作モード
- **認証**: LocalStorage + ソーシャル認証（デモ）
- **データ**: LocalStorage
- **招待**: GitHub Pages URL対応済み

### Supabase設定後の動作モード  
- **認証**: Supabase Auth + ソーシャル認証（実動作）
- **データ**: Supabase Database + LocalStorage フォールバック
- **リアルタイム**: Supabase Realtime

---

## 🔄 今後の改善計画

### Phase 1: ソーシャル認証の本格稼働
```
□ Google OAuth のClient ID設定
□ LINE Login のClient ID設定  
□ LinkedIn OAuth のClient ID設定
□ 各プロバイダーでのテスト
```

### Phase 2: Supabase完全移行
```
□ Supabaseプロジェクト作成
□ データベーススキーマ適用
□ LocalStorageからの初回データ移行
□ リアルタイム機能の有効化
```

### Phase 3: 本格運用
```
□ 独自ドメインの設定
□ SSL証明書の設定
□ 監視・ログ機能の追加
□ バックアップ機能の追加
```

---

## 📞 サポート

### 確認コマンド
```javascript
// ブラウザコンソールで実行可能
checkSupabaseStatus();          // Supabase接続確認
window.auth.getCurrentUser();   // 現在のユーザー確認
```

### トラブルシューティング
- **ソーシャルログインが動かない**: デモモードで動作中（正常）
- **Supabaseエラー**: LocalStorageモードで動作中（正常）
- **招待リンクが正しくない**: ページを再読み込みして確認

すべての機能は段階的にアップグレード可能です！