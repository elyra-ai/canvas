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

	this.Given(/^I have selected the "([^"]*)" palette layout$/, function(layout) {

		try {
			if (layout === "Modal") {
				const modalLabel = browser.$("#sidepanel-palette-layout").$$("div")[4].$("label");
				modalLabel.scroll();
				browser.pause(500);
				modalLabel.click();
			} else {
				const flyoutLabel = browser.$("#sidepanel-palette-layout").$$("div")[2].$("label");
				flyoutLabel.scroll();
				browser.pause(500);
				flyoutLabel.click();
			}
		} catch (err) {
			throw err;
		}
	});

};
