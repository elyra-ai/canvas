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
import propertyUtils from "../../_utils_/property-utils";
import NumberfieldControl from "../../../src/common-properties/controls/numberfield";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import numberfieldParamDef from "../../test_resources/paramDefs/numberfield_paramDef.json";


describe("numberfield-control renders correctly", () => {
	const controller = new Controller();
	const control = {
		name: "test-number",
		additionalText: "Enter number",
		valueDef: {
			isList: false
		},
		controlType: "numberfield"
	};
	const propertyId = { name: "test-number" };

	propertyUtils.setControls(controller, [control]);

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-number": 20 }
		);
	});

	it("numberfield props should have been defined", () => {
		const wrapper = mount(
			<NumberfieldControl
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

	it("numberfield should render", () => {
		const wrapper = mount(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("input[type='number']");
		expect(input).to.have.length(1);
	});

	it("numberfield should NOT have steppers", () => {
		const wrapper = mount(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.find(".bx--number--nosteppers")).to.have.length(1);
		expect(wrapper.find(".bx--number__controls")).to.have.length(0);
	});

	it("numberfield should set placeholder text", () => {
		const wrapper = mount(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("input[type='number']");
		expect(input.getDOMNode().placeholder).to.equal(control.additionalText);
	});

	it("numberfield renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-number']");
		expect(textWrapper.find("input").prop("disabled")).to.equal(true);
	});

	it("numberfield renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-number']");
		expect(textWrapper.hasClass("hide")).to.equal(true);
	});

	it("numberfield renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = mount(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-number']");
		const messageWrapper = textWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(1);
	});
});

