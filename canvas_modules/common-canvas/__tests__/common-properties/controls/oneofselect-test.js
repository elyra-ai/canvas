/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
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

const controller = new Controller();

const control = {
	"name": "method",
	"label": {
		"text": "Merge method"
	},
	"separateLabel": true,
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

const propertyId = { name: "test-oneofselect" };

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
