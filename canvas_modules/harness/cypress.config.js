"use strict";
const { defineConfig } = require("cypress");

module.exports = defineConfig({
	viewportWidth: 1400,
	viewportHeight: 800,
	numTestsKeptInMemory: 0,
	experimentalMemoryManagement: true,
	video: false,
	env: {
		compareRange: 2,
	},
	e2e: {
		setupNodeEvents(on, config) {
			// `cy.log()` command's output can be seen on the screen along with test steps
			on("task", {
				log(message) {
					console.log(message); /* eslint no-console: "off" */
					return null;
				}
			});
		},
		baseUrl: "http://localhost:3001",
	},
});
