// INTERCONNECT ローカルサーバー
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの配信
app.use(express.static(path.join(__dirname)));

// ルート設定
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// SPA対応 - すべてのルートをindex.htmlにリダイレクト
app.get('*', (req, res) => {
    // ファイル拡張子がある場合は404を返す
    if (path.extname(req.path)) {
        return res.status(404).send('File not found');
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🚀 INTERCONNECTサーバーが起動しました！`);
    console.log(`📍 ローカルURL: http://localhost:${PORT}`);
    console.log(`🌐 ネットワークアクセス: http://192.168.1.xxx:${PORT}`);
    console.log(`⏰ 起動時刻: ${new Date().toLocaleString('ja-JP')}`);
});

// グレースフル シャットダウン
process.on('SIGTERM', () => {
    console.log('📤 サーバーを正常終了します...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n📤 サーバーを停止します...');
    process.exit(0);
});