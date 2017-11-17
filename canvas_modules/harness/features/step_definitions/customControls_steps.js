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

	this.Then(/^I click on toggle (\d+)$/, function(toggle) {
		var toggleBtn = browser.$$(".custom-toggle")[toggle].$$("div")[0];
		toggleBtn.click();
	});

	this.Then("I click on slider", function() {
		var sliderInput = browser.$(".text--slider");
		// needed since screen sizes can be different
		for (var cntr = 1; cntr < 200; cntr++) {
			browser.leftClick(".noUi-origin", 15, 2);
			var value = parseInt(sliderInput.getValue(), 10);
			if (value >= 65) {
				return;
			}
		}
	});

	this.Then("I verify custom panel", function() {
		var lastEventLog = getLastEventLogData();
		// Don't know the exact number but the slider value should be 65 or more
		expect(65).toBeLessThanOrEqual(parseInt(lastEventLog.data.form.custom_slider, 10));
		expect(false).toEqual(lastEventLog.data.form.custom_toggle);
		// expect 2 error messages from custom panels
		expect(2).toEqual(lastEventLog.data.messages.length);
	});

	this.Then("I select the Map Panel", function() {
		var category = browser.$("#category-title-0-right-flyout-panel");
		category.click();
	});

	this.Then("I show the map and go to SVL", function() {
		var showMapCheckbox = browser.$("#editor-control-map_checkbox");
		var applyButton = browser.$("#properties-apply-button");
		// var goToSVLButton = browser.$("#go_to_svl");

		showMapCheckbox.click();
		// This causes all element ids to be lost
		// goToSVLButton.click();
		applyButton.click();
	});

	this.Then("I verify custom control with structure property", function() {
		var lastEventLog = getLastEventLogData();
		// expect(37.1957).toEqual(lastEventLog.data.form.custom_map_info[0]);
		// expect(238.2518).toEqual(lastEventLog.data.form.custom_map_info[1]);
		// expect(18).toEqual(lastEventLog.data.form.custom_map_info[2]);
		expect(37.5).toEqual(lastEventLog.data.form.custom_map_info[0]);
		expect(238).toEqual(lastEventLog.data.form.custom_map_info[1]);
		expect(9).toEqual(lastEventLog.data.form.custom_map_info[2]);
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

};
