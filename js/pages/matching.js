/**
 * マッチングページのJavaScript
 */

// グローバル変数
let matchingEngine = null;
let allMatches = [];
let filteredMatches = [];
let currentUserId = null;

// 初期化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Matching page loaded');
    
    // ログインチェック（開発モードではスキップ）
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        console.warn('⚠️ ログインしていません。開発モードで続行します。');
        // window.location.href = 'login.html';
        // return;
    }
    
    // ユーザーID取得（実際の実装ではセッションから取得）
    currentUserId = sessionStorage.getItem('userId') || 'demo-user-id';
    
    // マッチングエンジン初期化（開発モードではモックを使用）
    if (typeof MatchingEngineMock !== 'undefined' && (!window.supabase || !window.supabase.from)) {
        console.log('📌 Using MatchingEngineMock for development');
        matchingEngine = new MatchingEngineMock();
    } else {
        matchingEngine = new MatchingEngine();
    }
    
    // データ読み込み
    await loadMatchingData();
    
    // サイドバー制御
    setupSidebar();
    
    // ユーザー情報を更新
    updateUserInfo();
    
    // カウントを初期化
    updateCounts();
});

/**
 * マッチングデータを読み込み
 */
async function loadMatchingData() {
    try {
        showLoading();
        
        // トップマッチを取得
        allMatches = await matchingEngine.getUserTopMatches(currentUserId, 20);
        filteredMatches = [...allMatches];
        
        // 統計情報を更新
        updateStatistics();
        
        // マッチング結果を表示
        displayMatches(filteredMatches);
        
    } catch (error) {
        console.error('Error loading matching data:', error);
        showError('マッチングデータの読み込みに失敗しました');
    } finally {
        hideLoading();
    }
}

/**
 * マッチング結果を表示
 */
function displayMatches(matches) {
    const grid = document.getElementById('matchingGrid');
    
    if (matches.length === 0) {
        grid.innerHTML = `
            <div class="no-matches">
                <i class="fas fa-users-slash"></i>
                <p>マッチング候補が見つかりませんでした</p>
                <button onclick="syncTranscripts()" class="btn btn-primary">
                    トランスクリプトを同期
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    matches.forEach(match => {
        // マッチングカード生成
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        
        // プロフィール情報の安全な取得
        const profile = match.user.profile || {};
        const displayName = profile.display_name || match.user.name || '名前未設定';
        const position = profile.position || '役職未設定';
        const company = profile.company || '会社未設定';
        const interests = profile.interests || [];
        const avatarUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0052cc&color=fff&rounded=true`;
        
        matchCard.innerHTML = `
            <div class="match-header">
                <img src="${avatarUrl}" 
                     alt="${displayName}" 
                     class="match-avatar">
                <div class="match-info">
                    <h3>${displayName}</h3>
                    <p>${position} - ${company}</p>
                </div>
                <div class="match-score">${match.score.total_score}点</div>
            </div>
            
            <div class="match-details">
                <div class="match-tags">
                    ${interests.map(interest => 
                        `<span class="match-tag">${interest}</span>`
                    ).join('')}
                </div>
                
                <p class="match-reason">${match.score.match_reasons[0] || 'マッチング理由を分析中...'}</p>
            </div>
            
            <div class="match-actions">
                <button class="connect-btn" onclick="sendConnectionRequest('${match.user.id}')">
                    <i class="fas fa-user-plus"></i> コネクト
                </button>
                <button class="view-btn" onclick="viewMatchDetail('${match.user.id}')">
                    <i class="fas fa-eye"></i> 詳細
                </button>
            </div>
        `;
        
        grid.appendChild(matchCard);
    });
}

/**
 * スコアクラスを取得
 */
function getScoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-great';
    if (score >= 70) return 'score-good';
    return 'score-normal';
}

/**
 * マッチタイプバッジを取得
 */
function getMatchTypeBadge(type) {
    const badges = {
        'synergy': '<span class="type-badge synergy">シナジー型</span>',
        'complementary': '<span class="type-badge complementary">補完型</span>',
        'similar': '<span class="type-badge similar">類似型</span>'
    };
    return badges[type] || '';
}

