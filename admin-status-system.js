// =======================================================
// 👑 ADMIN MATCH COMPLETION SYSTEM (BUTTON-ANCHOR HOOK)
// =======================================================

function injectCompleteButtonsToAdminV2() {
    // 1. Page par jitne bhi Delete buttons hain unhe target karna
    const allButtons = document.querySelectorAll('button');
    
    allButtons.forEach((btn) => {
        // Sirf wahi button pakdna jisme "Delete" likha ho
        if (btn.innerText.trim() === 'Delete' || btn.className.includes('delete')) {
            
            // Check karna ki kya iske pass pehle se humne Complete button lagaya hai?
            const parentArea = btn.parentElement;
            if (!parentArea || parentArea.querySelector('.admin-complete-btn-v2')) return;

            // 2. Delete button ke onclick attribute se match ID nikalna
            let matchId = "";
            const onclickText = btn.getAttribute('onclick') || "";
            
            // Regex se single quotes ya double quotes ke beech ki ID nikalna
            const matchKeys = onclickText.match(/'([^']+)'/) || onclickText.match(/"([^"]+)"/);
            if (matchKeys && matchKeys[1]) {
                matchId = matchKeys[1];
            }

            // 3. Agar matchId mil gayi, toh theek Delete button ke bagal me Complete button set karna
            if (matchId) {
                const btnHTML = `
                    <button class="admin-complete-btn-v2" onclick="markMatchAsCompletedDirectly('${matchId}')" style="
                        background: #28a745 !important;
                        color: #ffffff !important;
                        border: none !important;
                        padding: 6px 12px !important;
                        margin-left: 5px !important;
                        border-radius: 4px !important;
                        font-size: 12px !important;
                        font-weight: bold !important;
                        cursor: pointer !important;
                        display: inline-block !important;
                    ">
                        Complete
                    </button>
                `;
                // Delete button ke theek baad is button ko render karna
                btn.insertAdjacentHTML('afterend', btnHTML);
            }
        }
    });
}

// 🚀 DIRECT DATABASE WRITE TO FIREBASE
function markMatchAsCompletedDirectly(matchId) {
    if (!matchId) {
        alert("🚨 Error: Match ID generate nahi ho saki!");
        return;
    }

    const confirmAction = confirm("Kya aap sach mein is match ko 'Completed' mark karna chahte hain?\n\nIspar click karte hi joined players ke app par direct screenshot upload ka card aa jayega.");

    if (confirmAction) {
        if (typeof firebase !== 'undefined' && firebase.database) {
            
            // Firebase node ko update karna
            firebase.database().ref(`matches/${matchId}`).update({
                status: "Completed",
                isHistory: true
            })
            .then(() => {
                alert("🎉 Success! Match completed set ho gaya hai.");
                location.reload(); // Instantly refresh layout to update
            })
            .catch((error) => {
                alert("❌ Firebase Error: " + error.message);
            });
        } else {
            alert("🚨 Error: Firebase database load nahi mila!");
        }
    }
}

// 🔄 LOOP ENGINE: Har 800ms me check karega ki delete button ke pass button laga ya nahi
setInterval(() => {
    injectCompleteButtonsToAdminV2();
}, 800);
