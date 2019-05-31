/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
