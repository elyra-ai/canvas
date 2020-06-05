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

Cypress.Commands.add("moveMouseToCoordinatesInCommonProperties", (x, y) => {
	cy.get(".right-flyout-panel")
		.trigger("mouseover", x, y);
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
		cy.get("#harness-sidepanel-properties-container-type")
			.find(".bx--radio-button-wrapper")
			.eq(0)
			.find("label")
			.click();
	} else if (containerType === "Modal") {
		cy.get("#harness-sidepanel-properties-container-type")
			.find(".bx--radio-button-wrapper")
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

Cypress.Commands.add("selectRowInTable", (rowNumber, tableControlId) => {
	//  Select the row 1 in the table "expressionCellTable"
	cy.get(`div[data-id='properties-${tableControlId}']`)
		.find("div[role='properties-data-row']")
		.eq(rowNumber - 1)
		.click();
});

Cypress.Commands.add("selectAllRowsInTable", (tableControlId) => {
	cy.get(`div[data-id='properties-${tableControlId}']`)
		.find(".properties-vt-header-checkbox")
		.find("label")
		.click();
});

Cypress.Commands.add("clickButtonInTable", (buttonName, tableControlId) => {
	cy.get(`div[data-id='properties-ft-${tableControlId}']`)
		.then((tableDiv) => {
			cy.wrap(tableDiv).should("exist");

			if (buttonName === "Add") {
				cy.wrap(tableDiv)
					.find(".properties-add-fields-button")
					.click();
			} else {
				cy.wrap(tableDiv)
					.find(".properties-remove-fields-button")
					.click();
			}
		});
});

// Expression control commands
Cypress.Commands.add("getAutoCompleteCountForText", (text) => {
	// Select all and delete existing text in expression editor
	cy.useCtrlOrCmdKey()
		.then((selectedKey) => {
			cy.get(".properties-expression-editor")
				.find(".CodeMirror")
				.find(".CodeMirror-code")
				.type(selectedKey + "{a}{del}");

			// Type text and ctrl + space to display hints
			cy.get(".CodeMirror-code")
				.type(text + "{ctrl} ");

			cy.get(".CodeMirror-hints")
				.eq(0)
				.find("li")
				.its("length");
		});
});

Cypress.Commands.add("selectFirstAutoCompleteForText", (text) => {
	// Select all and delete existing text in expression editor
	cy.useCtrlOrCmdKey()
		.then((selectedKey) => {
			cy.get(".properties-expression-editor")
				.find(".CodeMirror")
				.find(".CodeMirror-code")
				.type(selectedKey + "{a}{del}");

			// Type text and ctrl + space to display hints
			cy.get(".CodeMirror-code")
				.type(text + "{ctrl} ");

			// select the first one in the list of hints and make sure it is the text
			cy.get(".CodeMirror-hints")
				.eq(0)
				.find("li")
				.eq(0)
				.click();
		});
});

Cypress.Commands.add("enterTextInExpressionEditor", (text) => {
	// Select all and delete existing text in expression editor
	cy.useCtrlOrCmdKey()
		.then((selectedKey) => {
			cy.get(".properties-expression-editor")
				.find(".CodeMirror")
				.find(".CodeMirror-code")
				.type(selectedKey + "{a}{del}");

			// Type text
			cy.get(".CodeMirror-code")
				.type(text);
		});
});

Cypress.Commands.add("clickValidateLink", () => {
	cy.get(".properties-expression-validate")
		.find(".validateLink")
		.click();
});

Cypress.Commands.add("clickValidateLinkInSubPanel", (panelName) => {
	cy.getWideFlyoutPanel(panelName)
		.then((wideFlyoutPanel) => {
			cy.wrap(wideFlyoutPanel)
				.find(".properties-expression-validate")
				.find(".validateLink")
				.click();
		});
});

Cypress.Commands.add("clickExpressionBuildButtonForProperty", (propertyName) => {
	cy.get(`div[data-id='properties-ci-${propertyName}']`)
		.find(".properties-expression-button")
		.click();
});

Cypress.Commands.add("selectFieldFromPropertyInSubPanel", (fieldName, propertyName, panelName) => {
	cy.getWideFlyoutPanel(panelName)
		.then((wideFlyoutPanel) => {
			cy.wrap(wideFlyoutPanel)
				.find("div[role='properties-data-row']")
				.find(".properties-expr-table-cell")
				.then((tableCells) => {
					cy.getCellMatch(tableCells, fieldName)
						.then((cell) => {
							expect(cell).to.not.equal(null);
							cy.wrap(cell).dblclick({ force: true });
						});
				});
		});
});

Cypress.Commands.add("selectTabFromPropertyInSubPanel", (tabName, propertyName, panelName) => {
	cy.getWideFlyoutPanel(panelName)
		.then((wideFlyoutPanel) => {
			cy.wrap(wideFlyoutPanel)
				.find(".properties-expression-selection-fieldOrFunction")
				.find("a")
				.then((tabs) => {
					tabs.each((idx) => {
						if (tabs[idx].textContent === tabName) {
							cy.wrap(tabs[idx])
								.parent()
								.click();
						}
					});
				});
		});
});

Cypress.Commands.add("getCellMatch", (tableCells, fieldName) => {
	for (let idx = 0; idx < tableCells.length; idx++) {
		if (tableCells[idx].textContent === fieldName) {
			return (tableCells[idx]);
		}
	}
	return null;
});
