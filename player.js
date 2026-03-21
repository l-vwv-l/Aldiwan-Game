document.addEventListener("DOMContentLoaded", () => {

    // تعريف العناصر في شاشة المتسابق حسب تصميمنا الفخم
    const selectionOverlay = document.querySelector('.pl-selection-overlay');
    const btnTeam1 = document.querySelector('.pl-btn-t1');
    const btnTeam2 = document.querySelector('.pl-btn-t2');
    const teamNameDisplay = document.querySelector('.pl-team-name');
    const statusDisplay = document.querySelector('.pl-status');
    const buzzerBtn = document.querySelector('.background-button .button');
    const buzzerWrapper = document.querySelector('.background-button');

    let myTeam = null; // المتغير اللي بيحفظ هذا الجوال تبع أي فريق

    // 1. نظام اختيار الفريق عند فتح الرابط
    if (btnTeam1 && btnTeam2) {
        btnTeam1.addEventListener('click', () => {
            myTeam = 1;
            setupPlayer("الفريق الأول", "#FF9100"); // لون واسم افتراضي
        });

        btnTeam2.addEventListener('click', () => {
            myTeam = 2;
            setupPlayer("الفريق الثاني", "#10b981");
        });
    }

    function setupPlayer(teamName, teamColor) {
        // إخفاء شاشة الاختيار وإظهار الجرس
        if (selectionOverlay) selectionOverlay.style.display = 'none';

        if (teamNameDisplay) {
            teamNameDisplay.innerText = teamName;
            teamNameDisplay.style.borderColor = teamColor;
        }
        document.documentElement.style.setProperty('--pl-active-color', teamColor);
    }

    // 2. 📡 السحر: الاستماع للسيرفر (هل الجرس مفتوح أو مقفول؟)
    if (typeof db !== 'undefined') {
        db.ref('game/buzzer').on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            // إذا المقدم اختار حرف وفتح الجرس
            if (data.status === 'waiting') {
                statusDisplay.innerText = 'جاهز! 🟢 (اضغط بسرعة)';
                statusDisplay.className = 'pl-status pl-go';
                buzzerWrapper.classList.remove('pl-buzzer-locked', 'active-pressed');
            }
            // إذا فيه أحد ضغط الجرس
            else if (data.status === 'pressed') {
                if (data.team === myTeam) {
                    // إذا فريقي هو اللي ضغط
                    statusDisplay.innerText = 'أنت الأسرع! 🚀';
                    statusDisplay.className = 'pl-status pl-go';
                    buzzerWrapper.classList.add('active-pressed');
                } else {
                    // إذا الخصم سبقني وضغط
                    statusDisplay.innerText = 'مقفول 🔴 (الخصم أسرع)';
                    statusDisplay.className = 'pl-status pl-locked';
                    buzzerWrapper.classList.add('pl-buzzer-locked');
                }
            }
        });

        // 3. 🚀 إرسال الضغطة للسيرفر بلمح البصر
        if (buzzerBtn) {
            buzzerBtn.addEventListener('click', () => {
                // إذا الجرس مقفول، لا تسوي شيء
                if (buzzerWrapper.classList.contains('pl-buzzer-locked')) return;

                // التأكد إن الجرس لسه "جاهز" في السيرفر (عشان نمنع التعادل)
                db.ref('game/buzzer/status').once('value').then((snapshot) => {
                    if (snapshot.val() === 'waiting') {
                        db.ref('game/buzzer').set({
                            status: 'pressed',
                            team: myTeam
                        });
                    }
                });
            });
        }
    }
});