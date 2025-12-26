/**
 * StayFocused - Background Service Worker
 *
 * Handles:
 * - Website blocking logic
 * - Timer management
 * - Rule updating based on blocked/whitelisted sites
 * - Focus mode state persistence
 */

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

// Initialize the extension
async function initialize() {
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

  // Listen for changes to the storage
  chrome.storage.onChanged.addListener(handleStorageChanges);
}

/**
 * Handle changes to the storage
 */
function handleStorageChanges(changes, namespace) {
  if (namespace !== 'local') return;

  // If focus state changed
  if (changes.focusState) {
    updateBlockRules(changes.focusState.newValue);
  }

  // If blocklist or whitelist changed and focus mode is active, update rules
  if ((changes.blacklist || changes.whitelist) &&
      (!changes.focusState || changes.focusState.newValue)) {
    updateBlockRules(true);
  }

  // If end time changed, update the alarm
  if (changes.endTime && changes.endTime.newValue) {
    setupEndTimeAlarm(changes.endTime.newValue);
  }
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
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'endFocusMode') {
    // Disable focus mode
    await chrome.storage.local.set({
      focusState: false
    });

    // Update blocking rules
    updateBlockRules(false);

    // Notify all tabs that focus mode has ended
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: 'focusModeEnded' }).catch(() => {
        // Ignore errors from tabs that don't have a listener
      });
    });
  }
});

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
    const domainConditions = blacklist
      .filter(domain => !whitelist.includes(domain))
      .map(domain => {
        return {
          urlFilter: `||${domain}`,
          resourceTypes: ['main_frame']
        };
      });

    // If no domains to block, exit
    if (domainConditions.length === 0) return;

    // Add the new rule to redirect to blocked page
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [{
        id: 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: '/pages/blocked.html'
          }
        },
        condition: domainConditions[0]
      }]
    });

    // If we have multiple domains, add rules for each domain
    if (domainConditions.length > 1) {
      const additionalRules = domainConditions.slice(1).map((condition, index) => {
        return {
          id: index + 2, // Start IDs at 2
          priority: 1,
          action: {
            type: 'redirect',
            redirect: {
              extensionPath: '/pages/blocked.html'
            }
          },
          condition: condition
        };
      });

      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: additionalRules
      });
    }
  } catch (error) {
    console.error('Error updating block rules:', error);
  }
}

/**
 * Get active blocking info to display on the blocked page
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBlockingInfo') {
    chrome.storage.local.get([
      STORAGE_KEYS.END_TIME,
      STORAGE_KEYS.BLOCK_MODE
    ], (data) => {
      sendResponse({
        endTime: data.endTime,
        blockMode: data.blockMode
      });
    });
    return true; // Required for async response
  }
});

// Initialize the extension when installed or updated
chrome.runtime.onInstalled.addListener(initialize);

// Initialize on startup
initialize();
