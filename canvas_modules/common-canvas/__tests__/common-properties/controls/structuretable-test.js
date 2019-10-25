/*
 * Copyright 2017-2019 IBM Corporation
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
import { mountWithIntl, shallowWithIntl } from "enzyme-react-intl";
import { Provider } from "react-redux";
import { expect } from "chai";
import sinon from "sinon";
import propertyUtils from "../../_utils_/property-utils";
import Controller from "../../../src/common-properties/properties-controller";
import isEqual from "lodash/isEqual";

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

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("buildUIItem")).to.equal(genUIItem);
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
		const tableData = tableWrapper.find("tbody.reactable-data").children();
		expect(tableData).to.have.length(6);
		const firstRowCheckbox = tableData.first().find("input");
		firstRowCheckbox.getDOMNode().checked = true;
		firstRowCheckbox.simulate("change");

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
	it("should render a table error message", () => {
		const conditionsPropertyId = { name: "structuretableReadonlyColumnStartValue" };
		expect(renderedController.getPropertyValue(conditionsPropertyId)).to.have.length(1);
		renderedController.updatePropertyValue(conditionsPropertyId, []);

		const structuretableSortOrderErrorMessages = {
			"validation_id": "structuretableReadonlyColumnStartValue",
			"type": "error",
			"text": "table cannot be empty"
		};
		const actual = renderedController.getErrorMessage(conditionsPropertyId);
		expect(isEqual(JSON.parse(JSON.stringify(structuretableSortOrderErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		wrapper.update();
		propertyUtils.openSummaryPanel(wrapper, "structuretableReadonlyColumnStartValue-summary-panel");

		const tableWrapper = wrapper.find("div[data-id='properties-structuretableReadonlyColumnStartValue']");
		expect(tableWrapper.find("div.properties-validation-message")).to.have.length(1);
		expect(tableWrapper.find("div.properties-validation-message span")
			.text()).to.be.equal(structuretableSortOrderErrorMessages.text);
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
		const rows = wrapper.find("tr.table-row");
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

		const rows = wrapper.find("tr.table-row");
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
		const tableHeader = wrapper.find("th.reactable-th-field");
		// click on the column header to trigger the onClick sort
		tableHeader.simulate("click");
		var tableRows = controller.getPropertyValue(propertyIdReadonlyControl);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[1][0]).to.equal("Cholesterol");
		expect(tableRows[2][0]).to.equal("Drug");
		expect(tableRows[0][1]).to.equal(1);
		expect(tableRows[1][1]).to.equal(2);
		expect(tableRows[2][1]).to.equal(3);

		// click on the column header to trigger the onClick sort
		tableHeader.simulate("click");
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
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-structuretableReadonlyColumnStartValue");
		propertyUtils.fieldPicker(fieldPicker, ["0.BP", "data.BP", "2.BP"]);
		// save the changes
		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
		// validate the schema name is saved in the summary list.
		const summaryPanel = wrapper.find("div[data-id='properties-structuretableReadonlyColumnStartValue-summary-panel']");
		const summaryRows = summaryPanel.find("td.properties-summary-row-data");
		expect(summaryRows).to.have.length(5);

		const expectedSummary = [
			"0.Cholesterol",
			"0.Age",
			"0.BP",
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
		const header = table.find(".reactable-column-header");
		expect(header).to.have.length(1);
	});
	it("should use dmDefault property values", () => {
		// Open rename fields Summary Panel in structuretableParamDef
		const table = propertyUtils.openSummaryPanel(wrapper, "structuretableReadonlyColumnDefaultIndex-summary-panel");
		const container = table.find("div.properties-ft-container-panel");
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
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});
	it("mse table should render", () => {
		// Open mse Summary Panel in structuretableParamDef
		const table = propertyUtils.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");
		const container = table.find("div.properties-ft-container-panel");
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
		// Newly added fields should be selected.
		const mseTable = wrapper.find("div[data-id='properties-ST_mse_table-summary-panel']");
		const wideFlyout = mseTable.find("div.properties-wf-content.show");
		const selectedRows = wideFlyout.find("tr.table-selected-row");
		expect(selectedRows).to.have.length(5);
	});
	it("mse table should allow multiple selections", () => {
		propertyUtils.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");
		// select the first row in the table
		const tableData = wrapper.find("tbody.reactable-data").children();
		expect(tableData).to.have.length(4);
		const rowCheckbox = tableData.at(0).find("div.row-checkbox")
			.find("input[type='checkbox']");

		rowCheckbox.getDOMNode().checked = true;
		rowCheckbox.simulate("change");

		// verify that the select summary row is not present
		let selectedEditRow = wrapper.find("div.properties-at-selectedEditRows");
		expect(selectedEditRow).to.have.length(0);

		// multiple select the four row in the table
		tableData.at(2).simulate("click", { metaKey: true, ctrlKey: true });

		// verify that the select summary row is present
		selectedEditRow = wrapper.find("div.properties-at-selectedEditRows");
		expect(selectedEditRow).to.have.length(1);
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
		const tableCheckboxHeader = wrapper.find("thead").at(0)
			.find("input[type='checkbox']")
			.at(1); // find the table header checkbox for column
		tableCheckboxHeader.getDOMNode().checked = true;
		tableCheckboxHeader.simulate("change");
		// validate all rows checkboxes are true
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
		const tableCheckboxHeader = wrapper.find("thead").at(0)
			.find("input[type='checkbox']")
			.at(1); // find the table header checkbox for column
		tableCheckboxHeader.simulate("change", { target: { checked: false, id: "field_types2" } });
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
		const tableCheckboxHeader = wrapper.find("thead").at(0)
			.find("input[type='checkbox']")
			.at(1);
		tableCheckboxHeader.getDOMNode().checked = true;
		tableCheckboxHeader.simulate("change");
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
		const tableCheckboxHeader = wrapper.find("thead").at(0)
			.find("input[type='checkbox']")
			.at(1);
		expect(columnValues).to.have.length(3);
		// check that the initial values for the table (including disabled rows) are correct
		expect(columnValues[0][1]).to.be.equal(false);
		expect(columnValues[1][1]).to.be.equal(false);
		expect(columnValues[2][1]).to.be.equal(false);
		expect(tableCheckboxHeader.getDOMNode().checked).to.be.equal(false);
		// set the column header checkbox to true
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
	const tableData = tableWrapper.find("tbody.reactable-data").children();

	const tableHeader = tableWrapper.find("th.reactable-th-field");
	let tableRows = controller.getPropertyValue(propertyId);
	it("should instantiate structuretable in correct order and state", () => {
		// check that starting table is in original order
		expect(tableData).to.have.length(6);
		expect(tableRows[0][0]).to.equal("Na");
		expect(tableRows[5][0]).to.equal("Cholesterol");
	});
	it("should sort column alphabetically ascending and descending", () => {
		// click on the column header to trigger the onClick sort
		tableHeader.simulate("click");
		tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[5][0]).to.equal("Sex");
		tableHeader.simulate("click");
		tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Sex");
		expect(tableRows[5][0]).to.equal("Age");

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
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-structuretableSortableColumns");
		expect(fieldPicker.find("div.properties-fp-field-type-icon")).to.have.length(8);
	});
	it("measurement icons should not render for table where dm_image value is set to invalid value", () => {
		propertyUtils.openSummaryPanel(wrapper, "structuretableReadonlyColumnStartValue-summary-panel");
		const tableWrapper = wrapper.find("div[data-id='properties-ft-structuretableReadonlyColumnStartValue']"); // "dm_image"="invalid"
		expect(tableWrapper.find("div.properties-field-type-icon")).to.have.length(0);
	});
});
