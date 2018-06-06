/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import { dropdownSelect } from "../utilities/test-utils.js";

module.exports = function() {

/* global browser */

	this.Given(/^I have selected the "([^"]*)" API$/, function(api) {
		dropdownSelect(browser.$("#sidepanel-api-list"), api);
	});

};
