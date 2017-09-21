/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import TextfieldControl from "../../../src/common-properties/editor-controls/textfield-control.jsx";
import { CHARACTER_LIMITS } from "../../../src/common-properties/constants/constants.js";
import { mount } from "enzyme";
import { expect } from "chai";

const control = {
	name: "test-textfield",
	charLimit: 15,
	additionalText: "Enter file name",
	valueDef: {
		isList: false
	}
};
const control2 = {
};
const controlId = "test-textfield";
const value = "value";
const validationDefinitions = {};
const controlStates = {};

function valueAccessor() {
	return ["Test value"];
}

function updateControlValue(id, controlValue) {
	expect(id).to.equal(controlId);
}

describe("textfield-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<TextfieldControl
				control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
				value={value}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controlStates")).to.equal(controlStates);
		expect(wrapper.prop("valueAccessor")).to.equal(valueAccessor);
		expect(wrapper.prop("validationDefinitions")).to.equal(validationDefinitions);
		expect(wrapper.prop("value")).to.equal(value);
	});

	it("should render a `TextfieldControl`", () => {
		const wrapper = mount(
			<TextfieldControl control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
				value={value}
			/>
		);
		const input = wrapper.find(".text");
		expect(input).to.have.length(1);
	});

	it("should set correct state value in `TextfieldControl`", () => {
		const wrapper = mount(
			<TextfieldControl control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
				value={value}
			/>
		);
		const input = wrapper.find(".text");
		input.simulate("change", { target: { value: "My new value" } });
		expect(wrapper.state().controlValue).to.equal("My new value");
	});

	it("should set correct maxLength in `TextfieldControl`", () => {
		const wrapper = mount(
			<TextfieldControl control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
				value={value}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).maxLength).to.equal(control.charLimit);
	});

	it("should set correct control type in `TextfieldControl`", () => {
		const wrapper = mount(
			<TextfieldControl control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
				value={value}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).type).to.equal("text");
	});

	it("should set placeholder text in `TextfieldControl`", () => {
		const wrapper = mount(
			<TextfieldControl control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
				value={value}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).placeholder).to.equal(control.additionalText);
	});

	it("should set maxLength correctly without charLimit in `TextfieldControl`", () => {
		const wrapper = mount(
			<TextfieldControl control={control2}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
				value={value}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).maxLength).to.equal(CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_FIELD);
	});
});
