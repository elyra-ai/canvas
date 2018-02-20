/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
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
import selectschemaParamDef from "../../test_resources/paramDefs/selectschema_paramDef.json";


const controller = new Controller();

const control = {
	"name": "selectschema",
	"label": {
		"text": "selectschema"
	},
	"separateLabel": true,
	"description": {
		"text": "selectschema with parameter value set to 'Drugs_0'"
	},
	"controlType": "selectschema",
	"valueDef": {
		"propType": "structure",
		"isList": false,
		"isMap": false
	},
	"required": true
};

const propertyId = { name: "test-selectschema" };

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
		{ label: "Drugs_0", value: "Drugs_0" },
		{ label: "1", value: "1" },
		{ label: "Drugs_2", value: "Drugs_2" },
		{ label: "Drugs_3", value: "Drugs_3" },
		{ label: "random", value: "random" },
		{ label: "5", value: "5" },
		{ label: "6", value: "6" }
	];
	let wrapper;
	beforeEach(() => {
		wrapper = propertyUtils.flyoutEditorForm(selectschemaParamDef).wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("Validate selectschema rendered correctly", () => {
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
			{ label: "Drugs_0", value: "Drugs_0" },
			{ label: "1", value: "1" },
			{ label: "Drugs_2", value: "Drugs_2" },
			{ label: "Drugs_3", value: "Drugs_3" },
			{ label: "random", value: "random" },
			{ label: "5", value: "5" },
			{ label: "6", value: "6" }
		];
		expect(options).to.eql(phOptions);
	});
	it("Validate oneofselect_error should have warning message when set to Drugs_0", () => {
		let category = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the CONDITIONS category
		const newValue = { label: "Drugs_0", value: "Drugs_0" };
		propertyUtils.dropDown(category, 0, newValue, expectedOptions);
		// CONDITIONS category has index 2 now because alerts tab was added
		category = wrapper.find(".category-title-container-right-flyout-panel").at(2);
		expect(category.find(".validation-error-message-icon-dropdown")).to.have.length(1);
		expect(category.find(".validation-error-message-color-error")).to.have.length(1);
	});
	it("Validate oneofselect_warning should have warning message when set to 1", () => {
		let category = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the CONDITIONS category
		const newValue = { label: "1", value: "1" };
		propertyUtils.dropDown(category, 1, newValue, expectedOptions);
		// CONDITIONS category has index 2 now because alerts tab was added
		category = wrapper.find(".category-title-container-right-flyout-panel").at(2);
		expect(category.find(".validation-warning-message-icon-dropdown")).to.have.length(1);
		expect(category.find(".validation-error-message-color-warning")).to.have.length(1);
	});
});
