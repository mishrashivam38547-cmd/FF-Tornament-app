// ====================================================================
// 🎮 STICKY TABS FILTER & DYNAMIC RESULT INJECTION SYSTEM (V7 CLEAN)
// ====================================================================

const IMGBB_API_KEY = "0de43554e74e8bef68fc0f49cccf0d1f"; 
let currentSelectedTab = 'matches'; // Default state

function setupStickyNavigation() {
    if (document.getElementById('fixed-tab-nav-bar')) return;

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
        `;
        targetContainer.insertAdjacentHTML('beforebegin', navHTML);
    }
}

// 🔄 TABS MANIPULATION & REALTIME DOM FILTER
function handleTabSwitch(tabName) {
    currentSelectedTab = tabName;
    
    const mBtn = document.getElementById('btn-tab-matches');
    const hBtn = document.getElementById('btn-tab-history');
    const gBtn = document.getElementById('btn-tab-giveaway');

    if (!mBtn || !hBtn || !gBtn) return;

    const offStyle = "background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;";
    const onStyle = "background: linear-gradient(135deg, #ff4e50, #f9d423) !important; color: #ffffff !important; border: none !important;";

    mBtn.style.cssText = offStyle;
    hBtn.style.cssText = offStyle;
    gBtn.style.cssText = offStyle;

    if (tabName === 'matches') mBtn.style.cssText = onStyle;
    if (tabName === 'history') hBtn.style.cssText = onStyle;
    if (tabName === 'giveaway') gBtn.style.cssText = onStyle;

    applyLiveTabFilter();
}

// 🔥 POWERFUL FILTER ENGINE: Jo pehle se chal rahe elements ko automatic control karega
function applyLiveTabFilter() {
    // Agar koi user giveaway tab pe jaye
    const matchesTabBox = document.getElementById('matches-tab');
    
    // Aapke original system ke banaye cards ko detect karna (jo aapke screenshot me dikh rahe hain)
    const allMatchCards = document.querySelectorAll('#matches-tab > div, .match-card-item-box, [id^="match-card-"]');
    
    allMatchCards.forEach((card) => {
        const cardText = card.innerText || "";
        
        // Check match status directly from card content text
        const isCompleted = cardText.includes("Status: Completed") || cardText.includes("Match Ended") || cardText.includes("Completed");

        if (currentSelectedTab === 'matches') {
            if (isCompleted) {
                card.style.setProperty('display', 'none', 'important'); // Completed match matches tab se hide hoga
            } else {
                card.style.setProperty('display', 'block', 'important'); // Active match dikhega
            }
        } else if (currentSelectedTab === 'history') {
            if (isCompleted) {
                card.style.setProperty('display', 'block', 'important'); // Completed match history me dikhega
            } else {
                card.style.setProperty('display', 'none', 'important'); // Active match history se hide hoga
            }
        } else if (currentSelectedTab === 'giveaway') {
            card.style.setProperty('display', 'none', 'important'); // Giveaway me sab hide
        }
    });
}

// 📥 AUTOMATIC RESULT FORM INJECTOR (CARD KE ANDAR)
function runLiveFormInjector() {
    if (typeof firebase === 'undefined' || !firebase.database) return;
    
    const currentUID = window.userSessionUID || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null);
    if (!currentUID) return;

    firebase.database().ref('matches').once('value', (snapshot) => {
        const matches = snapshot.val();
        if (!matches) return;

        Object.keys(matches).forEach((matchId) => {
            const match = matches[matchId];
            const isMatchOver = match.status === "Completed" || match.isHistory === true;
            const hasUserJoined = match.participants && match.participants[currentUID];

            if (isMatchOver && hasUserJoined) {
                // Aapke existing system ke har card ke niche ek dynamic safe injection point create karna
                // Yeh dhoondhega ki aapka card kahan render hua hai screen par
                const cards = document.querySelectorAll('#matches-tab > div, [id^="match-card-"]');
                
                cards.forEach((card) => {
                    // Match unique text verify karke sahi card target karna
                    if (card.innerText.includes(match.title) && !card.querySelector(`.v7-form-container`)) {
                        
                        const hasSubmitted = match.submittedResults && match.submittedResults[currentUID];
                        const containerDiv = document.createElement('div');
                        containerDiv.className = 'v7-form-container';
                        containerDiv.style.width = "100%";

                        if (hasSubmitted) {
                            containerDiv.innerHTML = `
                                <div style="background: #111; border: 1px solid #28a745; padding: 10px; border-radius: 6px; text-align: center; margin-top: 12px; box-sizing: border-box;">
                                    <p style="color: #28a745; margin: 0; font-size: 11px; font-weight: bold;">✓ Result Successfully Submitted!</p>
                                </div>
                            `;
                        } else {
                            containerDiv.innerHTML = `
                                <div style="background: #161616; border: 1px solid #ff4e50; padding: 12px; border-radius: 8px; margin-top: 12px; text-align: left; box-sizing: border-box;">
                                    <h4 style="color: #ff4e50; margin: 0 0 8px 0; font-size: 12px; text-align: center; font-weight: bold; text-transform:uppercase;">📤 Submit Match Result</h4>
                                    
                                    <label style="color:#777; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">App Account UID:</label>
                                    <input type="text" id="v7-app-id-${matchId}" value="${currentUID}" disabled style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#ff9f43; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px; font-weight:bold;">
                                    
                                    <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">Free Fire Game UID:</label>
                                    <input type="text" id="v7-game-id-${matchId}" placeholder="Enter Free Fire UID" style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    
                                    <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">In-Game Name (IGN):</label>
                                    <input type="text" id="v7-player-name-${matchId}" placeholder="Enter Game Nickname" style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    
                                    <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">Total Kills Done:</label>
                                    <input type="number" id="v7-kills-${matchId}" placeholder="0" style="width:100%; padding:7px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    
                                    <label style="color:#ff9f43; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">📸 Upload Screenshot (From Gallery):</label>
                                    <input type="file" id="v7-file-${matchId}" accept="image/*" style="width:100%; padding:5px; margin-bottom:4px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    <p id="v7-status-${matchId}" style="color: #ff9f43; font-size: 10px; margin: 0 0 10px 0; font-weight: bold;"></p>
                                    
                                    <button onclick="processV7Upload('${matchId}', '${currentUID}')" id="v7-btn-${matchId}" style="width:100%; padding:9px; background: linear-gradient(135deg, #28a745, #218838); color:#fff; border:none; font-weight:bold; border-radius:4px; cursor:pointer; font-size:12px; text-transform:uppercase;">Submit Form</button>
                                </div>
                            `;
                        }
                        card.appendChild(containerDiv);
                    }
                });
            }
        });
    });
    applyLiveTabFilter(); // Keep filtering running smooth
}

// 🚀 SERVER IMGBB PICTURE UPLOAD PROCESSOR
function processV7Upload(matchId, currentUID) {
    const gameIdVal = document.getElementById(`v7-game-id-${matchId}`).value.trim();
    const nameVal = document.getElementById(`v7-player-name-${matchId}`).value.trim();
    const killsVal = document.getElementById(`v7-kills-${matchId}`).value;
    const fileInput = document.getElementById(`v7-file-${matchId}`);
    const statusText = document.getElementById(`v7-status-${matchId}`);
    const submitBtn = document.getElementById(`v7-btn-${matchId}`);

    if (!gameIdVal || !nameVal || !killsVal || !fileInput.files[0]) {
        alert("🚨 Saari fields bharein aur gallery se photo select karein!");
        return;
    }

    const file = fileInput.files[0];
    submitBtn.disabled = true;
    submitBtn.innerText = "Uploading...";
    statusText.innerText = "⏳ Image upload ho rahi hai...";

    const formData = new FormData();
    formData.append("image", file);

    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            const uploadedImgURL = result.data.url;
            statusText.innerText = "📸 Database sync in progress...";

            const payload = {
                playerAppUID: currentUID,
                gameId: gameIdVal,
                playerName: nameVal,
                kills: parseInt(killsVal) || 0,
                screenshot: uploadedImgURL, 
                rewardStatus: "Pending",
                submittedAt: Date.now()
            };

            return firebase.database().ref(`matches/${matchId}/submittedResults/${currentUID}`).set(payload);
        } else {
            throw new Error("ImgBB Server Error!");
        }
    })
    .then(() => {
        alert("🎉 Result successfully save ho gaya!");
        location.reload(); // Instantly refresh UI state
    })
    .catch((err) => {
        alert("❌ Error: " + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Form";
        statusText.innerText = "";
    });
}

// Loops initializers
setInterval(runLiveFormInjector, 1000);
const initNavLoop = setInterval(() => {
    if (document.body) {
        clearInterval(initNavLoop);
        setupStickyNavigation();
    }
}, 300);
        
