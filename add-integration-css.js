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
        
        // すでに統合CSSが適用されているかチェック
        if (content.includes('design-system-integration.css')) {
            console.log(`すでに適用済み: ${file}`);
            return;
        }
        
        // design-system-effects.cssの後に統合CSSを追加
        const effectsCssMatch = content.match(/<link\s+rel="stylesheet"\s+href="design-system-effects\.css">/);
        if (effectsCssMatch) {
            content = content.replace(
                effectsCssMatch[0],
                effectsCssMatch[0] + '\n    <link rel="stylesheet" href="design-system-integration.css">'
            );
            
            // ファイルを保存
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`統合CSSを適用しました: ${file}`);
        } else {
            console.log(`design-system-effects.cssが見つかりません: ${file}`);
        }
        
    } catch (error) {
        console.error(`エラー (${file}):`, error);
    }
});

console.log('\n統合CSSの適用が完了しました！');