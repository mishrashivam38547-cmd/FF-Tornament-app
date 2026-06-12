// =================================================================
// 📌 STICKY NAVIGATION, FIXED BUTTONS & AUTOMATIC RESULT SYSTEM (V5 PRO)
// =================================================================

// 🔑 Aapki ImgBB API Key yahan safe config ho gayi hai
const IMGBB_API_KEY = "0de43554e74e8bef68fc0f49cccf0d1f"; 

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
        if (typeof firebase !== 'undefined' && firebase.database && (window.userSessionUID || firebase.auth().currentUser)) {
            clearInterval(checkDb);

            const currentUID = window.userSessionUID || firebase.auth().currentUser.uid;

            firebase.database().ref('matches').on('value', (snapshot) => {
                const matches = snapshot.val();
                const formWrapper = document.getElementById('player-result-box-wrapper');
                if (!formWrapper || !matches) return;

                formWrapper.innerHTML = ""; // Purane boxes clear karein

                Object.keys(matches).forEach((matchId) => {
                    const match = matches[matchId];
                    
                    // Rule 1: Match admin se 'Completed' mark hona chahiye
                    const isMatchOver = match.status === "Completed" || match.isHistory === true;
                    // Rule 2: Player list me user registered hona chahiye
                    const hasUserJoined = match.participants && match.participants[currentUID];

                    if (isMatchOver && hasUserJoined) {
                        const hasSubmitted = match.submittedResults && match.submittedResults[currentUID];

                        if (hasSubmitted) {
                            formWrapper.innerHTML += `
                                <div style="background: #111; border: 1px solid #28a745; padding: 12px; border-radius: 8px; text-align: center; margin-bottom: 12px; font-family: sans-serif;">
                                    <p style="color: #28a745; margin: 0; font-size: 13px; font-weight: bold;">✓ [${match.title || 'FF Match'}] Result Successfully Submitted via ImgBB!</p>
                                </div>
                            `;
                        } else {
                            // 🔥 BOOM! ALL NEW 5 OPTIONS ADDED PERFECTLY HERE
                            const submissionFormHTML = `
                                <div id="form-card-${matchId}" style="background: #161616; border: 1px solid #ff4e50; padding: 16px; border-radius: 10px; font-family: sans-serif; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); text-align: left;">
                                    <h4 style="color: #ff4e50; margin: 0 0 4px 0; font-size: 14px; text-align: center; font-weight: bold; text-transform: uppercase;">📤 Submit Match Result</h4>
                                    <p style="color: #aaa; font-size: 11px; text-align: center; margin: 0 0 12px 0;">Tournament: ${match.title || 'Solo Match'}</p>
                                    
                                    <label style="color:#888; font-size:11px; display:block; margin-bottom:3px; font-weight: bold;">App Account ID:</label>
                                    <input type="text" id="inp-app-id-${matchId}" value="${currentUID}" disabled style="width:100%; padding:8px; margin-bottom:10px; background:#222; color:#ff9f43; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px; font-weight:bold;">
                                    
                                    <label style="color:#ccc; font-size:11px; display:block; margin-bottom:3px; font-weight: bold;">Free Fire Game UID:</label>
                                    <input type="text" id="inp-game-id-${matchId}" placeholder="Enter Free Fire UID" style="width:100%; padding:8px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <label style="color:#ccc; font-size:11px; display:block; margin-bottom:3px; font-weight: bold;">In-Game Name (IGN):</label>
                                    <input type="text" id="inp-player-name-${matchId}" placeholder="Enter Your Game Name" style="width:100%; padding:8px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <label style="color:#ccc; font-size:11px; display:block; margin-bottom:3px; font-weight: bold;">Total Kills:</label>
                                    <input type="number" id="inp-kills-${matchId}" placeholder="Enter Total Kills" style="width:100%; padding:8px; margin-bottom:12px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <label style="color:#ff9f43; font-size:11px; display:block; margin-bottom:3px; font-weight:bold;">📸 Upload Screenshot (Select from Gallery):</label>
                                    <input type="file" id="inp-file-${matchId}" accept="image/*" style="width:100%; padding:7px; margin-bottom:4px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    <p id="upload-status-${matchId}" style="color: #ff9f43; font-size: 11px; margin: 0 0 12px 0; font-weight: bold;"></p>
                                    
                                    <button onclick="processResultUploadV5('${matchId}', '${currentUID}')" id="btn-submit-${matchId}" style="width:100%; padding:10px; background: linear-gradient(135deg, #28a745, #218838); color:#fff; border:none; font-weight:bold; border-radius:6px; cursor:pointer; font-size:13px; text-transform:uppercase;">Submit Details</button>
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

// 🚀 DIRECT IMGBB IMAGE UPLOAD ENGINE
function processResultUploadV5(matchId, currentUID) {
    const gameIdVal = document.getElementById(`inp-game-id-${matchId}`).value.trim();
    const nameVal = document.getElementById(`inp-player-name-${matchId}`).value.trim();
    const killsVal = document.getElementById(`inp-kills-${matchId}`).value;
    const fileInput = document.getElementById(`inp-file-${matchId}`);
    const statusText = document.getElementById(`upload-status-${matchId}`);
    const submitBtn = document.getElementById(`btn-submit-${matchId}`);

    if (!gameIdVal || !nameVal || !killsVal || !fileInput.files[0]) {
        alert("🚨 Kripya saari fields bharein aur image file select karein!");
        return;
    }

    const file = fileInput.files[0];
    submitBtn.disabled = true;
    submitBtn.innerText = "Uploading Screenshot...";
    statusText.style.color = "#ff9f43";
    statusText.innerText = "⏳ ImgBB Server par photo upload ho rahi hai...";

    const formData = new FormData();
    formData.append("image", file);

    // Dynamic ImgBB Call
    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const downloadURL = result.data.url;
            statusText.style.color = "#28a745";
            statusText.innerText = "📸 Image uploaded! Saving data packet...";

            const payload = {
                playerAppUID: currentUID,
                gameId: gameIdVal,
                playerName: nameVal,
                kills: parseInt(killsVal) || 0,
                screenshot: downloadURL, 
                submittedAt: Date.now()
            };

            return firebase.database().ref(`matches/${matchId}/submittedResults/${currentUID}`).set(payload);
        } else {
            throw new Error("ImgBB Connection Timeout!");
        }
    })
    .then(() => {
        alert("🎉 Boom! Aapka result saari details aur screenshot ke sath successfully save ho gaya hai.");
    })
    .catch((err) => {
        alert("❌ Error: " + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Details";
        statusText.style.color = "#ff4e50";
        statusText.innerText = "❌ Upload failed!";
    });
}

// AUTO INITIALIZE START
const initNavLoop = setInterval(() => {
    if (document.body) {
        clearInterval(initNavLoop);
        setupStickyNavigation();
    }
}, 300);
