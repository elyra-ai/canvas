/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import { getBaseDir } from "../utilities/test-config.js";

var nconf = require("nconf");

module.exports = function() {

/* global browser */

	this.Given(/^I have selected the "([^"]*)" palette layout$/, function(layout) {
		if (layout === "Modal") {
			const modalLabel = browser.$("#sidepanel-palette-layout").$$("div")[4].$("label");
			modalLabel.scroll();
			browser.pause(500);
			modalLabel.click();
			nconf.set("paletteLayout", "Modal");
		} else {
			const flyoutLabel = browser.$("#sidepanel-palette-layout").$$("div")[2].$("label");
			flyoutLabel.scroll();
			browser.pause(500);
			flyoutLabel.click();
			nconf.set("paletteLayout", "Flyout");
		}
	});

	this.Then(/^I open the palette$/, function() {
		if (nconf.get("paletteLayout") === "Modal") {
			// click on the palette button to open it
			browser.$(".palette-show-button").click();
		} else {
			// click on the palette button to open it
			browser.$("#palette-true").click();
			browser.pause(500);
		}
	});

	this.Then(/^I close the palette$/, function() {
		if (nconf.get("paletteLayout") === "Modal") {
			// close the palette
			browser.$(".palette-topbar").$(".right-navbar")
				.$(".secondary-action")
				.click();
		} else {
			// click on the palette button to closed it
			browser.$("#palette-true").click();
		}

	});

	this.Then(/^I enter "([^"]*)" into the palette search bar$/, function(filterText) {
		browser.$("#palette-flyout-search-bar").click();
		browser.$("#palette-flyout-search-text").setValue("", filterText);
	});

	this.Then(/^I have uploaded predefined palette "([^"]*)"$/, function(paletteFile) {
		// need to click on the palette drop down
		browser.$("#sidepanel-palette-input").scroll();
		browser.$("#sidepanel-palette-input")
			.$(".formField")
			.$(".select")
			.$(".button")
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
		browser.$("#sidepanel-palette-input").scroll();
		browser.$("#sidepanel-palette-input")
			.$(".formField")
			.$(".select")
			.$(".button")
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
				browser.$("#sidepanel-palette-input").click("#paletteFileSubmit");
			}
		}
	});

};
