/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
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
		for (let idx = 0; idx < rows.length; idx++) {
			const td = rows[idx].$("td[data-label='checkbox']");
			const checkbox = td.$("input[data-name='" + fieldName + "'][data-type='" + dataType + "']");
			if (checkbox._status === 0) {
				const checkboxLabel = td.$("label");
				checkboxLabel.click();
				fieldFound = true;
				break;
			}
		}
		expect(fieldFound).toEqual(true);
	});

	this.Then(/^I verify field "([^"]*)" with data type "([^"]*)" is selected in the field picker$/, function(fieldName, dataType) {
		const fieldPicker = browser.$("div[data-id='properties-ft-field-picker']");
		const rows = fieldPicker.$$(".properties-fp-data-rows");

		let fieldFound = false;
		for (let idx = 0; idx < rows.length; idx++) {
			const td = rows[idx].$("td[data-label='checkbox']");
			const checkbox = td.$("input[data-name='" + fieldName + "'][data-type='" + dataType + "']");
			if (checkbox._status === 0) {
				expect(checkbox.isSelected()).toEqual(true);
				fieldFound = true;
				break;
			}
		}
		expect(fieldFound).toEqual(true);
	});

	this.Then(/^I click on the field picker "([^"]*)" button$/, function(buttonType) {
		const fieldPickerContainer = browser.$(".properties-fp-table");
		const button = fieldPickerContainer.$("button[data-id='properties-" + buttonType + "-button']");
		button.click();
	});
};
