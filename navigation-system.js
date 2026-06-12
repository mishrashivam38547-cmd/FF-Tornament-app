// ====================================================================
// 👑 FLOATING TABS INJECTOR & DYNAMIC MATCH FILTER ENGINE (V11)
// ====================================================================

window.currentSelectedTab = 'matches'; // Global state banana taaki dusri file bhi read kar sake

function injectSmartStickyNavigation() {
    // Agar bar pehle se bana hai toh dubara mat banao
    if (document.getElementById('fixed-tab-nav-bar')) return;

    const bodyContainer = document.body;
    if (!bodyContainer) return;

    // Fixed Top Navigation UI layout
    const navHTML = `
        <div id="fixed-tab-nav-bar" style="
            display: flex !important;
            justify-content: space-around !important;
            align-items: center !important;
            background: rgba(17, 17, 17, 0.98) !important;
            padding: 12px 10px !important;
            border-bottom: 2px solid #ff4e50 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 999999 !important;
            backdrop-filter: blur(5px) !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
        ">
            <button onclick="handleTabSwitch('matches')" id="btn-tab-matches" style="
                flex: 1 !important; margin: 0 5px !important; padding: 10px 5px !important;
                background: linear-gradient(135deg, #ff4e50, #f9d423) !important;
                color: #ffffff !important; border: none !important; border-radius: 6px !important;
                font-weight: bold !important; font-size: 13px !important; cursor: pointer !important;
            ">Matches</button>

            <button onclick="handleTabSwitch('history')" id="btn-tab-history" style="
                flex: 1 !important; margin: 0 5px !important; padding: 10px 5px !important;
                background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 13px !important; cursor: pointer !important;
            ">History</button>

            <button onclick="handleTabSwitch('giveaway')" id="btn-tab-giveaway" style="
                flex: 1 !important; margin: 0 5px !important; padding: 10px 5px !important;
                background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 13px !important; cursor: pointer !important;
            ">Giveaway Claim</button>
        </div>
        
        <div id="tabs-spacer-block" style="width: 100%; height: 65px; display: block !important;"></div>
        
        <div id="giveaway-msg-zone" style="display:none; color:#888; text-align:center; padding:40px; font-family:sans-serif; font-size:13px;">
            🎁 No Giveaway Claims active at this moment.
        </div>
    `;

    bodyContainer.insertAdjacentHTML('afterbegin', navHTML);
    applyLiveTabFilter();
}

// 🔄 TABS REDIRECTION & CSS BUTTON CONTROLLER
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

// 🔥 MATCH CARDS LIVE FILTER ENGINE
function applyLiveTabFilter() {
    const gMsg = document.getElementById('giveaway-msg-zone');
    const allDivs = document.querySelectorAll('div');

    // Live filtering core match box containers
    const masterCardsList = Array.from(allDivs).filter(el => {
        const txt = el.innerText || "";
        const id = el.id || "";
        return (txt.includes("Map:") || txt.includes("Title:") || txt.includes("PRIZE POOL")) && 
               !id.includes("fixed-tab-nav-bar") && 
               el.childElementCount > 1;
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

// Execution Loop Intervals
setInterval(injectSmartStickyNavigation, 300);
setInterval(applyLiveTabFilter, 400);
          
