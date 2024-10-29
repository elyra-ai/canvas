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

// describe("Test if tips show up for the summary table values", function() {
// 	beforeEach(() => {
// 		cy.visit("/");
// 		cy.toggleCommonPropertiesSidePanel();
// 		cy.selectPropertiesContainerType("Flyout");
// 		cy.toggleCommonPropertiesSidePanel();
// 		cy.openPropertyDefinition("summaryPanel_paramDef.json");
// 	});

// 	it("Test if tips show up for the summary table values", function() {
// 		cy.hoverOverTextInSummaryPanel("people in generation X ", "Values");
// 		cy.getSummaryFromName("Values")
// 			.then((summary) => {
// 				cy.verifyTip(summary, "visible", "people in generation X ", "bottom");
// 			});
// 		cy.moveMouseToCoordinates(300, 100);
// 		// cy.verifyTipWithTextInSummaryPanel("people in generation X ", "Values", "hidden");
// 	});
// });

describe("Test if tips show up for summary validation icon when there is an error or warning", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.toggleCommonPropertiesSidePanel();
		cy.selectPropertiesContainerType("Flyout");
		cy.toggleCommonPropertiesSidePanel();
		cy.openPropertyDefinition("summaryPanel_paramDef.json");
	});

	it("Test if tips show up for summary validation icon when there is an error or warning", function() {
		// Select an existing row in the table and delete it's value.
		cy.openSubPanel("Configure Derive Node");
		cy.selectRowInTable(1, "expressionCellTable");
		cy.clickButtonInSingleSelectTable("Delete", "expressionCellTable");
		cy.selectRowInTable(1, "expressionCellTable");
		cy.clickButtonInSingleSelectTable("Delete", "expressionCellTable");

		// Select all rows in a table and delete its value
		cy.selectAllRowsInTable("structurelisteditorTableInput");
		cy.clickButtonInTable("Delete", "structurelisteditorTableInput");
		cy.saveWideFlyout("Configure Derive Node");

		cy.hoverOverValidationIconInSummaryPanel("Derive-Node");
		cy.findValidationIconInSummaryPanel("Derive-Node")
			.then((validationIcon) => {
				cy.verifyTip(validationIcon, "visible",
					"There are 1 parameters with errors and 1 parameters with warnings.", "bottom");
			});
	});
});

// describe("Test if tips show up for textfields in tables when there is overflow", function() {
// 	beforeEach(() => {
// 		cy.visit("/");
// 		cy.toggleCommonPropertiesSidePanel();
// 		cy.selectPropertiesContainerType("Flyout");
// 		cy.toggleCommonPropertiesSidePanel();
// 		cy.openPropertyDefinition("textfield_paramDef.json");
// 	});

// 	it("Test if tips show up for the textfields with ellipsis", function() {
// 		cy.toggleCategory("Table");
// 		cy.openSubPanel("Edit textfield table");
// 		cy.hoverOverControl("string_table_0_1");
// 		cy.verifyTip(null, "hidden", "Turing");
// 		cy.verifyTip(null, "hidden", "Hopper123456");
// 		cy.hoverOverControl("string_table_0_0");
// 		cy.verifyTip(null, "visible", "Hopper123456");
// 		cy.saveWideFlyout("Edit textfield table");
// 	});
// });

// describe("Test if tips show up in table headers correctly", function() {
// 	beforeEach(() => {
// 		cy.visit("/");
// 		cy.toggleCommonPropertiesSidePanel();
// 		cy.selectPropertiesContainerType("Flyout");
// 		cy.toggleCommonPropertiesSidePanel();
// 		cy.openPropertyDefinition("Conditions_paramDef.json");
// 	});

// 	it("Test if tips show when simple header has ellipsis", function() {
// 		cy.toggleCategory("Table");
// 		cy.openSubPanel("Configure Rename fields");
// 		cy.get(".properties-wf-children div[data-id='properties-vt-header-field']")
// 			.trigger("mouseover");
// 		cy.verifyTip(null, "hidden", "Input name");
// 		cy.get(".properties-wf-children div[data-id='properties-vt-header-new_name']")
// 			.trigger("mouseover");
// 		cy.verifyTip(null, "visible", "Output name");
// 		cy.saveWideFlyout("Configure Rename fields");
// 	});

// 	it("Test if tips show when checkbox in header has ellipsis", function() {
// 		cy.toggleCategory("More Tables");
// 		cy.openSubPanel("Configure Dummy Types");
// 		cy.get(".properties-wf-children div[data-id='properties-vt-header-override']")
// 			.trigger("mouseover");
// 		cy.verifyTip(null, "visible", "Override");
// 		cy.saveWideFlyout("Configure Dummy Types");
// 	});
// });
