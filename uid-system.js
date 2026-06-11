// ==========================================
// 📋 USER UID DISPLAY & COPY SYSTEM MODULE
// ==========================================

// 🚀 1. APP LOGO KE NICHE UID BOX AUTOMATIC INSERT KARNE KA FUNCTION
function injectUserUIDBox(parentElementId) {
    const parentElement = document.getElementById(parentElementId);
    if (!parentElement) {
        console.error("UID Insertion Error: Parent element not found!");
        return;
    }

    // UID Box ka HTML Design create karna
    const uidHTML = `
        <div id="user-profile-section" style="text-align: center; margin: 15px 0; font-family: 'Roboto', sans-serif;">
            <p style="color: #aaa; font-size: 12px; margin: 0;">Your Account ID (UID):</p>
            <div style="display: inline-flex; align-items: center; background: #222; padding: 6px 12px; border-radius: 20px; border: 1px solid #333; margin-top: 5px;">
                <span id="display-user-uid" style="color: #ff9f43; font-weight: bold; font-size: 13px; margin-right: 8px;">Loading...</span>
                <button onclick="copyUserUIDToClipboard()" style="background: #ff9f43; color: #fff; border: none; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                    📋 Copy
                </button>
            </div>
        </div>
    `;

    // Parent element ke andar ise jodh dena
    parentElement.insertAdjacentHTML('afterend', uidHTML);
}

// 🔐 2. AUTH STATE CHANGE LISTENER (Login hote hi UID text badalna)
function setupUIDListener() {
    firebase.auth().onAuthStateChanged((user) => {
        const uidDisplayElement = document.getElementById('display-user-uid');
        if (!uidDisplayElement) return;

        if (user) {
            uidDisplayElement.innerText = user.uid;
            window.userSessionUID = user.uid; // Global variable baki functions ke liye
        } else {
            uidDisplayElement.innerText = "Not Logged In";
        }
    });
}

// 📋 3. CLIPBOARD COPY TO FUNCTION
function copyUserUIDToClipboard() {
    const uidText = document.getElementById('display-user-uid').innerText;
    if (uidText === "Loading..." || uidText === "Not Logged In") return;

    navigator.clipboard.writeText(uidText).then(() => {
        alert("🎉 Account ID (UID) successfully copy ho gayi hai!");
    }).catch((err) => {
        // Fallback for older browsers
        const el = document.createElement('textarea');
        el.value = uidText;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert("🎉 Account ID (UID) copy ho gayi hai!");
    });
}
