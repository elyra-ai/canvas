/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

module.exports = function() {

/* global browser */

	this.Given("I have toggled the app side panel", function() {
		browser.$("#action-bar-sidepanel-canvas").click("a");
		browser.pause(550);
	});

	this.Given("I have toggled the app side common-properties panel", function() {
		browser.$("#action-bar-sidepanel-modal").click("a");
		browser.pause(550);
	});

	this.Given("I have toggled the app side api panel", function() {
		browser.$("#action-bar-sidepanel-api").click("a");
		browser.pause(550);
	});

	this.Then("I click on extra canvas toggle", function() {
		browser.$("#sidepanel-extra-canvas").$$("div")[1].$("div").$("label")
			.click();
	});

};
