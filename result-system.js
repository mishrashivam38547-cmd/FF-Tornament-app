// ====================================================================
// 👑 AUTOMATIC TABS INJECTOR & DYNAMIC MATCH FILTER SYSTEM (V8 LIVE)
// ====================================================================

const IMGBB_API_KEY = "0de43554e74e8bef68fc0f49cccf0d1f"; 
let currentSelectedTab = 'matches'; // Default active tab

function injectSmartStickyNavigation() {
    // Agar bar pehle se bana hai toh kuch mat karo
    if (document.getElementById('fixed-tab-nav-bar')) return;

    // 🔥 FOOLPROOF TARGETING: "Withdraw Balance" button ya kisi bhi primary block ko dhoondhna
    let targetElement = null;
    
    // Tarika 1: Pure page par jo text "Withdraw Balance" dhoondhna
    const allButtons = document.querySelectorAll('button, div, p, a');
    for (let el of allButtons) {
        if (el.innerText && el.innerText.includes("Withdraw Balance")) {
            targetElement = el;
            break;
        }
    }

    // Tarika 2: Agar upar wala na mile toh matches container ya body ka main container dhoondhna
    if (!targetElement) {
        targetElement = document.getElementById('matches-tab') || 
                        document.querySelector('.main-content') || 
                        document.getElementById('main-content');
    }

    // Agar abhi bhi na mile, toh thoda wait karein jab tak layout render ho raha hai
    if (!targetElement) return;

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
            clear: both !important;
        ">
            <button onclick="handleTabSwitch('matches')" id="btn-tab-matches" style="
                flex: 1 !important; margin: 0 4px !important; padding: 10px 5px !important;
                background: linear-gradient(135deg, #ff4e50, #f9d423) !important;
                color: #ffffff !important; border: none !important; border-radius: 6px !important;
                font-weight: bold !important; font-size: 12px !important; cursor: pointer !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
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
        <div id="giveaway-msg-zone" style="display:none; color:#888; text-align:center; padding:20px; font-family:sans-serif; font-size:12px;">
            🎁 No Giveaway Claims active at this moment.
        </div>
    `;

    // Target element ke theek NICHE (afterend) is poore system ko chipka do
    targetElement.insertAdjacentHTML('afterend', navHTML);
    
    // Turant filter state refresh kar do
    applyLiveTabFilter();
}

// 🔄 TABS SWITCH CONTROLLER
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
    if (tabName === 'giveaway') mBtn.style.cssText = onStyle;

    applyLiveTabFilter();
}

// 🔥 SEPARATION ENGINE: Card ke background elements ko target karna
function applyLiveTabFilter() {
    const gMsg = document.getElementById('giveaway-msg-zone');
    
    // Aapke code se banne wale saare match cards ko select karna
    const allMatchCards = document.querySelectorAll('.match-card-item-box, [id^="match-card-"], #matches-tab > div');
    
    // Kuch themes me dynamic cards bina generic wrappers ke hote hain, unhe query select se handle karna
    const layoutContainers = document.querySelectorAll('div[style*="background: #111"], div[style*="background:#111"]');

    const masterCardsList = [...allMatchCards, ...layoutContainers].filter(el => {
        // Sirf wahi elements lein jo sach mein match card hain (unme 'Map:', 'Title:', ya 'PRIZE POOL' likha ho)
        const txt = el.innerText || "";
        return txt.includes("Map:") || txt.includes("Title:") || txt.includes("PRIZE POOL");
    });

    if (currentSelectedTab === 'giveaway') {
        if (gMsg) gMsg.style.display = "block";
        masterCardsList.forEach(card => card.style.setProperty('display', 'none', 'important'));
        return;
    } else {
        if (gMsg) gMsg.style.display = "none";
    }

    masterCardsList.forEach((card) => {
        const cardText = card.innerText || "";
        
        // Status Check Logic
        const isCompleted = cardText.includes("Status: Completed") || 
                            cardText.includes("Match Ended") || 
                            cardText.includes("Completed") || 
                            cardText.includes("Status: Ended");

        if (currentSelectedTab === 'matches') {
            if (isCompleted) {
                card.style.setProperty('display', 'none', 'important'); // Completed hide
            } else {
                card.style.setProperty('display', 'block', 'important'); // Active show
            }
        } else if (currentSelectedTab === 'history') {
            if (isCompleted) {
                card.style.setProperty('display', 'block', 'important'); // Completed show
            } else {
                card.style.setProperty('display', 'none', 'important'); // Active hide
            }
        }
    });
}

// 📥 RESULT FORM AUTO-INJECTOR CODE
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
                // Sahi card dhoondh kar uske andar form fit karna
                const divCards = document.querySelectorAll('div');
                divCards.forEach((card) => {
                    const txt = card.innerText || "";
                    if ((txt.includes("Map:") || txt.includes("Title:")) && txt.includes(match.title) && !card.querySelector(`.v8-form-box`)) {
                        
                        const hasSubmitted = match.submittedResults && match.submittedResults[currentUID];
                        const containerDiv = document.createElement('div');
                        containerDiv.className = 'v8-form-box';
                        containerDiv.style.cssText = "width: 100%; margin-top:10px; clear:both;";

                        if (hasSubmitted) {
                            containerDiv.innerHTML = `
                                <div style="background: #111; border: 1px solid #28a745; padding: 10px; border-radius: 6px; text-align: center;">
                                    <p style="color: #28a745; margin: 0; font-size: 11px; font-weight: bold;">✓ Result Successfully Submitted!</p>
                                </div>
                            `;
                        } else {
                            containerDiv.innerHTML = `
                                <div style="background: #161616; border: 1px solid #ff4e50; padding: 12px; border-radius: 8px; text-align: left; box-sizing: border-box;">
                                    <h4 style="color: #ff4e50; margin: 0 0 8px 0; font-size: 12px; text-align: center; font-weight: bold; text-transform:uppercase;">📤 Submit Match Result</h4>
                                    
                                    <label style="color:#777; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">App Account UID:</label>
                                    <input type="text" id="v8-app-id-${matchId}" value="${currentUID}" disabled style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#ff9f43; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px; font-weight:bold;">
                                    
                                    <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">Free Fire Game UID:</label>
                                    <input type="text" id="v8-game-id-${matchId}" placeholder="Enter Free Fire UID" style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    
                                    <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">In-Game Name (IGN):</label>
                                    <input type="text" id="v8-player-name-${matchId}" placeholder="Enter Game Nickname" style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    
                                    <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">Total Kills Done:</label>
                                    <input type="number" id="v8-kills-${matchId}" placeholder="0" style="width:100%; padding:7px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    
                                    <label style="color:#ff9f43; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">📸 Upload Screenshot (From Gallery):</label>
                                    <input type="file" id="v8-file-${matchId}" accept="image/*" style="width:100%; padding:5px; margin-bottom:4px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    <p id="v8-status-${matchId}" style="color: #ff9f43; font-size: 10px; margin: 0 0 10px 0; font-weight: bold;"></p>
                                    
                                    <button onclick="processV8Upload('${matchId}', '${currentUID}')" id="v8-btn-${matchId}" style="width:100%; padding:9px; background: linear-gradient(135deg, #28a745, #218838); color:#fff; border:none; font-weight:bold; border-radius:4px; cursor:pointer; font-size:12px; text-transform:uppercase;">Submit Form</button>
                                </div>
                            `;
                        }
                        card.appendChild(containerDiv);
                    }
                });
            }
        });
    });
}

// 📸 IMGBB IMAGE UPLOAD PRO ENGINE
function processV8Upload(matchId, currentUID) {
    const gameIdVal = document.getElementById(`v8-game-id-${matchId}`).value.trim();
    const nameVal = document.getElementById(`v8-player-name-${matchId}`).value.trim();
    const killsVal = document.getElementById(`v8-kills-${matchId}`).value;
    const fileInput = document.getElementById(`v8-file-${matchId}`);
    const statusText = document.getElementById(`v8-status-${matchId}`);
    const submitBtn = document.getElementById(`v8-btn-${matchId}`);

    if (!gameIdVal || !nameVal || !killsVal || !fileInput.files[0]) {
        alert("🚨 Sabhi fields bharein aur gallery se photo select karein!");
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
            throw new Error("ImgBB Server Connection Error!");
        }
    })
    .then(() => {
        alert("🎉 Result successfully save ho gaya!");
        location.reload();
    })
    .catch((err) => {
        alert("❌ Error: " + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Form";
        statusText.innerText = "";
    });
}

// Execution Timers Loops
setInterval(injectSmartStickyNavigation, 500);
setInterval(runLiveFormInjector, 1000);
setInterval(applyLiveTabFilter, 600);
        
