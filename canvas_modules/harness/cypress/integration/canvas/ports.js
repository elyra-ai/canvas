/*
 * Copyright 2017-2022 Elyra Authors
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
		cy.openCanvasAPI("Set PipelineFlow");
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
