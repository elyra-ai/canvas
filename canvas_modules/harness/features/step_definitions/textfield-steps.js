/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global browser */

module.exports = function() {
	// this is a workaround for subpanels.  For some reason the browser can't find the control just by data-id in a subpanel
	this.Then(/^I enter "([^"]*)" in textfield "([^"]*)" in parent control "([^"]*)" in row "([^"]*)"$/, function(value, controlId, parentControlId, row) {
		var table = browser.$("div[data-id='properties-" + parentControlId + "']");
		var subpanel = table.$$(".properties-table-subcell")[row];
		var textbox = subpanel.$("div[data-id='properties-" + controlId + "']");
		textbox.$("input").setValue("", value);
	});
};
