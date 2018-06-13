/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { dropdownSelect, loadUnknownFile, selectSelect } from "../utilities/test-utils.js";

module.exports = function() {

	/* global browser */
	this.Then(/^I have uploaded predefined diagram "([^"]*)"$/, function(diagramFile) {
		dropdownSelect(browser.$("#sidepanel-canvas-input"), diagramFile);
	});

	this.Then(/^I have uploaded diagram "([^"]*)"$/, function(diagramFile) {
		loadUnknownFile(browser.$("#sidepanel-canvas-input"), diagramFile);
	});

	this.Then(/^I have uploaded diagram for extra canvas "([^"]*)"$/, function(diagramFile) {
		loadUnknownFile(browser.$("#sidepanel-canvas-input2"), diagramFile);
	});

	this.Then(/^I have uploaded JSON for common-properties "([^"]*)"$/, function(propertiesFile) {
		selectSelect(browser.$("#sidepanel-input"), propertiesFile);
	});

};
