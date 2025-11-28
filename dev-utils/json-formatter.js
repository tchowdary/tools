// ============================================
// JSON Parser Functions
// ============================================

import { showToast, escapeHtml, downloadFile } from './utils.js';

let jsonParsedData = null;

/**
 * Formats and displays JSON input
 */
export function formatJSON() {
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

/**
 * Renders JSON data as an interactive tree
 * @param {*} data - The JSON data to render
 * @param {HTMLElement} container - The container element
 * @param {boolean} isCollapsed - Whether to render collapsed
 */
function renderJSONTree(data, container, isCollapsed = false) {
  container.innerHTML = '';
  const tree = createJSONNode(data, '', 0);
  container.appendChild(tree);
}

/**
 * Creates a JSON node element
 * @param {*} data - The data to create a node for
 * @param {string} key - The key name
 * @param {number} level - The nesting level
 * @returns {HTMLElement} The created node element
 */
function createJSONNode(data, key, level) {
  const container = document.createElement('div');
  container.className = 'json-node';
  container.style.marginLeft = (level * 16) + 'px';

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
    closeBracket.style.marginLeft = (level * 16) + 'px';
    closeBracket.style.lineHeight = '1.3';
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
    closeBrace.style.marginLeft = (level * 16) + 'px';
    closeBrace.style.lineHeight = '1.3';
    closeBrace.innerHTML = '<span class="json-bracket">}</span>';
    content.appendChild(closeBrace);

    container.appendChild(content);
  }

  return container;
}

/**
 * Creates a key-value pair HTML string
 * @param {string} key - The key name
 * @param {string} value - The value
 * @param {string} className - The CSS class to apply
 * @returns {string} HTML string
 */
function createKeyValue(key, value, className) {
  if (key) {
    return `<span class="json-key">"${escapeHtml(key)}"</span>: <span class="${className}">${value}</span>`;
  }
  return `<span class="${className}">${value}</span>`;
}

/**
 * Minifies JSON input
 */
export function minifyJSON() {
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

/**
 * Clears JSON input and output
 */
export function clearJSON() {
  document.getElementById('jsonInput').value = '';
  document.getElementById('jsonOutput').innerHTML = '';
  document.getElementById('errorMessage').textContent = '';
  jsonParsedData = null;
}

/**
 * Copies JSON input to clipboard
 */
export function copyInput() {
  const input = document.getElementById('jsonInput');
  input.select();
  navigator.clipboard.writeText(input.value);
  showToast('Input copied to clipboard');
}

/**
 * Copies formatted JSON output to clipboard
 */
export function copyOutput() {
  if (jsonParsedData) {
    const formatted = JSON.stringify(jsonParsedData, null, 2);
    navigator.clipboard.writeText(formatted);
    showToast('Output copied to clipboard');
  }
}

/**
 * Downloads formatted JSON as a file
 */
export function downloadJSON() {
  if (!jsonParsedData) {
    showToast('No formatted JSON to download', 'error');
    return;
  }

  const formatted = JSON.stringify(jsonParsedData, null, 2);
  downloadFile(formatted, 'formatted.json', 'application/json');
  showToast('JSON downloaded');
}

/**
 * Gets the current parsed JSON data
 * @returns {*} The parsed JSON data or null
 */
export function getJsonParsedData() {
  return jsonParsedData;
}

// Make functions globally available for HTML onclick handlers
window.formatJSON = formatJSON;
window.minifyJSON = minifyJSON;
window.clearJSON = clearJSON;
window.copyInput = copyInput;
window.copyOutput = copyOutput;
window.downloadJSON = downloadJSON;
