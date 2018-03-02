/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

import React from "react";
import propertyUtils from "../../_utils_/property-utils";
import DatefieldControl from "../../../src/common-properties/editor-controls/datefield-control.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import isEqual from "lodash/isEqual";

const DATEFIELD_PARAM_DEF = require("../../test_resources/paramDefs/datefield_paramDef.json");

const controller = new Controller();

const control = {
	name: "test-datefield",
	additionalText: "Enter date",
	valueDef: {
		isList: false,
		propType: "date"
	}
};

const propertyId = { name: "test-datefield" };

function setPropertyValue() {
	controller.setPropertyValues(
		{ "test-datefield": "1995-2-5" }
	);
}

describe("datefield-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<DatefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `DatefieldControl`", () => {
		const wrapper = mount(
			<DatefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']"); // input dom element will have type 'text' for a date field.
		expect(input).to.have.length(1);
	});

	it("should allow a valid date to be entered in `DatefieldControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<DatefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']"); // input dom element will have type 'text' for a date field.
		input.simulate("change", { target: { value: "2018-04-23" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("2018-04-23");
	});

	it("should allow invalid format date to be entered in `DatefieldControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<DatefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']"); // input dom element will have type 'text' for a date field.
		input.simulate("change", { target: { value: "2-25-2016" } });

		// When invalid dates are entered they are not rejected but accepted and a messages is displayed
		// under the entry field to explain the error (see testcase below in next 'describe' section).
		// Therefore the invalid date string is stored in the controller. In this case, "2-25-2016" is
		// not in the correct format (because YYYY-M-D is expected) but it will be accepted by the controller
		// because invalid dates are accepted on entry.
		expect(controller.getPropertyValue(propertyId)).to.equal("2-25-2016");
	});


	it("should set correct state null in `DatefieldControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<DatefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']"); // input dom element will have type 'text' for a date field.
		input.simulate("change", { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(null);
	});

	it("should set correct control type in `DatefieldControl`", () => {
		const wrapper = mount(
			<DatefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']"); // input dom element will have type 'text' for a date field.
		expect(input.get(0).type).to.equal("text");
	});

	it("should set placeholder text in `DatefieldControl`", () => {
		const wrapper = mount(
			<DatefieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='text']");
		expect(input.get(0).placeholder).to.equal(control.additionalText);
	});
});

