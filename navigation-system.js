// =======================================================
// 📌 STICKY NAVIGATION & AUTOMATIC RESULT SUBMISSION SYSTEM
// =======================================================

function setupStickyNavigation() {
    if (document.getElementById('fixed-tab-nav-bar')) return;

    const bodyElement = document.body;
    if (bodyElement) {
        const navHTML = `
            <div id="fixed-tab-nav-bar" style="
                position: sticky !important;
                top: 0 !important;
                z-index: 9999 !important;
                display: flex !important;
                justify-content: space-around !important;
                align-items: center !important;
                background: #111111 !important;
                padding: 12px 10px !important;
                border-bottom: 2px solid #222222 !important;
                width: 100% !important;
                box-sizing: border-box !important;
                margin-bottom: 10px !important;
            ">
                <button onclick="switchTab('live')" id="tab-live-btn" style="
                    flex: 1 !important; margin: 0 5px !important; padding: 10px !important;
                    background: linear-gradient(135deg, #ff9f43, #ff6b6b) !important;
                    color: #ffffff !important; border: none !important; border-radius: 6px !important;
                    font-weight: bold !important; font-size: 13px !important; cursor: pointer !important;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;
                ">🎮 Live Matches</button>

                <button onclick="switchTab('history')" id="tab-history-btn" style="
                    flex: 1 !important; margin: 0 5px !important; padding: 10px !important;
                    background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;
                    border-radius: 6px !important; font-weight: bold !important; font-size: 13px !important; cursor: pointer !important;
                ">🏆 Match History</button>

                <button onclick="switchTab('giveaway')" id="tab-giveaway-btn" style="
                    flex: 1 !important; margin: 0 5px !important; padding: 10px !important;
                    background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;
                    border-radius: 6px !important; font-weight: bold !important; font-size: 13px !important; cursor: pointer !important;
                ">🎁 Giveaway</button>
            </div>
            
            <div id="result-submission-global-container" style="width: 100%; padding: 0 10px; box-sizing: border-box;"></div>
        `;

        bodyElement.insertAdjacentHTML('afterbegin', navHTML);
        
        // Loop lagakar completed matches me check karna ki user joined tha ya nahi
        listenMatchesForResults();
    }
}

function switchTab(tabName) {
    const liveBtn = document.getElementById('tab-live-btn');
    const historyBtn = document.getElementById('tab-history-btn');
    const giveawayBtn = document.getElementById('tab-giveaway-btn');

    if (!liveBtn || !historyBtn || !giveawayBtn) return;

    const inactiveStyle = "background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important; box-shadow: none !important;";
    const activeStyle = "background: linear-gradient(135deg, #ff9f43, #ff6b6b) !important; color: #ffffff !important; border: none !important; box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;";

    liveBtn.style.cssText = inactiveStyle;
    historyBtn.style.cssText = inactiveStyle;
    giveawayBtn.style.cssText = inactiveStyle;

    if (tabName === 'live') {
        liveBtn.style.cssText = activeStyle;
        if (typeof showLiveMatches === "function") showLiveMatches(); 
    } else if (tabName === 'history') {
        historyBtn.style.cssText = activeStyle;
        if (typeof showMatchHistory === "function") showMatchHistory();
    } else if (tabName === 'giveaway') {
        giveawayBtn.style.cssText = activeStyle;
        if (typeof showGiveaways === "function") showGiveaways();
    }
}

