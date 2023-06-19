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
import Passwordfield from "./../../../src/common-properties/controls/passwordfield";
import Controller from "./../../../src/common-properties/properties-controller";
import { mount } from "enzyme";
import { expect } from "chai";
import propertyUtils from "../../_utils_/property-utils";

import passwordfieldParamDef from "../../test_resources/paramDefs/passwordfield_paramDef.json";

const controller = new Controller();

const control = {
	tooltip: {
		defaultShow: "Show password",
		defaultHide: "Hide password",
		customShow: "Custom show password",
		customHide: "Hide password.This value is encrypted when the connection is created or updated"
	},
	name: "test-password",
	additionalText: "Enter a password",
	valueDef: {
		isList: false
	}
};
propertyUtils.setControls(controller, [control]);
const propertyId = { name: "test-password" };


describe("Passwordfield renders correctly", () => {
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-password": "Test value" }
		);
	});
	it("Passwordfield props should have been defined", () => {
		const wrapper = mount(
			<Passwordfield
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
	it("Passwordfield type set correctly", () => {
		const wrapper = mount(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const input = passwordWrapper.find("input");
		expect(input.getDOMNode().type).to.equal("password");
	});
	it("Passwordfield should update value", () => {
		const wrapper = mount(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const input = passwordWrapper.find("input");
		input.simulate("change", { target: { value: "My secret password" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My secret password");
	});
	it("Passwordfield should set placeholder", () => {
		const wrapper = mount(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const input = passwordWrapper.find("input");
		expect(input.getDOMNode().placeholder).to.equal(control.additionalText);
	});
	it("Passwordfield handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-password": null }
		);
		const wrapper = mount(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const input = passwordWrapper.find("input");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});
	it("Passwordfield handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const input = passwordWrapper.find("input");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});
	it("readonly renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		expect(passwordWrapper.find("input").prop("disabled")).to.equal(true);
	});
	it("Passwordfield renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		expect(passwordWrapper.hasClass("hide")).to.equal(true);
	});
	it("Passwordfield renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = mount(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const messageWrapper = passwordWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(1);
	});
	it("Passwordfield eyeIcon tooltip default content appears correctly", () => {
		const wrapper = mount(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		// Verify the eye icon
		const eyeIcon = passwordWrapper.find("button");
		expect(eyeIcon).to.have.length(1);
		// Verify custom tooltip content
		expect(eyeIcon.at(0).text()).to.equal(control.tooltip.defaultShow);
		eyeIcon.simulate("click");
		expect(eyeIcon.at(0).text()).to.equal(control.tooltip.defaultHide);
	});
});

describe("passwordfield classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(passwordfieldParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("passwordfield should have custom classname defined", () => {
		expect(wrapper.find(".passwordfield-control-class")).to.have.length(1);
	});

	it("Passwordfield eyeIcon tooltip custom content appears correctly", () => {
		const passwordWrapper = wrapper.find("div[data-id='properties-pwd']");
		// Verify the eye icon
		const eyeIcon = passwordWrapper.find("button");
		expect(eyeIcon).to.have.length(1);
		// Verify custom tooltip content
		expect(eyeIcon.text()).to.equal(control.tooltip.customShow);
		eyeIcon.simulate("click");
		expect(eyeIcon.text()).to.equal(control.tooltip.customHide);
	});

	it("passwordfield should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "passwordfield-table-summary");
		const tableControlDiv = wrapper.find("div[data-id='properties-passwordfield-table-summary-ctrls']");
		expect(tableControlDiv.find(".table-passwordfield-control-class")).to.have.length(3);
		expect(tableControlDiv.find(".table-on-panel-passwordfield-control-class")).to.have.length(3);
		expect(tableControlDiv.find(".table-subpanel-passwordfield-control-class")).to.have.length(3);
	});
});
