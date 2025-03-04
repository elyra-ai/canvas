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
		cy.setCanvasConfig({
			"selectedKeyboardNavigation": true,
			"selectedResizableNodes": true
		});
		cy.openCanvasDefinition("allTypesCanvas.json");
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

	it("Test a node can be moved with the keyboard.", function() {
		// Put focus on node
		cy.getNodeWithLabel("Binding (entry) node").click();

		// Check original transform of node
		cy.verifyNodeTransform("Binding (entry) node", 89, 100);

		// Move node down with keyboard
		cy.pressCmndDownArrowOnNode("Binding (entry) node");
		cy.pressCmndDownArrowOnNode("Binding (entry) node");
		cy.pressCmndDownArrowOnNode("Binding (entry) node");
		cy.pressCmndDownArrowOnNode("Binding (entry) node");
		cy.verifyNodeTransform("Binding (entry) node", 89, 140);
	});

	it("Test a node can be sized with the keyboard.", function() {
		// Put focus on node
		cy.getNodeWithLabel("Binding (entry) node").click();

		// Check original size of node
		cy.verifyNodeDimensions("Binding (entry) node", 70, 75);

		// Size node downwards with keyboard
		cy.pressShiftArrowOnNode("Binding (entry) node");
		cy.pressShiftArrowOnNode("Binding (entry) node");
		cy.pressShiftArrowOnNode("Binding (entry) node");
		cy.pressShiftArrowOnNode("Binding (entry) node");
		cy.verifyNodeDimensions("Binding (entry) node", 70, 115);
	});
});
