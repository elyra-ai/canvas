"use strict";
const { defineConfig } = require("cypress");

module.exports = defineConfig({
	viewportWidth: 1400,
	viewportHeight: 800,
	numTestsKeptInMemory: 0,
	video: false,
	env: {
		compareRange: 2,
	},
	e2e: {
		setupNodeEvents(on, config) {
			// `cy.log()` command's output can be seen on the screen along with test steps
			require("@cypress/code-coverage/task")(on, config)
			on("task", {
				log(message) {
					console.log(message); /* eslint no-console: "off" */
					return null;
				}
			});
			return config;
		},
		baseUrl: "http://localhost:3001",
		specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
		supportFile: "cypress/support/e2e.js",
	},
});
