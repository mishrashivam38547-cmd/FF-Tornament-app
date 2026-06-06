// 🔄 ADMIN SIDE: SEPARATE TASKS OBSERVER WITH SPECIFIC PRICE (₹5 FIXED)
firebase.database().ref('socialBonusRequests').on('value', (snapshot) => {
    let listDiv = document.getElementById('social-tasks-list');
    if (!listDiv) return;
    listDiv.innerHTML = "";
    let data = snapshot.val();

    if (!data) {
        listDiv.innerHTML = "<p style='text-align: center; color: #28a745; margin: 0;'>🟢 Koi pending task request nahi hai.</p>";
        return;
    }

    let hasPending = false;

    Object.keys(data).forEach(key => {
        let req = data[key];
        
        // Sirf unhi requests ko dikhao jo 'Pending' hain
        if (req.status === "Pending") {
            hasPending = true;
            
            // 💰 YAHAN PRICE ₹5 SET KAR DIYA HAI (WhatsApp aur Instagram dono ke liye)
            let taskPrice = 5; 

            let card = document.createElement('div');
            card.style = "background:#f9f9f9; padding:12px; margin-bottom:10px; border-left:4px solid #ff4e50; border-radius:4px; text-align: left; color:#333;";
            
            card.innerHTML = `
                <p style="margin: 3px 0;"><b>User Email:</b> ${req.email}</p>
                <p style="margin: 3px 0; color: #ff4e50; font-weight:bold;"><b>Task Submitted:</b> ${req.taskType}</p>
                <p style="margin: 3px 0; color: #28a745; font-weight:bold;"><b>Reward Amount:</b> ₹${taskPrice}</p>
                <div style="margin: 8px 0;">
                    <b>Proof Image:</b><br>
                    <img src="${req.screenshot}" style="max-width: 100%; max-height: 250px; border: 1px solid #ccc; margin-top: 5px; border-radius: 4px;">
                </div>
                <div style="margin-top: 8px;">
                    <button type="button" onclick="window.approveSocialBonus('${key}', '${req.uid}', '${req.taskType}', ${taskPrice})" style="background:#28a745; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;">✅ Approve & Give ₹${taskPrice}</button>
                    <button type="button" onclick="window.rejectSocialBonus('${key}')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; margin-left:5px;">❌ Reject</button>
                </div>
            `;
            listDiv.appendChild(card);
        }
    });

    if (!hasPending) {
        listDiv.innerHTML = "<p style='text-align: center; color: #28a745; margin: 0;'>🟢 Koi pending task request nahi hai.</p>";
    }
});

window.approveSocialBonus = function(requestKey, userUid, taskType, prize) {
    // Math checks lagaye hain taaki number sahi se plus ho
    let prizeAmount = Number(prize) || 5; 

    // 1. Pehle user ka wallet path confirm karke read karte hain
    firebase.database().ref('users/' + userUid).once('value', (snapshot) => {
        let userData = snapshot.val();
        
        if (!userData) {
            alert("❌ Error: User database mein nahi mila! UID check karein.");
            return;
        }

        // 2. Agar wallet key nahi milti, toh balance check karo (Dono me se jo bhi ho)
        let currentBalance = 0;
        if (userData.wallet !== undefined) {
            currentBalance = Number(userData.wallet) || 0;
        } else if (userData.balance !== undefined) {
            currentBalance = Number(userData.balance) || 0;
        }

        let newBalance = currentBalance + prizeAmount; 

        // 3. Ek sath dono paths par balance update bhej rahe hain taaki kisi bhi naam se save ho, kaam kar jaye!
        let updates = {};
        updates['users/' + userUid + '/wallet'] = newBalance;
        updates['users/' + userUid + '/balance'] = newBalance; // Backup path
        updates['users/' + userUid + '/claimed_' + taskType] = true; 
        updates['socialBonusRequests/' + requestKey + '/status'] = "Approved";

        // 4. Firebase mein direct write execute karo
        firebase.database().ref().update(updates).then(() => {
            alert("✅ Success! User ko ₹" + prizeAmount + " credit ho gaye hain. Naya balance: ₹" + newBalance);
        }).catch(err => {
            alert("❌ Database Error: " + err.message);
        });
    });
};
