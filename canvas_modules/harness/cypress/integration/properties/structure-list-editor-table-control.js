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

describe("Test of subpanel editing of selectcolumns in a structurelisteditor", function() {
	before(() => {
		cy.visit("/");
		cy.toggleCommonPropertiesSidePanel();
		cy.selectPropertiesContainerType("Flyout");
		cy.toggleCommonPropertiesSidePanel();
		cy.openPropertyDefinition("selectcolumns_paramDef.json");
	});

	it("Test of subpanel editing of selectcolumns in a structurelisteditor", function() {
		cy.toggleCategory("Table");
		cy.openSubPanel("Configure Fields in Sub-panel");
		cy.clickButtonInTable("Add in empty table", "structurelist_sub_panel");
		cy.clickSubPanelButtonInRow("structurelist_sub_panel", 0);
		cy.clickButtonInTable("Add", "fields2");
		cy.selectFieldInFieldPickerPanel("Na", "double", "Select Fields for Select Columns");
		cy.clickOnFieldPickerButton("apply");

		// Verify two rows are in selectColumns
		cy.verifyRowInSelectColumnsTable("fields2", "BP", 1);
		cy.verifyRowInSelectColumnsTable("fields2", "Na", 2);

		// Go back into field picker and verify the two options are still selected
		cy.clickButtonInTable("Add", "fields2");
		cy.verifyFieldIsSelectedInFieldPickerPanel("BP", "string", "Select Fields for Select Columns");
		cy.verifyFieldIsSelectedInFieldPickerPanel("Na", "double", "Select Fields for Select Columns");
		cy.clickOnFieldPickerButton("cancel");

		// Verify the string array in structurelisteditor table
		cy.saveWideFlyout("structurelist_sub_panel_info");
		cy.verifyFieldsInTable("structurelist_sub_panel", "BP, Na", 0, 0);
	});
});

describe("Test the feature to have tables use the available vertical space", function() {
	before(() => {
		cy.visit("/");
		cy.toggleCommonPropertiesSidePanel();
		cy.selectPropertiesContainerType("Flyout");
		cy.toggleCommonPropertiesSidePanel();
		cy.openPropertyDefinition("selectcolumns_paramDef.json");
	});

	it("Test the feature to have tables use the available vertical space", function() {
		cy.toggleCategory("Table");
		cy.openSubPanel("Configure Fields in Sub-panel");
		cy.clickButtonInTable("Add in empty table", "structurelist_sub_panel");
		cy.verifyHeightOfTable("structurelist_sub_panel", "473px");
	});
});
