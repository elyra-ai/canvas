/*
 * Copyright 2017-2025 Elyra Authors
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
	cy.toggleCommonPropertiesSidePanel();
	cy.get("#common-properties-select-item").select(propertyFileName);
});

Cypress.Commands.add("toggleCategory", (categoryName) => {
	cy.get(".right-flyout-panel .cds--accordion__heading")
		.contains(categoryName)
		.click();
});

Cypress.Commands.add("saveFlyout", () => {
	cy.get(".right-flyout-panel " +
		".properties-modal-buttons button[data-id='properties-apply-button']").click();
});

Cypress.Commands.add("closeFlyout", () => {
	// When applyOnBlur set to true, show Close icon in properties title
	cy.get(".right-flyout-panel .properties-close-button > span").click({ force: true });
});

Cypress.Commands.add("openSubPanel", (title) => {
	cy.get(".right-flyout-panel .properties-summary-link-button").contains(title)
		.click();
});

Cypress.Commands.add("clickSubPanelButtonInRow", (propertyId, row) => {
	cy.get("div[data-id='properties-" + propertyId + "']").find(".properties-subpanel-button")
		.then((idx) => {
			idx[row].click();
		});
});

Cypress.Commands.add("setTextFieldValue", (propertyId, labelText) => {
	// Replace the existing text with new text in input field by
	// selecting all the text and typing new text
	// This is a workaround for issue -
	// cy.type() on input[type='number'] prepends text to current value instead of appending
	cy.get("div[data-id='properties-" + propertyId + "']").find("input")
		.as("input");
	cy.get("@input").focus();
	cy.get("@input").type("{selectall}");
	cy.get("@input").type(labelText);
});

Cypress.Commands.add("backspaceTextFieldValue", (propertyId) => {
	cy.useBackspaceKey()
		.then((backspaceKey) => {
			cy.get("div[data-id='properties-" + propertyId + "']").find("input")
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
	cy.get(".right-flyout-panel button.properties-title-editor-btn.edit").click();
});

Cypress.Commands.add("enterNewPropertiesFlyoutTitle", (newTitle) => {
	cy.get(".right-flyout-panel div.properties-title-editor-input")
		.find("input")
		.as("input");
	cy.get("@input").focus();
	cy.get("@input").type("{selectall}");
	cy.get("@input").type(newTitle);
});

Cypress.Commands.add("clickAtCoordinatesInCommonProperties", (x, y) => {
	// common-properties tooltip will be displayed onclick
	cy.get(".right-flyout-panel")
		.trigger("click", x, y);
});

Cypress.Commands.add("getControlContainerFromName", (givenName) => {
	cy.get(".properties-label-container > .properties-control-label")
		.then((labels) => {
			let label = null;
			for (let idx = 0; idx < labels.length; idx++) {
				if (labels[idx].textContent === givenName) {
					label = labels[idx];
					break;
				}
			}
			// return .properties-label-container having the given label
			return cy.wrap(label).parent();
		});
});

Cypress.Commands.add("selectPropertiesContainerType", (containerType) => {
	if (containerType === "Custom" || containerType === "Flyout") {
		cy.get("div[data-id='properties-propertiesContainerType']")
			.find(".cds--radio-button-wrapper")
			.eq(0)
			.find("label")
			.click();
	} else if (containerType === "Modal") {
		cy.get("#harness-sidepanel-properties-container-type")
			.find(".cds--radio-button-wrapper")
			.eq(1)
			.find("label")
			.click();
	}
});

/** Hovers over the given text in the summaryPanel
* @param text: value displayed in summary panels
* @param summaryName: name of summaryPanel
*/
Cypress.Commands.add("hoverOverTextInSummaryPanel", (text, summaryName) => {
	cy.getSummaryFromName(summaryName)
		.then((summary) => {
			if (summary !== null) {
				cy.wrap(summary)
					.find("span")
					.then((values) => {
						for (let idx = 0; idx < values.length; idx++) {
							if (values[idx].textContent === text) {
								cy.wrap(values[idx]).trigger("mouseover");
								break;
							}
						}
					});
			}
		});
});

Cypress.Commands.add("hoverOverValidationIconInSummaryPanel", (summaryPanelId) => {
	cy.findValidationIconInSummaryPanel(summaryPanelId)
		.then((validationIcon) => cy.wrap(validationIcon).trigger("mouseover"));
});

