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

describe("Test dragged node snaps to grid", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test moving node to position by setting different values of selectedSnapToGridType, " +
  "verify node transform", function() {
		// First move a node by an odd amount with no snap-to-grid to make sure
		// it moves appropriately.
		cy.setCanvasConfig({ "selectedSnapToGridType": "None" });
		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getNodeWithLabel("Binding (entry) node").click();
		cy.verifyNodeTransform("Binding (entry) node", 89, 99.5);
		cy.moveNodeToPosition("Binding (entry) node", 321, 281);
		cy.verifyNodeTransform("Binding (entry) node", 321, 280.5);

		// Return the node to its original position
		cy.clickToolbarUndo();
		cy.verifyNodeTransform("Binding (entry) node", 89, 99.5);

		// Make the same change with Snap To Grid set to "During"
		// and verify the node is at a different position.
		cy.setCanvasConfig({ "selectedSnapToGridType": "During" });
		cy.wait(10);
		cy.verifyNodeTransform("Binding (entry) node", 87.5, 105);
		cy.moveNodeToPosition("Binding (entry) node", 321, 281);
		cy.verifyNodeTransform("Binding (entry) node", 315, 285);

		// Return the node to its original position
		cy.clickToolbarUndo();
		cy.verifyNodeTransform("Binding (entry) node", 87.5, 105);

		// Make the same change with Snap To Grid set to "After"
		// and verify the node is at a different position.
		cy.setCanvasConfig({ "selectedSnapToGridType": "After" });
		cy.verifyNodeTransform("Binding (entry) node", 87.5, 105);
		cy.moveNodeToPosition("Binding (entry) node", 321, 281);
		cy.verifyNodeTransform("Binding (entry) node", 315, 285);
	});
});

describe("Test dragged comment snaps to grid", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test moving comment to position by setting different values of selectedSnapToGridType, " +
  "verify comment transform", function() {
		// First move a comment by an odd amount with no snap-to-grid to make sure
		// it moves appropriately.
		cy.setCanvasConfig({ "selectedSnapToGridType": "None" });
		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getCommentWithText("The 4 different node types").click();
		cy.verifyCommentTransform("The 4 different node types", 400, 50);
		cy.moveCommentToPosition("The 4 different node types", 321, 281);
		cy.verifyCommentTransform("The 4 different node types", 321, 281);

		// Return the comment to its original position
		cy.clickToolbarUndo();
		cy.verifyCommentTransform("The 4 different node types", 400, 50);

		// Make the same change with Snap To Grid set to "During"
		// and verify the comment is at a different position.
		cy.setCanvasConfig({ "selectedSnapToGridType": "During" });
		cy.wait(10);
		cy.verifyCommentTransform("The 4 different node types", 402.5, 45);
		cy.moveCommentToPosition("The 4 different node types", 321, 281);
		cy.verifyCommentTransform("The 4 different node types", 315, 285);

		// Return the comment to its original position
		cy.clickToolbarUndo();
		cy.verifyCommentTransform("The 4 different node types", 402.5, 45);

		// Make the same change with Snap To Grid set to "After"
		// and verify the comment is at a different position.
		cy.setCanvasConfig({ "selectedSnapToGridType": "After" });
		cy.wait(10);
		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getCommentWithText("The 4 different node types").click();
		cy.verifyCommentTransform("The 4 different node types", 402.5, 45);
		cy.moveCommentToPosition("The 4 different node types", 321, 281);
		cy.verifyCommentTransform("The 4 different node types", 315, 285);
	});
});

describe("Test resized comment snaps to grid", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test resizing comment by setting different values of selectedSnapToGridType, " +
  "verify comment dimensions", function() {
		// Before testing comment sizing, make sure the comment is in a snap-to-grid position
		// because, if not, the sizing test may be adversely affected because sizing
		// during snap to grid may also move the position of the comment.
		cy.setCanvasConfig({ "selectedSnapToGridType": "During" });
		cy.wait(10);
		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getCommentWithText("The 4 different node types").click();
		cy.moveCommentToPosition("The 4 different node types", 100, 300);

		// Now size a comment with Snap to Grid set to "None"
		cy.setCanvasConfig({ "selectedSnapToGridType": "None" });
		cy.wait(10);
		cy.resizeComment("The 4 different node types", "south-east", 350, 80);
		cy.verifyCommentDimensions("The 4 different node types", 350, 80);

		// Undo resized comment
		cy.clickToolbarUndo();

		// Now size a comment with Snap to Grid set to "During"
		cy.setCanvasConfig({ "selectedSnapToGridType": "During" });
		cy.wait(10);
		cy.resizeComment("The 4 different node types", "south-east", 303, 54);
		cy.verifyCommentDimensions("The 4 different node types", 297.5, 60);

		// Undo resized comment
		cy.clickToolbarUndo();

		// Now size a comment with Snap to Grid set to "After"
		cy.setCanvasConfig({ "selectedSnapToGridType": "After" });
		cy.wait(10);
		cy.resizeComment("The 4 different node types", "south-east", 303, 54);
		cy.verifyCommentDimensions("The 4 different node types", 297.5, 60);
	});
});
