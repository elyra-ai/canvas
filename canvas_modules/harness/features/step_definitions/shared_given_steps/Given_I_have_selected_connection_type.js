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

	this.Then(/^I have selected the "([^"]*)" connection type$/, function(connectionType) {

		try {
			if (connectionType === "Ports") {
				var portsLabel = browser.$("#harness-sidepanel-connection-type").$$("div")[2].$("label");
				portsLabel.scroll();
				browser.pause(500);
				portsLabel.click();
			} else if (connectionType === "Halo") {
				var haloLabel = browser.$("#harness-sidepanel-connection-type").$$("div")[4].$("label");
				haloLabel.scroll();
				browser.pause(500);
				haloLabel.click();
			}
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}
	});

};
