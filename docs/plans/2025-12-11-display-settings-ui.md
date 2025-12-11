# Display Settings UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Display Settings UI section to device.html for controlling LED on/off, auto-brightness, and quiet hours scheduling.

**Architecture:** Add a new "Display Settings" card to device.html between LED Strip Configuration and Network cards. Uses existing toggle/form patterns. Calls new `/api/v1/display-settings` endpoint on save.

**Tech Stack:** HTML, vanilla JavaScript, existing sidebar.css styles

---

### Task 1: Add Display Settings Card HTML

**Files:**
- Modify: `/Users/michaelgerety/repos/Personal/skyboard-supplemental/device.html`

**Step 1: Add Display Settings card after LED Strip Configuration card**

Find the closing `</div>` of the LED Strip Configuration card (after the Launch LED Setup Wizard button) and add this new card:

```html
        <!-- Display Settings Card -->
        <div class="card">
            <div class="card-header">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                Display Settings
            </div>
            <div class="card-body">
                <!-- Master On/Off Toggle -->
                <div class="toggle-row">
                    <div class="toggle-label">
                        <span>LEDs Enabled</span>
                        <small>Master on/off control for all LEDs</small>
                    </div>
                    <div class="toggle" id="ledsEnabled"></div>
                </div>

                <div class="section-divider"></div>

                <!-- Auto-Brightness Section -->
                <div class="toggle-row">
                    <div class="toggle-label">
                        <span>Auto-Brightness</span>
                        <small>Adjust brightness based on ambient light (requires BH1750 sensor)</small>
                    </div>
                    <div class="toggle" id="autoBrightnessEnabled"></div>
                </div>

                <div id="autoBrightnessSettings" style="margin-top: 12px;">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="brightnessMin">Minimum Brightness</label>
                            <input type="number" id="brightnessMin" min="1" max="255" value="10">
                            <span class="form-hint">Darkest setting (1-255)</span>
                        </div>
                        <div class="form-group">
                            <label for="brightnessMax">Maximum Brightness</label>
                            <input type="number" id="brightnessMax" min="1" max="255" value="255">
                            <span class="form-hint">Brightest setting (1-255)</span>
                        </div>
                    </div>
                    <div id="sensorStatus" class="wifi-status" style="margin-top: 12px;">
                        <div class="wifi-row">
                            <span>Sensor Status</span>
                            <span id="sensorAvailable">--</span>
                        </div>
                        <div class="wifi-row">
                            <span>Current Lux</span>
                            <span id="currentLux">--</span>
                        </div>
                        <div class="wifi-row">
                            <span>Target Brightness</span>
                            <span id="targetBrightness">--</span>
                        </div>
                    </div>
                </div>

                <div class="section-divider"></div>

                <!-- Quiet Hours Section -->
                <div class="toggle-row">
                    <div class="toggle-label">
                        <span>Quiet Hours</span>
                        <small>Automatically turn off LEDs during scheduled times</small>
                    </div>
                    <div class="toggle" id="quietHoursEnabled"></div>
                </div>

                <div id="quietHoursSettings" style="margin-top: 12px;">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="quietStartTime">Start Time</label>
                            <input type="time" id="quietStartTime" value="23:00">
                            <span class="form-hint">When to turn off</span>
                        </div>
                        <div class="form-group">
                            <label for="quietEndTime">End Time</label>
                            <input type="time" id="quietEndTime" value="06:00">
                            <span class="form-hint">When to turn back on</span>
                        </div>
                    </div>
                    <div id="quietHoursStatus" class="wifi-status" style="margin-top: 12px;">
                        <div class="wifi-row">
                            <span>Currently Active</span>
                            <span id="quietHoursActive">--</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
```

**Verification:** Open device.html in browser - new card should appear with toggles and form fields.

---

### Task 2: Add JavaScript State and Event Listeners

**Files:**
- Modify: `/Users/michaelgerety/repos/Personal/skyboard-supplemental/device.html`

**Step 1: Add toggle event listeners in initEventListeners()**

Add these lines inside the `initEventListeners()` function, after the existing mDNS toggle listener:

```javascript
            // Display settings toggles
            const ledsEnabledToggle = document.getElementById('ledsEnabled');
            const autoBrightnessToggle = document.getElementById('autoBrightnessEnabled');
            const quietHoursToggle = document.getElementById('quietHoursEnabled');

            ledsEnabledToggle.addEventListener('click', () => {
                ledsEnabledToggle.classList.toggle('active');
            });

            autoBrightnessToggle.addEventListener('click', () => {
                autoBrightnessToggle.classList.toggle('active');
                updateAutoBrightnessVisibility();
            });

            quietHoursToggle.addEventListener('click', () => {
                quietHoursToggle.classList.toggle('active');
                updateQuietHoursVisibility();
            });
```

