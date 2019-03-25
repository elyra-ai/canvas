
/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { getURL } from "./utilities/test-config.js";
import { postData } from "./utilities/HTTPClient-utils.js";

module.exports = function() {
	/* global browser */
	/* global window */
	// post code coverage reports
	this.After(function() {
		const url = `${getURL()}/coverage/client`;
		const covObj = browser.execute(() => window.__coverage__);
		if (covObj && covObj.value) {
			const covStr = JSON.stringify(covObj.value);
			browser.executeAsync(postData, url, covStr);
		}
	});
};
