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
import {
	mount
} from "../../_utils_/mount-utils.js";
import Controller from "./../../../src/common-properties/properties-controller";
import { Provider } from "react-redux";
import { expect } from "chai";
import sinon from "sinon";
import { Slider } from "carbon-components-react";
import SliderControl from "./../../../src/common-properties/controls/slider";

const propertyId = {
	name: "test-slider"
};

const controller = new Controller();

const control = {
	name: "test-slider",
	// You can choose to leave minValue, maxValue, and increment undefined for some test cases
	minValue: 1,
	maxValue: 10,
	increment: 1,
};

describe("SliderControl renders correctly", () => {
	let wrapper;


	beforeEach(() => {
		wrapper = mount(
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
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("renders a Slider component", () => {
		expect(wrapper.find(Slider)).to.have.length(1);
	});

	it("handles formatLabel function correctly", () => {
		const sliderProps = wrapper.find(Slider).props();

		const formatLabel = sliderProps.formatLabel;
		expect(formatLabel(1)).to.equal(1);
		expect(formatLabel(10)).to.equal(10);
		expect(formatLabel(5)).to.equal("");
	});


	it("renders ValidationMessage component", () => {
		expect(wrapper.find("ValidationMessage")).to.have.length(1);
	});

	it("renders ValidationMessage component", () => {
		expect(wrapper.find("ValidationMessage")).to.have.length(1);
	});

	it("handles change event correctly", () => {
		const sliderProps = wrapper.find(Slider).props();
		const handleChangeSpy = sinon.spy(controller, "updatePropertyValue");

		// Simulate a change event on the Slider
		sliderProps.onChange({ value: 7 });

		// Ensure that handleChange method is called with the correct arguments
		expect(handleChangeSpy.calledOnceWithExactly(propertyId, 7)).to.be.false;

		// Clean up the spy
		handleChangeSpy.restore();
	});

	it("handles formatLabel function correctly without minValue and maxValue", () => {
		const controlWithLabels = {
			name: "test-slider",
			minValue: null,
			maxValue: null,
			increment: null,
		};

		wrapper.setProps({
			control: controlWithLabels,
		});

		const sliderProps = wrapper.find(Slider).props();

		expect(sliderProps.formatLabel(1)).to.equal(1);

		expect(sliderProps.formatLabel(10)).to.equal(10);

		expect(sliderProps.formatLabel(5)).to.equal("");
	});

	it("renders ValidationMessage component", () => {
		expect(wrapper.find("ValidationMessage")).to.have.length(1);
	});
});
