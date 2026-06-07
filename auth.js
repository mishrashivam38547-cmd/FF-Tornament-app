// 🔐 RS7 ESPORT - AUTHENTICATION & USER TRAFFIC CONTROLLER (auth.js)

const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 🎮 Google Sign-In Function
function loginWithGoogle() {
    console.log("Google Login Triggered!");
    
    if (typeof firebase === 'undefined') {
        alert("❌ Firebase module load nahi ho paya!");
        return;
    }

    firebase.auth().signInWithPopup(googleProvider)
        .then((result) => {
            const user = result.user;
            console.log("Google User NetID:", user.uid);
            
            // Database registration verify karein
            return database.ref('users/' + user.uid).once('value')
                .then((snapshot) => {
                    if (!snapshot.exists()) {
                        // Agar naya player hai toh default layout banayein
                        return database.ref('users/' + user.uid).set({
                            uid: user.uid,
                            name: user.displayName || "Gamer",
                            email: user.email || "",
                            wallet: 0.00,
                            balance: 0.00
                        });
                    }
                });
        })
        .then(() => {
            alert("🎉 Login Successful!");
            window.location.reload();
        })
        .catch((error) => {
            console.error("Auth Engine Error:", error);
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                if (confirm("Popup block ho raha hai! Kya aap default redirect se login karna chahte hain?")) {
                    firebase.auth().signInWithRedirect(googleProvider);
                }
            } else {
                alert("❌ Sign-In Failed: " + error.message);
            }
        });
}

// 🚪 Logout Function
function logoutFirebase() {
    firebase.auth().signOut().then(() => {
        alert("Logged Out Successfully!");
        window.location.reload();
    }).catch((error) => {
        alert("Logout Error: " + error.message);
    });
}

// 🔓 Realtime Auth Observer Loop
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        userSessionUID = user.uid;
        playerIGN = user.displayName || "Gamer";

        // Inject text into layout safely
        const uidElement = document.getElementById('user-display-uid');
        if (uidElement) uidElement.innerText = userSessionUID;

        const welcomeElement = document.getElementById('welcome-username');
        if (welcomeElement) welcomeElement.innerText = "🎮 " + playerIGN;

        // Toggle app screens view
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.style.display = 'none';

        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.style.display = 'block';

        // Base metadata parameters sync inside database
        database.ref('users/' + userSessionUID).update({
            uid: userSessionUID,
            name: playerIGN,
            email: user.email || ""
        });

        // Trigger existing background modules
        if (typeof startLiveListeners === 'function') startLiveListeners();

    } else {
        userSessionUID = "";
        playerIGN = "";
        
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.style.display = 'flex';

        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.style.display = 'none';
    }
});
