// 画像の遅延読み込みとパフォーマンス最適化

class LazyLoadManager {
    constructor() {
        this.imageObserver = null;
        this.loadedImages = new Set();
        this.pendingImages = new Map();
        this.options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.01
        };
        
        this.initialize();
    }

    initialize() {
        // Intersection Observer のサポートチェック
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // フォールバック：スクロールイベントを使用
            this.setupScrollListener();
        }
        
        // 初期画像の収集と処理
        this.collectImages();
        
        // 動的に追加される画像の監視
        this.observeDynamicImages();
        
        // プリロード設定
        this.setupPreloading();
    }

    // Intersection Observer の設定
    setupIntersectionObserver() {
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                }
            });
        }, this.options);
    }

    // スクロールリスナーの設定（フォールバック）
    setupScrollListener() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.checkVisibleImages();
            }, 100);
        }, { passive: true });
        
        // 初回チェック
        this.checkVisibleImages();
    }

    // 画像の収集
    collectImages() {
        // data-src 属性を持つ画像
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        // 背景画像用の要素
        const lazyBackgrounds = document.querySelectorAll('[data-bg-src]');
        
        // picture 要素内の source
        const lazySources = document.querySelectorAll('source[data-srcset]');
        
        // 画像の処理
        lazyImages.forEach(img => {
            this.processImage(img);
        });
        
        // 背景画像の処理
        lazyBackgrounds.forEach(element => {
            this.processBackgroundImage(element);
        });
        
        // source 要素の処理
        lazySources.forEach(source => {
            this.processSource(source);
        });
    }

    // 画像の処理
    processImage(img) {
        // プレースホルダーの設定
        if (!img.src) {
            img.src = this.generatePlaceholder(img);
        }
        
        // エラーハンドリング
        img.addEventListener('error', () => this.handleImageError(img));
        
        // 読み込み完了時の処理
        img.addEventListener('load', () => this.handleImageLoad(img));
        
        // Observer に追加
        if (this.imageObserver) {
            this.imageObserver.observe(img);
        }
    }

    // 背景画像の処理
    processBackgroundImage(element) {
        if (this.imageObserver) {
            this.imageObserver.observe(element);
        }
    }

    // source 要素の処理
    processSource(source) {
        const picture = source.closest('picture');
        if (picture && this.imageObserver) {
            this.imageObserver.observe(picture);
        }
    }

    // 画像の読み込み
    loadImage(element) {
        if (element.tagName === 'IMG') {
            this.loadImgElement(element);
        } else if (element.hasAttribute('data-bg-src')) {
            this.loadBackgroundImage(element);
        } else if (element.tagName === 'PICTURE') {
            this.loadPictureElement(element);
        }
    }

    // img 要素の読み込み
    loadImgElement(img) {
        const src = img.getAttribute('data-src');
        if (!src || this.loadedImages.has(src)) return;
        
        // プログレッシブ読み込み
        const lowQualitySrc = img.getAttribute('data-low-src');
        if (lowQualitySrc && !img.classList.contains('low-loaded')) {
            this.loadLowQualityImage(img, lowQualitySrc);
        }
        
        // 高画質画像の読み込み
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.removeAttribute('data-src');
            this.loadedImages.add(src);
            
            if (this.imageObserver) {
                this.imageObserver.unobserve(img);
            }
        };
        
        tempImg.onerror = () => {
            this.handleImageError(img);
        };
        
        tempImg.src = src;
    }

    // 低画質画像の読み込み
    loadLowQualityImage(img, lowSrc) {
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = lowSrc;
            img.classList.add('low-loaded');
            img.style.filter = 'blur(5px)';
            img.style.transition = 'filter 0.3s';
        };
        tempImg.src = lowSrc;
    }

    // 背景画像の読み込み
    loadBackgroundImage(element) {
        const src = element.getAttribute('data-bg-src');
        if (!src || this.loadedImages.has(src)) return;
        
        const tempImg = new Image();
        tempImg.onload = () => {
            element.style.backgroundImage = `url(${src})`;
            element.removeAttribute('data-bg-src');
            element.classList.add('bg-loaded');
            this.loadedImages.add(src);
            
            if (this.imageObserver) {
                this.imageObserver.unobserve(element);
            }
        };
        
        tempImg.src = src;
    }

    // picture 要素の読み込み
    loadPictureElement(picture) {
        const sources = picture.querySelectorAll('source[data-srcset]');
        const img = picture.querySelector('img');
        
        sources.forEach(source => {
            const srcset = source.getAttribute('data-srcset');
            if (srcset) {
                source.srcset = srcset;
                source.removeAttribute('data-srcset');
            }
        });
        
        if (img && img.hasAttribute('data-src')) {
            this.loadImgElement(img);
        }
    }

    // 画像読み込み完了時の処理
    handleImageLoad(img) {
        img.classList.add('loaded');
        
        // ブラー効果の除去
        if (img.classList.contains('low-loaded')) {
            img.style.filter = 'none';
        }
        
        // アニメーション
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            img.style.opacity = '1';
        }, 10);
    }

    // 画像読み込みエラー時の処理（エラーを静音化）
    handleImageError(img) {
        // ローカルで生成したSVGフォールバック画像を使用
        const width = img.width || 300;
        const height = img.height || 150;
        const fallbackSrc = this.generateSVGPlaceholder(width, height, 'イメージ');
        
        img.src = fallbackSrc;
        img.classList.add('error');
        
        // コンソールエラーを無効化
        // console.error('Image failed to load:', img.getAttribute('data-src') || img.src);
    }
    
    // SVGプレースホルダー生成
    generateSVGPlaceholder(width, height, text = 'No Image') {
        const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#e0e0e0"/>
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#999" font-family="Arial, sans-serif" font-size="14">${text}</text>
        </svg>`;
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    // プレースホルダーの生成
    generatePlaceholder(img) {
        const width = img.getAttribute('width') || 400;
        const height = img.getAttribute('height') || 300;
        
        // Base64エンコードされた1x1の透明PNG
        const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        
        // アスペクト比を保持するためのプレースホルダー
        if (img.classList.contains('aspect-ratio')) {
            const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f0f0f0"/>
            </svg>`;
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        }
        
        return transparentPixel;
    }

    // 表示範囲内の画像をチェック（フォールバック用）
    checkVisibleImages() {
        const images = document.querySelectorAll('img[data-src], [data-bg-src]');
        
        images.forEach(element => {
            if (this.isElementInViewport(element)) {
                this.loadImage(element);
            }
        });
    }

    // 要素が表示範囲内にあるかチェック
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top <= windowHeight + 50 &&
            rect.bottom >= -50 &&
            rect.left <= windowWidth + 50 &&
            rect.right >= -50
        );
    }

    // 動的に追加される画像の監視
    observeDynamicImages() {
        // MutationObserver でDOM変更を監視
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.tagName === 'IMG' && node.hasAttribute('data-src')) {
                            this.processImage(node);
                        } else {
                            // 子要素もチェック
                            const images = node.querySelectorAll('img[data-src], [data-bg-src]');
                            images.forEach(img => this.processImage(img));
                        }
                    }
                });
            });
        });
        
        // document.bodyが利用可能であることを確認
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            // DOM読み込み完了まで待機
            document.addEventListener('DOMContentLoaded', () => {
                if (document.body) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }
            });
        }
    }

    // 優先的に読み込む画像の設定
    setupPreloading() {
        // ヒーロー画像など重要な画像を先読み
        const priorityImages = document.querySelectorAll('[data-priority="high"]');
        
        priorityImages.forEach(img => {
            if (img.hasAttribute('data-src')) {
                this.loadImage(img);
            }
        });
    }

    // 特定の画像を即座に読み込む
    loadImageImmediately(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            this.loadImage(element);
        });
    }

    // パフォーマンス最適化：画像のプリロード
    preloadImages(urls) {
        urls.forEach(url => {
            if (!this.loadedImages.has(url)) {
                const img = new Image();
                img.onload = () => this.loadedImages.add(url);
                img.src = url;
            }
        });
    }

    // リソースヒントの追加
    addResourceHints(urls, type = 'prefetch') {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = type; // prefetch, preload, dns-prefetch
            link.href = url;
            
            if (type === 'preload') {
                link.as = 'image';
            }
            
            document.head.appendChild(link);
        });
    }

    // すべての画像の読み込みを強制
    forceLoadAll() {
        const allImages = document.querySelectorAll('img[data-src], [data-bg-src]');
        allImages.forEach(element => {
            this.loadImage(element);
        });
    }

    // クリーンアップ
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        
        this.loadedImages.clear();
        this.pendingImages.clear();
    }
}

