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

describe("Test of text styling and word wrapping", function() {
	before(() => {
		cy.visit("/");
		cy.openPropertyDefinition("readonly_paramDef.json");
	});

	it("Test of readonly text value and CSS style", function() {
		cy.verifyReadOnlyTextValue("readonly_text",
			"The more I study, the more insatiable do I feel my genius for it to be. 'Ada Lovelace'");
		cy.verifyReadOnlyTextCSS("readonly_text", "overflow-wrap", "break-word");
	});
});

describe("Test of ellipsis activation for a long readonly text", function() {
	before(() => {
		cy.visit("/");
		cy.openPropertyDefinition("structuretable_paramDef.json");
	});

	it("Test of ellipsis activation for a long readonly text", function() {
		cy.openSubPanel("Configure Rename fields");
		cy.clickSubPanelButtonInRow("structuretableReadonlyColumnDefaultIndex", 0);
		cy.setTextFieldValue("structuretableReadonlyColumnDefaultIndex_0_3",
			"This is a very long sentence of text to test whether or not an overflow of text occurs");
		cy.saveWideFlyout("Rename Subpanel");
		cy.verifyNoTextOverflow("structuretableReadonlyColumnDefaultIndex_0_3");
		cy.saveWideFlyout("Configure Rename fields");
	});
});
