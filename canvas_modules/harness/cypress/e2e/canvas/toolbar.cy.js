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

describe("Test for toolbar Cut and Paste buttons", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test cutting some nodes and a comment and paste to canvas using toolbar", function() {
		// Validate there are 8 links on the canvas with port style
		cy.verifyNumberOfLinks(8);

		cy.getCommentWithText(" comment 1").click();
		// Select multiple nodes
		cy.ctrlOrCmdClickNode("DRUG1n");
		cy.ctrlOrCmdClickNode("Na_to_K");
		cy.ctrlOrCmdClickNode("Discard Fields");

		// Cut/paste nodes and comment using toolbar
		cy.clickToolbarCut();
		cy.clickToolbarPaste();

		// Verification steps
		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfComments(3);
		// There are 7 links because a data link has disappeared during the cut and paste
		cy.verifyNumberOfLinks(7);
	});
});

describe("Test for toolbar Copy and Paste buttons", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test copying some nodes and a comment and paste to canvas using toolbar", function() {
		// Validate there are 8 links on the canvas with port style
		cy.verifyNumberOfLinks(8);

		cy.getCommentWithText(" comment 2").click();
		// Select multiple nodes
		cy.ctrlOrCmdClickNode("Define Types");
		cy.ctrlOrCmdClickNode("C5.0");
		cy.ctrlOrCmdClickNode("Neural Net");

		// Copy/paste nodes and comment using toolbar
		cy.clickToolbarCopy();
		cy.clickToolbarPaste();

		// Verification steps
		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfComments(4);
		// There are 12 links because 2 new data link and 2 new comment links were created during the copy and paste
		cy.verifyNumberOfLinks(12);
	});
});

describe("Test for toolbar Create and Delete button", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test adding a new comment to selected node, delete node, " +
  "select all comments and delete using toolbar", function() {
		// Select node
		cy.clickNode("C5.0");

		// Add comment using toolbar
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "New Comment");

		// Double-click node to open its properties
		cy.getNodeWithLabel("Define Types").dblclick();

		// Delete node using toolbar
		cy.clickToolbarDelete();

		// Verification steps
		cy.verifyNodeIsDeleted("Define Types");
		cy.verifyNumberOfNodes(5);

		// Select all comments
		cy.selectAllCommentsUsingCtrlOrCmdKey();

		// Delete selected comments using toolbar
		cy.clickToolbarDelete();
		cy.verifyNumberOfComments(0);
	});
});

describe("Test for toolbar resize", function() {
	beforeEach(() => {
		cy.viewport(1400, 800);
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test number of items in toolbar for different window sizes", function() {
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.wait(10);
		cy.viewport(400, 600);
		cy.verifyNumberOfItemsInToolbar(8);

		cy.viewport(500, 600);
		cy.verifyNumberOfItemsInToolbar(10);

		cy.viewport(540, 600);
		cy.verifyNumberOfItemsInToolbar(11);

		cy.viewport(580, 600);
		cy.verifyNumberOfItemsInToolbar(12);

		cy.viewport(620, 600);
		cy.verifyNumberOfItemsInToolbar(12);

		cy.viewport(660, 600);
	});
});