/**
 * スコア内訳を描画
 */
function renderScoreBreakdown(categoryScores) {
    if (!categoryScores) return '';
    
    const categories = {
        'business_synergy': 'ビジネスシナジー',
        'interest_overlap': '興味の一致',
        'communication_style': 'コミュニケーション',
        'skill_complementarity': 'スキル補完性',
        'activity_similarity': '活動の類似性'
    };
    
    return Object.entries(categoryScores).map(([key, score]) => `
        <div class="score-item">
            <span class="score-label">${categories[key] || key}</span>
            <div class="score-bar">
                <div class="score-fill" style="width: ${score}%"></div>
            </div>
            <span class="score-value">${score}</span>
        </div>
    `).join('');
}

/**
 * 統計情報を更新
 */
function updateStatistics() {
    document.getElementById('totalMatches').textContent = allMatches.length;
    
    const highScoreCount = allMatches.filter(m => m.score >= 80).length;
    document.getElementById('highScoreMatches').textContent = highScoreCount;
    
    const avgScore = allMatches.length > 0
        ? Math.round(allMatches.reduce((sum, m) => sum + m.score, 0) / allMatches.length)
        : 0;
    document.getElementById('avgScore').textContent = avgScore;
    
    const connectedCount = allMatches.filter(m => m.status === 'connected').length;
    document.getElementById('connectedCount').textContent = connectedCount;
}

/**
 * フィルター適用
 */
