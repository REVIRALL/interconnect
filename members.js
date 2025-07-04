// メンバー管理システム
class MemberManager {
    constructor() {
        this.allMembers = [];
        this.filteredMembers = [];
        this.currentPage = 1;
        this.membersPerPage = 12;
        this.currentUser = auth.getCurrentUser();
        this.connectionRequests = JSON.parse(localStorage.getItem('connectionRequests') || '[]');
        this.filters = {
            search: '',
            industry: '',
            position: '',
            size: '',
            area: '',
            connection: '',
            sort: 'newest',
            keyword: '',
            annualRevenue: '',
            investmentBudget: '',
            businessChallenges: [],
            joinedPeriod: '',
            connectionsRange: ''
        };
        this.initializeMembers();
    }

    // メンバー初期化
    initializeMembers() {
        this.loadMembers();
        this.setupEventListeners();
        this.updateDisplay();
    }

    // デモメンバーデータ読み込み
    loadMembers() {
        // 実際の実装ではAPIから取得
        this.allMembers = this.generateDemoMembers();
        this.filteredMembers = [...this.allMembers];
    }

    // デモメンバー生成
    generateDemoMembers() {
        const industries = ['IT・テクノロジー', '製造業', '小売・流通', '金融・保険', '医療・ヘルスケア', '不動産', '教育・研修', 'コンサルティング', 'マーケティング・広告', 'エンターテイメント', 'その他サービス業'];
        const positions = ['CEO', 'COO', 'CFO', 'CTO', '代表取締役', '取締役', '執行役員', '部長', '課長'];
        const companySizes = ['1-10名', '11-50名', '51-100名', '101-500名', '501-1000名', '1000名以上'];
        const revenues = ['1億円未満', '1-5億円', '5-10億円', '10-50億円', '50-100億円', '100億円以上'];
        const budgets = ['100万円未満', '100-500万円', '500-1000万円', '1000-3000万円', '3000-5000万円', '5000万円-1億円', '1億円以上'];
        const challenges = ['売上拡大', 'コスト削減', '人材採用・育成', 'デジタル変革', '新規事業開発', '海外展開', '組織運営', '財務・資金調達', 'マーケティング'];
        const areas = ['関東', '関西', '中部', '東北', '北海道', '中国', '四国', '九州', '海外'];
        const skills = ['営業', 'マーケティング', '財務', '人事', 'IT', 'デザイン', 'プロジェクト管理', '新規事業', '海外展開', 'M&A', 'IPO', 'データ分析', 'AI・機械学習', 'コンサルティング', 'リーダーシップ'];
        const specialties = ['B2B営業', 'デジタルマーケティング', 'プロダクト開発', 'チームビルディング', '資金調達', '事業戦略', '組織変革', 'ブランディング', 'グローバル展開', 'スタートアップ支援'];
        
        const firstNames = ['太郎', '花子', '次郎', '美咲', '三郎', '由美', '健太', '里美', '雄介', '知子', '和彦', '恵子', '洋子', '隆', '智子'];
        const lastNames = ['田中', '佐藤', '鈴木', '高橋', '山田', '渡辺', '伊藤', '中村', '小林', '加藤', '吉田', '山本', '斎藤', '松本', '井上'];
        const companyPrefixes = ['株式会社', '有限会社', '合同会社'];
        const companyNames = ['テックソリューション', '製造技術', '商事', 'システム', 'コンサルティング', 'マーケティング', 'デザイン', 'エンジニアリング', 'インダストリー', 'ホールディングス'];

        const members = [];
        
        for (let i = 1; i <= 150; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const industry = industries[Math.floor(Math.random() * industries.length)];
            const position = positions[Math.floor(Math.random() * positions.length)];
            const companySize = companySizes[Math.floor(Math.random() * companySizes.length)];
            const revenue = revenues[Math.floor(Math.random() * revenues.length)];
            const budget = budgets[Math.floor(Math.random() * budgets.length)];
            
            // ランダムな事業課題を1-4個選択
            const shuffledChallenges = [...challenges].sort(() => 0.5 - Math.random());
            const selectedChallenges = shuffledChallenges.slice(0, Math.floor(Math.random() * 4) + 1);
            
            const companyPrefix = companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)];
            const companyName = `${companyPrefix}${lastName}${companyNames[Math.floor(Math.random() * companyNames.length)]}`;
            const area = areas[Math.floor(Math.random() * areas.length)];
            
