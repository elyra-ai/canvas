/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { getHarnessData } from "./utilities/HTTPClient.js";
import { getURL } from "./utilities/test-config.js";

/* global browser */

module.exports = function() {

	const testUrl = getURL();
	const getEventLogUrl = testUrl + "/v1/test-harness/events";

	this.Then(/^I see common properties flyout title "([^"]*)"$/, function(givenTitle) {
		browser.pause(500);
		var dialogTitle = browser.getValue("#node-title-editor-right-flyout-panel");
		expect(dialogTitle).toEqual(givenTitle);
	});

	this.Then(/^I open the "([^"]*)" category from flyout$/, function(categoryName) {
		const categories = browser.$("#category-parent-container-right-flyout-panel").$$(".category-title-container-right-flyout-panel");
		for (let idx = 0; idx < categories.length; idx++) {
			const category = categories[idx].$(".category-title-right-flyout-panel");
			if (category.getText() === categoryName.toUpperCase()) {
				category.click();
				break;
			}
		}
	});

	this.Then(/^I select "([^"]*)" radio button for Impurity from flyout$/, function(radioButtonOption) {
		var filterField = browser.$("#editor-control-checkpointInterval");
		filterField.setValue("", "1");

		var radioButtons = browser.$("#radioset-control-container").$$("label");
		for (let idx = 0; idx < radioButtons.length; idx++) {
			const radio = radioButtons[idx];
			if (radio.$("input").getAttribute("value") === radioButtonOption) {
				radio.click();
				break;
			}
		}

		var okButton = getPropertiesApplyButton();
		okButton.click();

		var lastEventLog = getLastEventLogData();

		expect("1").toEqual((lastEventLog.data.form.checkpointInterval).toString());
		expect(radioButtonOption).toEqual((lastEventLog.data.form.impurity).toString());

	});

	this.Then(/^I select Repeatable partition assignment checkbox and click Generate from flyout$/, function() {

		const labels = browser.$$("label");
		for (let idx = 0; idx < labels.length; idx++) {
			if (labels[idx].getAttribute("for") === "sample-seed") {
				labels[idx].click(); // click Repeatable partition assignment checkbox
				break;
			}
		}

		const numberGenerator = browser.$(".number-generator");
		numberGenerator.click();

		var okButton = getPropertiesApplyButton();
		okButton.click();

		var lastEventLog = getLastEventLogData();
		var checkboxPartitionClicked = JSON.stringify(lastEventLog).includes("samplingSeed");
		expect(true).toEqual(checkboxPartitionClicked);
		expect("-1").not.toEqual((lastEventLog.data.form.samplingSeed).toString());
	});

	this.Then(/^I check for validation error on Checkpoint Interval from flyout$/, function() {
		var checkpointIntervalTextBoxTest = browser.$("#editor-control-checkpointInterval");
		checkpointIntervalTextBoxTest.setValue("", 0);

		var errormessage1 = browser.$$(".editor_control_area")[2].$$("div")[3].$("p").$("span");
		var errormessage2 = errormessage1.getText();
		expect("The checkpoint interval value must either be >= 1 or -1 to disable").toEqual(errormessage2);

		var okButton = getPropertiesApplyButton();
		okButton.click();

	});

	this.Then(/^I check for table cell level validation from flyout$/, function() {
		var tableCell1 = browser.$$("#editor-control-renamed_fields")[0];
		tableCell1.setValue("", "Na");
		var tableCell2 = browser.$("#custom-container-right-flyout-panel");
		tableCell2.click();

		var errormessage1 = browser.$$(".validation-error-message")[0].$("span");
		var errormsg = errormessage1.getText();

		expect("The given column name is already in use in the current dataset").toEqual(errormsg);
		var okButton = getPropertiesApplyButton();
		okButton.click();
	});

	this.Then("I open the Table Input Sub Panel from flyout", function() {
		const buttons = browser.$("#structure-list-editor-table-buttons").$$("button");
		for (let idx = 0; idx < buttons.length; idx++) {
			if (buttons[idx].getText() === "...") {
				buttons[idx].click();
				break;
			}
		}
	});

	this.Then(/^I check the checkbox with id "([^"]*)"$/, function(checkboxId) {
		const labels = browser.$$("label");
		for (let idx = 0; idx < labels.length; idx++) {
			if (labels[idx].getAttribute("for") === checkboxId) {
				labels[idx].click();
				break;
			}
		}
	});

	function getLastEventLogData(override) {
		var message = 1;
		if (override) {
			message = override;
		}
		browser.timeouts("script", 3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
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
		return browser.$("#properties-apply-button");
	}
};
