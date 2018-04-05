/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import ToggletextControl from "../../../src/common-properties/controls/toggletext";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";

const controller = new Controller();

const control = {
	"name": "toggle",
	"label": {
		"text": "Order"
	},
	"visible": true,
	"width": 16,
	"controlType": "toggletext",
	"valueDef": {
		"propType": "string",
		"isList": false,
		"isMap": false
	},
	"values": [
		"Ascending",
		"Descending"
	],
	"valueLabels": [
		"Ascending",
		"Descending"
	],
	"valueIcons": [
		"/images/up-triangle.svg",
		"/images/down-triangle.svg"
	]
};
propertyUtils.setControls(controller, [control]);

const propertyId = { name: "toggle" };

function setPropertyValue() {
	controller.setPropertyValues(
		{ toggle: "Ascending" }
	);
}

describe("ToggletextControl renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<ToggletextControl
				control={control}
				values={control.values}
				valueLabels={control.valueLabels}
				valueIcons={control.valueIcons}
				controller={controller}
				propertyId={propertyId}
			/>
		);


		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("values")).to.equal(control.values);
		expect(wrapper.prop("valueLabels")).to.equal(control.valueLabels);
		expect(wrapper.prop("valueIcons")).to.equal(control.valueIcons);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("controller")).to.equal(controller);
	});

	it("should render a `ToggletextControl`", () => {
		const wrapper = mount(
			<ToggletextControl
				control={control}
				values={control.values}
				valueLabels={control.valueLabels}
				valueIcons={control.valueIcons}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".toggletext_control");
		expect(input).to.have.length(1);
	});

	it("should set correct state value in `ToggletextControl`", () => {
		setPropertyValue(); // set to default value
		const wrapper = mount(
			<ToggletextControl
				control={control}
				values={control.values}
				valueLabels={control.valueLabels}
				valueIcons={control.valueIcons}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".toggletext_icon");
		input.simulate("click");
		expect(controller.getPropertyValue(propertyId)).to.equal("Descending");
	});

});
