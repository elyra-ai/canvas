/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

Cypress.Commands.add("clickToolbarPaletteOpen", () => {
	cy.get("#palette-open-action").click();
});

Cypress.Commands.add("clickToolbarPaletteClose", () => {
	cy.get("#palette-close-action").click();
});

Cypress.Commands.add("clickToolbarStop", () => {
	cy.get("#stop-action").click();
});

Cypress.Commands.add("clickToolbarRun", () => {
	cy.get("#run-action").click();
});

Cypress.Commands.add("clickToolbarUndo", () => {
	cy.get("#undo-action").click();
});

Cypress.Commands.add("clickToolbarRedo", () => {
	cy.get("#redo-action").click();
});

Cypress.Commands.add("clickToolbarCut", () => {
	cy.get("#cut-action").click();
});

Cypress.Commands.add("clickToolbarCopy", () => {
	cy.get("#copy-action").click();
});

Cypress.Commands.add("clickToolbarPaste", () => {
	cy.get("#paste-action").click();
});

Cypress.Commands.add("clickToolbarAddComment", () => {
	cy.get("#createAutoComment-action").click();
});

Cypress.Commands.add("clickToolbarDelete", () => {
	cy.get("#deleteSelectedObjects-action").click();
});

Cypress.Commands.add("clickToolbarArrangeHorizontally", () => {
	cy.get("#arrangeHorizontally-action").click();
});

Cypress.Commands.add("clickToolbarArrangeVertically", () => {
	cy.get("#arrangeVertically-action").click();
});

Cypress.Commands.add("clickToolbarZoomIn", () => {
	cy.get("#zoomIn-action").click();
});

Cypress.Commands.add("clickToolbarZoomOut", () => {
	cy.get("#zoomOut-action").click();
});

Cypress.Commands.add("clickToolbarZoomToFit", () => {
	cy.get("#zoomToFit-action").click();
});

Cypress.Commands.add("clickToolbarNotifications", () => {
	cy.get("#notificationCounterIcon-action").click();
});
