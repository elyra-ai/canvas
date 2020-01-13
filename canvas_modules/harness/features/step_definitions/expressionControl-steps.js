/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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

	this.Then(/^I click on the validate link on the expression builder in the sub-panel\.$/, function() {
		const expressionSubPanel = testUtils.getWideFlyoutPanel("Expression Builder");
		const validateLink = expressionSubPanel
			.$(".properties-expression-validate")
			.$(".validateLink");
		browser.pause(500);
		validateLink.click();
	});

	this.Then(/^I validate the "([^"]*)" icon on the expression builder\.$/, function(iconName) {
		const expressionSubPanel = testUtils.getWideFlyoutPanel("Expression Builder");
		const icon = expressionSubPanel
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
		const expressionSubPanel = testUtils.getWideFlyoutPanel("Expression Builder");
		const tabs = expressionSubPanel.$(".properties-expression-selection-fieldOrFunction")
			.$$("a");
		tabs.forEach((tab) => {
			if (tab.getText() === tabName) {
				tab.click();
			}
		});

	});

	this.Then(/^I select "([^"]*)" from the "([^"]*)" property\.$/, function(value, propertyName) {
		const expressionSubPanel = testUtils.getWideFlyoutPanel("Expression Builder");
		const tableRows = expressionSubPanel.$$("div[role='properties-data-row']");
		const foundRow = getRowMatch(tableRows, value);
		expect(foundRow).not.toBe(null);
		foundRow.doubleClick();
	});

	function getRowMatch(tableRows, value) {
		for (let idx = 0; idx < tableRows.length; idx++) {
			const columns = tableRows[idx].$$(".properties-expr-table-cell");
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
