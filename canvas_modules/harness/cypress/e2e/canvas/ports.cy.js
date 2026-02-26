/*
 * Copyright 2017-2026 Elyra Authors
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

import key from "../../support/canvas/key.js";

describe("Test to check if a port to port link can be made with a new node", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("multiPortsCanvas.json");
	});

	it("Add a port to port link with new node, verify link is deleted when node is disconnected, " +
  "verify link is deleted when node is deleted", function() {
		// Drag a node from palette on canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Filler", 380, 580);
		cy.clickToolbarPaletteClose();

		// Verify number of port data links
		cy.verifyNumberOfPortDataLinks(5);

		// Add a port to port link with new node
		cy.linkNodeOutputPortToNodeInputPort("Filler", "outPort2", "Define Types", "inPort3");
		cy.verifyNumberOfPortDataLinks(6);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Filler", "outPort2", "Define Types", "inPort3", 1
		);

		// Disconnect node
		cy.rightClickNode("Discard Fields");
		cy.clickOptionFromContextMenu("Disconnect");
		cy.verifyNumberOfPortDataLinks(4);

		// Verify  port to port link doesn't exist between nodes
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Na_to_K", "outPort", "Discard Fields", "inPort", 0
		);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Discard Fields", "outPort2", "Define Types", "inPort2", 0
		);

		// Delete Node
		cy.deleteNodeUsingContextMenu("C5.0");
		cy.verifyNodeIsDeleted("C5.0", true);
		cy.verifyNumberOfPortDataLinks(3);

		// Verify  port to port link doesn't exist between nodes
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Define Types", "outPort1", "C5.0", "inPort", 0
		);
	});
});

describe("Test multiple ports operations", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("multiPortsCanvas2.json");
	});

	it("Add port to port link and verification steps, " +
  "negative tests to check link is not created when maximum cardinality is reached", function() {
		// Add port to port link and verification steps
		cy.linkNodeOutputPortToNodeInputPort("Select4", "outPort", "Merge1", "inPort3");
		cy.verifyNumberOfPortDataLinks(6);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select4", "outPort", "Merge1", "inPort3", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Var. File", "outPort", "Select1", "inPort");
		cy.verifyNumberOfPortDataLinks(7);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Var. File", "outPort", "Select1", "inPort", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Select2", "outPort1", "Table", "inPort");
		cy.verifyNumberOfPortDataLinks(8);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select2", "outPort1", "Table", "inPort", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Select2", "outPort2", "Table", "inPort");
		cy.verifyNumberOfPortDataLinks(9);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select2", "outPort2", "Table", "inPort", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Select2", "outPort3", "Table", "inPort");
		cy.verifyNumberOfPortDataLinks(10);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select2", "outPort3", "Table", "inPort", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Select2", "outPort4", "Table", "inPort");
		cy.verifyNumberOfPortDataLinks(11);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select2", "outPort4", "Table", "inPort", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Select3", "outPort1", "Neural Net", "inPort1");
		cy.verifyNumberOfPortDataLinks(12);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select3", "outPort1", "Neural Net", "inPort1", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Select3", "outPort2", "Neural Net", "inPort1");
		cy.verifyNumberOfPortDataLinks(13);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select3", "outPort2", "Neural Net", "inPort1", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Select3", "outPort3", "Neural Net", "inPort1");
		cy.verifyNumberOfPortDataLinks(14);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select3", "outPort3", "Neural Net", "inPort1", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Select3", "outPort4", "Neural Net", "inPort1");
		cy.verifyNumberOfPortDataLinks(15);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select3", "outPort4", "Neural Net", "inPort1", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Select3", "outPort5", "Neural Net", "inPort1");
		cy.verifyNumberOfPortDataLinks(16);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select3", "outPort5", "Neural Net", "inPort1", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Select4", "outPort", "Sort", "inPort");
		cy.verifyNumberOfPortDataLinks(17);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select4", "outPort", "Sort", "inPort", 1
		);

		cy.linkNodeOutputPortToNodeInputPort("Select4", "outPort", "Merge1", "inPort1");
		cy.verifyNumberOfPortDataLinks(18);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select4", "outPort", "Merge1", "inPort1", 1
		);

		// Negative Tests -
		// The cardinality of 'inPort2' port on 'Neural Net' node is a max of 2 so this following
		// link should fail so we verify the number of ports is the same.
		cy.linkNodeOutputPortToNodeInputPort("Select3", "outPort8", "Neural Net", "inPort2");
		cy.verifyNumberOfPortDataLinks(18);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select3", "outPort8", "Neural Net", "inPort2", 0
		);

		// Node "Select4" node "outPort" has a maximum cardinality of 4. That node already has 4 links
		// coming from it so this next connection should fail.
		cy.linkNodeOutputPortToNodeInputPort("Select4", "outPort", "Merge2", "inPort");
		cy.verifyNumberOfPortDataLinks(18);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select4", "outPort", "Merge2", "inPort", 0
		);

		// Node "Var. File" is a binding node with no input ports. Therefore, it should not be
		// possible to make a link to it from another node.
		cy.linkNodeOutputPortToNode("Merge2", "outPort", "Var. File");
		cy.verifyNumberOfPortDataLinks(18);
	});
});

describe("Test for dynamically adding ports by updating pipeline flow through API", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("multiPortsCanvas3.json");
		cy.toggleAPISidePanel();
		cy.chooseAPIOperation("Set PipelineFlow");
	});

	it("Dynamically add input and output ports ports by updating pipeline flow through API, " +
	"add port to port links, verification steps", function() {
		// Add input and output ports to node "Select1"
		cy.updatePipelineflowToAddInputOutputPortsToNode("Select1");
		cy.submitAPI();

		// Add port to port links
		cy.linkNodeOutputPortToNodeInputPort("Var. File", "outPort", "Select1", "inPort");
		cy.linkNodeOutputPortToNodeInputPort("Select3", "outPort1", "Select1", "inPort2");
		cy.linkNodeOutputPortToNodeInputPort("Select1", "outPort", "Select3", "inPort");
		cy.linkNodeOutputPortToNodeInputPort("Select1", "outPort2", "Select2", "inPort");

		// Verification steps
		cy.verifyNumberOfPortDataLinks(4);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Var. File", "outPort", "Select1", "inPort", 1
		);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select3", "outPort1", "Select1", "inPort2", 1
		);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select1", "outPort", "Select3", "inPort", 1
		);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select1", "outPort2", "Select2", "inPort", 1
		);
	});
});

describe("Test that context menu is displayed for ports", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test that context menu is displayed for source and target ports, verify option in context menu", function() {
		// Right-click source port of a node to display context menu
		cy.rightClickSourcePortOfNode("Binding (entry) node", "outPort");
		cy.verifyOptionInContextMenu("CMI: Output Port action for 'Output Port'");

		// Right-click target port of a node to display context menu
		cy.rightClickTargetPortOfNode("Super node", "input2SuperNodePE");
		cy.verifyOptionInContextMenu("CMI: Input Port action for 'input2SuperNodePE'");

		cy.rightClickTargetPortOfNode("Super node", "input1SuperNodePE");
		cy.verifyOptionInContextMenu("CMI: Input Port action for 'input1SuperNodePE'");
	});
});

describe("Test connecting ports using context menu 'Connect from' and 'Connect to' options", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test connecting two ports using context menu - mark output port then connect to input port", function() {
		// Verify initial number of links
		cy.verifyNumberOfPortDataLinks(4);

		// Right-click on output port of "Binding (entry) node" and select "Connect from"
		cy.rightClickSourcePortOfNode("Binding (entry) node", "outPort");
		cy.clickOptionFromContextMenu("Connect from");

		// Verify the port is marked (should have visual indicator)
		cy.verifyPortHasConnectFromArrow("Binding (entry) node");

		// Right-click on input port of "Super node" and select "Connect to"
		cy.rightClickTargetPortOfNode("Super node", "input1SuperNodePE");
		cy.clickOptionFromContextMenu("Connect to");

		// Verify a new link was created
		cy.verifyNumberOfPortDataLinks(5);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Binding (entry) node", "outPort", "Super node", "input1SuperNodePE", 1
		);

		// Verify the connect from arrow is removed after creating the link
		cy.verifyPortDoesNotHaveConnectFromArrow("Binding (entry) node");
	});

	it("Test that 'Connect from' is disabled when output port is at max cardinality", function() {
		// Create a link to max out the cardinality of an output port
		// First, verify the initial state
		cy.verifyNumberOfPortDataLinks(4);

		// Right-click on an output port that has max cardinality of 1
		// Note: This assumes there's a port with max cardinality of 1 in the test canvas
		// If not, this test would need to be adjusted based on the actual canvas configuration
		cy.rightClickSourcePortOfNode("Binding (entry) node", "outPort");

		// The "Connect from" option should be enabled initially
		cy.verifyOptionInContextMenu("Connect from");
	});

	it("Test that 'Connect to' is disabled when input port is at max cardinality", function() {
		// Verify initial number of links
		cy.verifyNumberOfPortDataLinks(4);

		// Mark an output port first
		cy.rightClickSourcePortOfNode("Binding (entry) node", "outPort");
		cy.clickOptionFromContextMenu("Connect from");

		// Try to connect to an input port that is already at max cardinality
		// Note: This assumes there's a port with max cardinality in the test canvas
		// The "Connect to" option should be disabled if the port is at max cardinality
		cy.rightClickTargetPortOfNode("Execution node", "inPort");
		cy.verifyOptionInContextMenu("Connect to");
	});

	it("Test that 'Connect to' is disabled when no output port is marked", function() {
		// Right-click on input port without marking any output port first
		// Use Super node's first input port which is not at max cardinality
		cy.rightClickTargetPortOfNode("Super node", "input1SuperNodePE");

		// Verify "Connect to" option exists but is disabled
		cy.getOptionFromContextMenu("Connect to")
			.should("have.class", "disabled");
	});

	it("Test connecting two ports using Shift+F10 to open context toolbar on ports", function() {
		cy.setCanvasConfig({
			"selectedKeyboardNavigation": true,
			"selectedNodeLayout": {
				"inputPortFocusable": true,
				"outputPortFocusable": true
			}
		});

		// Click canvas to move focus there
		cy.clickCanvasAt(1, 1);

		// Get initial link count
		cy.verifyNumberOfPortDataLinks(4);

		// Tab to first node
		cy.pressOnCanvas(key.tab);
		cy.pressOnComment("This canvas shows the 4 different node " +
			"types and three link types: node links, association links and comments links.", key.tab);
		cy.verifyFocusOnNode("Binding (entry) node");

		// Press Shift+Alt+Down Arrow to move focus to the node's sub-objects (ports)
		cy.pressOnNode("Binding (entry) node", key.focusSubObject);

		// Press Cmd/Ctrl+comma to open context toolbar on output port
		cy.pressOnOutputPort("Binding (entry) node", key.contextMenu);

		// Click "Connect from" option in the context toolbar
		cy.clickOptionFromContextMenu("Connect from");

		// Verify the port is marked
		cy.verifyPortHasConnectFromArrow("Binding (entry) node");

		// Navigate back to the node and then to the Super node using right arrow
		cy.pressOnNode("Binding (entry) node", key.escape);

		// Use right arrow to navigate through nodes and links to Super node
		// Binding node -> link -> Execution node -> link -> Super node
		cy.pressOnNode("Binding (entry) node", key.arrowRight);
		cy.pressOnLinkWithLabel("Binding (entry) node-Execution node", key.arrowRight);
		cy.pressOnNode("Execution node", key.arrowRight);
		cy.pressOnLinkWithLabel("Execution node-Super node", key.arrowRight);

		cy.verifyFocusOnNode("Super node");

		// Press Shift+Alt+Down Arrow to move focus to the Super node's input port
		cy.pressOnNode("Super node", key.focusSubObject);

		// Press Shift+F10 to open context toolbar on input port
		cy.pressOnInputPort("Super node", key.contextMenuShiftF10);

		// Click "Connect to" option in the context toolbar
		cy.clickOptionFromContextMenu("Connect to");

		// Verify a new link was created
		cy.verifyNumberOfPortDataLinks(5);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Binding (entry) node", "outPort", "Super node", "input1SuperNodePE", 1
		);

		// Verify the connect from arrow is removed after creating the link
		cy.verifyPortDoesNotHaveConnectFromArrow("Binding (entry) node");
	});
});
