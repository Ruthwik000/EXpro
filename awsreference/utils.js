/**
 * AWS Recommender Extension - Utility Functions
 * Contains helper functions for transforming inputs, calculating scores, and other utilities
 */

// Constants for scoring weights
const WEIGHTS = {
  WORKLOAD_TYPE: 2.5,
  SCALE: 1.5,
  BUDGET: 2.0,
  TRAFFIC_PATTERN: 1.5,
  CUSTOMIZATION: 1.0,
  PERFORMANCE: 1.8,
  OPS_PREFERENCE: 2.0
};

/**
 * Maps scale selection to numerical values for scoring
 * @param {string} scale - Scale option selected by the user
 * @returns {number} - Numerical value from 1-4
 */
function mapScaleToValue(scale) {
  const scaleMap = {
    'small': 1,
    'medium': 2,
    'large': 3,
    'enterprise': 4
  };
  return scaleMap[scale] || 2;
}

/**
 * Maps budget selection to numerical values for scoring
 * @param {string} budget - Budget option selected by the user
 * @returns {number} - Numerical value from 1-4
 */
function mapBudgetToValue(budget) {
  const budgetMap = {
    'veryLow': 1,
    'low': 2,
    'medium': 3,
    'high': 4
  };
  return budgetMap[budget] || 2;
}

/**
 * Maps traffic pattern to variability score
 * @param {string} trafficPattern - Traffic pattern selected by user
 * @returns {number} - Numerical value from 1-3
 */
function mapTrafficToVariability(trafficPattern) {
  const trafficMap = {
    'predictable': 1,
    'variable': 2,
    'spiky': 3
  };
  return trafficMap[trafficPattern] || 2;
}

/**
 * Maps customization level to numerical values for scoring
 * @param {string} customization - Customization level selected by user
 * @returns {number} - Numerical value from 1-3
 */
function mapCustomizationToValue(customization) {
  const customizationMap = {
    'low': 1,
    'medium': 2,
    'high': 3
  };
  return customizationMap[customization] || 2;
}

/**
 * Maps performance requirements to numerical values for scoring
 * @param {string} performance - Performance requirement selected by user
 * @returns {number} - Numerical value from 1-3
 */
function mapPerformanceToValue(performance) {
  const performanceMap = {
    'standard': 1,
    'high': 2,
    'lowLatency': 3
  };
  return performanceMap[performance] || 1;
}

/**
 * Maps operations preference to numerical values for scoring
 * @param {string} opsPreference - Operations preference selected by user
 * @returns {number} - Numerical value from 1-3
 */
function mapOpsToValue(opsPreference) {
  const opsMap = {
    'fullyManaged': 1,
    'partial': 2,
    'fullControl': 3
  };
  return opsMap[opsPreference] || 2;
}

/**
 * Normalizes a score to be between 0 and 100
 * @param {number} score - Raw score to normalize
 * @param {number} maxPossible - Maximum possible score
 * @returns {number} - Normalized score between 0-100
 */
function normalizeScore(score, maxPossible) {
  return Math.round((score / maxPossible) * 100);
}

/**
 * Formats a score for display
 * @param {number} score - Score to format
 * @returns {string} - Formatted score with % sign
 */
function formatScore(score) {
  return `${Math.round(score)}%`;
}

/**
 * Saves the last recommendation to chrome.storage.local
 * @param {Object} recommendation - The recommendation object to save
 * @returns {Promise} - Promise that resolves when the recommendation is saved
 */
function saveLastRecommendation(recommendation) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({
      'lastRecommendation': {
        timestamp: new Date().toISOString(),
        data: recommendation
      }
    }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Retrieves the last recommendation from chrome.storage.local
 * @returns {Promise} - Promise that resolves with the last recommendation
 */
function getLastRecommendation() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('lastRecommendation', (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.lastRecommendation || null);
      }
    });
  });
}

/**
 * Exports a recommendation as JSON and triggers download
 * @param {Object} recommendation - The recommendation to export
 */
function exportRecommendationAsJson(recommendation) {
  const dataStr = JSON.stringify(recommendation, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

  const exportFileName = `aws-recommendation-${new Date().toISOString().slice(0,10)}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileName);
  linkElement.click();
}

/**
 * Toggle dark mode for the extension UI
 * @param {boolean} isDark - Whether to enable dark mode
 */
function toggleDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  // Save the preference
  chrome.storage.local.set({ 'darkMode': isDark });
}

/**
 * Initialize dark mode based on saved preference
 */
function initDarkMode() {
  chrome.storage.local.get('darkMode', (result) => {
    const darkModeToggle = document.getElementById('darkMode');
    if (result.darkMode) {
      document.body.classList.add('dark-mode');
      if (darkModeToggle) {
        darkModeToggle.checked = true;
      }
    }
  });
}

// Export all utility functions
window.Utils = {
  WEIGHTS,
  mapScaleToValue,
  mapBudgetToValue,
  mapTrafficToVariability,
  mapCustomizationToValue,
  mapPerformanceToValue,
  mapOpsToValue,
  normalizeScore,
  formatScore,
  saveLastRecommendation,
  getLastRecommendation,
  exportRecommendationAsJson,
  toggleDarkMode,
  initDarkMode
};
