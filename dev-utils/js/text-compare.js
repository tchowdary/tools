// ============================================
// Text Compare Module
// ============================================

import { showToast } from './utils.js';

/**
 * Loads example text into both text areas
 */
export function loadTextCompareExample() {
  const example1 = `{
  "name": "John Doe",
  "age": 31,
  "city": "Los Angeles",
  "country": "USA"
}`;

  const example2 = `{
  "name": "John Doe",
  "age": 30,
  "city": "New York"
}`;

  document.getElementById('textCompareInput1').value = example1;
  document.getElementById('textCompareInput2').value = example2;

  showToast('Example texts loaded');
}

/**
 * Clears the text in a specific input
 * @param {number} inputNumber - The input number (1 or 2)
 */
export function clearTextCompareInput(inputNumber) {
  const input = document.getElementById(`textCompareInput${inputNumber}`);
  if (input) {
    input.value = '';
    showToast(`Text ${inputNumber} cleared`);
  }
}

/**
 * Copies text from a specific input to clipboard
 * @param {number} inputNumber - The input number (1 or 2)
 */
export function copyTextCompareInput(inputNumber) {
  const input = document.getElementById(`textCompareInput${inputNumber}`);
  if (input && input.value) {
    navigator.clipboard.writeText(input.value).then(() => {
      showToast(`Text ${inputNumber} copied to clipboard`);
    }).catch(err => {
      console.error('Failed to copy:', err);
      showToast('Failed to copy text', 'error');
    });
  }
}

/**
 * Compares the two texts and displays the results
 */
export function compareTexts() {
  const text1 = document.getElementById('textCompareInput1').value;
  const text2 = document.getElementById('textCompareInput2').value;
  const resultsContainer = document.getElementById('textCompareResults');

  // Show results container
  resultsContainer.classList.remove('hidden');

  // Perform diff
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const diff = computeDiff(lines1, lines2);

  // Display side-by-side view
  displaySideBySideDiff(diff);

  showToast('Texts compared successfully');

  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Computes a simple line-by-line diff between two arrays of lines
 * @param {Array<string>} lines1 - Lines from text 1
 * @param {Array<string>} lines2 - Lines from text 2
 * @returns {Array<Object>} - Array of diff objects
 */
function computeDiff(lines1, lines2) {
  const diff = [];
  const maxLines = Math.max(lines1.length, lines2.length);

  // Simple line-by-line comparison
  let lineNumber1 = 1;
  let lineNumber2 = 1;

  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i];
    const line2 = lines2[i];

    if (line1 !== undefined && line2 !== undefined) {
      if (line1 === line2) {
        // Lines are identical
        diff.push({
          type: 'unchanged',
          line1: line1,
          line2: line2,
          lineNumber1: lineNumber1++,
          lineNumber2: lineNumber2++
        });
      } else {
        // Lines are different
        diff.push({
          type: 'changed',
          line1: line1,
          line2: line2,
          lineNumber1: lineNumber1++,
          lineNumber2: lineNumber2++
        });
      }
    } else if (line1 !== undefined) {
      // Line exists only in text 1 (removed)
      diff.push({
        type: 'removed',
        line1: line1,
        line2: null,
        lineNumber1: lineNumber1++,
        lineNumber2: null
      });
    } else if (line2 !== undefined) {
      // Line exists only in text 2 (added)
      diff.push({
        type: 'added',
        line1: null,
        line2: line2,
        lineNumber1: null,
        lineNumber2: lineNumber2++
      });
    }
  }

  return diff;
}

/**
 * Displays the diff in side-by-side view
 * @param {Array<Object>} diff - The diff array
 */
