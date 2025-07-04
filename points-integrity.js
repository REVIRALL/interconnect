// ポイント整合性管理システム
class PointsIntegrityManager {
    constructor() {
        this.secretKey = 'INTERCONNECT-2024-SECRET';
        this.initializeIntegrityCheck();
    }

    // 初期化
    initializeIntegrityCheck() {
        // 定期的な整合性チェック（1時間ごと）
        setInterval(() => {
            this.verifyAllUserPoints();
        }, 60 * 60 * 1000);

        // 月次リセット処理
        this.checkMonthlyReset();
    }

    // ポイントデータのハッシュ生成
    generatePointsHash(userId, pointsData) {
        const dataString = JSON.stringify({
            userId,
            totalPoints: pointsData.totalPoints,
            monthlyPoints: pointsData.monthlyPoints,
            inviteCount: pointsData.inviteCount,
            timestamp: Date.now()
        });
        
        // 簡易ハッシュ（実際の実装ではcrypto APIを使用）
        let hash = 0;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(16) + '-' + this.secretKey.substring(0, 8);
    }

    // ポイント保存時の検証
    saveVerifiedPoints(userId, pointsData) {
        const allPointsData = JSON.parse(localStorage.getItem('pointsData') || '{}');
        
        // ハッシュを生成
        const hash = this.generatePointsHash(userId, pointsData);
        pointsData._integrity = hash;
        pointsData._lastModified = new Date().toISOString();
        
        allPointsData[userId] = pointsData;
        
        // バックアップも保存
        const backup = {
            data: allPointsData,
            timestamp: new Date().toISOString(),
            checksum: this.calculateChecksum(allPointsData)
        };
        localStorage.setItem('pointsDataBackup', JSON.stringify(backup));
        
        localStorage.setItem('pointsData', JSON.stringify(allPointsData));
    }

    // ポイント読み込み時の検証
    getVerifiedPoints(userId) {
        const allPointsData = JSON.parse(localStorage.getItem('pointsData') || '{}');
        const pointsData = allPointsData[userId];
        
        if (!pointsData) {
            return null;
        }
        
        // 整合性チェック
        const expectedHash = this.generatePointsHash(userId, pointsData);
        if (pointsData._integrity !== expectedHash) {
            console.error('ポイントデータの整合性エラーが検出されました');
            
            // バックアップから復元を試みる
            const backup = JSON.parse(localStorage.getItem('pointsDataBackup') || '{}');
            if (backup.data && backup.data[userId]) {
                console.log('バックアップから復元しています...');
                return backup.data[userId];
            }
            
            // 復元できない場合は0にリセット
            return {
                totalPoints: 0,
                monthlyPoints: 0,
                pendingPoints: 0,
                rank: 'bronze',
                rankProgress: 0,
                inviteCount: 0
            };
        }
        
        return pointsData;
    }

    // 全ユーザーのポイント検証
    verifyAllUserPoints() {
        const allPointsData = JSON.parse(localStorage.getItem('pointsData') || '{}');
        let hasErrors = false;
        
        for (const [userId, pointsData] of Object.entries(allPointsData)) {
            const expectedHash = this.generatePointsHash(userId, pointsData);
            if (pointsData._integrity !== expectedHash) {
                console.error(`ユーザー ${userId} のポイントデータに不整合があります`);
                hasErrors = true;
            }
        }
        
        if (hasErrors) {
            this.sendSecurityAlert();
        }
    }

    // チェックサム計算
    calculateChecksum(data) {
        const str = JSON.stringify(data);
        let checksum = 0;
        for (let i = 0; i < str.length; i++) {
            checksum = (checksum + str.charCodeAt(i)) % 65536;
        }
        return checksum.toString(16);
    }

    // 月次リセット処理
    checkMonthlyReset() {
        const lastReset = localStorage.getItem('lastMonthlyReset');
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
        
        if (lastReset !== currentMonth) {
            this.performMonthlyReset();
            localStorage.setItem('lastMonthlyReset', currentMonth);
        }
        
        // 毎日0時にチェック
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const timeUntilMidnight = tomorrow - now;
        
        setTimeout(() => {
            this.checkMonthlyReset();
        }, timeUntilMidnight);
    }

