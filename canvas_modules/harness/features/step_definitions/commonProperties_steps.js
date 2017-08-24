/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { getHarnessData } from "./utilities/HTTPClient.js";
import { getURL } from "./utilities/test-config.js";

/* global browser */

module.exports = function() {

	const testUrl = getURL();
	const getEventLogUrl = testUrl + "/v1/test-harness/events";

	this.Then(/^I see common properties title "([^"]*)"$/, function(givenTitle) {
		browser.pause(500);
		var dialogTitle = browser.getText(".modal-title");
		expect(dialogTitle).toEqual(givenTitle);
	});

	this.Then(/^I enter "([^"]*)" in the Column name textbox$/, function(textboxValue) {
		var textbox = browser.$("#editor-control-colName");
		textbox.setValue("", textboxValue);
		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();

		browser.timeouts("script", 3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);

		expect(textboxValue).toEqual((eventLogJSON[10].data.form.colName).toString());
	});

	this.Then(/^I select "([^"]*)" dropdown option$/, function(dropdownValue) {
		browser.pause(500);
		var dropdown = browser.$(".Dropdown-placeholder");
		dropdown.click();
		var dropdownSelect = browser.$(".Dropdown-menu").$$(".Dropdown-option")[1];
		dropdownSelect.click();
		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();

		browser.timeouts("script", 3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);

		expect(dropdownValue).toEqual((eventLogJSON[13].data.form.measurement).toString());
	});

	this.Then(/^I enter "([^"]*)" in the Expression textarea$/, function(textareaValue) {
		var textarea = browser.$("#editor-control-col");
		textarea.setValue("", textareaValue);
		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();

		browser.timeouts("script", 3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);
		browser.pause(500);
		expect(textareaValue).toEqual((eventLogJSON[16].data.form.col).toString());
	});

	this.Then(/^I select "([^"]*)" option from Input columns select textbox$/, function(selectTextboxOption) {
		var selectTextbox = browser.$("#editor-control-inputFieldList").$$("option")[0];
		selectTextbox.click();
		browser.$("#remove-fields-button-enabled").click();

		browser.$("#add-fields-button").click();

		// Splitting into different options due to ESLint errors
		var optionAge1 = browser.$("#table").$("tbody");
		var optionAge2 = optionAge1.$$("tr")[0].$$("td")[0].$(".field-picker-checkbox");
		var optionAge3 = optionAge2.$("div").$("label");

		var optionSex1 = browser.$("#table").$("tbody");
		var optionSex2 = optionSex1.$$("tr")[1].$$("td")[0].$(".field-picker-checkbox");
		var optionSex3 = optionSex2.$("div").$("label");

		optionAge3.click();
		optionSex3.click();

		browser.$("#reset-fields-button").click();
		browser.$("#field-picker-filter-list").$$("li")[1].click();
		browser.$("#field-picker-filter-list").$$("li")[2].click();

		var filterField = browser.$("#flexible-table-search");
		filterField.setValue("", "Drug");

		var optionDrug1 = browser.$("#table").$("tbody");
		var optionDrug2 = optionDrug1.$("tr").$$("td")[0].$(".field-picker-checkbox");
		var optionDrug3 = optionDrug2.$("div").$("label");

		optionDrug3.click();

		browser.$("#field-picker-back-button").click();

		var selectDrugOption = browser.$("#editor-control-inputFieldList").$$("option")[1];
		selectDrugOption.click();

		var selectBPOption = browser.$("#editor-control-inputFieldList").$$("option")[0];
		selectBPOption.click();

		browser.$("#remove-fields-button-enabled").click();

		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();

		browser.timeouts("script", 3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);

		expect("Drug").toEqual((eventLogJSON[19].data.form.inputFieldList).toString());

	});

	this.Then(/^I select "([^"]*)" radio button for Impurity$/, function(radioButtonOption) {

		var tab = browser.$$(".tabs__tab")[1];
		tab.click();

		var filterField = browser.$("#editor-control-checkpointInterval");
		filterField.setValue("", "1");

		var radiobuttonGini = browser.$("#radioset-control-container").$$("label")[0];
		radiobuttonGini.click();

		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();

		browser.timeouts("script", 3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);

		expect("1").toEqual((eventLogJSON[22].data.form.checkpointInterval).toString());
		expect(radioButtonOption).toEqual((eventLogJSON[22].data.form.impurity).toString());

	});

	this.Then(/^I select Repeatable partition assignment checkbox and click Generate$/, function() {

		// Splitting into different options due to ESLint errors
		var checkboxPartition1 = browser.$(".tabs").$("div");
		var checkboxPartition2 = checkboxPartition1.$(".tabs__tabpanel");
		var checkboxPartition3 = checkboxPartition2.$(".control-panel").$$(".checkbox-panel")[1].$$("div")[0].$("label");
		checkboxPartition3.click();

		var generateButton1 = browser.$(".tabs").$("div");
		var generateButton2 = generateButton1.$(".tabs__tabpanel");
		var generateButton3 = generateButton2.$(".control-panel").$$(".checkbox-panel")[1];
		var generateButton4 = generateButton3.$$("div")[1].$("div").$("div");
		var generateButton5 = generateButton4.$(".default-label-container").$$("label")[1];
		generateButton5.click();

		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();

		browser.timeouts("script", 3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);
		var eventLogString = JSON.stringify(eventLog);
		var checkboxPartitionClicked = eventLogString.includes("samplingSeed");
		browser.pause(500);
		expect(true).toEqual(checkboxPartitionClicked);
		expect("-1").not.toEqual((eventLogJSON[25].data.form.samplingSeed).toString());
	});

	this.Then(/^I change Order for Drug field and reorder$/, function() {

		browser.pause(500);
		var drugOrder = browser.$$(".toggletext_text")[1];
		drugOrder.click();

		var naRow = browser.$$(".reactable-data")[1].$$("tr")[0];
		naRow.click();

		var moveNaLast = browser.$$(".table-row-move-button")[1];
		moveNaLast.click();

		var testmoveNaLast1 = browser.$(".table").$(".reactable-data");
		var testmoveNaLast2 = testmoveNaLast1.$(".table-selected-row").$$("td")[0].getText();
		expect("Na").toEqual(testmoveNaLast2);

		var drugRow = browser.$$(".reactable-data")[1].$$("tr")[0];
		drugRow.click();

		var moveDrugDown = browser.$$(".table-row-move-button")[0];
		moveDrugDown.click();

		var testmoveDrugDown1 = browser.$(".table").$(".reactable-data");
		var testmoveDrugDown2 = testmoveDrugDown1.$(".table-selected-row").$$("td")[0].getText();
		expect("Drug").toEqual(testmoveDrugDown2);

		naRow = browser.$$(".reactable-data")[1].$$("tr")[2];
		naRow.click();

		var moveNaFirst = browser.$$(".table-row-move-button")[0];
		moveNaFirst.click();

		var testmoveNaFirst1 = browser.$(".table").$(".reactable-data");
		var testmoveNaFirst2 = testmoveNaFirst1.$(".table-selected-row").$$("td")[0].getText();
		expect("Na").toEqual(testmoveNaFirst2);

		drugRow = browser.$$(".reactable-data")[1].$$("tr")[2];
		drugRow.click();

		var moveDrugUp = browser.$$(".table-row-move-button")[1];
		moveDrugUp.click();

		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();
		browser.pause(500);

		browser.timeouts("script", 3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);

		var naKey = (JSON.stringify(eventLogJSON[28].data.form.keys[0])).includes("Na");
		var drugKey = (JSON.stringify(eventLogJSON[28].data.form.keys[1])).includes("Drug");
		var drugValue = (JSON.stringify(eventLogJSON[28].data.form.keys[1])).includes("Ascending");
		var cholesterolKey = (JSON.stringify(eventLogJSON[28].data.form.keys[2])).includes("Cholesterol");

		expect(true).toEqual(naKey);
		expect(true).toEqual(drugKey);
		expect(true).toEqual(drugValue);
		expect(true).toEqual(cholesterolKey);

	});

	this.Then(/^I check for validation error on Checkpoint Interval$/, function() {
		var tab = browser.$$(".tabs__tab")[1];
		tab.click();

		var checkpointIntervalTextBoxTest = browser.$("#editor-control-checkpointInterval");
		checkpointIntervalTextBoxTest.setValue("", 0);

		var errormessage1 = browser.$$(".editor_control_area")[2].$$("div")[3].$("p").$("span");
		var errormessage2 = errormessage1.getText();
		expect("The checkpoint interval value must either be >= 1 or -1 to disable").toEqual(errormessage2);


		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();

	});

	this.Then(/^I check for table cell level validation$/, function() {
		var tableCell1 = browser.$$("#editor-control-renamed_fields")[0];
		tableCell1.setValue("", " ");
		var tableCell2 = browser.$(".modal-title");
		tableCell2.click();
		var errormsg = browser.$(".form__validation--error").getText();
		expect("The 'Output Name' field cannot be empty").toEqual(errormsg);
		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();
	});

	this.Then(/^I check for table validation$/, function() {
		var tableRow1 = browser.$$("#editor-control-renamed_fields")[0];
		tableRow1.click();
		browser.$("#remove-fields-button-enabled").click();

		var tableRow2 = browser.$$("#editor-control-renamed_fields")[0];
		tableRow2.click();
		browser.$("#remove-fields-button-enabled").click();

		var warningMsg = browser.$(".form__validation--warning").getText();
		expect("There are no selected columns to rename").toEqual(warningMsg);
		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();
	});


	this.Then(/^I have closed the common properties dialog by clicking on close button$/, function() {
		var closeButton = browser.$(".modal__buttons").$(".button--hyperlink");
		closeButton.click();
	});

};
