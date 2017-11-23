/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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


};
