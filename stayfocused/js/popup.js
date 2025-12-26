/**
 * StayFocused - Popup Logic
 *
 * Handles:
 * - Focus mode UI toggling
 * - Site list management
 * - Timer display and settings
 * - Communication with background script
 */

// Storage keys - Keep in sync with background.js
const STORAGE_KEYS = {
  BLACKLIST: 'blacklist',
  WHITELIST: 'whitelist',
  FOCUS_STATE: 'focusState',
  START_TIME: 'startTime',
  END_TIME: 'endTime',
  BLOCK_MODE: 'blockMode' // 'timed', 'untilTime', 'indefinite'
};

// DOM Elements
const elements = {
  // Status elements
  statusIndicator: document.getElementById('status-indicator'),
  focusState: document.getElementById('focus-state'),

  // Timer section
  timerSection: document.getElementById('timer-display'),
  remainingTime: document.getElementById('remaining-time'),
  stopFocusBtn: document.getElementById('stop-focus'),

  // Focus controls
  focusControls: document.getElementById('focus-controls'),
  blockType: document.getElementById('block-type'),
  startFocusBtn: document.getElementById('start-focus'),

  // Duration options
  fixedTimeOptions: document.getElementById('fixed-time-options'),
  untilTimeOptions: document.getElementById('until-time-options'),
  durationHours: document.getElementById('duration-hours'),
  durationMinutes: document.getElementById('duration-minutes'),
  endTime: document.getElementById('end-time'),

  // Start options
  startNow: document.getElementById('start-now'),
  delayedStartOptions: document.getElementById('delayed-start-options'),
  startTime: document.getElementById('start-time'),

  // Site lists
  blockedSiteInput: document.getElementById('new-blocked-site'),
  allowedSiteInput: document.getElementById('new-allowed-site'),
  blockedSitesList: document.getElementById('blocked-sites-list'),
  allowedSitesList: document.getElementById('allowed-sites-list'),
  addBlockedSiteBtn: document.getElementById('add-blocked-site'),
  addAllowedSiteBtn: document.getElementById('add-allowed-site'),

  // Options
  openOptionsBtn: document.getElementById('open-options')
};

// Initialize the popup
async function initializePopup() {
  // Load current settings
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.FOCUS_STATE,
    STORAGE_KEYS.BLACKLIST,
    STORAGE_KEYS.WHITELIST,
    STORAGE_KEYS.START_TIME,
    STORAGE_KEYS.END_TIME,
    STORAGE_KEYS.BLOCK_MODE
  ]);

  // Set defaults if not found
  const settings = {
    focusState: data[STORAGE_KEYS.FOCUS_STATE] || false,
    blacklist: data[STORAGE_KEYS.BLACKLIST] || [],
    whitelist: data[STORAGE_KEYS.WHITELIST] || [],
    startTime: data[STORAGE_KEYS.START_TIME] || null,
    endTime: data[STORAGE_KEYS.END_TIME] || null,
    blockMode: data[STORAGE_KEYS.BLOCK_MODE] || 'timed'
  };

  // Update UI based on current settings
  updateFocusStatus(settings.focusState, settings.endTime);
  populateSiteLists(settings.blacklist, settings.whitelist);

  // Set block type
  elements.blockType.value = settings.blockMode;
  handleBlockTypeChange();

  // Set default times
  setDefaultTimes();

  // Set up event listeners
  setupEventListeners();
}

/**
 * Update the focus status UI
 */
function updateFocusStatus(isActive, endTimeString) {
  if (isActive) {
    // Update status indicator
    elements.statusIndicator.classList.add('active');
    elements.focusState.textContent = 'ON';
    elements.focusState.classList.add('active');

    // Show timer section, hide controls
    elements.timerSection.classList.add('active');
    elements.focusControls.style.display = 'none';

    // Update remaining time if endTimeString is provided
    if (endTimeString) {
      updateRemainingTime(endTimeString);
      // Start timer update interval
      startTimerInterval(endTimeString);
    } else {
      elements.remainingTime.textContent = 'Until manually disabled';
    }
  } else {
    // Update status indicator to inactive
    elements.statusIndicator.classList.remove('active');
    elements.focusState.textContent = 'OFF';
    elements.focusState.classList.remove('active');

    // Hide timer section, show controls
    elements.timerSection.classList.remove('active');
    elements.focusControls.style.display = 'block';

    // Stop timer interval if it's running
    stopTimerInterval();
  }
}

/**
 * Set up a timer interval to update remaining time
 */
