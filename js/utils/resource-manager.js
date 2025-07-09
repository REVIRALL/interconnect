/**
 * リソース管理ユーティリティ
 * メモリリークを防ぐためのタイマーとイベントリスナーの管理
 */

class ResourceManager {
    constructor() {
        this.timers = new Set();
        this.listeners = new Set();
        this.observers = new Set();
        
        // ページ離脱時のクリーンアップ
        this.setupCleanupListeners();
    }

    /**
     * 安全なsetInterval
     */
    setInterval(callback, delay) {
        const timerId = setInterval(callback, delay);
        this.timers.add(timerId);
        
        return {
            id: timerId,
            clear: () => {
                clearInterval(timerId);
                this.timers.delete(timerId);
            }
        };
    }

    /**
     * 安全なsetTimeout
     */
    setTimeout(callback, delay) {
        const timerId = setTimeout(() => {
            callback();
            this.timers.delete(timerId);
        }, delay);
        
        this.timers.add(timerId);
        
        return {
            id: timerId,
            clear: () => {
                clearTimeout(timerId);
                this.timers.delete(timerId);
            }
        };
    }

    /**
     * 安全なイベントリスナー追加
     */
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        const listener = {
            element,
            event,
            handler,
            options
        };
        
        this.listeners.add(listener);
        
        return {
            remove: () => {
                element.removeEventListener(event, handler, options);
                this.listeners.delete(listener);
            }
        };
    }

    /**
     * 安全なObserver追加
     */
    addObserver(observer) {
        this.observers.add(observer);
        
        return {
            disconnect: () => {
                observer.disconnect();
                this.observers.delete(observer);
            }
        };
    }

    /**
     * 全リソースのクリーンアップ
     */
    cleanup() {
        // タイマーのクリーンアップ
        this.timers.forEach(timerId => {
            clearInterval(timerId);
            clearTimeout(timerId);
        });
        this.timers.clear();

        // イベントリスナーのクリーンアップ
        this.listeners.forEach(listener => {
            listener.element.removeEventListener(
                listener.event,
                listener.handler,
                listener.options
            );
        });
        this.listeners.clear();

        // Observerのクリーンアップ
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();

        console.log('🧹 All resources cleaned up');
    }

    /**
     * クリーンアップリスナーの設定
     */
    setupCleanupListeners() {
        // ページ離脱時
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // ページ非表示時（モバイル対応）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 必要に応じて一部リソースを一時停止
                this.pauseTimers();
            } else {
                this.resumeTimers();
            }
        });
    }

    /**
     * タイマーの一時停止
     */
    pauseTimers() {
        this.pausedTimers = new Set();
        this.timers.forEach(timerId => {
            clearInterval(timerId);
            clearTimeout(timerId);
            this.pausedTimers.add(timerId);
        });
    }

    /**
     * タイマーの再開
     */
    resumeTimers() {
        // 実装は必要に応じて
        this.pausedTimers?.clear();
    }

    /**
     * リソース使用状況の報告
     */
    getResourceStats() {
        return {
            timers: this.timers.size,
            listeners: this.listeners.size,
            observers: this.observers.size,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : 'Not available'
        };
    }

    /**
     * メモリリーク検出
     */
    detectMemoryLeaks() {
        const stats = this.getResourceStats();
        const warnings = [];

        if (stats.timers > 10) {
            warnings.push(`⚠️ 多数のタイマーが検出されました: ${stats.timers}個`);
        }

        if (stats.listeners > 50) {
            warnings.push(`⚠️ 多数のイベントリスナーが検出されました: ${stats.listeners}個`);
        }

        if (stats.memoryUsage && stats.memoryUsage.used > 100) {
            warnings.push(`⚠️ 高いメモリ使用量: ${stats.memoryUsage.used}MB`);
        }

        return warnings;
    }
}

// グローバルインスタンス
window.resourceManager = new ResourceManager();

// 使用例の関数を追加
window.safeSetInterval = (callback, delay) => window.resourceManager.setInterval(callback, delay);
window.safeSetTimeout = (callback, delay) => window.resourceManager.setTimeout(callback, delay);
window.safeAddEventListener = (element, event, handler, options) => 
    window.resourceManager.addEventListener(element, event, handler, options);