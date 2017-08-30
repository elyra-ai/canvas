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
	});

	this.Given("I have toggled the app side common-properties panel", function() {
		browser.$("#action-bar-sidepanel-modal").click("a");
		browser.pause(500);
	});

};
