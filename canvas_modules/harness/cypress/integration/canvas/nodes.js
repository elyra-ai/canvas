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

describe("Sanity test adding nodes from palette", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedConnectionType": "Halo" });
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
		cy.clickToolbarPaletteClose();

		// Link comment to node
		cy.getNodeWithLabel("Derive").click();
		cy.addCommentToPosition("This comment box should be linked to the derive node.", 300, 250);
		cy.verifyCommentIsAdded("This comment box should be linked to the derive node.");

		// Add nodes from palette and link nodes
		cy.clickToolbarPaletteOpen();
		cy.dragNodeToPosition("Filter", 500, 200);
		cy.linkNodes("Derive", "Filter");
		cy.verifyLinkBetweenNodes("Derive", "Filter", 3);
		cy.dragNodeToPosition("Type", 600, 200);
		cy.linkNodes("Filter", "Type");
		cy.verifyLinkBetweenNodes("Filter", "Type", 4);
		cy.clickCategory("Modeling");
		cy.dragNodeToPosition("C5.0", 700, 100);
		cy.dragNodeToPosition("Neural Net", 800, 300);
		cy.clickToolbarPaletteClose();
		cy.linkNodes("Type", "C5.0");
		cy.verifyLinkBetweenNodes("Type", "C5.0", 5);
		cy.linkNodes("Type", "Neural Net");
		cy.verifyLinkBetweenNodes("Type", "Neural Net", 6);

		// Link comment to node
		cy.getNodeWithLabel("Type").click();
		cy.addCommentToPosition("This comment box should be linked to the type node.", 550, 350);
		cy.verifyCommentIsAdded("This comment box should be linked to the type node.");
		cy.linkCommentToNode("This comment box should be linked to the type node.", "Neural Net");

		// Add comment
		cy.addCommentToPosition(
			"This is the functional test canvas that we build through automated test cases. " +
			"This comment is meant to simulate a typical comment for annotating the entire canvas.",
			750, 50
		);
		cy.verifyCommentIsAdded(
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

describe("Sanity test selecting nodes open properties", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedConnectionType": "Halo" });
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

		// Selecting all nodes should not open node properties
		cy.selectAllNodesUsingShiftKey();
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

describe("Sanity test changing node names is reflected in canvas", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test changing node names is reflected in canvas", function() {
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
		cy.saveFlyout();

		// Verify name is updated in console
		cy.verifyNewPropertiesFlyoutTitleEntryInConsole("Var File2");

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

describe("Sanity test from loaded file", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedConnectionType": "Ports" });
		cy.openCanvasDefinition("modelerCanvas.json");
	});

	it("Test number of links from loaded file", function() {
		// Verify different types of links
		cy.verifyNumberOfLinks(9);
		cy.verifyNumberOfPortDataLinks(7);
		cy.verifyNumberOfCommentLinks(0);
	});
});

describe("Sanity test from loaded file in legacy format", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedConnectionType": "Ports" });
		cy.openCanvasDefinition("x-modelerCanvas.json");
	});

	it("Test number of links from loaded file in legacy format", function() {
		// Verify different types of links
		cy.verifyNumberOfLinks(9);
		cy.verifyNumberOfPortDataLinks(7);
		cy.verifyNumberOfCommentLinks(0);
	});
});
