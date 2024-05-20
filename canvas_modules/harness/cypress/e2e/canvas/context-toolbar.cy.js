/*
 * Copyright 2024 Elyra Authors
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

describe("Test of context toolbar", function() {
	beforeEach(() => {
		cy.viewport(1400, 650);
		cy.visit("/");
		cy.setCanvasConfig({ "selectedContextToolbar": true });
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test context toolbar appears for a comment and node", function() {
		// Test the context toolbar appears OK for a comment
		cy.hoverOverComment(" comment 1");
		cy.verifyContextToolbarPosition("163px", "69px");

		// The comment should have two non-overflow toolbar items.
		cy.verifyContextToolbarNonOverflowItems(2);

		// Test the context toolbar appears OK for a node
		cy.hoverOverNode("DRUG1n");
		cy.verifyContextToolbarPosition("99px", "185px");

		// The node should have one non-overflow toolbar item.
		cy.verifyContextToolbarNonOverflowItems(1);
	});

	it("Test click on context toolbar button works OK", function() {
		// Make the context toolbar appears for a node
		cy.hoverOverNode("DRUG1n");

		// See if click on Delete button works.
		cy.verifyNumberOfNodes(6);
		cy.clickContextToolbarButton("deleteSelectedObjects");
		cy.verifyNumberOfNodes(5);
	});

	it("Test click on context toolbar overflow menu works OK", function() {
		cy.hoverOverNode("DRUG1n");

		// Open the overflow menu
		cy.clickContextToolbarOverflowButton();

		// See if we can click the disonnect option in the overflow menu
		cy.verifyNumberOfLinks(8);
		cy.clickOptionFromContextToolbarOverflow("Disconnect");
		cy.verifyNumberOfLinks(7);
	});

	it("Test moving mouse cursor away from canvas context toolbar removes the toolbar", function() {
		// Right click on the canvas should display the canvas context toolbar
		cy.rightClickToDisplayContextMenu(380, 100);
		cy.verifyContextToolbarPosition("348px", "66px");

		// Move the mouse away from the context menu which should make it disappear
		cy.moveOutOfContextToolbar(380, 150);

		// Check to make sure context toolbar has been removed.
		cy.verifyContextToolbarNotVisible();
	});
});
