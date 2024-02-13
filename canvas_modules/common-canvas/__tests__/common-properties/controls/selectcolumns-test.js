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
import SelectColumns from "../../../src/common-properties/controls/selectcolumns";
import { mountWithIntl, shallowWithIntl } from "../../_utils_/intl-utils";
import { Provider } from "react-redux";
import { expect } from "chai";
import sinon from "sinon";
import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";
import Controller from "../../../src/common-properties/properties-controller";

import selectcolumnsParamDef from "../../test_resources/paramDefs/selectcolumns_paramDef.json";
import selectcolumnsMultiInputParamDef from "../../test_resources/paramDefs/selectcolumns_multiInput_paramDef.json";
import rowDisplayParamDef from "../../test_resources/paramDefs/displayRows_paramDef.json";

const controller = new Controller();

const control = {
	"name": "test-columnSelect",
	"label": {
		"text": "Input List Shared with Below Control"
	},
	"description": {
		"text": "Shared input list with below control",
		"placement": "on_panel"
	},
	"controlType": "selectcolumns",
	"role": "column",
	"valueDef": {
		"propType": "string",
		"isList": true,
		"isMap": false,
		"defaultValue": []
	}
};

const moveableRowControl = {
	"name": "test-moveableRows-columnSelect",
	"label": {
		"text": "Input List Shared with Below Control"
	},
	"description": {
		"text": "Shared input list with below control",
		"placement": "on_panel"
	},
	"controlType": "selectcolumns",
	"valueDef": {
		"propType": "string",
		"isList": true,
		"isMap": false,
		"defaultValue": []
	},
	"moveableRows": true
};

propertyUtils.setControls(controller, [control, moveableRowControl]);
const propertyId = { name: "test-columnSelect" };

function setPropertyValue() {
	controller.setPropertyValues(
		{ "test-columnSelect": ["Age", "BP", "K"] }
	);
}

const openFieldPickerSpy = sinon.spy();

describe("selectcolumns renders correctly", () => {
	setPropertyValue();
	it("props should have been defined", () => {
		const wrapper = shallowWithIntl(
			<SelectColumns
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPickerSpy}
			/>
		);
		expect(wrapper.dive().prop("control")).to.equal(control);
		expect(wrapper.dive().prop("controller")).to.equal(controller);
		expect(wrapper.dive().prop("propertyId")).to.equal(propertyId);
		expect(wrapper.dive().prop("openFieldPicker")).to.equal(openFieldPickerSpy);
	});

	it("should render a `selectcolumns` control", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SelectColumns
					control={control}
					controller={controller}
					propertyId={propertyId}
					openFieldPicker={openFieldPickerSpy}
				/>
			</Provider>
		);
		expect(wrapper.find("button.properties-add-fields-button")).to.have.length(1);
		expect(wrapper.find("button.properties-remove-fields-button")).to.have.length(1);
		expect(tableUtils.getTableRows(wrapper)).to.have.length(3);
	});

	it("should select add columns button and openFieldPicker should be invoked", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SelectColumns
					control={control}
					controller={controller}
					propertyId={propertyId}
					openFieldPicker={openFieldPickerSpy}
				/>
			</Provider>
		);

		// select the add column button
		const addColumnButton = wrapper.find("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");

		// validate the openFieldPicker is invoked
		expect(openFieldPickerSpy).to.have.property("callCount", 1);
	});

	it("should select row and remove button row should be removed", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SelectColumns
					control={control}
					controller={controller}
					propertyId={propertyId}
					openFieldPicker={openFieldPickerSpy}
					rightFlyout
				/>
			</Provider>
		);
		// select the second row in the table
		const tableData = tableUtils.getTableRows(wrapper);
		expect(tableData).to.have.length(3);
		tableUtils.selectCheckboxes(wrapper, [1]);
		// ensure removed button is enabled and select it
		const enabledRemoveColumnButton = wrapper.find("button.properties-remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		expect(enabledRemoveColumnButton.prop("disabled")).to.equal(false);
		enabledRemoveColumnButton.simulate("click");
		// validate the second row is deleted
		expect(controller.getPropertyValue(propertyId)).to.have.same.members(["Age", "K"]);
	});
	it("selectColumns renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad selectColumns value"
		});
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SelectColumns
					control={control}
					controller={controller}
					propertyId={propertyId}
					openFieldPicker={openFieldPickerSpy}
					rightFlyout
				/>
			</Provider>
		);
		const selectColumnsWrapper = wrapper.find("div[data-id='properties-test-columnSelect']");
		const messageWrapper = selectColumnsWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});

	it("selectColumns control should have aria-label", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SelectColumns
					control={control}
					controller={controller}
					propertyId={propertyId}
					openFieldPicker={openFieldPickerSpy}
					rightFlyout
				/>
			</Provider>
		);
		const selectColumnsTable = wrapper.find(".properties-vt-autosizer").find(".ReactVirtualized__Table");
		expect(selectColumnsTable.props()).to.have.property("aria-label", control.label.text);
	});

	it("should render empty table content when selectcolumns is empty", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsParamDef);
		const wrapper = renderedObject.wrapper;

		const emptyFields = wrapper.find("div[data-id='properties-ctrl-fields_empty']");
		// Verify empty table content is rendered
		expect(emptyFields.find("div.properties-empty-table")).to.have.length(1);
		expect(emptyFields.find("div.properties-empty-table span")
			.text()).to.be.equal("To begin, click \"Add columns\"");
		expect(emptyFields.find("button.properties-empty-table-button")).to.have.length(1);
		expect(emptyFields.find("button.properties-empty-table-button").text()).to.be.equal("Add columns");
	});
});


