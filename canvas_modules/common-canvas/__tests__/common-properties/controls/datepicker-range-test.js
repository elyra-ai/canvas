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
import propertyUtils from "../../_utils_/property-utils";
import DatepickerRangeControl from "../../../src/common-properties/controls/datepicker-range";
import { mount } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import datepickerRangeParamDef from "../../test_resources/paramDefs/datepickerRange_paramDef.json";

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
	propertyUtils.setControls(controller, [control]);
	const propertyId = { name: "test-datepicker-range" };

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-datepicker-range": ["2023-03-17T00:00:00.00", "2023-03-30T00:00:00.00"] }
		);
	});

	it("props should have been defined", () => {
		const wrapper = mount(
			<DatepickerRangeControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `DatepickerRangeControl`", () => {
		const wrapper = mount(
			<DatepickerRangeControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const dateWrapper = wrapper.find("div[data-id='properties-test-datepicker-range']");
		expect(dateWrapper.find("input")).to.have.length(2);
		expect(dateWrapper.find("svg")).to.have.length(2); // Calendar icom
	});

	it("should allow valid dates to be entered in `DatepickerRangeControl`", () => {
		const wrapper = mount(
			<DatepickerRangeControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		let dateWrapper = wrapper.find("div[data-id='properties-test-datepicker-range']");
		expect(controller.getPropertyValue(propertyId)).to.eql(["2023-03-17T00:00:00.00", "2023-03-30T00:00:00.00"]);

		let inputStart = dateWrapper.find("input").at(0);
		let inputEnd = dateWrapper.find("input").at(1);
		expect(inputStart.prop("value")).to.equal("03-17-2023");
		expect(inputEnd.prop("value")).to.equal("03-30-2023");
		inputStart.simulate("change", { target: { value: "10-29-2023" } }); // This will update the display value
		inputEnd.simulate("change", { target: { value: "10-29-2024" } }); // This will update the display value

		// Verify input value displays updated input
		wrapper.update();
		dateWrapper = wrapper.find("div[data-id='properties-test-datepicker-range']");
		inputStart = dateWrapper.find("input").at(0);
		inputEnd = dateWrapper.find("input").at(1);
		expect(inputStart.prop("value")).to.equal("10-29-2023");
		expect(inputEnd.prop("value")).to.equal("10-29-2024");
	});

	it("should allow a valid date to be updated in `DatepickerRangeControl`", () => {
		const wrapper = mount(
			<DatepickerRangeControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		expect(controller.getPropertyValue(propertyId)).to.eql(["2023-03-17T00:00:00.00", "2023-03-30T00:00:00.00"]);

		const instance = wrapper.find("DatepickerRangeControl").instance();
		instance.handleDateRangeChange([new Date("2023-02-28T08:00:00.000Z"), new Date("2024-02-28T08:00:00.000Z")]); // mock clicking on calendar to update value
		expect(controller.getPropertyValue(propertyId)).to.eql(["2023-02-28T08:00:00.000Z", "2024-02-28T08:00:00.000Z"]);

		wrapper.update();
		const dateWrapper = wrapper.find("div[data-id='properties-test-datepicker-range']");
		const inputStart = dateWrapper.find("input").at(0);
		const inputEnd = dateWrapper.find("input").at(1);
		expect(inputStart.prop("value")).to.equal("02-28-2023"); // Verify formatted value is displayed
		expect(inputEnd.prop("value")).to.equal("02-28-2024"); // Verify formatted value is displayed
	});

	it("should render readonly props", () => {
		control.readOnly = true;
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<DatepickerRangeControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
				readOnly
			/>
		);

		const readOnlyWrapper = wrapper.find("div[data-id='properties-test-datepicker-range']");
		expect(readOnlyWrapper.find("ForwardRef(DatePicker)").prop("readOnly")).to.equal(control.readOnly);
	});
});

describe("error messages renders correctly for datepickerRange controls", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(datepickerRangeParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("should show error message when empty string is entered in a required field", () => {
		const propertyId = { "name": "datepicker_range_required" };
		// Simulate entering an empty string in a required field
		let dateWrapper = wrapper.find("div[data-id='properties-ctrl-datepicker_range_required']");
		let inputStart = dateWrapper.find("input").at(0);
		let inputEnd = dateWrapper.find("input").at(1);
		inputStart.simulate("change", { target: { value: "" } }); // This will update the display value
		inputEnd.simulate("change", { target: { value: "" } }); // This will update the display value
		inputStart.simulate("blur", { target: { value: "" } }); // Update internal value
		inputEnd.simulate("blur", { target: { value: "" } }); // Update internal value
		wrapper.update();

		dateWrapper = wrapper.find("div[data-id='properties-ctrl-datepicker_range_required']");
		inputStart = dateWrapper.find("input").at(0);
		inputEnd = dateWrapper.find("input").at(1);
		expect(inputStart.prop("value")).to.equal(""); // Verify formatted value is displayed
		expect(inputEnd.prop("value")).to.equal(""); // Verify formatted value is displayed

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
		let messageWrapper = dateWrapper.find("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(2); // Each input will display an error

		// Now simulate entering a valid date with the correct format.

		inputStart.simulate("change", { target: { value: "2023/10/01" } }); // This will update the display value
		inputEnd.simulate("change", { target: { value: "2024/01/10" } }); // This will update the display value
		inputStart.simulate("blur", { target: { value: "2023/10/01" } }); // Update internal value
		inputEnd.simulate("blur", { target: { value: "2024/01/10" } }); // Update internal value
		wrapper.update();

		// Ensure the error message is no longer displayed.
		dateWrapper = wrapper.find("div[data-id='properties-ctrl-datepicker_range_required']");
		messageWrapper = dateWrapper.find("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should not show error message when empty string is entered in a non-required field", () => {
		// Simulate entering an empty string in a non-required field
		let dateWrapper = wrapper.find("div[data-id='properties-ctrl-datepicker_range']");
		const inputStart = dateWrapper.find("input").at(0);
		const inputEnd = dateWrapper.find("input").at(1);
		inputStart.simulate("change", { target: { value: "" } }); // This will update the display value
		inputEnd.simulate("change", { target: { value: "" } }); // This will update the display value
		inputStart.simulate("blur", { target: { value: "" } }); // Update internal value
		inputEnd.simulate("blur", { target: { value: "" } }); // Update internal value
		wrapper.update();

		// Ensure an error message is not displayed.
		dateWrapper = wrapper.find("div[data-id='properties-ctrl-datepicker']");
		const messageWrapper = dateWrapper.find("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should reveal datepickerRange when checkbox is clicked", () => {
		// First check the hidden field is not displayed (style.display should be
		// set to 'none').
		let dateWrapper = wrapper.find("div[data-id='properties-hidden_datepicker_range']");
		expect(dateWrapper).to.have.length(0);
		controller.updatePropertyValue({ name: "hide_datepicker_range" }, false);
		wrapper.update();
		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it be hidden).
		dateWrapper = wrapper.find("div[data-id='properties-hidden_datepicker_range']");
		expect(dateWrapper).to.have.length(1);
	});

	it("should enable datepickerRange when checkbox is clicked", () => {
		// First check the disbaled field is showing disabled color.
		let dateWrapper = wrapper.find("div[data-id='properties-disabled_datepicker_range']");
		expect(dateWrapper.find("input").at(0)
			.prop("disabled")).to.equal(true);
		expect(dateWrapper.find("input").at(1)
			.prop("disabled")).to.equal(true);
		controller.updatePropertyValue({ name: "disable_datepicker_range" }, false);
		wrapper.update();
		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it show as enabled).
		dateWrapper = wrapper.find("div[data-id='properties-disabled_datepicker_range']");
		expect(dateWrapper.find("input").at(0)
			.prop("disabled")).to.equal(false);
		expect(dateWrapper.find("input").at(1)
			.prop("disabled")).to.equal(false);
	});
});

describe("datepicker classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(datepickerRangeParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("datepicker should have custom classname defined", () => {
		expect(wrapper.find(".datepicker-range-control-unique-class")).to.have.length(1);
	});

	it("datepicker should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "datepicker-range-table-summary");
		expect(wrapper.find("div.table-datepicker_range-control-class")).to.have.length(2); // There are 2 rows in the table
		expect(wrapper.find(".table-on-panel-datepicker_range-control-class")).to.have.length(2);
		expect(wrapper.find(".table-subpanel-datepicker_range-control-class")).to.have.length(2);
	});
});
