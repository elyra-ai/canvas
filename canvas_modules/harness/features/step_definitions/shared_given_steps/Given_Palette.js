/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import { loadPalette, loadPalette2 } from "../utilities/test-utils.js";

var nconf = require("nconf");

module.exports = function() {

/* global browser */

	this.Given(/^I have selected the "([^"]*)" palette layout$/, function(layout) {
		if (layout === "Modal") {
			const modalLabel = browser.$("#harness-sidepanel-palette-layout").$$("div")[4].$("label");
			modalLabel.scroll();
			browser.pause(500);
			modalLabel.click();
			nconf.set("paletteLayout", "Modal");
		} else {
			const flyoutLabel = browser.$("#harness-sidepanel-palette-layout").$$("div")[2].$("label");
			flyoutLabel.scroll();
			browser.pause(500);
			flyoutLabel.click();
			nconf.set("paletteLayout", "Flyout");
		}
	});

	this.Then(/^I open the palette$/, function() {
		// click on the palette button to open it
		browser.$("#palette-open-action").click();
		browser.pause(1000);
	});

	this.Then(/^I close the palette$/, function() {
		// click on the palette button to closed it
		browser.$("#palette-close-action").click();
		browser.pause(1000);
	});

	this.Then(/^I open the extra canvas palette$/, function() {
		// click on the palette button to open it
		browser.$$("#palette-open-action")[1].click();
		browser.pause(1000);
	});

	this.Then(/^I click the Search icon to open the full palette$/, function() {
		browser.$(".palette-flyout-search").click();
	});

	this.Then(/^I enter "([^"]*)" into the palette search bar$/, function(filterText) {
		browser.$("#palette-flyout-search").click();
		browser.$("#palette-flyout-search-text").setValue("", filterText);
	});

	this.Then(/^I have uploaded palette "([^"]*)"$/, function(fileName) {
		loadPalette(fileName);
	});

	this.Then(/^I have uploaded palette for extra canvas "([^"]*)"$/, function(fileName) {
		loadPalette2(fileName);
	});

};
