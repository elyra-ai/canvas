/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { getBaseDir } from "../utilities/test-config.js";
module.exports = function() {

	/* global browser */
	this.Then(/^I have uploaded predefined diagram "([^"]*)"$/, function(diagramFile) {
		// need to click on the canvas drop down
		browser.$("#sidepanel-canvas-input")
						.$(".canvasField")
						.$(".select")
						.$("button")
						.click("svg");
		// get the list of drop down options.
		var canvasFileOptions = browser
														.$("#sidepanel-canvas-input")
														.$(".canvasField")
														.$(".select")
														.$(".select__options")
														.$$("button");
		for (var idx = 0; idx < canvasFileOptions.length; idx++) {
			if (canvasFileOptions[idx].getText() === diagramFile) {
				canvasFileOptions[idx].click();
			}
		}
	});

	this.Then(/^I have uploaded diagram "([^"]*)"$/, function(diagramFile) {
		// need to click on the canvas drop down
		browser.$("#sidepanel-canvas-input")
						.$(".canvasField")
						.$(".select")
						.$("button")
						.click("svg");
		// get the list of drop down options.
		var canvasFileOptions = browser
														.$("#sidepanel-canvas-input")
														.$(".canvasField")
														.$(".select")
														.$(".select__options")
														.$$("button");
		console.log("TEST");
		for (var idx = 0; idx < canvasFileOptions.length; idx++) {
			if (canvasFileOptions[idx].getText() === "Choose from location...") {
				canvasFileOptions[idx].click();
				var canvasInput = browser.$("#canvasFileInput");
				// this will not work with relative paths
				canvasInput.setValue(getBaseDir() + diagramFile);
				browser.$(".canvasField").click("a");
			}
		}
	});

	this.Then(/^I have uploaded predefined palette "([^"]*)"$/, function(paletteFile) {
		// need to click on the palette drop down
		browser.$("#sidepanel-palette-input")
						.$(".formField")
						.$(".select")
						.$("button")
						.click("svg");
		// get the list of drop down options.
		var paletteFileOptions = browser.$("#sidepanel-palette-input")
																		.$(".formField")
																		.$(".select")
																		.$(".select__options")
																		.$$("button");
		for (var idx = 0; idx < paletteFileOptions.length; idx++) {
			if (paletteFileOptions[idx].getText() === paletteFile) {
				paletteFileOptions[idx].click();
			}
		}
	});

	this.Then(/^I have uploaded palette "([^"]*)"$/, function(paletteFile) {
		// need to click on the palette drop down
		browser.$("#sidepanel-palette-input")
						.$(".formField")
						.$(".select")
						.$("button")
						.click("svg");
		// get the list of drop down options.
		var paletteFileOptions = browser.$("#sidepanel-palette-input")
																		.$(".formField")
																		.$(".select")
																		.$(".select__options")
																		.$$("button");
		for (var idx = 0; idx < paletteFileOptions.length; idx++) {
			if (paletteFileOptions[idx].getText() === "Choose from location...") {
				paletteFileOptions[idx].click();
				var paletteInput = browser.$("#paletteJsonInput");

				// this will not work with relative paths
				paletteInput.setValue(getBaseDir() + paletteFile);
				browser.$("#sidepanel-palette-input").click("a");
			}
		}
	});

	this.Then(/^I have uploaded JSON for common-properties "([^"]*)"$/, function(diagramFile) {
		// need to click on the common-properties drop down
		browser.$("#sidepanel-input")
						.$(".formField")
						.$(".select")
						.$("button")
						.click("svg");
		// get the list of drop down options.
		var commonPropertiesOptions = browser
														.$("#sidepanel-input")
														.$(".formField")
														.$(".select")
														.$(".select__options")
														.$$("button");

		for (var idx = 0; idx < commonPropertiesOptions.length; idx++) {
			if (commonPropertiesOptions[idx].getText() === diagramFile) {
				commonPropertiesOptions[idx].click();
			}
		}
	});

};
