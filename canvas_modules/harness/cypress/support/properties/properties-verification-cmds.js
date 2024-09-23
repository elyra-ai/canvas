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

Cypress.Commands.add("verifyReadOnlyTextValue", (propertyId, value) => {
	cy.get("div[data-id='properties-" + propertyId + "'] span")
		.invoke("text")
		.then((text) => {
			expect(value).equal(text);
		});
});

Cypress.Commands.add("verifyReadOnlyTextCSS", (propertyId, style, value) => {
	cy.get("div[data-id='properties-" + propertyId + "'] span")
		.should("have.css", style, value);
});

Cypress.Commands.add("verifyNoTextOverflow", (propertyId) => {
	cy.get("div[data-id='properties-" + propertyId + "'] span")
		.invoke("height")
		.should("be.lt", 25);
});

Cypress.Commands.add("verifyPropertiesFlyoutTitle", (givenTitle) => {
	cy.get(".right-flyout-panel .properties-title-editor-input input")
		.should("have.value", givenTitle);
});

Cypress.Commands.add("verifyMessageInPropertiesTitleEditor", (message, type) => {
	cy.get(".right-flyout-panel .properties-title-editor")
		.find(".cds--form-requirement")
		.should("have.text", message);

	if (type === "warning") {
		cy.get(".right-flyout-panel .properties-title-editor")
			.find(".cds--text-input__field-wrapper--warning")
			.should("have.length", 1);
	} else if (type === "error") {
		cy.get(".right-flyout-panel .properties-title-editor")
			.find(".cds--text-input__field-wrapper")
			.should("have.attr", "data-invalid", "true");
	}
});

Cypress.Commands.add("verifyPropertiesFlyoutDoesNotExist", () => {
	cy.get("#node-title-editor-right-flyout-panel")
		.should("not.exist");
});

/** Verify the tooltip over the given text is 'visible'
* @param container: the container shown in the UI
* @param visible: "visible" or "hidden"
* @param text: text shown in the tip
* @param tipLocation: the location of the tooltip
*/
Cypress.Commands.add("verifyTip", (container, visible, text, direction) => {
	cy.get(".common-canvas-tooltip")
		.then((tips) => {
			// Get the visible tip
			let visibleTip;
			for (var idx = 0; idx < tips.length; idx++) {
				if (tips[idx].textContent === text) {
					visibleTip = tips[idx];
					break;
				}
			}

			if (visibleTip) {
				// Verify tip is visible or hidden
				if (visible === "visible") {
					cy.wrap(visibleTip).should("have.attr", "aria-hidden", "false");
				} else {
					cy.wrap(visibleTip).should("have.attr", "aria-hidden", "true");
				}
				// Verify text in tip
				if (text) {
					cy.wrap(visibleTip).should("have.text", text);
				}

				// Verify tip location
				if (direction) {
					// Verify tip direction
					cy.wrap(visibleTip).should("have.attr", "direction", direction);

					if (container) {

						/* TODO: visibleTip has style="left: 1105.24px; top: 258.722px;"
								* Get these values of left and top and store in tipLeft and tipTop.
								* Need to write loop for "top" comparing containerTop and tipTop
								*/
						const containerLeft = container[0].getBoundingClientRect().x;
						const tipLeft = visibleTip.getBoundingClientRect().x;
						const containerTop = container[0].getBoundingClientRect().y;
						const tipTop = visibleTip.getBoundingClientRect().y;
						if (direction === "left") {
							expect(tipLeft).to.be.lessThan(containerLeft);
						} else if (direction === "right") {
							expect(tipLeft).to.be.greaterThan(containerLeft);
						} else if (direction === "top") {
							expect(tipTop).to.be.greaterThan(containerTop);
						}
					}

				}
			}
		});
});

// Expression control verification commands
Cypress.Commands.add("verifyTypeOfWordInExpressionEditor", (word, type, propertyId) => {
	// Verify "is_real" is a "keyword" in ExpressionEditor
	const searchClass = ".cm-" + type;
	const testWord = (type === "string") ? "\"" + word + "\"" : word;
	cy.get(`div[data-id='properties-ctrl-${propertyId}']`)
		.find(".properties-expression-editor")
		.find(".cm-line")
		.then((codeMirrorLine) => {
			for (let idx = 0; idx < codeMirrorLine.length; idx++) {
				if (codeMirrorLine[idx].textContent.includes(testWord)) {
					cy.wrap(codeMirrorLine[idx])
						.find(searchClass)
						.eq(0)
						.should("have.class", "cm-" + type)
						.should("have.text", testWord);
					break;
				}
			}
		});
});

