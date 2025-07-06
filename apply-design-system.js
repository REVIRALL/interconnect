const fs = require('fs');
const path = require('path');

// HTMLファイルのリスト
const htmlFiles = [
    'index.html',
    'login.html',
    'register.html',
    'dashboard.html',
    'profile.html',
    'members.html',
    'messages.html',
    'events.html',
    'business.html',
    'settings.html',
    'admin.html',
    'help.html',
    'company.html',
    'terms.html',
    'privacy.html',
    'invite.html',
    'forgot-password.html',
    'password-reset.html',
    'member-profile.html',
    '404.html',
    'offline.html'
];

// デザインシステムのCSS/JSインクルード
const designSystemIncludes = `    <!-- Design System CSS -->
    <link rel="stylesheet" href="design-system.css">
    <link rel="stylesheet" href="design-system-effects.css">
    
    <!-- Legacy CSS (will be gradually replaced) -->`;

const designSystemJS = `    <!-- Design System JS -->
    <script src="design-system.js"></script>
    
    <!-- Legacy JS -->`;

// フォントのアップデート
const updatedFonts = `    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">`;

// 各HTMLファイルを処理
htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    // ファイルが存在するかチェック
    if (!fs.existsSync(filePath)) {
        console.log(`ファイルが見つかりません: ${file}`);
        return;
    }
    
    try {
        // ファイルを読み込む
        let content = fs.readFileSync(filePath, 'utf8');
        
        // すでにデザインシステムが適用されているかチェック
        if (content.includes('design-system.css')) {
            console.log(`すでに適用済み: ${file}`);
            return;
        }
        
        // スタイルシートの最初の行を見つける
        const firstStyleMatch = content.match(/<link\s+rel="stylesheet"\s+href="[^"]+\.css">/);
        if (firstStyleMatch) {
            // デザインシステムCSSを最初に追加
            content = content.replace(
                firstStyleMatch[0],
                designSystemIncludes + '\n' + firstStyleMatch[0]
            );
        }
        
        // フォントの更新
        const fontMatch = content.match(/<link\s+href="https:\/\/fonts\.googleapis\.com[^"]+"\s+rel="stylesheet">/);
        if (fontMatch) {
            content = content.replace(fontMatch[0], updatedFonts);
        }
        
        // JavaScriptの最初の行を見つける
        const firstScriptMatch = content.match(/<script\s+src="[^"]+\.js"><\/script>/);
        if (firstScriptMatch) {
            // デザインシステムJSを最初に追加
            content = content.replace(
                firstScriptMatch[0],
                designSystemJS + '\n' + firstScriptMatch[0]
            );
        }
        
        // ボタンクラスの更新
        content = content.replace(/class="button"/g, 'class="btn btn-primary"');
        content = content.replace(/class="secondary-button"/g, 'class="btn btn-secondary"');
        content = content.replace(/class="cta-button"/g, 'class="btn btn-primary btn-lg"');
        
        // カードクラスの更新
        content = content.replace(/class="card"/g, 'class="card animate-on-scroll"');
        content = content.replace(/class="feature-card"/g, 'class="card card-glass animate-on-scroll"');
        
        // アニメーションクラスの追加
        content = content.replace(/class="hero-content"/g, 'class="hero-content animate-fadeIn"');
        content = content.replace(/class="section-title"/g, 'class="section-title animate-on-scroll"');
        
        // ファイルを保存
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`デザインシステムを適用しました: ${file}`);
        
    } catch (error) {
        console.error(`エラー (${file}):`, error);
    }
});

console.log('\nデザインシステムの適用が完了しました！');