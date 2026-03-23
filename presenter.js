document.addEventListener("DOMContentLoaded", () => {

    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room') || 'test_room';

    const statusBadge = document.querySelector('.pr-floating-status');
    if (statusBadge && typeof db !== 'undefined') {
        db.ref('rooms/' + roomId + '/tv_status').on('value', (snapshot) => {
            if (snapshot.val() === 'online') {
                statusBadge.innerHTML = 'متصل بالغرفة ' + roomId + ' 🟢';
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

    // 🎨 السحر: تحديث الألوان والأسماء من السيرفر مباشرة عشان تتوافق مع إعدادات التلفزيون
    function updatePresenterSettings(settings) {
        if (presenterCompName) presenterCompName.innerText = settings.compName || "الديوان";
        if (btnTeam1) {
            btnTeam1.innerHTML = `صح لـ <span style="font-size:1.4rem;">(${settings.team1Name || "الفريق الأول"})</span> ✔️`;
            btnTeam1.style.backgroundColor = settings.team1Color || "#FF9100";
        }
        if (btnTeam2) {
            btnTeam2.innerHTML = `صح لـ <span style="font-size:1.4rem;">(${settings.team2Name || "الفريق الثاني"})</span> ✔️`;
            btnTeam2.style.backgroundColor = settings.team2Color || "#10b981";
        }
    }

    if (typeof db !== 'undefined') {
        db.ref('rooms/' + roomId + '/settings').on('value', (snapshot) => {
            if (snapshot.val()) {
                updatePresenterSettings(snapshot.val());
            } else {
                // إذا ماله إعدادات في السيرفر يجيب من الذاكرة الاحتياطية
                const saved = JSON.parse(localStorage.getItem('diwanGameSettings')) || {};
                updatePresenterSettings(saved);
            }
        });
    }

    if (typeof db !== 'undefined') {
        db.ref('rooms/' + roomId + '/board').on('value', (snapshot) => {
            const boardData = snapshot.val() || {};
            let isGameStarted = false;

            allHexes.forEach(hex => {
                const letter = hex.innerText.trim();
                hex.classList.remove('team1-captured', 'team2-captured');

                if (boardData[letter] === 'team1') {
                    hex.classList.add('team1-captured');
                    isGameStarted = true;
                } else if (boardData[letter] === 'team2') {
                    hex.classList.add('team2-captured');
                    isGameStarted = true;
                }
            });

            if (isGameStarted) {
                randomBtn.style.display = 'none';
            } else {
                randomBtn.style.display = 'flex';
            }
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

            if (typeof db !== 'undefined') {
                db.ref('rooms/' + roomId + '/buzzer').set({ status: 'waiting', team: null });
                db.ref('rooms/' + roomId + '/current_letter').set(letter);
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

    btnTeam1.addEventListener('click', () => {
        const letter = activeLetterBadge.innerText.trim();
        if (!letter || letter === '-') return;

        if (typeof db !== 'undefined') {
            db.ref('rooms/' + roomId + '/board/' + letter).set('team1');
            db.ref('rooms/' + roomId + '/buzzer').set({ status: 'waiting', team: null });
            db.ref('rooms/' + roomId + '/current_letter').set(null);
        }
    });

    btnTeam2.addEventListener('click', () => {
        const letter = activeLetterBadge.innerText.trim();
        if (!letter || letter === '-') return;

        if (typeof db !== 'undefined') {
            db.ref('rooms/' + roomId + '/board/' + letter).set('team2');
            db.ref('rooms/' + roomId + '/buzzer').set({ status: 'waiting', team: null });
            db.ref('rooms/' + roomId + '/current_letter').set(null);
        }
    });

    document.querySelector('.pr-btn-wrong').addEventListener('click', () => {
        const letter = activeLetterBadge.innerText.trim();
        if (!letter || letter === '-') return;

        if (typeof db !== 'undefined') {
            db.ref('rooms/' + roomId + '/board/' + letter).set('neutral');
            db.ref('rooms/' + roomId + '/buzzer').set({ status: 'waiting', team: null });
            db.ref('rooms/' + roomId + '/current_letter').set(null);
        }
    });

    // 🙋‍♂️ إرسال إشارة الدخول للمقدم للتلفزيون
    if (typeof db !== 'undefined') {
        const presenceRef = db.ref('rooms/' + roomId + '/presence/presenter');
        presenceRef.set('online');
        presenceRef.onDisconnect().set('offline');
    }

});