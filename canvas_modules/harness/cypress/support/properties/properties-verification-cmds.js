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
import * as testUtils from "../../utils/eventlog-utils";

Cypress.Commands.add("verifyReadOnlyTextValue", (controlId, value) => {
	cy.get("div[data-id='properties-" + controlId + "'] span")
		.invoke("text")
		.then((text) => {
			expect(value).equal(text);
		});
});

Cypress.Commands.add("verifyReadOnlyTextCSS", (controlId, style, value) => {
	cy.get("div[data-id='properties-" + controlId + "'] span")
		.should("have.css", style, value);
});

Cypress.Commands.add("verifyNoTextOverflow", (controlId) => {
	cy.get("div[data-id='properties-" + controlId + "'] span")
		.invoke("height")
		.should("be.lt", 25);
});

Cypress.Commands.add("verifyPropertiesFlyoutTitle", (givenTitle) => {
	cy.get(".properties-title-editor-input input")
		.should("have.value", givenTitle);
});

Cypress.Commands.add("verifyPropertiesFlyoutDoesNotExist", () => {
	cy.get("#node-title-editor-right-flyout-panel")
		.should("not.exist");
});

Cypress.Commands.add("verifyNewPropertiesFlyoutTitleEntryInConsole", (newTitle) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "applyPropertyChanges()");
		expect(newTitle).to.equal(lastEventLog.data.title);
	});
});

Cypress.Commands.add("verifyColumnNameEntryInConsole", (columnName) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(columnName).to.equal(lastEventLog.data.form.colName);
	});
});

Cypress.Commands.add("verifySamplingRatioParameterValueInConsole", (parameterName, value) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "applyPropertyChanges()");
		expect(value).to.equal(lastEventLog.data.form[parameterName]);
	});
});

Cypress.Commands.add("verifyErrorMessageForSamplingRatioParameterInConsole", (messageType, parameterName, message) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "applyPropertyChanges()");
		expect(lastEventLog.data.messages.length).not.equal(0);
		for (var idx = 0; idx < lastEventLog.data.messages.length; idx++) {
			if (lastEventLog.data.messages[idx].text === message &&
					lastEventLog.data.messages[idx].type === messageType &&
					lastEventLog.data.messages[idx].id_ref === parameterName) {
				expect(lastEventLog.data.messages[idx].text).to.equal(message);
				expect(lastEventLog.data.messages[idx].type).to.equal(messageType);
				expect(lastEventLog.data.messages[idx].id_ref).to.equal(parameterName);
				break;
			}
		}
	});
});

Cypress.Commands.add("verifyNoErrorMessageInConsole", () => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "applyPropertyChanges()");
		expect(lastEventLog.data.messages.length).to.equal(0);
	});
});

Cypress.Commands.add("verifyTextValueIsNotPresentInColumnName", (columnName) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc, 2);
		expect("").to.equal(lastEventLog.data.form.colName);
	});
});

Cypress.Commands.add("verifyTextValueIsPresentInColumnName", (columnName) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc, 2);
		expect(columnName).to.equal(lastEventLog.data.form.colName);
	});
});

/** Verify the tooltip over the given text is 'visible'
* @param label: label of the container shown in the UI
* @param text: text shown in the tip
*/
Cypress.Commands.add("verifyTipForLabelIsVisibleAtLocation", (label, tipLocation, text) => {
	// Verify the tip for label "Mode" is visible on the "top" with text "Include or discard rows"
	cy.getControlContainerFromName(label)
		.then((container) => {
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
						// Verify tip is visible
						cy.wrap(visibleTip).should("have.attr", "aria-hidden", "false");
						// Verify text in tip
						cy.wrap(visibleTip).should("have.text", text);
						// Verify tip location
						/* TODO: visibleTip has style="left: 1105.24px; top: 258.722px;"
						* Get these values of left and top and store in tipLeft and tipTop.
						* Need to write loop for "top" comparing containerTop and tipTop
						*/
						const containerLeft = container[0].getBoundingClientRect().x;
						const tipLeft = visibleTip.getBoundingClientRect().x;
						if (tipLocation === "left") {
							expect(tipLeft).to.be.lessThan(containerLeft);
						} else if (tipLocation === "right") {
							expect(tipLeft).to.be.greaterThan(containerLeft);
						}
					}
				});
		});
});

/** Verify the tooltip over the given text in the summaryPanel is 'visible'
* @param text: value displayed in summary panels
* @param summaryName: name of summaryPanel
* @param visible: string value of 'visible' when tooltip is showing, other values for tooltip hidden
*/
Cypress.Commands.add("verifyTipWithTextInSummaryPanel", (text, summaryName, visible) => {
	cy.getSummaryFromName(summaryName)
		.then((summary) => {
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
						} else if (visible === "hidden") {
							cy.wrap(visibleTip).should("have.attr", "aria-hidden", "true");
						}
						// Verify text in tip
						cy.wrap(visibleTip).should("have.text", text);
						// Verify tip location
						/* TODO: visibleTip has style="left: 1105.24px; top: 258.722px;"
						* Get these values of left and top and store in tipLeft and tipTop.
						* Fix the commented code below.
						*/
						const summaryTop = summary[0].getBoundingClientRect().y;
						const tipTop = visibleTip.getBoundingClientRect().y;
						expect(tipTop).to.be.greaterThan(summaryTop);
						// const summaryLeft = summary[0].getBoundingClientRect().x;
						// const tipLeft = visibleTip.getBoundingClientRect().x;
						// expect(tipLeft).to.be.greaterThan(summaryLeft);
					}
				});
		});
});

