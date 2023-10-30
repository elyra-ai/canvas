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
import MultiSelectControl from "../../../src/common-properties/controls/multiselect";
import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";
import { mount } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";

import multiselectParamDef from "../../test_resources/paramDefs/multiselect_paramDef.json";


describe("multiselect renders correctly", () => {

	const propertyName = "test-multiselect";
	const propertyId = { name: propertyName };
	const emptyValueIndicator = "None selected";

	let controller;
	const control = {
		"name": "test-multiselect",
		"label": {
			"text": "multiselect"
		},
		"description": {
			"text": "multiselect description"
		},
		"controlType": "multiselect",
		"role": "enum",
		"valueDef": {
			"propType": "string",
			"isList": false,
			"isMap": false
		},
		"values": [
			"Order",
			"Keys",
			"Condition",
			"Gtt"
		],
		"valueLabels": [
			"Order",
			"Keys",
			"Condition",
			"Ranked condition"
		]
	};

	beforeEach(() => {
		controller = new Controller();
		propertyUtils.setControls(controller, [control]);
	});

	afterEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});
	it("props should have been defined", () => {
		const wrapper = mount(
			<MultiSelectControl
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

	it("should render a multiselect with empty value label", () => {
		const wrapper = mount(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		const multiselectWrapper = wrapper.find("div[data-id='properties-test-multiselect']");
		expect(multiselectWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
	});

	it("multiselect handles null correctly", () => {
		controller.setPropertyValues(
			{ propertyName: null }
		);
		const wrapper = mount(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		let multiselectWrapper = wrapper.find("div[data-id='properties-test-multiselect']");
		expect(multiselectWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
		const multiselectButton = multiselectWrapper.find("button");
		multiselectButton.simulate("click");

		// select the first item
		multiselectWrapper = wrapper.find("div[data-id='properties-test-multiselect']");
		const multiselectList = multiselectWrapper.find("div.bx--list-box__menu-item");
		expect(multiselectList).to.be.length(4);
		multiselectList.at(0).simulate("click");
		const expectedValue = [multiselectList.at(0).text()];
		expect(controller.getPropertyValue(propertyId)).to.eql(expectedValue);
	});

	it("multiselect handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		let multiselectWrapper = wrapper.find("div[data-id='properties-test-multiselect']");
		expect(multiselectWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
		// open the multiselect
		const multiselectButton = multiselectWrapper.find("button");
		multiselectButton.simulate("click");
		// select the first item
		multiselectWrapper = wrapper.find("div[data-id='properties-test-multiselect']");
		const multiselectList = multiselectWrapper.find("div.bx--list-box__menu-item");
		expect(multiselectList).to.be.length(4);
		multiselectList.at(0).simulate("click");
		const expectedValue = [multiselectList.at(0).text()];
		expect(controller.getPropertyValue(propertyId)).to.eql(expectedValue);
	});

	it("multiselect renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const multiselectWrapper = wrapper.find("div[data-id='properties-test-multiselect']");
		expect(multiselectWrapper.find("MultiSelect").prop("disabled")).to.equal(true);
	});

	it("multiselect renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const multiselectWrapper = wrapper.find("div[data-id='properties-test-multiselect']");
		expect(multiselectWrapper.hasClass("hide")).to.equal(true);
	});

	it("Validate multiselect filtered correctly", () => {
		controller.setControlStates({ "test-multiselect": { "enumFilter": ["order", "gtt"] } });
		const wrapper = mount(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		let multiselectWrapper = wrapper.find("div[data-id='properties-test-multiselect']");
		// open the multiselect
		const multiselectButton = multiselectWrapper.find("button");
		multiselectButton.simulate("click");
		multiselectWrapper = wrapper.find("div[data-id='properties-test-multiselect']");
		// select the first item
		const multiselectList = multiselectWrapper.find("div.bx--list-box__menu-item");
		expect(multiselectList).to.be.length(2);
	});

	it("multiselect renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad multiselect value"
		});
		const wrapper = mount(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const multiselectWrapper = wrapper.find("div[data-id='properties-test-multiselect']");
		const messageWrapper = multiselectWrapper.find("div.bx--form-requirement");
		expect(messageWrapper).to.have.length(1);
	});
});

describe("multiselect paramDef works correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(multiselectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("multiselect placeholder custom label rendered correctly", () => {
		let multiselectWrapper = wrapper.find("div[data-id='properties-multiselect_custom_labels']");
		const expectedEmptyLabel = multiselectParamDef.resources["multiselect_custom_labels.multiselect.dropdown.empty.label"];
		expect(multiselectWrapper.find("button > span").text()).to.equal(expectedEmptyLabel);

		const propertyId = { name: "multiselect_custom_labels" };
		const multiselectButton = multiselectWrapper.find("button");
		multiselectButton.simulate("click");

		multiselectWrapper.update();
		multiselectWrapper = wrapper.find("div[data-id='properties-multiselect_custom_labels']");
		const multiselectList = multiselectWrapper.find("div.bx--list-box__menu-item");
		expect(multiselectList).to.have.length(6);

		multiselectList.at(0).simulate("click");
		const expectedValue = [multiselectList.at(0).text()];
		expect(renderedController.getPropertyValue(propertyId)).to.eql(expectedValue);

		const expectedSelectedLabel = multiselectParamDef.resources["multiselect_custom_labels.multiselect.dropdown.options.selected.label"];
		expect(multiselectWrapper.find("button > span").text()).to.equal(expectedSelectedLabel);
	});

	it("multiselect allows enum label different from enum value", () => {
		let multiselectWrapper = wrapper.find("div[data-id='properties-multiselect_multiple_selected']");
		const multiselectButton = multiselectWrapper.find("button");
		multiselectButton.simulate("click");

		multiselectWrapper.update();
		multiselectWrapper = wrapper.find("div[data-id='properties-multiselect_multiple_selected']");
		const multiselectList = multiselectWrapper.find("div.bx--list-box__menu-item");
		expect(multiselectList).to.have.length(6);

		// The options are not in the order they are defined. Test to verify "Custom" is in the text
		expect(multiselectList.at(0).text()
			.indexOf("Custom") > -1).to.equal(true);
		expect(multiselectList.at(1).text()
			.indexOf("Custom") > -1).to.equal(true);
		expect(multiselectList.at(2).text()
			.indexOf("Custom") > -1).to.equal(true);
		expect(multiselectList.at(3).text()
			.indexOf("Custom") > -1).to.equal(true);
		expect(multiselectList.at(4).text()
			.indexOf("Custom") > -1).to.equal(true);
		expect(multiselectList.at(5).text()
			.indexOf("Custom") > -1).to.equal(true);
	});

	it("multiselect renders correctly in a table - subpanel", () => {
		const propertyId02 = { name: "multiselect_table", row: 0, col: 2 };
		propertyUtils.openSummaryPanel(wrapper, "multiselect-table-panel");
		let table = wrapper.find("div[data-id='properties-ci-multiselect_table']");

		// Verify initial value
		const rowOneColTwoInitValue = ["blue"];
		expect(renderedController.getPropertyValue(propertyId02)).to.be.eql(rowOneColTwoInitValue);

		// verify able to select a new option subPanel
		const editButtons = table.find("button.properties-subpanel-button");
		expect(editButtons).to.have.length(2);
		editButtons.at(0).simulate("click");
		const subPanel = wrapper.find(".properties-editstyle-sub-panel");
		const subPanelMultiselect = subPanel.find("div[data-id='properties-multiselect_table_0_2']");

		const subPanelMultiselectButton = subPanelMultiselect.find("input"); // filterable multiselect
		subPanelMultiselectButton.simulate("click");

		table.update();
		table = wrapper.find("div[data-id='properties-ci-multiselect_table']");
		const subPanelMultiselectList = table.find("div.bx--list-box__menu-item");
		expect(subPanelMultiselectList).to.have.length(6);

		subPanelMultiselectList.at(1).simulate("click");
		const expectedSubPanelValue = rowOneColTwoInitValue.concat(subPanelMultiselectList.at(1).text());
		expect(JSON.stringify(renderedController.getPropertyValue(propertyId02))).to.equal(JSON.stringify(expectedSubPanelValue));
	});

	it("multiselect renders correctly in a table - onpanel", () => {
		const propertyId11 = { name: "multiselect_table", row: 1, col: 1 };
		propertyUtils.openSummaryPanel(wrapper, "multiselect-table-panel");
		let table = wrapper.find("div[data-id='properties-ci-multiselect_table']");

		// Verify initial value
		expect(renderedController.getPropertyValue(propertyId11)).to.be.eql([]);

		tableUtils.selectCheckboxes(table, [1]); // Select second row for onPanel edit
		table = wrapper.find("div[data-id='properties-ci-multiselect_table']");

		// verify able to select a new option
		const multiselectOnPanel = table.find(".properties-onpanel-container");
		const multiselectButton = multiselectOnPanel.find("button");
		multiselectButton.simulate("click");

		table.update();
		table = wrapper.find("div[data-id='properties-ci-multiselect_table']");
		const multiselectList = table.find("div.bx--list-box__menu-item");
		expect(multiselectList).to.have.length(4);

		multiselectList.at(0).simulate("click");
		const expectedValue = [multiselectList.at(0).text()];
		expect(renderedController.getPropertyValue(propertyId11)).to.eql(expectedValue);
	});

	it("multiselect control should have aria-label", () => {
		const multiselectWrapper = wrapper.find("div[data-id='properties-ctrl-multiselect_multiple_selected']");
		const multiselectAriaLabelledby = multiselectWrapper.find(".bx--list-box__menu").prop("aria-labelledby");
		expect(
			multiselectWrapper
				.find(`#${multiselectAriaLabelledby}`)
				.find(".properties-control-item")
				.text()
		).to.equal("multiselect multiple options selected(required)");
	});
});

