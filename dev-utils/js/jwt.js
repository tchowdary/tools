// ============================================
// JWT Decoder Functions
// ============================================

import { showToast } from './utils.js';

let jwtHeaderData = null;
let jwtPayloadData = null;
let jwtSignatureData = null;

/**
 * Decodes and displays a JWT token
 */
export function decodeJWT() {
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

/**
 * Decodes a Base64 URL-encoded string
 * @param {string} str - The Base64 URL-encoded string
 * @returns {string} Decoded string
 */
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

/**
 * Applies syntax highlighting to JSON output
 * @param {string} elementId - The ID of the element to highlight
 */
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

/**
 * Generates and loads an example JWT
 */
export function generateJWTExample() {
  const exampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.kMUf5IDInFmyG3nQiGMGHFUROF3wh75mq1pQV30';
  document.getElementById('jwtInput').value = exampleJWT;
  decodeJWT();
  showToast('Example JWT loaded');
}

/**
 * Copies JWT input to clipboard
 */
export function copyJWTInput() {
  const input = document.getElementById('jwtInput');
  if (input.value) {
    navigator.clipboard.writeText(input.value);
    showToast('JWT copied to clipboard');
  }
}

/**
 * Copies JWT header to clipboard
 */
export function copyJWTHeader() {
  if (jwtHeaderData) {
    navigator.clipboard.writeText(JSON.stringify(jwtHeaderData, null, 2));
    showToast('Header copied to clipboard');
  }
}

/**
 * Copies JWT payload to clipboard
 */
export function copyJWTPayload() {
  if (jwtPayloadData) {
    navigator.clipboard.writeText(JSON.stringify(jwtPayloadData, null, 2));
    showToast('Payload copied to clipboard');
  }
}

/**
 * Copies JWT secret to clipboard
 */
export function copyJWTSecret() {
  const secret = document.getElementById('jwtSecret');
  if (secret.value) {
    navigator.clipboard.writeText(secret.value);
    showToast('Secret copied to clipboard');
  }
}

/**
 * Clears JWT input and output
 */
export function clearJWT() {
  document.getElementById('jwtInput').value = '';
  document.getElementById('jwtHeaderOutput').textContent = '';
  document.getElementById('jwtPayloadOutput').textContent = '';
  document.getElementById('jwtStatus').style.display = 'none';
  document.getElementById('jwtErrorMessage').textContent = '';
  jwtHeaderData = null;
  jwtPayloadData = null;
  jwtSignatureData = null;
}

/**
 * Clears JWT secret input
 */
export function clearJWTSecret() {
  document.getElementById('jwtSecret').value = '';
  document.getElementById('jwtSecretStatus').style.display = 'none';
  document.getElementById('jwtSignatureStatus').style.display = 'none';
}

/**
 * Verifies JWT signature (placeholder - requires crypto library for actual verification)
 */
export function verifyJWTSignature() {
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

// Make functions globally available for HTML onclick handlers
window.decodeJWT = decodeJWT;
window.generateJWTExample = generateJWTExample;
window.copyJWTInput = copyJWTInput;
window.copyJWTHeader = copyJWTHeader;
window.copyJWTPayload = copyJWTPayload;
window.copyJWTSecret = copyJWTSecret;
window.clearJWT = clearJWT;
window.clearJWTSecret = clearJWTSecret;
window.verifyJWTSignature = verifyJWTSignature;
