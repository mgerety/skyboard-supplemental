# Skyboard JavaScript Components

Version: 1.0

This directory contains reusable JavaScript components and utilities for the Skyboard web interface.

## Files

- **components.js** (7.1KB) - UI components (Modal, Toast, LoadingSpinner)
- **api.js** (4.4KB) - API client wrapper for ESP8266 endpoints

## Usage

### Including Scripts

```html
<script src="/js/components.js"></script>
<script src="/js/api.js"></script>
```

**Note:** These are vanilla JavaScript files with no external dependencies.

## API Client (api.js)

Wrapper for ESP8266 HTTP endpoints with consistent error handling.

### getConfig()

Get current device configuration.

```javascript
const result = await API.getConfig();
if (result.success) {
  console.log('Config:', result.data);
  // result.data = { numLeds, brightness, airports: [...] }
} else {
  console.error('Error:', result.error);
}
```

**Returns:**
```typescript
Promise<{
  success: boolean,
  data?: {
    numLeds: number,
    brightness: number,
    hostname: string,
    airports: Array<{led: number, code: string}>
  },
  error?: string
}>
```

### saveConfig(config)

Save configuration to device.

```javascript
const config = {
  numLeds: 150,
  brightness: 128,
  hostname: 'led-sectional',
  airports: [
    { led: 5, code: 'KSFO' },
    { led: 6, code: 'KSEA' }
  ]
};

const result = await API.saveConfig(config);
if (result.success) {
  console.log('Config saved successfully');
} else {
  console.error('Save failed:', result.error);
}
```

**Returns:**
```typescript
Promise<{
  success: boolean,
  error?: string
}>
```

### getStatus()

Get system status information.

```javascript
const result = await API.getStatus();
if (result.success) {
  console.log('Status:', result.data);
  // result.data = { uptime, freeHeap, wifiRSSI, lastUpdate, etc. }
}
```

### forceRefresh()

Force immediate weather data refresh.

```javascript
const result = await API.forceRefresh();
if (result.success) {
  console.log('Refresh triggered');
}
```

### getLogs(type)

Get logs from device.

```javascript
// Get all logs
const result = await API.getLogs('all');

// Get specific log type
const weatherLogs = await API.getLogs('weather');
const errorLogs = await API.getLogs('error');
```

### getAirports()

Get airport database (from `/data/airports.json`).

```javascript
const result = await API.getAirports();
if (result.success) {
  const airports = result.data; // Array of airport objects
}
```

### reboot()

Reboot the ESP8266 device (if endpoint exists).

```javascript
const result = await API.reboot();
if (result.success) {
  console.log('Device rebooting...');
}
```

## UI Components (components.js)

### Modal

Create modal dialogs with overlay and close handling.

**Basic Usage:**

```javascript
const modal = new Modal();
modal.show('Title', 'Content goes here');
```

**With HTML Content:**

```javascript
const modal = new Modal();
modal.show(
  'Confirm Delete',
  '<p>Are you sure you want to delete this airport?</p>',
  () => console.log('Modal closed')
);
```

**With DOM Element:**

```javascript
const content = document.createElement('div');
content.innerHTML = '<p>Custom content</p>';

const modal = new Modal();
modal.show('Title', content);
```

**Close Modal:**

```javascript
modal.hide();
```

**Features:**
- Overlay click to close
- Escape key to close
- Focus trap
- ARIA attributes for accessibility

### Toast

Show temporary notifications.

**Basic Usage:**

```javascript
Toast.show('Configuration saved!', 'success');
Toast.show('Error loading config', 'error');
Toast.show('WiFi connected', 'info');
Toast.show('Battery low', 'warning');
```

**Custom Duration:**

```javascript
Toast.show('This stays for 5 seconds', 'info', 5000);
Toast.show('This stays forever', 'info', 0); // No auto-dismiss
```

**Dismiss Toasts:**

```javascript
// Dismiss specific toast
const toast = Toast.show('Message', 'info');
Toast.dismiss(toast);

// Dismiss all toasts
Toast.dismissAll();
```

**Parameters:**
- `message` (string): Message to display
- `type` (string): 'success', 'error', 'info', or 'warning'
- `duration` (number): Auto-dismiss duration in ms (default: 3000, 0 = no auto-dismiss)

