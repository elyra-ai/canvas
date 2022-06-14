/*
 * Copyright 2017-2022 Elyra Authors
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

describe("Test adding nodes into empty canvas", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Flyout" });
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test adding nodes on canvas, search for a node in palette, " +
  "add a node found in search results, verify node doesn't exist in search results", function() {
		// Test adding nodes from palette on canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 300, 200);
		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Derive", 400, 200);

		// Search for a node in Palette Search bar
		cy.findNodeInPalette("sel");

		// Search function can run slowly on build machine so give it some time.
		/* eslint cypress/no-unnecessary-waiting: "off" */
		cy.wait(1000);

		// Add a node found in search results
		cy.dragNodeToPosition("Select", 500, 200);

		// Verify node doesn't exist in search results
		cy.verifyNodeDoesNotExistInPalette("Sample");
	});

	it("Test searching for multiple words returns correct nodes", function() {
		// Test adding nodes from palette on canvas
		cy.clickToolbarPaletteOpen();

		// Search for a node in Palette Search bar
		cy.findNodeInPalette("Data File");

		// Search function can run slowly on build machine so give it some time.
		/* eslint cypress/no-unnecessary-waiting: "off" */
		cy.wait(1000);

		// Verify nodes exist in search results in corrct order
		cy.verifyNodeDoesExistInPaletteAtIndex("Var. File", 0);
		cy.verifyNodeDoesExistInPaletteAtIndex("Database", 1);
		cy.verifyNodeDoesExistInPaletteAtIndex("Data Audit", 2);
	});

	it("Test open categories remain open when a new one is opened and closes when it is clicked", function() {
		cy.clickToolbarPaletteOpen();

		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 300, 200);

		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Derive", 400, 200);

		// If Import category is still open we will be able to drag a "Var File"
		cy.dragNodeToPosition("Var. File", 500, 200);

		// Close Import category
		cy.clickCategory("Import");
		cy.verifyCategoryIsClosed("Import");
	});
});

describe("Test adding node type to palette Flyout Panel", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Flyout" });
		cy.clickToolbarPaletteOpen();
		cy.openCanvasAPI("Add PaletteItem");
	});

	it("Test adding node type to palette Flyout Panel", function() {
		cy.setCategoryId("newCategory");
		cy.setCategoryName("New Category");
		cy.submitAPI();
		cy.verifyNodeIsAddedInPaletteCategory("Custom Node Type", "New Category");
	});
});

describe("Test adding node type to palette Modal Panel", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Modal" });
		cy.clickToolbarPaletteOpen();
		cy.openCanvasAPI("Add PaletteItem");
	});

	it("Test adding node type to palette Modal Panel", function() {
		cy.setCategoryId("newCategory");
		cy.setCategoryName("New Category");
		cy.submitAPI();
		cy.verifyNodeIsAddedInPaletteCategory("Custom Node Type", "New Category");
	});
});

describe("Test adding node type to existing category to palette Flyout Panel", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Flyout" });
		cy.openCanvasPalette("modelerPalette.json");
		cy.clickToolbarPaletteOpen();
		cy.openCanvasAPI("Add PaletteItem");
	});

	it("Test adding node type to existing category to palette Flyout Panel", function() {
		cy.setCategoryId("output");
		cy.submitAPI();
		cy.verifyNodeIsAddedInPaletteCategory("Custom Node Type", "Outputs");
	});
});

describe("Test adding node type to existing category to palette Modal Panel", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Modal" });
		cy.openCanvasPalette("modelerPalette.json");
		cy.clickToolbarPaletteOpen();
		cy.openCanvasAPI("Add PaletteItem");
	});

	it("Test adding node type to existing category to palette Modal Panel", function() {
		cy.setCategoryId("output");
		cy.submitAPI();
		cy.verifyNodeIsAddedInPaletteCategory("Custom Node Type", "Outputs");
	});
});

describe("Test saving 3 nodes of different types to palette", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Flyout", "selectedSaveToPalette": true });
		cy.openCanvasPalette("sparkPalette.json");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test saving 3 nodes of different types to palette", function() {
		// Verify number of nodes on canvas
		cy.clickToolbarPaletteOpen();
		cy.verifyNumberOfNodes(5);

		// Select multiple nodes and save to palette
		cy.getNodeWithLabel("Binding (entry) node").click();
		cy.ctrlOrCmdClickNode("Execution node");
		cy.ctrlOrCmdClickNode("Model Node");
		cy.rightClickNode("Execution node");
		cy.clickOptionFromContextMenu("Save to palette");

		// Open "Saved Nodes" palette category
		cy.clickCategory("Saved Nodes");

		// Add nodes from "Saved Nodes" category to canvas
		cy.dragNodeToPosition("Binding (entry) node", 1200, 200);
		cy.dragNodeToPosition("Execution node", 1200, 280);
		cy.dragNodeToPosition("Model Node", 1200, 360);

		// Verify number of nodes on canvas
		cy.verifyNumberOfNodes(8);
	});
});

