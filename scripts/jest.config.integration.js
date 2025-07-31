module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/*.integration.test.ts'],
  collectCoverageFrom: [
    '../backend/src/**/*.ts',
    '!../backend/src/**/*.spec.ts',
    '!../backend/src/**/*.d.ts',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true
};
