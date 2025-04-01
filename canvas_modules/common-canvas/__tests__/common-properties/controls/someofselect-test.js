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
import SomeOfSelectControl from "../../../src/common-properties/controls/someofselect";
import { Provider } from "react-redux";
import { renderWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import SomeOfSelectParamDef from "../../test_resources/paramDefs/someofselect_paramDef.json";
import { fireEvent, waitFor } from "@testing-library/react";

const mockSomeOfSelect = jest.fn();
jest.mock("../../../src/common-properties/controls/someofselect",
	() => (props) => mockSomeOfSelect(props)
);

mockSomeOfSelect.mockImplementation((props) => {
	const SomeOfSelectComp = jest.requireActual(
		"../../../src/common-properties/controls/someofselect",
	).default;
	return <SomeOfSelectComp {...props} />;
});

beforeAll(() => {
	// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
	Element.prototype.getBoundingClientRect = jest.fn()
		.mockReturnValue({
			height: 1000, // This is used to measure the panel height
			width: 1000
		});
});

describe("SomeOfSelectControl renders correctly", () => {

	const controller = new Controller();

	const control = {
		"name": "test-someofselect",
		"label": {
			"text": "Merge method"
		},
		"controlType": "someofselect",
		"valueDef": {
			"propType": "string",
			"isList": true,
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
	const propertyId = { name: "test-someofselect" };

	it("props should have been defined", () => {
		renderWithIntl(
			<SomeOfSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expectJest(mockSomeOfSelect).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("should render a SomeOfSelectControl", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.container.querySelector("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		expect(someofselectCheckbox).to.have.length(4);
	});
	it("SomeOfSelectControl updates correctly", () => {
		controller.setPropertyValues(
			{ "test-someofselect": ["Order"] }
		);
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.container.querySelector("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		expect(someofselectCheckbox).to.have.length(4);

		expect(someofselectCheckbox[0].checked).to.equal(true);
		tableUtilsRTL.selectCheckboxes(wrapper.container, [0]);
		expect(controller.getPropertyValue(propertyId)).to.have.length(0);
	});
	it("SomeOfSelectControl handles readonly correctly", () => {
		controller.setPropertyValues(
			{ "test-someofselect": ["Order"] }
		);
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
					readOnly
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.container.querySelector("div[data-id='properties-test-someofselect']");
		const firstCheckbox = someofselectWrapper.querySelectorAll("input")[0];
		const secondCheckbox = someofselectWrapper.querySelectorAll("input")[1];
		expect(firstCheckbox.getAttribute("aria-readonly")).to.equal(true.toString());
		expect(secondCheckbox.getAttribute("aria-readonly")).to.equal(true.toString());
	});
	it("SomeOfSelectControl handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-someofselect": null }
		);
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const someofselectWrapper = container.querySelector("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		expect(someofselectCheckbox).to.have.length(4);

		someofselectCheckbox.forEach(function(checkbox) {
			expect(checkbox.checked).to.equal(false);
		});
		tableUtilsRTL.selectCheckboxes(container, [1]);
		const controlValue = controller.getPropertyValue(propertyId);
		expect(controlValue).to.have.length(1);
		expect(controlValue[0]).to.equal("Keys");
	});
	it("SomeOfSelectControl handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const someofselectWrapper = container.querySelector("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		expect(someofselectCheckbox).to.have.length(4);

		someofselectCheckbox.forEach(function(checkbox) {
			expect(checkbox.checked).to.equal(false);
		});
		tableUtilsRTL.selectCheckboxes(container, [2]);
		const controlValue = controller.getPropertyValue(propertyId);
		expect(controlValue).to.have.length(1);
		expect(controlValue[0]).to.equal("Condition");
	});
	it("SomeOfSelectControl renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.container.querySelector("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		expect(someofselectCheckbox).to.have.length(4);

		someofselectCheckbox.forEach(function(checkbox) {
			expect(checkbox.disabled).to.equal(true);
		});
	});
	it("SomeOfSelectControlrenders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.container.querySelector("div[data-id='properties-test-someofselect']");
		expect(someofselectWrapper.className.includes("hide")).to.equal(true);
	});
	it("checkbox renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad someofselect value"
		});
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.container.querySelector("div[data-id='properties-test-someofselect']");
		const messageWrapper = someofselectWrapper.querySelectorAll("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
	it("SomeOfSelectControl should have aria-label", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.container.querySelector(".properties-autosized-vt");
		expect(someofselectWrapper.getAttribute("aria-label")).to.equal(control.label.text);
	});
});

describe("someofselect works correctly in common-properties", () => {
	let wrapper;
	beforeEach(() => {
		const form = propertyUtilsRTL.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = form.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate someofselect_disabled should have options filtered by enum_filter", () => {
		const { container } = wrapper;
		// verify the original number of entries
		let someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_disabled']");
		let someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		expect(someofselectCheckbox).to.have.length(6);

		// deselect the disable checkbox which will filter the list to a smaller number
		const checkboxWrapper = container.querySelector("div[data-id='properties-disable']");
		const checkbox = checkboxWrapper.querySelector("input");
		expect(checkbox.checked).to.equal(true);
		checkbox.setAttribute("checked", false);
		fireEvent.click(checkbox);

		// the number of entries should be filtered
		someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_disabled']");
		someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		expect(someofselectCheckbox).to.have.length(3);
	});
});

describe("someofselect filtered enum works correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate someofselect should have options filtered by enum_filter", () => {
		const { container } = wrapper;
		let someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_filtered']");
		// validate the correct number of options show up on open
		expect(tableUtilsRTL.getTableRows(someofselectWrapper)).to.have.length(5);
		// make sure there isn't warning on first open
		expect(someofselectWrapper.querySelectorAll("div.properties-validation-message")).to.have.length(0);
		// checked the filter box
		const checkboxWrapper = container.querySelector("div[data-id='properties-filter']");
		const checkbox = checkboxWrapper.querySelector("input");
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		// validate the correct number of options show up on open
		someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_filtered']");
		expect(tableUtilsRTL.getTableRows(someofselectWrapper)).to.have.length(3);
	});

	it("Validate someofselectParamDef should clear the property value if filtered", async() => {
		const propertyId = { name: "someofselect_filtered" };
		// value was initially set to "purple" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.be.eql(["red"]);
		renderedController.updatePropertyValue(propertyId, ["red", "orange"]);
		expect(renderedController.getPropertyValue(propertyId)).to.eql(["red", "orange"]);
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// "orange" isn't part of the filter so the value should be cleared
		await waitFor(() => {
			expect(renderedController.getPropertyValue(propertyId)).to.eql(["red"]);
		});
	});

});

