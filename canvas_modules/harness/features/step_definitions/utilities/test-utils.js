/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global browser */
var nconf = require("nconf");

function setCanvasConfig(config) {
	if (config.selectedPaletteLayout) {
		nconf.set("paletteLayout", config.selectedPaletteLayout);
	}
	if (config.selectedConnectionType) {
		nconf.set("connectionType", config.selectedConnectionType);
	}
	if (config.selectedLinkType) {
		nconf.set("linkType", config.selectedLinkType);
	}
	if (config.selectedConnectionType) {
		nconf.set("connectionType", config.selectedConnectionType);
	}
	if (config.selectedSnapToGridType) {
		nconf.set("snapToGridType", config.selectedSnapToGrodType);
	}

	browser.execute(function(cfg) {
		/* global document */
		document.setCanvasConfig(cfg);
	}, config);
}

function loadCanvas(fileName) {
	browser.execute(function(name) {
		document.setCanvasDropdownFile(name);
	}, fileName);
	browser.pause(600);
}

function loadCanvas2(fileName) {
	browser.execute(function(name) {
		document.setCanvasDropdownFile2(name);
	}, fileName);
	browser.pause(600);
}

function loadPalette(fileName) {
	browser.execute(function(name) {
		document.setPaletteDropdownSelect(name);
	}, fileName);
	browser.pause(600);
}

function loadPalette2(fileName) {
	browser.execute(function(name) {
		document.setPaletteDropdownSelect2(name);
	}, fileName);
	browser.pause(600);
}

function loadProperties(fileName, fileType) {
	browser.execute(function(name, type) {
		document.setPropertiesDropdownSelect(name, type);
	}, fileName, fileType);
	browser.pause(600);
}


function getCanvas() {
	const canvasData = browser.execute(function() {
		return document.canvasController.getCanvasInfo();
	});
	return canvasData.value;
}

function getCanvasData() {
	const canvasData = getCanvas();
	return canvasData.pipelines[0]; // Canvas info returned has an array of pipelines. Return the first.
}

function getSecondCanvas() {
	const canvasData = browser.execute(function() {
		return document.canvasController2.getCanvasInfo();
	});
	return canvasData.value;
}

function getCanvasDataForSecondCanvas() {
	const canvasData = getSecondCanvas();
	return canvasData.pipelines[0]; // Canvas info returned has an array of pipelines. Return the first.
}

function getEventLogData() {
	const eventLog = browser.execute(function() {
		return document.eventLog;
	});

	return eventLog.value;
}

function getLastEventLogData(override) {
	const eventLog = getEventLogData();
	const message = override ? override : 1;
	const lastEventLog = eventLog[eventLog.length - message];
	return lastEventLog;
}

function getLastLogOfType(logType) {
	const eventLog = getEventLogData();

	let lastEventLog = "";
	eventLog.forEach((log) => {
		if (log.event === logType) {
			lastEventLog = log;
		}
	});

	return lastEventLog;
}

function clearMessagesFromAllNodes() {
	browser.execute(function() {
		const canvasInfo = document.canvasController.getCanvasInfo();
		canvasInfo.pipelines.forEach((pipeline) => {
			pipeline.nodes.forEach((n) => {
				delete n.messages;
			});
		});
		document.canvasController.getObjectModel().setCanvasInfo(canvasInfo);
	});
}

function isSchemaValidationError() {
	const eventLog = getEventLogData();
	let schemaValError = false;
	eventLog.forEach((log) => {
		if (log.event === "Schema validation error") {
			schemaValError = true;
		}
	});
	return schemaValError;
}

function dropdownSelect(dropdownElement, selectedItemName) {
	// need to click on the canvas drop down
	dropdownElement.click(".bx--dropdown");
	browser.pause(600);
	dropdownElement.$(".bx--list-box__menu")
		.moveToObject();
	browser.pause(600);
	// get the list of drop down options.
	const fileOptions = dropdownElement.$(".bx--list-box__menu").$(".bx--list-box__menu-item=" + selectedItemName);
	fileOptions.scroll();
	browser.pause(600);
	fileOptions.click();
	browser.pause(600);
}

function useCmdOrCtrl() {
	const status = browser.status();
	const platform = status.value.os.name;
	if (platform.indexOf("Mac") > -1) {
		return "Meta";
	}
	return "Control";
}

function getWideFlyoutPanel(panelName) {
	const wideFlyouts = browser.$$(".properties-wf-content.show");
	let panel = null;
	for (var idx = 0; idx < wideFlyouts.length; idx++) {
		const flyout = wideFlyouts[idx];
		if (flyout.$("h2").getText() === panelName) {
			panel = flyout;
			break;
		}
	}
	return panel;
}

module.exports = {
	getCanvas: getCanvas,
	getCanvasData: getCanvasData,
	getSecondCanvas: getSecondCanvas,
	clearMessagesFromAllNodes: clearMessagesFromAllNodes,
	getCanvasDataForSecondCanvas: getCanvasDataForSecondCanvas,
	getEventLogData: getEventLogData,
	getLastEventLogData: getLastEventLogData,
	getLastLogOfType: getLastLogOfType,
	getWideFlyoutPanel: getWideFlyoutPanel,
	isSchemaValidationError: isSchemaValidationError,
	dropdownSelect: dropdownSelect,
	useCmdOrCtrl: useCmdOrCtrl,
	setCanvasConfig: setCanvasConfig,
	loadCanvas: loadCanvas,
	loadCanvas2: loadCanvas2,
	loadPalette: loadPalette,
	loadPalette2: loadPalette2,
	loadProperties: loadProperties
};
