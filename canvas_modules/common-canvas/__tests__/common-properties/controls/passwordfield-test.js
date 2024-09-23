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
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";

import passwordfieldParamDef from "../../test_resources/paramDefs/passwordfield_paramDef.json";
import { fireEvent } from "@testing-library/react";

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
propertyUtilsRTL.setControls(controller, [control]);
const propertyId = { name: "test-password" };

const mockPasswordfield = jest.fn();
jest.mock("./../../../src/common-properties/controls/passwordfield",
	() => (props) => mockPasswordfield(props)
);

mockPasswordfield.mockImplementation((props) => {
	const PasswordfieldComp = jest.requireActual(
		"./../../../src/common-properties/controls/passwordfield",
	).default;
	return <PasswordfieldComp {...props} />;
});

describe("Passwordfield renders correctly", () => {
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-password": "Test value" }
		);
	});
	it("Passwordfield props should have been defined", () => {
		render(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expectJest(mockPasswordfield).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});
	it("Passwordfield type set correctly", () => {
		const wrapper = render(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.container.querySelector("div[data-id='properties-test-password']");
		const input = passwordWrapper.querySelector("input");
		expect(input.type).to.equal("password");
	});
	it("Passwordfield should update value", () => {
		const wrapper = render(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.container.querySelector("div[data-id='properties-test-password']");
		const input = passwordWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "My secret password" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My secret password");
	});
	it("Passwordfield should set placeholder", () => {
		const wrapper = render(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.container.querySelector("div[data-id='properties-test-password']");
		const input = passwordWrapper.querySelector("input");
		expect(input.placeholder).to.equal(control.additionalText);
	});
	it("Passwordfield handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-password": null }
		);
		const wrapper = render(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.container.querySelector("div[data-id='properties-test-password']");
		const input = passwordWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});
	it("Passwordfield handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.container.querySelector("div[data-id='properties-test-password']");
		const input = passwordWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});
	it("readonly renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = render(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.container.querySelector("div[data-id='properties-test-password']");
		expect(passwordWrapper.querySelector("input").disabled).to.equal(true);
	});
	it("Passwordfield renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = render(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.container.querySelector("div[data-id='properties-test-password']");
		expect(passwordWrapper.className.includes("hide")).to.equal(true);
	});
	it("Passwordfield renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = render(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.container.querySelector("div[data-id='properties-test-password']");
		const messageWrapper = passwordWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);
	});
	it("Passwordfield eyeIcon tooltip default content appears correctly", () => {
		const wrapper = render(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.container.querySelector("div[data-id='properties-test-password']");
		// Verify the eye icon
		const eyeIcon = passwordWrapper.querySelectorAll("button");
		expect(eyeIcon).to.have.length(1);
		const eyeIconAriaLabelledBy = eyeIcon[0].getAttribute("aria-labelledby");
		// Verify custom tooltip content
		expect(passwordWrapper.querySelector(`span[id='${eyeIconAriaLabelledBy}']`).textContent).to.equal(control.tooltip.defaultShow);
		fireEvent.click(eyeIcon[0]);
		expect(passwordWrapper.querySelector(`span[id='${eyeIconAriaLabelledBy}']`).textContent).to.equal(control.tooltip.defaultHide);
	});

	it("Passwordfield helperText is rendered correctly", () => {
		control.helperText = "Passwordfield helperText";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<Passwordfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const helpTextWrapper = wrapper.container.querySelector("div[data-id='properties-test-password']");
		expect(helpTextWrapper.querySelector("div.cds--form__helper-text").textContent).to.equal(control.helperText);
	});
});

describe("passwordfield classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(passwordfieldParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("passwordfield should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".passwordfield-control-class")).to.have.length(1);
	});

	it("Passwordfield eyeIcon tooltip custom content appears correctly", () => {
		const passwordWrapper = wrapper.container.querySelector("div[data-id='properties-pwd']");
		// Verify the eye icon
		const eyeIcon = passwordWrapper.querySelectorAll("button");
		expect(eyeIcon).to.have.length(1);
		const eyeIconAriaLabelledBy = eyeIcon[0].getAttribute("aria-labelledby");
		// Verify custom tooltip content
		expect(passwordWrapper.querySelector(`span[id='${eyeIconAriaLabelledBy}']`).textContent).to.equal(control.tooltip.customShow);
		fireEvent.click(eyeIcon[0]);
		expect(passwordWrapper.querySelector(`span[id='${eyeIconAriaLabelledBy}']`).textContent).to.equal(control.tooltip.customHide);
	});

	it("passwordfield should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "passwordfield-table-summary");
		const tableControlDiv = wrapper.container.querySelector("div[data-id='properties-passwordfield-table-summary-ctrls']");
		expect(tableControlDiv.querySelectorAll(".table-passwordfield-control-class")).to.have.length(3);
		expect(tableControlDiv.querySelectorAll(".table-on-panel-passwordfield-control-class")).to.have.length(3);
		expect(tableControlDiv.querySelectorAll(".table-subpanel-passwordfield-control-class")).to.have.length(3);
	});
});
