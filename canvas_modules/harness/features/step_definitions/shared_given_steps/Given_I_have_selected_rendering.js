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

module.exports = function() {

/* global browser */

	this.Given(/^I have selected the "([^"]*)" rendering engine$/, function(renderingEngine) {

		try {
			if (renderingEngine === "D3") {
				var d3label = browser.$("#sidepanel-rendering-engine").$$("div")[2].$("label");
				d3label.scroll();
				browser.pause(500);
				d3label.click();
				nconf.set("renderingEngine", "D3");
			} else {
				var legacylabel = browser.$("#sidepanel-rendering-engine").$$("div")[4].$("label");
				legacylabel.scroll();
				browser.pause(500);
				legacylabel.click();
				nconf.set("renderingEngine", "Legacy");
			}
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}
	});

};
