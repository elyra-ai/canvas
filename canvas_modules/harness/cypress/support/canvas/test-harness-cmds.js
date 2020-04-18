/*
 * Copyright 2017-2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
