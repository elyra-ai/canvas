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

import React from "react";
import FieldPicker from "./../../../src/common-properties/components/field-picker";
import Controller from "./../../../src/common-properties/properties-controller";
import propertyUtilsRTL from "./../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import { renderWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import fieldPickerParamDef from "./../../test_resources/paramDefs/fieldpicker_paramDef.json";
import { fireEvent } from "@testing-library/react";

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
	const { container } = wrapper;
	let filters = container.querySelectorAll("button.properties-fp-filter");
	filters.forEach((filter) => {
		if (filter.getAttribute("data-type") === type) {
			fireEvent.click(filter);
		}
	});
	filters = container.querySelectorAll("button.properties-fp-filter");
	filters.forEach((filter) => {
		if (filter.getAttribute("data-type") === type) {
			if (enabled === true) {
				expect(filter.querySelector("svg").outerHTML.includes("disabled")).to.equal(false);
			} else {
				expect(filter.querySelector("svg").outerHTML.includes("disabled")).to.equal(true);
			}
		}
	});
}

const mockFieldPicker = jest.fn();
jest.mock("./../../../src/common-properties/components/field-picker",
	() => (props) => mockFieldPicker(props)
);

mockFieldPicker.mockImplementation((props) => {
	const FieldPickerComp = jest.requireActual(
		"./../../../src/common-properties/components/field-picker",
	).default;
	return <FieldPickerComp {...props} />;
});

describe("field-picker-control renders correctly", () => {

	it("props should have been defined", () => {
		renderWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		expectJest(mockFieldPicker).toHaveBeenCalledWith({
			"closeFieldPicker": closeFieldPicker,
			"currentFields": currentFields,
			"fields": filteredDataset,
			"controller": controller,
			"title": "Field Picker Test"
		});
	});

	it("should render a `FieldPicker`", () => {
		const wrapper = renderWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		const { container } = wrapper;
		expect(container.querySelectorAll("button.properties-fp-reset-button-container")).to.have.length(1);
		expect(container.querySelectorAll("ul.properties-fp-filter-list")).to.have.length(1);
		expect(container.querySelectorAll("div.properties-ft-control-container")).to.have.length(1);
	});

	it("should set correct state values in `FieldPicker`", () => {
		const wrapper = renderWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		const { container } = wrapper;
		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM
		const fieldPickerRows = tableUtilsRTL.getTableRows(container);
		expect(fieldPickerRows).to.have.length(filteredDataset.length);
		expect(container.querySelectorAll("div.properties-tooltips-filter")).to.have.length(6); // list of filters
		const selected = tableUtilsRTL.validateSelectedRowNum(container);
		expect(selected).to.have.length(currentFields.length); // controlValues rendered correctly
	});

	it("should add additional field to newControlValues in `FieldPicker`", () => {
		const wrapper = renderWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		const { container } = wrapper;
		tableUtilsRTL.selectCheckboxes(container, [0]);
		const fieldPickerRows = tableUtilsRTL.getTableRows(container);
		const selected = tableUtilsRTL.validateSelectedRowNumRows(fieldPickerRows);
		expect(selected).to.have.length(4);
	});

	it("should reset to initial values in `FieldPicker`", () => {
		const wrapper = renderWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		const { container } = wrapper;
		tableUtilsRTL.selectCheckboxes(container, [1]);
		const fieldPickerRows = tableUtilsRTL.getTableRows(container);
		let selected = tableUtilsRTL.validateSelectedRowNumRows(fieldPickerRows);
		expect(selected).to.have.length(4);

		fireEvent.click(container.querySelector("button.properties-fp-reset-button-container"));
		const resetBoxs = tableUtilsRTL.getTableRows(container);
		selected = tableUtilsRTL.validateSelectedRowNumRows(resetBoxs);
		expect(selected).to.have.length(3);
	});

	it("should set correct filtered type in `FieldPicker`", () => {
		const wrapper = renderWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		const { container } = wrapper;
		clickFilter(wrapper, "integer");
		expect(tableUtilsRTL.getTableRows(container)).to.have.length(9);
	});

	it("should select all in filtered type in `FieldPicker`", () => {
		const wrapper = renderWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		const { container } = wrapper;

		// disable a set of icons except double
		clickFilter(wrapper, "integer");
		clickFilter(wrapper, "string");
		clickFilter(wrapper, "date");
		clickFilter(wrapper, "time");
		clickFilter(wrapper, "timestamp");

		// wrapper.debug("", Infinity);

		// select the remaining rows
		expect(tableUtilsRTL.getTableRows(container)).to.have.length(2);
		tableUtilsRTL.selectFieldPickerHeaderCheckbox(container);

		//  enable the icons so that we can get a valid count of all selected rows.
		clickFilter(wrapper, "integer", true);
		clickFilter(wrapper, "string", true);
		clickFilter(wrapper, "date", true);
		clickFilter(wrapper, "time", true);
		clickFilter(wrapper, "timestamp", true);

		// validate the number of rows selected
		const rows = tableUtilsRTL.getTableRows(container);
		const rowsSelected = tableUtilsRTL.validateSelectedRowNumRows(rows);
		expect(rowsSelected).to.have.length(4);
	});

	it("should search correct keyword in `FieldPicker`", () => {
		const wrapper = renderWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		const { container } = wrapper;

		const searchContainer = container.querySelector("div.properties-ft-search-container");
		const input = searchContainer.querySelector("input[type='text']");
		fireEvent.change(input, { target: { value: "Time" } });
		expect(tableUtilsRTL.getTableRows(container)).to.have.length(2);
		// test case insensitive
		fireEvent.change(input, { target: { value: "TIME" } });
		expect(tableUtilsRTL.getTableRows(container)).to.have.length(2);
		fireEvent.click(searchContainer.querySelector("button")); // click on the x button to remove search value
		expect(tableUtilsRTL.getTableRows(container)).to.have.length(filteredDataset.length);
	});

	it("should set checkedAll to true in `FieldPicker`", () => {
		const wrapper = renderWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		const { container } = wrapper;
		tableUtilsRTL.selectFieldPickerHeaderCheckbox(container);

		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM
		const rows = tableUtilsRTL.getTableRows(container);
		const selected = tableUtilsRTL.validateSelectedRowNumRows(rows);
		expect(selected).to.have.length(filteredDataset.length);
	});

	it("`FieldPicker` table should have aria-label", () => {
		const wrapper = renderWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
				title="Field Picker Test"
			/>
		);
		const { container } = wrapper;
		const fieldPickerTable = container.querySelector(".properties-vt-autosizer").querySelector(".ReactVirtualized__Table");
		expect(fieldPickerTable.getAttribute("aria-label")).to.equal("Field Picker Test");
	});
});

