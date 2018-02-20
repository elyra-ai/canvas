/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import SomeOfSelectControl from "../../../src/common-properties/editor-controls/someofselect-control.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import SomeOfSelectParamDef from "../../test_resources/paramDefs/someofselect_paramDef.json";


const controller = new Controller();

const control = {
	"name": "method",
	"label": {
		"text": "Merge method"
	},
	"separateLabel": true,
	"controlType": "someofselect",
	"valueDef": {
		"propType": "string",
		"isList": true,
		"isMap": false
	},
	"values": [
		"Order",
		"Keys",
		"Condition",
		"Gtt"
	],
	"valueLabels": [
		"Order",
		"Keys",
		"Condition",
		"Ranked condition"
	]
};

const propertyId = { name: "test-someofselect" };

describe("Multi-select renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<SomeOfSelectControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a Multi-select control", () => {
		const wrapper = mount(
			<SomeOfSelectControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".form-control");
		expect(input).to.have.length(1);
	});
});

describe("someofselect works correctly in common-properties", () => {
	const expectedOption = { "value": "green", "children": "green" };
	let wrapper;
	let controller1;
	beforeEach(() => {
		const form = propertyUtils.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = form.wrapper;
		controller1 = form.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("Validate someofselect rendered correctly", () => {
		const category = wrapper.find(".category-title-container-right-flyout-panel").at(0); // get the VALUES category
		const controls = category.find("FormControl");
		expect(controls).to.have.length(5);
		const options = controls.at(0).find("option"); // someeofselect
		expect(options.at(3).props()).to.eql(expectedOption);
	});
	it("Validate someofselect_error should have warning message when set to red", () => {
		controller1.updatePropertyValue({ name: "someofselect_error" }, ["red"]);
		const category = wrapper.find(".category-title-container-right-flyout-panel").at(2); // get the CONDITIONS category
		expect(category.find(".validation-error-message-icon-selection")).to.have.length(1);
		expect(category.find(".validation-error-message-color-error")).to.have.length(1);
	});
	it("Validate someofselect_warning should have warning message when set to yellow", () => {
		controller1.updatePropertyValue({ name: "someofselect_warning" }, ["yellow", "green"]);
		const category = wrapper.find(".category-title-container-right-flyout-panel").at(2); // get the CONDITIONS category
		expect(category.find(".validation-warning-message-icon-selection")).to.have.length(1);
		expect(category.find(".validation-error-message-color-warning")).to.have.length(1);
	});
	it("Validate someofselect_disabled should have options filtered by enum_filter", () => {
		const category = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the CONDITIONS category
		const checkbox = category.find("#editor-control-disable").at(0);
		const evt = { target: { checked: false } };
		checkbox.simulate("change", evt);
		const select = category.find("#editor-control-someofselect_disabled").at(0);
		const options = select.find("option");
		expect(options).to.have.length(3);
	});
});
