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
import { renderWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import timestampParamDef from "../../test_resources/paramDefs/timestamp_paramDef.json";

const controller = new Controller();
const control = {
	name: "test-timestamp",
	controlType: "timestampfield"
};

const controlReadonly = {
	name: "test-timestamp",
	controlType: "readonly",
	valueDef: {
		propType: "timestamp"
	}
};
const propertyId = { name: "test-timestamp" };

describe("timestamp-control renders correctly", () => {

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("timestamp should render if valid timestamp is passed in", () => {
		controller.setPropertyValues(
			{ "test-timestamp": 1557250591087 }
		);
		const wrapper = renderWithIntl(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-timestamp']");
		const text = readonlyWrapper.querySelectorAll("span");
		expect(text).to.have.length(1);
		expect(text[0].textContent).to.contain("Tuesday, May 7, 2019");
	});

	it("timestamp should render if valid timestamp is passed in and control type readonly", () => {
		controller.setPropertyValues(
			{ "test-timestamp": 1557250591087 }
		);
		const wrapper = renderWithIntl(
			<Readonly
				store={controller.getStore()}
				control={controlReadonly}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-timestamp']");
		const text = readonlyWrapper.querySelectorAll("span");
		expect(text).to.have.length(1);
		expect(text[0].textContent).to.contain("Tuesday, May 7, 2019");
	});

	it("readonly should render nothing when invalid timestamp is passed in", () => {
		controller.setPropertyValues(
			{ "test-timestamp": "invalid field" }
		);
		const wrapper = renderWithIntl(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-timestamp']");
		const text = readonlyWrapper.querySelectorAll("span");
		expect(text).to.have.length(1);
		expect(text[0].textContent).to.equal("");
	});

	it("readonly renders nothing when null timestamp is passed in", () => {
		controller.setPropertyValues(
			{ "test-timestamp": null }
		);
		const wrapper = renderWithIntl(
			<Readonly
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-timestamp']");
		const text = readonlyWrapper.querySelector("span");
		expect(text.textContent).to.equal("");
	});

});

describe("timestamp classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(timestampParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("timestamp should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".timestampfield-control-class")).to.have.length(1);
	});

	it("timestamp should display correctly", () => {
		const readonlyWrapper = wrapper.container.querySelector("div[data-id='properties-timestamp_field_timestamp']");
		const text = readonlyWrapper.querySelector("span");
		expect(text.textContent).to.contain("Friday, June 16, 1911");
	});

	it("timestamp should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "timestamp-table-panels");
		expect(wrapper.container.querySelectorAll(".table-timestamp-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-on-panel-timestamp-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-subpanel-timestamp-control-class")).to.have.length(1);
	});
});
