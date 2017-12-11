/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import ColumnStructureTableControl from "../../../src/common-properties/editor-controls/column-structure-table-control.jsx";
import { render, mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";

import Controller from "../../../src/common-properties/properties-controller";

const controller = new Controller();

const control = {
	"name": "keys",
	"label": {
		"text": "Sort by"
	},
	"separateLabel": true,
	"controlType": "structuretable",
	"moveableRows": true,
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

const datasetMetadata = {
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
};

const propertyId = { name: "keys" };

function setPropertyValue() {
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
		const wrapper = mount(
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
		const wrapper = render(
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
		const wrapper = mount(
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
		const wrapper = mount(
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
		const wrapper = mount(
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
		const wrapper = mount(
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
		const wrapper = mount(
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
		const wrapper = mount(
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
		const wrapper = mount(
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
		const wrapper = mount(
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
		const wrapper = mount(
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
		const wrapper = mount(
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
		const wrapper = mount(
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
