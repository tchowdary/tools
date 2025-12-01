// ============================================
// Navigation and UI Functions
// ============================================

import { showToast } from './utils.js';

/**
 * Initializes tool navigation
 */
export function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const toolSections = document.querySelectorAll('.tool-section');

  navItems.forEach(item => {
    item.addEventListener('click', function () {
      const toolId = this.getAttribute('data-tool');

      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');

      // Show selected tool section
      toolSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === toolId) {
          section.classList.add('active');
        }
      });
    });
  });
}

/**
 * Toggles a section's collapsed state
 * @param {HTMLElement} element - The element to toggle
 */
export function toggleSection(element) {
  const section = element.parentElement;
  const items = section.querySelector('.nav-items');
  section.classList.toggle('collapsed');

  const icon = element.querySelector('span');
  if (section.classList.contains('collapsed')) {
    icon.textContent = icon.textContent.replace('▼', '▶');
  } else {
    icon.textContent = icon.textContent.replace('▶', '▼');
  }
}

/**
 * Initializes search functionality
 */
export function initializeSearch() {
  document.getElementById('searchInput').addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

/**
 * Initializes theme management
 */
export function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

/**
 * Toggles between light and dark theme
 */
export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

/**
 * Updates the theme icon based on current theme
 * @param {string} theme - The current theme ('light' or 'dark')
 */
function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('themeIcon');
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/**
 * Toggles fullscreen mode for a tool section
 * @param {string} toolId - The ID of the tool section
 */
export function toggleFullscreen(toolId) {
  const toolSection = document.getElementById(toolId);
  const btn = toolSection.querySelector('.fullscreen-btn');

  if (toolSection.classList.contains('fullscreen')) {
    toolSection.classList.remove('fullscreen');
    btn.innerHTML = '<span>⛶</span> Fullscreen';
  } else {
    toolSection.classList.add('fullscreen');
    btn.innerHTML = '<span>⛶</span> Exit Fullscreen';
  }
}

/**
 * Toggles fullscreen mode for JSON output panel
 */
export function toggleJSONOutputFullscreen() {
  const panel = document.getElementById('jsonOutputPanel');
  const btn = document.getElementById('jsonOutputFullscreenBtn');

  if (panel.classList.contains('fullscreen')) {
    panel.classList.remove('fullscreen');
    btn.title = 'Toggle fullscreen';
  } else {
    panel.classList.add('fullscreen');
    btn.title = 'Exit fullscreen';
  }
}

/**
 * Toggles sidebar collapsed state
 */
export function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const isCollapsed = sidebar.classList.toggle('collapsed');

  // Save the collapsed state to localStorage
  localStorage.setItem('sidebarCollapsed', isCollapsed);
}

/**
 * Initializes sidebar state from localStorage
 */
export function initializeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

  if (isCollapsed) {
    sidebar.classList.add('collapsed');
  }
}

// Make functions globally available for HTML onclick handlers
window.toggleSection = toggleSection;
window.toggleTheme = toggleTheme;
window.toggleFullscreen = toggleFullscreen;
window.toggleJSONOutputFullscreen = toggleJSONOutputFullscreen;
window.toggleSidebar = toggleSidebar;
