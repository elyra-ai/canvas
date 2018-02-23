/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017 ,2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

import React from "react";
import propertyUtils from "../../_utils_/property-utils";
import TimefieldControl from "../../../src/common-properties/editor-controls/timefield-control.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import isEqual from "lodash/isEqual";

const TIMEIELD_PARAM_DEF = require("../../test_resources/paramDefs/timefield_paramDef.json");

const controller = new Controller();

const control = {
	name: "test-timefield",
	additionalText: "Enter time",
	valueDef: {
		isList: false,
		propType: "time"
	}
};

const propertyId = { name: "test-timefield" };

function setPropertyValue() {
	controller.setPropertyValues(
		{ "test-timefield": "05:12:48" }
	);
}

describe("timefield-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<TimefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `TimefieldControl`", () => {
		const wrapper = mount(
			<TimefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']"); // input dom element will have type 'text' for a time field.
		expect(input).to.have.length(1);
	});

	it("should allow a valid time to be entered in `TimefieldControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<TimefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']"); // input dom element will have type 'text' for a time field.
		input.simulate("change", { target: { value: "10:06:21" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("10:06:21+00:00");
	});

	it("should allow invalid format date to be entered in `TimefieldControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<TimefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']"); // input dom element will have type 'text' for a time field.
		input.simulate("change", { target: { value: "1000:06:21" } });

		// When invalid times are entered they are not rejected but accepted and a messages is displayed
		// under the entry field to explain the error (see testcase below in next 'describe' section).
		// Therefore the invalid time string is stored in the controller. In this case, "1000:06:21" is
		// not correct because 1000 hours is wrong but it will be accepted by the controller
		// because invalid times are accepted on entry.
		expect(controller.getPropertyValue(propertyId)).to.equal("1000:06:21");
	});

	it("should set correct state null in `TimefieldControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<TimefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']"); // input dom element will have type 'text' for a time field.
		input.simulate("change", { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(null);
	});

	it("should set correct control type in `TimefieldControl`", () => {
		const wrapper = mount(
			<TimefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']"); // input dom element will have type 'text' for a time field.
		expect(input.get(0).type).to.equal("text");
	});

	it("should set placeholder text in `TimefieldControl`", () => {
		const wrapper = mount(
			<TimefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']");
		expect(input.get(0).placeholder).to.equal(control.additionalText);
	});
});

describe("error messages renders correctly for timefield controls", () => {
	it("should show error message when time with invalid format is entered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(TIMEIELD_PARAM_DEF);
		const wrapper = renderedObject.wrapper;

		// Simulate entering an invalid date information
		let input = wrapper.find("#editor-control-time_hms");
		input.simulate("change", { target: { value: "qqqqq" } });
		wrapper.update();

		// Check an error message is displayed with the expected error message.
		const timefieldErrorMessages = {
			"type": "error",
			"text": "Invalid time. Format should be H:m:s",
		};
		const actual = renderedObject.controller.getErrorMessage({ name: "time_hms" });

		expect(isEqual(JSON.parse(JSON.stringify(timefieldErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);

		// // Now simulate entering a valid time with the correct format.
		input = wrapper.find("#editor-control-time_hms");
		input.simulate("change", { target: { value: "10:45:9" } });
		wrapper.update();

		// Ensure the error message is no longer displayed.
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(0);
		expect(wrapper.find(".form__validation--error")).to.have.length(0);
	});

	it("should show error message when empty string is entered in a required field", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(TIMEIELD_PARAM_DEF);
		const wrapper = renderedObject.wrapper;

		// Simulate entering an empty string in a required field
		let input = wrapper.find("#editor-control-time_hms");
		input.simulate("change", { target: { value: "" } });
		wrapper.update();

		// Check an error message is displayed with the expected error message.
		const timefieldErrorMessages = {
			"type": "error",
			"text": "Required parameter 'Required Time H:m:s' has no value",
		};
		const actual = renderedObject.controller.getErrorMessage({ name: "time_hms" });

		// console.log("Error - " + JSON.stringify(actual));

		expect(isEqual(JSON.parse(JSON.stringify(timefieldErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);

		// Now simulate entering a valid time with the correct format.
		input = wrapper.find("#editor-control-time_hms");
		input.simulate("change", { target: { value: "10:45:9" } });
		wrapper.update();

		// Ensure the error message is no longer displayed.
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(0);
		expect(wrapper.find(".form__validation--error")).to.have.length(0);
	});

	it("should not show error message when empty string is entered in a non-required field", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(TIMEIELD_PARAM_DEF);
		const wrapper = renderedObject.wrapper;

		// Simulate entering an empty string in a non-required field
		const input = wrapper.find("#editor-control-time_hms_non_req");
		input.simulate("change", { target: { value: "" } });
		wrapper.update();

		// Ensure an error message is not displayed.
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(0);
		expect(wrapper.find(".form__validation--error")).to.have.length(0);
	});

	it("should reveal time field when checkbox is clicked", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(TIMEIELD_PARAM_DEF);
		const wrapper = renderedObject.wrapper;

		// First check the hidden field is not displayed (style.display should be
		// set to 'none').
		const input = wrapper.find("#editor-control-hidden_time");
		expect(isEqual(input.props().style.display, "none")).to.be.true;

		// Get the 'Hide hidden time' checkbox input control.
		const checkbox = wrapper.find("#editor-control-hide_time_field");

		// First check to see if it is checked
		expect(checkbox.prop("checked")).to.be.true;

		// Simulate clicking the 'Hide hidden time' checkbox
		checkbox.simulate("change", { target: { checked: false } });
		wrapper.update();

		// Now check to see if it is unchecked.
		expect(checkbox.prop("checked")).to.be.false;

		// After the checkbox is unchecked there should be no in-line style
		// applied to the time field (which makes it be hidden).
		expect(isEqual(input.props().style, {})).to.be.true;
	});

	it("should enable time field when checkbox is clicked", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(TIMEIELD_PARAM_DEF);
		const wrapper = renderedObject.wrapper;

		// First check the disbaled field is showing disabled color.
		const input = wrapper.find("#editor-control-disabled_time");
		expect(isEqual(input.props().style.color, "#c7c7c7")).to.be.true;

		// Get the 'Enable disabled time' checkbox input control.
		const checkbox = wrapper.find("#editor-control-disable_time_field");

		// First check to see if it is checked
		expect(checkbox.prop("checked")).to.be.true;

		// Simulate clicking the 'Hide hidden time' checkbox
		checkbox.simulate("change", { target: { checked: false } });
		wrapper.update();

		// Now check to see if it is unchecked.
		expect(checkbox.prop("checked")).to.be.false;

		// After the checkbox is unchecked there should be no in-line style
		// applied to the time field (which makes it show as enabled).
		expect(isEqual(input.props().style, {})).to.be.true;
	});
});
