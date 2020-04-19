/*
 * Copyright 2017-2020 IBM Corporation
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
import Checkboxset from "./../../../src/common-properties/controls/checkboxset";
import { mount } from "enzyme";
import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";

import checkboxSetParamDef from "../../test_resources/paramDefs/checkboxset_paramDef.json";


const controller = new Controller();

const control = {
	name: "test-checkboxset",
	values: ["apple", "grape", "orange", "pear"],
	valueLabels: ["apple", "grape", "orange", "pear"]
};
const controlNull = {
	name: "test-checkboxset-null",
	values: ["apple", "orange", "pear"],
	valueLabels: ["apple", "orange", "pear"]
};
const controlUndefined = {
	name: "test-checkboxset-undefined",
	values: ["apple", "orange", "pear"],
	valueLabels: ["apple", "orange", "pear"]
};
const controlNumber = {
	name: "test-checkboxset-number",
	values: [10, 14.2, 20, -1, 25, 400],
	valueLabels: ["10", "14.2", "20", "-1", "25", "400"]
};
const controlInvalid = {
	name: "test-checkboxset-invalid",
	values: ["orange", "pear", "peach"],
	valueLabels: ["orange", "pear", "peach"]
};
propertyUtils.setControls(controller, [control, controlNull, controlNumber,
	controlInvalid, controlUndefined]);

const propertyId = { name: "test-checkboxset" };

describe("checkboxset control tests", () => {
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{
				"test-checkboxset": ["apple", "orange"],
				"test-checkboxset-invalid": ["apple", "orange"],
				"test-checkboxset-null": null,
				"test-checkboxset-number": [14.2, 20, -1]
			}
		);
	});
	it("checkboxset props should have been defined", () => {
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				tableControl
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("tableControl")).to.equal(true);
	});
	it("checkboxset labels are displayed", () => {
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset']");
		const labels = checkboxsetWrapper.find(".properties-checkboxset-container label > span");
		expect(labels).to.have.length(control.valueLabels.length);
		for (let i = 0; i < labels.length; ++i) {
			expect(labels.at(i).text()).to.equal(control.valueLabels[i]);
		}
	});
	it("checkboxset number labels are displayed", () => {
		const propertyIdNumber = { name: "test-checkboxset-number" };
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={controlNumber}
				controller={controller}
				propertyId={propertyIdNumber}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset-number']");
		const labels = checkboxsetWrapper.find(".properties-checkboxset-container label > span");
		expect(labels).to.have.length(controlNumber.valueLabels.length);
		for (let i = 0; i < labels.length; ++i) {
			expect(labels.at(i).text()).to.equal(controlNumber.valueLabels[i]);
		}
	});
	it("checkboxset handles updates values correctly", () => {
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset']");
		const checkboxes = checkboxsetWrapper.find("input");
		// check to make sure correct checkboxes are checked
		expect(checkboxes).to.have.length(control.valueLabels.length);
		expect(checkboxes.at(0).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(1).getDOMNode().checked).to.equal(false);
		expect(checkboxes.at(2).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(3).getDOMNode().checked).to.equal(false);
		// unchecked a box
		checkboxes.at(0).getDOMNode().checked = false;
		checkboxes.at(0).simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange"]);

		// checked a box
		checkboxes.at(1).getDOMNode().checked = true;
		checkboxes.at(1).simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange", "grape"]);

		// checked a box
		checkboxes.at(0).getDOMNode().checked = true;
		checkboxes.at(0).simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange", "grape", "apple"]);

		// unchecked a box
		checkboxes.at(1).getDOMNode().checked = false;
		checkboxes.at(1).simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange", "apple"]);
	});
	it("checkboxset handles number updates values correctly", () => {
		const propertyIdNumber = { name: "test-checkboxset-number" };
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={controlNumber}
				controller={controller}
				propertyId={propertyIdNumber}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset-number']");
		const checkboxes = checkboxsetWrapper.find("input");
		expect(checkboxes).to.have.length(controlNumber.valueLabels.length);
		expect(checkboxes.at(0).getDOMNode().checked).to.equal(false);
		expect(checkboxes.at(1).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(2).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(3).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(4).getDOMNode().checked).to.equal(false);
		expect(checkboxes.at(5).getDOMNode().checked).to.equal(false);
		// unchecked a box
		checkboxes.at(2).getDOMNode().checked = false;
		checkboxes.at(2).simulate("change");
		expect(controller.getPropertyValue(propertyIdNumber)).to.eql([14.2, -1]);

		// checked a box
		checkboxes.at(0).getDOMNode().checked = true;
		checkboxes.at(0).simulate("change");
		expect(controller.getPropertyValue(propertyIdNumber)).to.eql([14.2, -1, 10]);
	});
	it("checkboxset handles invalid values correctly", () => {
		const propertyIdInvalid = { name: "test-checkboxset-invalid" };
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={controlInvalid}
				controller={controller}
				propertyId={propertyIdInvalid}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset-invalid']");
		const checkboxes = checkboxsetWrapper.find("input");
		// check to make sure correct checkboxes are checked
		expect(checkboxes).to.have.length(controlInvalid.valueLabels.length);
		expect(checkboxes.at(0).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(1).getDOMNode().checked).to.equal(false);
		expect(checkboxes.at(2).getDOMNode().checked).to.equal(false);
		// unchecked a box
		checkboxes.at(2).getDOMNode().checked = true;
		checkboxes.at(2).simulate("change");
		expect(controller.getPropertyValue(propertyIdInvalid)).to.eql(["orange", "peach"]);
	});
	it("checkboxset handles null correctly", () => {
		const propertyIdNull = { name: "test-checkboxset-null" };
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={controlNull}
				controller={controller}
				propertyId={propertyIdNull}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset-null']");
		const checkboxes = checkboxsetWrapper.find("input");
		// all no checkboxes should be checked
		expect(checkboxes).to.have.length(controlNull.valueLabels.length);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.getDOMNode().checked).to.equal(false);
		});
		const checkbox = checkboxes.at(1);
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(controller.getPropertyValue(propertyIdNull)).to.eql(["orange"]);
	});
	it("checkboxset handles undefined correctly", () => {
		const propertyIdUndefined = { name: "test-checkboxset-undefined" };
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={controlUndefined}
				controller={controller}
				propertyId={propertyIdUndefined}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset-undefined']");
		const checkboxes = checkboxsetWrapper.find("input");
		// all no checkboxes should be checked
		expect(checkboxes).to.have.length(controlUndefined.valueLabels.length);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.getDOMNode().checked).to.equal(false);
		});
		const checkbox = checkboxes.at(0);
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(controller.getPropertyValue(propertyIdUndefined)).to.eql(["apple"]);
	});
	it("checkboxset renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset']");
		const checkboxes = checkboxsetWrapper.find("input");
		expect(checkboxes.length).to.have.gt(1);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.prop("disabled")).to.equal(true);
		});
	});
	it("checkboxset renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkboxset']");
		expect(checkboxWrapper.hasClass("hide")).to.equal(true);
	});
	it("checkboxset renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = mount(
			<Checkboxset
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const checkboxWrapper = wrapper.find("div[data-id='properties-test-checkboxset']");
		const messageWrapper = checkboxWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
});

describe("checkboxset works as expected in table control", () => {
	var wrapper;
	var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(checkboxSetParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});
	it("checkboxset works as expected in table control onpanel", () => {
		const summaryPanelTable = propertyUtils.openSummaryPanel(wrapper, "checkboxset-table-summary");
		const propId = { name: "checkboxset_table", row: 0, col: 1 };
		const tableRows = tableUtils.getTableRows(summaryPanelTable);
		expect(tableRows).to.have.length(2);
		expect(renderedController.getPropertyValue(propId)).to.eql([8, 5]);

		tableUtils.selectCheckboxes(summaryPanelTable, [0]);
		const checkboxsetWrapper =
		wrapper.find("div[data-id='properties-checkboxset_table_0_1']");
		const checkboxes = checkboxsetWrapper.find("input");
		checkboxes.at(0).getDOMNode().checked = false;
		checkboxes.at(0).simulate("change");
		checkboxes.at(2).getDOMNode().checked = false;
		checkboxes.at(2).simulate("change");
		expect(renderedController.getPropertyValue(propId)).to.eql([]);
	});
	it("checkboxset works as expected in table control subpanel", () => {
		const summaryPanelTable = propertyUtils.openSummaryPanel(wrapper, "checkboxset-table-summary");
		const propId = { name: "checkboxset_table", row: 0, col: 0 };
		const tableRows = tableUtils.getTableRows(summaryPanelTable);
		expect(tableRows).to.have.length(2);
		expect(renderedController.getPropertyValue(propId)).to.eql(["banana", "orange", "pear"]);
		const rowWrapper = tableRows.at(0);
		const subpanelButton = rowWrapper.find("button.properties-subpanel-button");
		expect(subpanelButton).to.have.length(1);
		subpanelButton.simulate("click");
		wrapper.update();
		const wideFlyoutPanel = wrapper.find("div.properties-wf-content.show");
		const checkboxsetWrapper =
		wideFlyoutPanel.at(0).find("div[data-id='properties-checkboxset_table_0_0']")
			.at(1);
		const checkboxes = checkboxsetWrapper.find("input");
		expect(checkboxes.at(0).getDOMNode().checked).to.equal(false);
		expect(checkboxes.at(1).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(1).getDOMNode().checked).to.equal(true);
		expect(checkboxes.at(1).getDOMNode().checked).to.equal(true);
		checkboxes.at(1).getDOMNode().checked = false;
		checkboxes.at(1).simulate("change");
		checkboxes.at(2).getDOMNode().checked = false;
		checkboxes.at(2).simulate("change");
		expect(renderedController.getPropertyValue(propId)).to.eql(["pear"]);
	});
});
