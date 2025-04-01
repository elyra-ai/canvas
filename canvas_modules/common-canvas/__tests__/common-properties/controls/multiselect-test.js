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
import MultiSelectControl from "../../../src/common-properties/controls/multiselect";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";

import multiselectParamDef from "../../test_resources/paramDefs/multiselect_paramDef.json";
import { fireEvent, waitFor } from "@testing-library/react";

const mockMultiselect = jest.fn();
jest.mock("../../../src/common-properties/controls/multiselect",
	() => (props) => mockMultiselect(props)
);

mockMultiselect.mockImplementation((props) => {
	const MultiselectComp = jest.requireActual(
		"../../../src/common-properties/controls/multiselect",
	).default;
	return <MultiselectComp {...props} />;
});

beforeAll(() => {
	// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
	Element.prototype.getBoundingClientRect = jest.fn()
		.mockReturnValue({
			height: 1000, // This is used to measure the panel height
			width: 1000
		});
});

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
		propertyUtilsRTL.setControls(controller, [control]);
	});

	afterEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});
	it("props should have been defined", () => {
		render(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expectJest(mockMultiselect).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("should render a multiselect with empty value label", () => {
		const wrapper = render(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const multiselectWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		expect(multiselectWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
	});

	it("multiselect handles null correctly", () => {
		controller.setPropertyValues(
			{ propertyName: null }
		);
		const wrapper = render(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		let multiselectWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		expect(multiselectWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
		const multiselectButton = multiselectWrapper.querySelector("button");
		fireEvent.click(multiselectButton);

		// select the first item
		multiselectWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		const multiselectList = multiselectWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(multiselectList).to.be.length(4);
		fireEvent.click(multiselectList[0]);
		const expectedValue = [multiselectList[0].textContent];
		expect(controller.getPropertyValue(propertyId)).to.eql(expectedValue);
	});

	it("multiselect handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		let multiselectWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		expect(multiselectWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
		// open the multiselect
		const multiselectButton = multiselectWrapper.querySelector("button");
		fireEvent.click(multiselectButton);
		// select the first item
		multiselectWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		const multiselectList = multiselectWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(multiselectList).to.be.length(4);
		fireEvent.click(multiselectList[0]);
		const expectedValue = [multiselectList[0].textContent];
		expect(controller.getPropertyValue(propertyId)).to.eql(expectedValue);
	});

	it("multiselect renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = render(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const multiselectWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		expect(multiselectWrapper.querySelector("button").disabled).to.equal(true);
	});

	it("multiselect renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = render(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const multiselectWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		expect(multiselectWrapper.className.includes("hide")).to.equal(true);
	});

	it("Validate multiselect filtered correctly", () => {
		controller.setControlStates({ "test-multiselect": { "enumFilter": ["order", "gtt"] } });
		const wrapper = render(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		let multiselectWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		// open the multiselect
		const multiselectButton = multiselectWrapper.querySelector("button");
		fireEvent.click(multiselectButton);
		multiselectWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		// select the first item
		const multiselectList = multiselectWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(multiselectList).to.be.length(2);
	});

	it("multiselect renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad multiselect value"
		});
		const wrapper = render(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const multiselectWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		const messageWrapper = multiselectWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);
	});

	it("MultiSelectControl helperText is rendered correctly", () => {
		control.helperText = "MultiSelectControl helperText";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const helpTextWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		expect(helpTextWrapper.querySelector("div.cds--form__helper-text").textContent).to.equal(control.helperText);
	});

	it("MultiSelectControl readOnly is rendered correctly", () => {
		control.helperText = true;
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<MultiSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const readOnlyWrapper = container.querySelector("div[data-id='properties-test-multiselect']");
		expect(readOnlyWrapper.readOnly).to.equal(control.readOnly);
	});
});

