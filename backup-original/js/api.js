/**
 * Skyboard API Client
 * Version: 1.0
 * Wrapper for ESP8266 API endpoints
 */

const API = {
  /**
   * Get current configuration
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getConfig() {
    try {
      const res = await fetch('/config', {
        method: 'GET',
        cache: 'no-cache'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      console.error('API getConfig error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Save configuration
   * @param {object} config - Configuration object
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async saveConfig(config) {
    try {
      const res = await fetch('/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config),
        cache: 'no-cache'
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('API saveConfig error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get system status
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getStatus() {
    try {
      const res = await fetch('/api/status', {
        method: 'GET',
        cache: 'no-cache'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      console.error('API getStatus error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Force weather data refresh
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async forceRefresh() {
    try {
      const res = await fetch('/api/refresh', {
        method: 'POST',
        cache: 'no-cache'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('API forceRefresh error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get logs
   * @param {string} type - Log type ('weather', 'system', 'error', etc.)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getLogs(type = 'all') {
    try {
      const url = type === 'all' ? '/api/logs' : `/api/logs?type=${encodeURIComponent(type)}`;
      const res = await fetch(url, {
        method: 'GET',
        cache: 'no-cache'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      console.error('API getLogs error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Reboot device (if endpoint exists)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async reboot() {
    try {
      const res = await fetch('/api/reboot', {
        method: 'POST',
        cache: 'no-cache'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('API reboot error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get airport database
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getAirports() {
    try {
      const res = await fetch('/data/airports.json', {
        method: 'GET',
        cache: 'default' // Can cache airport data
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      console.error('API getAirports error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
