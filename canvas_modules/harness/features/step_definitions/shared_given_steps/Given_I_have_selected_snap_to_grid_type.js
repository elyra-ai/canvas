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

	this.Then(/^I have selected the "([^"]*)" snap to grid type$/, function(snapToGridType) {

		try {
			if (snapToGridType === "During") {
				var duringLabel = browser.$("#harness-sidepanel-snap-to-grid-type").$$(".radioButtonWrapper")[1].$("label");
				duringLabel.scroll();
				browser.pause(500);
				duringLabel.click();
				nconf.set("snapToGridType", "During");
			} else if (snapToGridType === "After") {
				var afterLabel = browser.$("#harness-sidepanel-snap-to-grid-type").$$(".radioButtonWrapper")[2].$("label");
				afterLabel.scroll();
				browser.pause(500);
				afterLabel.click();
				nconf.set("snapToGridType", "After");
			} else {
				var noneLabel = browser.$("#harness-sidepanel-snap-to-grid-type").$$(".radioButtonWrapper")[0].$("label");
				noneLabel.scroll();
				browser.pause(500);
				noneLabel.click();
				nconf.set("snapToGridType", "None");
			}
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}
	});

};
