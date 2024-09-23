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
import StructureTableControl from "../../../src/common-properties/controls/structuretable";
import { renderWithIntl } from "../../_utils_/intl-utils";
import { Provider } from "react-redux";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import sinon from "sinon";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import Controller from "../../../src/common-properties/properties-controller";

import structuretableParamDef from "../../test_resources/paramDefs/structuretable_paramDef.json";
import structuretableMultiInputParamDef from "../../test_resources/paramDefs/structuretable_multiInput_paramDef.json";
import filterColumnParamDef from "../../test_resources/paramDefs/Filter_paramDef.json";
import setGlobalsParamDef from "../../test_resources/paramDefs/setGlobals_paramDef.json";
import { fireEvent } from "@testing-library/react";

const controller = new Controller();

const control = {
	"name": "keys",
	"label": {
		"text": "Sort by"
	},
	"controlType": "structuretable",
	"moveableRows": true,
	"addRemoveRows": true,
	"valueDef": {
		"propType": "structure",
		"isList": true,
		"isMap": false
	},
	"subControls": [
		{
			"name": "field",
			"label": {
				"text": "Field"
			},
			"visible": true,
			"width": 28,
			"sortable": true,
			"controlType": "selectcolumn",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false
			},
			"filterable": true
		},
		{
			"name": "sort_order",
			"label": {
				"text": "Order"
			},
			"visible": true,
			"width": 16,
			"controlType": "toggletext",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false
			},
			"values": [
				"Ascending",
				"Descending"
			],
			"valueLabels": [
				"Ascending",
				"Descending"
			],
			"valueIcons": [
				"/images/up-triangle.svg",
				"/images/down-triangle.svg"
			]
		}
	],
	"keyIndex": 0,
	"defaultRow": [
		"Ascending"
	]
};

const readonlyControlDefault = {
	"name": "structuretableSortOrder",
	"label": {
		"text": "Sort by"
	},
	"description": {
		"text": "Use arrows to reorder the sorting priority",
		"placement": "on_panel"
	},
	"controlType": "structuretable",
	"valueDef": {
		"propType": "structure",
		"isList": true,
		"isMap": false
	},
	"subControls": [
		{
			"name": "field",
			"label": {
				"text": "Field"
			},
			"controlType": "selectcolumn",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false,
				"defaultValue": ""
			},
			"role": "column",
			"sortable": true,
			"summary": true,
			"visible": true,
			"width": 28,
		}, {
			"name": "structuretable_sort_order_readonly_int",
			"label": {
				"text": "Index"
			},
			"description": {
				"text": "Auto generated integers starting at 5"
			},
			"controlType": "readonly",
			"valueDef": {
				"propType": "integer",
				"isList": false,
				"isMap": false,
				"defaultValue": "5"
			},
			"summary": true,
			"generatedValues": {
				"operation": "index"
			},
			"visible": true,
			"width": 16,
			"editStyle": "inline",
		}, {
			"name": "structuretable_sort_order",
			"label": {
				"text": "Order"
			},
			"description": {
				"text": "Update sort order"
			},
			"controlType": "toggletext",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false,
				"defaultValue": "Ascending"
			},
			"role": "enum",
			"values": [
				"Ascending", "Descending"
			],
			"valueLabels": [
				"Ascending", "Descending"
			],
			"valueIcons": [
				"/images/up-triangle.svg", "/images/down-triangle.svg"
			],
			"visible": true,
			"width": 16,
			"editStyle": "inline",
		}
	],
	"keyIndex": 0,
	"defaultRow": [
		"", "5", "Ascending"
	],
	"moveableRows": true,
};

const readonlyControlStartValue = {
	"name": "structuretableSortOrderStartValue",
	"label": {
		"text": "Sort by"
	},
	"description": {
		"text": "Use arrows to reorder the sorting priority",
		"placement": "on_panel"
	},
	"controlType": "structuretable",
	"valueDef": {
		"propType": "structure",
		"isList": true,
		"isMap": false
	},
	"subControls": [
		{
			"name": "structuretable_sort_order_readonly_int",
			"label": {
				"text": "From 5"
			},
			"description": {
				"text": "Auto generated integers starting at 5"
			},
			"controlType": "readonly",
			"valueDef": {
				"propType": "integer",
				"isList": false,
				"isMap": false,
				"defaultValue": "5"
			},
			"summary": true,
			"generatedValues": {
				"operation": "index",
				"startValue": 3
			},
			"visible": true,
			"width": 16,
		}, {
			"name": "field",
			"label": {
				"text": "Field"
			},
			"controlType": "selectcolumn",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false,
				"defaultValue": ""
			},
			"role": "column",
			"summary": true,
			"visible": true,
			"width": 28,
			"editStyle": "inline",
		}, {
			"name": "structuretable_sort_order",
			"label": {
				"text": "Order"
			},
			"description": {
				"text": "Update sort order"
			},
			"controlType": "toggletext",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false,
				"defaultValue": "Ascending"
			},
			"role": "enum",
			"values": [
				"Ascending", "Descending"
			],
			"valueLabels": [
				"Ascending", "Descending"
			],
			"valueIcons": [
				"/images/up-triangle.svg", "/images/down-triangle.svg"
			],
			"visible": true,
			"width": 16,
			"editStyle": "inline",
		}
	],
	"keyIndex": 0,
	"defaultRow": [
		"5", "", "Ascending"
	],
	"moveableRows": true,
};
const propValues = {
	structuretableSortOrder: [
		["Cholesterol", 1, "Ascending"],
		["Age", 11, "Descending"],
		["Drug", 111, "Ascending"]
	],
	structuretableSortOrderStartValue: [
		[0, "Cholesterol", "Ascending"],
		[5, "Age", "Descending"],
		[8, "Drug", "Ascending"]
	],
	keys: [
		["Na", "Ascending"],
		["Drug", "Descending"],
		["Sex", "Ascending"],
		["Age", "Descending"],
		["BP", "Ascending"],
		["Cholesterol", "Ascending"]
	]
};

const propertyId = { name: "keys" };
const propertyIdReadonlyControl = { name: "structuretableSortOrder" };
const propertyIdReadonlyControlStartValue = { name: "structuretableSortOrderStartValue" };
const propertyIdMSE = { name: "ST_mse_table" };
const propertyIdMSEII = { name: "ST_mse_table_II" };
const propertyIdNestedStructureObject = { name: "nestedStructureObject" };
const propertyIdNestedStructureObjectArray = { name: "nestedStructureObjectArray" };
const propertyIdNestedStructureArrayArray = { name: "nestedStructureArrayArray" };
const propertyIdNestedStructureArrayObject = { name: "nestedStructureArrayObject" };
const propertyIdNestedStructureMap = { name: "nestedStructureMap" };
const propertyIdNestedStructureeditor = { name: "nestedStructureeditor" };

