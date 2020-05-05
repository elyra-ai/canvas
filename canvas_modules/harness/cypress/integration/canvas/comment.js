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
import * as testUtils from "../../utils/eventlog-utils";

describe("Test of canvas comments", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test adding a comment", function() {
		cy.get("#createAutoComment-action").click();
		cy.document().then((doc) => {
			const lastEventLog = testUtils.getLastEventLogData(doc);
			expect("createAutoComment").to.equal(lastEventLog.data.editType);
			expect("toolbar").to.equal(lastEventLog.data.editSource);
			expect(30).to.equal(lastEventLog.data.mousePos.x);
			expect(30).to.equal(lastEventLog.data.mousePos.y);
		});
	});
});

describe("Test creating a comment in main flow with toolbar and context menu", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test creating a comment using context menu, link comment to node, resize the comment", function() {
		// Create a new comment and add text to it
		cy.rightClickToDisplayContextMenu(400, 100);
		cy.clickOptionFromContextMenu("New comment");
		cy.editTextInComment("", "Hello Canvas!");
		cy.verifyNumberOfComments(1);

		// Test manually linking the comment to a node
		cy.verifyNumberOfCommentLinks(0);
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Sample", 800, 450);
		cy.linkCommentToNode("Hello Canvas!", "Sample");
		cy.verifyNumberOfCommentLinks(1);

		// TODO: Add verification commands with cypress commands

		// Test sizing the comment, using the sizing area, to the right and downwards.
		cy.resizeComment("Hello Canvas!", "south-east", 120, 80);
		// Then I verify the "Hello Canvas!" comment has width 120 and height 80

		// Test sizing the comment, using the sizing area, to the left and downwards.
		cy.resizeComment("Hello Canvas!", "south-west", 130, 90);
		// Then I verify the "Hello Canvas!" comment has width 130 and height 90

		// Test sizing the comment, using the sizing area, to the left and downwards.
		cy.resizeComment("Hello Canvas!", "north-west", 140, 100);
		// Then I verify the "Hello Canvas!" comment has width 140 and height 100

		// Test sizing the comment, using the sizing area, to the left and downwards.
		cy.resizeComment("Hello Canvas!", "north-east", 150, 110);
		// Then I verify the "Hello Canvas!" comment has width 150 and height 110

		// Size the comment to the left
		cy.resizeCommentOneDirection("Hello Canvas!", "west", 170);
		// Then I verify the "Hello Canvas!" comment has width 170 and height 110

		// Size the comment to the right
		cy.resizeCommentOneDirection("Hello Canvas!", "east", 200);
		// Then I verify the "Hello Canvas!" comment has width 200 and height 110

		//  Size the comment upwards
		cy.resizeCommentOneDirection("Hello Canvas!", "north", 100);
		// Then I verify the "Hello Canvas!" comment has width 200 and height 100

		// Size the comment downwards
		cy.resizeCommentOneDirection("Hello Canvas!", "south", 150);
		// Then I verify the "Hello Canvas!" comment has width 200 and height 150

	});
});

describe("Test creating comment from toolbar and editing them within supernodes", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test creating a comment using toolbar, add comment to node, add comment to supernode," +
	" edit comments in nested supernode", function() {
		// Create a node so we can add a comment which is linked to it
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 400, 300);

		// Add a comment using the toolbar (which should link the node to the comment)
		cy.getNodeForLabel("Var. File").click();
		cy.clickToolbarAddComment();
		cy.verifyNumberOfCommentLinks(1);
		cy.editTextInComment("", "Inner node");

		// Add the node and comment to a supernode
		cy.getNodeForLabel("Var. File").rightclick();
		cy.clickOptionFromContextMenu("Create supernode");

		// Add a comment to the supernode
		cy.getNodeForLabel("Supernode").click();
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Inner Supernode");

		// Create a supernode to contain the supernode and its comment
		cy.getNodeForLabel("Supernode").rightclick();
		cy.clickOptionFromContextMenu("Create supernode");

		// Open the supernode
		cy.getNodeForLabel("Supernode").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");

		// Open the inner supernode
		cy.getNodeForLabelInSubFlow("Supernode").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");

		// Test editing the inner comment and the nested comment
		cy.editTextInCommentInSubFlow("Inner Supernode", "New Inner Supernode text");
		cy.editTextInCommentInSubFlowNested("Inner node", "New Inner node text");
	});
});
