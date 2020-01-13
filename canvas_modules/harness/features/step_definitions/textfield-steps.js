/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import testUtils from "./utilities/test-utils.js";

module.exports = function() {
	// this is a workaround for subpanels.  For some reason the browser can't find the control just by data-id in a subpanel
	this.Then(/^I enter "([^"]*)" in textfield "([^"]*)" in sub-panel "([^"]*)"$/, function(value, controlId, panelName) {
		const panel = testUtils.getWideFlyoutPanel(panelName);
		var textbox = panel.$("div[data-id='properties-" + controlId + "']");
		textbox.$("input").setValue("", value);
	});
};
