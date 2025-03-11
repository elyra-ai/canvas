/*
 * Copyright 2017-2025 Elyra Authors
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
		cy.openCanvasPalette("commonPalette.json");
	});

	it("Test actions CANNOT be performed when enableEditingActions = false", function() {
		cy.setCanvasConfig({
			"selectedEditingActions": false,
			"selectedLinkSelection": "Detachable"
		});

		// ---------------------------------------------------------------------- //
		// Context menu.
		// ---------------------------------------------------------------------- //
		// Display context menu for canvas. We should have 'Select all' but NOT
		// 'New comment'.
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.verifyOptionInContextMenu("Select all");
		cy.verifyOptionNotInContextMenu("New comment");

		// If a node is selected the context menu should have a 'Deselect all'.
		cy.getNodeWithLabel("Execution node").click();
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.verifyOptionInContextMenu("Deselect all");

		// Display context menu for node. 'CMI: Open' should be in the menu but
		// 'Disconnect' and 'Delete' should not since they will alter the canvas.
		cy.getNodeWithLabel("Execution node").rightclick();
		cy.verifyOptionInContextMenu("CMI: Open");
		cy.verifyOptionNotInContextMenu("Disconnect");
		cy.verifyOptionNotInContextMenu("Delete");

		// Close the context menu.
		cy.clickCanvasAt(1, 1);

		// ---------------------------------------------------------------------- //
		// Keyboard.
		// ---------------------------------------------------------------------- //
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

		// ---------------------------------------------------------------------- //
		// Toolbar.
		// ---------------------------------------------------------------------- //
		// Do some setup so the toolbar buttons are all enabled
		cy.clickNode("Binding (exit) node"); // Selecting an object will normally cause cut, copy & paste to be enabled

		// Check that the default toolbar icons that edit the canvas are disabled.
		cy.verifyToolbarButtonEnabled("undo", false);
		cy.verifyToolbarButtonEnabled("redo", false);
		cy.verifyToolbarButtonEnabled("cut", false);
		cy.verifyToolbarButtonEnabled("copy", false);
		cy.verifyToolbarButtonEnabled("paste", false);
		cy.verifyToolbarButtonEnabled("createAutoComment", false);

		// Check that when a node is dragged from the palette to the canvas
		// a node is NOT created.
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("OPERATIONS");
		cy.dragNodeToPosition("Append", 400, 400);
		cy.verifyNumberOfNodes(5);

		// ---------------------------------------------------------------------- //
		// Create new link.
		// ---------------------------------------------------------------------- //
		cy.verifyNumberOfPortDataLinks(4);
		cy.linkNodeOutputPortToNodeInputPort("Execution node", "outPort", "Super node", "input1SuperNodePE");
		// The links SHOULD NOT BE created.
		cy.verifyNumberOfPortDataLinks(4);

		// ---------------------------------------------------------------------- //
		// Drag a link handle.
		// ---------------------------------------------------------------------- //
		cy.clickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.moveLinkHandleToPos("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb", "endHandle", 300, 300);
		// The link SHOULD NOT BE dragged so we still have the same number of port links.
		cy.verifyNumberOfPortDataLinks(4);

		// ---------------------------------------------------------------------- //
		// Dragging nodes and comments
		// ---------------------------------------------------------------------- //
		// These actions are tested in the drag.js integration file
	});

	it("Test actions can be performed when enableEditingActions = true", function() {
		cy.setCanvasConfig({
			"selectedEditingActions": true,
			"selectedLinkSelection": "Detachable"
		});
		testWithEditingActionsSet();
	});

	it("Test actions can be performed when enableEditingActions is not set", function() {
		cy.setCanvasConfig({
			"selectedLinkSelection": "Detachable"
		});
		testWithEditingActionsSet();
	});
});


// This method tests varions functions to make sure they are possible either
// when enableEditingActions is set to 'true' or when enableEditingActions is
// not set in which case it should default to 'true'.
function testWithEditingActionsSet() {
	// ---------------------------------------------------------------------- //
	// Context menu.
	// ---------------------------------------------------------------------- //
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

	// ---------------------------------------------------------------------- //
	// Keyboard.
	// ---------------------------------------------------------------------- //
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

	// ---------------------------------------------------------------------- //
	// Toolbar.
	// ---------------------------------------------------------------------- //
	// Do some setup so the toolbar buttons are all enabled
	cy.clickNode("Binding (exit) node"); // Selecting an object will normally cause cut, copy & paste to be enabled
	cy.clickToolbarUndo(); // Clicking undo here will normally cause the redo button to be enabled
	cy.verifyNumberOfNodes(4);

	// Check that the default toolbar icons that edit the canvas are disabled.
	cy.verifyToolbarButtonEnabled("undo", true);
	cy.verifyToolbarButtonEnabled("redo", true);
	cy.verifyToolbarButtonEnabled("cut", true);
	cy.verifyToolbarButtonEnabled("copy", true);
	cy.verifyToolbarButtonEnabled("paste", true);
	cy.verifyToolbarButtonEnabled("createAutoComment", true);

	// Check that when a node is dragged from the palette to the canvas
	// a node IS created.
	cy.clickToolbarPaletteOpen();
	cy.clickCategory("OPERATIONS");
	cy.dragNodeToPosition("Append", 400, 400);
	cy.verifyNumberOfNodes(5); // There were 4 before so now there should be 5

	// ---------------------------------------------------------------------- //
	// Create new link.
	// ---------------------------------------------------------------------- //
	cy.clickToolbarUndo(); // Clicking undo here will normally cause the redo button to be enabled
	cy.clickToolbarUndo(); // Clicking undo here will normally cause the redo button to be enabled
	cy.verifyNumberOfPortDataLinks(4);
	cy.linkNodeOutputPortToNodeInputPort("Execution node", "outPort", "Super node", "input1SuperNodePE");
	// The link SHOULD BE created.
	cy.verifyNumberOfPortDataLinks(5);

	// ---------------------------------------------------------------------- //
	// Drag a link handle.
	// ---------------------------------------------------------------------- //
	cy.clickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
	cy.moveLinkHandleToPos("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb", "endHandle", 300, 300);
	// The link SHOULD BE dragged so we should have one less port link.
	cy.verifyNumberOfPortDataLinks(5);

	// ---------------------------------------------------------------------- //
	// Dragging nodes and comments
	// ---------------------------------------------------------------------- //
	// These actions are tested in the drag.js integration file
}