describe("selectcolumns control filters values correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should filter type value from selectcolumn control", () => {
		const fieldPicker = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-ctrl-fields_filter_type");
		tableUtils.fieldPicker(fieldPicker, ["age"], ["age", "age2", "age3", "age4"]);
	});
	it("should filter role values from selectcolumn control", () => {
		const fieldPicker = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-fields_filter_roles");
		tableUtils.fieldPicker(fieldPicker, [], ["age", "drug", "age2", "drug2", "age3", "drug3", "age4", "drug4"]);
	});

});

describe("selectcolumns with multi input schemas renders correctly", () => {
	let wrapper;

	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsMultiInputParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should prefix the correct schema for fields selected", () => {
		// open the summary panel
		// let summaryPanelWrapper = wrapper.find("div[data-id='properties-selectcolumns-values2']");
		// summaryPanelWrapper.find("button").simulate("click");
		const wideflyout = propertyUtils.openSummaryPanel(wrapper, "selectcolumns-values2");
		// open the select columns field picker
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-fields");

		tableUtils.fieldPicker(fieldPicker, [], [
			{ "name": "age", "schema": "Schema-1" },
			{ "name": "AGE", "schema": "Schema-1" },
			{ "name": "BP", "schema": "Schema-1" },
			{ "name": "Na", "schema": "Schema-1" },
			{ "name": "drug", "schema": "Schema-1" },
			{ "name": "age2", "schema": "Schema-1" },
			{ "name": "BP2", "schema": "Schema-1" },
			{ "name": "Na2", "schema": "Schema-1" },
			{ "name": "drug2", "schema": "Schema-1" },
			{ "name": "age3", "schema": "Schema-1" },
			{ "name": "BP3", "schema": "Schema-1" },
			{ "name": "Na3", "schema": "Schema-1" },
			{ "name": "drug3", "schema": "Schema-1" },
			{ "name": "age", "schema": "Schema-2" },
			{ "name": "AGE", "schema": "Schema-2" },
			{ "name": "BP", "schema": "Schema-2" },
			{ "name": "Na", "schema": "Schema-2" },
			{ "name": "drug", "schema": "Schema-2" },
			{ "name": "intAndRange", "schema": "Schema-2" },
			{ "name": "stringAndDiscrete", "schema": "Schema-2" },
			{ "name": "stringAndSet", "schema": "Schema-2" }
		]);

		wideflyout.find("button.properties-apply-button")
			.at(0)
			.simulate("click");
		const panel = wrapper.find("div[data-id='properties-selectcolumns-values2']");
		expect(panel.find("tr.properties-summary-row")).to.have.length(2);
		expect(panel.find("tr.properties-summary-row").at(0)
			.find("span")
			.at(0)
			.text()).to.equal("Schema-2.age");
		expect(panel.find("tr.properties-summary-row").at(1)
			.find("span")
			.at(0)
			.text()).to.equal("Schema-2.AGE");
	});

	it("should filter by type in selectcolumns control", () => {
		// open the "filter by type" select columns field picker
		const fieldPicker = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-ctrl-fields_filter_type");
		const fieldTable = [
			{ "name": "age", "schema": "Schema-1" },
			{ "name": "AGE", "schema": "Schema-1" },
			{ "name": "age2", "schema": "Schema-1" },
			{ "name": "age3", "schema": "Schema-1" },
			{ "name": "age", "schema": "Schema-2" },
			{ "name": "AGE", "schema": "Schema-2" },
			{ "name": "intAndRange", "schema": "Schema-2" }
		];
		tableUtils.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by types in selectcolumns control", () => {
		// open the "filter by types" select columns field picker
		const fieldPicker = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-ctrl-fields_filter_types");
		const fieldTable = [
			{ "name": "age", "schema": "Schema-1" },
			{ "name": "AGE", "schema": "Schema-1" },
			{ "name": "Na", "schema": "Schema-1" },
			{ "name": "age2", "schema": "Schema-1" },
			{ "name": "Na2", "schema": "Schema-1" },
			{ "name": "age3", "schema": "Schema-1" },
			{ "name": "Na3", "schema": "Schema-1" },
			{ "name": "age", "schema": "Schema-2" },
			{ "name": "AGE", "schema": "Schema-2" },
			{ "name": "Na", "schema": "Schema-2" },
			{ "name": "intAndRange", "schema": "Schema-2" }
		];
		tableUtils.fieldPicker(fieldPicker, [], fieldTable);
	});


	it("should filter by measurement in selectcolumns control", () => {
		// open the "filter by measurement" select columns field picker
		const fieldPicker = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-ctrl-fields_filter_measurement");
		const fieldTable = [
			{ "name": "BP", "schema": "Schema-1" },
			{ "name": "BP2", "schema": "Schema-1" },
			{ "name": "BP3", "schema": "Schema-1" },
			{ "name": "BP", "schema": "Schema-2" },
			{ "name": "stringAndDiscrete", "schema": "Schema-2" }
		];
		tableUtils.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by measurements in selectcolumns control", () => {
		const fieldPicker = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-ctrl-fields_filter_measurements");
		const fieldTable = [
			{ "name": "BP", "schema": "Schema-1" },
			{ "name": "drug", "schema": "Schema-1" },
			{ "name": "BP2", "schema": "Schema-1" },
			{ "name": "drug2", "schema": "Schema-1" },
			{ "name": "BP3", "schema": "Schema-1" },
			{ "name": "drug3", "schema": "Schema-1" },
			{ "name": "BP", "schema": "Schema-2" },
			{ "name": "drug", "schema": "Schema-2" },
			{ "name": "stringAndDiscrete", "schema": "Schema-2" },
			{ "name": "stringAndSet", "schema": "Schema-2" }
		];
		tableUtils.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by type and measurement in selectcolumns control", () => {
		const fieldPicker = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-ctrl-fields_filter_and");
		const fieldTable = [
			{ "name": "drug", "schema": "Schema-1" },
			{ "name": "drug2", "schema": "Schema-1" },
			{ "name": "drug3", "schema": "Schema-1" },
			{ "name": "drug", "schema": "Schema-2" },
			{ "name": "stringAndSet", "schema": "Schema-2" }
		];
		tableUtils.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by type or measurement in selectcolumns control", () => {
		const fieldPicker = tableUtils.openFieldPickerForEmptyTable(wrapper, "properties-ctrl-fields_filter_or");
		const fieldTable = [
			{ "name": "drug", "schema": "Schema-1" },
			{ "name": "drug2", "schema": "Schema-1" },
			{ "name": "drug3", "schema": "Schema-1" },
			{ "name": "drug", "schema": "Schema-2" },
			{ "name": "stringAndSet", "schema": "Schema-2" },
			{ "name": "age", "schema": "Schema-1" },
			{ "name": "AGE", "schema": "Schema-1" },
			{ "name": "age2", "schema": "Schema-1" },
			{ "name": "age3", "schema": "Schema-1" },
			{ "name": "age", "schema": "Schema-2" },
			{ "name": "AGE", "schema": "Schema-2" },
			{ "name": "intAndRange", "schema": "Schema-2" }
		];
		tableUtils.fieldPicker(fieldPicker, [], fieldTable);
	});
});