// 画像最適化ユーティリティ
class ImageOptimizer {
    constructor() {
        this.supportedFormats = this.detectSupportedFormats();
    }

    // サポートされている画像形式の検出
    detectSupportedFormats() {
        const formats = {
            webp: false,
            avif: false
        };
        
        // WebP サポートチェック
        const webpCanvas = document.createElement('canvas');
        webpCanvas.width = webpCanvas.height = 1;
        formats.webp = webpCanvas.toDataURL('image/webp').indexOf('image/webp') === 5;
        
        // AVIF サポートチェック（簡易版）
        // 実際の実装では、より詳細なチェックが必要
        formats.avif = false; // 現時点では false
        
        return formats;
    }

    // 最適な画像URLの取得
    getOptimalImageUrl(baseUrl, options = {}) {
        const { width, quality = 80 } = options;
        
        // CDNやイメージ最適化サービスを使用する場合
        if (baseUrl.includes('cloudinary.com')) {
            return this.getCloudinaryUrl(baseUrl, options);
        }
        
        // WebP対応
        if (this.supportedFormats.webp && baseUrl.match(/\.(jpg|jpeg|png)$/i)) {
            return baseUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        
        return baseUrl;
    }

    // Cloudinary URL の生成（例）
    getCloudinaryUrl(baseUrl, options) {
        const { width, height, quality = 'auto', format = 'auto' } = options;
        const transformations = [];
        
        if (width) transformations.push(`w_${width}`);
        if (height) transformations.push(`h_${height}`);
        transformations.push(`q_${quality}`);
        transformations.push(`f_${format}`);
        
        const transformString = transformations.join(',');
        return baseUrl.replace('/upload/', `/upload/${transformString}/`);
    }
}

// グローバルインスタンス
const lazyLoadManager = new LazyLoadManager();
const imageOptimizer = new ImageOptimizer();

// 手動での画像読み込みトリガー
window.loadImages = (selector) => {
    lazyLoadManager.loadImageImmediately(selector);
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LazyLoadManager, ImageOptimizer };
}