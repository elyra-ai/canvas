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

Cypress.Commands.add("clickToolbarPaletteOpen", () => {
	cy.get("#palette-open-action").click();
});

Cypress.Commands.add("clickToolbarPaletteOpenInExtraCanvas", () => {
	cy.get("#common-canvas-items-container-1")
		.find("#palette-open-action")
		.click();
});

Cypress.Commands.add("clickToolbarPaletteClose", () => {
	cy.get("#palette-close-action").click();
});

Cypress.Commands.add("clickToolbarPaletteCloseInExtraCanvas", () => {
	cy.get("#common-canvas-items-container-1")
		.find("#palette-close-action")
		.click();
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

Cypress.Commands.add("clickToolbarPasteInExtraCanvas", () => {
	cy.get("#common-canvas-items-container-1")
		.find("#paste-action")
		.click();
});

Cypress.Commands.add("clickToolbarAddComment", () => {
	cy.get("#createAutoComment-action").click();
});

Cypress.Commands.add("clickToolbarAddCommentnInExtraCanvas", () => {
	cy.get("#common-canvas-items-container-1")
		.find("#createAutoComment-action")
		.click();
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

Cypress.Commands.add("clickToolbarZoomInExtraCanvas", () => {
	cy.get("#common-canvas-items-container-1")
		.find("#zoomIn-action")
		.click();
});

Cypress.Commands.add("clickToolbarZoomOut", () => {
	cy.get("#zoomOut-action").click();
});

Cypress.Commands.add("clickToolbarZoomOutExtraCanvas", () => {
	cy.get("#common-canvas-items-container-1")
		.find("#zoomOut-action")
		.click();
});

Cypress.Commands.add("clickToolbarZoomToFit", () => {
	cy.get("#zoomToFit-action").click();
});

Cypress.Commands.add("clickToolbarNotifications", () => {
	cy.get("#notificationCounterIcon-action").click();
});

Cypress.Commands.add("clickToolbarOverflow", () => {
	cy.get("#overflow-action").click();
});
