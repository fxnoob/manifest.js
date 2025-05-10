const fs = require('fs');
const webpack = require('webpack');
const { buildScripts } = require('../src/webpack');

// Mock dependencies
jest.mock('fs');
jest.mock('webpack', () => {
  // Create a mock function that can be called directly
  const mockWebpack = jest.fn();

  // Add DefinePlugin as a property of the function
  mockWebpack.DefinePlugin = jest.fn().mockImplementation(function(definitions) {
    this.definitions = definitions;
    this.constructor = { name: 'DefinePlugin' };
  });

  return mockWebpack;
});
jest.mock('dotenv', () => ({
  config: jest.fn().mockReturnValue({ parsed: { TEST_ENV: 'test_value' } })
}));

describe('webpack', () => {
  beforeEach(() => {
    // Mock process.cwd() to return a fixed path
    jest.spyOn(process, 'cwd').mockReturnValue('/test/path');

    // Mock fs.existsSync to return true for .env file
    fs.existsSync = jest.fn().mockReturnValue(true);

    // Mock webpack compiler
    const mockCompiler = {
      run: jest.fn((callback) => callback(null, {
        hasErrors: jest.fn().mockReturnValue(false)
      }))
    };

    // Set up the webpack mock function
    webpack.mockImplementation(() => mockCompiler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildScripts', () => {
    it('should build scripts successfully', async () => {
      const scripts = ['content.js', 'background.js'];
      const options = { watch: true };

      await expect(buildScripts(scripts, options)).resolves.not.toThrow();

      // Verify webpack was called with the correct configuration
      expect(webpack).toHaveBeenCalledTimes(2);

      // Verify the first webpack call had the correct entry path for content.js
      const firstCall = webpack.mock.calls[0][0];
      expect(firstCall.entry).toBe('./content.js');
      expect(firstCall.output.filename).toBe('content.js');
      expect(firstCall.output.path).toBe('/test/path/dist');

      // Verify the second webpack call had the correct entry path for background.js
      const secondCall = webpack.mock.calls[1][0];
      expect(secondCall.entry).toBe('./background.js');
      expect(secondCall.output.filename).toBe('background.js');
      expect(secondCall.output.path).toBe('/test/path/dist');

      // Verify watch option was set correctly
      expect(firstCall.watch).toBe(true);
      expect(secondCall.watch).toBe(true);
    });

    it('should handle webpack compilation errors', async () => {
      const scripts = ['content.js'];

      // Mock webpack compiler to return an error
      const mockCompiler = {
        run: jest.fn((callback) => callback(new Error('Webpack error')))
      };
      webpack.mockImplementation(() => mockCompiler);

      await expect(buildScripts(scripts, {})).rejects.toThrow('Webpack error');
    });

    it('should handle webpack compilation stats errors', async () => {
      const scripts = ['content.js'];

      // Mock webpack compiler to return stats with errors
      const mockCompiler = {
        run: jest.fn((callback) => callback(null, {
          hasErrors: jest.fn().mockReturnValue(true),
          compilation: {
            errors: ['Stats error']
          }
        }))
      };
      webpack.mockImplementation(() => mockCompiler);

      // Mock console.error and process.exit
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

      await expect(buildScripts(scripts, {})).rejects.toEqual('Error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(['Stats error']);
      expect(processExitSpy).toHaveBeenCalledWith(0);

      // Restore mocks
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('should apply environment variables from .env file', async () => {
      const scripts = ['content.js'];

      await buildScripts(scripts, {});

      // Verify webpack DefinePlugin was added with environment variables
      const plugins = webpack.mock.calls[0][0].plugins;
      const definePlugin = plugins.find(plugin => plugin.constructor.name === 'DefinePlugin');

      expect(definePlugin).toBeDefined();
    });

    it('should handle missing .env file', async () => {
      const scripts = ['content.js'];

      // Mock fs.existsSync to return false for .env file
      fs.existsSync.mockReturnValue(false);

      await buildScripts(scripts, {});

      // Verify webpack was still called
      expect(webpack).toHaveBeenCalled();
    });
  });
});
