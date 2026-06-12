// ====================================================================
// 👑 ADMIN RESULTS VIEW & AUTO-HIDE PRIZE SYSTEM (CLEAN PANEL V6)
// ====================================================================

function injectResultsAndPrizeSystem() {
    const allButtons = document.querySelectorAll('button');
    
    allButtons.forEach((btn) => {
        if (btn.innerText && btn.innerText.trim() === "Delete") {
            const parentElement = btn.parentElement;
            if (!parentElement) return;

            const onclickText = btn.getAttribute('onclick') || "";
            const matchKeys = onclickText.match(/'([^']+)'/) || onclickText.match(/"([^"]+)"/);
            
            if (matchKeys && matchKeys[1]) {
                const matchId = matchKeys[1];

                if (!parentElement.querySelector('.admin-view-results-btn')) {
                    const viewBtn = document.createElement('button');
                    viewBtn.className = 'admin-view-results-btn';
                    viewBtn.innerText = '👁️ View Results & Rewards';
                    viewBtn.style.cssText = "background: linear-gradient(135deg, #17a2b8, #117a8b) !important; color: #ffffff !important; border: none !important; padding: 6px 12px !important; margin-left: 6px !important; border-radius: 4px !important; font-size: 12px !important; font-weight: bold !important; cursor: pointer !important; display: inline-block !important; margin-top: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);";
                    
                    viewBtn.onclick = function() {
                        toggleMatchResultsPanel(matchId, parentElement);
                    };
                    parentElement.appendChild(viewBtn);
                }
            }
        }
    });
}

