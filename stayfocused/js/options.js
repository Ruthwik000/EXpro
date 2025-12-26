/**
 * StayFocused - Options Page Logic
 *
 * Handles:
 * - Loading/saving options
 * - Bulk editing of site lists
 * - Data import/export
 * - Settings reset
 */

// Storage keys - Keep in sync with background.js
const STORAGE_KEYS = {
  BLACKLIST: 'blacklist',
  WHITELIST: 'whitelist',
  FOCUS_STATE: 'focusState',
  START_TIME: 'startTime',
  END_TIME: 'endTime',
  BLOCK_MODE: 'blockMode',
  NOTIFY_END: 'notifyEnd',
  NOTIFY_ATTEMPT: 'notifyAttempt',
  SOUND_ENABLED: 'soundEnabled',
  DEFAULT_DURATION: 'defaultDuration',
  SCHEDULE_ENABLED: 'scheduleEnabled',
  SCHEDULE_DAYS: 'scheduleDays',
  SCHEDULE_START: 'scheduleStart',
  SCHEDULE_END: 'scheduleEnd'
};

// DOM elements
const elements = {
  // Success message
  saveStatus: document.getElementById('save-status'),

  // Default settings
  defaultBlockMode: document.getElementById('default-block-mode'),
  defaultDuration: document.getElementById('default-duration'),

  // Site management
  bulkBlacklist: document.getElementById('bulk-blacklist'),
  bulkWhitelist: document.getElementById('bulk-whitelist'),

  // Notifications
  notifyEnd: document.getElementById('notify-end'),
  notifyAttempt: document.getElementById('notify-attempt'),
  soundEnabled: document.getElementById('sound-enabled'),

  // Schedule
  scheduleEnabled: document.getElementById('schedule-enabled'),
  scheduleDays: document.getElementsByName('schedule-day'),
  scheduleStart: document.getElementById('schedule-start'),
  scheduleEnd: document.getElementById('schedule-end'),
  scheduleOptions: document.getElementById('schedule-options'),

  // Data management
  exportData: document.getElementById('export-data'),
  importData: document.getElementById('import-data'),
  importFile: document.getElementById('import-file'),
  resetData: document.getElementById('reset-data'),

  // Buttons
  saveOptions: document.getElementById('save-options')
};

/**
 * Initialize the options page
 */
async function initializeOptions() {
  // Load current settings
  await loadOptions();

  // Set up event listeners
  setupEventListeners();

  // Check initial schedule visibility
  toggleScheduleOptions();
}

/**
 * Load options from storage
 */
async function loadOptions() {
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.BLACKLIST,
    STORAGE_KEYS.WHITELIST,
    STORAGE_KEYS.BLOCK_MODE,
    STORAGE_KEYS.NOTIFY_END,
    STORAGE_KEYS.NOTIFY_ATTEMPT,
    STORAGE_KEYS.SOUND_ENABLED,
    STORAGE_KEYS.DEFAULT_DURATION,
    STORAGE_KEYS.SCHEDULE_ENABLED,
    STORAGE_KEYS.SCHEDULE_DAYS,
    STORAGE_KEYS.SCHEDULE_START,
    STORAGE_KEYS.SCHEDULE_END
  ]);

  // Default block mode
  elements.defaultBlockMode.value = data[STORAGE_KEYS.BLOCK_MODE] || 'timed';
  elements.defaultDuration.value = data[STORAGE_KEYS.DEFAULT_DURATION] || 60;

  // Site lists
  if (data[STORAGE_KEYS.BLACKLIST]) {
    elements.bulkBlacklist.value = data[STORAGE_KEYS.BLACKLIST].join('\n');
  }
  if (data[STORAGE_KEYS.WHITELIST]) {
    elements.bulkWhitelist.value = data[STORAGE_KEYS.WHITELIST].join('\n');
  }

  // Notification settings
  elements.notifyEnd.checked = data[STORAGE_KEYS.NOTIFY_END] !== false; // Default true
  elements.notifyAttempt.checked = data[STORAGE_KEYS.NOTIFY_ATTEMPT] !== false; // Default true
  elements.soundEnabled.checked = !!data[STORAGE_KEYS.SOUND_ENABLED]; // Default false

  // Schedule settings
  elements.scheduleEnabled.checked = !!data[STORAGE_KEYS.SCHEDULE_ENABLED];
  elements.scheduleStart.value = data[STORAGE_KEYS.SCHEDULE_START] || '09:00';
  elements.scheduleEnd.value = data[STORAGE_KEYS.SCHEDULE_END] || '17:00';

  // Set scheduled days
  const scheduledDays = data[STORAGE_KEYS.SCHEDULE_DAYS] || [1, 2, 3, 4, 5]; // Default weekdays
  for (const dayInput of elements.scheduleDays) {
    dayInput.checked = scheduledDays.includes(parseInt(dayInput.value));
  }
}

/**
 * Save options to storage
 */
