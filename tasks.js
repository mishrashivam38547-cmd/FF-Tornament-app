// 🎁 USER SIDE: HAR TASK KA ALAG PROOF SUBMIT SYSTEM
window.submitTaskProof = function() {
    let user = firebase.auth().currentUser;
    if (!user) { return alert("⚠️ Kripya pehle login karein!"); }

    let taskType = document.getElementById('task-type-select').value;
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
            taskType: taskType, // WhatsApp ya Instagram
            status: "Pending",
            time: Date.now()
        };

        // Unique key bana rahe hain taaki dono task alag-alag dikhein (e.g., USERID_WhatsApp)
        let uniqueTaskKey = user.uid + "_" + taskType;

        database.ref('socialBonusRequests/' + uniqueTaskKey).set(taskData)
        .then(() => {
            alert("🎉 Aapka " + taskType + " proof submit ho gaya hai! Admin verify karke paise credit kar dega.");
        }).catch(err => alert("Error: " + err.message));
    };
    reader.readAsDataURL(file);
};
