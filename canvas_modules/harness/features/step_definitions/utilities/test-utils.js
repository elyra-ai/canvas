/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global browser */

import { getBaseDir, getURL } from "./test-config.js";
import { getHarnessData } from "./HTTPClient-utils.js";


const testUrl = getURL();
const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
const getCanvasUrl2 = testUrl + "/v1/test-harness/canvas2";
const getEventLogUrl = testUrl + "/v1/test-harness/events";

function getCanvas() {
	const canvasData = getServerData(getCanvasUrl);
	return canvasData;
}

function getCanvasData() {
	const canvasData = getServerData(getCanvasUrl);
	return canvasData.pipelines[0]; // Canvas info returned has an array of pipelines. Return the first.
}

function getSecondCanvas() {
	const canvasData = getServerData(getCanvasUrl2);
	return canvasData;
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

function loadUnknownFile(dropdownElement, fileName) {
	dropdownSelect(dropdownElement, "Choose from location...");
	const fileInput = dropdownElement.$(".harness-sidepanel-file-uploader")
		.$("input");
	// this will not work with relative paths
	fileInput.setValue(getBaseDir() + fileName);
	dropdownElement.$(".harness-sidepanel-file-upload-submit")
		.click("button");
	browser.pause(600);
}

function dropdownSelect(dropdownElement, selectedItemName) {
	// need to click on the canvas drop down
	dropdownElement.click(".bx--dropdown");
	browser.pause(600);
	dropdownElement.$(".bx--dropdown-list")
		.moveToObject();
	browser.pause(600);
	// get the list of drop down options.
	const fileOptions = dropdownElement.$(".bx--dropdown-list")
		.$("li[value='" + selectedItemName + "']");
	fileOptions.scroll();
	browser.pause(600);
	fileOptions.click();
	browser.pause(600);
}

function selectSelect(selectElement, selectedItemName) {
	selectElement.click(".bx--select");
	browser.pause(600);
	selectElement.$(".bx--select-input")
		.moveToObject();
	browser.pause(600);
	// get the list of drop down options.
	const fileOptions = selectElement.$(".bx--select-input")
		.$("option[value='" + selectedItemName + "']");
	fileOptions.scroll();
	browser.pause(600);
	fileOptions.click();
	browser.pause(600);
}

module.exports = {
	getCanvas: getCanvas,
	getCanvasData: getCanvasData,
	getSecondCanvas: getSecondCanvas,
	getCanvasDataForSecondCanvas: getCanvasDataForSecondCanvas,
	getEventLogData: getEventLogData,
	getLastEventLogData: getLastEventLogData,
	getLastLogOfType: getLastLogOfType,
	isSchemaValidationError: isSchemaValidationError,
	dropdownSelect: dropdownSelect,
	loadUnknownFile: loadUnknownFile,
	selectSelect: selectSelect
};
