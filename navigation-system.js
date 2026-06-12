// ====================================================================
// 📱 FIXED BOTTOM NAV WITH FLOATING PROFILE MENU SYSTEM (V19)
// ====================================================================

window.currentSelectedTab = 'matches'; // Global active state

function injectBottomNavigationBar() {
    // Agar bottom bar pehle se bana hai toh dubara nahi banana hai
    if (document.getElementById('fixed-bottom-nav-bar')) return;

    const bodyContainer = document.body;
    if (!bodyContainer) return;

    // Font Awesome Icons CDN dynamically include karna taaki sahi icons dikhein
    if (!document.getElementById('font-awesome-cdn')) {
        const link = document.createElement('link');
        link.id = 'font-awesome-cdn';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);
    }

    // Dynamic Variable: Safe UID fetch karne ke liye
    let currentUID = window.userSessionUID || "Loading...";
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        currentUID = firebase.auth().currentUser.uid;
    }

    // Fixed Bottom Layout Design with Profile Menu Popup
    const navHTML = `
        <div id="bottom-nav-spacer" style="width: 100%; height: 85px; display: block !important; clear: both !important;"></div>

        <div id="floating-profile-menu" style="
            display: none;
            position: fixed !important;
            bottom: 75px !important;
            right: 15px !important;
            background: #161616 !important;
            border: 2px solid #ff4e50 !important;
            border-radius: 12px !important;
            width: 240px !important;
            box-shadow: 0 -5px 25px rgba(0,0,0,0.8) !important;
            z-index: 9999999 !important;
            overflow: hidden !important;
            font-family: sans-serif !important;
        ">
            <div style="background: linear-gradient(135deg, #ff4e50, #f9d423) !important; padding: 10px; text-align: center; color: #fff; font-weight: bold; font-size: 12px;">
                <i class="fa-solid fa-circle-user" style="font-size: 16px; margin-right: 5px;"></i> USER PROFILE
            </div>

            <div style="padding: 10px 12px; border-bottom: 1px solid #222; background: #111;">
                <span style="color: #777; font-size: 10px; display: block; font-weight: bold; text-transform: uppercase;">App UID:</span>
                <span id="profile-menu-uid" style="color: #ff9f43; font-size: 11px; font-weight: bold; word-break: break-all;">${currentUID}</span>
            </div>

            <button onclick="handleChannelClick()" style="
                width: 100% !important; padding: 12px !important; background: transparent !important; 
                color: #fff !important; border: none !important; border-bottom: 1px solid #222 !important;
                text-align: left !important; font-size: 12px !important; font-weight: bold !important; cursor: pointer !important;
                display: flex !important; align-items: center !important; gap: 10px !important;
            " onmouseover="this.style.background='#222'" onmouseout="this.style.background='transparent'">
                <i class="fa-brands fa-youtube" style="color: #ff0000; font-size: 14px;"></i> Official Channel
            </button>

            <button onclick="handleInstallAppClick()" style="
                width: 100% !important; padding: 12px !important; background: transparent !important; 
                color: #fff !important; border: none !important; border-bottom: 1px solid #222 !important;
                text-align: left !important; font-size: 12px !important; font-weight: bold !important; cursor: pointer !important;
                display: flex !important; align-items: center !important; gap: 10px !important;
            " onmouseover="this.style.background='#222'" onmouseout="this.style.background='transparent'">
                <i class="fa-solid fa-download" style="color: #28a745; font-size: 14px;"></i> Install Web App
            </button>

            <button onclick="handleLogoutClick()" style="
                width: 100% !important; padding: 12px !important; background: #220f10 !important; 
                color: #ff4e50 !important; border: none !important;
                text-align: left !important; font-size: 12px !important; font-weight: bold !important; cursor: pointer !important;
                display: flex !important; align-items: center !important; gap: 10px !important;
            " onmouseover="this.style.background='#361416'" onmouseout="this.style.background='#220f10'">
                <i class="fa-solid fa-right-from-bracket" style="font-size: 14px;"></i> Logout Account
            </button>
        </div>

        <div id="fixed-bottom-nav-bar" style="
            display: flex !important;
            justify-content: space-around !important;
            align-items: center !important;
            background: #111111 !important;
            padding: 8px 2px !important;
            border-top: 2px solid #ff4e50 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            z-index: 999999 !important;
            box-shadow: 0 -5px 20px rgba(0,0,0,0.7) !important;
        ">
            <button onclick="handleTabSwitch('matches')" id="btn-tab-matches" style="
                flex: 1 !important; margin: 0 3px !important; padding: 10px 2px !important;
                background: linear-gradient(135deg, #ff4e50, #f9d423) !important;
                color: #ffffff !important; border: none !important; border-radius: 6px !important;
                font-weight: bold !important; font-size: 11px !important; cursor: pointer !important;
                display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;
                text-transform: uppercase !important;
            ">
                <i class="fa-solid fa-gamepad" style="font-size: 15px;"></i>
                <span>Matches</span>
            </button>

            <button onclick="handleTabSwitch('history')" id="btn-tab-history" style="
                flex: 1 !important; margin: 0 3px !important; padding: 10px 2px !important;
                background: #1c1c1c !important; color: #aaaaaa !important; border: 1px solid #2d2d2d !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 11px !important; cursor: pointer !important;
                display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;
                text-transform: uppercase !important;
            ">
                <i class="fa-solid fa-clock-rotate-left" style="font-size: 15px;"></i>
                <span>History</span>
            </button>

            <button onclick="handleTabSwitch('giveaway')" id="btn-tab-giveaway" style="
                flex: 1 !important; margin: 0 3px !important; padding: 10px 2px !important;
                background: #1c1c1c !important; color: #aaaaaa !important; border: 1px solid #2d2d2d !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 11px !important; cursor: pointer !important;
                display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;
                text-transform: uppercase !important;
            ">
                <i class="fa-solid fa-gift" style="font-size: 15px;"></i>
                <span>Giveaway</span>
            </button>

            <button onclick="toggleProfileMenu()" id="btn-tab-profile" style="
                flex: 1 !important; margin: 0 3px !important; padding: 10px 2px !important;
                background: #1c1c1c !important; color: #aaaaaa !important; border: 1px solid #2d2d2d !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 11px !important; cursor: pointer !important;
                display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;
                text-transform: uppercase !important;
            ">
                <i class="fa-solid fa-user-gear" style="font-size: 15px;"></i>
                <span>Profile</span>
            </button>
        </div>
        
        <div id="giveaway-msg-zone" style="display:none; color:#ff9f43; text-align:center; padding:60px 20px; font-family:sans-serif; font-size:14px; font-weight:bold; clear:both;">
            <i class="fa-solid fa-box-open" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
            🎁 No Giveaway Claims active at this moment.
        </div>
    `;

    bodyContainer.insertAdjacentHTML('beforeend', navHTML);
    applyLiveTabFilter();
}

