/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { getControlContainerFromName, getSummaryFromName } from "./utilities/validate-utils.js";
import testUtils from "./utilities/test-utils.js";

/* global browser */

module.exports = function() {

	this.Then(/^I select the "([^"]*)" tab in "([^"]*)"$/, function(tabName, mode) {
		const labelName = (mode === "flyout") ? tabName.toUpperCase() : tabName;
		const tabList = (mode === "flyout") ? browser.$$(".category-title-container-right-flyout-panel") : browser.$(".tabs__list").$$("li");
		for (var idx = 0; idx < tabList.length; idx++) {
			const tabLabel = (mode === "flyout") ? tabList[idx].$("a") : tabList[idx];
			if (tabLabel.getText() === labelName) {
				tabLabel.click();
				break;
			}
		}
	});

	this.Then(/^I see common properties title "([^"]*)"$/, function(givenTitle) {
		browser.pause(500);
		var dialogTitle = browser.getText(".modal-title");
		expect(dialogTitle).toEqual(givenTitle);
	});

	this.Then(/^I enter text "([^"]*)" in the "([^"]*)" textbox control$/, function(textValue, controlId) {
		var textbox = browser.$("#" + controlId);
		textbox.setValue("", textValue);
	});

	this.Then(/^I send "([^"]*)" to the "([^"]*)" textbox control$/, function(key, controlId) {
		const textbox = browser.$("#" + controlId);
		textbox.click();
		textbox.keys("Backspace");
	});

	this.Then(/^I enter "([^"]*)" in the textbox Column name$/, function(textboxValue) {

		var textbox = browser.$("#editor-control-colName");
		textbox.setValue("", textboxValue);
		clickApplyButton();
		var lastEventLog = testUtils.getLastEventLogData();

		expect(textboxValue).toEqual((lastEventLog.data.form.colName).toString());
	});

	this.Then(/^I select "([^"]*)" dropdown option$/, function(dropdownValue) {
		var dropdown = browser.$(".Dropdown-placeholder");
		dropdown.click();
		var dropdownSelect = browser.$(".Dropdown-menu").$$(".Dropdown-option")[1];
		dropdownSelect.click();
		clickApplyButton();

		var lastEventLog = testUtils.getLastEventLogData();

		expect(dropdownValue).toEqual((lastEventLog.data.form.measurement).toString());
	});


	this.Then(/^I click on Add Columns button to open field picker at index "([^"]*)"$/, function(index) {
		browser.$$("#add-fields-button")[index].click();
		browser.pause(500);
	});

	this.Then(/^I click on Add Value button at index "([^"]*)"$/, function(index) {
		browser.$$("#add-fields-button")[index].click();
		browser.pause(500);
	});

	this.Then(/^I verify "([^"]*)" is not present second input control$/, function(firstInput) {
		var checkSecondTablefields = browser.$(".reactable-data").$$("tr");
		var fieldFlag = true;

		checkSecondTablefields.forEach(function(checkSecondTablefield) {
			var fieldName = checkSecondTablefield.$$("td")[1];
			if (firstInput === fieldName.getText()) {
				fieldFlag = false;
			}
		});
		expect(fieldFlag).toEqual(true);
	});

	this.Then(/^I verify "([^"]*)" is not present first input control$/, function(secondInput) {
		var checkFirstTablefields = browser.$(".reactable-data").$$("tr");
		var fieldFlag = true;

		checkFirstTablefields.forEach(function(checkFirstTablefield) {
			var fieldName = checkFirstTablefield.$$("td")[1];
			if (secondInput === fieldName.getText()) {
				fieldFlag = false;
			}
		});
		expect(fieldFlag).toEqual(true);
	});

	this.Then(/^I select "([^"]*)" radio button for Impurity$/, function(radioButtonOption) {

		var tab = browser.$$(".tabs__tab")[1];
		tab.click();

		var filterField = browser.$("#editor-control-checkpointInterval");
		filterField.setValue("", "1");

		var radiobuttonGini = browser.$("#radioset-control-container").$$("label")[0];
		radiobuttonGini.click();

		clickApplyButton();

		var lastEventLog = testUtils.getLastEventLogData();

		expect("1").toEqual((lastEventLog.data.form.checkpointInterval).toString());
		expect(radioButtonOption).toEqual((lastEventLog.data.form.impurity).toString());

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

		clickApplyButton();

		var lastEventLog = testUtils.getLastEventLogData();
		var checkboxPartitionClicked = JSON.stringify(lastEventLog).includes("samplingSeed");
		expect(true).toEqual(checkboxPartitionClicked);
		expect("-1").not.toEqual((lastEventLog.data.form.samplingSeed).toString());
	});

	this.Then(/^I change Order for Drug field and reorder$/, function() {

		browser.pause(500);
		var drugOrder = browser.$$(".toggletext_text")[1];
		drugOrder.click();

		var naRow = browser.$(".reactable-data").$$("tr")[0];
		naRow.click();

		var moveNaLast = browser.$$(".table-row-move-button:not([disabled])")[1];
		moveNaLast.click();

		var testmoveNaLast1 = browser.$(".table").$(".reactable-data");
		var testmoveNaLast2 = testmoveNaLast1.$(".table-selected-row").$$("td")[0].getText();
		expect("Na").toEqual(testmoveNaLast2);

		var drugRow = browser.$(".reactable-data").$$("tr")[0];
		drugRow.click();

		var moveDrugDown = browser.$$(".table-row-move-button:not([disabled])")[0];
		moveDrugDown.click();

		var testmoveDrugDown1 = browser.$(".table").$(".reactable-data");
		var testmoveDrugDown2 = testmoveDrugDown1.$(".table-selected-row").$$("td")[0].getText();
		expect("Drug").toEqual(testmoveDrugDown2);

		naRow = browser.$(".reactable-data").$$("tr")[2];
		naRow.click();

		var moveNaFirst = browser.$$(".table-row-move-button:not([disabled])")[0];
		moveNaFirst.click();

		var testmoveNaFirst1 = browser.$(".table").$(".reactable-data");
		var testmoveNaFirst2 = testmoveNaFirst1.$(".table-selected-row").$$("td")[0].getText();
		expect("Na").toEqual(testmoveNaFirst2);

		drugRow = browser.$(".reactable-data").$$("tr")[2];
		drugRow.click();

		var moveDrugUp = browser.$$(".table-row-move-button:not([disabled])")[1];
		moveDrugUp.click();

		clickApplyButton();

		var lastEventLog = testUtils.getLastEventLogData();
		var naKey = (JSON.stringify(lastEventLog.data.form.keys[0])).includes("Na");
		var drugKey = (JSON.stringify(lastEventLog.data.form.keys[1])).includes("Drug");
		var drugValue = (JSON.stringify(lastEventLog.data.form.keys[1])).includes("Ascending");
		var cholesterolKey = (JSON.stringify(lastEventLog.data.form.keys[2])).includes("Cholesterol");

		expect(true).toEqual(naKey);
		expect(true).toEqual(drugKey);
		expect(true).toEqual(drugValue);
		expect(true).toEqual(cholesterolKey);

	});

	this.Then(/^I check for validation error on Checkpoint Interval$/, function() {
		const tab = browser.$$(".tabs__tab")[1];
		tab.click();

		const checkpointIntervalTextBoxTest = browser.$("#editor-control-checkpointInterval");
		checkpointIntervalTextBoxTest.setValue("", 0);
		var errormessage1 = browser.$$(".editor_control_area")[0]
			.$(".validation-error-message")
			.$("span")
			.getText();
		expect("The checkpoint interval value must either be >= 1 or -1 to disable").toEqual(errormessage1);

		clickApplyButton();
	});

	this.Then(/^I check for table cell level validation$/, function() {
		var tableCell1 = browser.$$("#editor-control-new_name_0")[0];
		tableCell1.setValue("", "Na");
		var tableCell2 = browser.$(".modal-title");
		tableCell2.click();

		var errormessage1 = browser.$$(".validation-error-message")[0].$("span");
		var errormsg = errormessage1.getText();
		// var errormsg = browser.$(".form__validation--error").getText();

		expect("The given column name is already in use in the current dataset").toEqual(errormsg);
		clickApplyButton();
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
		clickApplyButton();
	});

	this.Then(/^I check for table validation$/, function() {
		var tableRow1 = browser.$$("#editor-control-new_name_0")[0];
		tableRow1.click();
		browser.$(".remove-fields-button").click();

		var tableRow2 = browser.$$("#editor-control-new_name_0")[0];
		tableRow2.click();
		browser.$(".remove-fields-button").click();

		var warningMsg = browser.$(".form__validation--warning").getText();
		expect("There are no selected columns to rename").toEqual(warningMsg);
		clickApplyButton();
	});


	this.Then(/^I have closed the common properties dialog by clicking on close button$/, function() {
		clickApplyButton();
	});

	this.Then("I verify testValue is not present", function() {
		var lastEventLog = testUtils.getLastEventLogData(2);
		expect("").toEqual((lastEventLog.data.form.colName).toString());

	});

	this.Then("I verify testValue is present", function() {
		var lastEventLog = testUtils.getLastEventLogData(2);
		expect("testValue").toEqual((lastEventLog.data.form.colName).toString());
	});

	this.Then(/^I select the Tab (\d+)$/, function(tabNumber) {
		var tabIndex = tabNumber - 1;
		var tab = browser.$$(".tabs__tab")[tabIndex];
		tab.click();
	});

	this.Then(/^I update the value of Seed textbox with "([^"]*)"$/, function(seedValue) {
		var seedTextBox = browser.$("#editor-control-numberfieldSeed");
		seedTextBox.setValue("", seedValue);
	});

	this.Then(/^I verify the value of Seed textbox with "([^"]*)"$/, function(seedValue) {
		var seedTextBox = browser.$("#editor-control-numberfieldSeed").getAttribute("value");
		expect(seedTextBox).toEqual(seedValue);
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
		clickCancelButton();
	});

	this.Then("I close the wideFlyout dialog", function() {
		clickCancelButton();
	});

	this.Then("I click on modal OK button", function() {
		clickApplyButton();
	});

	this.Then(/^I select the "([^"]*)" enable button$/, function(buttonName) {
		if (buttonName === "hide") {
			var hideCheckBox = browser.$$(".control-panel")[4].$$("label")[2];
			hideCheckBox.click();
		} else if (buttonName === "disable") {
			var disableCheckBox = browser.$$(".control-panel")[4].$$("label")[4];
			disableCheckBox.click();
		} else {
			browser.$("#editor-control-" + buttonName).click();
		}
	});

	this.Then(/^I click on the "([^"]*)" button$/, function(buttonName) {
		if (buttonName === "OK" || buttonName === "Save") {
			clickApplyButton();
		} else {
			clickCancelButton();
		}
	});

	this.Then(/^I select the "([^"]*)" button in "([^"]*)"$/, function(buttonName, mode) {
		var button;
		if (buttonName === "apply") {
			button = (mode === "flyout") ? browser.$("#properties-apply-button") : browser.$("#properties-apply-button");
		} else {
			button = (mode === "flyout") ? browser.$("#properties-cancel-button") : browser.$("#properties-cancel-button");
		}
		button.click();

	});

	this.Then(/^I click the dropdown menu in the "([^"]*)" container$/, function(container) {
		const dropdown = browser.$("#" + container).$(".Dropdown-placeholder");
		dropdown.click();
	});

	/** Hovers over the given text in the summaryPanel
	* @param text: value displayed in summary panels
	* @param summaryName: name of summaryPanel
	*/
	this.Then(/^I hover over the text "([^"]*)" in summary "([^"]*)"$/, function(text, summaryName) {
		const summary = getSummaryFromName(summaryName);
		if (summary !== null) {
			const values = summary.$$("span");
			for (let idx = 0; idx < values.length; idx++) {
				if (values[idx].getText() === text) {
					browser.$("#" + values[idx].getAttribute("id")).moveToObject();
					browser.pause(1000); // Wait for the tooltip to be displayed
					break;
				}
			}
		}
	});

	this.Then(/^I move the mouse to coordinates (\d+), (\d+) in common-properties$/, function(mouseX, mouseY) {
		browser.moveToObject("#common-properties-right-flyout-panel", Number(mouseX), Number(mouseY));
	});

	/** Verify the tooltip over the given text in the summaryPanel is 'visible'
	* @param text: value displayed in summary panels
	* @param summaryName: name of summaryPanel
	* @param visible: string value of 'visible' when tooltip is showing, other values for tooltip hidden
	*/
	this.Then(/^I verify the tip below the text "([^"]*)" in summary "([^"]*)" is "([^"]*)"$/, function(text, summaryName, visible) {
		const summary = getSummaryFromName(summaryName);
		const tips = summary.$$(".common-canvas-tooltip");
		let found = false;
		for (let idx = 0; idx < tips.length; idx++) {
			if (tips[idx].$("span").getText() === text) {
				found = true;
				expect(tips[idx].getAttribute("aria-hidden") === "false").toEqual(visible === "visible");
				break;
			}
		}
		// should have found the text for the tooltip in the summary table when tooltip is visible
		expect(found).toEqual(visible === "visible");
	});

	/** Verify the tooltip over the given text in the container is 'visible'
	* @param label: label of the container shown in the UI
	*/
	this.Then(/^I verify the tip for label "([^"]*)" is visible on the "([^"]*)"$/, function(label, location) {
		browser.pause(1000);
		const container = getControlContainerFromName(label);
		const tip = container.$(".common-canvas-tooltip");
		if (tip) {
			expect(tip.getAttribute("aria-hidden") === "false").toEqual(true);
			const containerLeft = container.getLocation().x;
			const tipLeft = tip.getLocation().x;
			if (location === "left") {
				expect(tipLeft).toBeLessThan(containerLeft);
			} else if (location === "right") {
				expect(tipLeft).toBeGreaterThan(containerLeft);
			}
		}
	});

	/*
	* Action steps
 	*/
	this.Then(/^I click the "([^"]*)" action$/, function(actionName) {
		const buttons = browser.$$(".properties-action-button .button");
		for (const button of buttons) {
			if (button.getText() === actionName) {
				button.click();
				break;
			}
		}
	});
	this.Then(/^I verify that readonly value is "([^"]*)"$/, function(value) {
		const text = browser.$$(".readonly-control text")[0];
		expect(value).toEqual(text.getText());
	});

	this.Then(/^I verify the event log title is "([^"]*)"$/, function(title) {
		const lastEventLog = testUtils.getLastLogOfType("applyPropertyChanges()");
		expect(title).toEqual(lastEventLog.data.title);
	});

	this.Then(/^I verify the event log for the "([^"]*)" parameter contains "([^"]*)"$/, function(parameterName, values) {
		const lastEventLog = testUtils.getLastLogOfType("applyPropertyChanges()");
		// console.log((lastEventLog.data.form[parameterName]).toString());
		expect(values).toEqual((String(lastEventLog.data.form[parameterName])));
	});

	this.Then(/^I verify the event log has no error messages$/, function() {
		const lastEventLog = testUtils.getLastLogOfType("applyPropertyChanges()");
		// console.log(lastEventLog.data.messages);
		expect(lastEventLog.data.messages.length).toEqual(0);
	});

	this.Then(/^I verify the event log has the "([^"]*)" message for the "([^"]*)" parameter of "([^"]*)"$/, function(msgType, parameterName, msg) {
		const lastEventLog = testUtils.getLastLogOfType("applyPropertyChanges()");
		// console.log(lastEventLog.data.messages);
		expect(lastEventLog.data.messages.length).not.toEqual(0);
		var found = false;
		for (var idx = 0; idx < lastEventLog.data.messages.length; idx++) {
			if (lastEventLog.data.messages[idx].text === msg &&
					lastEventLog.data.messages[idx].type === msgType &&
					lastEventLog.data.messages[idx].id_ref === parameterName) {
				found = true;
				break;
			}
		}
		expect(found).toEqual(true);
	});

	function clickApplyButton() {
		const applyButtons = browser.$$("#properties-apply-button");
		const button = applyButtons[applyButtons.length - 1];
		button.click();
		browser.pause(500);
	}

	function clickCancelButton() {
		const cancelButtons = browser.$$("#properties-cancel-button");
		const button = cancelButtons[cancelButtons.length - 1];
		button.click();
		browser.pause(500);
	}
};
