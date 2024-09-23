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
import { Provider } from "react-redux";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "./../../../src/common-properties/properties-controller";
import Checkboxset from "./../../../src/common-properties/controls/checkboxset";
import CommonProperties from "./../../../src/common-properties/common-properties.jsx";
import { render } from "../../_utils_/mount-utils.js";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import checkboxSetParamDef from "../../test_resources/paramDefs/checkboxset_paramDef.json";
import { fireEvent, waitFor } from "@testing-library/react";


const controller = new Controller();

const control = {
	name: "test-checkboxset",
	values: ["apple", "grape", "orange", "pear"],
	valueLabels: ["apple", "grape", "orange", "pear"],
	valueDescs: ["desc for 0", "desc for 20"]
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
propertyUtilsRTL.setControls(controller, [control, controlNull, controlNumber,
	controlInvalid, controlUndefined]);

const propertyId = { name: "test-checkboxset" };

const mockCheckboxset = jest.fn();
jest.mock("../../../src/common-properties/controls/checkboxset",
	() => (props) => mockCheckboxset(props)
);

mockCheckboxset.mockImplementation((props) => {
	const CheckboxsetComp = jest.requireActual(
		"../../../src/common-properties/controls/checkboxset",
	).default;
	return <CheckboxsetComp {...props} />;
});

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
		render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
					tableControl
				/>
			</Provider>
		);

		expectJest(mockCheckboxset).toHaveBeenCalledWith({
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
			"tableControl": true
		});
	});
	it("checkboxset labels are displayed", () => {
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const checkboxsetWrapper = container.querySelector("div[data-id='properties-test-checkboxset']");
		const labels = checkboxsetWrapper.querySelectorAll(".properties-checkboxset-container label");
		expect(labels).to.have.length(control.valueLabels.length);
		for (let i = 0; i < labels.length; ++i) {
			expect(labels[i].textContent).to.equal(control.valueLabels[i]);
		}
	});
	it("checkboxset tooltips for NumberChecbox are displayed", () => {
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const tooltipContainer = container.querySelectorAll("div.tooltipContainer");
		for (let i = 0; i < tooltipContainer.length; ++i) {
			expect(tooltipContainer[i].textContent).to.equal(control.valueDescs[i]);
		}
	});
	it("checkboxset number labels are displayed", () => {
		const propertyIdNumber = { name: "test-checkboxset-number" };
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={controlNumber}
					controller={controller}
					propertyId={propertyIdNumber}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const checkboxsetWrapper = container.querySelector("div[data-id='properties-test-checkboxset-number']");
		const labels = checkboxsetWrapper.querySelectorAll(".properties-checkboxset-container label");
		expect(labels).to.have.length(controlNumber.valueLabels.length);
		for (let i = 0; i < labels.length; ++i) {
			expect(labels[i].textContent).to.equal(controlNumber.valueLabels[i]);
		}
	});
	it("checkboxset handles updates values correctly", () => {
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const checkboxsetWrapper = container.querySelector("div[data-id='properties-test-checkboxset']");
		const checkboxes = checkboxsetWrapper.querySelectorAll("input");
		// check to make sure correct checkboxes are checked
		expect(checkboxes).to.have.length(control.valueLabels.length);
		expect(checkboxes[0].checked).to.equal(true);
		expect(checkboxes[1].checked).to.equal(false);
		expect(checkboxes[2].checked).to.equal(true);
		expect(checkboxes[3].checked).to.equal(false);
		// unchecked a box
		checkboxes[0].setAttribute("checked", false);
		fireEvent.click(checkboxes[0]);
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange"]);

		// checked a box
		checkboxes[1].setAttribute("checked", true);
		fireEvent.click(checkboxes[1]);
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange", "grape"]);

		// checked a box
		checkboxes[0].setAttribute("checked", true);
		fireEvent.click(checkboxes[0]);
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange", "grape", "apple"]);

		// unchecked a box
		checkboxes[1].setAttribute("checked", false);
		fireEvent.click(checkboxes[1]);
		expect(controller.getPropertyValue(propertyId)).to.eql(["orange", "apple"]);
	});
	it("checkboxset handles number updates values correctly", () => {
		const propertyIdNumber = { name: "test-checkboxset-number" };
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={controlNumber}
					controller={controller}
					propertyId={propertyIdNumber}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const checkboxsetWrapper = container.querySelector("div[data-id='properties-test-checkboxset-number']");
		const checkboxes = checkboxsetWrapper.querySelectorAll("input");
		expect(checkboxes).to.have.length(controlNumber.valueLabels.length);
		expect(checkboxes[0].checked).to.equal(false);
		expect(checkboxes[1].checked).to.equal(true);
		expect(checkboxes[2].checked).to.equal(true);
		expect(checkboxes[3].checked).to.equal(true);
		expect(checkboxes[4].checked).to.equal(false);
		expect(checkboxes[5].checked).to.equal(false);
		// unchecked a box
		checkboxes[2].setAttribute("checked", false);
		fireEvent.click(checkboxes[2]);

		expect(controller.getPropertyValue(propertyIdNumber)).to.eql([14.2, -1]);

		// checked a box
		checkboxes[0].setAttribute("checked", true);
		fireEvent.click(checkboxes[0]);
		expect(controller.getPropertyValue(propertyIdNumber)).to.eql([14.2, -1, 10]);
	});
	it("checkboxset handles invalid values correctly", () => {
		const propertyIdInvalid = { name: "test-checkboxset-invalid" };
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={controlInvalid}
					controller={controller}
					propertyId={propertyIdInvalid}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const checkboxsetWrapper = container.querySelector("div[data-id='properties-test-checkboxset-invalid']");
		const checkboxes = checkboxsetWrapper.querySelectorAll("input");
		// check to make sure correct checkboxes are checked
		expect(checkboxes).to.have.length(controlInvalid.valueLabels.length);
		expect(checkboxes[0].checked).to.equal(true);
		expect(checkboxes[1].checked).to.equal(false);
		expect(checkboxes[2].checked).to.equal(false);
		// unchecked a box
		checkboxes[2].setAttribute("checked", true);
		fireEvent.click(checkboxes[2]);
		expect(controller.getPropertyValue(propertyIdInvalid)).to.eql(["orange", "peach"]);
	});
	it("checkboxset handles null correctly", () => {
		const propertyIdNull = { name: "test-checkboxset-null" };
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={controlNull}
					controller={controller}
					propertyId={propertyIdNull}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const checkboxsetWrapper = container.querySelector("div[data-id='properties-test-checkboxset-null']");
		const checkboxes = checkboxsetWrapper.querySelectorAll("input");
		// all no checkboxes should be checked
		expect(checkboxes).to.have.length(controlNull.valueLabels.length);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.checked).to.equal(false);
		});
		const checkbox = checkboxes[1];
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		expect(controller.getPropertyValue(propertyIdNull)).to.eql(["orange"]);
	});
	it("checkboxset handles undefined correctly", () => {
		const propertyIdUndefined = { name: "test-checkboxset-undefined" };
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={controlUndefined}
					controller={controller}
					propertyId={propertyIdUndefined}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const checkboxsetWrapper = container.querySelector("div[data-id='properties-test-checkboxset-undefined']");
		const checkboxes = checkboxsetWrapper.querySelectorAll("input");
		// all no checkboxes should be checked
		expect(checkboxes).to.have.length(controlUndefined.valueLabels.length);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.checked).to.equal(false);
		});
		const checkbox = checkboxes[0];
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		expect(controller.getPropertyValue(propertyIdUndefined)).to.eql(["apple"]);
	});
	it("checkboxset renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const checkboxsetWrapper = container.querySelector("div[data-id='properties-test-checkboxset']");
		const checkboxes = checkboxsetWrapper.querySelectorAll("input");
		expect(checkboxes.length).to.have.gt(1);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.disabled).to.equal(true);
		});
	});
	it("checkboxset renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-test-checkboxset']");
		expect(checkboxWrapper.className.includes("hide")).to.equal(true);
	});
	it("checkboxset renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Checkboxset
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-test-checkboxset']");
		const messageWrapper = checkboxWrapper.querySelectorAll("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
});

