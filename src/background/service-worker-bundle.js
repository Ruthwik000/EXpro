// Background Service Worker Bundle - Cross-browser compatible

// Cross-browser API compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Cache Handler
async function clearCache() {
  try {
    await browserAPI.browsingData.remove({
      since: 0
    }, {
      cache: true,
      localStorage: true,
      sessionStorage: true
    });
    
    console.log('Cache cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
}

// Ad Blocker Handler
async function handleAdBlocker(enabled) {
  try {
    const rulesetIds = ['adblock_rules'];
    
    if (enabled) {
      await browserAPI.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: rulesetIds
      });
      console.log('Ad blocker enabled');
    } else {
      await browserAPI.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: rulesetIds
      });
      console.log('Ad blocker disabled');
    }
  } catch (error) {
    console.error('Error toggling ad blocker:', error);
  }
}

// Listen for page navigation/refresh to auto-clear cache
browserAPI.webNavigation.onCommitted.addListener(async (details) => {
  // Only trigger on main frame (not iframes) and actual navigation
  if (details.frameId === 0 && (details.transitionType === 'reload' || details.transitionType === 'typed' || details.transitionType === 'link')) {
    // Check if auto clear cache is enabled
    const result = await browserAPI.storage.sync.get(['toggles']);
    if (result.toggles?.autoClearCache) {
      console.log('Auto-clearing cache on page refresh...');
      await clearCache();
      
      // Show notification badge
      browserAPI.action.setBadgeText({ text: '✓', tabId: details.tabId });
      browserAPI.action.setBadgeBackgroundColor({ color: '#10b981', tabId: details.tabId });
      
      // Clear badge after 2 seconds
      setTimeout(() => {
        browserAPI.action.setBadgeText({ text: '', tabId: details.tabId });
      }, 2000);
    }
  }
});

// Message Listeners
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_CHANGED') {
    handleToggleChange(message.key, message.value);
    sendResponse({ success: true });
  }
  
  if (message.type === 'CLEAR_CACHE') {
    clearCache().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'GET_COOKIES') {
    browserAPI.cookies.getAll({ url: message.url }, (cookies) => {
      sendResponse({ cookies });
    });
    return true;
  }

  if (message.type === 'GET_ALL_COOKIES') {
    browserAPI.cookies.getAll({ url: message.url }, (cookies) => {
      sendResponse({ cookies });
    });
    return true;
  }

  if (message.type === 'REMOVE_COOKIE') {
    const url = message.url;
    const name = message.name;
    
    // Build proper URL for cookie removal
    let cookieUrl = url;
    if (message.domain) {
      const protocol = url.startsWith('https') ? 'https://' : 'http://';
      const domain = message.domain.startsWith('.') ? message.domain.substring(1) : message.domain;
      cookieUrl = protocol + domain + '/';
    }
    
    const removeDetails = { 
      url: cookieUrl, 
      name: name
    };
    
    console.log('Removing cookie:', removeDetails);
    
    browserAPI.cookies.remove(removeDetails, (result) => {
      if (browserAPI.runtime.lastError) {
        console.error('Cookie remove error:', browserAPI.runtime.lastError);
        sendResponse({ success: false, error: browserAPI.runtime.lastError.message });
      } else {
        console.log('Cookie removed successfully:', result);
        sendResponse({ success: true });
      }
    });
    return true;
  }

  if (message.type === 'SET_COOKIE') {
    const cookie = message.cookie;
    
    // Build proper URL for cookie
    let cookieUrl = message.url;
    if (cookie.domain) {
      const protocol = cookie.secure ? 'https://' : 'http://';
      const domain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
      cookieUrl = protocol + domain + (cookie.path || '/');
    }
    
    const cookieDetails = {
      url: cookieUrl,
      name: cookie.name,
      value: cookie.value,
      path: cookie.path || '/',
      secure: cookie.secure || false,
      httpOnly: cookie.httpOnly || false
    };

    // Add domain if specified
    if (cookie.domain) {
      cookieDetails.domain = cookie.domain;
    }

    // Add sameSite if specified
    if (cookie.sameSite) {
      cookieDetails.sameSite = cookie.sameSite;
    }

    // Add expiration if not a session cookie
    if (cookie.expirationDate) {
      cookieDetails.expirationDate = cookie.expirationDate;
    }

    console.log('Setting cookie:', cookieDetails);

    browserAPI.cookies.set(cookieDetails, (result) => {
      if (browserAPI.runtime.lastError) {
        console.error('Cookie set error:', browserAPI.runtime.lastError);
        sendResponse({ success: false, error: browserAPI.runtime.lastError.message });
      } else {
        console.log('Cookie set successfully:', result);
        sendResponse({ success: true, cookie: result });
      }
    });
    return true;
  }

  if (message.type === 'DELETE_ALL_COOKIES') {
    browserAPI.cookies.getAll({ url: message.url }, (cookies) => {
      const promises = cookies.map(cookie => {
        return browserAPI.cookies.remove({
          url: message.url,
          name: cookie.name
        });
      });
      
      Promise.all(promises).then(() => {
        sendResponse({ success: true, count: cookies.length });
      });
    });
    return true;
  }

  // Integration hooks
  if (message.type === 'GITHUB_AGENT_ACTION') {
    console.log('GitHub Agent hook triggered');
    sendResponse({ status: 'pending_integration' });
  }

  if (message.type === 'AWS_AGENT_ACTION') {
    console.log('AWS Agent hook triggered');
    sendResponse({ status: 'pending_integration' });
  }

  if (message.type === 'LEARNING_AGENT_ACTION') {
    console.log('Learning Agent hook triggered');
    sendResponse({ status: 'pending_integration' });
  }
});

// Handle toggle state changes
async function handleToggleChange(key, value) {
  console.log(`Toggle changed: ${key} = ${value}`);
  
  if (key === 'adBlocker') {
    await handleAdBlocker(value);
  }
  
  if (key === 'autoClearCache') {
    if (value) {
      console.log('Auto clear cache enabled - will clear on page refresh');
    } else {
      console.log('Auto clear cache disabled');
    }
  }

  const tabs = await browserAPI.tabs.query({});
  tabs.forEach(tab => {
    browserAPI.tabs.sendMessage(tab.id, {
      type: 'TOGGLE_UPDATE',
      key,
      value
    }).catch(() => {
      // Tab might not have content script loaded
    });
  });
}

console.log('Background service worker loaded (cross-browser compatible)');
