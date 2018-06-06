/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import React from "react";
import { expect } from "chai";
import Controller from "./../../../src/common-properties/properties-controller";
import Checkbox from "./../../../src/common-properties/controls/checkbox";
import { mount } from "enzyme";
import propertyUtils from "../../_utils_/property-utils";

const controller = new Controller();

const control = {
	name: "test-checkbox"
};
propertyUtils.setControls(controller, [control]);

const propertyId = { name: "test-checkbox" };

describe("checkbox control tests", () => {
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-checkbox": false }
		);
	});
	it("checkbox props should have been defined", () => {
		const wrapper = mount(
			<Checkbox
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});
	it("checkbox label and description are rendered correctly", () => {
		const controlWithLabel = {
			name: "test-checkboxLabel",
			label: {
				text: "checkbox label"
			},
			description: {
				text: "checkbox description"
			}
		};
		const wrapper = mount(
			<Checkbox
				control={controlWithLabel}
				controller={controller}
				propertyId={{ name: "test-checkboxLabel" }}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkboxLabel']");
		expect(checkboxWrapper.find("label > span").text()).to.equal(controlWithLabel.label.text);
		expect(checkboxWrapper.find("div.properties-tooltips span").text()).to.equal(controlWithLabel.description.text);
	});
	it("checkbox updates correctly", () => {
		controller.setPropertyValues(
			{ "test-checkbox": false }
		);
		const wrapper = mount(
			<Checkbox
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox']");
		const checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(false);
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.equal(true);
	});
	it("checkbox handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-checkbox": null }
		);
		const wrapper = mount(
			<Checkbox
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox']");
		const checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(false);
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.equal(true);
	});
	it("checkbox handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<Checkbox
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox']");
		const checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(false);
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.equal(true);
	});
	it("checkbox renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<Checkbox
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox']");
		expect(checkboxWrapper.find("input").prop("disabled")).to.equal(true);
	});
	it("checkbox renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<Checkbox
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox']");
		expect(checkboxWrapper.hasClass("hide")).to.equal(true);
	});
	it("checkbox renders correctly in a table", () => {
		const controlWithLabel = {
			name: "test-checkboxLabel",
			label: {
				text: "checkbox label"
			},
			description: {
				text: "checkbox description"
			}
		};
		const wrapper = mount(
			<Checkbox
				control={controlWithLabel}
				controller={controller}
				propertyId={{ name: "test-checkboxLabel" }}
				tableControl
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkboxLabel']");
		// isn't actually visible.  Visibility controlled by carbon component
		expect(checkboxWrapper.find("label > span").text()).to.equal(controlWithLabel.label.text);
		expect(checkboxWrapper.find("div.properties-tooltips text")).to.have.length(0);
	});
	it("checkbox renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = mount(
			<Checkbox
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox']");
		const messageWrapper = checkboxWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
});
