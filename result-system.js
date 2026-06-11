// =======================================================
// 🎮 PLAYER MATCH RESULT SUBMISSION SYSTEM (IMGBB DOCK SYSTEM)
// =======================================================

// 🔑 Aapki ImgBB API Key yahan safe set ho gayi hai
const IMGBB_API_KEY = "0de43554e74e8bef68fc0f49cccf0d1f"; 

function startResultFormListener() {
    const checkDb = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.database && window.userSessionUID) {
            clearInterval(checkDb);

            firebase.database().ref('matches').on('value', (snapshot) => {
                const matches = snapshot.val();
                const formWrapper = document.getElementById('player-result-box-wrapper');
                if (!formWrapper || !matches) return;

                formWrapper.innerHTML = ""; 

                Object.keys(matches).forEach((matchId) => {
                    const match = matches[matchId];
                    
                    const isMatchOver = match.status === "Completed" || match.isHistory === true;
                    const hasUserJoined = match.participants && match.participants[window.userSessionUID];

                    if (isMatchOver && hasUserJoined) {
                        const hasSubmitted = match.submittedResults && match.submittedResults[window.userSessionUID];

                        if (hasSubmitted) {
                            formWrapper.innerHTML += `
                                <div style="background: #111; border: 1px solid #28a745; padding: 12px; border-radius: 8px; text-align: center; margin-bottom: 12px;">
                                    <p style="color: #28a745; margin: 0; font-size: 12px; font-weight: bold;">✓ [${match.title || 'FF Match'}] Result Successfully Submitted via ImgBB!</p>
                                </div>
                            `;
                        } else {
                            const submissionFormHTML = `
                                <div id="form-card-${matchId}" style="background: #161616; border: 1px solid #ff4e50; padding: 15px; border-radius: 10px; font-family: 'Roboto', sans-serif; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                                    <h4 style="color: #ff4e50; margin: 0 0 12px 0; font-size: 14px; text-align: center; font-weight: bold; text-transform: uppercase;">📤 Submit Match Result</h4>
                                    <p style="color: #888; font-size: 11px; text-align: center; margin: -8px 0 12px 0;">Tournament Match: ${match.title || 'Free Fire'}</p>
                                    
                                    <label style="color:#aaa; font-size:11px; display:block; margin-bottom:3px;">Your App Account ID:</label>
                                    <input type="text" id="inp-app-id-${matchId}" value="${window.userSessionUID}" disabled style="width:100%; padding:8px; margin-bottom:10px; background:#222; color:#ff9f43; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px; font-weight:bold;">
                                    
                                    <input type="text" id="inp-game-id-${matchId}" placeholder="Enter Free Fire UID" style="width:100%; padding:8px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <input type="text" id="inp-player-name-${matchId}" placeholder="Enter Your In-Game Name (IGN)" style="width:100%; padding:8px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <input type="number" id="inp-kills-${matchId}" placeholder="Enter Total Kills" style="width:100%; padding:8px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    
                                    <label style="color:#aaa; font-size:11px; display:block; margin-bottom:3px;">Upload Screenshot (Direct File Select):</label>
                                    <input type="file" id="inp-file-${matchId}" accept="image/*" style="width:100%; padding:6px; margin-bottom:5px; background:#222; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box; font-size:12px;">
                                    <p id="upload-status-${matchId}" style="color: #ff9f43; font-size: 11px; margin: 0 0 14px 0; font-weight: bold;"></p>
                                    
                                    <button onclick="processImgbbResultUpload('${matchId}')" id="btn-submit-${matchId}" style="width:100%; padding:10px; background: linear-gradient(135deg, #28a745, #218838); color:#fff; border:none; font-weight:bold; border-radius:6px; cursor:pointer; font-size:13px;">Submit Details</button>
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

// 🚀 IMGBB BACKEND ENGINE WITH YOUR UNIQUE API KEY
function processImgbbResultUpload(matchId) {
    const gameIdVal = document.getElementById(`inp-game-id-${matchId}`).value.trim();
    const nameVal = document.getElementById(`inp-player-name-${matchId}`).value.trim();
    const killsVal = document.getElementById(`inp-kills-${matchId}`).value;
    const fileInput = document.getElementById(`inp-file-${matchId}`);
    const statusText = document.getElementById(`upload-status-${matchId}`);
    const submitBtn = document.getElementById(`btn-submit-${matchId}`);

    if (!gameIdVal || !nameVal || !killsVal || !fileInput.files[0]) {
        alert("🚨 Kripya saari fields bharein aur screenshot image select karein!");
        return;
    }

    const file = fileInput.files[0];
    
    // UI Loader State Active
    submitBtn.disabled = true;
    submitBtn.innerText = "Uploading to ImgBB...";
    statusText.style.color = "#ff9f43";
    statusText.innerText = "⏳ Uploading screenshot to ImgBB server...";

    const formData = new FormData();
    formData.append("image", file);

    // Dynamic fetch requesting with your key
    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const downloadURL = result.data.url; // Dynamic image cloud link generated!
            
            statusText.style.color = "#28a745";
            statusText.innerText = "📸 Image uploaded successfully! Saving to database...";

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
            throw new Error(result.error ? result.error.message : "ImgBB upload crash!");
        }
    })
    .then(() => {
        alert("🎉 Boom! Aapka result aur screenshot direct ImgBB ke through successfully save ho gaya hai.");
    })
    .catch((err) => {
        console.error(err);
        alert("❌ Error: " + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Details";
        statusText.style.color = "#ff4e50";
        statusText.innerText = "❌ Upload failed!";
    });
}

// AUTOMATIC SYNC LOOP
const initResultLoop = setInterval(() => {
    if (document.body) {
        clearInterval(initResultLoop);
        startResultFormListener();
    }
}, 300);
