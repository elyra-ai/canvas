/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

module.exports = function() {

	/* global browser */

	this.Then(/^I have selected the "([^"]*)" fixed Layout$/, function(fixedLayout) {

		try {
			if (fixedLayout === "none") {
				var noneLabel = browser.$("#harness-sidepanel-layout-direction").$$(".radioButtonWrapper")[0].$("label");
				noneLabel.scroll();
				browser.pause(500);
				noneLabel.click();
			} else if (fixedLayout === "horizontal") {
				var horizontalLabel = browser.$("#harness-sidepanel-layout-direction").$$(".radioButtonWrapper")[1].$("label");
				horizontalLabel.scroll();
				browser.pause(500);
				horizontalLabel.click();
			} else if (fixedLayout === "vertical") {
				var verticalLabel = browser.$("#harness-sidepanel-layout-direction").$$(".radioButtonWrapper")[2].$("label");
				verticalLabel.scroll();
				browser.pause(500);
				verticalLabel.click();
			}
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}

	});

	this.Then(/^I have selected the "([^"]*)" properties container type$/, function(containerType) {

		try {
			if (containerType === "Custom" || containerType === "Flyout") {
				var customContainer = browser.$("#harness-sidepanel-properties-container-type").$$(".radioButtonWrapper")[0].$("label");
				customContainer.scroll();
				browser.pause(500);
				customContainer.click();
			} else if (containerType === "Modal") {
				var modalContainer = browser.$("#harness-sidepanel-properties-container-type").$$(".radioButtonWrapper")[1].$("label");
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
