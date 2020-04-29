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
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test disconnecting node from context menu", function() {
		// Test disconnect context menu option functionality
		cy.verifyNumberOfPortDataLinks(5);
		cy.getNodeForLabel("Discard Fields").rightclick();
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
	before(() => {
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
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test disconnecting node and comment from context menu", function() {
		// Test disconnect context menu option functionality
		cy.verifyNumberOfCommentLinks(3);
		cy.verifyNumberOfPortDataLinks(5);

		// Ctrl/cmd Select comment and node and rightclick on node to display context menu
		// Following code works fine on localhost but fails on travis build
		// cy.ctrlOrCmdClickComment(" comment 2");
		// cy.getNodeForLabel("Discard Fields").rightclick();
		// cy.clickOptionFromContextMenu("Disconnect");
		// cy.verifyNumberOfCommentLinks(1); // Travis build error - Too many elements found. Found '3', expected '1'
		// cy.verifyNumberOfPortDataLinks(3);

		// Test undo/redo on node and comment links
		// cy.clickToolbarUndo();
		// cy.verifyNumberOfCommentLinks(3);
		// cy.verifyNumberOfPortDataLinks(5);
		// cy.clickToolbarRedo();
		// cy.verifyNumberOfCommentLinks(1);
		// cy.verifyNumberOfPortDataLinks(3);
	});
});

describe("Test elbow connections from multi-port source node do not overlap", function() {
	before(() => {
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

		// TODO: Move node on canvas and verify updated link paths
		// cy.moveNodeToPosition("Neural Net", 50, 530);
	});
});