describe("field-picker-control with multi input schemas renders correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(fieldPickerParamDef);
		wrapper = renderedObject.wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableMultiInputSchema-summary-panel");
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display the correct schema for each field", () => {
		const { container } = wrapper;
		const fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableMultiInputSchema");
		const tableRows = tableUtilsRTL.getTableRows(fieldpicker);
		expect(tableRows.length).to.equal(29);
		// verify first and last row from each schema
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(0), "Age - This is a long truncated label. You can see the entire label in a tooltip.", "0");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(5), "Time", "0");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(6), "Age", "data_1");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(11), "Timestamp", "data_1");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(12), "Drug", "data_2");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(17), "Date", "data_2");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(18), "Age", "3");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(23), "drug3", "3");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(24), "Age", "schema");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(28), "drugs", "schema");
	});

	it("should be able to filter type and select all", () => {
		const { container } = wrapper;
		const fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableMultiInputSchema");
		const filterIcons = fieldpicker.querySelectorAll("div.properties-tooltips-filter");
		expect(filterIcons.length).to.equal(6);

		clickFilter(wrapper, "integer");
		clickFilter(wrapper, "string");
		clickFilter(wrapper, "time");
		clickFilter(wrapper, "double");
		clickFilter(wrapper, "timestamp");

		tableUtilsRTL.selectFieldPickerHeaderCheckbox(fieldpicker);
		let checkAll = fieldpicker.querySelector(".properties-vt-header-checkbox")
			.querySelector("input[type='checkbox']");

		expect(checkAll.checked).to.be.equal(true);
		let rows = tableUtilsRTL.getTableRows(container);
		let selected = tableUtilsRTL.validateSelectedRowNumRows(rows);
		expect(selected).to.have.length(1);

		clickFilter(wrapper, "timestamp", true);
		checkAll = fieldpicker.querySelector(".properties-vt-header-checkbox")
			.querySelector("input[type='checkbox']");
		expect(checkAll.checked).to.be.false;

		checkAll.setAttribute("checked", true);
		fireEvent.click(checkAll);
		checkAll = fieldpicker.querySelector(".properties-vt-header-checkbox")
			.querySelector("input[type='checkbox']");
		expect(checkAll.checked).to.be.equal(true);

		rows = tableUtilsRTL.getTableRows(container);
		selected = tableUtilsRTL.validateSelectedRowNumRows(rows);
		expect(selected).to.have.length(3);
		fireEvent.click(fieldpicker.querySelector("button[data-id='properties-apply-button']"));
		fireEvent.click(container.querySelectorAll("button[data-id='properties-apply-button']")[0]);
		const summaryPanel = container.querySelector("div[data-id='properties-structuretableMultiInputSchema-summary-panel']");
		const fieldSummary = summaryPanel.querySelectorAll("table.properties-summary-table");
		expect(fieldSummary).to.have.length(1);
		const summaryRows = summaryPanel.querySelectorAll("tr.properties-summary-row");
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
			expect(summaryRows[idx]
				.querySelector("span")
				.textContent
				.trim()).to.equal(expectedSummaryRows[idx]);
		}
	});

	it("should be able to search 'time' and select all fields from all schemas", () => {
		const { container } = wrapper;
		let fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableMultiInputSchema");
		const tableRows = tableUtilsRTL.getTableRows(fieldpicker);
		expect(tableRows.length).to.equal(29);

		const searchContainer = fieldpicker.querySelector("div.properties-ft-search-container");
		const input = searchContainer.querySelector("input[type='text']");
		fireEvent.change(input, { target: { value: "Time" } });

		fieldpicker = container.querySelector("div.properties-fp-table");
		expect(tableUtilsRTL.getTableRows(fieldpicker)).to.have.length(5);

		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(0), "Time", "0");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(1), "Time", "data_1");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(2), "Timestamp", "data_1");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(3), "Time", "data_2");
		tableUtilsRTL.verifyFieldPickerRow(tableRows.at(4), "Timestamp", "data_2");

		tableUtilsRTL.selectFieldPickerHeaderCheckbox(fieldpicker);
		const checkAll = tableUtilsRTL.getTableHeaderRows(fieldpicker)[0]
			.querySelector(".properties-vt-header-checkbox")
			.querySelector("input");
		expect(checkAll.checked).to.be.equal(true);

		fieldpicker = container.querySelector("div.properties-fp-table");
		const rows = tableUtilsRTL.getTableRows(fieldpicker);
		const selected = tableUtilsRTL.validateSelectedRowNumRows(rows);
		expect(selected).to.have.length(5);

		fireEvent.click(fieldpicker.querySelector("button[data-id='properties-apply-button']"));
		fireEvent.click(container.querySelectorAll("button[data-id='properties-apply-button']")[0]);
		const summaryPanel = container.querySelector("div[data-id='properties-structuretableMultiInputSchema-summary-panel']");
		const fieldSummary = summaryPanel.querySelectorAll("table.properties-summary-table");
		expect(fieldSummary).to.have.length(1);
		const summaryRows = summaryPanel.querySelectorAll("tr.properties-summary-row");
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
			expect(summaryRows[idx]
				.querySelectorAll("span")[0]
				.textContent
				.trim()).to.equal(expectedSummaryRows[idx]);
		}
	});

	it("should be able to search 'time', filter 'time', and selct all fields", () => {
		const { container } = wrapper;
		let fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableMultiInputSchema");
		const searchContainer = fieldpicker.querySelector("div.properties-ft-search-container");
		const input = searchContainer.querySelector("input[type='text']");
		fireEvent.change(input, { target: { value: "time" } });

		clickFilter(wrapper, "time");
		fieldpicker = container.querySelector("div.properties-fp-table");
		const tableRows = tableUtilsRTL.getTableRows(fieldpicker);
		expect(tableRows.length).to.equal(2);

		tableUtilsRTL.verifyFieldPickerRow(tableRows[0], "Timestamp", "data_1");
		tableUtilsRTL.verifyFieldPickerRow(tableRows[1], "Timestamp", "data_2");

		tableUtilsRTL.selectFieldPickerHeaderCheckbox(fieldpicker);
		const checkAll = tableUtilsRTL.getTableHeaderRows(fieldpicker)[0]
			.querySelector(".properties-vt-header-checkbox")
			.querySelector("input");
		expect(checkAll.checked).to.be.equal(true);

		fieldpicker = container.querySelector("div.properties-fp-table");
		const rows = tableUtilsRTL.getTableRows(fieldpicker);
		const selected = tableUtilsRTL.validateSelectedRowNumRows(rows);
		expect(selected).to.have.length(2);

		fireEvent.click(fieldpicker.querySelector("button[data-id='properties-apply-button']"));
		fireEvent.click(container.querySelectorAll("button[data-id='properties-apply-button']")[0]);
		const fieldSummary = container.querySelector("table.properties-summary-table").querySelector("tr.properties-summary-row");
		const expectedSummaryRows = [
			"BADVAR",
			"0.BADVAR",
			"3.Cholesterol",
			"data_1.Timestamp",
			"data_2.Timestamp"
		];

		for (let idx = 0; idx < fieldSummary.length; idx++) {
			expect(fieldSummary[idx]
				.querySelectorAll("span")[0]
				.textContent
				.trim()).to.equal(expectedSummaryRows[idx]);
		}
	});

	it("should be able to select all and display schema.field names correctly in table", () => {
		const { container } = wrapper;
		const fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableMultiInputSchema");
		tableUtilsRTL.selectFieldPickerHeaderCheckbox(fieldpicker);
		const checkAll = tableUtilsRTL.getTableHeaderRows(fieldpicker)[0]
			.querySelector(".properties-vt-header-checkbox")
			.querySelector("input");
		expect(checkAll.checked).to.be.equal(true);

		const rows = tableUtilsRTL.getTableRows(container);
		const selected = tableUtilsRTL.validateSelectedRowNumRows(rows);
		expect(selected).to.have.length(29);
	});

	it("should be able to sort by schema name", () => {
		const { container } = wrapper;
		const fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableMultiInputSchema");
		const sortable = fieldpicker.querySelectorAll(".ReactVirtualized__Table__sortableHeaderColumn");
		expect(sortable).to.have.length(3);

		tableUtilsRTL.clickHeaderColumnSort(fieldpicker, 1);
		const tableRows = tableUtilsRTL.getTableRows(fieldpicker);
		expect(tableRows.length).to.equal(29);

		const expectedOrder = [
			"0", "0", "0", "0", "0", "0",
			"3", "3", "3", "3", "3", "3",
			"data_1", "data_1", "data_1", "data_1", "data_1", "data_1",
			"data_2", "data_2", "data_2", "data_2", "data_2", "data_2",
			"schema", "schema", "schema", "schema", "schema"
		];

		for (let idx = 0; idx < tableRows.length; idx++) {
			expect(tableRows[idx].querySelector(".properties-fp-schema")
				.textContent)
				.to.equal(expectedOrder[idx]);
		}

		fireEvent.click(sortable[1]);
		let reverseIdx = tableRows.length - 1;
		for (let idx = 0; idx < tableRows.length; idx++) {
			expect(tableRows[idx].querySelector(".properties-fp-schema")
				.textContent)
				.to.equal(expectedOrder[reverseIdx]);
			reverseIdx--;
		}
	});

	it("should be able to sort by data type", () => {
		const { container } = wrapper;
		const fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableMultiInputSchema");
		const sortable = fieldpicker.querySelectorAll(".ReactVirtualized__Table__sortableHeaderColumn");
		expect(sortable).to.have.length(3);

		tableUtilsRTL.clickHeaderColumnSort(fieldpicker, 2);
		const tableRows = tableUtilsRTL.getTableRows(fieldpicker);
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
			expect(tableRows[idx].querySelector(".properties-fp-field-type")
				.textContent)
				.to.equal(expectedOrder[idx]);
		}

		fireEvent.click(sortable[2]);
		let reverseIdx = tableRows.length - 1;
		for (let idx = 0; idx < tableRows.length; idx++) {
			expect(tableRows[idx].querySelector(".properties-fp-field-type")
				.textContent)
				.to.equal(expectedOrder[reverseIdx]);
			reverseIdx--;
		}
	});

	it("should be able to select the same field name from different schemas", () => {
		const { container } = wrapper;
		let fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableMultiInputSchema");
		const search = fieldpicker.querySelector("div.properties-ft-search-container").querySelector("input[type='text']");
		fireEvent.change(search, { target: { value: "age" } });
		fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableMultiInputSchema");

		const tableRows = tableUtilsRTL.getTableRows(fieldpicker);
		expect(tableRows.length).to.equal(5);

		tableUtilsRTL.verifyFieldPickerRow(tableRows[0], "Age - This is a long truncated label. You can see the entire label in a tooltip.", "0");
		tableUtilsRTL.verifyFieldPickerRow(tableRows[1], "age", "0");
		tableUtilsRTL.verifyFieldPickerRow(tableRows[2], "Age", "data_1");
		tableUtilsRTL.verifyFieldPickerRow(tableRows[3], "Age", "3");
		tableUtilsRTL.verifyFieldPickerRow(tableRows[4], "Age", "schema");

		tableUtilsRTL.fieldPicker(container.querySelector("div.properties-fp-table"), ["0.age", "data_1.Age", "3.Age"]);

		fireEvent.click(container.querySelectorAll("button[data-id='properties-apply-button']")[0]);

		const summaryPanel = container.querySelector("div[data-id='properties-structuretableMultiInputSchema-summary-panel']");
		const fieldSummary = summaryPanel.querySelectorAll("table.properties-summary-table");
		expect(fieldSummary).to.have.length(1);
		const summaryRows = summaryPanel.querySelectorAll("tr.properties-summary-row");
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
			expect(summaryRows[idx]
				.querySelector("span")
				.textContent
				.trim()).to.equal(expectedSummaryRows[idx]);
		}
	});


});

