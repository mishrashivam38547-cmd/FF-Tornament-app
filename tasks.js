// 🎁 USER SIDE: TASKS PROOF SUBMIT + AUTO HIDE PANEL LOGIC
window.submitTaskProof = function() {
    if (typeof firebase === 'undefined') {
        alert("❌ Firebase properly load nahi hua hai. Kripya page reload karein!");
        return;
    }

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
        let img = new Image();
        img.src = e.target.result;
        
        img.onload = function() {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            
            let MAX_WIDTH = 500; 
            let MAX_HEIGHT = 700;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            let compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);

            let taskData = {
                uid: user.uid,
                email: user.email || "No Email",
                screenshot: compressedBase64,
                taskType: taskType,
                status: "Pending",
                time: Date.now()
            };

            let uniqueTaskKey = user.uid + "_" + taskType;

            firebase.database().ref('socialBonusRequests/' + uniqueTaskKey).set(taskData)
            .then(() => {
                alert("🎉 Aapka " + taskType + " proof successfully submit ho gaya hai! Admin verify karke paise credit kar dega.");
                fileInput.value = "";
            }).catch(err => {
                alert("❌ Database Error: " + err.message);
            });
        };
    };
    reader.readAsDataURL(file);
};

// 🔄 REALTIME AUTO-HIDE LOGIC: Balance add hote hi option gayab ho jayega
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User ke database path par claimed status check karo
            firebase.database().ref('users/' + user.uid).on('value', (snapshot) => {
                let userData = snapshot.val();
                if (userData) {
                    // Agar WhatsApp aur Instagram dono claim ho chuke hain, toh poora dabba gayab kar do
                    if (userData.claimed_WhatsApp === true && userData.claimed_Instagram === true) {
                        let zone = document.getElementById('free-entry-zone');
                        if (zone) zone.style.display = 'none';
                    }
                    
                    // OPTIONAL: Agar alag-alag dropdown options hide karne hain jab ek-ek karke approve ho:
                    let selectBox = document.getElementById('task-type-select');
                    if (selectBox) {
                        if (userData.claimed_WhatsApp === true) {
                            let wsOption = selectBox.querySelector('option[value="WhatsApp"]');
                            if (wsOption) wsOption.disabled = true;
                        }
                        if (userData.claimed_Instagram === true) {
                            let igOption = selectBox.querySelector('option[value="Instagram"]');
                            if (igOption) igOption.disabled = true;
                        }
                    }
                }
            });
        }
    });
                                }
