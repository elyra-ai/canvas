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
/* eslint no-console: "off" */

import React from "react";
import propertyUtils from "../../_utils_/property-utils";
import TimefieldControl from "../../../src/common-properties/controls/timefield";
import { mount } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { format } from "date-fns";
import Controller from "../../../src/common-properties/properties-controller";

import TIMEFIELD_PARAM_DEF from "../../test_resources/paramDefs/timefield_paramDef.json";

const controlItem = <span>"Label"</span>;

describe("timefield-control renders correctly", () => {
	const controller = new Controller();
	const control = {
		name: "test-timefield",
		additionalText: "Enter time",
		valueDef: {
			isList: false,
			propType: "time"
		}
	};
	propertyUtils.setControls(controller, [control]);
	const propertyId = { name: "test-timefield" };
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-timefield": "05:12:48" }
		);
	});
	it("props should have been defined", () => {
		const wrapper = mount(
			<TimefieldControl
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

	it("should render a `TimefieldControl`", () => {
		const wrapper = mount(
			<TimefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const timeWrapper = wrapper.find("div[data-id='properties-test-timefield']");
		const input = timeWrapper.find("input");
		expect(input).to.have.length(1);
	});

	it("should allow a valid time to be entered in `TimefieldControl`", () => {
		const wrapper = mount(
			<TimefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const timeWrapper = wrapper.find("div[data-id='properties-test-timefield']");
		const input = timeWrapper.find("input");
		input.simulate("change", { target: { value: "10:06:21" } });
		// use format to get GMT offset since these tests might run in different timezones
		expect(controller.getPropertyValue(propertyId)).to.equal(`10:06:21:${format(new Date(), "xxx")}`);
	});

	it("should allow invalid format date to be entered in `TimefieldControl`", () => {
		const wrapper = mount(
			<TimefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const timeWrapper = wrapper.find("div[data-id='properties-test-timefield']");
		const input = timeWrapper.find("input");
		input.simulate("change", { target: { value: "1000:06:21" } });

		// When invalid times are entered they are not rejected but accepted and a messages is displayed
		// under the entry field to explain the error (see testcase below in next 'describe' section).
		// Therefore the invalid time string is stored in the controller. In this case, "1000:06:21" is
		// not correct because 1000 hours is wrong but it will be accepted by the controller
		// because invalid times are accepted on entry.
		expect(controller.getPropertyValue(propertyId)).to.equal("1000:06:21");
	});

	it("should set correct state null in `TimefieldControl`", () => {
		const wrapper = mount(
			<TimefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const timeWrapper = wrapper.find("div[data-id='properties-test-timefield']");
		const input = timeWrapper.find("input");
		input.simulate("change", { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(null);
	});

	it("should set correct control type in `TimefieldControl`", () => {
		const wrapper = mount(
			<TimefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const timeWrapper = wrapper.find("div[data-id='properties-test-timefield']");
		const input = timeWrapper.find("input");
		expect(input.getDOMNode().type).to.equal("text");
	});

	it("should set placeholder text in `TimefieldControl`", () => {
		const wrapper = mount(
			<TimefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const timeWrapper = wrapper.find("div[data-id='properties-test-timefield']");
		const input = timeWrapper.find("input");
		expect(input.getDOMNode().placeholder).to.equal(control.additionalText);
	});

	it("should set helpertext text in `TimefieldControl`", () => {
		control.helperText = "TimefieldControl helpertext";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<TimefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const helpTextWrapper = wrapper.find("div[data-id='properties-test-timefield']");
		expect(helpTextWrapper.find("div.cds--form__helper-text").text()).to.equal(control.helperText);
	});

	it("should set readonly control in `TimefieldControl`", () => {
		control.readOnly = true;
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<TimefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const readOnlyWrapper = wrapper.find("div[data-id='properties-test-timefield']");
		expect(readOnlyWrapper.find("TextInput").prop("readOnly")).to.equal(control.readOnly);
	});
});

describe("error messages renders correctly for timefield controls", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const flyout = propertyUtils.flyoutEditorForm(TIMEFIELD_PARAM_DEF);
		controller = flyout.controller;
		wrapper = flyout.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show error message when time with invalid format is entered", () => {

		// Simulate entering an invalid date information
		let timeWrapper = wrapper.find("div[data-id='properties-time_hms']");
		const input = timeWrapper.find("input");
		input.simulate("change", { target: { value: "qqqqq" } });
		timeWrapper = wrapper.find("div[data-id='properties-time_hms']");
		// Check an error message is displayed with the expected error message.
		const timefieldErrorMessages = {
			"propertyId": {
				"name": "time_hms",
			},
			"required": false,
			"validation_id": "Format_time_hms_594.9764123314005",
			"type": "error",
			"text": "Invalid time. Format should be H:m:s.",
		};
		const actual = controller.getErrorMessage({ name: "time_hms" });
		expect(timefieldErrorMessages).to.eql(actual);
		let messageWrapper = timeWrapper.find("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);

		// // Now simulate entering a valid time with the correct format.
		input.simulate("change", { target: { value: "10:45:9" } });

		// Ensure the error message is no longer displayed.
		timeWrapper = wrapper.find("div[data-id='properties-time_hms']");
		messageWrapper = timeWrapper.find("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should show error message when empty string is entered in a required field", () => {
		// Simulate entering an empty string in a required field
		let timeWrapper = wrapper.find("div[data-id='properties-time_hms']");
		const input = timeWrapper.find("input");
		input.simulate("change", { target: { value: "" } });
		timeWrapper = wrapper.find("div[data-id='properties-time_hms']");
		// Check an error message is displayed with the expected error message.
		const timefieldErrorMessages = {
			"propertyId": {
				"name": "time_hms",
			},
			"required": true,
			"validation_id": "required_time_hms_594.9764123314005",
			"type": "error",
			"text": "You must enter a value for Required Time H:m:s.",
		};
		const actual = controller.getErrorMessage({ name: "time_hms" });

		expect(timefieldErrorMessages).to.eql(actual);
		let messageWrapper = timeWrapper.find("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);

		// Now simulate entering a valid time with the correct format.
		input.simulate("change", { target: { value: "10:45:9" } });

		// Ensure the error message is no longer displayed.
		timeWrapper = wrapper.find("div[data-id='properties-time_hms']");
		messageWrapper = timeWrapper.find("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should not show error message when empty string is entered in a non-required field", () => {
		// Simulate entering an empty string in a non-required field
		let timeWrapper = wrapper.find("div[data-id='properties-time_hms_non_req']");
		const input = timeWrapper.find("input");
		input.simulate("change", { target: { value: "" } });

		// Ensure an error message is not displayed.
		timeWrapper = wrapper.find("div[data-id='properties-time_hms_non_req']");
		const messageWrapper = timeWrapper.find("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should reveal time field when checkbox is clicked", () => {
		// First check the hidden field is not displayed
		let timeWrapper = wrapper.find("div[data-id='properties-hidden_time']");
		expect(timeWrapper).to.have.length(0);
		controller.updatePropertyValue({ name: "hide_time_field" }, false);
		wrapper.update();
		// After the checkbox is unchecked there should be no in-line style
		// applied to the time field (which makes it be hidden).
		timeWrapper = wrapper.find("div[data-id='properties-hidden_time']");
		expect(timeWrapper).to.have.length(1);
	});

	it("should enable time field when checkbox is clicked", () => {
		let timeWrapper = wrapper.find("div[data-id='properties-disabled_time']");
		expect(timeWrapper.find("input").prop("disabled")).to.equal(true);
		controller.updatePropertyValue({ name: "disable_time_field" }, false);
		wrapper.update();
		// After the checkbox is unchecked control should not be disabled
		timeWrapper = wrapper.find("div[data-id='properties-disabled_time']");
		expect(timeWrapper.find("input").prop("disabled")).to.equal(false);
	});
});

describe("timefield classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(TIMEFIELD_PARAM_DEF);
		wrapper = renderedObject.wrapper;
	});

	it("timefield should have custom classname defined", () => {
		expect(wrapper.find(".timefield-control-class")).to.have.length(1);
	});

	it("timefield should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "timefield-table-summary");
		expect(wrapper.find(".table-timefield-control-class")).to.have.length(1);
		expect(wrapper.find(".table-on-panel-timefield-control-class")).to.have.length(1);
		expect(wrapper.find(".table-subpanel-timefield-control-class")).to.have.length(1);
	});
});
