// パフォーマンスモニタリングダッシュボード

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: [],
            memory: [],
            loadTime: [],
            renderTime: []
        };
        this.monitoring = false;
        this.monitorInterval = null;
        
        this.initialize();
    }

    initialize() {
        // パフォーマンスモニターのUI作成
        this.createMonitorUI();
        
        // Core Web Vitalsの監視
        this.observeCoreWebVitals();
        
        // カスタムメトリクスの追跡
        this.trackCustomMetrics();
    }

    // モニターUIの作成
    createMonitorUI() {
        // 開発環境でのみ表示
        if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
            return;
        }

        const monitorHTML = `
            <div id="performanceMonitor" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: #0f0;
                font-family: monospace;
                font-size: 12px;
                padding: 15px;
                border-radius: 8px;
                min-width: 250px;
                z-index: 10000;
                display: none;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0; font-size: 14px;">Performance Monitor</h4>
                    <button onclick="performanceMonitor.toggleMonitor()" style="
                        background: transparent;
                        border: 1px solid #0f0;
                        color: #0f0;
                        padding: 2px 8px;
                        cursor: pointer;
                        font-size: 10px;
                    ">×</button>
                </div>
                <div id="perfMetrics"></div>
            </div>
            
            <button id="togglePerfMonitor" onclick="performanceMonitor.toggleMonitor()" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: #0f0;
                border: 1px solid #0f0;
                padding: 8px 12px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
                cursor: pointer;
                z-index: 9999;
            ">
                <span style="margin-right: 5px;">⚡</span>Perf
            </button>
        `;

        document.body.insertAdjacentHTML('beforeend', monitorHTML);
    }

    // モニターの表示切替
    toggleMonitor() {
        const monitor = document.getElementById('performanceMonitor');
        const button = document.getElementById('togglePerfMonitor');
        
        if (monitor.style.display === 'none') {
            monitor.style.display = 'block';
            button.style.display = 'none';
            this.startMonitoring();
        } else {
            monitor.style.display = 'none';
            button.style.display = 'block';
            this.stopMonitoring();
        }
    }

    // モニタリング開始
    startMonitoring() {
        this.monitoring = true;
        this.monitorInterval = setInterval(() => {
            this.updateMetrics();
        }, 1000);
        
        // 初回更新
        this.updateMetrics();
    }

    // モニタリング停止
    stopMonitoring() {
        this.monitoring = false;
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
    }

    // メトリクスの更新
    updateMetrics() {
        const metrics = this.collectMetrics();
        const container = document.getElementById('perfMetrics');
        
        if (!container) return;

        container.innerHTML = `
            <div style="margin: 5px 0;">FPS: <span style="color: ${this.getColorForFPS(metrics.fps)}">${metrics.fps}</span></div>
            <div style="margin: 5px 0;">Memory: <span style="color: ${this.getColorForMemory(metrics.memory)}">${metrics.memory} MB</span></div>
            <div style="margin: 5px 0;">DOM Nodes: <span style="color: ${this.getColorForNodes(metrics.domNodes)}">${metrics.domNodes}</span></div>
            <div style="margin: 5px 0;">JS Heap: <span style="color: ${this.getColorForHeap(metrics.jsHeap)}">${metrics.jsHeap}%</span></div>
            <hr style="border: none; border-top: 1px solid #333; margin: 10px 0;">
            <div style="margin: 5px 0;">LCP: <span style="color: ${this.getColorForLCP(metrics.lcp)}">${metrics.lcp}ms</span></div>
            <div style="margin: 5px 0;">FID: <span style="color: ${this.getColorForFID(metrics.fid)}">${metrics.fid}ms</span></div>
            <div style="margin: 5px 0;">CLS: <span style="color: ${this.getColorForCLS(metrics.cls)}">${metrics.cls}</span></div>
            <hr style="border: none; border-top: 1px solid #333; margin: 10px 0;">
            <div style="margin: 5px 0;">Network: <span style="color: #0ff">${metrics.networkRequests} req</span></div>
            <div style="margin: 5px 0;">Cache Hit: <span style="color: #0f0">${metrics.cacheHitRate}%</span></div>
        `;
    }

    // メトリクスの収集
    collectMetrics() {
        const metrics = {
            fps: this.calculateFPS(),
            memory: this.getMemoryUsage(),
            domNodes: document.getElementsByTagName('*').length,
            jsHeap: this.getJSHeapUsage(),
            lcp: this.getLCP(),
            fid: this.getFID(),
            cls: this.getCLS(),
            networkRequests: this.getNetworkRequests(),
            cacheHitRate: this.getCacheHitRate()
        };

        return metrics;
    }

    // FPS計算
    calculateFPS() {
        if (!this.fpsLastTime) {
            this.fpsLastTime = performance.now();
            this.fpsFrames = 0;
            return 0;
        }

        this.fpsFrames++;
        const currentTime = performance.now();
        const elapsed = currentTime - this.fpsLastTime;

        if (elapsed >= 1000) {
            const fps = Math.round((this.fpsFrames * 1000) / elapsed);
            this.fpsFrames = 0;
            this.fpsLastTime = currentTime;
            return fps;
        }

        return this.lastFPS || 0;
    }

    // メモリ使用量取得
    getMemoryUsage() {
        if (performance.memory) {
            return Math.round(performance.memory.usedJSHeapSize / 1048576);
        }
        return 0;
    }

    // JSヒープ使用率
    getJSHeapUsage() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const total = performance.memory.jsHeapSizeLimit;
            return Math.round((used / total) * 100);
        }
        return 0;
    }

    // Core Web Vitals
    getLCP() {
        const entries = performance.getEntriesByType('paint');
        const lcp = entries.find(entry => entry.name === 'largest-contentful-paint');
        return lcp ? Math.round(lcp.startTime) : 0;
    }

    getFID() {
        // First Input Delayの簡易実装
        return this.firstInputDelay || 0;
    }

    getCLS() {
        // Cumulative Layout Shiftの簡易実装
        return this.cumulativeLayoutShift || 0;
    }

    // ネットワークリクエスト数
    getNetworkRequests() {
        const resources = performance.getEntriesByType('resource');
        return resources.length;
    }

    // キャッシュヒット率
    getCacheHitRate() {
        const resources = performance.getEntriesByType('resource');
        const cached = resources.filter(r => r.transferSize === 0 && r.decodedBodySize > 0);
        return resources.length > 0 ? Math.round((cached.length / resources.length) * 100) : 0;
    }

    // Core Web Vitalsの監視
    observeCoreWebVitals() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.lcp = lastEntry.renderTime || lastEntry.loadTime;
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // LCP not supported
            }

            // First Input Delay
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.firstInputDelay = entry.processingStart - entry.startTime;
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                // FID not supported
            }

            // Cumulative Layout Shift
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                            this.cumulativeLayoutShift = clsValue.toFixed(3);
                        }
                    }
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                // CLS not supported
            }
        }
    }

    // カスタムメトリクスの追跡
    trackCustomMetrics() {
        // ページロード時間
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log('Page Load Time:', loadTime + 'ms');
        });

        // Time to Interactive
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        console.log('First Contentful Paint:', entry.startTime + 'ms');
                    }
                }
            });
            observer.observe({ entryTypes: ['paint'] });
        }
    }

    // 色の決定関数
    getColorForFPS(fps) {
        if (fps >= 55) return '#0f0';
        if (fps >= 30) return '#ff0';
        return '#f00';
    }

    getColorForMemory(mb) {
        if (mb < 50) return '#0f0';
        if (mb < 100) return '#ff0';
        return '#f00';
    }

    getColorForNodes(count) {
        if (count < 1500) return '#0f0';
        if (count < 3000) return '#ff0';
        return '#f00';
    }

    getColorForHeap(percent) {
        if (percent < 50) return '#0f0';
        if (percent < 80) return '#ff0';
        return '#f00';
    }

    getColorForLCP(ms) {
        if (ms < 2500) return '#0f0';
        if (ms < 4000) return '#ff0';
        return '#f00';
    }

    getColorForFID(ms) {
        if (ms < 100) return '#0f0';
        if (ms < 300) return '#ff0';
        return '#f00';
    }

    getColorForCLS(score) {
        if (score < 0.1) return '#0f0';
        if (score < 0.25) return '#ff0';
        return '#f00';
    }

    // パフォーマンスレポートの生成
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.collectMetrics(),
            resources: this.getResourceTimings(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        console.log('Performance Report:', report);
        return report;
    }

    // リソースタイミングの取得
    getResourceTimings() {
        const resources = performance.getEntriesByType('resource');
        return resources.slice(-20).map(r => ({
            name: r.name.split('/').pop(),
            duration: Math.round(r.duration),
            size: r.transferSize,
            type: r.initiatorType
        }));
    }
}

// グローバルインスタンス
const performanceMonitor = new PerformanceMonitor();

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}