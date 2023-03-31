/*
 * Copyright 2017-2022 Elyra Authors
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

describe("Test if tips show up for the summary table values", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.selectPropertiesContainerType("Flyout");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.openPropertyDefinition("summaryPanel_paramDef.json");
	});

	it("Test if tips show up for the summary table values", function() {
		cy.hoverOverTextInSummaryPanel("people in generation X ", "Values");
		cy.verifyTipWithTextInSummaryPanel("people in generation X ", "Values", "visible");
		cy.moveMouseToCoordinates(300, 100);
		// cy.verifyTipWithTextInSummaryPanel("people in generation X ", "Values", "hidden");
	});
});

describe("Test if tips show up for summary validation icon when there is an error or warning", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.selectPropertiesContainerType("Flyout");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.openPropertyDefinition("summaryPanel_paramDef.json");
	});

	it("Test if tips show up for summary validation icon when there is an error or warning", function() {
		// Select an existing row in the table and delete it's value.
		cy.openSubPanel("Configure Derive Node");
		cy.selectRowInTable(1, "expressionCellTable");
		cy.clickButtonInTable("Delete", "expressionCellTable");
		cy.selectRowInTable(1, "expressionCellTable");
		cy.clickButtonInTable("Delete", "expressionCellTable");

		// Select all rows in a table and delete its value
		cy.selectAllRowsInTable("structurelisteditorTableInput");
		cy.clickButtonInTable("Delete", "structurelisteditorTableInput");
		cy.saveWideFlyout("Configure Derive Node");

		cy.hoverOverValidationIconInSummaryPanel("Derive-Node");
		cy.verifyTipForValidationIconInSummaryPanel(
			"Derive-Node", "There are 1 parameters with errors and 1 parameters with warnings."
		);
	});
});

describe("Test if tips show up for textfields in tables when there is overflow", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.selectPropertiesContainerType("Flyout");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.openPropertyDefinition("textfield_paramDef.json");
	});

	it("Test if tips show up for the textfields with ellipsis", function() {
		cy.toggleCategory("Table");
		cy.openSubPanel("Edit textfield table");
		cy.hoverOverControl("string_table_0_0");
		// TODO verify tooltip with correct tip shows up
		cy.hoverOverControl("string_table_0_1");
		// TODO verify no tooltip shows up
		cy.saveWideFlyout("Edit textfield table");
		// cy.moveMouseToCoordinates(300, 100);
	});
});

describe("Test if tips show up in table headers correctly", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.selectPropertiesContainerType("Flyout");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.openPropertyDefinition("Conditions_paramDef.json");
	});

	it("Test if tips show when simple header has ellipsis", function() {
		cy.moveMouseToCoordinates(300, 100);
	});
	it("Test if tips show when checkbox in header has ellipsis", function() {
		cy.moveMouseToCoordinates(300, 100);
	});
});
