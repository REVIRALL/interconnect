# CSS統合テスト計画

## テスト手順

### ステップ1: 統合前の確認
1. index.htmlを開く
2. 以下の要素を確認:
   - モバイルメニュー（ハンバーガー）の動作
   - ボタンのサイズとスタイル
   - レスポンシブレイアウト（768px, 428px, 375px）
   - ヒーローセクションの表示

### ステップ2: 段階的な統合
1. まず新しい統合CSSを追加（古いものは残す）
2. 問題がないか確認
3. 古いCSSを1つずつ削除

### 統合対象CSS（index.html）

#### モバイル関連（削除予定）
- button-mobile-enhance.css → css/responsive/mobile-all.css
- index-mobile-perfect.css → css/responsive/mobile-all.css
- mobile-m-fix.css → css/responsive/mobile-all.css
- mobile-text-size-fix.css → css/responsive/mobile-all.css

#### レスポンシブ関連（削除予定）
- responsive-improvements.css → css/responsive/responsive-all.css
- responsive-fixes.css → css/responsive/responsive-all.css
- index-responsive-perfect.css → css/responsive/responsive-all.css
- hero-responsive-fix.css → css/responsive/responsive-all.css

#### その他の修正（次フェーズ）
- index-improvements.css
- index-final-fixes.css
- hero-center-fix.css
- hero-text-break-fix.css
- container-padding-fix.css
- navbar-height-fix.css

## 確認ポイント
1. ハンバーガーメニューが表示される（768px以下）
2. ボタンが適切なサイズ（モバイル: 48px以上）
3. テキストがはみ出さない
4. 横スクロールが発生しない
5. ヒーローセクションが正しく表示される