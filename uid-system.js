// ==========================================
// 📋 AUTO-INJECT USER UID SYSTEM (DYNAMIC CHECK)
// ==========================================

// 🔄 1. LOGO KO AUTOMATICALLY DHOONDH KAR UID INJECT KARNE KA ENGINE
function autoInjectUIDBox() {
    // Hum baar-baar 500ms par check karenge jab tak logo mil na jaye
    const checkExist = setInterval(function() {
        // Aapke screenshot ke mutabik jo class logo par ho sakti hai unhe target kiya hai
        const logoElement = document.querySelector('img[src*="logo"]') || 
                            document.querySelector('.app-logo') || 
                            document.querySelector('#site-logo') ||
                            document.querySelector('header img');

        if (logoElement) {
            clearInterval(checkExist); // Logo mil gaya, loop roko!

            // Check karenge kya UID box pehle se toh nahi bana hai
            if (document.getElementById('user-profile-section')) return;

            // UID Display Box ka html design create karna
            const uidHTML = `
                <div id="user-profile-section" style="text-align: center; margin: 12px auto; font-family: 'Roboto', sans-serif; display: block; width: 100%; max-width: 250px;">
                    <p style="color: #aaa; font-size: 11px; margin: 0;">Your Account ID (UID):</p>
                    <div style="display: inline-flex; align-items: center; background: #1a1a1a; padding: 5px 12px; border-radius: 20px; border: 1px solid #333; margin-top: 4px;">
                        <span id="display-user-uid" style="color: #ff9f43; font-weight: bold; font-size: 12px; margin-right: 8px;">Loading...</span>
                        <button onclick="copyUserUIDToClipboard()" style="background: #ff9f43; color: #fff; border: none; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; cursor: pointer;">
                            📋 Copy
                        </button>
                    </div>
                </div>
            `;
            
            // Logo ke exact theek niche ise fit kar dena
            logoElement.insertAdjacentHTML('afterend', uidHTML);
            
            // UI taiyar hote hi real-time data listen karna shuru karna
            setupUIDListener();
        }
    }, 500); // Har half-second me check karega jab tak page poora load na ho jaye
}

// 🔐 2. AUTH STATE CHANGE LISTENER FOR REALTIME SYNC
function setupUIDListener() {
    firebase.auth().onAuthStateChanged((user) => {
        const uidDisplayElement = document.getElementById('display-user-uid');
        if (user) {
            if (uidDisplayElement) uidDisplayElement.innerText = user.uid;
            window.userSessionUID = user.uid; // index.html ke global scope me save
        } else {
            if (uidDisplayElement) uidDisplayElement.innerText = "Not Logged In";
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

// 🚀 ENGINE KO RUN KARNA (Jaise hi file load ho, bina kisi parent dependency ke)
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInjectUIDBox);
} else {
    autoInjectUIDBox();
}
