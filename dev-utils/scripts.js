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

// Fullscreen toggle
function toggleFullscreen(toolId) {
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

// JSON Output Panel Fullscreen toggle
function toggleJSONOutputFullscreen() {
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

let jsonParsedData = null;

function formatJSON() {
  const input = document.getElementById('jsonInput').value;
  const output = document.getElementById('jsonOutput');
  const error = document.getElementById('errorMessage');

  if (!input.trim()) {
    error.textContent = '';
    output.innerHTML = '';
    jsonParsedData = null;
    return;
  }

  try {
    const parsed = JSON.parse(input);
    jsonParsedData = parsed;
    renderJSONTree(parsed, output);
    error.textContent = '';
  } catch (e) {
    error.textContent = '❌ Invalid JSON: ' + e.message;
    output.innerHTML = '';
    jsonParsedData = null;
  }
}

function renderJSONTree(data, container, isCollapsed = false) {
  container.innerHTML = '';
  const tree = createJSONNode(data, '', 0);
  container.appendChild(tree);
}

function createJSONNode(data, key, level) {
  const container = document.createElement('div');
  container.className = 'json-node';
  container.style.marginLeft = (level * 20) + 'px';

  if (data === null) {
    container.innerHTML = createKeyValue(key, 'null', 'json-null');
  } else if (typeof data === 'boolean') {
    container.innerHTML = createKeyValue(key, data.toString(), 'json-boolean');
  } else if (typeof data === 'number') {
    container.innerHTML = createKeyValue(key, data.toString(), 'json-number');
  } else if (typeof data === 'string') {
    container.innerHTML = createKeyValue(key, `"${escapeHtml(data)}"`, 'json-string');
  } else if (Array.isArray(data)) {
    const header = document.createElement('div');
    header.className = 'json-expandable';

    const toggle = document.createElement('span');
    toggle.className = 'json-toggle';
    toggle.textContent = '⊟';
    toggle.onclick = function() {
      const content = header.nextElementSibling;
      if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '⊟';
      } else {
        content.style.display = 'none';
        toggle.textContent = '⊞';
      }
    };

    header.appendChild(toggle);

    if (key) {
      const keySpan = document.createElement('span');
      keySpan.className = 'json-key';
      keySpan.textContent = `"${key}": `;
      header.appendChild(keySpan);
    }

    const bracket = document.createElement('span');
    bracket.className = 'json-bracket';
    bracket.textContent = '[';
    header.appendChild(bracket);

    container.appendChild(header);

    const content = document.createElement('div');
    content.className = 'json-content';

    data.forEach((item, index) => {
      const child = createJSONNode(item, '', level + 1);
      const comma = document.createElement('span');
      comma.className = 'json-comma';
      comma.textContent = index < data.length - 1 ? ',' : '';
      child.appendChild(comma);
      content.appendChild(child);
    });

    const closeBracket = document.createElement('div');
    closeBracket.style.marginLeft = (level * 20) + 'px';
    closeBracket.innerHTML = '<span class="json-bracket">]</span>';
    content.appendChild(closeBracket);

    container.appendChild(content);
  } else if (typeof data === 'object') {
    const header = document.createElement('div');
    header.className = 'json-expandable';

    const toggle = document.createElement('span');
    toggle.className = 'json-toggle';
    toggle.textContent = '⊟';
    toggle.onclick = function() {
      const content = header.nextElementSibling;
      if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '⊟';
      } else {
        content.style.display = 'none';
        toggle.textContent = '⊞';
      } 
    };

    header.appendChild(toggle);

    if (key) {
      const keySpan = document.createElement('span');
      keySpan.className = 'json-key';
      keySpan.textContent = `"${key}": `;
      header.appendChild(keySpan);
    }

    const brace = document.createElement('span');
    brace.className = 'json-bracket';
    brace.textContent = '{';
    header.appendChild(brace);

    container.appendChild(header);

    const keys = Object.keys(data);

    const content = document.createElement('div');
    content.className = 'json-content';

    keys.forEach((k, index) => {
      const child = createJSONNode(data[k], k, level + 1);
      const comma = document.createElement('span');
      comma.className = 'json-comma';
      comma.textContent = index < keys.length - 1 ? ',' : '';
      child.appendChild(comma);
      content.appendChild(child);
    });

    const closeBrace = document.createElement('div');
    closeBrace.style.marginLeft = (level * 20) + 'px';
    closeBrace.innerHTML = '<span class="json-bracket">}</span>';
    content.appendChild(closeBrace);

    container.appendChild(content);
  }

  return container;
}

