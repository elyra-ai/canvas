/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global browser */

module.exports = function() {
	this.Then(/^I click the subpanel button in control "([^"]*)" in row "([^"]*)"$/, function(controlId, row) {
		var table = browser.$("div[data-id='properties-" + controlId + "']");
		table.$$(".properties-subpanel-button")[row].click();
		browser.pause(500);
	});
};
