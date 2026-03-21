document.addEventListener("DOMContentLoaded", () => {

    const selectionOverlay = document.getElementById('pl-team-selection');
    const buzzerScreen = document.getElementById('pl-buzzer-screen');

    const btnChooseT1 = document.getElementById('btn-choose-t1');
    const btnChooseT2 = document.getElementById('btn-choose-t2');
    const txtChooseT1 = document.getElementById('txt-choose-t1');
    const txtChooseT2 = document.getElementById('txt-choose-t2');

    const teamNameDisplay = document.getElementById('pl-team-name');
    const compNameDisplay = document.getElementById('pl-comp-name');

    const buzzerContainer = document.getElementById('pl-buzzer-btn');
    const buzzerInnerBtn = document.getElementById('pl-buzzer-inner-btn');
    const statusDisplay = document.getElementById('pl-status');

    let currentSettings = {
        compName: "الديوان", team1Name: "الفريق الأول", team2Name: "الفريق الثاني",
        team1Color: "#FF9100", team2Color: "#10b981"
    };

    const savedSettings = localStorage.getItem('diwanGameSettings');
    if (savedSettings) currentSettings = JSON.parse(savedSettings);

    txtChooseT1.innerText = currentSettings.team1Name;
    txtChooseT2.innerText = currentSettings.team2Name;
    document.documentElement.style.setProperty('--team1-color', currentSettings.team1Color);
    document.documentElement.style.setProperty('--team2-color', currentSettings.team2Color);

    let myTeamNum = null; // لمعرفة اللاعب الحالي

    function setupPlayerScreen(teamNum) {
        myTeamNum = teamNum;
        let selectedColor = teamNum === 1 ? currentSettings.team1Color : currentSettings.team2Color;
        let selectedName = teamNum === 1 ? currentSettings.team1Name : currentSettings.team2Name;

        selectionOverlay.style.display = 'none';
        buzzerScreen.style.display = 'flex';
        compNameDisplay.innerText = currentSettings.compName;
        teamNameDisplay.innerText = selectedName;
        document.documentElement.style.setProperty('--pl-active-color', selectedColor);
    }

    btnChooseT1.addEventListener('click', () => setupPlayerScreen(1));
    btnChooseT2.addEventListener('click', () => setupPlayerScreen(2));

    // 📡 السحر: الاستماع لقاعدة البيانات اللحظية
    db.ref('game/buzzer').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        if (data.status === 'waiting') {
            // فتح الجرس للجميع
            buzzerContainer.classList.remove('pl-buzzer-locked', 'active-pressed');
            statusDisplay.innerText = "في انتظار السؤال... ⏳";
            statusDisplay.className = "pl-status pl-waiting";
        }
        else if (data.status === 'pressed') {
            // إقفال الجرس
            buzzerContainer.classList.add('pl-buzzer-locked');

            // من الأسرع؟
            if (data.team === myTeamNum) {
                statusDisplay.innerText = "أنت الأسرع! 🚀";
                statusDisplay.className = "pl-status pl-go";
            } else {
                statusDisplay.innerText = "الخصم ضغط قبلك! ❌";
                statusDisplay.className = "pl-status pl-locked";
            }
        }
    });

    // أكشن ضغط الجرس وإرسال للسيرفر
    buzzerInnerBtn.addEventListener('click', () => {
        if (!myTeamNum) return; // لازم يكون مختار فريق
        if (navigator.vibrate) navigator.vibrate(150);

        // التأكد من السيرفر إنه محد ضغط قبلك
        db.ref('game/buzzer').once('value', (snap) => {
            const data = snap.val();
            if (!data || data.status === 'waiting') {
                // إرسال الإشارة القاضية!
                db.ref('game/buzzer').set({
                    status: 'pressed',
                    team: myTeamNum,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
            }
        });
    });

});