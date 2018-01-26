/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import OneofselectControl from "../../../src/common-properties/editor-controls/oneofselect-control.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import oneofselectParamDef from "../../test_resources/paramDefs/oneofselect_paramDef.json";


const controller = new Controller();

const control = {
	"name": "method",
	"label": {
		"text": "Merge method"
	},
	"separateLabel": true,
	"controlType": "oneofselect",
	"valueDef": {
		"propType": "string",
		"isList": false,
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

const propertyId = { name: "test-oneofselect" };

describe("DropdownControl renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<OneofselectControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a DropdownControl", () => {
		const wrapper = mount(
			<OneofselectControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".Dropdown-control-panel");
		expect(input).to.have.length(1);
	});

});

describe("oneofselect works correctly in common-properties", () => {
	const expectedOptions = [
		{ label: "...", value: "" },
		{ label: "red", value: "red" },
		{ label: "orange", value: "orange" },
		{ label: "yellow", value: "yellow" },
		{ label: "green", value: "green" },
		{ label: "blue", value: "blue" },
		{ label: "purple", value: "purple" }
	];
	let wrapper;
	beforeEach(() => {
		wrapper = propertyUtils.flyoutEditorForm(oneofselectParamDef).wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("Validate oneofselect rendered correctly", () => {
		const category = wrapper.find(".category-title-container-right-flyout-panel").at(0); // get the VALUES category
		const dropDowns = category.find("Dropdown");
		expect(dropDowns).to.have.length(6);
		const options = dropDowns.at(0).prop("options"); // oneofselect
		expect(options).to.eql(expectedOptions);
	});
	it("Validate oneofselect_placeholder rendered correctly", () => {
		const category = wrapper.find(".category-title-container-right-flyout-panel").at(0); // get the VALUES category
		const dropDowns = category.find("Dropdown");
		expect(dropDowns).to.have.length(6);
		const options = dropDowns.at(5).prop("options"); // oneofselect_placeholder
		const phOptions = [
			{ label: "None...", value: "" },
			{ label: "red", value: "red" },
			{ label: "orange", value: "orange" },
			{ label: "yellow", value: "yellow" },
			{ label: "green", value: "green" },
			{ label: "blue", value: "blue" },
			{ label: "purple", value: "purple" }
		];
		expect(options).to.eql(phOptions);
	});
	it("Validate oneofselect_error should have warning message when set to red", () => {
		const category = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the CONDITIONS category
		const newValue = { label: "red", value: "red" };
		propertyUtils.dropDown(category, 0, newValue, expectedOptions);
		expect(category.find(".validation-error-message-icon-dropdown")).to.have.length(1);
		expect(category.find(".validation-error-message-color-error")).to.have.length(1);
	});
	it("Validate oneofselect_warning should have warning message when set to yellow", () => {
		const category = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the CONDITIONS category
		const newValue = { label: "yellow", value: "yellow" };
		propertyUtils.dropDown(category, 1, newValue, expectedOptions);
		expect(category.find(".validation-warning-message-icon-dropdown")).to.have.length(1);
		expect(category.find(".validation-error-message-color-warning")).to.have.length(1);
	});
});
