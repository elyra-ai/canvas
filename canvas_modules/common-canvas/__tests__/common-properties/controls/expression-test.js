/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import Expression from "../../../src/common-properties/editor-controls/expression-control.jsx";
import { CHARACTER_LIMITS } from "../../../src/common-properties/constants/constants.js";
import { mount } from "enzyme";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end


const control = {
	name: "test-areafield",
	charLimit: 256,
	additionalText: "Add expression",
	valueDef: {
		isList: false
	}
};
const control2 = {
};
const controlId = "test-areafield";
const validationDefinitions = {};
const controlStates = {};

function valueAccessor() {
	return ["Test value"];
}

function updateControlValue(id, controlValue) {
	expect(id).to.equal(controlId);
}

describe("expression-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<Expression control={control}
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

	it("should render a `Expression`", () => {
		const wrapper = mount(
			<Expression control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find(".text");
		expect(input).to.have.length(1);
	});

	it("should set correct state value in `Expression`", () => {
		const wrapper = mount(
			<Expression control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find(".text");
		input.simulate("change", { target: { value: "My new value" } });
		expect(wrapper.state().controlValue).to.equal("My new value");
	});

	it("should set correct maxLength in `Expression`", () => {
		const wrapper = mount(
			<Expression control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).maxLength).to.equal(control.charLimit);
	});

	it("should set correct control type in `Expression`", () => {
		const wrapper = mount(
			<Expression control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).type).to.equal("textarea");
	});

	it("should set placeholder text in `Expression`", () => {
		const wrapper = mount(
			<Expression control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).placeholder).to.equal(control.additionalText);
	});

	it("should set maxLength correctly without charLimit in `Expression`", () => {
		const wrapper = mount(
			<Expression control={control2}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).maxLength).to.equal(CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_AREA);
	});
});
