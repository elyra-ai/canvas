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

import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import customControlParamDef from "../../test_resources/paramDefs/custom-ctrl-op_paramDef.json";
import { expect } from "chai";
import { fireEvent } from "@testing-library/react";

beforeAll(() => {
	// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
	Element.prototype.getBoundingClientRect = jest.fn()
		.mockReturnValue({
			height: 1000, // This is used to measure the panel height
			width: 1000
		});
});

describe("custom control renders correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(customControlParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show the correct custom controls", () => {
		const { container } = wrapper;
		const customToggles = container.querySelectorAll("div.custom-toggle");
		expect(customToggles).to.have.length(3);// includes table toggles
		const tableCustomToggles = tableUtilsRTL.getTableRows(container.querySelector("div[data-id='properties-structuretable']"));
		expect(tableCustomToggles).to.have.length(2);
		// This summary text comes from the custom control
		const cellText = container.querySelectorAll("span.properties-field-type div.text");
		expect(cellText).to.have.length(2);
		expect(cellText[0].textContent).to.equal("20-low");
		expect(cellText[1].textContent).to.equal("50-high");
	});

	it("updating custom controls should work correctly", () => {
		const { container } = wrapper;
		let tableToggle = container.querySelector("button#structuretable_1_1");
		fireEvent.click(tableToggle);
		const customToggle = container.querySelector("button#custom_toggle");
		fireEvent.click(customToggle);
		expect(controller.getPropertyValue({ name: "custom_toggle" })).to.equal(false);
		expect(controller.getPropertyValue({ name: "structuretable", row: 1, col: 1 })).to.equal(false);
		expect(controller.getPropertyValue({ name: "structuretable", row: 0, col: 1 })).to.equal(false);
		tableToggle = container.querySelector("button#structuretable_0_1");
		fireEvent.click(tableToggle);
		expect(controller.getPropertyValue({ name: "structuretable", row: 0, col: 1 })).to.equal(true);
	});

	it("validate custom table is rendered below standard table", () => {
		const { container } = wrapper;
		let customTable = container.querySelectorAll("div.custom-table");
		expect(customTable).to.have.length(0);
		const tableData = tableUtilsRTL.getTableRows(container);
		tableUtilsRTL.selectCheckboxes(tableData, [0]);
		customTable = container.querySelectorAll("div.custom-table");
		expect(customTable).to.have.length(1);
		const rows = customTable[0].querySelectorAll("tr");
		// table should have 1 data row and a header row
		expect(rows).to.have.length(2);
	});

	it("validate changing toggle value (custom control) changes enum values", () => {
		const { container } = wrapper;
		// select the first item
		let dropdownWrapper = container.querySelector("div[data-id='properties-colors']");
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton); // open dropdown
		dropdownWrapper = container.querySelector("div[data-id='properties-colors']");
		let dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(1); // should have 1 item. Before custom toggle changes

		const customToggle = container.querySelectorAll("div[data-id='properties-ci-custom_toggle']");
		expect(customToggle).to.have.length(1);
		const toggle = customToggle[0].querySelector("button");
		fireEvent.click(toggle);
		// toggle.simulate("click");
		dropdownWrapper = container.querySelector("div[data-id='properties-colors']");

		// select the first item
		dropdownWrapper = container.querySelector("div[data-id='properties-colors']");
		dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(3); // should have 3 items. Custom toggle control updates the values

		fireEvent.click(toggle);
		// select the first item
		dropdownWrapper = container.querySelector("div[data-id='properties-colors']");
		dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(2); // should have 2 items. Custom toggle control updates the values
	});
});

describe("custom control classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(customControlParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("custom control should have custom classname defined", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll(".custom-control-class")).to.have.length(1);
	});

	it("custom control should have custom classname defined in table cells", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll(".table-custom-control-class")).to.have.length(2);
		expect(container.querySelectorAll(".table-on-panel-custom-control-class")).to.have.length(2);
	});
});
