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
import propertyUtilsRTL from "../../_utils_/property-utilsRTL.js";
import DatepickerRangeControl from "../../../src/common-properties/controls/datepicker-range";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";
import datepickerRangeParamDef from "../../test_resources/paramDefs/datepickerRange_paramDef.json";
import { fireEvent, waitFor, cleanup } from "@testing-library/react";

const mockDatepicker = jest.fn();
jest.mock("../../../src/common-properties/controls/datepicker-range",
	() => (props) => mockDatepicker(props)
);

mockDatepicker.mockImplementation((props) => {
	const DatepickerComp = jest.requireActual(
		"../../../src/common-properties/controls/datepicker-range",
	).default;
	return <DatepickerComp {...props} />;
});

describe("datepicker-range-control renders correctly", () => {
	const controller = new Controller();

	const control = {
		name: "test-datepicker-range",
		controlType: "datepickerRange",
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
	const propertyId = { name: "test-datepicker-range" };

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-datepicker-range": ["2023-03-17T00:00:00.00", "2023-03-30T00:00:00.00"] }
		);
	});

	it("props should have been defined", () => {
		render(
			<DatepickerRangeControl
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

	it("should render a `DatepickerRangeControl`", () => {
		const wrapper = render(
			<DatepickerRangeControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const { container } = wrapper;
		const dateWrapper = container.querySelector("div[data-id='properties-test-datepicker-range']");
		expect(dateWrapper.querySelectorAll("input")).to.have.length(2);
		expect(dateWrapper.querySelectorAll("svg")).to.have.length(2); // Calendar icom
	});

	it("should allow valid dates to be entered in `DatepickerRangeControl`", () => {
		const wrapper = render(
			<DatepickerRangeControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const { container } = wrapper;
		let dateWrapper = container.querySelector("div[data-id='properties-test-datepicker-range']");
		expect(controller.getPropertyValue(propertyId)).to.eql(["2023-03-17T00:00:00.00", "2023-03-30T00:00:00.00"]);

		let inputStart = dateWrapper.querySelectorAll("input")[0];
		let inputEnd = dateWrapper.querySelectorAll("input")[1];
		expect(inputStart.value).to.equal("03-17-2023");
		expect(inputEnd.value).to.equal("03-30-2023");
		fireEvent.change(inputStart, { target: { value: "10-29-2023" } });
		fireEvent.change(inputEnd, { target: { value: "10-29-2024" } });

		// Verify input value displays updated input
		dateWrapper = container.querySelector("div[data-id='properties-test-datepicker-range']");
		inputStart = dateWrapper.querySelectorAll("input")[0];
		inputEnd = dateWrapper.querySelectorAll("input")[1];
		expect(inputStart.value).to.equal("10-29-2023");
		expect(inputEnd.value).to.equal("10-29-2024");
	});

	it("should allow a valid date to be updated in `DatepickerRangeControl`", async() => {
		expect(controller.getPropertyValue(propertyId)).to.eql(["2023-03-17T00:00:00.00", "2023-03-30T00:00:00.00"]);
		controller.setPropertyValues(
			{ "test-datepicker-range": [new Date("2023-02-28T08:00:00.000Z"), new Date("2024-02-28T08:00:00.000Z")] }
		);
		expect(controller.getPropertyValue(propertyId)).to.eql([new Date("2023-02-28T08:00:00.000Z"), new Date("2024-02-28T08:00:00.000Z")]);
		const wrapper = render(
			<DatepickerRangeControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const { container } = wrapper;
		await waitFor(() => {
			const dateWrapper = container.querySelector("div[data-id='properties-test-datepicker-range']");
			const inputStart = dateWrapper.querySelectorAll("input")[0];
			const inputEnd = dateWrapper.querySelectorAll("input")[1];
			expect(inputStart.value).to.equal("02-28-2023"); // Verify formatted value is displayed
			expect(inputEnd.value).to.equal("02-28-2024"); // Verify formatted value is displayed
		});
	});

	it("should render readonly props", () => {
		control.readOnly = true;
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<DatepickerRangeControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
				readOnly
			/>
		);
		const { container } = wrapper;
		const readOnlyWrapper = container.querySelector("div[data-id='properties-test-datepicker-range']");
		expect(readOnlyWrapper.querySelector("input").readOnly).to.equal(control.readOnly);
	});
});

describe("error messages renders correctly for datepickerRange controls", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(datepickerRangeParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		cleanup();
	});

	it("should show error message when empty string is entered in a required field", async() => {
		const { container } = wrapper;
		const propertyId = { "name": "datepicker_range_required" };
		// Simulate entering an empty string in a required field
		let dateWrapper = container.querySelector("div[data-id='properties-ctrl-datepicker_range_required']");
		let inputStart = dateWrapper.querySelectorAll("input")[0];
		let inputEnd = dateWrapper.querySelectorAll("input")[1];

		waitFor(() => {
			fireEvent.change(inputStart, { target: { value: "" } }); // This will update the display value
			fireEvent.blur(inputStart, { target: { value: "" } }); // Update internal value
			fireEvent.change(inputEnd, { target: { value: "" } }); // This will update the display value
			fireEvent.blur(inputEnd, { target: { value: "" } }); // Update internal value
			dateWrapper = container.querySelector("div[data-id='properties-ctrl-datepicker_range_required']");
			inputStart = dateWrapper.querySelectorAll("input")[0];
			inputEnd = dateWrapper.querySelectorAll("input")[1];
			expect(inputStart.value).to.equal(""); // Verify formatted value is displayed
			expect(inputEnd.value).to.equal(""); // Verify formatted value is displayed
		});
		// Check an error message is displayed with the expected error message.
		const expectedDatepickerErrorMessages = {
			"propertyId": propertyId,
			"required": true,
			"validation_id": "required_datepicker_range_required_74.16775457638104",
			"type": "error",
			"text": "You must enter a value for Required date: Y/m/d.",
		};
		const actual = controller.getErrorMessage(propertyId);
		expect(actual).to.eql(expectedDatepickerErrorMessages);
		let messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(2); // Each input will display an error

		// Now simulate entering a valid date with the correct format.
		fireEvent.change(inputStart, { target: { value: "2023/10/01" } }); // This will update the display value
		fireEvent.blur(inputStart, { target: { value: "2023/10/01" } }); // Update internal value
		fireEvent.change(inputEnd, { target: { value: "2024/01/10" } }); // This will update the display value
		fireEvent.blur(inputEnd, { target: { value: "2024/01/10" } }); // Update internal value

		// Ensure the error message is no longer displayed.
		dateWrapper = container.querySelector("div[data-id='properties-ctrl-datepicker_range_required']");
		messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should not show error message when empty string is entered in a non-required field", async() => {
		const { container } = wrapper;
		// Simulate entering an empty string in a non-required field
		let dateWrapper = container.querySelector("div[data-id='properties-ctrl-datepicker_range']");
		const inputStart = dateWrapper.querySelectorAll("input")[0];
		const inputEnd = dateWrapper.querySelectorAll("input")[1];
		fireEvent.change(inputStart, { target: { value: "" } }); // This will update the display value
		fireEvent.blur(inputStart, { target: { value: "" } }); // Update internal value
		fireEvent.change(inputEnd, { target: { value: "" } }); // This will update the display value
		fireEvent.blur(inputEnd, { target: { value: "" } }); // Update internal value

		// Ensure an error message is not displayed.
		await waitFor(() => {
			dateWrapper = container.querySelector("div[data-id='properties-ctrl-datepicker_range_required']");
			const messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
			expect(messageWrapper).to.have.length(0);
		});
	});

	it("should reveal datepickerRange when checkbox is clicked", async() => {
		const { container } = wrapper;
		// First check the hidden field is not displayed (style.display should be
		// set to 'none').
		let dateWrapper = container.querySelectorAll("div[data-id='properties-hidden_datepicker_range']");
		expect(dateWrapper).to.have.length(0);
		controller.updatePropertyValue({ name: "hide_datepicker_range" }, false);
		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it be hidden).
		await waitFor(() => {
			dateWrapper = container.querySelectorAll("div[data-id='properties-hidden_datepicker_range']");
			expect(dateWrapper).to.have.length(1);
		});
	});

	it("should enable datepickerRange when checkbox is clicked", async() => {
		const { container } = wrapper;
		// First check the disbaled field is showing disabled color.
		let dateWrapper = container.querySelector("div[data-id='properties-disabled_datepicker_range']");
		expect(dateWrapper.querySelectorAll("input")[0]
			.disabled).to.equal(true);
		expect(dateWrapper.querySelectorAll("input")[1]
			.disabled).to.equal(true);
		controller.updatePropertyValue({ name: "disable_datepicker_range" }, false);
		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it show as enabled).
		await waitFor(() => {
			dateWrapper = container.querySelector("div[data-id='properties-disabled_datepicker_range']");
			expect(dateWrapper.querySelectorAll("input")[0]
				.disabled).to.equal(false);
			expect(dateWrapper.querySelectorAll("input")[1]
				.disabled).to.equal(false);
		});
	});
});

describe("datepicker classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(datepickerRangeParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("datepicker should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".datepicker-range-control-unique-class")).to.have.length(1);
	});

	it("datepicker should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "datepicker-range-table-summary");
		expect(wrapper.container.querySelectorAll("div.table-datepicker_range-control-class")).to.have.length(2); // There are 2 rows in the table
		expect(wrapper.container.querySelectorAll(".table-on-panel-datepicker_range-control-class")).to.have.length(2);
		expect(wrapper.container.querySelectorAll(".table-subpanel-datepicker_range-control-class")).to.have.length(2);
	});
});