            // ランダムなスキルを2-6個選択
            const shuffledSkills = [...skills].sort(() => 0.5 - Math.random());
            const selectedSkills = shuffledSkills.slice(0, Math.floor(Math.random() * 5) + 2);
            
            // ランダムな専門分野を1-3個選択
            const shuffledSpecialties = [...specialties].sort(() => 0.5 - Math.random());
            const selectedSpecialties = shuffledSpecialties.slice(0, Math.floor(Math.random() * 3) + 1);
            
            const joinedDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2);
            const connections = Math.floor(Math.random() * 200) + 5;
            const eventsAttended = Math.floor(Math.random() * 50) + 1;
            const businessMatches = Math.floor(Math.random() * 15);
            const rating = (Math.random() * 2 + 3).toFixed(1);
            
            members.push({
                id: `member-${i}`,
                firstName,
                lastName,
                company: companyName,
                position,
                industry,
                companySize,
                area,
                skills: selectedSkills,
                specialties: selectedSpecialties,
                annualRevenue: revenue,
                investmentBudget: budget,
                businessChallenges: selectedChallenges,
                phone: `03-${String(Math.floor(Math.random() * 9000) + 1000)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyName.replace(/[^a-zA-Z]/g, '').toLowerCase()}.co.jp`,
                profileImage: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e0e0e0'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' fill='%23999' font-family='Arial,sans-serif' font-size='30'%3EUser%3C/text%3E%3C/svg%3E`,
                joinedDate: joinedDate.toISOString(),
                connections,
                eventsAttended,
                businessMatches,
                rating: parseFloat(rating),
                isConnected: Math.random() > 0.8,
                isOnline: Math.random() > 0.7,
                lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                bio: `${industry}業界で${Math.floor(Math.random() * 20) + 5}年の経験を持つ経営者です。${selectedChallenges.slice(0, 2).join('と')}に特に注力しています。`,
                matchingSettings: {
                    connectionApproval: Math.random() > 0.5 ? 'auto' : 'manual', // auto or manual
                    profileVisibility: ['public', 'connections', 'limited'][Math.floor(Math.random() * 3)]
                },
                connectionStatus: 'none', // none, pending_sent, pending_received, connected
                requestSentAt: null,
                requestReceivedAt: null
            });
        }
        
        return members;
    }

    // イベントリスナー設定
    setupEventListeners() {
        // 拡張されたフィルター機能のセットアップ
        const filterElements = {
            keyword: document.getElementById('keywordFilter'),
            industry: document.getElementById('industryFilter'),
            position: document.getElementById('positionFilter'),
            size: document.getElementById('sizeFilter'),
            area: document.getElementById('areaFilter'),
            connection: document.getElementById('connectionFilter'),
            sort: document.getElementById('sortFilter')
        };

        Object.entries(filterElements).forEach(([key, element]) => {
            if (element) {
                if (key === 'keyword') {
                    element.addEventListener('input', debounce(() => {
                        this.applyFilters();
                        this.toggleClearButton();
                    }, 300));
                } else {
                    element.addEventListener('change', () => this.applyFilters());
                }
            }
        });

        // クリア検索ボタン
        const clearSearchBtn = document.getElementById('clearSearch');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                document.getElementById('keywordFilter').value = '';
                this.applyFilters();
                this.toggleClearButton();
            });
        }

        // フィルターリセットボタン
        const resetFiltersBtn = document.getElementById('resetFilters');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => this.resetAllFilters());
        }

        // 検索条件保存ボタン
        const saveSearchBtn = document.getElementById('saveSearch');
        if (saveSearchBtn) {
            saveSearchBtn.addEventListener('click', () => this.saveCurrentSearch());
        }
    }

    // 高度なフィルター適用
    applyFilters() {
        const keywordFilter = document.getElementById('keywordFilter');
        const industryFilter = document.getElementById('industryFilter');
        const positionFilter = document.getElementById('positionFilter');
        const sizeFilter = document.getElementById('sizeFilter');
        const areaFilter = document.getElementById('areaFilter');
        const connectionFilter = document.getElementById('connectionFilter');
        const sortFilter = document.getElementById('sortFilter');

        this.filters = {
            keyword: keywordFilter?.value.toLowerCase() || '',
            industry: industryFilter?.value || '',
            position: positionFilter?.value || '',
            size: sizeFilter?.value || '',
            area: areaFilter?.value || '',
            connection: connectionFilter?.value || '',
            sort: sortFilter?.value || 'newest'
        };

        // 高度なフィルタリング
        this.filteredMembers = this.allMembers.filter(member => {
            // 拡張されたキーワード検索（スキル、専門分野、事業課題も検索対象に）
            const matchesKeyword = !this.filters.keyword || 
                member.firstName.toLowerCase().includes(this.filters.keyword) ||
                member.lastName.toLowerCase().includes(this.filters.keyword) ||
                member.company.toLowerCase().includes(this.filters.keyword) ||
                member.industry.toLowerCase().includes(this.filters.keyword) ||
                member.position.toLowerCase().includes(this.filters.keyword) ||
                (member.skills && member.skills.some(skill => skill.toLowerCase().includes(this.filters.keyword))) ||
                (member.specialties && member.specialties.some(spec => spec.toLowerCase().includes(this.filters.keyword))) ||
                (member.businessChallenges && member.businessChallenges.some(challenge => challenge.toLowerCase().includes(this.filters.keyword))) ||
                (member.bio && member.bio.toLowerCase().includes(this.filters.keyword));

            const matchesIndustry = !this.filters.industry || member.industry === this.filters.industry;
            const matchesPosition = !this.filters.position || member.position === this.filters.position;
            const matchesSize = !this.filters.size || member.companySize === this.filters.size;
            const matchesArea = !this.filters.area || member.area === this.filters.area;
            
            // 接続状態フィルター
            let matchesConnection = true;
            if (this.filters.connection) {
                const connectionStatus = this.getConnectionStatus(member.id);
                switch (this.filters.connection) {
                    case 'connected':
                        matchesConnection = connectionStatus === 'connected';
                        break;
                    case 'pending':
                        matchesConnection = connectionStatus === 'pending_sent' || connectionStatus === 'pending_received';
                        break;
                    case 'none':
                        matchesConnection = connectionStatus === 'none';
                        break;
                    case 'auto_approval':
                        matchesConnection = member.matchingSettings.connectionApproval === 'auto';
                        break;
                }
            }

            return matchesKeyword && matchesIndustry && matchesPosition && 
                   matchesSize && matchesArea && matchesConnection;
        });

        this.sortMembers();
        this.currentPage = 1;
        this.updateDisplay();
        this.updateStats();
        this.updateResultsCount();
        
        // 結果が0件の場合のメッセージ表示
        if (this.filteredMembers.length === 0) {
            this.showNoResultsMessage();
        }
    }

    // メンバーソート
    sortMembers() {
        this.filteredMembers.sort((a, b) => {
            switch (this.filters.sort) {
                case 'newest':
                    return new Date(b.joinedDate) - new Date(a.joinedDate);
                case 'name':
                    return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
                case 'company':
                    return a.company.localeCompare(b.company);
                case 'connections-desc':
                    return b.connections - a.connections;
                case 'connections-asc':
                    return a.connections - b.connections;
                case 'rating-desc':
                    return b.rating - a.rating;
                case 'activity':
                    // オンラインユーザーを優先し、次に最終アクティブ時刻でソート
                    if (a.isOnline && !b.isOnline) return -1;
                    if (!a.isOnline && b.isOnline) return 1;
                    return new Date(b.lastActive) - new Date(a.lastActive);
                default:
                    return new Date(b.joinedDate) - new Date(a.joinedDate);
            }
        });
    }

    // 表示更新
    updateDisplay() {
        this.renderMembers();
        this.renderPagination();
        this.updateClearSearchButton();
    }

    // メンバーリスト描画
    renderMembers() {
        const membersList = document.getElementById('membersList');
        if (!membersList) return;

        const startIndex = (this.currentPage - 1) * this.membersPerPage;
        const endIndex = startIndex + this.membersPerPage;
        const pageMembers = this.filteredMembers.slice(startIndex, endIndex);

        if (pageMembers.length === 0) {
            membersList.innerHTML = `
                <div class="no-members">
                    <i class="fas fa-users"></i>
                    <h3>メンバーが見つかりません</h3>
                    <p>検索条件を変更してお試しください</p>
                </div>
            `;
            return;
        }

        membersList.innerHTML = pageMembers.map(member => this.createMemberCard(member)).join('');
    }

    // メンバーカード作成
    createMemberCard(member) {
        const connectionStatus = this.getConnectionStatus(member.id);
        const onlineStatus = member.isOnline ? 'online' : (Math.random() > 0.5 ? 'away' : 'offline');
        const statusText = member.isOnline ? 'オンライン' : this.getLastActiveText(member.lastActive);
        
        // スキルと専門分野の表示
        const skillsHtml = member.skills ? member.skills.slice(0, 4).map(skill => 
            `<span class="skill-tag">${skill}</span>`
        ).join('') : '';
        
        const specialtiesHtml = member.specialties ? member.specialties.slice(0, 2).map(spec => 
            `<span class="specialty-tag">${spec}</span>`
        ).join('') : '';
        
        // 接続ボタンの状態を決定
        let connectButtonHTML = '';
        switch (connectionStatus) {
            case 'connected':
                connectButtonHTML = `
                    <button class="btn-connect connected" onclick="disconnectMember('${member.id}')">
                        <i class="fas fa-check"></i>
                        繋がり済み
                    </button>
                `;
                break;
            case 'pending_sent':
                connectButtonHTML = `
                    <button class="btn-connect pending" onclick="cancelConnectionRequest('${member.id}')">
                        <i class="fas fa-clock"></i>
                        承認待ち
                    </button>
                `;
                break;
            case 'pending_received':
                connectButtonHTML = `
                    <button class="btn-connect approve" onclick="approveConnectionRequest('${member.id}')">
                        <i class="fas fa-check"></i>
                        承認する
                    </button>
                `;
                break;
            default:
                connectButtonHTML = `
                    <button class="btn-connect" onclick="sendConnectionRequest('${member.id}')">
                        <i class="fas fa-user-plus"></i>
                        繋がる
                    </button>
                `;
        }

        return `
            <div class="member-card" data-member-id="${member.id}">
                <div class="member-header">
                    <div class="member-status ${onlineStatus}">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e0e0e0'/%3E%3C/svg%3E" data-src="${member.profileImage}" alt="${member.lastName} ${member.firstName}" class="member-avatar lazy">
                    </div>
                    <div class="member-basic-info">
                        <h3>${member.lastName} ${member.firstName}</h3>
                        <div class="member-title">${member.position}</div>
                        <div class="member-company">${member.company}</div>
                        ${member.matchingSettings.connectionApproval === 'auto' ? 
                            '<span class="approval-badge auto">自動承認</span>' : 
                            '<span class="approval-badge manual">要承認</span>'}
                    </div>
                </div>
                
                <div class="member-details">
                    <span class="member-industry">${member.industry}</span>
                    <div class="member-info-grid">
                        <div><i class="fas fa-users"></i> ${member.companySize}</div>
                        <div><i class="fas fa-map-marker-alt"></i> ${member.area || '未設定'}</div>
                        <div><i class="fas fa-star"></i> ${member.rating}</div>
                        <div><i class="fas fa-calendar"></i> ${this.getJoinedPeriodText(member.joinedDate)}</div>
                    </div>
                </div>
                
                <div class="member-skills-section">
                    ${skillsHtml ? `
                        <div class="skills-section">
                            <div class="section-title">スキル</div>
                            <div class="skills-tags">${skillsHtml}${member.skills.length > 4 ? `<span class="skill-tag more">+${member.skills.length - 4}</span>` : ''}</div>
                        </div>
                    ` : ''}
                    
                    ${specialtiesHtml ? `
                        <div class="specialties-section">
                            <div class="section-title">専門分野</div>
                            <div class="specialties-tags">${specialtiesHtml}${member.specialties.length > 2 ? `<span class="specialty-tag more">+${member.specialties.length - 2}</span>` : ''}</div>
                        </div>
                    ` : ''}
                    
                    <div class="challenges-section">
                        <div class="section-title">事業課題</div>
                        <div class="challenges-tags">
                            ${member.businessChallenges.slice(0, 3).map(challenge => 
                                `<span class="challenge-tag-small">${challenge}</span>`
                            ).join('')}
                            ${member.businessChallenges.length > 3 ? 
                                `<span class="challenge-tag-small more">+${member.businessChallenges.length - 3}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="member-stats">
                    <div class="member-stat">
                        <div class="member-stat-number">${member.connections}</div>
                        <div class="member-stat-label">繋がり</div>
                    </div>
                    <div class="member-stat">
                        <div class="member-stat-number">${member.eventsAttended}</div>
                        <div class="member-stat-label">イベント</div>
                    </div>
                    <div class="member-stat">
                        <div class="member-stat-number">${member.businessMatches}</div>
                        <div class="member-stat-label">マッチング</div>
                    </div>
                </div>
                
                <div class="member-actions">
                    ${connectButtonHTML}
                    <button class="btn-message" onclick="sendMessage('${member.id}')">
                        <i class="fas fa-envelope"></i>
                        メッセージ
                    </button>
                    <a href="member-profile.html?id=${member.id}" class="btn-view">
                        <i class="fas fa-eye"></i>
                        詳細
                    </a>
                </div>
            </div>
        `;
    }

    // 最終アクティブ時刻のテキスト取得
    getLastActiveText(lastActive) {
        const now = new Date();
        const diff = now - new Date(lastActive);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) return '1時間以内';
        if (hours < 24) return `${hours}時間前`;
        const days = Math.floor(hours / 24);
        return `${days}日前`;
    }

    // ページネーション描画
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredMembers.length / this.membersPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // 前へボタン
        paginationHTML += `
            <button onclick="memberManager.changePage(${this.currentPage - 1})" 
                    ${this.currentPage <= 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> 前へ
            </button>
        `;

        // ページ番号
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button onclick="memberManager.changePage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span>...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="memberManager.changePage(${i})" 
                        ${i === this.currentPage ? 'class="active"' : ''}>
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span>...</span>`;
            }
            paginationHTML += `<button onclick="memberManager.changePage(${totalPages})">${totalPages}</button>`;
        }

        // 次へボタン
        paginationHTML += `
            <button onclick="memberManager.changePage(${this.currentPage + 1})" 
                    ${this.currentPage >= totalPages ? 'disabled' : ''}>
                次へ <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    // ページ変更
    changePage(page) {
        const totalPages = Math.ceil(this.filteredMembers.length / this.membersPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderMembers();
        this.renderPagination();
        
        // ページトップにスクロール
        document.querySelector('.members-content').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    // 統計更新
    updateStats() {
        const totalMembers = document.getElementById('totalMembers');
        const filteredMembers = document.getElementById('filteredMembers');
        const myConnections = document.getElementById('myConnections');
        const activeToday = document.getElementById('activeToday');
        const onlineCount = document.getElementById('onlineCount');

        if (totalMembers) totalMembers.textContent = this.allMembers.length;
        if (filteredMembers) filteredMembers.textContent = this.filteredMembers.length;
        if (myConnections) {
            const connectedCount = this.allMembers.filter(m => m.isConnected).length;
            myConnections.textContent = connectedCount;
        }
        if (activeToday) {
            const activeCount = this.allMembers.filter(m => m.isOnline).length;
            activeToday.textContent = activeCount;
        }
        if (onlineCount) {
            const currentOnline = this.filteredMembers.filter(m => m.isOnline).length;
            onlineCount.textContent = currentOnline;
        }
    }

    // 検索クリアボタン更新
    updateClearSearchButton() {
        const clearButton = document.querySelector('.clear-search');
        const keywordInput = document.getElementById('keywordFilter');
        
        if (clearButton && keywordInput) {
            if (keywordInput.value.trim()) {
                clearButton.style.display = 'block';
            } else {
                clearButton.style.display = 'none';
            }
        }
    }
    
    // 検索結果件数の更新
    updateResultsCount() {
        const resultsCountElement = document.getElementById('resultsCount');
        if (resultsCountElement) {
            resultsCountElement.textContent = this.filteredMembers.length;
        }
    }
    
    // 結果が0件の場合のメッセージ表示
    showNoResultsMessage() {
        const membersList = document.getElementById('membersList');
        if (membersList) {
            membersList.innerHTML = `
                <div class="no-results-message">
                    <div class="no-results-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>検索条件に一致するメンバーが見つかりませんでした</h3>
                    <p>検索条件を変更するか、フィルターをリセットしてお試しください。</p>
                    <button class="btn-reset-search" onclick="window.memberManager.resetAllFilters()">
                        <i class="fas fa-undo"></i> フィルターをリセット
                    </button>
                </div>
            `;
        }
    }
    
    // すべてのフィルターをリセット
    resetAllFilters() {
        const filterElements = [
            'keywordFilter', 'industryFilter', 'positionFilter', 
            'sizeFilter', 'areaFilter', 'connectionFilter', 'sortFilter'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });
        
        // ソートをデフォルトに戻す
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.value = 'newest';
        }
        
        this.filters = {
            keyword: '',
            industry: '',
            position: '',
            size: '',
            area: '',
            connection: '',
            sort: 'newest'
        };
        
        this.toggleClearButton();
        this.applyFilters();
        this.showNotification('フィルターをリセットしました', 'info');
    }
    
    // 現在の検索条件を保存
    saveCurrentSearch() {
        const searchConditions = {
            filters: { ...this.filters },
            timestamp: new Date().toISOString(),
            name: this.generateSearchName()
        };
        
        const savedSearches = JSON.parse(localStorage.getItem('savedMemberSearches') || '[]');
        savedSearches.unshift(searchConditions);
        
        // 最大5件まで保存
        if (savedSearches.length > 5) {
            savedSearches.splice(5);
        }
        
        localStorage.setItem('savedMemberSearches', JSON.stringify(savedSearches));
        this.showNotification('検索条件を保存しました', 'success');
    }
    
    // 検索条件名を生成
    generateSearchName() {
        const conditions = [];
        if (this.filters.keyword) conditions.push(this.filters.keyword);
        if (this.filters.industry) conditions.push(this.filters.industry);
        if (this.filters.position) conditions.push(this.filters.position);
        if (this.filters.area) conditions.push(this.filters.area);
        
        return conditions.length > 0 ? conditions.join(', ') : '検索条件 ' + new Date().toLocaleDateString();
    }
    
    // 参加期間テキスト取得
    getJoinedPeriodText(joinedDate) {
        const joined = new Date(joinedDate);
        const now = new Date();
        const diffMs = now - joined;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) return `${diffDays}日前`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
        return `${Math.floor(diffDays / 365)}年前`;
    }
    
    // 通知表示
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
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        if (type === 'success') {
            notification.style.backgroundColor = '#28a745';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#dc3545';
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#212529';
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
    
    // 検索クリアボタンの表示/非表示
    toggleClearButton() {
        const keywordInput = document.getElementById('keywordFilter');
        const clearBtn = document.getElementById('clearSearch');
        if (keywordInput && clearBtn) {
            clearBtn.style.display = keywordInput.value.length > 0 ? 'block' : 'none';
        }
    }

    // 詳細検索適用
    applyAdvancedSearch() {
        const form = document.getElementById('advancedSearchForm');
        const formData = new FormData(form);
        
        // 選択された事業課題を取得
        const selectedChallenges = Array.from(form.querySelectorAll('input[name="businessChallenges"]:checked'))
            .map(cb => cb.value);

        this.filters = {
            ...this.filters,
            annualRevenue: formData.get('annualRevenue') || '',
            investmentBudget: formData.get('investmentBudget') || '',
            businessChallenges: selectedChallenges,
            joinedPeriod: formData.get('joinedPeriod') || '',
            connectionsRange: formData.get('connectionsRange') || ''
        };

        this.filteredMembers = this.allMembers.filter(member => {
            // 基本フィルターチェック
            const basicMatch = this.basicFilterMatch(member);
            if (!basicMatch) return false;

            // 年商フィルター
            if (this.filters.annualRevenue && member.annualRevenue !== this.filters.annualRevenue) {
                return false;
            }

            // 投資予算フィルター
            if (this.filters.investmentBudget && member.investmentBudget !== this.filters.investmentBudget) {
                return false;
            }

            // 事業課題フィルター
            if (this.filters.businessChallenges.length > 0) {
                const hasMatchingChallenge = this.filters.businessChallenges.some(challenge =>
                    member.businessChallenges.includes(challenge)
                );
                if (!hasMatchingChallenge) return false;
            }

            // 参加期間フィルター
            if (this.filters.joinedPeriod) {
                if (!this.checkJoinedPeriod(member.joinedDate, this.filters.joinedPeriod)) {
                    return false;
                }
            }

            // 繋がり数フィルター
            if (this.filters.connectionsRange) {
                if (!this.checkConnectionsRange(member.connections, this.filters.connectionsRange)) {
                    return false;
                }
            }

            return true;
        });

        this.sortMembers();
        this.currentPage = 1;
        this.updateDisplay();
        this.updateStats();
        this.closeAdvancedSearch();
        
        showNotification(`${this.filteredMembers.length}件のメンバーが見つかりました`, 'info');
    }

    // 基本フィルターマッチチェック
    basicFilterMatch(member) {
        const matchesSearch = !this.filters.search || 
            member.firstName.toLowerCase().includes(this.filters.search) ||
            member.lastName.toLowerCase().includes(this.filters.search) ||
            member.company.toLowerCase().includes(this.filters.search) ||
            member.industry.toLowerCase().includes(this.filters.search);

        const matchesIndustry = !this.filters.industry || member.industry === this.filters.industry;
        const matchesPosition = !this.filters.position || member.position === this.filters.position;
        const matchesSize = !this.filters.size || member.companySize === this.filters.size;

        return matchesSearch && matchesIndustry && matchesPosition && matchesSize;
    }

    // 参加期間チェック
    checkJoinedPeriod(joinedDate, period) {
        const joined = new Date(joinedDate);
        const now = new Date();
        const diffMs = now - joined;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        switch (period) {
            case '1month': return diffDays <= 30;
            case '3months': return diffDays <= 90;
            case '6months': return diffDays <= 180;
            case '1year': return diffDays <= 365;
            case 'over1year': return diffDays > 365;
            default: return true;
        }
    }

    // 繋がり数チェック
    checkConnectionsRange(connections, range) {
        switch (range) {
            case '0-10': return connections >= 0 && connections <= 10;
            case '11-50': return connections >= 11 && connections <= 50;
            case '51-100': return connections >= 51 && connections <= 100;
            case '101-200': return connections >= 101 && connections <= 200;
            case '200+': return connections > 200;
            default: return true;
        }
    }

    // 詳細検索を閉じる
    closeAdvancedSearch() {
        const modal = document.getElementById('advancedSearchModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // 接続状態を取得
    getConnectionStatus(memberId) {
        const currentUserId = this.currentUser.id;
        
        // 既存の接続をチェック
        const existingConnection = this.connectionRequests.find(req => 
            (req.senderId === currentUserId && req.receiverId === memberId) ||
            (req.senderId === memberId && req.receiverId === currentUserId)
        );

        if (existingConnection) {
            if (existingConnection.status === 'approved') {
                return 'connected';
            } else if (existingConnection.senderId === currentUserId) {
                return 'pending_sent';
            } else {
                return 'pending_received';
            }
        }

        return 'none';
    }

    // 接続リクエストを送信
    sendConnectionRequest(memberId) {
        const targetMember = this.allMembers.find(m => m.id === memberId);
        if (!targetMember) return;

        const currentUserId = this.currentUser.id;
        const requestId = `req-${Date.now()}`;
        
        const connectionRequest = {
            id: requestId,
            senderId: currentUserId,
            receiverId: memberId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            approvedAt: null
        };

        // 自動承認の場合は即座に承認
        if (targetMember.matchingSettings.connectionApproval === 'auto') {
            connectionRequest.status = 'approved';
            connectionRequest.approvedAt = new Date().toISOString();
            
            // 双方の接続数を増加
            targetMember.connections++;
            
            showNotification(`${targetMember.lastName} ${targetMember.firstName}さんと繋がりました（自動承認）`, 'success');
        } else {
            showNotification(`${targetMember.lastName} ${targetMember.firstName}さんに接続リクエストを送信しました`, 'info');
        }

        this.connectionRequests.push(connectionRequest);
        this.saveConnectionRequests();
        this.updateDisplay();
    }

    // 接続リクエストを承認
    approveConnectionRequest(memberId) {
        const currentUserId = this.currentUser.id;
        const request = this.connectionRequests.find(req => 
            req.senderId === memberId && req.receiverId === currentUserId && req.status === 'pending'
        );

        if (request) {
            request.status = 'approved';
            request.approvedAt = new Date().toISOString();
            
            // 双方の接続数を増加
            const senderMember = this.allMembers.find(m => m.id === memberId);
            if (senderMember) {
                senderMember.connections++;
                showNotification(`${senderMember.lastName} ${senderMember.firstName}さんと繋がりました`, 'success');
            }

            this.saveConnectionRequests();
            this.updateDisplay();
            this.updateStats();
        }
    }

    // 接続リクエストをキャンセル
    cancelConnectionRequest(memberId) {
        const currentUserId = this.currentUser.id;
        const requestIndex = this.connectionRequests.findIndex(req => 
            req.senderId === currentUserId && req.receiverId === memberId && req.status === 'pending'
        );

        if (requestIndex !== -1) {
            const targetMember = this.allMembers.find(m => m.id === memberId);
            this.connectionRequests.splice(requestIndex, 1);
            this.saveConnectionRequests();
            this.updateDisplay();
            
            if (targetMember) {
                showNotification(`${targetMember.lastName} ${targetMember.firstName}さんへのリクエストをキャンセルしました`, 'info');
            }
        }
    }

    // 接続を解除
    disconnectMember(memberId) {
        const currentUserId = this.currentUser.id;
        const requestIndex = this.connectionRequests.findIndex(req => 
            ((req.senderId === currentUserId && req.receiverId === memberId) ||
             (req.senderId === memberId && req.receiverId === currentUserId)) &&
            req.status === 'approved'
        );

        if (requestIndex !== -1) {
            const targetMember = this.allMembers.find(m => m.id === memberId);
            this.connectionRequests.splice(requestIndex, 1);
            
            // 接続数を減少
            if (targetMember && targetMember.connections > 0) {
                targetMember.connections--;
            }

            this.saveConnectionRequests();
            this.updateDisplay();
            this.updateStats();
            
            if (targetMember) {
                showNotification(`${targetMember.lastName} ${targetMember.firstName}さんとの繋がりを解除しました`, 'info');
            }
        }
    }

    // 接続リクエストを保存
    saveConnectionRequests() {
        localStorage.setItem('connectionRequests', JSON.stringify(this.connectionRequests));
    }

    // 保留中のリクエスト数を取得
    getPendingRequestsCount() {
        const currentUserId = this.currentUser.id;
        return this.connectionRequests.filter(req => 
            req.receiverId === currentUserId && req.status === 'pending'
        ).length;
    }
}

// ユーティリティ関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// グローバル関数
function searchMembers() {
    if (window.memberManager) {
        window.memberManager.applyFilters();
    }
}

function applyFilters() {
    if (window.memberManager) {
        window.memberManager.applyFilters();
    }
}

function resetFilters() {
    if (window.memberManager) {
        window.memberManager.resetAllFilters();
    }
}

function clearSearch() {
    document.getElementById('keywordFilter').value = '';
    if (window.memberManager) {
        window.memberManager.applyFilters();
        window.memberManager.toggleClearButton();
    }
}

function sendConnectionRequest(memberId) {
    if (window.memberManager) {
        window.memberManager.sendConnectionRequest(memberId);
    }
}

function approveConnectionRequest(memberId) {
    if (window.memberManager) {
        window.memberManager.approveConnectionRequest(memberId);
    }
}

function cancelConnectionRequest(memberId) {
    if (window.memberManager) {
        window.memberManager.cancelConnectionRequest(memberId);
    }
}

function disconnectMember(memberId) {
    if (window.memberManager) {
        window.memberManager.disconnectMember(memberId);
    }
}

function sendMessage(memberId) {
    const member = window.memberManager.allMembers.find(m => m.id === memberId);
    if (member) {
        showNotification(`${member.lastName} ${member.firstName}さんにメッセージを送信しました`, 'success');
        // 実際の実装ではメッセージページに遷移
        setTimeout(() => {
            window.location.href = `messages.html?to=${memberId}`;
        }, 1500);
    }
}

function openAdvancedSearch() {
    const modal = document.getElementById('advancedSearchModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAdvancedSearch() {
    const modal = document.getElementById('advancedSearchModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function resetAdvancedSearch() {
    const form = document.getElementById('advancedSearchForm');
    if (form) {
        form.reset();
    }
}

function applyAdvancedSearch() {
    if (window.memberManager) {
        window.memberManager.applyAdvancedSearch();
    }
}

function toggleMapView() {
    showNotification('マップ表示機能は開発中です', 'info');
}

// 通知表示関数
function showNotification(message, type = 'info') {
    if (window.memberManager) {
        window.memberManager.showNotification(message, type);
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // 認証チェック
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // メンバーマネージャー初期化
    window.memberManager = new MemberManager();
    
    // モーダルクリック時の閉じる処理
    const modal = document.getElementById('advancedSearchModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAdvancedSearch();
            }
        });
    }
});