// =======================================================
// 🎮 PLAYER MATCH RESULT SUBMISSION SYSTEM (ULTIMATE INJECTOR V5)
// =======================================================

const IMGBB_API_KEY = "0de43554e74e8bef68fc0f49cccf0d1f"; 

function startResultFormListener() {
    const checkDb = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.database && (window.userSessionUID || firebase.auth().currentUser)) {
            clearInterval(checkDb);

            const currentUID = window.userSessionUID || firebase.auth().currentUser.uid;

            firebase.database().ref('matches').on('value', (snapshot) => {
                const matches = snapshot.val();
                if (!matches) return;

                Object.keys(matches).forEach((matchId) => {
                    const match = matches[matchId];
                    
                    // RULE: Match Status 'Completed' hona chahiye aur user ka Joined hona zaroori hai
                    const isMatchOver = match.status === "Completed" || match.isHistory === true;
                    const hasUserJoined = match.participants && match.participants[currentUID];

                    if (isMatchOver && hasUserJoined) {
                        
                        // Page par us specific match ka dynamic card dhoondhna (Jahan Match Card render hota hai)
                        // Hum page par bani match ID ke elements ko scan karte hain
                        const allCards = document.querySelectorAll('*');
                        let targetMatchCard = null;

                        for (let i = 0; i < allCards.length; i++) {
                            const el = allCards[i];
                            // Agar element ke andar match title ya match ID ka code maujood hai
                            if (el.innerText && el.innerText.includes(match.title) && 
                                (el.className.includes('card') || el.id.includes(matchId) || el.className.includes('match'))) {
                                targetMatchCard = el;
                                break;
                            }
                        }

                        // Agar card mil gaya toh uske andar hum form inject karenge
                        if (targetMatchCard) {
                            
                            // Purana "Already Joined" ya status display text hata dena taaki space bane
                            const statusBadge = targetMatchCard.querySelector('.status') || targetMatchCard.querySelector('p[style*="color: green"]');
                            if (statusBadge && !targetMatchCard.querySelector('.admin-result-patch-done')) {
                                statusBadge.style.display = 'none'; // 'Already Joined' text ko hide karna
                            }

                            // Duplicate check: Agar form pehle se lag chuka hai toh skip karein
                            if (targetMatchCard.querySelector(`#form-card-${matchId}`)) return;

                            const hasSubmitted = match.submittedResults && match.submittedResults[currentUID];
                            let injectHTML = "";

                            if (hasSubmitted) {
                                injectHTML = `
                                    <div class="admin-result-patch-done" style="background: #111; border: 1px solid #28a745; padding: 10px; border-radius: 6px; text-align: center; margin-top: 10px;">
                                        <p style="color: #28a745; margin: 0; font-size: 12px; font-weight: bold;">✓ Result Successfully Submitted via ImgBB!</p>
                                    </div>
                                `;
                            } else {
                                // 🔥 BOOM! ALL 5 OPTIONS PACKED INSIDE THE CARD DESIGN
                                injectHTML = `
                                    <div id="form-card-${matchId}" style="background: #1a1a1a; border: 1px solid #ff4e50; padding: 12px; border-radius: 8px; font-family: sans-serif; margin-top: 12px; text-align: left; box-shadow: 0 4px 8px rgba(0,0,0,0.4);">
                                        <h5 style="color: #ff4e50; margin: 0 0 8px 0; font-size: 13px; text-align: center; font-weight: bold; text-transform: uppercase;">📤 Submit Match Result</h5>
                                        
                                        <label style="color:#888; font-size:10px; display:block; margin-bottom:2px;">App Account ID (UID):</label>
                                        <input type="text" id="inp-app-id-${matchId}" value="${currentUID}" disabled style="width:100%; padding:6px; margin-bottom:8px; background:#222; color:#ff9f43; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px; font-weight:bold;">
                                        
                                        <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px;">Free Fire Game UID:</label>
                                        <input type="text" id="inp-game-id-${matchId}" placeholder="Enter Free Fire UID" style="width:100%; padding:6px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                        
                                        <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px;">In-Game Name (IGN):</label>
                                        <input type="text" id="inp-player-name-${matchId}" placeholder="Enter Your Game Name" style="width:100%; padding:6px; margin-bottom:8px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                        
                                        <label style="color:#ccc; font-size:10px; display:block; margin-bottom:2px;">Total Kills Done:</label>
                                        <input type="number" id="inp-kills-${matchId}" placeholder="Enter Total Kills" style="width:100%; padding:6px; margin-bottom:10px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                        
                                        <label style="color:#ff9f43; font-size:10px; display:block; margin-bottom:2px; font-weight:bold;">📸 Upload Screenshot (From Gallery):</label>
                                        <input type="file" id="inp-file-${matchId}" accept="image/*" style="width:100%; padding:5px; margin-bottom:4px; background:#222; color:#fff; border:1px solid #333; border-radius:4px; box-sizing:border-box; font-size:11px;">
                                        <p id="upload-status-${matchId}" style="color: #ff9f43; font-size: 10px; margin: 0 0 10px 0; font-weight: bold;"></p>
                                        
                                        <button onclick="processImgbbResultUploadV5('${matchId}', '${currentUID}')" id="btn-submit-${matchId}" style="width:100%; padding:8px; background: linear-gradient(135deg, #28a745, #218838); color:#fff; border:none; font-weight:bold; border-radius:5px; cursor:pointer; font-size:11px; text-transform:uppercase;">Submit Result</button>
                                    </div>
                                `;
                            }
                            
                            // Match card ke end mein form ko jodh dena
                            targetMatchCard.insertAdjacentHTML('beforeend', injectHTML);
                        }
                    }
                });
            });
        }
    }, 600);
}

function processImgbbResultUploadV5(matchId, currentUID) {
    const gameIdVal = document.getElementById(`inp-game-id-${matchId}`).value.trim();
    const nameVal = document.getElementById(`inp-player-name-${matchId}`).value.trim();
    const killsVal = document.getElementById(`inp-kills-${matchId}`).value;
    const fileInput = document.getElementById(`inp-file-${matchId}`);
    const statusText = document.getElementById(`upload-status-${matchId}`);
    const submitBtn = document.getElementById(`btn-submit-${matchId}`);

    if (!gameIdVal || !nameVal || !killsVal || !fileInput.files[0]) {
        alert("🚨 Kripya saari fields bharein aur file zaroor select kijiye!");
        return;
    }

    const file = fileInput.files[0];
    submitBtn.disabled = true;
    submitBtn.innerText = "Uploading...";
    statusText.style.color = "#ff9f43";
    statusText.innerText = "⏳ ImgBB server par screenshot save ho raha hai...";

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
            statusText.innerText = "📸 Image sync done! Final saving...";

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
            throw new Error("ImgBB Upload Crash!");
        }
    })
    .then(() => {
        alert("🎉 Excellent! Aapka result aur direct file cloud par save ho gaya hai.");
    })
    .catch((err) => {
        alert("❌ Error: " + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Result";
        statusText.style.color = "#ff4e50";
        statusText.innerText = "❌ Failed!";
    });
}

// RUN THE AUTO DETECTION WATCHER
setInterval(() => { startResultFormListener(); }, 1000);
