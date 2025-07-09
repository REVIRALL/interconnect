// メンバープロフィールページの機能

// URLパラメータからメンバーIDを取得
function getMemberIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || '1';
}

// メンバーデータベース（デモ用）
const memberDatabase = {
    '1': {
        id: '1',
        name: '佐藤 次郎',
        firstName: '次郎',
        lastName: '佐藤',
        title: '代表取締役',
        company: '佐藤工業株式会社',
        industry: '製造業',
        location: '東京都品川区',
        joinDate: '2023-03-15',
        status: 'online',
        isConnected: false,
        profileVisibility: 'public',
        contact: {
            email: 'sato@sato-industry.com',
            phone: '03-1234-5678',
            website: 'https://sato-industry.com'
        },
        bio: '製造業で30年以上の実績を持つ佐藤工業の代表を務めています。\n\n主に精密機械部品の製造を手掛けており、品質管理と生産効率の向上に力を入れています。\n\n最近はIoTやAIを活用した生産プロセスの最適化に取り組んでおり、同業他社との技術交流を積極的に行っています。',
        challenges: ['生産効率の向上', '人材育成', 'DXの推進', '海外展開'],
        businessInfo: {
            revenue: '5-10億円',
            budget: '500-1000万円',
            employees: '50-100名',
            founded: '1990年'
        },
        activities: [
            {
                type: 'event',
                title: '定例交流会に参加',
                date: '2024-02-10',
                icon: 'calendar-check'
            },
            {
                type: 'business',
                title: '新規取引先を募集',
                date: '2024-02-05',
                icon: 'briefcase'
            },
            {
                type: 'connection',
                title: '山田太郎さんとつながりました',
                date: '2024-01-28',
                icon: 'user-plus'
            },
            {
                type: 'event',
                title: '製造業セミナーを主催',
                date: '2024-01-20',
                icon: 'chalkboard-teacher'
            }
        ],
        achievements: [
            'ISO9001認証取得',
            '環境優良企業賞受賞',
            '地域貢献賞受賞'
        ]
    },
    '2': {
        id: '2',
        name: '山田 花子',
        firstName: '花子',
        lastName: '山田',
        title: 'CEO',
        company: '山田商事株式会社',
        industry: '小売業',
        location: '大阪府大阪市',
        joinDate: '2023-01-20',
        status: 'away',
        isConnected: true,
        profileVisibility: 'connections',
        contact: {
            email: 'yamada@yamada-corp.com',
            phone: '非公開',
            website: 'https://yamada-corp.com'
        },
        bio: '山田商事の3代目として、伝統を守りながら新しい挑戦を続けています。\n\nECサイトの立ち上げやDXの推進により、売上を前年比150%に成長させました。',
        challenges: ['EC展開', 'ブランディング', '若手人材の採用'],
        businessInfo: {
            revenue: '10-50億円',
            budget: '非公開',
            employees: '100-300名',
            founded: '1970年'
        },
        activities: [
            {
                type: 'business',
                title: 'EC事業のパートナー募集',
                date: '2024-02-08',
                icon: 'shopping-cart'
            },
            {
                type: 'event',
                title: 'DXセミナーで講演',
                date: '2024-01-25',
                icon: 'microphone'
            }
        ],
        achievements: [
            'ECサイト・オブ・ザ・イヤー受賞',
            'ダイバーシティ推進企業認定'
        ]
    },
    '3': {
        id: '3',
        name: '鈴木 三郎',
        firstName: '三郎',
        lastName: '鈴木',
        title: 'CTO',
        company: '鈴木システムズ',
        industry: 'IT・ソフトウェア',
        location: '東京都渋谷区',
        joinDate: '2023-06-10',
        status: 'offline',
        isConnected: false,
        profileVisibility: 'limited',
        contact: {
            email: '非公開',
            phone: '非公開',
            website: '非公開'
        },
        bio: 'AI・機械学習を専門とするエンジニアです。\n\n企業のDX支援やAIソリューションの開発を行っています。',
        challenges: ['技術者採用', 'プロダクト開発', '資金調達'],
        businessInfo: {
            revenue: '非公開',
            budget: '非公開',
            employees: '10-50名',
            founded: '2018年'
        },
        activities: [
            {
                type: 'business',
                title: 'AI開発パートナー募集',
                date: '2024-02-01',
                icon: 'robot'
            }
        ],
        achievements: [
            'Microsoft Partner認定',
            'AWS Advanced Partner'
        ]
    }
};

// ページ初期化
document.addEventListener('DOMContentLoaded', function() {
    const memberId = getMemberIdFromURL();
    loadMemberProfile(memberId);
    setupEventListeners();
});