function displaySideBySideDiff(diff) {
  const leftSide = document.getElementById('diffLeftSide');
  const rightSide = document.getElementById('diffRightSide');

  leftSide.innerHTML = '';
  rightSide.innerHTML = '';

  diff.forEach(item => {
    // Left side (Text 1)
    const leftLine = document.createElement('div');
    leftLine.className = 'diff-line';

    if (item.type === 'removed' || item.type === 'changed') {
      leftLine.classList.add('diff-line-removed');
    } else if (item.type === 'unchanged') {
      leftLine.classList.add('diff-line-unchanged');
    } else if (item.type === 'added') {
      // Empty line for added content
      leftLine.classList.add('diff-line-unchanged');
    }

    const leftLineNumber = document.createElement('span');
    leftLineNumber.className = 'diff-line-number';
    leftLineNumber.textContent = item.lineNumber1 || '';

    const leftLineContent = document.createElement('span');
    leftLineContent.className = 'diff-line-content';
    leftLineContent.textContent = item.line1 || '';

    leftLine.appendChild(leftLineNumber);
    leftLine.appendChild(leftLineContent);
    leftSide.appendChild(leftLine);

    // Right side (Text 2)
    const rightLine = document.createElement('div');
    rightLine.className = 'diff-line';

    if (item.type === 'added' || item.type === 'changed') {
      rightLine.classList.add('diff-line-added');
    } else if (item.type === 'unchanged') {
      rightLine.classList.add('diff-line-unchanged');
    } else if (item.type === 'removed') {
      // Empty line for removed content
      rightLine.classList.add('diff-line-unchanged');
    }

    const rightLineNumber = document.createElement('span');
    rightLineNumber.className = 'diff-line-number';
    rightLineNumber.textContent = item.lineNumber2 || '';

    const rightLineContent = document.createElement('span');
    rightLineContent.className = 'diff-line-content';
    rightLineContent.textContent = item.line2 || '';

    rightLine.appendChild(rightLineNumber);
    rightLine.appendChild(rightLineContent);
    rightSide.appendChild(rightLine);
  });
}

/**
 * Copies the comparison results to clipboard
 */
export function copyComparisonResults() {
  const leftSide = document.getElementById('diffLeftSide');
  const rightSide = document.getElementById('diffRightSide');

  if (!leftSide || !rightSide) {
    showToast('No comparison results to copy', 'error');
    return;
  }

  // Extract text content from both sides
  const leftLines = Array.from(leftSide.querySelectorAll('.diff-line-content')).map(el => el.textContent);
  const rightLines = Array.from(rightSide.querySelectorAll('.diff-line-content')).map(el => el.textContent);

  const result = `Text 1:\n${leftLines.join('\n')}\n\n---\n\nText 2:\n${rightLines.join('\n')}`;

  navigator.clipboard.writeText(result).then(() => {
    showToast('Comparison results copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy:', err);
    showToast('Failed to copy results', 'error');
  });
}

/**
 * Downloads the comparison results as a text file
 */
export function downloadComparisonResults() {
  const leftSide = document.getElementById('diffLeftSide');
  const rightSide = document.getElementById('diffRightSide');

  if (!leftSide || !rightSide) {
    showToast('No comparison results to download', 'error');
    return;
  }

  // Extract text content from both sides
  const leftLines = Array.from(leftSide.querySelectorAll('.diff-line-content')).map(el => el.textContent);
  const rightLines = Array.from(rightSide.querySelectorAll('.diff-line-content')).map(el => el.textContent);

  const result = `Text 1:\n${leftLines.join('\n')}\n\n---\n\nText 2:\n${rightLines.join('\n')}`;

  // Create and download file
  const blob = new Blob([result], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'text-comparison.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Comparison results downloaded');
}

/**
 * Clears the comparison results
 */
export function clearComparisonResults() {
  const resultsContainer = document.getElementById('textCompareResults');
  resultsContainer.classList.add('hidden');

  document.getElementById('diffLeftSide').innerHTML = '';
  document.getElementById('diffRightSide').innerHTML = '';

  showToast('Comparison results cleared');
}

// Make functions globally available for HTML onclick handlers
window.loadTextCompareExample = loadTextCompareExample;
window.clearTextCompareInput = clearTextCompareInput;
window.copyTextCompareInput = copyTextCompareInput;
window.compareTexts = compareTexts;
window.copyComparisonResults = copyComparisonResults;
window.downloadComparisonResults = downloadComparisonResults;
window.clearComparisonResults = clearComparisonResults;
