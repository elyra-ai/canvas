/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import Expression from "../../../src/common-properties/editor-controls/expression-control.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";

const controller = new Controller();

const control = {
	name: "test-areafield",
	charLimit: 256,
	additionalText: "Add expression",
	valueDef: {
		isList: false
	},
	language: "CLEM"
};

const propertyId = { name: "test-expression" };

describe("expression-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<Expression
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `Expression`", () => {
		const wrapper = mount(
			<Expression
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".ReactCodeMirror");
		expect(input).to.have.length(1);
	});

});
