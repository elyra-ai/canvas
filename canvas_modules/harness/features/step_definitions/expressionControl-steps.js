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

import { getAutoCompleteCount, selectAutoComplete, setTextValue } from "./utilities/codeMirror-utils.js";
import testUtils from "./utilities/test-utils.js";


/* global browser */
/* eslint max-depth: ["error", 6] */

module.exports = function() {

	this.Then(/^I verify "([^"]*)" is a "([^"]*)" in ExpressionEditor$/, function(word, type) {
		const searchClass = ".cm-" + type;
		const testWord = (type === "string") ? "\"" + word + "\"" : word;
		const CMline = browser.$(".properties-expression-editor").$$(".CodeMirror-line");
		let found = false;
		for (let idx = 0; idx < CMline.length; idx++) {
			if (CMline[idx].$$(searchClass)[0] && testWord === CMline[idx].$$(searchClass)[0].getText()) {
				found = true;
				break;
			}
		}
		expect(found).toEqual(true);
	});

	this.Then(/^I verify that the placeholder text is "([^"]*)" in ExpressionEditor$/, function(testText) {
		const CMplaceholder = browser.$(".properties-expression-editor").$(".CodeMirror-placeholder");

		expect(testText).toEqual(CMplaceholder.getText());

	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and verify that (\d+) autocomplete hints are displayed$/, function(enterText, hintCount) {

		const hintNumber = browser.execute(getAutoCompleteCount, enterText);
		expect(hintNumber.value).toEqual(Number(hintCount));

	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and verify error "([^"]*)" and save$/, function(enterText, errorText) {

		browser.execute(getAutoCompleteCount, enterText);
		const errLine = browser.$(".properties-validation-message");
		expect(errorText).toEqual(errLine.$("span").getText());

		var okButton = getPropertiesApplyButton();
		okButton.click();

	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and select "([^"]*)" a "([^"]*)"$/, function(enterText, selectText, type) {
		browser.execute(selectAutoComplete, enterText);
		const CMline = browser.$(".properties-expression-editor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-" + type;

		expect(selectText).toEqual(CMline.$$(searchClass)[0].getText());
	});


	this.Then(/^I enter "([^"]*)" in ExpressionEditor and verify it is a "([^"]*)"$/, function(enterText, type) {
		const setText = (type === "string") ? "\"" + enterText + "\"" : enterText;
		browser.execute(setTextValue, setText, false);
		browser.pause(500);
		const CMline = browser.$(".properties-expression-editor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-" + type;
		expect(setText).toEqual(CMline.$$(searchClass)[0].getText());
	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and select "([^"]*)" and verify save$/, function(enterText, selectText) {
		browser.execute(selectAutoComplete, enterText);
		const CMline = browser.$(".properties-expression-editor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-keyword";

		expect(selectText).toEqual(CMline.$$(searchClass)[0].getText());

		var okButton = getPropertiesApplyButton();
		okButton.click();

		var lastEventLog = testUtils.getLastEventLogData();

		expect(selectText).toEqual((lastEventLog.data.form.conditionExpr).toString());
	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and select "([^"]*)" $/, function(enterText, selectText) {
		browser.execute(selectAutoComplete, enterText);
		const CMline = browser.$(".properties-expression-editor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-keyword";

		expect(selectText).toEqual(CMline.$$(searchClass)[0].getText());
	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and select "([^"]*)"$/, function(enterText, selectText) {
		browser.execute(selectAutoComplete, enterText);
	});

	this.Then(/^I verify error "([^"]*)"$/, function(errorMsg) {
		const expMsg = browser.$(".properties-validation-message")
			.$("span")
			.getText();
		expect(errorMsg).toEqual(expMsg);
	});

	this.Then("I click on the validate link.", function() {
		browser.$(".properties-expression-validate")
			.$(".validateLink")
			.click();
	});

	this.Then(/^I verify that the event log has a value of "([^"]*)" for the "([^"]*)" parameter$/, function(testValue, parameterName) {
		var lastEventLog = testUtils.getLastEventLogData();
		var found = false;
		const parameterValues = lastEventLog.data.form[parameterName];
		if (Array.isArray(parameterValues)) {
			for (var idx = 0; idx < parameterValues.length; idx++) {
				const parameter = parameterValues[idx];
				if (Array.isArray(parameter)) {
					for (var indx = 0; indx < parameter.length; indx++) {
						if (parameter[indx] === testValue) {
							found = true;
							break;
						}
					}
				} else if (parameterValues === testValue) {
					found = true;
					break;
				}
			}
		} else if (parameterValues === testValue) {
			found = true;
		}
		expect(found).toBe(true);
	});

	this.Then(/^I click on the expression build button for the "([^"]*)" property$/, function(propertyName) {
		browser.$("div[data-id='properties-ci-" + propertyName + "']")
			.$(".properties-expression-button")
			.$("button")
			.click();

	});

	this.Then(/^I click on the validate link on the expression "([^"]*)" for the "([^"]*)" property\.$/, function(controlType, propertyName) {
		const typeSelector = (controlType === "builder") ? ".properties-wf-content" : ".properties-expression-editor-wrapper .properties-editor-container";
		const validateLink = browser.$("div[data-id='properties-ci-" + propertyName + "']")
			.$(typeSelector)
			.$(".properties-expression-validate")
			.$(".validateLink");
		browser.pause(500);
		validateLink.click();
	});

	this.Then(/^I validate the "([^"]*)" icon on the expression "([^"]*)" for the "([^"]*)" property\.$/, function(iconName, controlType, propertyName) {
		const typeSelector = (controlType === "builder") ? ".properties-wf-content" : ".properties-expression-editor-wrapper .properties-editor-container";
		const icon = browser.$("div[data-id='properties-ci-" + propertyName + "']")
			.$(typeSelector)
			.$(".properties-expression-validate")
			.$$(".validateIcon");
		if (icon.length === 0 && iconName === "none") {
			return;
		}
		const iconClass = icon[0].$("svg").getAttribute("class");
		const iconCheck = (iconName === "success") ? "info" : iconName;
		expect(iconClass).toEqual(iconCheck);
	});

	this.Then(/^I select the "([^"]*)" tab for the "([^"]*)" property\.$/, function(tabName, propertyName) {
		const tabs = browser.$("div[data-id='properties-ci-" + propertyName + "']")
			.$(".properties-expression-selection-fieldOrFunction")
			.$$("a");
		tabs.forEach((tab) => {
			if (tab.getText() === tabName) {
				tab.click();
			}
		});

	});

	this.Then(/^I select "([^"]*)" from the "([^"]*)" table for the "([^"]*)" property\.$/, function(value, tableType, propertyName) {
		const tableRows = browser.$("div[data-id='properties-ci-" + propertyName + "']")
			.$(".properties-" + tableType + "-table-container")
			.$$("tr");
		const foundRow = getRowMatch(tableRows, value);
		if (foundRow) {
			foundRow.doubleClick();
		}
	});

	function getRowMatch(tableRows, value) {
		for (let idx = 0; idx < tableRows.length; idx++) {
			const columns = tableRows[idx].$$("td");
			for (let index = 0; index < columns.length; index++) {
				if (columns[index].getText() === value) {
					return tableRows[idx];
				}
			}
		}
		return null;
	}

	function getPropertiesApplyButton() {
		const applyButtons = browser.$$(".properties-apply-button");
		return applyButtons[applyButtons.length - 1];
	}
};
