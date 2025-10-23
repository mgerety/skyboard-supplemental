/**
 * Skyboard UI Components
 * Version: 1.0
 * Vanilla JavaScript, no dependencies
 */

/**
 * Modal Component
 * Creates accessible modal dialogs with overlay and close handling
 */
class Modal {
  constructor() {
    this.overlay = null;
    this.modal = null;
    this.onCloseCallback = null;
  }

  /**
   * Show modal dialog
   * @param {string} title - Modal title
   * @param {string|HTMLElement} content - Content (HTML string or element)
   * @param {function} onClose - Optional callback when closed
   */
  show(title, content, onClose = null) {
    this.onCloseCallback = onClose;

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-labelledby', 'modal-title');

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = 'modal';

    // Create header
    const header = document.createElement('div');
    header.className = 'modal-header';

    const titleEl = document.createElement('h2');
    titleEl.id = 'modal-title';
    titleEl.className = 'modal-title';
    titleEl.textContent = title;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.onclick = () => this.hide();

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // Create body
    const body = document.createElement('div');
    body.className = 'modal-body';
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }

    // Assemble modal
    this.modal.appendChild(header);
    this.modal.appendChild(body);
    this.overlay.appendChild(this.modal);

    // Add to DOM
    document.body.appendChild(this.overlay);

    // Event handlers
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) this.hide();
    };

    document.addEventListener('keydown', this.handleEscape);

    // Focus trap
    this.modal.setAttribute('tabindex', '-1');
    this.modal.focus();
  }

  /**
   * Hide and remove modal
   */
  hide() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    document.removeEventListener('keydown', this.handleEscape);
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
    this.overlay = null;
    this.modal = null;
  }

  /**
   * Handle Escape key
   */
  handleEscape = (e) => {
    if (e.key === 'Escape') {
      this.hide();
    }
  }
}

/**
 * Toast Notification Component
 * Shows temporary notifications
 */
class Toast {
  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - 'success', 'error', 'info', or 'warning'
   * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
   */
  static show(message, type = 'info', duration = 3000) {
    // Ensure container exists
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // Add to container
    container.appendChild(toast);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        // Remove container if empty
        if (container.children.length === 0 && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, duration);
    }

    return toast;
  }

  /**
   * Dismiss a specific toast
   * @param {HTMLElement} toast - Toast element to dismiss
   */
  static dismiss(toast) {
    if (toast && toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }

  /**
   * Dismiss all toasts
   */
  static dismissAll() {
    const container = document.querySelector('.toast-container');
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Loading Spinner Component
 * Shows loading state on buttons
 */
class LoadingSpinner {
  /**
   * Attach spinner to button
   * @param {HTMLButtonElement} button - Button element
   * @param {string} text - Optional text to show while loading
   */
  static attach(button, text = null) {
    if (!button) return;

    // Store original content
    button.dataset.originalContent = button.innerHTML;
    button.dataset.originalDisabled = button.disabled;

    // Create spinner
    const spinner = document.createElement('span');
    spinner.className = 'loading';
    spinner.setAttribute('aria-label', 'Loading');

    // Update button
    button.innerHTML = '';
    button.appendChild(spinner);
    if (text) {
      button.appendChild(document.createTextNode(' ' + text));
    }
    button.disabled = true;
  }

  /**
   * Detach spinner from button
   * @param {HTMLButtonElement} button - Button element
   */
  static detach(button) {
    if (!button) return;

    // Restore original content
    if (button.dataset.originalContent !== undefined) {
      button.innerHTML = button.dataset.originalContent;
      delete button.dataset.originalContent;
    }

    // Restore disabled state
    if (button.dataset.originalDisabled !== undefined) {
      button.disabled = button.dataset.originalDisabled === 'true';
      delete button.dataset.originalDisabled;
    } else {
      button.disabled = false;
    }
  }
}

/**
 * Utility: Format airport code for display
 * @param {string} code - Airport ICAO code
 * @returns {string} Formatted code
 */
function formatAirportCode(code) {
  if (!code) return 'N/A';
  return code.toUpperCase();
}

/**
 * Utility: Get flight category color
 * @param {string} category - Flight category (VFR, MVFR, IFR, LIFR, WVFR)
 * @returns {string} CSS color value
 */
function getFlightCategoryColor(category) {
  const colors = {
    'VFR': 'var(--color-vfr)',
    'MVFR': 'var(--color-mvfr)',
    'IFR': 'var(--color-ifr)',
    'LIFR': 'var(--color-lifr)',
    'WVFR': 'var(--color-wvfr)'
  };
  return colors[category] || 'var(--color-border)';
}

/**
 * Utility: Create badge element
 * @param {string} category - Flight category
 * @returns {HTMLElement} Badge element
 */
function createBadge(category) {
  const badge = document.createElement('span');
  badge.className = `badge badge-${category.toLowerCase()}`;
  badge.textContent = category;
  return badge;
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Modal, Toast, LoadingSpinner, formatAirportCode, getFlightCategoryColor, createBadge };
}