describe("checkboxset works as expected in table control", () => {
	var wrapper;
	var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(checkboxSetParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("checkboxset works as expected in table control onpanel", () => {
		const { container } = wrapper;
		const summaryPanelTable = propertyUtilsRTL.openSummaryPanel(wrapper, "checkboxset-table-summary");
		const propId = { name: "checkboxset_table", row: 0, col: 1 };
		const tableRows = tableUtilsRTL.getTableRows(summaryPanelTable);
		expect(tableRows).to.have.length(2);
		expect(renderedController.getPropertyValue(propId)).to.eql([8, 5]);

		tableUtilsRTL.selectCheckboxes(summaryPanelTable, [0]);
		const checkboxsetWrapper = container.querySelectorAll("div[data-id='properties-checkboxset_table_0_1']");
		const checkboxes = checkboxsetWrapper[1].querySelectorAll("input");
		checkboxes[0].setAttribute("checked", false);
		fireEvent.click(checkboxes[0]);
		checkboxes[2].setAttribute("checked", false);
		fireEvent.click(checkboxes[2]);
		expect(renderedController.getPropertyValue(propId)).to.eql([]);
	});

	it("checkboxset works as expected in table control subpanel", () => {
		const { rerender, container } = wrapper;
		const summaryPanelTable = propertyUtilsRTL.openSummaryPanel(wrapper, "checkboxset-table-summary");
		const propId = { name: "checkboxset_table", row: 0, col: 0 };
		const tableRows = tableUtilsRTL.getTableRows(summaryPanelTable);
		expect(tableRows).to.have.length(2);
		expect(renderedController.getPropertyValue(propId)).to.eql(["banana", "orange", "pear"]);
		const rowWrapper = tableRows[0];
		const subpanelButton = rowWrapper.querySelectorAll("button.properties-subpanel-button");
		expect(subpanelButton).to.have.length(1);
		fireEvent.click(subpanelButton[0]);

		const rerendered = propertyUtilsRTL.flyoutEditorFormRerender(checkboxSetParamDef);
		const { propertiesInfo, propertiesConfig, callbacks, customControls, customConditionOps } = rerendered;
		controller.updatePropertyValue({ name: "textfield" }, null);
		rerender(
			<div className="properties-right-flyout">
				<CommonProperties
					propertiesInfo={propertiesInfo}
					propertiesConfig={propertiesConfig}
					callbacks={callbacks}
					customControls={customControls}
					customConditionOps={customConditionOps}
				/>
			</div>
		);
		const checkboxsetWrapper = container.querySelectorAll("div[data-id='properties-checkboxset_table_0_0']")[1];
		const checkboxes = checkboxsetWrapper.querySelectorAll("input");
		expect(checkboxes[0].checked).to.equal(false);
		expect(checkboxes[1].checked).to.equal(true);
		checkboxes[1].setAttribute("checked", false);
		fireEvent.click(checkboxes[1]);
		checkboxes[2].setAttribute("checked", false);
		fireEvent.click(checkboxes[2]);
		expect(renderedController.getPropertyValue(propId)).to.eql(["pear"]);
	});

	it("checkboxset works as expected in table control when new row added with filter", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "checkboxset-table-summary");
		// add 1 row and validate with filter disabled
		const table = container.querySelector("div[data-id='properties-checkboxset_table']");
		const addValueBtn = table.querySelector("button.properties-add-fields-button");
		fireEvent.click(addValueBtn);
		expect(renderedController.getPropertyValue({ name: "checkboxset_table", row: 2, col: 0 })).to.eql(["banana", "orange", "pear"]);
		// enable filter add new row.  Existing rows should also be updated to remove invalid values
		renderedController.updatePropertyValue({ name: "filter2" }, true);
		fireEvent.click(addValueBtn);
		expect(renderedController.getPropertyValue({ name: "checkboxset_table", row: 2, col: 0 })).to.eql(["orange", "pear"]);
		expect(renderedController.getPropertyValue({ name: "checkboxset_table", row: 3, col: 0 })).to.eql(["orange", "pear"]);
	});
});

