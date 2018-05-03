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
const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
const getCanvasUrl2 = testUrl + "/v1/test-harness/canvas2";
const getEventLogUrl = testUrl + "/v1/test-harness/events";

function getCanvasData() {
	const canvasData = getServerData(getCanvasUrl);
	return canvasData.pipelines[0]; // Canvas info returned has an array of pipelines. Return the first.
}

function getCanvasDataForSecondCanvas() {
	const canvasData = getServerData(getCanvasUrl2);
	return canvasData.pipelines[0]; // Canvas info returned has an array of pipelines. Return the first.
}

function getEventLogData() {
	return getServerData(getEventLogUrl);
}

function getServerData(url) {
	browser.timeouts("script", 3000);
	let data = browser.executeAsync(getHarnessData, url);
	let dataObj = JSON.parse(data.value);
	// try again if data isn't found
	if (!dataObj.data) {
		browser.pause(500);
		data = browser.executeAsync(getHarnessData, url);
		dataObj = JSON.parse(data.value);
	}
	return dataObj;
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
	getCanvasData: getCanvasData,
	getCanvasDataForSecondCanvas: getCanvasDataForSecondCanvas,
	getEventLogData: getEventLogData,
	getLastEventLogData: getLastEventLogData,
	getLastLogOfType: getLastLogOfType,
	isSchemaValidationError: isSchemaValidationError
};
