/*
 * Copyright 2017-2023 Elyra Authors
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
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import spinnerParamDef from "../../test_resources/paramDefs/spinner_paramDef.json";
import { fireEvent, waitFor } from "@testing-library/react";


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
propertyUtilsRTL.setControls(controller, [control, control2, control3]);
const propertyId = { "name": "spinner_int" };
const propertyId2 = { "name": "spinner_dbl" };
const propertyId3 = { "name": "spinner_default" };

const mockSpinner = jest.fn();
jest.mock("../../../src/common-properties/controls/numberfield",
	() => (props) => mockSpinner(props)
);

mockSpinner.mockImplementation((props) => {
	const SpinnerComp = jest.requireActual(
		"../../../src/common-properties/controls/numberfield",
	).default;
	return <SpinnerComp {...props} />;
});

describe("spinner-control renders correctly", () => {

	it("props should have been defined", () => {
		render(
			<SpinnerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expectJest(mockSpinner).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("spinner-control should have steppers", () => {
		const wrapper = render(
			<SpinnerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.container.querySelectorAll(".cds--number--nosteppers")).to.have.length(0);
		expect(wrapper.container.querySelectorAll(".cds--number__controls")).to.have.length(1);
	});

	it("should set correct state value when integer increment in `SpinnerControl`", () => {
		const wrapper = render(
			<SpinnerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const input = container.querySelectorAll("input[type='number']");
		expect(input).to.have.length(1);
		fireEvent.change(input[0], { target: { value: "44" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(44);

		const inputIncrement = container.querySelectorAll("button")[1];
		expect(inputIncrement).to.exist;
		fireEvent.click(inputIncrement);
		expect(controller.getPropertyValue(propertyId)).to.equal(45);
	});

	it("should set correct state value when integer decrement in `SpinnerControl`", () => {
		const wrapper = render(
			<SpinnerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input[type='number']");
		fireEvent.change(input, { target: { value: "44" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(44);

		const inputDecrement = container.querySelectorAll("button")[0];
		expect(inputDecrement).to.exist;
		fireEvent.click(inputDecrement);
		expect(controller.getPropertyValue(propertyId)).to.equal(43);
	});

	it("should set correct state value when double increment in `SpinnerControl`", () => {
		const wrapper = render(
			<SpinnerControl
				store={controller.getStore()}
				control={control2}
				controller={controller}
				propertyId={propertyId2}
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input[type='number']");
		fireEvent.change(input, { target: { value: "44.3" } });
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.3);

		const inputIncrement = container.querySelectorAll("button")[1];
		expect(inputIncrement).to.exist;
		fireEvent.click(inputIncrement);
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.4);
	});

	it("should set correct state value when double decrement in `SpinnerControl`", () => {
		const wrapper = render(
			<SpinnerControl
				store={controller.getStore()}
				control={control2}
				controller={controller}
				propertyId={propertyId2}
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input[type='number']");
		fireEvent.change(input, { target: { value: "44.5" } });
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.5);

		const inputDecrement = container.querySelectorAll("button")[0];
		expect(inputDecrement).to.exist;
		fireEvent.click(inputDecrement);
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.4);
	});

	it("should set correct state value when complex double increment in `SpinnerControl`", () => {
		control2.increment = 0.0022;
		const wrapper = render(
			<SpinnerControl
				store={controller.getStore()}
				control={control2}
				controller={controller}
				propertyId={propertyId2}
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input[type='number']");
		fireEvent.change(input, { target: { value: "44.6666" } });
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.6666);

		const inputIncrement = container.querySelectorAll("button")[1];
		expect(inputIncrement).to.exist;
		fireEvent.click(inputIncrement);
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.6688);
	});

	it("should set correct state value when complex double decrement in `SpinnerControl`", () => {
		control2.increment = 0.0022;
		const wrapper = render(
			<SpinnerControl
				store={controller.getStore()}
				control={control2}
				controller={controller}
				propertyId={propertyId2}
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input[type='number']");
		fireEvent.change(input, { target: { value: "44.6666" } });
		expect(controller.getPropertyValue(propertyId2)).to.equal(44.6666);

		const inputDecrement = container.querySelectorAll("button")[0];
		expect(inputDecrement).to.exist;
		fireEvent.click(inputDecrement);
		fireEvent.click(inputDecrement);
		fireEvent.click(inputDecrement);
		fireEvent.click(inputDecrement);
		fireEvent.click(inputDecrement);

		expect(controller.getPropertyValue(propertyId2)).to.equal(44.6556);
	});

	it("should set correct state value for default spinner with default increment in `SpinnerControl`", () => {
		const wrapper = render(
			<SpinnerControl
				store={controller.getStore()}
				control={control3}
				controller={controller}
				propertyId={propertyId3}
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input[type='number']");
		fireEvent.change(input, { target: { value: "45" } });
		expect(controller.getPropertyValue(propertyId3)).to.equal(45);

		const inputIncrement = container.querySelectorAll("button")[1];
		expect(inputIncrement).to.exist;
		fireEvent.click(inputIncrement);
		expect(controller.getPropertyValue(propertyId3)).to.equal(46);
	});

});

describe("spinnerControl paramDef render correctly", () => {
	let wrapper;
	let spinnerController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(spinnerParamDef);
		wrapper = renderedObject.wrapper;
		spinnerController = renderedObject.controller;
	});

	it("should have displayed correct text in spinnerControl elements", async() => {
		const { container } = wrapper;
		let labels = container.querySelectorAll(".properties-control-label");
		expect(labels[0].textContent).to.equal("Default");
		expect(labels[1].textContent).to.equal("Integer");
		expect(labels[2].textContent).to.equal("Double");
		expect(labels[3].textContent).to.equal("Undefined");
		expect(labels[4].textContent).to.equal("Null");
		expect(labels[5].textContent).to.equal("Placeholder text");
		expect(labels[6].textContent).to.equal("Random");
		expect(labels[7].textContent).to.equal("Error");
		expect(labels[8].textContent).to.equal("Warning");
		expect(labels[9].textContent).to.equal("Disable 'Spinner Disabled'");
		expect(labels[10].textContent).to.equal("Spinner Disabled");
		expect(labels[11].textContent).to.equal("Hide 'Spinner Hidden'");

		spinnerController.updatePropertyValue({ name: "hide" }, false);

		await waitFor(() => {
			labels = container.querySelectorAll("label.properties-control-label");
			expect(labels[12].textContent).to.equal("Spinner Hidden");
		});

		// Spinner Disabled and Spinner Hidden should not be displayed
		const controlDisabledLabeled = container.querySelectorAll(".properties-control-label-disabled");
		controlDisabledLabeled.forEach((label) => {
			const displayStyle = label.style.display;
			expect(displayStyle).to.equal("none");
		});
	});
});

describe("spinner classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(spinnerParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("spinner should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".spinner-control-class")).to.have.length(1);
	});
});
