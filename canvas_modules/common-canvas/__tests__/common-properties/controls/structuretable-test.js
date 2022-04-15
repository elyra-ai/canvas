/*
 * Copyright 2017-2022 Elyra Authors
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
import { mountWithIntl, shallowWithIntl } from "../../_utils_/intl-utils";
import { Provider } from "react-redux";
import { expect } from "chai";
import sinon from "sinon";
import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";
import Controller from "../../../src/common-properties/properties-controller";

import structuretableParamDef from "../../test_resources/paramDefs/structuretable_paramDef.json";
import structuretableMultiInputParamDef from "../../test_resources/paramDefs/structuretable_multiInput_paramDef.json";
import filterColumnParamDef from "../../test_resources/paramDefs/Filter_paramDef.json";
import setGlobalsParamDef from "../../test_resources/paramDefs/setGlobals_paramDef.json";

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
const propertyIdNestedStructureObject = { name: "nestedStructureObject" };
const propertyIdNestedStructureObjectArray = { name: "nestedStructureObjectArray" };
const propertyIdNestedStructureArrayArray = { name: "nestedStructureArrayArray" };
const propertyIdNestedStructureArrayObject = { name: "nestedStructureArrayObject" };
const propertyIdNestedStructureMap = { name: "nestedStructureMap" };
const propertyIdNestedStructureeditor = { name: "nestedStructureeditor" };

propertyUtils.setControls(controller, [control, readonlyControlDefault, readonlyControlStartValue]);

function setPropertyValue() {
	controller.setPropertyValues(getCopy(propValues));
}

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}

function genUIItem() {
	return <div />;
}

const openFieldPicker = sinon.spy();
setPropertyValue();
describe("structuretable control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = shallowWithIntl(
			<StructureTableControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		expect(wrapper.dive().prop("control")).to.equal(control);
		expect(wrapper.dive().prop("controller")).to.equal(controller);
		expect(wrapper.dive().prop("propertyId")).to.equal(propertyId);
		expect(wrapper.dive().prop("buildUIItem")).to.equal(genUIItem);
	});

	it("should render a `structuretable` control", () => {
		const wrapper = mountWithIntl(
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

		expect(wrapper.find("div[data-id='properties-keys']")).to.have.length(1);
		// should have a search bar
		expect(wrapper.find("div.properties-ft-search-container")).to.have.length(1);
		// should have add/remove buttons
		const buttons = wrapper.find(".properties-at-buttons-container");
		expect(buttons).to.have.length(1);
		expect(buttons.find("button.properties-add-fields-button")).to.have.length(1);
		expect(buttons.find("button.properties-remove-fields-button")).to.have.length(1);
		expect(buttons.find("button.properties-remove-fields-button").prop("disabled")).to.equal(true);
		// should have moveable table rows
		const moveableRowsContainer = wrapper.find(".properties-mr-button-container");
		expect(moveableRowsContainer).to.have.length(1);
		expect(moveableRowsContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(4);
	});


	it("should select add columns button and field picker should display", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
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

		// select the add column button
		const tableWrapper = wrapper.find("div[data-id='properties-keys']");
		const addFieldsButtons = tableWrapper.find("button.properties-add-fields-button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker

		// validate the field picker table displays
		expect(openFieldPicker).to.have.property("callCount", 1);
	});

	it("should select row and remove button row should be removed", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
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

		// ensure the remove column button is disabled
		let tableWrapper = wrapper.find("div[data-id='properties-keys']");
		let removeFieldsButtons = tableWrapper.find("button.properties-remove-fields-button"); // field picker buttons
		expect(removeFieldsButtons.prop("disabled")).to.equal(true);

		// select the first row in the table
		const tableData = tableUtils.getTableRows(tableWrapper);
		expect(tableData).to.have.length(6);

		tableUtils.selectCheckboxes(tableData, [0]);

		// ensure removed button is enabled and select it
		tableWrapper = wrapper.find("div[data-id='properties-keys']");
		removeFieldsButtons = tableWrapper.find("button.properties-remove-fields-button"); // field picker buttons
		expect(removeFieldsButtons.prop("disabled")).to.equal(false);
		removeFieldsButtons.at(0).simulate("click"); // remove a row

		// validate the first row is deleted
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Drug");
	});
});

describe("condition renders correctly with structure table control", () => {
	var wrapper;
	var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
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

		wrapper.update();
		propertyUtils.openSummaryPanel(wrapper, "structuretableReadonlyColumnStartValue-summary-panel");

		const tableWrapper = wrapper.find("div[data-id='properties-structuretableReadonlyColumnStartValue']");
		// Verify empty table content is rendered
		expect(tableWrapper.find("div.properties-empty-table")).to.have.length(1);
		expect(tableWrapper.find("div.properties-empty-table span")
			.text()).to.be.equal("To begin, click \"Add columns\"");
		expect(tableWrapper.find("button.properties-empty-table-button")).to.have.length(1);
		expect(tableWrapper.find("button.properties-empty-table-button").text()).to.be.equal("Add columns");
	});
	it("should render an table cell error", () => {
		// set error condition on cell
		const conditionsPropertyId = { name: "structuretableErrors", row: 0, col: 2 };
		renderedController.updatePropertyValue(conditionsPropertyId, "Descending");
		wrapper.update();
		// open the summary panel
		propertyUtils.openSummaryPanel(wrapper, "structuretableErrors-summary-panel");
		// validate there are cell errors
		const errorMessage = {
			"id_ref": "structuretableErrors",
			"validation_id": "structuretableErrors",
			"type": "error",
			"text": "order cannot be descending"
		};
		expect(renderedController.getErrorMessages(conditionsPropertyId)[0]).to.eql(errorMessage);
		const tableWrapper = wrapper.find("div[data-id='properties-ft-structuretableErrors']");
		expect(tableWrapper.find("div.properties-validation-message span").text()).to.equal(errorMessage.text);
	});
	it("should hide a table", () => {
		// set the hide flag
		const conditionsPropertyId = { name: "showRenameFieldsTable", };
		renderedController.updatePropertyValue(conditionsPropertyId, false);
		wrapper.update();
		// open the summary panel
		propertyUtils.openSummaryPanel(wrapper, "structuretableRenameFields-summary-panel");

		// verify the table is HIDDEN
		const tableControlDiv = wrapper.find("div[data-id='properties-ci-structuretableRenameFields']");
		expect(tableControlDiv.hasClass("hide")).to.be.true;
		expect(renderedController.getControlState({ name: "structuretableRenameFields" })).to.equal("hidden");
	});
	it("should disable a table", () => {
		// set the disable flag
		const conditionsPropertyId = { name: "enableSortByTable", };
		renderedController.updatePropertyValue(conditionsPropertyId, false);
		wrapper.update();
		// open the summary panel
		propertyUtils.openSummaryPanel(wrapper, "structuretableSortOrder-summary-panel");

		// verify the table is disabled
		const tableControlDiv = wrapper.find("div[data-id='properties-ci-structuretableSortOrder']");
		expect(tableControlDiv.prop("disabled")).to.be.true;
		expect(renderedController.getControlState({ name: "structuretableSortOrder" })).to.equal("disabled");
	});
	it("should hide a table cell", () => {
		// set the hide flag
		const conditionsPropertyId = { name: "dummy_types", row: 0, col: 1 };
		renderedController.updatePropertyValue(conditionsPropertyId, false);
		wrapper.update();
		// open the summary panel
		propertyUtils.openSummaryPanel(wrapper, "dummy_types-summary-panel");

		// verify the table is HIDDEN
		const cellControlDiv = wrapper.find("div[data-id='properties-dummy_types_0_4']");
		expect(cellControlDiv.hasClass("hide")).to.be.true;
		expect(renderedController.getControlState({ name: "dummy_types", row: 0, col: 4 })).to.equal("hidden");
	});
	it("should disable a table cell", () => {
		// set the disable flag
		const conditionsPropertyId = { name: "dummy_types", row: 0, col: 1 };
		renderedController.updatePropertyValue(conditionsPropertyId, false);
		wrapper.update();
		// open the summary panel
		propertyUtils.openSummaryPanel(wrapper, "dummy_types-summary-panel");

		// verify the table is HIDDEN
		const cellControlDiv = wrapper.find("div[data-id='properties-dummy_types_0_5']");
		expect(cellControlDiv.find("input").prop("disabled")).to.be.true;
		expect(renderedController.getControlState({ name: "dummy_types", row: 0, col: 5 })).to.equal("disabled");
	});
});

describe("structuretable control with readonly numbered column renders correctly", () => {
	beforeEach(() => {
		setPropertyValue();
	});
	it("should have displayed the correct generatedValues with default index values", () => {
		const wrapper = mountWithIntl(
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
		const rows = tableUtils.getTableRows(wrapper);
		expect(rows).to.have.length(3);

		const expectedData = "[[\"Cholesterol\",1,\"Ascending\"],[\"Age\",2,\"Descending\"],[\"Drug\",3,\"Ascending\"]]";
		const controllerData = controller.getPropertyValue(propertyIdReadonlyControl);
		expect(JSON.stringify(controllerData)).to.equal(expectedData);
	});

	it("should have displayed the correct generatedValues with startValue", () => {
		const wrapper = mountWithIntl(
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

		const rows = tableUtils.getTableRows(wrapper);
		expect(rows).to.have.length(3);

		const expectedData = "[[3,\"Cholesterol\",\"Ascending\"],[4,\"Age\",\"Descending\"],[5,\"Drug\",\"Ascending\"]]";
		const controllerData = controller.getPropertyValue(propertyIdReadonlyControlStartValue);
		expect(JSON.stringify(controllerData)).to.equal(expectedData);
	});

	it("should have correct index values after sort", () => {
		const wrapper = mountWithIntl(
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
		const tableHeader = tableUtils.getTableHeaderRows(wrapper);
		const fieldHeaderColumn = tableHeader.find("div[aria-label='Field']");
		// click on the column header to trigger the onClick sort
		fieldHeaderColumn.simulate("click");
		var tableRows = controller.getPropertyValue(propertyIdReadonlyControl);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[1][0]).to.equal("Cholesterol");
		expect(tableRows[2][0]).to.equal("Drug");
		expect(tableRows[0][1]).to.equal(1);
		expect(tableRows[1][1]).to.equal(2);
		expect(tableRows[2][1]).to.equal(3);

		// click on the column header to trigger the onClick sort
		fieldHeaderColumn.simulate("click");
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
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableMultiInputParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should prefix the correct schema for fields selected", () => {
		// open the field picker on the table and select a few new columns
		propertyUtils.openSummaryPanel(wrapper, "structuretableReadonlyColumnStartValue-summary-panel");
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableReadonlyColumnStartValue");
		tableUtils.fieldPicker(fieldPicker, ["0.BP", "data.BP", "2.BP"]);
		// save the changes

		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
		// validate the schema name is saved in the summary list.
		const summaryPanel = wrapper.find("div[data-id='properties-structuretableReadonlyColumnStartValue-summary-panel']");
		const summaryRows = summaryPanel.find("td.properties-summary-row-data");
		expect(summaryRows).to.have.length(5);

		const expectedSummary = [
			"0.Age",
			"0.BP",
			"0.Cholesterol",
			"data.BP",
			"2.BP"
		];

		for (let idx = 0; idx < summaryRows.length; idx++) {
			expect(summaryRows.at(idx)
				.find("span")
				.at(0)
				.text()
				.trim()).to.equal(expectedSummary[idx]);
		}
	});
});

describe("structuretable control displays with no header and no button", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display header", () => {
		// open the summary panel
		const table = propertyUtils.openSummaryPanel(wrapper, "structuretableReadonlyColumnDefaultIndex-summary-panel");
		const header = tableUtils.getTableHeaderRows(table);
		expect(header).to.have.length(1);
	});
	it("should use dmDefault property values", () => {
		// Open rename fields Summary Panel in structuretableParamDef
		const table = propertyUtils.openSummaryPanel(wrapper, "structuretableReadonlyColumnDefaultIndex-summary-panel");
		const container = table.find("div.properties-at-buttons-container");
		// Open field picker
		const addColumnsButton = container.find("button.properties-add-fields-button");
		addColumnsButton.simulate("click");
		const fieldPickerTable = wrapper.find("div.properties-fp-table");
		// Select header checkbox to select all fields in column override
		const tableCheckboxHeader = fieldPickerTable.find("input[type='checkbox']").at(0); // find the table header checkbox
		tableCheckboxHeader.getDOMNode().checked = true;
		tableCheckboxHeader.simulate("change");
		// Select Ok to close field picker table.
		const okButton = fieldPickerTable.find("button[data-id='properties-apply-button']");
		okButton.simulate("click");
		wrapper.render();
		// Newly added fields should have the proper type
		const tableId = { name: "structuretableReadonlyColumnDefaultIndex" };
		const tableValue = renderedController.getPropertyValue(tableId);
		expect(tableValue).to.have.length(8);
		const cell = tableValue[7][4];
		expect(cell).to.equal("integer");
	});
	it("should display no header", () => {
		const table = propertyUtils.openSummaryPanel(wrapper, "structuretableNoHeader-summary-panel");
		const header = table.find(".reactable-column-header");
		expect(header).to.have.length(0);
	});
	it("should not have add remove buttons for the table", () => {
		const table = propertyUtils.openSummaryPanel(wrapper, "structuretableNoButtons-summary-panel");
		// no add/remove buttons should be rendered
		expect(table.find(".properties-at-buttons-container")).to.have.length(0);
	});
	it("should have all fields in tables without the add/remove buttons", () => {
		propertyUtils.openSummaryPanel(wrapper, "structuretableNoButtons-summary-panel");
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
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});
	it("mse table should render", () => {
		// Open mse Summary Panel in structuretableParamDef
		const table = propertyUtils.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");
		const container = table.find("div.properties-at-buttons-container");

		// Open field picker
		const addColumnsButton = container.find("button.properties-add-fields-button");
		addColumnsButton.simulate("click");
		const fieldPickerTable = wrapper.find("div.properties-fp-table");
		// Select header checkbox to select all fields in column override
		tableUtils.selectFieldPickerHeaderCheckbox(fieldPickerTable);
		// Select Ok to close field picker table.
		const okButton = fieldPickerTable.find("button[data-id='properties-apply-button']");
		okButton.simulate("click");
		wrapper.render();

		// Newly added fields should be selected.
		const mseTable = wrapper.find("div[data-id='properties-ST_mse_table-summary-panel']");
		const selectedRows = mseTable.find(".properties-vt-row-selected");
		expect(selectedRows).to.have.length(5);
	});
	it("mse table should allow multiple selections", () => {
		propertyUtils.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");

		const tableData = tableUtils.getTableRows(wrapper);
		expect(tableData).to.have.length(4);

		// select the first row in the table
		tableUtils.selectCheckboxes(wrapper, [0]);

		// verify that the select summary row is not present
		let selectedEditRow = wrapper.find("div.properties-at-selectedEditRows");
		expect(selectedEditRow).to.have.length(0);

		// multiple select the four row in the table
		tableUtils.selectCheckboxes(wrapper, [1, 2, 3]);

		// verify that the select summary row is present
		selectedEditRow = wrapper.find("div.properties-at-selectedEditRows");
		expect(selectedEditRow).to.have.length(1);
	});
	it("mse table should show header even when rows are filtered", () => {
		propertyUtils.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");
		// select the first row in the table
		const tableData = tableUtils.getTableRows(wrapper);
		expect(tableData).to.have.length(4);

		// verify that the select summary row is not present
		let selectedEditRow = wrapper.find("div.properties-at-selectedEditRows").find("tr");
		expect(selectedEditRow).to.have.length(0);

		const input = wrapper.find("div.properties-ft-search-container").find("input");
		expect(input).to.have.length(1);
		input.simulate("change", { target: { value: "k" } });

		tableUtils.selectCheckboxes(wrapper, [0, 1]);

		const selectedRows = renderedController.getSelectedRows(propertyIdMSE);
		expect(selectedRows).to.have.length(2);
		expect(selectedRows[0]).to.equal(2);
		expect(selectedRows[1]).to.equal(3);

		// verify that the select summary row is present
		selectedEditRow = wrapper.find("div.properties-at-selectedEditRows").find(".properties-vt-row-checkbox");
		expect(selectedEditRow).to.have.length(1);

		// verify the select header row is 2rem in height
		const selectHeaderTable = wrapper.find("div.properties-at-selectedEditRows").find("div.properties-ft-container-wrapper");
		const heightStyle = selectHeaderTable.prop("style");
		expect(heightStyle).to.eql({ "height": "2rem" });
	});
});

describe("structuretable control displays with checkbox header", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(filterColumnParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display header with checkbox", () => {
		const tableCheckboxHeader = wrapper.find("input#field_types2"); // find the table header
		expect(tableCheckboxHeader).to.have.length(1);
		expect(tableCheckboxHeader.prop("type")).to.equal("checkbox");
	});
	it("checkbox header on should select column value for all rows", () => {
		const colPropertyId = { name: "field_types" };
		// validate the original state
		let columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues).to.have.length(3);
		expect(columnValues[0][2]).to.be.equal(false);
		expect(columnValues[1][2]).to.be.equal(true);
		expect(columnValues[2][2]).to.be.equal(false);

		// set the column header checkbox to true
		tableUtils.selectHeaderColumnCheckbox(wrapper, 2, true);

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
		tableUtils.selectHeaderColumnCheckbox(wrapper, 2, false);
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
		const renderedObject = propertyUtils.flyoutEditorForm(setGlobalsParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display header with checkbox", () => {
		const tableCheckboxHeader = wrapper.find("input#globals1"); // find the table header
		expect(tableCheckboxHeader).to.have.length(1);
		expect(tableCheckboxHeader.prop("type")).to.equal("checkbox");
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
		tableUtils.selectHeaderColumnCheckbox(wrapper, 1, true);
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
		const tableCheckboxHeader = wrapper.find("input#globals5"); // find the table header checkbox
		tableCheckboxHeader.getDOMNode().checked = false;
		tableCheckboxHeader.simulate("change");
		// validate that the header has set all checkboxes to false
		columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues[0][5]).to.be.equal(false);
		expect(columnValues[1][5]).to.be.equal(false);
		expect(columnValues[2][5]).to.be.equal(false);
	});
	it("checkbox column header should become checked if all non-disabled columns become checked", () => {
		const colPropertyId = { name: "globals" };
		// validate the original state
		let columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues).to.have.length(3);
		// check that the initial values for the table (including disabled rows) are correct
		expect(columnValues[0][1]).to.be.equal(false);
		expect(columnValues[1][1]).to.be.equal(false);
		expect(columnValues[2][1]).to.be.equal(false);

		const tableCheckboxHeader = tableUtils.getTableHeaderRows(wrapper)
			.find(".properties-vt-column")
			.at(1)
			.find("input");
		expect(tableCheckboxHeader.getDOMNode().checked).to.be.equal(false);
		// set the column header checkbox to true
		tableUtils.selectHeaderColumnCheckbox(wrapper, 1, true);
		const colCheckbox1 = wrapper.find("div[data-id='properties-globals_0_1']").find("input[type='checkbox']");
		colCheckbox1.getDOMNode().checked = true;
		colCheckbox1.simulate("change");
		const colCheckbox2 = wrapper.find("div[data-id='properties-globals_2_1']").find("input[type='checkbox']");
		colCheckbox2.getDOMNode().checked = true;
		colCheckbox2.simulate("change");
		// validate all rows checkboxes are true
		columnValues = renderedController.getPropertyValue(colPropertyId);
		// the header should not have changed the state of the disabled checkbox
		expect(columnValues[0][1]).to.be.equal(true);
		expect(columnValues[1][1]).to.be.equal(false);
		expect(columnValues[2][1]).to.be.equal(true);
		// expect the table checkbox header to now be checked
		expect(tableCheckboxHeader.getDOMNode().checked).to.be.equal(true);
	});
});

describe("structuretable columns sort correctly", () => {
	setPropertyValue();
	const wrapper = mountWithIntl(
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
	const tableWrapper = wrapper.find("div[data-id='properties-keys']");
	const tableData = tableUtils.getTableRows(tableWrapper);

	const tableHeader = tableUtils.getTableHeaderRows(tableWrapper);
	let tableRows = controller.getPropertyValue(propertyId);
	it("should instantiate structuretable in correct order and state", () => {
		// check that starting table is in original order
		expect(tableData).to.have.length(6);
		expect(tableRows[0][0]).to.equal("Na");
		expect(tableRows[5][0]).to.equal("Cholesterol");
	});
	it("should sort column alphabetically ascending and descending", () => {
		// click on the column header to trigger the onClick sort
		const sortableCol = tableHeader.find("div[role='columnheader']").at(1);
		sortableCol.simulate("click");
		tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[5][0]).to.equal("Sex");
		sortableCol.simulate("click");
		tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Sex");
		expect(tableRows[5][0]).to.equal("Age");

	});
});

describe("structuretable columns resize correctly", () => {
	it("resize button should be available for specified columns", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		const wrapper = renderedObject.wrapper;
		// open the summary panel
		propertyUtils.openSummaryPanel(wrapper, "structuretableResizableColumns-summary-panel");
		// Verify table content is rendered
		const tableWrapper = wrapper.find("div[data-id='properties-ci-structuretableResizableColumns']");
		expect(tableWrapper).to.have.length(1);

		const headerRow = tableWrapper.find("div[data-role='properties-header-row']");
		expect(headerRow).to.have.length(1);
		// Verify 2 columns in header are resizable
		expect(headerRow.find(".properties-vt-header-resize")).to.have.length(2);
		// Verify "Name" column can be resized
		const nameColumn = tableWrapper.find("div[aria-label='Name']");
		expect(nameColumn.find(".properties-vt-header-resize")).to.have.length(1);
		// Verify "Type" column can be resized
		const typeColumn = tableWrapper.find("div[aria-label='Type']");
		expect(typeColumn.find(".properties-vt-header-resize")).to.have.length(1);
	});
});

describe("measurement icons should be rendered correctly in structuretable", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("measurement icons should render for table where dm_image is set to measure ", () => {
		propertyUtils.openSummaryPanel(wrapper, "structuretableSortableColumns-summary-panel");
		const tableWrapper = wrapper.find("div[data-id='properties-ft-structuretableSortableColumns']");
		expect(tableWrapper.find("div.properties-field-type-icon")).to.have.length(2);
	});
	it("measurement icons should render in fieldpicker for table where dm_image is set to measure", () => {
		propertyUtils.openSummaryPanel(wrapper, "structuretableSortableColumns-summary-panel");
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretableSortableColumns");
		expect(fieldPicker.find("div.properties-fp-field-type-icon")).to.have.length(8);
	});
	it("measurement icons should not render for table where dm_image value is set to invalid value", () => {
		propertyUtils.openSummaryPanel(wrapper, "structuretableReadonlyColumnStartValue-summary-panel");
		const tableWrapper = wrapper.find("div[data-id='properties-ft-structuretableReadonlyColumnStartValue']"); // "dm_image"="invalid"
		expect(tableWrapper.find("div.properties-field-type-icon")).to.have.length(0);
	});
});

describe("structuretable with long text input values should render as readonly", () => {
	let wrapper;
	let table;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		table = propertyUtils.openSummaryPanel(wrapper, "error_handling_summary");
	});
	afterEach(() => {
		wrapper.unmount();
	});
	it("table should show disabled control and error icon for truncated value", () => {
		expect(table.find(".properties-textinput-readonly")).to.have.length(1);
		const cells = table.find(".properties-table-cell-control");
		expect(cells).to.have.length(3);
		expect(cells.at(1).find("div.properties-validation-message.inTable")).to.have.length(1);

		const editButton = table.find(".properties-subpanel-button").at(0);
		editButton.simulate("click");

		const tables = wrapper.find("div[data-id='properties-structuretableLongValue']");
		expect(tables).to.have.length(2); // first one is the table cell
		const subpanelTable = tables.at(1); // second one is the textarea in subpanel flyout
		expect(subpanelTable.find("textarea").prop("disabled")).to.equal(true);

		const validationMsg = subpanelTable.find("div.bx--form-requirement");
		expect(validationMsg).to.have.length(1);
	});
});

describe("structuretable control with nested structure tables", () => {
	let wrapper;
	let renderedController;
	let summaryPanel;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-structuretable-summary-panel");
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render a nested structurelisteditor control that returns nested objects, edit subPanel", () => {
		const table = summaryPanel.find("div[data-id='properties-ci-nestedStructureObject']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureObject, { applyProperties: true });
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureObject;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit for main table
		let editButton = table.find(".properties-subpanel-button").at(0);
		editButton.simulate("click");

		// subPanel table
		let subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		const addValueBtn = subPanelTable.find("button.properties-add-fields-button");
		addValueBtn.simulate("click");

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
		subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		expect(subPanelTable).to.have.length(1);
		editButton = subPanelTable.find("button.properties-subpanel-button");
		expect(editButton).to.have.length(2);
		editButton.at(1).simulate("click");

		// Modify value of the nested structure
		const nameInput = wrapper.find("div[data-id='properties-ctrl-nestedStructure_table_name']");
		nameInput.find("input").simulate("change", { target: { value: "new name" } });

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
		const table = summaryPanel.find("div[data-id='properties-ci-nestedStructureObjectArray']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureObjectArray, { applyProperties: true });
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureObjectArray;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit for main table
		const editButton = table.find(".properties-subpanel-button").at(0);
		editButton.simulate("click");

		// subPanel table
		let subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		const addValueBtn = subPanelTable.find("button.properties-add-fields-button");
		addValueBtn.simulate("click");

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
		subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		tableUtils.selectCheckboxes(subPanelTable, [1]); // Select second row for onPanel edit

		// verify onPanel edit shows list control
		subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		const onPanelList = subPanelTable.find(".properties-onpanel-container");
		expect(onPanelList).to.have.length(1);

		// Modify value of the nested structure
		const nameInput = onPanelList.find("div[data-id='properties-ctrl-nestedStructure_table_name']");
		nameInput.find("input").simulate("change", { target: { value: "new name" } });

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
		const table = summaryPanel.find("div[data-id='properties-ci-nestedStructureArrayArray']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureArrayArray, { applyProperties: true });
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureArrayArray;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit for main table
		const editButton = table.find(".properties-subpanel-button").at(0);
		editButton.simulate("click");

		// subPanel table
		let subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		const addValueBtn = subPanelTable.find("button.properties-add-fields-button");
		addValueBtn.simulate("click");

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
		subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		tableUtils.selectCheckboxes(subPanelTable, [1]); // Select second row for onPanel edit

		// verify onPanel edit shows list control
		subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		const onPanelList = subPanelTable.find(".properties-onpanel-container");
		expect(onPanelList).to.have.length(1);

		// Modify value of the nested structure
		const nameInput = onPanelList.find("div[data-id='properties-ctrl-nestedStructure_table_name']");
		nameInput.find("input").simulate("change", { target: { value: "new name" } });

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
		const table = summaryPanel.find("div[data-id='properties-ci-nestedStructureArrayObject']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureArrayObject, { applyProperties: true });
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureArrayObject;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// Add new row to main table
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-nestedStructureArrayObject");
		tableUtils.fieldPicker(fieldPicker, ["Na"]);

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
		let editButton = table.find(".properties-subpanel-button").at(0);
		editButton.simulate("click");

		// subPanel table
		let subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		const addValueBtn = subPanelTable.find("button.properties-add-fields-button");
		addValueBtn.simulate("click");

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
		subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		tableUtils.selectCheckboxes(subPanelTable, [1]); // Select second row for onPanel edit

		// verify onPanel edit shows list control
		subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		const onPanelList = subPanelTable.find(".properties-onpanel-container");
		expect(onPanelList).to.have.length(1);

		// Modify value of the nested structure
		const nameInput = onPanelList.find("div[data-id='properties-ctrl-nestedStructure_table_name']");
		nameInput.find("input").simulate("change", { target: { value: "hello" } });

		subPanelTable = wrapper.find("div[data-id='properties-ci-nestedStructure_table']");
		const editButtons = subPanelTable.find("button.properties-subpanel-button");
		expect(editButtons).to.have.length(2);
		editButton = editButtons.at(1);
		editButton.simulate("click");
		const dropdownButton = wrapper.find("div[data-id='properties-ctrl-nestedStructure_table_data_type'] button");
		dropdownButton.simulate("click");
		// select the fourth item
		const dropdownWrapper = wrapper.find("div[data-id='properties-ctrl-nestedStructure_table_data_type']");
		const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
		expect(dropdownList).to.be.length(5);
		dropdownList.at(3).simulate("click");

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
		const table = summaryPanel.find("div[data-id='properties-ci-nestedStructureMap']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureMap, { applyProperties: true });
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureMap;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit for main table
		const editButton = table.find(".properties-subpanel-button").at(0);
		editButton.simulate("click");

		// subPanel table
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-nestedStructureMap_structure");
		tableUtils.fieldPicker(fieldPicker, ["Na"]);

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

	it("should render a nested structureeditor control, edit onPanel", () => {
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructureeditor);
		const expectedOriginal = structuretableParamDef.current_parameters.nestedStructureeditor;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// add row to table
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ci-nestedStructureeditor");
		tableUtils.fieldPicker(fieldPicker, ["Na"]);

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
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-structuretable-summary-panel");
		let table = summaryPanel.find("div[data-id='properties-ci-nestedStructureeditor']");
		const tableRows = table.find("div[data-role='properties-data-row']");
		expect(tableRows).to.have.length(2);
		// const secondRow = tableRows.at(1);
		tableUtils.selectCheckboxes(table, [1]); // Select second row for onPanel edit

		// Modify some values of the nested structure
		table = summaryPanel.find("div[data-id='properties-ci-nestedStructureeditor']");
		const onPanelTable = table.find("div[data-id='properties-ci-userHealthTable']");

		const nameInput = onPanelTable.find("div[data-id='properties-ctrl-userName']");
		nameInput.find("input").simulate("change", { target: { value: "new name" } });

		const annotationInput = onPanelTable.find("div[data-id='properties-ctrl-annotation']");
		annotationInput.find("textarea").simulate("change", { target: { value: "some annotation" } });

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
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("structuretable should have custom classname defined", () => {
		propertyUtils.openSummaryPanel(wrapper, "structuretableReadonlyColumnStartValue-summary-panel");
		expect(wrapper.find(".structuretable-control-class")).to.have.length(1);
	});

	it("structuretable should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "nested-structuretable-summary-panel");
		const parent = wrapper.find(".nested-parent-structuretable-control-class");
		expect(parent).to.have.length(1);
		expect(parent.find(".nested-child-cell-structuretable-control-class")).to.have.length(1);
		// click on subpanel edit for first row
		const editButton = parent.find(".properties-subpanel-button").at(0);
		editButton.simulate("click");
		// This class name exists in the parent table cell and in the subpanel as table
		expect(wrapper.find(".double-nested-subpanel-structuretable-control-class")).to.have.length(2);
		expect(wrapper.find(".double-nested-subpanel-cell-structuretable-control-class")).to.have.length(1);
	});
});
