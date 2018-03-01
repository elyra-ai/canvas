/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import ColumnStructureTableControl from "../../../src/common-properties/editor-controls/column-structure-table-control.jsx";
import { mountWithIntl } from "enzyme-react-intl";
import { ReactWrapper } from "enzyme";

import { expect } from "chai";
import sinon from "sinon";
import propertyUtils from "../../_utils_/property-utils";
import Controller from "../../../src/common-properties/properties-controller";
import isEqual from "lodash/isEqual";

import structuretableParamDef from "../../test_resources/paramDefs/structuretable_paramDef.json";
import structuretableMultiInputParamDef from "../../test_resources/paramDefs/structuretable_multiInput_paramDef.json";
import rowDisplayParamDef from "../../test_resources/paramDefs/displayRows_paramDef.json";

import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Need for style checking

const CONDITIONS_TEST_FORM_DATA = require("../../test_resources/json/conditions-test-formData.json");

const controller = new Controller();

const control = {
	"name": "keys",
	"label": {
		"text": "Sort by"
	},
	"separateLabel": true,
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
			"controlType": "oneofcolumns",
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
	"0": {
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
		"parameterName": "structuretableSortOrder",
		"columnIndex": 0,
		"summaryPanelId": "structuretableSortOrder-summary-panel",
		"summaryLabel": "Sort by"
	},
	"1": {
		"name": "structuretable_sort_order_readonly_int",
		"label": {
			"text": "Index"
		},
		"description": {
			"text": "Auto generated integers starting at 1"
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
		"parameterName": "structuretableSortOrder",
		"columnIndex": 1,
		"summaryPanelId": "structuretableSortOrder-summary-panel",
		"summaryLabel": "Sort by"
	},
	"2": {
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
		"parameterName": "structuretableSortOrder",
		"columnIndex": 2,
		"summaryPanelId": "structuretableSortOrder-summary-panel",
		"summaryLabel": "Sort by"
	},
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
	"separateLabel": true,
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
			"summary": true,
			"visible": true,
			"width": 28,
			"parameterName": "structuretableSortOrder",
			"columnIndex": 0,
			"summaryPanelId": "structuretableSortOrder-summary-panel",
			"summaryLabel": "Sort by"
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
			"parameterName": "structuretableSortOrder",
			"columnIndex": 1,
			"summaryPanelId": "structuretableSortOrder-summary-panel",
			"summaryLabel": "Sort by"
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
			"parameterName": "structuretableSortOrder",
			"columnIndex": 2,
			"summaryPanelId": "structuretableSortOrder-summary-panel",
			"summaryLabel": "Sort by"
		}
	],
	"keyIndex": 0,
	"defaultRow": [
		"", "5", "Ascending"
	],
	"moveableRows": true,
	"summaryPanelId": "structuretableSortOrder-summary-panel",
	"summaryLabel": "Sort by"
};

const readonlyControlStartValue = {
	"0": {
		"name": "structuretable_sort_order_readonly_int",
		"label": {
			"text": "From 3"
		},
		"description": {
			"text": "Auto generated integers starting at 3"
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
		"parameterName": "structuretableSortOrderStartValue",
		"columnIndex": 0,
		"summaryPanelId": "structuretableSortOrderStartValue-summary-panel",
		"summaryLabel": "Sort by"
	},
	"1": {
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
		"parameterName": "structuretableSortOrderStartValue",
		"columnIndex": 1,
		"summaryPanelId": "structuretableSortOrderStartValue-summary-panel",
		"summaryLabel": "Sort by"
	},
	"2": {
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
		"parameterName": "structuretableSortOrderStartValue",
		"columnIndex": 2,
		"summaryPanelId": "structuretableSortOrderStartValue-summary-panel",
		"summaryLabel": "Sort by"
	},
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
	"separateLabel": true,
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
			"parameterName": "structuretableSortOrderStartValue",
			"columnIndex": 0,
			"summaryPanelId": "structuretableSortOrderStartValue-summary-panel",
			"summaryLabel": "Sort by"
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
			"parameterName": "structuretableSortOrderStartValue",
			"columnIndex": 1,
			"summaryPanelId": "structuretableSortOrderStartValue-summary-panel",
			"summaryLabel": "Sort by"
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
			"parameterName": "structuretableSortOrderStartValue",
			"columnIndex": 2,
			"summaryPanelId": "structuretableSortOrderStartValue-summary-panel",
			"summaryLabel": "Sort by"
		}
	],
	"keyIndex": 0,
	"defaultRow": [
		"5", "", "Ascending"
	],
	"moveableRows": true,
	"summaryPanelId": "structuretableSortOrderStartValue-summary-panel",
	"summaryLabel": "Sort by"
};

