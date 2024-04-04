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
import OneofselectControl from "../../../src/common-properties/controls/dropdown";
import propertyUtils from "../../_utils_/property-utils";
import controlUtils from "../../_utils_/control-utils";
import { mount } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";

import oneofselectParamDef from "../../test_resources/paramDefs/oneofselect_paramDef.json";


describe("oneofselect renders correctly", () => {

	const propertyName = "test-oneofselect";
	const propertyId = { name: propertyName };
	const emptyValueIndicator = "...";

	const controller = new Controller();
	const control = {
		"name": "test-oneofselect",
		"label": {
			"text": "oneofselect"
		},
		"description": {
			"text": "oneofselect description"
		},
		"controlType": "oneofselect",
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
	propertyUtils.setControls(controller, [control]);
	afterEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});
	it("props should have been defined", () => {
		const wrapper = mount(
			<OneofselectControl
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

	it("should render a oneofselect with empty value label", () => {
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		const dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
	});
	it("dropdown handles null correctly", () => {
		controller.setPropertyValues(
			{ propertyName: null }
		);
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
		const dropdownButton = dropdownWrapper.find("button");
		dropdownButton.simulate("click");

		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		const dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		dropdownList.at(0).simulate("click");
		expect(controller.getPropertyValue(propertyId)).to.equal(control.values[0]);
	});
	it("dropdown handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("button");
		dropdownButton.simulate("click");
		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		const dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		dropdownList.at(0).simulate("click");
		expect(controller.getPropertyValue(propertyId)).to.equal(control.values[0]);
	});
	it("oneofselect placeholder rendered correctly", () => {
		control.additionalText = "EmptyList...";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.find("button > span").text()).to.equal(control.additionalText);
	});
	it("dropdown renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.find("Dropdown").prop("disabled")).to.equal(true);
	});
	it("dropdown renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.hasClass("hide")).to.equal(true);
	});
	it("Validate oneofselect filtered correctly", () => {
		controller.setControlStates({ "test-oneofselect": { "enumFilter": ["order", "gtt"] } });
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("button");
		dropdownButton.simulate("click");
		dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		// select the first item
		const dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(2);
	});
	it("dropdown renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad dropdown value"
		});
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.find("div[data-id='properties-test-oneofselect']");
		const messageWrapper = dropdownWrapper.find("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);
	});
});

describe("oneofselect paramDef works correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(oneofselectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("oneofselect allows enum label different from enum value", () => {
		let dropdownWrapper = wrapper.find("div[data-id='properties-ctrl-oneofselect_null_empty_enum']");
		const dropdownButton = dropdownWrapper.find("button");
		dropdownButton.simulate("click");
		dropdownWrapper = wrapper.find("div[data-id='properties-ctrl-oneofselect_null_empty_enum']");
		const dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		// In oneofselect_paramDef.json, enum value "gold" is assigned a label "Goldilocks"
		expect(oneofselectParamDef.resources["oneofselect_null_empty_enum.gold.label"]).to.equal("Goldilocks");
		// Enum label "Goldilocks" has been rendered for enum value "gold".
		expect(dropdownList.at(9).text()).to.equal("Goldilocks");
	});

	it("oneofselect allows enum label to be created for an enum value with space", () => {
		let dropdownWrapper = wrapper.find("div[data-id='properties-ctrl-oneofselect_null_empty_enum']");
		const dropdownButton = dropdownWrapper.find("button");
		dropdownButton.simulate("click");
		dropdownWrapper = wrapper.find("div[data-id='properties-ctrl-oneofselect_null_empty_enum']");
		const dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		// In our paramDef, enum value has a space in it "blue green" and is assigned a label "Blue Green"
		expect(oneofselectParamDef.resources["oneofselect_null_empty_enum.blue green.label"]).to.equal("Blue Green");
		// Enum value with a space can be assigned a label and renders as expected.
		expect(dropdownList.at(8).text()).to.equal("Blue Green");
	});

	it("dropdown renders correctly in a table", () => {
		const propertyId = { name: "oneofselect_table_error", row: 0, col: 0 };
		const panel = propertyUtils.openSummaryPanel(wrapper, "oneofselect_table-error-panel");
		const table = panel.find("div[data-id='properties-ft-oneofselect_table_error']");

		// Combobox should not be rendered in a table even though 'custom_value_allowed' is set to true
		const dropdownSelect = table.find(".properties-dropdown").find("select");
		expect(dropdownSelect).to.have.length(1);
		expect(table.find(".properties-dropdown").find("input")).to.have.length(0);

		// verify able to select a new option
		expect(renderedController.getPropertyValue(propertyId)).to.be.equal("cat");
		dropdownSelect.simulate("change", { target: { value: "horse" } });
		expect(renderedController.getPropertyValue(propertyId)).to.be.equal("horse");
	});

	it("oneofselect control should have aria-label", () => {
		// Dropdown should have aria-label
		const dropdownWrapper = wrapper.find("div[data-id='properties-ctrl-oneofselect']");
		const dropdownAriaLabelledby = dropdownWrapper.find(".cds--list-box__menu").prop("aria-labelledby");
		expect(dropdownWrapper.find(`#${dropdownAriaLabelledby}`).text()).to.equal("oneofselect(required)");

		// combobox should have aria-label
		const comboboxWrapper = wrapper.find("div[data-id='properties-ctrl-oneofselect_custom_value']");
		const comboboxAriaLabel = comboboxWrapper.find(".cds--list-box__menu").prop("aria-label");
		expect(comboboxAriaLabel).to.equal("oneofselect custom value allowed");
	});
});

