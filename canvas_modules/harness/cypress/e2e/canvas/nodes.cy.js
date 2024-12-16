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
import * as testUtils from "../../utils/eventlog-utils";

describe("Test adding nodes from palette", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test adding nodes from palette, link nodes, link comment to node, delete node, delete comment", function() {
		// Add nodes from palette and link nodes
		cy.clickToolbarPaletteOpen();

		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 300, 200);
		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Derive", 400, 200);
		cy.linkNodes("Var. File", "Derive");
		cy.verifyLinkBetweenNodes("Var. File", "Derive", 1);
		cy.verifyLinkNodesActionOccurred("Var. File", "Derive");
		cy.clickToolbarPaletteClose();

		// Link comment to node
		cy.getNodeWithLabel("Derive").click();
		cy.addCommentToPosition("This comment box should be linked to the derive node.", 300, 250);
		cy.verifyCommentExists("This comment box should be linked to the derive node.");
		cy.verifyEditActionInConsole("editComment", "content", "This comment box should be linked to the derive node.");

		// Add nodes from palette and link nodes
		cy.clickToolbarPaletteOpen();
		cy.dragNodeToPosition("Filter", 500, 200);
		cy.linkNodes("Derive", "Filter");
		cy.wait(10);
		cy.verifyLinkBetweenNodes("Derive", "Filter", 3);
		cy.verifyLinkNodesActionOccurred("Derive", "Filter");
		cy.dragNodeToPosition("Type", 600, 200);
		cy.linkNodes("Filter", "Type");
		cy.wait(10);
		cy.verifyLinkBetweenNodes("Filter", "Type", 4);
		cy.verifyLinkNodesActionOccurred("Filter", "Type");
		cy.clickCategory("Modeling");
		cy.dragNodeToPosition("C5.0", 700, 100);
		cy.dragNodeToPosition("Neural Net", 800, 300);
		cy.clickToolbarPaletteClose();
		cy.linkNodes("Type", "C5.0");
		cy.wait(10);
		cy.verifyLinkBetweenNodes("Type", "C5.0", 5);
		cy.verifyLinkNodesActionOccurred("Type", "C5.0");
		cy.linkNodes("Type", "Neural Net");
		cy.wait(10);
		cy.verifyLinkBetweenNodes("Type", "Neural Net", 6);
		cy.verifyLinkNodesActionOccurred("Type", "Neural Net");

		// Link comment to node
		cy.getNodeWithLabel("Type").click();
		cy.addCommentToPosition("This comment box should be linked to the type node.", 550, 350);
		cy.verifyCommentExists("This comment box should be linked to the type node.");
		cy.verifyEditActionInConsole("editComment", "content", "This comment box should be linked to the type node.");
		cy.linkCommentToNode("This comment box should be linked to the type node.", "Neural Net");

		// Add comment
		cy.addCommentToPosition(
			"This is the functional test canvas that we build through automated test cases. " +
			"This comment is meant to simulate a typical comment for annotating the entire canvas.",
			750, 50
		);
		cy.verifyCommentExists(
			"This is the functional test canvas that we build through automated test cases. " +
			"This comment is meant to simulate a typical comment for annotating the entire canvas."
		);
		cy.verifyEditActionInConsole("editComment", "content",
			"This is the functional test canvas that we build through automated test cases. " +
			"This comment is meant to simulate a typical comment for annotating the entire canvas."
		);

		// Now delete everything and go back to empty canvas
		// Delete Nodes
		cy.deleteNodeUsingContextMenu("Var. File");
		cy.verifyNodeIsDeleted("Var. File", true);
		cy.deleteNodeUsingKeyboard("Derive");
		cy.verifyNodeIsDeleted("Derive");
		cy.deleteNodeUsingToolbar("Filter");
		cy.verifyNodeIsDeleted("Filter");

		// Delete Comments
		cy.deleteCommentUsingContextMenu("This comment box should be linked to the derive node.");
		cy.verifyCommentIsDeleted("This comment box should be linked to the derive node.");
		cy.deleteCommentUsingKeyboard("This comment box should be linked to the type node.");
		cy.verifyCommentIsDeleted("This comment box should be linked to the type node.");
		cy.deleteCommentUsingToolbar(
			"This is the functional test canvas that we build through automated test cases. " +
			"This comment is meant to simulate a typical comment for annotating the entire canvas."
		);
		cy.verifyCommentIsDeleted(
			"This is the functional test canvas that we build through automated test cases. " +
			"This comment is meant to simulate a typical comment for annotating the entire canvas."
		);

		// Delete Nodes
		cy.deleteNodeUsingContextMenu("Type");
		cy.verifyNodeIsDeleted("Type", true);
		cy.deleteNodeUsingKeyboard("C5.0");
		cy.verifyNodeIsDeleted("C5.0");
		cy.deleteNodeUsingToolbar("Neural Net");
		cy.verifyNodeIsDeleted("Neural Net");

		// Verify that the diagram.json has no content.
		cy.verifyObjectModelIsEmpty();
	});
});

