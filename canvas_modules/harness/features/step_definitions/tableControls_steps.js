/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global browser */

module.exports = function() {

	this.Then(/^I select the row (\d+) in the table "([^"]*)"$/, function(rowNumber, tableControlId) {
		// Write code here that turns the phrase above into concrete actions
		const table = browser.$("#" + tableControlId);
		const selectRow = table.$("#flexible-table-container")
			.$(".reactable-data")
			.$$("tr");
		selectRow[Number(rowNumber) - 1].click();
	});

	this.Then(/^I verify that "([^"]*)" is a value in the "([^"]*)" cell of row (\d+) in the table "([^"]*)"$/,
		function(cellValue, cellLabel, rowNumber, tableControlId) {
			const table = browser.$("#" + tableControlId);
			const selectRow = table.$("#flexible-table-container")
				.$(".reactable-data")
				.$$("tr");
			const cells = selectRow[Number(rowNumber) - 1].$$("td");
			var cell = null;
			for (var idx = 0; idx < cells.length; idx++) {
				if (cells[idx].getAttribute("label") === cellLabel) {
					cell = cells[idx];
					break;
				}
			}
			expect(cell).not.toBe(null);
			expect(cell.getText()).toBe(cellValue);
		});

	this.Then(/^I click the "([^"]*)" button on the "([^"]*)" table$/, function(buttonName, tableName) {
		const tableDiv = browser.$("#flexible-table-" + tableName);
		expect(tableDiv.value).not.toBe(null);
		if (buttonName === "Add") {
			tableDiv.$("#add-fields-button").click();
		} else {
			tableDiv.$("#remove-fields-button-enabled").click();
		}
	});

	this.Then(/^I select the "([^"]*)" field from the "([^"]*)" table$/, function(fieldName, tableName) {
		const fieldPickerRows = browser.$("#field-picker-table").$$(".field-picker-data-rows");
		var clicked = false;
		for (var idx = 0; idx < fieldPickerRows.length; idx++) {
			const cells = fieldPickerRows[idx].$$("td");
			for (var indx = 0; indx < cells.length; indx++) {
				if (cells[indx].getText() === fieldName) {
					fieldPickerRows[idx].$("label").click();
					clicked = true;
					break;
				}
			}
			if (clicked) {
				break;
			}
		}
		// expect to find a row with the field name and clicked the checkbox to select it
		expect(clicked).toBe(true);
	});

	this.Then(/^I click on the "([^"]*)" button to save the new columns$/, function(arg1) {
		browser.$("#field-picker-back-button").click();
	});

};
