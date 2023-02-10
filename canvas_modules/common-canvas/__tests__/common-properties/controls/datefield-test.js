/*
 * Copyright 2017-2022 Elyra Authors
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
import DatefieldControl from "../../../src/common-properties/controls/datefield";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import datefieldParamDef from "../../test_resources/paramDefs/datefield_paramDef.json";

const DATEFIELD_PARAM_DEF = require("../../test_resources/paramDefs/datefield_paramDef.json");

describe("datefield-control renders correctly", () => {
	const controller = new Controller();

	const control = {
		name: "test-datefield",
		additionalText: "Enter date",
		valueDef: {
			isList: false,
			propType: "date"
		},
		light: true
	};
	const controlItem = <span>"Label"</span>;
	propertyUtils.setControls(controller, [control]);
	const propertyId = { name: "test-datefield" };

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-datefield": "1995-2-5" }
		);
	});
	it("props should have been defined", () => {
		const wrapper = mount(
			<DatefieldControl
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

	it("should render a `DatefieldControl`", () => {
		const wrapper = mount(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const dateWrapper = wrapper.find("div[data-id='properties-test-datefield']");
		const input = dateWrapper.find("input");
		expect(input).to.have.length(1);
	});

	it("should allow a valid date to be entered in `DatefieldControl`", () => {
		const wrapper = mount(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const dateWrapper = wrapper.find("div[data-id='properties-test-datefield']");
		const input = dateWrapper.find("input");
		input.simulate("change", { target: { value: "2018-04-23" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("2018-04-23");
	});

	it("should allow invalid format date to be entered in `DatefieldControl`", () => {
		const wrapper = mount(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const dateWrapper = wrapper.find("div[data-id='properties-test-datefield']");
		const input = dateWrapper.find("input");
		input.simulate("change", { target: { value: "2-25-2016" } });

		// When invalid dates are entered they are not rejected but accepted and a messages is displayed
		// under the entry field to explain the error (see testcase below in next 'describe' section).
		// Therefore the invalid date string is stored in the controller. In this case, "2-25-2016" is
		// not in the correct format (because YYYY-M-D is expected) but it will be accepted by the controller
		// because invalid dates are accepted on entry.
		expect(controller.getPropertyValue(propertyId)).to.equal("2-25-2016");
	});


	it("should set correct state null in `DatefieldControl`", () => {
		const wrapper = mount(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const dateWrapper = wrapper.find("div[data-id='properties-test-datefield']");
		const input = dateWrapper.find("input");
		input.simulate("change", { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(null);
	});

	it("should set correct control type in `DatefieldControl`", () => {
		const wrapper = mount(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const dateWrapper = wrapper.find("div[data-id='properties-test-datefield']");
		const input = dateWrapper.find("input");
		expect(input.getDOMNode().type).to.equal("text");
	});

	it("should set placeholder text in `DatefieldControl`", () => {
		const wrapper = mount(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const dateWrapper = wrapper.find("div[data-id='properties-test-datefield']");
		const input = dateWrapper.find("input");
		expect(input.getDOMNode().placeholder).to.equal(control.additionalText);
	});

	it("should render `DatefieldControl` with light mode enabled", () => {
		controller.setLight(true);
		const wrapper = mount(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const dateWrapper = wrapper.find("div[data-id='properties-test-datefield']");
		expect(dateWrapper.find(".bx--text-input--light")).to.have.length(1);
	});

	it("should render `DatefieldControl` with light mode disabled", () => {
		controller.setLight(false);
		const wrapper = mount(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const dateWrapper = wrapper.find("div[data-id='properties-test-datefield']");
		expect(dateWrapper.find(".bx--text-input--light")).to.have.length(0);
	});
});

describe("error messages renders correctly for datefield controls", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(DATEFIELD_PARAM_DEF);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("should show error message when date with invalid format is entered", () => {

		// Simulate entering an invalid date information
		let dateWrapper = wrapper.find("div[data-id='properties-date_ymd']");
		const input = dateWrapper.find("input");
		input.simulate("change", { target: { value: "qqqqq" } });

		dateWrapper = wrapper.find("div[data-id='properties-date_ymd']");
		// Check an error message is displayed with the expected error message.
		const datefieldErrorMessages = {
			"propertyId": {
				"name": "date_ymd"
			},
			"required": false,
			"validation_id": "Format_date_ymd_60.39173748626829",
			"type": "error",
			"text": "Invalid date. Format should be YYYY-M-D.",
		};
		const actual = controller.getErrorMessage({ name: "date_ymd" });
		expect(datefieldErrorMessages).to.eql(actual);
		let messageWrapper = dateWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(1);

		// Now simulate entering a valid date with the correct format.
		input.simulate("change", { target: { value: "2012-2-25" } });

		dateWrapper = wrapper.find("div[data-id='properties-date_ymd']");
		// Ensure the error message is no longer displayed.
		messageWrapper = dateWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	// This is a special case since we need special code to handle year numbers
	// greater than 9999 because such year numbers are parsed OK in non-ISO formats
	// but cannot be parsed as ISO format dates.
	it("should show error message when date with year number more than 9999 is entered", () => {
		// Simulate entering an invalid date information
		let dateWrapper = wrapper.find("div[data-id='properties-date_ymd']");
		const input = dateWrapper.find("input");
		input.simulate("change", { target: { value: "10000-1-1" } });

		dateWrapper = wrapper.find("div[data-id='properties-date_ymd']");
		// Check an error message is displayed with the expected error message.
		const datefieldErrorMessages = {
			"propertyId": {
				"name": "date_ymd"
			},
			"required": false,
			"validation_id": "Format_date_ymd_60.39173748626829",
			"type": "error",
			"text": "Invalid date. Format should be YYYY-M-D.",
		};
		const actual = controller.getErrorMessage({ name: "date_ymd" });

		expect(datefieldErrorMessages).to.eql(actual);
		let messageWrapper = dateWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(1);

		// Now simulate entering a valid date with the correct format.
		input.simulate("change", { target: { value: "9999-2-25" } });

		// Ensure the error message is no longer displayed.
		dateWrapper = wrapper.find("div[data-id='properties-date_ymd']");
		messageWrapper = dateWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should show error message when empty string is entered in a required field", () => {
		// Simulate entering an empty string in a required field
		let dateWrapper = wrapper.find("div[data-id='properties-date_mdy']");
		const input = dateWrapper.find("input");
		input.simulate("change", { target: { value: "" } });

		dateWrapper = wrapper.find("div[data-id='properties-date_mdy']");
		// Check an error message is displayed with the expected error message.
		const datefieldErrorMessages = {
			"propertyId": {
				"name": "date_mdy"
			},
			"required": true,
			"validation_id": "required_date_mdy_202.02932392909872",
			"type": "error",
			"text": "You must provide your Required Date M-D-Y.",
		};
		const actual = controller.getErrorMessage({ name: "date_mdy" });
		expect(datefieldErrorMessages).to.eql(actual);
		let messageWrapper = dateWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(1);

		// Now simulate entering a valid date with the correct format.
		input.simulate("change", { target: { value: "2-25-1958" } });

		// Ensure the error message is no longer displayed.
		dateWrapper = wrapper.find("div[data-id='properties-date_mdy']");
		messageWrapper = dateWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should not show error message when empty string is entered in a non-required field", () => {
		// Simulate entering an empty string in a non-required field
		let dateWrapper = wrapper.find("div[data-id='properties-date_ymd_non_req']");
		const input = dateWrapper.find("input");
		input.simulate("change", { target: { value: "" } });

		// Ensure an error message is not displayed.
		dateWrapper = wrapper.find("div[data-id='properties-date_ymd_non_req']");
		const messageWrapper = dateWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should reveal date field when checkbox is clicked", () => {
		// First check the hidden field is not displayed (style.display should be
		// set to 'none').
		let dateWrapper = wrapper.find("div[data-id='properties-hidden_date']");
		expect(dateWrapper).to.have.length(0);
		controller.updatePropertyValue({ name: "hide_date_field" }, false);
		wrapper.update();
		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it be hidden).
		dateWrapper = wrapper.find("div[data-id='properties-hidden_date']");
		expect(dateWrapper).to.have.length(1);
	});

	it("should enable date field when checkbox is clicked", () => {
		// First check the disbaled field is showing disabled color.
		let dateWrapper = wrapper.find("div[data-id='properties-disabled_date']");
		expect(dateWrapper.find("input").prop("disabled")).to.equal(true);
		controller.updatePropertyValue({ name: "disable_date_field" }, false);
		wrapper.update();
		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it show as enabled).
		dateWrapper = wrapper.find("div[data-id='properties-disabled_date']");
		expect(dateWrapper.find("input").prop("disabled")).to.equal(false);
	});
});

describe("datefield classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(datefieldParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("datefield should have custom classname defined", () => {
		expect(wrapper.find(".datefield-control-class")).to.have.length(1);
	});

	it("datefield should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "datefield-table-summary");
		expect(wrapper.find(".table-datefield-control-class")).to.have.length(1);
		expect(wrapper.find(".table-on-panel-datefield-control-class")).to.have.length(1);
		expect(wrapper.find(".table-subpanel-datefield-control-class")).to.have.length(1);
	});
});
