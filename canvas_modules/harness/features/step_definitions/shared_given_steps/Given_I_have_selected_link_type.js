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

	this.Then(/^I have selected the "([^"]*)" link type$/, function(linkType) {

		try {
			if (linkType === "Curve") {
				var curveLabel = browser.$("#harness-sidepanel-link-type").$$("div")[2].$("label");
				curveLabel.scroll();
				browser.pause(500);
				curveLabel.click();
				nconf.set("linkType", "Curve");
			} else if (linkType === "Elbow") {
				var elbowLabel = browser.$("#harness-sidepanel-link-type").$$("div")[4].$("label");
				elbowLabel.scroll();
				browser.pause(500);
				elbowLabel.click();
				nconf.set("linkType", "Elbow");
			} else if (linkType === "Straight") {
				var straightLabel = browser.$("#harness-sidepanel-link-type").$$("div")[6].$("label");
				straightLabel.scroll();
				browser.pause(500);
				straightLabel.click();
				nconf.set("linkType", "Straight");
			}
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}
	});

};
