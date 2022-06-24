/*
 * Copyright 2017-2022 Elyra Authors
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
	valueLabels: ["apple", "grape", "orange", "pear"],
	valueDescs: ["desc for 0", null, "desc for 20", null]
};
const controlNull = {
	name: "test-checkboxset-null",
	values: ["apple", "orange", "pear"],
	valueLabels: ["apple", "orange", "pear"],
	valueDescs: ["desc for 0", null, "desc for 20", null]
};
const controlUndefined = {
	name: "test-checkboxset-undefined",
	values: ["apple", "orange", "pear"],
	valueLabels: ["apple", "orange", "pear"],
	valueDescs: ["desc for 0", null, "desc for 20", null]
};
const controlNumber = {
	name: "test-checkboxset-number",
	values: [10, 14.2, 20, -1, 25, 400],
	valueLabels: ["10", "14.2", "20", "-1", "25", "400"],
	valueDescs: ["desc for 0", null, "desc for 20", null]
};
const controlInvalid = {
	name: "test-checkboxset-invalid",
	values: ["orange", "pear", "peach"],
	valueLabels: ["orange", "pear", "peach"],
	valueDescs: ["desc for 0", null, "desc for 20", null]
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
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
					tableControl
				/>
			</Provider>
		);

		expect(wrapper.children().prop("control")).to.equal(control);
		expect(wrapper.children().prop("controller")).to.equal(controller);
		expect(wrapper.children().prop("propertyId")).to.equal(propertyId);
		expect(wrapper.children().prop("tableControl")).to.equal(true);
	});
	it("checkboxset labels are displayed", () => {
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset']");
		const labels = checkboxsetWrapper.find(".properties-checkboxset-container label");
		expect(labels).to.have.length(control.valueLabels.length);
		for (let i = 0; i < labels.length; ++i) {
			expect(labels.at(i).text()).to.equal(control.valueLabels[i]);
		}
	});
	it("checkboxset number labels are displayed", () => {
		const propertyIdNumber = { name: "test-checkboxset-number" };
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={controlNumber}
					controller={controller}
					propertyId={propertyIdNumber}
				/>
			</Provider>
		);
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-test-checkboxset-number']");
		const labels = checkboxsetWrapper.find(".properties-checkboxset-container label");
		expect(labels).to.have.length(controlNumber.valueLabels.length);
		for (let i = 0; i < labels.length; ++i) {
			expect(labels.at(i).text()).to.equal(controlNumber.valueLabels[i]);
		}
	});
	it("checkboxset handles updates values correctly", () => {
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
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
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={controlNumber}
					controller={controller}
					propertyId={propertyIdNumber}
				/>
			</Provider>
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
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={controlInvalid}
					controller={controller}
					propertyId={propertyIdInvalid}
				/>
			</Provider>
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
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={controlNull}
					controller={controller}
					propertyId={propertyIdNull}
				/>
			</Provider>
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
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={controlUndefined}
					controller={controller}
					propertyId={propertyIdUndefined}
				/>
			</Provider>
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
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
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
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
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
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
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

	it("checkboxset works as expected in table control when new row added with filter", () => {
		propertyUtils.openSummaryPanel(wrapper, "checkboxset-table-summary");
		// add 1 row and validate with filter disabled
		const table = wrapper.find("div[data-id='properties-checkboxset_table']");
		const addValueBtn = table.find("button.properties-add-fields-button");
		addValueBtn.simulate("click");
		expect(renderedController.getPropertyValue({ name: "checkboxset_table", row: 2, col: 0 })).to.eql(["banana", "orange", "pear"]);
		// enable filter add new row.  Existing rows should also be updated to remove invalid values
		renderedController.updatePropertyValue({ name: "filter2" }, true);
		addValueBtn.simulate("click");
		expect(renderedController.getPropertyValue({ name: "checkboxset_table", row: 2, col: 0 })).to.eql(["orange", "pear"]);
		expect(renderedController.getPropertyValue({ name: "checkboxset_table", row: 3, col: 0 })).to.eql(["orange", "pear"]);
	});
});

describe("checkboxset enum_filter works correctly", () => {
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

	it("Validate checkboxset should have options filtered by enum_filter", () => {
		let checkboxes = wrapper.find("div[data-id='properties-checkboxset_filtered'] input");
		// validate all checkboxes are enabled
		checkboxes.forEach((checkbox) => {
			expect(checkbox.prop("disabled")).to.equal(false);
		});
		// checked the filter box
		renderedController.updatePropertyValue({ name: "filter" }, true);
		wrapper.update();
		// validate the correct number of options show up on open
		checkboxes = wrapper.find("div[data-id='properties-checkboxset_filtered'] input[disabled=true]");
		// one of the checkboxes should be disabled
		expect(checkboxes).to.have.length(1);
	});

	it("Validate checkboxset should uncheck filtered value", () => {
		const locPropertyId = { name: "checkboxset_filtered" };
		renderedController.updatePropertyValue(locPropertyId, ["apple", "pear", "orange"]);
		// checked the filter box
		renderedController.updatePropertyValue({ name: "filter" }, true);
		const checkboxsetValue = renderedController.getPropertyValue(locPropertyId);
		expect(checkboxsetValue).to.eql(["apple", "pear"]);
	});

});

describe("checkboxset classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(checkboxSetParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("checkboxset should have custom classname defined", () => {
		expect(wrapper.find(".checkboxset-control-class")).to.have.length(1);
	});

	it("checkboxset should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "checkboxset-table-summary");
		expect(wrapper.find(".table-on-panel-checkboxset-control-class")).to.have.length(2);
		expect(wrapper.find(".table-subpanel-checkboxset-control-class")).to.have.length(2);
	});
});
