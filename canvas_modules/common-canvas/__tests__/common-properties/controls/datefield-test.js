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
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import DatefieldControl from "../../../src/common-properties/controls/datefield";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";
import CommonProperties from "./../../../src/common-properties/common-properties.jsx";
import datefieldParamDef from "../../test_resources/paramDefs/datefield_paramDef.json";
import DateField from "../../../src/common-properties/controls/datefield";
import { fireEvent, cleanup } from "@testing-library/react";

const DATEFIELD_PARAM_DEF = require("../../test_resources/paramDefs/datefield_paramDef.json");

const mockDatefield = jest.fn();
jest.mock("../../../src/common-properties/controls/datefield",
	() => (props) => mockDatefield(props)
);

mockDatefield.mockImplementation((props) => {
	const DatefieldComp = jest.requireActual(
		"../../../src/common-properties/controls/datefield",
	).default;
	return <DatefieldComp {...props} />;
});

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
	propertyUtilsRTL.setControls(controller, [control]);
	const propertyId = { name: "test-datefield" };

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-datefield": "1995-2-5" }
		);
	});
	it("props should have been defined", () => {
		render(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		expectJest(mockDatefield).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
			"controlItem": controlItem
		});
	});

	it("should render a `DatefieldControl`", () => {
		const wrapper = render(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const { container } = wrapper;
		const dateWrapper = container.querySelector("div[data-id='properties-test-datefield']");
		const input = dateWrapper.querySelectorAll("input");
		expect(input).to.have.length(1);
	});

	it("should allow a valid date to be entered in `DatefieldControl`", () => {
		const wrapper = render(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const { container } = wrapper;
		const dateWrapper = container.querySelector("div[data-id='properties-test-datefield']");
		const input = dateWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "2018-04-23" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("2018-04-23");
	});

	it("should allow invalid format date to be entered in `DatefieldControl`", () => {
		const wrapper = render(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const { container } = wrapper;
		const dateWrapper = container.querySelector("div[data-id='properties-test-datefield']");
		const input = dateWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "2-25-2016" } });

		// When invalid dates are entered they are not rejected but accepted and a messages is displayed
		// under the entry field to explain the error (see testcase below in next 'describe' section).
		// Therefore the invalid date string is stored in the controller. In this case, "2-25-2016" is
		// not in the correct format (because YYYY-M-D is expected) but it will be accepted by the controller
		// because invalid dates are accepted on entry.
		expect(controller.getPropertyValue(propertyId)).to.equal("2-25-2016");
	});


	it("should set correct state null in `DatefieldControl`", () => {
		const wrapper = render(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const { container } = wrapper;
		const dateWrapper = container.querySelector("div[data-id='properties-test-datefield']");
		const input = dateWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(null);
	});

	it("should set correct control type in `DatefieldControl`", () => {
		const wrapper = render(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const { container } = wrapper;
		const dateWrapper = container.querySelector("div[data-id='properties-test-datefield']");
		const input = dateWrapper.querySelector("input");
		expect(input.type).to.equal("text");
	});

	it("should set placeholder text in `DatefieldControl`", () => {
		const wrapper = render(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const { container } = wrapper;
		const dateWrapper = container.querySelector("div[data-id='properties-test-datefield']");
		const input = dateWrapper.querySelector("input");
		expect(input.placeholder).to.equal(control.additionalText);
	});

	it("should render `DatefieldControl` with light mode disabled", () => {
		controller.setLight(false);
		const wrapper = render(
			<DatefieldControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				controlItem={controlItem}
			/>
		);
		const { container } = wrapper;
		const dateWrapper = container.querySelector("div[data-id='properties-test-datefield']");
		expect(dateWrapper.querySelectorAll(".cds--text-input--light")).to.have.length(0);
	});
	it("Datefield helperText is rendered correctly", () => {
		control.helperText = "Datefield helperText";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<DateField
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const helpTextWrapper = container.querySelector("div[data-id='properties-test-datefield']");
		expect(helpTextWrapper.querySelector("div.cds--form__helper-text").textContent).to.equal(control.helperText);
	});

	it("DateField renders readonly correctly", () => {
		control.readOnly = true;
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<DateField
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				readOnly
			/>
		);
		const { container } = wrapper;
		const readOnlyWrapper = container.querySelector("div[data-id='properties-test-datefield']");
		expect(readOnlyWrapper.querySelector("input").readOnly).to.equal(control.readOnly);
	});
});

