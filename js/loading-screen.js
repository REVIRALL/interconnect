/**
 * ローディング画面制御
 */

document.addEventListener('DOMContentLoaded', function() {
    // ローディング画面の要素を作成
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.innerHTML = `
        <div class="loading-video-container">
            <video class="loading-video" autoplay muted playsinline preload="auto" webkit-playsinline>
                <source src="assets/interconnect-top.mp4" type="video/mp4">
            </video>
            <div class="loading-overlay"></div>
            <div class="loading-text">INTER CONNECT</div>
            <div class="loading-progress">
                <div class="loading-progress-bar"></div>
            </div>
        </div>
    `;

    // ボディに追加
    document.body.appendChild(loadingScreen);
    document.body.classList.add('loading');

    // ビデオ要素を取得
    const loadingVideo = loadingScreen.querySelector('.loading-video');
    const loadingOverlay = loadingScreen.querySelector('.loading-overlay');
    const progressBar = loadingScreen.querySelector('.loading-progress-bar');

    // ビデオを2倍速に設定
    if (loadingVideo) {
        loadingVideo.playbackRate = 2.0;
        
        // モバイルでの再生を強制
        loadingVideo.play().catch(error => {
            console.log('Video autoplay failed:', error);
            // ビデオが再生できない場合でもローディング画面を表示
        });
        
        // プログレスバーのアニメーション
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 100);

        // ローディング完了フラグ
        let loadingCompleted = false;
        
        // ビデオの再生時間を監視
        const checkVideoProgress = setInterval(() => {
            // 要素が存在しない場合はクリア
            if (!loadingVideo || !document.contains(loadingVideo) || loadingCompleted) {
                clearInterval(checkVideoProgress);
                return;
            }
            
            if (loadingVideo.duration && loadingVideo.currentTime > 0) {
                const progress = (loadingVideo.currentTime / loadingVideo.duration) * 100;
                
                // 80%再生されたらホワイトアウト開始
                if (progress >= 80 && !loadingCompleted) {
                    loadingCompleted = true;
                    clearInterval(checkVideoProgress);
                    loadingOverlay.classList.add('active');
                    
                    // ホワイトアウト完了後、ローディング画面をフェードアウト
                    setTimeout(() => {
                        if (document.contains(loadingScreen)) {
                            loadingScreen.classList.add('fade-out');
                            document.body.classList.remove('loading');
                            
                            // 完全に非表示にする
                            setTimeout(() => {
                                if (document.contains(loadingScreen)) {
                                    loadingScreen.remove();
                                }
                            }, 800);
                        }
                    }, 600);
                }
            }
        }, 50);

        // フォールバック：最大6秒でローディング終了（3秒表示 + フェード時間）
        setTimeout(() => {
            if (!loadingCompleted && document.contains(loadingScreen)) {
                loadingCompleted = true;
                clearInterval(checkVideoProgress);
                loadingOverlay.classList.add('active');
                
                setTimeout(() => {
                    if (document.contains(loadingScreen)) {
                        loadingScreen.classList.add('fade-out');
                        document.body.classList.remove('loading');
                        
                        setTimeout(() => {
                            if (document.contains(loadingScreen)) {
                                loadingScreen.remove();
                            }
                        }, 800);
                    }
                }, 600);
            }
        }, 6000);
    } else {
        // ビデオが読み込めない場合は即座に終了
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            document.body.classList.remove('loading');
            
            setTimeout(() => {
                loadingScreen.remove();
            }, 800);
        }, 500);
    }

    // ページ読み込み完了時の処理
    window.addEventListener('load', function() {
        // すべてのリソースが読み込まれたら、最低でも3秒後にはローディング終了
        setTimeout(() => {
            if (!loadingScreen.classList.contains('fade-out')) {
                loadingOverlay.classList.add('active');
                
                setTimeout(() => {
                    loadingScreen.classList.add('fade-out');
                    document.body.classList.remove('loading');
                    
                    setTimeout(() => {
                        loadingScreen.remove();
                    }, 800);
                }, 600);
            }
        }, 3000);
    });
});