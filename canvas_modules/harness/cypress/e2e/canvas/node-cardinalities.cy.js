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

describe("Test adding links to target nodes with maxed out cardinalities", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("cardinalityCanvas.json");
	});

	it("Test a maxed out target node doesn't accept a new connection", function() {
		cy.linkNodeOutputPortToNodeInputPort("Out 0:1", "outPort", "In 0:1", "inPort");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "In 0:1", "inPort", 1);

		// This link creation should fail because In 0:1 already has a link
		cy.linkNodeOutputPortToNodeInputPort("Out 0:3", "outPort", "In 0:1", "inPort");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "In 0:1", "inPort", 0);
	});

	it("Test a maxed out target node second port doesn't accept a new connection", function() {
		cy.linkNodeOutputPortToNodeInputPort("Out 0:1", "outPort", "0:1 & 0:2", "InputPort2");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "0:1 & 0:2", "InputPort2", 1);

		// This should create the link because InputPort2 can accept 2 input links
		cy.linkNodeOutputPortToNodeInputPort("Out 0:3", "outPort", "0:1 & 0:2", "InputPort2");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort2", 1);

		// This should fail because InputPort2 already has 2 input links
		cy.linkNodeOutputPortToNodeInputPort("0:1 & 0:-1", "outPort2", "0:1 & 0:2", "InputPort2");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"0:1 & 0:-1", "outPort2", "0:1 & 0:2", "InputPort2", 0);

	});

	it("Test a maxed out target node all ports don't accept a new connection", function() {
		// This should create the link because inPort1 can accept an input links
		cy.linkNodeOutputPortToNodeInputPort("Out 0:1", "outPort", "All 0:1", "inPort1");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "All 0:1", "inPort1", 1);

		// This should create the link because inPort2 can accept an input links
		cy.linkNodeOutputPortToNodeInputPort("Out 0:3", "outPort", "All 0:1", "inPort2");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "All 0:1", "inPort2", 1);

		// This should create the link because inPort3 can accept an input links
		cy.linkNodeOutputPortToNodeInputPort("0:1 & 0:-1", "outPort1", "All 0:1", "inPort3");
		cy.verifyNumberOfPortDataLinks(3);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"0:1 & 0:-1", "outPort1", "All 0:1", "inPort3", 1);

		// This should fail because inPort1 already has a link
		cy.linkNodeOutputPortToNodeInputPort("0:1 & 0:-1", "outPort2", "All 0:1", "inPort1");
		cy.verifyNumberOfPortDataLinks(3);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"0:1 & 0:-1", "outPort2", "All 0:1", "inPort1", 0);

		// This should fail because inPort2 already has a link
		cy.linkNodeOutputPortToNodeInputPort("0:1 & 0:-1", "outPort2", "All 0:1", "inPort2");
		cy.verifyNumberOfPortDataLinks(3);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"0:1 & 0:-1", "outPort2", "All 0:1", "inPort2", 0);

		// This should fail because inPort1 already has a link
		cy.linkNodeOutputPortToNodeInputPort("0:1 & 0:-1", "outPort2", "All 0:1", "inPort3");
		cy.verifyNumberOfPortDataLinks(3);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"0:1 & 0:-1", "outPort2", "All 0:1", "inPort3", 0);

		// This should create the link because inPort4 can accept an input links
		cy.linkNodeOutputPortToNodeInputPort("0:1 & 0:-1", "outPort2", "All 0:1", "inPort4");
		cy.verifyNumberOfPortDataLinks(4);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"0:1 & 0:-1", "outPort2", "All 0:1", "inPort4", 1);
	});

	it("Test a maxed out target node doesn't accept a new connection when link dropped on node body", function() {
		// This should create the link because inPort4 can accept an input links
		cy.linkNodeOutputPortToNode("Out 0:1", "outPort", "In 0:1");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "In 0:1", "inPort", 1);

		// This should fail because the port on the target node is maxed out
		cy.linkNodeOutputPortToNode("Out 0:3", "outPort", "In 0:1");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "In 0:1", "inPort", 0);

		// This should also fail because we are connecting to the default port that is maxed out
		cy.linkNodeOutputPortToNodeInputPort("0:1 & 0:-1", "outPort2", "In 0:1", "inPort");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"0:1 & 0:-1", "outPort2", "In 0:1", "inPort", 0);
	});

	it("Test a maxed out target node doesn't accept a new connection when link dropped on node body", function() {
		// This should create the link and default it to the first input port
		cy.linkNodeOutputPortToNode("Out 0:1", "outPort", "0:1 & 0:2");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "0:1 & 0:2", "InputPort1", 1);

		// This should fail because the link should default to the first port which is maxed out
		cy.linkNodeOutputPortToNode("Out 0:3", "outPort", "0:1 & 0:2");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort1", 0);

		// This should create the link because InputPort2 does not have any input links
		cy.linkNodeOutputPortToNodeInputPort("Out 0:3", "outPort", "0:1 & 0:2", "InputPort2");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort2", 1);
	});

	it("Test a target node port with maximum cardinality of 0 doesn't accept a new connection", function() {
		// This should create the link and default it to the first input port
		cy.linkNodeOutputPortToNode("Out 0:1", "outPort", "In 0:0");
		cy.verifyNumberOfPortDataLinks(0);
	});
});

