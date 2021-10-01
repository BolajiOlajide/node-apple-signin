/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
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
