/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { loadCanvas, loadCanvas2, loadProperties } from "../utilities/test-utils.js";

module.exports = function() {

	this.Then(/^I have uploaded diagram "([^"]*)"$/, function(fileName) {
		loadCanvas(fileName);
	});

	this.Then(/^I have uploaded diagram for extra canvas "([^"]*)"$/, function(fileName) {
		loadCanvas2(fileName);
	});

	this.Then(/^I have uploaded common-properties file "([^"]*)" of type "([^"]*)"$/, function(fileName, fileType) {
		loadProperties(fileName, fileType);
	});

};
