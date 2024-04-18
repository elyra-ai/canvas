/*
 * Copyright 2017-2023 Elyra Authors
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
import { mount } from "../../_utils_/mount-utils.js";
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
	},
	"button": {
		"kind": "secondary",
		"size": "xl"
	},
	"class_name": "custom-class-for-action-button"
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
		const tooltip = wrapper.find("div.tooltipContainer");
		expect(tooltip).to.have.length(1);
		expect(tooltip.text()).to.equal("Increment number by 1.");

	});
	it("action button kind and size", () => {
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
		// verify button kind is secondary
		expect(button.prop("className").includes("cds--btn--secondary")).to.equal(true);
		// verify button size is extra large
		expect(button.prop("className").includes("cds--btn--xl")).to.equal(true);
	});
	it("action button default kind is tertiary and size is small", () => {
		const actionWithoutButtonObject = {
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
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={actionWithoutButtonObject}
					controller={controller}
				/>
			</Provider>
		);
		const button = wrapper.find("button");
		expect(button).to.have.length(1);
		// verify default button kind is tertiary
		expect(button.prop("className").includes("cds--btn--tertiary")).to.equal(true);
		// verify default button size is small
		expect(button.prop("className").includes("cds--btn--sm")).to.equal(true);
	});
});

describe("actions using paramDef", () => {
	let wrapper;
	let renderedObject;
	beforeEach(() => {
		renderedObject = propertyUtils.flyoutEditorForm(ACTION_PARAMDEF);
		wrapper = renderedObject.wrapper;
	});

	it("should fire action when button clicked", (done) => {
		renderedObject = propertyUtils.flyoutEditorForm(ACTION_PARAMDEF, null, { actionHandler: callback }, { appData: appData });
		wrapper = renderedObject.wrapper;
		function callback(id, inAppData, data) {
			expect(id).to.equal("increment");
			expect(inAppData).to.eql(appData);
			expect(data.parameter_ref).to.equal("number");
			done();
		}
		const button = wrapper.find("div[data-id='increment'] button");
		button.simulate("click");
	});

	it("action button should have custom classname defined", () => {
		// class_name defined in uiHints action_info
		const incrementButton = wrapper.find("div[data-id='increment']");
		expect(incrementButton.prop("className")).to.equal("properties-action-button custom-class-for-action-button");

		// class_name not defined in uiHints action_info
		const decrementButton = wrapper.find("div[data-id='decrement']");
		expect(decrementButton.prop("className")).to.equal("properties-action-button");
	});
});
