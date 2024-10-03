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
/* eslint no-undefined: "off" */

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

describe("Test node link creation", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test dragging a link from a source node to canvas doesn't create a link", function() {
		cy.verifyNumberOfPortDataLinks(4);
		cy.verifyNumberOfLinks(9);

		cy.linkNodeOutputPortToPointOnCanvas("Binding (entry) node", "outPort", 200, 500);

		cy.verifyNumberOfPortDataLinks(4);
		cy.verifyNumberOfLinks(9);
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

describe("Test basic link construction", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test all 8 combinations of link type and link method", function() {

		// Test the 4 Ports (LeftRight) combinations

		cy.setCanvasConfig({ "selectedLinkType": "Curve", "selectedLinkMethod": "Ports" });
		cy.verifyLinkPath(
			"Binding (entry) node", "outPort", "Execution node", "inPort",
			"M 159 128.5 C 228 128.5 228 167.5 297 167.5"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Elbow", "selectedLinkMethod": "Ports" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Binding (entry) node", "outPort", "Execution node", "inPort",
			"M 159 128.5 L 179 128.5 Q 189 128.5 189 138.5 L 189 157.5 Q 189 167.5 199 167.5 L 297 167.5"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Parallax", "selectedLinkMethod": "Ports" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Binding (entry) node", "outPort", "Execution node", "inPort",
			"M 159 128.5 L 189 128.5 L 267 167.5 L 297 167.5"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Straight", "selectedLinkMethod": "Ports" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Binding (entry) node", "outPort", "Execution node", "inPort",
			"M 166 144.875 L 290 168.125"
		);

		// Test the 4 Freeform combinations

		cy.setCanvasConfig({ "selectedLinkType": "Curve", "selectedLinkMethod": "Freeform" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Binding (entry) node", "outPort", "Execution node", "inPort",
			"M 166 137 C 228 137 228 176 290 176"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Elbow", "selectedLinkMethod": "Freeform" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Binding (entry) node", "outPort", "Execution node", "inPort",
			"M 166 137 L 186 137 Q 196 137 196 147 L 196 166 Q 196 176 206 176 L 290 176"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Parallax", "selectedLinkMethod": "Freeform" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Binding (entry) node", "outPort", "Execution node", "inPort",
			"M 166 137 L 196 137 L 260 176 L 290 176"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Straight", "selectedLinkMethod": "Freeform" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Binding (entry) node", "outPort", "Execution node", "inPort",
			"M 166 144.875 L 290 168.125"
		);
	});

	it("Test 8 cominations of creation and construction of self-referencing link", function() {

		cy.setCanvasConfig({ "selectedLinkType": "Curve", "selectedLinkMethod": "Ports",
			"selectedSelfRefLinks": true, "selectedLinkSelection": "LinkOnly" });

		// Delete the two links connected to the Execution node
		cy.wait(10);
		cy.clickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.clickToolbarDelete();

		cy.clickLink("a81684aa-9b09-4620-aa59-54035a5de913");
		cy.clickToolbarDelete();

		// Create a self-refernceing link on the Execution node
		cy.linkNodeOutputPortToNodeInputPort(
			"Execution node", "outPort", "Execution node", "inPort");

		// Test the 4 Ports (Left Right) combinations

		cy.verifyLinkPath(
			"Execution node", "outPort", "Execution node", "inPort",
			"M 367 167.5 Q 397 167.5 397 143 Q 397 118.5 332 118.5 L 332 " +
			"118.5 Q 267 118.5 267 143 Q 267 167.5 297 167.5"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Elbow", "selectedLinkMethod": "Ports" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Execution node", "outPort", "Execution node", "inPort",
			"M 367 167.5 L 387 167.5 Q 397 167.5 397 157.5 L 397 128.5 Q 397 " +
			"118.5 387 118.5 L 277 118.5 Q 267 118.5 267 128.5 L 267 157.5 Q 267 " +
			"167.5 277 167.5 L 297 167.5"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Parallax", "selectedLinkMethod": "Ports" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Execution node", "outPort", "Execution node", "inPort",
			"M 367 167.5 L 397 167.5 L 397 118.5 L 267 118.5 L 267 167.5 L 297 167.5"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Straight", "selectedLinkMethod": "Ports",
			"selectedStraightLinksAsFreeform": false });
		cy.wait(10);
		cy.verifyLinkPath(
			"Execution node", "outPort", "Execution node", "inPort",
			"M 367 167 L 397 118 L 267 118.5 L 267 167.5 L 297 167.5"
		);

		// Test the 4 Freeform combinations

		cy.setCanvasConfig({ "selectedLinkType": "Curve", "selectedLinkMethod": "Freeform" });
		cy.verifyLinkPath(
			"Execution node", "outPort", "Execution node", "inPort",
			"M 367 167.5 L 397 118.5 L 267 118.5 L 267 167.5 L 297 167.5"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Elbow", "selectedLinkMethod": "Freeform" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Execution node", "outPort", "Execution node", "inPort",
			"M 374 176 L 394 176 Q 404 176 404 166 L 404 111.5 Q 404 101.5 394 101.5 " +
			"L 342 101.5 Q 332 101.5 332 111.5 L 332 131.5"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Parallax", "selectedLinkMethod": "Freeform" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Execution node", "outPort", "Execution node", "inPort",
			"M 374 176 L 404 176 L 404 101.5 L 332 101.5 L 332 131.5"
		);

		cy.setCanvasConfig({ "selectedLinkType": "Straight", "selectedLinkMethod": "Freeform" });
		cy.wait(10);
		cy.verifyLinkPath(
			"Execution node", "outPort", "Execution node", "inPort",
			"M 374 176 L 404 176 404 101.5 332  101.5 332 131.5"
		);
	});
});

