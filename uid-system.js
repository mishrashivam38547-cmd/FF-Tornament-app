// ==========================================
// 📋 AUTOMATIC USER UID INJECTOR (FAIL-PROOF)
// ==========================================

function forceInjectUIDBox() {
    const checkExist = setInterval(function() {
        // Agar pehle se ban gaya hai toh dobara nahi banayenge
        if (document.getElementById('user-profile-section')) {
            clearInterval(checkExist);
            return;
        }

        // 🎯 TARGETS: Hum page ke sabse main containers ko target kar rahe hain
        // Taki agar logo na bhi mile, toh header ya main app container ke top par chipak jaye
        const targetElement = document.querySelector('.header') || 
                              document.querySelector('header') || 
                              document.querySelector('.app-container') ||
                              document.querySelector('.container') ||
                              document.body.firstChild; // Kuch na mile toh page ke shuruat me

        if (targetElement) {
            clearInterval(checkExist); // Loop ko roko

            const uidHTML = `
                <div id="user-profile-section" style="text-align: center; margin: 15px auto; padding: 10px; font-family: 'Roboto', sans-serif; background: rgba(0,0,0,0.4); border-radius: 8px; max-width: 280px; width: 90%; display: block; border: 1px solid #222;">
                    <p style="color: #aaa; font-size: 11px; margin: 0 0 5px 0;">Your Account ID (UID):</p>
                    <div style="display: inline-flex; align-items: center; background: #111; padding: 6px 12px; border-radius: 20px; border: 1px solid #333;">
                        <span id="display-user-uid" style="color: #ff9f43; font-weight: bold; font-size: 12px; margin-right: 8px; word-break: break-all;">Loading...</span>
                        <button onclick="copyUserUIDToClipboard()" style="background: #ff9f43; color: #fff; border: none; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; cursor: pointer; white-space: nowrap;">
                            📋 Copy
                        </button>
                    </div>
                </div>
            `;
            
            // Element ke starting me top par box insert kar dena
            if(targetElement === document.body.firstChild) {
                document.body.insertBefore(document.createRange().createContextualFragment(uidHTML), document.body.firstChild);
            } else {
                targetElement.insertAdjacentHTML('afterbegin', uidHTML);
            }
            
            // Backend synchronization start karna
            setupUIDListener();
        }
    }, 400);
}

// 🔐 FIREBASE REAL-TIME DATA SYNC
function setupUIDListener() {
    firebase.auth().onAuthStateChanged((user) => {
        const uidDisplayElement = document.getElementById('display-user-uid');
        if (user) {
            if (uidDisplayElement) uidDisplayElement.innerText = user.uid;
            window.userSessionUID = user.uid; // Backup globally
        } else {
            if (uidDisplayElement) uidDisplayElement.innerText = "Not Logged In";
        }
    });
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

// RUN FORCED INITIALIZATION
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", forceInjectUIDBox);
} else {
    forceInjectUIDBox();
}
