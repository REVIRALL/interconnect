/**
 * 通知ドロップダウン重複問題修正
 * 動的に追加される重複ドロップダウンを防止
 */

(function() {
    'use strict';

    console.log('[NotificationFix] 通知重複修正モジュール初期化');

    // DOMContentLoaded時に実行
    document.addEventListener('DOMContentLoaded', function() {
        fixNotificationDuplication();
        preventDynamicDuplication();
    });

    /**
     * 既存の重複を修正
     */
    function fixNotificationDuplication() {
        // notification-wrapper内の重複チェック
        const wrappers = document.querySelectorAll('.notification-wrapper');
        
        wrappers.forEach(wrapper => {
            const dropdowns = wrapper.querySelectorAll('.notification-dropdown');
            console.log(`[NotificationFix] ドロップダウン数: ${dropdowns.length}`);
            
            // 2つ以上ある場合、最初の1つ以外を削除
            if (dropdowns.length > 1) {
                console.warn('[NotificationFix] 重複ドロップダウンを検出！削除します');
                
                for (let i = 1; i < dropdowns.length; i++) {
                    // 動的に生成されたものか確認
                    const isDynamic = dropdowns[i].querySelector('.notification-item');
                    
                    if (isDynamic) {
                        // 動的なものを残し、静的なものを削除
                        if (i === 0 && dropdowns[0].querySelector('.empty-notifications')) {
                            dropdowns[0].remove();
                            console.log('[NotificationFix] 静的な空のドロップダウンを削除');
                        }
                    } else {
                        // 動的でないものは削除
                        dropdowns[i].remove();
                        console.log('[NotificationFix] 重複ドロップダウンを削除');
                    }
                }
            }
            
            // インラインスタイルで追加された重複要素も削除
            const inlineWrappers = wrapper.querySelectorAll('div[style*="position: relative"]');
            if (inlineWrappers.length > 0) {
                inlineWrappers.forEach(inlineWrapper => {
                    // 子要素を直接wrapperに移動
                    while (inlineWrapper.firstChild) {
                        wrapper.appendChild(inlineWrapper.firstChild);
                    }
                    inlineWrapper.remove();
                });
                console.log('[NotificationFix] インラインスタイルの不要なラッパーを削除');
            }
        });
    }

    /**
     * 動的な重複生成を防止
     */
    function preventDynamicDuplication() {
        // MutationObserverで監視
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            // notification-dropdown追加を検出
                            if (node.classList && node.classList.contains('notification-dropdown')) {
                                const parent = node.parentElement;
                                const existingDropdowns = parent.querySelectorAll('.notification-dropdown');
                                
                                if (existingDropdowns.length > 1) {
                                    console.warn('[NotificationFix] 動的な重複ドロップダウンを防止');
                                    // 最新のものを残して古いものを削除
                                    for (let i = 0; i < existingDropdowns.length - 1; i++) {
                                        existingDropdowns[i].remove();
                                    }
                                }
                            }
                            
                            // 不要なインラインスタイルラッパーも防止
                            if (node.tagName === 'DIV' && 
                                node.style.position === 'relative' && 
                                node.style.display === 'inline-block' &&
                                node.parentElement.classList.contains('notification-wrapper')) {
                                console.warn('[NotificationFix] 不要なインラインラッパーを防止');
                                // 子要素を親に移動
                                const parent = node.parentElement;
                                while (node.firstChild) {
                                    parent.appendChild(node.firstChild);
                                }
                                node.remove();
                            }
                        }
                    });
                }
            });
        });

        // notification-wrapperを監視
        document.querySelectorAll('.notification-wrapper').forEach(wrapper => {
            observer.observe(wrapper, { 
                childList: true, 
                subtree: true 
            });
        });
    }

    /**
     * グローバル関数として公開（デバッグ用）
     */
    window.fixNotificationDuplication = fixNotificationDuplication;

})();