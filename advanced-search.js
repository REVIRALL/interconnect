// 高度な検索機能

class AdvancedSearch {
    constructor() {
        this.searchHistory = [];
        this.savedSearches = this.loadSavedSearches();
        this.currentFilters = {};
        this.searchableData = {
            members: [],
            events: [],
            business: []
        };
        
        this.initialize();
    }

    initialize() {
        this.loadSearchableData();
        this.setupEventListeners();
        this.loadRecentSearches();
    }

    // 検索可能データの読み込み
    loadSearchableData() {
        // メンバーデータ
        this.searchableData.members = [
            {
                type: 'member',
                id: '1',
                name: '佐藤 次郎',
                company: '佐藤工業株式会社',
                industry: '製造業',
                location: '東京都品川区',
                position: '代表取締役',
                tags: ['製造業', 'IoT', 'AI', '品質管理'],
                description: '製造業で30年以上の実績を持つ'
            },
            {
                type: 'member',
                id: '2',
                name: '山田 花子',
                company: '山田商事株式会社',
                industry: '小売業',
                location: '大阪府大阪市',
                position: 'CEO',
                tags: ['小売業', 'EC', 'DX', 'ブランディング'],
                description: 'ECサイトの立ち上げやDXの推進'
            },
            {
                type: 'member',
                id: '3',
                name: '鈴木 三郎',
                company: '鈴木システムズ',
                industry: 'IT・ソフトウェア',
                location: '東京都渋谷区',
                position: 'CTO',
                tags: ['IT', 'AI', '機械学習', 'DX支援'],
                description: 'AI・機械学習を専門とするエンジニア'
            }
        ];

        // イベントデータ
        this.searchableData.events = [
            {
                type: 'event',
                id: 'evt1',
                title: '定例交流会',
                category: '交流会',
                date: '2024-02-15',
                location: '東京都渋谷区',
                tags: ['交流会', 'ネットワーキング', 'ビジネス'],
                description: '毎月開催している定例の交流会'
            },
            {
                type: 'event',
                id: 'evt2',
                title: 'ビジネスセミナー',
                category: 'セミナー',
                date: '2024-02-20',
                location: 'オンライン',
                tags: ['セミナー', 'ビジネス', 'オンライン'],
                description: '最新のビジネストレンドと実践的な経営手法'
            }
        ];

        // ビジネス案件データ
        this.searchableData.business = [
            {
                type: 'business',
                id: 'biz1',
                title: '新規取引先募集',
                category: 'パートナー募集',
                industry: '製造業',
                budget: '100-500万円',
                tags: ['製造業', 'パートナー募集', '取引先'],
                description: '精密部品の製造パートナーを募集'
            },
            {
                type: 'business',
                id: 'biz2',
                title: 'EC事業パートナー募集',
                category: 'パートナー募集',
                industry: '小売業',
                budget: '500-1000万円',
                tags: ['EC', 'パートナー募集', '小売業'],
                description: 'EC事業の拡大に向けたパートナー募集'
            }
        ];
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // 検索フォームがある場合
        const searchForm = document.getElementById('advancedSearchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        // フィルターの変更を監視
        document.querySelectorAll('.search-filter').forEach(filter => {
            filter.addEventListener('change', () => this.updateFilters());
        });

        // 検索履歴のクリック
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('search-history-item')) {
                this.applySearchFromHistory(e.target.dataset.query);
            }
        });
    }

    // 検索実行
    performSearch(query = null) {
        const searchQuery = query || document.getElementById('searchQuery')?.value || '';
        
        if (!searchQuery.trim() && Object.keys(this.currentFilters).length === 0) {
            this.showNotification('検索条件を入力してください', 'warning');
            return;
        }

        // 検索履歴に追加
        this.addToHistory(searchQuery);

        // 検索実行
        const results = this.search(searchQuery, this.currentFilters);
        
        // 結果表示
        this.displayResults(results);

        // 統計情報更新
        this.updateSearchStats(results);
    }

    // 実際の検索処理
    search(query, filters = {}) {
        let results = [];
        const searchTypes = filters.type ? [filters.type] : ['members', 'events', 'business'];
        
        searchTypes.forEach(type => {
            const typeResults = this.searchableData[type].filter(item => {
                // テキスト検索
                if (query) {
                    const searchFields = [
                        item.name || item.title,
                        item.company,
                        item.description,
                        item.industry,
                        item.location,
                        ...(item.tags || [])
                    ].filter(Boolean).join(' ').toLowerCase();
                    
                    if (!searchFields.includes(query.toLowerCase())) {
                        return false;
                    }
                }

                // フィルター適用
                if (filters.industry && item.industry !== filters.industry) {
                    return false;
                }
                
                if (filters.location && item.location && !item.location.includes(filters.location)) {
                    return false;
                }
                
                if (filters.category && item.category !== filters.category) {
                    return false;
                }
                
                if (filters.dateFrom && item.date) {
                    if (new Date(item.date) < new Date(filters.dateFrom)) {
                        return false;
                    }
                }
                
                if (filters.dateTo && item.date) {
                    if (new Date(item.date) > new Date(filters.dateTo)) {
                        return false;
                    }
                }
                
                if (filters.budgetMin && item.budget) {
                    const budgetValue = this.parseBudget(item.budget);
                    if (budgetValue < parseInt(filters.budgetMin)) {
                        return false;
                    }
                }
                
                if (filters.budgetMax && item.budget) {
                    const budgetValue = this.parseBudget(item.budget);
                    if (budgetValue > parseInt(filters.budgetMax)) {
                        return false;
                    }
                }

                return true;
            });
            
            results = results.concat(typeResults);
        });

        // スコアリングとソート
        if (query) {
            results = this.scoreAndSortResults(results, query);
        }

        return results;
    }

    // 検索結果のスコアリングとソート
    scoreAndSortResults(results, query) {
        const scoredResults = results.map(item => {
            let score = 0;
            const lowerQuery = query.toLowerCase();
            
            // 名前/タイトルの完全一致
            const mainField = (item.name || item.title || '').toLowerCase();
            if (mainField === lowerQuery) score += 100;
            else if (mainField.includes(lowerQuery)) score += 50;
            
            // 会社名の一致
            if (item.company && item.company.toLowerCase().includes(lowerQuery)) {
                score += 30;
            }
            
            // タグの一致
            if (item.tags) {
                item.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(lowerQuery)) {
                        score += 20;
                    }
                });
            }
            
            // 説明文の一致
            if (item.description && item.description.toLowerCase().includes(lowerQuery)) {
                score += 10;
            }
            
            return { ...item, score };
        });
        
        // スコアの高い順にソート
        return scoredResults.sort((a, b) => b.score - a.score);
    }

    // 結果表示
    displayResults(results) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>検索条件に一致する結果が見つかりませんでした</p>
                    <button class="btn-secondary" onclick="advancedSearch.clearSearch()">
                        検索条件をクリア
                    </button>
                </div>
            `;
            return;
        }

        // タイプ別にグループ化
        const groupedResults = {
            member: results.filter(r => r.type === 'member'),
            event: results.filter(r => r.type === 'event'),
            business: results.filter(r => r.type === 'business')
        };

        let html = '';
        
        // メンバー結果
        if (groupedResults.member.length > 0) {
            html += `
                <div class="result-section">
                    <h3><i class="fas fa-users"></i> メンバー (${groupedResults.member.length}件)</h3>
                    <div class="result-list">
                        ${groupedResults.member.map(member => `
                            <div class="result-item member-result" onclick="window.location.href='member-profile.html?id=${member.id}'">
                                <div class="result-avatar">
                                    <i class="fas fa-user-circle"></i>
                                </div>
                                <div class="result-content">
                                    <h4>${member.name}</h4>
                                    <p>${member.position} - ${member.company}</p>
                                    <div class="result-meta">
                                        <span><i class="fas fa-industry"></i> ${member.industry}</span>
                                        <span><i class="fas fa-map-marker-alt"></i> ${member.location}</span>
                                    </div>
                                    ${member.tags ? `
                                        <div class="result-tags">
                                            ${member.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                                ${member.score ? `<div class="match-score">関連度: ${Math.round(member.score)}%</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // イベント結果
        if (groupedResults.event.length > 0) {
            html += `
                <div class="result-section">
                    <h3><i class="fas fa-calendar"></i> イベント (${groupedResults.event.length}件)</h3>
                    <div class="result-list">
                        ${groupedResults.event.map(event => `
                            <div class="result-item event-result" onclick="showEventDetails('${event.id}')">
                                <div class="result-icon">
                                    <i class="fas fa-calendar-alt"></i>
                                </div>
                                <div class="result-content">
                                    <h4>${event.title}</h4>
                                    <p>${event.description}</p>
                                    <div class="result-meta">
                                        <span><i class="fas fa-folder"></i> ${event.category}</span>
                                        <span><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString('ja-JP')}</span>
                                        <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // ビジネス案件結果
        if (groupedResults.business.length > 0) {
            html += `
                <div class="result-section">
                    <h3><i class="fas fa-briefcase"></i> ビジネス案件 (${groupedResults.business.length}件)</h3>
                    <div class="result-list">
                        ${groupedResults.business.map(biz => `
                            <div class="result-item business-result" onclick="showBusinessDetails('${biz.id}')">
                                <div class="result-icon">
                                    <i class="fas fa-handshake"></i>
                                </div>
                                <div class="result-content">
                                    <h4>${biz.title}</h4>
                                    <p>${biz.description}</p>
                                    <div class="result-meta">
                                        <span><i class="fas fa-folder"></i> ${biz.category}</span>
                                        <span><i class="fas fa-industry"></i> ${biz.industry}</span>
                                        <span><i class="fas fa-yen-sign"></i> ${biz.budget}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        resultsContainer.innerHTML = html;
    }

    // フィルター更新
    updateFilters() {
        this.currentFilters = {};
        
        document.querySelectorAll('.search-filter').forEach(filter => {
            const value = filter.value;
            if (value) {
                this.currentFilters[filter.name] = value;
            }
        });
        
        // 自動的に再検索
        this.performSearch();
    }

    // 検索履歴に追加
    addToHistory(query) {
        if (!query.trim()) return;
        
        // 重複を削除
        this.searchHistory = this.searchHistory.filter(h => h.query !== query);
        
        // 新しい検索を先頭に追加
        this.searchHistory.unshift({
            query,
            filters: { ...this.currentFilters },
            timestamp: new Date().toISOString()
        });
        
        // 最大10件まで保持
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // ローカルストレージに保存
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        
        // 履歴表示を更新
        this.updateHistoryDisplay();
    }

    // 検索履歴の表示更新
    updateHistoryDisplay() {
        const historyContainer = document.getElementById('searchHistory');
        if (!historyContainer) return;
        
        if (this.searchHistory.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">検索履歴はありません</p>';
            return;
        }
        
        historyContainer.innerHTML = this.searchHistory.map(item => `
            <div class="search-history-item" data-query="${item.query}">
                <i class="fas fa-history"></i>
                <span>${item.query}</span>
                <small>${this.formatDate(item.timestamp)}</small>
            </div>
        `).join('');
    }

    // 保存された検索の読み込み
    loadSavedSearches() {
        const saved = localStorage.getItem('savedSearches');
        return saved ? JSON.parse(saved) : [];
    }

    // 検索条件の保存
    saveSearch(name) {
        const searchData = {
            id: Date.now().toString(),
            name,
            query: document.getElementById('searchQuery')?.value || '',
            filters: { ...this.currentFilters },
            createdAt: new Date().toISOString()
        };
        
        this.savedSearches.push(searchData);
        localStorage.setItem('savedSearches', JSON.stringify(this.savedSearches));
        
        this.showNotification('検索条件を保存しました', 'success');
        this.updateSavedSearchesDisplay();
    }

    // 保存された検索の表示更新
    updateSavedSearchesDisplay() {
        const container = document.getElementById('savedSearches');
        if (!container) return;
        
        if (this.savedSearches.length === 0) {
            container.innerHTML = '<p class="no-saved">保存された検索はありません</p>';
            return;
        }
        
        container.innerHTML = this.savedSearches.map(search => `
            <div class="saved-search-item">
                <div class="saved-search-info">
                    <h4>${search.name}</h4>
                    <p>${search.query || 'フィルターのみ'}</p>
                </div>
                <div class="saved-search-actions">
                    <button class="btn-small" onclick="advancedSearch.applySavedSearch('${search.id}')">
                        <i class="fas fa-search"></i> 適用
                    </button>
                    <button class="btn-small btn-danger" onclick="advancedSearch.deleteSavedSearch('${search.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 保存された検索を適用
    applySavedSearch(id) {
        const search = this.savedSearches.find(s => s.id === id);
        if (!search) return;
        
        // 検索クエリを設定
        const queryInput = document.getElementById('searchQuery');
        if (queryInput) {
            queryInput.value = search.query || '';
        }
        
        // フィルターを設定
        Object.keys(search.filters).forEach(key => {
            const filter = document.querySelector(`[name="${key}"]`);
            if (filter) {
                filter.value = search.filters[key];
            }
        });
        
        this.currentFilters = { ...search.filters };
        this.performSearch(search.query);
    }

    // 保存された検索を削除
    deleteSavedSearch(id) {
        this.savedSearches = this.savedSearches.filter(s => s.id !== id);
        localStorage.setItem('savedSearches', JSON.stringify(this.savedSearches));
        this.updateSavedSearchesDisplay();
        this.showNotification('保存された検索を削除しました', 'info');
    }

    // 検索をクリア
    clearSearch() {
        // 入力をクリア
        const queryInput = document.getElementById('searchQuery');
        if (queryInput) {
            queryInput.value = '';
        }
        
        // フィルターをクリア
        document.querySelectorAll('.search-filter').forEach(filter => {
            filter.value = '';
        });
        
        this.currentFilters = {};
        
        // 結果をクリア
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p class="search-prompt">検索条件を入力してください</p>';
        }
    }

    // 検索統計の更新
    updateSearchStats(results) {
        const statsContainer = document.getElementById('searchStats');
        if (!statsContainer) return;
        
        const stats = {
            total: results.length,
            members: results.filter(r => r.type === 'member').length,
            events: results.filter(r => r.type === 'event').length,
            business: results.filter(r => r.type === 'business').length
        };
        
        statsContainer.innerHTML = `
            <div class="search-stat">
                <span class="stat-label">総件数:</span>
                <span class="stat-value">${stats.total}</span>
            </div>
            <div class="search-stat">
                <span class="stat-label">メンバー:</span>
                <span class="stat-value">${stats.members}</span>
            </div>
            <div class="search-stat">
                <span class="stat-label">イベント:</span>
                <span class="stat-value">${stats.events}</span>
            </div>
            <div class="search-stat">
                <span class="stat-label">ビジネス:</span>
                <span class="stat-value">${stats.business}</span>
            </div>
        `;
    }

    // 最近の検索を読み込み
    loadRecentSearches() {
        const stored = localStorage.getItem('searchHistory');
        if (stored) {
            this.searchHistory = JSON.parse(stored);
            this.updateHistoryDisplay();
        }
    }

    // 予算をパース
    parseBudget(budgetString) {
        const match = budgetString.match(/(\d+)/);
        return match ? parseInt(match[1]) * 10000 : 0;
    }

    // 日付フォーマット
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '今';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '時間前';
        if (diff < 604800000) return Math.floor(diff / 86400000) + '日前';
        
        return date.toLocaleDateString('ja-JP');
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

// グローバルインスタンス
const advancedSearch = new AdvancedSearch();
window.advancedSearch = advancedSearch;

// エクスポート（他のスクリプトから使用する場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedSearch;
}