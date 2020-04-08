/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// Global scope - extraCanvas
document.extraCanvas = false;

Cypress.Commands.add("inExtraCanvas", () => {
	document.extraCanvas = true;
});

Cypress.Commands.add("inRegularCanvas", () => {
	document.extraCanvas = false;
});

// `cy.log()` command's output can be seen on the screen along with test steps
Cypress.Commands.overwrite("log", (subject, message) => cy.task("log", message));

Cypress.Commands.add("openCanvasDefinition", (canvasFileName) => {
	cy.get("#harness-action-bar-sidepanel-canvas").click();
	cy.get("#harness-sidepanel-canvas-dropdown").select(canvasFileName);
	// Wait until we can get a node from the canvas before proceeding. This
	// allows the canvas to load and display before any more test case steps
	// are executed. Note: this won't work if the testcase selects a second
	// canvas while an existing canvas with nodes is displayed.
	cy.get(".d3-node-group");
	cy.get("#harness-action-bar-sidepanel-canvas").click();
});

Cypress.Commands.add("openCanvasPalette", (paletteName) => {
	cy.get("#harness-action-bar-sidepanel-canvas").click();
	cy.get("#harness-sidepanel-palette-dropdown").select(paletteName);
	// Wait until we can get a palette flyout category from the canvas before proceeding. This
	// allows the canvas to load and display before any more test case steps
	// are executed. Note: this won't work if the testcase selects a second
	// canvas while an existing canvas with nodes is displayed.
	cy.get(".palette-flyout-category");
	cy.get("#harness-action-bar-sidepanel-canvas").click();
});

Cypress.Commands.add("setCanvasConfig", (config) => {
	cy.document().then((doc) => {
		doc.setCanvasConfig(config);
	});
});
