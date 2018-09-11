/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../_utils_/property-utils";
import defaultsParamDef from "../test_resources/paramDefs/defaults_paramDef.json";
import { expect } from "chai";

// base test cases
describe("default values renders correctly", () => {
	var wrapper;
	// var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(defaultsParamDef);
		wrapper = renderedObject.wrapper;
		// renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("should render number field with default value", () => {
		const defaultField = wrapper.find("div[data-id='properties-default_num'] input");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal(25);
	});
	it("should render 0 number field with no default value", () => {
		const defaultField = wrapper.find("div[data-id='properties-noDefault_num'] input");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal(0);
	});
	it("should render string field with default value", () => {
		const defaultField = wrapper.find("div[data-id='properties-default_text'] input");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("This is a default text");
	});
	it("should render an empty string field with no default value", () => {
		const defaultField = wrapper.find("div[data-id='properties-noDefault_text'] input");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("");
	});
	it("should render array field with default value", () => {
		const defaultField = wrapper.find("div[data-id='properties-default_array'] textarea");
		expect(defaultField).to.have.length(1);
		expect(defaultField.text()).to.equal("a\nb");
	});
	it("should render an empty array field with no default value", () => {
		const defaultField = wrapper.find("div[data-id='properties-noDefault_array'] textarea");
		expect(defaultField).to.have.length(1);
		expect(defaultField.text()).to.equal("");
	});
	it("should render field with default value", () => {
		const defaultField = wrapper.find("div[data-id='properties-default_undefined'] input");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("This is an undefined parameter");
	});
	it("should render string field with a parameter_ref default value", () => {
		const defaultField = wrapper.find("div[data-id='properties-default_parameterRef'] input");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("this is the control value");
	});
	it("should render an empty string field with no parameter_ref default value", () => {
		const defaultField = wrapper.find("div[data-id='properties-noDefault_parameterRef'] input");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("");
	});
});

// tables test cases
describe("add rows in tables with correct default values", () => {

	var wrapper;
	var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(defaultsParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("should render datamodel table with new rows with correct default values", () => {
		const wideflyout = propertyUtils.openSummaryPanel(wrapper, "summary-panel");
		const tableRows = wideflyout.find("tr.table-row");
		expect(tableRows).to.have.length(4);
		expect(wideflyout.find("div[data-id='properties-field_types_0_2'] select").instance().selectedIndex).to.equal(1);
		expect(wideflyout.find("div[data-id='properties-field_types_1_2'] select").instance().selectedIndex).to.equal(0);
		expect(wideflyout.find("div[data-id='properties-field_types_2_2'] select").instance().selectedIndex).to.equal(6);
		expect(wideflyout.find("div[data-id='properties-field_types_3_2'] select").instance().selectedIndex).to.equal(6);
	});

	it("should render structure list editor table with new rows with correct default values", () => {
		let wideflyout = propertyUtils.openSummaryPanel(wrapper, "structureListEditorDefault-summary-panel");
		let tableRows = wideflyout.find("tr.table-row");
		expect(tableRows).to.have.length(1);
		expect(wideflyout.find("div[data-id='properties-structureListEditorDefault_0_2'] span").text()).to.equal("Ascending");

		// add a row
		const addButton = wideflyout.find("button.properties-add-fields-button");
		addButton.simulate("click");
		wideflyout = wrapper.find("div[data-id='properties-structureListEditorDefault-summary-panel']");
		tableRows = wideflyout.find("tr.table-row");
		expect(tableRows).to.have.length(2);
		expect(wideflyout.find("div[data-id='properties-structureListEditorDefault_1_2'] span").text()).to.equal("Ascending");

		// change the parameter_ref control value and then add a new row.
		renderedController.updatePropertyValue({ name: "sLE_DefaultSortOrder" }, "Descending");
		addButton.simulate("click");
		wideflyout = wrapper.find("div[data-id='properties-structureListEditorDefault-summary-panel']");
		tableRows = wideflyout.find("tr.table-row");
		expect(tableRows).to.have.length(3);
		expect(wideflyout.find("div[data-id='properties-structureListEditorDefault_2_2'] span").text()).to.equal("Descending");
	});

	it("should render column structure table with new rows with correct default values", () => {
		let wideflyout = propertyUtils.openSummaryPanel(wrapper, "structureTableDefault-summary-panel");

		let tableRows = wideflyout.find("tr.table-row");
		expect(tableRows).to.have.length(0);

		// add a row
		let fieldPickerWrapper = propertyUtils.openFieldPicker(wrapper, "properties-structureTableDefault-default");
		propertyUtils.fieldPicker(fieldPickerWrapper, ["Age"]);
		wideflyout = wrapper.find("div[data-id='properties-structureTableDefault-summary-panel']");
		tableRows = wideflyout.find("tr.table-row");
		expect(tableRows).to.have.length(1);
		expect(wideflyout.find("div[data-id='properties-columnStructureTableDefault_0_1'] span").text()).to.equal("Ascending");

		// change the parameter_ref control value and then add a new row.
		renderedController.updatePropertyValue({ name: "CST_DefaultSortOrder" }, "Descending");
		fieldPickerWrapper = propertyUtils.openFieldPicker(wrapper, "properties-structureTableDefault-default");
		propertyUtils.fieldPicker(fieldPickerWrapper, ["Sex"]);
		wideflyout = wrapper.find("div[data-id='properties-structureTableDefault-summary-panel']");
		tableRows = wideflyout.find("tr.table-row");
		expect(tableRows).to.have.length(2);
		expect(wideflyout.find("div[data-id='properties-columnStructureTableDefault_1_1'] span").text()).to.equal("Descending");
	});

	it("should render column structure table where new rows have correct defaultRow", () => {
		let wideflyout = propertyUtils.openSummaryPanel(wrapper, "structureTableDefaultRow");
		let tableRows = wideflyout.find("tr.table-row");
		expect(tableRows).to.have.length(2);

		// add a row
		const fieldPickerWrapper = propertyUtils.openFieldPicker(wrapper, "properties-columnStructureTableDefaultRow");
		propertyUtils.fieldPicker(fieldPickerWrapper, ["Sex"]);
		wideflyout = wrapper.find("div[data-id='properties-structureTableDefaultRow']");
		tableRows = wideflyout.find("tr.table-row");
		expect(tableRows).to.have.length(3);

		const expectedRows = [
			["Age", "Mean"],
			["BP", "Mean, Min, Max"],
			["Sex", "Min, Max"]
		];

		for (let idx = 0; idx < tableRows.length; idx++) {
			const tableCell = tableRows.at(idx).find("td");
			expect(tableCell.at(0).text()).to.equal(expectedRows[idx][0]);
			expect(tableCell.at(1).text()).to.equal(expectedRows[idx][1]);
		}
	});
});
