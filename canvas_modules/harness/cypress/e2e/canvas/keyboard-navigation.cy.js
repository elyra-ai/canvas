/*
 * Copyright 2025 Elyra Authors
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

describe("Test keyboard navigation", function() {
	beforeEach(() => {
		cy.viewport(1400, 650);
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("allTypesCanvas.json");
		cy.setCanvasConfig({ "selectedKeyboardNavigation": true });
	});

	it("Test tab through groups", function() {
		// Click canvas to move focus there
		cy.clickCanvasAt(1, 1);

		cy.verifyFocusOnCanvas();
		cy.pressTabOnCanvas();

		cy.verifyFocusOnComment("This canvas shows the 4 different node " +
			"types and three link types: node links, association links and comments links.");
		cy.pressTabOnComment("This canvas shows the 4 different node " +
			"types and three link types: node links, association links and comments links.");

		cy.verifyFocusOnNode("Binding (entry) node");
		cy.pressEnterOnNode("Binding (entry) node");

		// Pressing enter on node should select it
		cy.verifyNodeIsSelected("Binding (entry) node");

		// Pressing enter on node should issue a double click which will open the right-flyout
		cy.pressEnterOnNode("Binding (entry) node");
		cy.verifyRightFlyoutPanelWidth(320);


	});

});
