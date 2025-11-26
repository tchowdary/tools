// ============================================
// Navigation and UI Functions
// ============================================

// Tool navigation
document.addEventListener('DOMContentLoaded', function () {
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

  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Start current time updates
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
});

// Section collapse/expand
function toggleSection(element) {
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

// Search functionality
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

// Theme toggle
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('themeIcon');
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Toast notification
function showToast(message, toastType) {
  toastType = toastType || 'success';
  const toast = document.createElement('div');
  toast.textContent = message;
  const bgColor = toastType === 'success' ? '#10b981' : '#ef4444';
  toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; background: ' + bgColor + '; color: white; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 10000; animation: slideIn 0.3s ease;';
  document.body.appendChild(toast);

  setTimeout(function () {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(function () { toast.remove(); }, 300);
  }, 3000);
}

// ============================================
// JSON Parser Functions
// ============================================

function formatJSON() {
  const input = document.getElementById('jsonInput').value;
  const output = document.getElementById('jsonOutput');
  const error = document.getElementById('errorMessage');
  const indentSize = parseInt(document.getElementById('indentSize').value);

  if (!input.trim()) {
    error.textContent = '';
    output.value = '';
    return;
  }

  try {
    const parsed = JSON.parse(input);
    output.value = JSON.stringify(parsed, null, indentSize);
    error.textContent = '';
    showToast('JSON formatted successfully');
  } catch (e) {
    error.textContent = '❌ Invalid JSON: ' + e.message;
    output.value = '';
  }
}

function minifyJSON() {
  const input = document.getElementById('jsonInput').value;
  const output = document.getElementById('jsonOutput');
  const error = document.getElementById('errorMessage');

  if (!input.trim()) {
    error.textContent = '';
    output.value = '';
    return;
  }

  try {
    const parsed = JSON.parse(input);
    output.value = JSON.stringify(parsed);
    error.textContent = '';
    showToast('JSON minified successfully');
  } catch (e) {
    error.textContent = '❌ Invalid JSON: ' + e.message;
    output.value = '';
  }
}

function clearJSON() {
  document.getElementById('jsonInput').value = '';
  document.getElementById('jsonOutput').value = '';
  document.getElementById('errorMessage').textContent = '';
}

function copyInput() {
  const input = document.getElementById('jsonInput');
  input.select();
  navigator.clipboard.writeText(input.value);
  showToast('Input copied to clipboard');
}

function copyOutput() {
  const output = document.getElementById('jsonOutput');
  if (output.value) {
    navigator.clipboard.writeText(output.value);
    showToast('Output copied to clipboard');
  }
}

function downloadJSON() {
  const output = document.getElementById('jsonOutput').value;
  if (!output) {
    showToast('No formatted JSON to download', 'error');
    return;
  }

  const blob = new Blob([output], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'formatted.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('JSON downloaded');
}

// ============================================
// Base64 Encoder/Decoder Functions
// ============================================

let base64Mode = 'encode';

function toggleBase64Mode() {
  base64Mode = base64Mode === 'encode' ? 'decode' : 'encode';
  updateBase64UI();
  processBase64();
}

function updateBase64UI() {
  const modeLabel = document.getElementById('base64ModeLabel');
  const modeToggle = document.getElementById('base64ModeToggle');
  const inputTitle = document.getElementById('base64InputTitle');
  const inputSubtitle = document.getElementById('base64InputSubtitle');
  const outputTitle = document.getElementById('base64OutputTitle');
  const outputSubtitle = document.getElementById('base64OutputSubtitle');
  const inputField = document.getElementById('base64Input');

  if (base64Mode === 'encode') {
    modeLabel.textContent = 'Encode Mode';
    modeToggle.innerHTML = '<span>🔄</span> Switch to Decode';
    inputTitle.textContent = 'Text to Encode';
    inputSubtitle.textContent = 'Enter text or upload a file to encode to Base64';
    outputTitle.textContent = 'Base64 Encoded';
    outputSubtitle.textContent = 'Base64 encoded output';
    inputField.placeholder = 'Enter text to encode...';
  } else {
    modeLabel.textContent = 'Decode Mode';
    modeToggle.innerHTML = '<span>🔄</span> Switch to Encode';
    inputTitle.textContent = 'Base64 to Decode';
    inputSubtitle.textContent = 'Enter Base64 encoded text to decode';
    outputTitle.textContent = 'Decoded Text';
    outputSubtitle.textContent = 'Decoded output';
    inputField.placeholder = 'Enter Base64 to decode...';
  }
}

function processBase64() {
  const input = document.getElementById('base64Input').value;
  const output = document.getElementById('base64Output');
  const error = document.getElementById('base64ErrorMessage');

  if (!input.trim()) {
    output.value = '';
    error.textContent = '';
    return;
  }

  try {
    if (base64Mode === 'encode') {
      output.value = btoa(unescape(encodeURIComponent(input)));
    } else {
      output.value = decodeURIComponent(escape(atob(input)));
    }
    error.textContent = '';
  } catch (e) {
    error.textContent = '❌ Error: ' + e.message;
    output.value = '';
  }
}

function uploadBase64File() {
  document.getElementById('base64FileInput').click();
}

function handleBase64FileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    if (base64Mode === 'encode') {
      document.getElementById('base64Input').value = e.target.result;
    } else {
      const textReader = new FileReader();
      textReader.onload = function (te) {
        document.getElementById('base64Input').value = te.target.result;
        processBase64();
      };
      textReader.readAsText(file);
      return;
    }
    processBase64();
  };

  if (base64Mode === 'encode') {
    reader.readAsText(file);
  }
}

