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
import { renderWithIntl } from "../../_utils_/intl-utils";
import { Provider } from "react-redux";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import sinon from "sinon";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import Controller from "../../../src/common-properties/properties-controller";

import selectcolumnsParamDef from "../../test_resources/paramDefs/selectcolumns_paramDef.json";
import selectcolumnsMultiInputParamDef from "../../test_resources/paramDefs/selectcolumns_multiInput_paramDef.json";
import rowDisplayParamDef from "../../test_resources/paramDefs/displayRows_paramDef.json";
import { fireEvent } from "@testing-library/react";

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

propertyUtilsRTL.setControls(controller, [control, moveableRowControl]);
const propertyId = { name: "test-columnSelect" };

function setPropertyValue() {
	controller.setPropertyValues(
		{ "test-columnSelect": ["Age", "BP", "K"] }
	);
}

const openFieldPickerSpy = sinon.spy();

const mockSelectColumns = jest.fn();
jest.mock("../../../src/common-properties/controls/selectcolumns",
	() => (props) => mockSelectColumns(props)
);

mockSelectColumns.mockImplementation((props) => {
	const SelectColumnsComp = jest.requireActual(
		"../../../src/common-properties/controls/selectcolumns",
	).default;
	return <SelectColumnsComp {...props} />;
});

describe("selectcolumns renders correctly", () => {
	setPropertyValue();
	it("props should have been defined", () => {
		renderWithIntl(
			<Provider store={controller.getStore()}>
				<SelectColumns
					store={controller.getStore()}
					control={control}
					controller={controller}
					propertyId={propertyId}
					openFieldPicker={openFieldPickerSpy}
				/>
			</Provider>
		);
		expectJest(mockSelectColumns).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
			"openFieldPicker": openFieldPickerSpy
		});
	});

	it("should render a `selectcolumns` control", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<SelectColumns
					control={control}
					controller={controller}
					propertyId={propertyId}
					openFieldPicker={openFieldPickerSpy}
				/>
			</Provider>
		);
		const { container } = wrapper;
		expect(container.querySelectorAll("button.properties-add-fields-button")).to.have.length(1);
		expect(tableUtilsRTL.getTableRows(container)).to.have.length(3);
	});

	it("should select add columns button and openFieldPicker should be invoked", () => {
		const wrapper = renderWithIntl(
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
		const addColumnButton = wrapper.container.querySelectorAll("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		fireEvent.click(addColumnButton[0]);

		// validate the openFieldPicker is invoked
		expect(openFieldPickerSpy).to.have.property("callCount", 1);
	});

	it("should select row and remove button row should be removed", () => {
		setPropertyValue();
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// select the second row in the table
		const tableData = tableUtilsRTL.getTableRows(container);
		expect(tableData).to.have.length(3);
		tableUtilsRTL.selectCheckboxes(container, [1]);
		// ensure Table toolbar has delete button and select it
		const tableToolbar = container.querySelector("div.properties-table-toolbar");
		const deleteButton = tableToolbar.querySelectorAll("button.properties-action-delete");
		expect(deleteButton).to.have.length(1);
		fireEvent.click(deleteButton[0]);
		// validate the second row is deleted
		expect(controller.getPropertyValue(propertyId)).to.have.same.members(["Age", "K"]);
	});
	it("selectColumns renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad selectColumns value"
		});
		const wrapper = renderWithIntl(
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
		const selectColumnsWrapper = wrapper.container.querySelector("div[data-id='properties-test-columnSelect']");
		const messageWrapper = selectColumnsWrapper.querySelectorAll("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});

	it("selectColumns control should have aria-label", () => {
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		const selectColumnsTable = container.querySelector(".properties-vt-autosizer").querySelector(".ReactVirtualized__Table");
		expect(selectColumnsTable.getAttribute("aria-label")).to.equal(control.label.text);
	});

	it("should render empty table content when selectcolumns is empty", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectcolumnsParamDef);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;

		const emptyFields = container.querySelector("div[data-id='properties-ctrl-fields_empty']");
		// Verify empty table content is rendered
		expect(emptyFields.querySelectorAll("div.properties-empty-table")).to.have.length(1);
		expect(emptyFields.querySelector("div.properties-empty-table span")
			.textContent).to.be.equal("To begin, click \"Add columns\"");
		expect(emptyFields.querySelectorAll("button.properties-empty-table-button")).to.have.length(1);
		expect(emptyFields.querySelector("button.properties-empty-table-button").textContent).to.be.equal("Add columns");
	});
});