// 🔄 PROFILE POPUP TOGGLE CONTROLLER
function toggleProfileMenu() {
    const pMenu = document.getElementById('floating-profile-menu');
    const pBtn = document.getElementById('btn-tab-profile');
    if (!pMenu) return;

    if (pMenu.style.display === "none" || pMenu.style.display === "") {
        pMenu.style.display = "block";
        if (pBtn) pBtn.style.cssText = "flex: 1 !important; margin: 0 3px !important; padding: 10px 2px !important; background: #222222 !important; color: #ff4e50 !important; border: 1px solid #ff4e50 !important; border-radius: 6px !important; display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;";
    } else {
        pMenu.style.display = "none";
        if (pBtn) pBtn.style.cssText = "flex: 1 !important; margin: 0 3px !important; padding: 10px 2px !important; background: #1c1c1c !important; color: #aaaaaa !important; border: 1px solid #2d2d2d !important; border-radius: 6px !important; display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;";
    }
}

// 🛠️ PROFILE MENU ACTIONS ACTION FUNCTIONS
function handleChannelClick() {
    // Agar aapke paas functions pehle se window block me save hain toh ye unhe direct fire karega
    if (typeof window.openChannel === 'function') {
        window.openChannel();
    } else {
        // Fallback: Agar aapka normal trigger redirection handle karna ho
        const chanBtn = document.querySelector('button[onclick*="youtube"], button[onclick*="channel"]');
        if (chanBtn) chanBtn.click();
        else alert("🔗 Channel Link button component page par nahi mila!");
    }
}

function handleInstallAppClick() {
    if (typeof window.installApp === 'function') {
        window.installApp();
    } else {
        const instBtn = document.querySelector('button[onclick*="install"]');
        if (instBtn) instBtn.click();
        else alert("📲 Install script app component current session me available nahi hai.");
    }
}

function handleLogoutClick() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().then(() => {
            location.reload();
        }).catch((err) => {
            alert("Error logging out: " + err.message);
        });
    } else {
        const logBtn = document.querySelector('button[onclick*="logout"], a[onclick*="logout"]');
        if (logBtn) logBtn.click();
        else alert("🚨 Logout trigger controller execute nahi ho pa rha hai.");
    }
}

