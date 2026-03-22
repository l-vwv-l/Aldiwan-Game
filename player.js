document.addEventListener("DOMContentLoaded", () => {

    // 🌟 استخراج رقم الغرفة السري من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room') || 'test_room';

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

    // 1. نظام اختيار الفريق
    if (btnChooseT1 && btnChooseT2) {
        btnChooseT1.addEventListener('click', () => {
            myTeam = 1;
            setupPlayer("الفريق الأول", "#FF9100");
        });

        btnChooseT2.addEventListener('click', () => {
            myTeam = 2;
            setupPlayer("الفريق الثاني", "#10b981");
        });
    }

    function setupPlayer(teamName, teamColor) {
        if (selectionOverlay) selectionOverlay.style.display = 'none';
        if (buzzerScreen) buzzerScreen.style.display = 'flex';

        if (teamNameDisplay) teamNameDisplay.innerText = teamName;
        document.documentElement.style.setProperty('--pl-active-color', teamColor);
    }

    // 2. 📡 السحر: الاستماع للسيرفر حسب الغرفة
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

        // 3. 🚀 إرسال الضغطة لغرفتي في السيرفر
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

        // 💯 نظام مزامنة النقاط
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
});