function filterMatches() {
    const scoreFilter = document.getElementById('scoreFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const industryFilter = document.getElementById('industryFilter').value;
    
    filteredMatches = allMatches.filter(match => {
        // スコアフィルター
        if (scoreFilter !== 'all') {
            const minScore = parseInt(scoreFilter);
            if (match.score < minScore) return false;
        }
        
        // タイプフィルター
        if (typeFilter !== 'all' && match.match_type !== typeFilter) {
            return false;
        }
        
        // 業界フィルター（実装は簡略化）
        if (industryFilter !== 'all') {
            // 実際の実装では業界情報を含める
            return true;
        }
        
        return true;
    });
    
    displayMatches(filteredMatches);
}

/**
 * コネクトリクエストを送信
 */
function sendConnectionRequest(userId) {
    if (confirm('このユーザーにコネクトリクエストを送信しますか？')) {
        showSuccess('コネクトリクエストを送信しました');
        // TODO: 実際のAPI実装
        console.log('Sending connection request to:', userId);
        
        // 接続リクエスト数を更新
        const countEl = document.querySelector('.connection-request-count');
        if (countEl) {
            const currentCount = parseInt(countEl.textContent) || 0;
            countEl.textContent = currentCount + 1;
        }
    }
}

/**
 * マッチング詳細を表示（エイリアス）
 */
function viewMatchDetail(userId) {
    viewMatchingDetail(userId);
}

/**
 * マッチング詳細を表示
 */
async function viewMatchingDetail(recommendedUserId) {
    try {
        // マッチングスコアを再計算または取得
        const matchingResult = await matchingEngine.calculateUserSynergy(
            currentUserId,
            recommendedUserId
        );
        
        // 詳細モーダルに表示
        const modal = document.getElementById('matchingDetailModal');
        const content = document.getElementById('matchingDetailContent');
        
        content.innerHTML = `
            <div class="matching-detail">
                <div class="detail-header">
                    <h3>総合スコア: ${matchingResult.total_score}点</h3>
                </div>
                
                <div class="detail-section">
                    <h4>マッチング理由</h4>
                    <ul class="reason-list">
                        ${matchingResult.match_reasons.map(reason => 
                            `<li><i class="fas fa-lightbulb"></i> ${reason}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4>協業の可能性</h4>
                    <ul class="opportunity-list">
                        ${(matchingResult.collaboration_opportunities || []).map(opp => 
                            `<li><i class="fas fa-rocket"></i> ${opp}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4>会話のきっかけ</h4>
                    <ul class="starter-list">
                        ${(matchingResult.conversation_starters || []).map(starter => 
                            `<li><i class="fas fa-comment"></i> ${starter}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="detail-actions">
                    <button onclick="sendMessage('${recommendedUserId}')" class="btn btn-primary btn-lg">
                        <i class="fas fa-envelope"></i> メッセージを送る
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error viewing matching detail:', error);
        showError('詳細情報の取得に失敗しました');
    }
}

/**
 * マッチング詳細モーダルを閉じる
 */
function closeMatchingDetail() {
    document.getElementById('matchingDetailModal').style.display = 'none';
}

/**
 * メッセージ送信
 */
function sendMessage(userId) {
    // メッセージページに遷移
    window.location.href = `messages.html?to=${userId}`;
}

/**
 * トランスクリプト同期
 */
async function syncTranscripts() {
    try {
        const syncButton = document.querySelector('.sync-button');
        syncButton.disabled = true;
        syncButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 同期中...';
        
        // 開発モードの場合は、モックデータで同期をシミュレート
        if (matchingEngine instanceof MatchingEngineMock) {
            console.log('📌 開発モード: モックデータで同期をシミュレート');
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒待機
            showSuccess('同期が完了しました！（開発モード）');
            await loadMatchingData(); // データを再読み込み
            return;
        }
        
        // TL;DV APIクライアント初期化
        const tldvService = new TldvService(window.ENV_CONFIG.TLDV_API_KEY);
        
        // ユーザーのミーティングを同期
        const results = await tldvService.syncUserMeetings(currentUserId);
        
        if (results.length > 0) {
            showSuccess(`${results.length}件の新しいトランスクリプトを同期しました`);
            
            // マッチングを再計算
            await loadMatchingData();
        } else {
            showInfo('新しいトランスクリプトはありません');
        }
        
    } catch (error) {
        console.error('Error syncing transcripts:', error);
        showError('トランスクリプトの同期に失敗しました');
    } finally {
        const syncButton = document.querySelector('.sync-button');
        syncButton.disabled = false;
        syncButton.innerHTML = '<i class="fas fa-sync"></i> <span>同期</span>';
    }
}

/**
 * サイドバー設定
 */
function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
}

/**
 * ユーティリティ関数
 */
function showLoading() {
    // 実装省略
}

function hideLoading() {
    const placeholder = document.querySelector('.loading-placeholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }
}

function showError(message) {
    alert(message); // 実際の実装では適切な通知システムを使用
}

function showSuccess(message) {
    alert(message); // 実際の実装では適切な通知システムを使用
}

function showInfo(message) {
    alert(message); // 実際の実装では適切な通知システムを使用
}

/**
 * ユーザー情報を更新
 */
function updateUserInfo() {
    const userName = sessionStorage.getItem('userName') || 'ゲスト';
    const userRole = sessionStorage.getItem('userRole') || 'メンバー';
    
    // ヘッダーのユーザー名を更新
    const headerUserName = document.getElementById('headerUserName');
    if (headerUserName) headerUserName.textContent = userName;
    
    // サイドバーのユーザー情報を更新
    const sidebarUserName = document.getElementById('sidebarUserName');
    if (sidebarUserName) sidebarUserName.textContent = userName;
    
    const sidebarUserRole = document.getElementById('sidebarUserRole');
    if (sidebarUserRole) sidebarUserRole.textContent = userRole;
}

/**
 * 各種カウントを更新
 */
function updateCounts() {
    // 実際のAPIから取得する場合はここで実装
    // 現在はダミーデータ
    
    // 接続リクエスト数
    const connectionCount = document.getElementById('connectionCount');
    if (connectionCount) connectionCount.textContent = '2';
    
    // 通知数
    const notificationCount = document.getElementById('notificationCount');
    if (notificationCount) notificationCount.textContent = '5';
    
    // メッセージ数
    const messageCount = document.getElementById('messageCount');
    if (messageCount) messageCount.textContent = '3';
}