describe("checkboxset enum_filter works correctly", () => {
	var wrapper;
	var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(checkboxSetParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate checkboxset should have options filtered by enum_filter", async() => {
		const { container } = wrapper;
		let checkboxes = container.querySelectorAll("div[data-id='properties-checkboxset_filtered'] input");
		// validate all checkboxes are enabled
		checkboxes.forEach((checkbox) => {
			expect(checkbox.disabled).to.equal(false);
		});
		// checked the filter box
		renderedController.updatePropertyValue({ name: "filter" }, true);


		// validate the correct number of options show up on open
		await waitFor(() => {
			const checkboxesWrapper = container.querySelector("div[data-id='properties-checkboxset_filtered']");
			checkboxes = checkboxesWrapper.querySelectorAll("input");
			// one of the checkboxes should be disabled
			expect(checkboxes[1].disabled).to.equal(true);
		});
	});

	it("Validate checkboxset should uncheck filtered value", async() => {
		const locPropertyId = { name: "checkboxset_filtered" };
		renderedController.updatePropertyValue(locPropertyId, ["apple", "pear", "orange"]);
		// checked the filter box
		renderedController.updatePropertyValue({ name: "filter" }, true);
		await waitFor(() => {
			const checkboxsetValue = renderedController.getPropertyValue(locPropertyId);
			expect(checkboxsetValue).to.eql(["apple", "pear"]);
		});
	});
});

describe("checkboxset classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(checkboxSetParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("checkboxset should have custom classname defined", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll(".checkboxset-control-class")).to.have.length(1);
	});

	it("checkboxset should have custom classname defined in table cells", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "checkboxset-table-summary");
		expect(container.querySelectorAll(".table-on-panel-checkboxset-control-class")).to.have.length(2);
		expect(container.querySelectorAll(".table-subpanel-checkboxset-control-class")).to.have.length(2);
	});
});
