// Focus Handler for StayFocused Functionality
// Handles website blocking, timer management, and focus mode state persistence

// Storage keys
const STORAGE_KEYS = {
  BLACKLIST: 'blacklist',
  WHITELIST: 'whitelist',
  FOCUS_STATE: 'focusState',
  START_TIME: 'startTime',
  END_TIME: 'endTime',
  BLOCK_MODE: 'blockMode' // 'timed', 'untilTime', 'indefinite'
};

// Default configuration
const DEFAULT_CONFIG = {
  blacklist: ['facebook.com', 'twitter.com', 'youtube.com', 'instagram.com', 'reddit.com'],
  whitelist: ['google.com', 'stackoverflow.com'],
  focusState: false,
  startTime: null,
  endTime: null,
  blockMode: 'timed'
};

/**
 * Initialize the focus handler module
 */
export async function initializeFocusHandler() {
  // Set default values if not already set
  const data = await chrome.storage.local.get(Object.values(STORAGE_KEYS));

  const updates = {};
  for (const [key, defaultValue] of Object.entries(DEFAULT_CONFIG)) {
    if (data[key] === undefined) {
      updates[key] = defaultValue;
    }
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }

  // Check if we need to restore an active focus session
  const { focusState, endTime } = await chrome.storage.local.get([STORAGE_KEYS.FOCUS_STATE, STORAGE_KEYS.END_TIME]);

  if (focusState) {
    // If focus mode was active but the end time has passed, deactivate focus mode
    if (endTime && new Date(endTime) < new Date()) {
      await chrome.storage.local.set({ focusState: false });
      updateBlockRules(false);
    } else {
      // Re-enable blocking after browser restart if focus mode was active
      updateBlockRules(true);

      // If there's an end time, set up the alarm to disable focus mode
      if (endTime) {
        setupEndTimeAlarm(endTime);
      }
    }
  }
}

/**
 * Handle focus-related toggle changes
 */
export function handleFocusToggleChange(key, value) {
  if (key === 'stayFocused') {
    // This toggle only opens the focus mode UI, doesn't affect the actual blocking
    console.log('StayFocused toggle changed:', value);
  }
}

/**
 * Handle focus-related messages
 */
export function handleFocusMessage(message, sender, sendResponse) {
  if (message.type === 'FOCUS_START') {
    startFocusMode(message.options)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'FOCUS_STOP') {
    stopFocusMode()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'FOCUS_GET_STATUS') {
    getFocusStatus()
      .then(status => sendResponse({ success: true, ...status }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'FOCUS_UPDATE_SITES') {
    updateSiteLists(message.blacklist, message.whitelist)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'FOCUS_GET_SITES') {
    getSiteLists()
      .then(lists => sendResponse({ success: true, ...lists }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  return false; // Not handled
}

/**
 * Start focus mode with the given options
 */
async function startFocusMode(options) {
  const { blockMode, startNow, startTime, endTime } = options;

  // Save settings to storage
  await chrome.storage.local.set({
    [STORAGE_KEYS.FOCUS_STATE]: true,
    [STORAGE_KEYS.START_TIME]: startTime,
    [STORAGE_KEYS.END_TIME]: endTime,
    [STORAGE_KEYS.BLOCK_MODE]: blockMode
  });

  // Update blocking rules
  await updateBlockRules(true);

  // Set up end time alarm if needed
  if (endTime) {
    setupEndTimeAlarm(endTime);
  }

  return { success: true };
}

/**
 * Stop focus mode
 */
async function stopFocusMode() {
  // Update storage
  await chrome.storage.local.set({
    [STORAGE_KEYS.FOCUS_STATE]: false
  });

  // Clear alarm
  chrome.alarms.clear('endFocusMode');

  // Update blocking rules
  await updateBlockRules(false);

  return { success: true };
}

/**
 * Get current focus mode status
 */
async function getFocusStatus() {
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.FOCUS_STATE,
    STORAGE_KEYS.START_TIME,
    STORAGE_KEYS.END_TIME,
    STORAGE_KEYS.BLOCK_MODE
  ]);

  return {
    focusState: data[STORAGE_KEYS.FOCUS_STATE] || false,
    startTime: data[STORAGE_KEYS.START_TIME] || null,
    endTime: data[STORAGE_KEYS.END_TIME] || null,
    blockMode: data[STORAGE_KEYS.BLOCK_MODE] || 'timed'
  };
}

/**
 * Get blacklist and whitelist
 */
async function getSiteLists() {
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.BLACKLIST,
    STORAGE_KEYS.WHITELIST
  ]);

  return {
    blacklist: data[STORAGE_KEYS.BLACKLIST] || [],
    whitelist: data[STORAGE_KEYS.WHITELIST] || []
  };
}

/**
 * Update blacklist and whitelist
 */
async function updateSiteLists(blacklist, whitelist) {
  const updates = {};

  if (blacklist !== undefined) {
    updates[STORAGE_KEYS.BLACKLIST] = blacklist;
  }

  if (whitelist !== undefined) {
    updates[STORAGE_KEYS.WHITELIST] = whitelist;
  }

  await chrome.storage.local.set(updates);

  // If focus mode is active, update rules
  const { focusState } = await chrome.storage.local.get([STORAGE_KEYS.FOCUS_STATE]);
  if (focusState) {
    await updateBlockRules(true);
  }

  return { success: true };
}

/**
 * Set up an alarm to disable focus mode when end time is reached
 */
function setupEndTimeAlarm(endTimeString) {
  // Clear any existing alarms
  chrome.alarms.clear('endFocusMode');

  const endTime = new Date(endTimeString).getTime();
  const now = Date.now();

  // Only set alarm if end time is in the future
  if (endTime > now) {
    chrome.alarms.create('endFocusMode', {
      when: endTime
    });
  }
}

/**
 * Handle the alarm to end focus mode
 */
export function handleFocusAlarm(alarm) {
  if (alarm.name === 'endFocusMode') {
    // Disable focus mode
    chrome.storage.local.set({
      focusState: false
    }).then(() => {
      // Update blocking rules
      return updateBlockRules(false);
    }).then(() => {
      // Notify all tabs that focus mode has ended
      return chrome.tabs.query({});
    }).then(tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'FOCUS_MODE_ENDED' }).catch(() => {
          // Ignore errors from tabs that don't have a listener
        });
      });
    }).catch(error => {
      console.error('Error handling focus mode end alarm:', error);
    });
  }
}

/**
 * Update the blocking rules based on the current state
 */
async function updateBlockRules(isActive) {
  try {
    // Clear existing rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1]
    });

    // If focus mode is not active, don't add any rules
    if (!isActive) return;

    // Get the blacklist and whitelist
    const { blacklist, whitelist } = await chrome.storage.local.get([
      STORAGE_KEYS.BLACKLIST,
      STORAGE_KEYS.WHITELIST
    ]);

    if (!blacklist || !blacklist.length) return;

    // Create conditions for each blacklisted domain, excluding whitelisted ones
    const domainsToBlock = blacklist
      .filter(domain => !whitelist.includes(domain));

    // If no domains to block, exit
    if (domainsToBlock.length === 0) return;

    // Add rules for each domain (up to the maximum allowed by the API)
    const rules = domainsToBlock.slice(0, 50).map((domain, index) => {
      return {
        id: index + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: '/pages/blocked.html'
          }
        },
        condition: {
          urlFilter: `||${domain}`,
          resourceTypes: ['main_frame']
        }
      };
    });

    // Update dynamic rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules
    });
  } catch (error) {
    console.error('Error updating block rules:', error);
    throw error;
  }
}
