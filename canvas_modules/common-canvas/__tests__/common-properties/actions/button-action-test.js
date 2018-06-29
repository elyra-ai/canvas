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

import ACTION_PARAMDEF from "../../test_resources/paramDefs/action_paramDef.json";
import propertyUtils from "../../_utils_/property-utils";

const actionHandler = sinon.spy();
const controller = new Controller();
controller.setHandlers({ actionHandler: actionHandler });
const appData = { nodeId: "1234" };
controller.setAppData(appData);

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
		function callback(id, inAppData, data) {
			expect(id).to.equal("increment");
			expect(inAppData).to.eql(appData);
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

describe("actions using paramDef", () => {
	it("should fire action when button clicked", (done) => {
		const renderedObject = propertyUtils.flyoutEditorForm(ACTION_PARAMDEF, null, { actionHandler: callback }, { appData: appData });
		const wrapper = renderedObject.wrapper;
		function callback(id, inAppData, data) {
			expect(id).to.equal("increment");
			expect(inAppData).to.eql(appData);
			expect(data.parameter_ref).to.equal("number");
			done();
		}
		const button = wrapper.find("div[data-id='increment'] button");
		button.simulate("click");
	});

});