    // 月次リセット実行
    performMonthlyReset() {
        console.log('月次ポイントリセットを実行しています...');
        
        const allPointsData = JSON.parse(localStorage.getItem('pointsData') || '{}');
        const resetHistory = JSON.parse(localStorage.getItem('monthlyResetHistory') || '[]');
        
        // 現在の月次データを履歴に保存
        const monthlySnapshot = {
            month: new Date().toISOString().substring(0, 7),
            timestamp: new Date().toISOString(),
            userData: {}
        };
        
        for (const [userId, pointsData] of Object.entries(allPointsData)) {
            // 月次データを記録
            monthlySnapshot.userData[userId] = {
                monthlyPoints: pointsData.monthlyPoints,
                monthlyInvites: this.getMonthlyInviteCount(userId)
            };
            
            // 月次ポイントをリセット
            pointsData.monthlyPoints = 0;
            
            // ハッシュを再生成
            this.saveVerifiedPoints(userId, pointsData);
        }
        
        resetHistory.push(monthlySnapshot);
        localStorage.setItem('monthlyResetHistory', JSON.stringify(resetHistory));
        
        // 全ユーザーに通知
        this.notifyMonthlyReset();
    }

    // 月次招待数取得
    getMonthlyInviteCount(userId) {
        const inviteData = JSON.parse(localStorage.getItem('inviteData') || '{"inviteHistory":[]}');
        const currentMonth = new Date().toISOString().substring(0, 7);
        
        return inviteData.inviteHistory.filter(invite => 
            invite.referrerId === userId && 
            invite.date.substring(0, 7) === currentMonth &&
            invite.status === 'registered'
        ).length;
    }

    // セキュリティアラート送信（シミュレーション）
    sendSecurityAlert() {
        console.warn('🚨 ポイントデータの改ざんが検出されました');
        
        // 管理者通知を記録
        const alerts = JSON.parse(localStorage.getItem('securityAlerts') || '[]');
        alerts.push({
            type: 'points_tampering',
            timestamp: new Date().toISOString(),
            details: 'ポイントデータの整合性チェックに失敗しました'
        });
        localStorage.setItem('securityAlerts', JSON.stringify(alerts));
    }

    // 月次リセット通知
    notifyMonthlyReset() {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        allUsers.forEach(user => {
            if (!notifications[user.id]) {
                notifications[user.id] = [];
            }
            
            notifications[user.id].push({
                id: 'notif-reset-' + Date.now(),
                type: 'monthly_reset',
                title: '月次ポイントがリセットされました',
                message: '新しい月が始まりました。先月の実績は履歴で確認できます。',
                timestamp: new Date().toISOString(),
                read: false
            });
        });
        
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    // ポイント操作の監査ログ
    logPointsActivity(userId, action, details) {
        const auditLog = JSON.parse(localStorage.getItem('pointsAuditLog') || '[]');
        
        auditLog.push({
            userId,
            action,
            details,
            timestamp: new Date().toISOString(),
            ip: this.getSimulatedIP()
        });
        
        // 最新1000件のみ保持
        if (auditLog.length > 1000) {
            auditLog.splice(0, auditLog.length - 1000);
        }
        
        localStorage.setItem('pointsAuditLog', JSON.stringify(auditLog));
    }

    // IPシミュレーション
    getSimulatedIP() {
        return '192.168.1.' + Math.floor(Math.random() * 255);
    }
}

// グローバルインスタンス
window.pointsIntegrityManager = new PointsIntegrityManager();

// ポイント操作のラッパー関数
function secureAddPoints(userId, points, reason) {
    const allPointsData = JSON.parse(localStorage.getItem('pointsData') || '{}');
    const userPoints = allPointsData[userId] || {
        totalPoints: 0,
        monthlyPoints: 0,
        pendingPoints: 0,
        rank: 'bronze',
        rankProgress: 0,
        inviteCount: 0
    };
    
    // ポイント追加
    userPoints.totalPoints += points;
    userPoints.monthlyPoints += points;
    
    // 整合性を保って保存
    window.pointsIntegrityManager.saveVerifiedPoints(userId, userPoints);
    
    // 監査ログ
    window.pointsIntegrityManager.logPointsActivity(userId, 'add_points', {
        amount: points,
        reason: reason,
        newTotal: userPoints.totalPoints
    });
    
    return userPoints;
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PointsIntegrityManager, secureAddPoints };
}