describe("selectcolumns control filters values correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should filter type value from selectcolumn control", () => {
		const { container } = wrapper;
		const fieldPicker = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-ctrl-fields_filter_type");
		tableUtilsRTL.fieldPicker(fieldPicker, ["age"], ["age", "age2", "age3", "age4"]);
	});
	it("should filter role values from selectcolumn control", () => {
		const { container } = wrapper;
		const fieldPicker = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-fields_filter_roles");
		tableUtilsRTL.fieldPicker(fieldPicker, [], ["age", "drug", "age2", "drug2", "age3", "drug3", "age4", "drug4"]);
	});

});

describe("selectcolumns with multi input schemas renders correctly", () => {
	let wrapper;

	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectcolumnsMultiInputParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should prefix the correct schema for fields selected", () => {
		// open the summary panel
		const { container } = wrapper;
		const wideflyout = propertyUtilsRTL.openSummaryPanel(wrapper, "selectcolumns-values2");
		// open the select columns field picker
		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-fields");

		tableUtilsRTL.fieldPicker(fieldPicker, [], [
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

		fireEvent.click(wideflyout.querySelectorAll("button.properties-apply-button")[0]);
		const panel = container.querySelector("div[data-id='properties-selectcolumns-values2']");
		expect(panel.querySelectorAll("tr.properties-summary-row")).to.have.length(2);
		expect(panel.querySelectorAll("tr.properties-summary-row")[0]
			.querySelectorAll("span")[0]
			.textContent).to.equal("Schema-2.age");
		expect(panel.querySelectorAll("tr.properties-summary-row")[1]
			.querySelectorAll("span")[0]
			.textContent).to.equal("Schema-2.AGE");
	});

	it("should filter by type in selectcolumns control", () => {
		// open the "filter by type" select columns field picker
		const { container } = wrapper;
		const fieldPicker = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-ctrl-fields_filter_type");
		const fieldTable = [
			{ "name": "age", "schema": "Schema-1" },
			{ "name": "AGE", "schema": "Schema-1" },
			{ "name": "age2", "schema": "Schema-1" },
			{ "name": "age3", "schema": "Schema-1" },
			{ "name": "age", "schema": "Schema-2" },
			{ "name": "AGE", "schema": "Schema-2" },
			{ "name": "intAndRange", "schema": "Schema-2" }
		];
		tableUtilsRTL.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by types in selectcolumns control", () => {
		// open the "filter by types" select columns field picker
		const { container } = wrapper;
		const fieldPicker = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-ctrl-fields_filter_types");
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
		tableUtilsRTL.fieldPicker(fieldPicker, [], fieldTable);
	});


	it("should filter by measurement in selectcolumns control", () => {
		const { container } = wrapper;
		// open the "filter by measurement" select columns field picker
		const fieldPicker = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-ctrl-fields_filter_measurement");
		const fieldTable = [
			{ "name": "BP", "schema": "Schema-1" },
			{ "name": "BP2", "schema": "Schema-1" },
			{ "name": "BP3", "schema": "Schema-1" },
			{ "name": "BP", "schema": "Schema-2" },
			{ "name": "stringAndDiscrete", "schema": "Schema-2" }
		];
		tableUtilsRTL.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by measurements in selectcolumns control", () => {
		const { container } = wrapper;
		const fieldPicker = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-ctrl-fields_filter_measurements");
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
		tableUtilsRTL.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by type and measurement in selectcolumns control", () => {
		const { container } = wrapper;
		const fieldPicker = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-ctrl-fields_filter_and");
		const fieldTable = [
			{ "name": "drug", "schema": "Schema-1" },
			{ "name": "drug2", "schema": "Schema-1" },
			{ "name": "drug3", "schema": "Schema-1" },
			{ "name": "drug", "schema": "Schema-2" },
			{ "name": "stringAndSet", "schema": "Schema-2" }
		];
		tableUtilsRTL.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by type or measurement in selectcolumns control", () => {
		const { container } = wrapper;
		const fieldPicker = tableUtilsRTL.openFieldPickerForEmptyTable(container, "properties-ctrl-fields_filter_or");
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
		tableUtilsRTL.fieldPicker(fieldPicker, [], fieldTable);
	});
});

