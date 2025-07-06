// メンバーの声カルーセル実装
document.addEventListener('DOMContentLoaded', function() {
    // 10種類のメンバーの声データ
    const testimonials = [
        {
            content: "INTERCONNECTに参加してから、経営の視野が大きく広がりました。異業種の経営者との交流を通じて、自社では思いつかなかった新しいビジネスアイデアが生まれ、売上が前年比150%成長しました。",
            name: "田中 健一",
            title: "代表取締役CEO",
            company: "株式会社タナカテック"
        },
        {
            content: "毎月の定例会で得られる知見は、まさに経営者にとっての宝物です。特にメンター制度では、上場企業の経営者から直接アドバイスを受けることができ、事業戦略の見直しに大きく役立ちました。",
            name: "山田 美咲",
            title: "代表取締役",
            company: "ヤマダコンサルティング合同会社"
        },
        {
            content: "地方で事業を展開していますが、オンラインサロンのおかげで全国の経営者とつながることができました。ビジネスマッチングを通じて、3社との業務提携が実現し、新たな市場を開拓できました。",
            name: "佐藤 太郎",
            title: "代表取締役社長",
            company: "佐藤物産株式会社"
        },
        {
            content: "スタートアップ経営者として、資金調達や人材採用で悩んでいましたが、INTERCONNECTのメンバーからの紹介で優秀な人材を確保でき、シリーズAの資金調達も成功しました。",
            name: "鈴木 花子",
            title: "CEO",
            company: "スズキイノベーション株式会社"
        },
        {
            content: "経営の孤独を感じていた時期に参加しました。同じ悩みを持つ経営者仲間ができ、互いに切磋琢磨しながら成長できる環境に感謝しています。精神的な支えにもなっています。",
            name: "高橋 誠",
            title: "代表取締役",
            company: "高橋製造株式会社"
        },
        {
            content: "海外展開を検討していた際、既に海外進出している先輩経営者から具体的なアドバイスをいただきました。そのおかげで、スムーズにアジア市場への参入を果たすことができました。",
            name: "伊藤 由美",
            title: "代表取締役社長",
            company: "イトウグローバル株式会社"
        },
        {
            content: "DX推進で課題を抱えていましたが、IT業界の経営者メンバーとの協業により、効率的なシステム導入が実現。業務効率が40%向上し、新たな価値創造にリソースを振り向けられるようになりました。",
            name: "渡辺 健二",
            title: "代表取締役",
            company: "ワタナベロジスティクス株式会社"
        },
        {
            content: "後継者育成に悩んでいましたが、経営合宿での学びを通じて、次世代リーダーの育成プログラムを構築できました。今では幹部社員も一緒に参加させ、組織全体の成長につながっています。",
            name: "中村 光一",
            title: "会長兼CEO",
            company: "中村グループホールディングス"
        },
        {
            content: "新規事業の立ち上げで失敗続きでしたが、ビジネスピッチ会でのフィードバックを元に事業モデルを改善。今では主力事業の一つに成長し、グループ全体の収益に大きく貢献しています。",
            name: "小林 真理子",
            title: "代表取締役",
            company: "コバヤシイノベーションラボ"
        },
        {
            content: "コロナ禍で事業転換を迫られた際、メンバーの皆様から多くの励ましとアドバイスをいただきました。新しいビジネスモデルへの転換に成功し、むしろ以前より強い企業体質になりました。",
            name: "加藤 勇気",
            title: "代表取締役社長",
            company: "カトウサービス株式会社"
        }
    ];

    // TestimonialsセクションのHTMLを更新
    function updateTestimonialsSection() {
        const testimonialsSection = document.querySelector('.testimonials');
        if (!testimonialsSection) return;

        const sliderContainer = testimonialsSection.querySelector('.testimonial-slider');
        if (!sliderContainer) return;

        // カルーセルトラックを作成
        const track = document.createElement('div');
        track.className = 'testimonial-track';

        // メンバーの声を2セット作成（無限スクロール用）
        for (let i = 0; i < 2; i++) {
            testimonials.forEach(testimonial => {
                const item = createTestimonialItem(testimonial);
                track.appendChild(item);
            });
        }

        // 既存のコンテンツをクリア
        sliderContainer.innerHTML = '';
        sliderContainer.appendChild(track);

        // タッチ操作の実装
        let startX = 0;
        let scrollLeft = 0;
        let isDown = false;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
            track.style.animationPlayState = 'paused';
        });

        track.addEventListener('mouseleave', () => {
            isDown = false;
            track.style.animationPlayState = 'running';
        });

        track.addEventListener('mouseup', () => {
            isDown = false;
            track.style.animationPlayState = 'running';
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 2;
            track.scrollLeft = scrollLeft - walk;
        });

        // タッチイベント
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
            track.style.animationPlayState = 'paused';
        });

        track.addEventListener('touchend', () => {
            track.style.animationPlayState = 'running';
        });

        track.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX - track.offsetLeft;
            const walk = (x - startX) * 2;
            track.scrollLeft = scrollLeft - walk;
        });
    }

    // 個別のメンバーの声アイテムを作成
    function createTestimonialItem(testimonial) {
        const item = document.createElement('div');
        item.className = 'testimonial-item';

        item.innerHTML = `
            <div class="testimonial-content">
                "${testimonial.content}"
            </div>
            <div class="testimonial-author">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23e0e0e0'/%3E%3Cpath d='M30 35c5.5 0 10-4.5 10-10s-4.5-10-10-10-10 4.5-10 10 4.5 10 10 10zm0 5c-11 0-20 9-20 20h40c0-11-9-20-20-20z' fill='%23999'/%3E%3C/svg%3E" alt="${testimonial.name}" class="author-avatar">
                <div class="author-info">
                    <div class="author-name">${testimonial.name}</div>
                    <div class="author-title">${testimonial.title}</div>
                    <div class="author-company">${testimonial.company}</div>
                </div>
            </div>
        `;

        return item;
    }

    // FAQ機能の実装
    function initializeFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                // 他のFAQを閉じる
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // 現在のFAQをトグル
                item.classList.toggle('active');
            });
        });
    }

    // 初期化
    updateTestimonialsSection();
    initializeFAQ();
});