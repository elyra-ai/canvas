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
describe("Test context menu actions for the canvas background", function() {
	beforeEach(() => {
		cy.visit("/");
	});

	it("When there are no objects on the canvas, check that Select All and Deselect All are not present", function() {
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.verifyOptionNotInContextMenu("Select all");
		cy.verifyOptionNotInContextMenu("Deselect all");
	});

	it("When no objects are selected check that Select All is present and Deselect All is not", function() {
		cy.openCanvasDefinition("allTypesCanvas.json");

		// Now 'Select All' should be in the menu but not 'Deselect All'
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.verifyOptionInContextMenu("Select all");
		cy.verifyOptionNotInContextMenu("Deselect all");
	});

	it("When one or more objects are selected check that Select All is present and Deselect All is also", function() {
		cy.openCanvasDefinition("allTypesCanvas.json");

		cy.getNodeWithLabel("Execution node").click();
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.verifyOptionInContextMenu("Select all");
		cy.verifyOptionInContextMenu("Deselect all");
	});

	it("When all objects are selected check that Deselect All is present and Select All is not", function() {
		cy.openCanvasDefinition("allTypesCanvas.json");

		// Select all the canvas objects
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.clickOptionFromContextMenu("Select all");

		// Now 'Deselect All' should be in the menu but not 'Select All'
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.verifyOptionNotInContextMenu("Select all");
		cy.verifyOptionInContextMenu("Deselect all");
	});

	it("Check when Select all and Deselect All are clicked the correct number of objects are selected", function() {
		cy.openCanvasDefinition("allTypesCanvas.json");

		// Select all the canvas objects and seven should be selected
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.clickOptionFromContextMenu("Select all");
		cy.verifyNumberOfSelectedObjects(7);

		// Deselect all the canvas objects and none should be selected
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.clickOptionFromContextMenu("Deselect all");
		cy.verifyNumberOfSelectedObjects(0);

		// Start by clicking one object then after 'Deselect All' none should selected
		cy.getNodeWithLabel("Execution node").click();
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.clickOptionFromContextMenu("Deselect all");
		cy.verifyNumberOfSelectedObjects(0);

		// Start by clicking one object then after 'Select All' none should be selected
		cy.getNodeWithLabel("Execution node").click();
		cy.rightClickToDisplayContextMenu(800, 25);
		cy.clickOptionFromContextMenu("Select all");
		cy.verifyNumberOfSelectedObjects(7);
	});
});
