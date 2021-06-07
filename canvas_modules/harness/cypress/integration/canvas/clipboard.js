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


describe("Test clipboard with no link selection enabled", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test cutting some nodes and a comment and paste to canvas using keyboard", function() {
		// Validate there are 8 links on the canvas
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 1" to select it
		cy.ctrlOrCmdClickComment(" comment 1");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("DRUG1n");
		cy.ctrlOrCmdClickNode("Na_to_K");
		cy.ctrlOrCmdClickNode("Discard Fields");

		// Cut/paste using shortcut keys
		cy.shortcutKeysCut();
		cy.shortcutKeysPaste();

		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfComments(3);
		// There are 7 links because a data link has disappeared during the cut and paste
		cy.verifyNumberOfLinks(7);
	});

	it("Test copying some nodes and a comment and paste to canvas using keyboard", function() {
		// Validate there are 8 links on the canvas
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 2" to select it
		cy.ctrlOrCmdClickComment(" comment 2");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("Define Types");
		cy.ctrlOrCmdClickNode("C5.0");
		cy.ctrlOrCmdClickNode("Neural Net");

		// Copy/paste using keyboard shortcuts
		cy.shortcutKeysCopy();
		cy.shortcutKeysPaste();

		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfComments(4);
		// There are 12 links because 2 new data link and 2 new comment links were created during the copy and paste
		cy.verifyNumberOfLinks(12);
	});

	it("Test cutting some nodes and a comment and paste to canvas using toolbar", function() {
		// Validate there are 8 links on the canvas
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 1" to select it
		cy.ctrlOrCmdClickComment(" comment 1");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("DRUG1n");
		cy.ctrlOrCmdClickNode("Na_to_K");
		cy.ctrlOrCmdClickNode("Discard Fields");

		// Cut/paste using toolbar
		cy.clickToolbarCut();
		cy.clickToolbarPaste();

		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfComments(3);
		// There are 7 links because a data link has disappeared during the cut and paste
		cy.verifyNumberOfLinks(7);
	});

	it("Test copying some nodes and a comment and paste to canvas using toolbar", function() {
		// Validate there are 8 links on the canvas
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 2" to select it
		cy.ctrlOrCmdClickComment(" comment 2");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("Define Types");
		cy.ctrlOrCmdClickNode("C5.0");
		cy.ctrlOrCmdClickNode("Neural Net");

		// Copy/paste using toolbar
		cy.clickToolbarCopy();
		cy.clickToolbarPaste();

		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfComments(4);
		// There are 12 links because 2 new data link and 2 new comment links were created during the copy and paste
		cy.verifyNumberOfLinks(12);
	});

	it("Test cutting some nodes and a comment and paste to canvas using context menu", function() {
		// Validate there are 8 links on the canvas
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 1" to select it
		cy.ctrlOrCmdClickComment(" comment 1");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("DRUG1n");
		cy.ctrlOrCmdClickNode("Na_to_K");
		cy.ctrlOrCmdClickNode("Discard Fields");

		// Cut using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Cut");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfComments(3);
		// There are 7 links because a data link has disappeared during the cut and paste
		cy.verifyNumberOfLinks(7);

		// Objects should be pasted at content menu request position
		cy.verifyCommentTransform(" comment 1", 140, 400);
		cy.verifyNodeTransform("DRUG1n", 104, 516);
		cy.verifyNodeTransform("Na_to_K", 226, 516);
		cy.verifyNodeTransform("Discard Fields", 336, 516);

	});

	it("Test copying some nodes and a comment and paste to canvas using context menu", function() {
		// Validate there are 8 links on the canvas
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 2" to select it
		cy.ctrlOrCmdClickComment(" comment 2");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("Define Types");
		cy.ctrlOrCmdClickNode("C5.0");
		cy.ctrlOrCmdClickNode("Neural Net");

		// Copy using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Copy");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfComments(4);
		// There are 12 links because 2 new data link and 2 new comment links were created during the copy and paste
		cy.verifyNumberOfLinks(12);

		// Objects should be pasted at content menu request position
		cy.verifyCommentTransform(" comment 2", 349, 366);
		cy.verifyNodeTransform("Define Types", 445, 219);
		cy.verifyNodeTransform("C5.0", 611, 151);
		cy.verifyNodeTransform("Neural Net", 606, 310);
	});

	// ---------------------------------------------------------------------------
	// Two tests below test by simulating clicks in the clipboard actions in the
	// Browser's Edit Menu.
	// The Cypress test framework doesn't let us simulate a click on the browser's
	// menus so we send a corresponding event instead.
	// ---------------------------------------------------------------------------
	it("Test cutting some nodes and a comment and paste to canvas using browser's edit menu", function() {
		// Validate there are 8 links on the canvas
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 1" to select it
		cy.ctrlOrCmdClickComment(" comment 1");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("DRUG1n");
		cy.ctrlOrCmdClickNode("Na_to_K");
		cy.ctrlOrCmdClickNode("Discard Fields");

		// Cut using browser's Edit menu
		cy.simulateClickInBrowsersEditMenu("cut");

		// Paste using browser's Edit menu
		cy.simulateClickInBrowsersEditMenu("paste");

		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfComments(3);
		// There are 7 links because a data link has disappeared during the cut and paste
		cy.verifyNumberOfLinks(7);
	});

	it("Test copying some nodes and a comment and paste to canvas using browser's edit menu", function() {
		// Validate there are 8 links on the canvas
		cy.verifyNumberOfLinks(8);

		// I ctrl/cmd click the comment with text " comment 2" to select it
		cy.ctrlOrCmdClickComment(" comment 2");

		// Select multiple nodes
		cy.ctrlOrCmdClickNode("Define Types");
		cy.ctrlOrCmdClickNode("C5.0");
		cy.ctrlOrCmdClickNode("Neural Net");

		// Copy using browser's Edit menu
		cy.simulateClickInBrowsersEditMenu("copy");

		// Paste using browser's Edit menu
		cy.simulateClickInBrowsersEditMenu("paste");

		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfComments(4);
		// There are 12 links because 2 new data link and 2 new comment links were created during the copy and paste
		cy.verifyNumberOfLinks(12);
	});
});

