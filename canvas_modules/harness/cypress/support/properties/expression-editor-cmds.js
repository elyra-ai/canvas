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

Cypress.Commands.add("enterTextInExpressionEditor", (text, propertyId) => {
	cy.useCtrlOrCmdKey()
		.then((selectedKey) => {
			cy.get(`div[data-id='properties-ctrl-${propertyId}']`)
				.find(".properties-expression-editor")
				.find(".CodeMirror")
				.find(".CodeMirror-code")
				.type(selectedKey + "{a}{del}") // Select all and delete existing text in expression editor
				.type(text + "{ctrl} "); // Type text and ctrl + space to display hints
		});
});

Cypress.Commands.add("selectFirstAutoCompleteForText", (text, propertyId) => {
	cy.enterTextInExpressionEditor(text, propertyId);
	// select the first one in the list of hints and make sure it is the text
	cy.get(".CodeMirror-hints")
		.eq(0)
		.find("li")
		.eq(0)
		.click();
});

Cypress.Commands.add("clickValidateLink", (propertyId) => {
	cy.get(`div[data-id='properties-ctrl-${propertyId}']`)
		.find(".properties-expression-validate")
		.find(".validateLink")
		.click();
});

Cypress.Commands.add("getValidateButtonInSubPanel", () => {
	cy.get(".properties-expression-builder")
		.find(".properties-expression-validate");
});

Cypress.Commands.add("clickValidateLinkInSubPanel", () => {
	cy.getValidateButtonInSubPanel()
		.find(".validateLink")
		.click();
});

Cypress.Commands.add("getValidateIconInSubPanel", () => {
	cy.getValidateButtonInSubPanel()
		.find(".validateIcon");
});

Cypress.Commands.add("clickExpressionBuilderButton", (propertyId) => {
	cy.get(`div[data-id='properties-ctrl-${propertyId}']`)
		.find(".properties-expression-button")
		.click();
});

Cypress.Commands.add("selectFieldFromPropertyInSubPanel", (fieldName, propertyId) => {
	cy.get(`.properties-${propertyId}-table-container`)
		.find("div[data-role='properties-data-row']")
		.find(".properties-expr-table-cell")
		.then((tableCells) => {
			const cell = getCellMatch(tableCells, fieldName);
			expect(cell).to.not.equal(null);
			cy.wrap(cell).dblclick({ force: true });
		});
});

Cypress.Commands.add("selectTabFromPropertyInSubPanel", (tabName, propertyId) => {
	cy.get(".properties-expression-selection-fieldOrFunction")
		.find(`button.expresson-builder-${propertyId}-tab`)
		.click({ force: true });
});

Cypress.Commands.add("triggerBlurInExpressionBuilder", () => {
	cy.get(".properties-expression-selection-content-switcher")
		.click({ force: true });
});

function getCellMatch(tableCells, fieldName) {
	for (let idx = 0; idx < tableCells.length; idx++) {
		if (tableCells[idx].textContent === fieldName) {
			return (tableCells[idx]);
		}
	}
	return null;
}
