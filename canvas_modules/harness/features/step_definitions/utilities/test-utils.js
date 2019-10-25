/*
 * Copyright 2017-2019 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

function getSelectedNodes() {
	const selectedNodes = browser.execute(function() {
		return document.canvasController.getSelectedNodes();
	});

	return selectedNodes.value;
}

function isNodeSelected(nodeName) {
	const find = getSelectedNodes().findIndex((selNode) => selNode.label === nodeName);
	if (find > -1) {
		return true;
	}
	return false;
}

function getSelectedComments() {
	const selectedComments = browser.execute(function() {
		return document.canvasController.getSelectedComments();
	});

	return selectedComments.value;
}

function isCommentSelected(commentText) {
	const find = getSelectedComments().findIndex((selCom) => selCom.content === commentText);
	if (find > -1) {
		return true;
	}
	return false;
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
		if (flyout.$(".properties-wf-title").getText() === panelName) {
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
	loadProperties: loadProperties,
	isNodeSelected: isNodeSelected,
	isCommentSelected: isCommentSelected
};
