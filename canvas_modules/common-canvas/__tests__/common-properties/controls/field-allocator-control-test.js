/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import FieldAllocatorControl from "../../../src/common-properties/editor-controls/field-allocator-control.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end


const control = {
	"name": "targetField",
	"label": {
		"text": "Target column"
	},
	"description": {
		"text": "Select a target column"
	},
	"controlType": "selectcolumn",
	"valueDef": {
		"propType": "string",
		"isList": false,
		"isMap": false,
		"defaultValue": ""
	},
	"separateLabel": true,
	"required": true
};

const dataModel = {
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
		}
	]
};

const emptyDataModel = {
	"fields": []
};

function valueAccessor() {
	return [];
}

describe("field-allocator-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<FieldAllocatorControl
				control={control}
				dataModel={dataModel}
				valueAccessor = {valueAccessor}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("dataModel")).to.equal(dataModel);
		expect(wrapper.prop("valueAccessor")).to.equal(valueAccessor);
	});

	it("should render a not empty FieldAllocatorControl", () => {
		const wrapper = mount(
			<FieldAllocatorControl
				control={control}
				dataModel={dataModel}
				valueAccessor = {valueAccessor}
			/>
		);
		const input = wrapper.find(".Dropdown-control");
		expect(input).to.have.length(1);
	});

	it("should render a empty FieldAllocatorControl", () => {
		const wrapper = mount(
			<FieldAllocatorControl
				control={control}
				dataModel={emptyDataModel}
				valueAccessor = {valueAccessor}
			/>
		);
		const input = wrapper.find(".Dropdown-control");
		expect(input).to.have.length(1);
	});

	it("should render a empty FieldAllocatorControl and update the dropdown value", () => {
		const wrapper = mount(
			<FieldAllocatorControl
				control={control}
				dataModel={emptyDataModel}
				valueAccessor = {valueAccessor}
			/>
		);

		const input = wrapper.find(".Dropdown-control");
		expect(input).to.have.length(1);
		const evt = { value: "Na", label: "Na" };
		input.root.node.handleChange(evt);
		expect(input.root.node.getControlValue()).to.equal("Na");
	});

});
