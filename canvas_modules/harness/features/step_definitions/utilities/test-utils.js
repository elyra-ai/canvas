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

function getEventLogData() {
	browser.timeouts("script", 3000);
	let eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
	let eventLogJSON = JSON.parse(eventLog.value);
	// try again if data isn't found
	if (!eventLogJSON.data) {
		browser.pause(500);
		eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		eventLogJSON = JSON.parse(eventLog.value);
	}
	return eventLogJSON;
}

function getLastEventLogData(override) {
	const eventLogJSON = getEventLogData();
	const message = override ? override : 1;
	const lastEventLog = eventLogJSON[eventLogJSON.length - message];
	return lastEventLog;
}

function getLastLogOfType(logType) {
	const eventLogJSON = getEventLogData();

	let lastEventLog = "";
	for (const log of eventLogJSON) {
		if (log.event === logType) {
			lastEventLog = log;
		}
	}
	return lastEventLog;
}

function isSchemaValidationError() {
	const eventLogJSON = getEventLogData();
	let schemaValError = false;
	for (const log of eventLogJSON) {
		if (log.event === "Schema validation error") {
			schemaValError = true;
		}
	}
	return schemaValError;
}


module.exports = {
	getLastEventLogData: getLastEventLogData,
	getLastLogOfType: getLastLogOfType,
	isSchemaValidationError: isSchemaValidationError
};
