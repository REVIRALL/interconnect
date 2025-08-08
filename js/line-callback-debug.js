/**
 * LINE Callback Debug Script
 * コールバック処理のデバッグ情報を詳細に表示
 */

(function() {
    'use strict';
    
    console.log('🔍 LINE Callback Debug Script Loaded');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 URL Params:', window.location.search);
    
    // URLパラメータの解析
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    console.log('📌 Callback Parameters:');
    console.log('   code:', code ? `${code.substring(0, 10)}...` : 'NOT FOUND');
    console.log('   state:', state ? `${state.substring(0, 10)}...` : 'NOT FOUND');
    console.log('   error:', error || 'none');
    console.log('   error_description:', errorDescription || 'none');
    
    // セッションストレージの確認
    const savedState = sessionStorage.getItem('line_state');
    console.log('📌 Session Storage:');
    console.log('   saved state:', savedState ? `${savedState.substring(0, 10)}...` : 'NOT FOUND');
    console.log('   state match:', state === savedState ? 'YES' : 'NO');
    
    // Supabase状態の確認
    window.addEventListener('supabaseReady', function() {
        console.log('📌 Supabase Status:');
        console.log('   client available:', !!window.supabaseClientClient);
        console.log('   auth available:', !!(window.supabaseClient && window.supabaseClient.auth));
    });
    
    // Supabaseの初期状態もチェック
    console.log('📌 Initial Supabase Status:');
    console.log('   window.supabaseClient:', !!window.supabaseClientClient);
    console.log('   supabaseReady fired:', window._supabaseReady || false);
    
    // Fetch APIの監視
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        const options = args[1] || {};
        
        if (url && url.includes('line-auth')) {
            console.log('📌 LINE Auth API Call:');
            console.log('   URL:', url);
            console.log('   Method:', options.method || 'GET');
            
            if (options.body) {
                try {
                    const body = JSON.parse(options.body);
                    console.log('   Body:', {
                        code: body.code ? `${body.code.substring(0, 10)}...` : undefined,
                        redirect_uri: body.redirect_uri
                    });
                } catch (e) {
                    console.log('   Body:', options.body);
                }
            }
        }
        
        return originalFetch.apply(this, args).then(response => {
            if (url && url.includes('line-auth')) {
                const clonedResponse = response.clone();
                console.log('📌 LINE Auth API Response:');
                console.log('   Status:', response.status);
                console.log('   Status Text:', response.statusText);
                console.log('   OK:', response.ok);
                
                clonedResponse.text().then(text => {
                    try {
                        const data = JSON.parse(text);
                        console.log('   Response Data:', data);
                        
                        if (data.error) {
                            console.error('   ❌ Error:', data.error);
                            console.error('   Details:', data.details);
                        }
                    } catch (e) {
                        console.log('   Response Text:', text);
                    }
                });
            }
            return response;
        }).catch(error => {
            if (url && url.includes('line-auth')) {
                console.error('📌 LINE Auth API Error:');
                console.error('   Error:', error);
            }
            throw error;
        });
    };
    
    // エラー表示の監視
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                const errorDiv = document.getElementById('errorMessage');
                if (errorDiv && errorDiv.style.display !== 'none' && errorDiv.textContent) {
                    console.error('📌 Error Message Displayed:', errorDiv.textContent);
                }
            }
        });
    });
    
    // DOMが準備できたら監視開始
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            const errorDiv = document.getElementById('errorMessage');
            if (errorDiv) {
                observer.observe(errorDiv, { 
                    childList: true, 
                    characterData: true, 
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style']
                });
            }
        });
    } else {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            observer.observe(errorDiv, { 
                childList: true, 
                characterData: true, 
                subtree: true,
                attributes: true,
                attributeFilter: ['style']
            });
        }
    }
    
})();