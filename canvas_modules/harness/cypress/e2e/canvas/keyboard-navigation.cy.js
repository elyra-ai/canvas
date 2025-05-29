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

describe("Test keyboard navigation", function() {
	beforeEach(() => {
		cy.viewport(1400, 650);
		cy.visit("/");
		cy.setCanvasConfig({
			"selectedKeyboardNavigation": true,
			"selectedResizableNodes": true
		});
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test tab through groups", function() {
		// Click canvas to move focus there
		cy.clickCanvasAt(1, 1);

		cy.verifyFocusOnCanvas();
		cy.pressOnCanvas(key.tab);

		cy.verifyFocusOnComment("This canvas shows the 4 different node " +
			"types and three link types: node links, association links and comments links.");
		cy.pressOnComment("This canvas shows the 4 different node " +
			"types and three link types: node links, association links and comments links.", key.tab);

		cy.verifyFocusOnNode("Binding (entry) node");

		// Pressing enter on node should select it
		cy.pressOnNode("Binding (entry) node", key.objectSelect);
		cy.verifyNodeIsSelected("Binding (entry) node");

		// Pressing enter on node should issue a double click which will open the right-flyout
		cy.pressOnNode("Binding (entry) node", key.objectSelect);
		cy.verifyRightFlyoutPanelWidth(320);
	});

	it("Test a node can be moved with the keyboard.", function() {
		// Put focus on node
		cy.getNodeWithLabel("Binding (entry) node").click();

		// Check original transform of node
		cy.verifyNodeTransform("Binding (entry) node", 89, 100);

		// Move node down with keyboard
		cy.pressOnNode("Binding (entry) node", key.moveObjectDown);
		cy.pressOnNode("Binding (entry) node", key.moveObjectDown);
		cy.pressOnNode("Binding (entry) node", key.moveObjectDown);
		cy.pressOnNode("Binding (entry) node", key.moveObjectDown);
		cy.verifyNodeTransform("Binding (entry) node", 89, 140);

		// Wait for the save of the movement to be completed
		// before checking the focus is still on the node.
		cy.wait(200);
		cy.verifyFocusOnNode("Binding (entry) node");
	});

	it("Test a node can be sized with the keyboard.", function() {
		// Put focus on node
		cy.getNodeWithLabel("Binding (entry) node").click();

		// Check original size of node
		cy.verifyNodeDimensions("Binding (entry) node", 70, 75);

		// Size node downwards with keyboard
		cy.pressOnNode("Binding (entry) node", key.sizeObjectDown);
		cy.pressOnNode("Binding (entry) node", key.sizeObjectDown);
		cy.pressOnNode("Binding (entry) node", key.sizeObjectDown);
		cy.pressOnNode("Binding (entry) node", key.sizeObjectDown);
		cy.verifyNodeDimensions("Binding (entry) node", 70, 115);

		// Wait for the save of the sizing to be completed
		// before checking the focus is still on the node.
		cy.wait(200);
		cy.verifyFocusOnNode("Binding (entry) node");
	});

	it("Test simulating various clicks on a node with keyboard results in appropriate 'click types'.", function() {
		// Move focus from canvas -> comment -> node
		cy.clickCanvasAt(1, 1);
		cy.pressOnCanvas(key.tab);
		cy.pressOnComment("This canvas shows the 4 different node " +
			"types and three link types: node links, association links and comments links.", key.tab);

		// Simuate a click on node with the keyboard
		cy.pressOnNode("Binding (entry) node", key.objectSelect);

		// Verify it simulated a SINGLE_CLICK
		cy.verifyClickActionInConsole("clickType", "SINGLE_CLICK");

		// Simuate another click on the currently selected node with the keyboard
		cy.pressOnNode("Binding (entry) node", key.objectSelect);

		// Verify it simulated a DOUBLE_CLICK
		cy.verifyClickActionInConsole("clickType", "DOUBLE_CLICK");

		// Simulate a right click on node with the keyboard
		cy.pressOnNode("Binding (entry) node", key.contextMenu);

		// Verify it simulated a SINGLE_CLICK_CONTEXTMENU
		cy.verifyClickActionInConsole("clickType", "SINGLE_CLICK_CONTEXTMENU");
	});

	it("Test simulating a pan with keyboard results in appropriate pan amount.", function() {
		cy.clickCanvasAt(1, 1);

		// Verify initial zoom amount
		cy.verifyZoomTransform(0, 0, 1);

		// Simulate panning the canvas to the right.
		cy.pressOnCanvas(key.panRight);
		cy.pressOnCanvas(key.panRight);

		// Verify the new zoom amount
		cy.verifyZoomTransform(20, 0, 1);

		// Simulate panning the canvas down.
		cy.pressOnCanvas(key.panDown);
		cy.pressOnCanvas(key.panDown);
		cy.pressOnCanvas(key.panDown);
		cy.pressOnCanvas(key.panDown);

		// Verify the new zoom amount
		cy.verifyZoomTransform(20, 40, 1);
	});

	it("Test simulating a zoom, with keyboard, results in appropriate zoom amount.", function() {
		cy.clickCanvasAt(1, 1);

		// Verify initial zoom amount
		cy.verifyZoomTransform(0, 0, 1);

		// Simulate zooming the canvas out.
		cy.pressOnCanvas(key.zoomOut);
		cy.pressOnCanvas(key.zoomOut);

		// Verify the new zoom amount
		cy.verifyZoomTransform(115, 48, 0.83);

		// Simulate zooming the canvas in.
		cy.pressOnCanvas(key.zoomIn);
		cy.pressOnCanvas(key.zoomIn);
		cy.pressOnCanvas(key.zoomIn);

		// Verify the new zoom amount
		cy.verifyZoomTransform(-66, -28, 1.1);

		// Simulate a zoom to fit
		cy.pressOnCanvas(key.zoomToFit);

		// Verify the new zoom amount
		cy.verifyZoomTransform(238, 43, 1);
	});
});
