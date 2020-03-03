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

/* global browser */

module.exports = function() {
	this.Then(/^I select field "([^"]*)" with data type "([^"]*)" in the field picker$/, function(fieldName, dataType) {
		const fieldPicker = browser.$("div[data-id='properties-ft-field-picker']");
		const rows = fieldPicker.$$(".properties-fp-data-rows");
		let fieldFound = false;
		let schemaName = null;
		let field = null;
		if (fieldName.includes(".")) { // If field to select with name and schema
			schemaName = fieldName.split(".")[0];
			field = fieldName.split(".")[1];
		} else {
			field = fieldName;
		}
		for (let idx = 0; idx < rows.length; idx++) {
			const currFieldName = rows[idx].$("td[data-label='fieldName']").$(".properties-fp-field")
				.$(".properties-fp-field-name")
				.getText();
			const currDataType = rows[idx].$("td[data-label='dataType']").$(".properties-fp-data")
				.$(".properties-fp-field-type")
				.getText();
			let currSchema = null;
			if (schemaName) {
				currSchema = rows[idx].$("td[data-label='schemaName']").getText();
			}
			if (currFieldName === field && currSchema === schemaName && currDataType === dataType) {
				const checkbox = rows[idx].$(".row-checkbox").$("input");
				if (checkbox._status === 0) {
					const checkboxLabel = rows[idx].$(".row-checkbox").$("label");
					checkboxLabel.click();
					fieldFound = true;
					break;
				}
			}
		}
		expect(fieldFound).toEqual(true);
	});

	this.Then(/^I verify field "([^"]*)" with data type "([^"]*)" is selected in the field picker$/, function(fieldName, dataType) {
		const fieldPicker = browser.$("div[data-id='properties-ft-field-picker']");
		const rows = fieldPicker.$$(".properties-fp-data-rows");
		let fieldFound = false;
		let schemaName = null;
		let field = null;
		if (fieldName.indexOf(".") !== -1) { // If field to select with name and schema
			schemaName = fieldName.split(".")[0];
			field = fieldName.split(".")[1];
		} else {
			field = fieldName;
		}
		for (let idx = 0; idx < rows.length; idx++) {
			const currFieldName = rows[idx].$("td[data-label='fieldName']").$(".properties-fp-field")
				.$(".properties-fp-field-name")
				.getText();
			const currDataType = rows[idx].$("td[data-label='dataType']").$(".properties-fp-data")
				.$(".properties-fp-field-type")
				.getText();
			let currSchema = null;
			if (schemaName) {
				currSchema = rows[idx].$("td[data-label='schemaName']").getText();
			}
			if (currFieldName === field && currSchema === schemaName && currDataType === dataType) {
				const checkbox = rows[idx].$(".row-checkbox").$("input");
				if (checkbox._status === 0) {
					expect(checkbox.isSelected()).toEqual(true);
					fieldFound = true;
					break;
				}
			}
		}
		expect(fieldFound).toEqual(true);
	});

	this.Then(/^I click on the field picker "([^"]*)" button$/, function(buttonType) {
		const fieldPickerContainer = browser.$(".properties-fp-table");
		const button = fieldPickerContainer.$("button[data-id='properties-" + buttonType + "-button']");
		button.click();
		browser.pause(300);
	});
};