describe("Test for toolbar add comment", function() {
	beforeEach(() => {
		cy.viewport(1330, 660);
		cy.visit("/");
	});

	it("Add comments using toolbar in regular canvas and extra canvas, verify comment transform, " +
  "zoom-in and zoom-out using toolbar in regular canvas and extra canvas", function() {
		cy.setCanvasConfig({ "selectedInteractionType": "Carbon" });

		// Add first comment using toolbar
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Comment 1");
		cy.verifyCommentTransform("Comment 1", 30, 50);

		// Zoom-in using toolbar
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.verifyZoomTransform(-132, -59, 1.21);

		// Add second comment using toolbar
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Comment 2");
		cy.verifyCommentTransform("Comment 2", 139, 99);

		// Zoom-out using toolbar
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.verifyZoomTransform(109, 49, 0.82);

		// Add third comment using toolbar
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Comment 3");
		cy.verifyCommentTransform("Comment 3", -102, -10);

		// Add fourth comment using toolbar
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Comment 4");
		cy.verifyCommentTransform("Comment 4", -92, 0);

		// Set canvas config to display extra canvas
		cy.setCanvasConfig({ "selectedExtraCanvasDisplayed": true });
		cy.inExtraCanvas();

		// Add first comment in extra canvas using toolbar
		cy.clickToolbarAddCommentInExtraCanvas();
		cy.editTextInComment("", "Comment 5");
		cy.verifyCommentTransform("Comment 5", 30, 50);

		// Zoom-in extra canvas using toolbar
		cy.clickToolbarZoomInExtraCanvas();
		cy.clickToolbarZoomInExtraCanvas();
		cy.verifyZoomTransform(-132, -27, 1.21);

		// Add second comment in extra canvas using toolbar
		cy.clickToolbarAddCommentInExtraCanvas();
		cy.editTextInComment("", "Comment 6");
		cy.verifyCommentTransform("Comment 6", 139, 73);

		// Zoom-out in extra canvas using toolbar
		cy.clickToolbarZoomOutExtraCanvas();
		cy.clickToolbarZoomOutExtraCanvas();
		cy.clickToolbarZoomOutExtraCanvas();
		cy.clickToolbarZoomOutExtraCanvas();
		cy.verifyZoomTransform(109, 22, 0.82);

		// Add third comment in extra canvas using toolbar
		cy.clickToolbarAddCommentInExtraCanvas();
		cy.editTextInComment("", "Comment 7");
		cy.verifyCommentTransform("Comment 7", -102, 22);

		// Add fourth comment in extra canvas using toolbar
		cy.clickToolbarAddCommentInExtraCanvas();
		cy.editTextInComment("", "Comment 8");
		cy.verifyCommentTransform("Comment 8", -92, 32);

		// Add 5th comment to first canvas
		cy.inRegularCanvas();
		cy.clickToolbarZoomToFit();
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Comment 5a");
		cy.verifyCommentTransform("Comment 5a", -492, -16);
	});
});

describe("Test toolbar button enable/disable", function() {
	beforeEach(() => {
		cy.visit("/");
	});

	it("Test zoom in, zoom out and zoom to fit are disabled with empty canvas", function() {
		cy.verifyToolbarButtonEnabled("zoomIn", false);
		cy.verifyToolbarButtonEnabled("zoomOut", false);
		cy.verifyToolbarButtonEnabled("zoomToFit", false);
	});


	it("Test zoom in, zoom out and zoom to fit are enabled with a canvas", function() {
		cy.openCanvasDefinition("commentColorCanvas.json");
		cy.verifyToolbarButtonEnabled("zoomIn", true);
		cy.verifyToolbarButtonEnabled("zoomOut", true);
		cy.verifyToolbarButtonEnabled("zoomToFit", true);
	});

	it("Test zoom in is disabled at maximum zoom in", function() {
		cy.openCanvasDefinition("commentColorCanvas.json");
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();

		cy.verifyToolbarButtonEnabled("zoomIn", false);
		cy.verifyToolbarButtonEnabled("zoomOut", true);
		cy.verifyToolbarButtonEnabled("zoomToFit", true);
	});

	it("Test zoom out is disabled at maximum zoom out", function() {
		cy.openCanvasDefinition("commentColorCanvas.json");
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();

		cy.verifyToolbarButtonEnabled("zoomIn", true);
		cy.verifyToolbarButtonEnabled("zoomOut", false);
		cy.verifyToolbarButtonEnabled("zoomToFit", true);
	});
});

describe("Test overrideAutoEnableDisable toolbar config option", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedToolbarType": "OverrideAutoEnableDisable" });
	});

	it("Test overrideAutoEnableDisable leaves all standard buttons in default state", function() {
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.wait(10);
		cy.verifyToolbarButtonEnabled("undo", false);
		cy.verifyToolbarButtonEnabled("redo", false);

		cy.verifyToolbarButtonEnabled("cut", false);
		cy.verifyToolbarButtonEnabled("copy", false);
		cy.verifyToolbarButtonEnabled("paste", false);

		cy.verifyToolbarButtonEnabled("createAutoComment", false);
		cy.verifyToolbarButtonEnabled("deleteSelectedObjects", false);

		// Zoom in, out, to-fit will be enabled by default.
		cy.verifyToolbarButtonEnabled("zoomIn", true);
		cy.verifyToolbarButtonEnabled("zoomOut", true);
		cy.verifyToolbarButtonEnabled("zoomToFit", true);

		// Add a comment using context menu
		cy.rightClickToDisplayContextMenu(400, 100);
		cy.clickOptionFromContextMenu("New comment");

		// After adding a comment undo should still be disabled because
		// the automatic enable/disabled code is overriden.
		cy.verifyToolbarButtonEnabled("undo", false);
	});
});
