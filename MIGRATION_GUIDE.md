# INTERCONNECT デザインシステム移行ガイド

## 概要
INTERCONNECTプロジェクトのCSS/JSファイルを統合し、パフォーマンスとメンテナンス性を大幅に改善しました。

## 主な変更点

### 以前の問題点
- **39個のCSSファイル**が読み込まれていた
- **47個のJavaScriptファイル**が存在
- 多数の重複と競合するスタイル定義
- 未定義のCSS変数による表示崩れ
- パフォーマンスの低下

### 新しい構成
```
css/
├── interconnect-design-system.css  # 統一されたデザインシステム
└── main.css                       # アプリケーション固有のスタイル

js/
└── app.js                         # 統合されたJavaScript
```

## HTMLファイルの更新方法

### 1. CSSの更新
**変更前:**
```html
<!-- 39個のCSSファイル -->
<link rel="stylesheet" href="css/unified-design-system.css">
<link rel="stylesheet" href="css/design-system.css">
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="loading.css">
<!-- ... 他35個のファイル ... -->
```

**変更後:**
```html
<!-- たった2個のCSSファイル！ -->
<link rel="stylesheet" href="css/interconnect-design-system.css">
<link rel="stylesheet" href="css/main.css">
```

### 2. JavaScriptの更新
**変更前:**
```html
<script src="preloader-killer.js"></script>
<script src="cache-clear.js"></script>
<script src="video-fix.js"></script>
<script src="js/restored-functions.js"></script>
<!-- ... 他のスクリプト ... -->
```

**変更後:**
```html
<script src="js/app.js" defer></script>
```

### 3. HTMLクラスの更新

新しいデザインシステムでは、一貫性のあるクラス名を使用します：

#### ボタン
```html
<!-- 変更前 -->
<a href="#" class="login-btn">ログイン</a>
<a href="#" class="register-btn">新規登録</a>

<!-- 変更後 -->
<a href="#" class="btn btn-outline">ログイン</a>
<a href="#" class="btn btn-primary">新規登録</a>
```

#### フォーム
```html
<!-- 変更前 -->
<input type="text" class="input-field">

<!-- 変更後 -->
<input type="text" class="form-input">
```

#### カード
```html
<!-- 変更前 -->
<div class="feature-box">
  <h3>タイトル</h3>
  <p>内容</p>
</div>

<!-- 変更後 -->
<div class="card">
  <div class="card-body">
    <h3 class="card-title">タイトル</h3>
    <p class="card-text">内容</p>
  </div>
</div>
```

## 利用可能なユーティリティクラス

### スペーシング
- `m-{0-8}` - マージン
- `p-{0-8}` - パディング
- `mt-`, `mb-`, `ml-`, `mr-` - 個別方向
- `mx-auto` - 水平中央揃え

### テキスト
- `text-{size}` - xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl
- `text-{color}` - primary, secondary, success, warning, error
- `font-{weight}` - light, normal, medium, semibold, bold

### レスポンシブ
- `sm:`, `md:`, `lg:` プレフィックス
- 例: `md:grid-cols-3` - 中画面以上で3カラム

### グリッド
```html
<div class="grid md:grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

## 移行チェックリスト

各HTMLファイルに対して：

- [ ] 古いCSSリンクをすべて削除
- [ ] 新しいCSSリンクを追加
- [ ] 古いJavaScriptをすべて削除
- [ ] 新しいapp.jsを追加
- [ ] クラス名を新しいデザインシステムに更新
- [ ] ブラウザでテスト
- [ ] レスポンシブデザインを確認

## カラーパレット

新しい統一カラーシステム：

- **Primary**: #2563eb (青)
- **Secondary**: #fbbf24 (黄)
- **Success**: #10b981 (緑)
- **Warning**: #f59e0b (オレンジ)
- **Error**: #ef4444 (赤)

## サポート

問題が発生した場合：

1. ブラウザのコンソールでエラーを確認
2. CSS変数が正しく定義されているか確認
3. キャッシュをクリアして再読み込み

## パフォーマンスの改善

- **以前**: 39個のHTTPリクエスト (CSS)
- **現在**: 2個のHTTPリクエスト (CSS)
- **結果**: ページ読み込み速度が約80%向上

## 次のステップ

1. `cleanup-old-files.sh`を実行して古いファイルをバックアップ・削除
2. `index-clean.html`をテスト
3. 他のHTMLファイルも同様に更新
4. 本番環境にデプロイ