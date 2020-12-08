/*
 * Copyright 2017-2020 Elyra Authors
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


describe("Test auto layout variations", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test double clicking nodes onto the canvas, verify number of nodes and port data links" +
  ", undo, redo functions", function() {
		cy.clickToolbarPaletteOpen();

		// Double click Object Store node on canvas
		cy.clickCategory("Export");
		cy.doubleClickNodeInCategory("Object Store");
		cy.verifyNodeTransform("Object Store", 50, 50);
		cy.verifyNumberOfNodes(1);
		cy.verifyNumberOfPortDataLinks(0);

		// Double click Table node on canvas
		cy.clickCategory("Outputs");
		cy.doubleClickNodeInCategory("Table");
		cy.verifyNodeTransform("Table", 200, 50);
		cy.verifyNumberOfNodes(2);
		cy.verifyNumberOfPortDataLinks(0);

		// Click undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(1);
		cy.verifyNumberOfPortDataLinks(0);

		// Click undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(0);
		cy.verifyNumberOfPortDataLinks(0);

		// Double click Var. File node on canvas
		cy.clickCategory("Import");
		cy.doubleClickNodeInCategory("Var. File");
		cy.verifyNodeTransform("Var. File", 50, 50);
		cy.verifyNumberOfNodes(1);
		cy.verifyNumberOfPortDataLinks(0);

		// Double click Select node on canvas
		cy.clickCategory("Record Ops");
		cy.doubleClickNodeInCategory("Select");
		cy.verifyNodeTransform("Select", 200, 50);
		cy.verifyNumberOfNodes(2);
		cy.verifyNumberOfPortDataLinks(1);

		// Double click Sample node on canvas
		cy.doubleClickNodeInCategory("Sample");
		cy.verifyNodeTransform("Sample", 350, 50);
		cy.verifyNumberOfNodes(3);
		cy.verifyNumberOfPortDataLinks(2);

		// Double click Merge node on canvas
		cy.doubleClickNodeInCategory("Merge");
		cy.verifyNodeTransform("Merge", 500, 50);
		cy.verifyNumberOfNodes(4);
		cy.verifyNumberOfPortDataLinks(3);

		// Select Var. File node
		cy.clickNode("Var. File");

		// Double click Sort node on canvas
		cy.doubleClickNodeInCategory("Sort");
		cy.verifyNodeTransform("Sort", 200, 205);
		cy.verifyNumberOfNodes(5);
		cy.verifyNumberOfPortDataLinks(4);

		// Double click Aggregate node on canvas
		cy.doubleClickNodeInCategory("Aggregate");
		cy.verifyNodeTransform("Aggregate", 350, 205);
		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfPortDataLinks(5);

		// Select Aggregate node
		cy.clickNode("Aggregate");

		// Double click Balance node on canvas
		cy.doubleClickNodeInCategory("Balance");
		cy.verifyNodeTransform("Balance", 500, 205);
		cy.verifyNumberOfNodes(7);
		cy.verifyNumberOfPortDataLinks(6);

		// Double click Database node on canvas
		cy.clickCategory("Import");
		cy.doubleClickNodeInCategory("Database");
		cy.verifyNodeTransform("Database", 50, 360);
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfPortDataLinks(6);

		// Select Database node
		cy.clickNode("Database");

		// Double click Type node on canvas
		cy.clickCategory("Field Ops");
		cy.doubleClickNodeInCategory("Type");
		cy.verifyNodeTransform("Type", 200, 360);
		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfPortDataLinks(7);

		// Select Type node
		cy.clickNode("Type");

		// Double click Object Store node on canvas
		cy.clickCategory("Export");
		cy.doubleClickNodeInCategory("Object Store");
		cy.verifyNodeTransform("Object Store", 350, 360);
		cy.verifyNumberOfNodes(10);
		cy.verifyNumberOfPortDataLinks(8);

		// Select Object Store node
		cy.clickNode("Object Store");

		// Double click Object Store node on canvas
		cy.doubleClickNodeInCategory("Object Store");
		cy.verifyNumberOfNodes(11);
		cy.verifyNumberOfPortDataLinks(8);

		// Click undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(10);
		cy.verifyNumberOfPortDataLinks(8);

		// Click undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfPortDataLinks(7);

		// Click undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfPortDataLinks(6);

		// Click Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfPortDataLinks(7);

		// Click Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(10);
		cy.verifyNumberOfPortDataLinks(8);

		// Click Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(11);
		cy.verifyNumberOfPortDataLinks(8);
	});
});

describe("Test that auto-nodes are added to an in-place expanded supernode", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("supernodeCanvas.json");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test number of nodes and links in Supernode", function() {
		// Verify Supernode pipeline has 8 nodes
		cy.verifyNumberOfNodesInSupernode("Supernode", 8);

		// Verify Supernode pipeline has 7 links
		cy.verifyNumberOfLinksInSupernode("Supernode", 7);
	});

	it("Test that two auto nodes are added to the sub-flow", function() {
		cy.getNodeWithLabel("Supernode").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");
		cy.getNodeWithLabelInSubFlow("Type").click();

		// Test that first auto node is added to the sub-flow
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Field Ops");
		cy.doubleClickNodeInCategory("Filter");
		cy.verifyNumberOfNodesInSupernode("Supernode", 9);
		cy.verifyNumberOfLinksInSupernode("Supernode", 8);

		// Test that second auto node is added to the sub-flow
		cy.doubleClickNodeInCategory("Derive");
		cy.verifyNumberOfNodesInSupernode("Supernode", 10);
		cy.verifyNumberOfLinksInSupernode("Supernode", 9);
	});
});
