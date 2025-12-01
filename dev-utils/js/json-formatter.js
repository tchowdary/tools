// ============================================
// JSON Parser Functions
// ============================================

import { showToast, escapeHtml, downloadFile } from './utils.js';

let jsonParsedData = null;

// ============================================
// Format Detection Functions
// ============================================

/**
 * Checks if input is valid JSON
 */
function isJSON(input) {
  const trimmedInput = input.trim();
  if ((trimmedInput.startsWith("{") && trimmedInput.endsWith("}")) ||
      (trimmedInput.startsWith("[") && trimmedInput.endsWith("]"))) {
    try {
      JSON.parse(trimmedInput);
      return true;
    } catch (error) {
      return false;
    }
  }
  return false;
}

/**
 * Checks if input is YAML
 */
function isYaml(input) {
  try {
    const cleanedInput = input
      .trim()
      .replace(/^---\s*/, "")
      .replace(/\s*\.\.\.\s*$/, "");
    const yamlRegex = /^(\s*-\s+.+|[a-zA-Z0-9_-]+:\s+.+)/m;
    return yamlRegex.test(cleanedInput);
  } catch {
    return false;
  }
}

/**
 * Decodes YAML to JSON
 */
function decodeYaml(yamlString) {
  const lines = yamlString.trim().split("\n");
  const result = {};
  const stack = [result];
  let currentIndent = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed === "---" || trimmed === "...") continue;

    const indent = line.match(/^\s*/)[0].length;

    while (indent < currentIndent) {
      stack.pop();
      currentIndent -= 2;
    }

    const parent = stack[stack.length - 1];

    if (trimmed.startsWith("-")) {
      const value = trimmed.substring(1).trim();
      if (!Array.isArray(parent)) {
        stack[stack.length - 1] = [];
        if (stack.length > 1) {
          const grandParent = stack[stack.length - 2];
          const parentKey = Object.keys(grandParent).find(key => grandParent[key] === parent);
          if (parentKey) {
            grandParent[parentKey] = stack[stack.length - 1];
          }
        }
      }
      if (value) {
        stack[stack.length - 1].push(parseValue(value));
      } else {
        const newItem = [];
        stack[stack.length - 1].push(newItem);
        stack.push(newItem);
        currentIndent = indent + 2;
      }
    } else {
      const [key, value] = trimmed.split(":").map(s => s.trim());
      if (value) {
        parent[key] = parseValue(value);
      } else {
        parent[key] = {};
        stack.push(parent[key]);
        currentIndent = indent + 2;
      }
    }
  }
  return result;
}

/**
 * Parses YAML values
 */
function parseValue(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value);
  } else if (/^(true|false)$/.test(value)) {
    return value === "true";
  } else if (value === "null") {
    return null;
  }
  return value;
}

/**
 * Checks if input is XML
 */
function isXml(input) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, "application/xml");
    return !doc.querySelector("parsererror");
  } catch {
    return false;
  }
}

/**
 * Converts XML to JSON
 */
function parseXmlToJson(xml) {
  const obj = {};
  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let i = 0; i < xml.attributes.length; i++) {
        const attribute = xml.attributes[i];
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    return xml.nodeValue.trim();
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes[i];
      const nodeName = item.nodeName;
      const nodeValue = parseXmlToJson(item);

      if (nodeName.charAt(0) === '#') {
        continue;
      }

      if (nodeValue) {
        if (!obj[nodeName]) {
          obj[nodeName] = nodeValue;
        } else {
          if (!Array.isArray(obj[nodeName])) {
            obj[nodeName] = [obj[nodeName]];
          }
          obj[nodeName].push(nodeValue);
        }
      }
    }
  }
  return obj;
}

/**
 * Checks if input is CSV
 */
function isCSV(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length < 3) return false;

  const commaCounts = lines.map(line => (line.match(/,/g) || []).length);
  const linesWithCommas = commaCounts.filter(count => count > 0).length;
  const threshold = Math.ceil(lines.length * 0.5);

  if (linesWithCommas < threshold) return false;

  const firstLineCount = commaCounts[0];
  if (!firstLineCount) return false;

  const isLikelySectionHeader = lines.some(line => line.startsWith("[") && line.endsWith("]"));
  const isLikelyKeyValue = lines.some(line => line.includes("="));

  if (isLikelySectionHeader || isLikelyKeyValue) return false;

  const isStructured = commaCounts.every(count => Math.abs(count - firstLineCount) <= 1);
  return isStructured;
}

/**
 * Converts CSV to HTML table
 */
function csvToHtmlTable(csv) {
  const rows = csv.trim().split(/\r?\n/);
  let table = '<table style="border-collapse: collapse; width: 100%;">';

  rows.forEach((row, rowIndex) => {
    table += '<tr>';
    const columns = row.split(",");

    columns.forEach(col => {
      const cell = rowIndex === 0 ? 'th' : 'td';
      const parsedValue = parseValue(col.trim());
      table += `<${cell} style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(String(parsedValue))}</${cell}>`;
    });

    table += '</tr>';
  });

  table += '</table>';
  return table;
}

