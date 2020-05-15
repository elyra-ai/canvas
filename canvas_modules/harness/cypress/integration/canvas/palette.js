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

describe("Sanity test adding nodes into empty canvas", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Flyout" });
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test adding nodes on canvas, search for a node in palette, " +
  "add a node found in search results, verify node doesn't exist in search results", function() {
		// Test adding nodes from palette on canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 300, 200);
		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Derive", 400, 200);

		// Search for a node in Palette Search bar
		cy.findNodeInPalette("sel");

		// Add a node found in search results
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Select", 500, 200);

		// Verify node doesn't exist in search results
		cy.verifyNodeDoesnotExistInPalette("Sample");
	});
});

describe("Sanity test adding node type to palette Flyout Panel", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Flyout" });
		cy.clickToolbarPaletteOpen();
		cy.openCanvasAPI("Add PaletteItem");
	});

	it("Test adding node type to palette Flyout Panel", function() {
		cy.setCategoryId("newCategory");
		cy.setCategoryName("New Category");
		cy.submitAPI();
		cy.verifyNodeIsAddedInPaletteCategory("Custom Node Type", "New Category");
	});
});

describe("Sanity test adding node type to palette Modal Panel", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Modal" });
		cy.clickToolbarPaletteOpen();
		cy.openCanvasAPI("Add PaletteItem");
	});

	it("Test adding node type to palette Modal Panel", function() {
		cy.setCategoryId("newCategory");
		cy.setCategoryName("New Category");
		cy.submitAPI();
		cy.verifyNodeIsAddedInPaletteCategory("Custom Node Type", "New Category");
	});
});

describe("Sanity test adding node type to existing category to palette Flyout Panel", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Flyout" });
		cy.openCanvasPalette("modelerPalette.json");
		cy.clickToolbarPaletteOpen();
		cy.openCanvasAPI("Add PaletteItem");
	});

	it("Test adding node type to existing category to palette Flyout Panel", function() {
		cy.setCategoryId("output");
		cy.submitAPI();
		cy.verifyNodeIsAddedInPaletteCategory("Custom Node Type", "Outputs");
	});
});

describe("Sanity test adding node type to existing category to palette Modal Panel", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Modal" });
		cy.openCanvasPalette("modelerPalette.json");
		cy.clickToolbarPaletteOpen();
		cy.openCanvasAPI("Add PaletteItem");
	});

	it("Test adding node type to existing category to palette Modal Panel", function() {
		cy.setCategoryId("output");
		cy.submitAPI();
		cy.verifyNodeIsAddedInPaletteCategory("Custom Node Type", "Outputs");
	});
});

describe("Test aspect ratio of images is preserved", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "Flyout" });
		cy.openCanvasPalette("animationsPalette.json");
	});

	it("Test aspect ratio of images is preserved", function() {
		// Open Animations category in palette
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Animations");

		// The aspect ratio is preserved when height and width are different.
		cy.verifyNodeImageCSS("Triangle", "width", "28px");
		cy.verifyNodeImageCSS("Triangle", "height", "25.53125px");
	});
});
