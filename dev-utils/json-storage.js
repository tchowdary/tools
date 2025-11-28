// ============================================
// Local Storage Functions for JSON Sessions
// ============================================

import { showToast } from './utils.js';
import { getJsonParsedData, formatJSON } from './json-formatter.js';

const MAX_SESSIONS = 10;
const STORAGE_KEY = 'jsonSessions';

/**
 * Saves the current JSON data as a session
 */
export function saveJSON() {
  const jsonParsedData = getJsonParsedData();

  if (!jsonParsedData) {
    showToast('No JSON data to save', 'error');
    return;
  }

  try {
    // Get existing sessions
    let sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Create new session
    const newSession = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      data: jsonParsedData,
      preview: generatePreview(jsonParsedData)
    };

    // Add new session at the beginning
    sessions.unshift(newSession);

    // Keep only the last MAX_SESSIONS
    if (sessions.length > MAX_SESSIONS) {
      sessions = sessions.slice(0, MAX_SESSIONS);
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

    // Refresh the dropdown
    loadSavedSessionsList();

    showToast('JSON saved successfully');
  } catch (e) {
    showToast('Failed to save JSON: ' + e.message, 'error');
  }
}

/**
 * Loads a saved session from localStorage
 */
export function loadSavedSession() {
  const dropdown = document.getElementById('savedSessionsDropdown');
  const sessionId = dropdown.value;

  if (!sessionId) {
    return;
  }

  try {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const session = sessions.find(function(s) { return s.id == sessionId; });

    if (session) {
      // Load the session data
      const jsonString = JSON.stringify(session.data, null, 2);
      document.getElementById('jsonInput').value = jsonString;

      // Format and display
      formatJSON();

      showToast('Session loaded successfully');
    }
  } catch (e) {
    showToast('Failed to load session: ' + e.message, 'error');
  }

  // Reset dropdown
  dropdown.value = '';
}

/**
 * Loads and populates the saved sessions dropdown
 */
export function loadSavedSessionsList() {
  const dropdown = document.getElementById('savedSessionsDropdown');

  if (!dropdown) {
    return;
  }

  try {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">Select a session...</option>';

    // Add sessions to dropdown
    sessions.forEach(function(session) {
      const option = document.createElement('option');
      option.value = session.id;

      const date = new Date(session.timestamp);
      const dateStr = date.toLocaleString();

      option.textContent = dateStr + ' - ' + session.preview;
      dropdown.appendChild(option);
    });
  } catch (e) {
    console.error('Failed to load sessions list:', e);
  }
}

/**
 * Generates a preview string for session data
 * @param {*} data - The session data
 * @returns {string} Preview string
 */
function generatePreview(data) {
  const jsonString = JSON.stringify(data);
  const maxLength = 30;

  if (jsonString.length <= maxLength) {
    return jsonString;
  }

  return jsonString.substring(0, maxLength) + '...';
}

/**
 * Deletes a saved session
 * @param {number} sessionId - The ID of the session to delete
 */
export function deleteSavedSession(sessionId) {
  try {
    let sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    sessions = sessions.filter(function(s) { return s.id !== sessionId; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    loadSavedSessionsList();
    showToast('Session deleted');
  } catch (e) {
    showToast('Failed to delete session: ' + e.message, 'error');
  }
}

/**
 * Clears all saved sessions
 */
export function clearAllSessions() {
  if (confirm('Are you sure you want to clear all saved sessions?')) {
    localStorage.removeItem(STORAGE_KEY);
    loadSavedSessionsList();
    showToast('All sessions cleared');
  }
}

// Make functions globally available for HTML onclick handlers
window.saveJSON = saveJSON;
window.loadSavedSession = loadSavedSession;
window.deleteSavedSession = deleteSavedSession;
window.clearAllSessions = clearAllSessions;
