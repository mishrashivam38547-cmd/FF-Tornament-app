// ==========================================
// 💸 SILENT SNIPER - ULTIMATE WITHDRAWAL SYSTEM
// ==========================================

function submitWithdrawRequest() {
    // 🔍 1. Elements dhoondho aur backups check karo (IDs Backup)
    let upiInput = document.getElementById('withdraw-upi') || document.getElementById('upi-id') || { value: "" };
    let amtInput = document.getElementById('withdraw-amount') || document.getElementById('w-amount') || { value: "" };
    let submitBtn = document.getElementById('btn-withdraw-req') || document.getElementById('withdraw-btn');

    let upi = upiInput.value.trim();
    let amt = parseFloat(amtInput.value.trim());

    // ⛔ Validations
    if (!upi || !amtInput.value) { 
        alert("⚠️ Kripya UPI ID aur Amount dono dalein!"); 
        return; 
    }
    if (isNaN(amt) || amt <= 0) { 
        alert("❌ Kripya sahi amount dalein!"); 
        return; 
    }

    // 🔒 2. Get Safe UID (Kisi bhi haal mein khali nahi honi chahiye)
    let finalUid = "";
    if (typeof userSessionUID !== 'undefined' && userSessionUID) {
        finalUid = userSessionUID;
    } else if (firebase.auth().currentUser) {
        finalUid = firebase.auth().currentUser.uid;
    }

    if (!finalUid || finalUid === "N/A") {
        alert("❌ Auth Error: Aap sahi se login nahi hain. Page reload karke dobara koshish karein!");
        return;
    }

    // 💰 3. User ka current balance check karo wallet se
    database.ref('users/' + finalUid + '/balance').once('value', (snapshot) => {
        let currentBalance = parseFloat(snapshot.val()) || 0.00;

        if (amt > currentBalance) {
            alert(`❌ Insufficient Balance! Aapke wallet mein sirf ₹${currentBalance.toFixed(2)} hain.`);
            return;
        }

        // Button state badlo taaki double-click na ho
        if (submitBtn) { submitBtn.innerText = "Processing Payout Request..."; submitBtn.disabled = true; }

        // 📉 4. Pehle user ke wallet se utna balance minus karo (Tension-free logic)
        let newBalance = currentBalance - amt;
        
        let newRequestKey = database.ref('withdrawalRequests').push().key;

        // 📤 Admin aur User History dono ke liye perfect data formatting
        let withdrawData = {
            requestId: newRequestKey,
            uid: finalUid,                   // 🔥 For Admin Panel Target
            userUID: finalUid,               // For User Side History View
            amount: amt,                     // 🔥 For Admin Payout Loader
            upiId: upi,                      // 🔥 For Admin UPI Loader
            status: "Pending",
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        let updates = {};
        updates['users/' + finalUid + '/balance'] = newBalance;
        updates['users/' + finalUid + '/wallet'] = newBalance; // Double sync backup
        updates['withdrawalRequests/' + newRequestKey] = withdrawData;

        // 🔄 Atomic update: Dono kaam ek sath honge ya ek bhi nahi (Safe Coding)
        database.ref().update(updates).then(() => {
            alert(`🎉 Withdrawal Request Sent!\n₹${amt} aapke wallet se hold par rakh diye gaye hain aur verification ke baad UPI par mil jayenge.`);
            
            if (submitBtn) { submitBtn.innerText = "Submit Withdraw Request"; submitBtn.disabled = false; }
            
            // Clear inputs
            upiInput.value = "";
            amtInput.value = "";
            if (typeof closeWithdrawModal === 'function') closeWithdrawModal();
        }).catch((err) => {
            alert("❌ Error: " + err.message);
            if (submitBtn) { submitBtn.innerText = "Submit Withdraw Request"; submitBtn.disabled = false; }
        });
    });
                }
