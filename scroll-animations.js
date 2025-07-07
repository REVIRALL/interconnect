// スクロールによるフェードインアニメーション
document.addEventListener('DOMContentLoaded', function() {
    // アニメーション対象の要素を定義
    const animationTargets = [
        { selector: '.hero-content h1', delay: 0 },
        { selector: '.hero-content p', delay: 100 },
        { selector: '.hero-cta', delay: 200 },
        { selector: '.section-title', delay: 0 },
        { selector: '.section-subtitle', delay: 50 },
        { selector: '.feature-card', delay: 100, stagger: true },
        { selector: '.step-card', delay: 100, stagger: true },
        { selector: '.member-card', delay: 100, stagger: true },
        { selector: '.event-card', delay: 100, stagger: true },
        { selector: '.testimonial-item', delay: 100, stagger: true },
        { selector: '.faq-item', delay: 50, stagger: true },
        { selector: '.benefit-item', delay: 100, stagger: true },
        { selector: '.join-section-wrapper', delay: 150 },
        { selector: '.join-description', delay: 200 },
        { selector: '.contact-form', delay: 100 },
        { selector: '.contact-info', delay: 150 },
        { selector: '.footer-column', delay: 100, stagger: true }
    ];

    // アニメーション用のCSSクラスを追加
    const style = document.createElement('style');
    style.textContent = `
        /* 初期状態 - 非表示 */
        .fade-in-up {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        /* アニメーション後 - 表示 */
        .fade-in-up.animated {
            opacity: 1;
            transform: translateY(0);
        }

        /* より遅いアニメーション */
        .fade-in-up.slow {
            transition: opacity 1.2s ease-out, transform 1.2s ease-out;
        }

        /* より速いアニメーション */
        .fade-in-up.fast {
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        /* 左からフェードイン */
        .fade-in-left {
            opacity: 0;
            transform: translateX(-30px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in-left.animated {
            opacity: 1;
            transform: translateX(0);
        }

        /* 右からフェードイン */
        .fade-in-right {
            opacity: 0;
            transform: translateX(30px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in-right.animated {
            opacity: 1;
            transform: translateX(0);
        }

        /* スケールアップしながらフェードイン */
        .fade-in-scale {
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in-scale.animated {
            opacity: 1;
            transform: scale(1);
        }
    `;
    document.head.appendChild(style);

    // 各要素にアニメーションクラスを追加
    animationTargets.forEach(target => {
        const elements = document.querySelectorAll(target.selector);
        
        elements.forEach((element, index) => {
            // デフォルトのアニメーションクラスを追加
            element.classList.add('fade-in-up');
            
            // 特定の要素には異なるアニメーションを適用
            if (target.selector.includes('feature-card') && index % 3 === 0) {
                element.classList.remove('fade-in-up');
                element.classList.add('fade-in-left');
            } else if (target.selector.includes('feature-card') && index % 3 === 2) {
                element.classList.remove('fade-in-up');
                element.classList.add('fade-in-right');
            } else if (target.selector.includes('member-card') || target.selector.includes('event-card')) {
                element.classList.remove('fade-in-up');
                element.classList.add('fade-in-scale');
            }
            
            // stagger効果のための遅延を設定
            if (target.stagger) {
                element.style.transitionDelay = `${target.delay + (index * 100)}ms`;
            } else {
                element.style.transitionDelay = `${target.delay}ms`;
            }
        });
    });

    // Intersection Observerを使用してスクロール検知
    const observerOptions = {
        root: null,
        rootMargin: '-50px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // ビューポートに入ったらアニメーションを開始
                entry.target.classList.add('animated');
                
                // 一度アニメーションしたら監視を解除（パフォーマンス向上）
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // アニメーション対象の全要素を監視
    const allAnimatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale');
    allAnimatedElements.forEach(element => {
        observer.observe(element);
    });

    // ヒーローセクションは即座にアニメーション
    const heroElements = document.querySelectorAll('.hero-content h1, .hero-content p, .hero-cta');
    heroElements.forEach(element => {
        setTimeout(() => {
            element.classList.add('animated');
        }, 100);
    });

    // パフォーマンス最適化：画面外の要素は遅延読み込み
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    lazyObserver.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px'
    });

    // 画像の遅延読み込み
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
        lazyObserver.observe(img);
    });
});

// スムーススクロール機能の強化
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const offset = 80; // ヘッダーの高さ分のオフセット
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// リサイズ時の再計算
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // 必要に応じてアニメーションの再調整
    }, 250);
});