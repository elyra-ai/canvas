/*
 * Copyright 2017-2020 IBM Corporation
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
		browser.$(".palette-flyout-search").click();
		browser.$(".palette-flyout-search").$("input")
			.setValue("", filterText);
	});

	this.Then(/^I have uploaded palette "([^"]*)"$/, function(fileName) {
		loadPalette(fileName);
	});

	this.Then(/^I have uploaded palette for extra canvas "([^"]*)"$/, function(fileName) {
		loadPalette2(fileName);
	});

};
