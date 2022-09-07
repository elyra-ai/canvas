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
import * as testUtils from "../../utils/eventlog-utils";

describe("Test basic undo/redo operations", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test undo/ redo operations after dragging nodes from palette to canvas, link nodes, add comment to node," +
	" disconnect node, move node, move comment, edit comment, delete node, delete comment, link comment to node, " +
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
		cy.verifyLinkNodesActionOccurred("Var. File", "Select");
		// Undo using shortcut keys
		cy.shortcutKeysUndo();
		cy.verifyNumberOfPortDataLinks(0);
		// Redo using toolbar
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(1);

		// Add comment to selected node
		cy.clickNode("Select");
		cy.clickToolbarAddComment();
		cy.moveCommentToPosition("", 350, 250);
		cy.editTextInComment("", "This comment box should be linked to the Select node.");

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
		cy.clickToolbarUndo();
		cy.verifyNumberOfComments(0);
		// Redo add comment, edit comment
		cy.shortcutKeysRedo();
		cy.clickToolbarRedo();
		cy.clickToolbarRedo();
		cy.clickToolbarRedo();
		cy.verifyNumberOfComments(1);

		// Disconnect node
		// TODO: cy.clickOptionFromContextMenu() works on localhost but fails on travis
		// cy.rightClickNode("Var. File");
		// cy.clickOptionFromContextMenu("Disconnect");
		// cy.verifyNumberOfPortDataLinks(0);
		// // Undo using toolbar
		// cy.clickToolbarUndo();
		// cy.verifyNumberOfPortDataLinks(1);
		// // Redo using shortcut keys
		// cy.shortcutKeysRedo();
		// cy.verifyNumberOfPortDataLinks(0);

		// Move node on canvas
		cy.moveNodeToPosition("Var. File", 50, 50);
		verifyNodeIsMoved("Var. File");
		// Undo and redo using toolbar
		cy.clickToolbarUndo();
		verifyNodeIsNotMoved("Var. File");
		cy.clickToolbarRedo();

		// Move comment on canvas
		cy.moveCommentToPosition("This comment box should be edited.", 100, 100);
		verifyCommentIsMoved("This comment box should be edited.");
		// Undo using toolbar
		cy.clickToolbarUndo();
		verifyCommentIsNotMoved("This comment box should be edited.");

		// Click somewhere on canvas to deselect comment
		cy.clickCanvasAt(1, 1);

		// Delete node
		cy.deleteNodeUsingToolbar("Var. File");
		cy.verifyNodeIsDeleted("Var. File");
		// Undo and redo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(2);
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(1);

		// Delete comment
		cy.deleteCommentUsingToolbar("This comment box should be edited.");
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
		verifyColumnNameEntryInConsole("testValue");
		// Undo and redo using toolbar
		cy.clickToolbarUndo();
		verifyTextValueIsNotPresentInColumnName("testValue");
		cy.clickToolbarRedo();
		verifyTextValueIsPresentInColumnName("testValue");
	});
});

describe("Test basic undo/redo operations", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test undo/redo operations on adding comment and deleting links actions,", function() {
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
	beforeEach(() => {
		cy.visit("/");
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
		cy.clickOptionFromContextMenu("Select all");
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
		cy.clickOptionFromContextMenu("Select all");
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
		verifyNodeIsMoved("Sort");
		// Undo using toolbar
		cy.clickToolbarUndo();
		verifyNodeIsNotMoved("Sort");
		// Redo using toolbar
		cy.clickToolbarRedo();

		// Move comment on canvas
		cy.moveCommentToPosition(" comment 1", 100, 100);
		verifyCommentIsMoved(" comment 1");
		// Undo using toolbar
		cy.clickToolbarUndo();
		verifyCommentIsNotMoved(" comment 1");
		// Redo using toolbar
		cy.clickToolbarRedo();
	});
});

