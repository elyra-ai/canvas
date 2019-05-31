/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */
/* eslint max-depth: ["error", 5] */

import { clickSVGAreaAt, doesTipExist, doesTipExistInSubFlow, findCategoryElement, findNodeIndexInPalette,
	getNodePortSelector, getNodePortTipSelector, getNodeSelector, getNodeSelectorInSubFlow,
	getNumberOfSelectedComments, getNumberOfSelectedNodes } from "./utilities/validate-utils.js";
import { getCanvas, isSchemaValidationError, useCmdOrCtrl } from "./utilities/test-utils.js";

/* global browser */

const hoverTime = 800;

module.exports = function() {

	this.Then("I press Ctrl/Cmnd+X to Cut", function() {
		const useKey = useCmdOrCtrl();
		browser.keys([useKey, "x", useKey, "x"]);
	});

	this.Then("I press Ctrl/Cmnd+C to Copy", function() {
		const useKey = useCmdOrCtrl();
		browser.keys([useKey, "c", useKey, "c"]);
	});

	this.Then("I press Ctrl/Cmnd+V to Paste", function() {
		const useKey = useCmdOrCtrl();
		browser.keys([useKey, "v", useKey, "v"]);
	});

	this.Then("I press Ctrl/Cmnd+Z to Undo", function() {
		clickSVGAreaAt(1, 1); // Put foucs on the SVG area, ready for key press
		const useKey = useCmdOrCtrl();
		browser.keys([useKey, "z", useKey, "z"]);
	});

	this.Then("I press Ctrl/Cmnd+Shift+Z to Redo", function() {
		clickSVGAreaAt(1, 1); // Put foucs on the SVG area, ready for key press
		const useKey = useCmdOrCtrl();
		browser.keys([useKey, "Shift", "z", useKey, "Shift", "z"]);
	});

	this.Then("I press Ctrl/Cmnd+Y to Redo", function() {
		clickSVGAreaAt(1, 1); // Put foucs on the SVG area, ready for key press
		const useKey = useCmdOrCtrl();
		browser.keys([useKey, "y", useKey, "y"]);
	});

	this.Then(/^I click the canvas background at (\d+), (\d+) to close the context menu or clear selections$/, function(xCoord, yCoord) {
		clickSVGAreaAt(xCoord, yCoord); // Put foucs on the SVG area, ready for key press
	});

	this.Then(/^I right click at position (\d+), (\d+) to display the context menu$/, function(xCoord, yCoord) {
		browser.rightClick(".svg-area", Number(xCoord), Number(yCoord));
	});

	this.Then("I verify there were no schema validation errors", function() {
		const schemaValErr = isSchemaValidationError();
		expect(schemaValErr).toEqual(false);
	});

	this.Then(/^I verify the context menu is at (\d+), (\d+)$/, function(xCoord, yCoord) {
		var left = browser.getCssProperty(".context-menu-popover", "left");
		var top = browser.getCssProperty(".context-menu-popover", "top");
		expect(left[0].value).toEqual(xCoord + "px");
		expect(top[0].value).toEqual(yCoord + "px");
	});

	this.Then(/^I verify the submenu is pushed up by (\d+) pixels$/, function(pushupValue) {
		var top = browser.getCssProperty(".context-menu-popover", "top");
		expect(top[2].value).toEqual(-pushupValue + "px");
	});


	this.Then(/^I verify the context menu has a "([^"]*)" item$/, function(itemText) {
		var items = browser.$$(".react-contextmenu-item");
		var found = false;

		for (var idx = 0; idx < items.length; idx++) {
			if (items[idx].getText() === itemText) {
				found = true;
				break;
			}
		}
		expect(found).toEqual(true);
	});

	this.Then(/^I verify that (\d+) objects are selected$/, function(numberOfSelectedObjects) {
		const selected = getNumberOfSelectedNodes() + getNumberOfSelectedComments();
		expect(selected).toEqual(Number(numberOfSelectedObjects));
	});

	this.Then(/^I click option "([^"]*)" from the "([^"]*)" submenu$/, function(itemText, submenuName) {
		var items = browser.$(".context-menu-popover").$$(".react-contextmenu-item:not(.contextmenu-divider)");
		let menuItemFound = false;
		for (let idx = 0; idx < items.length; idx++) {
			if (items[idx].getText() === submenuName) {
				items[idx].click();
				const subMenu = browser.$(".contextmenu-submenu").$$(".react-contextmenu-item");
				browser.pause(500);
				for (let indx = 0; indx < subMenu.length; indx++) {
					if (subMenu[indx].getText() === itemText) {
						subMenu[indx].click();
						menuItemFound = true;
						break;
					}
				}
				break;
			}
		}
		expect(menuItemFound).toBe(true);
	});

	this.Then(/^I click option "([^"]*)" from the context menu$/, function(itemText) {
		var items = browser.$(".context-menu-popover").$$(".react-contextmenu-item:not(.contextmenu-divider)");
		let menuItemFound = false;
		for (let idx = 0; idx < items.length; idx++) {
			if (items[idx].getText() === itemText) {
				items[idx].click();
				menuItemFound = true;
				break;
			}
		}
		expect(menuItemFound).toBe(true);
	});

	this.Then("I select all objects in the canvas via Ctrl/Cmnd+A", function() {
		browser.click(".svg-area", Number(10), Number(10));
		const useKey = useCmdOrCtrl();
		browser.keys([useKey, "A", "A", useKey]);
	});

	this.Then("I delete all selected objects via the Delete key", function() {
		browser.keys("Delete");
		browser.pause(200);
	});

	this.Then(/^I hover over category "([^"]*)"$/, function(category) {
		const categoryElem = findCategoryElement(category);
		categoryElem.moveToObject();
		browser.pause(hoverTime); // Wait for the tooltip to be displayed
	});

	this.Then(/^I hover over node type "([^"]*)" in category "([^"]*)"$/, function(nodeType, category) {
		const categoryElem = findCategoryElement(category);
		categoryElem.click();
		const nodeIndex = findNodeIndexInPalette(nodeType);

		browser.$$(".palette-list-item")[nodeIndex].moveToObject();
		browser.pause(hoverTime); // Wait for the tooltip to be displayed
	});

	this.Then(/^I verify the tip shows next to category "([^"]*)"$/, function(category) {
		const tip = browser.$(".tip-palette-item");
		expect(tip.value).not.toEqual(null);

		const tipCategoryLabel = tip.$(".tip-palette-label").getText();
		expect(tipCategoryLabel).toEqual(category);

		const tipLabel = tip.$(".tip-palette-desc").getText();
		expect(tipLabel).toEqual("Description for " + category);
	});

	this.Then(/^I verify the tip shows next to the node type "([^"]*)" in category "([^"]*)"$/, function(nodeType, category) {
		const tip = browser.$(".tip-palette-item");
		expect(tip.value).not.toEqual(null);

		const nodeIndex = findNodeIndexInPalette(nodeType);
		const paletteItem = browser.$$(".palette-list-item")[nodeIndex];

		const nodeRight = paletteItem.getLocation().x + paletteItem.getElementSize().width;
		const tipLeft = tip.getLocation().x;
		expect(tipLeft).toBeGreaterThan(nodeRight);

		const tipCategoryLabel = tip.$(".tip-palette-category").getText();
		expect(tipCategoryLabel).toEqual(category);

		const tipLabel = tip.$(".tip-palette-label").getText();
		expect(tipLabel).toEqual(nodeType);
	});

	this.Then(/^I verify the "([^"]*)" node in the category has a "([^"]*)" of ([-+]?[0-9]*\.?[0-9]+) pixels$/, function(nodeType, dimension, size) {
		const nodeIndex = findNodeIndexInPalette(nodeType);
		const dim = browser.$$(".palette-list-item-icon")[nodeIndex].getCssProperty(dimension);
		expect(dim.value).toEqual(size + "px");
	});

	this.Then(/^I hover over the node "([^"]*)"$/, function(nodeName) {
		const nodeSelector = getNodeSelector(nodeName, "grp");
		browser.$(nodeSelector).moveToObject();
		browser.pause(hoverTime); // Wait for the tooltip to be displayed
	});

	this.Then(/^I hover over the node "([^"]*)" in the subflow$/, function(nodeName) {
		const nodeSelector = getNodeSelectorInSubFlow(nodeName, "grp");
		browser.$(nodeSelector).moveToObject();
		browser.pause(hoverTime); // Wait for the tooltip to be displayed
	});


	this.Then(/^I verify the node with name "([^"]*)" shows in the canvas$/, function(nodeName) {
		const nodeSelector = getNodeSelector(nodeName, "label");
		const node = browser.$(nodeSelector);
		// Use getHTML() here instead of getText() incase the node is 'inactive' i.e. partly or fully off the screen
		// Also, take first 7 characters of the name (which is the full node name) because
		// text in the DOM might be truncated.
		expect(node.getHTML().includes(nodeName.substring(0, 7))).toBe(true);
	});

	this.Then(/^I verify the tip shows "([^"]*)" the node "([^"]*)"$/, function(location, nodeName) {
		doesTipExist(nodeName, location);
	});

	this.Then(/^I verify the tip shows "([^"]*)" the node "([^"]*)" in the subflow$/, function(location, nodeName) {
		doesTipExistInSubFlow(nodeName, location);
	});


	this.Then(/^I hover over the input port "([^"]*)" of node "([^"]*)"$/, function(portId, nodeName) {
		const portSelector = getNodePortSelector(nodeName, "trg_port", portId);
		browser.$(portSelector).moveToObject();
		browser.pause(hoverTime); // Wait for the tooltip to be displayed
	});

	this.Then(/^I hover over the output port "([^"]*)" of node "([^"]*)"$/, function(portId, nodeName) {
		const portSelector = getNodePortSelector(nodeName, "src_port", portId);
		browser.$(portSelector).moveToObject();
		browser.pause(hoverTime); // Wait for the tooltip to be displayed
	});

	this.Then(/^I verify the port name "([^"]*)" shows below the input port id "([^"]*)" of node "([^"]*)"$/, function(portName, portId, nodeName) {
		const portSelector = getNodePortSelector(nodeName, "trg_port", portId);
		const portTipSelector = getNodePortTipSelector(portId);
		const tip = browser.$(portTipSelector);
		expect(tip.value).not.toEqual(null);

		const port = browser.$(portSelector);
		const portBottom = port.getLocation().y + port.getElementSize().height;
		const tipTop = tip.getLocation().y;
		expect(tipTop).toBeGreaterThan(portBottom);

		const tipLabel = tip.$(".tip-port").getText();
		expect(tipLabel).toEqual(portName);
	});

	this.Then(/^I verify the port name "([^"]*)" shows below the output port id "([^"]*)" of node "([^"]*)"$/, function(portName, portId, nodeName) {
		const portSelector = getNodePortSelector(nodeName, "src_port", portId);
		const portTipSelector = getNodePortTipSelector(portId);
		const tip = browser.$(portTipSelector);
		expect(tip.value).not.toEqual(null);

		const port = browser.$(portSelector);
		const portBottom = port.getLocation().y + port.getElementSize().height;
		const tipTop = tip.getLocation().y;
		expect(tipTop).toBeGreaterThan(portBottom);

		const tipLabel = tip.$(".tip-port").getText();
		expect(tipLabel).toEqual(portName);
	});

	this.Then(/^I hover over the link at (\d+), (\d+)$/, function(mouseX, mouseY) {
		browser.moveToObject(".d3-svg-canvas-div", Number(mouseX), Number(mouseY));
		browser.pause(hoverTime); // Wait for the tooltip to be displayed
	});

	this.Then(/^I verify the tip shows below (\d+) for link between node "([^"]*)", port "([^"]*)" and node "([^"]*)", port "([^"]*)"$/,
		function(mouseY, sourceNode, sourcePort, targetNode, targetPort) {
			const tip = browser.$("[data-id*=link_tip_0_]"); // Find tip with id that starts with 'link_tip_0_'
			expect(tip.value).not.toEqual(null);

			const tipTop = tip.getLocation().y;
			expect(tipTop).toBeGreaterThan(mouseY);

			const tipLabel = tip.$("#tooltipContainer").getText();
			const sourceString = `'${sourceNode}', port '${sourcePort}'`;
			const targetString = `'${targetNode}', port '${targetPort}'`;
			const linkLabel = `Link from ${sourceString} to ${targetString}`;
			expect(tipLabel).toEqual(linkLabel);
		});

	this.Then(/^I verify the tip doesn't show for node type "([^"]*)"$/, function(nodeType) {
		const tip = browser.$(".tip-palette-item");
		expect(tip.value).toEqual(null);
	});

	this.Then(/^I verify the tip doesn't show for node "([^"]*)"$/, function(nodeName) {
		const nodeSelector = getNodeSelector(nodeName, "tip");
		const tip = browser.$(nodeSelector);
		expect(tip.value).toEqual(null);
	});

	this.Then(/^I verify the tip doesn't show for input port id "([^"]*)"$/, function(portId) {
		const tip = browser.$("#node_port_tip_0_" + portId);
		expect(tip.value).toEqual(null);
	});

	this.Then("I verify the tip shows doesn't show for link", function() {
		const tip = browser.$("[id*=link_tip_0_]"); // Find tip with id that starts with 'link_tip_0_'
		expect(tip.value).toEqual(null);
	});

	this.Then(/^I move the mouse to coordinates (\d+), (\d+)$/, function(mouseX, mouseY) {
		browser.moveToObject(".d3-svg-canvas-div", Number(mouseX), Number(mouseY));
		browser.pause(100);
	});

	this.Then(/^I verify there are (\d+) pipelines$/, function(numPipelines) {
		const objectModel = getCanvas();
		expect(objectModel.pipelines.length).toEqual(Number(numPipelines));
	});

	this.Then(/^I verify pipeline (\d+) have (\d+) nodes/, function(pipelineNum, numNodes) {
		const objectModel = getCanvas();
		expect(objectModel.pipelines[pipelineNum].nodes.length).toEqual(Number(numNodes));
	});

	this.Then(/^I verify pipeline (\d+) have (\d+) links/, function(pipelineNum, numLinks) {
		const objectModel = getCanvas();
		expect(objectModel.pipelines[pipelineNum].links.length).toEqual(Number(numLinks));
	});

	this.Then(/^I display the browser configuration$/,
		function() {
			console.log("browser.desiredCapabilities: ");
			console.log(browser.desiredCapabilities);
		});
};
