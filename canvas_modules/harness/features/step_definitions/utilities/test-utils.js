/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global browser */

import { getHarnessData } from "./HTTPClient.js";
import { getURL } from "./test-config.js";


const testUrl = getURL();
const getEventLogUrl = testUrl + "/v1/test-harness/events";

function getLastEventLogData(override) {
	let message = 1;
	if (override) {
		message = override;
	}
	browser.timeouts("script", 3000);
	let eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
	let eventLogJSON = JSON.parse(eventLog.value);
	let lastEventLog = eventLogJSON[eventLogJSON.length - message];
	// try again if data isn't found
	if (!lastEventLog.data) {
		browser.pause(500);
		eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		eventLogJSON = JSON.parse(eventLog.value);
		lastEventLog = eventLogJSON[eventLogJSON.length - message];
	}
	return lastEventLog;
}


module.exports = {
	getLastEventLogData: getLastEventLogData
};
