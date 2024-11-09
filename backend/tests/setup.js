const request = require('supertest')
const app = require('../app')

// Store original listeners
const originalListeners = { ...app.listeners };

beforeAll(async () => {
  console.log('Starting tests...')
  // Remove existing listeners
  app.removeAllListeners();
})

afterAll(async () => {
  console.log('Tests completed')
  // Restore original listeners
  Object.entries(originalListeners).forEach(([event, listeners]) => {
    listeners.forEach(listener => app.on(event, listener));
  });
})

afterEach(async () => {
  // Any cleanup needed after each test
})

module.exports = {
  app,
  request
} 