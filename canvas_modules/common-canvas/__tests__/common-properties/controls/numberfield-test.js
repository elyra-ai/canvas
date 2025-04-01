/*
 * Copyright 2017-2025 Elyra Authors
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
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import NumberfieldControl from "../../../src/common-properties/controls/numberfield";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";
import numberfieldParamDef from "../../test_resources/paramDefs/numberfield_paramDef.json";
import { fireEvent, waitFor } from "@testing-library/react";

const mockNumberfieldControl = jest.fn();
jest.mock("../../../src/common-properties/controls/numberfield",
	() => (props) => mockNumberfieldControl(props)
);

mockNumberfieldControl.mockImplementation((props) => {
	const NumberfieldControlComp = jest.requireActual(
		"../../../src/common-properties/controls/numberfield",
	).default;
	return <NumberfieldControlComp {...props} />;
});

beforeAll(() => {
	// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
	Element.prototype.getBoundingClientRect = jest.fn()
		.mockReturnValue({
			height: 1000, // This is used to measure the panel height
			width: 1000
		});
});

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

	propertyUtilsRTL.setControls(controller, [control]);

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-number": 20 }
		);
	});

	it("numberfield props should have been defined", () => {
		render(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expectJest(mockNumberfieldControl).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("numberfield should render", () => {
		const wrapper = render(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.container.querySelectorAll("input[type='number']")).to.have.length(1);
	});

	it("numberfield should NOT have steppers", () => {
		const wrapper = render(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		expect(container.querySelectorAll(".cds--number--nosteppers")).to.have.length(1);
		expect(container.querySelectorAll(".cds--number__controls")).to.have.length(0);
	});

	it("numberfield should set placeholder text", () => {
		const wrapper = render(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input[type='number']");
		expect(input.getAttribute("placeholder")).to.equal(control.additionalText);
	});

	it("numberfield renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = render(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-number']");
		expect(textWrapper.querySelector("input").disabled).to.equal(true);
	});

	it("numberfield renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = render(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-number']");
		expect(textWrapper.className.includes("hide")).to.equal(true);
	});

	it("numberfield renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = render(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-number']");
		const messageWrapper = textWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);
	});

	it("NumberfieldControl helperText is rendered correctly", () => {
		control.helperText = "NumberfieldControl helperText";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const helpTextWrapper = wrapper.container.querySelector("div[data-id='properties-test-number']");
		expect(helpTextWrapper.querySelector("div.cds--form__helper-text").textContent).to.equal(control.helperText);
	});

	it("NumberfieldControl readOnly is rendered correctly", () => {
		control.readOnly = true;
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<NumberfieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				readOnly
			/>
		);
		const readOnlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-number']");
		expect(readOnlyWrapper.querySelector("input").readOnly).to.equal(control.readOnly);
	});
});

describe("numberfield control works correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render an integer number correctly", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.container.querySelector("div[data-id='properties-number_int'] input");
		expect(integerNumber).not.to.be.undefined;
		expect(controller.getPropertyValue(numPropertyId)).to.equal(10);
	});
	it("should allow an integer value to be set in an integer field", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.container.querySelector("div[data-id='properties-number_int'] input");
		fireEvent.change(integerNumber, { target: { value: "44" } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(44);
	});
	it("should allow a null value to be set in an integer field", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.container.querySelector("div[data-id='properties-number_int'] input");
		fireEvent.change(integerNumber, { target: { value: "" } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(null);
	});
	// TODO this should throw an error instead
	it("should not allow a double value to be set in an integer field", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.container.querySelector("div[data-id='properties-number_int'] input");
		fireEvent.change(integerNumber, { target: { value: "4.4" } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(4.4);
	});
	it("should render an double number correctly", () => {
		const numPropertyId = { name: "number_dbl" };
		const doubleNumber = wrapper.container.querySelector("div[data-id='properties-number_dbl'] input");
		expect(doubleNumber).not.to.be.undefined;
		expect(controller.getPropertyValue(numPropertyId)).to.equal(11.012);
	});
	it("should allow an double value to be set in an double field", () => {
		const numPropertyId = { name: "number_dbl" };
		const doubleNumber = wrapper.container.querySelector("div[data-id='properties-number_dbl'] input");
		fireEvent.change(doubleNumber, { target: { value: "4.04" } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(4.04);
	});
	it("should allow a delete of a decimal value to be set in a double field", () => {
		// this is a special case.  It simulates a double number ".3" delete with a backspace
		// it is a particular case handled in the code.
		const numPropertyId = { name: "number_dbl" };
		const doubleNumber = wrapper.container.querySelector("div[data-id='properties-number_dbl'] input");
		doubleNumber.setAttribute("badInput", false);
		fireEvent.change(doubleNumber, { target: { value: "0.3" } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(0.3);
		doubleNumber.setAttribute("badInput", true);
		fireEvent.change(doubleNumber, { target: { value: "0.3" } });
		expect(controller.getPropertyValue(numPropertyId)).to.equal(0.3);
	});
	// input has unexpected behavior
	it.skip("should not allow a bad value to be set in a field", async() => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.container.querySelector("div[data-id='properties-number_int'] input");
		fireEvent.change(integerNumber, { target: { value: "" } });
		integerNumber.setAttribute("badInput", true);
		await waitFor(() => {
			expect(controller.getPropertyValue(numPropertyId)).to.equal(10);
		});
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
		const category = wrapper.container.querySelectorAll(".properties-category-content")[0]; // values category
		const generator = category.querySelectorAll("button.properties-number-generator");
		expect(generator).to.have.length(2);
	});
	it("should click on generator to create a new number", () => {
		const category = wrapper.container.querySelectorAll(".properties-category-content")[0]; // values category
		const generator = category.querySelectorAll("button.properties-number-generator")[0]; // NumberGenerator default
		const numPropertyId = { name: "number_random" };
		const oldValue = controller.getPropertyValue(numPropertyId);
		fireEvent.click(generator);
		const newValue = controller.getPropertyValue(numPropertyId);
		expect(oldValue).not.equal(newValue);
	});
	it("should have displayed random generator with default label", () => {
		const category = wrapper.container.querySelectorAll(".properties-category-content")[0]; // values category
		const generator = category.querySelector("div[data-id='properties-ctrl-number_random']");
		const generatorAriaLabelledBy = generator.querySelector("button.properties-number-generator").getAttribute("aria-labelledby");
		expect(generator.querySelector(`span[id='${generatorAriaLabelledBy}']`).textContent).to.equal("NumberGenerator default");
	});
	it("should have displayed random generator with resource_key label", () => {
		const category = wrapper.container.querySelectorAll(".properties-category-content")[0]; // values category
		const generator = category.querySelector("div[data-id='properties-ctrl-number_random_resource_key']");
		const generatorAriaLabelledBy = generator.querySelector("button.properties-number-generator").getAttribute("aria-labelledby");
		expect(generator.querySelector(`span[id='${generatorAriaLabelledBy}']`).textContent).to.equal("NumberGenerator resource_key");
	});
	it("numberfield control in Table cell should NOT have steppers", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "numberfield-table-summary");
		const numberfieldInTable = wrapper.container.querySelector(".properties-table-cell-control").querySelectorAll(".properties-numberfield");
		numberfieldInTable.forEach((numberfieldInTableCell) => {
			expect(numberfieldInTableCell.querySelectorAll(".cds--number--nosteppers")).to.have.length(1);
			expect(numberfieldInTableCell.querySelectorAll(".cds--number__controls")).to.have.length(0);
		});
	});
	// input has unexpected behavior
	it.skip("should display error when invalid number is entered", async() => {
		const numPropertyId = { name: "number_int" };
		expect(controller.getPropertyValue(numPropertyId)).to.equal(10);
		const integerNumber = wrapper.container.querySelector("div[data-id='properties-number_int'] input");
		fireEvent.change(integerNumber, { target: { value: "44e+-" } });
		// Verify error is displayed
		await waitFor(() => {
			const intergerWrapper = wrapper.container.querySelector("div[data-id='properties-number_int']");
			const messageWrapper = intergerWrapper.querySelectorAll("div.cds--form-requirement");
			expect(messageWrapper).to.have.length(1);
			expect(messageWrapper[0].textContent).to.eql("Number is not valid.");
			// Verify property value is NOT updated to invalid number
			expect(controller.getPropertyValue(numPropertyId)).to.equal(10);
		});
	});
});

describe("numberfield classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
		Element.prototype.getBoundingClientRect = jest.fn()
			.mockReturnValue({
				height: 1000, // This is used to measure the panel height
				width: 1000
			});

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("numberfield should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".numberfield-control-class")).to.have.length(1);
	});

	it("numberfield should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "numberfield-table-summary");
		expect(wrapper.container.querySelectorAll(".table-numberfield-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-on-panel-numberfield-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-subpanel-numberfield-control-class")).to.have.length(1);
	});
});
