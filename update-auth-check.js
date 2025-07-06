// auth-check.jsを全ての保護されたページに追加するスクリプト
const fs = require('fs');
const path = require('path');

// 保護されたページのリスト
const protectedPages = [
    'dashboard.html',
    'members.html',
    'events.html',
    'messages.html',
    'settings.html',
    'profile.html',
    'admin.html',
    'business.html',
    'invite.html',
    'help.html',
    'member-profile.html'
];

// auth-check.jsを追加する関数
function addAuthCheckScript(filename) {
    const filePath = path.join(__dirname, filename);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 既にauth-check.jsが含まれているかチェック
        if (content.includes('auth-check.js')) {
            console.log(`✓ ${filename} already has auth-check.js`);
            return;
        }
        
        // </head>タグの前にauth-check.jsを追加
        const scriptTag = '    <script src="auth-check.js"></script>\n';
        content = content.replace('</head>', scriptTag + '</head>');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Added auth-check.js to ${filename}`);
    } catch (error) {
        console.error(`✗ Error processing ${filename}:`, error.message);
    }
}

// 全ての保護されたページに適用
console.log('Adding auth-check.js to protected pages...\n');
protectedPages.forEach(addAuthCheckScript);
console.log('\nComplete!');