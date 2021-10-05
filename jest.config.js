/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testRegex: 'spec\\.ts$',
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  resetMocks: true,
  transformIgnorePatterns: [
    '/node_modules/(!node-fetch)',
  ],
  setupFilesAfterEnv: [
    '<rootDir>jest.setup.js',
  ],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
};
