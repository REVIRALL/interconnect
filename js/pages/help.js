// ヘルプページのJavaScript

// メニュートグル
document.getElementById('menuToggle').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active');
});

// FAQ アコーディオン
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', function() {
        // 他のアイテムを閉じる
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // 現在のアイテムをトグル
        item.classList.toggle('active');
    });
});

// 検索機能
const searchInput = document.querySelector('.search-box input');
const categoryCards = document.querySelectorAll('.category-card');
const faqItemsList = document.querySelectorAll('.faq-item');

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    // カテゴリーのフィルタリング
    categoryCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? '' : 'none';
    });
    
    // FAQのフィルタリング
    faqItemsList.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
    
    // 検索結果がない場合のメッセージ表示
    const visibleCategories = Array.from(categoryCards).filter(card => card.style.display !== 'none');
    const visibleFAQs = Array.from(faqItemsList).filter(item => item.style.display !== 'none');
    
    if (visibleCategories.length === 0 && visibleFAQs.length === 0 && searchTerm !== '') {
        showNoResults();
    } else {
        hideNoResults();
    }
});

// 検索結果がない場合の処理
function showNoResults() {
    const existingMessage = document.querySelector('.no-results');
    if (!existingMessage) {
        const message = document.createElement('div');
        message.className = 'no-results';
        message.innerHTML = `
            <p>検索結果が見つかりませんでした。</p>
            <p>別のキーワードでお試しください。</p>
        `;
        document.querySelector('.help-content').appendChild(message);
    }
}

function hideNoResults() {
    const message = document.querySelector('.no-results');
    if (message) {
        message.remove();
    }
}

// カテゴリーカードのクリック処理
categoryCards.forEach(card => {
    card.addEventListener('click', function() {
        const categoryTitle = this.querySelector('h3').textContent;
        
        // 該当するFAQを表示
        searchInput.value = categoryTitle;
        searchInput.dispatchEvent(new Event('input'));
        
        // FAQセクションまでスクロール
        document.querySelector('.faq-section').scrollIntoView({ behavior: 'smooth' });
    });
});

// チャットサポートを開く
function openChat() {
    // 実際の実装では、チャットウィジェットを開く
    alert('チャットサポートを開始します。\n営業時間：平日10:00〜18:00');
}

// ユーザーメニュードロップダウン
document.querySelector('.user-menu').addEventListener('click', function(e) {
    e.stopPropagation();
    this.classList.toggle('active');
});

// ドキュメント全体のクリックでドロップダウンを閉じる
document.addEventListener('click', function() {
    document.querySelector('.user-menu').classList.remove('active');
});

// キーボードナビゲーション
document.addEventListener('keydown', function(e) {
    // Escキーで検索をクリア
    if (e.key === 'Escape' && searchInput === document.activeElement) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.blur();
    }
    
    // Ctrl+Kで検索フォーカス
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
});

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // URLパラメータから検索クエリを取得
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query) {
        searchInput.value = query;
        searchInput.dispatchEvent(new Event('input'));
    }
    
    // ダークモードの初期化
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    
    html.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark' && toggle) {
        toggle.classList.add('dark');
    }
});

// ダークモード制御
function toggleTheme() {
    const html = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    const currentTheme = html.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        html.setAttribute('data-theme', 'light');
        toggle.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        toggle.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

// スタイル追加（検索結果なしメッセージ用）
const style = document.createElement('style');
style.textContent = `
    .no-results {
        text-align: center;
        padding: 3rem;
        color: var(--gray-text);
        font-size: 1.1rem;
    }
`;
document.head.appendChild(style);