let timerIntervalId = null;
function startTimerInterval(endTimeString) {
  // Clear any existing interval
  stopTimerInterval();

  // Update immediately
  updateRemainingTime(endTimeString);

  // Set interval to update every second
  timerIntervalId = setInterval(() => {
    const stillActive = updateRemainingTime(endTimeString);
    if (!stillActive) {
      // Time has expired, refresh UI
      chrome.storage.local.get([STORAGE_KEYS.FOCUS_STATE], (data) => {
        updateFocusStatus(data[STORAGE_KEYS.FOCUS_STATE] || false, null);
      });
    }
  }, 1000);
}

/**
 * Stop the timer interval
 */
function stopTimerInterval() {
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

/**
 * Update remaining time display
 * Returns false if time has expired, true otherwise
 */
function updateRemainingTime(endTimeString) {
  const now = new Date();
  const endTime = new Date(endTimeString);

  // If end time has passed, return false
  if (now >= endTime) {
    elements.remainingTime.textContent = 'Time expired';
    return false;
  }

  // Calculate time difference
  const diff = endTime - now;

  // Format time difference
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Format with leading zeros
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Update display
  elements.remainingTime.textContent = formattedTime;

  return true;
}

/**
 * Populate blocked and allowed sites lists
 */
function populateSiteLists(blacklist, whitelist) {
  // Clear existing lists
  elements.blockedSitesList.innerHTML = '';
  elements.allowedSitesList.innerHTML = '';

  // Add blacklisted sites
  blacklist.forEach(site => {
    addSiteToList(site, elements.blockedSitesList, 'blacklist');
  });

  // Add whitelisted sites
  whitelist.forEach(site => {
    addSiteToList(site, elements.allowedSitesList, 'whitelist');
  });
}

/**
 * Add a site to a list with remove button
 */
function addSiteToList(site, listElement, listType) {
  const li = document.createElement('li');

  const siteText = document.createElement('span');
  siteText.textContent = site;
  li.appendChild(siteText);

  const removeBtn = document.createElement('button');
  removeBtn.innerHTML = '&times;';
  removeBtn.className = 'remove-btn';
  removeBtn.addEventListener('click', () => removeSite(site, listType));
  li.appendChild(removeBtn);

  listElement.appendChild(li);
}

/**
 * Remove a site from storage and UI
 */
async function removeSite(site, listType) {
  const storageKey = listType === 'blacklist' ? STORAGE_KEYS.BLACKLIST : STORAGE_KEYS.WHITELIST;

  // Get current list
  const data = await chrome.storage.local.get([storageKey]);
  const sites = data[storageKey] || [];

  // Remove site
  const updatedSites = sites.filter(s => s !== site);

  // Save updated list
  await chrome.storage.local.set({ [storageKey]: updatedSites });

  // Refresh the UI lists
  const allData = await chrome.storage.local.get([STORAGE_KEYS.BLACKLIST, STORAGE_KEYS.WHITELIST]);
  populateSiteLists(allData[STORAGE_KEYS.BLACKLIST] || [], allData[STORAGE_KEYS.WHITELIST] || []);
}

/**
 * Add a new site to the blacklist or whitelist
 */
async function addSite(input, listType) {
  const site = input.value.trim().toLowerCase();

  // Validate input - simple domain format validation
  if (!site || !isValidDomain(site)) {
    alert('Please enter a valid domain (e.g., facebook.com, twitter.com)');
    return;
  }

  const storageKey = listType === 'blacklist' ? STORAGE_KEYS.BLACKLIST : STORAGE_KEYS.WHITELIST;

  // Get current list
  const data = await chrome.storage.local.get([storageKey]);
  const sites = data[storageKey] || [];

  // Check if site already exists
  if (sites.includes(site)) {
    alert(`${site} is already in the ${listType === 'blacklist' ? 'blocked' : 'allowed'} sites list.`);
    return;
  }

  // Add site
  sites.push(site);

  // Save updated list
  await chrome.storage.local.set({ [storageKey]: sites });

  // Clear input
  input.value = '';

  // Refresh the UI lists
  const allData = await chrome.storage.local.get([STORAGE_KEYS.BLACKLIST, STORAGE_KEYS.WHITELIST]);
  populateSiteLists(allData[STORAGE_KEYS.BLACKLIST] || [], allData[STORAGE_KEYS.WHITELIST] || []);
}

/**
 * Validate domain format
 * Simple validation to ensure it looks like a domain
 */
function isValidDomain(domain) {
  // Simple regex for basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  return domainRegex.test(domain);
}

/**
 * Set default values for time inputs
 */
function setDefaultTimes() {
  // Default end time: 1 hour from now
  const oneHourLater = new Date();
  oneHourLater.setHours(oneHourLater.getHours() + 1);
  const endTimeString = oneHourLater.toTimeString().slice(0, 5); // Format: HH:MM
  elements.endTime.value = endTimeString;

  // Default start time: now
  const now = new Date();
  const startTimeString = now.toTimeString().slice(0, 5); // Format: HH:MM
  elements.startTime.value = startTimeString;
}

/**
 * Handle changes to block type select
 */
function handleBlockTypeChange() {
  const blockType = elements.blockType.value;

  // Hide all options first
  elements.fixedTimeOptions.classList.remove('active');
  elements.untilTimeOptions.classList.remove('active');

  // Show relevant options based on selection
  if (blockType === 'timed') {
    elements.fixedTimeOptions.classList.add('active');
  } else if (blockType === 'untilTime') {
    elements.untilTimeOptions.classList.add('active');
  }
  // No options needed for indefinite
}

/**
 * Handle start now checkbox toggle
 */
function handleStartNowToggle() {
  if (elements.startNow.checked) {
    elements.delayedStartOptions.classList.remove('active');
  } else {
    elements.delayedStartOptions.classList.add('active');
  }
}

/**
 * Start focus mode
 */
async function startFocusMode() {
  const blockMode = elements.blockType.value;
  const startNow = elements.startNow.checked;

  let startTime, endTime;
  const now = new Date();

  // Set start time
  if (startNow) {
    startTime = now;
  } else {
    // Parse start time
    const [hours, minutes] = elements.startTime.value.split(':').map(Number);
    startTime = new Date(now);
    startTime.setHours(hours, minutes, 0);

    // If start time is in the past, set it to tomorrow
    if (startTime < now) {
      startTime.setDate(startTime.getDate() + 1);
    }
  }

  // Calculate end time based on block mode
  if (blockMode === 'timed') {
    // Get hours and minutes
    const hours = parseInt(elements.durationHours.value) || 0;
    const minutes = parseInt(elements.durationMinutes.value) || 0;

    // Ensure at least 1 minute
    if (hours === 0 && minutes === 0) {
      alert('Please set a duration of at least 1 minute.');
      return;
    }

    // Calculate end time
    endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + hours);
    endTime.setMinutes(endTime.getMinutes() + minutes);

  } else if (blockMode === 'untilTime') {
    // Parse end time
    const [hours, minutes] = elements.endTime.value.split(':').map(Number);
    endTime = new Date(now);
    endTime.setHours(hours, minutes, 0);

    // If end time is before start time, set it to tomorrow
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

  } else if (blockMode === 'indefinite') {
    // No end time for indefinite blocking
    endTime = null;
  }

  // Get site lists to make sure we have something to block
  const data = await chrome.storage.local.get([STORAGE_KEYS.BLACKLIST]);
  const blacklist = data[STORAGE_KEYS.BLACKLIST] || [];

  if (blacklist.length === 0) {
    alert('Please add at least one site to block before starting focus mode.');
    return;
  }

  // Save settings to storage
  await chrome.storage.local.set({
    [STORAGE_KEYS.FOCUS_STATE]: true,
    [STORAGE_KEYS.START_TIME]: startTime.toISOString(),
    [STORAGE_KEYS.END_TIME]: endTime ? endTime.toISOString() : null,
    [STORAGE_KEYS.BLOCK_MODE]: blockMode
  });

  // Update UI
  updateFocusStatus(true, endTime ? endTime.toISOString() : null);
}

/**
 * Stop focus mode
 */
async function stopFocusMode() {
  // Update storage
  await chrome.storage.local.set({
    [STORAGE_KEYS.FOCUS_STATE]: false
  });

  // Update UI
  updateFocusStatus(false);
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Focus mode controls
  elements.blockType.addEventListener('change', handleBlockTypeChange);
  elements.startNow.addEventListener('change', handleStartNowToggle);
  elements.startFocusBtn.addEventListener('click', startFocusMode);
  elements.stopFocusBtn.addEventListener('click', stopFocusMode);

  // Site list controls
  elements.addBlockedSiteBtn.addEventListener('click', () => {
    addSite(elements.blockedSiteInput, 'blacklist');
  });
  elements.addAllowedSiteBtn.addEventListener('click', () => {
    addSite(elements.allowedSiteInput, 'whitelist');
  });

  // Allow Enter key to add sites
  elements.blockedSiteInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      addSite(elements.blockedSiteInput, 'blacklist');
    }
  });
  elements.allowedSiteInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      addSite(elements.allowedSiteInput, 'whitelist');
    }
  });

  // Options button
  elements.openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

// Initialize popup when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePopup);
