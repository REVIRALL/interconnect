/**
 * 動画再生完全修正スクリプト
 */

console.log('🎬 動画修正スクリプト開始');

// 複数の動画パスを試行
const videoPaths = [
    './assets/interconnect-top.mp4',
    'assets/interconnect-top.mp4',
    'interconnect-top.mp4',
    '/interconnect/assets/interconnect-top.mp4',
    '/assets/interconnect-top.mp4'
];

function fixVideoPlayback() {
    const heroVideo = document.getElementById('heroVideo');
    if (!heroVideo) {
        console.log('❌ 動画要素が見つかりません');
        return;
    }

    console.log('🎬 動画要素発見:', heroVideo);

    // 現在のソースを確認
    const currentSource = heroVideo.querySelector('source');
    if (currentSource) {
        console.log('📹 現在のソース:', currentSource.src);
    }

    // 動画の詳細情報をログ
    console.log('動画情報:', {
        src: heroVideo.currentSrc || heroVideo.src,
        readyState: heroVideo.readyState,
        networkState: heroVideo.networkState,
        error: heroVideo.error
    });

    // 複数のパスを試行
    let pathIndex = 0;
    
    function tryNextPath() {
        if (pathIndex >= videoPaths.length) {
            console.error('❌ 全ての動画パスで失敗');
            return;
        }

        const path = videoPaths[pathIndex];
        console.log(`🔄 動画パス試行 ${pathIndex + 1}/${videoPaths.length}: ${path}`);
        
        // 新しいソース要素を作成
        const newSource = document.createElement('source');
        newSource.src = path;
        newSource.type = 'video/mp4';
        
        // 古いソースを削除
        heroVideo.querySelectorAll('source').forEach(s => s.remove());
        
        // 新しいソースを追加
        heroVideo.appendChild(newSource);
        
        // 動画を再読み込み
        heroVideo.load();
        
        // 再生を試行
        const playPromise = heroVideo.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log(`✅ 動画再生成功: ${path}`);
            }).catch(error => {
                console.warn(`❌ 動画再生失敗 (${path}):`, error.message);
                pathIndex++;
                setTimeout(tryNextPath, 1000);
            });
        }
    }

    // エラーイベントリスナー
    heroVideo.addEventListener('error', function(e) {
        console.error('動画エラーイベント:', e);
        console.error('動画エラー詳細:', heroVideo.error);
        pathIndex++;
        tryNextPath();
    });

    // 成功イベントリスナー
    heroVideo.addEventListener('loadeddata', function() {
        console.log('✅ 動画データ読み込み完了');
    });

    heroVideo.addEventListener('canplay', function() {
        console.log('✅ 動画再生可能');
    });

    heroVideo.addEventListener('playing', function() {
        console.log('✅ 動画再生中');
    });

    // 最初のパスを試行
    tryNextPath();

    // ユーザーインタラクション後の再生
    document.addEventListener('click', function() {
        if (heroVideo.paused) {
            heroVideo.play().then(() => {
                console.log('✅ クリック後動画再生成功');
            }).catch(error => {
                console.log('❌ クリック後動画再生失敗:', error.message);
            });
        }
    }, {once: true});
}

// DOM読み込み完了後に実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixVideoPlayback);
} else {
    fixVideoPlayback();
}

// ページ読み込み完了後にも実行
window.addEventListener('load', function() {
    setTimeout(fixVideoPlayback, 500);
});

console.log('🎬 動画修正スクリプト設定完了');