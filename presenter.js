document.addEventListener("DOMContentLoaded", () => {

    const allHexes = document.querySelectorAll('.pr-mini-board .board-hex');
    const activeLetterBadge = document.getElementById('pr-active-letter');
    const questionText = document.getElementById('pr-question-text');
    const answerText = document.getElementById('pr-answer-text');
    const randomBtn = document.querySelector('.pr-random-btn');

    const dummyQuestions = {
        'س': { q: 'ما هي عاصمة المملكة العربية السعودية؟', a: 'الرياض' },
        'م': { q: 'من هو مؤسس المملكة العربية السعودية؟', a: 'الملك عبدالعزيز' },
        'ك': { q: 'حيوان يلقب بسفينة الصحراء؟', a: 'الجمل (البعير)' }
    };

    const btnTeam1 = document.querySelector('.pr-btn-team1');
    const btnTeam2 = document.querySelector('.pr-btn-team2');
    const presenterCompName = document.getElementById('pr-comp-name');

    function updatePresenterSettings() {
        const savedSettings = localStorage.getItem('diwanGameSettings');
        let settings = {
            compName: "الديوان", team1Name: "الفريق الأول", team2Name: "الفريق الثاني",
            team1Color: "#FF9100", team2Color: "#10b981"
        };
        if (savedSettings) settings = JSON.parse(savedSettings);

        if (presenterCompName) presenterCompName.innerText = settings.compName;
        if (btnTeam1) {
            btnTeam1.innerHTML = `صح لـ <span style="font-size:1.4rem;">(${settings.team1Name})</span> ✔️`;
            btnTeam1.style.backgroundColor = settings.team1Color;
        }
        if (btnTeam2) {
            btnTeam2.innerHTML = `صح لـ <span style="font-size:1.4rem;">(${settings.team2Name})</span> ✔️`;
            btnTeam2.style.backgroundColor = settings.team2Color;
        }
    }

    updatePresenterSettings();

    allHexes.forEach(hex => {
        hex.addEventListener('click', function () {
            const letter = this.innerText.trim();
            activeLetterBadge.innerText = letter;

            if (dummyQuestions[letter]) {
                questionText.innerText = dummyQuestions[letter].q;
                answerText.innerText = dummyQuestions[letter].a;
            } else {
                questionText.innerText = `سؤال يبدأ بحرف (${letter}) ... (هنا يظهر السؤال)`;
                answerText.innerText = "(تظهر الإجابة هنا)";
            }

            allHexes.forEach(h => {
                h.style.transform = 'scale(1)'; h.style.filter = 'brightness(1)'; h.style.zIndex = '1';
            });

            this.style.transform = 'scale(1.2)'; this.style.filter = 'brightness(1.3)'; this.style.zIndex = '10';

            // 📡 السحر: فتح الجرس للفرق لما المقدم يختار حرف!
            if (typeof db !== 'undefined') {
                db.ref('game/buzzer').set({
                    status: 'waiting',
                    team: null
                });
            }
        });
    });

    randomBtn.addEventListener('click', () => {
        const btnContent = randomBtn.querySelector('.btn-content');
        btnContent.style.transform = 'translateY(0)';
        setTimeout(() => btnContent.style.transform = 'translateY(-8px)', 150);

        const randomIndex = Math.floor(Math.random() * allHexes.length);
        const randomHex = allHexes[randomIndex];
        randomHex.click();
    });

    // 📡 السحر: إرسال أمر تلوين اللوحة للسيرفر عند الإجابة
    btnTeam1.addEventListener('click', () => {
        const letter = activeLetterBadge.innerText.trim();
        if (!letter || letter === '-') return;

        // تلوين الخلية للفريق الأول في السيرفر
        if (typeof db !== 'undefined') {
            db.ref('game/board/' + letter).set('team1');
            db.ref('game/buzzer').set({ status: 'waiting', team: null });
        }
    });

    btnTeam2.addEventListener('click', () => {
        const letter = activeLetterBadge.innerText.trim();
        if (!letter || letter === '-') return;

        // تلوين الخلية للفريق الثاني في السيرفر
        if (typeof db !== 'undefined') {
            db.ref('game/board/' + letter).set('team2');
            db.ref('game/buzzer').set({ status: 'waiting', team: null });
        }
    });

    document.querySelector('.pr-btn-wrong').addEventListener('click', () => {
        const letter = activeLetterBadge.innerText.trim();
        if (!letter || letter === '-') return;

        // مسح لون الخلية (إذا كانت إجابة خاطئة أو تبي تصفر الحرف)
        if (typeof db !== 'undefined') {
            db.ref('game/board/' + letter).set('neutral');
            db.ref('game/buzzer').set({ status: 'waiting', team: null });
        }
    });

});