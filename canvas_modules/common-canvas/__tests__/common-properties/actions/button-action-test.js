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
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import sinon from "sinon";
import Controller from "./../../../src/common-properties/properties-controller";
import ACTION_PARAMDEF from "../../test_resources/paramDefs/action_paramDef.json";
import propertyUtils from "../../_utils_/property-utils";
import { fireEvent } from "@testing-library/react";


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

const mockActionButton = jest.fn();
jest.mock("./../../../src/common-properties/actions/button",
	() => (props) => mockActionButton(props)
);

mockActionButton.mockImplementation((props) => {
	const ActionButtonComp = jest.requireActual(
		"./../../../src/common-properties/actions/button",
	).default;
	return <ActionButtonComp {...props} />;
});

describe("action-button renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const button = wrapper.queryAllByRole("button");
		expect(button).to.have.length(1);

		expectJest(mockActionButton).toHaveBeenCalledWith({
			"action": action,
			"controller": controller
		});
	});

	it("should render a `ActionButton`", () => {
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const button = wrapper.getAllByRole("button");
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
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const button = wrapper.getByRole("button");
		fireEvent.click(button);
	});
	it("action button renders when disabled", () => {
		controller.updateActionState(actionStateId, "disabled");
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const button = wrapper.getByRole("button");
		expect(button.disabled).to.equal(true);
	});
	it("action button renders when hidden", () => {
		controller.updateActionState(actionStateId, "hidden");
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const buttonWrapper = container.getElementsByClassName("hide");
		expect(buttonWrapper).to.have.length(1);
		expect(wrapper.getAllByRole("button")).to.have.length(1);
	});
	it("action button renders tooltip", () => {
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);

		const tooltips = wrapper.getAllByText("Increment number by 1.");
		const parentTooltip = tooltips[0].parentElement;
		expect(tooltips.length).equal(1);
		expect(parentTooltip.className).equal("tooltipContainer");
	});
	it("action button kind and size", () => {
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const contButton = container.getElementsByClassName("cds--btn")[0];
		const button = wrapper.getAllByRole("button");
		expect(button).to.have.length(1);
		// verify button kind is secondary
		expect(contButton.className.includes("cds--btn--secondary")).to.equal(true);
		// verify button size is extra large
		expect(contButton.className.includes("cds--btn--xl")).to.equal(true);
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
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionButton
					action={actionWithoutButtonObject}
					controller={controller}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const contButton = container.getElementsByClassName("cds--btn")[0];
		const button = wrapper.getAllByRole("button");
		expect(button).to.have.length(1);
		// verify default button kind is tertiary
		expect(contButton.className.includes("cds--btn--tertiary")).to.equal(true);
		// verify default button size is small
		expect(contButton.className.includes("cds--btn--sm")).to.equal(true);
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
		const button = wrapper.getAllByRole("button")[38];
		fireEvent.click(button);
	});

	it("action button should have custom classname defined", () => {
		// class_name defined in uiHints action_info
		const incrementButton = wrapper.getAllByRole("button", { name: /increment/i })[0];
		expect(incrementButton.parentElement.parentElement.parentElement.className).to.equal("properties-action-button custom-class-for-action-button");

		// class_name not defined in uiHints action_info
		const decrementButton = wrapper.getAllByRole("button", { name: /decrement/i })[0];
		expect(decrementButton.parentElement.className).to.equal("properties-action-button");
	});
});
