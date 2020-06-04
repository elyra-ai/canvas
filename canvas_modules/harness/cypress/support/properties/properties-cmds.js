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

Cypress.Commands.add("openPropertyDefinition", (propertyFileName) => {
	cy.get("#harness-action-bar-sidepanel-modal").click();
	cy.get("#common-properties-select-item").select(propertyFileName);
});

Cypress.Commands.add("toggleCategory", (categoryName) => {
	cy.get(".properties-category-title")
		.contains(categoryName)
		.click();
});

Cypress.Commands.add("saveFlyout", () => {
	cy.get(".properties-modal-buttons button[data-id='properties-apply-button']").click();
});


Cypress.Commands.add("openSubPanel", (title) => {
	cy.get(".properties-icon-button-label").contains(title)
		.click();
});

Cypress.Commands.add("clickSubPanelButtonInRow", (controlId, row) => {
	cy.get("div[data-id='properties-" + controlId + "']").find(".properties-subpanel-button")
		.then((idx) => {
			idx[row].click();
		});
});

Cypress.Commands.add("setTextFieldValue", (controlId, labelText) => {
	// Replace the existing text with new text in input field by
	// selecting all the text and typing new text
	// This is a workaround for issue -
	// cy.type() on input[type='number'] prepends text to current value instead of appending
	cy.get("div[data-id='properties-" + controlId + "']").find("input")
		.focus()
		.type("{selectall}")
		.type(labelText);
});

Cypress.Commands.add("backspaceTextFieldValue", (controlId) => {
	cy.useBackspaceKey()
		.then((backspaceKey) => {
			cy.get("div[data-id='properties-" + controlId + "']").find("input")
				.type(backspaceKey);
		});
});

Cypress.Commands.add("getWideFlyoutPanel", (panelName) => {
	cy.get(".properties-wf-content.show")
		.then((wideFlyoutPanels) => {
			let panel = null;
			for (var idx = 0; idx < wideFlyoutPanels.length; idx++) {
				const flyout = wideFlyoutPanels[idx];
				if (flyout.textContent.includes(panelName)) {
					panel = flyout;
					break;
				}
			}
			return panel;
		});
});

Cypress.Commands.add("saveWideFlyout", (panelName) => {
	cy.getWideFlyoutPanel(panelName).then((wideFlyoutPanel) => {
		cy.wrap(wideFlyoutPanel)
			.find(".properties-modal-buttons button[data-id='properties-apply-button']")
			.click();
	});
});

Cypress.Commands.add("clickPropertiesFlyoutTitleEditIcon", () => {
	cy.get("button.properties-title-editor-btn.edit").click();
});

Cypress.Commands.add("enterNewPropertiesFlyoutTitle", (newTitle) => {
	cy.get("div.properties-title-editor-input")
		.find("input")
		.focus()
		.type("{selectall}")
		.type(newTitle);
});
