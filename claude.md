# Claude Developer Guide - Dev Tools Project

This guide helps Claude navigate and contribute to the Dev Tools project efficiently.

## 📁 Project Structure

```
tools/
├── dev-utils/                    # Main application (RECOMMENDED approach)
│   ├── index.html               # Single-page app with all tools
│   ├── css/
│   │   ├── variables.css        # Theme colors (light/dark)
│   │   ├── base.css            # Base styles, emoji filters
│   │   ├── sidebar.css         # Navigation sidebar
│   │   ├── main-content.css    # Main content area
│   │   ├── components.css      # Buttons, forms, errors
│   │   ├── editor.css          # Code editor/panel styles
│   │   ├── json-viewer.css     # JSON tree viewer
│   │   └── responsive.css      # Mobile responsiveness
│   └── js/
│       ├── app.js              # Main entry point, module imports
│       ├── ui.js               # Navigation, theme, sidebar
│       ├── utils.js            # Shared utilities (toast, copy, download)
│       ├── json-formatter.js   # JSON tool
│       ├── base64.js           # Base64 encoder/decoder
│       ├── jwt.js              # JWT decoder
│       ├── timestamp.js        # Timestamp converter
│       ├── certificate.js      # Certificate/CSR/Key decoder
│       └── json-storage.js     # Session storage
└── *.html                       # Legacy standalone tools (not recommended)
```

## 🎯 Adding a New Tool

### Step 1: Create JavaScript Module (`js/your-tool.js`)

```javascript
import { showToast, copyToClipboard, downloadFile } from './utils.js';

// Main processing function
export function processTool() {
    const input = document.getElementById('toolInput');
    const output = document.getElementById('toolOutput');
    const error = document.getElementById('toolErrorMessage');

    error.textContent = '';
    output.textContent = '';

    try {
        // Your tool logic here
        const result = processData(input.value);
        output.textContent = result;
    } catch (e) {
        error.textContent = `❌ Error: ${e.message}`;
    }
}

export function copyToolInput() {
    const input = document.getElementById('toolInput');
    copyToClipboard(input.value, 'Input copied');
}

export function copyToolOutput() {
    const output = document.getElementById('toolOutput');
    if (output.textContent) {
        copyToClipboard(output.textContent, 'Output copied');
    }
}

export function clearTool() {
    document.getElementById('toolInput').value = '';
    document.getElementById('toolOutput').textContent = '';
    document.getElementById('toolErrorMessage').textContent = '';
}

// Make functions globally available for onclick handlers
window.processTool = processTool;
window.copyToolInput = copyToolInput;
window.copyToolOutput = copyToolOutput;
window.clearTool = clearTool;
```

### Step 2: Add Navigation Item (`index.html` ~line 61)

```html
<div class="nav-item" data-tool="your-tool">
    <span class="nav-item-icon">🔧</span>
    <span class="nav-item-text">Your Tool Name</span>
</div>
```

### Step 3: Add Tool Section (`index.html` ~line 590)

```html
<!-- Your Tool -->
<div class="tool-section" id="your-tool">
    <div class="content-header">
        <div>
            <div class="content-title">🔧 Your Tool Name</div>
            <div class="content-description">Brief description of what it does</div>
        </div>
    </div>

    <div class="content-body">
        <div class="format-options">
            <div class="button-group">
                <button class="btn btn-primary" onclick="processTool()">
                    <span>▶</span> Process
                </button>
                <button class="btn btn-secondary" onclick="clearTool()">
                    <span>✖</span> Clear
                </button>
            </div>
        </div>

        <div class="error-message" id="toolErrorMessage"></div>

        <div class="editor-container">
            <div class="editor-panel">
                <div class="editor-header">
                    <div>
                        <div class="editor-title">Input</div>
                        <div class="editor-subtitle">Paste your data</div>
                    </div>
                    <div class="editor-actions">
                        <button class="icon-btn" onclick="copyToolInput()" title="Copy">📋</button>
                    </div>
                </div>
                <div class="editor-body">
                    <textarea class="code-editor" id="toolInput"
                              placeholder="Enter input..."
                              oninput="processTool()"></textarea>
                </div>
            </div>

            <div class="pane-divider"></div>

            <div class="editor-panel">
                <div class="editor-header">
                    <div>
                        <div class="editor-title">Output</div>
                        <div class="editor-subtitle">Processed result</div>
                    </div>
                    <div class="editor-actions">
                        <button class="icon-btn" onclick="copyToolOutput()" title="Copy">📋</button>
                        <button class="icon-btn" onclick="downloadToolOutput()" title="Download">⬇️</button>
                    </div>
                </div>
                <div class="editor-body">
                    <pre class="code-editor" id="toolOutput"></pre>
                </div>
            </div>
        </div>
    </div>
</div>
```

