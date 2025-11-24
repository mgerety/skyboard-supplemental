# Skyboard CSS Design System

Version: 1.0

This directory contains the CSS design system for the Skyboard web interface.

## Files

- **base.css** (4.3KB) - CSS custom properties, typography, spacing, colors
- **components.css** (8.8KB) - Reusable component styles

## Usage

### Including Styles

```html
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/components.css">
```

**Note:** `base.css` must be loaded first as it defines CSS custom properties used by `components.css`.

## CSS Custom Properties

### Colors

#### Flight Category Colors
```css
--color-vfr: #00ff00;      /* Green - Visual Flight Rules */
--color-mvfr: #0000ff;     /* Blue - Marginal VFR */
--color-ifr: #ff0000;      /* Red - Instrument Flight Rules */
--color-lifr: #ff00ff;     /* Magenta - Low IFR */
--color-wvfr: #ffff00;     /* Yellow - Windy VFR */
```

#### UI Colors (Light Mode)
```css
--color-bg: #ffffff;
--color-surface: #f8f9fa;
--color-text: #212529;
--color-text-muted: #6c757d;
--color-input-bg: #f5f5f5;
--color-border: #dee2e6;
--color-accent: #0066cc;
--color-success: #28a745;
--color-error: #dc3545;
--color-warning: #ffc107;
--color-info: #17a2b8;
```

#### Dark Mode
Dark mode is automatically applied when the user's system preference is set to dark mode (`prefers-color-scheme: dark`). Background, text, and input colors are inverted for better readability.

### Typography

```css
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "SF Mono", Monaco, Consolas, monospace;
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.5rem;     /* 24px */
--font-size-2xl: 2rem;      /* 32px */
```

### Spacing

Based on a 4px scale:

```css
--spacing-xs: 0.25rem;      /* 4px */
--spacing-sm: 0.5rem;       /* 8px */
--spacing-md: 1rem;         /* 16px */
--spacing-lg: 1.5rem;       /* 24px */
--spacing-xl: 2rem;         /* 32px */
--spacing-2xl: 3rem;        /* 48px */
```

### Borders & Shadows

```css
--border-radius: 6px;
--border-width: 1px;
--box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
```

## Component Classes

### Buttons

```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-danger">Delete</button>
<button class="btn btn-success">Save</button>
<button class="btn btn-small">Small Button</button>
<button class="btn btn-block">Full Width</button>
```

**States:** `:hover`, `:active`, `:disabled`

### Form Controls

```html
<input type="text" class="input" placeholder="Airport code">
<select class="select">
  <option>Option 1</option>
</select>
<textarea class="textarea"></textarea>
<label class="label">LED Number</label>
```

**Toggle Switch:**
```html
<label class="toggle">
  <input type="checkbox">
  <span class="toggle-slider"></span>
</label>
```

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Configuration</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
  <div class="card-footer">
    <button class="btn">Save</button>
  </div>
</div>
```

### Modal

Modals are controlled via JavaScript (see [../js/README.md](../js/README.md)), but the CSS provides styling:

```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">Title</h2>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">Content</div>
    <div class="modal-footer">
      <button class="btn">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Toast Notifications

```html
<div class="toast-container">
  <div class="toast toast-success">Success message</div>
  <div class="toast toast-error">Error message</div>
  <div class="toast toast-info">Info message</div>
  <div class="toast toast-warning">Warning message</div>
</div>
```

### Badges

```html
<span class="badge">Default</span>
<span class="badge badge-vfr">VFR</span>
<span class="badge badge-mvfr">MVFR</span>
<span class="badge badge-ifr">IFR</span>
<span class="badge badge-lifr">LIFR</span>
<span class="badge badge-wvfr">WVFR</span>
```

### Layout Helpers

```html
<div class="container">
  <!-- Max-width 1200px, centered, responsive padding -->
</div>

<div class="grid grid-2">
  <!-- 2-column responsive grid -->
</div>

<div class="flex">
  <!-- Flexbox with gap -->
</div>

<div class="flex-between">
  <!-- Flex with space-between -->
</div>

<div class="stack">
  <!-- Vertical stack with gap -->
</div>
```

### Utility Classes

```css
.text-center      /* Center text */
.text-muted       /* Muted text color */
.text-bold        /* Bold text */

.mt-2, .mt-3      /* Margin top */
.mb-2, .mb-3      /* Margin bottom */

.hidden           /* Display: none */
.invisible        /* Visibility: hidden */

.loading          /* Spinning loader */
.loading-large    /* Larger spinner */

.sr-only          /* Screen reader only (accessible) */
```

## Example Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skyboard</title>
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
        <label class="label">Airport Code</label>
        <input type="text" class="input" placeholder="KSFO">
        <button class="btn btn-primary mt-3">Save</button>
      </div>
    </div>
  </div>
</body>
</html>
```

## Customization

To override design system variables, define them **after** importing `base.css`:

```html
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/components.css">
<style>
  :root {
    --color-accent: #ff6600; /* Custom accent color */
  }
</style>
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 12+
- Android Chrome 80+
- CSS custom properties required (no IE11 support)

## File Size Budget

- base.css: 4.3KB (target: <10KB)
- components.css: 8.8KB (target: <10KB)
- **Total: 13.1KB unminified**

For production, consider minifying with a tool like `cssnano` to reduce file size by ~30-40%.
