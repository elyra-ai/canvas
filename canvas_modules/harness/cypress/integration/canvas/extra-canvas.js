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

describe("Test of extra canvas node operation", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "extraCanvasDisplayed": true });
		cy.inExtraCanvas();
		cy.openCanvasPaletteForExtraCanvas("modelerPalette.json");
		cy.openCanvasDefinitionForExtraCanvas("modelerCanvas.json");
	});

	it("Test dragging a node from palette and deleting a node from extra canvas, verify number of nodes", function() {
		cy.verifyNumberOfNodesInExtraCanvas(8);

		// Drag a node from palette to canvas
		cy.clickToolbarPaletteOpenInExtraCanvas();
		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Filler", 380, 480);
		cy.clickToolbarPaletteCloseInExtraCanvas();
		cy.verifyNumberOfNodesInExtraCanvas(9);

		// Open side panel and drag derive node on canvas
		cy.toggleCommonCanvasSidePanel();
		cy.dragDeriveNodeAtPosition(380, 480);
		cy.toggleCommonCanvasSidePanel();
		cy.verifyNumberOfNodesInExtraCanvas(10);

		// Delete node from extra canvas
		cy.deleteNode("Define Types");
		cy.verifyNumberOfNodesInExtraCanvas(9);

		cy.deleteNode("Derive");
		cy.verifyNumberOfNodesInExtraCanvas(8);

	});
});

describe("Test of extra canvas property edit operation", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "extraCanvasDisplayed": true });
		cy.openCanvasDefinition("commentColorCanvas.json");
		cy.openCanvasPaletteForExtraCanvas("modelerPalette.json");
		cy.openCanvasDefinitionForExtraCanvas("modelerCanvas.json");
	});

	it("Edit the properties of node in extra canvas and regular canvas", function() {
		// Edit properties of node in extra canvas
		cy.inExtraCanvas();
		cy.getNodeForLabel("Define Types").dblclick();
		cy.setTextFieldValue("samplingRatio", 25);
		cy.saveFlyout();
		cy.verifyApplyPropertyChangesEntryInConsole(25);

		// Edit properties of node in regular canvas
		cy.inRegularCanvas();
		cy.getNodeForLabel("C5.0").dblclick();
		cy.setTextFieldValue("samplingRatio", 10);
		cy.saveFlyout();
		cy.verifyApplyPropertyChangesEntryInConsole(10);
	});
});
