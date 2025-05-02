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
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "./../../../src/common-properties/properties-controller";
import Checkbox from "./../../../src/common-properties/controls/checkbox";
import { render } from "../../_utils_/mount-utils.js";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import checkboxParamDef from "../../test_resources/paramDefs/checkbox_paramDef.json";
import { fireEvent } from "@testing-library/react";

const controller = new Controller();

const control = {
	name: "test-checkbox"
};
propertyUtilsRTL.setControls(controller, [control]);

const propertyId = { name: "test-checkbox" };

const mockCheckbox = jest.fn();
jest.mock("../../../src/common-properties/controls/checkbox",
	() => (props) => mockCheckbox(props)
);

mockCheckbox.mockImplementation((props) => {
	const CheckboxComp = jest.requireActual(
		"../../../src/common-properties/controls/checkbox",
	).default;
	return <CheckboxComp {...props} />;
});

describe("checkbox control tests", () => {
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-checkbox": false }
		);
	});
	it("checkbox props should have been defined", () => {
		render(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		expectJest(mockCheckbox).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});
	it("checkbox label and description are rendered correctly", () => {
		const controlWithLabel = {
			name: "test-checkboxLabel",
			label: {
				text: "checkbox label"
			},
			description: {
				text: "checkbox description"
			}
		};
		const wrapper = render(
			<Checkbox
				store={controller.getStore()}
				control={controlWithLabel}
				controller={controller}
				propertyId={{ name: "test-checkboxLabel" }}
			/>
		);
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-test-checkboxLabel']");
		expect(checkboxWrapper.querySelector(".properties-checkbox-label").textContent).to.equal(controlWithLabel.label.text);
		expect(wrapper.getByText("checkbox description").textContent).to.equal(controlWithLabel.description.text);
	});
	it("checkbox updates correctly", () => {
		controller.setPropertyValues(
			{ "test-checkbox": false }
		);
		const wrapper = render(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-test-checkbox']");
		const checkbox = checkboxWrapper.querySelector("input");
		expect(checkbox.checked).to.equal(false);
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		expect(controller.getPropertyValue(propertyId)).to.equal(true);
	});
	it("checkbox handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-checkbox": null }
		);
		const wrapper = render(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-test-checkbox']");
		const checkbox = checkboxWrapper.querySelector("input");
		expect(checkbox.checked).to.equal(false);
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		expect(controller.getPropertyValue(propertyId)).to.equal(true);
	});
	it("checkbox handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-test-checkbox']");
		const checkbox = checkboxWrapper.querySelector("input");
		expect(checkbox.checked).to.equal(false);
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		expect(controller.getPropertyValue(propertyId)).to.equal(true);
	});
	it("checkbox renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = render(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-test-checkbox']");
		expect(checkboxWrapper.querySelector("input").disabled).to.equal(true);
	});
	it("checkbox does not render when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = render(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-test-checkbox'] > div");
		expect(checkboxWrapper).to.be.null;
	});
	it("checkbox renders correctly in a table", () => {
		const controlWithLabel = {
			name: "test-checkboxLabel",
			label: {
				text: "checkbox label"
			},
			description: {
				text: "checkbox description"
			}
		};
		const wrapper = render(
			<Checkbox
				store={controller.getStore()}
				control={controlWithLabel}
				controller={controller}
				propertyId={{ name: "test-checkboxLabel" }}
				tableControl
			/>
		);
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-test-checkboxLabel']");
		// isn't actually visible.  Visibility controlled by carbon component
		expect(checkboxWrapper.querySelector("label").textContent).to.equal(controlWithLabel.label.text);
		expect(checkboxWrapper.querySelectorAll("div.properties-tooltips text")).to.have.length(0);
	});
	it("checkbox renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = render(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-test-checkbox']");
		const messageWrapper = checkboxWrapper.querySelectorAll("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
	it("Checkbox helperText is rendered correctly", () => {
		control.helperText = "Checkbox helperText";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const helpTextWrapper = container.querySelector("div[data-id='properties-test-checkbox']");
		expect(helpTextWrapper.querySelector("div.cds--form__helper-text").textContent).to.equal(control.helperText);
	});

	it("Checkbox readonly is rendered correctly", () => {
		control.readOnly = true;
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				readOnly
			/>
		);
		const { container } = wrapper;
		const readOnlyWrapper = container.querySelector("div[data-id='properties-test-checkbox']");
		expect(readOnlyWrapper.querySelector("input").getAttribute("aria-readonly")).to.equal(control.readOnly.toString());
	});
});

describe("checkbox classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(checkboxParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("checkbox should have custom classname defined", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll(".checkbox-control-class")).to.have.length(1);
	});

	it("checkbox should have custom classname defined in table cells", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "checkbox-table-summary");
		const tableControlDiv = container.querySelector("div[data-id='properties-checkbox-table-summary-ctrls']");
		// There are 2 rows shown across 2 tables
		expect(tableControlDiv.querySelectorAll(".table-checkbox-control-class")).to.have.length(2);
		// From the 2 rows shown, each row has a checkbox on-panel and in subpanel
		expect(tableControlDiv.querySelectorAll(".table-on-panel-checkbox-control-class")).to.have.length(2);
		expect(tableControlDiv.querySelectorAll(".table-subpanel-checkbox-control-class")).to.have.length(2);
	});
});
