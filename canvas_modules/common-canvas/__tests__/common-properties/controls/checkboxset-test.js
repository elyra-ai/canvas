/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { expect } from "chai";
import Controller from "./../../../src/common-properties/properties-controller";
import Checkboxset from "./../../../src/common-properties/controls/checkboxset";
import { mount } from "enzyme";
import propertyUtils from "../../_utils_/property-utils";

const controller = new Controller();

const control = {
	name: "test-checkboxset",
	values: ["apple", "grape", "orange", "pear"],
	valueLabels: ["apple", "grape", "orange", "pear"]
};
const controlNull = {
	name: "test-checkboxset-null",
	values: ["apple", "orange", "pear"],
	valueLabels: ["apple", "orange", "pear"]
};
const controlUndefined = {
	name: "test-checkboxset-undefined",
	values: ["apple", "orange", "pear"],
	valueLabels: ["apple", "orange", "pear"]
};
const controlNumber = {
	name: "test-checkboxset-number",
	values: [10, 14.2, 20, -1, 25, 400],
	valueLabels: ["10", "14.2", "20", "-1", "25", "400"]
};
const controlInvalid = {
	name: "test-checkboxset-invalid",
	values: ["orange", "pear", "peach"],
	valueLabels: ["orange", "pear", "peach"]
};
propertyUtils.setControls(controller, [control, controlNull, controlNumber,
	controlInvalid, controlUndefined]);

const propertyId = { name: "test-checkboxset" };

describe("checkboxset control tests", () => {
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{
				"test-checkboxset": ["apple", "orange"],
				"test-checkboxset-invalid": ["apple", "orange"],
				"test-checkboxset-null": null,
				"test-checkboxset-number": [14.2, 20, -1]
			}
		);
	});
	it("checkboxset props should have been defined", () => {
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				tableControl
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("tableControl")).to.equal(true);
	});
	it("checkboxset labels are displayed", () => {
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset']");
		const labels = checkboxsetWrapper.find(".properties-checkboxset-container label > span");
		expect(labels).to.have.length(control.valueLabels.length);
		for (let i = 0; i < labels.length; ++i) {
			expect(labels.at(i).text()).to.equal(control.valueLabels[i]);
		}
	});
	it("checkboxset number labels are displayed", () => {
		const propertyIdNumber = { name: "test-checkboxset-number" };
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={controlNumber}
				controller={controller}
				propertyId={propertyIdNumber}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset-number']");
		const labels = checkboxsetWrapper.find(".properties-checkboxset-container label > span");
		expect(labels).to.have.length(controlNumber.valueLabels.length);
		for (let i = 0; i < labels.length; ++i) {
			expect(labels.at(i).text()).to.equal(controlNumber.valueLabels[i]);
		}
	});
	it("checkboxset handles updates values correctly", () => {
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset']");
		const checkboxes = checkboxsetWrapper.find("input");
		// check to make sure correct checkboxes are checked
		expect(checkboxes).to.have.length(control.valueLabels.length);
		expect(checkboxes.at(0).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(1).getDOMNode().checked).to.equal(false);
		expect(checkboxes.at(2).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(3).getDOMNode().checked).to.equal(false);
		// unchecked a box
		checkboxes.at(0).getDOMNode().checked = false;
		checkboxes.at(0).simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange"]);

		// checked a box
		checkboxes.at(1).getDOMNode().checked = true;
		checkboxes.at(1).simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange", "grape"]);

		// checked a box
		checkboxes.at(0).getDOMNode().checked = true;
		checkboxes.at(0).simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange", "grape", "apple"]);

		// unchecked a box
		checkboxes.at(1).getDOMNode().checked = false;
		checkboxes.at(1).simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange", "apple"]);
	});
	it("checkboxset handles number updates values correctly", () => {
		const propertyIdNumber = { name: "test-checkboxset-number" };
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={controlNumber}
				controller={controller}
				propertyId={propertyIdNumber}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset-number']");
		const checkboxes = checkboxsetWrapper.find("input");
		expect(checkboxes).to.have.length(controlNumber.valueLabels.length);
		expect(checkboxes.at(0).getDOMNode().checked).to.equal(false);
		expect(checkboxes.at(1).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(2).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(3).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(4).getDOMNode().checked).to.equal(false);
		expect(checkboxes.at(5).getDOMNode().checked).to.equal(false);
		// unchecked a box
		checkboxes.at(2).getDOMNode().checked = false;
		checkboxes.at(2).simulate("change");
		expect(controller.getPropertyValue(propertyIdNumber)).to.eql([14.2, -1]);

		// checked a box
		checkboxes.at(0).getDOMNode().checked = true;
		checkboxes.at(0).simulate("change");
		expect(controller.getPropertyValue(propertyIdNumber)).to.eql([14.2, -1, 10]);
	});
	it("checkboxset handles invalid values correctly", () => {
		const propertyIdInvalid = { name: "test-checkboxset-invalid" };
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={controlInvalid}
				controller={controller}
				propertyId={propertyIdInvalid}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset-invalid']");
		const checkboxes = checkboxsetWrapper.find("input");
		// check to make sure correct checkboxes are checked
		expect(checkboxes).to.have.length(controlInvalid.valueLabels.length);
		expect(checkboxes.at(0).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(1).getDOMNode().checked).to.equal(false);
		expect(checkboxes.at(2).getDOMNode().checked).to.equal(false);
		// unchecked a box
		checkboxes.at(2).getDOMNode().checked = true;
		checkboxes.at(2).simulate("change");
		expect(controller.getPropertyValue(propertyIdInvalid)).to.eql(["apple", "orange", "peach"]);
	});
	it("checkboxset handles null correctly", () => {
		const propertyIdNull = { name: "test-checkboxset-null" };
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={controlNull}
				controller={controller}
				propertyId={propertyIdNull}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset-null']");
		const checkboxes = checkboxsetWrapper.find("input");
		// all no checkboxes should be checked
		expect(checkboxes).to.have.length(controlNull.valueLabels.length);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.getDOMNode().checked).to.equal(false);
		});
		const checkbox = checkboxes.at(1);
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(controller.getPropertyValue(propertyIdNull)).to.eql(["orange"]);
	});
	it("checkboxset handles undefined correctly", () => {
		const propertyIdUndefined = { name: "test-checkboxset-undefined" };
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={controlUndefined}
				controller={controller}
				propertyId={propertyIdUndefined}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset-undefined']");
		const checkboxes = checkboxsetWrapper.find("input");
		// all no checkboxes should be checked
		expect(checkboxes).to.have.length(controlUndefined.valueLabels.length);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.getDOMNode().checked).to.equal(false);
		});
		const checkbox = checkboxes.at(0);
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(controller.getPropertyValue(propertyIdUndefined)).to.eql(["apple"]);
	});
	it("checkboxset renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset']");
		const checkboxes = checkboxsetWrapper.find("input");
		expect(checkboxes.length).to.have.gt(1);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.prop("disabled")).to.equal(true);
		});
	});
	it("checkboxset renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkboxset']");
		expect(checkboxWrapper.hasClass("hide")).to.equal(true);
	});
	it("checkboxset renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkboxset']");
		const messageWrapper = checkboxWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
});