describe("error messages renders correctly for datefield controls", () => {
	it("should show error message when date with invalid format is entered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(DATEFIELD_PARAM_DEF);
		const wrapper = renderedObject.wrapper;

		// Simulate entering an invalid date information
		let input = wrapper.find("#editor-control-date_ymd");
		input.simulate("change", { target: { value: "qqqqq" } });
		wrapper.update();

		// Check an error message is displayed with the expected error message.
		const datefieldErrorMessages = {
			"type": "error",
			"text": "Invalid date. Format should be YYYY-M-D",
		};
		const actual = renderedObject.controller.getErrorMessage({ name: "date_ymd" });

		expect(isEqual(JSON.parse(JSON.stringify(datefieldErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);

		// Now simulate entering a valid date with the correct format.
		input = wrapper.find("#editor-control-date_ymd");
		input.simulate("change", { target: { value: "2012-2-25" } });
		wrapper.update();

		// Ensure the error message is no longer displayed.
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(0);
		expect(wrapper.find(".form__validation--error")).to.have.length(0);
	});

	// This is a special case since we need special code to handle year numbers
	// greater than 9999 because such year numbers are parsed OK in non-ISO formats
	// but cannot be parsed as ISO format dates.
	it("should show error message when date with year number more than 9999 is entered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(DATEFIELD_PARAM_DEF);
		const wrapper = renderedObject.wrapper;

		// Simulate entering an invalid date information
		let input = wrapper.find("#editor-control-date_ymd");
		input.simulate("change", { target: { value: "10000-1-1" } });
		wrapper.update();

		// Check an error message is displayed with the expected error message.
		const datefieldErrorMessages = {
			"type": "error",
			"text": "Invalid date. Format should be YYYY-M-D",
		};
		const actual = renderedObject.controller.getErrorMessage({ name: "date_ymd" });

		expect(isEqual(JSON.parse(JSON.stringify(datefieldErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);


		// Now simulate entering a valid date with the correct format.
		input = wrapper.find("#editor-control-date_ymd");
		input.simulate("change", { target: { value: "9999-2-25" } });
		wrapper.update();

		// Ensure the error message is no longer displayed.
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(0);
		expect(wrapper.find(".form__validation--error")).to.have.length(0);
	});

	it("should show error message when empty string is entered in a required field", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(DATEFIELD_PARAM_DEF);
		const wrapper = renderedObject.wrapper;

		// Simulate entering an empty string in a required field
		let input = wrapper.find("#editor-control-date_mdy");
		input.simulate("change", { target: { value: "" } });
		wrapper.update();

		// Check an error message is displayed with the expected error message.
		const datefieldErrorMessages = {
			"type": "error",
			"text": "Required parameter 'Required Date M-D-Y' has no value",
		};
		const actual = renderedObject.controller.getErrorMessage({ name: "date_mdy" });

		// console.log("Error - " + JSON.stringify(actual));

		expect(isEqual(JSON.parse(JSON.stringify(datefieldErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);

		// Now simulate entering a valid date with the correct format.
		input = wrapper.find("#editor-control-date_mdy");
		input.simulate("change", { target: { value: "2-25-1958" } });
		wrapper.update();

		// Ensure the error message is no longer displayed.
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(0);
		expect(wrapper.find(".form__validation--error")).to.have.length(0);
	});

	it("should not show error message when empty string is entered in a non-required field", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(DATEFIELD_PARAM_DEF);
		const wrapper = renderedObject.wrapper;

		// Simulate entering an empty string in a non-required field
		const input = wrapper.find("#editor-control-date_ymd_non_req");
		input.simulate("change", { target: { value: "" } });
		wrapper.update();

		// Ensure an error message is not displayed.
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(0);
		expect(wrapper.find(".form__validation--error")).to.have.length(0);
	});

	it("should reveal date field when checkbox is clicked", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(DATEFIELD_PARAM_DEF);
		const wrapper = renderedObject.wrapper;

		// First check the hidden field is not displayed (style.display should be
		// set to 'none').
		const input = wrapper.find("#editor-control-hidden_date");
		expect(isEqual(input.props().style.display, "none")).to.be.true;

		// Get the 'Hide hidden date' checkbox input control.
		const checkbox = wrapper.find("#editor-control-hide_date_field");

		// First check to see if it is checked
		expect(checkbox.prop("checked")).to.be.true;

		// Simulate clicking the 'Hide hidden date' checkbox
		checkbox.simulate("change", { target: { checked: false } });
		wrapper.update();

		// Now check to see if it is unchecked.
		expect(checkbox.prop("checked")).to.be.false;

		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it be hidden).
		expect(isEqual(typeof input.props().style.display, "undefined")).to.be.true;
	});

	it("should enable date field when checkbox is clicked", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(DATEFIELD_PARAM_DEF);
		const wrapper = renderedObject.wrapper;

		// First check the disbaled field is showing disabled color.
		const input = wrapper.find("#editor-control-disabled_date");
		expect(isEqual(input.props().style.color, "#c7c7c7")).to.be.true;

		// Get the 'Enable disabled date' checkbox input control.
		const checkbox = wrapper.find("#editor-control-disable_date_field");

		// First check to see if it is checked
		expect(checkbox.prop("checked")).to.be.true;

		// Simulate clicking the 'Hide hidden date' checkbox
		checkbox.simulate("change", { target: { checked: false } });
		wrapper.update();

		// Now check to see if it is unchecked.
		expect(checkbox.prop("checked")).to.be.false;

		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it show as enabled).
		expect(isEqual(typeof input.props().style.color, "undefined")).to.be.true;
	});
});
