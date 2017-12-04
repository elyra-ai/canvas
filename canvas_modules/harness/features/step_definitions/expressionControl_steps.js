/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { getAutoCompleteCount, selectAutoComplete, setTextValue } from "./utilities/codemirror_util.js";
import { getHarnessData } from "./utilities/HTTPClient.js";
import { getURL } from "./utilities/test-config.js";

/* global browser */
/* eslint max-depth: ["error", 6] */

module.exports = function() {

	const testUrl = getURL();
	const getEventLogUrl = testUrl + "/v1/test-harness/events";

	this.Then(/^I verify "([^"]*)" is a "([^"]*)" in ExpressionEditor$/, function(word, type) {
		const CMline = browser.$("#ExpressionEditor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-" + type;
		const testWord = (type === "string") ? "\"" + word + "\"" : word;

		expect(testWord).toEqual(CMline.$$(searchClass)[0].getText());

	});

	this.Then(/^I verify that the placeholder text is "([^"]*)" in ExpressionEditor$/, function(testText) {
		const CMplaceholder = browser.$("#ExpressionEditor").$(".CodeMirror-placeholder");

		expect(testText).toEqual(CMplaceholder.getText());

	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and verify that (\d+) autocomplete hints are displayed$/, function(enterText, hintCount) {

		const hintNumber = browser.execute(getAutoCompleteCount, enterText);
		expect(hintNumber.value).toEqual(Number(hintCount));

	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and verify error "([^"]*)" and save$/, function(enterText, errorText) {

		browser.execute(getAutoCompleteCount, enterText);
		const errLine = browser.$(".expression-validation-message");
		expect(errorText).toEqual(errLine.$(".form__validation--error").getText());

		var okButton = getPropertiesApplyButton();
		okButton.click();

	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and select "([^"]*)" a "([^"]*)"$/, function(enterText, selectText, type) {
		browser.execute(selectAutoComplete, enterText);
		const CMline = browser.$("#ExpressionEditor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-" + type;

		expect(selectText).toEqual(CMline.$$(searchClass)[0].getText());
	});


	this.Then(/^I enter "([^"]*)" in ExpressionEditor and verify it is a "([^"]*)"$/, function(enterText, type) {
		const setText = (type === "string") ? "\"" + enterText + "\"" : enterText;
		browser.execute(setTextValue, setText, false);
		browser.pause(3000);
		const CMline = browser.$("#ExpressionEditor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-" + type;
		expect(setText).toEqual(CMline.$$(searchClass)[0].getText());
	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and select "([^"]*)" and verify save$/, function(enterText, selectText) {
		browser.execute(selectAutoComplete, enterText);
		const CMline = browser.$("#ExpressionEditor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-keyword";

		expect(selectText).toEqual(CMline.$$(searchClass)[0].getText());

		var okButton = getPropertiesApplyButton();
		okButton.click();

		var lastEventLog = getLastEventLogData();

		expect(selectText).toEqual((lastEventLog.data.form.conditionExpr).toString());
	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and select "([^"]*)"$/, function(enterText, selectText) {
		browser.execute(selectAutoComplete, enterText);
		const CMline = browser.$("#ExpressionEditor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-keyword";

		expect(selectText).toEqual(CMline.$$(searchClass)[0].getText());
	});

	this.Then(/^I verify that the event log has a value of "([^"]*)" for the "([^"]*)" parameter$/, function(testValue, parameterName) {
		var lastEventLog = getLastEventLogData();
		var found = false;
		const parameterValues = lastEventLog.data.form[parameterName];
		if (Array.isArray(parameterValues)) {
			for (var idx = 0; idx < parameterValues.length; idx++) {
				const parameter = parameterValues[idx];
				if (Array.isArray(parameter)) {
					for (var indx = 0; indx < parameter.length; indx++) {
						if (parameter[indx] === testValue) {
							found = true;
						}
					}
				} else if (parameterValues === testValue) {
					found = true;
				}
			}
		} else if (parameterValues === testValue) {
			found = true;
		}
		expect(found).toBe(true);
	});


	function getLastEventLogData(override) {
		var message = 1;
		if (override) {
			message = override;
		}
		browser.timeouts("script", 3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		// console.log(eventLog.value);
		var eventLogJSON = JSON.parse(eventLog.value);
		var lastEventLog = eventLogJSON[eventLogJSON.length - message];
		// try again if data isn't found
		if (!lastEventLog.data) {
			browser.pause(500);
			eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
			eventLogJSON = JSON.parse(eventLog.value);
			lastEventLog = eventLogJSON[eventLogJSON.length - message];
		}
		return lastEventLog;
	}

	function getPropertiesApplyButton() {
		const applyButtons = browser.$$("#properties-apply-button");
		return applyButtons[applyButtons.length - 1];
	}

};
