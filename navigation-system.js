// ====================================================================
// 📱 FIXED BOTTOM NAVIGATION FOOTER SYSTEM (V17 FIXED)
// ====================================================================

window.currentSelectedTab = 'matches'; // Global active state

function injectBottomNavigationBar() {
    // Agar bottom bar pehle se bana hai toh dubara nahi banana hai
    if (document.getElementById('fixed-bottom-nav-bar')) return;

    const bodyContainer = document.body;
    if (!bodyContainer) return;

    // Fixed Bottom Layout - bilkul CashKaro app ki tarah permanent bottom par rahega
    const navHTML = `
        <div id="bottom-nav-spacer" style="width: 100%; height: 75px; display: block !important; clear: both !important;"></div>

        <div id="fixed-bottom-nav-bar" style="
            display: flex !important;
            justify-content: space-around !important;
            align-items: center !important;
            background: #111111 !important;
            padding: 10px 5px !important;
            border-top: 2px solid #ff4e50 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            z-index: 999999 !important;
            box-shadow: 0 -4px 15px rgba(0,0,0,0.6) !important;
        ">
            <button onclick="handleTabSwitch('matches')" id="btn-tab-matches" style="
                flex: 1 !important; margin: 0 4px !important; padding: 12px 5px !important;
                background: linear-gradient(135deg, #ff4e50, #f9d423) !important;
                color: #ffffff !important; border: none !important; border-radius: 6px !important;
                font-weight: bold !important; font-size: 12px !important; cursor: pointer !important;
                text-transform: uppercase !important;
            ">🔥 Matches</button>

            <button onclick="handleTabSwitch('history')" id="btn-tab-history" style="
                flex: 1 !important; margin: 0 4px !important; padding: 12px 5px !important;
                background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 12px !important; cursor: pointer !important;
                text-transform: uppercase !important;
            ">⏳ History</button>

            <button onclick="handleTabSwitch('giveaway')" id="btn-tab-giveaway" style="
                flex: 1 !important; margin: 0 4px !important; padding: 12px 5px !important;
                background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 12px !important; cursor: pointer !important;
                text-transform: uppercase !important;
            ">🎁 Giveaway</button>
        </div>
        
        <div id="giveaway-msg-zone" style="display:none; color:#ff9f43; text-align:center; padding:50px 20px; font-family:sans-serif; font-size:14px; font-weight:bold; clear:both;">
            🎁 No Giveaway Claims active at this moment.
        </div>
    `;

    // Safe append at the very end of body
    bodyContainer.insertAdjacentHTML('beforeend', navHTML);
    applyLiveTabFilter();
}

// 🔄 TABS SWITCH CONTROLLER
function handleTabSwitch(tabName) {
    window.currentSelectedTab = tabName;
    
    const mBtn = document.getElementById('btn-tab-matches');
    const hBtn = document.getElementById('btn-tab-history');
    const gBtn = document.getElementById('btn-tab-giveaway');

    if (!mBtn || !hBtn || !gBtn) return;

    const offStyle = "background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;";
    const onStyle = "background: linear-gradient(135deg, #ff4e50, #f9d423) !important; color: #ffffff !important; border: none !important;";

    mBtn.style.cssText = offStyle;
    hBtn.style.cssText = offStyle;
    gBtn.style.cssText = offStyle;

    if (tabName === 'matches') mBtn.style.cssText = onStyle;
    if (tabName === 'history') hBtn.style.cssText = onStyle;
    if (tabName === 'giveaway') gBtn.style.cssText = onStyle;

    applyLiveTabFilter();
}

// 🔥 SAFE FILTER LOGIC: Sirf asli Match Cards ko handle karega (Page black nahi hoga!)
function applyLiveTabFilter() {
    const gMsg = document.getElementById('giveaway-msg-zone');
    const allDivs = document.querySelectorAll('div');

    // STRICT CHECK: Pura page check karke sirf card boxes nikalo
    const masterCardsList = Array.from(allDivs).filter(el => {
        const txt = el.innerText || "";
        const id = el.id || "";
        
        // Match card data elements verification
        const isMatchCard = txt.includes("Map:") || txt.includes("Title:") || txt.includes("PRIZE POOL");
        
        // Kisi wallet/profile structure box ko hide hone se strictly bachana hai
        return isMatchCard && 
               !id.includes("fixed-bottom-nav-bar") && 
               !id.includes("bottom-nav-spacer") && 
               !el.contains(document.getElementById('fixed-bottom-nav-bar')) && 
               el.childElementCount >= 2;
    });

    if (window.currentSelectedTab === 'giveaway') {
        if (gMsg) gMsg.style.display = "block";
        masterCardsList.forEach(card => card.style.setProperty('display', 'none', 'important'));
        return;
    } else {
        if (gMsg) gMsg.style.display = "none";
    }

    masterCardsList.forEach((card) => {
        const cardText = card.innerText || "";
        const isCompleted = cardText.includes("Status: Completed") || 
                            cardText.includes("Match Ended") || 
                            cardText.includes("Completed") || 
                            cardText.includes("Status: Ended");

        if (window.currentSelectedTab === 'matches') {
            if (isCompleted) {
                card.style.setProperty('display', 'none', 'important');
            } else {
                card.style.setProperty('display', 'block', 'important');
            }
        } else if (window.currentSelectedTab === 'history') {
            if (isCompleted) {
                card.style.setProperty('display', 'block', 'important');
            } else {
                card.style.setProperty('display', 'none', 'important');
            }
        }
    });
}

// System Core Running Intervals
setInterval(injectBottomNavigationBar, 300);
setInterval(applyLiveTabFilter, 400);
                            
