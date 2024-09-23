/*
 * Copyright 2023 Elyra Authors
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
import DatepickerControl from "../../../src/common-properties/controls/datepicker";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";
import datepickerParamDef from "../../test_resources/paramDefs/datepicker_paramDef.json";
import { fireEvent, waitFor } from "@testing-library/react";

const mockDatepicker = jest.fn();
jest.mock("../../../src/common-properties/controls/datepicker",
	() => (props) => mockDatepicker(props)
);

mockDatepicker.mockImplementation((props) => {
	const DatepickerComp = jest.requireActual(
		"../../../src/common-properties/controls/datepicker",
	).default;
	return <DatepickerComp {...props} />;
});

describe("datepicker-control renders correctly", () => {
	const controller = new Controller();

	const control = {
		name: "test-datepicker",
		controlType: "datepicker",
		dateFormat: "m-d-Y",
		additionalText: "Enter date",
		description: { text: "some description" },
		valueDef: {
			isList: false,
			propType: "date"
		},
		role: "date",
		light: true
	};
	const controlItem = <span>"Label"</span>;
	propertyUtilsRTL.setControls(controller, [control]);
	const propertyId = { name: "test-datepicker" };

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-datepicker": "2023-03-23T00:00:00.00" }
		);
	});
	it("props should have been defined", () => {
		render(
			<DatepickerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		expectJest(mockDatepicker).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
			"controlItem": controlItem
		});
	});

	it("should render a `DatepickerControl`", () => {
		const wrapper = render(
			<DatepickerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const dateWrapper = wrapper.container.querySelector("div[data-id='properties-test-datepicker']");
		expect(dateWrapper.querySelectorAll("input")).to.have.length(1);
		expect(dateWrapper.querySelectorAll("svg")).to.have.length(1); // Calendar icom
	});

	it("should allow a valid date to be entered in `DatepickerControl`", async() => {
		const wrapper = render(
			<DatepickerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		let dateWrapper = wrapper.container.querySelector("div[data-id='properties-test-datepicker']");
		expect(controller.getPropertyValue(propertyId)).to.equal("2023-03-23T00:00:00.00");

		let input = dateWrapper.querySelector("input");
		expect(input.value).to.equal("03-23-2023");
		fireEvent.change(input, { target: { value: "10-29-2023" } }); // This will update the display value

		// Verify input value displays updated input
		await waitFor(() => {
			dateWrapper = wrapper.container.querySelector("div[data-id='properties-test-datepicker']");
			input = dateWrapper.querySelector("input");
			expect(input.value).to.equal("10-29-2023");
		});
	});

	it("should have helperText rendered correctly in `DatepickerControl`", () => {
		control.helperText = "Datepicker helperText";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<DatepickerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const helpTextWrapper = wrapper.container.querySelector("div[data-id='properties-test-datepicker']");
		expect(helpTextWrapper.querySelector("div.cds--form__helper-text").textContent).to.equal(control.helperText);
	});

	it("should have readonly rendered correctly in `DatepickerControl`", () => {
		control.readOnly = true;
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<DatepickerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
				readOnly
			/>
		);
		const readOnlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-datepicker']");
		expect(readOnlyWrapper.querySelector("input").readOnly).to.equal(control.readOnly);
	});

	it("should allow a valid date to be updated in `DatepickerControl`", () => {
		const wrapper = render(
			<DatepickerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		expect(controller.getPropertyValue(propertyId)).to.equal("2023-03-23T00:00:00.00");

		let dateWrapper = wrapper.container.querySelector("div[data-id='properties-test-datepicker']");
		let input = dateWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "2023-02-28T08:00:00.000Z" } });
		fireEvent.blur(input, { target: { value: "2023-02-28T08:00:00.000Z" } });


		expect(controller.getPropertyValue(propertyId)).to.equal("2023-02-28T08:00:00.000Z");

		dateWrapper = wrapper.container.querySelector("div[data-id='properties-test-datepicker']");
		input = dateWrapper.querySelector("input");
		expect(input.value).to.equal("02-28-2023"); // Verify formatted value is displayed
	});
});

describe("error messages renders correctly for datepicker controls", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(datepickerParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("should show error message when empty string is entered in a required field", () => {
		const propertyId = { "name": "datepicker_required" };
		// Simulate entering an empty string in a required field
		let dateWrapper = wrapper.container.querySelector("div[data-id='properties-ctrl-datepicker_required']");
		let input = dateWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "" } });
		fireEvent.blur(input, { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("");

		dateWrapper = wrapper.container.querySelector("div[data-id='properties-ctrl-datepicker_required']");
		// Check an error message is displayed with the expected error message.
		const expectedDatepickerErrorMessages = {
			"propertyId": propertyId,
			"required": true,
			"validation_id": "required_datepicker_required_821.7135172867598",
			"type": "error",
			"text": "You must enter a value for Date format: Date Y-m-d.",
		};
		const actual = controller.getErrorMessage(propertyId);
		expect(actual).to.eql(expectedDatepickerErrorMessages);
		let messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);

		// Now simulate entering a valid date with the correct format.
		input = dateWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "2023-02-28T08:00:00.000Z" } });
		fireEvent.blur(input, { target: { value: "2023-02-28T08:00:00.000Z" } }); // mock clicking on calendar to update value
		expect(controller.getPropertyValue(propertyId)).to.equal("2023-02-28T08:00:00.000Z");

		// Ensure the error message is no longer displayed.
		dateWrapper = wrapper.container.querySelector("div[data-id='properties-ctrl-datepicker_required']");
		messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});


	it("should not show error message when empty string is entered in a non-required field", () => {
		// Simulate entering an empty string in a non-required field
		const propertyId = { "name": "datepicker_required" };
		// Simulate entering an empty string in a required field
		let dateWrapper = wrapper.container.querySelector("div[data-id='properties-ctrl-datepicker']");
		const input = dateWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "" } });
		fireEvent.blur(input, { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(datepickerParamDef.current_parameters.datepicker);

		// Ensure an error message is not displayed.
		dateWrapper = wrapper.container.querySelector("div[data-id='properties-ctrl-datepicker']");
		const messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should reveal datepicker when checkbox is clicked", async() => {
		// First check the hidden field is not displayed (style.display should be
		// set to 'none').
		let dateWrapper = wrapper.container.querySelectorAll("div[data-id='properties-hidden_datepicker']");
		expect(dateWrapper).to.have.length(0);
		controller.updatePropertyValue({ name: "hide_datepicker" }, false);
		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it be hidden).
		await waitFor(() => {
			dateWrapper = wrapper.container.querySelectorAll("div[data-id='properties-hidden_datepicker']");
			expect(dateWrapper).to.have.length(1);
		});
	});

	it("should enable datepicker when checkbox is clicked", async() => {
		// First check the disbaled field is showing disabled color.
		let dateWrapper = wrapper.container.querySelector("div[data-id='properties-disabled_datepicker']");
		expect(dateWrapper.querySelector("input").disabled).to.equal(true);
		controller.updatePropertyValue({ name: "disable_datepicker" }, false);
		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it show as enabled).
		await waitFor(() => {
			dateWrapper = wrapper.container.querySelector("div[data-id='properties-disabled_datepicker']");
			expect(dateWrapper.querySelector("input").disabled).to.equal(false);
		});
	});
});

describe("datepicker classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(datepickerParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("datepicker should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".datepicker-control-unique-class")).to.have.length(1);
	});

	it("datepicker should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "datepicker-table-summary");
		expect(wrapper.container.querySelectorAll("div.table-datepicker-control-class")).to.have.length(2); // There are 2 rows in the table
		expect(wrapper.container.querySelectorAll(".table-on-panel-datepicker-control-class")).to.have.length(2);
		expect(wrapper.container.querySelectorAll(".table-subpanel-datepicker-control-class")).to.have.length(2);
	});
});
