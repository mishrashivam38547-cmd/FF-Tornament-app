// =======================================================
// 👑 ADMIN AUTOMATIC MATCH COMPLETION SYSTEM (DYNAMIC PATCH)
// =======================================================

function injectCompleteButtonsToAdmin() {
    // Admin panel par jahan matches ke cards/rows render hote hain, unhe dhoondhna
    // Yeh aapke admin match container ki class ya normal cards ko automatic target karega
    const adminMatchCards = document.querySelectorAll('.match-card') || 
                             document.querySelectorAll('.card') || 
                             document.querySelectorAll('[id^="match-"]');

    adminMatchCards.forEach((card) => {
        // Agar is card mein pehle se complete button lag chuka hai toh skip karein
        if (card.querySelector('.admin-complete-btn-patch')) return;

        // Card se Match ID nikalne ki koshish (Aapke database template ke mutabik)
        // Agar id direct database key se link hai, toh use fetch karna
        let matchId = card.id || card.getAttribute('data-id');
        
        // Agar ID kisi string ke sath judi hai (e.g., "match-12345"), toh sirf number/key alag karna
        if (matchId && matchId.includes('-')) {
            matchId = matchId.split('-')[1];
        }

        // Agar card ke andar koi delete button laga hai, toh uske onlick attribute se matchId churana
        const deleteBtn = card.querySelector('button[onclick*="delete"]') || card.querySelector('.delete-btn');
        if (!matchId && deleteBtn) {
            const onclickText = deleteBtn.getAttribute('onclick');
            const matches = onclickText.match(/'([^']+)'/) || onclickText.match(/"([^"]+)"/);
            if (matches && matches[1]) matchId = matches[1];
        }

        // Agar Match ID successfully mil gayi, toh ek mast "Complete Match" button wahan chipkana
        if (matchId) {
            const actionContainer = card.querySelector('.actions') || card.querySelector('.buttons') || card;
            
            const btnHTML = `
                <button class="admin-complete-btn-patch" onclick="markMatchAsCompleted('${matchId}')" style="
                    background: linear-gradient(135deg, #28a745, #1e7e34) !important;
                    color: #ffffff !important;
                    border: none !important;
                    padding: 6px 12px !important;
                    margin: 5px !important;
                    border-radius: 4px !important;
                    font-size: 12px !important;
                    font-weight: bold !important;
                    cursor: pointer !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
                    display: inline-block !important;
                ">
                    🏆 Complete Match
                </button>
            `;
            
            // Delete ya edit button ke paas ise attach karna
            actionContainer.insertAdjacentHTML('beforeend', btnHTML);
        }
    });
}

// 🚀 FIREBASE DATABASE DETECTOR & WRITER
function markMatchAsCompleted(matchId) {
    if (!matchId) {
        alert("🚨 Error: Match ID nahi mil saki!");
        return;
    }

    const confirmAction = confirm("Kya aap sach mein is tournament ko 'COMPLETED' mark karna chahte hain?\n\nIspar click karte hi joined players ke app par ImgBB screenshot upload karne ka option automatic khul jayega.");

    if (confirmAction) {
        if (typeof firebase !== 'undefined' && firebase.database) {
            
            // Firebase realtime database mein match status update script
            firebase.database().ref(`matches/${matchId}`).update({
                status: "Completed",
                isHistory: true
            })
            .then(() => {
                alert("🎉 Boom! Match status successfully 'Completed' set ho gaya hai. Ab players result bhej sakte hain.");
                location.reload(); // Page refresh karke status sync check karna
            })
            .catch((error) => {
                alert("❌ Firebase Error: " + error.message);
            });
        } else {
            alert("🚨 System Error: Firebase configuration admin panel par nahi mili!");
        }
    }
}

// 🔄 BACKGROUND WATCHER LOOP (Jo har 1 second me naye cards check karega)
setInterval(() => {
    injectCompleteButtonsToAdmin();
}, 1000);
