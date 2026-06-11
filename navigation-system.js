// =================================================================
// 📌 STICKY NAVIGATION, FIXED BUTTONS & AUTOMATIC RESULT SYSTEM
// =================================================================

function setupStickyNavigation() {
    // Agar dashboard tabs pehle se bane hain toh loop se bachein
    if (document.getElementById('fixed-tab-nav-bar')) return;

    // Aapke main matches containers ke theek upar ise set karne ke liye target dhoondhna
    const targetContainer = document.getElementById('matches-tab') || 
                            document.querySelector('.main-content') || 
                            document.body;

    if (targetContainer) {
        const navHTML = `
            <div id="fixed-tab-nav-bar" style="
                display: flex !important;
                justify-content: space-around !important;
                align-items: center !important;
                background: #111111 !important;
                padding: 10px !important;
                border: 1px solid #222222 !important;
                border-radius: 8px !important;
                margin: 15px auto !important;
                width: 95% !important;
                max-width: 400px !important;
                box-sizing: border-box !important;
            ">
                <button onclick="handleTabSwitch('matches')" id="btn-tab-matches" style="
                    flex: 1 !important; margin: 0 4px !important; padding: 10px 5px !important;
                    background: linear-gradient(135deg, #ff4e50, #f9d423) !important;
                    color: #ffffff !important; border: none !important; border-radius: 6px !important;
                    font-weight: bold !important; font-size: 12px !important; cursor: pointer !important;
                ">Matches</button>

                <button onclick="handleTabSwitch('history')" id="btn-tab-history" style="
                    flex: 1 !important; margin: 0 4px !important; padding: 10px 5px !important;
                    background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;
                    border-radius: 6px !important; font-weight: bold !important; font-size: 12px !important; cursor: pointer !important;
                ">History</button>

                <button onclick="handleTabSwitch('giveaway')" id="btn-tab-giveaway" style="
                    flex: 1 !important; margin: 0 4px !important; padding: 10px 5px !important;
                    background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;
                    border-radius: 6px !important; font-weight: bold !important; font-size: 12px !important; cursor: pointer !important;
                ">Giveaway Claim</button>
            </div>
            
            <div id="player-result-box-wrapper" style="width: 95%; max-width: 400px; margin: 0 auto 15px auto; box-sizing: border-box;"></div>
        `;

        // Container ke theek shuruat me is navigation block ko chipkana
        targetContainer.insertAdjacentHTML('beforebegin', navHTML);
        
        // Firebase loop chalu karna joined matches dhoondhne ke liye
        startResultFormListener();
    }
}

// 🔄 TABS REDIRECTION CONTROL
function handleTabSwitch(tabName) {
    const mBtn = document.getElementById('btn-tab-matches');
    const hBtn = document.getElementById('btn-tab-history');
    const gBtn = document.getElementById('btn-tab-giveaway');

    if (!mBtn || !hBtn || !gBtn) return;

    const offStyle = "background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;";
    const onStyle = "background: linear-gradient(135deg, #ff4e50, #f9d423) !important; color: #ffffff !important; border: none !important;";

    mBtn.style.cssText = offStyle;
    hBtn.style.cssText = offStyle;
    gBtn.style.cssText = offStyle;

    if (tabName === 'matches') {
        mBtn.style.cssText = onStyle;
        if (typeof switchTab === "function") switchTab('matches');
    } else if (tabName === 'history') {
        hBtn.style.cssText = onStyle;
        if (typeof switchTab === "function") switchTab('history');
    } else if (tabName === 'giveaway') {
        gBtn.style.cssText = onStyle;
        if (typeof switchTab === "function") switchTab('giveaway');
    }
}

// 🎯 REALTIME VERIFICATION ENGINE FOR SECURE RESULT UPLOADS
function startResultFormListener() {
    const checkDb = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.database && window.userSessionUID) {
            clearInterval(checkDb);

            firebase.database().ref('matches').on('value', (snapshot) => {
                const matches = snapshot.val();
                const formWrapper = document.getElementById('player-result-box-wrapper');
                if (!formWrapper || !matches) return;

                formWrapper.innerHTML = ""; // Purane boxes clear karein

                Object.keys(matches).forEach((matchId) => {
                    const match = matches[matchId];
                    
                    // Rule 1: Match complete hona chahiye
                    const isMatchOver = match.status === "Completed" || match.isHistory === true;
                    // Rule 2: Player list me user registered hona chahiye
                    const hasUserJoined = match.participants && match.participants[window.userSessionUID];

                    if (isMatchOver && hasUserJoined) {
                        const hasSubmitted = match.submittedResults && match.submittedResults[window.userSessionUID];

                        if (hasSubmitted) {
                            formWrapper.innerHTML += `
                                <div style="background: #111; border: 1px solid #28a745; padding: 10px; border-radius: 8px; text-align: center; margin-bottom: 10px;">
                                    <p style="color: #28a745; margin: 0; font-size: 12px; font-weight: bold;">✓ [${match.title || 'FF Match'}] Result Already Submitted!</p>
                                </div>
                            `;
                        } else {
                            // User joined hai aur match complete hai -> Form dikhao
                            const submissionFormHTML = `
                                <div id="form-card-${matchId}" style="background: #161616; border: 1px solid #ff4e50; padding: 14px; border-radius: 8px; font-family: 'Roboto', sans-serif; margin-bottom: 12px;">
                                    <h4 style="color: #ff4e50; margin: 0 0 10px 0; font-size: 13px; text-align: center; font-weight: bold;">📤 Submit Result: ${match.title || 'FF Tournament'}</h4>
                                    
                                    <input type="text" id="inp-game-id-${matchId}" placeholder="Enter Game UID" style="width:100%; padding:8px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <input type="number" id="inp-kills-${matchId}" placeholder="Enter Kills Number" style="width:100%; padding:8px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <input type="text" id="inp-screenshot-${matchId}" placeholder="Paste Screenshot Link (ImgBB/Imgur)" style="width:100%; padding:8px; margin-bottom:12px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <button onclick="processResultUpload('${matchId}')" style="width:100%; padding:9px; background: linear-gradient(135deg, #28a745, #218838); color:#fff; border:none; font-weight:bold; border-radius:5px; cursor:pointer; font-size:12px;">Submit Details</button>
                                </div>
                            `;
                            formWrapper.innerHTML += submissionFormHTML;
                        }
                    }
                });
            });
        }
    }, 600);
}

// 🚀 FIREBASE DATA SAVE FUNCTION
function processResultUpload(matchId) {
    const uidVal = document.getElementById(`inp-game-id-${matchId}`).value.trim();
    const killsVal = document.getElementById(`inp-kills-${matchId}`).value;
    const ssVal = document.getElementById(`inp-screenshot-${matchId}`).value.trim();

    if (!uidVal || !killsVal || !ssVal) {
        alert("🚨 Kripya saari fields (Game UID, Kills, Screenshot Link) bharein!");
        return;
    }

    const payload = {
        playerUID: window.userSessionUID,
        gameId: uidVal,
        kills: parseInt(killsVal) || 0,
        screenshot: ssVal,
        submittedAt: Date.now()
    };

    firebase.database().ref(`matches/${matchId}/submittedResults/${window.userSessionUID}`).set(payload)
    .then(() => {
        alert("🎉 Result successfully upload ho gaya! Admin verify karte hi prize wallet me daal dega.");
    })
    .catch((err) => {
        alert("❌ Database Error: " + err.message);
    });
}

// AUTO INITIALIZE START
const initNavLoop = setInterval(() => {
    if (document.body) {
        clearInterval(initNavLoop);
        setupStickyNavigation();
    }
}, 300);
