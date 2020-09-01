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

describe("Test node link disconnection", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test disconnecting node from context menu", function() {
		// Test disconnect context menu option functionality
		cy.verifyNumberOfPortDataLinks(5);
		cy.getNodeWithLabel("Discard Fields").rightclick();
		cy.clickOptionFromContextMenu("Disconnect");
		cy.verifyNumberOfPortDataLinks(3);

		// Test undo/redo on node links
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(5);
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(3);
	});
});

describe("Test comment link disconnection", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test disconnecting comment from context menu", function() {
		// Test disconnect context menu option functionality
		cy.verifyNumberOfComments(3);
		cy.verifyNumberOfCommentLinks(3);
		cy.getCommentWithText(" comment 2").rightclick();
		cy.clickOptionFromContextMenu("Disconnect");
		cy.verifyNumberOfCommentLinks(1);

		// Test undo/redo on comment links
		cy.clickToolbarUndo();
		cy.verifyNumberOfCommentLinks(3);
		cy.clickToolbarRedo();
		cy.verifyNumberOfCommentLinks(1);
	});
});

describe("Test node and comment combination link disconnection", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test disconnecting node and comment using context menu", function() {
		// Test disconnect context menu option functionality
		cy.verifyNumberOfCommentLinks(3);
		cy.verifyNumberOfPortDataLinks(5);

		// Ctrl/cmd Select comment and node and rightclick on node to display context menu
		cy.getCommentWithText(" comment 2").click();
		cy.ctrlOrCmdClickNode("Discard Fields");
		cy.rightClickNode("Discard Fields");
		cy.clickOptionFromContextMenu("Disconnect");
		cy.verifyNumberOfCommentLinks(1);
		cy.verifyNumberOfPortDataLinks(3);

		// Test undo/redo on node and comment links
		cy.clickToolbarUndo();
		cy.verifyNumberOfCommentLinks(3);
		cy.verifyNumberOfPortDataLinks(5);
		cy.clickToolbarRedo();
		cy.verifyNumberOfCommentLinks(1);
		cy.verifyNumberOfPortDataLinks(3);
	});
});

describe("Test elbow connections from multi-port source node do not overlap", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedLinkType": "Elbow" });
		cy.openCanvasDefinition("multiPortsCanvas2.json");
	});

	it("Test elbow connections from multi-port source node do not overlap", function() {
		// Link node "Select3" output port "outPort8" to node "Neural Net" input port "inPort1"
		cy.linkNodeOutputPortToNodeInputPort("Select3", "outPort8", "Neural Net", "inPort1");
		cy.verifyNumberOfPortDataLinks(4);

		// Verify link paths
		cy.verifyLinkPath(
			"Select3", "outPort6", "Neural Net", "inPort2",
			"M 108 443.5L 144 443.5Q 154 443.5 154 433.5L 154 407Q 154 397 164 397L 319 397"
		);
		cy.verifyLinkPath(
			"Select3", "outPort7", "Neural Net", "inPort2",
			"M 108 463.5L 136 463.5Q 146 463.5 146 453.5L 146 407Q 146 397 156 397L 319 397"
		);
		cy.verifyLinkPath(
			"Select3", "outPort8", "Neural Net", "inPort1",
			"M 108 483.5L 128 483.5Q 138 483.5 138 473.5L 138 387Q 138 377 148 377L 319 377"
		);

		// Move node on canvas and verify updated link paths
		cy.moveNodeToPosition("Neural Net", 50, 530);
		cy.verifyNumberOfPortDataLinks(4);
		cy.verifyLinkPath(
			"Select3", "outPort6", "Neural Net", "inPort2",
			"M 108 443.5L 128 443.5Q 138 443.5 138 453.5L 138 500.25Q 138 510.25 " +
			"128 510.25L 30 510.25Q 20 510.25 20 520.25L 20 567Q 20 577 30 577L 50 577"
		);
		cy.verifyLinkPath(
			"Select3", "outPort7", "Neural Net", "inPort2",
			"M 108 463.5L 136 463.5Q 146 463.5 146 473.5L 146 510.25Q 146 520.25 " +
			"136 520.25L 30 520.25Q 20 520.25 20 530.25L 20 567Q 20 577 30 577L 50 577"
		);
		cy.verifyLinkPath(
			"Select3", "outPort8", "Neural Net", "inPort1",
			"M 108 483.5L 144 483.5Q 154 483.5 154 493.5L 154 510.25Q 154 520.25 " +
			"144 520.25L 30 520.25Q 20 520.25 20 530.25L 20 547Q 20 557 30 557L 50 557"
		);
	});
});

