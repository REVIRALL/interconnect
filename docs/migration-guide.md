# LocalStorage → Supabase 移行ガイド

## 🚀 Supabaseセットアップ手順

### 1. Supabaseプロジェクト作成
1. [Supabase](https://supabase.com) にアクセス
2. 新規プロジェクト作成
3. プロジェクトURL とAnon Keyを取得

### 2. データベース構築
```bash
# SQLエディタで実行
cat supabase-schema.sql
```

### 3. 環境変数設定
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 依存関係インストール
```bash
npm install @supabase/supabase-js
```

## 📊 データ移行マッピング

| LocalStorage | Supabase Table | 説明 |
|-------------|----------------|------|
| users | auth.users + user_profiles | 認証とプロファイル |
| inviteData | invite_links + invite_history | 招待管理 |
| pointsData | user_points + point_transactions | ポイント管理 |
| events | events + event_participants | イベント |
| businessOpportunities | business_opportunities | ビジネス案件 |
| messages | conversations + messages | メッセージ |

## 🔄 移行手順

### Phase 1: 認証システム移行
```javascript
// 旧: auth.js
const result = await auth.register(userData);

// 新: supabase-service.js
import { authService } from './supabase-service';
const result = await authService.signUp(userData);
```

### Phase 2: 招待システム移行
```javascript
// 旧: invite.js
const inviteData = JSON.parse(localStorage.getItem('inviteData'));

// 新: supabase-service.js
import { inviteService } from './supabase-service';
const history = await inviteService.getInviteHistory(userId);
```

### Phase 3: データ同期
```javascript
// リアルタイム同期例
import { realtimeService } from './supabase-service';

// メッセージのリアルタイム受信
const subscription = realtimeService.subscribeToMessages(
  conversationId,
  (payload) => {
    console.log('新着メッセージ:', payload.new);
  }
);
```

## ✅ 移行チェックリスト

- [ ] Supabaseプロジェクト作成
- [ ] データベーススキーマ適用
- [ ] 環境変数設定
- [ ] 認証システム更新
- [ ] 招待システム更新
- [ ] ポイントシステム更新
- [ ] イベント機能更新
- [ ] ビジネスマッチング更新
- [ ] メッセージ機能更新
- [ ] リアルタイム機能追加
- [ ] 既存データ移行スクリプト実行
- [ ] テスト実施
- [ ] 本番デプロイ

## 🎯 メリット

1. **セキュリティ向上**
   - Row Level Security (RLS)
   - 認証統合
   - データ暗号化

2. **スケーラビリティ**
   - 複数デバイス同期
   - リアルタイム更新
   - 無制限データ容量

3. **高度な機能**
   - リアルタイムサブスクリプション
   - ファイルストレージ
   - Edge Functions

4. **運用効率**
   - 自動バックアップ
   - 監視ダッシュボード
   - APIレート制限

## 📝 注意事項

- 移行は段階的に実施
- 既存ユーザーへの影響を最小化
- バックアップを必ず取得
- テスト環境で十分に検証

## 🔧 トラブルシューティング

### CORS エラー
Supabaseダッシュボードで許可するドメインを設定

### 認証エラー
- Anon Keyの確認
- RLSポリシーの確認

### データ同期エラー
- リアルタイム設定の確認
- テーブル購読の有効化