describe("someofselect classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("someofselect should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".someofselect-control-class")).to.have.length(1);
	});
});

describe("All checkboxes in someofselect must have labels", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("checkbox in row should have label", () => {
		const someofselect = wrapper.container.querySelector("div[data-id='properties-ctrl-someofselect']");
		const tableRows = tableUtilsRTL.getTableRows(someofselect);
		const rowCheckboxes = [];
		tableRows.forEach((tableRow) => {
			rowCheckboxes.push(tableRow.querySelector(".properties-vt-row-checkbox"));
		});
		const secondColumnRows = [];
		tableRows.forEach((tableRow) => {
			secondColumnRows.push(tableRow.querySelector(".ReactVirtualized__Table__rowColumn"));
		});
		expect(secondColumnRows).to.have.length(6);
		const tableName = someofselect.querySelector(".properties-control-label").textContent;

		secondColumnRows.forEach((row, index) => {
			const rowCheckboxLabel = rowCheckboxes[index].textContent;
			expect(rowCheckboxLabel).to.equal(`Select row ${index + 1} from ${tableName}`);
		});
	});
});

describe("someofselect control multiple rows selection", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should select/deselect multiple rows in someofselect using shift key", async() => {
		let someofselectWrapper;
		let someofselectCheckbox;
		const { container } = wrapper;
		someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_empty_array']");
		someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		expect(someofselectCheckbox).to.have.length(6);

		// Verify no rows are selected
		const selected = tableUtilsRTL.validateSelectedRowNum(someofselectWrapper);
		expect(selected).to.have.length(0);

		// select 2nd row
		tableUtilsRTL.selectCheckboxes(someofselectWrapper, [1]);
		someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_empty_array']");
		someofselectCheckbox = someofselectWrapper.querySelectorAll("input");

		// verify 1 row is selected
		expect(tableUtilsRTL.validateSelectedCheckbox(someofselectCheckbox)).to.have.length(1);

		// Shift + select 5th row
		tableUtilsRTL.shiftSelectCheckbox(someofselectWrapper, 5);
		// Update wrapper
		someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_empty_array']");
		someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		// Verify 2-5 rows are selected
		expect(tableUtilsRTL.validateSelectedCheckbox(someofselectCheckbox)).to.have.length(4);

		// Shift + select 1st row
		tableUtilsRTL.shiftSelectCheckbox(someofselectWrapper, 1);
		someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_empty_array']");
		someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		// Verify 1-5 rows are selected
		expect(tableUtilsRTL.validateSelectedCheckbox(someofselectCheckbox)).to.have.length(5);

		// Shift + select 5th row
		tableUtilsRTL.shiftSelectCheckbox(someofselectWrapper, 5);
		// Update wrapper
		someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_empty_array']");
		someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		// Verify all rows are deselected
		expect(tableUtilsRTL.validateSelectedCheckbox(someofselectCheckbox)).to.have.length(0);
	});

	it("verify multiple rows select/deselect works fine with filtered enum", async() => {
		const { container } = wrapper;
		// Open filters tab
		fireEvent.click(container.querySelectorAll("button.cds--accordion__heading")[2]);
		let someofselectWrapper;
		let someofselectCheckbox;
		someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_filtered']");
		someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		expect(someofselectCheckbox).to.have.length(5);

		// Verify 1 row is selected
		const selected = tableUtilsRTL.validateSelectedRowNum(someofselectWrapper);
		expect(selected).to.have.length(1);

		// Shift + select 5th row
		tableUtilsRTL.shiftSelectCheckbox(someofselectWrapper, 5);
		// Update wrapper
		someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_filtered']");
		someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		// Verify all rows are selected
		expect(tableUtilsRTL.validateSelectedCheckbox(someofselectCheckbox)).to.have.length(5);

		// Click on filtered enum button
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// Wait for updates
		await waitFor(() => {
			someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_filtered']");
			someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
			// After filtering only 3 rows are displayed. Verify all 3 rows are selected
			expect(tableUtilsRTL.validateSelectedCheckbox(someofselectCheckbox)).to.have.length(3);

		});

		// Remove filter
		renderedController.updatePropertyValue({ name: "filter" }, false);
		// Wait for updates
		await waitFor(() => {
			someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_filtered']");
			someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
			// Verify 3 rows are selected
			expect(tableUtilsRTL.validateSelectedCheckbox(someofselectCheckbox)).to.have.length(3);
		});

		// Shift + select 2nd row
		tableUtilsRTL.shiftSelectCheckbox(someofselectWrapper, 2);
		// Update wrapper
		someofselectWrapper = container.querySelector("div[data-id='properties-someofselect_filtered']");
		someofselectCheckbox = someofselectWrapper.querySelectorAll("input");
		// Verify all rows are selected
		expect(tableUtilsRTL.validateSelectedCheckbox(someofselectCheckbox)).to.have.length(5);
	});

});
