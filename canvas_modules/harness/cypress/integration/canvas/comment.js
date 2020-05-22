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
		// Temporarily commentd out because these steps don't work in Travis
		// even though they were previously working before 5/21/20.
		// cy.linkCommentToNode("Hello Canvas!", "Sample");
		// cy.verifyNumberOfCommentLinks(1);

		// Test sizing the comment, using the sizing area, to the right and downwards.
		cy.resizeComment("Hello Canvas!", "south-east", 120, 80);
		cy.verifyCommentDimensions("Hello Canvas!", 120, 80);

		// Test sizing the comment, using the sizing area, to the left and downwards.
		cy.resizeComment("Hello Canvas!", "south-west", 130, 90);
		cy.verifyCommentDimensions("Hello Canvas!", 130, 90);

		// Test sizing the comment, using the sizing area, to the left and downwards.
		cy.resizeComment("Hello Canvas!", "north-west", 140, 100);
		cy.verifyCommentDimensions("Hello Canvas!", 140, 100);

		// Test sizing the comment, using the sizing area, to the left and downwards.
		cy.resizeComment("Hello Canvas!", "north-east", 150, 110);
		cy.verifyCommentDimensions("Hello Canvas!", 150, 110);

		// Size the comment to the left
		cy.resizeCommentOneDirection("Hello Canvas!", "west", 170);
		cy.verifyCommentDimensions("Hello Canvas!", 170, 110);

		// Size the comment to the right
		cy.resizeCommentOneDirection("Hello Canvas!", "east", 200);
		cy.verifyCommentDimensions("Hello Canvas!", 200, 110);

		//  Size the comment upwards
		cy.resizeCommentOneDirection("Hello Canvas!", "north", 100);
		cy.verifyCommentDimensions("Hello Canvas!", 200, 100);

		// Size the comment downwards
		cy.resizeCommentOneDirection("Hello Canvas!", "south", 150);
		cy.verifyCommentDimensions("Hello Canvas!", 200, 150);
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
		cy.getNodeWithLabel("Var. File").click();
		cy.clickToolbarAddComment();
		cy.verifyNumberOfCommentLinks(1);
		cy.editTextInComment("", "Inner node");

		// Add the node and comment to a supernode
		cy.getNodeWithLabel("Var. File").rightclick();
		cy.clickOptionFromContextMenu("Create supernode");

		// Add a comment to the supernode
		cy.getNodeWithLabel("Supernode").click();
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Inner Supernode");

		// Create a supernode to contain the supernode and its comment
		cy.getNodeWithLabel("Supernode").rightclick();
		cy.clickOptionFromContextMenu("Create supernode");

		// Open the supernode
		cy.getNodeWithLabel("Supernode").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");

		// Open the inner supernode
		cy.getNodeWithLabelInSubFlow("Supernode").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");

		// Test editing the inner comment and the nested comment
		cy.editTextInCommentInSubFlow("Inner Supernode", "New Inner Supernode text");
		cy.editTextInCommentInSubFlowNested("Inner node", "New Inner node text");
	});
});