**Verification:** Toggles should respond to clicks.

---

### Task 3: Add Visibility Helper Functions

**Files:**
- Modify: `/Users/michaelgerety/repos/Personal/skyboard-supplemental/device.html`

**Step 1: Add helper functions before the API FUNCTIONS section**

```javascript
        // ==================== DISPLAY SETTINGS HELPERS ====================
        function updateAutoBrightnessVisibility() {
            const enabled = document.getElementById('autoBrightnessEnabled').classList.contains('active');
            const settings = document.getElementById('autoBrightnessSettings');
            settings.style.opacity = enabled ? '1' : '0.5';
            settings.style.pointerEvents = enabled ? 'auto' : 'none';
        }

        function updateQuietHoursVisibility() {
            const enabled = document.getElementById('quietHoursEnabled').classList.contains('active');
            const settings = document.getElementById('quietHoursSettings');
            settings.style.opacity = enabled ? '1' : '0.5';
            settings.style.pointerEvents = enabled ? 'auto' : 'none';
        }
```

**Verification:** When toggles are off, their settings sections should be grayed out.

---

### Task 4: Update Form Loading from Config

**Files:**
- Modify: `/Users/michaelgerety/repos/Personal/skyboard-supplemental/device.html`

**Step 1: Add display settings to updateFormFromConfig()**

Add these lines at the end of the `updateFormFromConfig()` function:

```javascript
            // Display settings
            const ledsEnabledToggle = document.getElementById('ledsEnabled');
            if (config.leds_enabled !== false) {
                ledsEnabledToggle.classList.add('active');
            } else {
                ledsEnabledToggle.classList.remove('active');
            }

            const autoBrightnessToggle = document.getElementById('autoBrightnessEnabled');
            if (config.auto_brightness_enabled) {
                autoBrightnessToggle.classList.add('active');
            } else {
                autoBrightnessToggle.classList.remove('active');
            }
            document.getElementById('brightnessMin').value = config.brightness_min || 10;
            document.getElementById('brightnessMax').value = config.brightness_max || 255;

            const quietHoursToggle = document.getElementById('quietHoursEnabled');
            if (config.quiet_hours_enabled) {
                quietHoursToggle.classList.add('active');
            } else {
                quietHoursToggle.classList.remove('active');
            }

            // Format time values for input[type="time"]
            const startHour = String(config.quiet_start_hour || 23).padStart(2, '0');
            const startMin = String(config.quiet_start_minute || 0).padStart(2, '0');
            const endHour = String(config.quiet_end_hour || 6).padStart(2, '0');
            const endMin = String(config.quiet_end_minute || 0).padStart(2, '0');
            document.getElementById('quietStartTime').value = `${startHour}:${startMin}`;
            document.getElementById('quietEndTime').value = `${endHour}:${endMin}`;

            // Update visibility based on toggle states
            updateAutoBrightnessVisibility();
            updateQuietHoursVisibility();
```

**Verification:** Reload page - form should populate with values from firmware.

---

### Task 5: Add Display Status Loading

**Files:**
- Modify: `/Users/michaelgerety/repos/Personal/skyboard-supplemental/device.html`

**Step 1: Add loadDisplayStatus function**

Add this function after `loadSystemStatus()`:

```javascript
        async function loadDisplayStatus() {
            try {
                const response = await fetch('/api/v1/display');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const display = await response.json();
                updateDisplayStatus(display);
            } catch (error) {
                console.error('Failed to load display status:', error);
                // Non-critical, don't show toast
            }
        }

        function updateDisplayStatus(display) {
            if (!display) return;

            // Auto-brightness sensor info
            if (display.autoBrightness) {
                const ab = display.autoBrightness;
                document.getElementById('sensorAvailable').innerHTML = ab.sensorAvailable
                    ? '<span class="status-dot success"></span> Connected'
                    : '<span class="status-dot error"></span> Not detected';

                if (ab.sensorAvailable) {
                    document.getElementById('currentLux').textContent =
                        ab.currentLux !== undefined ? `${ab.currentLux.toFixed(1)} lux` : '--';
                    document.getElementById('targetBrightness').textContent =
                        ab.targetBrightness !== undefined ? ab.targetBrightness : '--';
                } else {
                    document.getElementById('currentLux').textContent = '--';
                    document.getElementById('targetBrightness').textContent = '--';
                }
            }

            // Quiet hours status
            if (display.quietHours) {
                document.getElementById('quietHoursActive').innerHTML = display.quietHours.currentlyActive
                    ? '<span class="status-dot warning"></span> Active (LEDs off)'
                    : '<span class="status-dot success"></span> Inactive';
            }
        }
```

**Step 2: Call loadDisplayStatus in DOMContentLoaded**

Update the Promise.all in DOMContentLoaded to include loadDisplayStatus:

