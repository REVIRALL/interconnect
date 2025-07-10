#!/usr/bin/env node

/**
 * Render自動デプロイスクリプト
 * 手動でRenderデプロイを実行するためのスクリプト
 */

const https = require('https');

// 設定
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID;

if (!RENDER_API_KEY || !RENDER_SERVICE_ID) {
    console.error('❌ 環境変数が設定されていません:');
    console.error('   RENDER_API_KEY');
    console.error('   RENDER_SERVICE_ID');
    console.error('');
    console.error('設定方法:');
    console.error('   export RENDER_API_KEY="your_api_key"');
    console.error('   export RENDER_SERVICE_ID="your_service_id"');
    process.exit(1);
}

console.log('🚀 Renderデプロイを開始...');

// デプロイリクエストのデータ
const deployData = JSON.stringify({
    clearCache: 'clear'
});

// HTTPSリクエストオプション
const options = {
    hostname: 'api.render.com',
    port: 443,
    path: `/v1/services/${RENDER_SERVICE_ID}/deploys`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': deployData.length
    }
};

// デプロイリクエスト実行
const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 201) {
                console.log('✅ デプロイが正常に開始されました!');
                console.log(`📦 Deploy ID: ${response.id}`);
                console.log(`🌐 サービスURL: https://interconnect.onrender.com`);
                console.log('');
                console.log('📊 デプロイ状況は以下で確認できます:');
                console.log(`   https://dashboard.render.com/web/${RENDER_SERVICE_ID}`);
                
                // ヘルスチェック
                setTimeout(healthCheck, 30000);
                
            } else {
                console.error('❌ デプロイエラー:', res.statusCode);
                console.error('詳細:', data);
            }
        } catch (error) {
            console.error('❌ レスポンス解析エラー:', error.message);
            console.error('レスポンス:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ リクエストエラー:', error.message);
});

// リクエスト送信
req.write(deployData);
req.end();

// ヘルスチェック関数
function healthCheck() {
    console.log('🏥 ヘルスチェック実行中...');
    
    const healthOptions = {
        hostname: 'interconnect.onrender.com',
        port: 443,
        path: '/',
        method: 'GET',
        timeout: 10000
    };
    
    const healthReq = https.request(healthOptions, (res) => {
        if (res.statusCode === 200) {
            console.log('✅ サイトが正常に動作しています!');
            console.log('🎉 デプロイ完了!');
        } else {
            console.log(`⚠️ サイトステータス: ${res.statusCode}`);
            console.log('サイトがまだデプロイ中の可能性があります');
        }
    });
    
    healthReq.on('error', (error) => {
        console.log('⚠️ ヘルスチェック失敗:', error.message);
        console.log('サイトがまだデプロイ中の可能性があります');
    });
    
    healthReq.on('timeout', () => {
        console.log('⚠️ ヘルスチェックタイムアウト');
        console.log('サイトがまだデプロイ中の可能性があります');
    });
    
    healthReq.end();
}