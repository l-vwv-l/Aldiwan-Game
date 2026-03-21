document.addEventListener("DOMContentLoaded", () => {

    // 📡 فحص اتصال التلفزيون الحقيقي
    const statusBadge = document.querySelector('.pr-floating-status');
    if (statusBadge && typeof db !== 'undefined') {
        db.ref('game/tv_status').on('value', (snapshot) => {
            if (snapshot.val() === 'online') {
                statusBadge.innerHTML = 'متصل بالشاشة 🟢';
                statusBadge.style.color = '#00E676';
            } else {
                statusBadge.innerHTML = 'الشاشة مغلقة 🔴';
                statusBadge.style.color = '#ff5252';
            }
        });
    }

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

    // 🎨 تلوين لوحة المقدم بالتزامن مع التلفزيون
    if (typeof db !== 'undefined') {
        db.ref('game/board').on('value', (snapshot) => {
            const boardData = snapshot.val() || {};
            allHexes.forEach(hex => {
                const letter = hex.innerText.trim();
                hex.classList.remove('team1-captured', 'team2-captured');
                if (boardData[letter] === 'team1') {
                    hex.classList.add('team1-captured');
                } else if (boardData[letter] === 'team2') {
                    hex.classList.add('team2-captured');
                }
            });
        });
    }

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

            // 📡 السحر: فتح الجرس للفرق وإرسال الحرف للتلفزيون عشان يلمع
            if (typeof db !== 'undefined') {
                db.ref('game/buzzer').set({ status: 'waiting', team: null });
                db.ref('game/current_letter').set(letter);
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

    // 📡 إرسال أمر تلوين اللوحة وإخفاء لمعان الحرف
    btnTeam1.addEventListener('click', () => {
        const letter = activeLetterBadge.innerText.trim();
        if (!letter || letter === '-') return;

        if (typeof db !== 'undefined') {
            db.ref('game/board/' + letter).set('team1');
            db.ref('game/buzzer').set({ status: 'waiting', team: null });
            db.ref('game/current_letter').set(null); // مسح اللمعان من التلفزيون
        }
    });

    btnTeam2.addEventListener('click', () => {
        const letter = activeLetterBadge.innerText.trim();
        if (!letter || letter === '-') return;

        if (typeof db !== 'undefined') {
            db.ref('game/board/' + letter).set('team2');
            db.ref('game/buzzer').set({ status: 'waiting', team: null });
            db.ref('game/current_letter').set(null);
        }
    });

    document.querySelector('.pr-btn-wrong').addEventListener('click', () => {
        const letter = activeLetterBadge.innerText.trim();
        if (!letter || letter === '-') return;

        if (typeof db !== 'undefined') {
            db.ref('game/board/' + letter).set('neutral');
            db.ref('game/buzzer').set({ status: 'waiting', team: null });
            db.ref('game/current_letter').set(null);
        }
    });

});