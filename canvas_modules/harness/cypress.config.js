const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportWidth: 1400,
  viewportHeight: 800,
	numTestsKeptInMemory: 0,
  video: false,
  env: {
    compareRange: 2,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:3001',
  },
})
