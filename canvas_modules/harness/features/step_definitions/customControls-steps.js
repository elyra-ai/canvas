/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import testUtils from "./utilities/test-utils.js";

/* global browser */

module.exports = function() {

	this.Then(/^I click on toggle (\d+)$/, function(toggle) {
		const toggleBtn = browser.$$(".custom-toggle")[toggle].$$("div")[0];
		toggleBtn.click();
	});

	this.Then("I click on slider", function() {
		const sliderInput = browser.$(".bx--slider");
		// needed since screen sizes can be different
		for (var cntr = 15; cntr < 600; cntr += 15) {
			browser.leftClick(".bx--slider__track", cntr, 2);
			const value = parseInt(sliderInput.getValue(), 10);
			if (value >= 65) {
				return;
			}
		}
	});

	this.Then(/^I validate the dropdown has (\d+) options$/, function(numOptions) {
		browser.$("div[data-id='properties-color']").click(".bx--dropdown-v2");
		browser.pause(500);
		const options = browser.$("div[data-id='properties-color").$$(".bx--list-box__menu-item");
		expect(options.length).toEqual(Number(numOptions));
	});

	this.Then("I verify custom summary panel", function() {
		// check to see if there are 2 rows of data in the summary panel
		const dataRows = browser.$$(".properties-summary-values");
		expect(dataRows.length).toEqual(3);
		// check the custom react object is render correctly
		const customMap = browser.$(".custom-map-summary").$$(".span-text");
		expect(customMap.length).toEqual(3);
	});

	this.Then("I verify custom panel", function() {
		const lastEventLog = testUtils.getLastEventLogData();
		// Don't know the exact number but the slider value should be 65 or more
		expect(65).toBeLessThanOrEqual(parseInt(lastEventLog.data.form.custom_slider, 10));
		expect(false).toEqual(lastEventLog.data.form.custom_toggle);
		expect(18).toEqual(lastEventLog.data.form.map_zoom);
		expect(41.113575).toEqual(lastEventLog.data.form.custom_map_info[0]);
		expect(-73.716052).toEqual(lastEventLog.data.form.custom_map_info[1]);
		expect(18).toEqual(lastEventLog.data.form.custom_map_info[2]);

		// expect 2 error messages from custom panels
		expect(2).toEqual(lastEventLog.data.messages.length);
	});

	this.Then(/^I click on "([^"]*)" button$/, function(dataId) {
		const button = browser.$(`button[data-id='${dataId}']`);
		button.click();
	});

	this.Then("I show the map", function() {
		const showMapCheckbox = browser.$("div[data-id='properties-checkbox-panel']")
			.$(".properties-tooltips-container")
			.$("label");
		showMapCheckbox.click();
	});

	this.Then(/^I validate map has error$/, function() {
		const icon = browser.$$(".custom-map .icon svg");
		expect(icon.length).toEqual(1);
	});
};
