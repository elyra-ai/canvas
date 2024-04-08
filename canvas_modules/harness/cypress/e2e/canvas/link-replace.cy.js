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
/* eslint max-len: "off" */
/* eslint no-undefined: "off" */

describe("Test link can be replaced when selectedLinkReplaceOnNewConnection is switched on", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedLinkReplaceOnNewConnection": true });
		cy.openCanvasDefinition("cardinalityCanvas.json");
	});

	it("Test a link is replaced when target node's port is 0:1 and maxed out", function() {
		// This link creation should work because Out 0:1 has no link so far
		cy.linkNodeOutputPortToNodeInputPort("Out 0:1", "outPort", "In 0:1", "inPort");
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.wait(10);
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "In 0:1", "inPort", 1);

		// Make a connction to the same 0:1 port that the link previously created
		// connects to. This link creation should work because selectedLinkReplaceOnNewConnection
		// is switched on and the port on Out 0:1 is maxed out with 1 link.
		cy.linkNodeOutputPortToNodeInputPort("Out 0:3", "outPort", "In 0:1", "inPort");
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "In 0:1", "inPort", 1);

		// Check the original link has gone
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "In 0:1", "inPort", 0);

		// Check the undo works. The links are swapped back.
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "In 0:1", "inPort", 0);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "In 0:1", "inPort", 1);

		// Check the redo works. The links are swapped back.
		cy.clickToolbarRedo();
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "In 0:1", "inPort", 1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "In 0:1", "inPort", 0);

	});

	it("Test a link is NOT replaced when target node's port is 0:2 and maxed out", function() {
		// This link creation should work because '0:1 & 0:2' port 'InputPort2' has no link so far
		cy.linkNodeOutputPortToNodeInputPort("Out 0:1", "outPort", "0:1 & 0:2", "InputPort2");
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.wait(10);
		cy.verifyNumberOfPortDataLinks(1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:1", "outPort", "0:1 & 0:2", "InputPort2", 1);

		// This link creation should work because '0:1 & 0:2' port 'InputPort2' has only one link so far
		cy.linkNodeOutputPortToNodeInputPort("Out 0:3", "outPort", "0:1 & 0:2", "InputPort2");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Out 0:3", "outPort", "0:1 & 0:2", "InputPort2", 1);

		// This connection should fail.
		// Trying to make a connection to node '0:1 & 0:2' port 'InputPort2' should
		// fail because, even though the target port is maxed out with two
		// connections and selectedLinkReplaceOnNewConnection is switched on,
		// a replacement is not allowed. It is only allowed when the target input
		// port has 0:1 cardinality
		cy.linkNodeOutputPortToNodeInputPort("0:1 & 0:-1", "outPort1", "0:1 & 0:2", "InputPort2");
		cy.verifyNumberOfPortDataLinks(2);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"0:1 & 0:-1", "outPort1", "0:1 & 0:2", "InputPort2", 0);
	});
});

describe("Test replacing link after loading an old style canvas document when selectedLinkReplaceOnNewConnection is switched on", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedLinkReplaceOnNewConnection": true });
		cy.openCanvasDefinition("x-commentColorCanvas.json");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test a link is replaced when target node's port is 0:1 and maxed out", function() {
		// Open the palette and drag a node to be over the link between the
		// Binding entry node and the Execution node.
		// This should insert the 'Select' node into the link.
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Select", 380, 500);

		// Chck there are five node to node data link
		cy.verifyNumberOfPortDataLinks(5);

		// Make a conneciton from the Select node to the Na_to_K node. This should
		// replace the link from DRUG1n to Na_to_K.
		cy.linkNodeOutputPortToNodeInputPort("Select", "outPort", "Na_to_K", "inPort");

		// We should still have the same number of links.
		cy.verifyNumberOfPortDataLinks(5);

		// Check the new link exists
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select", "outPort", "Na_to_K", "inPort", 1);

		// Check the old link has gone
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"DRUG1n", "outPort", "Na_to_K", "inPort", 0);

		// Check the undo works. The links are swapped back.
		cy.clickToolbarUndo();
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select", "outPort", "Na_to_K", "inPort", 0);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"DRUG1n", "outPort", "Na_to_K", "inPort", 1);

		// Check the undo works. The links are swapped back.
		cy.clickToolbarRedo();
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"Select", "outPort", "Na_to_K", "inPort", 1);
		cy.verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort(
			"DRUG1n", "outPort", "Na_to_K", "inPort", 0);
	});
});
