// =======================================================
// 👑 ADMIN MATCH COMPLETION SYSTEM (FIREBASE REALTIME HOOK)
// =======================================================

function listenAndInjectAdminButtons() {
    const checkFirebase = setInterval(() => {
        // Safe check ki firebase loaded hai ya nahi
        if (typeof firebase !== 'undefined' && firebase.database) {
            clearInterval(checkFirebase);

            // Firebase ke matches node ko direct listen karna
            firebase.database().ref('matches').on('value', (snapshot) => {
                const matches = snapshot.val();
                if (!matches) return;

                // Page par jitne bhi buttons pehle se bane hain unhe temporary list karna taaki duplicate na ho
                Object.keys(matches).forEach((matchId) => {
                    const match = matches[matchId];
                    
                    // Agar match pehle se completed hai toh button ki zaroorat nahi hai
                    if (match.status === "Completed") return;

                    // Pure page par text dhoondhna jahan is match ka title ya details likhi ho
                    // Taaki uske paas button chipkaya ja sake
                    const allElements = document.getElementsByTagName('*');
                    for (let i = 0; i < allElements.length; i++) {
                        const el = allElements[i];
                        
                        // Agar element ke andar match ka title ya match ID ka zikr hai aur wo koi bada container hai
                        if (el.innerText && el.innerText.includes(match.title || matchId) && 
                            (el.className.includes('card') || el.className.includes('match') || el.className.includes('item') || el.tagName === 'DIV') && 
                            el.children.length > 1) {
                            
                            // Check karna ki is specific element me button pehle se laga toh nahi hai
                            if (el.querySelector(`.btn-complete-${matchId}`)) continue;

                            // 🏆 COMPLETE MATCH BUTTON HTML
                            const btnHTML = `
                                <div class="btn-complete-${matchId}" style="width: 100%; text-align: center; margin: 8px 0; display: block !important; clear: both !important;">
                                    <button onclick="markMatchAsCompletedDirect('${matchId}')" style="
                                        background: linear-gradient(135deg, #28a745, #1e7e34) !important;
                                        color: #ffffff !important;
                                        border: none !important;
                                        padding: 8px 16px !important;
                                        border-radius: 6px !important;
                                        font-size: 13px !important;
                                        font-weight: bold !important;
                                        cursor: pointer !important;
                                        box-shadow: 0 4px 6px rgba(0,0,0,0.2) !important;
                                        display: inline-block !important;
                                    ">
                                        🏆 Complete Match (${match.title || 'FF'})
                                    </button>
                                </div>
                            `;

                            // Element ke sabse niche button attach kar dena
                            el.insertAdjacentHTML('beforeend', btnHTML);
                            break; // Ek match ke liye ek button mil gaya toh loop break karein
                        }
                    }
                });
            });
        }
    }, 500);
}

// 🚀 DIRECT DATABASE UPDATE TO COMPLETED
function markMatchAsCompletedDirect(matchId) {
    if (!matchId) return;

    const confirmAction = confirm("Kya aap sach mein is tournament ko 'COMPLETED' mark karna chahte hain?\n\nIspar click karte hi joined players ke app par ImgBB screenshot upload karne ka option automatic khul jayega.");

    if (confirmAction) {
        firebase.database().ref(`matches/${matchId}`).update({
            status: "Completed",
            isHistory: true
        })
        .then(() => {
            alert("🎉 Boom! Match status successfully 'Completed' set ho gaya hai. Players ab result bhej sakte hain.");
            location.reload(); // Instantly refresh layout
        })
        .catch((error) => {
            alert("❌ Firebase Error: " + error.message);
        });
    }
}

// RUN THE ENGINE
if (document.body) {
    listenAndInjectAdminButtons();
} else {
    window.addEventListener('DOMContentLoaded', listenAndInjectAdminButtons);
}
