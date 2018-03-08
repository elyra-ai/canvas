/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global browser */

module.exports = function() {

	this.Then(/^I select the "([^"]*)" button on the "([^"]*)" parameter$/, function(buttonName, parameterName) {
		const constainer = browser.$("#moveablerow-table-" + parameterName)
			.$("#field-picker-buttons-container");
		let button;
		if (buttonName === "Add") {
			button = constainer.$("#add-fields-button");
		} else if (buttonName === "Remove") {
			button = constainer.$(".remove-fields-button:not([disabled])");
		}
		button.click();
		browser.pause(500);
	});

	this.Then(/^I verify that the "([^"]*)" parameter contains the "([^"]*)" value$/, function(parameterName, fieldName) {
		const tableRows = browser.$("#flexible-table-" + parameterName).$$(".column-select-table-row");
		expect(tableRows.length).not.toEqual(0);
		var found = false;
		for (var idx = 0; idx < tableRows.length; idx++) {
			if (tableRows[idx].getText() === fieldName) {
				found = true;
				break;
			}
		}
		expect(found).toBe(true);
	});

	this.Then(/^I verify that the "([^"]*)" parameter has (\d+) values$/, function(parameterName, rows) {
		const tableRows = browser.$("#flexible-table-" + parameterName).$$(".column-select-table-row");
		expect(tableRows.length).toEqual(Number(rows));

	});

	this.Then(/^I select the "([^"]*)" row in the "([^"]*)" panel$/, function(fieldName, parameterName) {
		const tableRows = browser.$("#flexible-table-" + parameterName).$$(".column-select-table-row");
		expect(tableRows.length).not.toEqual(0);
		for (var idx = 0; idx < tableRows.length; idx++) {
			if (tableRows[idx].getText() === fieldName) {
				tableRows[idx].click();
				break;
			}
		}
	});

	this.Then(/^I validate the "([^"]*)" message for the "([^"]*)" parameter of "([^"]*)"$/, function(msgType, parameterName, msg) {
		const errorMessage = browser.$("#moveablerow-table-" + parameterName)
			.$(".validation-error-message")
			.$("span")
			.getText();
		expect(errorMessage).toEqual(msg);
	});

	this.Then(/^I verify that "([^"]*)" is disabled$/, function(parameterName) {
		const table = browser.$("#moveablerow-table-" + parameterName).$(".structure-table-content-row");
		expect(table.getAttribute("style")).toEqual("color: rgb(199, 199, 199); border-color: rgb(199, 199, 199); pointer-events: none;");
	});

	this.Then(/^I verify that "([^"]*)" is enabled$/, function(parameterName) {
		const table = browser.$("#moveablerow-table-" + parameterName).$(".structure-table-content-row");
		expect(table.getAttribute("style")).toEqual("");

	});

	this.Then(/^I verify that "([^"]*)" is hidden$/, function(parameterName) {
		const table = browser.$("#moveablerow-table-" + parameterName).$(".structure-table-content-row");
		expect(table.getAttribute("style")).toEqual("display: none;");
	});

	this.Then(/^I verify that "([^"]*)" is not hidden$/, function(parameterName) {
		const table = browser.$("#moveablerow-table-" + parameterName).$(".structure-table-content-row");
		expect(table.getAttribute("style")).not.toEqual("display: none;");

	});

};