function toggleMatchResultsPanel(matchId, containerElement) {
    const existingList = containerElement.querySelector(`.results-holder-${matchId}`);
    if (existingList) {
        existingList.remove();
        return;
    }

    const resultsDiv = document.createElement('div');
    resultsDiv.className = `results-holder-${matchId}`;
    resultsDiv.style.cssText = "background: #161616; border: 1px solid #17a2b8; padding: 12px; margin-top: 12px; border-radius: 8px; text-align: left; color: #fff; font-family: sans-serif; font-size: 12px; width: 100%; box-sizing: border-box; clear: both; box-shadow: 0 4px 8px rgba(0,0,0,0.5);";
    resultsDiv.innerHTML = "⏳ Player results dhoondhe ja rahe hain...";
    containerElement.appendChild(resultsDiv);

    // .on('value', ...) lagane se jab bhi prize send hoga, list automatic refresh ho jayegi!
    firebase.database().ref(`matches/${matchId}/submittedResults`).on('value', (snapshot) => {
        const results = snapshot.val();
        
        if (!results) {
            resultsDiv.innerHTML = "<p style='color: #ffc107; margin:0; text-align:center; font-weight:bold;'>❌ Is match me abhi tak kisi player ne result submit nahi kiya hai.</p>";
            return;
        }

        // Check karenge ki kya koi pending player bacha hai jise reward nahi mila
        let hasPendingPlayers = false;

        let blockHTML = `
            <h5 style="color: #17a2b8; margin: 0 0 10px 0; text-transform: uppercase; font-size: 12px; font-weight: bold; text-align:center;">📊 SUBMITTED RESULTS (PENDING REWARDS)</h5>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; min-width: 450px; text-align: left;">
                    <thead>
                        <tr style="background: #222; color: #fff; font-size: 11px; border-bottom: 2px solid #333;">
                            <th style="padding: 8px; border: 1px solid #333;">Player (IGN)</th>
                            <th style="padding: 8px; border: 1px solid #333;">Game UID</th>
                            <th style="padding: 8px; border: 1px solid #333;">Kills</th>
                            <th style="padding: 8px; border: 1px solid #333;">Proof</th>
                            <th style="padding: 8px; border: 1px solid #333; text-align:center;">Send Prize (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        Object.keys(results).forEach((playerUID) => {
            const data = results[playerUID];
            const targetUID = data.playerAppUID || playerUID;

            // 🔥 AUTO-HIDE FILTER: Agar reward already send ho chuka hai, toh is player ko skip (hide) kar do
            if (data.rewardStatus === "Rewarded") {
                return; 
            }

            // Agar control yahan tak aaya hai, matlab kam se kam ek player pending hai
            hasPendingPlayers = true;

            blockHTML += `
                <tr id="row-${matchId}-${targetUID}" style="border-bottom: 1px solid #252525; font-size: 11px; background: #1a1a1a;">
                    <td style="padding: 8px; color: #ff9f43; font-weight: bold;">${data.playerName || 'N/A'}<br><span style="color:#666; font-size:9px;">App ID: ${targetUID}</span></td>
                    <td style="padding: 8px; color: #fff;">${data.gameId || 'N/A'}</td>
                    <td style="padding: 8px; color: #28a745; font-weight: bold; font-size: 12px;">${data.kills ?? 0}</td>
                    <td style="padding: 8px;">
                        <a href="${data.screenshot}" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold; background: #222; padding: 4px 8px; border-radius: 4px; border: 1px solid #333;">👁️ View SS</a>
                    </td>
                    <td style="padding: 8px; text-align: center; white-space: nowrap;">
                        <input type="number" id="prize-amount-${matchId}-${targetUID}" placeholder="Amount" style="width: 60px; padding: 4px; background: #111; color: #fff; border: 1px solid #444; border-radius: 4px; font-size: 11px; margin-right: 4px;">
                        <button onclick="distributePlayerPrize('${targetUID}', '${matchId}')" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 10px; cursor: pointer;">🎁 Send</button>
                    </td>
                </tr>
            `;
        });

        blockHTML += `
                    </tbody>
                </table>
            </div>
        `;

        // Agar saare players ko reward mil chuka hai aur koi pending nahi hai
        if (!hasPendingPlayers) {
            resultsDiv.innerHTML = "<p style='color: #28a745; margin:0; text-align:center; font-weight:bold;'>🎉 Sabhi players ko prize mil chuka hai! List ekdam saaf hai.</p>";
        } else {
            resultsDiv.innerHTML = blockHTML;
        }
    });
}

// 🎁 MULTI-PATH BALANCE TRANSACTION & STATUS SETTER
function distributePlayerPrize(playerUID, matchId) {
    const prizeInput = document.getElementById(`prize-amount-${matchId}-${playerUID}`);
    if (!prizeInput) return;

    const prizeAmount = parseInt(prizeInput.value);

    if (!prizeAmount || prizeAmount <= 0) {
        alert("🚨 Please ek sahi amount enter karein!");
        return;
    }

    const confirmPrize = confirm(`Kya aap sach mein is player ko ₹${prizeAmount} ka prize send karna chahte hain?\n\nSend karte hi yeh player is list se automatic hat jayega.`);
    if (!confirmPrize) return;

    const userRef = firebase.database().ref(`users/${playerUID}`);
    const matchResultRef = firebase.database().ref(`matches/${matchId}/submittedResults/${playerUID}`);

    // Step 1: User ka balance badhana saare paths par
    userRef.once('value').then((snapshot) => {
        const userData = snapshot.val() || {};
        
        let currentWallet = parseInt(userData.wallet) || 0;
        let currentBalance = parseInt(userData.balance) || 0;
        let currentCoins = parseInt(userData.coins) || 0;

        return userRef.update({
            wallet: currentWallet + prizeAmount,
            balance: currentBalance + prizeAmount,
            coins: currentCoins + prizeAmount
        });
    })
    .then(() => {
        // Step 2: Match database mein rewardStatus ko "Rewarded" mark karna taaki ye hide ho sake
        return matchResultRef.update({
            rewardStatus: "Rewarded",
            prizeGiven: prizeAmount,
            rewardedAt: Date.now()
        });
    })
    .then(() => {
        alert(`🎉 Success! Player ko ₹${prizeAmount} bhej diya gaya hai aur uska naam list se saaf ho gaya hai.`);
    })
    .catch((error) => {
        alert("❌ Error: " + error.message);
    });
}

// Loop scan initialization
setInterval(injectResultsAndPrizeSystem, 800);
