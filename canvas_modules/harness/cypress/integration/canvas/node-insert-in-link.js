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
/* eslint no-undefined: "off" */
/* eslint max-len: "off" */

describe("Test dropping a node on a link with enableInsertNodeDroppedOnLink option", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedInsertNodeDroppedOnLink": true });
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("allTypesCanvas.json");
		// Check there are initially 4 data links on the canvas.
		cy.verifyNumberOfPortDataLinks(4);
	});

	it("Drag a node from the palette onto a link", function() {
		// Open the palette and drag a node to be over the link between the
		// Binding entry node and the Execution node.
		// This should insert the 'Select' node into the link.
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Select", 490, 240);

		// There should now be one extra link because, on inserting the node, we
		// rmoved the old link and added two new ones.
		cy.verifyNumberOfPortDataLinks(5);

		// Check the new links exist to and from the newly added Select node.
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Binding (entry) node", "outPort", "Select", undefined, 1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select", undefined, "Execution node", "inPort", 1);

		// Check the old link has been removed
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Binding (entry) node", "outPort", "Execution node", "inPort", 0);

		// Make sure undo works. We are back to four links; the two new links are
		// removed and the old link that was removed is restored.
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(4);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Binding (entry) node", "outPort", "Select", undefined, 0);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select", undefined, "Execution node", "inPort", 0);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Binding (entry) node", "outPort", "Execution node", "inPort", 1);

		// Make sure redo works. We are back to five links; the two new links
		// are restored and the old link has been removed.
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(5);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Binding (entry) node", "outPort", "Select", undefined, 1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select", undefined, "Execution node", "inPort", 1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Binding (entry) node", "outPort", "Execution node", "inPort", 0);
	});

	it("Drag a node from the palette onto a link AND the canvas onto a link", function() {
		// Open the palette and drag a node onto the canvas.
		// This will be the node we move to the link.
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.verifyNumberOfPortDataLinks(4);
		cy.dragNodeToPosition("Select", 490, 240);
		// There should now be one extra link because, on inserting the node, we
		// removed the old link and added two new ones.
		cy.verifyNumberOfPortDataLinks(5);

		cy.clickToolbarUndo();
		cy.clickToolbarUndo();

		// Now we do the same test expect we drag the node
		// from within the canvas UI not palette
		cy.verifyNumberOfPortDataLinks(4);
		cy.dragNodeToPosition("Select", 490, 340);
		cy.moveNodeToPosition("Select", 490, 240);
		// There should now be one extra link because, on inserting the node, we
		// removed the old link and added two new ones.
		cy.verifyNumberOfPortDataLinks(5);
	});

	it("Drag a node from the canvas onto a link", function() {
		// Open the palette and drag a node onto the canvas.
		// This will be the node we move to the link.
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Sort", 500, 600);

		// Move the Select node from the canvas onto the link between the
		// Execution node and the Supernode.
		cy.moveNodeToPosition("Sort", 400, 200);

		// There should now be one extra link because, on inserting the node, we
		// rmoved the old link and added two new ones.
		cy.verifyNumberOfPortDataLinks(5);

		// Check the new links exist to and from the newly added Select node.
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Sort", undefined, 1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Sort", undefined, "Super node", "input2SuperNodePE", 1);

		// Check that the old link has been removed.
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 0);

		// Make sure undo works. We are back to four links; the two new links are
		// removed and the old link that was removed is restored.
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(4);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Sort", undefined, 0);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Sort", undefined, "Super node", "input2SuperNodePE", 0);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);

		// Make sure redo works. We are back to five links; the two new links
		// are restored and the old link has been removed.
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(5);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Sort", undefined, 1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Sort", undefined, "Super node", "input2SuperNodePE", 1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 0);
	});
});

describe("Test dropping a node, with existing links, on the canvas onto a link with enableInsertNodeDroppedOnLink option", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedInsertNodeDroppedOnLink": true });
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("allTypesCanvas.json");
		// Check there are initially 4 data links on the canvas.
		cy.verifyNumberOfPortDataLinks(4);

		// Open the palette and drag a node onto the canvas and using auto-placement
		// create a separate stream of nodes.
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Sample", 500, 600);
		cy.doubleClickNodeInCategory("Merge", "Record Ops");
		cy.doubleClickNodeInCategory("Sort", "Record Ops");

		// Now there should be 6 data links
		cy.verifyNumberOfPortDataLinks(6);
	});

	it("Drag node with input/output links from stream on the canvas onto a link - should 'fail'", function() {
		// Move the Merge node from the canvas onto the link between the
		// Execution node and the Supernode.
		cy.moveNodeToPosition("Merge", 400, 200);

		// The Merge node should not be inserted in the link because it already
		// has an input link and cannot have another. So number of links should be
		// the same.
		cy.verifyNumberOfPortDataLinks(6);

		// Check the new link between the Execution node and the Supernode
		// still exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);
	});

	it("Drag node with input link from stream on the canvas onto a link - should 'fail'", function() {
		// Move the Sort node from the canvas onto the link between the
		// Execution node and the Supernode.
		cy.moveNodeToPosition("Sort", 400, 200);

		// The Sort node should not be inserted into the link because it already
		// has an input link and cannot have another. So number of links should be
		// the same.
		cy.verifyNumberOfPortDataLinks(6);

		// Check the new link between the Execution node and the Supernode
		// still exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);
	});

	it("Drag node with output link from stream on the canvas onto a link - should 'work'", function() {
		// Move the Sample node from the canvas onto the link between the
		// Execution node and the Supernode.
		cy.moveNodeToPosition("Sample", 400, 200);

		// The Sample node should be inserted in the link because, although it has
		// an output link, its max output cardinality is -1 (unlimited).
		cy.verifyNumberOfPortDataLinks(7);

		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Sample", undefined, 1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Sample", undefined, "Super node", "input2SuperNodePE", 1);

		// Check the link between the Execution node and the Supernode was removed.
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 0);

		// Make sure undo works. We are back to six links; the two new links are
		// removed and the old link that was removed is restored.
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(6);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Sample", undefined, 0);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Sample", undefined, "Super node", "input2SuperNodePE", 0);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);

		// Make sure redo works. We are back to seven links; the two new links
		// are restored and the old link has been removed.
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(7);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Sample", undefined, 1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Sample", undefined, "Super node", "input2SuperNodePE", 1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 0);
	});
});
