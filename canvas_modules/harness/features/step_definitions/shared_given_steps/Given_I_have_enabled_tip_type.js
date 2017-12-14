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

	this.Then(/^I have toggled the "([^"]*)" tip type$/, function(tipType) {

		try {
			let label;
			switch (tipType) {
			case "Palette":
				label = browser.$("#sidepanel-tip-config").$$("div")[1].$("label");
				break;
			case "Nodes":
				label = browser.$("#sidepanel-tip-config").$$("div")[2].$("label");
				break;
			case "Ports":
				label = browser.$("#sidepanel-tip-config").$$("div")[3].$("label");
				break;
			case "Links":
				label = browser.$("#sidepanel-tip-config").$$("div")[4].$("label");
				break;
			default:
			}

			if (label) {
				label.click();
			}
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}
	});

};
