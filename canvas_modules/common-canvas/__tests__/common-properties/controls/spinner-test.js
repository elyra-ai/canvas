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
import SpinnerControl from "../../../src/common-properties/controls/numberfield";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import spinnerParamDef from "../../test_resources/paramDefs/spinner_paramDef.json";


const controller = new Controller();

const control = {
	"name": "spinner_int",
	"label": {
		"text": "Integer"
	},
	"description": {
		"text": "spinner with parameter value set to '10'"
	},
	"controlType": "spinner",
	"valueDef": {
		"propType": "integer",
		"isList": false,
		"isMap": false
	},
	"increment": 1,
	"required": true
};

const control2 = {
	"name": "spinner_dbl",
	"label": {
		"text": "Double"
	},
	"description": {
		"text": "spinner with parameter value set to '11.012'"
	},
	"controlType": "spinner",
	"valueDef": {
		"propType": "double",
		"isList": false,
		"isMap": false
	},
	"increment": 0.1,
	"required": true
};

const control3 = {
	"name": "spinner_default",
	"label": {
		"text": "Integer Default"
	},
	"description": {
		"text": "spinner with parameter value set to '11.012'"
	},
	"controlType": "spinner",
	"valueDef": {
		"propType": "integer",
		"isList": false,
		"isMap": false
	},
	"control": "spinner",
	"required": true
};
propertyUtils.setControls(controller, [control, control2, control3]);
const propertyId = { "name": "spinner_int" };
const propertyId2 = { "name": "spinner_dbl" };
const propertyId3 = { "name": "spinner_default" };

describe("spinner-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<SpinnerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("spinner-control should have steppers", () => {
		const wrapper = mount(
			<SpinnerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.find(".bx--number--nosteppers")).to.have.length(0);
		expect(wrapper.find(".bx--number__controls")).to.have.length(1);
	});

	it("should set correct state value when integer increment in `SpinnerControl`", () => {
		const wrapper = mount(
			<SpinnerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("input[type='number']");
		expect(input).to.have.length(1);
		input.simulate("change", { target: { value: "44" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(44);

		const inputIncrement = wrapper.find("button").at(1);
		expect(inputIncrement).to.have.length(1);
		inputIncrement.simulate("click");
		expect(controller.getPropertyValue(propertyId)).to.equal(45);
	});

	it("should set correct state value when integer decrement in `SpinnerControl`", () => {
		const wrapper = mount(
			<SpinnerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("input[type='number']");
		input.simulate("change", { target: { value: "44" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(44);

		const inputDecrement = wrapper.find("button").at(0);
		expect(inputDecrement).to.have.length(1);
		inputDecrement.simulate("click");
		expect(controller.getPropertyValue(propertyId)).to.equal(43);
	});

	it("should set correct state value when double increment in `SpinnerControl`", () => {
		const wrapper = mount(
			<SpinnerControl
				store={controller.getStore()}
				control={control2}
				controller={controller}
				propertyId={propertyId2}
			/>
		);
		const input = wrapper.find("input[type='number']");
		input.simulate("change", { target: { value: "44.3" } });
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.3);

		const inputIncrement = wrapper.find("button").at(1);
		expect(inputIncrement).to.have.length(1);
		inputIncrement.simulate("click");
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.4);
	});

	it("should set correct state value when double decrement in `SpinnerControl`", () => {
		const wrapper = mount(
			<SpinnerControl
				store={controller.getStore()}
				control={control2}
				controller={controller}
				propertyId={propertyId2}
			/>
		);
		const input = wrapper.find("input[type='number']");
		input.simulate("change", { target: { value: "44.5" } });
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.5);

		const inputDecrement = wrapper.find("button").at(0);
		expect(inputDecrement).to.have.length(1);
		inputDecrement.simulate("click");
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.4);
	});

	it("should set correct state value when complex double increment in `SpinnerControl`", () => {
		control2.increment = 0.0022;
		const wrapper = mount(
			<SpinnerControl
				store={controller.getStore()}
				control={control2}
				controller={controller}
				propertyId={propertyId2}
			/>
		);
		const input = wrapper.find("input[type='number']");
		input.simulate("change", { target: { value: "44.6666" } });
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.6666);

		const inputIncrement = wrapper.find("button").at(1);
		expect(inputIncrement).to.have.length(1);
		inputIncrement.simulate("click");
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.6688);
	});

	it("should set correct state value when complex double decrement in `SpinnerControl`", () => {
		control2.increment = 0.0022;
		const wrapper = mount(
			<SpinnerControl
				store={controller.getStore()}
				control={control2}
				controller={controller}
				propertyId={propertyId2}
			/>
		);
		const input = wrapper.find("input[type='number']");
		input.simulate("change", { target: { value: "44.6666" } });
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.6666);

		const inputDecrement = wrapper.find("button").at(0);
		expect(inputDecrement).to.have.length(1);
		inputDecrement.simulate("click");
		inputDecrement.simulate("click");
		inputDecrement.simulate("click");
		inputDecrement.simulate("click");
		inputDecrement.simulate("click");
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.6556);
	});

	it("should set correct state value for default spinner with default increment in `SpinnerControl`", () => {
		const wrapper = mount(
			<SpinnerControl
				store={controller.getStore()}
				control={control3}
				controller={controller}
				propertyId={propertyId3}
			/>
		);
		const input = wrapper.find("input[type='number']");
		input.simulate("change", { target: { value: "45" } });
		expect(controller.getPropertyValue(propertyId3)).to.equal(45);

		const inputIncrement = wrapper.find("button").at(1);
		expect(inputIncrement).to.have.length(1);
		inputIncrement.simulate("click");
		expect(controller.getPropertyValue(propertyId3)).to.equal(46);
	});

});

describe("spinnerControl paramDef render correctly", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(spinnerParamDef);
	const wrapper = renderedObject.wrapper;
	const spinnerController = renderedObject.controller;

	it("should have displayed correct text in spinnerControl elements", () => {
		let labels = wrapper.find("label.properties-control-label");
		expect(labels.at(0).text()).to.equal("Default");
		expect(labels.at(1).text()).to.equal("Integer");
		expect(labels.at(2).text()).to.equal("Double");
		expect(labels.at(3).text()).to.equal("Undefined");
		expect(labels.at(4).text()).to.equal("Null");
		expect(labels.at(5).text()).to.equal("Placeholder text");
		expect(labels.at(6).text()).to.equal("Random");
		expect(labels.at(7).text()).to.equal("Error");
		expect(labels.at(8).text()).to.equal("Warning");
		expect(labels.at(9).text()).to.equal("Spinner Disabled");
		expect(labels.at(10)).to.have.length(0); // "Spinner Hidden"

		spinnerController.updatePropertyValue({ name: "hide" }, false);
		wrapper.update();
		labels = wrapper.find("label.properties-control-label");
		expect(labels.at(10).text()).to.equal("Spinner Hidden");
	});
});

describe("spinner classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(spinnerParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("spinner should have custom classname defined", () => {
		expect(wrapper.find(".spinner-control-class")).to.have.length(1);
	});
});
