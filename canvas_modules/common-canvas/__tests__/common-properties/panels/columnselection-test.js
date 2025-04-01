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

import { expect } from "chai";
import { within } from "@testing-library/react";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "../../_utils_/table-utilsRTL";
import columnSelectionPanel from "./../../test_resources/paramDefs/columnSelectionPanel_multiInput_paramDef.json";
import panelParamDef from "./../../test_resources/paramDefs/panel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";
import { cleanup, fireEvent } from "@testing-library/react";

beforeAll(() => {
	// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
	Element.prototype.getBoundingClientRect = jest.fn()
		.mockReturnValue({
			height: 1000, // This is used to measure the panel height
			width: 1000
		});
});

describe("selectcolumn and selectcolumns controls work in columnSelection panel", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("should show correct values from selectcolumn controls", () => {
		const { container } = wrapper;
		const panel1 = container.querySelector("div[data-id='properties-field1_panel']");
		const label1 = panel1.querySelector("span.cds--list-box__label");
		expect(label1.textContent).to.equal("age");
		const dropdownButton = panel1.querySelector("button.cds--list-box__field");
		expect(dropdownButton).to.not.be.null;
		fireEvent.click(dropdownButton);
		const dropdown1 = panel1.querySelectorAll("ul.cds--list-box__menu li");
		expect(dropdown1).to.not.be.null;
		const actualOptions = Array.from(dropdown1).map((item) => ({
			label: item.textContent.trim(),
			value: item.getAttribute("data-value") || item.textContent.trim()
		}));
		const expectedOptions = [
			{ label: "...", value: "..." },
			{ label: "age", value: "age" },
			{ label: "Na", value: "Na" },
			{ label: "drug", value: "drug" }
		];
		expect(actualOptions).to.eql(expectedOptions);
		const panel2 = container.querySelector("div[data-id='properties-field2_panel']");
		const label2 = panel2.querySelector("span.cds--list-box__label");
		expect(label2.textContent).to.equal("BP");
		const expectedOptions2 = [
			{ label: "...", value: "..." },
			{ label: "BP", value: "BP" },
			{ label: "Na", value: "Na" },
			{ label: "drug", value: "drug" }
		];
		const dropdownButton2 = panel2.querySelector("button.cds--list-box__field");
		expect(dropdownButton2).to.not.be.null;
		fireEvent.click(dropdownButton2);
		const dropdown2 = panel2.querySelectorAll("ul.cds--list-box__menu li");
		const actualOptions2 = Array.from(dropdown2).map((item) => ({
			label: item.textContent.trim(),
			value: item.getAttribute("data-value") || item.textContent.trim()
		}));
		expect(actualOptions2).to.eql(expectedOptions2);
	});

	it("should show correct values from selectcolumn and selectcolumns controls", () => {
		const { container } = wrapper;
		let panel1 = container.querySelector("div[data-id='properties-selectcolumn']");
		const label1 = panel1.querySelector("span.cds--list-box__label");
		expect(label1.textContent).to.equal("...");
		const expectedOptions = [
			{ label: "...", value: "..." },
			{ label: "age", value: "age" },
			{ label: "BP", value: "BP" },
			{ label: "Na", value: "Na" },
			{ label: "drug", value: "drug" }
		];
		const dropdownButton = panel1.querySelector("button.cds--list-box__field");
		expect(dropdownButton).to.not.be.null;
		fireEvent.click(dropdownButton);
		const dropdown = panel1.querySelectorAll("ul.cds--list-box__menu li");
		const actualOptions = Array.from(dropdown).map((item) => ({
			label: item.textContent.trim(),
			value: item.getAttribute("data-value") || item.textContent.trim()
		}));
		expect(actualOptions).to.eql(expectedOptions);
		// open the dropdown
		expect(dropdown.length).to.equal(5);
		// select age
		fireEvent.click(dropdown[1]);
		panel1 = container.querySelector("div[data-id='properties-selectcolumn']");
		const fieldPicker = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-ctrl-selectcolumns");
		tableUtilsRTL.fieldPicker(fieldPicker, ["BP"], ["BP", "Na", "drug"]);
		const panel2 = container.querySelector("div[data-id='properties-selectcolumns']");
		const rows = tableUtilsRTL.getTableRows(panel2);
		expect(rows).to.have.length(1);
	});
});

