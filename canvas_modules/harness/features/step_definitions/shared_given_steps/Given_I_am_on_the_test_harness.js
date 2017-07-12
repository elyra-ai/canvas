/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { getURL } from "../utilities/test-config.js";

module.exports = function() {

	this.setDefaultTimeout(120 * 1000);

	/* global browser */

	this.Given("I am on the test harness", function() {
		browser.url(getURL());
	});
};
