// ==========================================
// 📋 AUTOMATIC USER UID INJECTOR (CSS FIXED)
// ==========================================

function forceInjectUIDBox() {
    // Agar pehle se bana hai toh loop se bachein
    if (document.getElementById('user-profile-section')) return;

    // Target check: Header ya main container ko target karenge
    const targetElement = document.querySelector('.header') || 
                          document.querySelector('header') || 
                          document.querySelector('.app-container') ||
                          document.body;

    if (targetElement) {
        // 🔥 Is layout mein width aur display ko clear kiya hai taaki vertical na ho
        const uidHTML = `
            <div id="user-profile-section" style="clear: both !important; display: block !important; width: 100% !important; text-align: center !important; margin: 15px auto !important; padding: 5px !important; font-family: 'Roboto', sans-serif;">
                <p style="color: #aaa; font-size: 11px; margin: 0 0 4px 0; display: block !important;">Your Account ID (UID):</p>
                <div style="display: inline-flex !important; align-items: center !important; justify-content: center !important; background: #1a1a1a; padding: 6px 14px; border-radius: 20px; border: 1px solid #333; max-width: 90%;">
                    <span id="display-user-uid" style="color: #ff9f43; font-weight: bold; font-size: 12px; margin-right: 10px; word-break: break-all !important; white-space: nowrap !important;">Loading...</span>
                    <button onclick="copyUserUIDToClipboard()" style="background: #ff9f43; color: #fff; border: none; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer; white-space: nowrap !important; display: inline-block !important;">
                        📋 Copy
                    </button>
                </div>
            </div>
        `;
        
        // Element ko insert karna
        targetElement.insertAdjacentHTML('afterbegin', uidHTML);
        
        // Data listen start karna
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
                        // CSS safe check taaki text break na ho
                        uidDisplayElement.style.whiteSpace = "nowrap";
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

// RUN ENGINE
const launchEngine = setInterval(() => {
    if (document.body) {
        clearInterval(launchEngine);
        forceInjectUIDBox();
    }
}, 300);