const datasetMetadata = [
	{
		"fields": [
			{
				"name": "Age",
				"type": "integer",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				}
			},
			{
				"name": "Sex",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				}
			},
			{
				"name": "BP",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				}
			},
			{
				"name": "Cholesterol",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				}
			},
			{
				"name": "Na",
				"type": "double",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				}
			},
			{
				"name": "K",
				"type": "double",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				}
			},
			{
				"name": "Drug",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "input"
				}
			}
		]
	}
];

const propertyId = { name: "keys" };
const propertyIdReadonlyControl = { name: "structuretableSortOrder" };
const propertyIdReadonlyControlStartValue = { name: "structuretableSortOrderStartValue" };

function setPropertyValue(type) {
	switch (type) {
	case "readonlyControlDefault":
		controller.setPropertyValues(
			{ "structuretableSortOrder": [
				["Cholesterol", 1, "Ascending"],
				["Age", 11, "Descending"],
				["Drug", 111, "Ascending"]
			] }
		);
		break;
	case "readonlyControlStartValue":
		controller.setPropertyValues(
			{ "structuretableSortOrderStartValue": [
				[0, "Cholesterol", "Ascending"],
				[5, "Age", "Descending"],
				[8, "Drug", "Ascending"]
			] }
		);
		break;
	default:
		controller.setPropertyValues(
			{ "keys": [
				["Na", "Ascending"],
				["Drug", "Descending"],
				["Sex", "Ascending"],
				["Age", "Descending"],
				["BP", "Ascending"],
				["Cholesterol", "Ascending"]
			] }
		);
	}
}

function getSelectedRows() {
	return [];
}

function getSelectedRowsTop() {
	return [0];
}

function getSelectedRowsBottom() {
	return [5];
}

function getSelectedRowsMiddle() {
	return [2];
}

function updateSelectedRows(row) {
	return [];
}

function genUIItem() {
	return <div />;
}