describe("oneofselect filters work correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(oneofselectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate oneofselect should have options filtered by enum_filter", () => {
		let dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect_filtered']");
		const dropdownButton = dropdownWrapper.find("button");
		dropdownButton.simulate("click");
		// validate the correct number of options show up on open
		dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect_filtered']");
		let dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.have.length(4);
		// make sure there isn't warning on first open
		expect(dropdownWrapper.find("div.cds--form-requirement")).to.have.length(0);
		// checked the filter box
		const checkboxWrapper = wrapper.find("div[data-id='properties-filter']");
		const checkbox = checkboxWrapper.find("input");
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		// validate the correct number of options show up on open
		dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect_filtered']");
		dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.have.length(3);
	});

	it("Validate oneofselect should clear the property value if filtered", () => {
		const propertyId = { name: "oneofselect_filtered" };
		// value was initially set to "purple" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.be.equal(null);
		renderedController.updatePropertyValue(propertyId, "orange");
		expect(renderedController.getPropertyValue(propertyId)).to.equal("orange");
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// "orange" isn't part of the filter so the value should be cleared
		expect(renderedController.getPropertyValue(propertyId)).to.equal(null);
	});

	it("Validate oneofselect should set default value if current value is filtered out", () => {
		const propertyId = { name: "oneofselect_filtered_default" };
		// value was initially set to "purple" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.equal("purple");
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// "purple" isn't part of the filter so the value should be cleared and the default value should be set
		expect(renderedController.getPropertyValue(propertyId)).to.equal("blue");
	});

	// https://github.ibm.com/NGP-TWC/wml-canvas-planning/issues/4873
	it("Validate oneofselect should not update value before the enum filters are updated", () => {
		const propertyId = { name: "oneofselect_filtered" };
		// value was initially set to "purple" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.be.equal(null);
		renderedController.updatePropertyValue(propertyId, "yellow");
		expect(renderedController.getPropertyValue(propertyId)).to.equal("yellow");
		renderedController.updatePropertyValue({ name: "filter" }, false);
		// "orange" isn't part of the filter so the value should be cleared
		expect(renderedController.getPropertyValue(propertyId)).to.equal("yellow");
		renderedController.setPropertyValues({
			oneofselect_filtered: "blue",
			filter: true
		});
		expect(renderedController.getPropertyValue(propertyId)).to.equal("blue");
	});

	it("Validate oneofselect can have multiple enum_filter conditions on the same parameter_ref", () => {
		const propertyIdInput = { name: "filter_input" };
		const propertyId1 = { name: "oneofselect_filtered_1" };
		const propertyId2 = { name: "oneofselect_filtered_2" };
		const propertyId3 = { name: "oneofselect_filtered_3" };

		// Only 'propertyId1' should have 1 item displayed in the list
		renderedController.updatePropertyValue(propertyIdInput, 1);
		// // validate the correct number of options show up on open
		expect(renderedController.getPropertyValue(propertyId1)).to.be.equal(null);
		expect(renderedController.getControlEnumFilterStates(propertyId1)).to.eql(["red"]);
		expect(renderedController.getPropertyValue(propertyId2)).to.be.equal("blue");
		expect(renderedController.getControlEnumFilterStates(propertyId2)).to.equal(null);
		expect(renderedController.getPropertyValue(propertyId3)).to.be.equal("yellow");
		expect(renderedController.getControlEnumFilterStates(propertyId3)).to.equal(null);

		// Only 'propertyId2' should have 2 items displayed in the list
		renderedController.updatePropertyValue(propertyIdInput, 2);
		// validate the correct number of options show up on open
		expect(renderedController.getPropertyValue(propertyId1)).to.be.equal(null);
		expect(renderedController.getControlEnumFilterStates(propertyId1)).to.equal(null);
		expect(renderedController.getPropertyValue(propertyId2)).to.be.equal("blue");
		expect(renderedController.getControlEnumFilterStates(propertyId2)).to.eql(["red", "blue"]);
		expect(renderedController.getPropertyValue(propertyId3)).to.be.equal("yellow");
		expect(renderedController.getControlEnumFilterStates(propertyId3)).to.equal(null);

		// Only 'propertyId3' should have 3 items displayed in the list
		renderedController.updatePropertyValue(propertyIdInput, 3);
		// validate the correct number of options show up on open
		expect(renderedController.getPropertyValue(propertyId1)).to.be.equal(null);
		let dropdownList = controlUtils.getDropdownItems(wrapper, propertyId1.name);
		expect(dropdownList).to.have.length(6);
		expect(renderedController.getControlEnumFilterStates(propertyId1)).to.equal(null);
		expect(renderedController.getPropertyValue(propertyId2)).to.be.equal("blue");
		dropdownList = controlUtils.getDropdownItems(wrapper, propertyId2.name);
		expect(dropdownList).to.have.length(6);
		expect(renderedController.getControlEnumFilterStates(propertyId2)).to.equal(null);
		expect(renderedController.getPropertyValue(propertyId3)).to.be.equal(null);
		dropdownList = controlUtils.getDropdownItems(wrapper, propertyId3.name);
		expect(dropdownList).to.have.length(3);
		expect(renderedController.getControlEnumFilterStates(propertyId3)).to.eql(["red", "blue", "green"]);

		// Setting input to a value other than 1, 2, or 3 will show all items in dropdown
		renderedController.updatePropertyValue(propertyIdInput, 10);
		// validate the correct number of options show up on open
		expect(renderedController.getPropertyValue(propertyId1)).to.be.equal(null);
		expect(renderedController.getControlEnumFilterStates(propertyId1)).to.equal(null);
		expect(renderedController.getPropertyValue(propertyId2)).to.be.equal("blue");
		expect(renderedController.getControlEnumFilterStates(propertyId2)).to.equal(null);
		expect(renderedController.getPropertyValue(propertyId3)).to.be.equal(null);
		expect(renderedController.getControlEnumFilterStates(propertyId3)).to.equal(null);
	});
});

