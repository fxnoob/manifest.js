module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/mockData.js'
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Generate JSON report for GitHub Actions
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './',
      outputName: 'jest-results.json',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: 'true'
    }]
  ],
};