describe("field-picker-control with on selectcolumns renders correctly", () => {
	let wrapper;
	let renderedController;
	let fieldpicker;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(fieldPickerParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show warning from invalid field names in the selectcolumns control", () => {
		const { container } = wrapper;
		fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-fields");
		const selectRows = tableUtilsRTL.getTableRows(container.querySelector(".properties-column-select-table"));
		expect(selectRows.length).to.equal(5);
		fireEvent.click(fieldpicker.querySelector("button[data-id='properties-apply-button']"));
		const selectRows2 = tableUtilsRTL.getTableRows(container.querySelector(".properties-column-select-table"));
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
		const { container } = wrapper;
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
		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-fields");
		tableUtilsRTL.fieldPicker(fieldPicker, [],
			["Age - This is a long truncated label. You can see the entire label in a tooltip.", "age", "Sex", "BP", "Cholesterol", "Time", "age5", "BP5", "Na5", "drug5",
				"Age", "Na", "K", "Drug", "Time",
				"Timestamp", "Drug", "drug", "drug2", "Time", "Timestamp", "Date", "Age", "BP",
				"Na", "drug", "drug2", "drug3", "Age", "BP", "Na", "drug", "drugs"]
		);
	});
	it("fieldpicker will receive updated props from selectcolumns control ", () => {
		const { container } = wrapper;
		renderedController.updatePropertyValue({ name: "fields" }, []);
		const selectRows = container.querySelectorAll("tr.column-select-table-row");
		expect(selectRows.length).to.equal(0);
	});

	it("checkbox in selectcolumns table header should have label", () => {
		const { container } = wrapper;
		fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-fields");
		const tableHeaderRows = tableUtilsRTL.getTableHeaderRows(fieldpicker);
		const headerCheckboxLabel = tableHeaderRows[0].querySelector(".properties-vt-header-checkbox").textContent;
		const secondColumnLabel = tableHeaderRows[0]
			.querySelector("div[role='columnheader']")
			.textContent;
		expect(headerCheckboxLabel).to.equal(`Select all ${secondColumnLabel}`);
	});

	it("checkbox in selectcolumns table row should have label", () => {
		const { container } = wrapper;
		fieldpicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-fields");
		const tableRows = tableUtilsRTL.getTableRows(fieldpicker);
		const fieldNames = [];
		const rowCheckboxes = [];
		for (let i = 0; i < tableRows.length; i++) {
			rowCheckboxes.push(tableRows[i].querySelector((".properties-vt-row-checkbox")));
			fieldNames.push(tableRows[i].querySelector((".properties-fp-field")));
		}
		expect(fieldNames).to.have.length(29);
		const tableName = container.querySelector(".properties-wf-title").textContent;

		tableRows.forEach((row, index) => {
			const rowCheckboxLabel = rowCheckboxes[index].textContent;
			expect(rowCheckboxLabel).to.equal(`Select row ${index + 1} from ${tableName}`);
		});
	});

});

