# Skyboard Supplemental Resources

**Public web interface files for the Skyboard aviation weather display system**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![ESP8266](https://img.shields.io/badge/platform-ESP8266-blue.svg)](https://www.espressif.com/)

---

## Overview

This repository contains the **web-based configuration interface** for [Skyboard](https://github.com/mgerety/skyboard-private), an ESP8266-powered LED aviation sectional chart display. The HTML/CSS/JavaScript files are served dynamically by the ESP8266 device to minimize memory usage on the microcontroller.

### Why a Separate Repository?

**Memory Constraints:** The ESP8266 has limited RAM (~35KB usable heap). Embedding the full web interface HTML (~15KB) directly in the firmware left insufficient memory for TLS/HTTPS operations, causing out-of-memory errors during API requests.

**Solution:** Store web interface files in this public GitHub repository and fetch them on-demand via HTTP. This approach:
- Reduces firmware size by ~15KB
- Frees heap memory for TLS handshakes
- Allows web UI updates without firmware reflashing
- Enables faster iteration on UI improvements

---

## Repository Contents

```
skyboard-supplemental/
├── index.html         # Main configuration page
├── diagnostics.html   # System diagnostics dashboard
├── styles.css         # Shared CSS styles
├── script.js          # Client-side JavaScript
└── README.md          # This file
```

---

## Usage

### For End Users

**You don't need to interact with this repository directly.** When you power on your Skyboard device, it automatically fetches these files from GitHub and serves them through its local web interface.

Simply navigate to:
- **http://skyboard.local** (via mDNS)
- **http://[device-ip-address]** (fallback)

### For Developers

These files are loaded by the Skyboard firmware on first boot (or when cache expires). The ESP8266 performs an HTTP GET request to GitHub's raw content URLs:

```
https://raw.githubusercontent.com/mgerety/skyboard-supplemental/main/index.html
https://raw.githubusercontent.com/mgerety/skyboard-supplemental/main/diagnostics.html
https://raw.githubusercontent.com/mgerety/skyboard-supplemental/main/styles.css
https://raw.githubusercontent.com/mgerety/skyboard-supplemental/main/script.js
```

**Caching Strategy:**
- HTML/CSS/JS cached in ESP8266 SPIFFS/LittleFS
- Cache expires after 24 hours
- Manual cache clear via diagnostics page
- Firmware update clears cache

---

## File Descriptions

### index.html

Main configuration interface featuring:
- LED count and brightness controls
- Airport code assignment grid (up to 150 LEDs)
- Special values: NULL/BLACK (off), LIFR/IFR/MVFR/WVFR/VFR (legend colors)
- Network settings (hostname, mDNS enable/disable)
- Weather update interval (5-60 minutes)
- Real-time validation (airport code format, hostname rules)
- Configuration save/reset buttons

**Key Features:**
- Responsive design (mobile-friendly)
- Client-side validation before server submission
- Immediate visual feedback on save
- Error handling with user-friendly messages

### diagnostics.html

System diagnostics dashboard featuring:
- **LED Status Table**: Shows LED#, airport assignment, flight category, color preview
- **Force Refresh**: Trigger immediate weather data update
- **Raw API Response Viewer**: Inspect JSON from Aviation Weather API
- **System Logs**: View error and info logs with timestamps
- **Log Management**: Clear logs manually
- **System Info**: Free heap, uptime, WiFi signal strength

### styles.css

Unified stylesheet providing:
- Modern, clean design aesthetic
- Aviation-themed color palette (blues, greens, flight category colors)
- Responsive grid layouts
- Accessible form controls
- Hover/focus states for interactive elements

### script.js

Client-side JavaScript functionality:
- AJAX requests to ESP8266 REST API endpoints
- Configuration validation before submission
- Dynamic DOM updates (no page reloads)
- Real-time diagnostics data refresh
- Error handling and user notifications

---

## Development

### Local Testing

To test changes locally before pushing:

1. **Clone this repository:**
   ```bash
   git clone https://github.com/mgerety/skyboard-supplemental.git
   cd skyboard-supplemental
   ```

2. **Start a local web server:**
   ```bash
   # Python 3
   python3 -m http.server 8080

   # OR Node.js (if http-server installed)
   npx http-server -p 8080

   # OR PHP
   php -S localhost:8080
   ```

3. **Open in browser:**
   ```
   http://localhost:8080/index.html
   ```

4. **Mock ESP8266 API responses** (for testing without hardware):
   - Create a `mock-api.json` file with sample config data
   - Modify `script.js` to use local mock instead of `/config` endpoint

### Making Changes

⚠️ **CRITICAL: You MUST regenerate the manifest after ANY file changes!**

1. **Edit files** in your local clone
2. **Test thoroughly** with local web server
3. **Regenerate manifest.json** (computes file hashes for ESP32):
   ```bash
   ./generate-manifest.sh
   ```
4. **Commit and push** to GitHub:
   ```bash
   git add -A
   git commit -m "Description of changes"
   git push origin main
   ```
5. **Power cycle ESP32** to download new files
6. **Verify changes** load on device

### ⚠️ MANDATORY: Hash Manifest System

The ESP32 uses file hashes to determine which files have changed. **If you don't regenerate the manifest, the ESP32 will not download your changes!**

**How it works:**
- `manifest.json` contains version number and MD5 hash for each file
- ESP32 compares local file hashes against remote manifest
- Only files with different hashes are downloaded
- This saves bandwidth and time (skips unchanged files like `airports.json`)

**After ANY file change:**
```bash
./generate-manifest.sh    # Regenerates hashes for all files
git add -A                # Stage manifest.json and changed files
git commit -m "..."       # Commit everything
git push                  # Push to GitHub
```

**If you forget to regenerate the manifest:**
- ESP32 will see matching hashes for unchanged manifest
- Your new code will NOT be downloaded
- You'll wonder why your changes aren't working
- You'll waste hours debugging the wrong thing

**DON'T FORGET: `./generate-manifest.sh` EVERY TIME!**

### Design Guidelines

- **Keep HTML semantic** (use proper tags: `<form>`, `<button>`, `<table>`)
- **Mobile-first responsive design** (many users configure via phone)
- **Minimize file sizes** (every byte counts on ESP8266 HTTP transfers)
- **Avoid external dependencies** (no jQuery, Bootstrap CDN, etc. - device may be offline)
- **Test on actual hardware** (browser DevTools don't catch ESP8266 quirks)

---

## API Endpoints

The web interface interacts with these ESP8266 REST API endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/config` | GET | Fetch current device configuration |
| `/save` | POST | Save new configuration (JSON body) |
| `/diagnostics` | GET | Fetch diagnostics data |
| `/api/forceRefresh` | POST | Trigger immediate weather update |
| `/api/lastResponse` | GET | Get last weather API response |
| `/api/logs?type=error` | GET | Fetch error logs |
| `/api/logs?type=info` | GET | Fetch info logs |
| `/api/clearLogs?type=error` | POST | Clear error logs |
| `/api/clearLogs?type=info` | POST | Clear info logs |

**Expected Config JSON Format:**
```json
{
  "numLeds": 50,
  "brightness": 80,
  "airports": ["LIFR", "IFR", "MVFR", "WVFR", "VFR", "KSFO", "KLAX", ...],
  "hostname": "skyboard",
  "useMDNS": true,
  "updateIntervalMinutes": 15
}
```

---

## Browser Compatibility

**Fully Tested:**
- Safari 14+ (macOS, iOS, iPadOS)
- Chrome 90+ (macOS, Windows, Linux, Android)
- Edge 90+ (Windows, macOS)

**Partially Tested:**
- Firefox 88+ (mDNS `.local` resolution may not work on all platforms)

**Required Browser Features:**
- Fetch API (or XMLHttpRequest fallback)
- ES6 JavaScript (arrow functions, template literals)
- CSS Grid Layout
- CSS Flexbox

**Note:** Internet Explorer is NOT supported (device uses modern JavaScript).

---

## Security

### Why Public Repository?

This repository is intentionally **public** because:
- No sensitive information (no WiFi passwords, API keys, or credentials)
- Generic web interface (works for any Skyboard device)
- ESP8266 fetches via HTTP (no authentication needed)
- Proprietary firmware code remains in private repository

### Security Considerations

- **Local Network Only**: ESP8266 web server should NEVER be exposed to the internet
- **No Authentication**: Web interface has no login (anyone on local network can configure)
- **Input Validation**: Server-side validation on ESP8266 prevents malicious input
- **HTTPS Not Required**: Local network traffic (your browser → ESP8266) uses HTTP
- **API Data Public**: Aviation weather data is publicly available (no secrets)

**Recommendation:** Keep your ESP8266 on a private home network, NOT guest WiFi or public networks.

---

## Contributing

This is part of the Skyboard project. For questions, bug reports, or feature requests, please [open an issue](https://github.com/mgerety/skyboard-supplemental/issues).

### Pull Request Guidelines

1. **Test locally** with Python/Node.js web server
2. **Test on actual hardware** (changes must work on ESP8266)
3. **Keep dependencies minimal** (no npm packages, no CDN links)
4. **Maintain file size discipline** (gzip files before committing if needed)
5. **Document breaking changes** (if API contract changes, update README)

---

## Changelog

### v1.0.0 (2025-01-XX)

**Initial Release:**
- Main configuration page (index.html)
- Diagnostics dashboard (diagnostics.html)
- Unified stylesheet (styles.css)
- Client-side JavaScript (script.js)
- Full REST API integration

---

## Resources

- **Main Skyboard Project:** https://github.com/mgerety/skyboard-private (private)
- **Aviation Weather API:** https://aviationweather.gov/data/api/
- **ESP8266 Arduino Core:** https://arduino-esp8266.readthedocs.io/
- **FastLED Library:** http://fastled.io/

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Part of the Skyboard project - Built with ❤️ for the aviation community**
