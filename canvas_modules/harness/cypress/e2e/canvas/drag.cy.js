/*
 * Copyright 2017-2023 Elyra Authors
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

import key from "../../support/canvas/key.js";

describe("Test to see if regular selection and drag behavior works " +
"(with dragWithoutSelect set to the default: false)", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test dragging single and multiple selected nodes, " +
  "test dragging a node and comment which is not selected", function() {
		// Select one node
		cy.getNodeWithLabel("Execution node").click();

		// Verify only one node is selected
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsNotSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsNotSelected("The 4 different node types");

		// Try dragging a single selected node
		cy.moveNodeToPosition("Execution node", 300, 350);
		cy.verifyNodeTransform("Execution node", 300, 349.5);

		// Select 2 nodes and 1 comment
		cy.clickToolbarUndo();
		cy.ctrlOrCmdClickNode("Binding (entry) node");
		cy.ctrlOrCmdClickComment("The 4 different node types");

		// Verify 2 nodes and 1 comment is selected
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsSelected("The 4 different node types");

		// Try dragging a couple of selected nodes and a selected comment
		cy.moveNodeToPosition("Binding (entry) node", 300, 350);
		cy.verifyNodeTransform("Binding (entry) node", 300, 349.5);
		cy.verifyNodeTransform("Execution node", 508, 388.5);

		// Verify 2 nodes and 1 comment is selected after drag
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsSelected("The 4 different node types");
		cy.clickToolbarUndo();

		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getNodeWithLabel("Super node").click();
		// Try dragging a node that is not selected -
		// this should select the node being dragged and deselect the three selections
		cy.moveNodeToPosition("Super node", 300, 350);

		// Verify only dragged node is selected, all other selections are cleared
		cy.verifyNodeIsNotSelected("Execution node");
		cy.verifyNodeIsNotSelected("Binding (entry) node");
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsNotSelected("The 4 different node types");

		cy.verifyNodeTransform("Super node", 300, 350);
		cy.clickToolbarUndo();

		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getCommentWithText(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links."
		).click();
		// Try dragging a comment that is not selected -
		// this should select the comment being dragged and deselect the three selections
		cy.moveCommentToPosition(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links.", 300, 350
		);

		// Verify only dragged comment is selected
		cy.verifyNodeIsNotSelected("Execution node");
		cy.verifyNodeIsNotSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsNotSelected("The 4 different node types");
		cy.verifyCommentIsSelected(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links."
		);

		cy.verifyCommentTransform(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links.", 300, 350
		);
		cy.clickToolbarUndo();
	});

	it("Test node can be dragged with nodeMoveable set to true", function() {
		cy.setCanvasConfig({ "selectedNodeLayout": {
			nodeMovable: true } });

		cy.getNodeWithLabel("Execution node").click();
		cy.moveNodeToPosition("Execution node", 400, 450);
		cy.verifyNodeTransform("Execution node", 400, 450);
	});

	it("Test node cannot be dragged with nodeMoveable set to false", function() {
		cy.setCanvasConfig({ "selectedNodeLayout": {
			nodeMovable: false } });

		cy.wait(200);

		cy.verifyNodeTransform("Execution node", 297, 139);

		cy.getNodeWithLabel("Execution node").click();
		cy.moveNodeToPosition("Execution node", 400, 450);

		// 297 is original X coordinate and 139 is original Y coordinate
		cy.verifyNodeTransform("Execution node", 297, 139);
	});

	it("Test node cannot be dragged when enableEditingActions is false", function() {

		cy.setCanvasConfig({ "selectedEditingActions": false, "selectedInteractionType": "Carbon" });

		// Verify initial positon of Execution Node
		cy.verifyNodeTransform("Execution node", 297, 139);

		// Verify initial translation of the canvas
		cy.verifyZoomTransform(0, 0, 1);

		// Try dragging the node
		cy.moveNodeToPosition("Execution node", 400, 450);

		// Verify Execution Node has not moved
		cy.verifyNodeTransform("Execution node", 297, 139);

		// Verify that the canvas has not been dragged (instead of the node)
		// Note: The canvas would only move if the space key was pressed
		cy.verifyZoomTransform(0, 0, 1);
	});

	it("Test comment cannot be dragged when enableEditingActions is false", function() {

		cy.setCanvasConfig({ "selectedEditingActions": false, "selectedInteractionType": "Carbon" });

		// Verify initial positon of Comment
		cy.verifyCommentTransform(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links.", 20, 20
		);

		// Verify initial translation of the canvas
		cy.verifyZoomTransform(0, 0, 1);

		// Try dragging the comment
		cy.moveCommentToPosition(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links.", 300, 350
		);

		// Verify Comment has not moved
		cy.verifyCommentTransform(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links.", 20, 20
		);

		// Verify that the canvas has not been dragged (instead of the comment)
		// Note: The canvas would only move if the space key was pressed
		cy.verifyZoomTransform(0, 0, 1);
	});
});

describe("Test to see if selection works with enableDragWithoutSelect set to true", function() {
	beforeEach(() => {
		cy.viewport(1400, 650);
		cy.visit("/");
		cy.setCanvasConfig({
			"selectedDragWithoutSelect": true,
			"selectedKeyboardNavigation": true,
			"selectedResizableNodes": true,
		});
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test a node can be added to the set of selected nodes", function() {
		cy.getNodeWithLabel("Super node").click();
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);

		cy.ctrlOrCmdClickNode("Binding (entry) node");
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(2);
	});

	it("Test a range of nodes can be selected", function() {
		cy.getNodeWithLabel("Binding (entry) node").click();
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNumberOfSelectedObjects(1);

		cy.shiftClickNode("Binding (exit) node");
		cy.verifyNumberOfSelectedObjects(4);
	});

	it("Test a node can be dragged while another node remains selected", function() {
		cy.getNodeWithLabel("Super node").click();
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);

		cy.moveNodeToPosition("Binding (entry) node", 100, 350);
		cy.verifyNodeTransform("Binding (entry) node", 100, 349.5);

		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);
	});

	it("Test a node can be moved with the keyboard while another node remains selected", function() {
		// Put focus on the Super node
		cy.getNodeWithLabel("Super node").click();
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);

		// Move node down with keyboard
		cy.pressOnNode("Binding (entry) node", key.moveObjectDown);
		cy.pressOnNode("Binding (entry) node", key.moveObjectDown);
		cy.pressOnNode("Binding (entry) node", key.moveObjectDown);
		cy.pressOnNode("Binding (entry) node", key.moveObjectDown);
		cy.verifyNodeTransform("Binding (entry) node", 89, 140);

		// Make sure only the Super node is selected after the operation
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);
	});

	it("Test a node can be sized with the keyboard while another node remains selected", function() {
		// Put focus on the Super node
		cy.getNodeWithLabel("Super node").click();
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);

		// Size node downwards with keyboard
		cy.pressOnNode("Binding (entry) node", key.sizeObjectDown);
		cy.pressOnNode("Binding (entry) node", key.sizeObjectDown);
		cy.pressOnNode("Binding (entry) node", key.sizeObjectDown);
		cy.pressOnNode("Binding (entry) node", key.sizeObjectDown);
		cy.verifyNodeDimensions("Binding (entry) node", 70, 115);

		// Make sure only the Super node is selected after the operation
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);
	});

	it("Test dragging single and multiple selected nodes, " +
			"test dragging a node and comment which is not selected", function() {
		// Select one node
		cy.clickNode("Execution node");

		// Verify only one node is selected
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsNotSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsNotSelected("The 4 different node types");

		// Try dragging a single selected node
		cy.moveNodeToPosition("Execution node", 300, 350);
		cy.verifyNodeTransform("Execution node", 300, 349.5);

		// Select 2 nodes and 1 comment
		cy.clickToolbarUndo();
		cy.ctrlOrCmdClickNode("Binding (entry) node"); // TDOD - fix these lines see comment above.
		cy.ctrlOrCmdClickComment("The 4 different node types"); // TDOD - fix these lines see comment above.

		// Verify 2 nodes and 1 comment is selected
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsSelected("The 4 different node types");

		// Try dragging a couple of selected nodes and a selected comment
		cy.moveNodeToPosition("Binding (entry) node", 300, 350);
		cy.verifyNodeTransform("Binding (entry) node", 300, 349.5);
		cy.verifyNodeTransform("Execution node", 508, 388.5);

		// Verify 2 nodes and 1 comment is selected after drag
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsSelected("The 4 different node types");
		cy.clickToolbarUndo();

		// Try dragging a node that is not selected -
		// with dragWithoutSelect set to true this should not select the node
		// being dragged and should not deselect the three selections
		cy.moveNodeToPosition("Super node", 300, 350);

		// Verify selections are not cleared after drag - 2 nodes and 1 comment should be selected
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsSelected("The 4 different node types");

		cy.verifyNodeTransform("Super node", 300, 350);
		cy.clickToolbarUndo();

		// Try dragging a comment that is not selected -
		// with dragWithoutSelect set to true this should not select the comment
		// being dragged and should not deselect the three selections
		cy.moveCommentToPosition(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links.", 300, 350
		);

		// Verify selections are not cleared after drag - 2 nodes and 1 comment should be selected
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsSelected("The 4 different node types");
		cy.verifyCommentIsNotSelected(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links."
		);

		cy.verifyCommentTransform(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links.", 300, 350
		);
		cy.clickToolbarUndo();
	});
});