describe("field-picker control multiple rows selection", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(fieldPickerParamDef);
		wrapper = renderedObject.wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableMultiInputSchema-summary-panel");
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should select/deselect multiple rows in fieldPicker table using shift key", () => {
		const { container } = wrapper;
		let fieldPicker;
		let tableRows;
		fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableMultiInputSchema");
		tableRows = tableUtilsRTL.getTableRows(fieldPicker);
		expect(tableRows.length).to.equal(29);

		// Verify no rows are selected
		const selected = tableUtilsRTL.validateSelectedRowNumRows(tableRows);
		expect(selected).to.have.length(0);

		// Shift + select 8th row
		tableUtilsRTL.shiftSelectCheckbox(tableRows, 8);
		fieldPicker = container.querySelector("div.properties-fp-table");
		tableRows = tableUtilsRTL.getTableRows(fieldPicker);
		// Verify 1-8 rows are selected
		expect(tableUtilsRTL.validateSelectedRowNumRows(tableRows)).to.have.length(8);

		// shift + select 15th row
		tableUtilsRTL.shiftSelectCheckbox(tableRows, 15);
		fieldPicker = container.querySelector("div.properties-fp-table");
		tableRows = tableUtilsRTL.getTableRows(fieldPicker);
		// Verify 1-15 rows are selected
		expect(tableUtilsRTL.validateSelectedRowNumRows(tableRows)).to.have.length(15);

		// shift + select 5th row -- this will deselect 5-15 rows.
		tableUtilsRTL.shiftSelectCheckbox(tableRows, 5);
		fieldPicker = container.querySelector("div.properties-fp-table");
		tableRows = tableUtilsRTL.getTableRows(fieldPicker);
		// 5-15 rows will be deselected. And 1-4 rows will remain selected
		expect(tableUtilsRTL.validateSelectedRowNumRows(tableRows)).to.have.length(4);

		// shift + select 1st row -- this will deselect all rows
		tableUtilsRTL.shiftSelectCheckbox(tableRows, 1);
		fieldPicker = container.querySelector("div.properties-fp-table");
		tableRows = tableUtilsRTL.getTableRows(fieldPicker);
		// Verify all rows are deselected
		expect(tableUtilsRTL.validateSelectedRowNumRows(tableRows)).to.have.length(0);

		// shift + select 29th row -- this will select all rows
		tableUtilsRTL.shiftSelectCheckbox(tableRows, 29);
		fieldPicker = container.querySelector("div.properties-fp-table");
		tableRows = tableUtilsRTL.getTableRows(fieldPicker);
		// Verify all rows are selected
		expect(tableUtilsRTL.validateSelectedRowNumRows(tableRows)).to.have.length(29);
	});

	it("should add rows as per their row number in the table irrespective of the user selection order", () => {
		const { container } = wrapper;
		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableMultiInputSchema");
		const tableRows = tableUtilsRTL.getTableRows(fieldPicker);
		const fieldNames = fieldPicker.querySelectorAll(".properties-fp-field-name");
		const schemaNames = fieldPicker.querySelectorAll(".properties-fp-schema");
		expect(tableRows.length).to.equal(29);

		// Verify no rows are selected
		const selected = tableUtilsRTL.validateSelectedRowNumRows(tableRows);
		expect(selected).to.have.length(0);

		// select row number in random order
		tableUtilsRTL.selectCheckboxes(tableRows, [1, 15, 10, 12, 9]);
		fireEvent.click(fieldPicker.querySelector("button[data-id='properties-apply-button']"));

		const renameFieldTable = container.querySelector("div[data-id='properties-ft-structuretableMultiInputSchema']");
		const secondColumn = renameFieldTable.querySelectorAll(".properties-field-type-icon + .properties-field-type");

		// Even though we selected [1, 15, 10, 12, 9], they should be displayed as [1, 9, 10, 12, 15]
		expect(secondColumn[3].textContent).to.equal(schemaNames[1].textContent + "." + fieldNames[1].textContent);
		expect(secondColumn[4].textContent).to.equal(schemaNames[9].textContent + "." + fieldNames[9].textContent);
		expect(secondColumn[5].textContent).to.equal(schemaNames[10].textContent + "." + fieldNames[10].textContent);
		expect(secondColumn[6].textContent).to.equal(schemaNames[12].textContent + "." + fieldNames[12].textContent);
		expect(secondColumn[7].textContent).to.equal(schemaNames[15].textContent + "." + fieldNames[15].textContent);
	});

});
