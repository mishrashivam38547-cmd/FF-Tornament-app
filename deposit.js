// ==========================================
// 📥 SILENT SNIPER - ULTIMATE DEPOSIT SYSTEM
// ==========================================

function submitPaymentRequest() {
    // 🔍 1. Pata lagao kaun sa element available hai (IDs Backup)
    let amtInput = document.getElementById('pay-amount') || document.getElementById('amount') || { value: "" };
    let utrInput = document.getElementById('pay-utr') || document.getElementById('pay-txn') || document.getElementById('utr') || { value: "" };
    let fileInput = document.getElementById('pay-screenshot') || document.getElementById('screenshot-file');
    let submitBtn = document.getElementById('btn-submit-req') || document.getElementById('submit-btn');

    let amt = amtInput.value.trim();
    let utr = utrInput.value.trim();

    // ⛔ Validations
    if (!amt || !utr) { alert("⚠️ Kripya Amount aur UTR ID dono dalein!"); return; }
    if (fileInput.files.length === 0) { alert("❌ Kripya Payment Screenshot select karein!"); return; }

    // 🔒 2. Get Safe UID (Kisi bhi haal mein khali nahi honi chahiye)
    let finalUid = "";
    if (typeof userSessionUID !== 'undefined' && userSessionUID) {
        finalUid = userSessionUID;
    } else if (firebase.auth().currentUser) {
        finalUid = firebase.auth().currentUser.uid;
    }

    if (!finalUid || finalUid === "N/A") {
        alert("❌ Auth Error: Aap sahi se login nahi hain. Ek baar page reload karke dobara koshish karein!");
        return;
    }

    // Button state update
    if (submitBtn) { submitBtn.innerText = "Uploading Screenshot..."; submitBtn.disabled = true; }

    let file = fileInput.files[0];
    let formData = new FormData();
    formData.append("image", file);

    // 🖼️ ImgBB Upload Engine
    fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, { method: "POST", body: formData })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            let downloadURL = result.data.url;
            
            // Generate a unique token for request
            let newRequestKey = database.ref('depositRequests').push().key;

            // 📤 Perfect Map across all Admin platforms
            let depositData = {
                requestId: newRequestKey,
                uid: finalUid,                   // 🔥 For Admin UID Loader
                userUID: finalUid,               // For User History Loader
                playerName: (typeof playerIGN !== 'undefined' ? playerIGN : "") || (firebase.auth().currentUser ? firebase.auth().currentUser.displayName : "Gamer"),
                amount: parseFloat(amt),
                txnId: utr,                      // 🔥 For Admin TXN Loader
                screenshot: downloadURL,         // 🔥 For Image Display
                status: "Pending",
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };

            database.ref('depositRequests/' + newRequestKey).set(depositData)
            .then(() => {
                alert("🎉 Request Submitted Successfully!\nAdmin verification ke baad ₹" + amt + " aapke wallet mein add ho jayenge.");
                if (submitBtn) { submitBtn.innerText = "2. Submit Payment Request"; submitBtn.disabled = false; }
                
                // Clear Inputs
                amtInput.value = "";
                utrInput.value = "";
                if (typeof closePaymentModal === 'function') closePaymentModal();
            });
        } else {
            alert("❌ Photo Upload Failed! Dobara koshish karein.");
            if (submitBtn) { submitBtn.innerText = "2. Submit Payment Request"; submitBtn.disabled = false; }
        }
    })
    .catch((err) => { 
        alert("❌ Network Error: " + err.message); 
        if (submitBtn) { submitBtn.innerText = "2. Submit Payment Request"; submitBtn.disabled = false; }
    });
    }
