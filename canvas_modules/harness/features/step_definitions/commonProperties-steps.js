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

import { getControlContainerFromName, getSummaryFromName } from "./utilities/validate-utils.js";
import isEmpty from "lodash/isEmpty";
import testUtils from "./utilities/test-utils.js";

/* global browser */

module.exports = function() {
	this.Then(/^I enter "([^"]*)" in the textbox "([^"]*)"$/, function(textboxValue, controlId) {

		var textbox = browser.$("div[data-id='properties-" + controlId + "']");
		textbox.$("input").setValue("", textboxValue);
		clickApplyButton();
		var lastEventLog = testUtils.getLastEventLogData();

		expect(textboxValue).toEqual((lastEventLog.data.form[controlId]).toString());
	});
	this.Then(/^I verify "([^"]*)" is not present in the textbox "([^"]*)"/, function(textboxValue, controlId) {
		var lastEventLog = testUtils.getLastEventLogData(2);
		expect("").toEqual((lastEventLog.data.form[controlId]).toString());

	});

	this.Then(/^I verify "([^"]*)" is present in the textbox "([^"]*)"/, function(textboxValue, controlId) {
		var lastEventLog = testUtils.getLastEventLogData(2);
		expect(textboxValue).toEqual((lastEventLog.data.form[controlId]).toString());
	});

	this.Then(/^I send "([^"]*)" to the "([^"]*)" textbox control$/, function(key, controlId) {
		const textbox = browser.$("div[data-id='properties-" + controlId + "']").$("input");
		textbox.click();
		textbox.keys("Backspace");
	});
	this.Then("I click on title edit icon", function() {
		var editTitle = browser.$("button.properties-title-editor-btn.edit");
		expect(editTitle).not.toBe(null);
		editTitle.click();
	});
	this.Then(/^I enter new title "([^"]*)"$/, function(newTitle) {
		var textbox = browser.$("div.properties-title-editor-input").$("input");
		textbox.setValue(newTitle);
		// browser.keys("Enter");
		// browser.pause(500);
	});
	// =======================
	this.Then(/^I see common properties flyout title "([^"]*)"$/, function(givenTitle) {
		browser.pause(500);
		expect(browser.getValue(".properties-title-editor-input input")).toEqual(givenTitle);
	});

	this.Then("I don't see the common properties flyout", function() {
		browser.pause(500);
		expect(isEmpty(browser.$$("#node-title-editor-right-flyout-panel"))).toBe(true);
	});

	this.Then(/^I click the "([^"]*)" category from flyout$/, function(categoryName) {
		const categories = browser.$(".right-flyout-panel").$$(".properties-category-container");
		for (let idx = 0; idx < categories.length; idx++) {
			const category = categories[idx].$(".properties-category-title");
			if (category.getText() === categoryName.toUpperCase()) {
				category.click();
				break;
			}
		}
	});

	this.Then(/^I click the "([^"]*)" button on the "([^"]*)" table$/, function(buttonName, tableName) {
		const tableDiv = browser.$("div[data-id='properties-ft-" + tableName + "']");
		expect(tableDiv.value).not.toBe(null);
		if (buttonName === "Add") {
			tableDiv.$(".properties-add-fields-button").click();
		} else {
			tableDiv.$(".properties-remove-fields-button").click();
		}
	});

	this.Then(/^I select the row (\d+) in the table "([^"]*)"$/, function(rowNumber, tableControlId) {
		const containingDiv = browser.$("div[data-id='properties-" + tableControlId + "']");
		const rows = containingDiv.$(".reactable-data")
			.$$("tr");
		rows[Number(rowNumber) - 1].click();
	});

	this.Then(/^I select all the rows in the table "([^"]*)"$/, function(tableControlId) {
		const containingDiv = browser.$("div[data-id='properties-" + tableControlId + "']");
		const rows = containingDiv.$(".reactable-data")
			.$$("tr");
		browser.keys("Shift");
		for (var index = 0; index < rows.length; index++) {
			rows[index].click();
		}
		browser.keys("Shift");
	});

	this.Then(/^I verify the new title "([^"]*)"$/, function(newTitle) {
		const lastEventLog = testUtils.getLastLogOfType("applyPropertyChanges()");
		expect(newTitle).toEqual((lastEventLog.data.title).toString());
	});

	this.Then(/^I verify the event log for the "([^"]*)" parameter contains "([^"]*)"$/, function(parameterName, values) {
		const lastEventLog = testUtils.getLastLogOfType("applyPropertyChanges()");
		// console.log(JSON.stringify(lastEventLog.data.form, null, 2));
		expect(values).toEqual((String(lastEventLog.data.form[parameterName])));
	});

	this.Then(/^I click on the "([^"]*)" panel OK button$/, function(panelName) {
		const panel = browser.$("div[data-id='properties-" + panelName + "']");
		expect(panel).not.toBe(null);

		clickApplyButton(panel);
	});

	this.Then(/^I click the subpanel button "([^"]*)" button in control "([^"]*)" in row "([^"]*)"$/, function(buttonName, controlId, row) {
		var table = browser.$("div[data-id='properties-" + controlId + "']");
		var subcell = table.$$(".properties-table-subcell")[row];
		expect(subcell).not.toBe(null);
		if (buttonName === "OK") {
			clickApplyButton(subcell);
		} else {
			clickCancelButton(subcell);
		}
	});

	this.Then(/^I click on the "([^"]*)" button$/, function(buttonName) {
		if (buttonName === "OK" || buttonName === "Save") {
			clickApplyButton();
		} else {
			clickCancelButton();
		}
	});

	this.Then(/^I have closed the common properties dialog by clicking on close button$/, function() {
		clickApplyButton();
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
		browser.moveToObject(".right-flyout-panel", Number(mouseX), Number(mouseY));
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
		const buttons = browser.$$(".properties-action-button button");
		for (const button of buttons) {
			if (button.getText() === actionName) {
				button.click();
				break;
			}
		}
	});
	this.Then(/^I verify that readonly value is "([^"]*)"$/, function(value) {
		const text = browser.$$(".properties-readonly span")[0];
		expect(value).toEqual(text.getText());
	});

	this.Then(/^I verify readonly control "([^"]*)" value is "([^"]*)"$/, function(controlId, value) {
		const text = browser.$("div[data-id='properties-" + controlId + "'] span");
		expect(value).toEqual(text.getText());
	});

	this.Then(/^I verify readonly control "([^"]*)" has no text overflow/, function(controlId) {
		const spanText = browser.$("div[data-id='properties-" + controlId + "'] span").getElementSize("height");
		expect(spanText).toBeLessThan(25); // the span height should not be a large number, as this indicates a text overflow
	});

	this.Then(/^I verify readonly control "([^"]*)" CSS style "([^"]*)" is "([^"]*)"$/, function(controlId, style, value) {
		const text = browser.$("div[data-id='properties-" + controlId + "'] span");
		expect(text.getCssProperty(style).value).toEqual(value);
	});

	this.Then(/^I verify the event log title is "([^"]*)"$/, function(title) {
		const lastEventLog = testUtils.getLastLogOfType("applyPropertyChanges()");
		expect(title).toEqual(lastEventLog.data.title);
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

	this.Then(/^I enter "([^"]*)" in the "([^"]*)" field in "([^"]*)" canvas$/, function(value, fieldName, canvas) {
		const startElement = (canvas === "top") ? browser.$$(".harness-canvas-single")[0] : browser.$$(".harness-canvas-single")[1];
		const inputField = startElement.$("div[data-id='properties-" + fieldName + "'] input");
		inputField.setValue("", Number(value));
		clickApplyButton(startElement);

		var lastEventLog = testUtils.getLastLogOfType("applyPropertyChanges()");
		expect(value).toEqual((lastEventLog.data.form[fieldName]).toString());
	});

	function clickApplyButton(startElement) {
		const start = (startElement) ? startElement : browser;
		const applyButtons = start.$$("button.properties-apply-button");
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
