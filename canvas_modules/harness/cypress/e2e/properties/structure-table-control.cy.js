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

describe("Test of subpanel editing in a structuretable", function() {
	before(() => {
		cy.visit("/");
		cy.toggleCommonPropertiesSidePanel();
		cy.selectPropertiesContainerType("Flyout");
		cy.toggleCommonPropertiesSidePanel();
		cy.openPropertyDefinition("structuretable_paramDef.json");
	});

	it("Test of subpanel editing in a structuretable", function() {
		cy.openSubPanel("Configure Rename fields");
		cy.clickSubPanelButtonInRow("structuretableReadonlyColumnDefaultIndex", 0);
		cy.setTextFieldValue(
			"structuretableReadonlyColumnDefaultIndex_0_3", "textValue"
		);
		cy.saveWideFlyout("Rename Subpanel");

		cy.verifyReadOnlyTextValue("structuretableReadonlyColumnDefaultIndex_0_3", "textValue");
		cy.saveWideFlyout("Configure Rename fields");
		cy.saveFlyout();
	});
});

describe("Test the feature to have tables use the available vertical space", function() {
	before(() => {
		cy.visit("/");
		cy.toggleCommonPropertiesSidePanel();
		cy.selectPropertiesContainerType("Flyout");
		cy.toggleCommonPropertiesSidePanel();
		cy.openPropertyDefinition("structuretable_paramDef.json");
	});

	it("Test the feature to have tables use the available vertical space", function() {
		cy.openSubPanel("MSE Structure Table");
		cy.verifyHeightOfTable("ST_mse_table", "539px");
	});
});
