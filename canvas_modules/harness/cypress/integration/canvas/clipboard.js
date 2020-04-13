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


describe("Test for clipboard Cut and Paste shortcut keys", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test cutting some nodes and a comment and paste to canvas", function() {
		// Validate there are 8 links on the canvas with port style
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 1" to select it
		cy.ctrlOrCmdClickComment(" comment 1");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("DRUG1n");
		cy.ctrlOrCmdClickNode("Na_to_K");
		cy.ctrlOrCmdClickNode("Discard Fields");

		// Cut/paste nodes and comment using shortcut keys
		cy.shortcutKeysCut();
		cy.shortcutKeysPaste();

		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfComments(3);
		// There are 7 links because a data link has disappeared during the cut and paste
		cy.verifyNumberOfLinks(7);
	});
});

describe("Test for clipboard Copy and Paste shortcut keys", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test copying some nodes and a comment and paste to canvas", function() {
		// Validate there are 8 links on the canvas with port style
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 2" to select it
		cy.ctrlOrCmdClickComment(" comment 2");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("Define Types");
		cy.ctrlOrCmdClickNode("C5.0");
		cy.ctrlOrCmdClickNode("Neural Net");

		// Copy/paste nodes and comment using keyboard shortcuts
		cy.shortcutKeysCopy();
		cy.shortcutKeysPaste();

		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfComments(4);
		// There are 12 links because 2 new data link and 2 new comment links were created during the copy and paste
		cy.verifyNumberOfLinks(12);
	});
});

describe("Test for clipboard Cut and Paste context menu items", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test cutting some nodes and a comment and paste to canvas", function() {
		// Validate there are 8 links on the canvas with port style
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 1" to select it
		cy.ctrlOrCmdClickComment(" comment 1");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("DRUG1n");
		cy.ctrlOrCmdClickNode("Na_to_K");
		cy.ctrlOrCmdClickNode("Discard Fields");

		// Cut nodes and comment using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Cut");

		// Paste nodes and comment using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfComments(3);
		// There are 7 links because a data link has disappeared during the cut and paste
		cy.verifyNumberOfLinks(7);
	});
});

describe("Test for clipboard Copy and Paste context menu items", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test copying some nodes and a comment and paste to canvas", function() {
		// Validate there are 8 links on the canvas with port style
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 2" to select it
		cy.ctrlOrCmdClickComment(" comment 2");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("Define Types");
		cy.ctrlOrCmdClickNode("C5.0");
		cy.ctrlOrCmdClickNode("Neural Net");

		// Copy nodes and comment using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Copy");

		// Paste nodes and comment using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfComments(4);
		// There are 12 links because 2 new data link and 2 new comment links were created during the copy and paste
		cy.verifyNumberOfLinks(12);
	});
});
