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
import DatepickerControl from "../../../src/common-properties/controls/datepicker";
import { mount } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import datepickerParamDef from "../../test_resources/paramDefs/datepicker_paramDef.json";

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
	propertyUtils.setControls(controller, [control]);
	const propertyId = { name: "test-datepicker" };

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-datepicker": "2023-03-23T00:00:00.00" }
		);
	});
	it("props should have been defined", () => {
		const wrapper = mount(
			<DatepickerControl
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

	it("should render a `DatepickerControl`", () => {
		const wrapper = mount(
			<DatepickerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const dateWrapper = wrapper.find("div[data-id='properties-test-datepicker']");
		expect(dateWrapper.find("input")).to.have.length(1);
		expect(dateWrapper.find("svg")).to.have.length(1); // Calendar icom
	});

	it("should allow a valid date to be entered in `DatepickerControl`", () => {
		const wrapper = mount(
			<DatepickerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		let dateWrapper = wrapper.find("div[data-id='properties-test-datepicker']");
		expect(controller.getPropertyValue(propertyId)).to.equal("2023-03-23T00:00:00.00");

		let input = dateWrapper.find("input");
		expect(input.prop("value")).to.equal("03-23-2023");
		input.simulate("change", { target: { value: "10-29-2023" } }); // This will update the display value

		// Verify input value displays updated input
		wrapper.update();
		dateWrapper = wrapper.find("div[data-id='properties-test-datepicker']");
		input = dateWrapper.find("input");
		expect(input.prop("value")).to.equal("10-29-2023");
	});

	it("should allow a valid date to be updated in `DatepickerControl`", () => {
		const wrapper = mount(
			<DatepickerControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		expect(controller.getPropertyValue(propertyId)).to.equal("2023-03-23T00:00:00.00");

		const instance = wrapper.find("DatepickerControl").instance();
		instance.handleChange([new Date("2023-02-28T08:00:00.000Z")]); // mock clicking on calendar to update value
		expect(controller.getPropertyValue(propertyId)).to.equal("2023-02-28T08:00:00.000Z");

		wrapper.update();
		const dateWrapper = wrapper.find("div[data-id='properties-test-datepicker']");
		const input = dateWrapper.find("input");
		expect(input.prop("value")).to.equal("02-28-2023"); // Verify formatted value is displayed
	});
});

describe("error messages renders correctly for datepicker controls", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(datepickerParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("should show error message when empty string is entered in a required field", () => {
		const propertyId = { "name": "datepicker_required" };
		// Simulate entering an empty string in a required field
		let dateWrapper = wrapper.find("div[data-id='properties-ctrl-datepicker_required']");
		const instance = dateWrapper.find("DatepickerControl").instance();
		instance.handleChange([]); // mock clicking on calendar to update value
		expect(controller.getPropertyValue(propertyId)).to.equal("");
		wrapper.update();

		dateWrapper = wrapper.find("div[data-id='properties-ctrl-datepicker_required']");
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
		let messageWrapper = dateWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(1);

		// Now simulate entering a valid date with the correct format.
		instance.handleChange([new Date("2023-02-28T08:00:00.000Z")]); // mock clicking on calendar to update value
		expect(controller.getPropertyValue(propertyId)).to.equal("2023-02-28T08:00:00.000Z");
		wrapper.update();

		// Ensure the error message is no longer displayed.
		dateWrapper = wrapper.find("div[data-id='properties-ctrl-datepicker_required']");
		messageWrapper = dateWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should not show error message when empty string is entered in a non-required field", () => {
		// Simulate entering an empty string in a non-required field
		const propertyId = { "name": "datepicker_required" };
		// Simulate entering an empty string in a required field
		let dateWrapper = wrapper.find("div[data-id='properties-ctrl-datepicker']");
		const instance = dateWrapper.find("DatepickerControl").instance();
		instance.handleChange([]); // mock clicking on calendar to update value
		expect(controller.getPropertyValue(propertyId)).to.equal(datepickerParamDef.current_parameters.datepicker);
		wrapper.update();

		// Ensure an error message is not displayed.
		dateWrapper = wrapper.find("div[data-id='properties-ctrl-datepicker']");
		const messageWrapper = dateWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should reveal datepicker when checkbox is clicked", () => {
		// First check the hidden field is not displayed (style.display should be
		// set to 'none').
		let dateWrapper = wrapper.find("div[data-id='properties-hidden_datepicker']");
		expect(dateWrapper).to.have.length(0);
		controller.updatePropertyValue({ name: "hide_datepicker" }, false);
		wrapper.update();
		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it be hidden).
		dateWrapper = wrapper.find("div[data-id='properties-hidden_datepicker']");
		expect(dateWrapper).to.have.length(1);
	});

	it("should enable datepicker when checkbox is clicked", () => {
		// First check the disbaled field is showing disabled color.
		let dateWrapper = wrapper.find("div[data-id='properties-disabled_datepicker']");
		expect(dateWrapper.find("input").prop("disabled")).to.equal(true);
		controller.updatePropertyValue({ name: "disable_datepicker" }, false);
		wrapper.update();
		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it show as enabled).
		dateWrapper = wrapper.find("div[data-id='properties-disabled_datepicker']");
		expect(dateWrapper.find("input").prop("disabled")).to.equal(false);
	});
});

describe("datepicker classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(datepickerParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("datepicker should have custom classname defined", () => {
		expect(wrapper.find(".datepicker-control-unique-class")).to.have.length(1);
	});

	it("datepicker should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "datepicker-table-summary");
		expect(wrapper.find("div.table-datepicker-control-class")).to.have.length(2); // There are 2 rows in the table
		expect(wrapper.find(".table-on-panel-datepicker-control-class")).to.have.length(2);
		expect(wrapper.find(".table-subpanel-datepicker-control-class")).to.have.length(2);
	});
});
