/*
 * Copyright 2017-2019 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import { Provider } from "react-redux";
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
const actionStateId = { name: "increment" };

const action = {
	"name": "increment",
	"label": {
		"text": "Increment"
	},
	"description": {
		"text": "Increment number by 1."
	},
	"actionType": "button",
	"data": {
		"parameter_ref": "number"
	}
};

describe("action-button renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);

		const button = wrapper.find("ButtonAction");
		expect(button).to.have.length(1);
		expect(button.prop("action")).to.equal(action);
		expect(button.prop("controller")).to.equal(controller);
	});

	it("should render a `ActionButton`", () => {
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
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
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const button = wrapper.find("button");
		button.simulate("click");
	});
	it("action button renders when disabled", () => {
		controller.updateActionState(actionStateId, "disabled");
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const buttonWrapper = wrapper.find("div[data-id='increment']");
		expect(buttonWrapper.find("button").prop("disabled")).to.equal(true);
	});
	it("action button renders when hidden", () => {
		controller.updateActionState(actionStateId, "hidden");
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const buttonWrapper = wrapper.find("div[data-id='increment']");
		expect(buttonWrapper.hasClass("hide")).to.equal(true);
	});
	it("action button renders tooltip", () => {
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const tooltip = wrapper.find("div[id='tooltipContainer']");
		expect(tooltip).to.have.length(1);
		expect(tooltip.text()).to.equal("Increment number by 1.");

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
