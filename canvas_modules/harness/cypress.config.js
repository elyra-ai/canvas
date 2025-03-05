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
			on("task", {
				log(message) {
					console.log(message); /* eslint no-console: "off" */
					return null;
				}
			});
		},
		baseUrl: "http://localhost:3001",
		excludeSpecPattern: [
			// This list can be used to exclude test cases if necessary. This is
			// useful when investigating problems that occur on the build machine
			// but not on a local machine since it allows you to selectively
			// disable some, or all, test cases for faster testing.
			//
			// "**/auto-layout-dagre.cy.js",
			// "**/bottom-panel.cy.js",
			// "**/clipboard.cy.js",
			// "**/comment.cy.js",
			// "**/comments-wysiwyg.cy.js",
			// "**/config-enable-editing-actions.cy.js",
			// "**/context-menu.cy.js",
			// "**/context-toolbar.cy.js",
			// "**/decorators.cy.js",
			// "**/drag.cy.js",
			// "**/error-marker.cy.js",
			// "**/external-drag-drop.cy.js",
			// "**/extra-canvas.cy.js",
			// "**/keyboard-navigation.cy.js",
			// "**/left-flyout.cy.js",
			// "**/link-replace.cy.js",
			// "**/links.cy.js",
			// "**/node-cardinalities.cy.js",
			// "**/node-exit-binding-output.cy.js",
			// "**/node-insert-in-link.cy.js",
			// "**/node-labels.cy.js",
			// "**/node-single-port.cy.js",
			// "**/nodes-resize.cy.js",
			// "**/nodes.cy.js",
			// "**/notifications.cy.js",
			// "**/palette-auto-node-placement.cy.js",
			// "**/palette.cy.js",
			// "**/ports.cy.js",
			// "**/right-flyout.cy.js",
			// "**/security-xss.cy.js",
			// "**/selection-region.cy.js",
			// "**/snap-to-grid.cy.js",
			// "**/supernode-external.cy.js",
			// "**/supernode.cy.js",
			// "**/tips.cy.js",
			// "**/toolbar.cy.js",
			// "**/top-panel.cy.js",
			// "**/undo-redo.cy.js",
			// "**/zoom.cy.js",
			// "**/actions.cy.js",
			// "**/custom-controls.cy.js",
			// "**/expression-control.cy.js",
			// "**/properties-tooltips.cy.js",
			// "**/readonly-controls.cy.js",
			// "**/structure-list-editor-table-control.cy.js",
			// "**/structure-table-control.cy.js",
			// "**/title-editor.cy.js"
		],
	},
});
