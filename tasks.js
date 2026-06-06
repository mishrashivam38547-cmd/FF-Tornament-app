// 🎁 USER SIDE: SOCIAL TASK LOGIC
window.submitTaskProof = function() {
    let user = firebase.auth().currentUser;
    if (!user) { return alert("⚠️ Kripya pehle login karein!"); }

    let fileInput = document.getElementById('task-screenshot');
    if (!fileInput.files || fileInput.files.length === 0) {
        return alert("⚠️ Kripya join karne ka screenshot upload karein!");
    }

    let file = fileInput.files[0];
    let reader = new FileReader();
    
    reader.onload = function(e) {
        let base64Image = e.target.result;

        let taskData = {
            uid: user.uid,
            email: user.email || "No Email",
            screenshot: base64Image,
            status: "Pending",
            time: Date.now()
        };

        database.ref('socialBonusRequests/' + user.uid).set(taskData)
        .then(() => {
            alert("🎉 Aapka proof submit ho gaya hai! Admin verify karke 10-15 minute mein aapka bonus wallet mein credit kar dega.");
            let zone = document.getElementById('free-entry-zone');
            if (zone) zone.style.display = 'none';
        }).catch(err => alert("Error: " + err.message));
    };
    reader.readAsDataURL(file);
};

// User login state check karke box hide karna (Optional but Good)
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        database.ref('users/' + user.uid + '/freeBonusClaimed').once('value', (snapshot) => {
            if (snapshot.val() === true) {
                let zone = document.getElementById('free-entry-zone');
                if (zone) zone.style.display = 'none';
            }
        });
    }
});
