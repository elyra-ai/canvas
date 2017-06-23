/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import TextAreaControl from "../../../src/common-properties/editor-controls/textarea-control.jsx";
import { CHARACTER_LIMITS } from "../../../src/common-properties/constants/constants.js";
import { shallow, mount } from "enzyme";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end


const control = {
	charLimit: 256,
	additionalText: "Add comment"
};
const control2 = {
};
const controlId = "test-areafield";
const validationDefinitions = [];
const controlStates = {};

function valueAccessor() {
	return ["Test value"];
}

describe("textfield-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = shallow(
			<TextAreaControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
			/>
		);

		expect(wrapper.control).to.be.defined;
		expect(wrapper.controlStates).to.be.defined;
		expect(wrapper.key).to.be.defined;
		expect(wrapper.ref).to.be.defined;
		expect(wrapper.valueAccessor).to.be.defined;
		expect(wrapper.validationDefinitions).to.be.defined;
	});

	it("should render a `TextAreaControl`", () => {
		const wrapper = mount(
			<TextAreaControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
			/>
		);
		const input = wrapper.find(".text");
		expect(input).to.have.length(1);
	});

	it("should set correct state value in `TextAreaControl`", () => {
		const wrapper = mount(
			<TextAreaControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
			/>
		);
		const input = wrapper.find(".text");
		input.simulate("change", { target: { value: "My new value" } });
		expect(wrapper.state().controlValue).to.equal("My new value");
	});

	it("should set correct maxLength in `TextAreaControl`", () => {
		const wrapper = mount(
			<TextAreaControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).maxLength).to.equal(control.charLimit);
	});

	it("should set correct control type in `TextAreaControl`", () => {
		const wrapper = mount(
			<TextAreaControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).type).to.equal("textarea");
	});

	it("should set placeholder text in `TextAreaControl`", () => {
		const wrapper = mount(
			<TextAreaControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).placeholder).to.equal(control.additionalText);
	});

	it("should set maxLength correctly without charLimit in `TextAreaControl`", () => {
		const wrapper = mount(
			<TextAreaControl control={control2}
				key={controlId}
				ref={controlId}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).maxLength).to.equal(CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_AREA);
	});
});
