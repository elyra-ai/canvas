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

Cypress.Commands.add("toggleCommonCanvasSidePanel", () => {
	cy.get("#harness-action-bar-sidepanel-canvas").click();
});

Cypress.Commands.add("openCanvasDefinition", (canvasFileName) => {
	cy.toggleCommonCanvasSidePanel();
	cy.get("#harness-sidepanel-canvas-dropdown").select(canvasFileName);
	// Wait until we can get a node from the canvas before proceeding. This
	// allows the canvas to load and display before any more test case steps
	// are executed. Note: this won't work if the testcase selects a second
	// canvas while an existing canvas with nodes is displayed.
	cy.get(".d3-node-group");
	cy.toggleCommonCanvasSidePanel();
});

Cypress.Commands.add("openCanvasDefinitionForExtraCanvas", (canvasFileName) => {
	cy.document().then((doc) => {
		doc.setCanvasDropdownFile2(canvasFileName);
	});
});

Cypress.Commands.add("openCanvasPalette", (paletteName) => {
	cy.toggleCommonCanvasSidePanel();
	cy.get("#harness-sidepanel-palette-dropdown").select(paletteName);
	// Wait until we can get a palette flyout category from the canvas before proceeding. This
	// allows the canvas to load and display before any more test case steps
	// are executed. Note: this won't work if the testcase selects a second
	// canvas while an existing canvas with nodes is displayed.
	cy.get(".palette-flyout-category");
	cy.toggleCommonCanvasSidePanel();
});

Cypress.Commands.add("openCanvasPaletteForExtraCanvas", (paletteName) => {
	cy.document().then((doc) => {
		doc.setPaletteDropdownSelect2(paletteName);
	});
});

Cypress.Commands.add("openCanvasAPI", (api) => {
	cy.get("#harness-action-bar-sidepanel-api > a").click();
	cy.dropdownSelect("#harness-sidepanel-api-list", api);
});

Cypress.Commands.add("dropdownSelect", (dropdownElement, selectedItemName) => {
	// Get the list of drop down options
	cy.get(dropdownElement)
		.find(".bx--dropdown")
		.click();

	// Select option from drop down list
	cy.get(".bx--list-box__menu")
		.find(".bx--list-box__menu-item")
		.then((options) => options.filter((idx) => options[idx].outerText === selectedItemName))
		.click();
});

Cypress.Commands.add("setCanvasConfig", (config) => {
	cy.document().then((doc) => {
		doc.setCanvasConfig(config);
	});
});

Cypress.Commands.add("selectNodeForDecoration", (nodeName) => {
	cy.dropdownSelect("#harness-sidepanel-api-nodeSelection", nodeName);
});

Cypress.Commands.add("selectLinkForDecoration", (linkName) => {
	cy.dropdownSelect("#harness-sidepanel-api-linkSelection", linkName);
});

Cypress.Commands.add("updateDecorationsJSON", (decoratorsJSON) => {
	cy.get("#harness-sidepanel-api-decorations")
		.find("textarea")
		.clear()
		.type(decoratorsJSON);
});

Cypress.Commands.add("submitAPI", () => {
	cy.get("#harness-sidepanel-api-submit")
		.find("button")
		.click();
});