### LoadingSpinner

Show loading state on buttons.

**Attach Spinner:**

```javascript
const button = document.querySelector('#saveBtn');
LoadingSpinner.attach(button);
// Button is now disabled with spinner
```

**With Loading Text:**

```javascript
LoadingSpinner.attach(button, 'Saving...');
```

**Detach Spinner:**

```javascript
LoadingSpinner.detach(button);
// Button restored to original state
```

**Example with API call:**

```javascript
const saveButton = document.querySelector('#saveBtn');

saveButton.addEventListener('click', async () => {
  LoadingSpinner.attach(saveButton, 'Saving...');

  const result = await API.saveConfig(config);

  LoadingSpinner.detach(saveButton);

  if (result.success) {
    Toast.show('Configuration saved!', 'success');
  } else {
    Toast.show('Save failed: ' + result.error, 'error');
  }
});
```

## Utility Functions

### formatAirportCode(code)

Format airport code for display.

```javascript
formatAirportCode('ksfo');  // Returns: 'KSFO'
formatAirportCode(null);    // Returns: 'N/A'
```

### getFlightCategoryColor(category)

Get CSS color for flight category.

```javascript
getFlightCategoryColor('VFR');   // Returns: 'var(--color-vfr)'
getFlightCategoryColor('IFR');   // Returns: 'var(--color-ifr)'
```

### createBadge(category)

Create badge element for flight category.

```javascript
const badge = createBadge('VFR');
document.body.appendChild(badge);
// Renders: <span class="badge badge-vfr">VFR</span>
```

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skyboard Configuration</title>
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/components.css">
</head>
<body>
  <div class="container">
    <div class="card mt-3">
      <div class="card-header">
        <h1 class="card-title">LED Configuration</h1>
      </div>
      <div class="card-body">
        <label class="label">LED Brightness</label>
        <input type="range" id="brightness" min="0" max="255" value="128">
        <button id="saveBtn" class="btn btn-primary mt-3">Save Configuration</button>
        <button id="refreshBtn" class="btn btn-secondary mt-3">Force Refresh</button>
      </div>
    </div>
  </div>

  <script src="/js/components.js"></script>
  <script src="/js/api.js"></script>
  <script>
    // Load current config
    async function loadConfig() {
      const result = await API.getConfig();
      if (result.success) {
        document.querySelector('#brightness').value = result.data.brightness;
      } else {
        Toast.show('Failed to load config: ' + result.error, 'error');
      }
    }

    // Save config
    document.querySelector('#saveBtn').addEventListener('click', async () => {
      const button = document.querySelector('#saveBtn');
      LoadingSpinner.attach(button, 'Saving...');

      const brightness = parseInt(document.querySelector('#brightness').value);

      // Get existing config first
      const getResult = await API.getConfig();
      if (!getResult.success) {
        LoadingSpinner.detach(button);
        Toast.show('Failed to get config: ' + getResult.error, 'error');
        return;
      }

      // Update brightness
      const config = getResult.data;
      config.brightness = brightness;

      // Save
      const saveResult = await API.saveConfig(config);
      LoadingSpinner.detach(button);

      if (saveResult.success) {
        Toast.show('Configuration saved!', 'success');
      } else {
        Toast.show('Save failed: ' + saveResult.error, 'error');
      }
    });

    // Force refresh
    document.querySelector('#refreshBtn').addEventListener('click', async () => {
      const button = document.querySelector('#refreshBtn');
      LoadingSpinner.attach(button);

      const result = await API.forceRefresh();
      LoadingSpinner.detach(button);

      if (result.success) {
        Toast.show('Weather refresh triggered', 'success');
      } else {
        Toast.show('Refresh failed: ' + result.error, 'error');
      }
    });

    // Load on page load
    loadConfig();
  </script>
</body>
</html>
```

## Error Handling

All API functions return an object with `success` boolean. Always check this before accessing data:

```javascript
const result = await API.getConfig();
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features (async/await, fetch, classes)
- No polyfills required for ESP8266's embedded browser use case

## File Size Budget

- api.js: 4.4KB (target: <5KB)
- components.js: 7.1KB (target: <8KB)
- **Total: 11.5KB unminified**

For production, consider minifying to reduce file size by ~30-40%.
