# INTERCONNECT - 経営者コミュニティプラットフォーム

## 📁 プロジェクト構造

```
【コード】INTERCONNECT/
├── index.html              # トップページ
├── login.html              # ログインページ（クリーン済み）
├── dashboard.html          # ダッシュボード（クリーン済み）
├── register.html           # 新規登録
├── 
├── css/                    # スタイルシート
│   ├── styles.css          # 基本スタイル
│   ├── design-system.css   # デザインシステム
│   ├── design-system-effects.css
│   ├── design-system-integration.css
│   └── pages/              # ページ専用CSS
│       ├── dashboard.css
│       ├── admin.css
│       ├── business.css
│       ├── events.css
│       ├── members.css
│       ├── messages.css
│       ├── profile.css
│       ├── settings.css
│       ├── help.css
│       └── invite.css
│
├── js/                     # JavaScript
│   ├── script.js           # メインスクリプト
│   ├── services/           # サービス層
│   │   ├── admin-service.js
│   │   ├── event-service.js
│   │   ├── file-service.js
│   │   ├── message-service.js
│   │   ├── notification-service.js
│   │   └── settings-service.js
│   └── pages/              # ページ専用JS
│       ├── dashboard.js
│       ├── admin.js
│       ├── business.js
│       ├── events.js
│       ├── members.js
│       ├── messages.js
│       ├── profile.js
│       ├── settings.js
│       ├── help.js
│       ├── invite.js
│       └── member-profile.js
│
├── database/               # データベース関連
│   ├── supabase-schema.sql
│   └── supabase-database-setup.sql
│
├── assets/                 # アセット
│   └── interconnect-top.mp4
│
├── docs/                   # ドキュメント
│   └── *.md files
│
└── scripts/                # スクリプト
    └── *.sh, *.bat files

```

## 🚀 クイックスタート

### 1. ログイン
- URL: `login.html`
- テストアカウント:
  - Email: `admin@interconnect.jp`
  - Password: `demo123`

### 2. 主要ページ
- ダッシュボード: `dashboard.html`
- メンバー一覧: `members.html`
- イベント: `events.html`
- メッセージ: `messages.html`
- ビジネスマッチング: `business.html`

## 🛠️ 技術スタック

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **データベース**: Supabase (PostgreSQL)
- **デザイン**: カスタムデザインシステム
- **レスポンシブ**: モバイルファースト設計

## ✅ 完了した作業

1. **エラーゼロのクリーンなシステム**
   - login.htmlとdashboard.htmlから不要なスクリプトを削除
   - シンプルなインライン認証システムを実装

2. **フォルダ構造の整理**
   - 約250ファイルから約100ファイルに削減
   - 明確なフォルダ構造で整理

3. **データベース準備**
   - Supabaseテーブル作成済み
   - 今後の統合準備完了

## 📝 今後の作業

1. **データベース統合**
   - Supabaseとの接続実装
   - リアルタイムデータ同期

2. **機能追加**
   - メッセージ機能の実装
   - イベント管理機能
   - ビジネスマッチング機能

3. **UI/UX改善**
   - ダークモード対応
   - アニメーション強化
   - アクセシビリティ向上

## 🔧 開発環境

```bash
# ローカルサーバーの起動
npm start

# または
python -m http.server 8000
```

## 📄 ライセンス

© 2024 INTERCONNECT. All rights reserved.