describe("Test elbow connections from multi-port source nodes", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedLinkType": "Elbow" });
		cy.openCanvasDefinition("multiPortsCanvas2.json");
	});

	it("Test elbow connections from multi-port source node do not overlap", function() {
		// Link node "Select3" output port "outPort8" to node "Neural Net" input port "inPort1"
		cy.linkNodeOutputPortToNodeInputPort("Select3", "outPort8", "Neural Net", "inPort1");
		cy.verifyNumberOfPortDataLinks(6);

		// Verify link paths
		cy.verifyLinkPath(
			"Select3", "outPort6", "Neural Net", "inPort2",
			"M 108 443.5 L 144 443.5 Q 154 443.5 154 433.5 L 154 407 Q 154 397 164 397 L 319 397"
		);
		cy.verifyLinkPath(
			"Select3", "outPort7", "Neural Net", "inPort2",
			"M 108 463.5 L 136 463.5 Q 146 463.5 146 453.5 L 146 407 Q 146 397 156 397 L 319 397"
		);
		cy.verifyLinkPath(
			"Select3", "outPort8", "Neural Net", "inPort1",
			"M 108 483.5 L 128 483.5 Q 138 483.5 138 473.5 L 138 387 Q 138 377 148 377 L 319 377"
		);

		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getNodeWithLabel("Neural Net").click();
		// Move node on canvas and verify updated link paths
		cy.moveNodeToPosition("Neural Net", 50, 530);
		cy.verifyNumberOfPortDataLinks(6);
		cy.verifyLinkPath(
			"Select3", "outPort6", "Neural Net", "inPort2",
			"M 108 443.5 L 128 443.5 Q 138 443.5 138 453.5 L 138 500.25 Q 138 510.25 " +
			"128 510.25 L 30 510.25 Q 20 510.25 20 521.5 L 20 567 Q 20 577 30 577 L 50 577"
		);
		cy.verifyLinkPath(
			"Select3", "outPort7", "Neural Net", "inPort2",
			"M 108 463.5 L 136 463.5 Q 146 463.5 146 473.5 L 146 500.25 Q 146 511.5 " +
			"136 511.5 L 30 511.5 Q 20 511.5 20 521.25 L 20 567 Q 20 577 30 577 L 50 577"
		);
		cy.verifyLinkPath(
			"Select3", "outPort8", "Neural Net", "inPort1",
			"M 108 483.5 L 144 483.5 Q 154 483.5 154 493.5 L 154 500.25 Q 154 511.5 " +
			"144 511.5 L 30 511.5 Q 20 511.5 20 521.25 L 20 547 Q 20 557 30 557 L 50 557"
		);

		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getNodeWithLabel("Select3").click();
		cy.moveNodeToPosition("Select3", 150, 400);
		cy.verifyNumberOfPortDataLinks(6);
		cy.verifyLinkPath(
			"Select3", "outPort6", "Neural Net", "inPort2",
			"M 220 509.5 L 240 509.5 Q 250 509.5 250 519.5 L 250 614.5 Q 250 624.5 " +
			"240 624.5 L 30 624.5 Q 20 624.5 20 614.5 L 20 587 Q 20 577 30 577 L 50 577"
		);
		cy.verifyLinkPath(
			"Select3", "outPort7", "Neural Net", "inPort2",
			"M 220 529.5 L 248 529.5 Q 258 529.5 258 539.5 L 258 614.5 Q 258 624.5 " +
			"248 624.5 L 30 624.5 Q 20 624.5 20 614.5 L 20 587 Q 20 577 30 577 L 50 577"
		);
		cy.verifyLinkPath(
			"Select3", "outPort8", "Neural Net", "inPort1",
			"M 220 549.5 L 256 549.5 Q 266 549.5 266 559.5 L 266 614.5 Q 266 624.5 " +
			"256 624.5 L 30 624.5 Q 20 624.5 20 614.5 L 20 567 Q 20 557 30 557 L 50 557"
		);
	});

	it("Test elbow connections from multi-port source node travel shortest route", function() {
		cy.verifyNumberOfPortDataLinks(5);

		// Verify link paths - one should go up and over the 'Select' and 'Filler'
		// nodes and one should go down and under the nodes. This is because
		// common-canvas calculates the shortest distance from the source port to
		// the target port and draws the links to travel the shortest distance.
		cy.verifyLinkPath(
			"Filler", "outPort1", "Select", "inPort",
			"M 668 522.5 L 688 522.5 Q 698 522.5 698 512.5 L 698 485 Q 698 475 688 475 " +
			"L 415 475 Q 405 475 405 485 L 405 535 Q 405 545 415 545 L 435 545"
		);
		cy.verifyLinkPath(
			"Filler", "outPort1", "Select", "inPort",
			"M 668 522.5 L 688 522.5 Q 698 522.5 698 512.5 L 698 485 Q 698 475 688 475 " +
			"L 415 475 Q 405 475 405 485 L 405 535 Q 405 545 415 545 L 435 545"
		);

		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getNodeWithLabel("Select").click();
		// Move the target node so one link line continues to go over the top of
		// both nodes and one goes underneath both nodes.
		cy.moveNodeToPosition("Select", 440, 450);
		cy.verifyLinkPath(
			"Filler", "outPort1", "Select", "inPort",
			"M 668 522.5 L 696 522.5 Q 706 522.5 706 512.5 L 706 440 Q 706 430 696 430 " +
			"L 420 430 Q 410 430 410 440 L 410 469 Q 410 479 420 479 L 440 479"
		);
		cy.verifyLinkPath(
			"Filler", "outPort1", "Select", "inPort",
			"M 668 522.5 L 696 522.5 Q 706 522.5 706 512.5 L 706 440 Q 706 430 696 430 " +
			"L 420 430 Q 410 430 410 440 L 410 469 Q 410 479 420 479 L 440 479"
		);

		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getNodeWithLabel("Select").click();
		// Move the target node so both link lines go over the source node and
		// under the target node.
		cy.moveNodeToPosition("Select", 440, 400);
		cy.verifyLinkPath(
			"Filler", "outPort1", "Select", "inPort",
			"M 668 522.5 L 696 522.5 Q 706 522.5 706 512.5 L 706 495 Q 706 485 696 485 " +
			"L 420 485 Q 410 485 410 475 L 410 439 Q 410 429 420 429 L 440 429"
		);
		cy.verifyLinkPath(
			"Filler", "outPort1", "Select", "inPort",
			"M 668 522.5 L 696 522.5 Q 706 522.5 706 512.5 L 706 495 Q 706 485 696 485 " +
			"L 420 485 Q 410 485 410 475 L 410 439 Q 410 429 420 429 L 440 429"
		);

		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getNodeWithLabel("Select").click();
		// Move the target node so both link lines go under the source node and
		// over the target node.
		cy.moveNodeToPosition("Select", 440, 600);
		cy.verifyLinkPath(
			"Filler", "outPort1", "Select", "inPort",
			"M 668 522.5 L 688 522.5 Q 698 522.5 698 532.5 L 698 575 Q 698 585 688 585 " +
			"L 420 585 Q 410 585 410 595 L 410 619 Q 410 629 420 629 L 440 629"
		);
		cy.verifyLinkPath(
			"Filler", "outPort1", "Select", "inPort",
			"M 668 522.5 L 688 522.5 Q 698 522.5 698 532.5 L 698 575 Q 698 585 688 585 " +
			"L 420 585 Q 410 585 410 595 L 410 619 Q 410 629 420 629 L 440 629"
		);
	});
});

