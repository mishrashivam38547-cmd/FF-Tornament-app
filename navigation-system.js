// ====================================================================
// 🎯 STRICT TOP-POSITIONING TABS SYSTEM (V13)
// ====================================================================

window.currentSelectedTab = 'matches'; // Global active state

function injectTabsStrictlyAboveCards() {
    // Agar bar pehle se bana hai toh dubara nahi banana hai
    if (document.getElementById('fixed-tab-nav-bar')) return;

    // 🔥 PRECISE TARGETING: Matches tab container ya main-content ko target karna
    const matchesContainer = document.getElementById('matches-tab') || 
                             document.querySelector('.main-content') ||
                             document.querySelector('.container');
    
    if (!matchesContainer) return;

    // Beautiful dynamic responsive navigation design
    const navHTML = `
        <div id="fixed-tab-nav-bar" style="
            display: flex !important;
            justify-content: space-around !important;
            align-items: center !important;
            background: #111111 !important;
            padding: 10px !important;
            border: 1px solid #222222 !important;
            border-radius: 8px !important;
            margin: 10px auto 20px auto !important;
            width: 95% !important;
            max-width: 400px !important;
            box-sizing: border-box !important;
            clear: both !important;
        ">
            <button onclick="handleTabSwitch('matches')" id="btn-tab-matches" style="
                flex: 1 !important; margin: 0 4px !important; padding: 10px 5px !important;
                background: linear-gradient(135deg, #ff4e50, #f9d423) !important;
                color: #ffffff !important; border: none !important; border-radius: 6px !important;
                font-weight: bold !important; font-size: 12px !important; cursor: pointer !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
            ">Matches</button>

            <button onclick="handleTabSwitch('history')" id="btn-tab-history" style="
                flex: 1 !important; margin: 0 4px !important; padding: 10px 5px !important;
                background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 12px !important; cursor: pointer !important;
            ">History</button>

            <button onclick="handleTabSwitch('giveaway')" id="btn-tab-giveaway" style="
                flex: 1 !important; margin: 0 4px !important; padding: 10px 5px !important;
                background: #222222 !important; color: #aaaaaa !important; border: 1px solid #333333 !important;
                border-radius: 6px !important; font-weight: bold !important; font-size: 12px !important; cursor: pointer !important;
            ">Giveaway Claim</button>
        </div>
        
        <div id="giveaway-msg-zone" style="display:none; color:#888; text-align:center; padding:25px; font-family:sans-serif; font-size:12px;">
            🎁 No Giveaway Claims active at this moment.
        </div>
    `;

    // 🔥 FIX: Matches Cards block ke *THEEK PEHLE* (beforebegin) inject karna 
    // Isse buttons har haal mein matches cards ke upar dikhenge, niche nahi!
    matchesContainer.insertAdjacentHTML('beforebegin', navHTML);
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

// 🔥 LIVE CARDS FILTER LOGIC
function applyLiveTabFilter() {
    const gMsg = document.getElementById('giveaway-msg-zone');
    const allDivs = document.querySelectorAll('div');

    // Filter out core card chunks safely
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

// System Loops Engine
setInterval(injectTabsStrictlyAboveCards, 400);
setInterval(applyLiveTabFilter, 500);