describe("selectcolumn and selectcolumns controls work in columnSelection panel with multi schema input", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(columnSelectionPanel);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		cleanup();
	});

	it("should show correct values from selectcolumn controls with multi schema input", () => {
		const { container } = wrapper;
		let panel1 = container.querySelector("div[data-id='properties-field1_panel']");
		const label1 = panel1.querySelector("span.cds--list-box__label");
		expect(label1.textContent).to.equal("0.Age");
		let expectedSelectColumn1Options = [
			{ label: "...", value: "..." },
			{ label: "0.Age", value: "0.Age" },
			{ label: "0.Sex", value: "0.Sex" },
			{ label: "0.Drug", value: "0.Drug" },
			{ label: "0.drug2", value: "0.drug2" },
			{ label: "data.Age", value: "data.Age" },
			{ label: "data.BP", value: "data.BP" },
			{ label: "data.bp", value: "data.bp" },
			{ label: "data.drug2", value: "data.drug2" },
			{ label: "2.Age", value: "2.Age" },
			{ label: "2.drug", value: "2.drug" },
			{ label: "2.drug2", value: "2.drug2" },
			{ label: "2.drug3", value: "2.drug3" }
		];
		let dropdownButton = panel1.querySelector("button.cds--list-box__field");
		expect(dropdownButton).to.not.be.null;
		fireEvent.click(dropdownButton);
		let actualOptions1 = Array.from(panel1.querySelectorAll("ul.cds--list-box__menu li")).map((item) => ({
			label: item.textContent.trim(),
			value: item.getAttribute("data-value") || item.textContent.trim()
		}));
		expect(actualOptions1).to.eql(expectedSelectColumn1Options);

		let panel2 = container.querySelector("div[data-id='properties-field2_panel']");
		const label2 = panel2.querySelector("span.cds--list-box__label");
		expect(label2.textContent).to.equal("0.BP");

		let expectedSelectColumn2Options = [
			{ label: "...", value: "..." },
			{ label: "0.Sex", value: "0.Sex" },
			{ label: "0.BP", value: "0.BP" },
			{ label: "0.Drug", value: "0.Drug" },
			{ label: "0.drug2", value: "0.drug2" },
			{ label: "data.Age", value: "data.Age" },
			{ label: "data.BP", value: "data.BP" },
			{ label: "data.bp", value: "data.bp" },
			{ label: "data.drug2", value: "data.drug2" },
			{ label: "2.Age", value: "2.Age" },
			{ label: "2.drug", value: "2.drug" },
			{ label: "2.drug2", value: "2.drug2" },
			{ label: "2.drug3", value: "2.drug3" }
		];
		const dropdownButton2 = panel2.querySelector("button.cds--list-box__field");
		expect(dropdownButton2).to.not.be.null;
		fireEvent.click(dropdownButton2);
		let actualOptions2 = Array.from(panel2.querySelectorAll("ul.cds--list-box__menu li")).map((item) => ({
			label: item.textContent.trim(),
			value: item.getAttribute("data-value") || item.textContent.trim()
		}));
		expect(actualOptions2).to.eql(expectedSelectColumn2Options);
		// open the dropdown
		panel1 = container.querySelector("div[data-id='properties-field1_panel']");
		const dropdownList = panel1.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(13);
		// select data.drug2
		fireEvent.click(dropdownList[8]);
		expectedSelectColumn1Options = [
			{ label: "...", value: "..." },
			{ label: "0.Age", value: "0.Age" },
			{ label: "0.Sex", value: "0.Sex" },
			{ label: "0.Drug", value: "0.Drug" },
			{ label: "0.drug2", value: "0.drug2" },
			{ label: "data.Age", value: "data.Age" },
			{ label: "data.BP", value: "data.BP" },
			{ label: "data.bp", value: "data.bp" },
			{ label: "data.drug2", value: "data.drug2" },
			{ label: "2.Age", value: "2.Age" },
			{ label: "2.drug", value: "2.drug" },
			{ label: "2.drug2", value: "2.drug2" },
			{ label: "2.drug3", value: "2.drug3" }
		];
		dropdownButton = panel1.querySelector("button.cds--list-box__field");
		expect(dropdownButton).to.not.be.null;
		fireEvent.click(dropdownButton);
		panel1 = container.querySelector("div[data-id='properties-field1_panel']");
		actualOptions1 = Array.from(panel1.querySelectorAll("ul.cds--list-box__menu li")).map((item) => ({
			label: item.textContent.trim(),
			value: item.getAttribute("data-value") || item.textContent.trim()
		}));
		expect(actualOptions1).to.eql(expectedSelectColumn1Options);

		expectedSelectColumn2Options = [
			{ label: "...", value: "..." },
			{ label: "0.Age", value: "0.Age" },
			{ label: "0.Sex", value: "0.Sex" },
			{ label: "0.BP", value: "0.BP" },
			{ label: "0.Drug", value: "0.Drug" },
			{ label: "0.drug2", value: "0.drug2" },
			{ label: "data.Age", value: "data.Age" },
			{ label: "data.BP", value: "data.BP" },
			{ label: "data.bp", value: "data.bp" },
			{ label: "2.Age", value: "2.Age" },
			{ label: "2.drug", value: "2.drug" },
			{ label: "2.drug2", value: "2.drug2" },
			{ label: "2.drug3", value: "2.drug3" }
		];
		panel2 = container.querySelector("div[data-id='properties-field2_panel']");
		actualOptions2 = Array.from(panel2.querySelectorAll("ul.cds--list-box__menu li")).map((item) => ({
			label: item.textContent.trim(),
			value: item.getAttribute("data-value") || item.textContent.trim()
		}));
		expect(actualOptions2).to.eql(expectedSelectColumn2Options);
	});

	it("should show correct values from selectcolumn and selectcolumns controls with multi schema input", () => {
		const { container } = wrapper;
		let panel1 = container.querySelector("div[data-id='properties-selectcolumn']");
		const label1 = panel1.querySelector("span.cds--list-box__label");
		expect(label1.textContent).to.equal("...");

		const fieldTable = [
			{ "name": "Age", "schema": "0" },
			{ "name": "Sex", "schema": "0" },
			{ "name": "BP", "schema": "0" },
			{ "name": "Drug", "schema": "0" },
			{ "name": "drug2", "schema": "0" },
			{ "name": "Age", "schema": "data" },
			{ "name": "BP", "schema": "data" },
			{ "name": "bp", "schema": "data" },
			{ "name": "drug2", "schema": "data" },
			{ "name": "Age", "schema": "2" },
			{ "name": "drug", "schema": "2" },
			{ "name": "drug2", "schema": "2" },
			{ "name": "drug3", "schema": "2" }
		];
		let dropdownButton = panel1.querySelector("button.cds--list-box__field");
		expect(dropdownButton).to.not.be.null;
		fireEvent.click(dropdownButton);
		let actualOptions = Array.from(panel1.querySelectorAll("ul.cds--list-box__menu li")).map((item) => ({
			label: item.textContent.trim(),
			value: item.getAttribute("data-value") || item.textContent.trim()
		}));
		expect(actualOptions.length).to.equal(fieldTable.length + 1); // +1 for "..."

		const fieldPicker = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-ctrl-selectcolumns");
		tableUtilsRTL.fieldPicker(fieldPicker, ["0.drug2", "2.drug2"], fieldTable);

		// open the dropdown
		panel1 = container.querySelector("div[data-id='properties-selectcolumn']");
		const dropdownList = panel1.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(12);
		// select data.Age
		fireEvent.click(dropdownList[5]);
		panel1 = container.querySelector("div[data-id='properties-selectcolumn']");
		dropdownButton = panel1.querySelector("button.cds--list-box__field");
		expect(dropdownButton).to.not.be.null;
		fireEvent.click(dropdownButton);
		actualOptions = Array.from(panel1.querySelectorAll("ul.cds--list-box__menu li")).map((item) => ({
			label: item.textContent.trim(),
			value: item.getAttribute("data-value") || item.textContent.trim()
		}));
		expect(actualOptions.length).to.equal(fieldTable.length - 1);

		const expectedOptions = [
			{ label: "...", value: "..." },
			{ label: "0.Age", value: "0.Age" },
			{ label: "0.Sex", value: "0.Sex" },
			{ label: "0.BP", value: "0.BP" },
			{ label: "0.Drug", value: "0.Drug" },
			{ label: "data.Age", value: "data.Age" },
			{ label: "data.BP", value: "data.BP" },
			{ label: "data.bp", value: "data.bp" },
			{ label: "data.drug2", value: "data.drug2" },
			{ label: "2.Age", value: "2.Age" },
			{ label: "2.drug", value: "2.drug" },
			{ label: "2.drug3", value: "2.drug3" }
		];
		expect(actualOptions).to.deep.equal(expectedOptions);
	});

	it("should show correct values from selectcolumns controls with multi schema input", () => {
		const { container } = wrapper;
		const selectColumnsTable2 = container.querySelector("div[data-id='properties-ft-selectcolumns2']");
		expect(selectColumnsTable2).to.exist;
		// selectColumnsTable3 is an empty table. It shows empty table text and Add columns button
		const selectColumnsTable3 = container.querySelectorAll("div[data-id='properties-ctrl-selectcolumns3']");
		expect(selectColumnsTable3).to.exist;

		const table2Rows = tableUtilsRTL.getTableRows(selectColumnsTable2);
		expect(table2Rows).to.have.length(3);

		const table2Initial = ["0.Age", "0.Drug", "2.Age"];
		table2Rows.forEach((row, idx) => {
			expect(row.querySelector(".properties-field-type").textContent).to.equal(table2Initial[idx]);
		});

		const fieldTable = [
			{ "name": "Sex", "schema": "0" },
			{ "name": "BP", "schema": "0" },
			{ "name": "drug2", "schema": "0" },
			{ "name": "Age", "schema": "data" },
			{ "name": "BP", "schema": "data" },
			{ "name": "bp", "schema": "data" },
			{ "name": "drug2", "schema": "data" },
			{ "name": "drug", "schema": "2" },
			{ "name": "drug2", "schema": "2" },
			{ "name": "drug3", "schema": "2" }
		];
		const selectcolumns3 = [
			"0.Sex",
			"0.BP",
			"0.drug2",
			"data.Age",
			"data.BP",
			"data.bp",
			"data.drug2",
			"2.drug",
			"2.drug2",
			"2.drug3"
		];
		const selectcolumns3A = [
			{ "link_ref": "0", "field_name": "Sex" },
			{ "link_ref": "0", "field_name": "BP" },
			{ "link_ref": "0", "field_name": "drug2" },
			{ "link_ref": "data", "field_name": "Age" },
			{ "link_ref": "data", "field_name": "BP" },
			{ "link_ref": "data", "field_name": "bp" },
			{ "link_ref": "data", "field_name": "drug2" },
			{ "link_ref": "2", "field_name": "drug" },
			{ "link_ref": "2", "field_name": "drug2" },
			{ "link_ref": "2", "field_name": "drug3" }
		];
		const fieldPicker = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-ctrl-selectcolumns3");
		tableUtilsRTL.fieldPicker(fieldPicker, selectcolumns3, fieldTable);
		expect(controller.getPropertyValue({ name: "selectcolumns3" })).to.deep.equal(selectcolumns3A);

		// Verify field picker from selectcolumns2 gets the correct fields
		const fieldTable2Input = [
			{
				"name": "0.Age",
				"type": "integer",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				},
				"schema": "0",
				"origName": "Age"
			},
			{
				"name": "0.Drug",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				},
				"schema": "0",
				"origName": "Drug"
			},
			{
				"name": "2.Age",
				"type": "integer",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				},
				"schema": "2",
				"origName": "Age"
			}
		];
		expect(controller.getFilteredDatasetMetadata({ name: "selectcolumns2" })).to.deep.equal(fieldTable2Input);
	});

	it("should handle improply defined string fields as strings", () => {
		const { container } = wrapper;
		const panel1 = container.querySelector("div[data-id='properties-BADVAR1']");
		const label1 = panel1.querySelector("span.cds--list-box__label");
		expect(label1.textContent).to.equal("0.Age");
	});
});

