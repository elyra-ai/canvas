/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import Readonly from "../../../src/common-properties/controls/readonly";
import Controller from "../../../src/common-properties/properties-controller";
import { mount } from "enzyme";
import { expect } from "chai";

const controller = new Controller();

const control = {
	name: "test-readonly",
};

const propertyId = { name: "test-readonly" };

describe("textfield-control renders correctly", () => {
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-readonly": "Test value" }
		);
	});
	it("readonly props should have been defined", () => {
		const wrapper = mount(
			<Readonly
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
	it("readonly should render correctly", () => {
		const wrapper = mount(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.find("div[data-id='properties-test-readonly']");
		const text = readonlyWrapper.find("span");
		expect(text).to.have.length(1);
		expect(text.text()).to.equal("Test value");
	});
	it("readonly handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-readonly": null }
		);
		const wrapper = mount(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.find("div[data-id='properties-test-readonly']");
		const text = readonlyWrapper.find("span");
		expect(text.text()).to.equal("");
	});
	it("readonly handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.find("div[data-id='properties-test-readonly']");
		const text = readonlyWrapper.find("span");
		expect(text.text()).to.equal("");
	});
	it("readonly renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.find("div[data-id='properties-test-readonly']");
		expect(readonlyWrapper.find("span").prop("disabled")).to.equal(true);
	});
	it("readonly renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.find("div[data-id='properties-test-readonly']");
		expect(readonlyWrapper.hasClass("hide")).to.equal(true);
	});
	it("readonly renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad value"
		});
		const wrapper = mount(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.find("div[data-id='properties-test-readonly']");
		const messageWrapper = readonlyWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
});
