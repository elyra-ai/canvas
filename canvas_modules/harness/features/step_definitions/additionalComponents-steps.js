/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global browser */

module.exports = function() {

	this.Then(/^I click on "([^"]*)" radio button$/, function(radioLabel) {
		const radioContainer = browser.$(".additional-components-radio-options");
		const radioOptions = radioContainer.$$("label");
		let radioFound = false;
		for (const label of radioOptions) {
			if (label.$("input").getAttribute("value") === radioLabel) {
				label.click();
				radioFound = true;
				break;
			}
		}
		expect(radioFound).toEqual(true);
	});

	this.Then("I click on the toggle with label displayAdditionalComponents", function() {
		const additionalComponentsToggle = browser.$("#sidepanel-properties-additional-components");
		const label = additionalComponentsToggle.$$("label");
		expect(label.length).toEqual(1);
		label[0].click();
	});
};