describe("Test enableLinkSelection = 'LinkOnly' configuration option", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedLinkSelection": "LinkOnly" });
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

	it("Test an already selected link can be deselected with Cmnd + click", function() {
		// Select two links
		cy.clickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.ctrlOrCmdClickLink("a81684aa-9b09-4620-aa59-54035a5de913");

		// Deselect one of the links with cmnd + click
		cy.ctrlOrCmdClickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");

		// Chck one is selected and the other is not
		cy.verifyLinkIsNotSelected("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.verifyLinkIsSelected("a81684aa-9b09-4620-aa59-54035a5de913");
	});

	it("Test clicking on an unselected link deselcts other selected links", function() {
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

	it("Test all objects including links are selected with SelectAll from keyboard", function() {
		cy.shortcutKeysSelectAllCanvasObjects();
		cy.verifyNumberOfSelectedObjects(16);

		// Test delete key deletes all objects
		cy.shortcutKeysDelete();
		cy.verifyNumberOfSelectedObjects(0);
	});

	it("Test all objects including links are selected with SelectAll from context menu", function() {
		cy.rightClickToDisplayContextMenu(400, 100);
		cy.clickOptionFromContextMenu("Select all");
		cy.verifyNumberOfSelectedObjects(16);

		// Check delete in toolbar deletes all objects
		cy.clickToolbarDelete();
		cy.verifyNumberOfSelectedObjects(0);
	});

});

describe("Test enableLinkSelection = 'Handles' configuration option", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({
			"selectedLinkSelection": "Handles",
			"selectedLinkType": "Curve" });
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test if a link end handle is dragged to the canvas it has no effect", function() {
		// Check the link from execution node to supernode exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);

		// Drag end handle out onto arbitrary point canvas.
		cy.clickLink("a81684aa-9b09-4620-aa59-54035a5de913");
		cy.moveLinkHandleToPos("a81684aa-9b09-4620-aa59-54035a5de913", "endHandle", 300, 300);

		// Make sure link still exists from execution node to supernode exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);
	});

	it("Test if a link start handle is dragged to the canvas it has no effect", function() {
		// Check the link from execution node to supernode exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);

		// Drag start handle out onto arbitrary point canvas.
		cy.clickLink("a81684aa-9b09-4620-aa59-54035a5de913");
		cy.moveLinkHandleToPos("a81684aa-9b09-4620-aa59-54035a5de913", "startHandle", 300, 300);

		// Make sure link still exists from execution node to supernode exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);
	});

	it("Test if a link end handle is dragged to different port the link is updated", function() {
		// Check the link from execution node to supernode exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);

		// Move link between execution node and supernode to be between
		// same nodes but on a different port
		cy.clickLink("a81684aa-9b09-4620-aa59-54035a5de913");
		cy.moveLinkHandleToPortByLinkId(
			"a81684aa-9b09-4620-aa59-54035a5de913", "endHandle", "Super node", "input1SuperNodePE");

		// Check link now exists to new port.
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input1SuperNodePE", 1);

		// Undo
		cy.clickToolbarUndo();
		// Check the link from execution node to supernode is restored
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);

		// Redo
		cy.clickToolbarRedo();
		// Check link to new port is retored.
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input1SuperNodePE", 1);
	});

	it("Test if a link end handle is dragged to different node the link is updated", function() {
		// Check the link from execution node to supernode exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);

		// Delete the link from supernode to the binding exit node to make a free port
		cy.clickLink("d5bef845-9d69-4cca-95ec-27d481b4e776");
		cy.clickToolbarDelete();

		// Move end of link between execution node and supernode to be between
		// execution node and exit binding node.
		cy.clickLink("a81684aa-9b09-4620-aa59-54035a5de913");
		cy.moveLinkHandleToPortByLinkId(
			"a81684aa-9b09-4620-aa59-54035a5de913", "endHandle", "Binding (exit) node", "inPort");

		// Check the link from execution node to supernode DOES NOT exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 0);

		// Check the link from execution node to exit binding node exists.
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Binding (exit) node", "inPort", 1);

		// Undo
		cy.clickToolbarUndo();
		// Check the link from execution node to supernode is restored
		// Note the undo restores the link with a source port specified instead of undefined.
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", "outPort", "Super node", "input2SuperNodePE", 0);

		// Redo
		cy.clickToolbarRedo();
		// Check the link from execution node to exit binding node is restored.
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Binding (exit) node", "inPort", 1);
	});

	it("Test if a link start handle is dragged to different node the link is updated", function() {
		// Check the link from execution node to supernode exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 1);

		// Delete the link from binding entry node to the execution node to make a free port
		cy.clickLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		cy.clickToolbarDelete();

		// Move start of link between execution node and supernode to be between
		// entry binding node and supernode.
		cy.clickLink("a81684aa-9b09-4620-aa59-54035a5de913");
		cy.moveLinkHandleToPortByLinkId(
			"a81684aa-9b09-4620-aa59-54035a5de913", "startHandle", "Binding (entry) node", "outPort");

		// Check the link from execution node to supernode DOES NOT exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", undefined, "Super node", "input2SuperNodePE", 0);

		// Check the link from binding entry node to supernode exists.
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Binding (entry) node", "outPort", "Super node", "input2SuperNodePE", 1);

		// Undo
		cy.clickToolbarUndo();
		// Check the link from execution node to supernode is restored
		// Note the undo restores the link with a source port specified instead of undefined.
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Execution node", "outPort", "Super node", "input2SuperNodePE", 1);

		// Redo
		cy.clickToolbarRedo();
		// Check the link from execution node to exit binding node is restored
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Binding (entry) node", "outPort", "Super node", "input2SuperNodePE", 1);
	});

	it("Test all objects including links are selected with SelectAll from keyboard", function() {
		cy.shortcutKeysSelectAllCanvasObjects();
		cy.verifyNumberOfSelectedObjects(16);

		// Test delete key deletes all objects
		cy.shortcutKeysDelete();
		cy.verifyNumberOfSelectedObjects(0);
	});

	it("Test all objects including links are selected with SelectAll from context menu", function() {
		cy.rightClickToDisplayContextMenu(400, 100);
		cy.clickOptionFromContextMenu("Select all");
		cy.verifyNumberOfSelectedObjects(16);

		// Check delete in toolbar deletes all objects
		cy.clickToolbarDelete();
		cy.verifyNumberOfSelectedObjects(0);
	});

});

