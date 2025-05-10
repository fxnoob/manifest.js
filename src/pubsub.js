/**
 * PubSub - A simple publish-subscribe library for communication between
 * background scripts and content scripts in browser extensions.
 *
 * This library provides an Express-like API for message passing between
 * different contexts in a browser extension.
 */

class PubSub {
  constructor() {
    this.subscribers = {};
    this.initialized = false;
    this.context = this._detectContext();
  }

  /**
   * Detect the current execution context (background or content script)
   * @returns {string} The current context ('background', 'content', or 'unknown')
   * @private
   */
  _detectContext() {
    if (typeof chrome !== 'undefined') {
      // In a browser extension environment
      if (document && document.body) {
        return 'content';
      } else if (chrome.runtime && chrome.runtime.getManifest) {
        return 'background';
      }
    }
    return 'unknown';
  }

  /**
   * Initialize the PubSub system
   */
  init() {
    if (this.initialized) return;

    // Set up message listeners based on context
    if (this.context === 'background') {
      chrome.runtime.onMessage.addListener(this._handleBackgroundMessage.bind(this));
    } else if (this.context === 'content') {
      chrome.runtime.onMessage.addListener(this._handleContentMessage.bind(this));
    }

    this.initialized = true;
  }

  /**
   * Handle messages in the background script context
   * @param {Object} message - The message object
   * @param {Object} sender - Information about the sender
   * @param {Function} sendResponse - Function to send a response
   * @returns {boolean} Whether the response will be sent asynchronously
   * @private
   */
  _handleBackgroundMessage(message, sender, sendResponse) {
    if (!message || !message.channel) return false;

    const { channel, data } = message;

    if (this.subscribers[channel]) {
      const handlers = this.subscribers[channel];

      // Execute all handlers for this channel
      for (const handler of handlers) {
        try {
          const result = handler(data, sender);
          if (result !== undefined) {
            sendResponse(result);
            return false; // No async response
          }
        } catch (error) {
          console.error(`Error in handler for channel ${channel}:`, error);
        }
      }
    }

    return false; // No async response
  }

  /**
   * Handle messages in the content script context
   * @param {Object} message - The message object
   * @param {Object} sender - Information about the sender
   * @param {Function} sendResponse - Function to send a response
   * @returns {boolean} Whether the response will be sent asynchronously
   * @private
   */
  _handleContentMessage(message, sender, sendResponse) {
    if (!message || !message.channel) return false;

    const { channel, data } = message;

    if (this.subscribers[channel]) {
      const handlers = this.subscribers[channel];

      // Execute all handlers for this channel
      for (const handler of handlers) {
        try {
          const result = handler(data, sender);
          if (result !== undefined) {
            sendResponse(result);
            return false; // No async response
          }
        } catch (error) {
          console.error(`Error in handler for channel ${channel}:`, error);
        }
      }
    }

    return false; // No async response
  }

  /**
   * Subscribe to a channel
   * @param {string} channel - The channel to subscribe to
   * @param {Function} callback - The callback function to execute when a message is received
   * @returns {Function} A function to unsubscribe
   */
  subscribe(channel, callback) {
    if (!this.initialized) {
      this.init();
    }

    if (!this.subscribers[channel]) {
      this.subscribers[channel] = [];
    }

    this.subscribers[channel].push(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers[channel] = this.subscribers[channel].filter(cb => cb !== callback);
    };
  }

  /**
   * Publish a message to a channel
   * @param {string} channel - The channel to publish to
   * @param {any} data - The data to send
   * @returns {Promise<any>} A promise that resolves with the response
   */
  publish(channel, data) {
    if (!this.initialized) {
      this.init();
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(
          { channel, data },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send a message to a specific tab
   * @param {number} tabId - The ID of the tab to send the message to
   * @param {string} channel - The channel to publish to
   * @param {any} data - The data to send
   * @returns {Promise<any>} A promise that resolves with the response
   */
  publishToTab(tabId, channel, data) {
    if (!this.initialized) {
      this.init();
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.sendMessage(
          tabId,
          { channel, data },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Create a middleware-style handler for a specific channel
   * @param {string} channel - The channel to handle
   * @returns {Object} An object with use method for adding handlers
   */
  channel(channel) {
    const router = {
      use: (handler) => {
        this.subscribe(channel, handler);
        return router;
      }
    };
    return router;
  }
}

// Create singleton instance
const pubsub = new PubSub();

// Export both the class and the singleton instance
module.exports = {
  PubSub,
  pubsub
};