describe("selectcolumns control displays the proper number of rows", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(rowDisplayParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display 3 rows", () => {
		const columnSelect = wrapper.find("div[data-id='properties-ft-columnSelect']");
		const heightDiv = columnSelect.find("div.properties-ft-container-wrapper");
		const heightStyle = heightDiv.at(0).prop("style");
		expect(heightStyle).to.eql({ "height": 128 }); // includes header
	});

	it("should display 5 rows in select columns in subpanel", () => {
		// open the summary on_panel and add a row to the table
		const summaryPanelWrapper = wrapper.find("div[data-id='properties-structurelist-summary-panel2']");
		summaryPanelWrapper.find("button").simulate("click");
		let tableWrapper = wrapper.find("div[data-id='properties-structurelist2']");
		const emptyTableButton = tableWrapper.find("button.properties-empty-table-button"); // add row button for empty table
		emptyTableButton.simulate("click"); // add row button

		// open the subpanel for the added row
		tableWrapper = wrapper.find("div[data-id='properties-structurelist2']");
		const editButton = tableWrapper.find(".properties-subpanel-button").at(0);
		editButton.simulate("click");
		const selectColumnsWrapper = wrapper.find("div[data-id='properties-structurelist2_0_1']");

		const heightDiv = selectColumnsWrapper.find("div.properties-ft-container-wrapper");
		const heightStyle = heightDiv.prop("style");
		expect(heightStyle).to.eql({ "height": 96 }); // includes header
	});

	it("should display 5.5 rows by default in select columns in onpanel", () => {
		// Open 'Configure fields on panel' table add 7 rows to the table
		const summaryPanelWrapper = wrapper.find("div[data-id='properties-structurelist-summary-panel']");
		summaryPanelWrapper.find("button").simulate("click");
		let tableWrapper = wrapper.find("div[data-id='properties-structurelist']");
		const emptyTableButton = tableWrapper.find("button.properties-empty-table-button"); // add row button for empty table
		emptyTableButton.simulate("click"); // add 1st row

		wrapper.update();
		tableWrapper = wrapper.find("div[data-id='properties-structurelist']");
		// add another 6 rows
		const addValueButton = tableWrapper.find(".properties-add-fields-button").at(0);
		addValueButton.simulate("click");
		addValueButton.simulate("click");
		addValueButton.simulate("click");
		addValueButton.simulate("click");
		addValueButton.simulate("click");
		addValueButton.simulate("click");

		wrapper.update();
		tableWrapper = wrapper.find("div[data-id='properties-structurelist']");
		// Verify table has 7 rows
		const tableRows = tableUtils.getTableRows(tableWrapper);
		expect(tableRows).to.have.length(7);

		const heightDiv = tableWrapper.find("div.properties-ft-container-wrapper");
		const heightStyle = heightDiv.prop("style");
		// header height = 2rem, each row height = 2 rem. Total height = 2 + 5.5*(2) = 13rem * 16 = 208px
		// This means only 5.5 rows are visible
		expect(heightStyle).to.eql({ "height": 208 }); // includes header
	});
});

