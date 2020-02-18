/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

module.exports = function() {

	/* global browser */

	this.Then(/^I have selected the "([^"]*)" properties container type$/, function(containerType) {

		try {
			if (containerType === "Custom" || containerType === "Flyout") {
				var customContainer = browser.$("#harness-sidepanel-properties-container-type").$$(".bx--radio-button-wrapper")[0].$("label");
				customContainer.scroll();
				browser.pause(500);
				customContainer.click();
			} else if (containerType === "Modal") {
				var modalContainer = browser.$("#harness-sidepanel-properties-container-type").$$(".bx--radio-button-wrapper")[1].$("label");
				modalContainer.scroll();
				browser.pause(500);
				modalContainer.click();
			}
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}
	});

};
