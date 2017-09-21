/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import NumberfieldControl from "../../../src/common-properties/editor-controls/numberfield-control.jsx";
import ControlItem from "../../../src/common-properties/editor-controls/control-item.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end


const control = {
	name: "test-numberfield",
	charLimit: 15,
	additionalText: "Enter number",
	valueDef: {
		isList: false
	}
};
const control2 = {
};
const controlId = "test-numberfield";
const validationDefinitions = {};
const controlStates = {};

function valueAccessor() {
	return 3;
}

function updateControlValue(id, controlValue) {
	expect(id).to.equal(controlId);
}

describe("numberfield-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<NumberfieldControl control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controlStates")).to.equal(controlStates);
		expect(wrapper.prop("valueAccessor")).to.equal(valueAccessor);
		expect(wrapper.prop("validationDefinitions")).to.equal(validationDefinitions);
	});

	it("should render a `NumberfieldControl`", () => {
		const wrapper = mount(
			<NumberfieldControl control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find("[type='number']");
		expect(input).to.have.length(1);
	});

	it("should set correct state value in `NumberfieldControl`", () => {
		const wrapper = mount(
			<NumberfieldControl control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find("[type='number']");
		input.simulate("change", { target: { value: 44 } });
		expect(wrapper.state().controlValue).to.equal(44);
	});

	it("should set correct state null in `NumberfieldControl`", () => {
		const wrapper = mount(
			<NumberfieldControl control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find("[type='number']");
		input.simulate("change", { target: { value: "" } });
		expect(wrapper.state().controlValue).to.equal(null);
	});

	it("should set correct control type in `NumberfieldControl`", () => {
		const wrapper = mount(
			<NumberfieldControl control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find("[type='number']");
		expect(input.get(0).type).to.equal("number");
	});

	it("should set placeholder text in `NumberfieldControl`", () => {
		const wrapper = mount(
			<NumberfieldControl control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find("[type='number']");
		expect(input.get(0).placeholder).to.equal(control.additionalText);
	});

	it("should create a number_generator in `NumberfieldControl`", () => {
		function generateNumber() {
			// const generator = control.label.numberGenerator;
			// const min = generator.range && generator.range.min ? generator.range.min : 10000;
			// const max = generator.range && generator.range.max ? generator.range.max : 99999;
			// const newValue = Math.floor(Math.random() * (max - min + 1) + min);
			// console.log(newValue);
		}
		const controlObj = (<NumberfieldControl control={control2}
			valueAccessor={valueAccessor}
			validationDefinitions={validationDefinitions}
			controlStates={controlStates}
			updateControlValue={updateControlValue}
		/>);
		const numberGenerator = (<label>{"\u00A0\u00A0"}<a className="number-generator" onClick={generateNumber}>
			{"Generate"}
		</a></label>);
		const label = (<div>
			<label className="control-label">{"Test Label"}</label>
			{numberGenerator}
		</div>);
		const wrapper = mount(
			<ControlItem key={"key1"} label={label} control={controlObj} />
		);
		expect(wrapper.find(".number-generator")).to.have.length(1);
	});
});
