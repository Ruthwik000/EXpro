export function initPassiveWatching() {
  let lastActivity = Date.now();
  const INACTIVITY_THRESHOLD = 15 * 60 * 1000; // 15 minutes
  let checkInterval;

  const resetActivity = () => {
    lastActivity = Date.now();
  };

  const checkInactivity = () => {
    const inactive = Date.now() - lastActivity;
    if (inactive >= INACTIVITY_THRESHOLD) {
      showInactivityToast();
      lastActivity = Date.now(); // Reset to avoid repeated toasts
    }
  };

  const showInactivityToast = () => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999999;
      max-width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    
    toast.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px;">👀 Still watching?</div>
      <div style="font-size: 13px; opacity: 0.95; margin-bottom: 12px;">
        You've been watching without interaction. Want a summary or quiz?
      </div>
      <button id="dismiss-toast" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
        Dismiss
      </button>
    `;
    
    document.body.appendChild(toast);
    
    document.getElementById('dismiss-toast').addEventListener('click', () => {
      toast.remove();
    });
    
    setTimeout(() => toast.remove(), 10000);
  };

  // Track activity
  ['mousemove', 'scroll', 'click', 'keypress'].forEach(event => {
    document.addEventListener(event, resetActivity, { passive: true });
  });

  checkInterval = setInterval(checkInactivity, 60000); // Check every minute

  return {
    cleanup: () => {
      clearInterval(checkInterval);
      ['mousemove', 'scroll', 'click', 'keypress'].forEach(event => {
        document.removeEventListener(event, resetActivity);
      });
    }
  };
}