Cypress.Commands.add("verifyNumberOfHintsInExpressionEditor", (hintCount) => {
	// Enter "is" in ExpressionEditor and press autocomplete and verify that 18 autocomplete hints are displayed
	cy.get(".cm-tooltip-autocomplete")
		.eq(0)
		.find("li")
		.should("have.length", hintCount);
});

Cypress.Commands.add("verifyTypeOfSelectedAutoComplete", (selectedText, type) => {
	const searchClass = ".cm-" + type;
	cy.get(".properties-expression-editor")
		.find(".cm-line")
		.find(searchClass)
		.should("have.class", "cm-" + type)
		.should("have.text", selectedText);
});

Cypress.Commands.add("verifyTypeOfEnteredTextInExpressionEditor", (enteredText, type, propertyId) => {
	// Enter "and" in ExpressionEditor and verify it is a "keyword"
	const setText = (type === "string") ? "\"" + enteredText + "\"" : enteredText;
	cy.enterTextInExpressionEditor(setText, propertyId)
		.then((text) => {
			const searchClass = ".cm-" + type;
			cy.get(".properties-expression-editor")
				.find(".cm-line")
				.find(searchClass)
				.should("have.class", "cm-" + type)
				.should("have.text", setText);
		});
});

Cypress.Commands.add("verifyPlaceholderTextInExpressionEditor", (text) => {
	cy.get(".properties-expression-editor")
		.find(".cm-placeholder")
		.should("have.text", text);
});

Cypress.Commands.add("verifyValidationMessage", (message) => {
	cy.get(".properties-validation-message > span")
		.first()
		.should("have.text", message);
});

Cypress.Commands.add("verifyControlIsDisplayed", (propertyId) => {
	cy.get(`div[data-id='properties-ci-${propertyId}']`)
		.should("exist");
});

Cypress.Commands.add("verifyValueInSummaryPanelForCategory", (value, summaryName, rowNumber, categoryName) => {
	cy.get(".right-flyout-panel")
		.find(".properties-category-container")
		.find(".cds--accordion__title")
		.contains(categoryName)
		.should("exist");

	cy.getSummaryFromName(summaryName)
		.find(".properties-summary-row")
		.eq(rowNumber - 1)
		.find(".properties-summary-row-data ")
		.eq(1)
		.invoke("text")
		.then((text) => expect(text.trim()).to.equal(value));
});

Cypress.Commands.add("verifyIconInSubPanel", (iconName) => {
	if (iconName === "none") {
		cy.getValidateIconInSubPanel()
			.should("not.exist");
	} else {
		cy.getValidateIconInSubPanel()
			.find("svg")
			.invoke("attr", "class")
			.then((iconClass) => {
				expect(iconClass).to.include(iconName);
			});
	}
});

Cypress.Commands.add("verifyRowInSelectColumnsTable", (propertyId, fieldName, rowNumber) => {
	cy.get(`div[data-id='properties-ft-${propertyId}']`)
		.find("div[data-role='properties-data-row']")
		.eq(rowNumber - 1)
		.find(".properties-readonly")
		.should("have.text", fieldName);
});

Cypress.Commands.add("verifyFieldIsSelectedInFieldPickerPanel", (fieldName, dataType, panelName) => {
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
					// Verify checkbox is selected
					cy.wrap(row)
						.find(".properties-vt-row-checkbox")
						.find("input")
						.should("be.checked");
				});
		});
});

Cypress.Commands.add("verifyFieldsInTable", (propertyId, fields, rowNumber, columnNumber) => {
	cy.get(`div[data-id='properties-ft-${propertyId}']`)
		.find(`div[data-id='properties-${propertyId}_${rowNumber}_${columnNumber}']`)
		.should("have.text", fields);
});

Cypress.Commands.add("verifyHeightOfTable", (propertyId, height) => {
	cy.get(`div[data-id='properties-ft-${propertyId}']`)
		.find(".properties-ft-container-wrapper")
		.find("div[role='rowgroup']")
		.invoke("css", "height")
		.then((cssValue) => {
			cy.verifyPixelValueInCompareRange(height, cssValue);
		});
});
