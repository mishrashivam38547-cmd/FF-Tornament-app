// ====================================================================
// 📥 PURE USER RESULT SUBMISSION & IMGBB PACKET ENGINE (V12)
// ====================================================================

const IMGBB_API_KEY = "0de43554e74e8bef68fc0f49cccf0d1f"; 

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
                const divCards = document.querySelectorAll('div');
                divCards.forEach((card) => {
                    const txt = card.innerText || "";
                    if ((txt.includes("Map:") || txt.includes("Title:")) && txt.includes(match.title) && !card.querySelector(`.v12-form-box`)) {
                        
                        const hasSubmitted = match.submittedResults && match.submittedResults[currentUID];
                        const containerDiv = document.createElement('div');
                        containerDiv.className = 'v12-form-box';
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
                                    <input type="text" id="v12-app-id-${matchId}" value="${currentUID}" disabled style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#ff9f43; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px; font-weight:bold;">
                                    
                                    <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">Free Fire Game UID:</label>
                                    <input type="text" id="v12-game-id-${matchId}" placeholder="Enter Free Fire UID" style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    
                                    <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">In-Game Name (IGN):</label>
                                    <input type="text" id="v12-player-name-${matchId}" placeholder="Enter Game Nickname" style="width:100%; padding:7px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    
                                    <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">Total Kills Done:</label>
                                    <input type="number" id="v12-kills-${matchId}" placeholder="0" style="width:100%; padding:7px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    
                                    <label style="color:#ff9f43; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">📸 Upload Screenshot (From Gallery):</label>
                                    <input type="file" id="v12-file-${matchId}" accept="image/*" style="width:100%; padding:5px; margin-bottom:4px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                    <p id="v12-status-${matchId}" style="color: #ff9f43; font-size: 10px; margin: 0 0 10px 0; font-weight: bold;"></p>
                                    
                                    <button onclick="processV12Upload('${matchId}', '${currentUID}')" id="v12-btn-${matchId}" style="width:100%; padding:9px; background: linear-gradient(135deg, #28a745, #218838); color:#fff; border:none; font-weight:bold; border-radius:4px; cursor:pointer; font-size:12px; text-transform:uppercase;">Submit Form</button>
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

// 📸 ImgBB Core Uploader
function processV12Upload(matchId, currentUID) {
    const gameIdVal = document.getElementById(`v12-game-id-${matchId}`).value.trim();
    const nameVal = document.getElementById(`v12-player-name-${matchId}`).value.trim();
    const killsVal = document.getElementById(`v12-kills-${matchId}`).value;
    const fileInput = document.getElementById(`v12-file-${matchId}`);
    const statusText = document.getElementById(`v12-status-${matchId}`);
    const submitBtn = document.getElementById(`v12-btn-${matchId}`);

    if (!gameIdVal || !nameVal || !killsVal || !fileInput.files[0]) {
        alert("🚨 Sabhi fields ko sahi se bharein!");
        return;
    }

    const file = fileInput.files[0];
    submitBtn.disabled = true;
    submitBtn.innerText = "Uploading...";
    statusText.innerText = "⏳ Uploading to ImgBB...";

    const formData = new FormData();
    formData.append("image", file);

    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            const finalUrl = result.data.url;
            const payload = {
                playerAppUID: currentUID,
                gameId: gameIdVal,
                playerName: nameVal,
                kills: parseInt(killsVal) || 0,
                screenshot: finalUrl, 
                rewardStatus: "Pending",
                submittedAt: Date.now()
            };
            return firebase.database().ref(`matches/${matchId}/submittedResults/${currentUID}`).set(payload);
        } else {
            throw new Error("Upload Failed!");
        }
    })
    .then(() => {
        alert("🎉 Result saved successfully!");
        location.reload();
    })
    .catch((err) => {
        alert("❌ Error: " + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Form";
    });
}

// Run Form Injection Loops constantly
setInterval(runLiveFormInjector, 1000);
    