describe("numberfield control works correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render an integer number correctly", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.find("div[data-id='properties-number_int'] input");
		expect(integerNumber).not.to.be.undefined;
		expect(controller.getPropertyValue(numPropertyId)).to.equal(10);
	});
	it("should allow an integer value to be set in an integer field", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.find("div[data-id='properties-number_int'] input");
		integerNumber.simulate("change", { target: { value: "44" } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(44);
	});
	it("should allow a null value to be set in an integer field", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.find("div[data-id='properties-number_int'] input");
		integerNumber.simulate("change", { target: { value: "", validity: { badInput: false } } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(null);
	});
	// TODO this should throw an error instead
	it("should not allow a double value to be set in an integer field", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.find("div[data-id='properties-number_int'] input");
		integerNumber.simulate("change", { target: { value: "4.4" } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(4.4);
	});
	it("should render an double number correctly", () => {
		const numPropertyId = { name: "number_dbl" };
		const doubleNumber = wrapper.find("div[data-id='properties-number_dbl'] input");
		expect(doubleNumber).not.to.be.undefined;
		expect(controller.getPropertyValue(numPropertyId)).to.equal(11.012);
	});
	it("should allow an double value to be set in an double field", () => {
		const numPropertyId = { name: "number_dbl" };
		const doubleNumber = wrapper.find("div[data-id='properties-number_dbl'] input");
		doubleNumber.simulate("change", { target: { value: "4.04" } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(4.04);
	});
	it("should allow a delete of a decimal value to be set in a double field", () => {
		// this is a special case.  It simulates a double number ".3" delete with a backspace
		// it is a particular case handled in the code.
		const numPropertyId = { name: "number_dbl" };
		const doubleNumber = wrapper.find("div[data-id='properties-number_dbl'] input");
		doubleNumber.simulate("change", { target: { value: "0.3", validity: { badInput: false } } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(0.3);
		doubleNumber.simulate("change", { target: { value: "", validity: { badInput: true } } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(0.3);
	});
	it("should not allow a bad value to be set in a field", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.find("div[data-id='properties-number_int'] input");
		integerNumber.simulate("change", { target: { value: "", validity: { badInput: true } } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(10);
	});
	it("should render the correct default value ", () => {
		const numPropertyId = { name: "number_default" };
		expect(controller.getPropertyValue(numPropertyId)).to.equal(3);
	});
	it("should render the correct zero value default value ", () => {
		const numPropertyId = { name: "number_zero_default" };
		expect(controller.getPropertyValue(numPropertyId)).to.equal(0);
	});
	it("should not render default value if control value is zero", () => {
		const numPropertyId = { name: "number_zero" };
		expect(controller.getPropertyValue(numPropertyId)).to.equal(0);
	});
	it("should render a null value", () => {
		const numPropertyId = { name: "number_null" };
		expect(controller.getPropertyValue(numPropertyId)).to.equal(null);
	});
	it("should render a undefined value as undefined", () => {
		const numPropertyId = { name: "number_undefined" };
		expect(controller.getPropertyValue(numPropertyId)).to.be.undefined;
	});
	it("should have displayed random generator button", () => {
		const category = wrapper.find(".properties-category-content").at(0); // values category
		const generator = category.find("button.properties-number-generator");
		expect(generator).to.have.length(2);
	});
	it("should click on generator to create a new number", () => {
		const category = wrapper.find(".properties-category-content").at(0); // values category
		const generator = category.find("button.properties-number-generator").at(0); // NumberGenerator default
		const numPropertyId = { name: "number_random" };
		const oldValue = controller.getPropertyValue(numPropertyId);
		generator.simulate("click");
		const newValue = controller.getPropertyValue(numPropertyId);
		expect(oldValue).not.equal(newValue);
	});
	it("should have displayed random generator with default label", () => {
		const category = wrapper.find(".properties-category-content").at(0); // values category
		const generator = category.find("div[data-id='properties-ctrl-number_random']").find("button.properties-number-generator");
		expect(generator.text()).to.equal("NumberGenerator default");
	});
	it("should have displayed random generator with resource_key label", () => {
		const category = wrapper.find(".properties-category-content").at(0); // values category
		const generator = category.find("div[data-id='properties-ctrl-number_random_resource_key']").find("button.properties-number-generator");
		expect(generator.text()).to.equal("NumberGenerator resource_key");
	});
	it("numberfield control in Table cell should NOT have steppers", () => {
		propertyUtils.openSummaryPanel(wrapper, "numberfield-table-summary");
		const numberfieldInTable = wrapper.find(".properties-table-cell-control").find(".properties-numberfield");
		numberfieldInTable.forEach((numberfieldInTableCell) => {
			expect(numberfieldInTableCell.find(".bx--number--nosteppers")).to.have.length(1);
			expect(numberfieldInTableCell.find(".bx--number__controls")).to.have.length(0);
		});
	});
	it("should display error when invalid number is entered", () => {
		const numPropertyId = { name: "number_int" };
		expect(controller.getPropertyValue(numPropertyId)).to.equal(10);
		const integerNumber = wrapper.find("div[data-id='properties-number_int'] input");
		integerNumber.simulate("change", { target: { value: "44e+-" } });
		// Verify error is displayed
		const intergerWrapper = wrapper.find("div[data-id='properties-number_int']");
		const messageWrapper = intergerWrapper.find(".bx--form-requirement");
		expect(messageWrapper).to.have.length(1);
		expect(messageWrapper.text()).to.eql("Number is not valid.");
		// Verify property value is NOT updated to invalid number
		expect(controller.getPropertyValue(numPropertyId)).to.equal(10);
	});
});

describe("numberfield classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("numberfield should have custom classname defined", () => {
		expect(wrapper.find(".numberfield-control-class")).to.have.length(1);
	});

	it("numberfield should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "numberfield-table-summary");
		expect(wrapper.find(".table-numberfield-control-class")).to.have.length(1);
		expect(wrapper.find(".table-on-panel-numberfield-control-class")).to.have.length(1);
		expect(wrapper.find(".table-subpanel-numberfield-control-class")).to.have.length(1);
	});
});