function createKeyValue(key, value, className) {
  if (key) {
    return `<span class="json-key">"${escapeHtml(key)}"</span>: <span class="${className}">${value}</span>`;
  }
  return `<span class="${className}">${value}</span>`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function minifyJSON() {
  const input = document.getElementById('jsonInput').value;
  const output = document.getElementById('jsonOutput');
  const error = document.getElementById('errorMessage');

  if (!input.trim()) {
    error.textContent = '';
    output.innerHTML = '';
    jsonParsedData = null;
    return;
  }

  try {
    const parsed = JSON.parse(input);
    jsonParsedData = parsed;
    const minified = JSON.stringify(parsed);
    output.innerHTML = `<pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(minified)}</pre>`;
    error.textContent = '';
    showToast('JSON minified successfully');
  } catch (e) {
    error.textContent = '❌ Invalid JSON: ' + e.message;
    output.innerHTML = '';
    jsonParsedData = null;
  }
}

function clearJSON() {
  document.getElementById('jsonInput').value = '';
  document.getElementById('jsonOutput').innerHTML = '';
  document.getElementById('errorMessage').textContent = '';
  jsonParsedData = null;
}

function copyInput() {
  const input = document.getElementById('jsonInput');
  input.select();
  navigator.clipboard.writeText(input.value);
  showToast('Input copied to clipboard');
}

function copyOutput() {
  if (jsonParsedData) {
    const formatted = JSON.stringify(jsonParsedData, null, 2);
    navigator.clipboard.writeText(formatted);
    showToast('Output copied to clipboard');
  }
}

function downloadJSON() {
  if (!jsonParsedData) {
    showToast('No formatted JSON to download', 'error');
    return;
  }

  const formatted = JSON.stringify(jsonParsedData, null, 2);
  const blob = new Blob([formatted], { type: 'application/json' });
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
  document.getElementById('currentUTC').textContent = now.toUTCString();
  document.getElementById('currentLocal').textContent = now.toLocaleString();
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

// ============================================
// JWT Decoder Functions
// ============================================

let jwtHeaderData = null;
let jwtPayloadData = null;
let jwtSignatureData = null;

function decodeJWT() {
  const input = document.getElementById('jwtInput').value.trim();
  const headerOutput = document.getElementById('jwtHeaderOutput');
  const payloadOutput = document.getElementById('jwtPayloadOutput');
  const status = document.getElementById('jwtStatus');
  const error = document.getElementById('jwtErrorMessage');

  if (!input) {
    headerOutput.textContent = '';
    payloadOutput.textContent = '';
    status.style.display = 'none';
    error.textContent = '';
    jwtHeaderData = null;
    jwtPayloadData = null;
    jwtSignatureData = null;
    return;
  }

  try {
    // Split JWT into parts
    const parts = input.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format. JWT must have 3 parts separated by dots.');
    }

    // Decode header (first part)
    const headerJson = base64UrlDecode(parts[0]);
    jwtHeaderData = JSON.parse(headerJson);

    // Decode payload (second part)
    const payloadJson = base64UrlDecode(parts[1]);
    jwtPayloadData = JSON.parse(payloadJson);

    // Store signature
    jwtSignatureData = parts[2];

    // Display decoded data
    headerOutput.textContent = JSON.stringify(jwtHeaderData, null, 2);
    payloadOutput.textContent = JSON.stringify(jwtPayloadData, null, 2);

    // Show valid status
    status.style.display = 'block';
    error.textContent = '';

    // Apply syntax highlighting
    applySyntaxHighlighting('jwtHeaderOutput');
    applySyntaxHighlighting('jwtPayloadOutput');
  } catch (e) {
    error.textContent = '❌ Invalid JWT: ' + e.message;
    headerOutput.textContent = '';
    payloadOutput.textContent = '';
    status.style.display = 'none';
    jwtHeaderData = null;
    jwtPayloadData = null;
    jwtSignatureData = null;
  }
}

function base64UrlDecode(str) {
  // Replace URL-safe characters
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Pad with = to make length multiple of 4
  while (str.length % 4 !== 0) {
    str += '=';
  }
  
  // Decode base64
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    throw new Error('Invalid base64 encoding');
  }
}

