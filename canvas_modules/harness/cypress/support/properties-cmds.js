/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
	cy.get(".properties-category-container button")
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