describe("column selection panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		cleanup();
	});

	it("controls in column selection panel should be disabled", () => {
		// by default it is enabled
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-disableColumnSelectionPanel']");
		const disabledCheckbox = checkboxWrapper.querySelector("input");
		expect(disabledCheckbox).to.have.property("checked", false);
		expect(controller.getPanelState({ name: "selectcolumn-values" })).to.equal("enabled");
		expect(controller.getControlState({ name: "field1_panel" })).to.equal("enabled");
		expect(controller.getControlState({ name: "field2_panel" })).to.equal("enabled");
		// disable the controls
		fireEvent.click(disabledCheckbox);
		expect(controller.getPanelState({ name: "selectcolumn-values" })).to.equal("disabled");
		expect(controller.getControlState({ name: "field1_panel" })).to.equal("disabled");
		expect(controller.getControlState({ name: "field2_panel" })).to.equal("disabled");
		// check that the controls are disabled.
		const panel = container.querySelector("div[data-id='properties-disable-selectcolumn-values']");
		const disabledPanel = panel.querySelector("div.properties-control-panel");
		const disabledItems = disabledPanel.querySelectorAll("div.properties-control-item");
		expect(disabledItems).to.have.length(2);
		expect(disabledItems[0].hasAttribute("disabled")).to.be.true;
		expect(disabledItems[1].hasAttribute("disabled")).to.be.true;
	});

	it("controls in column selection panel should be hidden", () => {
		const { container } = wrapper;
		const checkboxWrapper = container.querySelector("div[data-id='properties-hideColumnSelectionPanel']");
		const hiddenCheckbox = checkboxWrapper.querySelector("input");
		expect(hiddenCheckbox.checked).to.equal(false);
		expect(controller.getPanelState({ name: "column-selection-panel" })).to.equal("visible");

		// hide the controls
		fireEvent.click(hiddenCheckbox);
		expect(controller.getPanelState({ name: "column-selection-panel" })).to.equal("hidden");
		expect(controller.getControlState({ name: "selectcolumn" })).to.equal("hidden");
		expect(controller.getControlState({ name: "selectcolumns" })).to.equal("hidden");

		// check that the controls are hidden.
		const panel = container.querySelector("div[data-id='properties-hide-column-selection-panel']");
		expect(panel).to.exist;
		const hiddenPanel = panel.querySelectorAll("div.properties-control-panel");
		expect(hiddenPanel.length).to.be.greaterThan(0);
		const hiddenPanel1 = hiddenPanel[0];
		expect(hiddenPanel1).to.exist;
		const hiddenItems = within(hiddenPanel1).queryAllByRole("div", { name: /properties-control-item/i });
		expect(hiddenItems).to.have.length(0);
	});
});

describe("column selection panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("column selection panel should have custom classname defined", () => {
		const { container } = wrapper;
		const columnSelectionWrapper = container.querySelector("div[data-id='properties-column-selections']");
		expect(columnSelectionWrapper.querySelectorAll(".selectcolumn-values-group-columnselection-class")).to.have.length(1);
		expect(columnSelectionWrapper.querySelectorAll(".column-selection-panel-group-columnselection-class")).to.have.length(1);
	});

	it("column selection panel in a structuretable should have custom classname defined", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretable-summary-panel1");
		expect(container.querySelectorAll(".column-selection-panel-group-columnselection-class")).to.have.length(1);
	});
});