propertyUtilsRTL.setControls(controller, [control, readonlyControlDefault, readonlyControlStartValue]);

function setPropertyValue() {
	controller.setPropertyValues(getCopy(propValues));
}

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}

function genUIItem() {
	return <div />;
}

const mockStructureTable = jest.fn();
jest.mock("../../../src/common-properties/controls/structuretable",
	() => (props) => mockStructureTable(props)
);

mockStructureTable.mockImplementation((props) => {
	const StructureTableComp = jest.requireActual(
		"../../../src/common-properties/controls/structuretable",
	).default;
	return <StructureTableComp {...props} />;
});

const openFieldPicker = sinon.spy();
setPropertyValue();
describe("structuretable control renders correctly", () => {

	it("props should have been defined", () => {
		renderWithIntl(
			<Provider store={controller.getStore()}>
				<StructureTableControl
					store={controller.getStore()}
					control={control}
					controller={controller}
					propertyId={propertyId}
					buildUIItem={genUIItem}
					rightFlyout
				/>
			</Provider>
		);
		expectJest(mockStructureTable).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
			"buildUIItem": genUIItem,
			"rightFlyout": true
		});
	});

	it("should render a `structuretable` control", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<StructureTableControl
					control={control}
					controller={controller}
					propertyId={propertyId}
					buildUIItem={genUIItem}
					openFieldPicker={openFieldPicker}
					rightFlyout
				/>
			</Provider>
		);
		const { container } = wrapper;
		const tableWrapper = container.querySelectorAll("div[data-id='properties-keys']");
		expect(tableWrapper).to.have.length(1);
		// should have a search bar
		expect(container.querySelectorAll("div.properties-ft-search-container")).to.have.length(1);
		// should have add button
		const buttons = container.querySelectorAll(".properties-at-buttons-container");
		expect(buttons).to.have.length(1);
		expect(buttons[0].querySelectorAll("button.properties-add-fields-button")).to.have.length(1);
		// verify table toolbar doesn't exist
		let tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(0);

		// select the first row in the table
		const tableData = tableUtilsRTL.getTableRows(tableWrapper[0]);
		expect(tableData).to.have.length(6);

		tableUtilsRTL.selectCheckboxes(tableData, [0]);

		// verify table toolbar exists
		tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);

		// table toolbar should have delete and row move buttons
		const deleteButton = tableToolbar[0].querySelectorAll("button.properties-action-delete");
		expect(deleteButton).to.have.length(1);
		const moveTopButton = tableToolbar[0].querySelectorAll("button.table-row-move-top-button");
		const moveUpButton = tableToolbar[0].querySelectorAll("button.table-row-move-up-button");
		const moveDownButton = tableToolbar[0].querySelectorAll("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar[0].querySelectorAll("button.table-row-move-bottom-button");
		expect(moveTopButton).to.have.length(1);
		expect(moveUpButton).to.have.length(1);
		expect(moveDownButton).to.have.length(1);
		expect(moveBottomButton).to.have.length(1);
	});

	it("Should display header labels with tooltip and info icon correctly", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		const wrapper = renderedObject.wrapper;

		const table = propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableReadonlyColumnDefaultIndex-summary-panel");
		const header = tableUtilsRTL.getTableHeaderRows(table);
		expect(header).to.have.length(1);

		const columns = header[0].querySelectorAll(".properties-vt-column");
		expect(columns).to.have.length(7);

		expect(columns[0].querySelectorAll(".tooltip-container")).to.have.length(1);
		expect(columns[1].querySelectorAll(".tooltip-container")).to.have.length(1);
		expect(columns[2].querySelectorAll(".tooltip-container")).to.have.length(2);
		expect(columns[2].querySelectorAll("svg.properties-vt-info-icon")).to.have.length(1);
		expect(columns[3].querySelectorAll(".tooltip-container")).to.have.length(1);
		expect(columns[4].querySelectorAll(".tooltip-container")).to.have.length(2);
		expect(columns[4].querySelectorAll("svg.properties-vt-info-icon")).to.have.length(1);
		expect(columns[5].querySelectorAll(".tooltip-container")).to.have.length(2);
		expect(columns[5].querySelectorAll("svg.properties-vt-info-icon")).to.have.length(1);
	});

	it("should select add columns button and field picker should display", () => {
		setPropertyValue();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<StructureTableControl
					control={control}
					controller={controller}
					propertyId={propertyId}
					buildUIItem={genUIItem}
					openFieldPicker={openFieldPicker}
					rightFlyout
				/>
			</Provider>
		);
		const { container } = wrapper;
		let tableWrapper = container.querySelector("div[data-id='properties-keys']");
		// Clear selected rows from table toolbar
		const tableToolbar = container.querySelector("div.properties-table-toolbar");
		const cancelButton = tableToolbar.querySelector("button.properties-action-cancel");
		fireEvent.click(cancelButton);

		// select the add column button
		tableWrapper = container.querySelector("div[data-id='properties-keys']");
		const addFieldsButtons = tableWrapper.querySelectorAll("button.properties-add-fields-button"); // field picker buttons
		fireEvent.click(addFieldsButtons[0]); // open filter picker

		// validate the field picker table displays
		expect(openFieldPicker).to.have.property("callCount", 1);
	});

	it("should select row and click delete button, row should be removed", () => {
		setPropertyValue();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<StructureTableControl
					control={control}
					controller={controller}
					propertyId={propertyId}
					buildUIItem={genUIItem}
					openFieldPicker={openFieldPicker}
					rightFlyout
				/>
			</Provider>
		);
		const { container } = wrapper;
		// ensure the table toolbar doesn't exist
		const tableWrapper = container.querySelector("div[data-id='properties-keys']");
		let tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(0);

		// select the first row in the table
		const tableData = tableUtilsRTL.getTableRows(tableWrapper);
		expect(tableData).to.have.length(6);

		tableUtilsRTL.selectCheckboxes(tableData, [0]);

		// ensure table toolbar has delete button select it
		tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const deleteButton = tableToolbar[0].querySelectorAll("button.properties-action-delete");
		expect(deleteButton).to.have.length(1);
		fireEvent.click(deleteButton[0]); // remove a row


		// validate the first row is deleted
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Drug");
	});
});

