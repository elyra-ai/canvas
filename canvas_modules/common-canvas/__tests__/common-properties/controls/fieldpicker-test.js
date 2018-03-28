/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import FieldPicker from "../../../src/common-properties/editor-controls/field-picker.jsx";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import { mountWithIntl } from "enzyme-react-intl";
import { ReactWrapper } from "enzyme";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end

import fieldPickerParamDef from "../../test_resources/paramDefs/fieldpicker_paramDef.json";

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
	let filters = wrapper.find(".filter-list-li.filter");
	filters.forEach((node) => {
		if (node.prop("data-type") === type) {
			node.simulate("click");
		}
	});
	filters = wrapper.find(".filter-list-li.filter");
	filters.forEach((node) => {
		if (node.prop("data-type") === type) {
			if (enabled === true) {
				expect(node.prop("disabled")).to.equal(false);
			} else {
				expect(node.prop("disabled")).to.equal(true);
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
		wrapper.update();
		expect(wrapper.find("#field-picker-back-button")).to.have.length(1);
		expect(wrapper.find("#reset-fields-button")).to.have.length(1);
		expect(wrapper.find("#field-picker-filter-list")).to.have.length(1);
		expect(wrapper.find("#flexible-table-container")).to.have.length(1);
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
		expect(wrapper.find("#flexible-table-container").find(".field-picker-data-rows")).to.have.length(filteredDataset.length);
		expect(wrapper.find(".properties-tooltips-filter")).to.have.length(6); // list of filters
		const checkBoxs = wrapper.find("Checkbox").filterWhere((checkBox) => checkBox.prop("checked") === true);
		expect(checkBoxs).to.have.length(currentFields.length); // controlValues rendered correctly
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
		wrapper.find("input[id='field-picker-checkbox-0']").simulate("change", { target: { checked: "true", name: "Age" } });
		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM
		const checkBoxs = wrapper.find("Checkbox").filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(checkBoxs).to.have.length(4);
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
		wrapper.find("input[id='field-picker-checkbox-1']").simulate("change", { target: { checked: "true", name: "Sex" } });
		wrapper.update();
		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM
		const checkBoxs = wrapper.find("Checkbox").filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(checkBoxs).to.have.length(4);
		wrapper.find("#reset-fields-button").simulate("click");
		wrapper.update();
		const resetBoxs = wrapper.find("Checkbox").filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(resetBoxs).to.have.length(3);
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
		expect(wrapper.find(".field-picker-data-rows")).to.have.length(9);
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

		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM

		// disable a set of icons except double
		clickFilter(wrapper, "integer");
		clickFilter(wrapper, "string");
		clickFilter(wrapper, "date");
		clickFilter(wrapper, "time");
		clickFilter(wrapper, "timestamp");

		// select the remaining rows
		expect(wrapper.find(".field-picker-data-rows")).to.have.length(2);
		wrapper.find("input[id='field-picker-checkbox-all']").simulate("change", { target: { checked: "true" } });
		wrapper.update();

		//  enable the icons so that we can get a valid count of all selected rows.
		clickFilter(wrapper, "integer", true);
		clickFilter(wrapper, "string", true);
		clickFilter(wrapper, "date", true);
		clickFilter(wrapper, "time", true);
		clickFilter(wrapper, "timestamp", true);

		// validate the number of rows selected
		const checkBoxs = wrapper.find("Checkbox").filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(checkBoxs).to.have.length(4);
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
		const input = wrapper.find("#flexible-table-search");
		input.simulate("change", { target: { value: "Time" } });
		expect(wrapper.find(".field-picker-data-rows")).to.have.length(2);
		// test case insensitive
		input.simulate("change", { target: { value: "TIME" } });
		expect(wrapper.find(".field-picker-data-rows")).to.have.length(2);
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
		wrapper.find("input[id='field-picker-checkbox-all']").simulate("change", { target: { checked: "true" } });
		wrapper.update();

		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM

		const checkBoxs = wrapper.find("Checkbox").filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(checkBoxs).to.have.length(filteredDataset.length);
	});
});

