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
import ActionImage from ".../../../src/common-properties/actions/image";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import sinon from "sinon";
import Controller from "../../../src/common-properties/properties-controller";
import { expect as expectJest } from "@jest/globals";
import ACTION_PARAMDEF from "../../test_resources/paramDefs/action_paramDef.json";
import propertyUtils from "../../_utils_/property-utils";
import { fireEvent, within } from "@testing-library/react";

const actionHandler = sinon.spy();
const controller = new Controller();
controller.setHandlers({ actionHandler: actionHandler });
const appData = { nodeId: "1234" };
controller.setAppData(appData);
const actionStateId = { name: "moon" };


const action = {
	"name": "moon",
	"label": {
		"text": "moon"
	},
	"description": {
		"text": "Click to rotate through moon phases."
	},
	"actionType": "image",
	"data": {
		"parameter_ref": "moon_phase"
	},
	"image": {
		"url": "/images/moon.jpg",
		"placement": "right",
		"size": {
			"height": 20,
			"width": 25
		}
	},
	"class_name": "custom-class-for-action-image"
};

const mockActionImage = jest.fn();
jest.mock(".../../../src/common-properties/actions/image",
	() => (props) => mockActionImage(props)
);

mockActionImage.mockImplementation((props) => {
	const ActionImageComp = jest.requireActual(
		".../../../src/common-properties/actions/image",
	).default;
	return <ActionImageComp {...props} />;
});

describe("action-image renders correctly", () => {

	it("props should have been defined", () => {
		render(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		expectJest(mockActionImage).toHaveBeenCalledWith({
			"action": action,
			"controller": controller
		});
	});
	it("should render a `ActionImage`", () => {
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const image = wrapper.getByRole("img");
		expect(image.height).to.equal(20);
		expect(image.width).to.equal(25);
		expect(image.parentElement.parentElement.parentElement.parentElement.className).to.equal("properties-action-image right");
	});
	it("should fire action when image clicked", (done) => {
		function callback(id, inAppData, data) {
			expect(id).to.equal("moon");
			expect(inAppData).to.eql(appData);
			expect(data.parameter_ref).to.equal("moon_phase");
			done();
		}
		controller.setHandlers({ actionHandler: callback });
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const image = wrapper.getByRole("img");
		fireEvent.click(image);
	});
	it("action image renders when disabled", () => {
		controller.updateActionState(actionStateId, "disabled");
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const image = wrapper.getByRole("img");
		const imageWrapper = image.parentElement.parentElement.parentElement.parentElement;
		expect(imageWrapper.className.includes("disabled")).to.equal(true);
	});
	it("action image renders when hidden", () => {
		controller.updateActionState(actionStateId, "hidden");
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const image = wrapper.getByRole("img");
		const imageWrapper = image.parentElement.parentElement.parentElement.parentElement;
		expect(imageWrapper.className.includes("hide")).to.equal(true);
	});
	it("action image renders tooltip", () => {
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const tooltip = wrapper.getAllByText("Click to rotate through moon phases.");
		const tooltipWrapper = tooltip[0].parentElement;
		expect(tooltip).to.have.length(1);
		expect(tooltipWrapper.className).to.equal("tooltipContainer");
		expect(tooltip[0].textContent).to.equal("Click to rotate through moon phases.");
	});
});

describe("actions using paramDef", () => {
	let wrapper;
	let renderedObject;
	beforeEach(() => {
		renderedObject = propertyUtils.flyoutEditorFormRender(ACTION_PARAMDEF);
		wrapper = renderedObject.wrapper;
	});

	it("should fire action when image clicked", (done) => {
		renderedObject = propertyUtils.flyoutEditorFormRender(ACTION_PARAMDEF, null, { actionHandler: callback }, { appData: appData });
		wrapper = renderedObject.wrapper;
		function callback(id, inAppData, data) {
			expect(id).to.equal("moon");
			expect(inAppData).to.eql(appData);
			expect(data.parameter_ref).to.equal("moon_phase");
			done();
		}
		const { container } = wrapper;
		const imageWrapper = container.querySelector("div[data-id='properties-ctrl-moon_phase']");
		const image = within(imageWrapper).getByRole("img");
		fireEvent.click(image);
	});

	it("action image should have custom classname defined", () => {
		// class_name defined in uiHints action_info
		const images = wrapper.getAllByRole("img");
		const fallImage = images[3];
		const winterImage = images[0];
		expect(fallImage.parentElement.parentElement.parentElement.parentElement.className).to.equal("properties-action-image right custom-class-for-action-image");
		// class_name not defined in uiHints action_info
		expect(winterImage.parentElement.parentElement.parentElement.parentElement.className).to.equal("properties-action-image");
	});
});
