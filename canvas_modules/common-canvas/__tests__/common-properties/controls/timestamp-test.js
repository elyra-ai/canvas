/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
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
	name: "test-timestamp",
	controlType: "timestampfield"
};
const propertyId = { name: "test-timestamp" };

describe("timestamp-control renders correctly", () => {
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});
	it("timestamp should render if valid timestamp is passed in", () => {
		controller.setPropertyValues(
			{ "test-timestamp": 1557250591087 }
		);
		const wrapper = mount(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.find("div[data-id='properties-test-timestamp']");
		const text = readonlyWrapper.find("span");
		expect(text).to.have.length(1);
		expect(text.text()).to.contain("Tuesday, May 7, 2019");
	});
	it("readonly should render nothing when invalid timestamp is passed in", () => {
		controller.setPropertyValues(
			{ "test-timestamp": "invalid field" }
		);
		const wrapper = mount(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.find("div[data-id='properties-test-timestamp']");
		const text = readonlyWrapper.find("span");
		expect(text).to.have.length(1);
		expect(text.text()).to.equal("");
	});
	it("readonly renders nothing when null timestamp is passed in", () => {
		controller.setPropertyValues(
			{ "test-timestamp": null }
		);
		const wrapper = mount(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.find("div[data-id='properties-test-timestamp']");
		const text = readonlyWrapper.find("span");
		expect(text.text()).to.equal("");
	});

});
