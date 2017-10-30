/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

var nconf = require("nconf");

/* global browser */

module.exports = function() {

	// Then I start flow validation
	//
	this.Then(/^I start flow validation$/,
		function() {
			const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
			// create the comment
			if (D3RenderingEngine) {
				browser.rightClick(".svg-area", 200, 200);
			} else {
				browser.rightClick(".svg-canvas", 200, 200);
			}
			browser.$(".context-menu-popover").$$(".react-contextmenu-item")[9].click();
		});

	// Then I verify that there are 1 nodes with a "warning" indicator
	//
	this.Then(/^I verify that there are (\d+) nodes with a "([^"]*)" indicator$/,
		function(numberNodes, msgIndicator) {
			const messageClassName = ".d3-" + msgIndicator + "-circle";
			const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
			if (D3RenderingEngine) {
				expect(Number(numberNodes)).toEqual(browser.$("#common-canvas").$$(messageClassName).length);
			} else {
				// flow validation message indicator not supported in legacy rendering
			}
		});

};
