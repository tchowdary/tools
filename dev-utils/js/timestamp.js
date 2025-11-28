// ============================================
// Timestamp Converter Functions
// ============================================

import { copyToClipboard } from './utils.js';

/**
 * Updates the current time display
 */
export function updateCurrentTime() {
  const now = new Date();
  const timestampMs = now.getTime();
  const timestampS = Math.floor(timestampMs / 1000);

  document.getElementById('currentTimestampMs').textContent = timestampMs;
  document.getElementById('currentTimestampS').textContent = timestampS;
  document.getElementById('currentUTC').textContent = now.toUTCString();
  document.getElementById('currentLocal').textContent = now.toLocaleString();
}

/**
 * Switches between timestamp to date and date to timestamp tabs
 * @param {string} tab - The tab to switch to ('timestampToDate' or 'dateToTimestamp')
 */
export function switchTimestampTab(tab) {
  const tabTimestampToDate = document.getElementById('tabTimestampToDate');
  const tabDateToTimestamp = document.getElementById('tabDateToTimestamp');
  const timestampToDateTab = document.getElementById('timestampToDateTab');
  const dateToTimestampTab = document.getElementById('dateToTimestampTab');

  if (tab === 'timestampToDate') {
    tabTimestampToDate.classList.remove('btn-secondary');
    tabTimestampToDate.classList.add('btn-primary');
    tabDateToTimestamp.classList.remove('btn-primary');
    tabDateToTimestamp.classList.add('btn-secondary');
    timestampToDateTab.style.display = 'block';
    dateToTimestampTab.style.display = 'none';
  } else {
    tabDateToTimestamp.classList.remove('btn-secondary');
    tabDateToTimestamp.classList.add('btn-primary');
    tabTimestampToDate.classList.remove('btn-primary');
    tabTimestampToDate.classList.add('btn-secondary');
    dateToTimestampTab.style.display = 'block';
    timestampToDateTab.style.display = 'none';
  }
}

/**
 * Converts a timestamp to various date formats
 */
export function convertTimestampToDate() {
  const input = document.getElementById('timestampInput').value.trim();
  const results = document.getElementById('timestampResults');
  const error = document.getElementById('timestampErrorMessage');

  if (!input) {
    results.style.display = 'none';
    error.textContent = '';
    return;
  }

  try {
    let timestamp = parseInt(input);

    if (timestamp < 10000000000) {
      timestamp = timestamp * 1000;
    }

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp');
    }

    document.getElementById('resultISO').textContent = date.toISOString();
    document.getElementById('resultUTC').textContent = date.toUTCString();
    document.getElementById('resultLocal').textContent = date.toLocaleString();
    document.getElementById('resultRelative').textContent = getRelativeTime(date);
    document.getElementById('resultUnixS').textContent = Math.floor(timestamp / 1000);
    document.getElementById('resultUnixMs').textContent = timestamp;

    results.style.display = 'block';
    error.textContent = '';
  } catch (e) {
    error.textContent = '❌ Invalid timestamp: ' + e.message;
    results.style.display = 'none';
  }
}

/**
 * Converts a date to timestamp
 */
export function convertDateToTimestamp() {
  const dateInput = document.getElementById('dateInput').value;
  const timeInput = document.getElementById('timeInput').value;
  const results = document.getElementById('dateResults');
  const error = document.getElementById('timestampErrorMessage');

  if (!dateInput) {
    results.style.display = 'none';
    error.textContent = '';
    return;
  }

  try {
    const dateTimeString = dateInput + (timeInput ? 'T' + timeInput : 'T00:00:00');
    const date = new Date(dateTimeString);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const timestampMs = date.getTime();
    const timestampS = Math.floor(timestampMs / 1000);

    document.getElementById('dateResultUnixS').textContent = timestampS;
    document.getElementById('dateResultUnixMs').textContent = timestampMs;
    document.getElementById('dateResultISO').textContent = date.toISOString();

    results.style.display = 'block';
    error.textContent = '';
  } catch (e) {
    error.textContent = '❌ Invalid date: ' + e.message;
    results.style.display = 'none';
  }
}

/**
 * Gets relative time description
 * @param {Date} date - The date to compare
 * @returns {string} Relative time description
 */
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return diffSec + ' seconds ago';
  if (diffMin < 60) return diffMin + ' minutes ago';
  if (diffHour < 24) return diffHour + ' hours ago';
  if (diffDay < 30) return diffDay + ' days ago';
  if (diffDay < 365) return Math.floor(diffDay / 30) + ' months ago';
  return Math.floor(diffDay / 365) + ' years ago';
}

/**
 * Uses current timestamp in the converter
 */
export function useCurrentTimestamp() {
  const now = new Date();
  document.getElementById('timestampInput').value = now.getTime();
  convertTimestampToDate();
}

/**
 * Clears timestamp input
 */
export function clearTimestampInput() {
  document.getElementById('timestampInput').value = '';
  document.getElementById('timestampResults').style.display = 'none';
  document.getElementById('timestampErrorMessage').textContent = '';
}

/**
 * Uses current date in the converter
 */
export function useCurrentDate() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  document.getElementById('dateInput').value = dateStr;
  document.getElementById('timeInput').value = timeStr;
  convertDateToTimestamp();
}

/**
 * Clears date input
 */
export function clearDateInput() {
  document.getElementById('dateInput').value = '';
  document.getElementById('timeInput').value = '';
  document.getElementById('dateResults').style.display = 'none';
  document.getElementById('timestampErrorMessage').textContent = '';
}

// Make functions globally available for HTML onclick handlers
window.updateCurrentTime = updateCurrentTime;
window.switchTimestampTab = switchTimestampTab;
window.convertTimestampToDate = convertTimestampToDate;
window.convertDateToTimestamp = convertDateToTimestamp;
window.useCurrentTimestamp = useCurrentTimestamp;
window.clearTimestampInput = clearTimestampInput;
window.useCurrentDate = useCurrentDate;
window.clearDateInput = clearDateInput;
window.copyToClipboard = copyToClipboard;
