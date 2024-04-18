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

import { expect } from "chai";

import propertyUtils from "./../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";
import columnSelectionPanel from "./../../test_resources/paramDefs/columnSelectionPanel_multiInput_paramDef.json";
import panelParamDef from "./../../test_resources/paramDefs/panel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";

describe("selectcolumn and selectcolumns controls work in columnSelection panel", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show correct values from selectcolumn controls", () => {
		const panel1 = wrapper.find("div[data-id='properties-field1_panel']");
		expect(panel1.find("span.cds--list-box__label").text()).to.equal("age");
		const expectedOptions = [
			{ label: "...", value: "" },
			{ label: "age", value: "age" },
			{ label: "Na", value: "Na" },
			{ label: "drug", value: "drug" }
		];
		const actualOptions = panel1.find("Dropdown").prop("items");
		expect(actualOptions).to.eql(expectedOptions);

		const panel2 = wrapper.find("div[data-id='properties-field2_panel']");
		expect(panel2.find("span.cds--list-box__label").text()).to.equal("BP");
		const expectedOptions2 = [
			{ label: "...", value: "" },
			{ label: "BP", value: "BP" },
			{ label: "Na", value: "Na" },
			{ label: "drug", value: "drug" }
		];
		const actualOptions2 = panel2.find("Dropdown").prop("items");
		expect(actualOptions2).to.eql(expectedOptions2);
	});

	it("should show correct values from selectcolumn and selectcolumns controls", () => {
		let panel1 = wrapper.find("div[data-id='properties-selectcolumn']");
		expect(panel1.find("span.cds--list-box__label").text()).to.equal("...");
		const expectedOptions = [
			{ label: "...", value: "" },
			{ label: "age", value: "age" },
			{ label: "BP", value: "BP" },
			{ label: "Na", value: "Na" },
			{ label: "drug", value: "drug" }
		];
		const actualOptions = panel1.find("Dropdown").prop("items");
		expect(actualOptions).to.eql(expectedOptions);
		// open the dropdown
		const dropdownButton = panel1.find("button");
		dropdownButton.simulate("click");
		panel1 = wrapper.find("div[data-id='properties-selectcolumn']");
		const dropdownList = panel1.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(5);
		// select age
		dropdownList.at(1).simulate("click");
		panel1 = wrapper.find("div[data-id='properties-selectcolumn']");
		const fieldPicker = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-ctrl-selectcolumns");
		tableUtils.fieldPicker(fieldPicker, ["BP"], ["BP", "Na", "drug"]);
		const panel2 = wrapper.find("div[data-id='properties-selectcolumns']");
		const rows = tableUtils.getTableRows(panel2);
		expect(rows).to.have.length(1);
	});
});