describe("selectcolumns control displays the proper number of rows", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(rowDisplayParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display 3 rows", () => {
		const columnSelect = wrapper.container.querySelector("div[data-id='properties-ft-columnSelect']");
		const heightDiv = columnSelect.querySelectorAll("div.properties-ft-container-wrapper");
		const heightStyle = heightDiv[0].style;
		expect(heightStyle.height).to.eql("128px");
	});

	it("should display 5 rows in select columns in subpanel", () => {
		const { container } = wrapper;
		// open the summary on_panel and add a row to the table
		const summaryPanelWrapper = container.querySelector("div[data-id='properties-structurelist-summary-panel2']");
		fireEvent.click(summaryPanelWrapper.querySelector("button"));
		let tableWrapper = container.querySelector("div[data-id='properties-structurelist2']");
		const emptyTableButton = tableWrapper.querySelector("button.properties-empty-table-button"); // add row button for empty table
		fireEvent.click(emptyTableButton); // add row button

		// open the subpanel for the added row
		tableWrapper = container.querySelector("div[data-id='properties-structurelist2']");
		const editButton = tableWrapper.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton);
		const selectColumnsWrapper = container.querySelectorAll("div[data-id='properties-structurelist2_0_1']");

		const heightDiv = selectColumnsWrapper[1].querySelector("div.properties-ft-container-wrapper");
		const heightStyle = heightDiv.style;
		expect(heightStyle.height).to.eql("96px");
	});

	it("should display 5.5 rows by default in select columns in onpanel", () => {
		// Open 'Configure fields on panel' table add 7 rows to the table
		const { container } = wrapper;
		const summaryPanelWrapper = container.querySelector("div[data-id='properties-structurelist-summary-panel']");
		fireEvent.click(summaryPanelWrapper.querySelector("button"));
		let tableWrapper = container.querySelector("div[data-id='properties-structurelist']");
		const emptyTableButton = tableWrapper.querySelector("button.properties-empty-table-button"); // add row button for empty table
		fireEvent.click(emptyTableButton); // add 1st row

		tableWrapper = container.querySelector("div[data-id='properties-structurelist']");
		// add another 6 rows
		const addValueButton = tableWrapper.querySelectorAll(".properties-add-fields-button")[0];
		fireEvent.click(addValueButton);
		fireEvent.click(addValueButton);
		fireEvent.click(addValueButton);
		fireEvent.click(addValueButton);
		fireEvent.click(addValueButton);
		fireEvent.click(addValueButton);

		tableWrapper = container.querySelector("div[data-id='properties-structurelist']");
		// Verify table has 7 rows
		const tableRows = tableUtilsRTL.getTableRows(tableWrapper);
		expect(tableRows).to.have.length(7);

		const heightDiv = tableWrapper.querySelector("div.properties-ft-container-wrapper");
		const heightStyle = heightDiv.style;
		// header height = 2rem, each row height = 2 rem. Total height = 2 + 5.5*(2) = 13rem * 16 = 208px
		// This means only 5.5 rows are visible
		expect(heightStyle.height).to.eql("208px"); // includes header
	});
});

