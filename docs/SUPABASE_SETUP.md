# Supabase設定ガイド - メッセージ機能

このドキュメントは、INTERCONNECT プロジェクトでメッセージ機能のSupabase統合を設定するためのガイドです。

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとanon keyを取得

## 2. 環境設定

`supabase-config.js` ファイル内の以下の値を実際の値に更新してください：

```javascript
this.supabaseUrl = 'https://your-project.supabase.co';  // 実際のプロジェクトURL
this.supabaseKey = 'your-anon-key';                     // 実際のanon key
```

## 3. データベーススキーマ

Supabase ダッシュボードのSQL Editorで以下のSQLを実行してテーブルを作成します：

### 3.1 プロフィールテーブル

```sql
-- プロフィールテーブル（ユーザー情報）
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT,
    company TEXT,
    position TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プロフィールのRLS（Row Level Security）を有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- プロフィールアクセスポリシー
CREATE POLICY "プロフィールは全員が閲覧可能" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "ユーザーは自分のプロフィールを更新可能" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "ユーザーは自分のプロフィールを挿入可能" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3.2 会話テーブル

```sql
-- 会話テーブル
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    participant1_id UUID REFERENCES profiles(id) NOT NULL,
    participant2_id UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 同じユーザー同士の重複会話を防ぐ
    CONSTRAINT unique_conversation UNIQUE (
        LEAST(participant1_id, participant2_id),
        GREATEST(participant1_id, participant2_id)
    )
);

-- 会話のRLSを有効化
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 会話アクセスポリシー
CREATE POLICY "ユーザーは参加している会話を閲覧可能" ON conversations
    FOR SELECT USING (
        auth.uid() = participant1_id OR 
        auth.uid() = participant2_id
    );

CREATE POLICY "ユーザーは会話を作成可能" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant1_id OR 
        auth.uid() = participant2_id
    );

CREATE POLICY "参加者は会話を更新可能" ON conversations
    FOR UPDATE USING (
        auth.uid() = participant1_id OR 
        auth.uid() = participant2_id
    );
```

### 3.3 ユーザー設定テーブル

```sql
-- ユーザー設定テーブル
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ユーザーごとに一つの設定レコードのみ
    CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- ユーザー設定のRLSを有効化
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ユーザー設定アクセスポリシー
CREATE POLICY "ユーザーは自分の設定を閲覧可能" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の設定を更新可能" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の設定を挿入可能" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の設定を削除可能" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);
```

### 3.4 ログイン履歴テーブル

```sql
-- ログイン履歴テーブル
CREATE TABLE IF NOT EXISTS login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    device_info TEXT,
    browser_info TEXT,
    ip_address INET,
    location TEXT,
    session_id TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ログイン履歴のRLSを有効化
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- ログイン履歴アクセスポリシー
CREATE POLICY "ユーザーは自分のログイン履歴を閲覧可能" ON login_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "システムはログイン履歴を挿入可能" ON login_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "ユーザーは自分のセッションを更新可能" ON login_history
    FOR UPDATE USING (auth.uid() = user_id);
```

### 3.5 メッセージテーブル

```sql
-- メッセージテーブル
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) NOT NULL,
    receiver_id UUID REFERENCES profiles(id) NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メッセージのRLSを有効化
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- メッセージアクセスポリシー
CREATE POLICY "ユーザーは関連するメッセージを閲覧可能" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

CREATE POLICY "ユーザーはメッセージを送信可能" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "受信者はメッセージを既読にマーク可能" ON messages
    FOR UPDATE USING (auth.uid() = receiver_id);
```

### 3.4 インデックスの作成

```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at DESC);
```

### 3.5 トリガー関数（自動更新）

```sql
-- 更新時刻を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 会話の更新時刻を新しいメッセージで自動更新
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();
```

## 4. リアルタイム機能の有効化

Supabase ダッシュボードで以下を設定：

1. **Database > Replication** に移動
2. 以下のテーブルでリアルタイム機能を有効化：
   - `messages`
   - `conversations`
   - `profiles`

## 5. 認証設定

### 5.1 認証プロバイダーの設定

1. **Authentication > Settings** に移動
2. 必要な認証プロバイダーを有効化（Email、Google、etc.）
3. サイトURLを設定

### 5.2 プロフィール自動作成

```sql
-- 新しいユーザー登録時にプロフィールを自動作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 6. セキュリティ設定

### 6.1 CORS設定

Supabase ダッシュボードの **Settings > API** で、適切なCORS設定を行ってください。

### 6.2 API制限

必要に応じて API の使用制限を設定してください。

## 7. テストデータの挿入

開発用のテストデータを挿入：

```sql
-- テストユーザーの挿入（実際の認証ユーザーIDを使用）
INSERT INTO profiles (id, name, company, position) VALUES
('00000000-0000-0000-0000-000000000001', '佐藤次郎', '株式会社テックイノベーション', 'CEO'),
('00000000-0000-0000-0000-000000000002', '山田花子', '合同会社デザイン', 'デザイナー'),
('00000000-0000-0000-0000-000000000003', '鈴木三郎', '鈴木製作所', '代表取締役');

-- テスト会話の作成
INSERT INTO conversations (participant1_id, participant2_id) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003');

-- テストメッセージの挿入
INSERT INTO messages (conversation_id, sender_id, receiver_id, content) VALUES
(1, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'こんにちは！'),
(1, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'こんにちは、お疲れ様です。');
```

## 8. フォールバック設定

Supabaseが利用できない場合、自動的にlocalStorageを使用するフォールバック機能が実装されています。この機能により、オフライン環境でも基本的なメッセージ機能が動作します。

## 9. 監視とメンテナンス

- Supabaseダッシュボードでデータベースの使用状況を定期的に確認
- ログを監視してエラーやパフォーマンスの問題を特定
- 必要に応じてインデックスの最適化を実施

## トラブルシューティング

### よくある問題

1. **RLSエラー**: ポリシーが正しく設定されているか確認
2. **認証エラー**: APIキーとURLが正しく設定されているか確認
3. **リアルタイム機能が動作しない**: Replicationが有効になっているか確認

### ログの確認

ブラウザの開発者ツールのコンソールで、Supabase関連のエラーメッセージを確認してください。