/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { getAutoCompleteCount, selectAutoComplete, setTextValue } from "./utilities/codemirror_util.js";
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

		expect(textboxValue).toEqual((eventLogJSON[eventLogJSON.length - 1].data.form.colName).toString());
	});

	this.Then(/^I enter "([^"]*)" in the textbox Column name$/, function(textboxValue) {

		var textbox = browser.$("#editor-control-colName");
		textbox.setValue("", textboxValue);
		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();
		browser.pause(500);

		browser.timeoutsAsyncScript(3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);

		expect(textboxValue).toEqual((eventLogJSON[eventLogJSON.length - 1].data.form.colName).toString());
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

		expect(dropdownValue).toEqual((eventLogJSON[eventLogJSON.length - 1].data.form.measurement).toString());
	});

	this.Then(/^I select "([^"]*)" option from Input columns select textbox$/, function(selectTextboxOption) {
		var selectTextbox = browser.$("#editor-control-inputFieldList").$$("option")[0];
		selectTextbox.click();

		browser.$("#remove-fields-button-enabled").click();
		var inputFieldList = browser.$("#editor-control-inputFieldList").$$("option");
		expect(1).toEqual(inputFieldList.length);

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

		browser.$("#field-picker-back-button").click();
		inputFieldList = browser.$("#editor-control-inputFieldList").$$("option");
		expect(3).toEqual(inputFieldList.length);

		browser.$("#add-fields-button").click();

		var fieldPickerList = browser.$$(".field-picker-data-rows");
		expect(7).toEqual(fieldPickerList.length);

		browser.$("#reset-fields-button").click();
		fieldPickerList = browser.$$(".field-picker-data-rows");
		expect(7).toEqual(fieldPickerList.length);

		browser.$("#field-picker-filter-list").$$("li")[1].click();
		fieldPickerList = browser.$$(".field-picker-data-rows");
		expect(6).toEqual(fieldPickerList.length);

		browser.$("#field-picker-filter-list").$$("li")[2].click();
		fieldPickerList = browser.$$(".field-picker-data-rows");
		expect(4).toEqual(fieldPickerList.length);

		var filterField = browser.$("#flexible-table-search");
		filterField.setValue("", "Drug");
		fieldPickerList = browser.$$(".field-picker-data-rows");
		expect(1).toEqual(fieldPickerList.length);

		var optionDrug1 = browser.$("#table").$("tbody");
		var optionDrug2 = optionDrug1.$("tr").$$("td")[0].$(".field-picker-checkbox");
		var optionDrug3 = optionDrug2.$("div").$("label");

		optionDrug3.click();

		browser.$("#field-picker-back-button").click();
		inputFieldList = browser.$("#editor-control-inputFieldList").$$("option");
		expect(4).toEqual(inputFieldList.length);

		var selectDrugOption = browser.$("#editor-control-inputFieldList").$$("option")[1];
		selectDrugOption.click();

		var selectBPOption = browser.$("#editor-control-inputFieldList").$$("option")[0];
		selectBPOption.click();
		inputFieldList = browser.$("#editor-control-inputFieldList").$$("option");
		expect(4).toEqual(inputFieldList.length);

		browser.$("#remove-fields-button-enabled").click();
		inputFieldList = browser.$("#editor-control-inputFieldList").$$("option");
		expect(1).toEqual(inputFieldList.length);

		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();

		browser.timeouts("script", 3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);

		expect("Sex").toEqual((eventLogJSON[eventLogJSON.length - 1].data.form.inputFieldList).toString());

	});


	this.Then(/^I add "([^"]*)" to first input control$/, function(firstInput) {
		browser.$$("#add-fields-button")[0].click();

		var optionDrug1 = browser.$("#table").$("tbody");
		var optionDrug2 = optionDrug1.$$("tr")[4].$("td").$(".field-picker-checkbox");
		var optionDrug3 = optionDrug2.$("div").$("label");

		optionDrug3.click();

		browser.$("#field-picker-back-button").click();

		var firstInputFieldList = browser.$("#editor-control-columnSelectSharedWithInput").$$("option");
		expect(2).toEqual(firstInputFieldList.length);

	});

	this.Then(/^I verify "([^"]*)" is not present second input control$/, function(firstInput) {
		browser.$$("#add-fields-button")[1].click();

		var checkSecondTablefields = browser.$$(".reactable-data")[1].$$("tr");
		var fieldFlag = true;

		checkSecondTablefields.forEach(function(checkSecondTablefield) {
			var fieldName = checkSecondTablefield.$$("td")[1];
			if (firstInput === fieldName.getText()) {
				fieldFlag = false;
			}
		});
		expect(fieldFlag).toEqual(true);
	});

	this.Then(/^I add "([^"]*)" to second input control$/, function(secondInput) {

		var optionNa1 = browser.$("#flexible-table-container").$("table")
			.$("tbody");
		var optionNa2 = optionNa1.$$("tr")[3].$("td").$(".field-picker-checkbox");
		var optionNa3 = optionNa2.$("div").$("label");

		optionNa3.click();

		browser.$("#field-picker-back-button").click();

		var secondInputFieldList = browser.$("#editor-control-columnSelectInputFieldList").$$("option");
		expect(3).toEqual(secondInputFieldList.length);

	});

	this.Then(/^I verify "([^"]*)" is not present first input control$/, function(secondInput) {
		browser.$$("#add-fields-button")[0].click();

		var checkFirstTablefields = browser.$$(".reactable-data")[1].$$("tr");
		var fieldFlag = true;

		checkFirstTablefields.forEach(function(checkFirstTablefield) {
			var fieldName = checkFirstTablefield.$$("td")[1];
			if (secondInput === fieldName.getText()) {
				fieldFlag = false;
			}
		});
		expect(fieldFlag).toEqual(true);

		browser.$("#field-picker-back-button").click();
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

		expect("1").toEqual((eventLogJSON[eventLogJSON.length - 1].data.form.checkpointInterval).toString());
		expect(radioButtonOption).toEqual((eventLogJSON[eventLogJSON.length - 1].data.form.impurity).toString());

	});

	this.Then(/^I verify "([^"]*)" is a "([^"]*)" in ExpressionEditor$/, function(word, type) {
		const CMline = browser.$("#ExpressionEditor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-" + type;
		const testWord = (type === "string") ? "\"" + word + "\"" : word;

		expect(testWord).toEqual(CMline.$$(searchClass)[0].getText());

	});

	this.Then(/^I verify that the placeholder text is "([^"]*)" in ExpressionEditor$/, function(testText) {
		const CMplaceholder = browser.$("#ExpressionEditor").$(".CodeMirror-placeholder");

		expect(testText).toEqual(CMplaceholder.getText());

	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and verify that (\d+) autocomplete hints are displayed$/, function(enterText, hintCount) {

		const hintNumber = browser.execute(getAutoCompleteCount, enterText);
		expect(hintNumber.value).toEqual(Number(hintCount));

	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and verify error "([^"]*)" and save$/, function(enterText, errorText) {

		browser.execute(getAutoCompleteCount, enterText);
		const errLine = browser.$(".expression-validation-message");
		expect(errorText).toEqual(errLine.$(".form__validation--error").getText());

		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();

	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and select "([^"]*)" a "([^"]*)"$/, function(enterText, selectText, type) {
		browser.execute(selectAutoComplete, enterText);
		const CMline = browser.$("#ExpressionEditor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-" + type;

		expect(selectText).toEqual(CMline.$$(searchClass)[0].getText());
	});


	this.Then(/^I enter "([^"]*)" in ExpressionEditor and verify it is a "([^"]*)"$/, function(enterText, type) {
		const setText = (type === "string") ? "\"" + enterText + "\"" : enterText;
		browser.execute(setTextValue, setText, false);

		const CMline = browser.$("#ExpressionEditor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-" + type;
		expect(setText).toEqual(CMline.$$(searchClass)[0].getText());
	});

	this.Then(/^I enter "([^"]*)" in ExpressionEditor and press autocomplete and select "([^"]*)" and verify save$/, function(enterText, selectText) {
		browser.execute(selectAutoComplete, enterText);
		const CMline = browser.$("#ExpressionEditor").$$(".CodeMirror-line")[0];
		const searchClass = ".cm-keyword";

		expect(selectText).toEqual(CMline.$$(searchClass)[0].getText());

		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();

		browser.timeouts("script", 3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);

		expect(selectText).toEqual((eventLogJSON[eventLogJSON.length - 1].data.form.conditionExpr).toString());
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
		expect("-1").not.toEqual((eventLogJSON[eventLogJSON.length - 1].data.form.samplingSeed).toString());
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

		var naKey = (JSON.stringify(eventLogJSON[eventLogJSON.length - 1].data.form.keys[0])).includes("Na");
		var drugKey = (JSON.stringify(eventLogJSON[eventLogJSON.length - 1].data.form.keys[1])).includes("Drug");
		var drugValue = (JSON.stringify(eventLogJSON[eventLogJSON.length - 1].data.form.keys[1])).includes("Ascending");
		var cholesterolKey = (JSON.stringify(eventLogJSON[eventLogJSON.length - 1].data.form.keys[2])).includes("Cholesterol");

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
		tableCell1.setValue("", "Na");
		var tableCell2 = browser.$(".modal-title");
		tableCell2.click();

		var errormessage1 = browser.$$(".validation-error-message")[0].$("span");
		var errormsg = errormessage1.getText();
		// var errormsg = browser.$(".form__validation--error").getText();

		expect("The given column name is already in use in the current dataset").toEqual(errormsg);
		var okButton = browser.$(".modal__buttons").$$(".button")[0];
		okButton.click();
	});

	this.Then(/^I check table cell enablement$/, function() {
		var firstCheck = browser.$$(".properties-tooltips-container")[5];
		var dropdowns = browser.$$(".Dropdown-control ");
		var disabledDropdowns = browser.$$(".Dropdown-disabled");
		expect(dropdowns.length).toEqual(10);
		expect(disabledDropdowns.length).toEqual(9);
		firstCheck.click();

		// After turning off the checkbox, there should now be one more disabled dropdown
		disabledDropdowns = browser.$$(".Dropdown-disabled");
		expect(disabledDropdowns.length).toEqual(10);
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

	this.Then("I verify testValue is not present", function() {
		browser.timeoutsAsyncScript(3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);
		expect("empty").toEqual((eventLogJSON[eventLogJSON.length - 2].data.form).toString());
	});

	this.Then("I verify testValue is present", function() {
		browser.timeoutsAsyncScript(3000);
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		var eventLogJSON = JSON.parse(eventLog.value);
		expect("testValue").toEqual((eventLogJSON[eventLogJSON.length - 2].data.form.colName).toString());
	});

	this.Then(/^I select the Tab (\d+)$/, function(tabNumber) {
		var tabIndex = tabNumber - 1;
		var tab = browser.$$(".tabs__tab")[tabIndex];
		tab.click();
	});

	this.Then("I open the Table Input Sub Panel", function() {
		var tableInputbrowsebutton = browser.$$(".btn-xs")[2];
		tableInputbrowsebutton.click();
	});

	this.Then(/^I update the value of Name textbox with "([^"]*)"$/, function(nodeName) {
		var nameTextBox = browser.$("#editor-control-name");
		nameTextBox.setValue("", nodeName);
	});

	this.Then(/^I verify that the validation error is "([^"]*)"$/, function(validationError) {
		var validationDOMError = browser.$(".form__validation--error").getText();
		expect(validationError).toEqual(validationDOMError);
	});

	this.Then(/^I verify that the validation warning is "([^"]*)"$/, function(validationWarning) {
		var validationDOMError = browser.$(".form__validation--warning").getText();
		expect(validationWarning).toEqual(validationDOMError);
	});

	this.Then("I close the subPanel dialog", function() {
		var closeButton = browser.$$(".modal__buttons")[1].$(".button");
		closeButton.click();
	});

};
