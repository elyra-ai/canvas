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

const currentControlValues = {
	"keys": [
		["Na", "Ascending"],
		["Drug", "Descending"],
		["Cholesterol", "Ascending"]
	],
	"use_custom_name": [
		"true"
	],
	"custom_name": [
		""
	],
	"annotation": [
		""
	]
};
const filteredDataset = [
	{
		"fields": [
			{
				"name": "Age",
				"type": "integer",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				}
			},
			{
				"name": "Sex",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				}
			},
			{
				"name": "BP",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				}
			},
			{
				"name": "Cholesterol",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				}
			},
			{
				"name": "Na",
				"type": "double",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				}
			},
			{
				"name": "K",
				"type": "double",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				}
			},
			{
				"name": "Drug",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				}
			},
			{
				"name": "Time",
				"type": "time",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				}
			},
			{
				"name": "Timestamp",
				"type": "timestamp",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				}
			},
			{
				"name": "Date",
				"type": "date",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				}
			}
		]
	}
];
const fieldPickerControl = {
	"name": "keys",
	"label": {
		"text": "Sort by"
	},
	"separateLabel": true,
	"controlType": "structuretable",
	"isRowMoveable": true,
	"valueDef": {
		"propType": "structure",
		"isList": true,
		"isMap": false
	},
	"subControls": [
		{
			"name": "field",
			"label": {
				"text": "Field"
			},
			"visible": true,
			"width": 28,
			"controlType": "selectcolumn",
			"role": "column",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false
			}
		},
		{
			"name": "sort_order",
			"label": {
				"text": "Order"
			},
			"visible": true,
			"width": 16,
			"controlType": "toggletext",
			"role": "enum",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false
			},
			"values": [
				"Ascending",
				"Descending"
			],
			"valueLabels": [
				"Ascending",
				"Descending"
			],
			"valueIcons": [
				"/images/up-triangle.svg",
				"/images/down-triangle.svg"
			]
		}
	],
	"keyIndex": 0,
	"defaultRow": [
		"Ascending"
	]
};
function closeFieldPicker() {
	return ["Test value"];
}

function updateSelectedRows(selection) {
	return selection;
}