describe("selectcolumns control functions correctly in a table", () => {
	let wrapper;
	let scController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
		scController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should not display invalid fields warnings for selectColumns control in a table", () => {
		// open the summary on_panel and add a row to the table
		const summaryPanelWrapper = wrapper.find("div[data-id='properties-selectcolumns-tables-structurelist-summary']");
		summaryPanelWrapper.find("button").simulate("click");

		// select the add column button
		let tableWrapper = wrapper.find("div[data-id='properties-ctrl-structurelist_sub_panel']");
		expect(tableWrapper.length).to.equal(1);
		const emptyTableButton = tableWrapper.find("button.properties-empty-table-button"); // add row button for empty table
		emptyTableButton.simulate("click"); // add row button

		// Need to reassign tableWrapper after adding row.
		tableWrapper = wrapper.find("div[data-id='properties-ft-structurelist_sub_panel']");
		const editButton = tableWrapper.find(".properties-subpanel-button").at(0);
		editButton.simulate("click"); // open the subpanel for the added row

		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-fields2");
		tableUtils.fieldPicker(fieldPicker, ["Na"]);

		// There should be no error messages
		expect(scController.getErrorMessage({ name: "structurelist_sub_panel" })).to.eql(null);
	});

	it("should select rows correctly in subpanel", () => {
		// open the summary on_panel and add a row to the table
		const summaryPanelWrapper = wrapper.find("div[data-id='properties-selectcolumns-tables-structurelist-summary']");
		summaryPanelWrapper.find("button").simulate("click");

		// select the add column button
		let tableWrapper = wrapper.find("div[data-id='properties-ctrl-structurelist_sub_panel']");
		expect(tableWrapper.length).to.equal(1);
		const emptyTableButton = tableWrapper.find("button.properties-empty-table-button"); // add row button for empty table
		emptyTableButton.simulate("click"); // add row button

		// Need to reassign tableWrapper after adding row.
		tableWrapper = wrapper.find("div[data-id='properties-ft-structurelist_sub_panel']");
		const editButton = tableWrapper.find(".properties-subpanel-button").at(0);
		editButton.simulate("click"); // open the subpanel for the added row

		let fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-fields2");
		tableUtils.fieldPicker(fieldPicker, ["age", "Na"]);

		let selectColumnsTable = wrapper.find("div.properties-column-select-table");
		expect(selectColumnsTable.find("div.properties-vt-row-selected").length).to.equal(2);

		fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-fields2");
		tableUtils.fieldPicker(fieldPicker, ["age", "Na", "drug"]);

		selectColumnsTable = wrapper.find("div.properties-column-select-table");
		expect(selectColumnsTable.find("div.properties-vt-row-selected").length).to.equal(1); // make sure only 1 checkbox is checked now

	});

});

