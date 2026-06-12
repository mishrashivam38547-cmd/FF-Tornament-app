// ====================================================================
// 👑 SAFE HEADER TABS INJECTOR & CARD-ONLY FILTER SYSTEM (V15)
// ====================================================================

window.currentSelectedTab = 'matches'; // Global active state

function injectTabsInsideHeader() {
    // Agar bar pehle se bana hai toh dubara nahi banana hai
    if (document.getElementById('fixed-tab-nav-bar')) return;

    // 🔥 FIX: Sabse safe jagah hai page ka main header/title (h1, h2 ya top navbar)
    const headerTarget = document.querySelector('h1, h2, .header, #header') || document.body;
    if (!headerTarget) return;

    const navHTML = `
        <div id="fixed-tab-nav-bar" style="
            display: flex !important;
            justify-content: space-around !important;
            align-items: center !important;
            background: #111111 !important;
            padding: 10px !important;
            border: 1px solid #222222 !important;
            border-radius: 8px !important;
            margin: 15px auto !important;
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

    // Header ke theek baad daalenge taaki balance button ke upar ya niche safe rahe
    if (headerTarget === document.body) {
        headerTarget.insertAdjacentHTML('afterbegin', navHTML);
    } else {
        headerTarget.insertAdjacentHTML('afterend', navHTML);
    }
    
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

// 🔥 SAFE FILTER LOGIC: Sirf asli cards ko target karna (Page black nahi hoga!)
function applyLiveTabFilter() {
    const gMsg = document.getElementById('giveaway-msg-zone');
    const allDivs = document.querySelectorAll('div');

    // STRICT CHECK: Sirf wahi div select honge jo sach me match card hain
    const masterCardsList = Array.from(allDivs).filter(el => {
        const txt = el.innerText || "";
        const id = el.id || "";
        const hasCardData = txt.includes("Map:") || txt.includes("Title:") || txt.includes("PRIZE POOL");
        
        // Kisi main body layout element ko hide hone se bachane ke liye strict logic
        return hasCardData && !id.includes("fixed-tab-nav-bar") && !el.contains(document.getElementById('fixed-tab-nav-bar')) && el.childElementCount >= 2;
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
setInterval(injectTabsInsideHeader, 400);
setInterval(applyLiveTabFilter, 500);
