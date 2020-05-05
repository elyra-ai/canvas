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

describe("Test to see if regular selection and drag behavior works " +
"(with dragWithoutSelect set to the default: false)", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test dragging single and multiple selected nodes, " +
  "test dragging a node and comment which is not selected", function() {
		cy.document().then((doc) => {
			cy.log("Hahaha");
			cy.log(doc.canvasController.getCanvasConfig().enableDragWithoutSelect);
		});
		// Select one node
		cy.getNodeForLabel("Execution node").click();

		// Verify only one node is selected
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsNotSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsNotSelected("The 4 different node types");

		// Try dragging a single selected node
		cy.moveNodeToPosition("Execution node", 300, 350);
		cy.verifyNodeTransform("Execution node", "translate(300, 349.5)");

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
		cy.verifyNodeTransform("Binding (entry) node", "translate(300, 349.5)");
		cy.verifyNodeTransform("Execution node", "translate(508, 388.5)");

		// Verify 2 nodes and 1 comment is selected after drag
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsSelected("The 4 different node types");
		cy.clickToolbarUndo();

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

		cy.verifyNodeTransform("Super node", "translate(300, 350)");
		cy.clickToolbarUndo();

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
			"association links and comments links.", "translate(300, 350)"
		);
		cy.clickToolbarUndo();
	});
});

describe("Test to see if selection works with dragWithoutSelect set to true", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedDragWithoutSelect": true });
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test dragging single and multiple selected nodes, " +
  "test dragging a node and comment which is not selected", function() {
		cy.document().then((doc) => {
			cy.log("Hahaha");
			cy.log(doc.canvasController.getCanvasConfig().enableDragWithoutSelect);
		});
		// Select one node
		cy.getNodeForLabel("Execution node").click();
		cy.log("blah123");

		// Verify only one node is selected
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsNotSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsNotSelected("The 4 different node types");
		cy.log("blah456");

		// Try dragging a single selected node
		cy.moveNodeToPosition("Execution node", 300, 350);
		cy.verifyNodeTransform("Execution node", "translate(300, 349.5)");
		cy.log("blah789");

		// Select 2 nodes and 1 comment
		cy.clickToolbarUndo();
		cy.ctrlOrCmdClickNode("Binding (entry) node");
		cy.ctrlOrCmdClickComment("The 4 different node types");
		cy.log("blah101112");

		// Verify 2 nodes and 1 comment is selected
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsSelected("The 4 different node types");
		cy.log("blah131415");

		// Try dragging a couple of selected nodes and a selected comment
		cy.moveNodeToPosition("Binding (entry) node", 300, 350);
		cy.verifyNodeTransform("Binding (entry) node", "translate(300, 349.5)");
		cy.verifyNodeTransform("Execution node", "translate(508, 388.5)");
		cy.log("blah161718");

		// Verify 2 nodes and 1 comment is selected after drag
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsSelected("The 4 different node types");
		cy.clickToolbarUndo();
		cy.log("blah192021");

		// Try dragging a node that is not selected -
		// with dragWithoutSelect set to true this should not select the node
		// being dragged and should not deselect the three selections
		cy.moveNodeToPosition("Super node", 300, 350);
		cy.log("blah222324");

		// Verify selections are not cleared after drag - 2 nodes and 1 comment should be selected
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsSelected("The 4 different node types");
		cy.log("blah252627");

		cy.verifyNodeTransform("Super node", "translate(300, 350)");
		cy.clickToolbarUndo();
		cy.log("blah282930");

		// Try dragging a comment that is not selected -
		// with dragWithoutSelect set to true this should not select the comment
		// being dragged and should not deselect the three selections
		cy.moveCommentToPosition(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links.", 300, 350
		);
		cy.log("blah313233");

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
		cy.log("blah343536");

		cy.verifyCommentTransform(
			"This canvas shows the 4 different node types and three link types: node links, " +
			"association links and comments links.", "translate(300, 350)"
		);
		cy.clickToolbarUndo();
		cy.log("blah373839");
	});
});
