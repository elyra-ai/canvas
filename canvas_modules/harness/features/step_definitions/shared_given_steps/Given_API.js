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

	this.Given(/^I have selected the "([^"]*)" API$/, function(api) {
		// get the list of drop down options.
		browser.$("#sidepanel-api-list").scroll();
		browser.$("#sidepanel-api-list")
			.$(".select")
			.$(".button")
			.click("svg");
		// get the list of drop down options.
		var apiList = browser.$("#sidepanel-api-list")
			.$(".select")
			.$(".select__options")
			.$$("button");
		for (var idx = 0; idx < apiList.length; idx++) {
			if (apiList[idx].getText() === api) {
				apiList[idx].click();
				break;
			}
		}
	});

};
