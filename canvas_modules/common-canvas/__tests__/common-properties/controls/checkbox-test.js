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
import { expect } from "chai";
import Controller from "./../../../src/common-properties/properties-controller";
import Checkbox from "./../../../src/common-properties/controls/checkbox";
import { mount } from "../../_utils_/mount-utils.js";
import propertyUtils from "../../_utils_/property-utils";
import checkboxParamDef from "../../test_resources/paramDefs/checkbox_paramDef.json";

const controller = new Controller();

const control = {
	name: "test-checkbox"
};
propertyUtils.setControls(controller, [control]);

const propertyId = { name: "test-checkbox" };

describe("checkbox control tests", () => {
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-checkbox": false }
		);
	});
	it("checkbox props should have been defined", () => {
		const wrapper = mount(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});
	it("checkbox label and description are rendered correctly", () => {
		const controlWithLabel = {
			name: "test-checkboxLabel",
			label: {
				text: "checkbox label"
			},
			description: {
				text: "checkbox description"
			}
		};
		const wrapper = mount(
			<Checkbox
				store={controller.getStore()}
				control={controlWithLabel}
				controller={controller}
				propertyId={{ name: "test-checkboxLabel" }}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkboxLabel']");
		expect(checkboxWrapper.find(".properties-checkbox-label").text()).to.equal(controlWithLabel.label.text);
		expect(checkboxWrapper.find("div.properties-tooltips span").text()).to.equal(controlWithLabel.description.text);
	});
	it("checkbox updates correctly", () => {
		controller.setPropertyValues(
			{ "test-checkbox": false }
		);
		const wrapper = mount(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox']");
		const checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(false);
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.equal(true);
	});
	it("checkbox handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-checkbox": null }
		);
		const wrapper = mount(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox']");
		const checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(false);
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.equal(true);
	});
	it("checkbox handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox']");
		const checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(false);
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.equal(true);
	});
	it("checkbox renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox']");
		expect(checkboxWrapper.find("input").prop("disabled")).to.equal(true);
	});
	it("checkbox renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox'] > div");
		expect(checkboxWrapper.hasClass("hide")).to.equal(true);
	});
	it("checkbox renders correctly in a table", () => {
		const controlWithLabel = {
			name: "test-checkboxLabel",
			label: {
				text: "checkbox label"
			},
			description: {
				text: "checkbox description"
			}
		};
		const wrapper = mount(
			<Checkbox
				store={controller.getStore()}
				control={controlWithLabel}
				controller={controller}
				propertyId={{ name: "test-checkboxLabel" }}
				tableControl
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkboxLabel']");
		// isn't actually visible.  Visibility controlled by carbon component
		expect(checkboxWrapper.find("label").text()).to.equal(controlWithLabel.label.text);
		expect(checkboxWrapper.find("div.properties-tooltips text")).to.have.length(0);
	});
	it("checkbox renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = mount(
			<Checkbox
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkbox']");
		const messageWrapper = checkboxWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
});

describe("checkbox classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(checkboxParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("checkbox should have custom classname defined", () => {
		expect(wrapper.find(".checkbox-control-class")).to.have.length(1);
	});

	it("checkbox should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "checkbox-table-summary");
		const tableControlDiv = wrapper.find("div[data-id='properties-checkbox-table-summary-ctrls']");
		// There are 2 rows shown across 2 tables
		expect(tableControlDiv.find(".table-checkbox-control-class")).to.have.length(2);
		// From the 2 rows shown, each row has a checkbox on-panel and in subpanel
		expect(tableControlDiv.find(".table-on-panel-checkbox-control-class")).to.have.length(2);
		expect(tableControlDiv.find(".table-subpanel-checkbox-control-class")).to.have.length(2);
	});
});
