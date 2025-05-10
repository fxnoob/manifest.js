const { Builder } = require('../src/builder');
const { validManifest } = require('./mockData');
const webpack = require('../src/webpack');

// Mock the webpack module to avoid actual webpack builds during tests
jest.mock('../src/webpack', () => ({
  buildScripts: jest.fn().mockResolvedValue(true)
}));

describe('Builder', () => {
  let builder;

  beforeEach(() => {
    // Create a fresh builder instance before each test
    builder = new Builder(validManifest);
    // Mock the validate method to return the manifest as is
    builder.validator.validate = jest.fn().mockResolvedValue(validManifest);
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(builder.manifest).toEqual(validManifest);
      expect(builder.contentScripts).toEqual([]);
      expect(builder.backgroundScripts).toEqual([]);
      expect(builder.pages).toEqual([]);
      expect(builder.optionPage).toBeNull();
      expect(builder.popupPage).toBeNull();
      expect(builder.historyPage).toBeNull();
      expect(builder.hasPopupPage).toBe(false);
      expect(builder.hasOptionPage).toBe(false);
      expect(builder.hasHistoryPage).toBe(false);
      expect(builder.assets).toEqual({
        mainIcons: [],
        actionIcons: [],
        webAccessibleResources: [],
        localizations: [],
        htmlPages: []
      });
      expect(builder.scripts).toEqual({
        backgroundScripts: [],
        contentScripts: [],
        popupPageScripts: [],
        optionsPageScripts: []
      });
    });

    it('should initialize with provided options', () => {
      const options = { watch: true };
      const builderWithOptions = new Builder(validManifest, options);
      expect(builderWithOptions.options).toEqual(options);
    });
  });

  describe('setOption', () => {
    it('should set an option value', () => {
      builder.setOption('watch', true);
      expect(builder.options.watch).toBe(true);
    });
  });

  describe('setPages', () => {
    it('should extract pages from manifest', () => {
      const pages = builder.setPages();
      expect(pages).toContain(validManifest.options_page);
      expect(pages).toContain(validManifest.devtools_page);
      expect(pages).toContain(validManifest.action.default_popup);
      expect(pages).toContain(validManifest.chrome_url_overrides.history);
      expect(builder.pages).toEqual(pages);
    });
  });

  describe('setContentScripts', () => {
    it('should extract content scripts from manifest', () => {
      const scripts = builder.setContentScripts();
      expect(scripts).toEqual(['content.js']);
      expect(builder.contentScripts).toEqual(scripts);
      expect(builder.scripts.contentScripts).toEqual(scripts);
    });
  });

  describe('setBackgroundScripts', () => {
    it('should extract background scripts from manifest', () => {
      builder.setBackgroundScripts();
      expect(builder.backgroundScripts).toEqual(['background.js']);
      expect(builder.scripts.backgroundScripts).toEqual(['background.js']);
    });
  });

  describe('setAssets', () => {
    it('should extract main icons from manifest', () => {
      builder.setAssets();
      expect(builder.assets.mainIcons).toEqual([
        { size: '16', path: 'images/icon16.png' },
        { size: '48', path: 'images/icon48.png' },
        { size: '128', path: 'images/icon128.png' }
      ]);
    });

    it('should extract action icons from manifest', () => {
      builder.setAssets();
      expect(builder.assets.actionIcons).toEqual([
        { size: '16', path: 'images/icon16.png' },
        { size: '48', path: 'images/icon48.png' },
        { size: '128', path: 'images/icon128.png' }
      ]);
    });

    it('should extract web accessible resources from manifest', () => {
      builder.setAssets();
      expect(builder.assets.webAccessibleResources).toEqual(['images/*.png', 'css/*.css']);
    });

    it('should extract HTML pages from manifest', () => {
      builder.setAssets();
      expect(builder.assets.htmlPages).toContain(validManifest.options_page);
      expect(builder.assets.htmlPages).toContain(validManifest.action.default_popup);
      expect(builder.assets.htmlPages).toContain(validManifest.chrome_url_overrides.history);
      expect(builder.assets.htmlPages).toContain(validManifest.devtools_page);
    });
  });

  describe('setPopupPageScripts', () => {
    it('should extract popup page scripts from manifest', () => {
      const scripts = builder.setPopupPageScripts();
      expect(scripts).toEqual(['popup.js']);
      expect(builder.scripts.popupPageScripts).toEqual(scripts);
    });
  });

  describe('setOptionsPageScripts', () => {
    it('should extract options page scripts from manifest', () => {
      const scripts = builder.setOptionsPageScripts();
      expect(scripts).toEqual(['options.js']);
      expect(builder.scripts.optionsPageScripts).toEqual(scripts);
    });
  });

  describe('init', () => {
    it('should initialize all properties from manifest', async () => {
      await builder.init();
      expect(builder.validator.validate).toHaveBeenCalledWith(validManifest);
      expect(builder.contentScripts).toEqual(['content.js']);
      expect(builder.backgroundScripts).toEqual(['background.js']);
      expect(builder.pages).toHaveLength(4);
      expect(builder.assets.mainIcons).toHaveLength(3);
      expect(builder.assets.actionIcons).toHaveLength(3);
      expect(builder.assets.webAccessibleResources).toHaveLength(2);
      expect(builder.assets.htmlPages).toHaveLength(4);
      expect(builder.scripts.popupPageScripts).toEqual(['popup.js']);
      expect(builder.scripts.optionsPageScripts).toEqual(['options.js']);
    });
  });

  describe('build', () => {
    it('should build all scripts', async () => {
      await builder.build();
      expect(webpack.buildScripts).toHaveBeenCalledTimes(2);
      const expectedScripts = [
        'content.js',
        'background.js',
        'popup.js',
        'options.js'
      ];
      expect(webpack.buildScripts.mock.calls[0][0]).toEqual(expectedScripts);
    });

    it('should handle errors during build', async () => {
      const error = new Error('Build failed');
      webpack.buildScripts.mockRejectedValueOnce(error);
      await expect(builder.build()).rejects.toThrow('Build failed');
    });
  });
});
