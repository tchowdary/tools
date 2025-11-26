# Dev Utilities

A lightweight collection of essential developer tools built with vanilla HTML, CSS, and JavaScript.

## Features

### Core Tools
- 📄 **JSON Parser & Formatter** - Parse, validate, format, and minify JSON data
  - Configurable indentation (0-8 spaces)
  - Format and minify JSON
  - Copy to clipboard
  - Download formatted JSON
  - Real-time validation with error messages

- 🔐 **Base64 Encoder/Decoder** - Encode and decode Base64 data
  - Toggle between encode and decode modes
  - Real-time encoding/decoding as you type
  - Upload files for encoding
  - Load sample data
  - Copy to clipboard
  - Download results
  - Support for UTF-8 text

- 🕐 **Timestamp Converter** - Convert between Unix timestamps and human-readable dates
  - Real-time current time display in multiple formats
  - Convert timestamp to date (supports seconds and milliseconds)
  - Convert date to timestamp
  - ISO 8601, UTC, and local time formats
  - Relative time display (e.g., "5 minutes ago")
  - Copy any format to clipboard

- 🔑 **JWT Decoder** - Decode, validate, and verify JWT tokens
  - Real-time JWT parsing and validation
  - Decode header and payload with JSON syntax highlighting
  - Display decoded data in formatted JSON
  - Optional signature verification interface
  - Generate example JWT for testing
  - Copy individual sections (header, payload, secret)
  - Support for base64url decoding
  - Error handling for malformed tokens

### Coming Soon
- **#** **Hash Generator** - Generate MD5, SHA-1, SHA-256 hashes
- 🆔 **UUID Generator** - Generate unique identifiers
- 🔗 **URL Encoder** - Encode and decode URLs
- 📊 **Text Compare** - Compare two text documents
- 🔍 **Regex Tester** - Test and validate regular expressions

### UI Features
- 🌓 **Dark/Light Mode** - Toggle between dark and light themes
  - Smooth transitions between themes
  - Persistent theme preference (localStorage)
  - Applies to both sidebar and main content area
- 🔍 **Search** - Quickly find tools in the sidebar
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Design Principles

- **Lightweight** - No heavy frameworks or dependencies
- **Fast** - Pure vanilla JavaScript for instant performance
- **Offline** - Works completely offline, no external API calls
- **Privacy** - All processing happens in your browser
- **Modern UI** - Clean, intuitive interface

## Usage

Simply open `index.html` in any modern web browser. No build process or installation required.

## Technology Stack

- HTML5
- CSS3 (with Grid and Flexbox)
- Vanilla JavaScript (no frameworks)

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

Feel free to add more tools by:
1. Adding a new nav item in the sidebar
2. Creating a new tool section in the main content
3. Implementing the tool's functionality in vanilla JavaScript

## License

MIT License - Feel free to use and modify as needed.
