/**
 * Test Setup for Universal Script Generator
 * Alsania aligned - built by Sigma, powered by Echo
 */

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup test timeout
jest.setTimeout(10000);

// Mock logger for tests
export const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(), 
  error: jest.fn(),
  debug: jest.fn()
};