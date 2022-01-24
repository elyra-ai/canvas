/*
 * Copyright 2022 Elyra Authors
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
describe("Test whether actions can be performed depending on enableEditingActions", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test actions CANNOT be performed when enableEditingActions = false", function() {
		cy.setCanvasConfig({ "selectedEditingActions": false });

		// Display context menu for canvas. We should have 'Select all' but NOT
		// 'New comment'.
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.verifyOptionInContextMenu("Select all");
		cy.verifyOptionNotInContextMenu("New comment");

		// Display context menu for node. 'CMI: Open' should be in the menu but
		// 'Disconnect' and 'Delete' should not since they will alter the canvas.
		cy.getNodeWithLabel("Execution node").rightclick();
		cy.verifyOptionInContextMenu("CMI: Open");
		cy.verifyOptionNotInContextMenu("Disconnect");
		cy.verifyOptionNotInContextMenu("Delete");

		// Close the context menu.
		cy.clickCanvasAt(1, 1);

		// Select a node and press keyboard. This should NOT delete the node.
		cy.verifyNumberOfNodes(5);
		cy.clickNode("Execution node");
		cy.shortcutKeysDelete();
		cy.verifyNumberOfNodes(5);

		// Cut using browser's Edit menu
		// This should NOT cut the node from the canvas.
		// Note: The Cypress test framework doesn't let us simulate a click on
		// the browser's menus so we send a corresponding event instead.
		cy.verifyNumberOfNodes(5);
		cy.clickNode("Binding (entry) node");
		cy.simulateClickInBrowsersEditMenu("cut");
		cy.verifyNumberOfNodes(5);

	});

	it("Test actions can be performed when enableEditingActions = true", function() {
		cy.setCanvasConfig({ "selectedEditingActions": true });
		testWithEdittingActionsSet();
	});

	it("Test actions can be performed when enableEditingActions is not set", function() {
		testWithEdittingActionsSet();
	});
});


// This method tests varions functions to make sure they are possible either
// when enableEditingActions is set to 'true' or when enableEditingActions is
// not set in which case it should default to 'true'.
function testWithEdittingActionsSet() {
	// Display context menu for canvas. We should have both 'Select all'
	// and 'New Comment'.
	cy.rightClickToDisplayContextMenu(800, 25);
	cy.verifyOptionInContextMenu("Select all");
	cy.verifyOptionInContextMenu("New comment");

	// Display context menu for node. 'CMI: Open', 'Disconnect' and 'Delete'
	// should be in the menu.
	cy.getNodeWithLabel("Execution node").rightclick();
	cy.verifyOptionInContextMenu("CMI: Open");
	cy.verifyOptionInContextMenu("Disconnect");
	cy.verifyOptionInContextMenu("Delete");

	// Close the context menu.
	cy.clickCanvasAt(1, 1);

	// Select a node and press keyboard. This should delete the node.
	cy.verifyNumberOfNodes(5);
	cy.clickNode("Execution node");
	cy.shortcutKeysDelete();
	cy.verifyNumberOfNodes(4);

	// Cut using browser's Edit menu
	// This should cut the node from the canvas.
	// Note: The Cypress test framework doesn't let us simulate a click on
	// the browser's menus so we send a corresponding event instead.
	cy.verifyNumberOfNodes(4);
	cy.clickNode("Binding (entry) node");
	cy.simulateClickInBrowsersEditMenu("cut");
	cy.verifyNumberOfNodes(3);
}