// 🔄 TABS SWITCH CONTROLLER WITH ACTIVE STATES (Profile Menu close automatically)
function handleTabSwitch(tabName) {
    window.currentSelectedTab = tabName;
    
    // Hide Profile Menu when switching tabs
    const pMenu = document.getElementById('floating-profile-menu');
    if (pMenu) pMenu.style.display = "none";

    const mBtn = document.getElementById('btn-tab-matches');
    const hBtn = document.getElementById('btn-tab-history');
    const gBtn = document.getElementById('btn-tab-giveaway');
    const pBtn = document.getElementById('btn-tab-profile');

    if (!mBtn || !hBtn || !gBtn) return;

    const offStyle = "background: #1c1c1c !important; color: #aaaaaa !important; border: 1px solid #2d2d2d !important; display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;";
    const onStyle = "background: linear-gradient(135deg, #ff4e50, #f9d423) !important; color: #ffffff !important; border: none !important; display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important; box-shadow: 0 2px 8px rgba(255,78,80,0.4) !important;";

    mBtn.style.cssText = offStyle;
    hBtn.style.cssText = offStyle;
    gBtn.style.cssText = offStyle;
    if (pBtn) pBtn.style.cssText = offStyle;

    if (tabName === 'matches') mBtn.style.cssText = onStyle;
    if (tabName === 'history') hBtn.style.cssText = onStyle;
    if (tabName === 'giveaway') gBtn.style.cssText = onStyle;

    applyLiveTabFilter();
}

// 🔥 SAFE FILTER LOGIC
function applyLiveTabFilter() {
    const gMsg = document.getElementById('giveaway-msg-zone');
    const allDivs = document.querySelectorAll('div, p');

    // LIVE UID Real-time sync tracker inside popup menu
    const menuUIDSpan = document.getElementById('profile-menu-uid');
    if (menuUIDSpan && (menuUIDSpan.innerText === "Loading..." || menuUIDSpan.innerText === "")) {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            menuUIDSpan.innerText = firebase.auth().currentUser.uid;
        }
    }

    const masterCardsList = Array.from(allDivs).filter(el => {
        const txt = el.innerText || "";
        const id = el.id || "";
        const className = el.className || "";
        
        const isMatchCard = txt.includes("Map:") || txt.includes("Title:") || txt.includes("PRIZE POOL");
        
        return isMatchCard && 
               !id.includes("fixed-bottom-nav-bar") && 
               !id.includes("floating-profile-menu") &&
               !id.includes("bottom-nav-spacer") && 
               !className.includes("v19-form-box") &&
               el.childElementCount >= 2;
    });

    const noMatchesElements = Array.from(document.querySelectorAll('div, p, h3')).filter(el => {
        return el.innerText && el.innerText.includes("No upcoming matches available");
    });

    if (window.currentSelectedTab === 'giveaway') {
        if (gMsg) gMsg.style.display = "block";
        masterCardsList.forEach(card => card.style.setProperty('display', 'none', 'important'));
        noMatchesElements.forEach(el => el.style.setProperty('display', 'none', 'important'));
        return;
    } else {
        if (gMsg) gMsg.style.display = "none";
    }

    if (window.currentSelectedTab === 'matches') {
        noMatchesElements.forEach(el => el.style.setProperty('display', 'block', 'important'));
        masterCardsList.forEach((card) => {
            const cardText = card.innerText || "";
            const isCompleted = cardText.includes("Status: Completed") || cardText.includes("Match Ended") || cardText.includes("Completed") || cardText.includes("Status: Ended");
            if (isCompleted) card.style.setProperty('display', 'none', 'important');
            else card.style.setProperty('display', 'block', 'important');
        });
    } else if (window.currentSelectedTab === 'history') {
        noMatchesElements.forEach(el => el.style.setProperty('display', 'none', 'important'));
        masterCardsList.forEach((card) => {
            const cardText = card.innerText || "";
            const isCompleted = cardText.includes("Status: Completed") || cardText.includes("Match Ended") || cardText.includes("Completed") || cardText.includes("Status: Ended");
            if (isCompleted) card.style.setProperty('display', 'block', 'important');
            else card.style.setProperty('display', 'none', 'important');
        });
    }
}

// Loops
setInterval(injectBottomNavigationBar, 300);
setInterval(applyLiveTabFilter, 400);
        
