// パス更新スクリプト
const fs = require('fs');
const path = require('path');

// ファイルパス更新関数
function updateFilePaths(filePath, isInPages = false) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        
        console.log(`📝 Updating: ${fileName} ${isInPages ? '(in pages/)' : ''}`);
        
        // CSS パスの更新
        const cssFiles = [
            'styles.css', 'auth.css', 'dashboard.css', 'loading.css', 
            'dark-mode.css', 'invite.css', 'members.css', 'messages.css',
            'events.css', 'business.css', 'admin.css', 'profile.css',
            'settings.css', 'help.css', 'legal.css', 'notification.css'
        ];
        
        cssFiles.forEach(cssFile => {
            const oldPath = `href="${cssFile}"`;
            const newPath = isInPages ? `href="../styles/${cssFile}"` : `href="styles/${cssFile}"`;
            content = content.replace(new RegExp(oldPath, 'g'), newPath);
        });
        
        // JavaScript パスの更新
        const jsFiles = [
            'auth.js', 'dashboard.js', 'social-auth.js', 'invite.js',
            'members.js', 'messages.js', 'events.js', 'business.js',
            'admin.js', 'profile.js', 'settings.js', 'help.js',
            'common.js', 'security.js', 'security-manager.js',
            'form-validation.js', 'supabase-setup.js', 'points-integrity.js',
            'performance.js', 'lazy-load.js', 'script.js',
            'notification-service.js', 'message-service.js', 'file-service.js',
            'event-service.js', 'admin-service.js', 'settings-service.js',
            'supabase-service.js', 'supabase-config.js', 'security-config.js',
            'input-validator.js', 'advanced-search.js', 'password-reset.js',
            'performance-monitor.js', 'event-edit.js', 'event-history.js',
            'member-profile.js', 'sw.js'
        ];
        
        jsFiles.forEach(jsFile => {
            const oldPath = `src="${jsFile}"`;
            const newPath = isInPages ? `src="../js/${jsFile}"` : `src="js/${jsFile}"`;
            content = content.replace(new RegExp(oldPath, 'g'), newPath);
        });
        
        // ページ間リンクの更新（pages/内のHTMLファイル用）
        if (isInPages) {
            // メインページへのリンク
            content = content.replace(/href="index\.html"/g, 'href="../index.html"');
            content = content.replace(/href="login\.html"/g, 'href="../login.html"');
            content = content.replace(/href="register\.html"/g, 'href="../register.html"');
            content = content.replace(/href="dashboard\.html"/g, 'href="../dashboard.html"');
            
            // pages/内のページ同士のリンクはそのまま
            const pageFiles = [
                'invite.html', 'members.html', 'messages.html', 'events.html',
                'business.html', 'admin.html', 'profile.html', 'settings.html',
                'help.html', 'company.html', 'privacy.html', 'terms.html',
                'forgot-password.html', 'password-reset.html', 'member-profile.html',
                'offline.html', '404.html'
            ];
            // これらは変更不要（同じpages/フォルダ内）
        } else {
            // メインページから pages/ 内へのリンク
            const pageFiles = [
                'invite.html', 'members.html', 'messages.html', 'events.html',
                'business.html', 'admin.html', 'profile.html', 'settings.html',
                'help.html', 'company.html', 'privacy.html', 'terms.html',
                'forgot-password.html', 'password-reset.html', 'member-profile.html',
                'offline.html', '404.html'
            ];
            
            pageFiles.forEach(pageFile => {
                const oldPath = `href="${pageFile}"`;
                const newPath = `href="pages/${pageFile}"`;
                content = content.replace(new RegExp(oldPath, 'g'), newPath);
                
                // window.location.href も更新
                const oldLocation = `window.location.href = '${pageFile}'`;
                const newLocation = `window.location.href = 'pages/${pageFile}'`;
                content = content.replace(new RegExp(oldLocation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newLocation);
            });
        }
        
        // ファイルに書き戻し
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${fileName}`);
        
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

// 実行
console.log('🚀 Starting path updates...\n');

// メインHTMLファイルの更新
const mainFiles = [
    '/mnt/c/Users/ooxmi/Downloads/INTERCONNECT-ORGANIZED/index.html',
    '/mnt/c/Users/ooxmi/Downloads/INTERCONNECT-ORGANIZED/login.html',
    '/mnt/c/Users/ooxmi/Downloads/INTERCONNECT-ORGANIZED/register.html',
    '/mnt/c/Users/ooxmi/Downloads/INTERCONNECT-ORGANIZED/dashboard.html'
];

console.log('📁 Updating main HTML files...');
mainFiles.forEach(file => {
    if (fs.existsSync(file)) {
        updateFilePaths(file, false);
    }
});

console.log('\n📁 Updating pages HTML files...');
// pages/内のHTMLファイルの更新
const pagesDir = '/mnt/c/Users/ooxmi/Downloads/INTERCONNECT-ORGANIZED/pages';
if (fs.existsSync(pagesDir)) {
    const pageFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.html'));
    pageFiles.forEach(file => {
        updateFilePaths(path.join(pagesDir, file), true);
    });
}

console.log('\n🎉 Path updates completed!');
console.log('\n📋 Updated structure:');
console.log('├── index.html, login.html, register.html, dashboard.html');
console.log('├── styles/ (all CSS files)');
console.log('├── js/ (all JavaScript files)');
console.log('├── pages/ (other HTML files)');
console.log('└── docs/ (documentation files)');