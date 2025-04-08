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
/* eslint max-len: "off" */
/* eslint no-undefined: "off" */

describe("Test link can be replaced when selectedLinkReplaceOnNewConnection is switched on", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({
			"selectedSplitLinkDroppedOnNode": true,
			"selectedLinkType": "Straight",
			"selectedLinkMethod": "Freeform" });
		cy.openCanvasDefinition("allTypesCanvas.json");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test a link can be dragged to a node to split the link.", function() {
		// Open the palette and drag a node to be positioned just below
		// the Binding (entry) node and the Execution node.
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Select", 430, 400);

		// Initially there should be 4 node links
		cy.verifyNumberOfPortDataLinks(4);

		cy.dragLinkCenterToPosition("Binding (entry) node-Execution node", 200, 300);

		// After the drag there should be 5 - one has been removed and two new links added
		cy.verifyNumberOfPortDataLinks(5);
	});

	it("Test when a link is NOT dragged to a node the link is NOT split.", function() {
		// Open the palette and drag a node to be positioned just below
		// the Binding (entry) node and the Execution node.
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Select", 430, 400);

		// Initially there should be 4 node links
		cy.verifyNumberOfPortDataLinks(4);

		// Set the xPos so it misses the target node.
		cy.dragLinkCenterToPosition("Binding (entry) node-Execution node", 200, 250);

		// After the drag there should still be 4 links
		//  - because the link wasn't dragged to the node.
		cy.verifyNumberOfPortDataLinks(4);
	});
});
