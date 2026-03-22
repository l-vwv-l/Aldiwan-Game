document.addEventListener("DOMContentLoaded", () => {

    // 🌟 استخراج رقم الغرفة ورقم الفريق من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room') || 'test_room';
    const urlTeam = urlParams.get('team'); // بيطلع 1 أو 2

    // ربط العناصر
    const selectionOverlay = document.getElementById('pl-team-selection');
    const buzzerScreen = document.getElementById('pl-buzzer-screen');
    const btnChooseT1 = document.getElementById('btn-choose-t1');
    const btnChooseT2 = document.getElementById('btn-choose-t2');
    const teamNameDisplay = document.getElementById('pl-team-name');
    const buzzerWrapper = document.getElementById('pl-buzzer-btn');
    const buzzerBtn = document.getElementById('pl-buzzer-inner-btn');
    const statusDisplay = document.getElementById('pl-status');
    const scoreDisplay = document.getElementById('pl-team-score');

    let myTeam = null;

    // جلب ألوان وأسماء الفرق (عشان نعطيها للمتسابق تلقائياً)
    const savedSettings = JSON.parse(localStorage.getItem('diwanGameSettings')) || {};
    const t1Name = savedSettings.team1Name || "الفريق الأول";
    const t2Name = savedSettings.team2Name || "الفريق الثاني";
    const t1Color = savedSettings.team1Color || "#FF9100";
    const t2Color = savedSettings.team2Color || "#10b981";

    // 🚀 السحر: تخطي شاشة الاختيار إذا مسح باركود فريقه!
    if (urlTeam === '1') {
        myTeam = 1;
        setupPlayer(t1Name, t1Color);
    } else if (urlTeam === '2') {
        myTeam = 2;
        setupPlayer(t2Name, t2Color);
    } else {
        // في حال دخل الرابط العادي يدوي بدون باركود (احتياط)
        if (btnChooseT1 && btnChooseT2) {
            btnChooseT1.addEventListener('click', () => { myTeam = 1; setupPlayer(t1Name, t1Color); });
            btnChooseT2.addEventListener('click', () => { myTeam = 2; setupPlayer(t2Name, t2Color); });
        }
    }

    function setupPlayer(teamName, teamColor) {
        if (selectionOverlay) selectionOverlay.style.display = 'none';
        if (buzzerScreen) buzzerScreen.style.display = 'flex';

        if (teamNameDisplay) teamNameDisplay.innerText = teamName;
        document.documentElement.style.setProperty('--pl-active-color', teamColor);
    }

    // 2. 📡 الاستماع للسيرفر
    if (typeof db !== 'undefined') {
        db.ref('rooms/' + roomId + '/buzzer').on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            if (data.status === 'waiting') {
                if (statusDisplay) {
                    statusDisplay.innerText = 'جاهز! 🟢 (اضغط بسرعة)';
                    statusDisplay.className = 'pl-status pl-go';
                }
                if (buzzerWrapper) buzzerWrapper.classList.remove('pl-buzzer-locked', 'active-pressed');
            }
            else if (data.status === 'pressed') {
                if (data.team === myTeam) {
                    if (statusDisplay) {
                        statusDisplay.innerText = 'أنت الأسرع! 🚀';
                        statusDisplay.className = 'pl-status pl-go';
                    }
                    if (buzzerWrapper) buzzerWrapper.classList.add('active-pressed');
                } else {
                    if (statusDisplay) {
                        statusDisplay.innerText = 'مقفول 🔴 (الخصم أسرع)';
                        statusDisplay.className = 'pl-status pl-locked';
                    }
                    if (buzzerWrapper) buzzerWrapper.classList.add('pl-buzzer-locked');
                }
            }
        });

        // 3. إرسال الضغطة للسيرفر
        if (buzzerBtn) {
            buzzerBtn.addEventListener('click', () => {
                if (buzzerWrapper && buzzerWrapper.classList.contains('pl-buzzer-locked')) return;

                db.ref('rooms/' + roomId + '/buzzer/status').once('value').then((snapshot) => {
                    if (snapshot.val() === 'waiting') {
                        db.ref('rooms/' + roomId + '/buzzer').set({
                            status: 'pressed',
                            team: myTeam
                        });
                    }
                });
            });
        }

        // 💯 مزامنة النقاط
        db.ref('rooms/' + roomId + '/board').on('value', (snapshot) => {
            const boardData = snapshot.val() || {};
            let myScore = 0;
            let myTeamString = myTeam === 1 ? 'team1' : 'team2';

            for (let hex in boardData) {
                if (boardData[hex] === myTeamString) {
                    myScore++;
                }
            }

            if (scoreDisplay) {
                scoreDisplay.innerText = myScore;
            }
        });
    }

    // 🙋‍♂️ إرسال إشارة الدخول للتلفزيون
    let myRoleName = myTeam === 1 ? 'team1' : 'team2';
    const presenceRef = db.ref('rooms/' + roomId + '/presence/' + myRoleName);
    presenceRef.set('online');
    presenceRef.onDisconnect().set('offline');
});