const openFieldPicker = sinon.spy();
setPropertyValue();
describe("ColumnStructureTableControl renders correctly", () => {

	it("props should have been defined", () => {
		const selectedRows = getSelectedRows();
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={selectedRows}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		expect(wrapper.prop("dataModel")).to.equal(datasetMetadata);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("updateSelectedRows")).to.equal(updateSelectedRows);
		expect(wrapper.prop("selectedRows")).to.equal(selectedRows);
		expect(wrapper.prop("buildUIItem")).to.equal(genUIItem);
		expect(wrapper.prop("openFieldPicker")).to.equal(openFieldPicker);
	});

	it("should render a `ColumnStructureTableControl`", () => {
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		expect(wrapper.find("#structure-table")).to.have.length(1);
		const buttons = wrapper.find(".structure-table-content-row");
		expect(buttons).to.have.length(1);
		expect(buttons.find("#add-fields-button")).to.have.length(1);
		expect(buttons.find("#remove-fields-button-disabled")).to.have.length(1);
		const tableContent = wrapper.find(".structure-table-content-row");
		expect(tableContent).to.have.length(1);
		expect(tableContent.find("#table-row-move-button-container")).to.have.length(1);
		expect(tableContent.find(".table-row-move-button-disable")).to.have.length(4);
	});

	it("should select no rows and all move buttons disabled `ColumnStructureTableControl`", () => {
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container").find("div");
		expect(buttonContainer).to.have.length(3);
		expect(buttonContainer.at(1).find(".table-row-move-button-disable")).to.have.length(2);
		expect(buttonContainer.at(2).find(".table-row-move-button-disable")).to.have.length(2);
	});

	it("should select top row and move down one row", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		// select the first row in the table
		let tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		let tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.first().simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container").find("div");
		expect(buttonContainer).to.have.length(5);
		expect(buttonContainer.at(1).find(".table-row-move-button-disable")).to.have.length(2);
		expect(buttonContainer.at(2).find(".table-row-move-button")).to.have.length(2);
		buttonContainer.at(3).simulate("click");

		// validate the first row is moved
		tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		expect(tableData.at(0).children()
			.at(0)
			.text()).to.equal("Drug");
		expect(tableData.at(1).children()
			.at(0)
			.text()).to.equal("Na");
	});

	it("should select top row and move down to bottom row", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		// select the first row in the table
		let tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		let tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.first().simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container").find("div");
		expect(buttonContainer).to.have.length(5);
		expect(buttonContainer.at(1).find(".table-row-move-button-disable")).to.have.length(2);
		expect(buttonContainer.at(2).find(".table-row-move-button")).to.have.length(2);
		buttonContainer.at(4).simulate("click");

		// validate the first row is moved
		tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		expect(tableData.at(0).children()
			.at(0)
			.text()).to.equal("Drug");
		expect(tableData.at(5).children()
			.at(0)
			.text()).to.equal("Na");
	});

	it("should select bottom row and move up one row", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsBottom(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		// select the last row in the table
		let tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		let tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.at(5).simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container").find("div");
		expect(buttonContainer).to.have.length(5);
		expect(buttonContainer.at(1).find(".table-row-move-button")).to.have.length(2);
		expect(buttonContainer.at(4).find(".table-row-move-button-disable")).to.have.length(2);
		buttonContainer.at(3).simulate("click");

		// validate the first row is moved
		tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		expect(tableData.at(4).children()
			.at(0)
			.text()).to.equal("Cholesterol");
		expect(tableData.at(5).children()
			.at(0)
			.text()).to.equal("BP");
	});

	it("should select bottom row and move up to top row", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsBottom(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		// select the last row in the table
		let tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		let tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.at(5).simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container").find("div");
		expect(buttonContainer).to.have.length(5);
		expect(buttonContainer.at(1).find(".table-row-move-button")).to.have.length(2);
		expect(buttonContainer.at(4).find(".table-row-move-button-disable")).to.have.length(2);
		buttonContainer.at(2).simulate("click");

		// validate the last row is moved
		tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		expect(tableData.at(0).children()
			.at(0)
			.text()).to.equal("Cholesterol");
		expect(tableData.at(5).children()
			.at(0)
			.text()).to.equal("BP");
	});

	it("should select top row and correct move buttons enabled `ColumnStructureTableControl`", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		// select the first row in the table
		const tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		const tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.first().simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container").find("div");
		expect(buttonContainer).to.have.length(5);
		expect(buttonContainer.at(1).find(".table-row-move-button-disable")).to.have.length(2);
		expect(buttonContainer.at(2).find(".table-row-move-button")).to.have.length(2);
	});

	it("should select bottom row and correct move buttons enabled `ColumnStructureTableControl`", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsBottom(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		// select the first row in the table
		const tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		const tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.last().simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container").find("div");
		expect(buttonContainer).to.have.length(5);
		expect(buttonContainer.at(1).find(".table-row-move-button")).to.have.length(2);
		expect(buttonContainer.at(4).find(".table-row-move-button-disable")).to.have.length(2);
	});

	it("should select middle row and all move buttons enabled `ColumnStructureTableControl`", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsMiddle(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		// select the first row in the table
		const tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		const tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.at(2).simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container").find("div");
		expect(buttonContainer).to.have.length(7);
		expect(buttonContainer.at(1).find(".table-row-move-button")).to.have.length(2);
		expect(buttonContainer.at(4).find(".table-row-move-button")).to.have.length(2);
	});

	it("should select add columns button and field picker should display", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		// select the add column button
		const addColumnButton = wrapper.find("#add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");

		// validate the field picker table displays
		expect(openFieldPicker).to.have.property("callCount", 1);
	});

	it("should select row and remove button row should be removed", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		// ensure the remove column button is disabled
		const removeColumnButton = wrapper.find("#remove-fields-button-disabled");
		expect(removeColumnButton).to.have.length(1);

		// select the first row in the table
		let tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		let tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.first().simulate("click");

		// ensure removed button is enabled and select it
		const enabledRemoveColumnButton = wrapper.find("#remove-fields-button-enabled");
		expect(enabledRemoveColumnButton).to.have.length(1);
		expect(enabledRemoveColumnButton.prop("id")).to.equal("remove-fields-button-enabled");
		enabledRemoveColumnButton.simulate("click");

		// validate the first row is deleted
		tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(5);
		expect(tableData.at(0).children()
			.at(0)
			.text()).to.equal("Drug");
	});

	it("should search correct keyword in table", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);
		const input = wrapper.find("#flexible-table-search");
		input.simulate("change", { target: { value: "Age" } });
		expect(wrapper.find(".table-row")).to.have.length(1);
		input.simulate("change", { target: { value: "AGE" } });
		expect(wrapper.find(".table-row")).to.have.length(1);

	});
});