// メンバープロフィール読み込み
function loadMemberProfile(memberId) {
    const member = memberDatabase[memberId];
    
    if (!member) {
        showNotification('メンバーが見つかりません', 'error');
        setTimeout(() => {
            window.location.href = 'members.html';
        }, 2000);
        return;
    }
    
    // 基本情報の表示
    document.getElementById('memberName').textContent = member.name;
    document.getElementById('memberFullName').textContent = member.name;
    document.getElementById('memberTitle').textContent = member.title;
    document.getElementById('memberCompany').textContent = member.company;
    
    // アバター画像とステータス
    const avatar = document.getElementById('memberAvatar');
    if (avatar) {
        avatar.src = generateAvatar(member.name);
        avatar.alt = member.name;
    }
    
    const statusElement = document.getElementById('memberStatus');
    if (statusElement) {
        statusElement.className = `profile-status ${member.status}`;
    }
    
    // 基本情報
    document.getElementById('memberIndustry').textContent = member.industry;
    document.getElementById('memberLocation').textContent = member.location;
    document.getElementById('memberJoinDate').textContent = formatDate(member.joinDate);
    
    // 連絡先情報（プライバシー設定に基づく）
    updateContactDisplay(member);
    
    // 自己紹介
    const bioElement = document.getElementById('memberBio');
    if (bioElement && member.bio) {
        bioElement.innerHTML = member.bio.split('\n').map(p => `<p>${p}</p>`).join('');
    }
    
    // 事業課題
    updateChallengesDisplay(member.challenges);
    
    // ビジネス情報
    updateBusinessInfo(member.businessInfo, member.profileVisibility);
    
    // 活動履歴
    updateActivityHistory(member.activities);
    
    // つながりボタンの状態
    updateConnectButton(member.isConnected);
    
    // 実績がある場合は表示
    if (member.achievements && member.achievements.length > 0) {
        addAchievementsSection(member.achievements);
    }
}

// アバター生成
function generateAvatar(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    // 背景グラデーション
    const gradient = ctx.createLinearGradient(0, 0, 150, 150);
    gradient.addColorStop(0, '#1e5ba8');
    gradient.addColorStop(1, '#4a90e2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 150, 150);
    
    // テキスト
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const initials = name.split(' ').map(part => part.charAt(0)).join('');
    ctx.fillText(initials.substring(0, 2), 75, 75);
    
    return canvas.toDataURL();
}

// 連絡先情報の表示
function updateContactDisplay(member) {
    const contactElement = document.getElementById('memberContact');
    
    if (member.profileVisibility === 'public' || 
        (member.profileVisibility === 'connections' && member.isConnected)) {
        // 連絡先を表示
        const contactItems = [];
        if (member.contact.email && member.contact.email !== '非公開') {
            contactItems.push(`<a href="mailto:${member.contact.email}"><i class="fas fa-envelope"></i> ${member.contact.email}</a>`);
        }
        if (member.contact.phone && member.contact.phone !== '非公開') {
            contactItems.push(`<i class="fas fa-phone"></i> ${member.contact.phone}`);
        }
        if (member.contact.website && member.contact.website !== '非公開') {
            contactItems.push(`<a href="${member.contact.website}" target="_blank"><i class="fas fa-globe"></i> Website</a>`);
        }
        
        contactElement.innerHTML = contactItems.length > 0 ? contactItems.join(' | ') : '非公開';
    } else {
        contactElement.textContent = '非公開';
    }
}

// 事業課題の表示
function updateChallengesDisplay(challenges) {
    const container = document.getElementById('memberChallenges');
    if (container && challenges && challenges.length > 0) {
        container.innerHTML = challenges.map(challenge => 
            `<span class="challenge-tag">${challenge}</span>`
        ).join('');
    }
}

// ビジネス情報の表示
function updateBusinessInfo(businessInfo, visibility) {
    if (visibility === 'limited') {
        // 制限付き表示の場合
        document.getElementById('memberRevenue').textContent = '非公開';
        document.getElementById('memberBudget').textContent = '非公開';
        document.getElementById('memberEmployees').textContent = businessInfo.employees || '-';
        document.getElementById('memberFounded').textContent = businessInfo.founded || '-';
    } else {
        document.getElementById('memberRevenue').textContent = businessInfo.revenue || '非公開';
        document.getElementById('memberBudget').textContent = businessInfo.budget || '非公開';
        document.getElementById('memberEmployees').textContent = businessInfo.employees || '-';
        document.getElementById('memberFounded').textContent = businessInfo.founded || '-';
    }
}

// 活動履歴の表示
function updateActivityHistory(activities) {
    const container = document.getElementById('memberActivity');
    if (!container || !activities) return;
    
    const activityHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.title}</p>
                <span class="activity-date">${formatDate(activity.date)}</span>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = activityHTML;
}