describe("Test Disconnect and Delete undo/redo operations", function() {
	beforeEach(() => {
		cy.visit("/");
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
	beforeEach(() => {
		cy.visit("/");
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
		cy.clickNode("Filter");
		cy.addCommentToPosition("Some text comment.", 30, 300);
		cy.verifyCommentExists("Some text comment.");
		cy.verifyEditActionInConsole("editComment", "content", "Some text comment.");

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
		cy.verifyLinkNodesActionOccurred("Filter", "Neural Net");

		// Drag 2 nodes from palette to canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Select", 350, 250);
		cy.dragNodeToPosition("Sort", 350, 350);
		cy.clickToolbarPaletteClose();

		// Link nodes
		cy.linkNodes("Select", "Sort");
		cy.verifyLinkBetweenNodes("Select", "Sort", 22);
		cy.verifyLinkNodesActionOccurred("Select", "Sort");

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
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedToolbarType": "SingleLeftBarArray" });
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test for undo/redo of layout actions", function() {
		// Arrange nodes horizontally
		cy.clickToolbarArrangeHorizontally();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", 50, 128);
		cy.verifyNodeTransform("Na_to_K", 200, 128);
		cy.verifyNodeTransform("Discard Fields", 350, 128);
		cy.verifyNodeTransform("Define Types", 500, 128);
		cy.verifyNodeTransform("C5.0", 650, 50);
		cy.verifyNodeTransform("Neural Net", 650, 205);

		// Arrange nodes vertically
		cy.clickToolbarArrangeVertically();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", 125, 50);
		cy.verifyNodeTransform("Na_to_K", 125, 205);
		cy.verifyNodeTransform("Discard Fields", 125, 360);
		cy.verifyNodeTransform("Define Types", 125, 515);
		cy.verifyNodeTransform("C5.0", 50, 670);
		cy.verifyNodeTransform("Neural Net", 200, 670);

		// Undo vertical arrangement
		cy.clickToolbarUndo();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", 50, 128);
		cy.verifyNodeTransform("Na_to_K", 200, 128);
		cy.verifyNodeTransform("Discard Fields", 350, 128);
		cy.verifyNodeTransform("Define Types", 500, 128);
		cy.verifyNodeTransform("C5.0", 650, 50);
		cy.verifyNodeTransform("Neural Net", 650, 205);

		// Undo horizontal arrangement
		cy.clickToolbarUndo();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", 96, 219);
		cy.verifyNodeTransform("Na_to_K", 218, 219);
		cy.verifyNodeTransform("Discard Fields", 328, 219);
		cy.verifyNodeTransform("Define Types", 445, 219);
		cy.verifyNodeTransform("C5.0", 611, 151);
		cy.verifyNodeTransform("Neural Net", 606, 310);

		// Redo horizontal arrangement
		cy.clickToolbarRedo();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", 50, 128);
		cy.verifyNodeTransform("Na_to_K", 200, 128);
		cy.verifyNodeTransform("Discard Fields", 350, 128);
		cy.verifyNodeTransform("Define Types", 500, 128);
		cy.verifyNodeTransform("C5.0", 650, 50);
		cy.verifyNodeTransform("Neural Net", 650, 205);

		// Redo vertical arrangement
		cy.clickToolbarRedo();
		// Verify node transform of all nodes
		cy.verifyNodeTransform("DRUG1n", 125, 50);
		cy.verifyNodeTransform("Na_to_K", 125, 205);
		cy.verifyNodeTransform("Discard Fields", 125, 360);
		cy.verifyNodeTransform("Define Types", 125, 515);
		cy.verifyNodeTransform("C5.0", 50, 670);
		cy.verifyNodeTransform("Neural Net", 200, 670);
	});
});

describe("Test undo/redo property values and title in common-properties", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test undo/redo property values and title in common-properties", function() {
		// Drag 1 node from palette to canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Modeling");
		cy.dragNodeToPosition("C5.0", 350, 200);

		// Double-click "C5.0" node to open node properties
		cy.getNodeWithLabel("C5.0").dblclick();
		cy.verifyPropertiesFlyoutTitle("C5.0");
		// Edit the name of properties flyout and delete value in samplingRatio
		cy.clickPropertiesFlyoutTitleEditIcon();
		cy.enterNewPropertiesFlyoutTitle("My C5.0 model");
		cy.backspaceTextFieldValue("samplingRatio");
		cy.saveFlyout();

		//  Verification steps
		verifySamplingRatioParameterValueInConsole("samplingRatio", null);
		verifyErrorMessageForSamplingRatioParameterInConsole("error", "samplingRatio", "Select a sampling ratio");
		verifyNewPropertiesFlyoutTitleEntryInConsole("My C5.0 model");

		// Double-click "My C5.0 model" node to open node properties
		cy.getNodeWithLabel("My C5.0 model").dblclick();

		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.saveFlyout();

		//  Verification steps
		verifySamplingRatioParameterValueInConsole("samplingRatio", 1);
		verifyNoErrorMessageInConsole();
		verifyNewPropertiesFlyoutTitleEntryInConsole("C5.0");
	});
});

