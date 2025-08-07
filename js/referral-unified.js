/**
 * 紹介システム統一JavaScript
 * 
 * 以下のファイルの機能を統合:
 * - referral-enhanced.js
 * - referral-enhanced-fix.js
 * - referral-table-fix.js
 * - referral-security-fix.js
 * - referral-link-fix-final.js
 * - force-correct-userid.js
 * - fix-delete-link.js
 */

(function() {
    'use strict';

    console.log('[ReferralUnified] 紹介システム統一モジュール初期化');

    // グローバル変数
    let currentUserId = null;
    let referralLinks = [];
    let referralStats = {
        availablePoints: 0,
        totalEarned: 0,
        referralCount: 0,
        conversionRate: 0
    };

    // 初期化
    async function initialize() {
        console.log('[ReferralUnified] 初期化開始');

        // Supabaseの準備を待つ
        await window.waitForSupabase();

        // 現在のユーザーを取得
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            console.error('[ReferralUnified] ユーザーが認証されていません');
            window.location.href = '/login.html';
            return;
        }

        currentUserId = user.id;
        console.log('[ReferralUnified] ユーザーID:', currentUserId);

        // イベントリスナーの設定
        setupEventListeners();

        // データの読み込み
        await loadReferralData();
    }

    // イベントリスナーの設定
    function setupEventListeners() {
        // リンク作成ボタン
        const createLinkBtn = document.getElementById('create-link-btn');
        if (createLinkBtn) {
            createLinkBtn.addEventListener('click', showLinkForm);
        }

        // ステータスフィルター
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', filterReferrals);
        }

        // キャッシュアウトボタン
        const cashoutBtn = document.getElementById('cashout-btn');
        if (cashoutBtn) {
            cashoutBtn.addEventListener('click', openCashoutModal);
        }
    }

    // 紹介データの読み込み
    async function loadReferralData() {
        try {
            // ポイント情報を取得
            await loadUserPoints();

            // 紹介リンクを取得
            await loadReferralLinks();

            // 紹介履歴を取得
            await loadReferralHistory();

            // キャッシュアウト履歴を取得
            await loadCashoutHistory();

        } catch (error) {
            console.error('[ReferralUnified] データ読み込みエラー:', error);
        }
    }

    // ユーザーポイントの読み込み
    async function loadUserPoints() {
        try {
            const { data, error } = await window.supabaseClient
                .from('user_points')
                .select('*')
                .eq('user_id', currentUserId)
                .single();

            if (error) throw error;

            if (data) {
                referralStats.availablePoints = data.available_points || 0;
                referralStats.totalEarned = data.total_points || 0;

                // UI更新
                updateElement('available-points', referralStats.availablePoints.toLocaleString());
                updateElement('total-earned', referralStats.totalEarned.toLocaleString());

                // キャッシュアウトボタンの有効/無効
                const cashoutBtn = document.getElementById('cashout-btn');
                if (cashoutBtn) {
                    cashoutBtn.disabled = referralStats.availablePoints < 5000;
                }
            }
        } catch (error) {
            console.error('[ReferralUnified] ポイント情報取得エラー:', error);
        }
    }

    // 紹介リンクの読み込み
    async function loadReferralLinks() {
        try {
            const { data, error } = await window.supabaseClient
                .from('invite_links')
                .select('*')
                .eq('created_by', currentUserId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            referralLinks = data || [];
            displayReferralLinks();

        } catch (error) {
            console.error('[ReferralUnified] 紹介リンク取得エラー:', error);
        }
    }

    // 紹介履歴の読み込み
    async function loadReferralHistory() {
        try {
            // v_referral_historyビューには以下のカラムが存在:
            // sent_at: 招待送信日時
            // accepted_at: 招待受諾日時
            // created_atは存在しないので、sent_atを使用
            const { data, error } = await window.supabaseClient
                .from('v_referral_history')
                .select('*')
                .eq('inviter_id', currentUserId)
                .order('sent_at', { ascending: false });

            if (error) throw error;

            const referrals = data || [];
            
            // 統計を計算
            referralStats.referralCount = referrals.length;
            const completedCount = referrals.filter(r => r.status === 'completed').length;
            referralStats.conversionRate = referrals.length > 0 
                ? Math.round((completedCount / referrals.length) * 100) 
                : 0;

            // UI更新
            updateElement('referral-count', referralStats.referralCount);
            updateElement('conversion-rate', referralStats.conversionRate);

            // 履歴を表示
            displayReferralHistory(referrals);

        } catch (error) {
            console.error('[ReferralUnified] 紹介履歴取得エラー:', error);
        }
    }

    // キャッシュアウト履歴の読み込み
    async function loadCashoutHistory() {
        try {
            const { data, error } = await window.supabaseClient
                .from('cashout_requests')
                .select('*')
                .eq('user_id', currentUserId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            displayCashoutHistory(data || []);

        } catch (error) {
            console.error('[ReferralUnified] キャッシュアウト履歴取得エラー:', error);
        }
    }

    // 紹介リンクの表示
    function displayReferralLinks() {
        const linksList = document.getElementById('links-list');
        if (!linksList) return;

        if (referralLinks.length === 0) {
            linksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-link"></i>
                    <p>まだ紹介リンクがありません</p>
                    <p class="text-muted">「新しいリンクを作成」ボタンから始めましょう</p>
                </div>
            `;
            return;
        }

        linksList.innerHTML = referralLinks.map(link => `
            <div class="link-item" data-link-id="${link.id}">
                <div class="link-header">
                    <div class="link-info">
                        <h3>${escapeHtml(link.description || '名称未設定')}</h3>
                        <p class="link-code">コード: ${link.link_code}</p>
                    </div>
                    <div class="link-stats">
                        <span class="stat">
                            <i class="fas fa-users"></i>
                            ${link.referral_count || 0}人紹介
                        </span>
                        <span class="stat">
                            <i class="fas fa-chart-line"></i>
                            ${link.conversion_count || 0}人成約
                        </span>
                    </div>
                </div>
                <div class="link-url">
                    <input type="text" readonly value="${window.location.origin}/register.html?ref=${link.link_code}" 
                           id="link-${link.id}" class="link-input">
                </div>
                <div class="link-actions">
                    <button class="btn btn-secondary copy-btn" onclick="copyLink('${link.id}')">
                        <i class="fas fa-copy"></i> コピー
                    </button>
                    <button class="btn btn-primary share-btn" onclick="openShareModal('${link.link_code}')">
                        <i class="fas fa-share-alt"></i> 共有
                    </button>
                    <button class="btn btn-danger delete-btn" onclick="deleteLink('${link.id}')">
                        <i class="fas fa-trash"></i> 削除
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 紹介履歴の表示
    function displayReferralHistory(referrals) {
        const referralList = document.getElementById('referral-list');
        if (!referralList) return;

        if (referrals.length === 0) {
            referralList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>まだ紹介履歴がありません</p>
                </div>
            `;
            return;
        }

        referralList.innerHTML = referrals.map(referral => {
            const statusInfo = getStatusInfo(referral.status);
            return `
                <div class="history-item">
                    <div class="history-header">
                        <div class="user-info">
                            <i class="fas fa-user-circle"></i>
                            <div>
                                <p class="user-name">${escapeHtml(referral.invitee_name || '未設定')}</p>
                                <p class="user-email">${escapeHtml(referral.invitee_email || '')}</p>
                            </div>
                        </div>
                        <div class="status-badge ${statusInfo.class}">
                            ${statusInfo.icon} ${statusInfo.text}
                        </div>
                    </div>
                    <div class="history-details">
                        <p class="date">
                            <i class="fas fa-calendar"></i>
                            ${formatDate(referral.sent_at || referral.created_at)}
                        </p>
                        ${referral.accepted_at ? `
                            <p class="completed-date">
                                <i class="fas fa-check-circle"></i>
                                登録日: ${formatDate(referral.accepted_at)}
                            </p>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // キャッシュアウト履歴の表示
    function displayCashoutHistory(cashouts) {
        const cashoutList = document.getElementById('cashout-list');
        if (!cashoutList) return;

        if (cashouts.length === 0) {
            cashoutList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-money-check-alt"></i>
                    <p>まだ出金履歴がありません</p>
                </div>
            `;
            return;
        }

        cashoutList.innerHTML = cashouts.map(cashout => {
            const statusInfo = getCashoutStatusInfo(cashout.status);
            return `
                <div class="cashout-item">
                    <div class="cashout-header">
                        <div class="amount-info">
                            <p class="amount">¥${cashout.amount.toLocaleString()}</p>
                            <p class="tax">源泉税: ¥${cashout.tax_amount.toLocaleString()}</p>
                        </div>
                        <div class="status-badge ${statusInfo.class}">
                            ${statusInfo.icon} ${statusInfo.text}
                        </div>
                    </div>
                    <div class="cashout-details">
                        <p class="date">
                            <i class="fas fa-calendar"></i>
                            申請日: ${formatDate(cashout.created_at)}
                        </p>
                        ${cashout.processed_at ? `
                            <p class="processed-date">
                                <i class="fas fa-check-circle"></i>
                                処理日: ${formatDate(cashout.processed_at)}
                            </p>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // リンク作成フォームの表示
    function showLinkForm() {
        const form = document.getElementById('link-form');
        if (form) {
            form.style.display = 'block';
            document.getElementById('link-description').focus();
        }
    }

    // リンク作成のキャンセル
    window.cancelLinkCreation = function() {
        const form = document.getElementById('link-form');
        if (form) {
            form.style.display = 'none';
            document.getElementById('link-description').value = '';
        }
    };

    // 紹介リンクの作成
    window.createReferralLink = async function() {
        const description = document.getElementById('link-description').value.trim();
        
        if (!description) {
            alert('リンクの説明を入力してください');
            return;
        }

        try {
            // リンクコードを生成
            const linkCode = generateLinkCode();

            // データベースに保存
            const { data, error } = await window.supabaseClient
                .from('invite_links')
                .insert({
                    created_by: currentUserId, // created_byカラムのみ使用
                    link_code: linkCode,
                    description: description,
                    is_active: true,
                    referral_count: 0,
                    conversion_count: 0
                })
                .select()
                .single();

            if (error) throw error;

            // リストに追加
            referralLinks.unshift(data);
            displayReferralLinks();

            // フォームをクリア
            cancelLinkCreation();

            // 成功メッセージ
            showNotification('紹介リンクを作成しました', 'success');

        } catch (error) {
            console.error('[ReferralUnified] リンク作成エラー:', error);
            alert('リンクの作成に失敗しました');
        }
    };

    // リンクのコピー
    window.copyLink = function(linkId) {
        const input = document.getElementById(`link-${linkId}`);
        if (input) {
            input.select();
            document.execCommand('copy');
            showNotification('リンクをコピーしました', 'success');
        }
    };

    // 共有モーダルを開く
    window.openShareModal = function(linkCode) {
        window.currentShareLink = `${window.location.origin}/register.html?ref=${linkCode}`;
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.classList.add('active');
        }
    };

    // リンクの削除
    window.deleteLink = async function(linkId) {
        if (!confirm('このリンクを削除してもよろしいですか？')) {
            return;
        }

        try {
            const { error } = await window.supabaseClient
                .from('invite_links')
                .delete()
                .eq('id', linkId)
                .eq('created_by', currentUserId);

            if (error) throw error;

            // リストから削除
            referralLinks = referralLinks.filter(link => link.id !== linkId);
            displayReferralLinks();

            showNotification('リンクを削除しました', 'success');

        } catch (error) {
            console.error('[ReferralUnified] リンク削除エラー:', error);
            alert('リンクの削除に失敗しました');
        }
    };

    // 紹介履歴のフィルタリング
    function filterReferrals() {
        const filterValue = document.getElementById('status-filter').value;
        console.log('[ReferralUnified] フィルター:', filterValue);
        // フィルタリング処理を実装
    }

    // キャッシュアウトモーダルを開く
    function openCashoutModal() {
        console.log('[ReferralUnified] キャッシュアウトモーダルを開く');
        console.log('[ReferralUnified] 利用可能ポイント:', referralStats.availablePoints);
        
        if (window.cashoutModal && window.cashoutModal.open) {
            window.cashoutModal.open(referralStats.availablePoints);
        } else {
            console.error('[ReferralUnified] cashoutModalが初期化されていません');
            // フォールバック: cashout-modal.jsの読み込みを待つ
            setTimeout(() => {
                if (window.cashoutModal && window.cashoutModal.open) {
                    window.cashoutModal.open(referralStats.availablePoints);
                } else {
                    alert('キャッシュアウト機能の初期化に失敗しました。ページを再読み込みしてください。');
                }
            }, 1000);
        }
    }

    // ユーティリティ関数
    function generateLinkCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    function updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function getStatusInfo(status) {
        const statusMap = {
            pending: { text: '登録待ち', icon: '⏳', class: 'status-pending' },
            registered: { text: '登録済み', icon: '✅', class: 'status-registered' },
            completed: { text: '面談完了', icon: '🎉', class: 'status-completed' },
            cancelled: { text: 'キャンセル', icon: '❌', class: 'status-cancelled' }
        };
        return statusMap[status] || { text: '不明', icon: '❓', class: 'status-unknown' };
    }

    function getCashoutStatusInfo(status) {
        const statusMap = {
            pending: { text: '処理中', icon: '⏳', class: 'status-pending' },
            approved: { text: '承認済み', icon: '✅', class: 'status-approved' },
            completed: { text: '送金完了', icon: '💰', class: 'status-completed' },
            rejected: { text: '却下', icon: '❌', class: 'status-rejected' }
        };
        return statusMap[status] || { text: '不明', icon: '❓', class: 'status-unknown' };
    }

    function showNotification(message, type = 'info') {
        // 通知の表示（実装は既存の通知システムに依存）
        console.log(`[ReferralUnified] ${type}: ${message}`);
    }

    // 初期化実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();