### Step 4: Import Module (`js/app.js` ~line 14)

```javascript
import './your-tool.js';
```

## 🎨 Styling Guidelines

### CSS Variables (Light/Dark Theme)
All colors use CSS variables defined in `css/variables.css`:
- `--main-bg` - Main background
- `--content-text` - Primary text color
- `--content-text-secondary` - Secondary text
- `--panel-bg` - Panel backgrounds
- `--editor-bg` - Editor/input backgrounds
- `--border-color` - Border colors
- `--primary-color` - Primary action color (Bobcat orange: #FF6B35)

### Button Classes
- `.btn-primary` - Primary actions (orange)
- `.btn-secondary` - Secondary actions
- `.icon-btn` - Icon-only buttons

### Layout Classes
- `.editor-container` - Split-pane container
- `.editor-panel` - Individual panels
- `.pane-divider` - Draggable divider between panels
- `.code-editor` - Textarea/pre styling

### Emoji Styling
Emojis are styled with grayscale filter for consistency:
```css
.nav-item-icon,
.content-title,
.btn span,
.theme-icon {
    filter: grayscale(1);
    opacity: 0.9;
}
```
**Exception:** `.logo-icon` remains colored (main branding)

## 🔧 Utility Functions (`js/utils.js`)

### Toast Notifications
```javascript
showToast('Success message', 'success');
showToast('Error message', 'error');
```

### Clipboard Operations
```javascript
copyToClipboard(text, 'Copied successfully');
```

### File Downloads
```javascript
downloadFile(content, 'filename.txt', 'text/plain');
```

### HTML Escaping
```javascript
escapeHtml(userInput); // Prevent XSS
```

## 📊 Common Patterns

### HTML Output Display
For rich formatting, use HTML with inline styles:
```javascript
let result = '<div style="font-family: monospace; line-height: 1.8;">';
result += `<div style="margin-bottom: 16px;"><strong>Label:</strong> Value</div>`;
result += '</div>';
output.innerHTML = result;
```

**Important:** Use `innerHTML` for HTML content, `textContent` for plain text.

### Error Handling
```javascript
try {
    // Processing logic
    output.textContent = result;
} catch (e) {
    console.error('Tool error:', e);
    error.textContent = `❌ Error: ${e.message}`;
}
```

### Real-time Processing
Add `oninput` attribute to trigger processing on input:
```html
<textarea oninput="processTool()"></textarea>
```

## 🔐 Security Considerations

1. **Always escape user input** when displaying as HTML
2. **Never use `eval()`** or similar unsafe practices
3. **Validate input** before processing
4. **Privacy first:** All processing happens client-side (no server calls)
5. **Sensitive data:** Add warnings for private keys, passwords, etc.

## 📝 Certificate Decoder Architecture

The certificate decoder (`js/certificate.js`) is a complex example demonstrating:

### ASN.1 Parser
Binary parsing using Tag-Length-Value structure:
```javascript
class ASN1Parser {
    readByte()      // Read single byte
    readLength()    // Read ASN.1 length encoding
    readSequence()  // Read SEQUENCE structure
    readInteger()   // Read INTEGER
    readOID()       // Read Object Identifier
    readString()    // Read string types
    readBitString() // Read BIT STRING
}
```

### Supported Formats
- X.509 Certificates (PEM)
- Certificate Signing Requests (CSR)
- Private Keys (PKCS#1, PKCS#8, SEC1)
- Public Keys (X.509 SPKI)

### Format Detection
```javascript
const isCSR = pem.includes('BEGIN CERTIFICATE REQUEST');
const isCert = pem.includes('BEGIN CERTIFICATE') && !isCSR;
const isPrivateKey = pem.includes('BEGIN PRIVATE KEY');
const isPublicKey = pem.includes('BEGIN PUBLIC KEY');
```

## 🎯 Best Practices

### DO:
✅ Use existing CSS classes and variables
✅ Follow the established file structure
✅ Import utilities from `utils.js`
✅ Add window bindings for onclick handlers
✅ Use consistent naming (toolInput, toolOutput, toolErrorMessage)
✅ Test in both light and dark themes
✅ Make processing real-time when possible (`oninput`)
✅ Provide clear error messages
✅ Add copy/download functionality

### DON'T:
❌ Create standalone HTML files (use dev-utils app)
❌ Hardcode colors (use CSS variables)
❌ Skip error handling
❌ Forget to import module in `app.js`
❌ Use emojis without grayscale filter
❌ Send data to external servers
❌ Use inline styles in HTML (use CSS classes)

## 🐛 Testing Checklist

When adding/modifying a tool:

- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test with empty input
- [ ] Test with invalid input
- [ ] Test with large input (scrolling)
- [ ] Test copy functionality
- [ ] Test download functionality
- [ ] Test clear functionality
- [ ] Test responsive layout (mobile)
- [ ] Check for console errors
- [ ] Verify navigation works
- [ ] Test keyboard shortcuts (if applicable)

## 🔄 Git Workflow

### Committing Changes
```bash
git add <files>
git commit -m "Descriptive message

- Bullet point list of changes
- Be specific about what changed
- Mention any breaking changes"
```

### Branch Naming
Development branches should follow: `claude/<description>-<session-id>`

### Pushing
```bash
git push -u origin <branch-name>
```

## 🏗️ Architecture Decisions

### Why Single-Page App?
- Better code organization
- Shared navigation and theme
- Consistent UI/UX
- Easier maintenance
- Faster loading (no page reloads)

### Why Module Pattern?
- Clear separation of concerns
- Easy to test
- Reusable utilities
- Better code organization

### Why Inline Styles for Content?
- Tool outputs need custom formatting
- Avoids CSS class proliferation
- Dynamic content styling
- Easier to maintain tool-specific styling

## 📚 Key Files Reference

### Must-Read Files
1. `index.html` - Main structure, all tools
2. `js/app.js` - Module imports, initialization
3. `js/utils.js` - Shared utilities
4. `css/variables.css` - Theme colors

### Example Tools
- **Simple:** `js/base64.js` - Basic encode/decode
- **Medium:** `js/jwt.js` - JSON parsing with display
- **Complex:** `js/certificate.js` - Binary parsing, multiple formats

## 🎓 Learning Path

For new tools:
1. Start by reading `js/base64.js` (simple example)
2. Review `js/jwt.js` (JSON handling)
3. Study `js/certificate.js` (advanced parsing)
4. Check `js/utils.js` for available helpers
5. Look at `css/variables.css` for theming

## 🚀 Quick Start Template

Copy the structure from Step 1-4 above, replace:
- `your-tool` → your tool ID
- `🔧` → your emoji
- `Your Tool Name` → your tool name
- `toolInput/toolOutput/toolErrorMessage` → your IDs
- `processTool()` → your function name

Then implement your processing logic!

---

**Last Updated:** December 2025
**Project:** Dev Tools - Essential Developer Utilities
**Architecture:** Single-Page Application with ES6 Modules