describe("condition renders correctly with structure table control", () => {
	var wrapper;
	var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("should render empty table content", () => {
		const conditionsPropertyId = { name: "structuretableReadonlyColumnStartValue" };
		expect(renderedController.getPropertyValue(conditionsPropertyId)).to.have.length(1);
		renderedController.updatePropertyValue(conditionsPropertyId, []);

		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableReadonlyColumnStartValue-summary-panel");

		const tableWrapper = wrapper.container.querySelector("div[data-id='properties-structuretableReadonlyColumnStartValue']");
		// Verify empty table content is rendered
		expect(tableWrapper.querySelectorAll("div.properties-empty-table")).to.have.length(1);
		expect(tableWrapper.querySelector("div.properties-empty-table span")
			.textContent).to.be.equal("To begin, click \"Add columns\"");
		expect(tableWrapper.querySelectorAll("button.properties-empty-table-button")).to.have.length(1);
		expect(tableWrapper.querySelector("button.properties-empty-table-button").textContent).to.be.equal("Add columns");
	});
	it("should render an table cell error", async() => {
		const { container } = wrapper;
		// set error condition on cell
		const conditionsPropertyId = { name: "structuretableErrors", row: 0, col: 2 };
		renderedController.updatePropertyValue(conditionsPropertyId, "Descending");
		// open the summary panel
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableErrors-summary-panel");
		// validate there are cell errors
		const errorMessage = {
			"id_ref": "structuretableErrors",
			"validation_id": "structuretableErrors",
			"type": "error",
			"text": "order cannot be descending"
		};
		expect(renderedController.getErrorMessages(conditionsPropertyId)[2]).to.eql(errorMessage);
		expect(container.querySelectorAll("div.properties-validation-message")[1].querySelector("span").textContent).to.equal(errorMessage.text);
	});
	it("should hide a table", () => {
		// set the hide flag
		const conditionsPropertyId = { name: "showRenameFieldsTable", };
		renderedController.updatePropertyValue(conditionsPropertyId, false);
		// open the summary panel
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableRenameFields-summary-panel");

		// verify the table is HIDDEN
		const tableControlDiv = wrapper.container.querySelectorAll("div[data-id='properties-ci-structuretableRenameFields']");
		expect(tableControlDiv).to.have.length(0);
		expect(renderedController.getControlState({ name: "structuretableRenameFields" })).to.equal("hidden");
	});
	it("should disable a table", () => {
		// set the disable flag
		const conditionsPropertyId = { name: "enableSortByTable", };
		renderedController.updatePropertyValue(conditionsPropertyId, false);
		// open the summary panel
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableSortOrder-summary-panel");

		// verify the table is disabled
		const tableControlDiv = wrapper.container.querySelector("div[data-id='properties-ci-structuretableSortOrder']");
		expect(tableControlDiv.outerHTML.includes("disabled")).to.be.true;
		expect(renderedController.getControlState({ name: "structuretableSortOrder" })).to.equal("disabled");
	});
	it("should hide a table cell", () => {
		// set the hide flag
		const conditionsPropertyId = { name: "dummy_types", row: 0, col: 1 };
		renderedController.updatePropertyValue(conditionsPropertyId, false);
		// open the summary panel
		propertyUtilsRTL.openSummaryPanel(wrapper, "dummy_types-summary-panel");

		// verify the table is HIDDEN
		const cellControlDiv = wrapper.container.querySelector("div[data-id='properties-dummy_types_0_4']").querySelector(".properties-checkbox");
		expect(cellControlDiv.className.includes("hide")).to.be.true;
		expect(renderedController.getControlState({ name: "dummy_types", row: 0, col: 4 })).to.equal("hidden");
	});
	it("should disable a table cell", () => {
		// set the disable flag
		const conditionsPropertyId = { name: "dummy_types", row: 0, col: 1 };
		renderedController.updatePropertyValue(conditionsPropertyId, false);
		// open the summary panel
		propertyUtilsRTL.openSummaryPanel(wrapper, "dummy_types-summary-panel");

		// verify the table is HIDDEN
		const cellControlDiv = wrapper.container.querySelector("div[data-id='properties-dummy_types_0_5']");
		expect(cellControlDiv.querySelector("input").disabled).to.be.true;
		expect(renderedController.getControlState({ name: "dummy_types", row: 0, col: 5 })).to.equal("disabled");
	});
});

describe("structuretable control with readonly numbered column renders correctly", () => {
	beforeEach(() => {
		setPropertyValue();
	});
	it("should have displayed the correct generatedValues with default index values", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<StructureTableControl
					control={readonlyControlDefault}
					controller={controller}
					propertyId={propertyIdReadonlyControl}
					buildUIItem={genUIItem}
					openFieldPicker={openFieldPicker}
					rightFlyout
				/>
			</Provider>
		);
		const rows = tableUtilsRTL.getTableRows(wrapper.container);
		expect(rows).to.have.length(3);

		const expectedData = "[[\"Cholesterol\",1,\"Ascending\"],[\"Age\",2,\"Descending\"],[\"Drug\",3,\"Ascending\"]]";
		const controllerData = controller.getPropertyValue(propertyIdReadonlyControl);
		expect(JSON.stringify(controllerData)).to.equal(expectedData);
	});

	it("should have displayed the correct generatedValues with startValue", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<StructureTableControl
					control={readonlyControlStartValue}
					controller={controller}
					propertyId={propertyIdReadonlyControlStartValue}
					buildUIItem={genUIItem}
					openFieldPicker={openFieldPicker}
					rightFlyout
				/>
			</Provider>
		);

		const rows = tableUtilsRTL.getTableRows(wrapper.container);
		expect(rows).to.have.length(3);

		const expectedData = "[[3,\"Cholesterol\",\"Ascending\"],[4,\"Age\",\"Descending\"],[5,\"Drug\",\"Ascending\"]]";
		const controllerData = controller.getPropertyValue(propertyIdReadonlyControlStartValue);
		expect(JSON.stringify(controllerData)).to.equal(expectedData);
	});

	it("should have correct index values after sort", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<StructureTableControl
					control={readonlyControlDefault}
					controller={controller}
					propertyId={propertyIdReadonlyControl}
					buildUIItem={genUIItem}
					openFieldPicker={openFieldPicker}
					rightFlyout
				/>
			</Provider>
		);
		const tableHeader = tableUtilsRTL.getTableHeaderRows(wrapper.container);
		const fieldHeaderColumn = tableHeader[0].querySelector("div[aria-label='Field']");
		// click on the column header to trigger the onClick sort
		fireEvent.click(fieldHeaderColumn);
		var tableRows = controller.getPropertyValue(propertyIdReadonlyControl);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[1][0]).to.equal("Cholesterol");
		expect(tableRows[2][0]).to.equal("Drug");
		expect(tableRows[0][1]).to.equal(1);
		expect(tableRows[1][1]).to.equal(2);
		expect(tableRows[2][1]).to.equal(3);

		// click on the column header to trigger the onClick sort
		fireEvent.click(fieldHeaderColumn);
		tableRows = controller.getPropertyValue(propertyIdReadonlyControl);
		expect(tableRows[0][0]).to.equal("Drug");
		expect(tableRows[1][0]).to.equal("Cholesterol");
		expect(tableRows[2][0]).to.equal("Age");
		expect(tableRows[0][1]).to.equal(1);
		expect(tableRows[1][1]).to.equal(2);
		expect(tableRows[2][1]).to.equal(3);
	});

});

