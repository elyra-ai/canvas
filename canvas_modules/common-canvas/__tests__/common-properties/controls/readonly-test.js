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
import Readonly from "../../../src/common-properties/controls/readonly";
import Controller from "../../../src/common-properties/properties-controller";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import readonlyParamDef from "../../test_resources/paramDefs/readonly_paramDef.json";

const controller = new Controller();

const control = {
	name: "test-readonly",
};

const controlWithValues = {
	name: "test-valueLabels-readonly",
	values: ["value 1"],
	valueLabels: ["label 1"]
};

const propertyId = { name: "test-readonly" };

const mockReadonly = jest.fn();
jest.mock("../../../src/common-properties/controls/readonly",
	() => (props) => mockReadonly(props)
);

mockReadonly.mockImplementation((props) => {
	const ReadonlyComp = jest.requireActual(
		"../../../src/common-properties/controls/readonly",
	).default;
	return <ReadonlyComp {...props} />;
});

describe("textfield-control renders correctly", () => {
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-readonly": "Test value" }
		);
	});
	it("readonly props should have been defined", () => {
		render(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		expectJest(mockReadonly).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});
	it("readonly should render correctly", () => {
		const wrapper = render(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-readonly']");
		const text = readonlyWrapper.querySelectorAll("span");
		expect(text).to.have.length(1);
		expect(text[0].textContent).to.equal("Test value");
	});
	it("readonly should render with labels if possible", () => {
		controller.setPropertyValues(
			{ "test-readonly": "value 1" }
		);
		const wrapper = render(
			<Readonly
				store={controller.getStore()}
				control={controlWithValues}
				controller={controller}
				propertyId={propertyId}
				value="value 1"
			/>
		);
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-readonly']");
		const text = readonlyWrapper.querySelectorAll("span");

		expect(text).to.have.length(1);
		expect(text[0].textContent).to.equal("label 1");
	});
	it("readonly handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-readonly": null }
		);
		const wrapper = render(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-readonly']");
		const text = readonlyWrapper.querySelector("span");
		expect(text.textContent).to.equal("");
	});
	it("readonly handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-readonly']");
		const text = readonlyWrapper.querySelector("span");
		expect(text.textContent).to.equal("");
	});
	it("readonly renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = render(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-readonly']");
		expect(readonlyWrapper.querySelector("span").outerHTML.includes("disabled")).to.equal(true);
	});
	it("readonly renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = render(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-readonly']");
		expect(readonlyWrapper.className.includes("hide")).to.equal(true);
	});
	it("readonly renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad value"
		});
		const wrapper = render(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-readonly']");
		const messageWrapper = readonlyWrapper.querySelectorAll("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
});

describe("readonly classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(readonlyParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("readonly should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".readonly-control-class")).to.have.length(1);
	});

	it("readonly should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "readonly-table-summary");
		const tableControlDiv = wrapper.container.querySelector("div[data-id='properties-readonly-table-summary-ctrls']");
		expect(tableControlDiv.querySelectorAll(".table-readonly-control-class")).to.have.length(1);
		expect(tableControlDiv.querySelectorAll(".table-on-panel-readonly-control-class")).to.have.length(1);
		expect(tableControlDiv.querySelectorAll(".table-subpanel-readonly-control-class")).to.have.length(1);
	});
});
