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

describe("Test basic undo/redo operations", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedConnectionType": "Halo" });
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test undo/ redo operations after dragging nodes from palette to canvas, link nodes, add comment to node, " +
	"disconnect node, move node, move comment, edit comment, delete node, delete comment, link comment to node, " +
	"delete data link, delete comment link", function() {
		// Drag 2 nodes from palette to canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 350, 200);
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Select", 450, 200);
		cy.clickToolbarPaletteClose();
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(1);
		// Redo using toolbar
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(2);

		// link nodes
		cy.linkNodes("Var. File", "Select");
		cy.verifyLinkBetweenNodes("Var. File", "Select", 1);
		// Undo using shortcut keys
		cy.shortcutKeysUndo();
		cy.verifyNumberOfPortDataLinks(0);
		// Redo using toolbar
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(1);

		// Add comment to selected node
		cy.getNodeWithLabel("Select").click();
		cy.addCommentToPosition("This comment box should be linked to the Select node.", 350, 250);

		// Edit comment
		cy.editTextInComment(
			"This comment box should be linked to the Select node.", "This comment box should be edited."
		);
		// Undo and redo using toolbar
		cy.clickToolbarUndo();
		cy.verifyEditedCommentExists("This comment box should be linked to the Select node.");
		cy.clickToolbarRedo();
		cy.verifyEditedCommentExists("This comment box should be edited.");

		// Undo edit comment, add comment
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.verifyNumberOfComments(0);
		// Redo add comment, edit comment
		cy.shortcutKeysRedo();
		cy.clickToolbarRedo();
		cy.clickToolbarRedo();
		cy.verifyNumberOfComments(1);

		// Disconnect node
		cy.rightClickNode("Var. File");
		cy.clickOptionFromContextMenu("Disconnect");
		cy.verifyNumberOfPortDataLinks(0);
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(1);
		// Redo using shortcut keys
		cy.shortcutKeysRedo();
		cy.verifyNumberOfPortDataLinks(0);

		// Move node on canvas
		cy.moveNodeToPosition("Var. File", 50, 50);
		cy.verifyNodeIsMoved("Var. File");
		// Undo and redo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNodeIsNotMoved("Var. File");
		cy.clickToolbarRedo();

		// Move comment on canvas
		cy.moveCommentToPosition("This comment box should be edited.", 100, 100);
		cy.verifyCommentIsMoved("This comment box should be edited.");
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyCommentIsNotMoved("This comment box should be edited.");

		// Click somewhere on canvas to deselect comment
		cy.get("#canvas-div-0").click(1, 1);

		// Delete node
		cy.deleteNodeUsingContextMenu("Var. File");
		cy.verifyNodeIsDeleted("Var. File", true);
		// Undo and redo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(2);
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(1);

		// Delete comment
		cy.deleteCommentUsingContextMenu("This comment box should be edited.");
		cy.verifyCommentIsDeleted("This comment box should be edited.");
		// Undo and redo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfComments(1);
		cy.clickToolbarRedo();
		cy.verifyNumberOfComments(0);

		// Set column name in common-properties
		cy.openPropertyDefinition("spark.AddColumn.json");
		cy.setTextFieldValue("colName", "testValue");
		cy.saveFlyout();
		cy.verifyColumnNameEntryInConsole("testValue");
		// Undo and redo using toolbar
		cy.clickToolbarUndo();
		cy.verifyTextValueIsNotPresentInColumnName("testValue");
		cy.clickToolbarRedo();
		cy.verifyTextValueIsPresentInColumnName("testValue");

		cy.openCanvasDefinition("commentColorCanvas.json");

		// Link comment to node
		cy.linkCommentToNode(" comment 3 sample comment text", "Neural Net");
		cy.verifyNumberOfCommentLinks(4);
		// Undo and redo from toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfCommentLinks(3);
		cy.clickToolbarRedo();
		cy.verifyNumberOfCommentLinks(4);

		// Delete data link
		cy.deleteLinkAt(205, 248);
		cy.verifyNumberOfPortDataLinks(4);
		// Undo and redo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(5);
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(4);

		// Delete comment link
		cy.deleteLinkAt(225, 188);
		cy.verifyNumberOfCommentLinks(3);
		// Undo and redo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfCommentLinks(4);
		cy.clickToolbarRedo();
		cy.verifyNumberOfCommentLinks(3);
	});
});