Cypress.Commands.add("findValidationIconInSummaryPanel", (summaryPanelId) => {
	// Open the category
	cy.get(`div[data-id='properties-${summaryPanelId}']`)
		.then((summaryPanel) => {
			cy.wrap(summaryPanel).should("exist");
			// find the validation icon
			cy.wrap(summaryPanel)
				.find(".tooltip-container");
		});
});

Cypress.Commands.add("getSummaryFromName", (summaryName) => {
	cy.get(".properties-summary-values > .properties-summary-label")
		.then((summaryLabels) => {
			let sumaryLabel = null;
			for (let idx = 0; idx < summaryLabels.length; idx++) {
				if (summaryLabels[idx].textContent === summaryName) {
					sumaryLabel = summaryLabels[idx];
					break;
				}
			}

			// return .properties-summary-value having the given summaryName
			return cy.wrap(sumaryLabel).parent();
		});
});

Cypress.Commands.add("selectRowInTable", (rowNumber, propertyId) => {
	//  Select the row 1 in the table "expressionCellTable"
	cy.get(`div[data-id='properties-${propertyId}']`)
		.find("div[data-role='properties-data-row']")
		.eq(rowNumber - 1)
		.click();
});

Cypress.Commands.add("selectAllRowsInTable", (propertyId) => {
	cy.get(`div[data-id='properties-${propertyId}']`)
		.find(".properties-vt-header-checkbox")
		.find("label")
		.click();
});

// Click on "Cancel" button in Table toolbar
Cypress.Commands.add("cancelRowSelection", (propertyId) => {
	cy.get(`div[data-id='properties-ft-${propertyId}']`)
		.find(".properties-table-toolbar")
		.find("button.properties-action-cancel")
		.click();
});

Cypress.Commands.add("clickButtonInTable", (buttonName, propertyId) => {
	cy.get(`div[data-id='properties-ctrl-${propertyId}']`)
		.then((tableDiv) => {
			cy.wrap(tableDiv).should("exist");

			if (buttonName === "Add") {
				cy.wrap(tableDiv)
					.find(".properties-add-fields-button")
					.click();
			} else if (buttonName === "Add in empty table") {
				cy.wrap(tableDiv)
					.find(".properties-empty-table-button")
					.click();
			} else {
				cy.wrap(tableDiv)
					.find(".properties-table-toolbar")
					.find("button.properties-action-delete")
					.click();
			}
		});
});

Cypress.Commands.add("clickButtonInSingleSelectTable", (buttonName, propertyId) => {
	cy.get(`div[data-id='properties-ctrl-${propertyId}']`)
		.then((tableDiv) => {
			cy.wrap(tableDiv).should("exist");
			if (buttonName === "Add") {
				cy.wrap(tableDiv)
					.find(".properties-add-fields-button")
					.click();
			} else {
				cy.wrap(tableDiv).find("button.delete-button")
					.first()
					.click();
			}
		});
});

// StructureListEditorControl commands
Cypress.Commands.add("selectFieldInFieldPickerPanel", (fieldName, dataType, panelName) => {
	// Following logic works based on assumption  - fieldName in each row is unique
	// It is difficult to unchain the following code so this is switching off the lint check:
	/* eslint cypress/unsafe-to-chain-command: "off" */
	let rowNumber;
	cy.getWideFlyoutPanel(panelName)
		.find("div[data-role='properties-data-row']")
		.each(($el, index) => {
			if ($el[0].childNodes[1].textContent === fieldName) {
				rowNumber = index;
				return false;
			}
			return true;
		})
		.then((rows) => {
			cy.wrap(rows)
				.eq(rowNumber)
				.then((row) => {
					// Verify field name
					cy.wrap(row)
						.find(".properties-fp-field-name")
						.should("have.text", fieldName);
					// Verify dataType
					cy.wrap(row)
						.find(".properties-fp-field-type")
						.should("have.text", dataType);
					// Select the checkbox in this row
					cy.wrap(row)
						.find(".properties-vt-row-checkbox")
						.find("label")
						.click({ force: true });
				});
		});
});

Cypress.Commands.add("clickOnFieldPickerButton", (buttonType) => {
	// Clicks on "apply" or "cancel" buttons
	cy.get(".properties-fp-table")
		.find(`button[data-id='properties-${buttonType}-button']`)
		.click();
});

// Action commands
Cypress.Commands.add("hoverOverActionImage", (actionName) => {
	cy.get(".properties-action-image")
		.find(`div[data-id='${actionName}']`)
		.trigger("mouseover");
});

Cypress.Commands.add("hoverOverControl", (propertyId) => {
	cy.get(`div[data-id='properties-${propertyId}']`)
		.trigger("mouseover");
});
