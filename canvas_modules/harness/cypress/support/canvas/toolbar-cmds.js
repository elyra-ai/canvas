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

Cypress.Commands.add("clickToolbarPaletteOpen", () => {
	cy.getToolbarAction(".paletteOpen-action").click();
});

Cypress.Commands.add("clickToolbarPaletteOpenInExtraCanvas", () => {
	cy.getToolbarActionInExtraCanvas(".paletteOpen-action").click();
});

Cypress.Commands.add("clickToolbarPaletteClose", () => {
	cy.getToolbarAction(".paletteClose-action").click();
});

Cypress.Commands.add("clickToolbarPaletteCloseInExtraCanvas", () => {
	cy.getToolbarActionInExtraCanvas(".paletteClose-action").click();
});

Cypress.Commands.add("clickToolbarStop", () => {
	cy.getToolbarAction(".stop-action").click();
});

Cypress.Commands.add("clickToolbarRun", () => {
	cy.getToolbarAction(".run-action").click();
});

Cypress.Commands.add("clickToolbarUndo", () => {
	cy.getToolbarAction(".undo-action").click();
});

Cypress.Commands.add("clickToolbarRedo", () => {
	cy.getToolbarAction(".redo-action").click();
});

Cypress.Commands.add("clickToolbarCut", () => {
	cy.getToolbarAction(".cut-action").click();
});

Cypress.Commands.add("clickToolbarCopy", () => {
	cy.getToolbarAction(".copy-action").click();
});

Cypress.Commands.add("clickToolbarPaste", () => {
	cy.getToolbarAction(".paste-action").click();
});

Cypress.Commands.add("clickToolbarPasteInExtraCanvas", () => {
	cy.getToolbarActionInExtraCanvas(".paste-action").click();
});

Cypress.Commands.add("clickToolbarAddComment", () => {
	cy.getToolbarAction(".createAutoComment-action").click();
});

Cypress.Commands.add("clickToolbarAddCommentInExtraCanvas", () => {
	cy.getToolbarActionInExtraCanvas(".createAutoComment-action").click();
});

Cypress.Commands.add("clickToolbarDelete", () => {
	cy.getToolbarAction(".deleteSelectedObjects-action").click();
});

Cypress.Commands.add("clickToolbarDeleteInOverflowMenu", () => {
	// When calling overflow menu items we need to 'force: true' because
	// Cypress thinks that the target menu item is hidden.
	cy.getToolbarActionInOverflowMenu(".deleteSelectedObjects-action").click({ force: true });
});

Cypress.Commands.add("clickToolbarArrangeHorizontally", () => {
	cy.getToolbarAction(".arrangeHorizontally-action").click();
});

Cypress.Commands.add("clickToolbarArrangeVertically", () => {
	cy.getToolbarAction(".arrangeVertically-action").click();
});

Cypress.Commands.add("clickToolbarZoomIn", () => {
	cy.getToolbarAction(".zoomIn-action").click();
});

Cypress.Commands.add("clickToolbarZoomInExtraCanvas", () => {
	cy.getToolbarActionInExtraCanvas(".zoomIn-action").click();
});

Cypress.Commands.add("clickToolbarZoomOut", () => {
	cy.getToolbarAction(".zoomOut-action").click();
});

Cypress.Commands.add("clickToolbarZoomOutExtraCanvas", () => {
	cy.getToolbarActionInExtraCanvas(".zoomOut-action").click();
});

Cypress.Commands.add("clickToolbarZoomToFit", () => {
	cy.getToolbarAction(".zoomToFit-action").click();
});

Cypress.Commands.add("clickToolbarNotifications", () => {
	cy.getToolbarAction(".toggleNotificationPanel-action").click();
});

Cypress.Commands.add("dismissNotificationMessage", (index) => {
	cy.get(".notifications-button-container .notifications")
		.eq(index)
		.find(".notification-message-close")
		.click({ force: true });
});

Cypress.Commands.add("clearAllNotificationMessages", () => {
	cy.get("button.notification-panel-clear-all").click();
});

Cypress.Commands.add("clickToolbarOverflow", () => {
	cy.getToolbarOverflowItem().click();
});


Cypress.Commands.add("getToolbarOverflowItem", () => {
	cy.getCanvasToolbar()
		.find(".toolbar-overflow-item")
		.then((items) => {
			let overflowItem = null;
			let topRow = 0;
			for (let i = 0; i < items.length; i++) {
				const rect = items[i].getBoundingClientRect();
				if (i === 0) {
					topRow = rect.top;
				}
				if (rect.top === topRow) {
					overflowItem = items[i];
				}
			}
			return overflowItem;
		});
});

Cypress.Commands.add("getToolbarActionInOverflowMenu", (action) => {
	const overflowMenuAction = ".toolbar-overflow-menu-item" + action + " button";
	cy.getCanvasToolbar().find(overflowMenuAction);
});

Cypress.Commands.add("getToolbarAction", (action) => {
	cy.getCanvasToolbar().find(action);
});

Cypress.Commands.add("getToolbarActionInExtraCanvas", (action) => {
	cy.getExtraCanvasToolbar().find(action);
});

Cypress.Commands.add("getCanvasToolbar", () => {
	cy.get(".toolbar-div[instanceid=0]");
});

Cypress.Commands.add("getExtraCanvasToolbar", () => {
	cy.get(".toolbar-div[instanceid=1]");
});

Cypress.Commands.add("hoverOverToolbarItem", (toolbarItem) => {
	cy.getToolbarAction(toolbarItem)
		.trigger("mouseover");
});

Cypress.Commands.add("mouseoutToolbarItem", (toolbarItem) => {
	cy.getToolbarAction(toolbarItem)
		.trigger("mouseout");
});
