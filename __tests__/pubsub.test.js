/**
 * Tests for the PubSub library
 */

const { PubSub } = require('../src/pubsub');

// Mock chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
    lastError: null,
    getManifest: jest.fn(),
  },
  tabs: {
    sendMessage: jest.fn(),
  },
};

// Mock document for content script context detection
global.document = {
  body: {},
};

describe('PubSub', () => {
  let pubsub;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a new instance for each test
    pubsub = new PubSub();
  });

  describe('Context Detection', () => {
    it('should detect background context', () => {
      // Remove document to simulate background context
      const originalDocument = global.document;
      global.document = undefined;

      const backgroundPubSub = new PubSub();
      expect(backgroundPubSub.context).toBe('background');

      // Restore document
      global.document = originalDocument;
    });

    it('should detect content context', () => {
      const contentPubSub = new PubSub();
      expect(contentPubSub.context).toBe('content');
    });
  });

  describe('Initialization', () => {
    it('should set up message listeners on init', () => {
      pubsub.init();
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
      expect(pubsub.initialized).toBe(true);
    });

    it('should not set up listeners if already initialized', () => {
      pubsub.initialized = true;
      pubsub.init();
      expect(chrome.runtime.onMessage.addListener).not.toHaveBeenCalled();
    });
  });

  describe('Subscription', () => {
    it('should add a subscriber to a channel', () => {
      const callback = jest.fn();
      pubsub.subscribe('test-channel', callback);

      expect(pubsub.subscribers['test-channel']).toBeDefined();
      expect(pubsub.subscribers['test-channel']).toContain(callback);
    });

    it('should initialize if not already initialized', () => {
      const callback = jest.fn();
      pubsub.subscribe('test-channel', callback);

      expect(pubsub.initialized).toBe(true);
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });

    it('should return an unsubscribe function', () => {
      const callback = jest.fn();
      const unsubscribe = pubsub.subscribe('test-channel', callback);

      expect(typeof unsubscribe).toBe('function');

      // Call unsubscribe and verify callback is removed
      unsubscribe();
      expect(pubsub.subscribers['test-channel']).toEqual([]);
    });
  });

  describe('Publishing', () => {
    it('should send a message through chrome.runtime.sendMessage', async () => {
      // Mock successful response
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback('response data');
      });

      const result = await pubsub.publish('test-channel', { foo: 'bar' });

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        { channel: 'test-channel', data: { foo: 'bar' } },
        expect.any(Function)
      );
      expect(result).toBe('response data');
    });

    it('should handle errors in chrome.runtime.sendMessage', async () => {
      // Mock error
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        chrome.runtime.lastError = { message: 'Test error' };
        callback(null);
      });

      await expect(pubsub.publish('test-channel', { foo: 'bar' }))
        .rejects.toEqual({ message: 'Test error' });

      // Reset lastError
      chrome.runtime.lastError = null;
    });
  });

  describe('Publishing to Tab', () => {
    it('should send a message to a specific tab', async () => {
      // Mock successful response
      chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        callback('tab response');
      });

      const result = await pubsub.publishToTab(123, 'test-channel', { foo: 'bar' });

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        123,
        { channel: 'test-channel', data: { foo: 'bar' } },
        expect.any(Function)
      );
      expect(result).toBe('tab response');
    });
  });

  describe('Message Handling', () => {
    it('should handle messages in content script context', () => {
      const handler = jest.fn().mockReturnValue('handler response');
      pubsub.subscribe('test-channel', handler);

      // Get the message handler that was registered
      const messageHandler = chrome.runtime.onMessage.addListener.mock.calls[0][0];

      // Create a mock message
      const message = { channel: 'test-channel', data: { test: 'data' } };
      const sender = { id: 'sender-id' };
      const sendResponse = jest.fn();

      // Call the message handler
      messageHandler(message, sender, sendResponse);

      expect(handler).toHaveBeenCalledWith({ test: 'data' }, sender);
      expect(sendResponse).toHaveBeenCalledWith('handler response');
    });

    it('should handle multiple subscribers for the same channel', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn().mockReturnValue('handler2 response');

      pubsub.subscribe('test-channel', handler1);
      pubsub.subscribe('test-channel', handler2);

      // Get the message handler that was registered
      const messageHandler = chrome.runtime.onMessage.addListener.mock.calls[0][0];

      // Create a mock message
      const message = { channel: 'test-channel', data: { test: 'data' } };
      const sender = { id: 'sender-id' };
      const sendResponse = jest.fn();

      // Call the message handler
      messageHandler(message, sender, sendResponse);

      expect(handler1).toHaveBeenCalledWith({ test: 'data' }, sender);
      expect(handler2).toHaveBeenCalledWith({ test: 'data' }, sender);
      expect(sendResponse).toHaveBeenCalledWith('handler2 response');
    });
  });

  describe('Express-like API', () => {
    it('should create a channel router with use method', () => {
      const router = pubsub.channel('test-channel');

      expect(router).toBeDefined();
      expect(typeof router.use).toBe('function');
    });

    it('should add handlers via the use method', () => {
      const handler = jest.fn();
      const router = pubsub.channel('test-channel');

      router.use(handler);

      expect(pubsub.subscribers['test-channel']).toContain(handler);
    });

    it('should support chaining of use method', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      pubsub.channel('test-channel')
        .use(handler1)
        .use(handler2);

      expect(pubsub.subscribers['test-channel']).toContain(handler1);
      expect(pubsub.subscribers['test-channel']).toContain(handler2);
    });
  });
});