describe("Test selectedLinkSelection = 'Detachable' configuration option", function() {
	// Note: Problems can occur when selectedInsertNodeDroppedOnLink is set to true with
	// "Detachable" links, so we switch it to true here even though it is not strictly
	// needed for these tests.
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({
			"selectedLinkSelection": "Detachable",
			"selectedLinkType": "Straight",
			"selectedInsertNodeDroppedOnLink": true });
		cy.openCanvasDefinition("detachedLinksCanvas.json");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test a detached link can be created and undone", function() {
		cy.verifyNumberOfPortDataLinks(8);
		cy.verifyNumberOfLinks(13);

		// Create detached link
		cy.linkNodeOutputPortToPointOnCanvas("Binding (entry) node", "outPort", 200, 500);
		cy.verifyNumberOfPortDataLinks(9); // One new data link should be created.
		cy.verifyNumberOfLinks(14);

		// Undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(8); // The data link should have been removed.
		cy.verifyNumberOfLinks(13);

		// Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(9); // The data link should have been added back.
		cy.verifyNumberOfLinks(14);
	});

	it("Test a node can be deleted and leave detached links behind", function() {
		cy.verifyNumberOfPortDataLinks(8);
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);

		// Delete the supernode
		cy.deleteNodeUsingContextMenu("Super node");
		cy.verifyNumberOfPortDataLinks(8); // Data links should remain
		cy.verifyNumberOfCommentLinks(3); // Comment link should be deleted
		cy.verifyNumberOfAssociationLinks(1); // Association links should be unaffected

		// Undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(8); // Data links should remain
		cy.verifyNumberOfCommentLinks(4); // Comment link should be replaced
		cy.verifyNumberOfAssociationLinks(1); // Association links should be unaffected

		// Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(8); // Data links should remain
		cy.verifyNumberOfCommentLinks(3); // Comment link should be removed
		cy.verifyNumberOfAssociationLinks(1); // Association links should be unaffected
	});

	it("Test selected detached links can be deleted", function() {
		cy.verifyNumberOfPortDataLinks(8);
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);

		// Select and delete the fully detached link
		cy.clickLink("total-detached-dddd-dddddddddd");
		cy.clickToolbarDelete();
		cy.verifyNumberOfPortDataLinks(7); // The data link should be removed
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);

		// Select and delete the two semi-detached links
		cy.clickLink("source-attached-dddddddddd");
		cy.ctrlOrCmdClickLink("target-attached-dddddddddd");
		cy.clickToolbarDelete();
		cy.verifyNumberOfPortDataLinks(5); // The data links should be removed
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);

		// Undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(7); // The data links should be added back
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);

		// Undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(8); // The fully detached link should be added back
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);

		// Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(7); // The fully detached link should be added back
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);

		// Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(5); // The fully detached link should be added back
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);
	});

	it("Test deleting nodes (linked with data links) leaves detached links behind", function() {
		cy.verifyNumberOfPortDataLinks(8);
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);

		// Select and delete the source semi-detached link, the data link from
		// execution node to supernode, and the model node.
		cy.clickNode("Binding (entry) node");
		cy.ctrlOrCmdClickNode("Execution node");
		cy.ctrlOrCmdClickNode("Super node");
		cy.ctrlOrCmdClickNode("Model Node");
		cy.ctrlOrCmdClickNode("Binding (exit) node");
		cy.clickToolbarDelete();
		cy.verifyNumberOfPortDataLinks(8); // All data links should remain
		cy.verifyNumberOfCommentLinks(0); // All comment links should be removed
		cy.verifyNumberOfAssociationLinks(0); // Association link should be removed

		// Undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(8);
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);

		// Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(8);
		cy.verifyNumberOfCommentLinks(0);
		cy.verifyNumberOfAssociationLinks(0);
	});

	it("Test a combination of detached links, regular links and nodes can be deleted", function() {
		cy.verifyNumberOfPortDataLinks(8);
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);

		// Select and delete the source semi-detached link, the data link from
		// execution node to supernode, and the model node.
		cy.clickLink("source-attached-dddddddddd");
		cy.ctrlOrCmdClickLink("a81684aa-9b09-4620-aa59-54035a5de913");
		cy.ctrlOrCmdClickNode("Model Node");
		cy.clickToolbarDelete();
		cy.verifyNumberOfPortDataLinks(6); // The data links should be removed
		cy.verifyNumberOfCommentLinks(3); // Comment link to model node should be removed
		cy.verifyNumberOfAssociationLinks(0); // Association link should be removed

		// Undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfPortDataLinks(8);
		cy.verifyNumberOfCommentLinks(4);
		cy.verifyNumberOfAssociationLinks(1);

		// Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfPortDataLinks(6);
		cy.verifyNumberOfCommentLinks(3);
		cy.verifyNumberOfAssociationLinks(0);
	});

	it("Test all objects including links are selected with SelectAll from keyboard", function() {
		cy.shortcutKeysSelectAllCanvasObjects();
		cy.verifyNumberOfSelectedObjects(21);

		// Test delete key deletes all objects
		cy.shortcutKeysDelete();
		cy.verifyNumberOfSelectedObjects(0);
	});

	it("Test all objects including links are selected with SelectAll from context menu", function() {
		cy.rightClickToDisplayContextMenu(400, 100);
		cy.clickOptionFromContextMenu("Select all");
		cy.verifyNumberOfSelectedObjects(21);

		// Check delete in toolbar deletes all objects
		cy.clickToolbarDelete();
		cy.verifyNumberOfSelectedObjects(0);
	});

	it("Test a new node can be dragged to the end of a detached link from palette", function() {
		cy.verifyNumberOfPortDataLinks(8);
		cy.verifyNumberOfLinks(13);

		// Drag node from palette
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Sample", 500, 450);

		// Verify the two detachd links got attached to the new node
		cy.verifyLinkBetweenNodes("Binding (entry) node", "Sample", 13);
		cy.verifyLinkBetweenNodes("Sample", "Execution node", 13);
	});

	it("Test an existing node can be dragged to the end of a detached link from canvas", function() {
		cy.verifyNumberOfPortDataLinks(8);
		cy.verifyNumberOfLinks(13);

		// First create a new node on the canvas.
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Sample", 300, 450);
		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getNodeWithLabel("Sample").click();

		// Drag the node from the canvas to the detached links
		cy.moveNodeToPosition("Sample", 200, 350);

		// Verify the two detachd links got attached to the new node
		cy.verifyLinkBetweenNodes("Binding (entry) node", "Sample", 13);
		cy.verifyLinkBetweenNodes("Sample", "Execution node", 13);
	});
});
