/**
 * 削除された必要機能の復旧
 * FAQ開閉機能とその他のインタラクション機能
 */

// FAQ開閉機能
function setupFAQToggle() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const faqAnswer = faqItem.querySelector('.faq-answer');
            const isOpen = faqItem.classList.contains('active');
            
            // 全てのFAQを閉じる
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const answer = item.querySelector('.faq-answer');
                if (answer) {
                    answer.style.maxHeight = null;
                }
            });
            
            // クリックされたFAQを開く/閉じる
            if (!isOpen) {
                faqItem.classList.add('active');
                if (faqAnswer) {
                    faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
                }
            }
        });
    });
    
    console.log('FAQ開閉機能が復旧しました');
}

// スクロールアニメーション
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // アニメーション対象要素を監視
    document.querySelectorAll('.about-item, .feature, .event-card, .faq-item').forEach(el => {
        el.classList.add('fade-in-up');
        observer.observe(el);
    });
    
    console.log('スクロールアニメーションが復旧しました');
}

// ハンバーガーメニュー
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // メニューリンクをクリックした時にメニューを閉じる
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        console.log('モバイルメニューが復旧しました');
    }
}

// スムーススクロール
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    console.log('スムーススクロールが復旧しました');
}

// スクロールインジケーター
function scrollToAbout() {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        aboutSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// お問い合わせフォーム検証
function setupContactFormValidation() {
    const form = document.querySelector('.contact-form');
    if (!form) return null;
    
    const validator = {
        setSubmitHandler: function(handler) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    company: formData.get('company'),
                    message: formData.get('message')
                };
                
                // バリデーション
                if (!data.name || !data.email || !data.message) {
                    alert('必須項目を入力してください。');
                    return;
                }
                
                if (!data.email.includes('@')) {
                    alert('正しいメールアドレスを入力してください。');
                    return;
                }
                
                try {
                    await handler(data);
                    form.reset();
                } catch (error) {
                    console.error('フォーム送信エラー:', error);
                    alert('送信に失敗しました。しばらく時間をおいてから再度お試しください。');
                }
            });
        },
        
        setErrorHandler: function(handler) {
            this.errorHandler = handler;
        }
    };
    
    console.log('お問い合わせフォーム検証が復旧しました');
    return validator;
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('削除された機能を復旧中...');
    
    // 各機能を初期化
    setupFAQToggle();
    setupScrollAnimations();
    setupMobileMenu();
    setupSmoothScroll();
    
    // グローバル関数を設定
    window.scrollToAbout = scrollToAbout;
    window.setupContactFormValidation = setupContactFormValidation;
    
    console.log('✅ グローバル関数が設定されました:', {
        scrollToAbout: typeof window.scrollToAbout,
        setupContactFormValidation: typeof window.setupContactFormValidation
    });
    
    console.log('✅ 全ての削除された機能が復旧しました');
});

// FAQのCSS追加
const faqStyles = document.createElement('style');
faqStyles.textContent = `
    .faq-item {
        border-bottom: 1px solid #eee;
        transition: all 0.3s ease;
    }
    
    .faq-question {
        padding: 20px;
        cursor: pointer;
        position: relative;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .faq-question:hover {
        background-color: #f8f9fa;
    }
    
    .faq-question::after {
        content: '+';
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 24px;
        font-weight: bold;
        transition: transform 0.3s ease;
    }
    
    .faq-item.active .faq-question::after {
        transform: translateY(-50%) rotate(45deg);
    }
    
    .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        padding: 0 20px;
    }
    
    .faq-item.active .faq-answer {
        padding: 0 20px 20px 20px;
    }
    
    .faq-answer p {
        margin: 0;
        padding-top: 10px;
        color: #666;
        line-height: 1.6;
    }
    
    /* モバイルメニュー */
    .hamburger {
        display: none;
        flex-direction: column;
        cursor: pointer;
        padding: 5px;
    }
    
    .hamburger span {
        width: 25px;
        height: 3px;
        background-color: #333;
        margin: 3px 0;
        transition: 0.3s;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
    
    /* アニメーション */
    .fade-in-up {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .fade-in-up.animate {
        opacity: 1;
        transform: translateY(0);
    }
    
    @media (max-width: 768px) {
        .hamburger {
            display: flex;
        }
        
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: white;
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            z-index: 1000;
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .nav-menu li {
            margin: 10px 0;
        }
    }
`;

document.head.appendChild(faqStyles);