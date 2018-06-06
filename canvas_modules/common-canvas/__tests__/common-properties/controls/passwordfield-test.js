/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import Passwordfield from "./../../../src/common-properties/controls/passwordfield";
import Controller from "./../../../src/common-properties/properties-controller";
import { mount } from "enzyme";
import { expect } from "chai";
import propertyUtils from "../../_utils_/property-utils";


const controller = new Controller();

const control = {
	name: "test-password",
	additionalText: "Enter a password",
	valueDef: {
		isList: false
	}
};
propertyUtils.setControls(controller, [control]);
const propertyId = { name: "test-password" };


describe("Passwordfield renders correctly", () => {
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-password": "Test value" }
		);
	});
	it("Passwordfield props should have been defined", () => {
		const wrapper = mount(
			<Passwordfield
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});
	it("Passwordfield type set correctly", () => {
		const wrapper = mount(
			<Passwordfield
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const input = passwordWrapper.find("input");
		expect(input.getDOMNode().type).to.equal("password");
	});
	it("Passwordfield should update value", () => {
		const wrapper = mount(
			<Passwordfield
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const input = passwordWrapper.find("input");
		input.simulate("change", { target: { value: "My secret password" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My secret password");
	});
	it("Passwordfield should set placeholder", () => {
		const wrapper = mount(
			<Passwordfield
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const input = passwordWrapper.find("input");
		expect(input.getDOMNode().placeholder).to.equal(control.additionalText);
	});
	it("Passwordfield handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-password": null }
		);
		const wrapper = mount(
			<Passwordfield
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const input = passwordWrapper.find("input");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});
	it("Passwordfield handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<Passwordfield
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const input = passwordWrapper.find("input");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});
	it("readonly renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<Passwordfield
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		expect(passwordWrapper.find("input").prop("disabled")).to.equal(true);
	});
	it("Passwordfield renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<Passwordfield
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		expect(passwordWrapper.hasClass("hide")).to.equal(true);
	});
	it("Passwordfield renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = mount(
			<Passwordfield
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const passwordWrapper = wrapper.find("div[data-id='properties-test-password']");
		const messageWrapper = passwordWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
});
