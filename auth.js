// 🔐 RS7 ESPORT - MODULAR AUTHENTICATION SYSTEM (auth.js)

// 1. Google Provider Instance Configuration
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 2. Google Login Logic Function
function loginWithGoogle() {
    console.log("Google Login Button Clicked!");
    
    if (typeof firebase === 'undefined') {
        alert("❌ Firebase core setup is missing or offline!");
        return;
    }

    const currentAuth = firebase.auth();
    const currentDatabase = firebase.database();

    currentAuth.signInWithPopup(googleProvider)
        .then((result) => {
            const user = result.user;
            console.log("Google Authenticated User:", user.displayName);
            
            // Check checking user database check
            return currentDatabase.ref('users/' + user.uid).once('value')
                .then((snapshot) => {
                    if (!snapshot.exists()) {
                        // Naya profile generate karein
                        return currentDatabase.ref('users/' + user.uid).set({
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
            
            // Redirect backup option agar browser popup block kare
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                if (confirm("Popup block ho raha hai! Kya aap fallback sign-in use karna chahte hain?")) {
                    currentAuth.signInWithRedirect(googleProvider);
                }
            } else {
                alert("❌ Login Failed: " + error.message + " (Code: " + error.code + ")");
            }
        });
}

// 3. Logout Logic Function
function logoutFirebase() {
    firebase.auth().signOut().then(() => {
        alert("Logged Out Successfully!");
        window.location.reload();
    }).catch((error) => {
        alert("Logout Error: " + error.message);
    });
}

// 4. Realtime User Authentication State Observer
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        window.userSessionUID = user.uid;
        window.playerIGN = user.displayName || "Gamer";

        // Dynamic elements injection handler (Safe validation)
        const uidElement = document.getElementById('user-display-uid');
        if (uidElement) uidElement.innerText = window.userSessionUID;

        const welcomeElement = document.getElementById('welcome-username');
        if (welcomeElement) welcomeElement.innerText = "🎮 " + window.playerIGN;

        // Screen state toggles
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.style.display = 'none';

        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.style.display = 'block';

        // Auto sync core changes safely inside global database variable
        if (typeof database !== 'undefined') {
            database.ref('users/' + window.userSessionUID).update({
                uid: window.userSessionUID,
                name: window.playerIGN,
                email: user.email || ""
            });
        }

        // Trigger matches dynamic systems load
        if (typeof setupUserDatabase === 'function') setupUserDatabase();
        if (typeof startLiveListeners === 'function') startLiveListeners();

    } else {
        window.userSessionUID = "";
        window.playerIGN = "";
        
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.style.display = 'flex';

        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.style.display = 'none';
    }
});
