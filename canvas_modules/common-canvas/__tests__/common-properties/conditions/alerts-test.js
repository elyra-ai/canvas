/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../../_utils_/property-utils";
import { expect } from "chai";
import numberfieldParamDef from "../../test_resources/paramDefs/numberfield_paramDef.json";
import structuretableParamDef from "../../test_resources/paramDefs/structuretable_paramDef.json";


describe("condition messages should add alerts tab", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldParamDef);
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("control should have error message from null input and generator should trigger validation", () => {
		let integerInput = wrapper.find("div[data-id='properties-number_int'] input");
		expect(integerInput).to.have.length(1);
		integerInput.simulate("change", { target: { value: "", validity: { badInput: false } } });

		const randomInput = wrapper.find("div[data-id='properties-number_random'] input");
		expect(randomInput).to.have.length(1);
		randomInput.simulate("change", { target: { value: "", validity: { badInput: false } } });
		// get alerts tabs
		let alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		let alertButton = alertCategory.find("button.properties-category-title");
		expect(alertButton.text()).to.equal("ALERTS (2)");
		alertButton.simulate("click");

		// ensure that alert tab is open
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		const alertDiv = alertCategory.find("div.properties-category-content.show"); // ALERTS div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(2);
		expect(alertList.at(0).text()).to.equal("Required parameter 'Integer' has no value");
		expect(alertList.at(1).text()).to.equal("Required parameter 'Random' has no value");

		// go to VALUES tab by clicking on error message
		alertList.at(0).find("a.properties-link-text")
			.simulate("click");
		let valuesCategory = wrapper.find("div.properties-category-container").at(1); // VALUES category
		expect(valuesCategory.find("button.properties-category-title").text()).to.equal("VALUES (2)");

		// regenerate random number should decrease alert list
		let valuesDiv = valuesCategory.find("div.properties-category-content.show"); // VALUES div
		expect(valuesDiv).to.have.length(1);
		const generator = valuesDiv.find("button.properties-number-generator");
		expect(generator).to.have.length(1);
		generator.simulate("click");

		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		alertButton = alertCategory.find("button.properties-category-title");
		expect(alertButton.text()).to.equal("ALERTS (1)");
		alertButton.simulate("click");

		alertList = alertCategory.find("a.properties-link-text");
		expect(alertList).to.have.length(1);
		expect(alertList.at(0).text()).to.equal("Required parameter 'Integer' has no value");
		alertList.at(0).find("a.properties-link-text")
			.simulate("click");

		// enter new integer value to remove all Alerts
		valuesCategory = wrapper.find("div.properties-category-container").at(1); // VALUES category
		expect(valuesCategory.find("button.properties-category-title").text()).to.equal("VALUES (1)");

		valuesDiv = valuesCategory.find("div.properties-category-content.show"); // VALUES category
		expect(valuesDiv).to.have.length(1);
		integerInput = valuesDiv.find("div[data-id='properties-number_int'] input");
		expect(integerInput).to.have.length(1);
		integerInput.simulate("change", { target: { value: "1" } });

		valuesCategory = wrapper.find("div.properties-category-container").at(0); // VALUES category
		expect(valuesCategory.find("button.properties-category-title").text()).to.equal("VALUES");
	});
	it("alerts should not show messages for hidden controls", () => {
		// open the conditions tabs
		const conditionsCategory = wrapper.find("div.properties-category-container").at(1); // Conditions category
		const conditionsButton = conditionsCategory.find("button.properties-category-title");
		expect(conditionsButton.text()).to.equal("CONDITIONS");
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
		const alertButton = alertCategory.find("button.properties-category-title");
		expect(alertButton.text()).to.equal("ALERTS (1)");
		alertButton.simulate("click");

		// ensure that alert tab is open
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		let alertDiv = alertCategory.find("div.properties-category-content.show"); // ALERTS div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(1);
		expect(alertList.at(0).text()).to.equal("Required parameter 'Number Hidden' has no value");

		// hide the number field
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		wrapper.update();

		// there should be no alerts for the hidden field
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		alertDiv = alertCategory.find("div.properties-category-content.show"); // ALERTS div
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


	it("alerts should not show messages for hidden table controls", () => {
		// open the conditions tabs
		const conditionsCategory = wrapper.find("div.properties-category-container").at(2); // Conditions category
		const conditionsButton = conditionsCategory.find("button.properties-category-title");
		expect(conditionsButton.text()).to.equal("CONDITIONS");
		conditionsButton.simulate("click");

		// open the summary link for hide tables
		let summary = wrapper.find("div[data-id='properties-structuretableRenameFields-summary-panel']");
		let summaryButton = summary.find("button.properties-summary-link-button");
		summaryButton.simulate("click");

		// set the error condition in the table
		let cellDropdown = wrapper.find("div[data-id='properties-structuretableRenameFields_0_3']");
		const cellButton = cellDropdown.find("div[type='button']");
		cellButton.simulate("click");
		// select the first item
		const dropdownWrapper = wrapper.find("div[data-id='properties-structuretableRenameFields_0_3']");
		const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
		expect(dropdownList).to.be.length(5);
		dropdownList.at(1).simulate("click");
		expect(cellButton.find("span").text()).to.equal("number");
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
		const alertButton = alertCategory.find("button.properties-category-title");
		expect(alertButton.text()).to.equal("ALERTS (1)");
		alertButton.simulate("click");

		// ensure that alert tab is open
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		const alertDiv = alertCategory.find("div.properties-category-content.show"); // ALERTS div
		expect(alertDiv).to.have.length(1);
		const alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(1);
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

		// validate the first tab is not the alert tab
		const firstCategory = wrapper.find("div.properties-category-container").at(0);
		const firstTab = firstCategory.find("button.properties-category-title");
		expect(firstTab.text()).to.equal("TABLES");
	});

	it("alerts should not show messages for hidden table cell controls", () => {
		// TODO when issue 1555 is implemented
	});

});
