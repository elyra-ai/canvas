/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import ReadonlyControl from "../../../src/common-properties/editor-controls/readonly-control.jsx";
import Controller from "../../../src/common-properties/properties-controller";
import { mount } from "enzyme";
import { expect } from "chai";

const controller = new Controller();
controller.setPropertyValues(
	{ "test-readonly": "Test value" }
);

const control = {
	name: "test-readonly",
};

const propertyId = { name: "test-readonly" };

describe("textfield-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<ReadonlyControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `ReadonlyControl`", () => {
		const wrapper = mount(
			<ReadonlyControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const text = wrapper.find("text");
		expect(text).to.have.length(1);
	});


	it("should set correct control type in `ReadonlyControl`", () => {
		const wrapper = mount(
			<ReadonlyControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const text = wrapper.find("text");
		expect(text.text()).to.equal("Test value");
	});

});
