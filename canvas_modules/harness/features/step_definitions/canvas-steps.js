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

import { clickSVGAreaAt, findCategoryElement, findNodeIndexInPalette,
	getNodeIdForLabel, getNodeIdForLabelInSubFlow, getNumberOfSelectedComments,
	getNumberOfSelectedNodes } from "./utilities/validate-utils.js";
import { getCanvas, isSchemaValidationError } from "./utilities/test-utils.js";

/* global browser */

module.exports = function() {

	this.Then("I press Ctrl/Cmnd+X to Cut", function() {
		browser.keys(["Control", "x", "Control", "x"]);
	});

	this.Then("I press Ctrl/Cmnd+C to Copy", function() {
		browser.keys(["Control", "c", "Control", "c"]);
	});

	this.Then("I press Ctrl/Cmnd+V to Paste", function() {
		browser.keys(["Control", "v", "Control", "v"]);
	});

	this.Then("I press Ctrl/Cmnd+Z to Undo", function() {
		clickSVGAreaAt(1, 1); // Put foucs on the SVG area, ready for key press
		browser.keys(["Control", "z", "Control", "z"]);
	});

	this.Then("I press Ctrl/Cmnd+Shift+Z to Redo", function() {
		clickSVGAreaAt(1, 1); // Put foucs on the SVG area, ready for key press
		browser.keys(["Control", "Shift", "z", "Control", "Shift", "z"]);
	});

	this.Then("I press Ctrl/Cmnd+Y to Redo", function() {
		clickSVGAreaAt(1, 1); // Put foucs on the SVG area, ready for key press
		browser.keys(["Control", "y", "Control", "y"]);
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
		expect(left.value).toEqual(xCoord + "px");
		expect(top.value).toEqual(yCoord + "px");
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

	this.Then("I select all objects in the canvas via Ctrl+A", function() {
		browser.click(".svg-area", Number(10), Number(10));
		browser.keys(["Control", "A", "A", "Control"]);
	});

	this.Then("I select all objects in the canvas via Cmd+A", function() {
		browser.click(".svg-area", Number(10), Number(10));
		browser.keys(["Meta", "A", "A", "Meta"]);
	});

	this.Then("I delete all selected objects via the Delete key", function() {
		browser.keys("Delete");
		browser.pause(1000);
	});

	this.Then(/^I hover over node type "([^"]*)" in category "([^"]*)"$/, function(nodeType, category) {
		const categoryElem = findCategoryElement(category);
		categoryElem.click();
		const nodeIndex = findNodeIndexInPalette(nodeType);

		browser.$$(".palette-list-item")[nodeIndex].moveToObject();
		browser.pause(1000); // Wait for the tooltip to be displayed
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

	this.Then(/^I hover over the node "([^"]*)"$/, function(nodeName) {
		const nodeId = getNodeIdForLabel(nodeName);
		const nodeSelector = "#node_grp_" + nodeId;
		browser.$(nodeSelector).moveToObject();
		browser.pause(1000); // Wait for the tooltip to be displayed
	});

	this.Then(/^I hover over the node "([^"]*)" in the subflow$/, function(nodeName) {
		const nodeId = getNodeIdForLabelInSubFlow(nodeName);
		const nodeSelector = "#node_grp_" + nodeId;
		browser.$(nodeSelector).moveToObject();
		browser.pause(1000); // Wait for the tooltip to be displayed
	});


	this.Then(/^I verify the node with name "([^"]*)" shows in the canvas$/, function(nodeName) {
		const nodeId = getNodeIdForLabel(nodeName);
		const node = browser.$("#node_label_" + nodeId);
		// Use getHTML() here instead of getText() incase the node is 'inactive' i.e. partly or fully off the screen
		// Also, take first 7substring the name were given (which is the full node name) because then
		// text in the DOM might be truncated.
		expect(node.getHTML().includes(nodeName.substring(0, 7))).toBe(true);
	});

	this.Then(/^I verify the tip shows "([^"]*)" the node "([^"]*)"$/, function(location, nodeName) {
		const nodeId = getNodeIdForLabel(nodeName);
		const tip = browser.$("#node_tip_" + nodeId);
		expect(tip.value).not.toEqual(null);

		const node = browser.$("#node_grp_" + nodeId);
		const tipTop = tip.getLocation().y;
		if (location === "below") {
			expect(tipTop).toBeGreaterThan(node.getLocation().y + node.getElementSize().height);
		} else if (location === "above") {
			expect(tipTop).toBeLessThan(node.getLocation().y);
		}

		const tipLabel = tip.$(".tip-node-label").getText();
		expect(tipLabel).toEqual(nodeName);
	});

	this.Then(/^I hover over the input port "([^"]*)" of node "([^"]*)"$/, function(portId, nodeName) {
		const nodeId = getNodeIdForLabel(nodeName);
		const portSelector = "#node_trg_port_" + nodeId + "_" + portId;
		browser.$(portSelector).moveToObject();
		browser.pause(1000); // Wait for the tooltip to be displayed
	});

	this.Then(/^I hover over the output port "([^"]*)" of node "([^"]*)"$/, function(portId, nodeName) {
		const nodeId = getNodeIdForLabel(nodeName);
		const portSelector = "#node_src_port_" + nodeId + "_" + portId;
		browser.$(portSelector).moveToObject();
		browser.pause(1000); // Wait for the tooltip to be displayed
	});

	this.Then(/^I verify the port name "([^"]*)" shows below the input port id "([^"]*)" of node "([^"]*)"$/, function(portName, portId, nodeName) {
		const nodeId = getNodeIdForLabel(nodeName);
		const portSelector = "#node_trg_port_" + nodeId + "_" + portId;
		const tip = browser.$("#node_port_tip_0_" + portId);
		expect(tip.value).not.toEqual(null);

		const port = browser.$(portSelector);
		const portBottom = port.getLocation().y + port.getElementSize().height;
		const tipTop = tip.getLocation().y;
		expect(tipTop).toBeGreaterThan(portBottom);

		const tipLabel = tip.$(".tip-port").getText();
		expect(tipLabel).toEqual(portName);
	});

	this.Then(/^I verify the port name "([^"]*)" shows below the output port id "([^"]*)" of node "([^"]*)"$/, function(portName, portId, nodeName) {
		const nodeId = getNodeIdForLabel(nodeName);
		const portSelector = "#node_src_port_" + nodeId + "_" + portId;
		const tip = browser.$("#node_port_tip_0_" + portId);
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
		browser.pause(1000); // Wait for the tooltip to be displayed
	});

	this.Then(/^I verify the tip shows below (\d+) for link between node "([^"]*)", port "([^"]*)" and node "([^"]*)", port "([^"]*)"$/,
		function(mouseY, sourceNode, sourcePort, targetNode, targetPort) {
			const tip = browser.$("[id*=link_tip_0_]"); // Find tip with id that starts with 'link_tip_0_'
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
		const nodeId = getNodeIdForLabel(nodeName);
		const tip = browser.$("#node_tip_" + nodeId);
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
};