// 実績セクションの追加
function addAchievementsSection(achievements) {
    const detailsContainer = document.querySelector('.profile-details');
    const achievementsHTML = `
        <section class="profile-section">
            <h3>実績・認定</h3>
            <div class="achievements-list">
                ${achievements.map(achievement => `
                    <div class="achievement-badge">
                        <i class="fas fa-award"></i>
                        <span>${achievement}</span>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
    
    detailsContainer.insertAdjacentHTML('beforeend', achievementsHTML);
}

// つながりボタンの更新
function updateConnectButton(isConnected) {
    const btn = document.getElementById('connectBtn');
    if (btn) {
        if (isConnected) {
            btn.innerHTML = '<i class="fas fa-user-check"></i> つながり済み';
            btn.classList.add('connected');
            btn.disabled = true;
        } else {
            btn.innerHTML = '<i class="fas fa-user-plus"></i> つながりリクエスト';
            btn.classList.remove('connected');
            btn.disabled = false;
        }
    }
}

// 日付フォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// イベントリスナーの設定
function setupEventListeners() {
    // メニュートグル
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // ユーザーメニュー
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', toggleUserMenu);
    }
    
    // 外部クリックでメニューを閉じる
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu')) {
            closeUserMenu();
        }
    });
}

// サイドバートグル
function toggleSidebar() {
    const container = document.querySelector('.dashboard-container');
    container.classList.toggle('sidebar-collapsed');
    
    // 状態を保存
    const isCollapsed = container.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

// ユーザーメニュートグル
function toggleUserMenu() {
    const dropdown = document.querySelector('.dropdown-menu');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

function closeUserMenu() {
    const dropdown = document.querySelector('.dropdown-menu');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// メッセージ送信
function sendMessage() {
    const memberId = getMemberIdFromURL();
    const member = memberDatabase[memberId];
    
    if (member) {
        // メッセージページに遷移（受信者情報をURLパラメータで渡す）
        window.location.href = `messages.html?to=${memberId}&name=${encodeURIComponent(member.name)}`;
    }
}

// つながりリクエスト
function toggleConnect() {
    const memberId = getMemberIdFromURL();
    const member = memberDatabase[memberId];
    
    if (member && !member.isConnected) {
        if (confirm(`${member.name}さんにつながりリクエストを送信しますか？`)) {
            // 実際の実装では、サーバーにリクエストを送信
            member.isConnected = true;
            updateConnectButton(true);
            showNotification('つながりリクエストを送信しました', 'success');
        }
    }
}

// 通知表示
function showNotification(message, type = 'info') {
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
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else {
        notification.style.backgroundColor = '#17a2b8';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// 追加のスタイル
if (!document.getElementById('memberProfileStyles')) {
    const style = document.createElement('style');
    style.id = 'memberProfileStyles';
    style.textContent = `
        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 2rem;
            color: var(--gray-text);
            font-size: 0.9rem;
        }
        .breadcrumb a {
            color: var(--primary-blue);
            text-decoration: none;
        }
        .breadcrumb a:hover {
            text-decoration: underline;
        }
        .breadcrumb i {
            font-size: 0.8rem;
        }
        .profile-status {
            position: absolute;
            bottom: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 4px solid white;
        }
        .profile-status.online {
            background: #28a745;
        }
        .profile-status.away {
            background: #ffc107;
        }
        .profile-status.offline {
            background: #6c757d;
        }
        .challenges-display {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .challenge-tag {
            background: var(--light-blue);
            color: var(--primary-blue);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        .activity-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .activity-item {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            align-items: center;
        }
        .activity-icon {
            width: 40px;
            height: 40px;
            background: var(--light-blue);
            color: var(--primary-blue);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .activity-content p {
            margin: 0;
            font-weight: 500;
        }
        .activity-date {
            font-size: 0.85rem;
            color: var(--gray-text);
        }
        .achievements-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .achievement-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: #fff3cd;
            color: #856404;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        .achievement-badge i {
            color: #ffc107;
        }
        #connectBtn.connected {
            background: #6c757d;
            cursor: not-allowed;
        }
        #memberContact a {
            color: var(--primary-blue);
            text-decoration: none;
            margin-right: 0.5rem;
        }
        #memberContact a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
}