describe("Test undo/redo of shaper node", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("sparkPalette.json");
	});

	it("Test undo/redo of shaper node", function() {
		// Drag 1 node from palette to canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Transformations");
		cy.dragNodeToPosition("Data Shaper", 350, 200);

		// Verification steps
		cy.verifyNumberOfPipelines(2);
		cy.verifyNumberOfNodesInPipelineAtIndex(0, 1);
		cy.verifyNumberOfNodesInPipelineAtIndex(1, 0);

		// Undo using toolbar
		cy.clickToolbarUndo();
		cy.verifyNumberOfPipelines(1);
		cy.verifyNumberOfNodesInPipelineAtIndex(0, 0);

		// Redo using toolbar
		cy.clickToolbarRedo();
		cy.verifyNumberOfPipelines(2);
		cy.verifyNumberOfNodesInPipeline(1);
		cy.verifyNumberOfNodesInPipelineAtIndex(0, 1);
		cy.verifyNumberOfNodesInPipelineAtIndex(1, 0);
	});
});

describe("Test undo/redo of supernode creation and deletion", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test undo/redo of supernode creation and deletion", function() {
		// Drag 2 nodes from palette to canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 300, 200);
		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Derive", 400, 200);

		// Link source node's output port to target node's input port
		cy.linkNodeOutputPortToNodeInputPort("Var. File", "outPort", "Derive", "inPort");
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Var. File", "outPort", "Derive", "inPort", 1
		);
		cy.clickToolbarPaletteClose();

		// Select all nodes and create supernode
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextMenu("Select all");
		cy.rightClickNode("Derive");
		cy.clickOptionFromContextMenu("Create supernode");

		// Verify Supernode created OK
		cy.verifyNumberOfPipelines(2);
		cy.verifyNumberOfNodesInPipeline(1);
		cy.verifyNumberOfLinksInPipeline(0);
		cy.verifyNumberOfNodesInSupernode("Supernode", 2);
		cy.verifyNumberOfLinksInSupernode("Supernode", 1);

		// Now delete the Supernode
		cy.deleteNodeUsingContextMenu("Supernode");

		// Verify Supernode deleted OK
		cy.verifyNodeIsDeleted("Supernode", true);
		cy.verifyNumberOfNodesInPipeline(0);
		cy.verifyNumberOfLinksInPipeline(0);

		// Test Undo (using toolbar) of deletion of Supernode
		cy.clickToolbarUndo();
		cy.verifyNumberOfPipelines(2);
		cy.verifyNumberOfNodesInPipeline(1);
		cy.verifyNumberOfLinksInPipeline(0);
		cy.verifyNumberOfNodesInSupernode("Supernode", 2);
		cy.verifyNumberOfLinksInSupernode("Supernode", 1);

		// Test Undo (using toolbar) of creation of Supernode
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodesInPipeline(2);
		cy.verifyNumberOfLinksInPipeline(1);

		// Test Redo (using toolbar) of creation Supernode
		cy.clickToolbarRedo();
		cy.verifyNumberOfPipelines(2);
		cy.verifyNumberOfNodesInPipeline(1);
		cy.verifyNumberOfLinksInPipeline(0);
		cy.verifyNumberOfNodesInSupernode("Supernode", 2);
		cy.verifyNumberOfLinksInSupernode("Supernode", 1);

		// Test Redo (using toolbar) of deletion of Supernode
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodesInPipeline(0);
		cy.verifyNumberOfLinksInPipeline(0);

		// Now try same set of undo/redo using the keyboard

		// Test Undo (using the keyboard) of deletion of Supernode
		cy.shortcutKeysUndo();
		cy.verifyNumberOfPipelines(2);
		cy.verifyNumberOfNodesInPipeline(1);
		cy.verifyNumberOfLinksInPipeline(0);
		cy.verifyNumberOfNodesInSupernode("Supernode", 2);
		cy.verifyNumberOfLinksInSupernode("Supernode", 1);

		// Test Undo (using the keyboard) of creation of Supernode
		cy.shortcutKeysUndo();
		cy.verifyNumberOfNodesInPipeline(2);
		cy.verifyNumberOfLinksInPipeline(1);

		// Test Redo (using the keyboard) of creation Supernode
		cy.shortcutKeysRedo();
		cy.verifyNumberOfPipelines(2);
		cy.verifyNumberOfNodesInPipeline(1);
		cy.verifyNumberOfLinksInPipeline(0);
		cy.verifyNumberOfNodesInSupernode("Supernode", 2);
		cy.verifyNumberOfLinksInSupernode("Supernode", 1);

		// Test Redo (using the keyboard) of deletion of Supernode
		cy.shortcutKeysRedo();
		cy.verifyNumberOfNodesInPipeline(0);
		cy.verifyNumberOfLinksInPipeline(0);

		// TODO: Following code works on localhost but fails on travis
		// Now try same set of undo/redo using the context menu

		// Test Undo (using the context menu) of deletion of Supernode
		// cy.rightClickToDisplayContextMenu(300, 100);
		// cy.clickOptionFromContextMenu("Undo");
		// cy.verifyNumberOfPipelines(2);
		// cy.verifyNumberOfNodesInPipeline(1);
		// cy.verifyNumberOfLinksInPipeline(0);
		// cy.verifyNumberOfNodesInSupernode("Supernode", 2);
		// cy.verifyNumberOfLinksInSupernode("Supernode", 1);


		// Test Undo (using the context menu) of creation of Supernode
		// cy.rightClickToDisplayContextMenu(300, 10);
		// cy.clickOptionFromContextMenu("Undo");
		// cy.verifyNumberOfNodesInPipeline(2);
		// cy.verifyNumberOfLinksInPipeline(1);

		// Test Redo (using the context menu) of creation Supernode
		// cy.rightClickToDisplayContextMenu(300, 10);
		// cy.clickOptionFromContextMenu("Redo");
		// cy.verifyNumberOfPipelines(2);
		// cy.verifyNumberOfNodesInPipeline(1);
		// cy.verifyNumberOfLinksInPipeline(0);
		// cy.verifyNumberOfNodesInSupernode("Supernode", 2);
		// cy.verifyNumberOfLinksInSupernode("Supernode", 1);

		// Test Redo (using the context menu) of deletion of Supernode
		// cy.rightClickToDisplayContextMenu(300, 10);
		// cy.clickOptionFromContextMenu("Redo");
		// cy.verifyNumberOfNodesInPipeline(0);
		// cy.verifyNumberOfLinksInPipeline(0);
	});
});

