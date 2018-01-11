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
import { mountWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end

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
const filteredDataset = {
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
};
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
			"controlType": "oneofcolumns",
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
		expect(wrapper.find("#flexible-table-container").find(".field-picker-data-rows")).to.have.length(filteredDataset.fields.length);
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
		expect(checkBoxs).to.have.length(filteredDataset.fields.length);
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
