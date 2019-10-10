/*
 * Copyright 2017-2019 IBM Corporation
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
import { mountWithIntl } from "enzyme-react-intl";
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
	filters.forEach((node) => {
		if (node.prop("data-type") === type) {
			node.simulate("click");
		}
	});
	filters = wrapper.find("button.properties-fp-filter");
	filters.forEach((node) => {
		if (node.prop("data-type") === type) {
			if (enabled === true) {
				expect(node.find("svg").prop("disabled")).to.equal(false);
			} else {
				expect(node.find("svg").prop("disabled")).to.equal(true);
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
			/>
		);
		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM
		expect(wrapper.find("div.properties-ft-container").find("tr.properties-fp-data-rows")).to.have.length(filteredDataset.length);
		expect(wrapper.find("div.properties-tooltips-filter")).to.have.length(6); // list of filters
		const rows = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody");
		const selected = propertyUtils.validateSelectedRowNum(rows);
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
			/>
		);
		const rowCheckboxes = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody")
			.find("input[type='checkbox']");
		const ageCheckBox = rowCheckboxes.at(0);
		ageCheckBox.getDOMNode().checked = true;
		ageCheckBox.simulate("change");

		const rows = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody");
		const selected = propertyUtils.validateSelectedRowNum(rows);
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
			/>
		);
		const rowCheckboxes = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody")
			.find("input[type='checkbox']");
		const sexCheckBox = rowCheckboxes.at(1);
		sexCheckBox.getDOMNode().checked = true;
		sexCheckBox.simulate("change");
		const rows = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody");
		let selected = propertyUtils.validateSelectedRowNum(rows);
		expect(selected).to.have.length(4);
		wrapper.find("button.properties-fp-reset-button-container").simulate("click");
		const resetBoxs = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody");
		selected = propertyUtils.validateSelectedRowNum(resetBoxs);
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
			/>
		);
		clickFilter(wrapper, "integer");
		expect(wrapper.find("tr.properties-fp-data-rows")).to.have.length(9);
	});

	it("should select all in filtered type in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
			/>
		);
		// disable a set of icons except double
		clickFilter(wrapper, "integer");
		clickFilter(wrapper, "string");
		clickFilter(wrapper, "date");
		clickFilter(wrapper, "time");
		clickFilter(wrapper, "timestamp");

		// select the remaining rows
		expect(wrapper.find("tr.properties-fp-data-rows")).to.have.length(2);
		const allCheckBox = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("thead")
			.find("input[type='checkbox']");
		allCheckBox.getDOMNode().checked = true;
		allCheckBox.simulate("change");

		//  enable the icons so that we can get a valid count of all selected rows.
		clickFilter(wrapper, "integer", true);
		clickFilter(wrapper, "string", true);
		clickFilter(wrapper, "date", true);
		clickFilter(wrapper, "time", true);
		clickFilter(wrapper, "timestamp", true);

		// validate the number of rows selected
		const rows = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody");
		const rowsSelected = propertyUtils.validateSelectedRowNum(rows);
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
			/>
		);

		const searchContainer = wrapper.find("div.properties-ft-search-container");
		const input = searchContainer.find("input[type='text']");
		input.simulate("change", { target: { value: "Time" } });
		expect(wrapper.find("tr.properties-fp-data-rows")).to.have.length(2);
		// test case insensitive
		input.simulate("change", { target: { value: "TIME" } });
		expect(wrapper.find("tr.properties-fp-data-rows")).to.have.length(2);
		searchContainer.find("button").simulate("click"); // click on the x button to remove search value
		expect(wrapper.find("tr.properties-fp-data-rows")).to.have.length(filteredDataset.length);
	});

	it("should set checkedAll to true in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentFields={currentFields}
				fields={filteredDataset}
				controller={controller}
			/>
		);
		const allCheckBox = wrapper.find("thead").find("input[type='checkbox']")
			.at(0);
		allCheckBox.getDOMNode().checked = true;
		allCheckBox.simulate("change");

		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM
		const rows = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody");
		const selected = propertyUtils.validateSelectedRowNum(rows);
		expect(selected).to.have.length(filteredDataset.length);
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
		const fieldpicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const tableRows = fieldpicker.find("tr.properties-fp-data-rows");
		expect(tableRows.length).to.equal(29);
		// verify first and last row from each schema
		const row0Columns = tableRows.at(0).find("td");
		expect(row0Columns.at(1).text()).to.equal("Age");
		expect(row0Columns.at(2).text()).to.equal("0");
		const row5Columns = tableRows.at(5).find("td");
		expect(row5Columns.at(1).text()).to.equal("Time");
		expect(row5Columns.at(2).text()).to.equal("0");

		const row6Columns = tableRows.at(6).find("td");
		expect(row6Columns.at(1).text()).to.equal("Age");
		expect(row6Columns.at(2).text()).to.equal("data_1");
		const row11Columns = tableRows.at(11).find("td");
		expect(row11Columns.at(1).text()).to.equal("Timestamp");
		expect(row11Columns.at(2).text()).to.equal("data_1");

		const row12Columns = tableRows.at(12).find("td");
		expect(row12Columns.at(1).text()).to.equal("Drug");
		expect(row12Columns.at(2).text()).to.equal("data_2");
		const row17Columns = tableRows.at(17).find("td");
		expect(row17Columns.at(1).text()).to.equal("Date");
		expect(row17Columns.at(2).text()).to.equal("data_2");

		const row18Columns = tableRows.at(18).find("td");
		expect(row18Columns.at(1).text()).to.equal("Age");
		expect(row18Columns.at(2).text()).to.equal("3");
		const row23Columns = tableRows.at(23).find("td");
		expect(row23Columns.at(1).text()).to.equal("drug3");
		expect(row23Columns.at(2).text()).to.equal("3");

		const row24Columns = tableRows.at(24).find("td");
		expect(row24Columns.at(1).text()).to.equal("Age");
		expect(row24Columns.at(2).text()).to.equal("schema");
		const row28Columns = tableRows.at(28).find("td");
		expect(row28Columns.at(1).text()).to.equal("drugs");
		expect(row28Columns.at(2).text()).to.equal("schema");
	});

	it("should be able to filter type and select all", () => {
		const fieldpicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const filterIcons = fieldpicker.find("div.properties-tooltips-filter");
		expect(filterIcons.length).to.equal(6);

		clickFilter(wrapper, "integer");
		clickFilter(wrapper, "string");
		clickFilter(wrapper, "time");
		clickFilter(wrapper, "double");
		clickFilter(wrapper, "timestamp");

		let checkAll = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("thead")
			.find("input[type='checkbox']");
		checkAll.getDOMNode().checked = true;
		checkAll.simulate("change");

		checkAll = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("thead")
			.find("input[type='checkbox']");
		expect(checkAll.prop("checked")).to.be.true;
		let rows = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody");
		let selected = propertyUtils.validateSelectedRowNum(rows);
		expect(selected).to.have.length(1);

		clickFilter(wrapper, "timestamp", true);
		checkAll = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("thead")
			.find("input[type='checkbox']");
		expect(checkAll.prop("checked")).to.be.false;

		checkAll.getDOMNode().checked = true;
		checkAll.simulate("change");
		checkAll = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("thead")
			.find("input[type='checkbox']");
		expect(checkAll.prop("checked")).to.be.true;

		rows = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody");
		selected = propertyUtils.validateSelectedRowNum(rows);
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
		const fieldpicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const search = fieldpicker.find("div.properties-ft-search-container").find("input[type='text']");
		search.simulate("change", { target: { value: "time" } });
		const tableRows = wrapper.find("tr.properties-fp-data-rows");
		expect(tableRows.length).to.equal(5);

		const row0Columns = tableRows.at(0).find("td");
		expect(row0Columns.at(1).text()).to.equal("Time");
		expect(row0Columns.at(2).text()).to.equal("0");

		const row1Columns = tableRows.at(1).find("td");
		expect(row1Columns.at(1).text()).to.equal("Time");
		expect(row1Columns.at(2).text()).to.equal("data_1");

		const row2Columns = tableRows.at(2).find("td");
		expect(row2Columns.at(1).text()).to.equal("Timestamp");
		expect(row2Columns.at(2).text()).to.equal("data_1");

		const row3Columns = tableRows.at(3).find("td");
		expect(row3Columns.at(1).text()).to.equal("Time");
		expect(row3Columns.at(2).text()).to.equal("data_2");

		const row4Columns = tableRows.at(4).find("td");
		expect(row4Columns.at(1).text()).to.equal("Timestamp");
		expect(row4Columns.at(2).text()).to.equal("data_2");

		let checkAll = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("thead")
			.find("input[type='checkbox']");
		checkAll.getDOMNode().checked = true;
		checkAll.simulate("change");
		checkAll = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("thead")
			.find("input[type='checkbox']");
		expect(checkAll.prop("checked")).to.be.true;

		const rows = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody");
		const selected = propertyUtils.validateSelectedRowNum(rows);
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
		const fieldpicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const search = fieldpicker.find("div.properties-ft-search-container").find("input[type='text']");
		search.simulate("change", { target: { value: "time" } });

		clickFilter(wrapper, "time");
		const tableRows = wrapper.find("tr.properties-fp-data-rows");
		expect(tableRows.length).to.equal(2);

		const row0Columns = tableRows.at(0).find("td");
		expect(row0Columns.at(1).text()).to.equal("Timestamp");
		expect(row0Columns.at(2).text()).to.equal("data_1");

		const row1Columns = tableRows.at(1).find("td");
		expect(row1Columns.at(1).text()).to.equal("Timestamp");
		expect(row1Columns.at(2).text()).to.equal("data_2");

		let checkAll = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("thead")
			.find("input[type='checkbox']");
		checkAll.getDOMNode().checked = true;
		checkAll.simulate("change");
		checkAll = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("thead")
			.find("input[type='checkbox']");
		expect(checkAll.prop("checked")).to.be.true;

		const rows = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody");
		const selected = propertyUtils.validateSelectedRowNum(rows);
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
		propertyUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		let checkAll = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("thead")
			.find("input[type='checkbox']");
		checkAll.getDOMNode().checked = true;
		checkAll.simulate("change");
		checkAll = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("thead")
			.find("input[type='checkbox']");
		expect(checkAll.prop("checked")).to.be.true;

		const rows = wrapper.find("div[data-id='properties-ft-field-picker']")
			.find("tbody");
		const selected = propertyUtils.validateSelectedRowNum(rows);
		expect(selected).to.have.length(29);
	});

	it("should be able to sort by schema name", () => {
		const fieldpicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const sortable = fieldpicker.find("th.reactable-header-sortable");
		expect(sortable).to.have.length(3);

		sortable.at(1).simulate("click");
		const tableRows = fieldpicker.find("tr.properties-fp-data-rows");
		expect(tableRows.length).to.equal(29);

		const expectedOrder = [
			"0", "0", "0", "0", "0", "0",
			"3", "3", "3", "3", "3", "3",
			"data_1", "data_1", "data_1", "data_1", "data_1", "data_1",
			"data_2", "data_2", "data_2", "data_2", "data_2", "data_2",
			"schema", "schema", "schema", "schema", "schema"
		];

		for (let idx = 0; idx < tableRows.length; idx++) {
			expect(tableRows.at(idx).find("td")
				.at(2)
				.text())
				.to.equal(expectedOrder[idx]);
		}

		sortable.at(1).simulate("click");
		let reverseIdx = tableRows.length - 1;
		for (let idx = 0; idx < tableRows.length; idx++) {
			expect(tableRows.at(idx).find("td")
				.at(2)
				.text())
				.to.equal(expectedOrder[reverseIdx]);
			reverseIdx--;
		}
	});

	it("should be able to sort by data type", () => {
		const fieldpicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const sortable = fieldpicker.find("th.reactable-header-sortable");
		expect(sortable).to.have.length(3);

		sortable.at(2).simulate("click");
		const tableRows = wrapper.find("tr.properties-fp-data-rows");
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
			expect(tableRows.at(idx).find("td")
				.at(3)
				.find("div.properties-fp-field-type")
				.text())
				.to.equal(expectedOrder[idx]);
		}

		sortable.at(2).simulate("click");
		let reverseIdx = tableRows.length - 1;
		for (let idx = 0; idx < tableRows.length; idx++) {
			expect(tableRows.at(idx).find("td")
				.at(3)
				.find("div.properties-fp-field-type")
				.text())
				.to.equal(expectedOrder[reverseIdx]);
			reverseIdx--;
		}
	});

	it("should be able to select the same field name from different schemas", () => {
		const fieldpicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-structuretableMultiInputSchema");
		const search = fieldpicker.find("div.properties-ft-search-container").find("input[type='text']");
		search.simulate("change", { target: { value: "age" } });

		const tableRows = wrapper.find("tr.properties-fp-data-rows");
		expect(tableRows.length).to.equal(5);

		const row0Columns = tableRows.at(0).find("td");
		expect(row0Columns.at(1).text()).to.equal("Age");
		expect(row0Columns.at(2).text()).to.equal("0");

		const row1Columns = tableRows.at(1).find("td");
		expect(row1Columns.at(1).text()).to.equal("age");
		expect(row1Columns.at(2).text()).to.equal("0");

		const row2Columns = tableRows.at(2).find("td");
		expect(row2Columns.at(1).text()).to.equal("Age");
		expect(row2Columns.at(2).text()).to.equal("data_1");

		const row3Columns = tableRows.at(3).find("td");
		expect(row3Columns.at(1).text()).to.equal("Age");
		expect(row3Columns.at(2).text()).to.equal("3");

		const row4Columns = tableRows.at(4).find("td");
		expect(row4Columns.at(1).text()).to.equal("Age");
		expect(row4Columns.at(2).text()).to.equal("schema");

		propertyUtils.fieldPicker(wrapper.find("div.properties-fp-table"), ["0.Age", "0.age", "data_1.Age"]);

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
			"0.Age",
			"0.age",
			"data_1.Age"
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
		fieldpicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-fields");
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show warning from invalid field names in the selectcolumns control", () => {
		const selectRows = wrapper.find("tr.column-select-table-row");
		expect(selectRows.length).to.equal(5);
		fieldpicker.find("button[data-id='properties-apply-button']").simulate("click");
		const selectRows2 = wrapper.find("tr.column-select-table-row");
		expect(selectRows2.length).to.equal(5);

		const warningMessage = {
			fields: {
				"1": {
					"type": "warning",
					"text": "Invalid Select Columns, field not found in data set.",
					"validation_id": "validField_fields[0]_294.69762842919897"
				},
				"2": {
					"type": "warning",
					"text": "Invalid Select Columns, field not found in data set.",
					"validation_id": "validField_fields[0]_294.69762842919897"
				}
			}
		};

		const actual = renderedController.getErrorMessages();
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
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-fields");
		propertyUtils.fieldPicker(fieldPicker, [],
			["Age", "age", "Sex", "BP", "Cholesterol", "Time", "age5", "BP5", "Na5", "drug5",
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

});