describe("multiselect paramDef works correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(multiselectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("multiselect placeholder custom label rendered correctly", () => {
		const { container } = wrapper;
		let multiselectWrapper = container.querySelector("div[data-id='properties-multiselect_custom_labels']");
		const expectedEmptyLabel = multiselectParamDef.resources["multiselect_custom_labels.multiselect.dropdown.empty.label"];
		expect(multiselectWrapper.querySelector("button > span").textContent).to.equal(expectedEmptyLabel);

		const propertyId = { name: "multiselect_custom_labels" };
		const multiselectButton = multiselectWrapper.querySelector("button");
		fireEvent.click(multiselectButton);

		multiselectWrapper = container.querySelector("div[data-id='properties-multiselect_custom_labels']");
		const multiselectList = multiselectWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(multiselectList).to.have.length(6);
		fireEvent.click(multiselectList[0]);
		const expectedValue = [multiselectList[0].textContent];
		expect(renderedController.getPropertyValue(propertyId)).to.eql(expectedValue);

		const expectedSelectedLabel = multiselectParamDef.resources["multiselect_custom_labels.multiselect.dropdown.options.selected.label"];
		expect(multiselectWrapper.querySelector("button > span").textContent).to.equal(expectedSelectedLabel);
	});

	it("multiselect allows enum label different from enum value", () => {
		const { container } = wrapper;
		let multiselectWrapper = container.querySelector("div[data-id='properties-multiselect_multiple_selected']");
		const multiselectButton = multiselectWrapper.querySelector("button");
		fireEvent.click(multiselectButton);

		multiselectWrapper = container.querySelector("div[data-id='properties-multiselect_multiple_selected']");
		const multiselectList = multiselectWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(multiselectList).to.have.length(6);

		// The options are not in the order they are defined. Test to verify "Custom" is in the text
		expect(multiselectList[0].textContent
			.indexOf("Custom") > -1).to.equal(true);
		expect(multiselectList[1].textContent
			.indexOf("Custom") > -1).to.equal(true);
		expect(multiselectList[2].textContent
			.indexOf("Custom") > -1).to.equal(true);
		expect(multiselectList[3].textContent
			.indexOf("Custom") > -1).to.equal(true);
		expect(multiselectList[4].textContent
			.indexOf("Custom") > -1).to.equal(true);
		expect(multiselectList[5].textContent
			.indexOf("Custom") > -1).to.equal(true);
	});

	it("multiselect renders correctly in a table - subpanel", () => {
		const { container } = wrapper;
		const propertyId02 = { name: "multiselect_table", row: 0, col: 2 };
		propertyUtilsRTL.openSummaryPanel(wrapper, "multiselect-table-panel");
		let table = container.querySelector("div[data-id='properties-ci-multiselect_table']");

		// Verify initial value
		const rowOneColTwoInitValue = ["blue"];
		expect(renderedController.getPropertyValue(propertyId02)).to.be.eql(rowOneColTwoInitValue);

		// verify able to select a new option subPanel
		const editButtons = table.querySelectorAll("button.properties-subpanel-button");
		expect(editButtons).to.have.length(2);
		fireEvent.click(editButtons[0]);
		const subPanel = container.querySelector(".properties-editstyle-sub-panel");
		const subPanelMultiselect = subPanel.querySelector("div[data-id='properties-multiselect_table_0_2']");

		const subPanelMultiselectButton = subPanelMultiselect.querySelector("input"); // filterable multiselect
		fireEvent.click(subPanelMultiselectButton);

		table = container.querySelector("div[data-id='properties-ci-multiselect_table']");
		const subPanelMultiselectList = container.querySelectorAll("li.cds--list-box__menu-item");
		expect(subPanelMultiselectList).to.have.length(6);

		fireEvent.click(subPanelMultiselectList[1]);
		const expectedSubPanelValue = rowOneColTwoInitValue.concat(subPanelMultiselectList[1].textContent);
		expect(JSON.stringify(renderedController.getPropertyValue(propertyId02))).to.equal(JSON.stringify(expectedSubPanelValue));
	});

	it("multiselect renders correctly in a table - onpanel", () => {
		const { container } = wrapper;
		const propertyId11 = { name: "multiselect_table", row: 1, col: 1 };
		propertyUtilsRTL.openSummaryPanel(wrapper, "multiselect-table-panel");
		let table = container.querySelector("div[data-id='properties-ci-multiselect_table']");

		// Verify initial value
		expect(renderedController.getPropertyValue(propertyId11)).to.be.eql([]);

		tableUtilsRTL.selectCheckboxes(table, [1]); // Select second row for onPanel edit
		table = container.querySelector("div[data-id='properties-ci-multiselect_table']");

		// verify able to select a new option
		const multiselectOnPanel = table.querySelector(".properties-onpanel-container");
		const multiselectButton = multiselectOnPanel.querySelector("button");
		fireEvent.click(multiselectButton);

		table = container.querySelector("div[data-id='properties-ci-multiselect_table']");
		const multiselectList = table.querySelectorAll("li.cds--list-box__menu-item");
		expect(multiselectList).to.have.length(4);

		fireEvent.click(multiselectList[0]);
		const expectedValue = [multiselectList[0].textContent];
		expect(renderedController.getPropertyValue(propertyId11)).to.eql(expectedValue);
	});

	it("multiselect control should have aria-label", () => {
		const { container } = wrapper;
		const multiselectWrapper = container.querySelector("div[data-id='properties-ctrl-multiselect_multiple_selected']");
		const multiselectAriaLabelledby = multiselectWrapper.querySelector(".cds--list-box__menu").getAttribute("aria-labelledby");
		expect(
			multiselectWrapper
				.querySelector(`label[id='${multiselectAriaLabelledby}']`)
				.querySelector(".properties-control-item")
				.textContent
		).to.equal("multiselect multiple options selected(required)");
	});
});

