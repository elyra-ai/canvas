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

describe("Test to check if tips show up for the palette, nodes, ports and links", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("multiPortsCanvas.json");
	});

	it("Test to check if tips show up for the palette, nodes, ports and links", function() {
		cy.clickToolbarPaletteOpen();

		cy.hoverOverCategory("Import");
		cy.verifyTipForCategory("Import");

		cy.clickCategory("Import");
		cy.hoverOverNodeInCategory("Var. File");
		// cy.verifyTipForNodeInCategory("Var. File");

		cy.moveMouseToCoordinates(300, 100);
		cy.verifyTipDoesNotShowForNodeInCategory("Var. File");

		cy.hoverOverNode("Define Types");
		cy.verifyTipForNodeAtLocation("Define Types", "below");

		cy.moveMouseToCoordinates(300, 100);
		// cy.verifyTipDoesNotShowForNode("Define Types");

		cy.hoverOverInputPortOfNode("Define Types", "inPort2");
		cy.verifyTipForInputPortOfNode("Define Types", "inPort2", "Input Port 2");
	});
});