describe("structuretable control with multi input schemas renders correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableMultiInputParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should prefix the correct schema for fields selected", () => {
		const { container } = wrapper;
		// open the field picker on the table and select a few new columns
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableReadonlyColumnStartValue-summary-panel");
		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretableReadonlyColumnStartValue");
		tableUtilsRTL.fieldPicker(fieldPicker, ["0.BP", "data.BP", "2.BP"]);
		// save the changes

		fireEvent.click(container.querySelectorAll("button[data-id='properties-apply-button']")[0]);
		// validate the schema name is saved in the summary list.
		const summaryPanel = container.querySelector("div[data-id='properties-structuretableReadonlyColumnStartValue-summary-panel']");
		const summaryRows = summaryPanel.querySelectorAll("td.properties-summary-row-data");
		expect(summaryRows).to.have.length(5);

		const expectedSummary = [
			"0.Age",
			"0.BP",
			"0.Cholesterol",
			"data.BP",
			"2.BP"
		];

		for (let idx = 0; idx < summaryRows.length; idx++) {
			expect(summaryRows[idx]
				.querySelectorAll("span")[0]
				.textContent
				.trim()).to.equal(expectedSummary[idx]);
		}
	});
});

describe("structuretable control displays with no header and no button", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display header", () => {
		// open the summary panel
		const table = propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableReadonlyColumnDefaultIndex-summary-panel");
		const header = tableUtilsRTL.getTableHeaderRows(table);
		expect(header).to.have.length(1);
	});
	it("should use dmDefault property values", () => {
		const { container } = wrapper;
		// Open rename fields Summary Panel in structuretableParamDef
		const table = propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableReadonlyColumnDefaultIndex-summary-panel");
		const buttonContainer = table.querySelector("div.properties-at-buttons-container");
		// Open field picker
		const addColumnsButton = buttonContainer.querySelector("button.properties-add-fields-button");
		fireEvent.click(addColumnsButton);
		const fieldPickerTable = container.querySelector("div.properties-fp-table");
		// Select header checkbox to select all fields in column override
		const tableCheckboxHeader = fieldPickerTable.querySelectorAll("input[type='checkbox']")[0]; // find the table header checkbox
		tableCheckboxHeader.setAttribute("checked", true);
		fireEvent.click(tableCheckboxHeader);
		// Select Ok to close field picker table.
		const okButton = fieldPickerTable.querySelector("button[data-id='properties-apply-button']");
		fireEvent.click(okButton);
		// Newly added fields should have the proper type
		const tableId = { name: "structuretableReadonlyColumnDefaultIndex" };
		const tableValue = renderedController.getPropertyValue(tableId);
		expect(tableValue).to.have.length(8);
		const cell = tableValue[7][4];
		expect(cell).to.equal("integer");
	});
	it("should display no header", () => {
		const table = propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableNoHeader-summary-panel");
		const header = table.querySelectorAll(".reactable-column-header");
		expect(header).to.have.length(0);
	});
	it("should not have add remove buttons for the table", () => {
		const table = propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableNoButtons-summary-panel");
		// no add/remove buttons should be rendered
		expect(table.querySelectorAll(".properties-at-buttons-container")).to.have.length(0);
	});
	it("should have all fields in tables without the add/remove buttons", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableNoButtons-summary-panel");
		// All fields should be present, plus the two bad fields in current_parameters
		const tableId = { name: "structuretableNoButtons" };
		const tableValue = renderedController.getPropertyValue(tableId);
		expect(tableValue).to.have.length(10);
		expect(tableValue[1][0]).to.equal("Kathy");
		expect(tableValue[1][1]).to.equal("Descending");
		expect(tableValue[9][0]).to.equal("Ag");
	});
});

describe("structuretable multiselect edit works", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});
	it("mse table should render", () => {
		const { container } = wrapper;
		// Open mse Summary Panel in structuretableParamDef
		const table = propertyUtilsRTL.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");
		const buttonContainer = table.querySelector("div.properties-at-buttons-container");

		// Open field picker
		const addColumnsButton = buttonContainer.querySelector("button.properties-add-fields-button");
		fireEvent.click(addColumnsButton);
		const fieldPickerTable = container.querySelector("div.properties-fp-table");
		// Select header checkbox to select all fields in column override
		tableUtilsRTL.selectFieldPickerHeaderCheckbox(fieldPickerTable);
		// Select Ok to close field picker table.
		const okButton = fieldPickerTable.querySelector("button[data-id='properties-apply-button']");
		fireEvent.click(okButton);

		// Newly added fields should be selected.
		const selectedRows = container.querySelectorAll(".properties-vt-row-selected");
		expect(selectedRows).to.have.length(5);
	});
	it("mse table should allow multiple selections", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");

		const tableData = tableUtilsRTL.getTableRows(container);
		expect(tableData).to.have.length(4);

		// select the first row in the table
		tableUtilsRTL.selectCheckboxes(container, [0]);

		// verify that the edit button is not present in table toolbar
		const tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		let editButton = container.querySelectorAll("button.properties-action-multi-select-edit");
		expect(editButton).to.have.length(0);

		// multiple select the four rows in the table
		tableUtilsRTL.selectCheckboxes(container, [1, 2, 3]);

		// verify that the edit button is present
		editButton = container.querySelectorAll("button.properties-action-multi-select-edit");
		expect(editButton).to.have.length(1);
	});
	it("mse table should show header even when rows are filtered", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");
		// select the first row in the table
		const tableData = tableUtilsRTL.getTableRows(container);
		expect(tableData).to.have.length(4);

		// verify that the table toolbar is not present
		let tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(0);

		// Select some rows
		const input = container.querySelector("div.properties-ft-search-container").querySelectorAll("input");
		expect(input).to.have.length(1);
		fireEvent.change(input[0], { target: { value: "k" } });

		tableUtilsRTL.selectCheckboxes(container, [0, 1]);

		const selectedRows = renderedController.getSelectedRows(propertyIdMSE);
		expect(selectedRows).to.have.length(2);
		expect(selectedRows[0]).to.equal(2);
		expect(selectedRows[1]).to.equal(3);

		// verify that the table toolbar is present and it has edit button
		tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const editButton = tableToolbar[0].querySelectorAll("button.properties-action-multi-select-edit");
		expect(editButton).to.have.length(1);
	});
});

