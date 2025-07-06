// デジタルエフェクトのJavaScript実装

document.addEventListener('DOMContentLoaded', function() {
    // 1. タイプライターエフェクト with グリッチ
    function initTypewriterEffect() {
        const heroTitle = document.querySelector('.hero h2');
        const heroSubtitle = document.querySelector('.hero p');
        
        if (!heroTitle || !heroSubtitle) return;
        
        // オリジナルのテキストを保存
        const titleText = heroTitle.innerHTML;
        const subtitleText = heroSubtitle.innerHTML;
        
        // テキストを一時的に隠す
        heroTitle.style.opacity = '0';
        heroSubtitle.style.opacity = '0';
        
        // タイプライターエフェクトを適用
        setTimeout(() => {
            typeWriter(heroTitle, titleText, 0, () => {
                // タイトル完了後にサブタイトルを表示
                typeWriter(heroSubtitle, subtitleText, 0);
            });
        }, 500);
    }
    
    // タイプライター関数
    function typeWriter(element, text, index, callback) {
        element.style.opacity = '1';
        element.classList.add('typewriter-effect');
        
        // HTMLタグを考慮した文字表示
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        if (index < plainText.length) {
            // グリッチエフェクトをランダムに適用
            if (Math.random() < 0.1) {
                element.classList.add('glitch');
                setTimeout(() => {
                    element.classList.remove('glitch');
                }, 100);
            }
            
            // 文字を1つずつ表示（HTMLタグを保持）
            const displayText = text.substring(0, index + 1);
            element.innerHTML = displayText + '<span class="cursor">|</span>';
            
            // 次の文字 (2.5倍速に変更)
            setTimeout(() => {
                typeWriter(element, text, index + 1, callback);
            }, 20 + Math.random() * 20); // ランダムな遅延（元の速度の2.5倍）
        } else {
            // カーソルを削除
            element.innerHTML = text;
            element.classList.add('typewriter-complete');
            
            // コールバック実行
            if (callback) callback();
        }
    }
    
    // 2. セクションの出現エフェクト
    function initSectionEffects() {
        const sections = document.querySelectorAll(
            '.about, .features, .members, .events, ' +
            '.achievements, .service-flow, .join, ' +
            '.testimonials, .pricing, .partners, .faq, .cta-section, .contact'
        );
        
        // Intersection Observer の設定
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // デジタル風の遅延アニメーション
                    setTimeout(() => {
                        entry.target.classList.add('section-visible');
                        
                        // グリッチエフェクトを短時間適用
                        entry.target.classList.add('digital-transition');
                        setTimeout(() => {
                            entry.target.classList.remove('digital-transition');
                        }, 300);
                    }, index * 50);
                    
                    // 一度表示したら監視を停止
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // 各セクションを監視
        sections.forEach(section => {
            section.classList.add('section-hidden');
            sectionObserver.observe(section);
        });
    }
    
    // 3. スクロールベースのパララックスエフェクト
    function initParallaxEffects() {
        const heroVideo = document.querySelector('.hero-video-container');
        
        if (!heroVideo) return;
        
        let ticking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const speed = 0.5;
            
            heroVideo.style.transform = `translateY(${scrolled * speed}px)`;
            
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick);
    }
    
    // 4. デジタルノイズエフェクト（ホバー時）
    function initDigitalNoise() {
        const buttons = document.querySelectorAll(
            '.login-btn, .register-btn, .contact-btn, ' +
            '.cta-button, .submit-button, .plan-button'
        );
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.classList.add('digital-hover');
            });
            
            button.addEventListener('mouseleave', function() {
                this.classList.remove('digital-hover');
            });
        });
    }
    
    // 5. 数字カウントアップエフェクト
    function initCountUpEffect() {
        const stats = document.querySelectorAll('.stat-number, .achievement-number');
        
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    countObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        stats.forEach(stat => {
            stat.setAttribute('data-original', stat.textContent);
            countObserver.observe(stat);
        });
    }
    
    function countUp(element) {
        const originalText = element.getAttribute('data-original');
        const hasPlus = originalText.includes('+');
        const hasCurrency = originalText.includes('¥');
        const hasDecimal = originalText.includes('.');
        const hasPercent = originalText.includes('%');
        
        // 数値を抽出
        let targetNumber = parseFloat(originalText.replace(/[^0-9.]/g, ''));
        
        // ビリオン表記の処理
        if (originalText.includes('B')) {
            targetNumber = targetNumber;
        }
        
        let currentNumber = 0;
        const increment = targetNumber / 50;
        const timer = setInterval(() => {
            currentNumber += increment;
            
            if (currentNumber >= targetNumber) {
                currentNumber = targetNumber;
                clearInterval(timer);
            }
            
            // フォーマット
            let displayNumber = currentNumber;
            if (hasDecimal) {
                displayNumber = currentNumber.toFixed(1);
            } else {
                displayNumber = Math.floor(currentNumber);
            }
            
            // 元のフォーマットを再構築
            let displayText = displayNumber.toString();
            
            if (hasCurrency) displayText = '¥' + displayText;
            if (originalText.includes('B')) displayText += 'B';
            if (hasPlus) displayText += '+';
            if (hasPercent) displayText += '%';
            
            // 千の位にカンマを追加（通貨以外）
            if (!hasCurrency && !originalText.includes('B') && displayNumber >= 1000) {
                displayText = displayText.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            
            element.textContent = displayText;
            
            // グリッチエフェクト
            if (Math.random() < 0.3) {
                element.classList.add('glitch-text');
                setTimeout(() => {
                    element.classList.remove('glitch-text');
                }, 50);
            }
        }, 30);
    }
    
    // 初期化
    function init() {
        // プリローダーが消えた後に実行
        const preloader = document.getElementById('preloader');
        if (preloader) {
            // プリローダーの監視
            const checkPreloader = setInterval(() => {
                if (preloader.style.display === 'none' || preloader.classList.contains('fade-out')) {
                    clearInterval(checkPreloader);
                    setTimeout(() => {
                        initTypewriterEffect();
                        initSectionEffects();
                        initParallaxEffects();
                        initDigitalNoise();
                        initCountUpEffect();
                    }, 300);
                }
            }, 100);
        } else {
            // プリローダーがない場合は即実行
            initTypewriterEffect();
            initSectionEffects();
            initParallaxEffects();
            initDigitalNoise();
            initCountUpEffect();
        }
    }
    
    // 初期化実行
    init();
});