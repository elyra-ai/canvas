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

describe("Test of context menu", function() {
	beforeEach(() => {
		cy.viewport(1400, 650);
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test context menu options and verify position of context menu when clicked at different locations", function() {
		// Test the context menu appears OK in the middle of the canvas
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.verifyContextMenuPosition("800px", "25px");

		// Test the context menu has some of the expected entries
		cy.verifyOptionInContextMenu("New comment");
		cy.verifyOptionInContextMenu("Undo");

		// Test the node context menu has an enabled Edit menu
		cy.getNodeWithLabel("DRUG1n").rightclick();
		cy.clickOptionFromContextSubmenu("Edit", "Copy");

		// Test the context menu is pushed to the left when user clicks near right side of the page
		cy.rightClickToDisplayContextMenu(1300, 100);
		cy.verifyContextMenuPosition("1140px", "100px");

		// Test the context menu is pushed upwards when user clicks near bottom of the page
		cy.rightClickToDisplayContextMenu(1000, 500);
		cy.verifyContextMenuPosition("1000px", "340px");

		// Test the context menu is pushed to the left correctly even when the palette is open
		cy.clickCanvasAt(1, 1);
		cy.clickToolbarPaletteOpen();
		cy.rightClickToDisplayContextMenu(940, 300);
		cy.verifyContextMenuPosition("940px", "300px");

		// Test the context menu is pushed to the left correctly when the palette is open AND the right flyout is open
		cy.clickCanvasAt(1, 1);
		cy.getNodeWithLabel("Na_to_K").dblclick();
		cy.rightClickToDisplayContextMenu(640, 300);
		cy.verifyContextMenuPosition("640px", "300px");

		// Test the context menu's 'Highlight' submenu is pushed up in a situation
		// where it would appear off the bottom of the screen
		// To do this, use zoom to fit to get a node near the bottom of the screen
		cy.clickToolbarZoomToFit();
		cy.getNodeWithLabel("Neural Net").rightclick();
		cy.clickOptionFromContextMenu("Highlight");
		cy.verifySubmenuPushedUpBy("91px");

		// Test that, when a set of objects are selected, a click opening the context menu will not clear the selections
		cy.clickCanvasAt(1, 1); // To close context menu
		cy.clickCanvasAt(1, 1); // To remove selection on Neural Net node
		cy.ctrlOrCmdClickNode("C5.0");
		cy.ctrlOrCmdClickNode("Neural Net");
		cy.ctrlOrCmdClickNode("Define Types");
		cy.verifyNumberOfSelectedObjects(3);
		cy.rightClickToDisplayContextMenu(1000, 300);
		cy.verifyNumberOfSelectedObjects(3);
		cy.clickCanvasAt(1, 1); // Context menu is closed on localhost but not on travis build
		cy.verifyNumberOfSelectedObjects(3);
		cy.clickCanvasAt(1, 1);
		// TODO: This assertion fails on travis build because context menu is open
		cy.verifyNumberOfSelectedObjects(0);
	});

	it("Test selecting multiple objects, and click anywhere on canvas should clear the selections", function() {
		cy.ctrlOrCmdClickNode("C5.0");
		cy.ctrlOrCmdClickNode("Neural Net");
		cy.ctrlOrCmdClickNode("Define Types");
		cy.verifyNumberOfSelectedObjects(3);
		cy.clickCanvasAt(1, 1);
		cy.verifyNumberOfSelectedObjects(0);
	});

	it("Test context menu position is moved correctly with bottom panl open", function() {
		cy.setCanvasConfig({ "selectedShowBottomPanel": true });

		// Test the context menu postion is moved correctly
		cy.rightClickToDisplayContextMenu(800, 140);
		cy.verifyContextMenuPosition("800px", "0px");
	});
});
