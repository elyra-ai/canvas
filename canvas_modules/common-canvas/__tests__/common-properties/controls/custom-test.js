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

import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";
import customControlParamDef from "../../test_resources/paramDefs/custom-ctrl-op_paramDef.json";
import { expect } from "chai";

describe("custom control renders correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(customControlParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show the correct custom controls", () => {
		const customToggles = wrapper.find("div.custom-toggle");
		expect(customToggles).to.have.length(3);// includes table toggles
		const tableCustomToggles = tableUtils.getTableRows(wrapper.find("div[data-id='properties-structuretable']"));
		expect(tableCustomToggles).to.have.length(2);
		// This summary text comes from the custom control
		const cellText = wrapper.find("span.properties-field-type div.text");
		expect(cellText).to.have.length(2);
		expect(cellText.at(0).text()).to.equal("20-low");
		expect(cellText.at(1).text()).to.equal("50-high");
	});

	it("updating custom controls should work correctly", () => {
		let tableToggle = wrapper.find("button#structuretable_1_1");
		tableToggle.simulate("click");
		const customToggle = wrapper.find("button#custom_toggle");
		customToggle.simulate("click");
		expect(controller.getPropertyValue({ name: "custom_toggle" })).to.equal(false);
		expect(controller.getPropertyValue({ name: "structuretable", row: 1, col: 1 })).to.equal(false);
		expect(controller.getPropertyValue({ name: "structuretable", row: 0, col: 1 })).to.equal(false);
		tableToggle = wrapper.find("button#structuretable_0_1");
		tableToggle.simulate("click");
		expect(controller.getPropertyValue({ name: "structuretable", row: 0, col: 1 })).to.equal(true);
	});

	it("validate custom table is rendered below standard table", () => {
		let customTable = wrapper.find("div.custom-table");
		expect(customTable).to.have.length(0);
		const tableData = tableUtils.getTableRows(wrapper);
		tableUtils.selectCheckboxes(tableData, [0]);
		customTable = wrapper.find("div.custom-table");
		expect(customTable).to.have.length(1);
		const rows = customTable.find("tr");
		// table should have 1 data row and a header row
		expect(rows).to.have.length(2);
	});

	it("validate changing toggle value (custom control) changes enum values", () => {
		// select the first item
		let dropdownWrapper = wrapper.find("div[data-id='properties-colors']");
		const dropdownButton = dropdownWrapper.find("button");
		dropdownButton.simulate("click"); // open dropdown
		dropdownWrapper = wrapper.find("div[data-id='properties-colors']");
		let dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(1); // should have 1 item. Before custom toggle changes

		const customToggle = wrapper.find("div[data-id='properties-ci-custom_toggle']");
		expect(customToggle).to.have.length(1);
		const toggle = customToggle.find("button");
		toggle.simulate("click");
		dropdownWrapper = wrapper.find("div[data-id='properties-colors']");

		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-colors']");
		dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(3); // should have 3 items. Custom toggle control updates the values

		toggle.simulate("click");

		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-colors']");
		dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(2); // should have 2 items. Custom toggle control updates the values
	});
});

describe("custom control classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(customControlParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("custom control should have custom classname defined", () => {
		expect(wrapper.find(".custom-control-class")).to.have.length(1);
	});

	it("custom control should have custom classname defined in table cells", () => {
		expect(wrapper.find(".table-custom-control-class")).to.have.length(2);
		expect(wrapper.find(".table-on-panel-custom-control-class")).to.have.length(2);
	});
});
