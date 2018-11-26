/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import OneofselectControl from "../../../src/common-properties/controls/dropdown";
import propertyUtils from "../../_utils_/property-utils";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";

import oneofselectParamDef from "../../test_resources/paramDefs/oneofselect_paramDef.json";


describe("oneofselect renders correctly", () => {

	const propertyName = "test-oneofselect";
	const propertyId = { name: propertyName };
	const emptyValueIndicator = "...";

	const controller = new Controller();
	const control = {
		"name": "test-oneofselect",
		"label": {
			"text": "oneofselect"
		},
		"description": {
			"text": "oneofselect description"
		},
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
	propertyUtils.setControls(controller, [control]);
	afterEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});
	it("props should have been defined", () => {
		const wrapper = mount(
			<OneofselectControl
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

	it("should render a oneofselect with empty value label", () => {
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		const dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.find("div > span").text()).to.equal(emptyValueIndicator);
	});
	it("dropdown handles null correctly", () => {
		controller.setPropertyValues(
			{ propertyName: null }
		);
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.find("div > span").text()).to.equal(emptyValueIndicator);
		const dropdownButton = dropdownWrapper.find("div[role='button']");
		dropdownButton.simulate("click");

		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		dropdownList.at(0).simulate("click");
		expect(controller.getPropertyValue(propertyId)).to.equal(control.values[0]);
	});
	it("dropdown handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.find("div > span").text()).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("div[role='button']");
		dropdownButton.simulate("click");
		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		dropdownList.at(0).simulate("click");
		expect(controller.getPropertyValue(propertyId)).to.equal(control.values[0]);
	});
	it("oneofselect placeholder rendered correctly", () => {
		control.additionalText = "EmptyList...";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.find("div > span").text()).to.equal(control.additionalText);
	});
	it("dropdown renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.find("DropdownV2").prop("disabled")).to.equal(true);
	});
	it("dropdown renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.hasClass("hide")).to.equal(true);
	});
	it("Validate someofselect filtered correctly", () => {
		controller.setControlStates({ "test-oneofselect": { "enumFilter": ["order", "gtt"] } });
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("div[role='button']");
		dropdownButton.simulate("click");
		dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		// select the first item
		const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
		expect(dropdownList).to.be.length(2);
	});
	it("dropdown renders correctly in a table", () => {
		// TODO:  Need to add this test case
	});
	it("dropdown renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad dropdown value"
		});
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		const messageWrapper = dropdownWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
});

describe("oneofselect allows enum label different from enum value", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(oneofselectParamDef);
	const wrapper = renderedObject.wrapper;
	let dropdownWrapper = wrapper.find("div[data-id='properties-ci-oneofselect_null_empty_enum']");
	const dropdownButton = dropdownWrapper.find("div[role='button']");
	dropdownButton.simulate("click");
	dropdownWrapper = wrapper.find("div[data-id='properties-ci-oneofselect_null_empty_enum']");
	const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
	// In oneofselect_paramDef.json, enum value "gold" is assigned a label "Goldilocks"
	expect(oneofselectParamDef.resources["oneofselect_null_empty_enum.gold.label"]).to.equal("Goldilocks");
	// Enum label "Goldilocks" has been rendered for enum value "gold".
	expect(dropdownList.at(9).text()).to.equal("Goldilocks");
});

describe("oneofselect allows enum label to be created for an enum value with space", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(oneofselectParamDef);
	const wrapper = renderedObject.wrapper;
	let dropdownWrapper = wrapper.find("div[data-id='properties-ci-oneofselect_null_empty_enum']");
	const dropdownButton = dropdownWrapper.find("div[role='button']");
	dropdownButton.simulate("click");
	dropdownWrapper = wrapper.find("div[data-id='properties-ci-oneofselect_null_empty_enum']");
	const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
	// In our paramDef, enum value has a space in it "blue green" and is assigned a label "Blue Green"
	expect(oneofselectParamDef.resources["oneofselect_null_empty_enum.blue green.label"]).to.equal("Blue Green");
	// Enum value with a space can be assigned a label and renders as expected.
	expect(dropdownList.at(8).text()).to.equal("Blue Green");
});

describe("oneofselect filtered enum works correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(oneofselectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate oneofselect should have options filtered by enum_filter", () => {
		let dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect_filtered']");
		const dropdownButton = dropdownWrapper.find("div[role='button']");
		dropdownButton.simulate("click");
		// validate the correct number of options show up on open
		dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect_filtered']");
		let dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
		expect(dropdownList).to.have.length(5);
		// make sure there isn't warning on first open
		expect(dropdownWrapper.find("div.properties-validation-message")).to.have.length(0);
		// checked the filter box
		const checkboxWrapper = wrapper.find("div[data-id='properties-filter']");
		const checkbox = checkboxWrapper.find("input");
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		// validate the correct number of options show up on open
		dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect_filtered']");
		dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
		expect(dropdownList).to.have.length(3);
	});

	it("Validate oneofselect should clear the property value if filtered", () => {
		const propertyId = { name: "oneofselect_filtered" };
		// value was initially set to "purple" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.be.equal(null);
		renderedController.updatePropertyValue(propertyId, "orange");
		expect(renderedController.getPropertyValue(propertyId)).to.equal("orange");
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// "orange" isn't part of the filter so the value should be cleared
		expect(renderedController.getPropertyValue(propertyId)).to.equal(null);
	});

	it("Validate oneofselect should set default value if current value is filtered out", () => {
		const propertyId = { name: "oneofselect_filtered_default" };
		// value was initially set to "purple" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.equal("purple");
		renderedController.updatePropertyValue({ name: "filter_default" }, true);
		// "purple" isn't part of the filter so the value should be cleared and the default value should be set
		expect(renderedController.getPropertyValue(propertyId)).to.equal("blue");
	});

});