describe("Test clipboard with detachable links enabled", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedLinkSelection": "Detachable" });
		cy.openCanvasDefinition("detachedLinksCanvas.json");
	});

	it("Test cutting semi-detached and fully-detached links using keyboard", function() {
		// Validate there are 11 links on the canvas
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("source-attached-dddddddddd");

		// Cut/paste using shortcut keys
		cy.shortcutKeysCut();
		cy.shortcutKeysPaste();

		cy.verifyNumberOfLinks(13);

		// Revert back to original canvas
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("target-attached-dddddddddd");

		// Cut/paste shortcut keys
		cy.shortcutKeysCut();
		cy.shortcutKeysPaste();

		cy.verifyNumberOfLinks(13);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("total-detached-dddd-dddddddddd");

		// Cut/paste using shortcut keys
		cy.shortcutKeysCut();
		cy.shortcutKeysPaste();

		cy.verifyNumberOfLinks(13);
	});

	it("Test copying semi-detached and fully-detached link using keyboard", function() {
		// Validate there are 11 links on the canvas
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("source-attached-dddddddddd");

		// Copy/paste using shortcut keys
		cy.shortcutKeysCopy();
		cy.shortcutKeysPaste();

		cy.verifyNumberOfLinks(14);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("target-attached-dddddddddd");

		// Copy/paste using shortcut keys
		cy.shortcutKeysCopy();
		cy.shortcutKeysPaste();

		cy.verifyNumberOfLinks(14);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("total-detached-dddd-dddddddddd");

		// Copy/paste using shortcut keys
		cy.shortcutKeysCopy();
		cy.shortcutKeysPaste();

		cy.verifyNumberOfLinks(14);
	});

	it("Test cutting semi-detached and fully-detached links using toolbar", function() {
		// Validate there are 11 links on the canvas
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("source-attached-dddddddddd");

		// Cut/paste using toolbar
		cy.clickToolbarCut();
		cy.clickToolbarPaste();

		cy.verifyNumberOfLinks(13);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("target-attached-dddddddddd");

		// Cut/paste using toolbar
		cy.clickToolbarCut();
		cy.clickToolbarPaste();

		cy.verifyNumberOfLinks(13);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("total-detached-dddd-dddddddddd");

		// Cut/paste using toolbar
		cy.clickToolbarCut();
		cy.clickToolbarPaste();

		cy.verifyNumberOfLinks(13);
	});

	it("Test copying semi-detached and fully-detached link using toolbar", function() {
		// Validate there are 11 links on the canvas
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("source-attached-dddddddddd");

		// Copy/paste using toolbar
		cy.clickToolbarCopy();
		cy.clickToolbarPaste();

		cy.verifyNumberOfLinks(14);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("target-attached-dddddddddd");

		// Copy/paste using toolbar
		cy.clickToolbarCopy();
		cy.clickToolbarPaste();

		cy.verifyNumberOfLinks(14);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("total-detached-dddd-dddddddddd");

		// Copy/paste using toolbar
		cy.clickToolbarCopy();
		cy.clickToolbarPaste();

		cy.verifyNumberOfLinks(14);
	});

	it("Test cutting semi-detached and fully-detached links using context menu", function() {
		// Validate there are 11 links on the canvas
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("source-attached-dddddddddd");

		// Cut using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Cut");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(13);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("target-attached-dddddddddd");

		// Cut using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Cut");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(13);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("total-detached-dddd-dddddddddd");

		// Cut using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Cut");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(13);
	});

	it("Test copying semi-detached and fully-detached link using context menu", function() {
		// Validate there are 11 links on the canvas
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("source-attached-dddddddddd");

		// Copy using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Copy");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(14);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("target-attached-dddddddddd");

		// Copy using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Copy");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(14);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);

		// Select a semi-detached link
		cy.clickLink("total-detached-dddd-dddddddddd");

		// Copy using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Copy");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(14);
	});

	it("Test cutting node and semi-detached link using context menu", function() {
		// Validate there are 11 links on the canvas
		cy.verifyNumberOfLinks(13);
		cy.verifyNumberOfNodes(6);

		// Select a semi-detached link and node
		cy.clickLink("source-attached-dddddddddd");
		cy.ctrlOrCmdClickNode("Binding (entry) node");

		// Cut using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Cut");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(12); // Goes to 12 because one of the comment links is deleted during the 'cut'
		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfSelectedObjects(2);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);
		cy.verifyNumberOfNodes(6);

		// Select a semi-detached link
		cy.clickLink("target-attached-dddddddddd");
		cy.ctrlOrCmdClickNode("Binding (entry) node");

		// Cut using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Cut");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(12); // Goes to 12 because one of the comment links is deleted during the 'cut'
		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfSelectedObjects(2);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);
		cy.verifyNumberOfNodes(6);

		// Select a semi-detached link
		cy.clickLink("total-detached-dddd-dddddddddd");
		cy.ctrlOrCmdClickNode("Binding (entry) node");

		// Cut using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Cut");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(12); // Goes to 12 because one of the comment links is deleted during the 'cut'
		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfSelectedObjects(2);
	});

	it("Test copying node and semi-detached link using context menu", function() {
		// Validate there are 11 links on the canvas
		cy.verifyNumberOfLinks(13);
		cy.verifyNumberOfNodes(6);

		// Select a semi-detached link and node
		cy.clickLink("source-attached-dddddddddd");
		cy.ctrlOrCmdClickNode("Binding (entry) node");

		// Copy using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Copy");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(14);
		cy.verifyNumberOfNodes(7);
		cy.verifyNumberOfSelectedObjects(2);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);
		cy.verifyNumberOfNodes(6);

		// Select a semi-detached link
		cy.clickLink("target-attached-dddddddddd");
		cy.ctrlOrCmdClickNode("Binding (entry) node");

		// Copy using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Copy");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(14);
		cy.verifyNumberOfNodes(7);
		cy.verifyNumberOfSelectedObjects(2);

		// Revert back to otriginal canvas
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinks(13);
		cy.verifyNumberOfNodes(6);

		// Select a semi-detached link
		cy.clickLink("total-detached-dddd-dddddddddd");
		cy.ctrlOrCmdClickNode("Binding (entry) node");

		// Copy using context menu
		cy.rightClickToDisplayContextMenu(300, 10);
		cy.clickOptionFromContextSubmenu("Edit", "Copy");

		// Paste using context menu
		cy.rightClickToDisplayContextMenu(100, 400);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		cy.verifyNumberOfLinks(14);
		cy.verifyNumberOfNodes(7);
		cy.verifyNumberOfSelectedObjects(2);
	});
});