describe("structuretable multiselect edit works incrementally", () => {
	const HEADER_CHECKBOX_SELECT_ALL = "div[data-role='properties-header-row'] div.properties-vt-header-checkbox input[type='checkbox']";
	const SELECT_ALL_ROWS = "div[data-role='properties-data-row'] div.properties-vt-row-checkbox input[type='checkbox']";
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	// HEADER_CHECKBOX_SELECT_ALL can't be found
	it.skip("structuretable multiselect edit works incrementally", () => {
		const { container } = wrapper;
		// Open mse Summary Panel in structuretableParamDef
		propertyUtilsRTL.openSummaryPanel(wrapper, "ST_mse_table_II-summary-panel");

		// Select the first two rows
		tableUtilsRTL.selectCheckboxes(container, [0, 1]);
		for (const row of [0, 1]) {
			const rowCheckbox = container.querySelectorAll(SELECT_ALL_ROWS)[row];
			expect(rowCheckbox.checked).to.be.true;
		}

		// Click edit button in table toolbar
		let tableToolbar = container.querySelector("div.properties-table-toolbar");
		let editButton = tableToolbar.querySelector("button.properties-action-multi-select-edit");
		fireEvent.click(editButton);

		// A new panel opens which shows editable columns
		let wideFlyoutPanel = container.querySelector(".properties-wf-children");
		let dropdownWrapper = container.querySelector("div[data-id='properties-ctrl-dummy_entry_sport_name']").querySelector(".properties-dropdown");
		let dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		let dropdownList = container.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.have.length(4);
		// Select "Baseball" for Sport
		expect(dropdownList[3].textContent).to.equal("Baseball");
		fireEvent.click(dropdownList[3]);

		// Save wide flyout
		fireEvent.click(container.querySelector(".properties-modal-buttons").querySelectorAll("button.properties-apply-button")[0]);

		// verify selected rows have "Baseball" selected in Sports column
		let rowValues = renderedController.getPropertyValue(propertyIdMSEII);
		for (const row of [0, 1]) {
			expect(rowValues[row][2]).to.equal("Baseball");
		}
		for (const row of [2, 3]) {
			expect(rowValues[row][2]).to.not.equal("Baseball");
		}

		// Select all rows using header shortcut
		fireEvent.click(container.querySelector(HEADER_CHECKBOX_SELECT_ALL));

		const headerCheckbox = container.querySelector(HEADER_CHECKBOX_SELECT_ALL);
		expect(headerCheckbox.checked).to.be.true;
		for (const row of [0, 1, 2, 3]) {
			const rowCheckbox = container.querySelectorAll(SELECT_ALL_ROWS)[row];
			expect(rowCheckbox.checked).to.be.true;
		}

		// Select Football for Sport
		tableToolbar = container.querySelector("div.properties-table-toolbar");
		editButton = tableToolbar.querySelector("button.properties-action-multi-select-edit");
		fireEvent.click(editButton);

		wideFlyoutPanel = container.querySelector(".properties-wf-children");
		dropdownWrapper = wideFlyoutPanel.querySelector("div[data-id='properties-ctrl-dummy_entry_sport_name']").querySelector(".properties-dropdown");
		dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		dropdownList = container.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.have.length(4);
		expect(dropdownList[0].textContent).to.equal("Football");
		fireEvent.click(dropdownList[0]);

		// Save wide flyout
		fireEvent.click(container.querySelector(".properties-modal-buttons").querySelectorAll("button.properties-apply-button")[0]);

		rowValues = renderedController.getPropertyValue(propertyIdMSEII);
		for (const row of [0, 1, 2, 3]) {
			expect(rowValues[row][2]).to.equal("Football");
		}
	});
});

describe("structuretable control displays with checkbox header", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(filterColumnParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display header with checkbox", () => {
		const tableCheckboxHeader = wrapper.container.querySelectorAll("div[data-id='properties-vt-header-exclude'] input"); // find the table header
		expect(tableCheckboxHeader).to.have.length(1);
		expect(tableCheckboxHeader[0].type).to.equal("checkbox");
	});
	it("checkbox header on should select column value for all rows", async() => {
		const colPropertyId = { name: "field_types" };
		// validate the original state
		let columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues).to.have.length(3);
		expect(columnValues[0][2]).to.be.equal(false);
		expect(columnValues[1][2]).to.be.equal(true);
		expect(columnValues[2][2]).to.be.equal(false);

		// set the column header checkbox to true
		tableUtilsRTL.selectHeaderColumnCheckbox(wrapper.container, 2, true);
		columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues[0][2]).to.be.equal(true);
		expect(columnValues[1][2]).to.be.equal(true);
		expect(columnValues[2][2]).to.be.equal(true);
	});
	it("checkbox header off should un-select column value for all rows", () => {
		const colPropertyId = { name: "field_types" };
		// validate the original state
		let columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues).to.have.length(3);
		expect(columnValues[0][2]).to.be.equal(false);
		expect(columnValues[1][2]).to.be.equal(true);
		expect(columnValues[2][2]).to.be.equal(false);
		// set the column header checkbox to false
		tableUtilsRTL.selectHeaderColumnCheckbox(wrapper.container, 2, false);
		// validate all rows checkboxes are false
		columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues[0][2]).to.be.equal(false);
		expect(columnValues[1][2]).to.be.equal(false);
		expect(columnValues[2][2]).to.be.equal(false);
	});
});

