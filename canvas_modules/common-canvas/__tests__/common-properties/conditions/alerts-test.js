/*
 * Copyright 2017-2023 Elyra Authors
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

import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import { expect } from "chai";
import numberfieldParamDef from "../../test_resources/paramDefs/numberfield_paramDef.json";
import structuretableParamDef from "../../test_resources/paramDefs/structuretable_paramDef.json";
import actionParamDef from "../../test_resources/paramDefs/action_paramDef.json";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import { fireEvent } from "@testing-library/react";

describe("condition messages should add alerts tab", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldParamDef);
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("control should have error message from null input and generator should trigger validation", () => {
		const { container } = wrapper;
		let integerInput = container.querySelectorAll("div[data-id='properties-number_int'] input");
		expect(integerInput).to.have.length(1);
		integerInput[0].setAttribute("badInput", false);
		fireEvent.change(integerInput[0], { target: { value: "" } });
		const randomInput = container.querySelectorAll("div[data-id='properties-number_random'] input");
		expect(randomInput).to.have.length(1);
		randomInput[0].setAttribute("badInput", false);
		fireEvent.change(randomInput[0], { target: { value: "" } });

		// get alerts tabs
		let alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		let alertButton = alertCategory.querySelector("button.cds--accordion__heading");
		expect(alertButton.textContent).to.equal("Alerts (2)");
		fireEvent.click(alertButton);

		// ensure that alert tab is open
		alertCategory = container.querySelector("div.properties-category-container"); // alert category
		const alertDiv = alertCategory.querySelectorAll("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv[0].querySelectorAll("a.properties-link-text");
		expect(alertList).to.have.length(2);
		expect(alertList[0].textContent).to.equal("You must enter a value for Integer.");
		expect(alertList[1].textContent).to.equal("You must enter a value for Random.");

		// go to Values tab by clicking on error message
		fireEvent.click(alertList[0]);
		let valuesCategory = container.querySelectorAll("div.properties-category-container")[1]; // Values category
		expect(valuesCategory.querySelector("button.cds--accordion__heading").textContent).to.equal("Values (2)");

		// regenerate random number should decrease alert list
		let valuesDiv = valuesCategory.querySelectorAll("li.properties-category-content.show"); // Values div
		expect(valuesDiv).to.have.length(1);
		const generator = valuesDiv[0].querySelectorAll("button.properties-number-generator");
		expect(generator).to.have.length(2);
		fireEvent.click(generator[0]);

		alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		alertButton = alertCategory.querySelector("button.cds--accordion__heading");
		expect(alertButton.textContent).to.equal("Alerts (1)");
		fireEvent.click(alertButton);

		alertList = alertCategory.querySelectorAll("a.properties-link-text");
		expect(alertList).to.have.length(1);
		expect(alertList[0].textContent).to.equal("You must enter a value for Integer.");
		fireEvent.click(alertList[0]);

		// enter new integer value to remove all Alerts
		valuesCategory = container.querySelectorAll("div.properties-category-container")[1]; // Values category
		expect(valuesCategory.querySelector("button.cds--accordion__heading").textContent).to.equal("Values (1)");

		valuesDiv = valuesCategory.querySelectorAll("li.properties-category-content.show"); // Values category
		expect(valuesDiv).to.have.length(1);
		integerInput = valuesDiv[0].querySelectorAll("div[data-id='properties-number_int'] input");
		expect(integerInput).to.have.length(1);
		fireEvent.change(integerInput[0], { target: { value: "1" } });

		valuesCategory = container.querySelectorAll("div.properties-category-container")[0]; // Values category
		expect(valuesCategory.querySelector("button.cds--accordion__heading").textContent).to.equal("Values");
	});
	it("alerts should not show messages for hidden controls", () => {
		// open the conditions tabs
		const { container } = wrapper;
		const conditionsCategory = container.querySelectorAll("div.properties-category-container")[1]; // Conditions category
		const conditionsButton = conditionsCategory.querySelector("button.cds--accordion__heading");
		expect(conditionsButton.textContent).to.equal("Conditions");
		fireEvent.click(conditionsButton);

		// unhide the number field
		const checkboxWrapper = container.querySelector("div[data-id='properties-hide']");
		const checkbox = checkboxWrapper.querySelector("input");
		expect(checkbox.checked).to.equal(true);
		checkbox.setAttribute("checked", false);
		fireEvent.click(checkbox);

		// set the required field to empty to generate an error
		const integerInput = container.querySelectorAll("div[data-id='properties-number_hidden'] input");
		expect(integerInput).to.have.length(1);
		integerInput[0].setAttribute("badInput", false);
		fireEvent.change(integerInput[0], { target: { value: "" } });

		// get alerts tabs
		let alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		const alertButton = alertCategory.querySelector("button.cds--accordion__heading");
		expect(alertButton.textContent).to.equal("Alerts (1)");
		fireEvent.click(alertButton);

		// ensure that alert tab is open
		alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		let alertDiv = alertCategory.querySelectorAll("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv[0].querySelectorAll("a.properties-link-text");
		expect(alertList).to.have.length(1);
		expect(alertList[0].textContent).to.equal("You must enter a value for Number Hidden.");

		// hide the number field
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);

		// there should be no alerts for the hidden field
		alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		alertDiv = alertCategory.querySelector("li.properties-category-content"); // Alerts div
		alertList = alertDiv.querySelectorAll("a.properties-link-text");
		expect(alertList).to.have.length(0);
	});
});
describe("condition messages should add alerts tab for tables", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("alerts should show messages for invalid fields on initial load", () => {
		// validate the Alerts tab has 2 warnings
		// get alerts tabs
		const { container } = wrapper;
		let alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		const alertButton = alertCategory.querySelector("button.cds--accordion__heading");
		expect(alertButton.textContent).to.equal("Alerts (2)");
		fireEvent.click(alertButton);

		// ensure that alert tab is open
		alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		let alertDiv = alertCategory.querySelectorAll("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv[0].querySelectorAll("a.properties-link-text");
		expect(alertList).to.have.length(2);
		expect(alertList[0].textContent).to.equal("There are 2 warning cells. ");
		expect(alertList[1].textContent).to.equal("There are 2 warning cells. ");

		// Clear 1 alert
		// open the summary link for configure no header table
		const summary = container.querySelector("div[data-id='properties-structuretableNoHeader-summary-panel']");
		const summaryButton = summary.querySelector("button.properties-summary-link-button");
		fireEvent.click(summaryButton);

		const tableWrapper = container.querySelector("div[data-id='properties-ft-structuretableNoHeader']");
		// select first 2 rows in table
		const tableData = tableUtilsRTL.getTableRows(tableWrapper);
		expect(tableData).to.have.length(2);

		tableUtilsRTL.selectCheckboxes(tableData, [0, 1]);
		// ensure table toolbar has delete button and select it
		const tableToolbar = container.querySelector("div.properties-table-toolbar");
		const deleteButton = tableToolbar.querySelectorAll("button.properties-action-delete");
		expect(deleteButton).to.have.length(1);
		fireEvent.click(deleteButton[0]); // remove a row

		// Save wide flyout
		const okButton = container.querySelector(".properties-wf-content")
			.querySelector(".properties-modal-buttons")
			.querySelector("button.properties-apply-button");
		fireEvent.click(okButton);

		// validate the Alerts tab has only 1 warning
		alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		alertDiv = alertCategory.querySelectorAll("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		alertList = alertDiv[0].querySelectorAll("a.properties-link-text");
		expect(alertList).to.have.length(1);
		expect(alertList[0].textContent).to.equal("There are 2 warning cells. ");
	});

	it("alerts should not show messages for hidden table controls", () => {
		// open the conditions tabs
		const { container } = wrapper;
		const conditionsCategory = container.querySelectorAll("div.properties-category-container")[5]; // Conditions category
		const conditionsButton = conditionsCategory.querySelector("button.cds--accordion__heading");
		expect(conditionsButton.textContent).to.equal("Conditions");
		fireEvent.click(conditionsButton);

		// open the summary link for hide tables
		let summary = container.querySelector("div[data-id='properties-structuretableRenameFields-summary-panel']");
		let summaryButton = summary.querySelector("button.properties-summary-link-button");
		fireEvent.click(summaryButton);

		// set the error condition in the table
		let cellDropdown = container.querySelector("div[data-id='properties-structuretableRenameFields_0_3']");

		let dropdown = cellDropdown.querySelector("select");
		fireEvent.change(dropdown, { target: { value: "number" } });

		cellDropdown = container.querySelector("div[data-id='properties-structuretableRenameFields_0_3']");
		dropdown = cellDropdown.querySelector("select");

		// validate there is an error
		cellDropdown = container.querySelector("div[data-id='properties-structuretableRenameFields_0_3']");
		const messageWrapper = cellDropdown.querySelectorAll("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);

		// Save the summary panel
		summary = container.querySelector("div[data-id='properties-structuretableRenameFields-summary-panel']");
		let buttonDiv = container.querySelectorAll("div.properties-modal-buttons");
		expect(buttonDiv).to.have.length(1);
		let applyButton = buttonDiv[0].querySelector("button[data-id='properties-apply-button']");
		fireEvent.click(applyButton);

		// validate the Alerts tab has the error
		// get alerts tabs
		let alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		const alertButton = alertCategory.querySelector("button.cds--accordion__heading");
		expect(alertButton.textContent).to.equal("Alerts (3)");
		fireEvent.click(alertButton);

		// ensure that alert tab is open
		alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		let alertDiv = alertCategory.querySelectorAll("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv[0].querySelectorAll("a.properties-link-text");
		expect(alertList).to.have.length(3);
		expect(alertList[0].textContent).to.equal("The field cannot contain 'number'");

		// open the summary link for the hide table
		summary = container.querySelector("div[data-id='properties-structuretableRenameFields-summary-panel']");
		summaryButton = summary.querySelector("button.properties-summary-link-button");
		fireEvent.click(summaryButton);

		// hide the table
		const checkboxWrapper = container.querySelector("div[data-id='properties-showRenameFieldsTable']");
		const checkbox = checkboxWrapper.querySelector("input");
		expect(checkbox.checked).to.equal(true);
		checkbox.setAttribute("checked", false);
		fireEvent.click(checkbox);

		// Save the summary panel
		summary = container.querySelector("div[data-id='properties-structuretableRenameFields-summary-panel']");
		buttonDiv = container.querySelectorAll("div.properties-modal-buttons");
		expect(buttonDiv).to.have.length(1);
		applyButton = buttonDiv[0].querySelector("button[data-id='properties-apply-button']");
		fireEvent.click(applyButton);

		// Verify the Error is cleared from Alerts tab
		alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		alertDiv = alertCategory.querySelector("li.properties-category-content.show"); // Alerts div
		alertList = alertDiv.querySelectorAll("a.properties-link-text");
		expect(alertList).to.have.length(2);
		expect(alertList[0].textContent).to.not.equal("The field cannot contain 'number'");
	});

	it("alerts should not show messages for hidden table cell controls", () => {
		// TODO when issue 1555 is implemented
	});

});

describe("Show/hide Alerts tab based on showAlertsTab boolean in propertiesConfig", () => {

	it("Hide Alerts tab when showAlertsTab=false in propertiesConfig", () => {
		// No "Alerts" tab. Also no messageCount next to Summary Panel Actions.
		const categoryLabels = ["Actions", "Conditions", "Summary Panel Actions"];

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(actionParamDef, { showAlertsTab: false });
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const allCategories = container.querySelectorAll("div.properties-category-container");
		expect(allCategories).to.have.length(3);

		allCategories.forEach((category, idx) => {
			const categoryTitle = category.querySelector("button.cds--accordion__heading").textContent;
			expect(categoryTitle).to.equal(categoryLabels[idx]);
		});
	});

	it("Show Alerts tab when showAlertsTab=true in propertiesConfig", () => {
		// Shows "Alerts" tab and messageCount next to Summary Panel Actions.
		const categoryLabels = ["Alerts (1)", "Actions", "Conditions", "Summary Panel Actions (1)"];

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(actionParamDef, { showAlertsTab: true });
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;

		const allCategories = container.querySelectorAll("div.properties-category-container");
		expect(allCategories).to.have.length(4);

		allCategories.forEach((category, idx) => {
			const categoryTitle = category.querySelector("button.cds--accordion__heading").textContent;
			expect(categoryTitle).to.equal(categoryLabels[idx]);
		});
	});

	it("Show Alerts tab when showAlertsTab is not set in propertiesConfig", () => {
		// Shows "Alerts" tab and messageCount next to Summary Panel Actions.
		const categoryLabels = ["Alerts (1)", "Actions", "Conditions", "Summary Panel Actions (1)"];

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(actionParamDef);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;

		const allCategories = container.querySelectorAll("div.properties-category-container");
		expect(allCategories).to.have.length(4);

		allCategories.forEach((category, idx) => {
			const categoryTitle = category.querySelector("button.cds--accordion__heading").textContent;
			expect(categoryTitle).to.equal(categoryLabels[idx]);
		});
	});

});