describe("Test adding links from source nodes with maxed out cardinalities", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("cardinalityCanvas.json");
	});

	it("Test a maxed out source node single port 0:1 cannot create a new connection", function() {
		cy.linkNodeOutputPortToNodeInputPort("Out 0:1", "outPort", "In 0:1", "inPort");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "In 0:1", "inPort", 1);

		// This link creation should fail because In 0:1 already has a link
		cy.linkNodeOutputPortToNodeInputPort("Out 0:1", "outPort", "0:1 & 0:2", "InputPort2");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "0:1 & 0:2", "InputPort2", 0);
	});

	it("Test a maxed out source node single port 0:3 cannot create a new connection", function() {
		// This link creation should work because Out 0:3 doesn't have any links
		cy.linkNodeOutputPortToNodeInputPort("Out 0:3", "outPort", "In 0:1", "inPort");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "In 0:1", "inPort", 1);

		// This link creation should work because Out 0:3 only has one link
		cy.linkNodeOutputPortToNodeInputPort("Out 0:3", "outPort", "0:1 & 0:2", "InputPort2");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort2", 1);

		// This link creation should work because Out 0:3 only has two links
		cy.linkNodeOutputPortToNodeInputPort("Out 0:3", "outPort", "All 0:1", "inPort2");
		cy.verifyNumberOfPortDataLinks(3);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "All 0:1", "inPort2", 1);

		// This link creation should fail because Out 0:3 is maxed out with 3 links
		cy.linkNodeOutputPortToNodeInputPort("Out 0:3", "outPort", "All 0:1", "inPort4");
		cy.verifyNumberOfPortDataLinks(3);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "All 0:1", "inPort4", 0);
	});

	it("Test a source node output port with maximum cardinality of 0 cannot create a new connection", function() {
		// This should create the link and default it to the first input port
		cy.linkNodeOutputPortToNode("Out 0:0", "outPort", "All 0:1", "inPort1");
		cy.verifyNumberOfPortDataLinks(0);
	});
});

describe("Test moving links with handles rejects links to target nodes with maxed out cardinalities", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedLinkSelection": "Detachable" });
		cy.openCanvasDefinition("cardinalityCanvas.json");

		// Start each test with two existing links

		// This link creation should work because Out 0:1 has no link so far
		cy.linkNodeOutputPortToNodeInputPort("Out 0:1", "outPort", "In 0:1", "inPort");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "In 0:1", "inPort", 1);

		// This link creation should work because Out 0:1 has no link so far
		cy.linkNodeOutputPortToNodeInputPort("Out 0:3", "outPort", "0:1 & 0:2", "InputPort1");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort1", 1);
	});

	it("Test a maxed out target node single port 0:1 cannot accept a moved connection", function() {
		// This link creation should fail because Out 0:1 is maxed out with 1 link
		cy.moveLinkHandleToPort(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort1", "endHandle", "In 0:1", "inPort");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "In 0:1", "inPort", 0);
	});

	it("Test an end handle of a link can be dragged onto the input port of a target node", function() {
		// This link creation should work because All 0:1 default port inPort1 has zero links
		cy.moveLinkHandleToPort(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort1", "endHandle", "All 0:1", "inPort1");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "All 0:1", "inPort1", 1);
	});

	it("Test a maxed out target node single port 0:1 cannot accept a connection dropped on node body", function() {
		// This link creation should fail because node 'In 0:1' default port
		// 'inPort' is maxed out with 1 link
		cy.moveLinkHandleToNode(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort1", "endHandle", "In 0:1");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "In 0:1", "inPort", 0);
	});

	it("Test an end handle of a link can be dragged onto a node body and it defaults to the first port", function() {
		// This link creation should work because dropping the end handle of the
		// link onto 'All 0:1' will default to the first port: 'inPort1' which is
		// OK to connect to because it doesn't have any links going to it.
		cy.moveLinkHandleToNode(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort1", "endHandle", "All 0:1");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "All 0:1", "inPort1", 1);
	});

	it("Test a maxed out source node single port 0:1 cannot accept a moved connection", function() {
		// This link creation should fail because Out 0:1 is maxed out with 1 link
		cy.moveLinkHandleToPort(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort1", "startHandle", "Out 0:1", "outPort");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "Out 0:1", "outPort", 0);
	});

	it("Test a start handle of a link can be dragged onto the output port of a source node", function() {
		// This link creation should work because dropping the startHandle on the
		// source node "0:1 & 0:-1" because its port outPort1 has no links to it.
		cy.moveLinkHandleToPort(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort1", "startHandle", "0:1 & 0:-1", "outPort1");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"0:1 & 0:-1", "outPort1", "0:1 & 0:2", "InputPort1", 1);
	});

	it("Test a maxed out source node single port 0:1 cannot accept a connection dropped on node body", function() {
		// This link creation should fail because Out 0:1 is maxed out with 1 link
		cy.moveLinkHandleToNode(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort1", "startHandle", "Out 0:1");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "0:1 & 0:2", "InputPort1", 0);
	});

	it("Test a start handle of a link can be dragged onto a node body and it defaults to the first port", function() {
		// This link creation should work because dropping the start handle of the
		// link onto '0:1 & 0:-1' will default to the first port: 'outPort1' which is
		// OK to connect to because it doesn't have any links coming from it.
		cy.moveLinkHandleToNode(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort1", "startHandle", "0:1 & 0:-1");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"0:1 & 0:-1", "outPort1", "0:1 & 0:2", "InputPort1", 1);
	});
});
