// 🔄 ADMIN SIDE: SEPARATE TASKS OBSERVER WITH SPECIFIC PRICE
database.ref('socialBonusRequests').orderByChild('status').equalTo('Pending').on('value', (snapshot) => {
    let listDiv = document.getElementById('social-tasks-list');
    if (!listDiv) return;
    listDiv.innerHTML = "";
    let data = snapshot.val();

    if (!data) {
        listDiv.innerHTML = "<p style='text-align: center; color: #28a745; margin: 0;'>🟢 Koi pending task request nahi hai.</p>";
        return;
    }

    Object.keys(data).forEach(key => {
        let req = data[key];
        
        // Har task ka price set karein
        let taskPrice = (req.taskType === "WhatsApp") ? 5 : 5; // WhatsApp ke ₹5, Instagram ke ₹5 (Aap badal bhi sakte hain)

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
                <button type="button" onclick="approveSocialBonus('${key}', '${req.uid}', '${req.taskType}', ${taskPrice})" style="background:#28a745; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;">✅ Approve & Give ₹${taskPrice}</button>
                <button type="button" onclick="rejectSocialBonus('${key}')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; margin-left:5px;">❌ Reject</button>
            </div>
        `;
        listDiv.appendChild(card);
    });
});

window.approveSocialBonus = function(requestKey, userUid, taskType, prize) {
    // 1. User ka purana wallet balance fetch karo
    database.ref('users/' + userUid + '/wallet').once('value', (snapshot) => {
        let currentBalance = snapshot.val() || 0;
        let newBalance = currentBalance + prize; // Direct wallet balance addition

        let updates = {};
        updates['users/' + userUid + '/wallet'] = newBalance;
        // User ne specific task claim kar liya hai taaki dobara na kar sake
        updates['users/' + userUid + '/claimed_' + taskType] = true; 
        updates['socialBonusRequests/' + requestKey + '/status'] = "Approved";

        database.ref().update(updates).then(() => {
            alert("✅ Approved! User ke wallet mein " + taskType + " ke liye direct ₹" + prize + " add ho gaye hain.");
        }).catch(err => alert("Error: " + err.message));
    });
};

window.rejectSocialBonus = function(requestKey) {
    if (confirm("Kya aap is proof ko reject karna chahte hain?")) {
        database.ref('socialBonusRequests/' + requestKey).update({
            status: "Rejected"
        }).then(() => {
            alert("❌ Request reject kar di gayi.");
        }).catch(err => alert("Error: " + err.message));
    }
};
