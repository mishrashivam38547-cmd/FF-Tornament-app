// ====================================================================
// 📱 FIXED BOTTOM NAV WITH DIRECT DEPOSIT MONEY BUTTON (V22)
// ====================================================================

window.currentSelectedTab = 'matches'; // Global active state

function injectBottomNavigationBar() {
    // Agar bottom bar pehle se bana hai toh dubara nahi banana hai
    if (document.getElementById('fixed-bottom-nav-bar')) return;

    const bodyContainer = document.body;
    if (!bodyContainer) return;

    // Font Awesome Icons CDN dynamically include karna
    if (!document.getElementById('font-awesome-cdn')) {
        const link = document.createElement('link');
        link.id = 'font-awesome-cdn';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);
    }

    // Fixed Bottom Layout Design (4 Buttons System)
    const navHTML = `
        <div id="bottom-nav-spacer" style="width: 100%; height: 85px; display: block !important; clear: both !important;"></div>

        <div id="fixed-bottom-nav-bar" style="
            display: flex !important;
            justify-content: space-around !important;
            align-items: center !important;
            background: #111111 !important;
            padding: 8px 1px !important;
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
                flex: 1 !important; margin: 0 2px !important; padding: 10px 1px !important;
                background: linear-gradient(135deg, #ff4e50, #f9d423) !important;
                color: #ffffff !important; border: none !important; border-radius: 6px !important;
                font-weight: bold !important; font-size: 10px !important; cursor: pointer !important;
                display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;
                text-transform: uppercase !important;
            ">
                <i class="fa-solid fa-gamepad" style="font-size: 14px;"></i>
                <span>Matches</span>
            </button>

            <button onclick="handleTabSwitch('history')" id="btn-tab-history" style="
                flex: 1 !important; margin: 0 2px !important; padding: 10px 1px !important;
                background: #1c1c1c !important; color: #aaaaaa !important; border: 1px solid #2d2d2d !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 10px !important; cursor: pointer !important;
                display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;
                text-transform: uppercase !important;
            ">
                <i class="fa-solid fa-clock-rotate-left" style="font-size: 14px;"></i>
                <span>History</span>
            </button>

            <button onclick="handleTabSwitch('giveaway')" id="btn-tab-giveaway" style="
                flex: 1 !important; margin: 0 2px !important; padding: 10px 1px !important;
                background: #1c1c1c !important; color: #aaaaaa !important; border: 1px solid #2d2d2d !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 10px !important; cursor: pointer !important;
                display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;
                text-transform: uppercase !important;
            ">
                <i class="fa-solid fa-gift" style="font-size: 14px;"></i>
                <span>Giveaway</span>
            </button>

            <button onclick="handleDepositMoneyClick()" id="btn-tab-deposit" style="
                flex: 1 !important; margin: 0 2px !important; padding: 10px 1px !important;
                background: #1c1c1c !important; color: #aaaaaa !important; border: 1px solid #2d2d2d !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 10px !important; cursor: pointer !important;
                display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;
                text-transform: uppercase !important;
            ">
                <i class="fa-solid fa-wallet" style="font-size: 14px; color: #f9d423;"></i>
                <span>Deposit</span>
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

// 👑 CLEANUP ENGINE: Faltu elements aur purane Add Money button ko screen se auto-hide karne ka logic
function cleanOldScreenElements() {
    // 1. Purana Account ID block hide karna
    const allDivs = document.querySelectorAll('div');
    allDivs.forEach(div => {
        if (div.innerText && div.innerText.includes("Your Account ID (UID):")) {
            div.style.setProperty('display', 'none', 'important');
        }
    });

    // 2. Faltu buttons dhoond kar automatic hide karna (Logout, Channel, Install, Purana Add Money)
    const allButtons = document.querySelectorAll('button, a, input[type="button"]');
    allButtons.forEach(btn => {
        const txt = (btn.innerText || btn.value || "").toLowerCase();
        const onClickAttr = btn.getAttribute('onclick') || "";

        if (!btn.closest('#fixed-bottom-nav-bar')) {
            if (txt.includes("logout") || onClickAttr.includes("logout") ||
                txt.includes("channel") || onClickAttr.includes("youtube") ||
                txt.includes("install app") || onClickAttr.includes("install") ||
                txt.includes("add money") || txt.includes("deposit") || onClickAttr.includes("addmoney") || onClickAttr.includes("payment")) {
                
                btn.style.setProperty('display', 'none', 'important');
            }
        }
    });
}

// 🛠️ DIRECT DEPOSIT CLICK REDIRECTION LOGIC
function handleDepositMoneyClick() {
    // Page par maujood original Add Money button ko dhoond kar click trigger karna
    const oldAddMoneyBtn = Array.from(document.querySelectorAll('button, a, input[type="button"]')).find(el => {
        const text = (el.innerText || el.value || "").toLowerCase();
        const clickText = el.getAttribute('onclick') || "";
        return (text.includes("add money") || text.includes("deposit") || clickText.includes("addmoney")) && 
               el.id !== "btn-tab-deposit" && 
               !el.closest('#fixed-bottom-nav-bar');
    });

    if (oldAddMoneyBtn) {
        oldAddMoneyBtn.click(); // Purane button ka original payment function khulega
    } else {
        // Fallbacks agar direct page handlers load hon
        if (typeof window.openAddMoney === 'function') { window.openAddMoney(); }
        else if (typeof window.openPayment === 'function') { window.openPayment(); }
        else { alert("💳 Deposit portal/script is page par active nahi mili!"); }
    }
}

// 🔄 TABS SWITCH CONTROLLER WITH ACTIVE STATES
function handleTabSwitch(tabName) {
    window.currentSelectedTab = tabName;

    const mBtn = document.getElementById('btn-tab-matches');
    const hBtn = document.getElementById('btn-tab-history');
    const gBtn = document.getElementById('btn-tab-giveaway');

    if (!mBtn || !hBtn || !gBtn) return;

    const offStyle = "background: #1c1c1c !important; color: #aaaaaa !important; border: 1px solid #2d2d2d !important; display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important;";
    const onStyle = "background: linear-gradient(135deg, #ff4e50, #f9d423) !important; color: #ffffff !important; border: none !important; display: flex !important; flex-direction: column !important; align-items: center !important; gap: 4px !important; box-shadow: 0 2px 8px rgba(255,78,80,0.4) !important;";

    mBtn.style.cssText = offStyle;
    hBtn.style.cssText = offStyle;
    gBtn.style.cssText = offStyle;

    if (tabName === 'matches') mBtn.style.cssText = onStyle;
    if (tabName === 'history') hBtn.style.cssText = onStyle;
    if (tabName === 'giveaway') gBtn.style.cssText = onStyle;

    applyLiveTabFilter();
}

// 🔥 MATCH FILTER ENGINE
function applyLiveTabFilter() {
    const gMsg = document.getElementById('giveaway-msg-zone');
    const allDivs = document.querySelectorAll('div, p');

    const masterCardsList = Array.from(allDivs).filter(el => {
        const txt = el.innerText || "";
        const id = el.id || "";
        const className = el.className || "";
        const isMatchCard = txt.includes("Map:") || txt.includes("Title:") || txt.includes("PRIZE POOL");
        
        return isMatchCard && 
               !id.includes("fixed-bottom-nav-bar") && 
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

// Constant execution loops
setInterval(injectBottomNavigationBar, 300);
setInterval(applyLiveTabFilter, 400);
setInterval(cleanOldScreenElements, 300); // Purane elements saaf karne wala engine
    
