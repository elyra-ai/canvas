/*
 * Copyright 2025 Elyra Authors
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

describe("Test node operations when enableDragWithoutSelect is true", function() {
	beforeEach(() => {
		cy.viewport(1400, 650);
		cy.visit("/");
		cy.setCanvasConfig({
			"selectedDragWithoutSelect": true,
			"selectedKeyboardNavigation": true,
			"selectedResizableNodes": true,
		});
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it.only("Test a node can be added to the set of selected nodes", function() {
		cy.getNodeWithLabel("Super node").click();
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);

		cy.ctrlOrCmdClickNode("Binding (entry) node");
		cy.verifyNumberOfSelectedObjects(2);
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNodeIsSelected("Binding (entry) node");
	});

	it("Test a range of nodes can be selected", function() {
		cy.getNodeWithLabel("Binding (entry) node").click();
		cy.verifyNodeIsSelected("Binding (entry) node");
		cy.verifyNumberOfSelectedObjects(1);

		cy.shiftClickNode("Binding (exit) node");
		cy.verifyNumberOfSelectedObjects(4);
	});

	it("Test a node can be dragged while another node remains selected", function() {
		cy.getNodeWithLabel("Super node").click();
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);

		cy.moveNodeToPosition("Binding (entry) node", 100, 350);
		cy.verifyNodeTransform("Binding (entry) node", 100, 349.5);

		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);
	});

	it("Test a node can be moved with the keyboard while another node remains selected", function() {
		// Put focus on the Super node
		cy.getNodeWithLabel("Super node").click();
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);

		// Move node down with keyboard
		cy.pressOnNode("Binding (entry) node", key.cmndDownArrow);
		cy.pressOnNode("Binding (entry) node", key.cmndDownArrow);
		cy.pressOnNode("Binding (entry) node", key.cmndDownArrow);
		cy.pressOnNode("Binding (entry) node", key.cmndDownArrow);
		cy.verifyNodeTransform("Binding (entry) node", 89, 140);

		// Make sure only the Super node is selected after the operation
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);
	});

	it("Test a node can be sized with the keyboard while another node remains selected", function() {
		// Put focus on the Super node
		cy.getNodeWithLabel("Super node").click();
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);

		// Size node downwards with keyboard
		cy.pressOnNode("Binding (entry) node", key.shiftDownArrow);
		cy.pressOnNode("Binding (entry) node", key.shiftDownArrow);
		cy.pressOnNode("Binding (entry) node", key.shiftDownArrow);
		cy.pressOnNode("Binding (entry) node", key.shiftDownArrow);
		cy.verifyNodeDimensions("Binding (entry) node", 70, 115);

		// Make sure only the Super node is selected after the operation
		cy.verifyNodeIsSelected("Super node");
		cy.verifyNumberOfSelectedObjects(1);
	});

});