```javascript
                await Promise.all([loadConfig(), loadSystemStatus(), loadDisplayStatus()]);
```

**Verification:** Sensor status and quiet hours status should display.

---

### Task 6: Update Save Function

**Files:**
- Modify: `/Users/michaelgerety/repos/Personal/skyboard-supplemental/device.html`

**Step 1: Update saveDeviceSettings to include display settings**

Replace the existing `saveDeviceSettings` function with:

```javascript
        async function saveDeviceSettings() {
            try {
                // Collect device settings
                const devicePayload = {
                    numLeds: parseInt(document.getElementById('numLeds').value),
                    brightness: parseInt(document.getElementById('brightnessValue').value),
                    mdns_name: document.getElementById('hostname').value.trim()
                };

                // Validate device settings
                if (devicePayload.numLeds < 1 || devicePayload.numLeds > 150) {
                    showToast('Number of LEDs must be between 1 and 150', 'error');
                    return;
                }
                if (devicePayload.brightness < 0 || devicePayload.brightness > 255) {
                    showToast('Brightness must be between 0 and 255', 'error');
                    return;
                }

                // Save device settings
                const deviceResponse = await fetch('/api/v1/device', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(devicePayload)
                });
                if (!deviceResponse.ok) {
                    throw new Error(`Device settings failed: ${deviceResponse.status}`);
                }

                // Collect display settings
                const quietStart = document.getElementById('quietStartTime').value.split(':');
                const quietEnd = document.getElementById('quietEndTime').value.split(':');

                const displayPayload = {
                    leds_enabled: document.getElementById('ledsEnabled').classList.contains('active'),
                    auto_brightness_enabled: document.getElementById('autoBrightnessEnabled').classList.contains('active'),
                    brightness_min: parseInt(document.getElementById('brightnessMin').value),
                    brightness_max: parseInt(document.getElementById('brightnessMax').value),
                    quiet_hours_enabled: document.getElementById('quietHoursEnabled').classList.contains('active'),
                    quiet_start_hour: parseInt(quietStart[0]),
                    quiet_start_minute: parseInt(quietStart[1]),
                    quiet_end_hour: parseInt(quietEnd[0]),
                    quiet_end_minute: parseInt(quietEnd[1])
                };

                // Save display settings
                const displayResponse = await fetch('/api/v1/display-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(displayPayload)
                });
                if (!displayResponse.ok) {
                    throw new Error(`Display settings failed: ${displayResponse.status}`);
                }

                showToast('Settings saved successfully', 'success');

                // Reload to get latest state
                await Promise.all([loadConfig(), loadDisplayStatus()]);
            } catch (error) {
                console.error('Failed to save settings:', error);
                showToast('Failed to save settings: ' + error.message, 'error');
            }
        }
```

**Verification:** Save button should persist all settings including display settings.

---

### Task 7: Add API Function to api.js

**Files:**
- Modify: `/Users/michaelgerety/repos/Personal/skyboard-supplemental/js/api.js`

**Step 1: Add getDisplay and setDisplay methods**

Add these methods to the API object:

```javascript
  /**
   * Get display status
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getDisplay() {
    try {
      const res = await fetch('/api/v1/display', {
        method: 'GET',
        cache: 'no-cache'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      console.error('API getDisplay error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Set display state (on/off, brightness)
   * @param {object} settings - Display settings
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async setDisplay(settings) {
    try {
      const res = await fetch('/api/v1/display', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings),
        cache: 'no-cache'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('API setDisplay error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Save display settings
   * @param {object} settings - Display configuration
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async saveDisplaySettings(settings) {
    try {
      const res = await fetch('/api/v1/display-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings),
        cache: 'no-cache'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('API saveDisplaySettings error:', error);
      return { success: false, error: error.message };
    }
  },
```

**Verification:** API object has new methods available.

---

### Task 8: Generate Manifest and Push

**Files:**
- Run: `./generate-manifest.sh`
- Git: commit and push to main

**Step 1: Generate new manifest hashes**

```bash
cd /Users/michaelgerety/repos/Personal/skyboard-supplemental
./generate-manifest.sh
```

**Step 2: Commit and push**

```bash
git add -A
git commit -m "feat: Add Display Settings UI for auto-brightness and quiet hours"
git push origin main
```

**Verification:**
1. manifest.json has updated hashes for device.html and api.js
2. Changes are on GitHub main branch

---

### Task 9: Force Update on Device

**Step 1: Trigger web file update on the ESP32**

Either via browser: Navigate to System page and click "Force Web Files Update"

Or via curl:
```bash
curl -X POST http://skyboard.local/api/v1/system/update-interface
```

**Step 2: Verify UI loads with new Display Settings section**

Navigate to Device page - should show new Display Settings card.

**Verification:** New UI is visible and functional on device.