describe("field-picker-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentControlValues={currentControlValues}
				dataModel={filteredDataset}
				control={fieldPickerControl}
				updateSelectedRows={updateSelectedRows}
				controller={controller}
			/>
		);

		expect(wrapper.prop("closeFieldPicker")).to.equal(closeFieldPicker);
		expect(wrapper.prop("currentControlValues")).to.equal(currentControlValues);
		expect(wrapper.prop("dataModel")).to.equal(filteredDataset);
		expect(wrapper.prop("control")).to.equal(fieldPickerControl);
	});

	it("should render a `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentControlValues={currentControlValues}
				dataModel={filteredDataset}
				control={fieldPickerControl}
				updateSelectedRows={updateSelectedRows}
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
				currentControlValues={currentControlValues}
				dataModel={filteredDataset}
				control={fieldPickerControl}
				updateSelectedRows={updateSelectedRows}
				controller={controller}
			/>
		);
		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM
		expect(wrapper.find("#flexible-table-container").find(".field-picker-data-rows")).to.have.length(filteredDataset[0].fields.length);
		expect(wrapper.find(".properties-tooltips-filter")).to.have.length(6); // list of filters
		const checkBoxs = wrapper.find("Checkbox").filterWhere((checkBox) => checkBox.prop("checked") === true);
		expect(checkBoxs).to.have.length(currentControlValues.keys.length); // controlValues rendered correctly
	});

	it("should set correct filtered type in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentControlValues={currentControlValues}
				dataModel={filteredDataset}
				control={fieldPickerControl}
				updateSelectedRows={updateSelectedRows}
				controller={controller}
			/>
		);
		wrapper.find(".filter-list-data-integer-enabled-icon").simulate("click", { type: "integer" });
		wrapper.update();
		expect(wrapper.find(".filter-list-data-integer-disabled-icon")).to.have.length(1);
		expect(wrapper.find(".field-picker-data-rows")).to.have.length(9);
	});

	it("should select all in filtered type in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentControlValues={currentControlValues}
				dataModel={filteredDataset}
				control={fieldPickerControl}
				updateSelectedRows={updateSelectedRows}
				controller={controller}
			/>
		);

		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM

		// disable a set of icons
		wrapper.find(".filter-list-data-integer-enabled-icon").simulate("click", { type: "integer" });
		wrapper.find(".filter-list-data-string-enabled-icon").simulate("click", { type: "string" });
		wrapper.find(".filter-list-data-timestamp-enabled-icon").simulate("click", { type: "timestamp" });
		wrapper.find(".filter-list-data-time-enabled-icon").simulate("click", { type: "time" });
		wrapper.find(".filter-list-data-date-enabled-icon").simulate("click", { type: "date" });
		wrapper.update();
		expect(wrapper.find(".filter-list-data-integer-disabled-icon")).to.have.length(1);
		expect(wrapper.find(".filter-list-data-string-disabled-icon")).to.have.length(1);
		expect(wrapper.find(".filter-list-data-timestamp-disabled-icon")).to.have.length(1);
		expect(wrapper.find(".filter-list-data-time-disabled-icon")).to.have.length(1);
		expect(wrapper.find(".filter-list-data-date-disabled-icon")).to.have.length(1);

		// select the remaining rows
		expect(wrapper.find(".field-picker-data-rows")).to.have.length(2);
		wrapper.find("input[id='field-picker-checkbox-all']").simulate("change", { target: { checked: "true" } });
		wrapper.update();

		//  enable the icons so that we can get a valid count of all selected rows.
		wrapper.find(".filter-list-data-integer-disabled-icon").simulate("click", { type: "integer" });
		wrapper.find(".filter-list-data-string-disabled-icon").simulate("click", { type: "string" });
		wrapper.find(".filter-list-data-timestamp-disabled-icon").simulate("click", { type: "timestamp" });
		wrapper.find(".filter-list-data-time-disabled-icon").simulate("click", { type: "time" });
		wrapper.find(".filter-list-data-date-disabled-icon").simulate("click", { type: "date" });
		wrapper.update();

		// validate the number of rows selected
		const checkBoxs = wrapper.find("Checkbox").filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(checkBoxs).to.have.length(4);
	});

	it("should search correct keyword in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentControlValues={currentControlValues}
				dataModel={filteredDataset}
				control={fieldPickerControl}
				updateSelectedRows={updateSelectedRows}
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
				currentControlValues={currentControlValues}
				dataModel={filteredDataset}
				control={fieldPickerControl}
				updateSelectedRows={updateSelectedRows}
				controller={controller}
			/>
		);
		wrapper.find("input[id='field-picker-checkbox-all']").simulate("change", { target: { checked: "true" } });
		wrapper.update();

		// with intl support wrapper.state() does not work.
		// looking for equivalent confirmation in the DOM

		const checkBoxs = wrapper.find("Checkbox").filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name"));
		expect(checkBoxs).to.have.length(filteredDataset[0].fields.length);
	});

	it("should add additional field to newControlValues in `FieldPicker`", () => {
		const wrapper = mountWithIntl(
			<FieldPicker
				key="field-picker-control"
				closeFieldPicker={closeFieldPicker}
				currentControlValues={currentControlValues}
				dataModel={filteredDataset}
				control={fieldPickerControl}
				updateSelectedRows={updateSelectedRows}
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
				currentControlValues={currentControlValues}
				dataModel={filteredDataset}
				control={fieldPickerControl}
				updateSelectedRows={updateSelectedRows}
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
		const filterIcons = fieldpicker.find(".filter-list-li-icon");
		expect(filterIcons.length).to.equal(6);

		filterIcons.find(".filter-list-data-integer-enabled-icon").simulate("click", { type: "integer" });
		filterIcons.find(".filter-list-data-string-enabled-icon").simulate("click", { type: "string" });
		filterIcons.find(".filter-list-data-time-enabled-icon").simulate("click", { type: "time" });
		filterIcons.find(".filter-list-data-double-enabled-icon").simulate("click", { type: "double" });
		filterIcons.find(".filter-list-data-timestamp-enabled-icon").simulate("click", { type: "timestamp" });

		const checkAll = fieldpicker.find("input[id='field-picker-checkbox-all']");
		checkAll.simulate("change", { target: { checked: "true" } });
		expect(checkAll.prop("checked")).to.be.true;

		let checkBoxes = fieldpicker.find("input[type='checkbox']")
			.filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name") && checkBox.prop("data-schema"));
		expect(checkBoxes).to.have.length(1);

		filterIcons.find(".filter-list-data-timestamp-disabled-icon").simulate("click", { type: "timestamp" });
		expect(checkAll.prop("checked")).to.be.false;

		checkAll.simulate("change", { target: { checked: "true" } });
		expect(checkAll.prop("checked")).to.be.true;

		checkBoxes = fieldpicker.find("input[type='checkbox']")
			.filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name") && checkBox.prop("data-schema"));
		expect(checkBoxes).to.have.length(3);

		fieldpicker.find("#properties-apply-button").simulate("click");
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		wrapper.update();
		const fieldSummary = wrapper.find(".control-summary-table");
		expect(fieldSummary).to.have.length(1);
		expect(fieldSummary.find(".control-summary-list-rows")).to.have.length(3);
		expect(fieldSummary.find(".control-summary-list-rows").at(0)
			.text()
			.trim()).to.equal("data_1.Timestamp");
		expect(fieldSummary.find(".control-summary-list-rows").at(1)
			.text()
			.trim()).to.equal("data_2.Timestamp");
		expect(fieldSummary.find(".control-summary-list-rows").at(2)
			.text()
			.trim()).to.equal("Date");
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
			.filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name") && checkBox.prop("data-schema"));
		expect(checkBoxes).to.have.length(5);

		fieldpicker.find("#properties-apply-button").simulate("click");
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		wrapper.update();
		const fieldSummary = wrapper.find(".control-summary-table");
		expect(fieldSummary).to.have.length(1);
		expect(fieldSummary.find(".control-summary-list-rows")).to.have.length(5);
		expect(fieldSummary.find(".control-summary-list-rows").at(0)
			.text()
			.trim()).to.equal("0.Time");
		expect(fieldSummary.find(".control-summary-list-rows").at(1)
			.text()
			.trim()).to.equal("data_1.Time");
		expect(fieldSummary.find(".control-summary-list-rows").at(2)
			.text()
			.trim()).to.equal("data_1.Timestamp");
		expect(fieldSummary.find(".control-summary-list-rows").at(3)
			.text()
			.trim()).to.equal("data_2.Time");
		expect(fieldSummary.find(".control-summary-list-rows").at(4)
			.text()
			.trim()).to.equal("data_2.Timestamp");
	});

	it("should be able to search 'time', filter 'time', and selct all fields", () => {
		const search = fieldpicker.find("#flexible-table-search");
		search.simulate("change", { target: { value: "time" } });

		fieldpicker.find(".filter-list-data-time-enabled-icon").simulate("click", { type: "time" });

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
			.filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name") && checkBox.prop("data-schema"));
		expect(checkBoxes).to.have.length(2);

		fieldpicker.find("#properties-apply-button").simulate("click");
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		wrapper.update();
		const fieldSummary = wrapper.find(".control-summary-table");
		expect(fieldSummary).to.have.length(1);
		expect(fieldSummary.find(".control-summary-list-rows")).to.have.length(2);
		expect(fieldSummary.find(".control-summary-list-rows").at(0)
			.text()
			.trim()).to.equal("data_1.Timestamp");
		expect(fieldSummary.find(".control-summary-list-rows").at(1)
			.text()
			.trim()).to.equal("data_2.Timestamp");
	});

	it("should be able to select all and display schema.field names correctly in table", () => {
		const checkAll = fieldpicker.find("input[id='field-picker-checkbox-all']");
		checkAll.simulate("change", { target: { checked: "true" } });
		expect(checkAll.prop("checked")).to.be.true;

		const checkBoxes = fieldpicker.find("input[type='checkbox']")
			.filterWhere((checkBox) => checkBox.prop("checked") === true && checkBox.prop("data-name") && checkBox.prop("data-schema"));
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

		propertyUtils.fieldPicker([
			{ "name": "Age", "schema": "0" },
			{ "name": "age", "schema": "0" },
			{ "name": "Age", "schema": "data_1" }
		]);

		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		wrapper.update();
		const fieldSummary = wrapper.find(".control-summary-table");
		expect(fieldSummary).to.have.length(1);
		expect(fieldSummary.find(".control-summary-list-rows")).to.have.length(3);
		expect(fieldSummary.find(".control-summary-list-rows").at(0)
			.text()
			.trim()).to.equal("0.Age");
		expect(fieldSummary.find(".control-summary-list-rows").at(1)
			.text()
			.trim()).to.equal("age");
		expect(fieldSummary.find(".control-summary-list-rows").at(2)
			.text()
			.trim()).to.equal("data_1.Age");
	});
});
