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

// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("openPropertyDefinition", (propertyFileName) => {
	cy.get("#harness-action-bar-sidepanel-modal").click();
	cy.get("#common-properties-select-item").select(propertyFileName);
});

Cypress.Commands.add("toggleCategory", (categoryName) => {
	cy.get(".properties-category-title")
		.contains(categoryName)
		.click();
});

Cypress.Commands.add("saveWideflyout", () => {
	cy.get(".properties-wf-content button[data-id='properties-apply-button']").click();
});

Cypress.Commands.add("saveFlyout", () => {
	cy.get(".properties-modal-buttons button[data-id='properties-apply-button']").click();
});


Cypress.Commands.add("openSubPanel", (title) => {
	cy.get(".properties-icon-button-label").contains(title)
		.click();
});
