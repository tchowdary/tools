// ============================================
// Main Application Entry Point
// ============================================

import { initializeNavigation, initializeSearch, initializeTheme, initializeSidebar, initializePaneDividers, initializeKeyboardShortcuts } from './ui.js';
import { updateCurrentTime } from './timestamp.js';
import { loadSavedSessionsList } from './json-storage.js';

// Import all modules to ensure they're loaded and their window functions are available
import './utils.js';
import './json-formatter.js';
import './base64.js';
import './jwt.js';
import './certificate.js';
import './world-clock.js';

/**
 * Initializes the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function () {
  // Initialize UI components
  initializeNavigation();
  initializeSearch();
  initializeTheme();
  initializeSidebar();
  initializePaneDividers();
  initializeKeyboardShortcuts();

  // Start current time updates
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);

  // Load saved JSON sessions on startup
  loadSavedSessionsList();

});