describe("selectcolumns control functions correctly in a table", () => {
	let wrapper;
	let scController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
		scController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should not display invalid fields warnings for selectColumns control in a table", () => {
		// open the summary on_panel and add a row to the table
		const { container } = wrapper;
		const summaryPanelWrapper = container.querySelector("div[data-id='properties-selectcolumns-tables-structurelist-summary']");
		fireEvent.click(summaryPanelWrapper.querySelector("button"));

		// select the add column button
		let tableWrapper = container.querySelectorAll("div[data-id='properties-ctrl-structurelist_sub_panel']");
		expect(tableWrapper.length).to.equal(1);
		const emptyTableButton = tableWrapper[0].querySelector("button.properties-empty-table-button"); // add row button for empty table
		fireEvent.click(emptyTableButton); // add row button

		// Need to reassign tableWrapper after adding row.
		tableWrapper = container.querySelector("div[data-id='properties-ft-structurelist_sub_panel']");
		const editButton = tableWrapper.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton); // open the subpanel for the added row

		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-fields2");
		tableUtilsRTL.fieldPicker(fieldPicker, ["Na"]);

		// There should be no error messages
		expect(scController.getErrorMessage({ name: "structurelist_sub_panel" })).to.eql(null);
	});

	it("should select rows correctly in subpanel", () => {
		const { container } = wrapper;
		// open the summary on_panel and add a row to the table
		const summaryPanelWrapper = container.querySelector("div[data-id='properties-selectcolumns-tables-structurelist-summary']");
		fireEvent.click(summaryPanelWrapper.querySelector("button"));

		// select the add column button
		let tableWrapper = container.querySelectorAll("div[data-id='properties-ctrl-structurelist_sub_panel']");
		expect(tableWrapper.length).to.equal(1);
		const emptyTableButton = tableWrapper[0].querySelector("button.properties-empty-table-button"); // add row button for empty table
		fireEvent.click(emptyTableButton); // add row button

		// Need to reassign tableWrapper after adding row.
		tableWrapper = container.querySelector("div[data-id='properties-ft-structurelist_sub_panel']");
		const editButton = tableWrapper.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton); // open the subpanel for the added row

		let fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-fields2");
		tableUtilsRTL.fieldPicker(fieldPicker, ["age", "Na"]);

		let selectColumnsTable = container.querySelectorAll("div.properties-column-select-table");
		expect(selectColumnsTable[7].querySelectorAll("div.properties-vt-row-selected").length).to.equal(2);

		// Since 2 rows are selected, table toolbar shows up
		// Clear row selection to show "Add columns" button
		const tableToolbar = container.querySelector("div.properties-table-toolbar");
		const cancelButton = tableToolbar.querySelectorAll("button.properties-action-cancel");
		expect(cancelButton).to.have.length(1);
		fireEvent.click(cancelButton[0]);

		fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-fields2");
		tableUtilsRTL.fieldPicker(fieldPicker, ["age", "Na", "drug"]);

		selectColumnsTable = container.querySelectorAll("div.properties-column-select-table");
		expect(selectColumnsTable[7].querySelectorAll("div.properties-vt-row-selected").length).to.equal(1); // make sure only 1 checkbox is checked now

	});

});

describe("measurement & type icons should be rendered correctly in selectcolumns", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("measurement icons should render in selectcolumns control if dm_image is measurement", () => {
		const tableWrapper = wrapper.container.querySelector("div[data-id='properties-ft-fields1_panel']");
		expect(tableWrapper.querySelectorAll("div.properties-field-type-icon")).to.have.length(1);
	});

	it("measurement icons should render in fieldpicker of selectcolumns control where dm_image is set to measure", () => {
		const { container } = wrapper;
		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-fields1_panel");
		expect(fieldPicker.querySelectorAll("div.properties-fp-field-type-icon").length).to.be.gt(1);// just check that at least 1 row has icon set
	});

	it("type icons should render in selectcolumns control if dm_image is type", () => {
		const tableWrapper = wrapper.container.querySelector("div[data-id='properties-fields_default_0']");
		expect(tableWrapper.querySelectorAll("div.properties-field-type-icon")).to.have.length(1);
	});
});

describe("All checkboxes in selectcolumns must have labels", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("checkbox in header should have label", () => {
		const { container } = wrapper;
		const fields1Panel = container.querySelector("div[data-id='properties-ctrl-fields1_panel']");
		const tableHeaderRows = tableUtilsRTL.getTableHeaderRows(fields1Panel);
		const headerCheckboxLabel = tableHeaderRows[0].querySelector(".properties-vt-header-checkbox").textContent;
		const secondColumnLabel = tableHeaderRows[0]
			.querySelectorAll("div[role='columnheader']")[0]
			.textContent;
		expect(headerCheckboxLabel).to.equal(`Select all ${secondColumnLabel}`);
	});

	it("checkbox in row should have label", () => {
		const fields1Panel = wrapper.container.querySelector("div[data-id='properties-ctrl-fields1_panel']");
		const tableRows = tableUtilsRTL.getTableRows(fields1Panel);
		const rowCheckboxes = tableRows[0].querySelectorAll(".properties-vt-row-checkbox");
		const readOnlyFields = tableRows[0].querySelectorAll(".properties-readonly");
		expect(readOnlyFields).to.have.length(1);
		const tableName = fields1Panel.querySelector(".properties-control-label").textContent;
		readOnlyFields.forEach((readonlyField, index) => {
			const rowCheckboxLabel = rowCheckboxes[index].textContent;
			expect(rowCheckboxLabel).to.equal(`Select row ${index + 1} from ${tableName}`);
		});
	});
});

describe("selectcolumns control shows warnings on initial load when invalid value is selected", () => {
	let wrapper;
	let scController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectcolumnsParamDef);
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
