// =================================================================
// 📌 STICKY NAVIGATION, DYNAMIC MATCH FILTER & UPGRADED RESULT SYSTEM
// =================================================================

// 🔑 ImgBB Key for Gallery Uploads
const IMGBB_API_KEY = "0de43554e74e8bef68fc0f49cccf0d1f"; 
let currentSelectedTab = 'matches'; // Default active tab state
let globalMatchesSnapshot = null;   // Live memory storage for matches

function setupStickyNavigation() {
    // Agar navigation bar pehle se bana hai toh dobara na banayein
    if (document.getElementById('fixed-tab-nav-bar')) return;

    // Aapke main layout ka target container dhoondhna
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
            
            <div id="dynamic-matches-render-zone" style="width: 100%; box-sizing: border-box;"></div>
        `;

        targetContainer.insertAdjacentHTML('beforebegin', navHTML);
        
        // Live Firebase sync system controller trigger
        startLiveMatchesController();
    }
}

// 🔄 TABS SWITCH & DISPLAY FILTRATION ENGINE
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

    // Instant Render UI on tab changing click
    buildDynamicMatchesLayout();
}

// 🎯 REALTIME DATABASE BRIDGE
function startLiveMatchesController() {
    const checkDb = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.database) {
            clearInterval(checkDb);

            firebase.database().ref('matches').on('value', (snapshot) => {
                globalMatchesSnapshot = snapshot.val();
                buildDynamicMatchesLayout();
            });
        }
    }, 500);
}

// 🎮 CARD BUILDER & REALTIME FILTER DISPLAYER
function buildDynamicMatchesLayout() {
    const renderZone = document.getElementById('dynamic-matches-render-zone');
    if (!renderZone) return;

    renderZone.innerHTML = ""; // Purana UI clear
    
    if (currentSelectedTab === 'giveaway') {
        renderZone.innerHTML = `<div style="color:#888; text-align:center; padding:30px; font-family:sans-serif; font-size:13px;">🎁 No Giveaway Claims active at this moment.</div>`;
        return;
    }

    if (!globalMatchesSnapshot) {
        renderZone.innerHTML = `<div style="color:#aaa; text-align:center; padding:30px; font-family:sans-serif; font-size:13px;">⏳ Loading Tournaments...</div>`;
        return;
    }

    const currentUID = window.userSessionUID || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : "GUEST_PLAYER");
    let visibleCardsCount = 0;

    Object.keys(globalMatchesSnapshot).forEach((matchId) => {
        const match = globalMatchesSnapshot[matchId];
        
        // Core Logic Conditions
        const isMatchOver = match.status === "Completed" || match.isHistory === true;
        const hasUserJoined = match.participants && match.participants[currentUID];

        // 🔥 SHIFTING FILTER: Kis tab pe kaun sa card dikhana hai
        if (currentSelectedTab === 'matches' && isMatchOver) return; // Completed matches ko Active tab se gayab karo
        if (currentSelectedTab === 'history' && !isMatchOver) return; // Active matches ko History tab se door rakho

        visibleCardsCount++;

        // Status Button Builder logic
        let actionButtonHTML = "";
        if (isMatchOver) {
            actionButtonHTML = `<button style="width:100%; padding:10px; background:#222; color:#777; border:1px solid #333; font-weight:bold; border-radius:6px; cursor:not-allowed; font-size:12px; text-transform:uppercase;">Match Ended</button>`;
        } else if (hasUserJoined) {
            actionButtonHTML = `<button style="width:100%; padding:10px; background:#28a745; color:#fff; border:none; font-weight:bold; border-radius:6px; cursor:not-allowed; font-size:12px; text-transform:uppercase;">✓ Already Joined</button>`;
        } else {
            actionButtonHTML = `<button style="width:100%; padding:10px; background:linear-gradient(135deg, #ff4e50, #f9d423); color:#fff; border:none; font-weight:bold; border-radius:6px; font-size:12px; text-transform:uppercase;">Join Tournament</button>`;
        }

        // Result Submission Box UI logic (card ke andar hi niche attach hoga)
        let resultFormContainerHTML = "";
        if (isMatchOver && hasUserJoined) {
            const hasSubmitted = match.submittedResults && match.submittedResults[currentUID];

            if (hasSubmitted) {
                resultFormContainerHTML = `
                    <div style="background: #111; border: 1px solid #28a745; padding: 10px; border-radius: 6px; text-align: center; margin-top: 12px;">
                        <p style="color: #28a745; margin: 0; font-size: 11px; font-weight: bold;">✓ Result Successfully Submitted! Verification is in process.</p>
                    </div>
                `;
            } else {
                // 🔥 THE EXCLUSIVE 5 OPTIONS DYNAMIC INPUT FORM
                resultFormContainerHTML = `
                    <div id="form-card-${matchId}" style="background: #161616; border: 1px solid #ff4e50; padding: 12px; border-radius: 8px; margin-top: 12px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                        <h4 style="color: #ff4e50; margin: 0 0 8px 0; font-size: 12px; text-align: center; font-weight: bold; text-transform:uppercase;">📤 Submit Match Analytics</h4>
                        
                        <label style="color:#777; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">App Account UID:</label>
                        <input type="text" id="inp-app-id-${matchId}" value="${currentUID}" disabled style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#ff9f43; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px; font-weight:bold;">
                        
                        <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">Free Fire Game UID:</label>
                        <input type="text" id="inp-game-id-${matchId}" placeholder="e.g. 547281930" style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                        
                        <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">In-Game Name (IGN):</label>
                        <input type="text" id="inp-player-name-${matchId}" placeholder="Enter Your FF Nickname" style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                        
                        <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">Total Kills Done:</label>
                        <input type="number" id="inp-kills-${matchId}" placeholder="0" style="width:100%; padding:7px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                        
                        <label style="color:#ff9f43; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">📸 Select Match Screenshot from Gallery:</label>
                        <input type="file" id="inp-file-${matchId}" accept="image/*" style="width:100%; padding:5px; margin-bottom:4px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                        <p id="upload-status-${matchId}" style="color: #ff9f43; font-size: 10px; margin: 0 0 10px 0; font-weight: bold;"></p>
                        
                        <button onclick="processResultUploadV6('${matchId}', '${currentUID}')" id="btn-submit-${matchId}" style="width:100%; padding:9px; background: linear-gradient(135deg, #28a745, #218838); color:#fff; border:none; font-weight:bold; border-radius:4px; cursor:pointer; font-size:12px; text-transform:uppercase;">Upload & Save Details</button>
                    </div>
                `;
            }
        }

        // Master Card Injection Setup
        const matchCardHTML = `
            <div class="match-card-item-box" style="background: #111111; border: 1px solid #222222; padding: 15px; border-radius: 10px; font-family: sans-serif; margin: 0 auto 15px auto; width: 95%; max-width: 400px; box-sizing: border-box; color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="color:#f9d423; font-size:11px; font-weight:bold; background:#1a1a1a; padding:3px 8px; border-radius:20px; border:1px solid #333;">🗺️ ${match.map || 'Bermuda'}</span>
                    <span style="color:#aaa; font-size:11px;">🕒 ${match.time || '00:00 AM'}</span>
                </div>
                <h3 style="margin: 5px 0 12px 0; font-size: 16px; font-weight: bold; color: #fff;">Title: ${match.title || 'Free Fire Tournament'}</h3>
                
                <div style="display: flex; justify-content: space-between; background: #161616; padding: 8px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #222;">
                    <div style="text-align: center; flex: 1;"><span style="font-size: 9px; color: #666; display: block; font-weight:bold;">TOTAL PRIZE</span><b style="color: #28a745; font-size: 13px;">₹${match.prizePool || '0'}</b></div>
                    <div style="text-align: center; flex: 1; border-left: 1px solid #222;"><span style="font-size: 9px; color: #666; display: block; font-weight:bold;">PER KILL</span><b style="color: #ff9f43; font-size: 13px;">₹${match.perKill || '0'}</b></div>
                    <div style="text-align: center; flex: 1; border-left: 1px solid #222;"><span style="font-size: 9px; color: #666; display: block; font-weight:bold;">ENTRY FEE</span><b style="color: #f9d423; font-size: 13px;">FREE</b></div>
                </div>

                ${actionButtonHTML}
                ${resultFormContainerHTML}
            </div>
        `;
        renderZone.innerHTML += matchCardHTML;
    });

    if (visibleCardsCount === 0) {
        renderZone.innerHTML = `<div style="color:#666; text-align:center; padding:40px; font-family:sans-serif; font-size:12px;">📭 Is section mein abhi koi match available nahi hai!</div>`;
    }
}

// 🚀 REALTIME STORAGE IMAGE PIPELINE FOR IMGBB V6
function processResultUploadV6(matchId, currentUID) {
    const gameIdVal = document.getElementById(`inp-game-id-${matchId}`).value.trim();
    const nameVal = document.getElementById(`inp-player-name-${matchId}`).value.trim();
    const killsVal = document.getElementById(`inp-kills-${matchId}`).value;
    const fileInput = document.getElementById(`inp-file-${matchId}`);
    const statusText = document.getElementById(`upload-status-${matchId}`);
    const submitBtn = document.getElementById(`btn-submit-${matchId}`);

    if (!gameIdVal || !nameVal || !killsVal || !fileInput.files[0]) {
        alert("🚨 Kripya saari fields dhyan se bharein aur image file choose karein!");
        return;
    }

    const file = fileInput.files[0];
    submitBtn.disabled = true;
    submitBtn.innerText = "Processing Image...";
    statusText.style.color = "#ff9f43";
    statusText.innerText = "⏳ Photo server par bheji ja rahi hai...";

    const formData = new FormData();
    formData.append("image", file);

    // Call ImgBB API Async Pipeline
    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const uploadedImgURL = result.data.url;
            statusText.style.color = "#28a745";
            statusText.innerText = "📸 Proof verified! Syncing data bundle...";

            const finalPayload = {
                playerAppUID: currentUID,
                gameId: gameIdVal,
                playerName: nameVal,
                kills: parseInt(killsVal) || 0,
                screenshot: uploadedImgURL, 
                rewardStatus: "Pending", // For admin dashboard validation matching
                submittedAt: Date.now()
            };

            return firebase.database().ref(`matches/${matchId}/submittedResults/${currentUID}`).set(finalPayload);
        } else {
            throw new Error("ImgBB Node Server Refused Connection!");
        }
    })
    .then(() => {
        alert("🎉 Boom! Aapka result full details aur screenshot ke sath successfully save ho gaya.");
    })
    .catch((err) => {
        alert("❌ Error: " + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = "Upload & Save Details";
        statusText.style.color = "#ff4e50";
        statusText.innerText = "❌ Upload Fail!";
    });
}

// AUTO INITIALIZE KICKSTART RUNNER
const initNavLoop = setInterval(() => {
    if (document.body) {
        clearInterval(initNavLoop);
        setupStickyNavigation();
    }
}, 300);
                                                 