describe("multiselect classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(multiselectParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("multiselect should have custom classname defined", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll(".multiselect-control-class")).to.have.length(1);
	});

	it("multiselect should have custom classname defined in table cells", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "multiselect-table-panel");
		expect(container.querySelectorAll(".table-on-panel-multiselect-control-class")).to.have.length(2);
		expect(container.querySelectorAll(".table-subpanel-multiselect-control-class")).to.have.length(2);
	});
});

describe("multiselect filters work correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(multiselectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate multiselect should have options filtered by enum_filter", async() => {
		const { container } = wrapper;
		let multiselectWrapper = container.querySelector("div[data-id='properties-multiselect_filtered']");
		// open the multiselect
		let multiselectButton = multiselectWrapper.querySelector("button");
		fireEvent.click(multiselectButton);
		multiselectWrapper = container.querySelector("div[data-id='properties-multiselect_filtered']");
		let multiselectList = multiselectWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(multiselectList).to.be.length(6);

		renderedController.updatePropertyValue({ name: "filter" }, true);
		await waitFor(() => {
			multiselectWrapper = container.querySelector("div[data-id='properties-multiselect_filtered']");
			multiselectButton = multiselectWrapper.querySelector("button");
			fireEvent.click(multiselectButton);
			multiselectWrapper = container.querySelector("div[data-id='properties-multiselect_filtered']");
			multiselectList = multiselectWrapper.querySelectorAll("li.cds--list-box__menu-item");
			expect(multiselectList).to.be.length(3);
		});

	});

	it("Validate multiselect should clear the property value if filtered", async() => {
		const propertyId = { name: "multiselect_filtered" };
		expect(renderedController.getPropertyValue(propertyId)).to.eql(["yellow"]);
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// "yellow" isn't part of the filter so the value should be cleared
		await waitFor(() => {
			expect(renderedController.getPropertyValue(propertyId)).to.eql([]);
		});
	});

	it("Validate multiselect default is set when current values are filtered", async() => {
		const propertyId = { name: "multiselect_filtered_default" };
		expect(renderedController.getPropertyValue(propertyId)).to.eql(["yellow", "purple"]);
		renderedController.updatePropertyValue({ name: "filter_default" }, true);
		// "purple" isn't part of the filter so the value should be cleared
		await waitFor(() => {
			expect(renderedController.getPropertyValue(propertyId)).to.eql(["red"]);
		});
	});

});
