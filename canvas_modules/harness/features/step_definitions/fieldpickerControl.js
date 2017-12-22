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
			var clicked = false;
			for (var idx = 0; idx < fieldList.length; idx++) {
				const fieldCells = fieldList[idx].$$("td");
				expect(fieldCells.length).toEqual(3);
				for (var inx = 0; inx < fieldCells.length; inx++) {
					if (fieldCells[inx].getText() === fieldName) {
						clicked = true;
						fieldList[idx].$("label").click();
						break;
					}
				}
				if (clicked) {
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