describe("Test saving a supernode to palette", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Flyout", "selectedSaveToPalette": true });
		cy.openCanvasPalette("sparkPalette.json");
		cy.openCanvasDefinition("supernodeCanvas.json");
	});

	it("Test saving a supernode to palette", function() {
		// Verify number of nodes in pipeline
		cy.clickToolbarPaletteOpen();
		cy.verifyNumberOfNodesInPipeline(15);

		// Save supernode to palette
		cy.getNodeWithLabel("Supernode").click();
		cy.rightClickNode("Supernode");
		cy.clickOptionFromContextMenu("Save to palette");

		// Open "Saved Nodes" palette category
		cy.clickCategory("Saved Nodes");

		// Add Supernode from "Saved Nodes" category to canvas
		cy.dragNodeToPosition("Supernode", 1200, 200);

		// Verify number of nodes in pipeline and number of pipelines
		cy.verifyNumberOfNodesInPipeline(16);
		cy.verifyNumberOfPipelines(3);
	});
});

describe("Test aspect ratio of images is preserved", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Flyout" });
		cy.openCanvasPalette("animationsPalette.json");
	});

	it("Test aspect ratio of images is preserved", function() {
		// Open Animations category in palette
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Animations");

		// The aspect ratio is preserved when height and width are different.
		cy.verifyPaletteNodeImageCSS("Triangle", "width", "28px");
		cy.verifyPaletteNodeImageCSS("Triangle", "height", "25px");
	});
});

describe("Test nodes in Modal palette have data-id attribute", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Modal" });
		cy.openCanvasPalette("modelerPalette.json");
		cy.clickToolbarPaletteOpen();
	});

	it("Nodes in Modal palette should have data-id attribute", function() {
		cy.clickCategory("Import");
		cy.verifyNodeHasDataId("Var. File", "variablefile", "Import");
		cy.verifyNodeHasDataId("Database", "database", "Import");
		cy.verifyNodeHasDataId("Object Store", "object_storage_import");

		cy.clickCategory("Record Ops");
		cy.verifyNodeHasDataId("User Input", "userinput", "Record Ops");
		cy.verifyNodeHasDataId("Select", "select", "Record Ops");
		cy.verifyNodeHasDataId("Sample", "sample", "Record Ops");
		cy.verifyNodeHasDataId("Merge", "merge", "Record Ops");
		cy.verifyNodeHasDataId("Sort", "sort", "Record Ops");
		cy.verifyNodeHasDataId("Aggregate", "aggregate", "Record Ops");
		cy.verifyNodeHasDataId("Balance", "balance", "Record Ops");
	});
});

describe("Test nodes in Flyout palette have data-id attribute", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Flyout" });
		cy.openCanvasPalette("modelerPalette.json");
		cy.clickToolbarPaletteOpen();
	});

	it("Nodes in Flyout palette should have data-id attribute", function() {
		cy.clickCategory("Import");
		cy.verifyNodeHasDataId("Var. File", "variablefile", "Import");
		cy.verifyNodeHasDataId("Database", "database", "Import");
		cy.verifyNodeHasDataId("Object Store", "object_storage_import", "Import");

		cy.clickCategory("Record Ops");
		cy.verifyNodeHasDataId("User Input", "userinput", "Record Ops");
		cy.verifyNodeHasDataId("Select", "select", "Record Ops");
		cy.verifyNodeHasDataId("Sample", "sample", "Record Ops");
		cy.verifyNodeHasDataId("Merge", "merge", "Record Ops");
		cy.verifyNodeHasDataId("Sort", "sort", "Record Ops");
		cy.verifyNodeHasDataId("Aggregate", "aggregate", "Record Ops");
		cy.verifyNodeHasDataId("Balance", "balance", "Record Ops");
	});
});

describe("Test nodes & categories accessibility within palette", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
		cy.clickToolbarPaletteOpen();
	});

	it("Category opens and closes when space bar is pressed", function() {
		// Focus on palette and press space bar to open the category
		cy.tabToCategory("Import");
		cy.pressSpaceOnCategory("Import");
		cy.verifyCategoryIsOpened("Import");

		// Press space bar to close the category
		cy.pressSpaceOnCategory("Import");
		cy.verifyCategoryIsClosed("Import");
	});

	it("Nodes added to canvas when focus is on palette node and space bar is pressed", function() {
		// Focus on palette and press apce bar
		cy.tabToCategory("Import");
		cy.pressSpaceOnCategory("Import");
		cy.verifyCategoryIsOpened("Import");

		// Focus on nodes inside the open category and press space bar
		cy.tabToNodeInCategory("Var. File", "Import");
		cy.pressSpaceOnNodeInCategory("Var. File", "Import");

		// cy.tabToNodeInCategory("Database", "Import");
		// cy.pressSpaceOnNodeInCategory("Database", "Import");
		//
		// cy.tabToNodeInCategory("Object Store", "Import");
		// cy.pressSpaceOnNodeInCategory("Object Store", "Import");
		//
		// // Verify the nodes are on the canvas
		// cy.verifyNodeExists("Var. File");
		// cy.verifyNodeExists("Database");
		// cy.verifyNodeExists("Object Store");
	});
});
