/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import SelectSchemaControl from "../../../src/common-properties/controls/dropdown";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import selectschemaParamDef from "../../test_resources/paramDefs/selectschema_paramDef.json";


const controller = new Controller();

const emptyValueIndicator = "...";

const control = {
	"name": "selectschema",
	"label": {
		"text": "selectschema"
	},
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

// controls selectColumn, selectSchema and oneofselect are all dropdown controls.
// a set of dropdown basic unit test cases are defined in oneofselect-test.js and
// do not need to be repeated in selectColumn and selectSchema.
describe("selectschema renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<SelectSchemaControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});
	it("should have '...' as first selected option", () => {
		controller.setPropertyValues(
			{ "test-selectschema": null }
		);
		const wrapper = mount(
			<SelectSchemaControl
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-test-selectschema']");
		expect(dropdownWrapper.find("div > span").text()).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("div[role='button']");
		dropdownButton.simulate("click");
		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-test-selectschema']");
		const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
		expect(dropdownList).to.be.length(1);
		expect(dropdownList.at(0).text()).to.equal(emptyValueIndicator);
	});
});

describe("selectschema works correctly in common-properties", () => {
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
	let propertiesController;
	beforeEach(() => {
		const flyout = propertyUtils.flyoutEditorForm(selectschemaParamDef);
		propertiesController = flyout.controller;
		wrapper = flyout.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("Validate selectschema rendered correctly", () => {
		const dropDown = wrapper.find("div[data-id='properties-selectschema'] DropdownV2");
		const options = dropDown.prop("items"); // selectschema
		expect(options).to.eql(expectedOptions);
	});
	it("Validate selectschema_placeholder rendered correctly", () => {
		const dropDown = wrapper.find("div[data-id='properties-selectschema_placeholder'] DropdownV2");
		expect(dropDown.find("div > span").text()).to.equal("None...");
	});
	it("Validate selectschema can select ''", () => {
		let dropDown = wrapper.find("div[data-id='properties-selectschema'] DropdownV2");
		// open the dropdown
		const dropdownButton = dropDown.find("div[role='button']");
		dropdownButton.simulate("click");
		// select the first item
		dropDown = wrapper.find("div[data-id='properties-selectschema'] DropdownV2");
		const dropdownList = dropDown.find("div.bx--list-box__menu-item");
		dropdownList.at(0).simulate("click");
		expect(propertiesController.getPropertyValue({ name: "selectschema" })).to.equal("");
	});
});
