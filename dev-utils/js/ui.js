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

/**
 * Initializes keyboard shortcuts
 */
export function initializeKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+F: Toggle JSON output fullscreen
    if (e.ctrlKey && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      const panel = document.getElementById('jsonOutputPanel');
      if (panel) {
        toggleJSONOutputFullscreen();
      }
    }

    // Escape: Exit fullscreen mode
    if (e.key === 'Escape') {
      const panel = document.getElementById('jsonOutputPanel');
      if (panel && panel.classList.contains('fullscreen')) {
        toggleJSONOutputFullscreen();
      }
    }
  });
}

/**
 * Initializes draggable pane dividers
 */
export function initializePaneDividers() {
  const dividers = document.querySelectorAll('.pane-divider');

  dividers.forEach(divider => {
    let isResizing = false;
    let startX = 0;
    let startLeftWidth = 0;
    let startRightWidth = 0;
    let leftPane = null;
    let rightPane = null;
    let container = null;

    const onMouseDown = (e) => {
      isResizing = true;
      startX = e.clientX;

      // Get the panes on either side of the divider
      leftPane = divider.previousElementSibling;
      rightPane = divider.nextElementSibling;
      container = divider.parentElement;

      if (leftPane && rightPane) {
        startLeftWidth = leftPane.getBoundingClientRect().width;
        startRightWidth = rightPane.getBoundingClientRect().width;

        divider.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      }

      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isResizing || !leftPane || !rightPane) return;

      const deltaX = e.clientX - startX;
      const containerWidth = container.getBoundingClientRect().width;
      const dividerWidth = divider.getBoundingClientRect().width;

      // Calculate new widths
      let newLeftWidth = startLeftWidth + deltaX;
      let newRightWidth = startRightWidth - deltaX;

      // Enforce minimum widths (200px)
      const minWidth = 200;
      if (newLeftWidth < minWidth) {
        newLeftWidth = minWidth;
        newRightWidth = containerWidth - minWidth - dividerWidth;
      } else if (newRightWidth < minWidth) {
        newRightWidth = minWidth;
        newLeftWidth = containerWidth - minWidth - dividerWidth;
      }

      // Calculate percentages for flex-basis
      const totalPaneWidth = containerWidth - dividerWidth;
      const leftPercent = (newLeftWidth / totalPaneWidth) * 100;
      const rightPercent = (newRightWidth / totalPaneWidth) * 100;

      // Apply the new widths
      leftPane.style.flex = `0 0 ${leftPercent}%`;
      rightPane.style.flex = `0 0 ${rightPercent}%`;

      e.preventDefault();
    };

    const onMouseUp = () => {
      if (isResizing) {
        isResizing = false;
        divider.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // Save the current widths to localStorage
        if (leftPane && rightPane) {
          const containerId = container.closest('.tool-section')?.id || 'default';
          const leftFlex = leftPane.style.flex;
          const rightFlex = rightPane.style.flex;

          localStorage.setItem(`pane-${containerId}-left`, leftFlex);
          localStorage.setItem(`pane-${containerId}-right`, rightFlex);
        }
      }
    };

    divider.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // Restore saved pane sizes
  restorePaneSizes();
}

/**
 * Restores saved pane sizes from localStorage
 */
function restorePaneSizes() {
  const containers = document.querySelectorAll('.editor-container');

  containers.forEach(container => {
    const containerId = container.closest('.tool-section')?.id || 'default';
    const leftFlex = localStorage.getItem(`pane-${containerId}-left`);
    const rightFlex = localStorage.getItem(`pane-${containerId}-right`);

    if (leftFlex && rightFlex) {
      const leftPane = container.querySelector('.editor-panel:first-child');
      const rightPane = container.querySelector('.editor-panel:last-child');

      if (leftPane && rightPane) {
        leftPane.style.flex = leftFlex;
        rightPane.style.flex = rightFlex;
      }
    }
  });
}

// Make functions globally available for HTML onclick handlers
window.toggleSection = toggleSection;
window.toggleTheme = toggleTheme;
window.toggleFullscreen = toggleFullscreen;
window.toggleJSONOutputFullscreen = toggleJSONOutputFullscreen;
window.toggleSidebar = toggleSidebar;

console.log('UI module loaded. toggleSidebar:', typeof window.toggleSidebar);
