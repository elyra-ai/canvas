/*
 * Copyright 2017-2022 Elyra Authors
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

import React from "react";
import FieldPicker from "./../../../src/common-properties/components/field-picker";
import Controller from "./../../../src/common-properties/properties-controller";
import propertyUtils from "./../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";
import { mountWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";

import fieldPickerParamDef from "./../../test_resources/paramDefs/fieldpicker_paramDef.json";

const controller = new Controller();

const currentFields = [
	"Na",
	"Drug",
	"Cholesterol"
];
const filteredDataset = [
	{
		"name": "Age",
		"type": "integer",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		},
		"origName": "Age",
		"schema": "0"
	},
	{
		"name": "Sex",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		},
		"origName": "Sex",
		"schema": "0"
	},
	{
		"name": "BP",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		},
		"origName": "BP",
		"schema": "0"
	},
	{
		"name": "Cholesterol",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		},
		"origName": "Cholesterol",
		"schema": "0"
	},
	{
		"name": "Na",
		"type": "double",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		},
		"origName": "Na",
		"schema": "0"
	},
	{
		"name": "K",
		"type": "double",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		},
		"origName": "K",
		"schema": "0"
	},
	{
		"name": "Drug",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		},
		"origName": "Drug",
		"schema": "0"
	},
	{
		"name": "Time",
		"type": "time",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		},
		"origName": "Time",
		"schema": "0"
	},
	{
		"name": "Timestamp",
		"type": "timestamp",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		},
		"origName": "Timestamp",
		"schema": "0"
	},
	{
		"name": "Date",
		"type": "date",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		},
		"origName": "Date",
		"schema": "0"
	}
];
function closeFieldPicker() {
	return ["Test value"];
}

function clickFilter(wrapper, type, enabled) {
	let filters = wrapper.find("button.properties-fp-filter");
	filters.forEach((filter) => {
		if (filter.prop("data-type") === type) {
			filter.simulate("click");
		}
	});
	filters = wrapper.find("button.properties-fp-filter");
	filters.forEach((filter) => {
		if (filter.prop("data-type") === type) {
			if (enabled === true) {
				expect(filter.find("svg").prop("disabled")).to.equal(false);
			} else {
				expect(filter.find("svg").prop("disabled")).to.equal(true);
			}
		}
	});
}

describe("field-picker-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);

		expect(wrapper.prop("closeFieldPicker")).to.equal(closeFieldPicker);
		expect(wrapper.prop("currentFields")).to.equal(currentFields);
		expect(wrapper.prop("fields")).to.equal(filteredDataset);
	});

	it("should render a `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		expect(wrapper.find("button.properties-fp-reset-button-container")).to.have.length(1);
		expect(wrapper.find("ul.properties-fp-filter-list")).to.have.length(1);
		expect(wrapper.find("div.properties-ft-control-container")).to.have.length(1);
	});

	it("should set correct state values in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM
		const fieldPickerRows = tableUtils.getTableRows(wrapper);
		expect(fieldPickerRows).to.have.length(filteredDataset.length);
		expect(wrapper.find("div.properties-tooltips-filter")).to.have.length(6); // list of filters
		const selected = tableUtils.validateSelectedRowNum(fieldPickerRows);
		expect(selected).to.have.length(currentFields.length); // controlValues rendered correctly
	});

	it("should add additional field to newControlValues in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		tableUtils.selectCheckboxes(wrapper, [0]);
		const fieldPickerRows = tableUtils.getTableRows(wrapper);
		const selected = tableUtils.validateSelectedRowNum(fieldPickerRows);
		expect(selected).to.have.length(4);
	});

	it("should reset to initial values in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		tableUtils.selectCheckboxes(wrapper, [1]);
		const fieldPickerRows = tableUtils.getTableRows(wrapper);
		let selected = tableUtils.validateSelectedRowNum(fieldPickerRows);
		expect(selected).to.have.length(4);

		wrapper.find("button.properties-fp-reset-button-container").simulate("click");
		const resetBoxs = tableUtils.getTableRows(wrapper);
		selected = tableUtils.validateSelectedRowNum(resetBoxs);
		expect(selected).to.have.length(3);
	});

	it("should set correct filtered type in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		clickFilter(wrapper, "integer");
		expect(tableUtils.getTableRows(wrapper)).to.have.length(9);
	});

	it("should select all in filtered type in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		// disable a set of icons except double
		clickFilter(wrapper, "integer");
		clickFilter(wrapper, "string");
		clickFilter(wrapper, "date");
		clickFilter(wrapper, "time");
		clickFilter(wrapper, "timestamp");

		// select the remaining rows
		expect(tableUtils.getTableRows(wrapper)).to.have.length(2);
		tableUtils.selectFieldPickerHeaderCheckbox(wrapper);

		//  enable the icons so that we can get a valid count of all selected rows.
		clickFilter(wrapper, "integer", true);
		clickFilter(wrapper, "string", true);
		clickFilter(wrapper, "date", true);
		clickFilter(wrapper, "time", true);
		clickFilter(wrapper, "timestamp", true);

		// validate the number of rows selected
		const rows = tableUtils.getTableRows(wrapper);
		const rowsSelected = tableUtils.validateSelectedRowNum(rows);
		expect(rowsSelected).to.have.length(4);
	});

	it("should search correct keyword in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);

		const searchContainer = wrapper.find("div.properties-ft-search-container");
		const input = searchContainer.find("input[type='text']");
		input.simulate("change", { target: { value: "Time" } });
		expect(tableUtils.getTableRows(wrapper)).to.have.length(2);
		// test case insensitive
		input.simulate("change", { target: { value: "TIME" } });
		expect(tableUtils.getTableRows(wrapper)).to.have.length(2);
		searchContainer.find("button").simulate("click"); // click on the x button to remove search value
		expect(tableUtils.getTableRows(wrapper)).to.have.length(filteredDataset.length);
	});

	it("should set checkedAll to true in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		tableUtils.selectFieldPickerHeaderCheckbox(wrapper);

		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM
		const rows = tableUtils.getTableRows(wrapper);
		const selected = tableUtils.validateSelectedRowNum(rows);
		expect(selected).to.have.length(filteredDataset.length);
	});

	it("`FieldPicker` table should have aria-label", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		const fieldPickerTable = wrapper.find(".properties-vt-autosizer").find(".ReactVirtualized__Table");
		expect(fieldPickerTable.props()).to.have.property("aria-label", "Field Picker Test");
	});
});

describe("field-picker-control with multi input schemas renders correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(fieldPickerParamDef);
		wrapper = renderedObject.wrapper;
		propertyUtils.openSummaryPanel(wrapper, "structuretableMultiInputSchema-summary-panel");
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display the correct schema for each field", () => {
		const fieldpicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const tableRows = tableUtils.getTableRows(fieldpicker);
		expect(tableRows.length).to.equal(29);
		// verify first and last row from each schema
		tableUtils.verifyFieldPickerRow(tableRows.at(0), "Age - This is a long truncated label. You can see the entire label in a tooltip.", "0");
		tableUtils.verifyFieldPickerRow(tableRows.at(5), "Time", "0");
		tableUtils.verifyFieldPickerRow(tableRows.at(6), "Age", "data_1");
		tableUtils.verifyFieldPickerRow(tableRows.at(11), "Timestamp", "data_1");
		tableUtils.verifyFieldPickerRow(tableRows.at(12), "Drug", "data_2");
		tableUtils.verifyFieldPickerRow(tableRows.at(17), "Date", "data_2");
		tableUtils.verifyFieldPickerRow(tableRows.at(18), "Age", "3");
		tableUtils.verifyFieldPickerRow(tableRows.at(23), "drug3", "3");
		tableUtils.verifyFieldPickerRow(tableRows.at(24), "Age", "schema");
		tableUtils.verifyFieldPickerRow(tableRows.at(28), "drugs", "schema");
	});

	it("should be able to filter type and select all", () => {
		const fieldpicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const filterIcons = fieldpicker.find("div.properties-tooltips-filter");
		expect(filterIcons.length).to.equal(6);

		clickFilter(wrapper, "integer");
		clickFilter(wrapper, "string");
		clickFilter(wrapper, "time");
		clickFilter(wrapper, "double");
		clickFilter(wrapper, "timestamp");

		tableUtils.selectFieldPickerHeaderCheckbox(fieldpicker);
		let checkAll = fieldpicker.find(".properties-vt-header-checkbox")
			.find("input[type='checkbox']");

		expect(checkAll.getDOMNode().checked).to.be.equal(true);
		let rows = tableUtils.getTableRows(wrapper);
		let selected = tableUtils.validateSelectedRowNum(rows);
		expect(selected).to.have.length(1);

		clickFilter(wrapper, "timestamp", true);
		checkAll = fieldpicker.find(".properties-vt-header-checkbox")
			.find("input[type='checkbox']");
		expect(checkAll.prop("checked")).to.be.false;

		checkAll.getDOMNode().checked = true;
		checkAll.simulate("change");
		checkAll = fieldpicker.find(".properties-vt-header-checkbox")
			.find("input[type='checkbox']");
		expect(checkAll.getDOMNode().checked).to.be.equal(true);

		rows = tableUtils.getTableRows(wrapper);
		selected = tableUtils.validateSelectedRowNum(rows);
		expect(selected).to.have.length(3);
		fieldpicker.find("button[data-id='properties-apply-button']").simulate("click");
		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
		const summaryPanel = wrapper.find("div[data-id='properties-structuretableMultiInputSchema-summary-panel']");
		const fieldSummary = summaryPanel.find("table.properties-summary-table");
		expect(fieldSummary).to.have.length(1);
		const summaryRows = summaryPanel.find("tr.properties-summary-row");
		expect(summaryRows).to.have.length(6);

		const expectedSummaryRows = [
			"BADVAR",
			"0.BADVAR",
			"3.Cholesterol",
			"data_2.Date",
			"data_1.Timestamp",
			"data_2.Timestamp"
		];

		for (let idx = 0; idx < summaryRows.length; idx++) {
			expect(summaryRows.at(idx)
				.find("span")
				.at(0)
				.text()
				.trim()).to.equal(expectedSummaryRows[idx]);
		}
	});

	it("should be able to search 'time' and select all fields from all schemas", () => {
		let fieldpicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const tableRows = tableUtils.getTableRows(fieldpicker);
		expect(tableRows.length).to.equal(29);

		const searchContainer = fieldpicker.find("div.properties-ft-search-container");
		const input = searchContainer.find("input[type='text']");
		input.simulate("change", { target: { value: "Time" } });

		fieldpicker = wrapper.find("div.properties-fp-table");
		expect(tableUtils.getTableRows(fieldpicker)).to.have.length(5);

		tableUtils.verifyFieldPickerRow(tableRows.at(0), "Time", "0");
		tableUtils.verifyFieldPickerRow(tableRows.at(1), "Time", "data_1");
		tableUtils.verifyFieldPickerRow(tableRows.at(2), "Timestamp", "data_1");
		tableUtils.verifyFieldPickerRow(tableRows.at(3), "Time", "data_2");
		tableUtils.verifyFieldPickerRow(tableRows.at(4), "Timestamp", "data_2");

		tableUtils.selectFieldPickerHeaderCheckbox(fieldpicker);
		const checkAll = tableUtils.getTableHeaderRows(fieldpicker)
			.find(".properties-vt-header-checkbox")
			.find("input");
		expect(checkAll.getDOMNode().checked).to.be.equal(true);

		fieldpicker = wrapper.find("div.properties-fp-table");
		const rows = tableUtils.getTableRows(fieldpicker);
		const selected = tableUtils.validateSelectedRowNum(rows);
		expect(selected).to.have.length(5);

		fieldpicker.find("button[data-id='properties-apply-button']").simulate("click");
		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
		const summaryPanel = wrapper.find("div[data-id='properties-structuretableMultiInputSchema-summary-panel']");
		const fieldSummary = summaryPanel.find("table.properties-summary-table");
		expect(fieldSummary).to.have.length(1);
		const summaryRows = summaryPanel.find("tr.properties-summary-row");
		expect(summaryRows).to.have.length(8);

		const expectedSummaryRows = [
			"BADVAR",
			"0.BADVAR",
			"3.Cholesterol",
			"0.Time",
			"data_1.Time",
			"data_1.Timestamp",
			"data_2.Time",
			"data_2.Timestamp"
		];

		for (let idx = 0; idx < summaryRows.length; idx++) {
			expect(summaryRows.at(idx)
				.find("span")
				.at(0)
				.text()
				.trim()).to.equal(expectedSummaryRows[idx]);
		}
	});

	it("should be able to search 'time', filter 'time', and selct all fields", () => {
		let fieldpicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const searchContainer = fieldpicker.find("div.properties-ft-search-container");
		const input = searchContainer.find("input[type='text']");
		input.simulate("change", { target: { value: "time" } });

		clickFilter(wrapper, "time");
		fieldpicker = wrapper.find("div.properties-fp-table");
		const tableRows = tableUtils.getTableRows(fieldpicker);
		expect(tableRows.length).to.equal(2);

		tableUtils.verifyFieldPickerRow(tableRows.at(0), "Timestamp", "data_1");
		tableUtils.verifyFieldPickerRow(tableRows.at(1), "Timestamp", "data_2");

		tableUtils.selectFieldPickerHeaderCheckbox(fieldpicker);
		const checkAll = tableUtils.getTableHeaderRows(fieldpicker)
			.find(".properties-vt-header-checkbox")
			.find("input");
		expect(checkAll.getDOMNode().checked).to.be.equal(true);

		fieldpicker = wrapper.find("div.properties-fp-table");
		const rows = tableUtils.getTableRows(fieldpicker);
		const selected = tableUtils.validateSelectedRowNum(rows);
		expect(selected).to.have.length(2);

		fieldpicker.find("button[data-id='properties-apply-button']").simulate("click");
		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
		const fieldSummary = wrapper.find("table.properties-summary-table").find("tr.properties-summary-row");
		const expectedSummaryRows = [
			"BADVAR",
			"0.BADVAR",
			"3.Cholesterol",
			"data_1.Timestamp",
			"data_2.Timestamp"
		];

		for (let idx = 0; idx < fieldSummary.length; idx++) {
			expect(fieldSummary.at(idx)
				.find("span")
				.at(0)
				.text()
				.trim()).to.equal(expectedSummaryRows[idx]);
		}
	});

	it("should be able to select all and display schema.field names correctly in table", () => {
		const fieldpicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		tableUtils.selectFieldPickerHeaderCheckbox(fieldpicker);
		const checkAll = tableUtils.getTableHeaderRows(fieldpicker)
			.find(".properties-vt-header-checkbox")
			.find("input");
		expect(checkAll.getDOMNode().checked).to.be.equal(true);

		const rows = tableUtils.getTableRows(wrapper);
		const selected = tableUtils.validateSelectedRowNum(rows);
		expect(selected).to.have.length(29);
	});

	it("should be able to sort by schema name", () => {
		const fieldpicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const sortable = fieldpicker.find(".ReactVirtualized__Table__sortableHeaderColumn");
		expect(sortable).to.have.length(3);

		tableUtils.clickHeaderColumnSort(fieldpicker, 1);
		const tableRows = tableUtils.getTableRows(fieldpicker);
		expect(tableRows.length).to.equal(29);

		const expectedOrder = [
			"0", "0", "0", "0", "0", "0",
			"3", "3", "3", "3", "3", "3",
			"data_1", "data_1", "data_1", "data_1", "data_1", "data_1",
			"data_2", "data_2", "data_2", "data_2", "data_2", "data_2",
			"schema", "schema", "schema", "schema", "schema"
		];

		for (let idx = 0; idx < tableRows.length; idx++) {
			expect(tableRows.find(".properties-fp-schema").at(idx)
				.text())
				.to.equal(expectedOrder[idx]);
		}

		sortable.at(1).simulate("click");
		let reverseIdx = tableRows.length - 1;
		for (let idx = 0; idx < tableRows.length; idx++) {
			expect(tableRows.find(".properties-fp-schema").at(idx)
				.text())
				.to.equal(expectedOrder[reverseIdx]);
			reverseIdx--;
		}
	});

	it("should be able to sort by data type", () => {
		const fieldpicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const sortable = fieldpicker.find(".ReactVirtualized__Table__sortableHeaderColumn");
		expect(sortable).to.have.length(3);

		tableUtils.clickHeaderColumnSort(fieldpicker, 2);
		const tableRows = tableUtils.getTableRows(fieldpicker);
		expect(tableRows.length).to.equal(29);

		const expectedOrder = [
			"date",
			"double", "double", "double", "double",
			"integer", "integer", "integer", "integer", "integer",
			"string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string", "string",
			"time", "time", "time",
			"timestamp", "timestamp"
		];

		for (let idx = 0; idx < tableRows.length; idx++) {
			expect(tableRows.find(".properties-fp-field-type").at(idx)
				.text())
				.to.equal(expectedOrder[idx]);
		}

		sortable.at(2).simulate("click");
		let reverseIdx = tableRows.length - 1;
		for (let idx = 0; idx < tableRows.length; idx++) {
			expect(tableRows.find(".properties-fp-field-type").at(idx)
				.text())
				.to.equal(expectedOrder[reverseIdx]);
			reverseIdx--;
		}
	});

	it("should be able to select the same field name from different schemas", () => {
		let fieldpicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const search = fieldpicker.find("div.properties-ft-search-container").find("input[type='text']");
		search.simulate("change", { target: { value: "age" } });
		fieldpicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");

		const tableRows = tableUtils.getTableRows(fieldpicker);
		expect(tableRows.length).to.equal(5);

		tableUtils.verifyFieldPickerRow(tableRows.at(0), "Age - This is a long truncated label. You can see the entire label in a tooltip.", "0");
		tableUtils.verifyFieldPickerRow(tableRows.at(1), "age", "0");
		tableUtils.verifyFieldPickerRow(tableRows.at(2), "Age", "data_1");
		tableUtils.verifyFieldPickerRow(tableRows.at(3), "Age", "3");
		tableUtils.verifyFieldPickerRow(tableRows.at(4), "Age", "schema");

		tableUtils.fieldPicker(wrapper.find("div.properties-fp-table"), ["0.age", "data_1.Age", "3.Age"]);

		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
		const summaryPanel = 	wrapper.find("div[data-id='properties-structuretableMultiInputSchema-summary-panel']");
		const fieldSummary = summaryPanel.find("table.properties-summary-table");
		expect(fieldSummary).to.have.length(1);
		const summaryRows = summaryPanel.find("tr.properties-summary-row");
		// This actually also tests for bad incoming field names. Without the proper
		// bad field name filtering we have in the field picker, the test below would
		// return 6 instead of 3 because of the bad input field names in the test file.
		expect(summaryRows).to.have.length(6);

		const expectedSummaryRows = [
			"BADVAR",
			"0.BADVAR",
			"3.Cholesterol",
			"0.age",
			"data_1.Age",
			"3.Age"
		];

		for (let idx = 0; idx < summaryRows.length; idx++) {
			expect(summaryRows.at(idx)
				.find("span")
				.at(0)
				.text()
				.trim()).to.equal(expectedSummaryRows[idx]);
		}
	});


});

describe("field-picker-control with on selectcolumns renders correctly", () => {
	let wrapper;
	let renderedController;
	let fieldpicker;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(fieldPickerParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
		fieldpicker = tableUtils.openFieldPicker(wrapper, "properties-ft-fields");
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show warning from invalid field names in the selectcolumns control", () => {
		const selectRows = tableUtils.getTableRows(wrapper.find(".properties-column-select-table"));
		expect(selectRows.length).to.equal(5);
		fieldpicker.find("button[data-id='properties-apply-button']").simulate("click");
		const selectRows2 = tableUtils.getTableRows(wrapper.find(".properties-column-select-table"));
		expect(selectRows2.length).to.equal(5);

		const warningMessage = {
			structuretableMultiInputSchema: {
				"0": {
					"1": {
						type: "warning",
						text: "Invalid Input name, field not found in data set.",
						validation_id: "validField_structuretableMultiInputSchema[1]_893.8202755554307",
						propertyId: { "name": "structuretableMultiInputSchema", "col": 1, "row": 0 },
						required: false
					}
				},
				"1": {
					"1": {
						type: "warning",
						text: "Invalid Input name, field not found in data set.",
						validation_id: "validField_structuretableMultiInputSchema[1]_893.8202755554307",
						propertyId: { "name": "structuretableMultiInputSchema", "col": 1, "row": 1 },
						required: false
					}
				},
				"2": {
					"1": {
						type: "warning",
						text: "Invalid Input name, field not found in data set.",
						validation_id: "validField_structuretableMultiInputSchema[1]_893.8202755554307",
						propertyId: { "name": "structuretableMultiInputSchema", "col": 1, "row": 2 },
						required: false
					}
				}
			},
			fields: {
				"1": {
					"propertyId": {
						"name": "fields",
						"row": 1
					},
					"required": false,
					"type": "warning",
					"text": "Invalid Select Columns, field not found in data set.",
					"validation_id": "validField_fields[0]_294.69762842919897"
				},
				"2": {
					"propertyId": {
						"name": "fields",
						"row": 2
					},
					"required": false,
					"type": "warning",
					"text": "Invalid Select Columns, field not found in data set.",
					"validation_id": "validField_fields[0]_294.69762842919897"
				}
			}
		};

		const actual = renderedController.getErrorMessages(false, false, false, true);
		expect(warningMessage).to.eql(actual);
	});

	it("selectcolumns control will have updated options by the controller", () => {
		const datasetMetadata = renderedController.getDatasetMetadata();

		const newField1 = {
			"name": "age5",
			"type": "integer",
			"metadata": {
				"description": "",
				"measure": "range",
				"modeling_role": "both"
			}
		};

		const newField2 = {
			"name": "BP5",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "discrete",
				"modeling_role": "input"
			}
		};

		const newField3 = {
			"name": "Na5",
			"type": "double",
			"metadata": {
				"description": "",
				"measure": "range",
				"modeling_role": "input"
			}
		};

		const newField4 = {
			"name": "drug5",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "set",
				"modeling_role": "target"
			}
		};

		datasetMetadata[0].fields.push(newField1);
		datasetMetadata[0].fields.push(newField2);
		datasetMetadata[0].fields.push(newField3);
		datasetMetadata[0].fields.push(newField4);

		renderedController.setDatasetMetadata(datasetMetadata);
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-fields");
		tableUtils.fieldPicker(fieldPicker, [],
			["Age - This is a long truncated label. You can see the entire label in a tooltip.", "age", "Sex", "BP", "Cholesterol", "Time", "age5", "BP5", "Na5", "drug5",
				"Age", "Na", "K", "Drug", "Time",
				"Timestamp", "Drug", "drug", "drug2", "Time", "Timestamp", "Date", "Age", "BP",
				"Na", "drug", "drug2", "drug3", "Age", "BP", "Na", "drug", "drugs"]
		);
	});
	it("fieldpicker will receive updated props from selectcolumns control ", () => {
		renderedController.updatePropertyValue({ name: "fields" }, []);
		wrapper.update();
		const selectRows = wrapper.find("tr.column-select-table-row");
		expect(selectRows.length).to.equal(0);
	});

	it("checkbox in selectcolumns table header should have label", () => {
		const tableHeaderRows = tableUtils.getTableHeaderRows(fieldpicker);
		const headerCheckboxLabel = tableHeaderRows.find(".properties-vt-header-checkbox").text();
		const secondColumnLabel = tableHeaderRows
			.find("div[role='columnheader']")
			.at(1)
			.text();
		expect(headerCheckboxLabel).to.equal(`Select all ${secondColumnLabel}`);
	});

	it("checkbox in selectcolumns table row should have label", () => {
		const tableRows = tableUtils.getTableRows(fieldpicker);
		const rowCheckboxes = tableRows.find(".properties-vt-row-checkbox");
		const fieldNames = tableRows.find(".properties-fp-field");
		expect(fieldNames).to.have.length(29);
		const tableName = wrapper.find(".properties-wf-title").text();

		tableRows.forEach((row, index) => {
			const rowCheckboxLabel = rowCheckboxes.at(index).text();
			expect(rowCheckboxLabel).to.equal(`Select row ${index + 1} from ${tableName}`);
		});
	});

});

describe("field-picker control multiple rows selection", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(fieldPickerParamDef);
		wrapper = renderedObject.wrapper;
		propertyUtils.openSummaryPanel(wrapper, "structuretableMultiInputSchema-summary-panel");
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should select/deselect multiple rows in fieldPicker table using shift key", () => {
		let fieldPicker;
		let tableRows;
		fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		tableRows = tableUtils.getTableRows(fieldPicker);
		expect(tableRows.length).to.equal(29);

		// Verify no rows are selected
		const selected = tableUtils.validateSelectedRowNum(tableRows);
		expect(selected).to.have.length(0);

		// Shift + select 8th row
		tableUtils.shiftSelectCheckbox(tableRows, 8);
		// Update wrapper
		wrapper.update();
		fieldPicker = wrapper.find("div.properties-fp-table");
		tableRows = tableUtils.getTableRows(fieldPicker);
		// Verify 1-8 rows are selected
		expect(tableUtils.validateSelectedRowNum(tableRows)).to.have.length(8);

		// shift + select 15th row
		tableUtils.shiftSelectCheckbox(tableRows, 15);
		// Update wrapper
		wrapper.update();
		fieldPicker = wrapper.find("div.properties-fp-table");
		tableRows = tableUtils.getTableRows(fieldPicker);
		// Verify 1-15 rows are selected
		expect(tableUtils.validateSelectedRowNum(tableRows)).to.have.length(15);

		// shift + select 5th row -- this will deselect 5-15 rows.
		tableUtils.shiftSelectCheckbox(tableRows, 5);
		// Update wrapper
		wrapper.update();
		fieldPicker = wrapper.find("div.properties-fp-table");
		tableRows = tableUtils.getTableRows(fieldPicker);
		// 5-15 rows will be deselected. And 1-4 rows will remain selected
		expect(tableUtils.validateSelectedRowNum(tableRows)).to.have.length(4);

		// shift + select 1st row -- this will deselect all rows
		tableUtils.shiftSelectCheckbox(tableRows, 1);
		// Update wrapper
		wrapper.update();
		fieldPicker = wrapper.find("div.properties-fp-table");
		tableRows = tableUtils.getTableRows(fieldPicker);
		// Verify all rows are deselected
		expect(tableUtils.validateSelectedRowNum(tableRows)).to.have.length(0);

		// shift + select 29th row -- this will select all rows
		tableUtils.shiftSelectCheckbox(tableRows, 29);
		// Update wrapper
		wrapper.update();
		fieldPicker = wrapper.find("div.properties-fp-table");
		tableRows = tableUtils.getTableRows(fieldPicker);
		// Verify all rows are selected
		expect(tableUtils.validateSelectedRowNum(tableRows)).to.have.length(29);
	});

	it("should add rows as per their row number in the table irrespective of the user selection order", () => {
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const tableRows = tableUtils.getTableRows(fieldPicker);
		const fieldNames = fieldPicker.find(".properties-fp-field-name");
		const schemaNames = fieldPicker.find(".properties-fp-schema");
		expect(tableRows.length).to.equal(29);

		// Verify no rows are selected
		const selected = tableUtils.validateSelectedRowNum(tableRows);
		expect(selected).to.have.length(0);

		// select row number in random order
		tableUtils.selectCheckboxes(tableRows, [1, 15, 10, 12, 9]);
		fieldPicker.find("button[data-id='properties-apply-button']").simulate("click");

		const renameFieldTable = wrapper.find("div[data-id='properties-ft-structuretableMultiInputSchema']");
		const secondColumn = renameFieldTable.find(".properties-field-type-icon + .properties-field-type");

		// Even though we selected [1, 15, 10, 12, 9], they should be displayed as [1, 9, 10, 12, 15]
		expect(secondColumn.at(3).text()).to.equal(schemaNames.at(1).text() + "." + fieldNames.at(1).text());
		expect(secondColumn.at(4).text()).to.equal(schemaNames.at(9).text() + "." + fieldNames.at(9).text());
		expect(secondColumn.at(5).text()).to.equal(schemaNames.at(10).text() + "." + fieldNames.at(10).text());
		expect(secondColumn.at(6).text()).to.equal(schemaNames.at(12).text() + "." + fieldNames.at(12).text());
		expect(secondColumn.at(7).text()).to.equal(schemaNames.at(15).text() + "." + fieldNames.at(15).text());
	});

});