Cypress.Commands.add("verifyTipForValidationIconInSummaryPanel", (summaryPanelId, text) => {
	cy.findValidationIconInSummaryPanel(summaryPanelId)
		.then((validationIcon) => {
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
						// Verify tip is visible
						cy.wrap(visibleTip).should("have.attr", "aria-hidden", "false");
						// Verify text in tip
						cy.wrap(visibleTip).should("have.text", text);
						// Verify tip location
						/* TODO: visibleTip has style="left: 1223.23px; top: 224.972px;"
						* Get these values of left and top and store in tipLeft and tipTop.
						* Fix the commented code below.
						*/
						const validationIconTop = validationIcon[0].getBoundingClientRect().y;
						const tipTop = visibleTip.getBoundingClientRect().y;
						expect(tipTop).to.be.greaterThan(validationIconTop);

						// const validationIconLeft = validationIcon[0].getBoundingClientRect().x;
						// const tipLeft = visibleTip.getBoundingClientRect().x;
						// expect(tipLeft).to.be.greaterThan(validationIconLeft);
					}
				});
		});
});

// Expression control verification commands
Cypress.Commands.add("verifyTypeOfWordInExpressionEditor", (word, type) => {
	// Verify "is_real" is a "keyword" in ExpressionEditor
	const searchClass = ".cm-" + type;
	const testWord = (type === "string") ? "\"" + word + "\"" : word;
	cy.get(".properties-expression-editor")
		.find(".CodeMirror-line")
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

Cypress.Commands.add("verifyNumberOfHintsForTextInExpressionEditor", (enteredText, hintCount) => {
	// Enter "is" in ExpressionEditor and press autocomplete and verify that 18 autocomplete hints are displayed
	cy.getAutoCompleteCountForText(enteredText)
		.then((autoCompleteCount) => expect(autoCompleteCount).to.equal(hintCount));
});

Cypress.Commands.add("verifyTypeOfFirstAutoCompleteForText", (enteredText, selectedText, type) => {
	// Enter "is_" in ExpressionEditor and press autocomplete and select "is_date" a "keyword"
	cy.selectFirstAutoCompleteForText(enteredText)
		.then((selectedAutoComplete) => {
			const searchClass = ".cm-" + type;
			cy.get(".properties-expression-editor")
				.find(".CodeMirror-line")
				.find(searchClass)
				.should("have.class", "cm-" + type)
				.should("have.text", selectedText);
		});
});

Cypress.Commands.add("verifyTypeOfEnteredTextInExpressionEditor", (enteredText, type) => {
	// Enter "and" in ExpressionEditor and verify it is a "keyword"
	const setText = (type === "string") ? "\"" + enteredText + "\"" : enteredText;
	cy.enterTextInExpressionEditor(setText)
		.then((text) => {
			const searchClass = ".cm-" + type;
			cy.get(".properties-expression-editor")
				.find(".CodeMirror-line")
				.find(searchClass)
				.should("have.class", "cm-" + type)
				.should("have.text", setText);
		});
});

Cypress.Commands.add("verifyConditionExpressionInConsole", (selectedText) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.data.form.conditionExpr).to.include(selectedText);
	});
});

Cypress.Commands.add("verifyPlaceholderTextInExpressionEditor", (text) => {
	cy.get(".properties-expression-editor")
		.find(".CodeMirror-placeholder")
		.should("have.text", text);
});

Cypress.Commands.add("verifyValidationMessage", (message) => {
	cy.get(".properties-validation-message > span")
		.first()
		.should("have.text", message);
});

Cypress.Commands.add("verifyControlIsDisplayed", (controlId) => {
	cy.get(`div[data-id='properties-ci-${controlId}']`)
		.should("exist");
});

Cypress.Commands.add("verifyValueInSummaryPanelForCategory", (value, summaryName, rowNumber, categoryName) => {
	cy.get(".right-flyout-panel")
		.find(".properties-category-container")
		.find(".properties-category-title")
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

Cypress.Commands.add("verifySummaryPanelValueForParameterInConsole", (testValue, parameterName) => {
	// Verify that the event log has a value of "is_date" for the "expressionCellTable" parameter
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		const parameterValues = lastEventLog.data.form[parameterName];
		let found = false;
		for (var idx = 0; idx < parameterValues.length; idx++) {
			const parameter = parameterValues[idx];
			for (var indx = 0; indx < parameter.length; indx++) {
				if (parameter[indx] === testValue) {
					found = true;
					break;
				}
			}
		}
		expect(found).to.equal(true);
	});
});

Cypress.Commands.add("verifyIconInSubPanel", (iconName, panelName) => {
	cy.getWideFlyoutPanel(panelName)
		.then((wideFlyoutPanel) => {
			cy.wrap(wideFlyoutPanel)
				.find(".properties-expression-validate")
				.then((validateButton) => {
					if (iconName === "none") {
						cy.wrap(validateButton)
							.find(".validateIcon")
							.should("not.exist");
					} else {
						cy.wrap(validateButton)
							.find(".validateIcon")
							.then((icon) => {
								cy.wrap(icon)
									.find("svg")
									.invoke("attr", "class")
									.then((iconClass) => {
										expect(iconClass).to.include(iconName);
									});
							});
					}
				});
		});
});
