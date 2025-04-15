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

import { cleanup, fireEvent } from "@testing-library/react";
import propertyUtilsRTL from "../_utils_/property-utilsRTL";
import tableUtilsRTL from "../_utils_/table-utilsRTL";
import defaultsParamDef from "../test_resources/paramDefs/defaults_paramDef.json";
import { expect } from "chai";

// base test cases
describe("default values renders correctly", () => {
	let wrapper;
	// var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(defaultsParamDef);
		wrapper = renderedObject.wrapper;
		// renderedController = renderedObject.controller;
	});
	afterEach(() => {
		cleanup();
	});

	it("should render number field with default value", () => {
		const { container } = wrapper;
		const defaultField = container.querySelector("div[data-id='properties-default_num'] input");
		expect(defaultField).to.exist;
		expect(Number(defaultField.getAttribute("value"))).to.equal(25);
	});
	it("should render 0 number field with no default value", () => {
		const { container } = wrapper;
		const defaultField = container.querySelector("div[data-id='properties-noDefault_num'] input");
		expect(defaultField).to.exist;
		expect(Number(defaultField.getAttribute("value"))).to.equal(0);
	});
	it("should render string field with default value", () => {
		const { container } = wrapper;
		const defaultField = container.querySelector("div[data-id='properties-default_text'] input");
		expect(defaultField).to.exist;
		expect(defaultField.getAttribute("value")).to.equal("This is a default text");
	});
	it("should render an empty string field with no default value", () => {
		const { container } = wrapper;
		const defaultField = container.querySelector("div[data-id='properties-noDefault_text'] input");
		expect(defaultField).to.exist;
		expect(defaultField.getAttribute("value")).to.equal("");
	});
	it("should render array field with default value", () => {
		const { container } = wrapper;
		const defaultField = container.querySelector("div[data-id='properties-default_array'] textarea");
		expect(defaultField).to.exist;
		expect(defaultField.textContent).to.equal("a\nb");
	});
	it("should render an empty array field with no default value", () => {
		const { container } = wrapper;
		const defaultField = container.querySelector("div[data-id='properties-noDefault_array'] textarea");
		expect(defaultField).to.exist;
		expect(defaultField.textContent).to.equal("");
	});
	it("should render field with default value", () => {
		const { container } = wrapper;
		const defaultField = container.querySelector("div[data-id='properties-default_undefined'] input");
		expect(defaultField).to.exist;
		expect(defaultField.getAttribute("value")).to.equal("This is an undefined parameter");
	});
	it("should render string field with a parameter_ref default value", () => {
		const { container } = wrapper;
		const defaultField = container.querySelector("div[data-id='properties-default_parameterRef'] input");
		expect(defaultField).to.exist;
		expect(defaultField.getAttribute("value")).to.equal("this is the control value");
	});
	it("should render an empty string field with no parameter_ref default value", () => {
		const { container } = wrapper;
		const defaultField = container.querySelector("div[data-id='properties-noDefault_parameterRef'] input");
		expect(defaultField).to.exist;
		expect(defaultField.getAttribute("value")).to.equal("");
	});
});

