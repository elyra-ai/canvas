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
import Controller from "../../../src/common-properties/properties-controller";

const controller = new Controller();

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

const propertyId = { name: "test-numberfield" };

function setPropertyValue() {
	controller.setPropertyValues(
		{ "test-numberfield": 1 }
	);
}

describe("numberfield-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `NumberfieldControl`", () => {
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='number']");
		expect(input).to.have.length(1);
	});

	it("should set correct state value in `NumberfieldControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='number']");
		input.simulate("change", { target: { value: 44 } });
		expect(controller.getPropertyValue(propertyId)).to.equal(44);
	});

	it("should set correct state null in `NumberfieldControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='number']");
		input.simulate("change", { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(null);
	});

	it("should set correct control type in `NumberfieldControl`", () => {
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='number']");
		expect(input.get(0).type).to.equal("number");
	});

	it("should set placeholder text in `NumberfieldControl`", () => {
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
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
		const controlObj = (<NumberfieldControl
			control={control2}
			controller={controller}
			propertyId={propertyId}
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
