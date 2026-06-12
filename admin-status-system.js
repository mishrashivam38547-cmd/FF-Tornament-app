// =======================================================
// 👑 ADMIN DIRECT TO COMPLETED PATCH ENGINE (V3)
// =======================================================

function injectCompleteButtonsToAdminV3() {
    // Page par chal rahe saare normal buttons ko check karna
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach((btn) => {
        // Agar button ka text Delete hai toh uski target key nikalna
        if (btn.innerText && btn.innerText.trim() === "Delete") {
            const parent = btn.parentElement;
            if (!parent || parent.querySelector('.admin-complete-btn-v3')) return;

            // Onclick function se raw Match ID string isolate karna
            const onclickText = btn.getAttribute('onclick') || "";
            const matchKeys = onclickText.match(/'([^']+)'/) || onclickText.match(/"([^"]+)"/);
            
            if (matchKeys && matchKeys[1]) {
                const matchId = matchKeys[1];

                const completeBtnHTML = `
                    <button class="admin-complete-btn-v3" onclick="executeAdminMatchCompletion('${matchId}')" style="
                        background: #28a745 !important;
                        color: #ffffff !important;
                        border: none !important;
                        padding: 5px 12px !important;
                        margin-left: 6px !important;
                        border-radius: 4px !important;
                        font-size: 12px !important;
                        font-weight: bold !important;
                        cursor: pointer !important;
                        display: inline-block !important;
                    ">
                        Complete
                    </button>
                `;
                btn.insertAdjacentHTML('afterend', completeBtnHTML);
            }
        }
    });
}

function executeAdminMatchCompletion(matchId) {
    if (!matchId) return;
    const confirmAction = confirm("Kya aap sach mein is match ko 'Completed' mark karna chahte hain? Isse user app par screenshot upload panel visible ho jayega.");
    
    if (confirmAction && typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref(`matches/${matchId}`).update({
            status: "Completed",
            isHistory: true
        })
        .then(() => {
            alert("🏆 Match status successfully badal kar 'Completed' ho gaya hai!");
            location.reload();
        })
        .catch(err => alert("❌ Firebase Error: " + err.message));
    }
}

// Watcher script running
setInterval(injectCompleteButtonsToAdminV3, 600);
