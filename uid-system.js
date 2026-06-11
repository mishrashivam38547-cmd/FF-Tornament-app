// =======================================================
// 📋 AUTOMATIC USER UID INJECTOR (FLOATING SAFE SYSTEM)
// =======================================================

function forceInjectUIDBox() {
    // Agar pehle se bana hai toh dobara nahi banayenge
    if (document.getElementById('user-profile-section')) return;

    // Direct body ko target karenge taki header ke design se koi lena-dena na rahe
    const bodyElement = document.body;

    if (bodyElement) {
        // 🚀 Floating bar style jo page ke top par alag se center me baithega
        const uidHTML = `
            <div id="user-profile-section" style="
                display: flex !important; 
                flex-direction: column !important;
                align-items: center !important; 
                justify-content: center !important; 
                width: 90% !important; 
                max-width: 320px !important;
                margin: 15px auto !important; 
                padding: 10px !important; 
                font-family: 'Roboto', sans-serif !important; 
                background: #111111 !important; 
                border: 1px solid #333333 !important; 
                border-radius: 12px !important;
                box-shadow: 0px 4px 10px rgba(0,0,0,0.5) !important;
                text-align: center !important;
            ">
                <p style="color: #aaaaaa !important; font-size: 11px !important; margin: 0 0 6px 0 !important; font-weight: normal !important; width: 100% !important;">Your Account ID (UID):</p>
                <div style="
                    display: flex !important; 
                    flex-direction: row !important;
                    align-items: center !important; 
                    justify-content: space-between !important; 
                    background: #1a1a1a !important; 
                    padding: 6px 12px !important; 
                    border-radius: 8px !important; 
                    border: 1px solid #444444 !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                ">
                    <span id="display-user-uid" style="color: #ff9f43 !important; font-weight: bold !important; font-size: 11px !important; word-break: break-all !important; text-align: left !important; padding-right: 5px !important;">Loading...</span>
                    <button onclick="copyUserUIDToClipboard()" style="background: #ff9f43 !important; color: #ffffff !important; border: none !important; padding: 4px 10px !important; border-radius: 6px !important; font-size: 11px !important; font-weight: bold !important; cursor: pointer !important; white-space: nowrap !important; min-width: 60px !important;">
                        📋 Copy
                    </button>
                </div>
            </div>
        `;
        
        // Is bar ko direct page ke body ke sabshe upar insert kar dena
        bodyElement.insertAdjacentHTML('afterbegin', uidHTML);
        
        // Real-time data check chalana
        listenFirebaseForUID();
    }
}

// 🔐 FIREBASE REAL-TIME DATA SYNC
function listenFirebaseForUID() {
    const authCheck = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            clearInterval(authCheck);
            
            firebase.auth().onAuthStateChanged((user) => {
                const uidDisplayElement = document.getElementById('display-user-uid');
                if (user) {
                    if (uidDisplayElement) {
                        uidDisplayElement.innerText = user.uid;
                    }
                    window.userSessionUID = user.uid; 
                } else {
                    if (uidDisplayElement) uidDisplayElement.innerText = "Not Logged In";
                }
            });
        }
    }, 500);
}

// 📋 CLIPBOARD COPY CONTROLLER
function copyUserUIDToClipboard() {
    const uidText = document.getElementById('display-user-uid').innerText;
    if (uidText === "Loading..." || uidText === "Not Logged In") return;

    navigator.clipboard.writeText(uidText).then(() => {
        alert("🎉 Account ID (UID) successfully copy ho gayi hai!");
    }).catch((err) => {
        const el = document.createElement('textarea');
        el.value = uidText;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert("🎉 Account ID (UID) copy ho gayi hai!");
    });
}

// RUN ENGINE AS SOON AS BODY IS READY
const launchEngine = setInterval(() => {
    if (document.body) {
        clearInterval(launchEngine);
        forceInjectUIDBox();
    }
}, 300);