describe("structuretable control checkbox header ignores disabled rows", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(setGlobalsParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display header with checkbox", () => {
		const tableCheckboxHeader = wrapper.container.querySelectorAll("div[data-id='properties-vt-header-mean'] input"); // find the table header checkbox
		expect(tableCheckboxHeader).to.have.length(1);
		expect(tableCheckboxHeader[0].type).to.equal("checkbox");
	});
	it("checkbox header on should select column value for all rows", () => {
		const colPropertyId = { name: "globals" };
		// validate the original state
		let columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues).to.have.length(3);
		// check that the initial values for the table (including disabled rows) are correct
		expect(columnValues[0][1]).to.be.equal(false);
		expect(columnValues[1][1]).to.be.equal(false);
		expect(columnValues[2][1]).to.be.equal(false);
		// set the column header checkbox to true
		tableUtilsRTL.selectHeaderColumnCheckbox(wrapper.container, 1, true);
		// validate all rows checkboxes are true
		columnValues = renderedController.getPropertyValue(colPropertyId);
		// the header should not have changed the state of the disabled checkbox
		expect(columnValues[0][1]).to.be.equal(true);
		expect(columnValues[1][1]).to.be.equal(false);
		expect(columnValues[2][1]).to.be.equal(true);
	});
	it("checkbox column header off should un-select column value for all rows", () => {
		const colPropertyId = { name: "globals" };
		// validate the original state
		let columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues).to.have.length(3);
		// check that the initial values for the table (including disabled rows) are correct
		expect(columnValues[0][5]).to.be.equal(true);
		expect(columnValues[1][5]).to.be.equal(false);
		expect(columnValues[2][5]).to.be.equal(true);
		// set the column header checkbox to false-
		const tableCheckboxHeader = wrapper.container.querySelector("div[data-id='properties-vt-header-sdev'] input"); // find the table header checkbox
		tableCheckboxHeader.setAttribute("checked", false);
		fireEvent.click(tableCheckboxHeader);
		// validate that the header has set all checkboxes to false
		columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues[0][5]).to.be.equal(false);
		expect(columnValues[1][5]).to.be.equal(false);
		expect(columnValues[2][5]).to.be.equal(false);
	});
	it("checkbox column header should become checked if all non-disabled columns become checked", () => {
		const { container } = wrapper;
		const colPropertyId = { name: "globals" };
		// validate the original state
		let columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues).to.have.length(3);
		// check that the initial values for the table (including disabled rows) are correct
		expect(columnValues[0][1]).to.be.equal(false);
		expect(columnValues[1][1]).to.be.equal(false);
		expect(columnValues[2][1]).to.be.equal(false);

		const tableCheckboxHeader = tableUtilsRTL.getTableHeaderRows(container)[0]
			.querySelectorAll(".properties-vt-column")[1]
			.querySelector("input");
		expect(tableCheckboxHeader.checked).to.be.equal(false);
		// set the column header checkbox to true
		tableUtilsRTL.selectHeaderColumnCheckbox(container, 1, false);
		const colCheckbox1 = container.querySelector("div[data-id='properties-globals_0_1']").querySelector("input[type='checkbox']");
		colCheckbox1.setAttribute("checked", true);
		fireEvent.click(colCheckbox1);
		const colCheckbox2 = container.querySelector("div[data-id='properties-globals_2_1']").querySelector("input[type='checkbox']");
		colCheckbox2.setAttribute("checked", true);
		fireEvent.click(colCheckbox2);
		// validate all rows checkboxes are true
		columnValues = renderedController.getPropertyValue(colPropertyId);
		// the header should not have changed the state of the disabled checkbox
		expect(columnValues[0][1]).to.be.equal(true);
		expect(columnValues[1][1]).to.be.equal(false);
		expect(columnValues[2][1]).to.be.equal(true);
		// expect the table checkbox header to now be checked
		expect(tableCheckboxHeader.checked).to.be.equal(true);
	});
});

describe("structuretable columns sort correctly", () => {
	let wrapper;
	let tableData;
	let tableRows;
	let tableHeader;
	beforeEach(() => {
		setPropertyValue();
		wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<StructureTableControl
					control={control} // where setting is for what column(s) has sortable attribute
					controller={controller}
					propertyId={propertyId}
					buildUIItem={genUIItem}
					openFieldPicker={openFieldPicker}
					rightFlyout
				/>
			</Provider>
		);

		// check that table starts with right number of values
		const tableWrapper = wrapper.container.querySelector("div[data-id='properties-keys']");
		tableData = tableUtilsRTL.getTableRows(tableWrapper);

		tableHeader = tableUtilsRTL.getTableHeaderRows(tableWrapper);
		tableRows = controller.getPropertyValue(propertyId);
	});

	it("should instantiate structuretable in correct order and state", () => {
		// check that starting table is in original order
		expect(tableData).to.have.length(6);
		expect(tableRows[0][0]).to.equal("Na");
		expect(tableRows[5][0]).to.equal("Cholesterol");
	});
	it("should sort column alphabetically ascending and descending", async() => {
		// click on the column header to trigger the onClick sort
		const sortableCol = tableHeader[0].querySelectorAll("div[role='columnheader']")[0];
		fireEvent.click(sortableCol);
		tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[5][0]).to.equal("Sex");

		fireEvent.click(sortableCol);
		tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Sex");
		expect(tableRows[5][0]).to.equal("Age");

	});
});

describe("structuretable columns resize correctly", () => {
	it("resize button should be available for specified columns", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		const wrapper = renderedObject.wrapper;
		// open the summary panel
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableResizableColumns-summary-panel");
		// Verify table content is rendered
		const tableWrapper = wrapper.container.querySelectorAll("div[data-id='properties-ci-structuretableResizableColumns']");
		expect(tableWrapper).to.have.length(1);

		const headerRow = tableWrapper[0].querySelectorAll("div[data-role='properties-header-row']");
		expect(headerRow).to.have.length(1);
		// Verify 2 columns in header are resizable
		expect(headerRow[0].querySelectorAll(".properties-vt-header-resize")).to.have.length(2);
		// Verify "Name" column can be resized
		const nameColumn = tableWrapper[0].querySelector("div[aria-label='Name']");
		expect(nameColumn.querySelectorAll(".properties-vt-header-resize")).to.have.length(1);
		// Verify "Type" column can be resized
		const typeColumn = tableWrapper[0].querySelector("div[aria-label='Type']");
		expect(typeColumn.querySelectorAll(".properties-vt-header-resize")).to.have.length(1);
	});
});

describe("measurement icons should be rendered correctly in structuretable", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("measurement icons should render for table where dm_image is set to measure ", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableSortableColumns-summary-panel");
		const tableWrapper = wrapper.container.querySelector("div[data-id='properties-ft-structuretableSortableColumns']");
		expect(tableWrapper.querySelectorAll("div.properties-field-type-icon")).to.have.length(2);
	});
	it("measurement icons should render in fieldpicker for table where dm_image is set to measure", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableSortableColumns-summary-panel");
		const fieldPicker = tableUtilsRTL.openFieldPicker(wrapper.container, "properties-ft-structuretableSortableColumns");
		expect(fieldPicker.querySelectorAll("div.properties-fp-field-type-icon")).to.have.length(8);
	});
	it("measurement icons should not render for table where dm_image value is set to invalid value", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableReadonlyColumnStartValue-summary-panel");
		const tableWrapper = wrapper.container.querySelector("div[data-id='properties-ft-structuretableReadonlyColumnStartValue']"); // "dm_image"="invalid"
		expect(tableWrapper.querySelectorAll("div.properties-field-type-icon")).to.have.length(0);
	});
});

describe("structuretable with long text input values should render as readonly", () => {
	let wrapper;
	let table;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		table = propertyUtilsRTL.openSummaryPanel(wrapper, "error_handling_summary");
	});
	afterEach(() => {
		wrapper.unmount();
	});
	it("table should show disabled control and error icon for truncated value", () => {
		expect(table.querySelectorAll(".properties-textinput-readonly")).to.have.length(1);
		const cells = table.querySelectorAll(".properties-table-cell-control");
		expect(cells).to.have.length(3);
		expect(cells[1].querySelectorAll("div.properties-validation-message.inTable")).to.have.length(1);

		const editButton = table.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton);

		const tables = wrapper.container.querySelectorAll("div[data-id='properties-structuretableLongValue']");
		expect(tables).to.have.length(2); // first one is the table cell
		const subpanelTable = tables[1]; // second one is the textarea in subpanel flyout
		expect(subpanelTable.querySelector("textarea").disabled).to.equal(true);

		const validationMsg = subpanelTable.querySelectorAll("div.cds--form-requirement");
		expect(validationMsg).to.have.length(1);
	});
});

