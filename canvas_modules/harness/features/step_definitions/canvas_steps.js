/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

import { findCategoryElement, findNodeIndexInPalette, getNodeIdForLabel } from "./utilities/validateUtil.js";
import { clickSVGAreaAt } from "./utilities/validateUtil.js";

/* global browser */
var nconf = require("nconf");

module.exports = function() {

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


	this.Then(/^I right click the canvas background at (\d+), (\d+) to display the context menu$/, function(xCoord, yCoord) {
		const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
		if (D3RenderingEngine) {
			browser.rightClick(".svg-area", Number(xCoord), Number(yCoord));
		} else {
			browser.rightClick(".svg-canvas", Number(xCoord), Number(yCoord));
		}
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
		var items = browser.getAttribute(".d3-obj-selection-highlight", "data-selected");
		var selected = 0;

		for (var idx = 0; idx < items.length; idx++) {
			if (items[idx] === "yes") {
				selected++;
			}
		}
		expect(selected).toEqual(Number(numberOfSelectedObjects));
	});

	this.Then("I select all objects in the canvas via the context menu", function() {
		const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
		if (D3RenderingEngine) {
			browser.rightClick(".svg-area", Number(300), Number(10));
		} else {
			browser.rightClick(".svg-canvas", Number(300), Number(10));
		}
		browser.$(".context-menu-popover").$$(".react-contextmenu-item")[1].click();
	});

	this.Then("I select all objects in the canvas via Ctrl+A", function() {
		const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
		if (D3RenderingEngine) {
			browser.click(".svg-area", Number(10), Number(10));
		} else {
			browser.click(".svg-canvas", Number(10), Number(10));
		}
		browser.keys(["Control", "A", "A", "Control"]);
	});

	this.Then("I select all objects in the canvas via Cmd+A", function() {
		const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
		if (D3RenderingEngine) {
			browser.click(".svg-area", Number(10), Number(10));
		} else {
			browser.click(".svg-canvas", Number(10), Number(10));
		}
		browser.keys(["Meta", "A", "A", "Meta"]);
	});

	this.Then("I delete all selected objects via the Delete key", function() {
		browser.keys("Delete");
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

	this.Then(/^I verify the tip shows below the node "([^"]*)"$/, function(nodeName) {
		const nodeId = getNodeIdForLabel(nodeName);
		const tip = browser.$("#node_tip_" + nodeId);
		expect(tip.value).not.toEqual(null);

		const node = browser.$("#node_grp_" + nodeId);
		const nodeBottom = node.getLocation().y + node.getElementSize().height;
		const tipTop = tip.getLocation().y;
		expect(tipTop).toBeGreaterThan(nodeBottom);

		const tipLabel = tip.$(".tip-node-label").getText();
		expect(tipLabel).toEqual(nodeName);
	});

	this.Then(/^I hover over the input port "([^"]*)" of node "([^"]*)"$/, function(portId, nodeName) {
		const nodeId = getNodeIdForLabel(nodeName);
		const portSelector = "#node_trg_port_" + nodeId + "_" + portId;
		browser.$(portSelector).moveToObject();
		browser.pause(1000); // Wait for the tooltip to be displayed
	});

	this.Then(/^I verify the port name "([^"]*)" shows below the input port id "([^"]*)" of node "([^"]*)"$/, function(portName, portId, nodeName) {
		const nodeId = getNodeIdForLabel(nodeName);
		const portSelector = "#node_trg_port_" + nodeId + "_" + portId;
		console.log("portId " + portId);
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

	this.Then(/^I verify the tip shows below (\d+) for link id "([^"]*)" between node "([^"]*)", port "([^"]*)" and node "([^"]*)", port "([^"]*)"$/,
		function(mouseY, linkId, sourceNode, sourcePort, targetNode, targetPort) {
			const tip = browser.$("#link_tip_0_" + linkId);
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

	this.Then(/^I verify the tip shows doesn't show for link id "([^"]*)"$/, function(linkId) {
		const tip = browser.$("#link_tip_0_" + linkId);
		expect(tip.value).toEqual(null);
	});

	this.Then(/^I move the mouse to coordinates (\d+), (\d+)$/, function(mouseX, mouseY) {
		browser.moveToObject(".d3-svg-canvas-div", Number(mouseX), Number(mouseY));
	});
};