describe("multiselect classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(multiselectParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("multiselect should have custom classname defined", () => {
		expect(wrapper.find(".multiselect-control-class")).to.have.length(1);
	});

	it("multiselect should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "multiselect-table-panel");
		expect(wrapper.find(".table-on-panel-multiselect-control-class")).to.have.length(2);
		expect(wrapper.find(".table-subpanel-multiselect-control-class")).to.have.length(2);
	});
});

describe("multiselect filters work correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(multiselectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate multiselect should have options filtered by enum_filter", () => {
		let multiselectWrapper = wrapper.find("div[data-id='properties-multiselect_filtered']");
		// open the multiselect
		let multiselectButton = multiselectWrapper.find("button");
		multiselectButton.simulate("click");
		multiselectWrapper = wrapper.find("div[data-id='properties-multiselect_filtered']");
		let multiselectList = multiselectWrapper.find("div.bx--list-box__menu-item");
		expect(multiselectList).to.be.length(6);


		// checked the filter box
		renderedController.updatePropertyValue({ name: "filter" }, true);

		wrapper.update();
		multiselectWrapper = wrapper.find("div[data-id='properties-multiselect_filtered']");
		multiselectButton = multiselectWrapper.find("button");
		multiselectButton.simulate("click");
		multiselectWrapper = wrapper.find("div[data-id='properties-multiselect_filtered']");
		multiselectList = multiselectWrapper.find("div.bx--list-box__menu-item");
		expect(multiselectList).to.be.length(3);

	});

	it("Validate multiselect should clear the property value if filtered", () => {
		const propertyId = { name: "multiselect_filtered" };
		expect(renderedController.getPropertyValue(propertyId)).to.eql(["yellow"]);
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// "yellow" isn't part of the filter so the value should be cleared
		expect(renderedController.getPropertyValue(propertyId)).to.eql([]);
	});

	it("Validate multiselect default is set when current values are filtered", () => {
		const propertyId = { name: "multiselect_filtered_default" };
		expect(renderedController.getPropertyValue(propertyId)).to.eql(["yellow", "purple"]);
		renderedController.updatePropertyValue({ name: "filter_default" }, true);
		// "purple" isn't part of the filter so the value should be cleared
		expect(renderedController.getPropertyValue(propertyId)).to.eql(["red"]);
	});

});
