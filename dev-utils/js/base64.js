// ============================================
// Base64 Encoder/Decoder Functions
// ============================================

import { showToast, downloadFile } from './utils.js';

let base64Mode = 'encode';

/**
 * Toggles between encode and decode mode
 */
export function toggleBase64Mode() {
  base64Mode = base64Mode === 'encode' ? 'decode' : 'encode';
  updateBase64UI();
  processBase64();
}

/**
 * Updates the UI based on current mode
 */
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

/**
 * Processes Base64 encoding or decoding based on current mode
 */
export function processBase64() {
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

/**
 * Triggers file upload dialog
 */
export function uploadBase64File() {
  document.getElementById('base64FileInput').click();
}

/**
 * Handles file upload for Base64 processing
 * @param {Event} event - The file input change event
 */
export function handleBase64FileUpload(event) {
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

/**
 * Loads sample data for testing
 */
export function loadBase64Sample() {
  const sampleText = base64Mode === 'encode'
    ? 'Hello, World! This is a sample text for Base64 encoding.'
    : 'SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgZm9yIEJhc2U2NCBlbmNvZGluZy4=';

  document.getElementById('base64Input').value = sampleText;
  processBase64();
  showToast('Sample data loaded');
}

/**
 * Clears Base64 input and output
 */
export function clearBase64() {
  document.getElementById('base64Input').value = '';
  document.getElementById('base64Output').value = '';
  document.getElementById('base64ErrorMessage').textContent = '';
}

/**
 * Copies Base64 input to clipboard
 */
export function copyBase64Input() {
  const input = document.getElementById('base64Input');
  if (input.value) {
    navigator.clipboard.writeText(input.value);
    showToast('Input copied to clipboard');
  }
}

/**
 * Copies Base64 output to clipboard
 */
export function copyBase64Output() {
  const output = document.getElementById('base64Output');
  if (output.value) {
    navigator.clipboard.writeText(output.value);
    showToast('Output copied to clipboard');
  }
}

/**
 * Downloads Base64 output as a file
 */
export function downloadBase64() {
  const output = document.getElementById('base64Output').value;
  if (!output) {
    showToast('No output to download', 'error');
    return;
  }

  const filename = base64Mode === 'encode' ? 'encoded.txt' : 'decoded.txt';
  downloadFile(output, filename, 'text/plain');
  showToast('File downloaded');
}

// Make functions globally available for HTML onclick handlers
window.toggleBase64Mode = toggleBase64Mode;
window.processBase64 = processBase64;
window.uploadBase64File = uploadBase64File;
window.handleBase64FileUpload = handleBase64FileUpload;
window.loadBase64Sample = loadBase64Sample;
window.clearBase64 = clearBase64;
window.copyBase64Input = copyBase64Input;
window.copyBase64Output = copyBase64Output;
window.downloadBase64 = downloadBase64;
