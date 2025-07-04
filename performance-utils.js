// パフォーマンス最適化ユーティリティ

// デバウンス関数
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// スロットル関数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// メモ化関数
function memoize(fn, resolver) {
    const cache = new Map();
    const memoized = function(...args) {
        const key = resolver ? resolver(...args) : JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = fn.apply(this, args);
        cache.set(key, result);
        
        // キャッシュサイズ制限（1000エントリー）
        if (cache.size > 1000) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        
        return result;
    };
    
    memoized.cache = cache;
    memoized.clear = () => cache.clear();
    
    return memoized;
}

// 遅延読み込み用のIntersection Observer
class LazyLoader {
    constructor(options = {}) {
        this.options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.01,
            ...options
        };
        
        this.observer = new IntersectionObserver(
            this.handleIntersect.bind(this),
            this.options
        );
        
        this.callbacks = new WeakMap();
    }
    
    handleIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const callback = this.callbacks.get(entry.target);
                if (callback) {
                    callback(entry.target);
                    this.observer.unobserve(entry.target);
                    this.callbacks.delete(entry.target);
                }
            }
        });
    }
    
    observe(element, callback) {
        this.callbacks.set(element, callback);
        this.observer.observe(element);
    }
    
    unobserve(element) {
        this.observer.unobserve(element);
        this.callbacks.delete(element);
    }
    
    disconnect() {
        this.observer.disconnect();
        this.callbacks = new WeakMap();
    }
}

// 画像の遅延読み込み
function setupLazyImages() {
    const lazyLoader = new LazyLoader();
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        lazyLoader.observe(img, (element) => {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
            element.classList.add('loaded');
        });
    });
}

// リクエストアニメーションフレームによる最適化
function rafThrottle(callback) {
    let requestId = null;
    
    return function(...args) {
        if (requestId) {
            cancelAnimationFrame(requestId);
        }
        
        requestId = requestAnimationFrame(() => {
            callback.apply(this, args);
            requestId = null;
        });
    };
}

// バッチ処理用のキュー
class BatchQueue {
    constructor(processor, batchSize = 10, delay = 100) {
        this.processor = processor;
        this.batchSize = batchSize;
        this.delay = delay;
        this.queue = [];
        this.timeout = null;
    }
    
    add(item) {
        this.queue.push(item);
        
        if (this.queue.length >= this.batchSize) {
            this.flush();
        } else {
            this.scheduleFlush();
        }
    }
    
    scheduleFlush() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        
        this.timeout = setTimeout(() => {
            this.flush();
        }, this.delay);
    }
    
    flush() {
        if (this.queue.length === 0) return;
        
        const batch = this.queue.splice(0, this.batchSize);
        this.processor(batch);
        
        if (this.queue.length > 0) {
            this.scheduleFlush();
        }
    }
    
    clear() {
        this.queue = [];
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}

// Web Worker用のヘルパー
class WorkerPool {
    constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) {
        this.workers = [];
        this.queue = [];
        this.poolSize = poolSize;
        
        for (let i = 0; i < poolSize; i++) {
            const worker = new Worker(workerScript);
            worker.onmessage = this.handleWorkerMessage.bind(this, i);
            this.workers.push({
                worker,
                busy: false,
                resolver: null
            });
        }
    }
    
    handleWorkerMessage(workerIndex, event) {
        const workerInfo = this.workers[workerIndex];
        if (workerInfo.resolver) {
            workerInfo.resolver(event.data);
            workerInfo.resolver = null;
        }
        workerInfo.busy = false;
        this.processQueue();
    }
    
    execute(data) {
        return new Promise((resolve) => {
            this.queue.push({ data, resolve });
            this.processQueue();
        });
    }
    
    processQueue() {
        if (this.queue.length === 0) return;
        
        const availableWorker = this.workers.find(w => !w.busy);
        if (!availableWorker) return;
        
        const { data, resolve } = this.queue.shift();
        availableWorker.busy = true;
        availableWorker.resolver = resolve;
        availableWorker.worker.postMessage(data);
    }
    
    terminate() {
        this.workers.forEach(w => w.worker.terminate());
        this.workers = [];
        this.queue = [];
    }
}

// パフォーマンス計測
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
    }
    
    startMeasure(name) {
        performance.mark(`${name}-start`);
    }
    
    endMeasure(name) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        const measure = performance.getEntriesByName(name, 'measure')[0];
        if (measure) {
            const metrics = this.metrics.get(name) || [];
            metrics.push(measure.duration);
            this.metrics.set(name, metrics);
            
            // 最大100件まで保持
            if (metrics.length > 100) {
                metrics.shift();
            }
        }
        
        // マークをクリーンアップ
        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
        performance.clearMeasures(name);
    }
    
    getAverageTime(name) {
        const metrics = this.metrics.get(name);
        if (!metrics || metrics.length === 0) return 0;
        
        const sum = metrics.reduce((acc, val) => acc + val, 0);
        return sum / metrics.length;
    }
    
    getReport() {
        const report = {};
        this.metrics.forEach((values, name) => {
            report[name] = {
                count: values.length,
                average: this.getAverageTime(name),
                min: Math.min(...values),
                max: Math.max(...values)
            };
        });
        return report;
    }
    
    clear() {
        this.metrics.clear();
    }
}

// グローバルに公開
window.PerformanceUtils = {
    debounce,
    throttle,
    memoize,
    rafThrottle,
    LazyLoader,
    BatchQueue,
    WorkerPool,
    PerformanceMonitor,
    setupLazyImages
};

// 自動的に画像の遅延読み込みを設定
document.addEventListener('DOMContentLoaded', setupLazyImages);