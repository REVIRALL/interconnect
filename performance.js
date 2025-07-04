// パフォーマンス最適化ユーティリティ

class PerformanceOptimizer {
    constructor() {
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
        this.rafCallbacks = new Map();
        this.idleCallbacks = [];
        
        this.initialize();
    }

    initialize() {
        // パフォーマンス監視の設定
        this.setupPerformanceObserver();
        
        // スクロールパフォーマンスの最適化
        this.optimizeScrollPerformance();
        
        // アニメーションの最適化
        this.optimizeAnimations();
        
        // リソースの優先度設定
        this.setupResourcePriorities();
        
        // メモリリークの防止
        this.setupMemoryManagement();
    }

    // デバウンス関数
    debounce(func, wait, immediate = false) {
        const key = func.toString();
        
        return (...args) => {
            const later = () => {
                this.debounceTimers.delete(key);
                if (!immediate) func.apply(this, args);
            };
            
            const callNow = immediate && !this.debounceTimers.has(key);
            
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            
            this.debounceTimers.set(key, setTimeout(later, wait));
            
            if (callNow) func.apply(this, args);
        };
    }

    // スロットル関数
    throttle(func, limit) {
        const key = func.toString();
        let inThrottle = false;
        
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                
                this.throttleTimers.set(key, setTimeout(() => {
                    inThrottle = false;
                    this.throttleTimers.delete(key);
                }, limit));
            }
        };
    }

    // requestAnimationFrame の最適化
    rafThrottle(func) {
        const key = func.toString();
        
        return (...args) => {
            if (!this.rafCallbacks.has(key)) {
                this.rafCallbacks.set(key, requestAnimationFrame(() => {
                    func.apply(this, args);
                    this.rafCallbacks.delete(key);
                }));
            }
        };
    }

    // requestIdleCallback のポリフィル付き実装
    scheduleIdleTask(callback, options = {}) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback, options);
        } else {
            // フォールバック
            setTimeout(() => {
                callback({
                    didTimeout: false,
                    timeRemaining: () => 50
                });
            }, 1);
        }
    }

    // パフォーマンスオブザーバーの設定
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Long Task の監視
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.warn('Long Task detected:', {
                            duration: entry.duration,
                            startTime: entry.startTime,
                            attribution: entry.attribution
                        });
                    }
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.log('Long Task API not supported');
            }

            // Layout Shift の監視
            try {
                const layoutShiftObserver = new PerformanceObserver((list) => {
                    let totalShift = 0;
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            totalShift += entry.value;
                        }
                    }
                    if (totalShift > 0.1) {
                        console.warn('Cumulative Layout Shift:', totalShift);
                    }
                });
                layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.log('Layout Shift API not supported');
            }
        }
    }

    // スクロールパフォーマンスの最適化
    optimizeScrollPerformance() {
        let ticking = false;
        
        const updateScrollPosition = () => {
            // スクロール位置に基づく処理
            const scrollY = window.scrollY;
            
            // ヘッダーの固定/非固定
            const header = document.querySelector('header');
            if (header) {
                if (scrollY > 100) {
                    header.classList.add('fixed');
                } else {
                    header.classList.remove('fixed');
                }
            }
            
            // パララックス効果（必要な場合）
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            parallaxElements.forEach(element => {
                const speed = element.dataset.parallax || 0.5;
                const yPos = -(scrollY * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        };
        
        // パッシブリスナーを使用
        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // アニメーションの最適化
    optimizeAnimations() {
        // CSS アニメーションの最適化
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        animatedElements.forEach(element => {
            animationObserver.observe(element);
        });
        
        // will-change の自動管理
        document.addEventListener('animationstart', (e) => {
            e.target.style.willChange = 'transform, opacity';
        });
        
        document.addEventListener('animationend', (e) => {
            e.target.style.willChange = 'auto';
        });
    }

    // リソースの優先度設定
    setupResourcePriorities() {
        // 重要なリソースのプリロード
        const criticalResources = [
            { href: '/styles.css', as: 'style' },
            { href: '/fonts/NotoSansJP-Regular.woff2', as: 'font', type: 'font/woff2', crossorigin: true }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            
            if (resource.type) link.type = resource.type;
            if (resource.crossorigin) link.crossOrigin = 'anonymous';
            
            document.head.appendChild(link);
        });
        
        // 非クリティカルなCSSの遅延読み込み
        const lazyStyles = document.querySelectorAll('link[data-lazy]');
        lazyStyles.forEach(link => {
            this.scheduleIdleTask(() => {
                link.media = 'all';
            });
        });
    }

    // メモリ管理
    setupMemoryManagement() {
        // イベントリスナーの自動クリーンアップ
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        const listeners = new WeakMap();
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (!listeners.has(this)) {
                listeners.set(this, new Map());
            }
            
            const elementListeners = listeners.get(this);
            if (!elementListeners.has(type)) {
                elementListeners.set(type, new Set());
            }
            
            elementListeners.get(type).add(listener);
            
            originalAddEventListener.call(this, type, listener, options);
        };
        
        // 定期的なガベージコレクション促進
        setInterval(() => {
            // 不要なタイマーのクリア
            this.cleanupTimers();
            
            // 大きなデータの解放
            this.releaseUnusedData();
        }, 60000); // 1分ごと
    }

    // タイマーのクリーンアップ
    cleanupTimers() {
        // 古いデバウンスタイマーをクリア
        this.debounceTimers.forEach((timer, key) => {
            clearTimeout(timer);
        });
        this.debounceTimers.clear();
        
        // 古いスロットルタイマーをクリア
        this.throttleTimers.forEach((timer, key) => {
            clearTimeout(timer);
        });
        this.throttleTimers.clear();
    }

    // 未使用データの解放
    releaseUnusedData() {
        // DOMから削除された要素の参照をクリア
        const allElements = document.querySelectorAll('*');
        const activeElements = new Set(allElements);
        
        // キャッシュのクリーンアップなど
        if (window.caches) {
            this.cleanupCache();
        }
    }

    // キャッシュのクリーンアップ
    async cleanupCache() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            const cacheWhitelist = ['v1-static-assets', 'v1-api-cache'];
            
            await Promise.all(
                cacheNames.map(async (cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        await caches.delete(cacheName);
                    }
                })
            );
        }
    }

    // 仮想スクロール実装（大量のデータ表示用）
    createVirtualScroller(container, items, itemHeight, renderItem) {
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
        
        const visibleItems = items.slice(startIndex, endIndex);
        
        // スペーサーの高さ
        const topSpacerHeight = startIndex * itemHeight;
        const bottomSpacerHeight = (items.length - endIndex) * itemHeight;
        
        // レンダリング
        container.innerHTML = '';
        
        const topSpacer = document.createElement('div');
        topSpacer.style.height = `${topSpacerHeight}px`;
        container.appendChild(topSpacer);
        
        visibleItems.forEach((item, index) => {
            const element = renderItem(item, startIndex + index);
            container.appendChild(element);
        });
        
        const bottomSpacer = document.createElement('div');
        bottomSpacer.style.height = `${bottomSpacerHeight}px`;
        container.appendChild(bottomSpacer);
    }

    // Web Worker を使用した重い処理のオフロード
    runInWorker(func, data) {
        return new Promise((resolve, reject) => {
            const blob = new Blob([`
                self.onmessage = function(e) {
                    const func = ${func.toString()};
                    const result = func(e.data);
                    self.postMessage(result);
                };
            `], { type: 'application/javascript' });
            
            const worker = new Worker(URL.createObjectURL(blob));
            
            worker.onmessage = (e) => {
                resolve(e.data);
                worker.terminate();
            };
            
            worker.onerror = (error) => {
                reject(error);
                worker.terminate();
            };
            
            worker.postMessage(data);
        });
    }

    // FPS モニター
    startFPSMonitor() {
        let lastTime = performance.now();
        let frames = 0;
        let fps = 0;
        
        const updateFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                
                // FPS が低い場合の警告
                if (fps < 30) {
                    console.warn('Low FPS detected:', fps);
                }
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        updateFPS();
    }

    // メトリクスの取得
    getPerformanceMetrics() {
        const metrics = {
            memory: {},
            timing: {},
            resources: []
        };
        
        // メモリ使用量
        if (performance.memory) {
            metrics.memory = {
                usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
                jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
            };
        }
        
        // タイミング情報
        if (performance.timing) {
            const timing = performance.timing;
            metrics.timing = {
                pageLoadTime: timing.loadEventEnd - timing.navigationStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
            };
        }
        
        // リソース情報
        const resources = performance.getEntriesByType('resource');
        metrics.resources = resources.slice(-10).map(resource => ({
            name: resource.name.split('/').pop(),
            duration: resource.duration.toFixed(2),
            size: resource.transferSize
        }));
        
        return metrics;
    }
}

// Service Worker 登録（オフライン対応とキャッシング）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}

// グローバルインスタンス
const performanceOptimizer = new PerformanceOptimizer();

// パフォーマンス最適化のエクスポート
window.perf = {
    debounce: performanceOptimizer.debounce.bind(performanceOptimizer),
    throttle: performanceOptimizer.throttle.bind(performanceOptimizer),
    rafThrottle: performanceOptimizer.rafThrottle.bind(performanceOptimizer),
    getMetrics: performanceOptimizer.getPerformanceMetrics.bind(performanceOptimizer)
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}