describe("Test enableLinkSelection configuration option", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedLinkSelection": true });
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test a link can be selected", function() {
		cy.clickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.verifyLinkIsSelected("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
	});

	it("Test multiple links can be selected with Cmnd + click", function() {
		cy.clickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.ctrlOrCmdClickLink("a81684aa-9b09-4620-aa59-54035a5de913");

		cy.verifyLinkIsSelected("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.verifyLinkIsSelected("a81684aa-9b09-4620-aa59-54035a5de913");
	});

	it("Test an already selected link can be deselcted with Cmnd + click", function() {
		// Select two links
		cy.clickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.ctrlOrCmdClickLink("a81684aa-9b09-4620-aa59-54035a5de913");

		// Deselect one of the links with cmnd + click
		cy.ctrlOrCmdClickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");

		// Chck one is selected and the other is not
		cy.verifyLinkIsNotSelected("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.verifyLinkIsSelected("a81684aa-9b09-4620-aa59-54035a5de913");
	});

	it("Test clicking on an unselected link deselcts other selcted links", function() {
		// Select two links
		cy.clickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.ctrlOrCmdClickLink("a81684aa-9b09-4620-aa59-54035a5de913");

		// Select a third link
		cy.clickLink("2a640b77-76f7-4601-a794-7e71fc7ee241");

		// Check one is selected and the other two are not
		cy.verifyLinkIsSelected("2a640b77-76f7-4601-a794-7e71fc7ee241");
		cy.verifyLinkIsNotSelected("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.verifyLinkIsNotSelected("a81684aa-9b09-4620-aa59-54035a5de913");
	});

	it("Test selecting a data link and an association link is successful", function() {
		// Select a data link
		cy.clickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");

		// Select an association link
		cy.ctrlOrCmdClickLink("id5KIRGGJ3FYT.id125TTEEIK7V");

		// Check all three are selected
		cy.verifyLinkIsSelected("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		// cy.verifyLinkIsSelected("a8747ee1-6afd-4157-b0fb-05e296ba91e3");
		cy.verifyLinkIsSelected("id5KIRGGJ3FYT.id125TTEEIK7V");
	});


	it("Test selecting a node and a link work OK", function() {
		// Select a node and a link
		cy.getNodeWithLabel("Binding (entry) node").click();
		cy.ctrlOrCmdClickLink("a81684aa-9b09-4620-aa59-54035a5de913");

		// Chck one is selected and the other two are not
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyLinkIsSelected("a81684aa-9b09-4620-aa59-54035a5de913");
	});

	it("Test selecting a node and a link and deleting them works OK", function() {
		// Select a node and a link
		cy.getNodeWithLabel("Binding (entry) node").click();
		cy.ctrlOrCmdClickLink("a81684aa-9b09-4620-aa59-54035a5de913");

		// Delete them using the toolbar
		cy.clickToolbarDelete();

		// Check neither exists
		cy.verifyNodeIsDeleted("Binding (entry) node", false);
		cy.verifyLinkIsDeleted("a81684aa-9b09-4620-aa59-54035a5de913");
	});

});


describe("Test enableDetachableLinks configuration option", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({
			"selectedLinkSelection": true,
			"selectedDetachableLinks": true,
			"selectedLinkType": "Straight" });
		cy.openCanvasDefinition("detachedLinksCanvas.json");
	});

	it("Test a detached link can be created", function() {
		cy.verifyNumberOfPortDataLinks(6);
		cy.verifyNumberOfLinks(11);
		cy.linkNodeOutputPortToPointOnCanvas("Binding (entry) node", "outPort", 200, 500);
		cy.verifyNumberOfPortDataLinks(7);
		cy.verifyNumberOfLinks(12);
	});


});
