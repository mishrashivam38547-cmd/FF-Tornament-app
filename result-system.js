// =======================================================
// 🎮 PLAYER MATCH RESULT SUBMISSION SYSTEM (UPGRADED GLOBAL V3)
// =======================================================

const IMGBB_API_KEY = "0de43554e74e8bef68fc0f49cccf0d1f"; 

function startResultFormListener() {
    const checkDb = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.database && window.userSessionUID) {
            clearInterval(checkDb);

            firebase.database().ref('matches').on('value', (snapshot) => {
                const matches = snapshot.val();
                const formWrapper = document.getElementById('player-result-box-wrapper');
                if (!formWrapper || !matches) return;

                formWrapper.innerHTML = ""; // Container clear karna

                Object.keys(matches).forEach((matchId) => {
                    const match = matches[matchId];
                    
                    // CRITICAL STATUS CHECK: Match state status 'Completed' hona chahiye
                    const isMatchOver = match.status === "Completed" || match.isHistory === true;
                    const hasUserJoined = match.participants && match.participants[window.userSessionUID];

                    if (isMatchOver && hasUserJoined) {
                        const hasSubmitted = match.submittedResults && match.submittedResults[window.userSessionUID];

                        if (hasSubmitted) {
                            formWrapper.innerHTML += `
                                <div style="background: #111; border: 1px solid #28a745; padding: 12px; border-radius: 8px; text-align: center; margin-bottom: 12px; font-family: sans-serif;">
                                    <p style="color: #28a745; margin: 0; font-size: 13px; font-weight: bold;">✓ [${match.title || 'Match'}] Result Submitted Successfully!</p>
                                </div>
                            `;
                        } else {
                            // 🎨 ALL YOUR DEMANDED FIELDS ARE FIXED HERE
                            const submissionFormHTML = `
                                <div id="form-card-${matchId}" style="background: #161616; border: 1px solid #ff4e50; padding: 15px; border-radius: 10px; font-family: sans-serif; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                                    <h4 style="color: #ff4e50; margin: 0 0 12px 0; font-size: 14px; text-align: center; font-weight: bold; text-transform: uppercase;">📤 Submit Match Result</h4>
                                    <p style="color: #aaa; font-size: 11px; text-align: center; margin: -8px 0 12px 0;">Tournament: ${match.title || 'Solo Match'}</p>
                                    
                                    <label style="color:#888; font-size:11px; display:block; margin-bottom:3px;">App Account ID:</label>
                                    <input type="text" id="inp-app-id-${matchId}" value="${window.userSessionUID}" disabled style="width:100%; padding:8px; margin-bottom:10px; background:#222; color:#ff9f43; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:11px; font-weight:bold;">
                                    
                                    <label style="color:#ccc; font-size:11px; display:block; margin-bottom:3px;">Game UID:</label>
                                    <input type="text" id="inp-game-id-${matchId}" placeholder="Enter Free Fire UID" style="width:100%; padding:8px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <label style="color:#ccc; font-size:11px; display:block; margin-bottom:3px;">In-Game Name (IGN):</label>
                                    <input type="text" id="inp-player-name-${matchId}" placeholder="Enter Your Player Name" style="width:100%; padding:8px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <label style="color:#ccc; font-size:11px; display:block; margin-bottom:3px;">Total Kills Done:</label>
                                    <input type="number" id="inp-kills-${matchId}" placeholder="Enter Number of Kills" style="width:100%; padding:8px; margin-bottom:12px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <label style="color:#ff9f43; font-size:11px; display:block; margin-bottom:3px; font-weight:bold;">📸 Upload Match Screenshot:</label>
                                    <input type="file" id="inp-file-${matchId}" accept="image/*" style="width:100%; padding:6px; margin-bottom:5px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    <p id="upload-status-${matchId}" style="color: #ff9f43; font-size: 11px; margin: 0 0 14px 0; font-weight: bold;"></p>
                                    
                                    <button onclick="processImgbbResultUpload('${matchId}')" id="btn-submit-${matchId}" style="width:100%; padding:10px; background: linear-gradient(135deg, #28a745, #218838); color:#fff; border:none; font-weight:bold; border-radius:6px; cursor:pointer; font-size:13px; text-transform:uppercase;">Submit Details</button>
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

function processImgbbResultUpload(matchId) {
    const gameIdVal = document.getElementById(`inp-game-id-${matchId}`).value.trim();
    const nameVal = document.getElementById(`inp-player-name-${matchId}`).value.trim();
    const killsVal = document.getElementById(`inp-kills-${matchId}`).value;
    const fileInput = document.getElementById(`inp-file-${matchId}`);
    const statusText = document.getElementById(`upload-status-${matchId}`);
    const submitBtn = document.getElementById(`btn-submit-${matchId}`);

    if (!gameIdVal || !nameVal || !killsVal || !fileInput.files[0]) {
        alert("🚨 Kripya saari details bharein aur image file select karein!");
        return;
    }

    const file = fileInput.files[0];
    submitBtn.disabled = true;
    submitBtn.innerText = "Uploading Screenshot...";
    statusText.style.color = "#ff9f43";
    statusText.innerText = "⏳ ImgBB Server par photo upload ho rahi hai...";

    const formData = new FormData();
    formData.append("image", file);

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
                playerAppUID: window.userSessionUID,
                gameId: gameIdVal,
                playerName: nameVal,
                kills: parseInt(killsVal) || 0,
                screenshot: downloadURL, 
                submittedAt: Date.now()
            };

            return firebase.database().ref(`matches/${matchId}/submittedResults/${window.userSessionUID}`).set(payload);
        } else {
            throw new Error("ImgBB Upload Failed!");
        }
    })
    .then(() => {
        alert("🎉 Boom! Aapka result saari details aur image ke sath successfully save ho gaya hai.");
    })
    .catch((err) => {
        alert("❌ Error: " + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Details";
        statusText.style.color = "#ff4e50";
        statusText.innerText = "❌ Upload failed!";
    });
}

const initResultLoop = setInterval(() => { if (document.body) { clearInterval(initResultLoop); startResultFormListener(); } }, 300);