async function saveOptions() {
  try {
    // Parse blacklist and whitelist from textareas
    const blacklist = elements.bulkBlacklist.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && isValidDomain(line));

    const whitelist = elements.bulkWhitelist.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && isValidDomain(line));

    // Get scheduled days
    const scheduleDays = [];
    for (const dayInput of elements.scheduleDays) {
      if (dayInput.checked) {
        scheduleDays.push(parseInt(dayInput.value));
      }
    }

    // Prepare data object
    const data = {
      [STORAGE_KEYS.BLACKLIST]: blacklist,
      [STORAGE_KEYS.WHITELIST]: whitelist,
      [STORAGE_KEYS.BLOCK_MODE]: elements.defaultBlockMode.value,
      [STORAGE_KEYS.DEFAULT_DURATION]: parseInt(elements.defaultDuration.value) || 60,
      [STORAGE_KEYS.NOTIFY_END]: elements.notifyEnd.checked,
      [STORAGE_KEYS.NOTIFY_ATTEMPT]: elements.notifyAttempt.checked,
      [STORAGE_KEYS.SOUND_ENABLED]: elements.soundEnabled.checked,
      [STORAGE_KEYS.SCHEDULE_ENABLED]: elements.scheduleEnabled.checked,
      [STORAGE_KEYS.SCHEDULE_DAYS]: scheduleDays,
      [STORAGE_KEYS.SCHEDULE_START]: elements.scheduleStart.value,
      [STORAGE_KEYS.SCHEDULE_END]: elements.scheduleEnd.value
    };

    // Save to storage
    await chrome.storage.local.set(data);

    // Show success message
    showSuccessMessage();
  } catch (error) {
    console.error('Error saving options:', error);
    alert('Failed to save options. Please try again.');
  }
}

/**
 * Show success message
 */
function showSuccessMessage() {
  elements.saveStatus.classList.add('visible');
  setTimeout(() => {
    elements.saveStatus.classList.remove('visible');
  }, 3000);
}

/**
 * Validate domain format
 */
function isValidDomain(domain) {
  // Simple regex for basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  return domainRegex.test(domain);
}

/**
 * Toggle schedule options visibility based on checkbox
 */
function toggleScheduleOptions() {
  if (elements.scheduleEnabled.checked) {
    elements.scheduleOptions.style.display = 'block';
  } else {
    elements.scheduleOptions.style.display = 'none';
  }
}

/**
 * Export settings to a JSON file
 */
function exportSettings() {
  chrome.storage.local.get(null, (data) => {
    // Convert to JSON
    const json = JSON.stringify(data, null, 2);

    // Create download link
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stayfocused-settings.json';
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  });
}

/**
 * Import settings from JSON file
 */
function importSettings() {
  elements.importFile.click();
}

/**
 * Handle file selection for import
 */
function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);

      // Confirm import
      if (confirm('Are you sure you want to import these settings? This will overwrite your current settings.')) {
        chrome.storage.local.set(data, () => {
          // Reload page to show new settings
          location.reload();
        });
      }
    } catch (error) {
      alert('Invalid settings file. Import failed.');
      console.error('Import error:', error);
    }
  };
  reader.readAsText(file);
}

/**
 * Reset all settings to defaults
 */
function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
    const defaultSettings = {
      [STORAGE_KEYS.BLACKLIST]: ['facebook.com', 'twitter.com', 'youtube.com', 'instagram.com', 'reddit.com'],
      [STORAGE_KEYS.WHITELIST]: ['google.com', 'stackoverflow.com'],
      [STORAGE_KEYS.FOCUS_STATE]: false,
      [STORAGE_KEYS.START_TIME]: null,
      [STORAGE_KEYS.END_TIME]: null,
      [STORAGE_KEYS.BLOCK_MODE]: 'timed',
      [STORAGE_KEYS.DEFAULT_DURATION]: 60,
      [STORAGE_KEYS.NOTIFY_END]: true,
      [STORAGE_KEYS.NOTIFY_ATTEMPT]: true,
      [STORAGE_KEYS.SOUND_ENABLED]: false,
      [STORAGE_KEYS.SCHEDULE_ENABLED]: false,
      [STORAGE_KEYS.SCHEDULE_DAYS]: [1, 2, 3, 4, 5],
      [STORAGE_KEYS.SCHEDULE_START]: '09:00',
      [STORAGE_KEYS.SCHEDULE_END]: '17:00'
    };

    chrome.storage.local.set(defaultSettings, () => {
      // Reload page to show default settings
      location.reload();
    });
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Save button
  elements.saveOptions.addEventListener('click', saveOptions);

  // Schedule toggle
  elements.scheduleEnabled.addEventListener('change', toggleScheduleOptions);

  // Data management
  elements.exportData.addEventListener('click', exportSettings);
  elements.importData.addEventListener('click', importSettings);
  elements.importFile.addEventListener('change', handleFileImport);
  elements.resetData.addEventListener('click', resetSettings);
}

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeOptions);