describe("measurement & type icons should be rendered correctly in selectcolumns", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("measurement icons should render in selectcolumns control if dm_image is measurement", () => {
		const tableWrapper = wrapper.find("div[data-id='properties-ft-fields1_panel']");
		expect(tableWrapper.find("div.properties-field-type-icon")).to.have.length(1);
	});

	it("measurement icons should render in fieldpicker of selectcolumns control where dm_image is set to measure", () => {
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-fields1_panel");
		expect(fieldPicker.find("div.properties-fp-field-type-icon").length).to.be.gt(1);// just check that at least 1 row has icon set
	});

	it("type icons should render in selectcolumns control if dm_image is type", () => {
		const tableWrapper = wrapper.find("div[data-id='properties-fields_default_0']");
		expect(tableWrapper.find("div.properties-field-type-icon")).to.have.length(1);
	});
});

describe("All checkboxes in selectcolumns must have labels", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("checkbox in header should have label", () => {
		const fields1Panel = wrapper.find("div[data-id='properties-ctrl-fields1_panel']");
		const tableHeaderRows = tableUtils.getTableHeaderRows(fields1Panel);
		const headerCheckboxLabel = tableHeaderRows.find(".properties-vt-header-checkbox").text();
		const secondColumnLabel = tableHeaderRows
			.find("div[role='columnheader']")
			.at(0)
			.text();
		expect(headerCheckboxLabel).to.equal(`Select all ${secondColumnLabel}`);
	});

	it("checkbox in row should have label", () => {
		const fields1Panel = wrapper.find("div[data-id='properties-ctrl-fields1_panel']");
		const tableRows = tableUtils.getTableRows(fields1Panel);
		const rowCheckboxes = tableRows.find(".properties-vt-row-checkbox");
		const readOnlyFields = tableRows.find("ReadonlyControl");
		expect(readOnlyFields).to.have.length(1);
		const tableName = fields1Panel.find(".properties-control-label").text();

		readOnlyFields.forEach((readonlyField, index) => {
			const rowCheckboxLabel = rowCheckboxes.at(index).text();
			expect(rowCheckboxLabel).to.equal(`Select row ${index + 1} from ${tableName}`);
		});
	});
});

describe("selectcolumns control shows warnings on initial load when invalid value is selected", () => {
	let wrapper;
	let scController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
		scController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display invalid fields warnings for selectColumns control", () => {
		// "fields_bad_field" property has 2 columns that aren't part of the schema
		// Verify both fields show warning on initial load
		const expectedErrorMessages = {
			fields_bad_field: {
				"0": {
					type: "warning",
					text: "Invalid Bad Field, field not found in data set.",
					validation_id: "validField_fields_bad_field[0]_399.5244252726766",
					propertyId: { name: "fields_bad_field", row: 0 },
					required: false
				},
				"1": {
					type: "warning",
					text: "Invalid Bad Field, field not found in data set.",
					validation_id: "validField_fields_bad_field[0]_399.5244252726766",
					propertyId: { name: "fields_bad_field", row: 1 },
					required: false
				}
			}
		};
		expect(expectedErrorMessages).to.eql(scController.getErrorMessages());
	});

});
