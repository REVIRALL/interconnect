// index.html用のインタラクション

document.addEventListener('DOMContentLoaded', function() {
    // スクロールインジケーターのクリック処理
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // スクロール時にインジケーターを非表示
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
            }
        });
    }
    // FAQアコーディオン機能
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // 他のアイテムを閉じる
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // 現在のアイテムをトグル
            item.classList.toggle('active');
        });
    });
    
    // 料金プランのボタンクリック
    const planButtons = document.querySelectorAll('.plan-button');
    
    planButtons.forEach(button => {
        button.addEventListener('click', () => {
            // お問い合わせセクションにスクロール
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // 数字のカウントアップアニメーション
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const countUpAnimation = (element, target) => {
        const duration = 2000; // 2秒
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateNumber = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString() + (element.textContent && element.textContent.includes('+') ? '+' : '');
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = target.toLocaleString() + (element.textContent && element.textContent.includes('+') ? '+' : '');
            }
        };
        
        updateNumber();
    };
    
    const achievementObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numberElement = entry.target;
                const targetText = numberElement.textContent;
                let target = 0;
                
                if (targetText && targetText.includes('¥')) {
                    // 通貨の場合
                    target = 2.5; // ¥2.5B
                    numberElement.textContent = '¥0B';
                    setTimeout(() => {
                        numberElement.textContent = '¥2.5B';
                    }, 100);
                } else if (targetText && targetText.includes('%')) {
                    // パーセンテージの場合
                    target = parseInt(targetText);
                    numberElement.textContent = '0%';
                    countUpAnimation({
                        textContent: '0%',
                        set textContent(val) {
                            numberElement.textContent = val + '%';
                        }
                    }, target);
                } else if (targetText) {
                    // 通常の数字
                    target = parseInt(targetText.replace(/[^0-9]/g, ''));
                    countUpAnimation(numberElement, target);
                }
                
                achievementObserver.unobserve(numberElement);
            }
        });
    }, observerOptions);
    
    // 実績数値を監視
    document.querySelectorAll('.achievement-number').forEach(number => {
        achievementObserver.observe(number);
    });
    
    // サービスフローのステップハイライト
    const flowSteps = document.querySelectorAll('.flow-step');
    const flowObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 200);
            }
        });
    }, { threshold: 0.5 });
    
    flowSteps.forEach(step => {
        flowObserver.observe(step);
    });
    
    // パートナーロゴのホバーエフェクト
    const partnerLogos = document.querySelectorAll('.partner-logo');
    
    partnerLogos.forEach(logo => {
        logo.addEventListener('mouseenter', () => {
            partnerLogos.forEach(otherLogo => {
                if (otherLogo !== logo) {
                    otherLogo.style.opacity = '0.3';
                }
            });
        });
        
        logo.addEventListener('mouseleave', () => {
            partnerLogos.forEach(otherLogo => {
                otherLogo.style.opacity = '';
            });
        });
    });
});