describe("oneofselect with custom value allowed works correctly", () => {
	const propertyName = "oneofselect-custom";
	const propertyId = { name: propertyName };

	const controller = new Controller();
	const control = {
		"name": propertyName,
		"label": {
			"text": "oneofselect"
		},
		"description": {
			"text": "oneofselect description"
		},
		"customValueAllowed": true,
		"valueDef": {
			"propType": "string",
			"isList": false,
			"isMap": false
		},
		"values": [
			"one",
			"two",
			"three",
			"four",
			"five",
			"six"
		],
		"valueLabels": [
			"One",
			"Two",
			"Three",
			"Four",
			"Five",
			"Six"
		]
	};
	propertyUtils.setControls(controller, [control]);
	afterEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});
	it("should render a combobox dropdown", () => {
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		let dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect-custom']");
		const dropdownInput = dropdownWrapper.find("input");
		expect(dropdownInput).to.have.length(1);
		expect(dropdownInput.text()).to.equal("");

		// Verify dropdown items
		const dropdownMenu = dropdownWrapper.find(".cds--list-box__menu-icon");
		dropdownMenu.simulate("click");
		dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect-custom']");
		expect(dropdownWrapper.find(".cds--list-box__menu-item")).to.have.length(6);
	});

	it("should display the custom value entered", () => {
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		let dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect-custom']");
		let dropdownInput = dropdownWrapper.find("input");

		dropdownInput.simulate("change", { target: { value: "custom" } });
		dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect-custom']");
		dropdownInput = dropdownWrapper.find("input");

		expect(controller.getPropertyValue(propertyId)).to.equal("custom");
		expect(dropdownInput.instance().value).to.equal("custom");
	});

	it("Validate oneofselect with custom value filtered correctly", () => {
		controller.setControlStates({ "oneofselect-custom": { "enumFilter": ["one", "three"] } });
		const wrapper = mount(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect-custom']");
		const dropdownInput = dropdownWrapper.find("input");
		dropdownInput.simulate("click");
		dropdownWrapper = wrapper.find("div[data-id='properties-oneofselect-custom']");
		const dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(2);
	});
});

describe("oneofselect classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(oneofselectParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("oneofselect should have custom classname defined", () => {
		expect(wrapper.find(".oneofselect-control-class")).to.have.length(1);
	});

	it("oneofselect should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "oneofselect_table-error-panel");
		expect(wrapper.find(".table-oneofselect-control-class")).to.have.length(1);
		expect(wrapper.find(".table-on-panel-oneofselect-control-class")).to.have.length(1);
		expect(wrapper.find(".table-subpanel-oneofselect-control-class")).to.have.length(1);
	});
});
