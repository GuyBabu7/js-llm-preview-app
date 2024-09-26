const jestConfig = require('./jest.config');

process.env.IS_INTEGRATION_TEST = 'true';

const basicConfig = {
  reporters: [
    ...jestConfig.reporters,
    [
      'jest-junit',
      {
        outputName: 'integration.junit.xml',
      },
    ],
  ],
};

module.exports = {
  ...jestConfig,
  ...basicConfig,
  testMatch: ['**/*.integration.test.ts'],
  collectCoverage: false,
};