describe("Test selecting nodes open properties", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test double-clicking one node at a time to open node properties, " +
	"selecting multiple nodes shouldn't open node properties", function() {
		// Add nodes from Palette
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 300, 200);
		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Derive", 400, 200);
		cy.clickToolbarPaletteClose();

		// Double-click one node at a time to open node properties
		cy.getNodeWithLabel("Derive").dblclick();
		cy.verifyPropertiesFlyoutTitle("Derive");
		cy.getNodeWithLabel("Var. File").dblclick();
		cy.verifyPropertiesFlyoutTitle("Var. File");

		// Click on canvas to clear selections
		cy.get(".svg-area").click(1, 1);

		// Selecting all nodes should not open node properties
		cy.selectAllNodesUsingCtrlOrCmdKey();
		cy.verifyPropertiesFlyoutDoesNotExist();

		// Click on canvas to clear selections
		cy.get(".svg-area").click(1, 1);

		// Node properties should not exist after node is deleted
		cy.getNodeWithLabel("Var. File").dblclick();
		cy.verifyPropertiesFlyoutTitle("Var. File");
		cy.deleteNodeUsingContextMenu("Var. File");
		cy.verifyNodeIsDeleted("Var. File", true);
		cy.verifyPropertiesFlyoutDoesNotExist();
	});
});

describe("Test opening properties moves node to center with enablePositionNodeOnRightFlyoutOpen", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPositionNodeOnRightFlyoutOpen": true });
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test double-clicking a node moves node to center of canvas", function() {
		// Check the node's initial position.
		cy.verifyZoomTransform(0, 0, 1);

		// Double-click on node to open properties.
		cy.getNodeWithLabel("Binding (exit) node").dblclick();

		// Wait for the canvas to update
		/* eslint cypress/no-unnecessary-waiting: "off" */
		cy.wait(1500);

		// Check new position of node.
		cy.verifyZoomTransform(-173, -60, 1);

		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();

		// Check transform after zoom
		cy.verifyZoomTransform(-315, -147, 1.21);

		// Double-click on another node to open properties.
		cy.getNodeWithLabel("Execution node").dblclick();

		// Wait for the canvas to update
		/* eslint cypress/no-unnecessary-waiting: "off" */
		cy.wait(1500);

		// Check new position of node.
		cy.verifyZoomTransform(102, 141, 1.21);
	});
});


describe("Test changing node properties is reflected in canvas", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test changing node names is reflected in canvas", function() {
		// Set applyOnBlur to true
		cy.toggleCommonPropertiesSidePanel();
		cy.toggleApplyOnBlur();

		// Add nodes from Palette
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 300, 200);
		cy.clickToolbarPaletteClose();

		// Double-click "Var. File" node to open node properties
		cy.getNodeWithLabel("Var. File").dblclick();
		cy.verifyPropertiesFlyoutTitle("Var. File");

		// Edit the name of properties flyout
		cy.clickPropertiesFlyoutTitleEditIcon();
		cy.enterNewPropertiesFlyoutTitle("Var File2");
		cy.closeFlyout();

		// Verify name is updated in console
		verifyNewPropertiesFlyoutTitleEntryInConsole("Var File2");

		// Double-click "Var File2" node to open node properties
		cy.getNodeWithLabel("Var File2").dblclick();
		cy.verifyPropertiesFlyoutTitle("Var File2");

		// Edit the name of properties flyout
		cy.clickPropertiesFlyoutTitleEditIcon();
		cy.enterNewPropertiesFlyoutTitle("Var File3");

		// Click on canvas to save node properties
		cy.get(".svg-area").click(1, 1);

		// Verify new node name exists on canvas
		cy.getNodeWithLabel("Var File3").should("exist");
	});
});

describe("Test changing node image is reflected in canvas", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test changing node image is reflected in canvas", function() {

		cy.verifyNodeImage("Execution node", "/images/nodes/sort.svg");

		// Change the image of Execution node and check it was changed successfully
		cy.setNodeImage("Execution node", "/images/nodes/derive.svg");
		cy.verifyNodeImage("Execution node", "/images/nodes/derive.svg");

		// Change the image of Execution node back again and check it was changed successfully
		cy.setNodeImage("Execution node", "/images/nodes/sort.svg");
		cy.verifyNodeImage("Execution node", "/images/nodes/sort.svg");
	});

});

describe("Test from loaded file", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("modelerCanvas.json");
	});

	it("Test number of links from loaded file", function() {
		// Verify different types of links
		cy.verifyNumberOfLinks(9);
		cy.verifyNumberOfPortDataLinks(7);
		cy.verifyNumberOfCommentLinks(0);
	});
});

describe("Test from loaded file in legacy format", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("x-modelerCanvas.json");
	});

	it("Test number of links from loaded file in legacy format", function() {
		// Verify different types of links
		cy.verifyNumberOfLinks(9);
		cy.verifyNumberOfPortDataLinks(7);
		cy.verifyNumberOfCommentLinks(0);
	});
});

describe("Test new enableNodeLayout config parameter", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test node's height & width upon enableNodeLayout update", function() {
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Import");
		cy.dragNodeToPosition("Database", 300, 200);

		// Verify node height & width before updating enableNodeLayout
		cy.verifyNodeDimensions("Database", 69, 75);
		cy.clickToolbarUndo();

		// Override some of the enableNodeLayout config parameters
		cy.setCanvasConfig({ "selectedNodeLayout": { defaultNodeWidth: 151, defaultNodeHeight: 176 } });
		// Verify node height & width after updating enableNodeLayout
		cy.dragNodeToPosition("Database", 300, 200);
		cy.verifyNodeDimensions("Database", 151, 175);
	});

});

function verifyNewPropertiesFlyoutTitleEntryInConsole(newTitle) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "applyPropertyChanges()");
		expect(newTitle).to.equal(lastEventLog.data.title);
	});
}
