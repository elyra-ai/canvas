/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import ToggletextControl from "../../../src/common-properties/editor-controls/toggletext-control.jsx";
import { shallow, mount } from "enzyme";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end

const control = {
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
const columnDef = {
	"name": "sort_order",
	"label": {
		"text": "Order"
	},
	"visible": true,
	"width": 16,
	"controlType": "toggletext",
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
};

const controlId = "keys";

const controlData = [
	["Na", "Ascending"],
	["Drug", "Descending"],
	["Sex", "Ascending"],
	["Age", "Descending"],
	["BP", "Ascending"],
	["Cholesterol", "Ascending"]
];
const rowIndex = 0;
const colIndex = 1;
const value = "Ascending";

function valueAccessor() {
	return ["Ascending"];
}

function updateControlValue(id, controlValue) {
	expect(id).to.equal(controlId);
}
function setCurrentControlValueSelected(targetControl, controlValue, noopUpdateControlValue, selectedRows) {
	expect(controlValue.length).to.equal(6);
	expect(controlValue[rowIndex][colIndex]).to.equal("Descending");
}

function getSelectedRows() {
	return [];
}

describe("ToggletextControl renders correctly in table mode", () => {

	it("props should have been defined", () => {
		const wrapper = shallow(
			<ToggletextControl
				rowIndex={rowIndex}
				control={control}
				values={columnDef.values}
				valueLabels={columnDef.valueLabels}
				valueIcons={columnDef.valueIcons}
				controlValue={controlData}
				value={value}
				updateControlValue={updateControlValue}
				columnIndex={colIndex}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				getSelectedRows={getSelectedRows}
				tableControl
			/>
		);

		expect(wrapper.rowIndex).to.be.defined;
		expect(wrapper.control).to.be.defined;
		expect(wrapper.columnDef).to.be.defined;
		expect(wrapper.controlValue).to.be.defined;
		expect(wrapper.value).to.be.defined;
		expect(wrapper.updateControlValue).to.be.defined;
		expect(wrapper.columnIndex).to.be.defined;
		expect(wrapper.setCurrentControlValueSelected).to.be.defined;
		expect(wrapper.getSelectedRows).to.be.defined;
		expect(wrapper.tableControl).to.be.defined;
	});

	it("should render a `ToggletextControl`", () => {
		const wrapper = mount(
			<ToggletextControl
				rowIndex={rowIndex}
				control={control}
				values={columnDef.values}
				valueLabels={columnDef.valueLabels}
				valueIcons={columnDef.valueIcons}
				controlValue={controlData}
				value={value}
				updateControlValue={updateControlValue}
				columnIndex={colIndex}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				getSelectedRows={getSelectedRows}
				tableControl
			/>
		);
		const input = wrapper.find(".toggletext_control");
		expect(input).to.have.length(1);
	});

	it("should set correct state value in `ToggletextControl`", () => {
		const wrapper = mount(
			<ToggletextControl
				rowIndex={rowIndex}
				control={control}
				values={columnDef.values}
				valueLabels={columnDef.valueLabels}
				valueIcons={columnDef.valueIcons}
				controlValue={controlData}
				value={value}
				updateControlValue={updateControlValue}
				columnIndex={colIndex}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				getSelectedRows={getSelectedRows}
				tableControl
			/>
		);
		const input = wrapper.find(".toggletext_icon");
		expect(input).to.have.length(1);
		input.simulate("click");
		// The check on the correct value is in setCurrentControlValueSelected()
	});

});
describe("ToggletextControl renders correctly not in table", () => {

	it("props should have been defined", () => {
		const wrapper = shallow(
			<ToggletextControl
				control={control}
				values={columnDef.values}
				valueLabels={columnDef.valueLabels}
				valueIcons={columnDef.valueIcons}
				controlValue={controlData}
				updateControlValue={updateControlValue}
				valueAccessor={valueAccessor}
			/>
		);


		expect(wrapper.control).to.be.defined;
		expect(wrapper.columnDef).to.be.defined;
		expect(wrapper.controlValue).to.be.defined;
		expect(wrapper.valueAccessor).to.be.defined;
		expect(wrapper.updateControlValue).to.be.defined;
	});

	it("should render a `ToggletextControl`", () => {
		const wrapper = mount(
			<ToggletextControl
				control={control}
				values={columnDef.values}
				valueLabels={columnDef.valueLabels}
				valueIcons={columnDef.valueIcons}
				controlValue={controlData}
				updateControlValue={updateControlValue}
				valueAccessor={valueAccessor}
			/>
		);
		const input = wrapper.find(".toggletext_control");
		expect(input).to.have.length(1);
	});

	it("should set correct state value in `ToggletextControl`", () => {
		const wrapper = mount(
			<ToggletextControl
				control={control}
				values={columnDef.values}
				valueLabels={columnDef.valueLabels}
				valueIcons={columnDef.valueIcons}
				controlValue={controlData}
				updateControlValue={updateControlValue}
				valueAccessor={valueAccessor}
			/>
		);
		const input = wrapper.find(".toggletext_icon");
		input.simulate("click");
		expect(wrapper.state().controlValue).to.equal("Descending");
	});

});