function verifyNewPropertiesFlyoutTitleEntryInConsole(newTitle) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "applyPropertyChanges()");
		expect(newTitle).to.equal(lastEventLog.data.title);
	});
}

function verifyColumnNameEntryInConsole(columnName) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(columnName).to.equal(lastEventLog.data.form.colName);
	});
}

function verifySamplingRatioParameterValueInConsole(parameterName, value) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "applyPropertyChanges()");
		expect(value).to.equal(lastEventLog.data.form[parameterName]);
	});
}

function verifyErrorMessageForSamplingRatioParameterInConsole(messageType, parameterName, message) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "applyPropertyChanges()");
		expect(lastEventLog.data.messages.length).not.equal(0);
		for (var idx = 0; idx < lastEventLog.data.messages.length; idx++) {
			if (lastEventLog.data.messages[idx].text === message &&
					lastEventLog.data.messages[idx].type === messageType &&
					lastEventLog.data.messages[idx].id_ref === parameterName) {
				expect(lastEventLog.data.messages[idx].text).to.equal(message);
				expect(lastEventLog.data.messages[idx].type).to.equal(messageType);
				expect(lastEventLog.data.messages[idx].id_ref).to.equal(parameterName);
				break;
			}
		}
	});
}

function verifyNoErrorMessageInConsole() {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "applyPropertyChanges()");
		expect(lastEventLog.data.messages.length).to.equal(0);
	});
}

function verifyTextValueIsNotPresentInColumnName(columnName) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc, 2);
		expect("").to.equal(lastEventLog.data.form.colName);
	});
}

function verifyTextValueIsPresentInColumnName(columnName) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc, 2);
		expect(columnName).to.equal(lastEventLog.data.form.colName);
	});
}

function verifyNodeIsMoved(nodeName) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.event).to.equal("editActionHandler(): moveObjects");
		expect(lastEventLog.data.selectedObjects[0].label).to.equal(nodeName);
	});
}

function verifyNodeIsNotMoved(nodeName) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.event).to.equal("editActionHandler(): undo");
		expect(lastEventLog.data.selectedObjects[0].label).to.equal(nodeName);
	});
}

function verifyCommentIsMoved(commentText) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.event).to.equal("editActionHandler(): moveObjects");
		expect(lastEventLog.data.selectedObjects[0].content).to.equal(commentText);
	});
}

function verifyCommentIsNotMoved(commentText) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.event).to.equal("editActionHandler(): undo");
		expect(lastEventLog.data.selectedObjects[0].content).to.equal(commentText);
	});
}
