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
	this.Then(/^I verify the selectColumns table "([^"]*)" contains "([^"]*)" at index (\d+)$/, function(tableId, fieldName, index) {
		const table = browser.$("div[data-id='properties-ft-" + tableId + "']");
		const data = table.$$(".column-select-table-row")[index].getText();
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
