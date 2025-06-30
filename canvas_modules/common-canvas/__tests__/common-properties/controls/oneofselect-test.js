/*
 * Copyright 2017-2025 Elyra Authors
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
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import controlUtilsRTL from "../../_utils_/control-utilsRTL";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";

import oneofselectParamDef from "../../test_resources/paramDefs/oneofselect_paramDef.json";
import { fireEvent, waitFor, cleanup } from "@testing-library/react";
import { cloneDeep } from "lodash";

const mockOneofselectControl = jest.fn();
jest.mock("../../../src/common-properties/controls/dropdown",
	() => (props) => mockOneofselectControl(props)
);

mockOneofselectControl.mockImplementation((props) => {
	const OneofselectControlComp = jest.requireActual(
		"../../../src/common-properties/controls/dropdown",
	).default;
	return <OneofselectControlComp {...props} />;
});

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
	propertyUtilsRTL.setControls(controller, [control]);
	afterEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});
	it("props should have been defined", () => {
		render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expectJest(mockOneofselectControl).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("should render a oneofselect with empty value label", () => {
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		const dropdownWrapper = wrapper.container.querySelector("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
	});
	it("dropdown handles null correctly", () => {
		controller.setPropertyValues(
			{ propertyName: null }
		);
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);

		// select the first item
		dropdownWrapper = container.querySelector("div[data-id='properties-test-oneofselect']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		fireEvent.click(dropdownList[0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(control.values[0]);
	});
	it("dropdown handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		// select the first item
		dropdownWrapper = container.querySelector("div[data-id='properties-test-oneofselect']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		fireEvent.click(dropdownList[0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(control.values[0]);
	});
	it("oneofselect placeholder rendered correctly", () => {
		control.additionalText = "EmptyList...";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.container.querySelector("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal(control.additionalText);
	});
	it("dropdown renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.container.querySelector("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper.querySelector("button").disabled).to.equal(true);
	});
	it("dropdown doesn not render when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.container.querySelector("div[data-id='properties-test-oneofselect']");
		expect(dropdownWrapper).to.be.null;
	});
	it("Validate oneofselect filtered correctly", () => {
		controller.setControlStates({ "test-oneofselect": { "enumFilter": ["order", "gtt"] } });
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-test-oneofselect']");
		// open the dropdown
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		dropdownWrapper = container.querySelector("div[data-id='properties-test-oneofselect']");
		// select the first item
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(2);
	});
	it("dropdown renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad dropdown value"
		});
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const dropdownWrapper = wrapper.container.querySelector("div[data-id='properties-test-oneofselect']");
		const messageWrapper = dropdownWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);
	});
	it("oneofselect helperText is rendered correctly", () => {
		control.helperText = "Oneofselect helperText";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const helpTextWrapper = wrapper.container.querySelector("div[data-id='properties-test-oneofselect']");
		expect(helpTextWrapper.querySelector("div.cds--form__helper-text").textContent).to.equal(control.helperText);
	});
});

describe("oneofselect paramDef works correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(oneofselectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		cleanup();
	});

	it("oneofselect allows enum label different from enum value", () => {
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-ctrl-oneofselect_null_empty_enum']");
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		dropdownWrapper = container.querySelector("div[data-id='properties-ctrl-oneofselect_null_empty_enum']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		// In oneofselect_paramDef.json, enum value "gold" is assigned a label "Goldilocks"
		expect(oneofselectParamDef.resources["oneofselect_null_empty_enum.gold.label"]).to.equal("Goldilocks");
		// Enum label "Goldilocks" has been rendered for enum value "gold".
		expect(dropdownList[9].textContent).to.equal("Goldilocks");
	});

	it("oneofselect allows enum label to be created for an enum value with space", () => {
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-ctrl-oneofselect_null_empty_enum']");
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		dropdownWrapper = container.querySelector("div[data-id='properties-ctrl-oneofselect_null_empty_enum']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		// In our paramDef, enum value has a space in it "blue green" and is assigned a label "Blue Green"
		expect(oneofselectParamDef.resources["oneofselect_null_empty_enum.blue green.label"]).to.equal("Blue Green");
		// Enum value with a space can be assigned a label and renders as expected.
		expect(dropdownList[8].textContent).to.equal("Blue Green");
	});

	it("dropdown renders correctly in a table", () => {
		const propertyId = { name: "oneofselect_table_error", row: 0, col: 0 };
		const panel = propertyUtilsRTL.openSummaryPanel(wrapper, "oneofselect_table-error-panel");
		const table = panel.querySelector("div[data-id='properties-ft-oneofselect_table_error']");

		// Combobox should not be rendered in a table even though 'custom_value_allowed' is set to true
		const dropdownSelect = table.querySelector(".properties-dropdown").querySelectorAll("select");
		expect(dropdownSelect).to.have.length(1);
		expect(table.querySelector(".properties-dropdown").querySelectorAll("input")).to.have.length(0);

		// verify able to select a new option
		expect(renderedController.getPropertyValue(propertyId)).to.be.equal("cat");
		fireEvent.change(dropdownSelect[0], { target: { value: "horse" } });
		expect(renderedController.getPropertyValue(propertyId)).to.be.equal("horse");
	});

	it("oneofselect control should have aria-label", () => {
		const { container } = wrapper;
		// Dropdown should have aria-label
		const dropdownWrapper = container.querySelector("div[data-id='properties-ctrl-oneofselect']");
		const dropdownAriaLabelledby = dropdownWrapper.querySelector(".cds--list-box__menu").getAttribute("aria-labelledby");
		expect(dropdownWrapper.querySelector(`label[id='${dropdownAriaLabelledby}']`).textContent).to.equal("oneofselect(required)");

		// combobox should have aria-label
		const comboboxWrapper = container.querySelector("div[data-id='properties-ctrl-oneofselect_custom_value']");
		const comboboxAriaLabelledby = comboboxWrapper.querySelector(".cds--list-box__menu").getAttribute("aria-labelledby");
		expect(comboboxWrapper.querySelector(`label[id='${comboboxAriaLabelledby}']`).textContent).to.equal("oneofselect custom value allowed(required)");
	});
});

describe("oneofselect filters work correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(oneofselectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		cleanup();
	});

	it("Validate oneofselect should have options filtered by enum_filter", () => {
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect_filtered']");
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		// validate the correct number of options show up on open
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect_filtered']");
		let dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.have.length(4);
		// make sure there isn't warning on first open
		expect(dropdownWrapper.querySelectorAll("div.cds--form-requirement")).to.have.length(0);
		// checked the filter box
		const checkboxWrapper = container.querySelector("div[data-id='properties-filter']");
		const checkbox = checkboxWrapper.querySelector("input");
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		// validate the correct number of options show up on open
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect_filtered']");
		dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.have.length(3);
	});

	it("Validate oneofselect should clear the property value if filtered", async() => {
		const propertyId = { name: "oneofselect_filtered" };
		// value was initially set to "purple" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.be.equal(null);
		renderedController.updatePropertyValue(propertyId, "orange");
		expect(renderedController.getPropertyValue(propertyId)).to.equal("orange");
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// "orange" isn't part of the filter so the value should be cleared
		await waitFor(() => {
			expect(renderedController.getPropertyValue(propertyId)).to.equal(null);
		});
	});

	it("Validate oneofselect should set default value if current value is filtered out", async() => {
		const propertyId = { name: "oneofselect_filtered_default" };
		// value was initially set to "purple" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.equal("purple");
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// "purple" isn't part of the filter so the value should be cleared and the default value should be set\
		await waitFor(() => {
			expect(renderedController.getPropertyValue(propertyId)).to.equal("blue");
		});
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
		const { container } = wrapper;
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
		let dropdownList = controlUtilsRTL.getDropdownItems(container, propertyId1.name);
		expect(dropdownList).to.have.length(6);
		expect(renderedController.getControlEnumFilterStates(propertyId1)).to.equal(null);
		expect(renderedController.getPropertyValue(propertyId2)).to.be.equal("blue");
		dropdownList = controlUtilsRTL.getDropdownItems(container, propertyId2.name);
		expect(dropdownList).to.have.length(6);
		expect(renderedController.getControlEnumFilterStates(propertyId2)).to.equal(null);
		expect(renderedController.getPropertyValue(propertyId3)).to.be.equal(null);
		dropdownList = controlUtilsRTL.getDropdownItems(container, propertyId3.name);
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
	propertyUtilsRTL.setControls(controller, [control]);
	afterEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});
	it("should render a combobox dropdown", () => {
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		expectJest(mockOneofselectControl).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
		let dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		const dropdownInput = dropdownWrapper.querySelectorAll("input");
		expect(dropdownInput).to.have.length(1);
		expect(dropdownInput.textContent).to.be.undefined;

		// Verify dropdown items
		const dropdownMenu = dropdownWrapper.querySelector(".cds--list-box__menu-icon");
		fireEvent.click(dropdownMenu);
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		expect(dropdownWrapper.querySelectorAll(".cds--list-box__menu-item")).to.have.length(6);
	});

	it("should display the custom value entered", () => {
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		expectJest(mockOneofselectControl).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
		let dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		let dropdownInput = dropdownWrapper.querySelector("input");

		fireEvent.change(dropdownInput, { target: { value: "custom" } });
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		dropdownInput = dropdownWrapper.querySelector("input");

		expect(controller.getPropertyValue(propertyId)).to.equal("custom");
		expect(dropdownInput.value).to.equal("custom");
	});

	it("Validate oneofselect with custom value filtered correctly", () => {
		controller.setControlStates({ "oneofselect-custom": { "enumFilter": ["one", "three"] } });
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		const dropdownInput = dropdownWrapper.querySelector("input");
		// Enter '' in input to check [one, three] are filtered using enumFilter and shouldFilterItem
		fireEvent.change(dropdownInput, { target: { value: "" } });
		// dropdownInput.simulate("change", { target: { value: "" } });
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(2);
	});

	it("Validate oneofselect filters correctly using shouldFilterItem", () => {
		const customControl = cloneDeep(control);
		customControl.shouldFilterItem = true;
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={customControl}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		const dropdownInput = dropdownWrapper.querySelector("input");
		fireEvent.change(dropdownInput, { target: { value: "one" } });
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(1);
	});

	it("Validate oneofselect filters correctly using custom callback filterItemsHandler", () => {
		const customControl = cloneDeep(control);
		customControl.shouldFilterItem = true;
		const spyFilterItemsHandler = (data, list) => list?.item?.label?.toLowerCase().startsWith(list?.inputValue?.toLowerCase());
		controller.setHandlers({ filterItemsHandler: spyFilterItemsHandler });
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={customControl}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		const dropdownInput = dropdownWrapper.querySelector("input");

		fireEvent.change(dropdownInput, { target: { value: "e" } });
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		let dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(0);

		fireEvent.change(dropdownInput, { target: { value: "o" } });
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(1);
	});
});

describe("oneofselect with filter true and custom value not allowed works correctly", () => {
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
		"customValueAllowed": false,
		"shouldFilterItem": true,
		"valueDef": {
			"propType": "string",
			"isList": false,
			"isMap": false
		},
		"values": [
			"black",
			"gray",
			"white",
			"green",
			"blue",
			"purple"
		],
		"valueLabels": [
			"black",
			"gray",
			"white",
			"green",
			"blue",
			"purple"
		]
	};
	propertyUtilsRTL.setControls(controller, [control]);
	afterEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});
	it("should render a combobox dropdown when filter is true, and custom_value is false", () => {
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		expectJest(mockOneofselectControl).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
		let dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		const dropdownInput = dropdownWrapper.querySelectorAll("input");
		expect(dropdownInput).to.have.length(1);
		expect(dropdownInput.textContent).to.be.undefined;

		// Verify dropdown items
		const dropdownMenu = dropdownWrapper.querySelector(".cds--list-box__menu-icon");
		fireEvent.click(dropdownMenu);
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		expect(dropdownWrapper.querySelectorAll(".cds--list-box__menu-item")).to.have.length(6);
	});

	it("should accept the input value only for filtering", () => {
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		expectJest(mockOneofselectControl).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
		let dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		let dropdownInput = dropdownWrapper.querySelector("input");

		fireEvent.change(dropdownInput, { target: { value: "custom" } });
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		dropdownInput = dropdownWrapper.querySelector("input");
		// should not update propertyValue as it is not a valid dropdown option
		expect(controller.getPropertyValue(propertyId)).to.not.equal("custom");
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(0);
		// Simulate blur (click outside)
		fireEvent.blur(dropdownInput);
		expect(dropdownInput.value).to.equal(""); // Input should be cleared
		expect(controller.getPropertyValue(propertyId)).to.be.undefined; // Value should be reset
	});

	it("Validate oneofselect filters by default without custom filterHandler callback", () => {
		const customControl = cloneDeep(control);
		const wrapper = render(
			<OneofselectControl
				store={controller.getStore()}
				control={customControl}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		const dropdownInput = dropdownWrapper.querySelector("input");

		fireEvent.change(dropdownInput, { target: { value: "p" } });
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		let dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(1);

		fireEvent.change(dropdownInput, { target: { value: "q" } });
		dropdownWrapper = container.querySelector("div[data-id='properties-oneofselect-custom']");
		dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(0);
	});
});

describe("oneofselect classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(oneofselectParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("oneofselect should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".oneofselect-control-class")).to.have.length(1);
	});

	it("oneofselect should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "oneofselect_table-error-panel");
		expect(wrapper.container.querySelectorAll(".table-oneofselect-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-on-panel-oneofselect-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-subpanel-oneofselect-control-class")).to.have.length(1);
	});
});
