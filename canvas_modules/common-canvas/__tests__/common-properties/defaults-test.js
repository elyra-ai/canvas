/*
 * Copyright 2017-2025 Elyra Authors
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

import propertyUtils from "../_utils_/property-utils";
import tableUtils from "../_utils_/table-utils";
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
		const tableRows = tableUtils.getTableRows(wideflyout);
		expect(tableRows).to.have.length(2);
		expect(wideflyout.find("div[data-id='properties-field_types_0_2'] select").instance().selectedIndex).to.equal(1);
		expect(wideflyout.find("div[data-id='properties-field_types_1_2'] select").instance().selectedIndex).to.equal(0);
	});

	it("should render structure list editor table with new rows with correct default values", () => {
		let wideflyout = propertyUtils.openSummaryPanel(wrapper, "structureListEditorDefault-summary-panel");
		let tableRows = tableUtils.getTableRows(wideflyout);
		expect(tableRows).to.have.length(1);
		expect(wideflyout.find("div[data-id='properties-structureListEditorDefault_0_2'] button").text()).to.equal("Ascending");

		// add a row
		const addButton = wideflyout.find("button.properties-add-fields-button");
		addButton.simulate("click");
		wideflyout = wrapper.find("div[data-id='properties-structureListEditorDefault-summary-panel']");
		tableRows = tableUtils.getTableRows(wideflyout);
		expect(tableRows).to.have.length(2);
		expect(wideflyout.find("div[data-id='properties-structureListEditorDefault_1_2'] button").text()).to.equal("Ascending");

		// change the parameter_ref control value and then add a new row.
		renderedController.updatePropertyValue({ name: "sLE_DefaultSortOrder" }, "Descending");
		addButton.simulate("click");
		wideflyout = wrapper.find("div[data-id='properties-structureListEditorDefault-summary-panel']");
		tableRows = tableUtils.getTableRows(wideflyout);
		expect(tableRows).to.have.length(3);
		expect(wideflyout.find("div[data-id='properties-structureListEditorDefault_2_2'] button").text()).to.equal("Descending");
	});

	it("should render column structure table with new rows with correct default values", () => {
		let wideflyout = propertyUtils.openSummaryPanel(wrapper, "structureTableDefault-summary-panel");

		let tableRows = tableUtils.getTableRows(wideflyout);
		expect(tableRows).to.have.length(0);

		// add a row
		let fieldPickerWrapper = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-structureTableDefault-default");
		tableUtils.fieldPicker(fieldPickerWrapper, ["Age"]);
		wideflyout = wrapper.find("div[data-id='properties-structureTableDefault-summary-panel']");
		tableRows = tableUtils.getTableRows(wideflyout);
		expect(tableRows).to.have.length(1);
		expect(wideflyout.find("div[data-id='properties-columnStructureTableDefault_0_1'] button").text()).to.equal("Ascending");

		// added row is selected by default which shows table toolbar
		// Cancel row selections from table toolbar, so that "Add columns" button shows up in the header
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		const cancelButton = tableToolbar.find("button.properties-action-cancel");
		cancelButton.simulate("click");

		// change the parameter_ref control value and then add a new row.
		renderedController.updatePropertyValue({ name: "CST_DefaultSortOrder" }, "Descending");
		fieldPickerWrapper = tableUtils.openFieldPicker(wrapper, "properties-structureTableDefault-default");
		tableUtils.fieldPicker(fieldPickerWrapper, ["Sex"]);
		wideflyout = wrapper.find("div[data-id='properties-structureTableDefault-summary-panel']");
		tableRows = tableUtils.getTableRows(wideflyout);
		expect(tableRows).to.have.length(2);
		expect(wideflyout.find("div[data-id='properties-columnStructureTableDefault_1_1'] button").text()).to.equal("Descending");
	});

	it("should render column structure table where new rows have correct defaultRow", () => {
		let wideflyout = propertyUtils.openSummaryPanel(wrapper, "structureTableDefaultRow");
		let tableRows = tableUtils.getTableRows(wideflyout);
		expect(tableRows).to.have.length(2);

		// add a row
		const fieldPickerWrapper = tableUtils.openFieldPicker(wrapper, "properties-columnStructureTableDefaultRow");
		tableUtils.fieldPicker(fieldPickerWrapper, ["Sex"]);
		wideflyout = wrapper.find("div[data-id='properties-structureTableDefaultRow']");
		tableRows = tableUtils.getTableRows(wideflyout);
		expect(tableRows).to.have.length(3);

		const expectedRows = [
			["Age", "Mean"],
			["Sex", "Min, Max"],
			["BP", "Mean, Min, Max"]
		];

		for (let idx = 0; idx < tableRows.length; idx++) {
			const tableCell = tableRows.at(idx).find(".properties-field-type");
			expect(tableCell.at(0).text()).to.equal(expectedRows[idx][0]);
			expect(tableCell.at(1).text()).to.equal(expectedRows[idx][1]);
		}
	});
});
