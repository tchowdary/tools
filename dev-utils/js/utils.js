// ============================================
// Shared Utility Functions
// ============================================

/**
 * Shows a toast notification message
 * @param {string} message - The message to display
 * @param {string} toastType - Type of toast ('success' or 'error')
 */
export function showToast(message, toastType) {
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

/**
 * Copies text to clipboard and shows a toast notification
 * @param {string} text - The text to copy
 * @param {string} message - Optional custom message for the toast
 */
export function copyToClipboard(text, message) {
  navigator.clipboard.writeText(text);
  showToast(message || 'Copied to clipboard');
}

/**
 * Escapes HTML special characters
 * @param {string} text - The text to escape
 * @returns {string} Escaped HTML string
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Downloads content as a file
 * @param {string} content - The content to download
 * @param {string} filename - The name of the file
 * @param {string} mimeType - MIME type of the file
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