function loadBase64Sample() {
  const sampleText = base64Mode === 'encode'
    ? 'Hello, World! This is a sample text for Base64 encoding.'
    : 'SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgZm9yIEJhc2U2NCBlbmNvZGluZy4=';

  document.getElementById('base64Input').value = sampleText;
  processBase64();
  showToast('Sample data loaded');
}

function clearBase64() {
  document.getElementById('base64Input').value = '';
  document.getElementById('base64Output').value = '';
  document.getElementById('base64ErrorMessage').textContent = '';
}

function copyBase64Input() {
  const input = document.getElementById('base64Input');
  if (input.value) {
    navigator.clipboard.writeText(input.value);
    showToast('Input copied to clipboard');
  }
}

function copyBase64Output() {
  const output = document.getElementById('base64Output');
  if (output.value) {
    navigator.clipboard.writeText(output.value);
    showToast('Output copied to clipboard');
  }
}

function downloadBase64() {
  const output = document.getElementById('base64Output').value;
  if (!output) {
    showToast('No output to download', 'error');
    return;
  }

  const blob = new Blob([output], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = base64Mode === 'encode' ? 'encoded.txt' : 'decoded.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('File downloaded');
}

// ============================================
// Timestamp Converter Functions
// ============================================

function updateCurrentTime() {
  const now = new Date();
  const timestampMs = now.getTime();
  const timestampS = Math.floor(timestampMs / 1000);

  document.getElementById('currentTimestampMs').textContent = timestampMs;
  document.getElementById('currentTimestampS').textContent = timestampS;
  document.getElementById('currentISO').textContent = now.toISOString();
  document.getElementById('currentUTC').textContent = now.toUTCString();
  document.getElementById('currentLocal').textContent = now.toLocaleString();
  document.getElementById('currentRelative').textContent = 'Just now';
}

function switchTimestampTab(tab) {
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

function convertTimestampToDate() {
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

function convertDateToTimestamp() {
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

function useCurrentTimestamp() {
  const now = new Date();
  document.getElementById('timestampInput').value = now.getTime();
  convertTimestampToDate();
}

function clearTimestampInput() {
  document.getElementById('timestampInput').value = '';
  document.getElementById('timestampResults').style.display = 'none';
  document.getElementById('timestampErrorMessage').textContent = '';
}

function useCurrentDate() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  document.getElementById('dateInput').value = dateStr;
  document.getElementById('timeInput').value = timeStr;
  convertDateToTimestamp();
}

function clearDateInput() {
  document.getElementById('dateInput').value = '';
  document.getElementById('timeInput').value = '';
  document.getElementById('dateResults').style.display = 'none';
  document.getElementById('timestampErrorMessage').textContent = '';
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  showToast('Copied to clipboard');
}
