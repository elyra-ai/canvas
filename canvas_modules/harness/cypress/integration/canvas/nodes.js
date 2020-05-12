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
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 300, 200);
		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Derive", 400, 200);
		cy.linkNodes("Var. File", "Derive", 1);
		cy.clickToolbarPaletteClose();
		cy.getNodeForLabel("Derive").click();
		cy.addCommentToPosition("This comment box should be linked to the derive node.", 300, 250);
		cy.clickToolbarPaletteOpen();
		cy.dragNodeToPosition("Filter", 500, 200);
		cy.linkNodes("Derive", "Filter", 3);
		cy.dragNodeToPosition("Type", 600, 200);
		cy.linkNodes("Filter", "Type", 4);
		cy.clickCategory("Modeling");
		cy.dragNodeToPosition("C5.0", 700, 100);
		cy.dragNodeToPosition("Neural Net", 800, 300);
		cy.clickToolbarPaletteClose();
		cy.linkNodes("Type", "C5.0", 5);
		cy.linkNodes("Type", "Neural Net", 6);
		cy.getNodeForLabel("Type").click();
		cy.addCommentToPosition("This comment box should be linked to the type node.", 550, 350);
		cy.linkCommentToNode("This comment box should be linked to the type node.", "Neural Net");
		cy.addCommentToPosition(
			"This is the functional test canvas that we build through automated test cases. " +
			"This comment is meant to simulate a typical comment for annotating the entire canvas.",
			750, 50
		);

		// Now delete everything and go back to empty canvas
		cy.deleteNode("Var. File");
		cy.deleteNodeUsingKeyboard("Derive");
		cy.deleteComment("This comment box should be linked to the derive node.");
		cy.deleteNode("Filter");
		cy.deleteComment("This comment box should be linked to the type node.");
		cy.deleteNode("Type");
		cy.deleteNode("C5.0");
		cy.deleteNode("Neural Net");
		cy.deleteComment(
			"This is the functional test canvas that we build through automated test cases. " +
			"This comment is meant to simulate a typical comment for annotating the entire canvas."
		);

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
		cy.getNodeForLabel("Derive").dblclick();
		cy.verifyPropertiesFlyoutTitle("Derive");
		cy.getNodeForLabel("Var. File").dblclick();
		cy.verifyPropertiesFlyoutTitle("Var. File");

		// Selecting all nodes should not open node properties
		cy.selectAllNodes();
		cy.verifyPropertiesFlyoutDoesNotExist();

		// Click on canvas to clear selections
		cy.get(".svg-area").click(1, 1);

		// Node properties should not exist after node is deleted
		cy.getNodeForLabel("Var. File").dblclick();
		cy.verifyPropertiesFlyoutTitle("Var. File");
		cy.deleteNode("Var. File");
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
		cy.getNodeForLabel("Var. File").dblclick();
		cy.verifyPropertiesFlyoutTitle("Var. File");

		// Edit the name of properties flyout
		cy.clickPropertiesFlyoutTitleEditIcon();
		cy.enterNewPropertiesFlyoutTitle("Var File2");
		cy.saveFlyout();

		// Verify name is updated in console
		cy.verifyNewPropertiesFlyoutTitleEntryInConsole("Var File2");

		// Double-click "Var File2" node to open node properties
		cy.getNodeForLabel("Var File2").dblclick();
		cy.verifyPropertiesFlyoutTitle("Var File2");

		// Edit the name of properties flyout
		cy.clickPropertiesFlyoutTitleEditIcon();
		cy.enterNewPropertiesFlyoutTitle("Var File3");

		// Click on canvas to save node properties
		cy.get(".svg-area").click(1, 1);

		// Verify new node name exists on canvas
		cy.getNodeForLabel("Var File3").should("exist");
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
