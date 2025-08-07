/**
 * 紹介ページ共有モーダル修正版
 * 重複定義と機能不全を解決
 */

(function() {
    'use strict';

    console.log('[ShareModalFix] 共有モーダル修正版を初期化');

    // グローバル変数
    let currentShareLink = null;
    let shareModal = null;

    // DOMContentLoaded後に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeShareModal);
    } else {
        initializeShareModal();
    }

    // 初期化関数
    function initializeShareModal() {
        console.log('[ShareModalFix] モーダル初期化開始');
        
        // モーダル要素を取得
        shareModal = document.getElementById('share-modal');
        if (!shareModal) {
            console.error('[ShareModalFix] 共有モーダル要素が見つかりません');
            return;
        }

        // イベントリスナーを設定
        setupModalEventListeners();
        
        // グローバル関数を定義（既存の重複を上書き）
        defineGlobalFunctions();
        
        console.log('[ShareModalFix] モーダル初期化完了');
    }

    // イベントリスナーの設定
    function setupModalEventListeners() {
        // モーダル背景クリックで閉じる
        if (shareModal) {
            shareModal.addEventListener('click', function(e) {
                if (e.target === shareModal) {
                    closeModal();
                }
            });
        }

        // ESCキーで閉じる
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && shareModal && shareModal.classList.contains('active')) {
                closeModal();
            }
        });

        // 閉じるボタンのイベント（inline onclickを上書き）
        const closeButton = shareModal?.querySelector('.close-button');
        if (closeButton) {
            // 既存のonclick属性を削除
            closeButton.removeAttribute('onclick');
            // 新しいイベントリスナーを追加
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }

        // 共有ボタンのイベント（inline onclickを上書き）
        const shareButtons = {
            'twitter': shareToTwitter,
            'line': shareToLine,
            'facebook': shareToFacebook,
            'email': shareByEmail
        };

        Object.entries(shareButtons).forEach(([platform, handler]) => {
            const button = shareModal?.querySelector(`.share-button.${platform}`);
            if (button) {
                // 既存のonclick属性を削除
                button.removeAttribute('onclick');
                // 新しいイベントリスナーを追加
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    handler();
                });
            }
        });
    }

    // モーダルを開く
    function openModal(linkCode) {
        if (!shareModal) {
            console.error('[ShareModalFix] モーダル要素が見つかりません');
            return;
        }

        // リンクを設定
        currentShareLink = linkCode ? 
            `${window.location.origin}/register.html?ref=${linkCode}` : 
            window.location.href;

        // モーダルを表示
        shareModal.classList.add('active');
        
        // フォーカスを設定
        const shareMessage = document.getElementById('share-message');
        if (shareMessage) {
            // デフォルトメッセージを設定
            if (!shareMessage.value || shareMessage.value.trim() === '') {
                shareMessage.value = `経営者向けAI活用コミュニティ「INTERCONNECT」をご存知ですか？

AIを活用した次世代のビジネスマッチングサービスで、経営者同士の出会いから新しいビジネスチャンスが生まれています。

今なら無料面談を受けられるので、ぜひこちらのリンクからご登録ください。`;
            }
            shareMessage.focus();
            shareMessage.select();
        }

        console.log('[ShareModalFix] モーダルを開きました:', currentShareLink);
    }

    // モーダルを閉じる
    function closeModal() {
        if (!shareModal) return;

        shareModal.classList.remove('active');
        console.log('[ShareModalFix] モーダルを閉じました');
    }

    // Twitter共有
    function shareToTwitter() {
        if (!currentShareLink) {
            console.error('[ShareModalFix] 共有リンクが設定されていません');
            return;
        }

        const shareMessage = document.getElementById('share-message');
        const text = shareMessage?.value || 'INTERCONNECTで新しいビジネスチャンスを';
        
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentShareLink)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
        
        closeModal();
        showNotification('Twitterで共有しました', 'success');
    }

    // LINE共有
    function shareToLine() {
        if (!currentShareLink) {
            console.error('[ShareModalFix] 共有リンクが設定されていません');
            return;
        }

        const shareMessage = document.getElementById('share-message');
        const text = shareMessage?.value || 'INTERCONNECTで新しいビジネスチャンスを';
        
        const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text + '\n' + currentShareLink)}`;
        window.open(lineUrl, '_blank');
        
        closeModal();
        showNotification('LINEで共有しました', 'success');
    }

    // Facebook共有
    function shareToFacebook() {
        if (!currentShareLink) {
            console.error('[ShareModalFix] 共有リンクが設定されていません');
            return;
        }

        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentShareLink)}`;
        window.open(facebookUrl, '_blank', 'width=550,height=420');
        
        closeModal();
        showNotification('Facebookで共有しました', 'success');
    }

    // メール共有
    function shareByEmail() {
        if (!currentShareLink) {
            console.error('[ShareModalFix] 共有リンクが設定されていません');
            return;
        }

        const shareMessage = document.getElementById('share-message');
        const text = shareMessage?.value || 'INTERCONNECTで新しいビジネスチャンスを';
        
        const subject = 'INTERCONNECTへの招待';
        const body = `${text}\n\n${currentShareLink}`;
        
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        closeModal();
        showNotification('メールアプリを開きました', 'info');
    }

    // 通知表示
    function showNotification(message, type = 'info') {
        // Toast通知があれば使用
        if (window.showToast) {
            window.showToast(message, type);
            return;
        }

        // フォールバック：コンソールログ
        console.log(`[ShareModalFix] ${type}: ${message}`);
    }

    // グローバル関数を定義（既存の重複を上書き）
    function defineGlobalFunctions() {
        // 既存の関数を上書き
        window.openShareModal = function(linkCode) {
            console.log('[ShareModalFix] openShareModal called with:', linkCode);
            openModal(linkCode);
        };

        window.closeShareModal = function() {
            console.log('[ShareModalFix] closeShareModal called');
            closeModal();
        };

        window.shareToTwitter = function() {
            console.log('[ShareModalFix] shareToTwitter called');
            shareToTwitter();
        };

        window.shareToLine = function() {
            console.log('[ShareModalFix] shareToLine called');
            shareToLine();
        };

        window.shareToFacebook = function() {
            console.log('[ShareModalFix] shareToFacebook called');
            shareToFacebook();
        };

        window.shareByEmail = function() {
            console.log('[ShareModalFix] shareByEmail called');
            shareByEmail();
        };

        // currentShareLinkのゲッター/セッター
        Object.defineProperty(window, 'currentShareLink', {
            get: function() { return currentShareLink; },
            set: function(value) { currentShareLink = value; },
            configurable: true
        });

        console.log('[ShareModalFix] グローバル関数を定義しました');
    }

    // 公開API
    window.ShareModalManager = {
        open: openModal,
        close: closeModal,
        setLink: function(link) { currentShareLink = link; },
        getLink: function() { return currentShareLink; }
    };

})();