describe("condition messages renders correctly with structure table control", () => {
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
	it("structuretableSortOrder control should have error message from no selection", () => {
		// a note about this test.  structuretableSortOrder has the required = true attribute and
		// a isNotEmpty condition.  The isNotEmpty condition error message should take precendence.
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(0); // Summary link Configure Sort Order
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const modalWrapper = new ReactWrapper(tableHtml, true);
		const input = modalWrapper.find("#flexible-table-structuretableReadonlyColumnStartValue");
		const conditionsPropertyId = { name: "structuretableReadonlyColumnStartValue" };
		expect(input).to.have.length(1);
		expect(renderedController.getPropertyValue(conditionsPropertyId)).to.have.length(1);

		let dataRows = input.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(1);
		dataRows.first().simulate("click");
		wrapper.update();

		const enabledRemoveColumnButton = input.find("#remove-fields-button-enabled");
		expect(enabledRemoveColumnButton).to.have.length(1);

		enabledRemoveColumnButton.simulate("click");
		wrapper.update();
		dataRows = input.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(0);
		expect(renderedController.getPropertyValue(conditionsPropertyId)).to.have.length(0);

		enabledRemoveColumnButton.simulate("blur");
		wrapper.update();

		const structuretableSortOrderErrorMessages = {
			"type": "error",
			"text": "table cannot be empty"
		};
		const actual = renderedController.getErrorMessage(conditionsPropertyId);
		expect(isEqual(JSON.parse(JSON.stringify(structuretableSortOrderErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		expect(modalWrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(modalWrapper.find(".form__validation--error")).to.have.length(1);
	});

	it("structuretableRenameFields control should have error message from containing 'pw'", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(1); // Summary link Configure Rename fields
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const modalWrapper = new ReactWrapper(tableHtml, true);
		const input = modalWrapper.find("#flexible-table-structuretableReadonlyColumnDefaultIndex");

		const conditionsPropertyId = { name: "structuretableReadonlyColumnDefaultIndex" };
		expect(input).to.have.length(1);
		expect(renderedController.getPropertyValue(conditionsPropertyId)).to.have.length(2);

		const nameInput = input.find("input[type='text']");
		expect(nameInput).to.have.length(4);
		const inputControl = nameInput.at(0);
		inputControl.simulate("change", { target: { value: "bad pw" } });
		wrapper.update();
		inputControl.simulate("blur");
		wrapper.update();

		const structuretableRenameFieldsErrorMessages = {
			"type": "error",
			"text": "The 'Output Name' field cannot contain 'pw'"
		};
		const actual = renderedController.getErrorMessage(conditionsPropertyId);
		expect(isEqual(JSON.parse(JSON.stringify(structuretableRenameFieldsErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(modalWrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(modalWrapper.find(".form__validation--error")).to.have.length(1);

	});

	it("required structuretableRenameTable control should have error message from no selection", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(1); // Summary link Configure Rename fields
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const modalWrapper = new ReactWrapper(tableHtml, true);
		const input = modalWrapper.find("#flexible-table-structuretableReadonlyColumnDefaultIndex");

		const conditionsPropertyId = { name: "structuretableReadonlyColumnDefaultIndex" };
		expect(input).to.have.length(1);
		expect(renderedController.getPropertyValue(conditionsPropertyId)).to.have.length(2);

		// remove two data row so that the table is empty
		let dataRows = input.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(2);
		dataRows.first().simulate("click");
		wrapper.update();

		const enabledRemoveColumnButton = modalWrapper.find("#remove-fields-button-enabled");
		expect(enabledRemoveColumnButton).to.have.length(1);

		enabledRemoveColumnButton.simulate("click");
		wrapper.update();
		dataRows = modalWrapper
			.find("#flexible-table-structuretableReadonlyColumnDefaultIndex")
			.find(".reactable-data")
			.find("tr");

		expect(dataRows).to.have.length(1);
		expect(renderedController.getPropertyValue(conditionsPropertyId)).to.have.length(1);

		dataRows.first().simulate("click");
		wrapper.update();

		modalWrapper.find("#remove-fields-button-enabled").simulate("click");
		wrapper.update();
		dataRows = modalWrapper
			.find("#flexible-table-structuretableReadonlyColumnDefaultIndex")
			.find(".reactable-data")
			.find("tr");

		expect(dataRows).to.have.length(0);
		expect(renderedController.getPropertyValue(conditionsPropertyId)).to.have.length(0);

		const structuretableRenameFieldsErrorMessages = {
			"type": "error",
			"text": "Required parameter 'Rename Field' has no value"
		};
		const actual = renderedController.getErrorMessage(conditionsPropertyId);
		expect(isEqual(JSON.parse(JSON.stringify(structuretableRenameFieldsErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		expect(modalWrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(modalWrapper.find(".form__validation--error")).to.have.length(1);
	});
});

describe("condition messages renders correctly with structure table cells", () => {
	it("structuretableRenameFields control should have error message with empty renamed field", () => {
		const wrapper = propertyUtils.createEditorForm("mount", JSON.parse(JSON.stringify(CONDITIONS_TEST_FORM_DATA)), controller);
		const conditionsPropertyId = { name: "structuretableRenameFields" };
		const input = wrapper.find("#flexible-table-structuretableRenameFields");
		expect(input).to.have.length(1);
		expect(controller.getPropertyValue(conditionsPropertyId)).to.have.length(2);

		const dataRows = input.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(2);
		dataRows.first().simulate("click");
		const cell = dataRows.first().find("#editor-control-new_name_0");
		cell.simulate("change", { target: { value: "" } });
		const rowValues = controller.getPropertyValue(conditionsPropertyId);
		const expected = [
			["Age", ""],
			["BP", "BP-1"]
		];
		expect(isEqual(rowValues, expected)).to.be.true;

		// TODO nothing being checked here for validations
	});

	it("structuretableRenameFields control should have disabled dropdown control", () => {
		const wrapper = propertyUtils.createEditorForm("mount", JSON.parse(JSON.stringify(CONDITIONS_TEST_FORM_DATA)), controller);
		const tabs = wrapper.find(".tabs__tabpanel");
		expect(tabs).to.have.length(6);
		const tab = tabs.at(5);
		const dataRows = tab.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(7);
		const uncheckedRow = dataRows.at(1);
		expect(uncheckedRow.find(".Dropdown-disabled")).to.have.length(1);
		const cells = uncheckedRow.find("td");
		expect(cells).to.have.length(5);
		const cell = cells.at(3);
		const dropdown = cell.find(".Dropdown-control-panel");
		expect(dropdown).to.have.length(1);
		expect(dropdown).to.have.style("display", "none");
	});
});

describe("Cells disable and hide correctly with structure table control", () => {
	it("structuretable should disable cells", () => {
		const wrapper = propertyUtils.createEditorForm("mount", JSON.parse(JSON.stringify(CONDITIONS_TEST_FORM_DATA)), controller);
		const storageTable = wrapper.find("#flexible-table-field_types");
		let disabledDropdowns = storageTable.find(".Dropdown-disabled");
		expect(disabledDropdowns).to.have.length(4);
		const input = storageTable.find("#editor-control-override_0_field_types_0_1");
		expect(input).to.have.length(1);
		storageTable.find("input[id='editor-control-override_0_field_types_0_1']").simulate("change", { target: { checked: false } });
		wrapper.update();
		disabledDropdowns = storageTable.find(".Dropdown-disabled");
		expect(disabledDropdowns).to.have.length(5);
	});

	it("structuretable should hide cells", () => {
		const wrapper = propertyUtils.createEditorForm("mount", JSON.parse(JSON.stringify(CONDITIONS_TEST_FORM_DATA)), controller);
		const tabs = wrapper.find(".tabs__tabpanel");
		expect(tabs).to.have.length(6);
		const tab = tabs.at(5);
		const table = tab.find("#structure-table");
		const dataRows = table.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(7);
		let row = dataRows.first();
		let hiddenDropdowns = row.find(".Dropdown-control-panel");
		expect(hiddenDropdowns).to.have.length(2);

		expect(hiddenDropdowns.at(1)).not.to.have.style("display", "none");
		const input = row.find("#editor-control-override_0_field_types_0_1");
		expect(input).to.have.length(1);
		wrapper.find("input[id='editor-control-override_0_field_types_0_1']").simulate("change", { target: { checked: false } });
		wrapper.update();
		row = dataRows.first();
		hiddenDropdowns = row.find(".Dropdown-control-panel");
		expect(hiddenDropdowns).to.have.length(2);
		expect(hiddenDropdowns.at(1)).to.have.style("display", "none");
	});
});

describe("ColumnStructureTableControl with readonly numbered column renders correctly", () => {
	it("should have displayed the correct generatedValues with default index values", () => {
		setPropertyValue("readonlyControlDefault");
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={readonlyControlDefault}
				controller={controller}
				propertyId={propertyIdReadonlyControl}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		const rows = wrapper.find(".table-row");
		expect(rows).to.have.length(3);

		const expectedData = "[[\"Cholesterol\",1,\"Ascending\"],[\"Age\",2,\"Descending\"],[\"Drug\",3,\"Ascending\"]]";
		const controllerData = controller.getPropertyValue(propertyIdReadonlyControl);
		expect(JSON.stringify(controllerData)).to.equal(expectedData);
	});

	it("should have displayed the correct generatedValues with startValue", () => {
		setPropertyValue("readonlyControlStartValue");
		const wrapper = mountWithIntl(
			<ColumnStructureTableControl
				control={readonlyControlStartValue}
				controller={controller}
				propertyId={propertyIdReadonlyControlStartValue}
				dataModel={datasetMetadata}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows(control.name)}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
			/>
		);

		const rows = wrapper.find(".table-row");
		expect(rows).to.have.length(3);

		const expectedData = "[[3,\"Cholesterol\",\"Ascending\"],[4,\"Age\",\"Descending\"],[5,\"Drug\",\"Ascending\"]]";
		const controllerData = controller.getPropertyValue(propertyIdReadonlyControlStartValue);
		expect(JSON.stringify(controllerData)).to.equal(expectedData);
	});
});

describe("ColumnStructureTableControl with filtering works correctly", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should not have add remove buttons for the table", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(2); // Summary link Configure No Buttons Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementById("flexible-table-structuretableNoButtons"); // needed since modal dialogs are outside `wrapper`
		const noButtonTable = new ReactWrapper(tableHtml, true);
		// no add/remove buttons should be rendered
		expect(noButtonTable.find("#field-picker-buttons-container")).to.have.length(0);

		// TODO when issue #1105 is implement then a check should be added that the table contains 2 rows.
	});

	it("should only show string fields in field picker", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // FILTER category
		filterCategory.find(".button").simulate("click");
		const wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const addFieldsButtons = wideflyoutWrapper.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker
		propertyUtils.fieldPicker(["Drug"], ["Sex", "BP", "Cholesterol", "Drug"]);
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		expect(filterCategory.find(".control-summary-list-rows")).to.have.length(1);
	});
});

describe("ColumnStructureTableControl with multi input schemas renders correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableMultiInputParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should prefix the correct schema for fields selected", () => {
		const tablesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // TABLES category
		tablesCategory.find(".control-summary-link-buttons").at(0)
			.find(".button")
			.simulate("click");
		const wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const addFieldsButtons = wideflyoutWrapper.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker
		propertyUtils.fieldPicker([
			{ "name": "BP", "schema": "0" },
			{ "name": "BP", "schema": "data" },
			{ "name": "BP", "schema": "2" }
		]);
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		const firstSummary = tablesCategory.find(".control-summary.control-panel").at(0);
		expect(firstSummary.find(".control-summary-list-rows")).to.have.length(5);

		const expectedSummary = [
			"Cholesterol",
			"0.Age",
			"0.BP",
			"data.BP",
			"2.BP"
		];

		for (let idx = 0; idx < firstSummary.length; idx++) {
			expect(firstSummary.find(".control-summary-list-rows").at(idx)
				.text()
				.trim()).to.equal(expectedSummary[idx]);
		}
	});

	it("should render the no buttons table with correct fields with schema", () => {
		const tablesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // TABLES category
		tablesCategory.find(".control-summary-link-buttons").at(1)
			.find(".button")
			.simulate("click");
		const wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const tableRows = wideflyoutWrapper.find("#flexible-table-structuretableNoButtons").find(".table-row");
		expect(tableRows).to.have.length(22);

		const expectedSummary = [
			"0.Age", "Sex", "0.BP", "Cholesterol", "0.Na", "K", "Drug", "Ag",
			"data.Age", "data.BP", "data.Na", "data.drug", "data.drug2", "data.drug3", "data.drug4",
			"2.Age", "2.BP", "2.Na", "2.drug", "2.drug2", "2.drug3", "2.drug4"
		];

		for (let idx = 0; idx < tableRows.length; idx++) {
			expect(tableRows.at(idx).find("td")
				.at(0)
				.text()).to.equal(expectedSummary[idx]);
		}
	});

	it("should render the selectschema control in the table", () => {
		const tablesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // TABLES category
		tablesCategory.find(".control-summary-link-buttons").at(2)
			.find(".button")
			.simulate("click");
		const wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const addFieldsButtons = wideflyoutWrapper.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker

		propertyUtils.fieldPicker([
			{ "name": "Cholesterol", "schema": "0" },
			{ "name": "Age", "schema": "data" }
		]);

		const tableRows = wideflyoutWrapper.find("#flexible-table-structuretableSortableColumns").find(".table-row");
		expect(tableRows).to.have.length(2);

		const rowIdx0 = tableRows.at(0).find("td");
		expect(rowIdx0).to.have.length(8); // includes scrollbar column
		expect(rowIdx0.at(1).text()).to.equal("Cholesterol");
		expect(rowIdx0.at(5).find(".Dropdown-placeholder")
			.text()).to.equal("...");

		let selectschema = rowIdx0.at(5).find("Dropdown");
		expect(selectschema).to.have.length(1);
		const schemaOptions = selectschema.at(0).prop("options"); // by Type
		const expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0", value: "0" },
			{ label: "data", value: "data" },
			{ label: "2", value: "2" }
		];
		expect(schemaOptions).to.eql(expectedOptions);
		selectschema.at(0).getNode()
			.setValue("data", "data");
		expect(rowIdx0.at(5).find(".Dropdown-placeholder")
			.text()).to.equal("data");

		const rowIdx1 = tableRows.at(1).find("td");
		expect(rowIdx1).to.have.length(8); // includes scrollbar column
		expect(rowIdx1.at(1).text()).to.equal("data.Age");
		expect(rowIdx1.at(5).find(".Dropdown-placeholder")
			.text()).to.equal("...");

		selectschema = rowIdx1.at(5).find("Dropdown");
		expect(selectschema).to.have.length(1);
		selectschema.at(0).getNode()
			.setValue("0", "0");

		expect(rowIdx1.at(5).find(".Dropdown-placeholder")
			.text()).to.equal("0");

		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		const thirdSummary = tablesCategory.find(".control-summary.control-panel").at(2);
		expect(thirdSummary.find(".control-summary-list-rows")).to.have.length(2);

		const summaryRow0 = thirdSummary.find(".control-summary-list-rows").at(0)
			.find(".control-summary-table-row-multi-data");
		expect(summaryRow0.at(0).text()
			.trim()).to.equal("Cholesterol");
		expect(summaryRow0.at(1).text()
			.trim()).to.equal("data");

		const summaryRow1 = thirdSummary.find(".control-summary-list-rows").at(1)
			.find(".control-summary-table-row-multi-data");
		expect(summaryRow1.at(0).text()
			.trim()).to.equal("data.Age");
		expect(summaryRow1.at(1).text()
			.trim()).to.equal("0");
	});

	it("should filter fields from multi schema input that aren't type string", () => {
		const tablesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // TABLES category
		tablesCategory.find(".control-summary-link-buttons").at(0)
			.find(".button")
			.simulate("click");
		const wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const addFieldsButtons = wideflyoutWrapper.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker

		const fphtml = document.getElementById("field-picker-table"); // needed since modal dialogs are outside `wrapper`
		const fieldpicker = new ReactWrapper(fphtml, true);
		const tableRows = fieldpicker.find(".field-picker-data-rows");
		expect(tableRows).to.have.length(14);

		for (let i = 0; i < tableRows.length; i++) {
			const row = tableRows.at(i);
			expect(row.find("td").at(3)
				.text()).to.equal("string");
		}
	});
});

describe("column structure table editor control displays the proper number of rows", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(JSON.parse(JSON.stringify(rowDisplayParamDef)));
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display 3 rows", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(0);
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementById("flexible-table-structuretableSortOrder"); // needed since modal dialogs are outside `wrapper`
		const sortTable = new ReactWrapper(tableHtml, true);
		const heightDiv = sortTable.find("#flexible-table-container-wrapper");
		if (heightDiv.length) {
			const heightStyle = heightDiv.at(0).prop("style");
			// console.log("STYLE: " + JSON.stringify(heightStyle));
			expect(isEqual(JSON.parse(JSON.stringify(heightStyle)),
				JSON.parse(JSON.stringify({ "height": "35px" })))).to.be.true;
		}
	});

	it("should display 4 rows by default", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(0);
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementById("flexible-table-structurelisteditorListInput"); // needed since modal dialogs are outside `wrapper`
		const complexTable = new ReactWrapper(tableHtml, true);
		const heightDiv = complexTable.find("#flexible-table-container-wrapper");
		if (heightDiv.length) {
			const heightStyle = heightDiv.at(0).prop("style");
			// console.log("STYLE: " + JSON.stringify(heightStyle));
			expect(isEqual(JSON.parse(JSON.stringify(heightStyle)),
				JSON.parse(JSON.stringify({ "height": "36px" })))).to.be.true;
		}
	});
});

describe("column structure table editor control displays with no header", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(JSON.parse(JSON.stringify(structuretableParamDef)));
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display header", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(2); // Select Configure No Header Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementById("flexible-table-structuretableNoButtons"); // needed since modal dialogs are outside `wrapper`
		const table = new ReactWrapper(tableHtml, true);
		const header = table.find(".reactable-column-header");
		expect(header).to.have.length(1);
	});
	it("should display no header", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(3); // Select Configure No Header Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementById("flexible-table-structuretableNoHeader"); // needed since modal dialogs are outside `wrapper`
		const table = new ReactWrapper(tableHtml, true);
		const header = table.find(".reactable-column-header");
		expect(header).to.have.length(0);
	});
});
