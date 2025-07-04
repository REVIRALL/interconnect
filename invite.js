// 招待管理システム
class InviteManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.inviteData = this.loadInviteData();
        this.pointsData = this.loadPointsData();
        this.initializePage();
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    loadInviteData() {
        const data = localStorage.getItem('inviteData');
        return data ? JSON.parse(data) : {
            inviteLinks: {},
            inviteHistory: []
        };
    }

    loadPointsData() {
        // 整合性チェック付きでポイントを取得
        if (window.pointsIntegrityManager) {
            const verifiedPoints = window.pointsIntegrityManager.getVerifiedPoints(this.currentUser.id);
            if (verifiedPoints) {
                return verifiedPoints;
            }
        }
        
        // フォールバック
        const allPointsData = JSON.parse(localStorage.getItem('pointsData') || '{}');
        const userPoints = allPointsData[this.currentUser.id];
        
        return userPoints || {
            totalPoints: 0,
            monthlyPoints: 0,
            pendingPoints: 0,
            rank: 'bronze',
            rankProgress: 0,
            inviteCount: 0
        };
    }

    initializePage() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        this.generateInviteLink();
        this.updatePointsDisplay();
        this.loadInviteHistory();
        this.setupEventListeners();
        this.animateNumbers();
    }

    generateInviteLink() {
        const userId = this.currentUser.id;
        let inviteLinkData = this.inviteData.inviteLinks[userId];
        
        // 有効期限チェック
        if (inviteLinkData && inviteLinkData.expiresAt) {
            const expirationDate = new Date(inviteLinkData.expiresAt);
            if (expirationDate < new Date()) {
                // 期限切れの場合は新しいリンクを生成
                inviteLinkData = null;
            }
        }
        
        if (!inviteLinkData) {
            const inviteCode = this.generateUniqueCode();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30日間有効
            
            inviteLinkData = {
                code: inviteCode,
                createdAt: new Date().toISOString(),
                expiresAt: expiresAt.toISOString(),
                maxUses: 50, // 最大使用回数
                currentUses: 0
            };
            
            this.inviteData.inviteLinks[userId] = inviteLinkData;
            this.saveInviteData();
        }

        // 本番環境のURL設定
        let baseUrl;
        
        // GitHub Pages環境の検出
        if (window.location.hostname.includes('github.io')) {
            // GitHub Pagesの正しいURL構造
            if (window.location.pathname.includes('/interconnect')) {
                baseUrl = 'https://revirall.github.io/interconnect';
            } else {
                // 念のため動的に構築
                baseUrl = window.location.origin + '/interconnect';
            }
        } else if (window.location.protocol === 'file:') {
            // ローカル環境の場合は相対パスを使用
            const pathArray = window.location.pathname.split('/');
            pathArray.pop(); // 現在のファイル名を削除
            baseUrl = pathArray.join('/');
            const inviteLink = `${baseUrl}/register.html?ref=${inviteLinkData.code}`;
            
            const linkInput = document.getElementById('inviteLink');
            if (linkInput) {
                linkInput.value = inviteLink;
                // ローカル環境用の注意書きを追加
                linkInput.setAttribute('title', 'ローカル環境では手動でコピー＆ペーストしてください');
            }
        } else {
            // サーバー環境の場合
            const inviteLink = `${baseUrl}/register.html?ref=${inviteLinkData.code}`;
            
            const linkInput = document.getElementById('inviteLink');
            if (linkInput) {
                linkInput.value = inviteLink;
            }
        }
        
        // 有効期限表示
        this.displayExpirationInfo(inviteLinkData);
    }
    
    displayExpirationInfo(inviteLinkData) {
        const expirationDate = new Date(inviteLinkData.expiresAt);
        const daysRemaining = Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24));
        const usesRemaining = inviteLinkData.maxUses - inviteLinkData.currentUses;
        
        const infoContainer = document.querySelector('.invite-link-container');
        if (infoContainer) {
            let infoElement = document.getElementById('inviteLinkInfo');
            if (!infoElement) {
                infoElement = document.createElement('div');
                infoElement.id = 'inviteLinkInfo';
                infoElement.style.cssText = `
                    margin-top: 10px;
                    padding: 8px 12px;
                    background: #e3f2fd;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    color: #1976d2;
                `;
                infoContainer.appendChild(infoElement);
            }
            
            let infoHTML = `
                <i class="fas fa-info-circle"></i>
                有効期限: あと${daysRemaining}日 | 残り使用回数: ${usesRemaining}回
            `;
            
            // ローカル環境の場合は使い方の説明を追加
            if (window.location.protocol === 'file:') {
                infoHTML += `<br>
                <span style="color: #f57c00; margin-top: 8px; display: block;">
                    <i class="fas fa-exclamation-triangle"></i>
                    ローカル環境: リンクをコピーして、ブラウザのアドレスバーに貼り付けてください
                </span>`;
            }
            
            infoElement.innerHTML = infoHTML;
        }
    }

    generateUniqueCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        
        // 既存のコードを取得して重複チェック（全ユーザー分）
        const allInviteLinks = this.inviteData.inviteLinks || {};
        const existingCodes = Object.values(allInviteLinks);
        
        // 使用済みコードも含めてチェック
        const usedCodes = this.getUsedInviteCodes();
        const allCodes = [...existingCodes, ...usedCodes];
        
        do {
            code = '';
            // ユーザーIDの一部を含めてより一意性を高める
            const userIdPart = this.currentUser.id.substring(0, 3).toUpperCase();
            code = userIdPart + '-';
            
            for (let i = 0; i < 5; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (allCodes.includes(code));
        
        return code;
    }
    
    // 使用済み招待コードを取得
    getUsedInviteCodes() {
        const usedCodes = JSON.parse(localStorage.getItem('usedInviteCodes') || '[]');
        return usedCodes;
    }

    regenerateLink() {
        const userId = this.currentUser.id;
        
        // 古いリンクを無効化
        const oldLinkData = this.inviteData.inviteLinks[userId];
        if (oldLinkData && oldLinkData.code) {
            const usedCodes = JSON.parse(localStorage.getItem('usedInviteCodes') || '[]');
            usedCodes.push(oldLinkData.code);
            localStorage.setItem('usedInviteCodes', JSON.stringify(usedCodes));
        }
        
        // 新しいリンクを強制生成
        delete this.inviteData.inviteLinks[userId];
        this.saveInviteData();
        this.generateInviteLink();
        this.showNotification('招待リンクを再生成しました', 'success');
    }

    copyLink() {
        const linkInput = document.getElementById('inviteLink');
        if (linkInput) {
            linkInput.select();
            linkInput.setSelectionRange(0, 99999);
            
            try {
                document.execCommand('copy');
                this.showNotification('リンクをコピーしました', 'success');
                
                // ボタンのテキストを一時的に変更
                const copyBtn = document.querySelector('.btn-copy');
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> コピー済み';
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                }, 2000);
            } catch (err) {
                navigator.clipboard.writeText(linkInput.value).then(() => {
                    this.showNotification('リンクをコピーしました', 'success');
                });
            }
        }
    }

    showQRCode() {
        const modal = document.getElementById('qrModal');
        const container = document.getElementById('qrCodeContainer');
        const linkInput = document.getElementById('inviteLink');
        
        if (modal && container && linkInput) {
            // QRコードを生成（実際の実装では QRコードライブラリを使用）
            container.innerHTML = `
                <div style="width: 200px; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 2px solid #333;">
                    <div style="text-align: center;">
                        <i class="fas fa-qrcode" style="font-size: 3rem; color: #333;"></i>
                        <p style="margin-top: 10px; font-size: 0.8rem;">QRコード</p>
                    </div>
                </div>
            `;
            
            modal.style.display = 'flex';
        }
    }

    closeQRModal() {
        const modal = document.getElementById('qrModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    shareToLine() {
        const linkInput = document.getElementById('inviteLink');
        if (linkInput) {
            const text = encodeURIComponent(`INTERCONNECTに参加しませんか？\n\n${linkInput.value}`);
            window.open(`https://line.me/R/msg/text/?${text}`, '_blank');
        }
    }

    shareToTwitter() {
        const linkInput = document.getElementById('inviteLink');
        if (linkInput) {
            const text = encodeURIComponent('INTERCONNECTで一緒にビジネスを成長させましょう！');
            const url = encodeURIComponent(linkInput.value);
            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        }
    }

    shareToFacebook() {
        const linkInput = document.getElementById('inviteLink');
        if (linkInput) {
            const url = encodeURIComponent(linkInput.value);
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        }
    }

    shareByEmail() {
        const linkInput = document.getElementById('inviteLink');
        if (linkInput) {
            const subject = encodeURIComponent('INTERCONNECTへの招待');
            const body = encodeURIComponent(`
こんにちは！

INTERCONNECTという素晴らしい経営者コミュニティを見つけました。
ぜひ一緒に参加しませんか？

以下のリンクから登録できます：
${linkInput.value}

よろしくお願いします！
            `.trim());
            
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
        }
    }

    updatePointsDisplay() {
        // ポイント表示の更新
        const elements = {
            totalPoints: document.querySelector('.total-points .points-value'),
            monthlyPoints: document.querySelector('.monthly-points .points-value'),
            pendingPoints: document.querySelector('.pending-points .points-value'),
            rankName: document.querySelector('.rank-name'),
            rankProgress: document.querySelector('.rank-progress-bar')
        };

        if (elements.totalPoints) {
            elements.totalPoints.textContent = this.pointsData.totalPoints.toLocaleString();
        }
        if (elements.monthlyPoints) {
            elements.monthlyPoints.textContent = this.pointsData.monthlyPoints.toLocaleString();
        }
        if (elements.pendingPoints) {
            elements.pendingPoints.textContent = this.pointsData.pendingPoints.toLocaleString();
        }
        if (elements.rankName) {
            const rankNames = {
                bronze: 'ブロンズ',
                silver: 'シルバー',
                gold: 'ゴールド',
                platinum: 'プラチナ',
                diamond: 'ダイヤモンド'
            };
            elements.rankName.textContent = rankNames[this.pointsData.rank] || 'ゴールド';
        }
        if (elements.rankProgress) {
            elements.rankProgress.style.width = `${this.pointsData.rankProgress}%`;
        }
    }

    loadInviteHistory() {
        const tbody = document.getElementById('inviteHistoryBody');
        if (!tbody) return;

        // 現在のユーザーの招待履歴を取得
        const userInvites = this.inviteData.inviteHistory
            .filter(invite => invite.referrerId === this.currentUser.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (userInvites.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                        <i class="fas fa-user-plus" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        まだ招待履歴がありません
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = userInvites.map(item => `
            <tr>
                <td>${this.formatDate(item.date)}</td>
                <td>${item.inviteeName || '-'}</td>
                <td>${item.inviteeEmail || '-'}</td>
                <td>
                    <span class="status-badge ${item.status}">
                        ${this.getStatusText(item.status)}
                    </span>
                </td>
                <td>${item.points > 0 ? `${item.points}pts` : '-'}</td>
                <td>
                    ${item.status === 'pending' ? 
                        '<button class="btn-resend" onclick="inviteManager.resendInvite(\'' + item.inviteeEmail + '\')">再送信</button>' : 
                        '-'
                    }
                </td>
            </tr>
        `).join('');
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    }

    getStatusText(status) {
        const statusTexts = {
            registered: '登録済み',
            pending: '保留中',
            expired: '期限切れ'
        };
        return statusTexts[status] || status;
    }

    resendInvite(email) {
        this.showNotification(`${email}に招待を再送信しました`, 'success');
    }

    exchangePoints(type) {
        if (type !== 'cash') {
            this.showNotification('現在は現金交換のみ対応しています', 'error');
            return;
        }
        
        // ポイント残高チェック
        if (this.pointsData.totalPoints < 10000) {
            this.showNotification('交換には10,000ポイント以上必要です', 'error');
            return;
        }
        
        // 交換申請ダイアログを表示（実装例）
        const confirmExchange = confirm(`${this.pointsData.totalPoints.toLocaleString()}ポイントを現金に交換しますか？\n\n振込先情報の登録が必要です。`);
        
        if (confirmExchange) {
            // 交換履歴を保存
            const exchangeHistory = JSON.parse(localStorage.getItem('exchangeHistory') || '[]');
            exchangeHistory.push({
                id: 'exchange-' + Date.now(),
                userId: this.currentUser.id,
                type: 'cash',
                points: Math.floor(this.pointsData.totalPoints / 10000) * 10000,
                amount: Math.floor(this.pointsData.totalPoints / 10000) * 10000,
                status: 'pending',
                requestDate: new Date().toISOString(),
                bankInfo: null // 実際は振込先情報フォームが必要
            });
            localStorage.setItem('exchangeHistory', JSON.stringify(exchangeHistory));
            
            this.showNotification('現金交換申請を受け付けました。3営業日以内に振込みいたします。', 'success');
        }
    }

    setupEventListeners() {
        // フィルターボタン
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterHistory(e.target.getAttribute('data-filter'));
            });
        });

        // モーダル外クリックで閉じる
        window.addEventListener('click', (e) => {
            if (e.target.id === 'qrModal') {
                this.closeQRModal();
            }
        });
    }

    filterHistory(filter) {
        // フィルタリング実装（実際のアプリケーションでは）
        console.log('Filtering by:', filter);
    }

    animateNumbers() {
        const animateValue = (element, start, end, duration) => {
            if (!element) return;
            
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const value = Math.floor(progress * (end - start) + start);
                element.textContent = value.toLocaleString();
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        };

        // アニメーション実行
        const totalPointsEl = document.querySelector('.total-points .points-value');
        const monthlyPointsEl = document.querySelector('.monthly-points .points-value');
        const pendingPointsEl = document.querySelector('.pending-points .points-value');

        if (totalPointsEl) animateValue(totalPointsEl, 0, this.pointsData.totalPoints, 1000);
        if (monthlyPointsEl) animateValue(monthlyPointsEl, 0, this.pointsData.monthlyPoints, 1000);
        if (pendingPointsEl) animateValue(pendingPointsEl, 0, this.pointsData.pendingPoints, 1000);
    }

    saveInviteData() {
        localStorage.setItem('inviteData', JSON.stringify(this.inviteData));
    }

    savePointsData() {
        // 整合性チェック付きで保存
        if (window.pointsIntegrityManager) {
            window.pointsIntegrityManager.saveVerifiedPoints(this.currentUser.id, this.pointsData);
        } else {
            // フォールバック
            const allPointsData = JSON.parse(localStorage.getItem('pointsData') || '{}');
            allPointsData[this.currentUser.id] = this.pointsData;
            localStorage.setItem('pointsData', JSON.stringify(allPointsData));
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 自動ポイント集計（毎日実行される想定）
    async autoCalculatePoints() {
        const today = new Date();
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        
        // 今月の招待者数を計算
        const monthlyInvites = this.inviteData.inviteHistory.filter(invite => {
            const inviteDate = new Date(invite.date);
            return inviteDate.getMonth() === thisMonth && 
                   inviteDate.getFullYear() === thisYear &&
                   invite.status === 'registered';
        }).length;
        
        // ポイント計算
        const pointsPerInvite = 1000;
        const monthlyPoints = monthlyInvites * pointsPerInvite;
        
        // ボーナスポイント（ラダー報酬）
        let bonusPoints = 0;
        if (monthlyInvites >= 30) bonusPoints = 20000;
        else if (monthlyInvites >= 20) bonusPoints = 10000;
        else if (monthlyInvites >= 15) bonusPoints = 5000;
        else if (monthlyInvites >= 10) bonusPoints = 3000;
        else if (monthlyInvites >= 5) bonusPoints = 1000;
        
        // ポイント更新
        this.pointsData.monthlyPoints = monthlyPoints + bonusPoints;
        this.pointsData.totalPoints += this.pointsData.monthlyPoints;
        
        // ランク更新
        if (this.pointsData.inviteCount >= 30) {
            this.pointsData.rank = 'diamond';
            this.pointsData.rankProgress = 100;
        } else if (this.pointsData.inviteCount >= 20) {
            this.pointsData.rank = 'platinum';
            this.pointsData.rankProgress = ((this.pointsData.inviteCount - 20) / 10) * 100;
        } else if (this.pointsData.inviteCount >= 15) {
            this.pointsData.rank = 'gold';
            this.pointsData.rankProgress = ((this.pointsData.inviteCount - 15) / 5) * 100;
        } else if (this.pointsData.inviteCount >= 10) {
            this.pointsData.rank = 'silver';
            this.pointsData.rankProgress = ((this.pointsData.inviteCount - 10) / 5) * 100;
        } else if (this.pointsData.inviteCount >= 5) {
            this.pointsData.rank = 'bronze';
            this.pointsData.rankProgress = ((this.pointsData.inviteCount - 5) / 5) * 100;
        }
        
        this.savePointsData();
        this.updatePointsDisplay();
        
        // 通知
        if (bonusPoints > 0) {
            this.showNotification(`ボーナスポイント${bonusPoints}ptsを獲得しました！`, 'success');
        }
    }
}

// ページ読み込み時に初期化
let inviteManager;
document.addEventListener('DOMContentLoaded', () => {
    inviteManager = new InviteManager();
});

// 定期的なポイント集計（デモ用：実際はサーバーサイドで実行）
setInterval(() => {
    if (inviteManager) {
        inviteManager.autoCalculatePoints();
    }
}, 24 * 60 * 60 * 1000); // 24時間ごと