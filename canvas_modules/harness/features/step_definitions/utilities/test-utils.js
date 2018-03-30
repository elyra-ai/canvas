/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global browser */

import { getHarnessData } from "./HTTPClient-utils.js";
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

function getLastLogOfType(logType) {
	browser.timeouts("script", 3000);
	let eventLogData = browser.executeAsync(getHarnessData, getEventLogUrl);
	let eventLog = JSON.parse(eventLogData.value);
	let lastEventLog;
	for (const log of eventLog) {
		if (log.event === logType) {
			lastEventLog = log;
		}
	}
	// try again if data isn't found
	if (!lastEventLog) {
		browser.pause(500);
		eventLogData = browser.executeAsync(getHarnessData, getEventLogUrl);
		eventLog = JSON.parse(eventLog.value);
		for (const log of eventLog) {
			if (log.event === logType) {
				lastEventLog = log.event;
			}
		}
	}
	return lastEventLog;
}


module.exports = {
	getLastEventLogData: getLastEventLogData,
	getLastLogOfType: getLastLogOfType
};
