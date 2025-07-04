// Script to update all HTML files with logout functionality and responsive fixes
// Run this with Node.js to update all HTML files

const fs = require('fs');
const path = require('path');

// List of HTML files to update
const htmlFiles = [
    'dashboard.html',
    'members.html',
    'events.html',
    'settings.html',
    'profile.html',
    'messages.html',
    'business.html',
    'invite.html',
    'admin.html',
    'login.html',
    'register.html',
    'forgot-password.html',
    'privacy.html',
    'terms.html',
    'company.html',
    'member-profile.html',
    'help.html',
    'password-reset.html'
];

// Scripts and styles to ensure are included
const requiredScripts = [
    '<script src="auth.js"></script>',
    '<script src="auth-logout-fix.js"></script>',
    '<script src="common.js"></script>'
];

const requiredStyles = [
    '<link rel="stylesheet" href="responsive-design-fix.css">'
];

function updateHTMLFile(filename) {
    const filepath = path.join(__dirname, filename);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
        console.log(`File not found: ${filename}`);
        return;
    }
    
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;
    
    // Find the closing </head> tag
    const headEndIndex = content.indexOf('</head>');
    if (headEndIndex === -1) {
        console.log(`No </head> tag found in ${filename}`);
        return;
    }
    
    // Check and add required styles
    requiredStyles.forEach(style => {
        if (!content.includes(style.match(/href="([^"]+)"/)[1])) {
            content = content.slice(0, headEndIndex) + '    ' + style + '\n' + content.slice(headEndIndex);
            modified = true;
            console.log(`Added ${style} to ${filename}`);
        }
    });
    
    // Find the closing </body> tag
    const bodyEndIndex = content.lastIndexOf('</body>');
    if (bodyEndIndex === -1) {
        console.log(`No </body> tag found in ${filename}`);
        return;
    }
    
    // Check and add required scripts
    requiredScripts.forEach(script => {
        const scriptFile = script.match(/src="([^"]+)"/)[1];
        if (!content.includes(scriptFile)) {
            // Add before closing body tag
            content = content.slice(0, bodyEndIndex) + '    ' + script + '\n' + content.slice(bodyEndIndex);
            modified = true;
            console.log(`Added ${script} to ${filename}`);
        }
    });
    
    // Fix logout button/link implementations
    // Replace onclick="logout()" with proper implementation
    content = content.replace(/onclick\s*=\s*["']logout\(\)["']/gi, 'onclick="logout()"');
    
    // Ensure viewport meta tag is correct
    if (!content.includes('viewport')) {
        const headStartIndex = content.indexOf('<head>') + 6;
        const viewportTag = '\n    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">';
        content = content.slice(0, headStartIndex) + viewportTag + content.slice(headStartIndex);
        modified = true;
        console.log(`Added viewport meta tag to ${filename}`);
    }
    
    // Save the file if modified
    if (modified) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Updated ${filename}`);
    } else {
        console.log(`No changes needed for ${filename}`);
    }
}

// Process all HTML files
console.log('Starting HTML files update...\n');
htmlFiles.forEach(updateHTMLFile);
console.log('\nUpdate complete!');

// Instructions for manual run
console.log('\nTo manually add to specific files:');
console.log('1. Add before </head>:');
requiredStyles.forEach(style => console.log(`   ${style}`));
console.log('\n2. Add before </body>:');
requiredScripts.forEach(script => console.log(`   ${script}`));