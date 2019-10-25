/*
 * Copyright 2017-2019 IBM Corporation
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
import Toggletext from "../../../src/common-properties/controls/toggletext";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";

const controller = new Controller();

const control = {
	"name": "toggle",
	"values": [
		"Ascending",
		"Descending"
	],
	"valueLabels": [
		"Sort Ascending",
		"Sort Descending"
	],
	"valueIcons": [
		"/images/up-triangle.svg",
		"/images/down-triangle.svg"
	]
};
const controlNoIcons = {
	"name": "toggle",
	"values": [
		"Ascending",
		"Descending"
	],
	"valueLabels": [
		"Ascending",
		"Descending"
	]
};
propertyUtils.setControls(controller, [control, controlNoIcons]);

const propertyId = { name: "toggle" };

describe("Toggletext renders correctly", () => {

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ toggle: "Ascending" }
		);
	});

	it("Toggletext props should have been defined", () => {
		const wrapper = mount(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("controller")).to.equal(controller);
	});

	it("Toggletext should render correctly", () => {
		const wrapper = mount(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.find("div[data-id='properties-toggle']");
		const button = toggleWrapper.find("button");
		expect(button).to.have.length(1);
		const image = button.find("img");
		expect(image).to.have.length(1);
		const text = button.find("span");
		expect(text).to.have.length(1);
		expect(text.text()).to.equal(control.valueLabels[0]);
	});

	it("Toggletext should render without icons", () => {
		const wrapper = mount(
			<Toggletext
				store={controller.getStore()}
				control={controlNoIcons}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.find("div[data-id='properties-toggle']");
		const button = toggleWrapper.find("button");
		expect(button).to.have.length(1);
		const image = button.find("img");
		expect(image).to.have.length(0);
		const text = button.find("span");
		expect(text).to.have.length(1);
		expect(text.text()).to.equal(controlNoIcons.valueLabels[0]);
	});

	it("toggletext should set correct value", () => {
		const wrapper = mount(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.find("div[data-id='properties-toggle']");
		const button = toggleWrapper.find("button");
		button.simulate("click");
		expect(controller.getPropertyValue(propertyId)).to.equal("Descending");
	});

	it("toggletext renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.find("div[data-id='properties-toggle']");
		expect(toggleWrapper.prop("disabled")).to.equal(true);
	});

	it("toggletext renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.find("div[data-id='properties-toggle']");
		expect(toggleWrapper.hasClass("hide")).to.equal(true);
	});

	it("toggletext renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = mount(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.find("div[data-id='properties-toggle']");
		const messageWrapper = toggleWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});

});
