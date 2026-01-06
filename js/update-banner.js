/**
 * Update Banner - Shows notification when firmware or web updates are available
 * Loads on all pages and checks /api/v1/firmware/check (triggers check via POST first)
 */
(function() {
  'use strict';

  const DISMISS_KEY = 'skyboard-update-banner-dismissed';
  const BANNER_ID = 'update-banner';

  // Check if banner was dismissed this session
  function isDismissed() {
    return sessionStorage.getItem(DISMISS_KEY) === 'true';
  }

  function dismissBanner() {
    sessionStorage.setItem(DISMISS_KEY, 'true');
    const banner = document.getElementById(BANNER_ID);
    if (banner) {
      banner.remove();
    }
  }

  function createBanner(message) {
    // Don't show if dismissed
    if (isDismissed()) return;

    // Don't show if already exists
    if (document.getElementById(BANNER_ID)) return;

    const banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.className = 'update-banner';
    banner.innerHTML = `
      <span class="update-message">${message}</span>
      <a href="/system.html" class="update-link">Update now</a>
      <button class="update-dismiss" onclick="window.dismissUpdateBanner()" aria-label="Dismiss">&times;</button>
    `;

    // Insert at top of body (after any existing invalid-files banner)
    const existingBanner = document.querySelector('.invalid-files-banner');
    if (existingBanner) {
      existingBanner.after(banner);
    } else {
      document.body.prepend(banner);
    }
  }

  async function checkForUpdates() {
    try {
      // Trigger an update check first
      await fetch('/api/v1/firmware/check', { method: 'POST' });

      // Poll until check completes (max 5 seconds)
      let data = null;
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 500));
        const response = await fetch('/api/v1/firmware/check');
        if (!response.ok) return;
        data = await response.json();
        if (data.state_name !== 'checking') break;
      }

      if (!data) return;

      // Determine what updates are available
      const firmwareAvailable = data.state_name === 'available';
      const webAvailable = data.web && data.web.update_available;

      // Build message
      let message = '';
      if (firmwareAvailable && webAvailable) {
        message = 'Firmware and web updates available';
      } else if (firmwareAvailable) {
        message = 'New firmware available';
      } else if (webAvailable) {
        message = 'New web interface available';
      }

      if (message) {
        createBanner(message);
      }
    } catch (error) {
      // Silently fail - banner is not critical
      console.debug('[update-banner] Check failed:', error);
    }
  }

  // Expose dismiss function globally
  window.dismissUpdateBanner = dismissBanner;

  // Check on page load (with slight delay to not block rendering)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(checkForUpdates, 1000));
  } else {
    setTimeout(checkForUpdates, 1000);
  }
})();
