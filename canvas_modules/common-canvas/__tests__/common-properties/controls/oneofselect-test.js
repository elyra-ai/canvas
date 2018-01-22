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

// This test throws a TypeError: me.getRootNode is not a function
// Removing the test from here and adding it to chimp
// describe("condition messages renders correctly with dropDown control", () => {
// 	it("oneofselectAnimals control should have warning message from empty selection", () => {
// 		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);
//
// 		const dropdownContainer = wrapper.find("#oneofselect-control-container").at(0);
// 		const dropdown = dropdownContainer.find(".Dropdown-control-panel");
// 		expect(dropdown).to.have.length(1);
// 		dropdown.find(".Dropdown-control").simulate("click");
// 		wrapper.update();
// 		expect(dropdownContainer.find(".validation-warning-message-icon-dropdown")).to.have.length(1);
// 		expect(dropdownContainer.find(".validation-error-message-color-warning")).to.have.length(1);
// 	});
// });
