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
import { render } from "../../_utils_/mount-utils.js";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import Controller from "./../../../src/common-properties/properties-controller";
import { Provider } from "react-redux";
import { expect } from "chai";
import { cleanup, fireEvent } from "@testing-library/react";
import sinon from "sinon";
import SliderControl from "./../../../src/common-properties/controls/slider";
import sliderParamDef from "../../test_resources/paramDefs/slider_paramDef.json";

describe("SliderControl renders correctly", () => {

	const propertyId = {
		name: "test-slider"
	};

	const controller = new Controller();

	const control = {
		name: "test-slider",
		controlType: "slider",
		minValue: 1,
		maxValue: 10,
		increment: 1,
		light: true
	};

	propertyUtilsRTL.setControls(controller, [control]);

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});


	it("renders a Slider component", () => {
		const { container } = render(
			<Provider store = {
				controller.getStore()
			}
			>
				<SliderControl control = {control}
					propertyId = {propertyId}
					controller = {controller}
					controlItem = "Slider Label"
				/>
			</Provider>
		);
		expect(container.querySelectorAll(".properties-slider")).to.have.length(1);
	});

	it("renders slider label correctly", () => {
		const { container } = render(
			<Provider store = {
				controller.getStore()
			}
			>
				<SliderControl control = {control}
					propertyId = {propertyId}
					controller = {controller}
					controlItem = "Slider Label"
				/>
			</Provider>
		);
		const label = container.querySelector("label");
		expect(label.textContent).to.equal("Slider Label");
	});

	it("renders Slider with readonly control", () => {
		control.readOnly = true;
		const { container } = render(
			<Provider store = {
				controller.getStore()
			}
			>
				<SliderControl control = {control}
					propertyId = {propertyId}
					controller = {controller}
					controlItem = "Slider Label"
					readOnly
				/>
			</Provider>
		);
		expect(container.querySelectorAll("div.cds--slider--readonly")).to.have.length(1);
	});

	it("handles change event correctly", () => {
		const { container } = render(
			<Provider store = {
				controller.getStore()
			}
			>
				<SliderControl control = {control}
					propertyId = {propertyId}
					controller = {controller}
					controlItem = "Slider Label"
				/>
			</Provider>
		);

		// Simulate a change event on the Slider
		const sliderTextInput = container.querySelector(".cds--slider-text-input-wrapper").querySelector("input");
		fireEvent.change(sliderTextInput, { target: { value: 7 } });

		const handleChangeSpy = sinon.spy(controller, "updatePropertyValue");

		// Ensure that handleChange method is called with the correct arguments
		expect(handleChangeSpy.calledOnceWithExactly(propertyId, 7)).to.be.false;

		// Clean up the spy
		handleChangeSpy.restore();
	});

	it("When minValue and maxValue are not provided, verify default min and max values are set", () => {
		const controlWithLabels = {
			name: "test-slider",
			minValue: null,
			maxValue: null,
			increment: null,
			light: true
		};

		const { container } = render(
			<Provider store = {
				controller.getStore()
			}
			>
				<SliderControl control = {controlWithLabels}
					propertyId = {propertyId}
					controller = {controller}
					controlItem = "Slider Label"
				/>
			</Provider>
		);

		const sliderRange = container.querySelectorAll("span.cds--slider__range-label");
		const minRange = Number(sliderRange[0].textContent);
		expect(minRange).to.equal(0);

		const maxRange = Number(sliderRange[1].textContent);
		expect(maxRange).to.equal(10);
	});

	it("shows minValue and maxValue correctly", () => {
		const controlWithLabels = {
			name: "test-slider",
			minValue: 1,
			maxValue: 10,
			increment: 1,
			light: true
		};

		const { container } = render(
			<Provider store = {
				controller.getStore()
			}
			>
				<SliderControl control = {controlWithLabels}
					propertyId = {propertyId}
					controller = {controller}
					controlItem = "Slider Label"
				/>
			</Provider>
		);

		const sliderRange = container.querySelectorAll("span.cds--slider__range-label");
		const minRange = Number(sliderRange[0].textContent);
		expect(minRange).to.equal(controlWithLabels.minValue);

		const maxRange = Number(sliderRange[1].textContent);
		expect(maxRange).to.equal(controlWithLabels.maxValue);
	});
});

describe("error messages renders correctly for slider controls", () => {
	let wrapper;
	let container;

	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(sliderParamDef);
		wrapper = renderedObject.wrapper;
		container = wrapper.container;
	});
	afterEach(() => {
		cleanup();
	});

	it("slider component should have correct classnames", () => {
		expect(container.querySelectorAll("div.properties-slider")).to.have.length(8);
	});

	it("shows error message for slider component", () => {
		const slider = container.querySelector("div[data-id='properties-ctrl-slider_error']");

		// Verify min and max range
		const sliderRange = slider.querySelectorAll("span.cds--slider__range-label");
		const minRange = Number(sliderRange[0].textContent);
		expect(minRange).to.equal(10);

		const maxRange = Number(sliderRange[1].textContent);
		expect(maxRange).to.equal(100);

		// Set the value of slider more than max range
		const sliderTextInput = slider.querySelector(".cds--slider-text-input-wrapper").querySelector("input");
		fireEvent.change(sliderTextInput, { target: { value: 117 } });

		// Verify error is shown
		const errorDiv = slider.querySelector("div.properties-validation-message");
		expect(errorDiv).to.exist;
		expect(errorDiv.textContent).to.equal("Needs to be less than 100");
	});
});