function applySyntaxHighlighting(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  let text = element.textContent;
  
  // Simple JSON syntax highlighting
  text = text.replace(/"([^"]+)":/g, '<span style="color: #0ea5e9;">"$1"</span>:');
  text = text.replace(/: "([^"]*)"/g, ': <span style="color: #10b981;">"$1"</span>');
  text = text.replace(/: (\d+)/g, ': <span style="color: #f59e0b;">$1</span>');
  text = text.replace(/: (true|false|null)/g, ': <span style="color: #8b5cf6;">$1</span>');
  
  element.innerHTML = text;
}

function generateJWTExample() {
  const exampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.kMUf5IDInFmyG3nQiGMGHFUROF3wh75mq1pQV30';
  document.getElementById('jwtInput').value = exampleJWT;
  decodeJWT();
  showToast('Example JWT loaded');
}

function copyJWTInput() {
  const input = document.getElementById('jwtInput');
  if (input.value) {
    navigator.clipboard.writeText(input.value);
    showToast('JWT copied to clipboard');
  }
}

function copyJWTHeader() {
  if (jwtHeaderData) {
    navigator.clipboard.writeText(JSON.stringify(jwtHeaderData, null, 2));
    showToast('Header copied to clipboard');
  }
}

function copyJWTPayload() {
  if (jwtPayloadData) {
    navigator.clipboard.writeText(JSON.stringify(jwtPayloadData, null, 2));
    showToast('Payload copied to clipboard');
  }
}

function copyJWTSecret() {
  const secret = document.getElementById('jwtSecret');
  if (secret.value) {
    navigator.clipboard.writeText(secret.value);
    showToast('Secret copied to clipboard');
  }
}

function clearJWT() {
  document.getElementById('jwtInput').value = '';
  document.getElementById('jwtHeaderOutput').textContent = '';
  document.getElementById('jwtPayloadOutput').textContent = '';
  document.getElementById('jwtStatus').style.display = 'none';
  document.getElementById('jwtErrorMessage').textContent = '';
  jwtHeaderData = null;
  jwtPayloadData = null;
  jwtSignatureData = null;
}

function clearJWTSecret() {
  document.getElementById('jwtSecret').value = '';
  document.getElementById('jwtSecretStatus').style.display = 'none';
  document.getElementById('jwtSignatureStatus').style.display = 'none';
}

function switchJWTTab(section, tab) {
  const jsonTab = document.getElementById(section + 'JsonTab');
  const claimsTab = document.getElementById(section + 'ClaimsTab');
  
  if (tab === 'json') {
    jsonTab.classList.add('active');
    claimsTab.classList.remove('active');
  } else {
    claimsTab.classList.add('active');
    jsonTab.classList.remove('active');
  }
  
  // Note: Claims table view would require additional implementation
  showToast('Claims table view coming soon', 'error');
}

function verifyJWTSignature() {
  const secret = document.getElementById('jwtSecret').value;
  const secretStatus = document.getElementById('jwtSecretStatus');
  const signatureStatus = document.getElementById('jwtSignatureStatus');
  
  if (!secret) {
    secretStatus.style.display = 'none';
    signatureStatus.style.display = 'none';
    return;
  }
  
  // Show that secret is entered (actual verification would require crypto library)
  secretStatus.style.display = 'block';
  
  // Note: Real signature verification would require implementing HMAC-SHA256
  // For now, we just show that a secret was entered
  if (jwtSignatureData && secret.length >= 32) {
    signatureStatus.style.display = 'block';
    showToast('Note: Signature verification requires crypto library', 'error');
  } else if (secret.length < 32) {
    secretStatus.innerHTML = '⚠️ Secret should be at least 256 bits (32 characters)';
    secretStatus.style.background = '#fed7aa';
    secretStatus.style.color = '#9a3412';
  }
}
