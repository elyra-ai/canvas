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
/* eslint no-console: "off" */

import {
	findCategoryElement, findNodeIndexInPalette, getNodeSelector,
	getObjectModelCount
} from "./utilities/validate-utils.js";
import { getCanvasDataForSecondCanvas, getSecondCanvas } from "./utilities/test-utils.js";
import { simulateDragDrop } from "./utilities/dragAndDrop-utils.js";

/* global browser */

module.exports = function() {

	// Then I verify the extra canvas have a "Derive" node.
	this.Then(/^I verify extra canvas has a "([^"]*)" node$/, function(nodeName) {
		const nodeSelector = getNodeSelector(nodeName, "grp", true);
		const node = browser.$(nodeSelector);
		// Use getHTML() here instead of getText() incase the node is 'inactive' i.e. partly or fully off the screen
		// Also, take first 7substring the name were given (which is the full node name) because then
		// text in the DOM might be truncated.
		expect(node.getHTML().includes(nodeName.substring(0, 7))).toBe(true);
	});

	this.Then(/^I verify the number of nodes in extra canvas are (\d+)$/, function(nodes) {
		try {
			var nodesInCanvas = browser.$("#canvas-div-1").$$(".node-image").length;
			expect(Number(nodes)).toEqual(nodesInCanvas);

			// verify the number of nodes is in the internal object model
			var objectModel = getCanvasDataForSecondCanvas();
			var returnVal = getObjectModelCount(objectModel, "nodes", "");
			expect(returnVal).toBe(Number(nodes));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}
	});

	this.Then(/^I add node (\d+) a "([^"]*)" node from the "([^"]*)" category onto the extra canvas at (\d+), (\d+)$/,
		function(inNodeIndex, nodeType, nodeCategory, canvasX, canvasY) {
			try {
				var categoryElem = findCategoryElement(nodeCategory);
				categoryElem.click();
				// drag the var file node to the canvas
				const nodeIndex = findNodeIndexInPalette(nodeType);
				browser.execute(simulateDragDrop, ".palette-list-item", nodeIndex, "#canvas-div-1", 0, canvasX, canvasY);
				categoryElem.click(); // close category
			} catch (err) {
				console.log("Error = " + err);
				throw err;
			}
		});

	// Then I delete node 1 the "Var. File" node from extra canvas
	//
	this.Then(/^I delete node (\d+) the "([^"]*)" node from extra canvas$/, function(nodeIndex, nodeType) {
		var nodeNumber = nodeIndex - 1;
		var nodeSelector = ".d3-node-group";
		browser.$("#canvas-div-1").$$(nodeSelector)[nodeNumber].rightClick();

		const contextMenu = browser.$(".context-menu-popover").$$(".react-contextmenu-item");
		var menuItemDelete;
		for (var menuIdx = 0; menuIdx < contextMenu.length; menuIdx++) {
			var menuLabel = contextMenu[menuIdx].getText();
			if (menuLabel === "Delete") {
				menuItemDelete = contextMenu[menuIdx];
			}
		}
		// console.log("test Menu item delete? " + JSON.stringify(menuItemDelete));
		menuItemDelete.click();
	});

	this.Then(/^I select node (\d+) the "([^"]*)" node from extra canvas$/, function(nodeIndex, nodeName) {
		var nodeNumber = nodeIndex - 1;
		browser.$("#canvas-div-1").$$(".d3-node-group")[nodeNumber].click();
	});

	this.Then(/^I double click the "([^"]*)" node to open its properties in extra canvas$/, function(nodeName) {
		const nodeSelector = getNodeSelector(nodeName, "grp", true);
		browser.$(nodeSelector).doubleClick();
		browser.pause(1000); // Wait for properties to be displayed
	});

	this.Then(/^I drag the Derive Node from side panel to extra canvas at (\d+), (\d+)$/, function(xPos, yPos) {
		browser.execute(simulateDragDrop, "#harness-sidePanelNodeDraggable", 0, "#canvas-div-1", 0, xPos, yPos);
	});

	this.Then(/^I verify the extra canvas have (\d+) pipelines$/, function(numPipelines) {
		const objectModel = getSecondCanvas();
		expect(objectModel.pipelines.length).toEqual(Number(numPipelines));
	});

	this.Then(/^I verify the extra canvas pipeline (\d+) have (\d+) nodes$/, function(pipelineNum, numNodes) {
		const objectModel = getSecondCanvas();
		expect(objectModel.pipelines[pipelineNum].nodes.length).toEqual(Number(numNodes));
	});
};