describe("Test select all canvas objects undo/redo operations", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedConnectionType": "Halo" });
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test undo/redo operations after selecting all nodes and comments on canvas and delete a node, " +
	"Select all nodes and comments and disconnect a node, " +
	"Select all nodes and comments using Ctrl/Cmnd+A and press delete key", function() {
		// Drag 2 nodes from palette to canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Field Reorder", 300, 450);
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Sort", 500, 450);
		cy.clickToolbarPaletteClose();

		// Select all nodes and comments using keyboard and delete a node
		cy.selectAllNodesUsingCtrlOrCmdKey();
		cy.selectAllCommentsUsingCtrlOrCmdKey();
		cy.deleteNodeUsingContextMenu("Define Types");
		cy.verifyNodeIsDeleted("Define Types", true);
		// Verify canvas is empty
		cy.verifyCanvasIsEmpty();
		cy.verifyObjectModelIsEmpty();
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfComments(3);
		cy.verifyNumberOfPortDataLinks(5);
		cy.verifyNumberOfCommentLinks(3);
		// Redo using toolbar
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(0);
		cy.verifyNumberOfComments(0);
		cy.verifyNumberOfPortDataLinks(0);
		cy.verifyNumberOfCommentLinks(0);
		// Undo using toolbar again
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfComments(3);
		cy.verifyNumberOfPortDataLinks(5);
		cy.verifyNumberOfCommentLinks(3);

		// Select all nodes and comments using keyboard and disconnect a node
		cy.selectAllNodesUsingCtrlOrCmdKey();
		cy.selectAllCommentsUsingCtrlOrCmdKey();
		cy.rightClickNode("DRUG1n");
		cy.clickOptionFromContextMenu("Disconnect");
		// Verify that all the data links and comment links are deleted
		cy.verifyNumberOfPortDataLinks(0);
		cy.verifyNumberOfCommentLinks(0);
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(5);
		cy.verifyNumberOfCommentLinks(3);
		// Redo using toolbar
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(0);
		cy.verifyNumberOfCommentLinks(0);
		// Undo using toolbar again
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(5);
		cy.verifyNumberOfCommentLinks(3);

		// Select all nodes and comments using context menu and delete a node
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextMenu("Select All");
		cy.deleteNodeUsingContextMenu("Define Types");
		cy.verifyNodeIsDeleted("Define Types", true);
		// Verify canvas is empty
		cy.verifyCanvasIsEmpty();
		cy.verifyObjectModelIsEmpty();
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfComments(3);

		// Select all nodes and comments using Ctrl/Cmnd+A and press delete key
		cy.shortcutKeysSelectAllCanvasObjects();
		cy.shortcutKeysDelete();
		// Verify canvas is empty
		cy.verifyCanvasIsEmpty();
		cy.verifyObjectModelIsEmpty();
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfComments(3);

		// Select all nodes and comments using Ctrl/Cmnd+A and delete a node
		cy.shortcutKeysSelectAllCanvasObjects();
		cy.deleteNodeUsingContextMenu("Define Types");
		cy.verifyNodeIsDeleted("Define Types", true);
		// Verify canvas is empty
		cy.verifyCanvasIsEmpty();
		cy.verifyObjectModelIsEmpty();
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfComments(3);

		// Select all nodes and comments using context menu and press delete key
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextMenu("Select All");
		cy.shortcutKeysDelete();
		// Verify canvas is empty
		cy.verifyCanvasIsEmpty();
		cy.verifyObjectModelIsEmpty();
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfComments(3);

		// Move node on canvas
		cy.moveNodeToPosition("Sort", 50, 50);
		cy.verifyNodeIsMoved("Sort");
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNodeIsNotMoved("Sort");
		// Redo using toolbar
		cy.clickToolbarRedo();

		// Move comment on canvas
		cy.moveCommentToPosition(" comment 1", 100, 100);
		cy.verifyCommentIsMoved(" comment 1");
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyCommentIsNotMoved(" comment 1");
		// Redo using toolbar
		cy.clickToolbarRedo();
	});
});

describe("Test Disconnect and Delete undo/redo operations", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedConnectionType": "Halo" });
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test undo/redo operations after disconnecting a node, deleting a node", function() {
		// Drag 2 nodes from palette to canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Field Reorder", 300, 450);
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Sort", 500, 450);
		cy.clickToolbarPaletteClose();

		// Disconnect a node
		cy.rightClickNode("Neural Net");
		cy.clickOptionFromContextMenu("Disconnect");

		// Delete node
		cy.deleteNodeUsingContextMenu("Neural Net");
		cy.verifyNodeIsDeleted("Neural Net");
		cy.verifyNumberOfNodes(7);
		cy.verifyNumberOfPortDataLinks(4);

		// Undo delete node
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfPortDataLinks(4);

		// Undo disconnect node
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfPortDataLinks(5);

		// Redo disconnect node
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfPortDataLinks(4);

		// Redo delete node
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(7);
		cy.verifyNumberOfPortDataLinks(4);
	});
});

