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

import propertyUtils from "../../_utils_/property-utils";
import { expect } from "chai";
import numberfieldParamDef from "../../test_resources/paramDefs/numberfield_paramDef.json";
import structuretableParamDef from "../../test_resources/paramDefs/structuretable_paramDef.json";
import actionParamDef from "../../test_resources/paramDefs/action_paramDef.json";
import tableUtils from "./../../_utils_/table-utils";

describe("condition messages should add alerts tab", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldParamDef);
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	// Skipping this test till carbon 11 bug is fixed - https://github.com/carbon-design-system/carbon/issues/15985
	it.skip("control should have error message from null input and generator should trigger validation", () => {
		let integerInput = wrapper.find("div[data-id='properties-number_int'] input");
		expect(integerInput).to.have.length(1);
		integerInput.simulate("change", { target: { value: "", validity: { badInput: false } } });

		const randomInput = wrapper.find("div[data-id='properties-number_random'] input");
		expect(randomInput).to.have.length(1);
		randomInput.simulate("change", { target: { value: "", validity: { badInput: false } } });
		// get alerts tabs
		let alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		let alertButton = alertCategory.find("button.cds--accordion__heading");
		expect(alertButton.text()).to.equal("Alerts (2)");
		alertButton.simulate("click");

		// ensure that alert tab is open
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		const alertDiv = alertCategory.find("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(2);
		expect(alertList.at(0).text()).to.equal("You must enter a value for Integer.");
		expect(alertList.at(1).text()).to.equal("You must enter a value for Random.");

		// go to Values tab by clicking on error message
		alertList.at(0).find("a.properties-link-text")
			.simulate("click");
		let valuesCategory = wrapper.find("div.properties-category-container").at(1); // Values category
		expect(valuesCategory.find("button.cds--accordion__heading").text()).to.equal("Values (2)");

		// regenerate random number should decrease alert list
		let valuesDiv = valuesCategory.find("li.properties-category-content.show"); // Values div
		expect(valuesDiv).to.have.length(1);
		const generator = valuesDiv.find("button.properties-number-generator");
		expect(generator).to.have.length(2);
		generator.at(0).simulate("click");

		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		alertButton = alertCategory.find("button.cds--accordion__heading");
		expect(alertButton.text()).to.equal("Alerts (1)");
		alertButton.simulate("click");

		alertList = alertCategory.find("a.properties-link-text");
		expect(alertList).to.have.length(1);
		expect(alertList.at(0).text()).to.equal("You must enter a value for Integer.");
		alertList.at(0).find("a.properties-link-text")
			.simulate("click");

		// enter new integer value to remove all Alerts
		valuesCategory = wrapper.find("div.properties-category-container").at(1); // Values category
		expect(valuesCategory.find("button.cds--accordion__heading").text()).to.equal("Values (1)");

		valuesDiv = valuesCategory.find("li.properties-category-content.show"); // Values category
		expect(valuesDiv).to.have.length(1);
		integerInput = valuesDiv.find("div[data-id='properties-number_int'] input");
		expect(integerInput).to.have.length(1);
		integerInput.simulate("change", { target: { value: "1" } });

		valuesCategory = wrapper.find("div.properties-category-container").at(0); // Values category
		expect(valuesCategory.find("button.cds--accordion__heading").text()).to.equal("Values");
	});
	// Skipping this test till carbon 11 bug is fixed - https://github.com/carbon-design-system/carbon/issues/15985
	it.skip("alerts should not show messages for hidden controls", () => {
		// open the conditions tabs
		const conditionsCategory = wrapper.find("div.properties-category-container").at(1); // Conditions category
		const conditionsButton = conditionsCategory.find("button.cds--accordion__heading");
		expect(conditionsButton.text()).to.equal("Conditions");
		conditionsButton.simulate("click");

		// unhide the number field
		const checkboxWrapper = wrapper.find("div[data-id='properties-hide']");
		const checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(true);
		checkbox.getDOMNode().checked = false;
		checkbox.simulate("change");

		// set the required field to empty to generate an error
		const integerInput = wrapper.find("div[data-id='properties-number_hidden'] input");
		expect(integerInput).to.have.length(1);
		integerInput.simulate("change", { target: { value: "", validity: { badInput: false } } });

		// get alerts tabs
		let alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		const alertButton = alertCategory.find("button.cds--accordion__heading");
		expect(alertButton.text()).to.equal("Alerts (1)");
		alertButton.simulate("click");

		// ensure that alert tab is open
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		let alertDiv = alertCategory.find("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(1);
		expect(alertList.at(0).text()).to.equal("You must enter a value for Number Hidden.");

		// hide the number field
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");

		// there should be no alerts for the hidden field
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		alertDiv = alertCategory.find("li.properties-category-content.show"); // Alerts div
		alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(0);
	});
});
describe("condition messages should add alerts tab for tables", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("alerts should show messages for invalid fields on initial load", () => {
		// validate the Alerts tab has 2 warnings
		// get alerts tabs
		let alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		const alertButton = alertCategory.find("button.cds--accordion__heading");
		expect(alertButton.text()).to.equal("Alerts (2)");
		alertButton.simulate("click");

		// ensure that alert tab is open
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		let alertDiv = alertCategory.find("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(2);
		expect(alertList.at(0).text()).to.equal("There are 2 warning cells. ");
		expect(alertList.at(1).text()).to.equal("There are 2 warning cells. ");

		// Clear 1 alert
		// open the summary link for configure no header table
		const summary = wrapper.find("div[data-id='properties-structuretableNoHeader-summary-panel']");
		const summaryButton = summary.find("button.properties-summary-link-button");
		summaryButton.simulate("click");

		let tableWrapper = wrapper.find("div[data-id='properties-ft-structuretableNoHeader']");
		// select first 2 rows in table
		const tableData = tableUtils.getTableRows(tableWrapper);
		expect(tableData).to.have.length(2);

		tableUtils.selectCheckboxes(tableData, [0, 1]);
		// ensure removed button is enabled and select it
		tableWrapper = wrapper.find("div[data-id='properties-ft-structuretableNoHeader']");
		const removeFieldsButtons = tableWrapper.find("button.properties-remove-fields-button"); // field picker buttons
		expect(removeFieldsButtons.prop("disabled")).to.equal(false);
		removeFieldsButtons.at(0).simulate("click"); // remove a row

		// Save wide flyout
		const okButton = wrapper.find(".properties-wf-content")
			.find(".properties-modal-buttons")
			.find("Button[className='properties-apply-button']");
		okButton.simulate("click");

		// validate the Alerts tab has only 1 warning
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		alertDiv = alertCategory.find("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(1);
		expect(alertList.at(0).text()).to.equal("There are 2 warning cells. ");
	});

	it("alerts should not show messages for hidden table controls", () => {
		// open the conditions tabs
		const conditionsCategory = wrapper.find("div.properties-category-container").at(5); // Conditions category
		const conditionsButton = conditionsCategory.find("button.cds--accordion__heading");
		expect(conditionsButton.text()).to.equal("Conditions");
		conditionsButton.simulate("click");

		// open the summary link for hide tables
		let summary = wrapper.find("div[data-id='properties-structuretableRenameFields-summary-panel']");
		let summaryButton = summary.find("button.properties-summary-link-button");
		summaryButton.simulate("click");

		// set the error condition in the table
		let cellDropdown = wrapper.find("div[data-id='properties-structuretableRenameFields_0_3']");

		let dropdown = cellDropdown.find("select");
		dropdown.simulate("change", { target: { value: "number" } });
		wrapper.update();

		cellDropdown = wrapper.find("div[data-id='properties-structuretableRenameFields_0_3']");
		dropdown = cellDropdown.find("select");

		// validate there is an error
		cellDropdown = wrapper.find("div[data-id='properties-structuretableRenameFields_0_3']");
		const messageWrapper = cellDropdown.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);

		// Save the summary panel
		summary = wrapper.find("div[data-id='properties-structuretableRenameFields-summary-panel']");
		let buttonDiv = summary.find("div.properties-modal-buttons");
		expect(buttonDiv).to.have.length(1);
		let applyButton = buttonDiv.find("button[data-id='properties-apply-button']");
		applyButton.simulate("click");

		// validate the Alerts tab has the error
		// get alerts tabs
		let alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		const alertButton = alertCategory.find("button.cds--accordion__heading");
		expect(alertButton.text()).to.equal("Alerts (3)");
		alertButton.simulate("click");

		// ensure that alert tab is open
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		let alertDiv = alertCategory.find("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(3);
		expect(alertList.at(0).text()).to.equal("The field cannot contain 'number'");

		// open the summary link for the hide table
		summary = wrapper.find("div[data-id='properties-structuretableRenameFields-summary-panel']");
		summaryButton = summary.find("button.properties-summary-link-button");
		summaryButton.simulate("click");

		// hide the table
		const checkboxWrapper = wrapper.find("div[data-id='properties-showRenameFieldsTable']");
		const checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(true);
		checkbox.getDOMNode().checked = false;
		checkbox.simulate("change");

		// Save the summary panel
		summary = wrapper.find("div[data-id='properties-structuretableRenameFields-summary-panel']");
		buttonDiv = summary.find("div.properties-modal-buttons");
		expect(buttonDiv).to.have.length(1);
		applyButton = buttonDiv.find("button[data-id='properties-apply-button']");
		applyButton.simulate("click");

		// Verify the Error is cleared from Alerts tab
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		alertDiv = alertCategory.find("li.properties-category-content.show"); // Alerts div
		alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(2);
		expect(alertList.at(0).text()).to.not.equal("The field cannot contain 'number'");
	});

	it("alerts should not show messages for hidden table cell controls", () => {
		// TODO when issue 1555 is implemented
	});

});

describe("Show/hide Alerts tab based on showAlertsTab boolean in propertiesConfig", () => {

	it("Hide Alerts tab when showAlertsTab=false in propertiesConfig", () => {
		// No "Alerts" tab. Also no messageCount next to Summary Panel Actions.
		const categoryLabels = ["Actions", "Conditions", "Summary Panel Actions"];

		const renderedObject = propertyUtils.flyoutEditorForm(actionParamDef, { showAlertsTab: false });
		const wrapper = renderedObject.wrapper;

		const allCategories = wrapper.find("div.properties-category-container");
		expect(allCategories).to.have.length(3);

		allCategories.forEach((category, idx) => {
			const categoryTitle = category.find("button.cds--accordion__heading").text();
			expect(categoryTitle).to.equal(categoryLabels[idx]);
		});
	});

	it("Show Alerts tab when showAlertsTab=true in propertiesConfig", () => {
		// Shows "Alerts" tab and messageCount next to Summary Panel Actions.
		const categoryLabels = ["Alerts (1)", "Actions", "Conditions", "Summary Panel Actions (1)"];

		const renderedObject = propertyUtils.flyoutEditorForm(actionParamDef, { showAlertsTab: true });
		const wrapper = renderedObject.wrapper;

		const allCategories = wrapper.find("div.properties-category-container");
		expect(allCategories).to.have.length(4);

		allCategories.forEach((category, idx) => {
			const categoryTitle = category.find("button.cds--accordion__heading").text();
			expect(categoryTitle).to.equal(categoryLabels[idx]);
		});
	});

	it("Show Alerts tab when showAlertsTab is not set in propertiesConfig", () => {
		// Shows "Alerts" tab and messageCount next to Summary Panel Actions.
		const categoryLabels = ["Alerts (1)", "Actions", "Conditions", "Summary Panel Actions (1)"];

		const renderedObject = propertyUtils.flyoutEditorForm(actionParamDef);
		const wrapper = renderedObject.wrapper;

		const allCategories = wrapper.find("div.properties-category-container");
		expect(allCategories).to.have.length(4);

		allCategories.forEach((category, idx) => {
			const categoryTitle = category.find("button.cds--accordion__heading").text();
			expect(categoryTitle).to.equal(categoryLabels[idx]);
		});
	});

});
