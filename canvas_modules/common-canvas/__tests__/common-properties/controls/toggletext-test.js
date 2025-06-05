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
import Toggletext from "../../../src/common-properties/controls/toggletext";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL.js";
import toggletextParamDef from "../../test_resources/paramDefs/toggletext_paramDef.json";
import { fireEvent, cleanup } from "@testing-library/react";

const controller = new Controller();

const control = {
	"name": "toggle",
	"label": {
		"text": "Toggletext"
	},
	"values": [
		"Ascending",
		"Descending"
	],
	"valueLabels": [
		"Sort Ascending",
		"Sort Descending"
	],
	"valueIcons": [
		"/images/up-triangle.svg",
		"/images/down-triangle.svg"
	]
};
const controlNoIcons = {
	"name": "toggle",
	"label": {
		"text": "Toggletext without icons"
	},
	"values": [
		"Ascending",
		"Descending"
	],
	"valueLabels": [
		"Ascending",
		"Descending"
	]
};
propertyUtilsRTL.setControls(controller, [control, controlNoIcons]);

const propertyId = { name: "toggle" };

const mockToggletext = jest.fn();
jest.mock("../../../src/common-properties/controls/toggletext",
	() => (props) => mockToggletext(props)
);

mockToggletext.mockImplementation((props) => {
	const ToggletextComp = jest.requireActual(
		"../../../src/common-properties/controls/toggletext",
	).default;
	return <ToggletextComp {...props} />;
});

describe("Toggletext renders correctly", () => {
	let wrapper;

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ toggle: "Ascending" }
		);
	});

	afterEach(() => {
		cleanup();
	});

	it("Toggletext props should have been defined", () => {
		wrapper = render(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expectJest(mockToggletext).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("Toggletext should render correctly", () => {
		wrapper = render(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.container.querySelector("div[data-id='properties-toggle']");
		const button = toggleWrapper.querySelectorAll("button");
		expect(button).to.have.length(1);
		expect(button[0].textContent).to.equal(control.valueLabels[0]);
	});

	it("Toggletext should render without icons", () => {
		wrapper = render(
			<Toggletext
				store={controller.getStore()}
				control={controlNoIcons}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.container.querySelector("div[data-id='properties-toggle']");
		const button = toggleWrapper.querySelectorAll("button");
		expect(button).to.have.length(1);
		const image = button[0].querySelectorAll("svg");
		expect(image).to.have.length(0);
		expect(button[0].textContent).to.equal(controlNoIcons.valueLabels[0]);
	});

	it("toggletext should set correct value", () => {
		wrapper = render(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.container.querySelector("div[data-id='properties-toggle']");
		const button = toggleWrapper.querySelector("button");
		fireEvent.click(button);
		expect(controller.getPropertyValue(propertyId)).to.equal("Descending");
	});

	it("toggletext renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		wrapper = render(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.container.querySelector("div[data-id='properties-toggle']");
		expect(toggleWrapper.outerHTML.includes("disabled")).to.equal(true);
	});

	it("toggletext does not render when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		wrapper = render(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.container.querySelector("div[data-id='properties-toggle']");
		expect(toggleWrapper).to.be.null;
	});

	it("toggletext renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		wrapper = render(
			<Toggletext
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.container.querySelector("div[data-id='properties-toggle']");
		const messageWrapper = toggleWrapper.querySelectorAll("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});

});

describe("toggletext classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(toggletextParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("toggletext should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".toggletext-control-class")).to.have.length(1);
	});

	it("toggletext should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "toggletext-table-summary");
		expect(wrapper.container.querySelectorAll(".table-toggletext-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-on-panel-toggletext-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-subpanel-toggletext-control-class")).to.have.length(1);
	});
});