/**
 * Checks if input is INI format
 */
function isIni(input) {
  const iniSectionRegex = /^\s*\[.+\]\s*$/m;
  const iniKeyValueRegex = /^\s*[^;#=\s]+\s*=\s*.+$/m;
  return iniSectionRegex.test(input) || iniKeyValueRegex.test(input);
}

/**
 * Parses INI to JSON
 */
function parseIniToJson(iniString) {
  const lines = iniString.split(/\r?\n/);
  const result = {};
  let currentSection = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("rem") || trimmedLine.startsWith("#") || trimmedLine.startsWith(";")) {
      return;
    }

    if (trimmedLine.startsWith("[") && trimmedLine.endsWith("]")) {
      currentSection = trimmedLine.slice(1, -1).trim();
      result[currentSection] = {};
    } else if (currentSection) {
      const [key, ...valueParts] = trimmedLine.split("=");
      const keyTrimmed = key.trim();
      const value = valueParts.join("=").trim();
      result[currentSection][keyTrimmed] = parseValue(value);
    }
  });

  return result;
}

/**
 * Checks if input is a URL
 */
function isURL(str) {
  return str.startsWith('https://') || str.startsWith('http://');
}

/**
 * Parses URL into components
 */
function parseURL(url) {
  try {
    const urlObj = new URL(url);
    return {
      protocol: urlObj.protocol.replace(':', ''),
      hostname: urlObj.hostname,
      pathname: urlObj.pathname.split('/').filter(Boolean),
      searchParams: Object.fromEntries(urlObj.searchParams),
      hash: urlObj.hash
    };
  } catch (e) {
    return null;
  }
}

/**
 * Checks if input is escaped string
 */
function isEscapedString(input) {
  const escapedStringRegex = /^".*(\\["\\/bfnrt]|\\u[0-9a-fA-F]{4}).*"$/;
  return escapedStringRegex.test(input);
}

/**
 * Unescapes a string
 */
