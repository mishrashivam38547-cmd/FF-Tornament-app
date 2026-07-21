// Mobile aur browser par live errors screen par dikhane ke liye
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Error caught: ", message, "at", source, ":", lineno);
    
    let errorBox = document.getElementById('mobile-error-logger');
    if (!errorBox) {
        errorBox = document.createElement('div');
        errorBox.id = 'mobile-error-logger';
        errorBox.style.cssText = 'position:fixed; bottom:0; left:0; right:0; background:rgba(220, 38, 38, 0.9); color:white; padding:10px; font-size:11px; z-index:99999; max-height:150px; overflow-y:auto; font-family:monospace;';
        document.body.appendChild(errorBox);
    }
    errorBox.innerHTML += `<div>❌ [Line ${lineno}]: ${message}</div>`;
};
