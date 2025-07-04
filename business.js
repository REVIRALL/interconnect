// ビジネスマッチングページのJavaScript

class BusinessManager {
    constructor() {
        // authが存在しない場合は直接localStorageから取得
        if (typeof auth !== 'undefined' && auth && auth.getCurrentUser) {
            this.currentUser = auth.getCurrentUser();
        } else {
            const userStr = localStorage.getItem('currentUser');
            this.currentUser = userStr ? JSON.parse(userStr) : null;
        }
        
        this.opportunities = JSON.parse(localStorage.getItem('businessOpportunities') || '[]');
        this.interests = JSON.parse(localStorage.getItem('businessInterests') || '[]');
        this.filters = {
            category: '',
            industry: '',
            budget: '',
            keyword: ''
        };
        this.initializeBusinessPage();
    }

    // ページ初期化
    initializeBusinessPage() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        this.setupEventListeners();
        this.generateDemoData();
        this.updateUserInfo();
        this.renderOpportunities();
        this.animateStats();
    }

    // SVGアバター生成
    generateSVGAvatar(name, size = 40) {
        let firstChar = name.charAt(0) || 'U';
        if (firstChar.charCodeAt(0) > 127) {
            firstChar = 'U';
        } else {
            firstChar = firstChar.toUpperCase();
        }
        
        const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad-${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1e5ba8;stop-opacity:1" /><stop offset="100%" style="stop-color:#4a90e2;stop-opacity:1" /></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#grad-${Date.now()})"/><text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="${size/2.5}" font-weight="600">${firstChar}</text></svg>`;
        
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
    }

    // デモデータ生成（大幅に拡張）
    generateDemoData() {
        if (this.opportunities.length === 0) {
            const demoOpportunities = [
                {
                    id: 'opp-1',
                    title: 'EC事業での物流パートナー募集',
                    category: 'collaboration',
                    industry: 'logistics',
                    description: '急成長中のEC事業において、全国配送に対応できる物流パートナーを探しています。月間1万件以上の配送実績がある企業を希望。冷蔵・冷凍配送にも対応できる事業者を優先。',
                    budget: 'large',
                    area: '関東',
                    poster: {
                        name: '株式会社EC Express',
                        userId: 'demo-user-1'
                    },
                    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active',
                    interestCount: 12,
                    tags: ['物流', 'EC', '配送', '全国対応'],
                    requirements: ['配送実績1万件以上', '冷蔵・冷凍対応', '全国ネットワーク']
                },
                {
                    id: 'opp-2',
                    title: 'ヘルスケアアプリ開発への投資募集',
                    category: 'investment',
                    industry: 'healthcare',
                    description: 'AIを活用した次世代ヘルスケアアプリの開発に向けて、シードラウンドでの資金調達を実施中。医療×テクノロジーに関心のある投資家を募集。既に医師50名がβテストに参加済み。',
                    budget: 'xlarge',
                    area: '関西',
                    poster: {
                        name: 'メディテック株式会社',
                        userId: 'demo-user-2'
                    },
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active',
                    interestCount: 8,
                    tags: ['AI', 'ヘルスケア', '投資', 'アプリ開発'],
                    requirements: ['投資経験', 'ヘルスケア業界知識', '長期パートナーシップ']
                },
                {
                    id: 'opp-3',
                    title: 'デジタルマーケティング支援サービス',
                    category: 'service',
                    industry: 'marketing',
                    description: 'BtoB企業向けのデジタルマーケティング支援を提供。SEO、リスティング広告、SNS運用まで一括サポート。月額制でROI保証付き。',
                    budget: 'medium',
                    area: 'オンライン',
                    poster: {
                        name: 'デジマーケ合同会社',
                        userId: 'demo-user-3'
                    },
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active',
                    interestCount: 15,
                    tags: ['マーケティング', 'SEO', 'SNS', 'ROI保証'],
                    requirements: ['BtoB事業', '月額予算50万円以上', '長期契約']
                },
                {
                    id: 'opp-4',
                    title: '飲食店向けPOSシステム開発パートナー募集',
                    category: 'partnership',
                    industry: 'it',
                    description: '飲食業界に特化したクラウドPOSシステムの開発において、技術パートナーを募集。React/Node.js経験者優遇。将来的な業務提携も視野に。',
                    budget: 'large',
                    area: '関東',
                    poster: {
                        name: 'レストテック株式会社',
                        userId: 'demo-user-4'
                    },
                    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active',
                    interestCount: 6,
                    tags: ['POS', '飲食', 'React', 'Node.js', 'クラウド'],
                    requirements: ['React/Node.js経験', '飲食業界理解', 'アジャイル開発']
                },
                {
                    id: 'opp-5',
                    title: '製造業向けIoTソリューション共同開発',
                    category: 'joint-venture',
                    industry: 'manufacturing',
                    description: '製造ラインの効率化を図るIoTソリューションの共同開発プロジェクト。センサー技術とデータ分析のノウハウを持つ企業と連携したい。',
                    budget: 'xlarge',
                    area: '中部',
                    poster: {
                        name: '中部製作所株式会社',
                        userId: 'demo-user-5'
                    },
                    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active',
                    interestCount: 9,
                    tags: ['IoT', '製造業', 'センサー', 'データ分析'],
                    requirements: ['IoT開発経験', 'センサー技術', '製造業実績']
                },
                {
                    id: 'opp-6',
                    title: '不動産管理システムのライセンス販売',
                    category: 'licensing',
                    industry: 'real-estate',
                    description: '20年の開発実績を持つ不動産管理システムのライセンス販売パートナーを募集。地域別販売権の提供も可能。手厚いサポート体制あり。',
                    budget: 'medium',
                    area: '全国',
                    poster: {
                        name: 'プロパティマネジメント株式会社',
                        userId: 'demo-user-6'
                    },
                    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active',
                    interestCount: 11,
                    tags: ['不動産', 'ライセンス', '管理システム', '地域販売権'],
                    requirements: ['不動産業界経験', '販売網', 'サポート体制']
                },
                {
                    id: 'opp-7',
                    title: 'オンライン教育プラットフォーム講師募集',
                    category: 'seeking',
                    industry: 'education',
                    description: 'ビジネススキル向上のためのオンライン教育プラットフォームで講師を募集。マーケティング、営業、マネジメント分野の専門家を求めています。',
                    budget: 'small',
                    area: 'オンライン',
                    poster: {
                        name: 'ビジネススキルアカデミー',
                        userId: 'demo-user-7'
                    },
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active',
                    interestCount: 18,
                    tags: ['教育', 'オンライン', '講師', 'ビジネススキル'],
                    requirements: ['実務経験5年以上', '講師経験', 'オンライン対応']
                },
                {
                    id: 'opp-8',
                    title: 'コールセンター業務委託先募集',
                    category: 'outsourcing',
                    industry: 'consulting',
                    description: 'カスタマーサポート業務の委託先を募集。24時間365日対応可能な事業者を優先。多言語対応（英語・中国語）ができれば尚良い。',
                    budget: 'large',
                    area: '関東',
                    poster: {
                        name: 'カスタマーケア株式会社',
                        userId: 'demo-user-8'
                    },
                    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active',
                    interestCount: 5,
                    tags: ['コールセンター', '24時間対応', '多言語', 'カスタマーサポート'],
                    requirements: ['24時間対応', '多言語対応', '品質管理体制']
                }
            ];
            
            this.opportunities = demoOpportunities;
            this.saveOpportunities();
        }
    }

    // イベントリスナーのセットアップ
    setupEventListeners() {
        // 拡張されたフィルター機能のセットアップ
        const filterElements = {
            category: document.getElementById('categoryFilter'),
            industry: document.getElementById('industryFilter'),
            budget: document.getElementById('budgetFilter'),
            area: document.getElementById('areaFilter'),
            date: document.getElementById('dateFilter'),
            sort: document.getElementById('sortFilter'),
            keyword: document.getElementById('keywordFilter')
        };

        Object.entries(filterElements).forEach(([key, element]) => {
            if (element) {
                if (key === 'keyword') {
                    element.addEventListener('input', () => {
                        this.applyFilters();
                        this.toggleClearButton();
                    });
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

        // 興味ありボタンのクリック処理
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-interest')) {
                const opportunityId = e.target.getAttribute('data-opportunity-id');
                this.toggleInterest(opportunityId, e.target);
            }
            
            // 詳細表示ボタンのクリック処理
            if (e.target.classList.contains('btn-view-detail') || e.target.closest('.btn-view-detail')) {
                const button = e.target.classList.contains('btn-view-detail') ? e.target : e.target.closest('.btn-view-detail');
                const opportunityId = button.getAttribute('data-opportunity-id');
                this.showOpportunityDetail(opportunityId);
            }
        });

        // もっと見るボタン
        const loadMoreBtn = document.querySelector('.btn-load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreOpportunities());
        }

        // ユーザーメニュー
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.classList.toggle('active');
            });
        }

        // ドキュメント全体のクリックでドロップダウンを閉じる
        document.addEventListener('click', () => {
            const userMenu = document.querySelector('.user-menu');
            if (userMenu) {
                userMenu.classList.remove('active');
            }
        });
    }

    // 検索クリアボタンの表示/非表示
    toggleClearButton() {
        const keywordInput = document.getElementById('keywordFilter');
        const clearBtn = document.getElementById('clearSearch');
        if (keywordInput && clearBtn) {
            clearBtn.style.display = keywordInput.value.length > 0 ? 'block' : 'none';
        }
    }

    // すべてのフィルターをリセット
    resetAllFilters() {
        const filterElements = [
            'categoryFilter', 'industryFilter', 'budgetFilter', 
            'areaFilter', 'dateFilter', 'sortFilter', 'keywordFilter'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });
        
        this.filters = {
            category: '',
            industry: '',
            budget: '',
            area: '',
            date: '',
            sort: 'newest',
            keyword: ''
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
        
        const savedSearches = JSON.parse(localStorage.getItem('savedBusinessSearches') || '[]');
        savedSearches.unshift(searchConditions);
        
        // 最大10件まで保存
        if (savedSearches.length > 10) {
            savedSearches.splice(10);
        }
        
        localStorage.setItem('savedBusinessSearches', JSON.stringify(savedSearches));
        this.showNotification('検索条件を保存しました', 'success');
    }

    // 検索条件名を生成
    generateSearchName() {
        const conditions = [];
        if (this.filters.keyword) conditions.push(this.filters.keyword);
        if (this.filters.category) conditions.push(this.getCategoryLabel(this.filters.category));
        if (this.filters.industry) conditions.push(this.getIndustryLabel(this.filters.industry));
        if (this.filters.area) conditions.push(this.filters.area);
        
        return conditions.length > 0 ? conditions.join(', ') : '検索条件 ' + new Date().toLocaleDateString();
    }

    // ユーザー情報更新
    updateUserInfo() {
    const userName = this.currentUser.lastName && this.currentUser.firstName ? 
        `${this.currentUser.lastName} ${this.currentUser.firstName}` : 
        this.currentUser.name || 'ユーザー';

    // ユーザー名更新
    const userNameElements = document.querySelectorAll('.user-menu span:not(.notification-badge)');
    userNameElements.forEach(element => {
        element.textContent = userName;
    });

    // アバター更新
    const userAvatars = document.querySelectorAll('.user-avatar');
    userAvatars.forEach(avatar => {
        if (this.currentUser.profileImage && 
            !this.currentUser.profileImage.includes('placeholder')) {
            avatar.src = this.currentUser.profileImage;
            avatar.onerror = () => {
                avatar.src = this.generateSVGAvatar(userName, 40);
            };
        } else {
            avatar.src = this.generateSVGAvatar(userName, 40);
        }
    });

    // 管理者メニューの表示制御
    const adminMenus = document.querySelectorAll('.admin-only');
    if (auth.isAdmin()) {
        adminMenus.forEach(menu => menu.style.display = 'block');
    } else {
        adminMenus.forEach(menu => menu.style.display = 'none');
    }
}

    // 高度なフィルター適用
    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const industryFilter = document.getElementById('industryFilter');
        const budgetFilter = document.getElementById('budgetFilter');
        const areaFilter = document.getElementById('areaFilter');
        const dateFilter = document.getElementById('dateFilter');
        const sortFilter = document.getElementById('sortFilter');
        const keywordFilter = document.getElementById('keywordFilter');

        this.filters = {
            category: categoryFilter?.value || '',
            industry: industryFilter?.value || '',
            budget: budgetFilter?.value || '',
            area: areaFilter?.value || '',
            date: dateFilter?.value || '',
            sort: sortFilter?.value || 'newest',
            keyword: keywordFilter?.value.toLowerCase() || ''
        };

        this.renderOpportunities();
    }

    // 日付フィルタリング
    isWithinDateRange(opportunityDate, filter) {
        if (!filter) return true;
        
        const now = new Date();
        const oppDate = new Date(opportunityDate);
        const diffTime = now.getTime() - oppDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filter) {
            case 'today':
                return diffDays <= 1;
            case 'week':
                return diffDays <= 7;
            case 'month':
                return diffDays <= 30;
            case 'quarter':
                return diffDays <= 90;
            default:
                return true;
        }
    }

    // ソート機能
    sortOpportunities(opportunities, sortType) {
        return opportunities.sort((a, b) => {
            switch (sortType) {
                case 'newest':
                    return new Date(b.date) - new Date(a.date);
                case 'oldest':
                    return new Date(a.date) - new Date(b.date);
                case 'popular':
                    return b.interestCount - a.interestCount;
                case 'budget-high':
                    return this.getBudgetValue(b.budget) - this.getBudgetValue(a.budget);
                case 'budget-low':
                    return this.getBudgetValue(a.budget) - this.getBudgetValue(b.budget);
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });
    }

    // 予算の数値変換（ソート用）
    getBudgetValue(budget) {
        const values = {
            'small': 1,
            'medium': 2,
            'large': 3,
            'xlarge': 4,
            'negotiable': 2.5
        };
        return values[budget] || 0;
    }

    // 拡張された案件一覧レンダリング
    renderOpportunities() {
        const opportunitiesList = document.getElementById('opportunitiesList');
        if (!opportunitiesList) return;

        // 高度なフィルタリング
        let filteredOpportunities = this.opportunities.filter(opp => {
            const matchesCategory = !this.filters.category || opp.category === this.filters.category;
            const matchesIndustry = !this.filters.industry || opp.industry === this.filters.industry;
            const matchesBudget = !this.filters.budget || opp.budget === this.filters.budget;
            const matchesArea = !this.filters.area || opp.area === this.filters.area || 
                               (this.filters.area === '全国' && !opp.area) ||
                               (opp.area && opp.area.includes(this.filters.area));
            const matchesDate = this.isWithinDateRange(opp.date, this.filters.date);
            
            // 拡張されたキーワード検索（タグと要件も検索対象に）
            const matchesKeyword = !this.filters.keyword || 
                opp.title.toLowerCase().includes(this.filters.keyword) ||
                opp.description.toLowerCase().includes(this.filters.keyword) ||
                opp.poster.name.toLowerCase().includes(this.filters.keyword) ||
                (opp.tags && opp.tags.some(tag => tag.toLowerCase().includes(this.filters.keyword))) ||
                (opp.requirements && opp.requirements.some(req => req.toLowerCase().includes(this.filters.keyword)));

            return matchesCategory && matchesIndustry && matchesBudget && 
                   matchesArea && matchesDate && matchesKeyword;
        });

        // ソート適用
        filteredOpportunities = this.sortOpportunities(filteredOpportunities, this.filters.sort);

        // 案件カードのHTML生成
        opportunitiesList.innerHTML = filteredOpportunities.map(opp => 
            this.createOpportunityCard(opp)
        ).join('');

        // 検索結果件数の更新
        this.updateResultsCount(filteredOpportunities.length);
        
        // フィルター結果の統計表示
        this.updateFilterStats(filteredOpportunities.length);
        
        // 結果が0件の場合のメッセージ表示
        if (filteredOpportunities.length === 0) {
            this.showNoResultsMessage();
        }
    }

    // 検索結果件数の更新
    updateResultsCount(count) {
        const resultsCountElement = document.getElementById('resultsCount');
        if (resultsCountElement) {
            resultsCountElement.textContent = count;
        }
    }

    // 結果が0件の場合のメッセージ表示
    showNoResultsMessage() {
        const opportunitiesList = document.getElementById('opportunitiesList');
        if (opportunitiesList) {
            opportunitiesList.innerHTML = `
                <div class="no-results-message">
                    <div class="no-results-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>検索条件に一致する案件が見つかりませんでした</h3>
                    <p>検索条件を変更するか、フィルターをリセットしてお試しください。</p>
                    <button class="btn-reset-search" onclick="window.businessManager.resetAllFilters()">
                        <i class="fas fa-undo"></i> フィルターをリセット
                    </button>
                </div>
            `;
        }
    }

    // 拡張された案件カード作成
    createOpportunityCard(opportunity) {
        const isInterested = this.interests.some(interest => 
            interest.opportunityId === opportunity.id && interest.userId === this.currentUser.id
        );

        const posterAvatar = this.generateSVGAvatar(opportunity.poster.name, 30);
        
        // タグの生成
        const tagsHtml = opportunity.tags ? opportunity.tags.map(tag => 
            `<span class="opportunity-tag">${tag}</span>`
        ).join('') : '';
        
        // 要件の生成
        const requirementsHtml = opportunity.requirements ? opportunity.requirements.map(req => 
            `<li>${req}</li>`
        ).join('') : '';

        return `
            <div class="opportunity-card" data-id="${opportunity.id}">
                <div class="opportunity-header">
                    <span class="opportunity-category ${opportunity.category}">${this.getCategoryLabel(opportunity.category)}</span>
                    <span class="opportunity-date">${this.formatDate(opportunity.date)}</span>
                </div>
                <h3>${opportunity.title}</h3>
                <p class="opportunity-description">${opportunity.description}</p>
                
                ${tagsHtml ? `<div class="opportunity-tags">${tagsHtml}</div>` : ''}
                
                <div class="opportunity-details">
                    <span><i class="fas fa-building"></i> ${this.getIndustryLabel(opportunity.industry)}</span>
                    <span><i class="fas fa-yen-sign"></i> ${this.getBudgetLabel(opportunity.budget)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${opportunity.area || '未設定'}</span>
                </div>
                
                ${requirementsHtml ? `
                    <div class="opportunity-requirements">
                        <h4><i class="fas fa-check-circle"></i> 求める条件</h4>
                        <ul>${requirementsHtml}</ul>
                    </div>
                ` : ''}
                
                <div class="opportunity-footer">
                    <div class="opportunity-poster">
                        <img src="${posterAvatar}" alt="投稿者" onerror="this.src='${posterAvatar}'">
                        <span>${opportunity.poster.name}</span>
                    </div>
                    <div class="opportunity-actions">
                        <span class="interest-count">
                            <i class="fas fa-heart"></i> ${opportunity.interestCount}
                        </span>
                        <button class="btn-interest ${isInterested ? 'interested' : ''}" 
                                data-opportunity-id="${opportunity.id}">
                            <i class="fas fa-${isInterested ? 'heart' : 'heart-o'}"></i>
                            ${isInterested ? '興味あり済み' : '興味あり'}
                        </button>
                        <button class="btn-view-detail" data-opportunity-id="${opportunity.id}">
                            <i class="fas fa-eye"></i> 詳細
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 興味ありボタンの処理（双方向機能強化）
    toggleInterest(opportunityId, button) {
        const userId = this.currentUser.id;
        const existingInterest = this.interests.find(interest => 
            interest.opportunityId === opportunityId && interest.userId === userId
        );

        if (existingInterest) {
            // 興味を削除
            this.interests = this.interests.filter(interest => 
                !(interest.opportunityId === opportunityId && interest.userId === userId)
            );
            
            // ボタンの見た目を更新
            this.updateInterestButton(button, false);
            
            // 興味数を減らす
            const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
            if (opportunity && opportunity.interestCount > 0) {
                opportunity.interestCount--;
            }
            
            this.showNotification('興味ありを取り消しました', 'info');
            
            // 投稿者への通知（実際の実装では通知システムで処理）
            this.sendInterestNotification(opportunity, false);
            
        } else {
            // 興味を追加
            const newInterest = {
                id: 'interest-' + Date.now(),
                opportunityId,
                userId,
                userName: this.currentUser.company || `${this.currentUser.lastName} ${this.currentUser.firstName}`,
                userType: this.currentUser.company ? '企業' : '個人',
                createdAt: new Date().toISOString()
            };
            
            this.interests.push(newInterest);
            
            // ボタンの見た目を更新
            this.updateInterestButton(button, true);
            
            // 興味数を増やす
            const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
            if (opportunity) {
                opportunity.interestCount++;
            }
            
            this.showNotification('興味ありを登録しました', 'success');
            
            // 投稿者への通知（実際の実装では通知システムで処理）
            this.sendInterestNotification(opportunity, true);
        }

        this.saveInterests();
        this.saveOpportunities();
        
        // 全ての興味数表示を更新
        this.updateAllInterestCounts(opportunityId);
        
        // 詳細モーダルが開いている場合は更新
        this.updateDetailModalInterest(opportunityId);
    }

    // 興味ありボタンの見た目を更新
    updateInterestButton(button, isInterested) {
        if (isInterested) {
            button.innerHTML = '<i class="fas fa-heart"></i> 興味あり済み';
            button.classList.add('interested');
        } else {
            button.innerHTML = '<i class="fas fa-heart-o"></i> 興味あり';
            button.classList.remove('interested');
        }
    }

    // 全ての興味数表示を更新
    updateAllInterestCounts(opportunityId) {
        const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
        if (!opportunity) return;

        // カード内の興味数を更新
        const cardInterestCounts = document.querySelectorAll(`[data-id="${opportunityId}"] .interest-count`);
        cardInterestCounts.forEach(element => {
            element.innerHTML = `<i class="fas fa-heart"></i> ${opportunity.interestCount}`;
        });
    }

    // 詳細モーダルの興味数と興味ユーザーリストを更新
    updateDetailModalInterest(opportunityId) {
        const detailModal = document.getElementById('detailModal');
        if (!detailModal) return;

        const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
        if (!opportunity) return;

        // 詳細モーダル内の興味ありボタンを更新
        const detailInterestBtn = detailModal.querySelector('.btn-interest-detail');
        if (detailInterestBtn) {
            const isInterested = this.interests.some(interest => 
                interest.opportunityId === opportunityId && interest.userId === this.currentUser.id
            );
            
            if (isInterested) {
                detailInterestBtn.innerHTML = '<i class="fas fa-heart"></i> 興味ありを取り消す';
                detailInterestBtn.classList.add('interested');
            } else {
                detailInterestBtn.innerHTML = '<i class="fas fa-heart-o"></i> 興味ありを登録';
                detailInterestBtn.classList.remove('interested');
            }
        }

        // 興味を示したユーザーリストを更新
        const interestedUsersSection = detailModal.querySelector('.interested-users-section');
        if (interestedUsersSection) {
            const interestedUsers = this.getInterestedUsers(opportunityId);
            const interestedUsersHtml = interestedUsers.length > 0 ? `
                <h4><i class="fas fa-users"></i> 興味を示している企業・個人 (${interestedUsers.length}社)</h4>
                <div class="interested-users-list">
                    ${interestedUsers.map(user => `
                        <div class="interested-user-item">
                            <img src="${this.generateSVGAvatar(user.name, 40)}" alt="${user.name}">
                            <div class="user-info">
                                <div class="user-name">${user.name}</div>
                                <div class="user-type">${user.type}</div>
                            </div>
                            <div class="interest-date">${this.formatDate(user.interestedAt)}</div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <h4><i class="fas fa-users"></i> まだ興味を示している企業・個人はいません</h4>
                <p style="color: var(--gray-600); margin-top: var(--space-md);">この案件に最初に興味を示してみませんか？</p>
            `;
            
            interestedUsersSection.innerHTML = interestedUsersHtml;
        }
    }

    // 投稿者への通知送信（デモ用）
    sendInterestNotification(opportunity, isNewInterest) {
        const notifications = JSON.parse(localStorage.getItem('businessNotifications') || '[]');
        
        if (isNewInterest) {
            notifications.unshift({
                id: 'notif-' + Date.now(),
                type: 'interest',
                title: '新しい興味表示',
                message: `${this.currentUser.company || this.currentUser.lastName + this.currentUser.firstName}さんがあなたの案件「${opportunity.title}」に興味を示しました。`,
                opportunityId: opportunity.id,
                fromUserId: this.currentUser.id,
                toUserId: opportunity.poster.userId,
                createdAt: new Date().toISOString(),
                read: false
            });
        }
        
        localStorage.setItem('businessNotifications', JSON.stringify(notifications));
    }

    // 興味を示したユーザー一覧取得（実際のデータ使用）
    getInterestedUsers(opportunityId) {
        const opportunityInterests = this.interests.filter(interest => 
            interest.opportunityId === opportunityId
        );
        
        // 実際の興味データから生成
        const users = opportunityInterests.map(interest => ({
            name: interest.userName || 'ユーザー',
            type: interest.userType || '企業',
            interestedAt: interest.createdAt
        }));

        // デモ用のダミーデータで不足分を補完
        const demoUsers = [
            { name: '田中商事株式会社', type: '製造業', interestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
            { name: '山田技術サービス', type: 'IT・技術', interestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { name: '佐藤マーケティング', type: 'コンサルティング', interestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
        ];
        
        const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
        const targetCount = opportunity ? opportunity.interestCount : 0;
        
        // 実際のユーザーとダミーデータを組み合わせ
        const allUsers = [...users, ...demoUsers];
        return allUsers.slice(0, Math.max(targetCount, users.length));
    }

    // 案件詳細表示
    showOpportunityDetail(opportunityId) {
        const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
        if (!opportunity) {
            this.showNotification('案件が見つかりませんでした', 'error');
            return;
        }

        // 詳細モーダルのHTML作成
        const modalHTML = this.createDetailModal(opportunity);
        
        // 既存のモーダルを削除
        const existingModal = document.getElementById('detailModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 新しいモーダルを追加
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // モーダル表示
        const modal = document.getElementById('detailModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // モーダル内のイベントリスナー設定
        this.setupDetailModalListeners(opportunity);
    }

    // 詳細モーダルのHTML作成
    createDetailModal(opportunity) {
        const isInterested = this.interests.some(interest => 
            interest.opportunityId === opportunity.id && interest.userId === this.currentUser.id
        );

        const posterAvatar = this.generateSVGAvatar(opportunity.poster.name, 60);
        
        // タグの生成
        const tagsHtml = opportunity.tags ? opportunity.tags.map(tag => 
            `<span class="opportunity-tag">${tag}</span>`
        ).join('') : '';
        
        // 要件の生成
        const requirementsHtml = opportunity.requirements ? opportunity.requirements.map(req => 
            `<li>${req}</li>`
        ).join('') : '';

        // 興味を示したユーザー一覧（デモ用）
        const interestedUsers = this.getInterestedUsers(opportunity.id);
        const interestedUsersHtml = interestedUsers.length > 0 ? `
            <div class="interested-users-section">
                <h4><i class="fas fa-users"></i> 興味を示している企業・個人 (${interestedUsers.length}社)</h4>
                <div class="interested-users-list">
                    ${interestedUsers.map(user => `
                        <div class="interested-user-item">
                            <img src="${this.generateSVGAvatar(user.name, 40)}" alt="${user.name}">
                            <div class="user-info">
                                <div class="user-name">${user.name}</div>
                                <div class="user-type">${user.type}</div>
                            </div>
                            <div class="interest-date">${this.formatDate(user.interestedAt)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return `
            <div id="detailModal" class="modal">
                <div class="modal-content detail-modal-content">
                    <div class="modal-header">
                        <h3>案件詳細</h3>
                        <button type="button" class="close-modal" onclick="closeDetailModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-header">
                            <div class="detail-category-wrapper">
                                <span class="opportunity-category ${opportunity.category}">${this.getCategoryLabel(opportunity.category)}</span>
                                <span class="opportunity-date">${this.formatDate(opportunity.date)}</span>
                            </div>
                            <h2 class="detail-title">${opportunity.title}</h2>
                        </div>

                        <div class="detail-content">
                            <div class="detail-section">
                                <h4><i class="fas fa-info-circle"></i> 案件概要</h4>
                                <p class="detail-description">${opportunity.description}</p>
                            </div>

                            ${tagsHtml ? `
                                <div class="detail-section">
                                    <h4><i class="fas fa-tags"></i> 関連タグ</h4>
                                    <div class="opportunity-tags">${tagsHtml}</div>
                                </div>
                            ` : ''}

                            <div class="detail-section">
                                <h4><i class="fas fa-building"></i> 案件詳細情報</h4>
                                <div class="detail-info-grid">
                                    <div class="info-item">
                                        <label>業界</label>
                                        <span>${this.getIndustryLabel(opportunity.industry)}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>予算規模</label>
                                        <span>${this.getBudgetLabel(opportunity.budget)}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>対象地域</label>
                                        <span>${opportunity.area || '未設定'}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>投稿日時</label>
                                        <span>${this.formatDate(opportunity.date)}</span>
                                    </div>
                                </div>
                            </div>

                            ${requirementsHtml ? `
                                <div class="detail-section">
                                    <h4><i class="fas fa-check-circle"></i> 求める条件・要件</h4>
                                    <ul class="requirements-list">${requirementsHtml}</ul>
                                </div>
                            ` : ''}

                            <div class="detail-section">
                                <h4><i class="fas fa-user-tie"></i> 投稿者情報</h4>
                                <div class="poster-info">
                                    <img src="${posterAvatar}" alt="投稿者" class="poster-avatar">
                                    <div class="poster-details">
                                        <div class="poster-name">${opportunity.poster.name}</div>
                                        <div class="poster-type">企業</div>
                                    </div>
                                    <button class="btn-contact-poster" data-poster-id="${opportunity.poster.userId}">
                                        <i class="fas fa-envelope"></i> メッセージを送る
                                    </button>
                                </div>
                            </div>

                            ${interestedUsersHtml}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-cancel" onclick="closeDetailModal()">閉じる</button>
                        <button type="button" class="btn-interest-detail ${isInterested ? 'interested' : ''}" 
                                data-opportunity-id="${opportunity.id}">
                            <i class="fas fa-${isInterested ? 'heart' : 'heart-o'}"></i>
                            ${isInterested ? '興味ありを取り消す' : '興味ありを登録'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 詳細モーダルのイベントリスナー設定
    setupDetailModalListeners(opportunity) {
        // 興味ありボタン
        const interestBtn = document.querySelector('.btn-interest-detail');
        if (interestBtn) {
            interestBtn.addEventListener('click', (e) => {
                this.toggleInterest(opportunity.id, e.target);
            });
        }

        // 投稿者へのメッセージボタン
        const contactBtn = document.querySelector('.btn-contact-poster');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                this.showContactModal(opportunity.poster);
            });
        }

        // モーダル外クリックで閉じる
        const modal = document.getElementById('detailModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeDetailModal();
            }
        });
    }

    // 興味を示したユーザー一覧取得（デモ用）
    getInterestedUsers(opportunityId) {
        // 実際の実装では、この案件に興味を示したユーザーのリストを取得
        const demoUsers = [
            { name: '田中商事株式会社', type: '製造業', interestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
            { name: '山田技術サービス', type: 'IT・技術', interestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { name: '佐藤マーケティング', type: 'コンサルティング', interestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
        ];
        
        // 実際の興味数に基づいてランダムに返す
        const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
        const count = Math.min(opportunity ? opportunity.interestCount : 0, demoUsers.length);
        return demoUsers.slice(0, count);
    }

    // 投稿者への連絡モーダル表示
    showContactModal(poster) {
        const contactModalHTML = `
            <div id="contactModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>メッセージを送信</h3>
                        <button type="button" class="close-modal" onclick="closeContactModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="contact-info">
                            <img src="${this.generateSVGAvatar(poster.name, 50)}" alt="${poster.name}">
                            <div>
                                <h4>${poster.name}</h4>
                                <p>企業</p>
                            </div>
                        </div>
                        <form id="contactForm">
                            <div class="form-group">
                                <label for="subject">件名 <span class="required">*</span></label>
                                <input type="text" id="subject" name="subject" required placeholder="件名を入力してください">
                            </div>
                            <div class="form-group">
                                <label for="message">メッセージ <span class="required">*</span></label>
                                <textarea id="message" name="message" required rows="6" placeholder="メッセージを入力してください"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-cancel" onclick="closeContactModal()">キャンセル</button>
                        <button type="button" class="btn-submit" onclick="sendMessage()">
                            <i class="fas fa-paper-plane"></i> 送信
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', contactModalHTML);
        document.getElementById('contactModal').style.display = 'flex';
    }

    // データ保存
    saveOpportunities() {
    localStorage.setItem('businessOpportunities', JSON.stringify(this.opportunities));
}

    saveInterests() {
    localStorage.setItem('businessInterests', JSON.stringify(this.interests));
}

    // ラベル取得関数
        getCategoryLabel(category) {
        const labels = {
            collaboration: '業務提携',
            investment: '投資案件',
            partnership: 'パートナー募集',
            service: 'サービス提供',
            seeking: 'サービス探し',
            'joint-venture': '合弁事業',
            licensing: 'ライセンス',
            outsourcing: '業務委託'
        };
        return labels[category] || category;
    }

    getIndustryLabel(industry) {
        const labels = {
            it: 'IT・テクノロジー',
            manufacturing: '製造業',
            retail: '小売・流通',
            finance: '金融・保険',
            healthcare: '医療・ヘルスケア',
            education: '教育・研修',
            consulting: 'コンサルティング',
            'real-estate': '不動産',
            food: '飲食・食品',
            logistics: '物流・運輸',
            marketing: 'マーケティング・広告',
            entertainment: 'エンターテイメント'
        };
        return labels[industry] || industry;
    }

    getBudgetLabel(budget) {
        const labels = {
            small: '〜100万円',
            medium: '100万円〜1000万円',
            large: '1000万円〜1億円',
            xlarge: '1億円以上',
            negotiable: '要相談'
        };
        return labels[budget] || '未設定';
    }

    formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

    // フィルター統計更新
    updateFilterStats(count) {
    // 統計表示（簡易版）
    console.log(`${count}件の案件が見つかりました`);
}

    // 追加の案件読み込み
    loadMoreOpportunities() {
    this.showNotification('追加の案件を読み込みました', 'info');
}

    // 統計情報のアニメーション
    animateStats() {
    const statNumbers = document.querySelectorAll('.stat-content h3');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        const isPercentage = stat.textContent.includes('%');
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = isPercentage ? `${Math.floor(current)}%` : Math.floor(current);
        }, 30);
    });
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
}

// グローバル関数とモーダル処理
function showCreateModal() {
    document.getElementById('createModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeCreateModal() {
    document.getElementById('createModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('createOpportunityForm').reset();
}

// 詳細モーダルを閉じる
function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        modal.remove();
    }
}

// 連絡モーダルを閉じる
function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        modal.remove();
    }
}

// メッセージ送信
function sendMessage() {
    const form = document.getElementById('contactForm');
    const formData = new FormData(form);
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const subject = formData.get('subject');
    const message = formData.get('message');
    const currentUser = window.businessManager.currentUser;
    
    // メッセージページで使用する形式でメッセージを保存
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    
    // 新しいメッセージID
    const messageId = 'msg-' + Date.now();
    const conversationId = 'conv-business-' + Date.now();
    
    // メッセージを追加
    const newMessage = {
        id: messageId,
        conversation_id: conversationId,
        sender_id: currentUser.id,
        receiver_id: 'demo-poster',
        content: `件名: ${subject}\n\n${message}`,
        type: 'text',
        created_at: new Date().toISOString(),
        read: false
    };
    
    messages.push(newMessage);
    
    // 会話を追加（既存の会話がない場合）
    const existingConversation = conversations.find(conv => 
        conv.id === conversationId || 
        (conv.participants && conv.participants.includes('demo-poster'))
    );
    
    if (!existingConversation) {
        const newConversation = {
            id: conversationId,
            participants: [currentUser.id, 'demo-poster'],
            last_message: message,
            last_message_time: new Date().toISOString(),
            unread_count: 0,
            other_user: {
                id: 'demo-poster',
                name: '案件投稿者',
                avatar: window.businessManager.generateSVGAvatar('案件投稿者', 40),
                status: 'online'
            }
        };
        conversations.push(newConversation);
        localStorage.setItem('conversations', JSON.stringify(conversations));
    }
    
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // 既存のビジネスメッセージも保存（互換性のため）
    const businessMessages = JSON.parse(localStorage.getItem('businessMessages') || '[]');
    businessMessages.push({
        id: messageId,
        subject: subject,
        message: message,
        fromUser: currentUser.id,
        toUser: 'demo-poster',
        sentAt: new Date().toISOString(),
        status: 'sent'
    });
    localStorage.setItem('businessMessages', JSON.stringify(businessMessages));
    
    window.businessManager.showNotification('メッセージを送信しました。メッセージページでご確認ください。', 'success');
    closeContactModal();
}

// 案件投稿
function submitOpportunity() {
    if (!window.businessManager) {
        alert('システムエラー: ビジネスマネージャーが初期化されていません');
        return;
    }
    
    if (!window.businessManager.currentUser) {
        alert('ログインが必要です');
        return;
    }
    
    const form = document.getElementById('createOpportunityForm');
    const formData = new FormData(form);
    
    // バリデーション
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // フォームデータの取得
    const data = {
        id: 'opp-' + Date.now(),
        title: formData.get('title'),
        category: formData.get('category'),
        industry: formData.get('industry'),
        description: formData.get('description'),
        budget: formData.get('budget'),
        area: formData.get('area') || '未設定',
        poster: {
            name: window.businessManager.currentUser.company || 
                  `${window.businessManager.currentUser.lastName || ''} ${window.businessManager.currentUser.firstName || ''}`.trim() || 
                  '匿名ユーザー',
            userId: window.businessManager.currentUser.id
        },
        date: new Date().toISOString(),
        status: 'active',
        interestCount: 0
    };
    
    // 案件をリストに追加
    window.businessManager.opportunities.unshift(data);
    window.businessManager.saveOpportunities();
    window.businessManager.renderOpportunities();
    
    window.businessManager.showNotification('案件を投稿しました', 'success');
    closeCreateModal();
}

// モーダル外クリックで閉じる
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('createModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCreateModal();
            }
        });
    }
});

// グローバルインスタンス
let businessManager = null;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 認証チェック（authが存在しない場合はlocalStorageを直接チェック）
        let isLoggedIn = false;
        if (typeof auth !== 'undefined' && auth.isLoggedIn) {
            isLoggedIn = auth.isLoggedIn();
        } else {
            isLoggedIn = localStorage.getItem('currentUser') !== null;
        }
        
        if (!isLoggedIn) {
            console.warn('User not logged in');
            // ログインページにリダイレクトする代わりに警告表示
            const mainContent = document.querySelector('.business-content');
            if (mainContent) {
                mainContent.innerHTML = '<p style="text-align: center; padding: 50px;">ログインが必要です</p>';
            }
            return;
        }

        // BusinessManagerを初期化
        window.businessManager = new BusinessManager();
    } catch (error) {
        console.error('Business page initialization failed:', error);
    }
});