describe("Test for Multiple undo/redo operations", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedConnectionType": "Halo" });
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("radialCanvas.json");
	});

	it("Test undo/redo operations after dragging node from palette to canvas, add comment for a node, " +
	"disconnect node, link nodes", function() {
		// Drag 1 node from palette to canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Modeling");
		cy.dragNodeToPosition("Neural Net", 350, 150);
		cy.clickToolbarPaletteClose();
		cy.verifyNumberOfNodes(22);
		// Undo drag node
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(21);
		// Redo drag node
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(22);

		// Add comment for a node
		cy.getNodeWithLabel("Filter").click();
		cy.addCommentToPosition("Some text comment.", 30, 300);
		cy.verifyCommentExists("Some text comment.");
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.verifyNumberOfComments(0);

		// Disconnect a node
		cy.rightClickNode("DRUG1n");
		cy.clickOptionFromContextMenu("Disconnect");
		cy.verifyNumberOfPortDataLinks(0);
		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(20);

		// Link nodes
		cy.linkNodes("Filter", "Neural Net");
		cy.verifyLinkBetweenNodes("Filter", "Neural Net", 21);

		// Drag 2 nodes from palette to canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Select", 350, 250);
		cy.dragNodeToPosition("Sort", 350, 350);
		cy.clickToolbarPaletteClose();

		// Link nodes
		cy.linkNodes("Select", "Sort");
		cy.verifyLinkBetweenNodes("Select", "Sort", 22);

		// Undo/redo link nodes and drag nodes
		cy.clickToolbarUndo();
		cy.clickToolbarRedo();
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(23);
		cy.verifyNumberOfPortDataLinks(21);
	});
});

describe("Test for undo/redo of layout actions", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedConnectionType": "Halo" });
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test for undo/redo of layout actions", function() {
		// Arrange nodes horizontally
		cy.clickToolbarArrangeHorizontally();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", "translate(50, 123)");
		cy.verifyNodeTransform("Na_to_K", "translate(190, 123)");
		cy.verifyNodeTransform("Discard Fields", "translate(330, 123)");
		cy.verifyNodeTransform("Define Types", "translate(470, 123)");
		cy.verifyNodeTransform("C5.0", "translate(610, 50)");
		cy.verifyNodeTransform("Neural Net", "translate(610, 196)");

		// Arrange nodes vertically
		cy.clickToolbarArrangeVertically();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", "translate(120, 50)");
		cy.verifyNodeTransform("Na_to_K", "translate(120, 196)");
		cy.verifyNodeTransform("Discard Fields", "translate(120, 342)");
		cy.verifyNodeTransform("Define Types", "translate(120, 488)");
		cy.verifyNodeTransform("C5.0", "translate(50, 634)");
		cy.verifyNodeTransform("Neural Net", "translate(190, 634)");

		// Undo vertical arrangement
		cy.clickToolbarUndo();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", "translate(50, 123)");
		cy.verifyNodeTransform("Na_to_K", "translate(190, 123)");
		cy.verifyNodeTransform("Discard Fields", "translate(330, 123)");
		cy.verifyNodeTransform("Define Types", "translate(470, 123)");
		cy.verifyNodeTransform("C5.0", "translate(610, 50)");
		cy.verifyNodeTransform("Neural Net", "translate(610, 196)");

		// Undo horizontal arrangement
		cy.clickToolbarUndo();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", "translate(96, 219)");
		cy.verifyNodeTransform("Na_to_K", "translate(218, 219)");
		cy.verifyNodeTransform("Discard Fields", "translate(328, 219)");
		cy.verifyNodeTransform("Define Types", "translate(445, 219)");
		cy.verifyNodeTransform("C5.0", "translate(611, 151)");
		cy.verifyNodeTransform("Neural Net", "translate(606, 310)");

		// Redo horizontal arrangement
		cy.clickToolbarRedo();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", "translate(50, 123)");
		cy.verifyNodeTransform("Na_to_K", "translate(190, 123)");
		cy.verifyNodeTransform("Discard Fields", "translate(330, 123)");
		cy.verifyNodeTransform("Define Types", "translate(470, 123)");
		cy.verifyNodeTransform("C5.0", "translate(610, 50)");
		cy.verifyNodeTransform("Neural Net", "translate(610, 196)");

		// Redo vertical arrangement
		cy.clickToolbarRedo();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", "translate(120, 50)");
		cy.verifyNodeTransform("Na_to_K", "translate(120, 196)");
		cy.verifyNodeTransform("Discard Fields", "translate(120, 342)");
		cy.verifyNodeTransform("Define Types", "translate(120, 488)");
		cy.verifyNodeTransform("C5.0", "translate(50, 634)");
		cy.verifyNodeTransform("Neural Net", "translate(190, 634)");
	});
});
