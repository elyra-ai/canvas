/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import ActionButton from "./../../../src/common-properties/actions/button";
import { mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import Controller from "./../../../src/common-properties/properties-controller";

const actionHandler = sinon.spy();
const controller = new Controller();
controller.setHandlers({ actionHandler: actionHandler });
controller.setAppData({ nodeId: "1234" });

const action = {
	"name": "increment",
	"label": {
		"text": "Increment"
	},
	"actionType": "button",
	"data": {
		"parameter_ref": "number"
	}
};

describe("action-button renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<ActionButton
				action={action}
				controller={controller}
			/>
		);

		expect(wrapper.prop("action")).to.equal(action);
		expect(wrapper.prop("controller")).to.equal(controller);
	});

	it("should render a `ActionButton`", () => {
		const wrapper = mount(
			<ActionButton
				action={action}
				controller={controller}
			/>
		);
		const button = wrapper.find("button");
		expect(button).to.have.length(1);
	});
	it("should fire action when button clicked", (done) => {
		function callback(id, appData, data) {
			expect(id).to.equal("increment");
			expect(appData.nodeId).to.equal("1234");
			expect(data.parameter_ref).to.equal("number");
			done();
		}
		controller.setHandlers({ actionHandler: callback });
		const wrapper = mount(
			<ActionButton
				action={action}
				controller={controller}
			/>
		);
		const button = wrapper.find("button");
		button.simulate("click");
	});
});
