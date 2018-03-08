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
			if (fixedLayout === "None") {
				var noneLabel = browser.$("#sidepanel-layout-direction").$$("div")[2].$("label");
				noneLabel.scroll();
				browser.pause(500);
				noneLabel.click();
			} else if (fixedLayout === "Horizontal") {
				var horizontalLabel = browser.$("#sidepanel-layout-direction").$$("div")[4].$("label");
				horizontalLabel.scroll();
				browser.pause(500);
				horizontalLabel.click();
			} else if (fixedLayout === "Vertical") {
				var verticalLabel = browser.$("#sidepanel-layout-direction").$$("div")[6].$("label");
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
				var customContainer = browser.$("#sidepanel-properties-container-type").$$("div")[2].$("label");
				customContainer.scroll();
				browser.pause(500);
				customContainer.click();
			} else if (containerType === "Modal") {
				var modalContainer = browser.$("#sidepanel-properties-container-type").$$("div")[4].$("label");
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
