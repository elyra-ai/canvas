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

	this.Then(/^I select the "([^"]*)" checkbox$/, function(fieldName) {
		if (fieldName !== "all") {
			const fieldList = browser.$("#field-picker-table").$$(".field-picker-data-rows");
			expect(fieldList.length).not.toEqual(0);
			for (var idx = 0; idx < fieldList.length; idx++) {
				const fieldCells = fieldList[idx].$$("td");
				expect(fieldCells.length).toEqual(3);

				const rowCheckbox = fieldList[idx].$(".field-picker-checkbox");
				if (rowCheckbox.$("input").getAttribute("data-name") === fieldName) {
					rowCheckbox.$("label").click();
					break;
				}
			}
		} else {
			// select checkall box
			browser.$("#field-picker-table")
				.$$(".field-picker-checkbox")[0]
				.$("label")
				.click();
		}
	});

	this.Then(/^I select the field picker "([^"]*)" button to save my changes$/, function(buttonName) {
		browser.$("#field-picker-back-button").click();
	});

};