// tables test cases
describe("add rows in tables with correct default values", () => {

	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(defaultsParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		cleanup();
	});

	it("should render datamodel table with new rows with correct default values", () => {
		const wideflyout = propertyUtilsRTL.openSummaryPanel(wrapper, "summary-panel");
		const tableRows = tableUtilsRTL.getTableRows(wideflyout);
		expect(tableRows).to.have.length(2);
		const row1Dropdown = tableRows[0].querySelector("div[data-id='properties-field_types_0_2'] select");
		expect(row1Dropdown.value).to.equal("integer");
		const row2Dropdown = tableRows[1].querySelector("div[data-id='properties-field_types_1_2'] select");
		expect(row2Dropdown.value).to.equal("string");
	});

	it("should render structure list editor table with new rows with correct default values", () => {
		const wideflyout = propertyUtilsRTL.openSummaryPanel(wrapper, "structureListEditorDefault-summary-panel");
		let tableRows = tableUtilsRTL.getTableRows(wideflyout);
		expect(tableRows).to.have.length(1);
		expect(wideflyout.querySelector("div[data-id='properties-structureListEditorDefault_0_2'] button").textContent).to.equal("Ascending");

		// add a row
		const addButton = wideflyout.querySelectorAll("button.properties-add-fields-button");
		fireEvent.click(addButton[0]);
		tableRows = tableUtilsRTL.getTableRows(wideflyout);
		expect(tableRows).to.have.length(2);
		expect(wideflyout.querySelector("div[data-id='properties-structureListEditorDefault_1_2'] button").textContent).to.equal("Ascending");

		// change the parameter_ref control value and then add a new row.
		renderedController.updatePropertyValue({ name: "sLE_DefaultSortOrder" }, "Descending");
		fireEvent.click(addButton[0]);
		tableRows = tableUtilsRTL.getTableRows(wideflyout);
		expect(tableRows).to.have.length(3);
		expect(wideflyout.querySelector("div[data-id='properties-structureListEditorDefault_2_2'] button").textContent).to.equal("Descending");
	});

	it("should render column structure table with new rows with correct default values", () => {
		const wideflyout = propertyUtilsRTL.openSummaryPanel(wrapper, "structureTableDefault-summary-panel");
		let tableRows = tableUtilsRTL.getTableRows(wideflyout);
		expect(tableRows).to.have.length(0);

		// add a row
		const { container } = wrapper;
		let fieldPickerWrapper = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-structureTableDefault-default");
		tableUtilsRTL.fieldPicker(fieldPickerWrapper, ["Age"]);
		tableRows = tableUtilsRTL.getTableRows(wideflyout);
		expect(tableRows).to.have.length(1);
		const row1Button = tableRows[0].querySelector("div[data-id='properties-columnStructureTableDefault_0_1'] button");
		expect(row1Button.textContent).to.equal("Ascending");

		// added row is selected by default which shows table toolbar
		// Cancel row selections from table toolbar, so that "Add columns" button shows up in the header
		const tableToolbar = container.querySelector("div.properties-table-toolbar");
		const cancelButton = tableToolbar.querySelector("button.properties-action-cancel");
		fireEvent.click(cancelButton);

		// change the parameter_ref control value and then add a new row.
		renderedController.updatePropertyValue({ name: "CST_DefaultSortOrder" }, "Descending");
		fieldPickerWrapper = tableUtilsRTL.openFieldPicker(container, "properties-structureTableDefault-default");
		tableUtilsRTL.fieldPicker(fieldPickerWrapper, ["Sex"]);
		tableRows = tableUtilsRTL.getTableRows(wideflyout);
		expect(tableRows).to.have.length(2);
		const row2Button = tableRows[1].querySelector("div[data-id='properties-columnStructureTableDefault_1_1'] button");
		expect(row2Button.textContent).to.equal("Descending");
	});

	it("should render column structure table where new rows have correct defaultRow", () => {
		const wideflyout = propertyUtilsRTL.openSummaryPanel(wrapper, "structureTableDefaultRow");
		let tableRows = tableUtilsRTL.getTableRows(wideflyout);
		expect(tableRows).to.have.length(2);

		// add a row
		const { container } = wrapper;
		const fieldPickerWrapper = tableUtilsRTL.openFieldPicker(container, "properties-columnStructureTableDefaultRow");
		tableUtilsRTL.fieldPicker(fieldPickerWrapper, ["Sex"]);
		tableRows = tableUtilsRTL.getTableRows(wideflyout);

		expect(tableRows).to.have.length(3);

		const expectedRows = [
			["Age", "Mean"],
			["Sex", "Min, Max"],
			["BP", "Mean, Min, Max"]
		];

		for (let idx = 0; idx < tableRows.length; idx++) {
			const tableCell = tableRows[idx].querySelectorAll(".properties-field-type");
			expect(tableCell[0].textContent).to.equal(expectedRows[idx][0]);
			expect(tableCell[1].textContent).to.equal(expectedRows[idx][1]);
		}
	});
});
