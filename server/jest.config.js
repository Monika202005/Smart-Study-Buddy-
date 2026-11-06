export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/setupMongoMemory.js'],
  verbose: true,
  testTimeout: 30000,
};
