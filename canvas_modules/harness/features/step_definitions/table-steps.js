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

import testUtils from "./utilities/test-utils.js";

/* global browser */

module.exports = function() {
	this.Then(/^I click the subpanel button in control "([^"]*)" in row "([^"]*)"$/, function(controlId, row) {
		var table = browser.$("div[data-id='properties-" + controlId + "']");
		table.$$(".properties-subpanel-button")[row].click();
		browser.pause(500);
	});

	this.Then(/^I verify the table "([^"]*)" is of height "([^"]*)"$/, function(tableId, height) {
		const table = browser.$("div[data-id='properties-ft-" + tableId + "']");
		const data = table.$(".properties-ft-container-wrapper");
		expect(data.getCssProperty("height").value).toEqual(height);
	});

	/*
	* selectColumns steps
 	*/
	this.Then(/^I verify the selectColumns table "([^"]*)" contains "([^"]*)" at index (\d+) in panel "([^"]*)"$/, function(tableId, fieldName, index, panelName) {
		const subPanel = testUtils.getWideFlyoutPanel(panelName);
		const table = subPanel.$("div[data-id='properties-ft-" + tableId + "']");
		const row = table.$$("div[role='properties-data-row']")[index];
		const data = row.$(".properties-readonly").getText();
		expect(data).toEqual(fieldName);
	});

	/*
	* StructureListEditor steps
	*/
	this.Then(/^I verify the StructureListEditor table "([^"]*)" contains "([^"]*)" at row (\d+) col (\d+)$/, function(tableId, text, row, col) {
		const table = browser.$("div[data-id='properties-ft-" + tableId + "']");
		const data = table.$("div[data-id='properties-structurelist_sub_panel_" + row + "_" + col + "']").getText();
		expect(data).toEqual(text);
	});
};
