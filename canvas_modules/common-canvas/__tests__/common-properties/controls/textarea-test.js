/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import TextAreaControl from "../../../src/common-properties/controls/textarea";
import { CHARACTER_LIMITS } from "../../../src/common-properties/constants/constants.js";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";

const controller = new Controller();

const control = {
	name: "test-textarea",
	charLimit: 256,
	additionalText: "Add comment",
	valueDef: {
		isList: false
	}
};
const control2 = {
};
const propertyId = { name: "test-textarea" };
propertyUtils.setControls(controller, [control]);

function setPropertyValue() {
	controller.setPropertyValues(
		{ "test-textarea": "Test value" }
	);
}

describe("textarea-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<TextAreaControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `TextAreaControl`", () => {
		const wrapper = mount(
			<TextAreaControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		expect(input).to.have.length(1);
	});

	it("should set correct state value in `TextAreaControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<TextAreaControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});

	it("should set correct maxLength in `TextAreaControl`", () => {
		const wrapper = mount(
			<TextAreaControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).maxLength).to.equal(control.charLimit);
	});

	it("should set correct control type in `TextAreaControl`", () => {
		const wrapper = mount(
			<TextAreaControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).type).to.equal("textarea");
	});

	it("should set placeholder text in `TextAreaControl`", () => {
		const wrapper = mount(
			<TextAreaControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).placeholder).to.equal(control.additionalText);
	});

	it("should set maxLength correctly without charLimit in `TextAreaControl`", () => {
		const wrapper = mount(
			<TextAreaControl
				control={control2}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).maxLength).to.equal(CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_AREA);
	});
});
