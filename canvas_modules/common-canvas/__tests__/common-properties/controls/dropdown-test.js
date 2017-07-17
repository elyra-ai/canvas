/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import OneofselectControl from "../../../src/common-properties/editor-controls/oneofselect-control.jsx";
import { shallow, mount } from "enzyme";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end

const control = {
	"name": "method",
	"label": {
		"text": "Merge method"
	},
	"separateLabel": true,
	"controlType": "oneofselect",
	"valueDef": {
		"propType": "string",
		"isList": false,
		"isMap": false
	},
	"values": [
		"Order",
		"Keys",
		"Condition",
		"Gtt"
	],
	"valueLabels": [
		"Order",
		"Keys",
		"Condition",
		"Ranked condition"
	]
};

const columnDef = {
	"values": [
		"Order",
		"Keys",
		"Condition",
		"Gtt"
	],
	"valueLabels": [
		"Order",
		"Keys",
		"Condition",
		"Ranked condition"
	]
};

const controlData = [
	["Order", "Order"],
	["Keys", "Keys"],
	["Condition", "Condition"],
	["Gtt", "Ranked condition"]
];

const rowIndex = 0;
const colIndex = 1;
const value = "Order";

function valueAccessor() {
	return [];
}

function updateControlValue() {
	return [];
}

function setCurrentControlValueSelected(targetControl, controlValue, noopUpdateControlValue, selectedRows) {
	expect(controlValue.length).to.equal(4);
	expect(controlValue[rowIndex][colIndex]).to.equal("Order");
}

const selectedRows = [];

describe("DropdownControl renders correctly in not table", () => {

	it("props should have been defined", () => {
		const wrapper = shallow(
			<OneofselectControl
				control={control}
				valueAccessor = {valueAccessor}
			/>
		);

		expect(wrapper.control).to.be.defined;
		expect(wrapper.valueAccessor).to.be.defined;
	});

	it("should render a DropdownControl", () => {
		const wrapper = mount(
			<OneofselectControl
				control={control}
				valueAccessor = {valueAccessor}
			/>
		);
		const input = wrapper.find(".Dropdown-control-panel");
		expect(input).to.have.length(1);
	});

});

describe("DropdownControl renders correctly in table", () => {

	it("props should have been defined", () => {
		const wrapper = shallow(
			<OneofselectControl
				control={control}
				valueAccessor = {valueAccessor}
				columnDef = {columnDef}
				rowIndex = {rowIndex}
				colIndex = {colIndex}
				controlValue = {controlData}
				value = {value}
				updateControlValue = {updateControlValue}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				selectedRows={selectedRows}
				tableControl
			/>
		);

		expect(wrapper.control).to.be.defined;
		expect(wrapper.valueAccessor).to.be.defined;
		expect(wrapper.columnDef).to.be.defined;
		expect(wrapper.rowIndex).to.be.defined;
		expect(wrapper.columnIndex).to.be.defined;
		expect(wrapper.controlValue).to.be.defined;
		expect(wrapper.value).to.be.defined;
		expect(wrapper.updateControlValue).to.be.defined;
		expect(wrapper.setCurrentControlValueSelected).to.be.defined;
		expect(wrapper.selectedRows).to.be.defined;
		expect(wrapper.tableControl).to.be.defined;
	});

	it("should render a DropdownControl", () => {
		const wrapper = mount(
			<OneofselectControl
				control={control}
				valueAccessor = {valueAccessor}
				columnDef = {columnDef}
				rowIndex = {rowIndex}
				colIndex = {colIndex}
				controlValue = {controlData}
				value = {value}
				updateControlValue = {updateControlValue}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				selectedRows={selectedRows}
				tableControl
			/>
		);
		const input = wrapper.find(".Dropdown-control-table");
		expect(input).to.have.length(1);
	});

});