describe("structuretable control with nested structure tables", () => {
	let wrapper;
	let renderedController;
	let summaryPanel;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-structuretable-summary-panel");
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render a nested structurelisteditor control that returns nested objects, edit subPanel", () => {
		const { container } = wrapper;
		const table = summaryPanel.querySelector("div[data-id='properties-ci-nestedStructureObject']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureObject, { applyProperties: true });
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureObject;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit for main table
		let editButton = table.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton);

		// subPanel table
		let subPanelTable = container.querySelector("div[data-id='properties-ci-nestedStructure_table']");
		const addValueBtn = subPanelTable.querySelector("button.properties-add-fields-button");
		fireEvent.click(addValueBtn);

		// Verify new row added
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureObject, { applyProperties: true });
		let expected = [
			{
				"field": "Cholesterol",
				"nestedStructure_readonly_int": 5,
				"nestedStructure_sort_order": "Ascending",
				"nestedStructure_table": [
					{
						"nestedStructure_table_readonly_col_index": 1,
						"nestedStructure_table_name": "hi",
						"nestedStructure_table_data_type": "string"
					}, {
						"nestedStructure_table_readonly_col_index": 2,
						"nestedStructure_table_name": null,
						"nestedStructure_table_data_type": ""
					}
				]
			}
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// click on subpanel edit for nested table
		subPanelTable = container.querySelectorAll("div[data-id='properties-ci-nestedStructure_table']");
		expect(subPanelTable).to.have.length(1);
		editButton = subPanelTable[0].querySelectorAll("button.properties-subpanel-button");
		expect(editButton).to.have.length(2);
		fireEvent.click(editButton[1]);

		// Modify value of the nested structure
		const nameInput = container.querySelector("div[data-id='properties-ctrl-nestedStructure_table_name']");
		fireEvent.change(nameInput.querySelector("input"), { target: { value: "new name" } });

		// Verify modified values for second row
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureObject, { applyProperties: true });
		expected = [
			{
				"field": "Cholesterol",
				"nestedStructure_readonly_int": 5,
				"nestedStructure_sort_order": "Ascending",
				"nestedStructure_table": [
					{
						"nestedStructure_table_readonly_col_index": 1,
						"nestedStructure_table_name": "hi",
						"nestedStructure_table_data_type": "string"
					}, {
						"nestedStructure_table_readonly_col_index": 2,
						"nestedStructure_table_name": "new name",
						"nestedStructure_table_data_type": null
					}
				]
			}
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});

	it("should render a nested structurelisteditor control that returns objects of nested arrays, edit onPanel", () => {
		const { container } = wrapper;
		const table = summaryPanel.querySelector("div[data-id='properties-ci-nestedStructureObjectArray']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureObjectArray, { applyProperties: true });
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureObjectArray;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit for main table
		const editButton = table.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton);

		// subPanel table
		let subPanelTable = container.querySelector("div[data-id='properties-ci-nestedStructure_table']");
		const addValueBtn = subPanelTable.querySelector("button.properties-add-fields-button");
		fireEvent.click(addValueBtn);

		// Verify new row added
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureObjectArray, { applyProperties: true });
		let expected = [
			{
				"field": "Cholesterol",
				"nestedStructure_readonly_int": 5,
				"nestedStructure_sort_order": "Ascending",
				"nestedStructure_table": [
					[
						1, "hi", "string"
					],
					[
						2, null, ""
					]
				]
			}
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// select the second row for onPanel editing
		subPanelTable = container.querySelector("div[data-id='properties-ci-nestedStructure_table']");
		tableUtilsRTL.selectCheckboxes(subPanelTable, [1]); // Select second row for onPanel edit

		// verify onPanel edit shows list control
		subPanelTable = container.querySelector("div[data-id='properties-ci-nestedStructure_table']");
		const onPanelList = subPanelTable.querySelectorAll(".properties-onpanel-container");
		expect(onPanelList).to.have.length(1);

		// Modify value of the nested structure
		const nameInput = onPanelList[0].querySelector("div[data-id='properties-ctrl-nestedStructure_table_name']");
		fireEvent.change(nameInput.querySelector("input"), { target: { value: "new name" } });

		// Verify modified values for second row
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureObjectArray, { applyProperties: true });
		expected = [
			{
				"field": "Cholesterol",
				"nestedStructure_readonly_int": 5,
				"nestedStructure_sort_order": "Ascending",
				"nestedStructure_table": [
					[
						1, "hi", "string"
					],
					[
						2, "new name", null
					]
				]
			}
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});

	it("should render a nested structurelisteditor control that returns nested arrays, edit onPanel", () => {
		const { container } = wrapper;
		const table = summaryPanel.querySelector("div[data-id='properties-ci-nestedStructureArrayArray']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureArrayArray, { applyProperties: true });
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureArrayArray;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit for main table
		const editButton = table.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton);

		// subPanel table
		let subPanelTable = container.querySelector("div[data-id='properties-ci-nestedStructure_table']");
		const addValueBtn = subPanelTable.querySelector("button.properties-add-fields-button");
		fireEvent.click(addValueBtn);

		// Verify new row added
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureArrayArray, { applyProperties: true });
		let expected = [
			[
				"Cholesterol",
				5,
				"Ascending",
				[
					[
						1, "hi", "string"
					],
					[
						2, null, ""
					]
				]
			]
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// select the second row for onPanel editing
		subPanelTable = container.querySelector("div[data-id='properties-ci-nestedStructure_table']");
		tableUtilsRTL.selectCheckboxes(subPanelTable, [1]); // Select second row for onPanel edit

		// verify onPanel edit shows list control
		subPanelTable = container.querySelector("div[data-id='properties-ci-nestedStructure_table']");
		const onPanelList = subPanelTable.querySelectorAll(".properties-onpanel-container");
		expect(onPanelList).to.have.length(1);

		// Modify value of the nested structure
		const nameInput = onPanelList[0].querySelector("div[data-id='properties-ctrl-nestedStructure_table_name']");
		fireEvent.change(nameInput.querySelector("input"), { target: { value: "new name" } });

		// Verify modified values for second row
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureArrayArray, { applyProperties: true });
		expected = [
			[
				"Cholesterol",
				5,
				"Ascending",
				[
					[
						1, "hi", "string"
					],
					[
						2, "new name", null
					]
				]
			]
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});

	it("should render a nested structurelisteditor control that returns nested arrays of objects, edit onPanel and subPanel", () => {
		const { container } = wrapper;
		const table = summaryPanel.querySelector("div[data-id='properties-ci-nestedStructureArrayObject']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureArrayObject, { applyProperties: true });
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureArrayObject;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// Add new row to main table
		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-nestedStructureArrayObject");
		tableUtilsRTL.fieldPicker(fieldPicker, ["Na"]);

		// Verify new row added
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureArrayObject, { applyProperties: true });
		let expected = [
			[
				"Cholesterol",
				5,
				"Ascending",
				[
					{
						"nestedStructure_table_readonly_col_index": 1,
						"nestedStructure_table_name": "hi",
						"nestedStructure_table_data_type": "string"
					}
				]
			],
			[
				"Na",
				6,
				"Ascending",
				[]
			]
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// click on subpanel edit for main table
		let editButton = table.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton);

		// subPanel table
		let subPanelTable = container.querySelector("div[data-id='properties-ci-nestedStructure_table']");
		const addValueBtn = subPanelTable.querySelector("button.properties-add-fields-button");
		fireEvent.click(addValueBtn);

		// Verify new row added
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureArrayObject, { applyProperties: true });
		expected = [
			[
				"Cholesterol",
				5,
				"Ascending",
				[
					{
						"nestedStructure_table_readonly_col_index": 1,
						"nestedStructure_table_name": "hi",
						"nestedStructure_table_data_type": "string"
					}, {
						"nestedStructure_table_readonly_col_index": 2,
						"nestedStructure_table_name": null,
						"nestedStructure_table_data_type": ""
					}
				]
			],
			[
				"Na",
				6,
				"Ascending",
				[]
			]
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// select the second row for onPanel editing
		subPanelTable = container.querySelector("div[data-id='properties-ci-nestedStructure_table']");
		tableUtilsRTL.selectCheckboxes(subPanelTable, [1]); // Select second row for onPanel edit

		// verify onPanel edit shows list control
		subPanelTable = container.querySelector("div[data-id='properties-ci-nestedStructure_table']");
		const onPanelList = subPanelTable.querySelectorAll(".properties-onpanel-container");
		expect(onPanelList).to.have.length(1);

		// Modify value of the nested structure
		const nameInput = onPanelList[0].querySelector("div[data-id='properties-ctrl-nestedStructure_table_name']");
		fireEvent.change(nameInput.querySelector("input"), { target: { value: "hello" } });

		subPanelTable = container.querySelector("div[data-id='properties-ci-nestedStructure_table']");
		const editButtons = subPanelTable.querySelectorAll("button.properties-subpanel-button");
		expect(editButtons).to.have.length(2);
		editButton = editButtons[1];
		fireEvent.click(editButton);
		const dropdownButton = container.querySelector("div[data-id='properties-ctrl-nestedStructure_table_data_type'] button");
		fireEvent.click(dropdownButton);
		// select the fourth item
		const dropdownWrapper = container.querySelector("div[data-id='properties-ctrl-nestedStructure_table_data_type']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(5);
		fireEvent.click(dropdownList[3]);

		// Verify modified values for second row
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureArrayObject, { applyProperties: true });
		expected = [
			[
				"Cholesterol",
				5,
				"Ascending",
				[
					{
						"nestedStructure_table_readonly_col_index": 1,
						"nestedStructure_table_name": "hi",
						"nestedStructure_table_data_type": "string"
					}, {
						"nestedStructure_table_readonly_col_index": 2,
						"nestedStructure_table_name": "hello",
						"nestedStructure_table_data_type": "time"
					}
				]
			],
			[
				"Na",
				6,
				"Ascending",
				[]
			]
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});

	it("should render a nested structuretable map control that returns nested arrays, edit subPanel", () => {
		const table = summaryPanel.querySelector("div[data-id='properties-ci-nestedStructureMap']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureMap, { applyProperties: true });
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureMap;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit for main table
		const editButton = table.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton);

		// subPanel table
		const fieldPicker = tableUtilsRTL.openFieldPicker(wrapper.container, "properties-ft-nestedStructureMap_structure");
		tableUtilsRTL.fieldPicker(fieldPicker, ["Na"]);

		// Verify new row added
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureMap, { applyProperties: true });
		const expected = [
			[
				"Cholesterol",
				5,
				"Ascending",
				[
					[
						1, "BP"
					],
					[
						2, "Na"
					]
				]
			]
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});

	// Cannot locate onPanelTable
	it.skip("should render a nested structureeditor control, edit onPanel", () => {
		const { container } = wrapper;
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureeditor);
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureeditor;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// add row to table
		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ci-nestedStructureeditor");
		tableUtilsRTL.fieldPicker(fieldPicker, ["Na"]);

		// Verify new row added
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureeditor);
		let expected = [
			[
				"Cholesterol",
				1,
				[
					"Name", 100, ["some text"]
				]
			],
			[
				"Na", 2, []
			]
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// select the second row for onPanel editing
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-structuretable-summary-panel");
		let table = summaryPanel.querySelector("div[data-id='properties-ci-nestedStructureeditor']");
		const tableRows = table.querySelectorAll("div[data-role='properties-data-row']");
		expect(tableRows).to.have.length(2);
		// const secondRow = tableRows[1];
		tableUtilsRTL.selectCheckboxes(table, [1]); // Select second row for onPanel edit

		// Modify some values of the nested structure
		table = summaryPanel.querySelector("div[data-id='properties-ci-nestedStructureeditor']");
		const onPanelTable = table.querySelector("div[data-id='properties-ci-userHealthTable']");

		const nameInput = onPanelTable.querySelector("div[data-id='properties-ctrl-userName']");
		fireEvent.change(nameInput.querySelector("input"), { target: { value: "new name" } });

		const annotationInput = onPanelTable.querySelector("div[data-id='properties-ctrl-annotation']");
		fireEvent.change(annotationInput.querySelector("textarea"), { target: { value: "some annotation" } });

		// Verify new row modified
		tableData = renderedController.getPropertyValue(propertyIdNestedStructureeditor);
		expected = [
			[
				"Cholesterol",
				1,
				[
					"Name", 100, ["some text"]
				]
			],
			[
				"Na", 2, ["new name", null, ["some annotation"]]
			]
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});

});

describe("structuretable classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("structuretable should have custom classname defined", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableReadonlyColumnStartValue-summary-panel");
		expect(wrapper.container.querySelectorAll(".structuretable-control-class")).to.have.length(1);
	});

	it("structuretable should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "nested-structuretable-summary-panel");
		const parent = wrapper.container.querySelectorAll(".nested-parent-structuretable-control-class");
		expect(parent).to.have.length(1);
		expect(parent[0].querySelectorAll(".nested-child-cell-structuretable-control-class")).to.have.length(1);
		// click on subpanel edit for first row
		const editButton = parent[0].querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton);
		// This class name exists in the parent table cell and in the subpanel as table
		expect(wrapper.container.querySelectorAll(".double-nested-subpanel-structuretable-control-class")).to.have.length(2);
		expect(wrapper.container.querySelectorAll(".double-nested-subpanel-cell-structuretable-control-class")).to.have.length(1);
	});
});