describe("field-picker-control with multi input schemas renders correctly", () => {
	let wrapper;
	let tablesCategory;
	let wideflyoutWrapper;
	let fieldpicker;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(fieldPickerParamDef);
		wrapper = renderedObject.wrapper;

		tablesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // TABLES category
		tablesCategory.find(".control-summary-link-buttons").at(0)
			.find(".button")
			.simulate("click");
		const wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const addFieldsButtons = wideflyoutWrapper.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker\
		const fphtml = document.getElementById("field-picker-table"); // needed since modal dialogs are outside `wrapper`
		fieldpicker = new ReactWrapper(fphtml, true);
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display the correct schema for each field", () => {
		const tableRows = fieldpicker.find(".field-picker-data-rows");
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
		const filterIcons = fieldpicker.find(".filter-list-li.filter");
		expect(filterIcons.length).to.equal(6);

		clickFilter(fieldpicker, "integer");
		clickFilter(fieldpicker, "string");
		clickFilter(fieldpicker, "time");
		clickFilter(fieldpicker, "double");
		clickFilter(fieldpicker, "timestamp");

		const checkAll = fieldpicker.find("input[id='field-picker-checkbox-all']");
		checkAll.simulate("change", { target: { checked: "true" } });
		expect(checkAll.prop("checked")).to.be.true;

		let checkBoxes = fieldpicker.find("input[type='checkbox']")
			.filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(checkBoxes).to.have.length(1);

		clickFilter(fieldpicker, "timestamp", true);
		expect(checkAll.prop("checked")).to.be.false;

		checkAll.simulate("change", { target: { checked: "true" } });
		expect(checkAll.prop("checked")).to.be.true;

		checkBoxes = fieldpicker.find("input[type='checkbox']")
			.filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(checkBoxes).to.have.length(3);

		fieldpicker.find("#properties-apply-button").simulate("click");
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		wrapper.update();
		const fieldSummary = wrapper.find(".control-summary-table");
		expect(fieldSummary).to.have.length(1);
		const summaryRows = fieldSummary.find(".control-summary-list-rows");
		expect(summaryRows).to.have.length(3);

		const expectedSummaryRows = [
			"Date",
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
		const search = fieldpicker.find("#flexible-table-search");
		search.simulate("change", { target: { value: "time" } });

		const tableRows = fieldpicker.find(".field-picker-data-rows");
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

		const checkAll = fieldpicker.find("input[id='field-picker-checkbox-all']");
		checkAll.simulate("change", { target: { checked: "true" } });
		expect(checkAll.prop("checked")).to.be.true;

		const checkBoxes = fieldpicker.find("input[type='checkbox']")
			.filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(checkBoxes).to.have.length(5);

		fieldpicker.find("#properties-apply-button").simulate("click");
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		wrapper.update();
		const fieldSummary = wrapper.find(".control-summary-table");
		expect(fieldSummary).to.have.length(1);
		const summaryRows = fieldSummary.find(".control-summary-list-rows");
		expect(summaryRows).to.have.length(5);

		const expectedSummaryRows = [
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
		const search = fieldpicker.find("#flexible-table-search");
		search.simulate("change", { target: { value: "time" } });

		clickFilter(fieldpicker, "time");
		const tableRows = fieldpicker.find(".field-picker-data-rows");
		expect(tableRows.length).to.equal(2);

		const row0Columns = tableRows.at(0).find("td");
		expect(row0Columns.at(1).text()).to.equal("Timestamp");
		expect(row0Columns.at(2).text()).to.equal("data_1");

		const row1Columns = tableRows.at(1).find("td");
		expect(row1Columns.at(1).text()).to.equal("Timestamp");
		expect(row1Columns.at(2).text()).to.equal("data_2");

		const checkAll = fieldpicker.find("input[id='field-picker-checkbox-all']");
		checkAll.simulate("change", { target: { checked: "true" } });
		expect(checkAll.prop("checked")).to.be.true;

		const checkBoxes = fieldpicker.find("input[type='checkbox']")
			.filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(checkBoxes).to.have.length(2);

		fieldpicker.find("#properties-apply-button").simulate("click");
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		wrapper.update();
		const fieldSummary = wrapper.find(".control-summary-table");
		expect(fieldSummary).to.have.length(1);
		expect(fieldSummary.find(".control-summary-list-rows")).to.have.length(2);
		expect(fieldSummary.find(".control-summary-list-rows").at(0)
			.find("span")
			.at(0)
			.text()
			.trim()).to.equal("data_1.Timestamp");
		expect(fieldSummary.find(".control-summary-list-rows").at(1)
			.find("span")
			.at(0)
			.text()
			.trim()).to.equal("data_2.Timestamp");
	});

	it("should be able to select all and display schema.field names correctly in table", () => {
		const checkAll = fieldpicker.find("input[id='field-picker-checkbox-all']");
		checkAll.simulate("change", { target: { checked: "true" } });
		expect(checkAll.prop("checked")).to.be.true;

		const checkBoxes = fieldpicker.find("input[type='checkbox']")
			.filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(checkBoxes).to.have.length(29);
	});

	it("should be able to sort by schema name", () => {
		const sortable = fieldpicker.find(".reactable-header-sortable");
		expect(sortable).to.have.length(3);

		sortable.at(1).simulate("click");
		const tableRows = fieldpicker.find(".field-picker-data-rows");
		expect(tableRows.length).to.equal(29);

		let row0Columns = tableRows.at(0).find("td");
		expect(row0Columns.at(1).text()).to.equal("drugs");
		expect(row0Columns.at(2).text()).to.equal("schema");

		const row5Columns = tableRows.at(5).find("td");
		expect(row5Columns.at(1).text()).to.equal("Date");
		expect(row5Columns.at(2).text()).to.equal("data_2");

		const row11Columns = tableRows.at(11).find("td");
		expect(row11Columns.at(1).text()).to.equal("Timestamp");
		expect(row11Columns.at(2).text()).to.equal("data_1");

		sortable.at(1).simulate("click");
		row0Columns = tableRows.at(0).find("td");
		expect(row0Columns.at(1).text()).to.equal("Time");
		expect(row0Columns.at(2).text()).to.equal("0");

		const row6Columns = tableRows.at(6).find("td");
		expect(row6Columns.at(1).text()).to.equal("drug3");
		expect(row6Columns.at(2).text()).to.equal("3");

		const row12Columns = tableRows.at(12).find("td");
		expect(row12Columns.at(1).text()).to.equal("Timestamp");
		expect(row12Columns.at(2).text()).to.equal("data_1");
	});

	it("should be able to select the same field name from different schemas", () => {
		const search = fieldpicker.find("#flexible-table-search");
		search.simulate("change", { target: { value: "age" } });

		const tableRows = fieldpicker.find(".field-picker-data-rows");
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

		propertyUtils.fieldPicker(["0.Age", "age", "data_1.Age"]);

		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		wrapper.update();
		const fieldSummary = wrapper.find(".control-summary-table");
		expect(fieldSummary).to.have.length(1);

		// This actually also tests for bad incoming field names. Without the proper
		// bad field name filtering we have in the field picker, the test below would
		// return 6 instead of 3 because of the bad input field names in the test file.
		const summaryRows = fieldSummary.find(".control-summary-list-rows");
		expect(summaryRows).to.have.length(3);

		const expectedSummaryRows = [
			"0.Age",
			"age",
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
	let selectColsCategory;
	let fieldpicker;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(fieldPickerParamDef);
		wrapper = renderedObject.wrapper;

		selectColsCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // Select Columns category
		// open filter picker
		selectColsCategory.find("#field-picker-buttons-container").at(0)
			.find(".button")
			.simulate("click");
		const fphtml = document.getElementById("field-picker-table"); // needed since modal dialogs are outside `wrapper`
		fieldpicker = new ReactWrapper(fphtml, true);
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should filter out missing field names from selectcolumns control", () => {
		const selectRows = wrapper.find(".column-select-table-row");
		expect(selectRows.length).to.equal(5);
		fieldpicker.find("#properties-apply-button").simulate("click");
		wrapper.update();
		// The act of opening the field picker should have filtered out the bad field names
		const selectRows2 = wrapper.find(".column-select-table-row");
		expect(selectRows2.length).to.equal(3);
	});
});