describe("selectcolumn and selectcolumns controls work in columnSelection panel with multi schema input", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(columnSelectionPanel);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show correct values from selectcolumn controls with multi schema input", () => {
		let panel1 = wrapper.find("div[data-id='properties-field1_panel']");
		expect(panel1.find("span.cds--list-box__label").text()).to.equal("0.Age");

		let expectedSelectColumn1Options = [
			{ label: "...", value: "" },
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
		let actualOptions = panel1.find("Dropdown").prop("items");
		expect(actualOptions).to.eql(expectedSelectColumn1Options);

		let panel2 = wrapper.find("div[data-id='properties-field2_panel']");
		expect(panel2.find("span.cds--list-box__label").text()).to.equal("0.BP");

		let expectedSelectColumn2Options = [
			{ label: "...", value: "" },
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
		let actualOptions2 = panel2.find("Dropdown").prop("items");
		expect(actualOptions2).to.eql(expectedSelectColumn2Options);
		// open the dropdown
		const dropdownButton = panel1.find("button");
		dropdownButton.simulate("click");
		panel1 = wrapper.find("div[data-id='properties-field1_panel']");
		const dropdownList = panel1.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(13);
		// select data.drug2
		dropdownList.at(8).simulate("click");
		expectedSelectColumn1Options = [
			{ label: "...", value: "" },
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
		panel1 = wrapper.find("div[data-id='properties-field1_panel']");
		actualOptions = panel1.find("Dropdown").prop("items");
		expect(actualOptions).to.eql(expectedSelectColumn1Options);

		expectedSelectColumn2Options = [
			{ label: "...", value: "" },
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
		panel2 = wrapper.find("div[data-id='properties-field2_panel']");
		actualOptions2 = panel2.find("Dropdown").prop("items");
		expect(actualOptions2).to.eql(expectedSelectColumn2Options);
	});

	it("should show correct values from selectcolumn and selectcolumns controls with multi schema input", () => {
		let panel1 = wrapper.find("div[data-id='properties-selectcolumn']");
		expect(panel1.find("span.cds--list-box__label").text()).to.equal("...");

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
		let actualOptions = panel1.find("Dropdown").prop("items");
		expect(actualOptions.length).to.equal(fieldTable.length + 1); // +1 for "..."

		const fieldPicker = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-ctrl-selectcolumns");
		tableUtils.fieldPicker(fieldPicker, ["0.drug2", "2.drug2"], fieldTable);

		// open the dropdown
		const dropdownButton = panel1.find("button");
		dropdownButton.simulate("click");
		panel1 = wrapper.find("div[data-id='properties-selectcolumn']");
		const dropdownList = panel1.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(12);
		// select data.Age
		dropdownList.at(5).simulate("click");
		panel1 = wrapper.find("div[data-id='properties-selectcolumn']");
		actualOptions = panel1.find("Dropdown").prop("items");
		expect(actualOptions.length).to.equal(fieldTable.length - 1);

		const expectedOptions = [
			{ label: "...", value: "" },
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
		expect(actualOptions).to.have.deep.members(expectedOptions);
	});

	it("should show correct values from selectcolumns controls with multi schema input", () => {
		const selectColumnsTable2 = wrapper.find("div[data-id='properties-ft-selectcolumns2']");
		expect(selectColumnsTable2).to.have.length(1);
		// selectColumnsTable3 is an empty table. It shows empty table text and Add columns button
		const selectColumnsTable3 = wrapper.find("div[data-id='properties-ctrl-selectcolumns3']");
		expect(selectColumnsTable3).to.have.length(1);

		const table2Rows = tableUtils.getTableRows(selectColumnsTable2);
		expect(table2Rows).to.have.length(3);

		const table2Initial = ["0.Age", "0.Drug", "2.Age"];
		for (let idx = 0; idx < table2Rows.length; idx++) {
			expect(table2Rows.at(idx).find(".properties-field-type")
				.text()).to.equal(table2Initial[idx]);
		}

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
		const fieldPicker = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-ctrl-selectcolumns3");
		tableUtils.fieldPicker(fieldPicker, selectcolumns3, fieldTable);
		expect(controller.getPropertyValue({ name: "selectcolumns3" })).to.have.deep.members(selectcolumns3A);

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
		expect(controller.getFilteredDatasetMetadata({ name: "selectcolumns2" })).to.have.deep.members(fieldTable2Input);
	});

	it("should handle improply defined string fields as strings", () => {
		const panel1 = wrapper.find("div[data-id='properties-BADVAR1']");
		expect(panel1.find("span.cds--list-box__label").text()).to.equal("0.Age");
	});
});

describe("column selection panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("controls in column selection panel should be disabled", () => {
		// by default it is enabled
		const checkboxWrapper = wrapper.find("div[data-id='properties-disableColumnSelectionPanel']");
		const disabledCheckbox = checkboxWrapper.find("input");
		expect(disabledCheckbox.getDOMNode().checked).to.equal(false);
		expect(controller.getPanelState({ name: "selectcolumn-values" })).to.equal("enabled");
		expect(controller.getControlState({ name: "field1_panel" })).to.equal("enabled");
		expect(controller.getControlState({ name: "field2_panel" })).to.equal("enabled");

		// disable the controls
		disabledCheckbox.getDOMNode().checked = true;
		disabledCheckbox.simulate("change");
		expect(controller.getPanelState({ name: "selectcolumn-values" })).to.equal("disabled");
		expect(controller.getControlState({ name: "field1_panel" })).to.equal("disabled");
		expect(controller.getControlState({ name: "field2_panel" })).to.equal("disabled");

		// check that the controls are disabled.
		const panel = wrapper.find("div[data-id='properties-disable-selectcolumn-values']");
		const disabledPanel = panel.find("div.properties-control-panel").at(1);
		const disabledItems = disabledPanel.find("div.properties-control-item");
		expect(disabledItems).to.have.length(2);
		expect(disabledItems.at(0).prop("disabled")).to.be.true;
		expect(disabledItems.at(1).prop("disabled")).to.be.true;
	});

	it("controls in column selection panel should be hidden", () => {
		const checkboxWrapper = wrapper.find("div[data-id='properties-hideColumnSelectionPanel']");
		const hiddenCheckbox = checkboxWrapper.find("input");
		expect(hiddenCheckbox.getDOMNode().checked).to.equal(false);

		expect(controller.getPanelState({ name: "column-selection-panel" })).to.equal("visible");

		// hide the controls
		hiddenCheckbox.getDOMNode().checked = true;
		hiddenCheckbox.simulate("change");
		expect(controller.getPanelState({ name: "column-selection-panel" })).to.equal("hidden");
		expect(controller.getControlState({ name: "selectcolumn" })).to.equal("hidden");
		expect(controller.getControlState({ name: "selectcolumns" })).to.equal("hidden");

		// check that the controls are hidden.
		const panel = wrapper.find("div[data-id='properties-hide-column-selection-panel']");
		const hiddenPanel = panel.find("div.properties-control-panel").at(1);
		const hiddenItems = hiddenPanel.find("div.properties-control-item");
		expect(hiddenItems).to.have.length(0);
	});
});

describe("column selection panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("column selection panel should have custom classname defined", () => {
		const columnSelectionWrapper = wrapper.find("div[data-id='properties-column-selections']");
		expect(columnSelectionWrapper.find(".selectcolumn-values-group-columnselection-class")).to.have.length(1);
		expect(columnSelectionWrapper.find(".column-selection-panel-group-columnselection-class")).to.have.length(1);
	});

	it("column selection panel in a structuretable should have custom classname defined", () => {
		propertyUtils.openSummaryPanel(wrapper, "structuretable-summary-panel1");
		expect(wrapper.find(".column-selection-panel-group-columnselection-class")).to.have.length(1);
	});
});
