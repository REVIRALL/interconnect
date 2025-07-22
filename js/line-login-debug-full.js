/**
 * LINE Login Full Debug Script
 * Channel IDの問題を完全に追跡
 */

(function() {
    'use strict';
    
    console.log('========================================');
    console.log('🔍 LINE LOGIN FULL DEBUG STARTED');
    console.log('========================================');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', window.location.href);
    console.log('');
    
    // 1. グローバル変数のチェック
    console.log('📌 1. GLOBAL VARIABLES CHECK:');
    console.log('----------------------------');
    if (typeof LINE_CHANNEL_ID !== 'undefined') {
        console.log('✅ LINE_CHANNEL_ID is defined');
        console.log('   Value:', LINE_CHANNEL_ID);
        console.log('   Type:', typeof LINE_CHANNEL_ID);
        console.log('   Length:', LINE_CHANNEL_ID.length);
        console.log('   First 5 chars:', LINE_CHANNEL_ID.substring(0, 5));
        console.log('   Last 5 chars:', LINE_CHANNEL_ID.substring(LINE_CHANNEL_ID.length - 5));
        console.log('   Full value (base64):', btoa(LINE_CHANNEL_ID));
        
        // 不可視文字チェック
        console.log('   Hidden characters check:');
        for (let i = 0; i < LINE_CHANNEL_ID.length; i++) {
            const char = LINE_CHANNEL_ID[i];
            const code = char.charCodeAt(0);
            if (code < 32 || code > 126) {
                console.log(`   ⚠️ Hidden char at position ${i}: charCode ${code}`);
            }
        }
        
        // 正規表現チェック
        if (!/^\d{10}$/.test(LINE_CHANNEL_ID)) {
            console.log('   ⚠️ WARNING: Channel ID format is invalid (should be 10 digits)');
            console.log('   Pattern test result:', /^\d+$/.test(LINE_CHANNEL_ID));
        } else {
            console.log('   ✅ Channel ID format is valid (10 digits)');
        }
    } else {
        console.log('❌ LINE_CHANNEL_ID is NOT defined!');
    }
    console.log('');
    
    // 2. スクリプトの読み込み順序
    console.log('📌 2. SCRIPT LOADING ORDER:');
    console.log('---------------------------');
    const scripts = Array.from(document.scripts);
    scripts.forEach((script, index) => {
        if (script.src) {
            const filename = script.src.split('/').pop();
            console.log(`${index + 1}. ${filename}`);
            if (filename.includes('auth') || filename.includes('line')) {
                console.log(`   URL: ${script.src}`);
            }
        } else {
            console.log(`${index + 1}. [Inline Script]`);
        }
    });
    console.log('');
    
    // 3. DOMContentLoaded時の処理
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📌 3. DOM CONTENT LOADED');
        console.log('------------------------');
        
        const lineButton = document.getElementById('lineLoginBtn');
        if (lineButton) {
            console.log('✅ LINE button found');
            console.log('   ID:', lineButton.id);
            console.log('   Classes:', lineButton.className);
            console.log('   Text:', lineButton.textContent.trim());
            console.log('   Type:', lineButton.type);
            console.log('   Tag:', lineButton.tagName);
            
            // イベントリスナーの詳細な追跡
            const originalAddEventListener = lineButton.addEventListener;
            lineButton.addEventListener = function(type, listener, options) {
                console.log(`📎 Event listener added to LINE button:`);
                console.log(`   Type: ${type}`);
                console.log(`   Listener: ${listener.name || 'anonymous'}`);
                console.log(`   Options:`, options);
                return originalAddEventListener.call(this, type, listener, options);
            };
            
            // クリックイベントの詳細追跡
            lineButton.addEventListener('click', function(e) {
                console.log('');
                console.log('🖱️ LINE BUTTON CLICKED!');
                console.log('======================');
                console.log('Event details:');
                console.log('   Type:', e.type);
                console.log('   Target:', e.target);
                console.log('   CurrentTarget:', e.currentTarget);
                console.log('   Bubbles:', e.bubbles);
                console.log('   Default prevented:', e.defaultPrevented);
                console.log('   Propagation stopped:', e.cancelBubble);
                console.log('');
                console.log('Channel ID at click time:');
                console.log('   Global LINE_CHANNEL_ID:', typeof LINE_CHANNEL_ID !== 'undefined' ? LINE_CHANNEL_ID : 'UNDEFINED');
                console.log('   Window.LINE_CHANNEL_ID:', window.LINE_CHANNEL_ID);
                console.log('');
                
                // URLの構築を追跡
                if (typeof generateRandomString === 'function') {
                    console.log('✅ generateRandomString function exists');
                } else {
                    console.log('❌ generateRandomString function NOT found');
                }
                
                // 実際のリダイレクトURLを追跡（より安全な方法）
                const originalAssign = window.location.assign;
                const originalReplace = window.location.replace;
                
                // assignメソッドをラップ
                window.location.assign = function(url) {
                    console.log('🔗 REDIRECT DETECTED (assign):');
                    console.log('   URL:', url);
                    logClientId(url);
                    return originalAssign.call(window.location, url);
                };
                
                // replaceメソッドをラップ
                window.location.replace = function(url) {
                    console.log('🔗 REDIRECT DETECTED (replace):');
                    console.log('   URL:', url);
                    logClientId(url);
                    return originalReplace.call(window.location, url);
                };
                
                function logClientId(url) {
                    try {
                        const urlObj = new URL(url);
                        const clientId = urlObj.searchParams.get('client_id');
                        console.log('   Extracted client_id:', clientId);
                        console.log('   client_id length:', clientId ? clientId.length : 'null');
                        console.log('   client_id type:', clientId ? typeof clientId : 'null');
                        console.log('   Expected: 2007688781');
                        console.log('   Match:', clientId === '2007688781' ? '✅ YES' : '❌ NO');
                    } catch (e) {
                        console.log('   Could not parse URL');
                    }
                }
            }, true); // キャプチャフェーズで最初に実行
            
        } else {
            console.log('❌ LINE button NOT found!');
        }
        console.log('');
    });
    
    // 4. supabaseReadyイベントの監視
    window.addEventListener('supabaseReady', function() {
        console.log('📌 4. SUPABASE READY EVENT');
        console.log('--------------------------');
        console.log('✅ Supabase is ready');
        console.log('   LINE_CHANNEL_ID at this point:', typeof LINE_CHANNEL_ID !== 'undefined' ? LINE_CHANNEL_ID : 'UNDEFINED');
        console.log('');
    });
    
    // 5. エラーの監視
    window.addEventListener('error', function(e) {
        if (e.message.includes('LINE') || e.message.includes('channel')) {
            console.error('🚨 LINE-RELATED ERROR:');
            console.error('   Message:', e.message);
            console.error('   File:', e.filename);
            console.error('   Line:', e.lineno);
            console.error('   Column:', e.colno);
            console.error('   Stack:', e.error ? e.error.stack : 'No stack trace');
        }
    });
    
    // 6. ネットワークリクエストの監視
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (url && url.includes('line.me')) {
            console.log('🌐 LINE API REQUEST:');
            console.log('   URL:', url);
            
            // URLからclient_idを抽出
            try {
                const urlObj = new URL(url);
                const clientId = urlObj.searchParams.get('client_id');
                if (clientId) {
                    console.log('   client_id in request:', clientId);
                    console.log('   client_id === LINE_CHANNEL_ID:', clientId === LINE_CHANNEL_ID);
                }
            } catch (e) {
                console.log('   Could not parse URL');
            }
        }
        return originalFetch.apply(this, args);
    };
    
    console.log('✅ Full debug script loaded');
    console.log('========================================');
    console.log('');
})();