// 🎯 REAL-TIME RESULT CHECKER FOR JOINED PLAYERS
function listenMatchesForResults() {
    const intervalCheck = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.database && window.userSessionUID) {
            clearInterval(intervalCheck);

            // Firebase database se matches reference read karna
            firebase.database().ref('matches').on('value', (snapshot) => {
                const matches = snapshot.val();
                const resultArea = document.getElementById('result-submission-global-container');
                if (!resultArea || !matches) return;

                resultArea.innerHTML = ""; // Clear previous

                Object.keys(matches).forEach((matchId) => {
                    const match = matches[matchId];
                    
                    // Logic Condition: Match 'Completed' hona chahiye AUR user 'participants' list me hona chahiye
                    const isCompleted = match.status === "Completed" || match.isHistory === true;
                    const isUserJoined = match.participants && match.participants[window.userSessionUID];

                    if (isCompleted && isUserJoined) {
                        
                        // Check karenge ki user ne pehle se result send toh nahi kiya hai
                        const alreadySubmitted = match.submittedResults && match.submittedResults[window.userSessionUID];

                        if (alreadySubmitted) {
                            resultArea.innerHTML += `
                                <div style="background: #111; border: 1px solid #28a745; padding: 12px; margin: 10px 0; border-radius: 8px; text-align: center;">
                                    <p style="color: #28a745; margin: 0; font-size: 13px; font-weight: bold;">✓ Match [${match.title || 'Free Fire'}] Result Submitted Successfully!</p>
                                </div>
                            `;
                        } else {
                            // Input form box show karna agar user joined tha aur result baaki hai
                            const formHTML = `
                                <div id="upload-box-${matchId}" style="background: #1a1a1a; border: 1px solid #ff9f43; padding: 15px; margin: 10px 0; border-radius: 8px; font-family: 'Roboto', sans-serif;">
                                    <h4 style="color: #ff9f43; margin: 0 0 10px 0; font-size: 14px; text-align: center;">📤 Upload Result: ${match.title || 'FF Match'}</h4>
                                    
                                    <input type="text" id="game-id-${matchId}" placeholder="Enter Game UID (e.g., 4829104)" style="width:100%; padding:8px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:12px;">
                                    
                                    <input type="number" id="game-kills-${matchId}" placeholder="Enter Total Kills" style="width:100%; padding:8px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:12px;">
                                    
                                    <p style="color: #aaa; font-size: 11px; margin: 0 0 4px 0;">Screenshot Upload Link (Paste ImgBB/Imgur Link):</p>
                                    <input type="text" id="game-ss-${matchId}" placeholder="https://ibb.co/example" style="width:100%; padding:8px; margin-bottom:12px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:12px;">
                                    
                                    <button onclick="uploadPlayerMatchResult('${matchId}')" style="width:100%; padding:10px; background: linear-gradient(135deg, #28a745, #218838); color:#fff; border:none; font-weight:bold; border-radius:5px; cursor:pointer; font-size:13px;">Submit Match Result</button>
                                </div>
                            `;
                            resultArea.innerHTML += formHTML;
                        }
                    }
                });
            });
        }
    }, 500);
}

// 🚀 RESULT SUBMIT DATA SEND TO FIREBASE
function uploadPlayerMatchResult(matchId) {
    const gameId = document.getElementById(`game-id-${matchId}`).value.trim();
    const kills = document.getElementById(`game-kills-${matchId}`).value;
    const ssLink = document.getElementById(`game-ss-${matchId}`).value.trim();

    if (!gameId || !kills || !ssLink) {
        alert("🚨 Kripya saari details (UID, Kills, Screenshot Link) sahi se fill karein!");
        return;
    }

    const resultData = {
        playerUID: window.userSessionUID,
        gameId: gameId,
        kills: parseInt(kills) || 0,
        screenshot: ssLink,
        submittedAt: Date.now()
    };

    // Firebase database me match id ke andar submittedResults node me save karna
    firebase.database().ref(`matches/${matchId}/submittedResults/${window.userSessionUID}`).set(resultData)
    .then(() => {
        alert("🎉 Boom! Aapka result successfully save ho gaya hai. Admin verification ke baad wallet me money add ho jayegi.");
    })
    .catch((error) => {
        alert("❌ Error: " + error.message);
    });
}

// AUTOMATIC INITIALIZATION ENGINE
const launchNavEngine = setInterval(() => {
    if (document.body) {
        clearInterval(launchNavEngine);
        setupStickyNavigation();
    }
}, 250);
