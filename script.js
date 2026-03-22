document.addEventListener("DOMContentLoaded", () => {

    let roomId = sessionStorage.getItem('diwanGameRoom');
    if (!roomId) {
        roomId = Math.floor(10000 + Math.random() * 90000).toString();
        sessionStorage.setItem('diwanGameRoom', roomId);
    }
    console.log("أنت الآن في الغرفة رقم: ", roomId);

    if (typeof db !== 'undefined') {
        db.ref('rooms/' + roomId + '/buzzer').set({ status: 'waiting', team: null });
        db.ref('rooms/' + roomId + '/current_letter').set(null);
        db.ref('rooms/' + roomId + '/board').set(null);
        db.ref('rooms/' + roomId + '/presence').set(null);

        const tvStatusRef = db.ref('rooms/' + roomId + '/tv_status');
        tvStatusRef.set('online');
        tvStatusRef.onDisconnect().set('offline');
    }

    const gameUrl = "https://cheerful-crepe-bcc27f.netlify.app";

    setTimeout(() => {
        const pUrl = gameUrl + "/presenter.html?room=" + roomId;
        const t1Url = gameUrl + "/player.html?room=" + roomId + "&team=1";
        const t2Url = gameUrl + "/player.html?room=" + roomId + "&team=2";

        if (document.getElementById("qr-presenter-lobby")) {
            new QRCode(document.getElementById("qr-presenter-lobby"), { text: pUrl, width: 170, height: 170, colorDark: "#3a1c4a", colorLight: "#ffffff" });
            document.getElementById("url-presenter-lobby").href = pUrl;
            document.getElementById("url-presenter-lobby").innerText = pUrl;
        }
        if (document.getElementById("qr-team1-lobby")) {
            new QRCode(document.getElementById("qr-team1-lobby"), { text: t1Url, width: 170, height: 170, colorDark: "#3a1c4a", colorLight: "#ffffff" });
            document.getElementById("url-team1-lobby").href = t1Url;
            document.getElementById("url-team1-lobby").innerText = t1Url;
        }
        if (document.getElementById("qr-team2-lobby")) {
            new QRCode(document.getElementById("qr-team2-lobby"), { text: t2Url, width: 170, height: 170, colorDark: "#3a1c4a", colorLight: "#ffffff" });
            document.getElementById("url-team2-lobby").href = t2Url;
            document.getElementById("url-team2-lobby").innerText = t2Url;
        }
    }, 1000);

    const w1 = document.getElementById("w1");
    const w2 = document.getElementById("w2");
    const w3 = document.getElementById("w3");
    const logoWrapper = document.getElementById("logo-wrapper");
    const lobbyControls = document.getElementById("lobby-controls");

    const tvControls = document.getElementById("tv-controls");
    const btnTvStart = document.getElementById("btn-tv-start");

    setTimeout(() => { w1.classList.add("pop-in"); }, 1500);
    setTimeout(() => { w2.classList.add("pop-in"); }, 1800);
    setTimeout(() => { w3.classList.add("pop-in"); }, 2100);

    setTimeout(() => {
        logoWrapper.classList.add("move-up");
        tvControls.style.display = "flex";
        setTimeout(() => { lobbyControls.classList.add("show-controls"); }, 500);
    }, 3500);

    btnTvStart.addEventListener("click", () => {
        const settings = JSON.parse(localStorage.getItem('diwanGameSettings')) || {};
        const t1Name = settings.team1Name || "الفريق الأول";
        const t2Name = settings.team2Name || "الفريق الثاني";
        const c1 = settings.team1Color || "#FF9100";
        const c2 = settings.team2Color || "#10b981";

        const lblT1 = document.getElementById('lobby-t1-name');
        const lblT2 = document.getElementById('lobby-t2-name');
        const boxT1 = document.getElementById('box-team1');
        const boxT2 = document.getElementById('box-team2');

        if (lblT1) { lblT1.innerText = t1Name; lblT1.style.color = c1; boxT1.style.borderColor = c1; boxT1.style.boxShadow = `0 0 20px ${c1}40`; }
        if (lblT2) { lblT2.innerText = t2Name; lblT2.style.color = c2; boxT2.style.borderColor = c2; boxT2.style.boxShadow = `0 0 20px ${c2}40`; }

        document.getElementById('lobby-room-id').innerText = "غرفة رقم: " + roomId;

        document.getElementById("welcome-screen").style.display = "none";
        document.getElementById("lobby-screen").style.display = "flex";
    });

    document.getElementById("btn-start-from-lobby").addEventListener("click", () => {

        document.getElementById("lobby-screen").style.display = "none";

        if (typeof db !== 'undefined') {
            db.ref('rooms/' + roomId + '/buzzer').set({ status: 'waiting', team: null });
        }

        const glassHexes = Array.from(document.querySelectorAll('#glass-layer .glass-hex')).reverse();
        glassHexes.forEach((hex, index) => {
            setTimeout(() => { hex.style.animation = "fadeOutHexReverse 0.5s ease forwards"; }, index * 40);
        });

        const waitTime = (glassHexes.length * 40) + 500;

        setTimeout(() => {
            document.getElementById("glass-layer").style.display = "none";

            const transScreen = document.getElementById("transition-screen");
            transScreen.style.display = "flex";

            const tw1 = document.getElementById("tw1");
            const tw2 = document.getElementById("tw2");
            const tw3 = document.getElementById("tw3");
            const expandingHex = document.getElementById("expanding-hex");
            const roundTitleWrapper = document.getElementById("round-title-wrapper");

            setTimeout(() => { tw1.classList.add("pop-in"); }, 100);
            setTimeout(() => { tw2.classList.add("pop-in"); }, 300);
            setTimeout(() => { tw3.classList.add("pop-in"); }, 500);

            setTimeout(() => {
                tw3.classList.remove("pop-in"); tw2.classList.remove("pop-in"); tw1.classList.remove("pop-in");
                setTimeout(() => {
                    expandingHex.classList.add("expand-hex-anim");
                    setTimeout(() => { roundTitleWrapper.classList.add("show-round"); }, 400);
                }, 500);
            }, 1800);

            setTimeout(() => {
                transScreen.style.display = "none";
                const gameScreen = document.getElementById("game-screen");
                gameScreen.classList.add("show-screen");

                setTimeout(() => { document.querySelector('.game-word-hurouf-mini').classList.add("pop-in"); }, 100);
                setTimeout(() => { document.querySelector('.game-word-maa-mini').classList.add("pop-in"); }, 300);
                setTimeout(() => { document.querySelector('.game-word-diwan-mini').classList.add("pop-in"); }, 500);

                const boardHexes = document.querySelectorAll('#board-container .board-hex');
                boardHexes.forEach((hex, index) => {
                    setTimeout(() => { hex.classList.add("drop-in-hex"); }, 800 + (index * 40));
                });
            }, 4500);
        }, waitTime);
    });

    const fabMenu = document.getElementById("fab-menu");
    const btnToggleMenu = document.getElementById("btn-toggle-menu");
    const btnExitGame = document.getElementById("btn-exit-game");

    if (btnToggleMenu && fabMenu) {
        btnToggleMenu.addEventListener("click", () => { fabMenu.classList.toggle("open"); });
    }
    if (btnExitGame) {
        btnExitGame.addEventListener("click", () => { location.reload(); });
    }

    const settingsPage = document.getElementById("settings-page");
    const welcomeScreen = document.getElementById("welcome-screen");
    const btnSaveSettings = document.getElementById("btn-save-settings");
    const sw1 = document.getElementById("sw1"); const sw2 = document.getElementById("sw2"); const sw3 = document.getElementById("sw3");
    const settingsForm = document.getElementById("settings-form-container");
    const settingsSaveBtn = document.getElementById("settings-save-container");
    const allSettingsBtns = document.querySelectorAll(".btn-orange");

    allSettingsBtns.forEach(btn => {
        if (btn.innerText.includes("الإعدادات")) {
            btn.addEventListener("click", () => {
                welcomeScreen.classList.add("screen-out");
                setTimeout(() => {
                    welcomeScreen.style.display = "none"; welcomeScreen.classList.remove("screen-out");
                    settingsPage.classList.add("show-screen"); settingsPage.classList.add("screen-in");
                    settingsForm.classList.remove("fade-in-up", "fade-out-down");
                    settingsSaveBtn.classList.remove("fade-in-up", "fade-out-down");
                    sw1.classList.remove("pop-in"); sw2.classList.remove("pop-in"); sw3.classList.remove("pop-in");
                    setTimeout(() => { sw1.classList.add("pop-in"); }, 100);
                    setTimeout(() => { sw2.classList.add("pop-in"); }, 300);
                    setTimeout(() => { sw3.classList.add("pop-in"); }, 500);
                    setTimeout(() => { settingsForm.classList.add("fade-in-up"); settingsSaveBtn.classList.add("fade-in-up"); }, 800);
                }, 400);
            });
        }
    });

    if (btnSaveSettings) {
        btnSaveSettings.addEventListener("click", () => {

            const aiBtn = document.querySelector('#setting-presenter-type .sp-seg-btn[data-type="ai"]');
            if (aiBtn && aiBtn.classList.contains('active')) {
                alert("المقدم الآلي تحت التطوير حالياً ⏳ سيتم تفعيل المقدم البشري مؤقتاً.");
                const humanBtn = document.querySelector('#setting-presenter-type .sp-seg-btn[data-type="human"]');
                if (humanBtn) humanBtn.click();
            }

            const team1Input = document.getElementById("setting-team1");
            const team2Input = document.getElementById("setting-team2");
            const team1Name = team1Input.value.trim() || team1Input.placeholder;
            const team2Name = team2Input.value.trim() || team2Input.placeholder;

            const teamNamesInGame = document.querySelectorAll(".team-name-box");
            if (teamNamesInGame.length >= 2) {
                teamNamesInGame[0].innerText = team1Name;
                teamNamesInGame[1].innerText = team2Name;
            }

            const compInput = document.getElementById("setting-comp-name");
            const customWord = compInput.value.trim() || compInput.placeholder;

            document.getElementById("w3").innerText = customWord;
            document.getElementById("tw3").innerText = customWord;
            document.getElementById("gw3").innerText = customWord;
            document.getElementById("sw3").innerText = customWord;

            const team1ColorBtn = document.querySelector('.team1-colors .selected-color');
            const team2ColorBtn = document.querySelector('.team2-colors .selected-color');

            let color1 = "#FF9100"; let color2 = "#10b981";

            if (team1ColorBtn && team2ColorBtn) {
                color1 = team1ColorBtn.style.getPropertyValue('--color').trim();
                color2 = team2ColorBtn.style.getPropertyValue('--color').trim();
                document.documentElement.style.setProperty('--team1-color', color1);
                document.documentElement.style.setProperty('--team2-color', color2);
            }

            const gameSettingsData = { compName: customWord, team1Name: team1Name, team2Name: team2Name, team1Color: color1, team2Color: color2 };
            localStorage.setItem('diwanGameSettings', JSON.stringify(gameSettingsData));

            if (typeof db !== 'undefined') {
                db.ref('rooms/' + roomId + '/settings').set(gameSettingsData);
            }

            settingsForm.classList.remove("fade-in-up"); settingsSaveBtn.classList.remove("fade-in-up");
            settingsForm.classList.add("fade-out-down"); settingsSaveBtn.classList.add("fade-out-down");
            setTimeout(() => { sw3.classList.remove("pop-in"); }, 200);
            setTimeout(() => { sw2.classList.remove("pop-in"); }, 400);
            setTimeout(() => { sw1.classList.remove("pop-in"); }, 600);

            setTimeout(() => {
                settingsPage.classList.remove("show-screen", "screen-in");
                welcomeScreen.style.display = "block"; welcomeScreen.classList.add("screen-in");
                setTimeout(() => { w1.classList.add("pop-in"); }, 100);
                setTimeout(() => { w2.classList.add("pop-in"); }, 300);
                setTimeout(() => { w3.classList.add("pop-in"); }, 500);
                setTimeout(() => { lobbyControls.classList.add("show-controls"); }, 800);
                setTimeout(() => { welcomeScreen.classList.remove("screen-in"); }, 400);
            }, 1000);
        });
    }

    const segmentedButtons = document.querySelectorAll('.sp-seg-btn');
    segmentedButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const siblings = this.parentElement.querySelectorAll('.sp-seg-btn');
            siblings.forEach(sib => sib.classList.remove('active')); this.classList.add('active');
        });
    });

    const colorItems = document.querySelectorAll('.item-color');
    colorItems.forEach(item => {
        item.addEventListener('click', function () {
            const parentContainer = this.closest('.container-items');
            const siblings = parentContainer.querySelectorAll('.item-color');
            siblings.forEach(sib => sib.classList.remove('selected-color')); this.classList.add('selected-color');
        });
    });

    if (typeof db !== 'undefined') {
        const roles = ['presenter', 'team1', 'team2'];

        roles.forEach(role => {
            db.ref('rooms/' + roomId + '/presence/' + role).on('value', (snap) => {
                const status = snap.val();
                const qrContainer = document.getElementById('qr-' + role + '-lobby-container');
                const statusContainer = document.getElementById('status-' + role + '-lobby');

                if (qrContainer && statusContainer) {
                    if (status === 'online') {
                        qrContainer.style.display = 'none';
                        statusContainer.style.display = 'block';
                    } else {
                        qrContainer.style.display = 'block';
                        statusContainer.style.display = 'none';
                    }
                }
            });

            const resetBtn = document.getElementById('btn-reset-' + role);
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    db.ref('rooms/' + roomId + '/presence/' + role).set(null);
                });
            }
        });
    }

    const qSourceBtns = document.querySelectorAll('#q-source-toggle .sp-seg-btn');
    const aiCategoryRow = document.getElementById('ai-category-row');
    const btnOpenPortal = document.getElementById('btn-open-portal');
    const portalScreen = document.getElementById('questions-portal-screen');
    const btnBackFromPortal = document.getElementById('btn-back-from-portal');
    const pw1 = document.getElementById("pw1"); const pw2 = document.getElementById("pw2"); const pw3 = document.getElementById("pw3");

    qSourceBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const source = this.getAttribute('data-source');
            if (source === 'ai') {
                aiCategoryRow.style.display = 'flex'; document.getElementById('btn-open-portal-wrapper').style.display = 'none';
            } else {
                aiCategoryRow.style.display = 'none'; document.getElementById('btn-open-portal-wrapper').style.display = 'flex';
            }
        });
    });

    btnOpenPortal.addEventListener('click', () => {
        settingsPage.classList.add("screen-out");
        const compInput = document.getElementById("setting-comp-name");
        const customWord = compInput.value.trim() || compInput.placeholder;
        pw3.innerText = customWord;

        setTimeout(() => {
            settingsPage.style.display = "none"; settingsPage.classList.remove("screen-out");
            portalScreen.classList.add("show-screen"); portalScreen.classList.add("screen-in");
            setTimeout(() => portalScreen.style.opacity = "1", 50);
            pw1.classList.remove("pop-in"); pw2.classList.remove("pop-in"); pw3.classList.remove("pop-in");
            setTimeout(() => { pw1.classList.add("pop-in"); }, 200);
            setTimeout(() => { pw2.classList.add("pop-in"); }, 400);
            setTimeout(() => { pw3.classList.add("pop-in"); }, 600);
            setTimeout(() => { portalScreen.classList.remove("screen-in"); }, 400);
        }, 400);
    });

    btnBackFromPortal.addEventListener('click', () => {
        portalScreen.classList.add("screen-out");
        setTimeout(() => {
            portalScreen.classList.remove("show-screen", "screen-out");
            settingsPage.style.display = "block"; settingsPage.classList.add("screen-in");
            setTimeout(() => settingsPage.style.opacity = "1", 50);
            setTimeout(() => { settingsPage.classList.remove("screen-in"); }, 400);
        }, 400);
    });

    const portalKeys = document.querySelectorAll('.portal-key');
    const portalInstruction = document.getElementById('portal-instruction');
    const portalForm = document.getElementById('portal-form');
    const selectedLetterDisplay = document.getElementById('selected-letter-display');
    const btnSaveQuestion = document.getElementById('btn-save-question');
    const btnDeleteQuestion = document.getElementById('btn-delete-question');
    const customQInput = document.getElementById('custom-q-input');
    const customAInput = document.getElementById('custom-a-input');

    let customQuestionsData = {};

    portalKeys.forEach(key => {
        key.addEventListener('click', function () {
            portalKeys.forEach(k => k.classList.remove('active-key')); this.classList.add('active-key');
            const letter = this.innerText;
            portalInstruction.style.display = 'none'; portalForm.style.display = 'block'; selectedLetterDisplay.innerText = letter;
            if (customQuestionsData[letter]) {
                customQInput.value = customQuestionsData[letter].q; customAInput.value = customQuestionsData[letter].a; btnDeleteQuestion.style.display = 'block';
            } else {
                customQInput.value = ''; customAInput.value = ''; btnDeleteQuestion.style.display = 'none';
            }
        });
    });

    btnSaveQuestion.addEventListener('click', () => {
        const activeKey = document.querySelector('.portal-key.active-key');
        if (!activeKey) return;
        const letter = activeKey.innerText; const q = customQInput.value.trim(); const a = customAInput.value.trim();
        if (q && a) {
            customQuestionsData[letter] = { q, a }; activeKey.classList.add('has-data'); btnDeleteQuestion.style.display = 'block';
            btnSaveQuestion.innerText = "تم الحفظ بنجاح ✔️"; btnSaveQuestion.style.background = "#FFD700";
            setTimeout(() => { btnSaveQuestion.innerText = "حفظ السؤال ✔️"; btnSaveQuestion.style.background = "#00E676"; }, 1500);
        }
    });

    btnDeleteQuestion.addEventListener('click', () => {
        const activeKey = document.querySelector('.portal-key.active-key');
        if (!activeKey) return;
        const letter = activeKey.innerText;
        delete customQuestionsData[letter]; activeKey.classList.remove('has-data');
        customQInput.value = ''; customAInput.value = ''; btnDeleteQuestion.style.display = 'none';
        btnDeleteQuestion.innerText = "تم الحذف ✔️"; btnDeleteQuestion.style.display = 'block';
        setTimeout(() => { btnDeleteQuestion.innerText = "حذف 🗑️"; btnDeleteQuestion.style.display = 'none'; }, 1500);
    });

    const alertOverlay = document.createElement('div');
    alertOverlay.id = 'tv-buzzer-overlay';
    alertOverlay.innerHTML = `
        <div class="buzzer-alert-box" id="tv-buzzer-box">
            <div class="buzzer-alert-team" id="tv-buzzer-team-name" style="font-size: 3.5rem; margin-bottom: 10px; font-weight: bold;">الفريق</div>
            <div class="buzzer-alert-title" id="tv-buzzer-title" style="font-size: 2rem;">🔔 تم الضغط 🔔</div>
        </div>
    `;
    document.body.appendChild(alertOverlay);

    const tvBuzzerBox = document.getElementById('tv-buzzer-box');
    const tvBuzzerTeamName = document.getElementById('tv-buzzer-team-name');
    const tvBuzzerTitle = document.getElementById('tv-buzzer-title');

    const hypePhrases = ["أووووه! أسرع من البرق ⚡️", "يا ساتر على السرعة! 🚀", "الذيب اللي لقطها 🐺🔥", "عندهم العلم! 🧠✨", "بومممم! ضربة معلم 💥", "وحووووش الشاشة 🦍💪", "ما يمزحووووون! 🔥", "اللي سبق لبق 😉🏃‍♂️", "يا ويلكم منهم 🚨"];

    if (typeof db !== 'undefined') {
        db.ref('rooms/' + roomId + '/buzzer').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data && data.status === 'pressed') {
                const settings = JSON.parse(localStorage.getItem('diwanGameSettings')) || {};
                let tName = data.team === 1 ? (settings.team1Name || "الفريق الأول") : (settings.team2Name || "الفريق الثاني");
                let tColor = data.team === 1 ? (settings.team1Color || "#FF9100") : (settings.team2Color || "#10b981");

                const randomHype = hypePhrases[Math.floor(Math.random() * hypePhrases.length)];
                tvBuzzerTitle.innerText = randomHype;

                tvBuzzerTeamName.innerText = tName;
                tvBuzzerBox.style.setProperty('--alert-color', tColor);

                alertOverlay.classList.add('show-alert');
            } else {
                alertOverlay.classList.remove('show-alert');
            }
        });
    }

    if (typeof db !== 'undefined') {
        db.ref('rooms/' + roomId + '/board').on('value', (snapshot) => {
            const boardData = snapshot.val() || {};
            const allTvHexes = document.querySelectorAll('#board-container .board-hex');

            let team1Score = 0;
            let team2Score = 0;

            allTvHexes.forEach(hex => {
                const letter = hex.querySelector('span').innerText.trim();

                hex.classList.remove('team1-captured', 'team2-captured');

                if (boardData[letter] === 'team1') {
                    hex.classList.add('team1-captured');
                    team1Score++;
                } else if (boardData[letter] === 'team2') {
                    hex.classList.add('team2-captured');
                    team2Score++;
                }
            });

            const scoreElements = document.querySelectorAll('.score-hex span');
            if (scoreElements.length >= 2) {
                scoreElements[0].innerText = team1Score;
                scoreElements[1].innerText = team2Score;
            }
        });

        db.ref('rooms/' + roomId + '/current_letter').on('value', (snapshot) => {
            const activeLetter = snapshot.val();
            const allTvHexes = document.querySelectorAll('#board-container .board-hex');

            allTvHexes.forEach(hex => {
                const span = hex.querySelector('span');
                if (activeLetter && span && span.innerText.trim() === activeLetter) {
                    hex.classList.add('active-hex');
                } else {
                    hex.classList.remove('active-hex');
                }
            });
        });
    }
});