function unescapeString(escapedStr) {
  if (escapedStr.startsWith('"') && escapedStr.endsWith('"')) {
    escapedStr = escapedStr.slice(1, -1);
  }
  escapedStr = escapedStr.replace(/\\(['"\\/bfnrt])/g, (_, char) => {
    const escapeMap = {
      '"': '"',
      "'": "'",
      '\\': '\\',
      '/': '/',
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t',
    };
    return escapeMap[char];
  });
  return escapedStr.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Checks if input is Base64
 */
function isBase64String(input) {
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return base64Regex.test(input.trim());
}

/**
 * Decodes Base64 string
 */
function decodeBase64String(base64String) {
  return atob(base64String.trim());
}

/**
 * Checks if input is hex
 */
function isHexString(input) {
  const hexRegex = /^[0-9a-fA-F\s]+$/;
  return hexRegex.test(input.trim());
}

/**
 * Decodes hex string
 */
function decodeHexString(hexString) {
  let hex = hexString.toString();
  let str = '';
  for (let i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

/**
 * Checks if input is binary
 */
function isBinaryString(input) {
  const binaryRegex = /^[01\s]+$/;
  return binaryRegex.test(input.trim());
}

/**
 * Decodes binary string
 */
function decodeBinaryString(binaryString) {
  return binaryString
    .split(' ')
    .map(bin => String.fromCharCode(parseInt(bin, 2)))
    .join('');
}

// ============================================
// JSON Rendering Functions
// ============================================

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

  let rawInput = input.trim();

  try {
    // Detect escaped string data sets
    if (isEscapedString(rawInput)) {
      rawInput = unescapeString(rawInput);
    }

    if (isJSON(rawInput)) {
      const parsed = JSON.parse(rawInput);
      jsonParsedData = parsed;
      output.innerHTML = '';
      createJsonView([parsed], output);
      error.textContent = '';
    } else if (isYaml(rawInput)) {
      const parsed = decodeYaml(rawInput);
      jsonParsedData = parsed;
      output.innerHTML = '';
      createJsonView(parsed, output);
      error.textContent = '';
    } else if (isXml(rawInput)) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(rawInput, "application/xml");
      const parsed = parseXmlToJson(xmlDoc);
      jsonParsedData = parsed;
      output.innerHTML = '';
      createJsonView(parsed, output);
      error.textContent = '';
    } else if (isCSV(rawInput)) {
      const tableHtml = csvToHtmlTable(rawInput);
      output.innerHTML = tableHtml;
      jsonParsedData = null;
      error.textContent = '';
    } else if (isURL(rawInput)) {
      const parsed = parseURL(rawInput);
      jsonParsedData = parsed;
      output.innerHTML = '';
      createJsonView([parsed], output);
      error.textContent = '';
    } else if (isIni(rawInput)) {
      const parsed = parseIniToJson(rawInput);
      jsonParsedData = parsed;
      output.innerHTML = '';
      createJsonView(parsed, output);
      error.textContent = '';
    } else if (isBinaryString(rawInput)) {
      const decoded = decodeBinaryString(rawInput);
      output.innerHTML = `<pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(decoded)}</pre>`;
      jsonParsedData = null;
      error.textContent = '';
    } else if (isHexString(rawInput)) {
      const decoded = decodeHexString(rawInput);
      output.innerHTML = `<pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(decoded)}</pre>`;
      jsonParsedData = null;
      error.textContent = '';
    } else if (isBase64String(rawInput)) {
      const decoded = decodeBase64String(rawInput);
      output.innerHTML = `<pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(decoded)}</pre>`;
      jsonParsedData = null;
      error.textContent = '';
    } else {
      output.innerHTML = `<pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(rawInput)}</pre>`;
      jsonParsedData = null;
      error.textContent = '';
    }
  } catch (e) {
    error.textContent = '❌ Error: ' + e.message;
    output.innerHTML = '';
    jsonParsedData = null;
  }
}

/**
 * Creates JSON tree view (based on json.pub logic)
 */
function createJsonView(json, parentElement, depth = 0) {
  const indent = "&nbsp;".repeat(depth * 4);
  const keys = Object.keys(json);

  keys.forEach((key, index) => {
    let value = json[key];
    const isLast = index === keys.length - 1;
    const element = document.createElement('div');
    element.className = 'child';
    element.style.lineHeight = '1.5';

    let escapedKey = escapeHtml(String(key));

    if (value === null) {
      const keyEl = `<span class="json-key">"${escapedKey}"</span>`;
      const valueEl = `<span class="json-null">null</span>`;
      element.innerHTML = indent + keyEl + ':&nbsp;' + valueEl + (isLast ? '' : ',');
      parentElement.appendChild(element);
    } else if (Array.isArray(value) || typeof value === "object") {
      const toggle = document.createElement('span');
      toggle.className = 'toggle';
      toggle.style.cursor = 'pointer';
      toggle.style.userSelect = 'none';

      const isNumericKey = !isNaN(parseFloat(key)) && isFinite(key);
      let keyEl = isNumericKey ? '' : `<span class="json-key">"${escapedKey}"</span>:&nbsp;`;

      const children = document.createElement('div');
      children.className = 'children';

      createJsonView(value, children, depth + 1);

      if (Array.isArray(value) && typeof value[0] !== 'undefined') {
        element.innerHTML = indent;
        element.appendChild(toggle);
        element.innerHTML += keyEl + '[';
        element.appendChild(children);
        const closeIndent = document.createElement('span');
        closeIndent.className = 'indent';
        closeIndent.innerHTML = indent;
        element.appendChild(closeIndent);
        element.innerHTML += ']' + (isLast ? '' : ',');
      } else {
        element.innerHTML = indent;
        element.appendChild(toggle);
        element.innerHTML += keyEl + '{';
        element.appendChild(children);
        const closeIndent = document.createElement('span');
        closeIndent.className = 'indent';
        closeIndent.innerHTML = indent;
        element.appendChild(closeIndent);
        element.innerHTML += '}' + (isLast ? '' : ',');
      }

      parentElement.appendChild(element);

      // Toggle click handler
      let holdTimer;
      toggle.addEventListener('mousedown', function(event) {
        holdTimer = setTimeout(() => {
          const allChildren = element.querySelectorAll('.child');
          allChildren.forEach(child => child.classList.add('collapsed'));
        }, 500);
      });

      toggle.addEventListener('mouseup', function() {
        clearTimeout(holdTimer);
      });

      toggle.addEventListener('mouseleave', function() {
        clearTimeout(holdTimer);
      });

      toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        element.classList.toggle('collapsed');
      });

    } else {
      const isNumericKey = !isNaN(parseFloat(key)) && isFinite(key);
      let keyEl = isNumericKey ? '' : `<span class="json-key">"${escapedKey}"</span>:&nbsp;`;

      let escapedValue = escapeHtml(String(value));
      let valueEl;

      if (typeof value === "string") {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const valueStartsWithHttp = value.startsWith('http://') || value.startsWith('https://');
        if (urlRegex.test(value) && valueStartsWithHttp) {
          valueEl = `<span class="json-string">"<a href="${escapedValue}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">${escapedValue}</a>"</span>`;
        } else {
          valueEl = `<span class="json-string">"${escapedValue}"</span>`;
        }
      } else if (typeof value === "number") {
        valueEl = `<span class="json-number">${value}</span>`;
      } else if (typeof value === "boolean") {
        valueEl = `<span class="json-boolean">${value}</span>`;
      }

      element.innerHTML = indent + keyEl + valueEl + (isLast ? '' : ',');
      parentElement.appendChild(element);
    }
  });
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