describe("error messages renders correctly for datefield controls", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(DATEFIELD_PARAM_DEF);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		cleanup();
	});

	it("should show error message when date with invalid format is entered", () => {
		const { container } = wrapper;
		// Simulate entering an invalid date information
		let dateWrapper = container.querySelector("div[data-id='properties-date_ymd']");
		const input = dateWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "qqqqq" } });

		dateWrapper = container.querySelector("div[data-id='properties-date_ymd']");
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
		let messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);

		// Now simulate entering a valid date with the correct format.
		fireEvent.change(input, { target: { value: "2012-2-25" } });

		dateWrapper = container.querySelector("div[data-id='properties-date_ymd']");
		// Ensure the error message is no longer displayed.
		messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	// This is a special case since we need special code to handle year numbers
	// greater than 9999 because such year numbers are parsed OK in non-ISO formats
	// but cannot be parsed as ISO format dates.
	it("should show error message when date with year number more than 9999 is entered", () => {
		// Simulate entering an invalid date information
		const { container } = wrapper;
		let dateWrapper = container.querySelector("div[data-id='properties-date_ymd']");
		const input = dateWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "10000-1-1" } });

		dateWrapper = container.querySelector("div[data-id='properties-date_ymd']");
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
		let messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);

		// Now simulate entering a valid date with the correct format.
		fireEvent.change(input, { target: { value: "9999-2-25" } });

		// Ensure the error message is no longer displayed.
		dateWrapper = container.querySelector("div[data-id='properties-date_ymd']");
		messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should show error message when empty string is entered in a required field", () => {
		// Simulate entering an empty string in a required field
		const { container } = wrapper;
		let dateWrapper = container.querySelector("div[data-id='properties-date_mdy']");
		const input = dateWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "" } });

		dateWrapper = container.querySelector("div[data-id='properties-date_mdy']");
		// Check an error message is displayed with the expected error message.
		const datefieldErrorMessages = {
			"propertyId": {
				"name": "date_mdy"
			},
			"required": true,
			"validation_id": "required_date_mdy_202.02932392909872",
			"type": "error",
			"text": "You must enter a value for Required Date M-D-Y.",
		};
		const actual = controller.getErrorMessage({ name: "date_mdy" });
		expect(datefieldErrorMessages).to.eql(actual);
		let messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);

		// Now simulate entering a valid date with the correct format.
		fireEvent.change(input, { target: { value: "2-25-1958" } });

		// Ensure the error message is no longer displayed.
		dateWrapper = container.querySelector("div[data-id='properties-date_mdy']");
		messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should not show error message when empty string is entered in a non-required field", () => {
		// Simulate entering an empty string in a non-required field
		const { container } = wrapper;
		let dateWrapper = container.querySelector("div[data-id='properties-date_ymd_non_req']");
		const input = dateWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "" } });

		// Ensure an error message is not displayed.
		dateWrapper = container.querySelector("div[data-id='properties-date_ymd_non_req']");
		const messageWrapper = dateWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(0);
	});

	it("should reveal date field when checkbox is clicked", () => {
		// First check the hidden field is not displayed (style.display should be
		// set to 'none').
		const { container, rerender } = wrapper;
		let dateWrapper = container.querySelectorAll("div[data-id='properties-hidden_date']");
		expect(dateWrapper).to.have.length(0);
		controller.updatePropertyValue({ name: "hide_date_field" }, false);
		const rerendered = propertyUtilsRTL.flyoutEditorFormRerender(DATEFIELD_PARAM_DEF);
		const { propertiesInfo, propertiesConfig, callbacks, customControls, customConditionOps } = rerendered;
		rerender(
			<div className="properties-right-flyout">
				<CommonProperties
					propertiesInfo={propertiesInfo}
					propertiesConfig={propertiesConfig}
					callbacks={callbacks}
					customControls={customControls}
					customConditionOps={customConditionOps}
				/>
			</div>);

		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it be hidden).
		dateWrapper = container.querySelectorAll("div[data-id='properties-hidden_date']");
		expect(dateWrapper).to.have.length(1);
	});

	it("should enable date field when checkbox is clicked", () => {
		// First check the disbaled field is showing disabled color.
		const { container, rerender } = wrapper;
		let dateWrapper = container.querySelector("div[data-id='properties-disabled_date']");
		expect(dateWrapper.querySelector("input").disabled).to.equal(true);
		controller.updatePropertyValue({ name: "disable_date_field" }, false);
		const rerendered = propertyUtilsRTL.flyoutEditorFormRerender(DATEFIELD_PARAM_DEF);
		const { propertiesInfo, propertiesConfig, callbacks, customControls, customConditionOps } = rerendered;
		rerender(
			<div className="properties-right-flyout">
				<CommonProperties
					propertiesInfo={propertiesInfo}
					propertiesConfig={propertiesConfig}
					callbacks={callbacks}
					customControls={customControls}
					customConditionOps={customConditionOps}
				/>
			</div>);
		// After the checkbox is unchecked there should be no in-line style
		// applied to the date field (which makes it show as enabled).
		dateWrapper = container.querySelector("div[data-id='properties-disabled_date']");
		expect(dateWrapper.querySelector("input").disabled).to.equal(false);
	});

	it("should render `DatefieldControl` with light mode enabled", () => {
		const { container } = wrapper;
		const dateWrapper = container.querySelector("div[data-id='properties-ctrl-date_mdy']");
		expect(dateWrapper.querySelectorAll(".cds--layer-two")).to.have.length(1); // light enabled
		expect(dateWrapper.querySelectorAll(".cds--layer-one")).to.have.length(0); // light disabled
	});
});

describe("datefield classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(datefieldParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("datefield should have custom classname defined", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll(".datefield-control-class")).to.have.length(1);
	});

	it("datefield should have custom classname defined in table cells", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "datefield-table-summary");
		expect(container.querySelectorAll(".table-datefield-control-class")).to.have.length(1);
		expect(container.querySelectorAll(".table-on-panel-datefield-control-class")).to.have.length(1);
		expect(container.querySelectorAll(".table-subpanel-datefield-control-class")).to.have.length(1);
	});
});
