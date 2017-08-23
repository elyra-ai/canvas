/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import ColumnSelectControl from "../../../src/common-properties/editor-controls/column-select-control.jsx";
import { shallow, render, mount } from "enzyme";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
import sinon from "sinon";
chai.use(chaiEnzyme()); // Note the invocation at the end

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
			}
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

const controlId = "keys";

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

const validationDefinitions = [];
const controlStates = {};

function valueAccessor() {
	return [
		["Age"],
		["BP"]
	];
}

function updateControlValue(id, controlValue) {
	expect(id).to.equal(controlId);
}

function getSelectedRows(controlName) {
	return [];
}

function getSelectedRowsTop(controlName) {
	return [0];
}

function updateSelectedRows(row) {
	return [];
}

const openFieldPicker = sinon.spy();

describe("ColumnStructureTableControl renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = shallow(
			<ColumnSelectControl control={control}
				dataModel={datasetMetadata}
				multiColumn
				key={controlId}
				ref={controlId}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				openFieldPicker={openFieldPicker}
				updateControlValue={updateControlValue}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows(control.name)}
			/>
		);

		expect(wrapper.dataModel).to.be.defined;
		expect(wrapper.control).to.be.defined;
		expect(wrapper.key).to.be.defined;
		expect(wrapper.ref).to.be.defined;
		expect(wrapper.valueAccessor).to.be.defined;
		expect(wrapper.updateControlValue).to.be.defined;
		expect(wrapper.updateSelectedRows).to.be.defined;
		expect(wrapper.validationDefinitions).to.be.defined;
		expect(wrapper.selectedRows).to.be.defined;
		expect(wrapper.controlStates).to.be.defined;
		expect(wrapper.buildUIItem).to.be.defined;
		expect(wrapper.openFieldPicker).to.be.defined;
		expect(wrapper.multiColumn).to.be.defined;
	});

	it("should render a `ColumnSelectControl`", () => {
		const wrapper = render(
			<ColumnSelectControl control={control}
				dataModel={datasetMetadata}
				multiColumn
				key={controlId}
				ref={controlId}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				openFieldPicker={openFieldPicker}
				updateControlValue={updateControlValue}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows(control.name)}
			/>
		);

		expect(wrapper.find("#add-fields-button")).to.have.length(1);
		expect(wrapper.find("#remove-fields-button-disabled")).to.have.length(1);
		expect(wrapper.find(".editor_control_area")).to.have.length(1);
	});

	it("should select add columns button and openFieldPicker should be invoked", () => {
		const wrapper = mount(
			<ColumnSelectControl control={control}
				dataModel={datasetMetadata}
				multiColumn
				key={controlId}
				ref={controlId}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				openFieldPicker={openFieldPicker}
				updateControlValue={updateControlValue}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows(control.name)}
			/>
		);

		// select the add column button
		const addColumnButton = wrapper.find("#add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");

		// validate the openFieldPicker is invoked
		expect(openFieldPicker).to.have.property("callCount", 1);
	});

	it("should select row and remove button row should be removed", () => {
		const wrapper = mount(
			<ColumnSelectControl control={control}
				dataModel={datasetMetadata}
				multiColumn
				key={controlId}
				ref={controlId}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				openFieldPicker={openFieldPicker}
				updateControlValue={updateControlValue}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop(control.name)}
			/>
		);

		// select the first row in the table
		let tableBody = wrapper.find(".editor_control_area");
		expect(tableBody).to.have.length(1);
		let tableData = tableBody.find("option");
		expect(tableData).to.have.length(2);
		tableData.at(0).simulate("click");

		// ensure removed button is enabled and select it
		const enabledRemoveColumnButton = wrapper.find("#remove-fields-button-enabled");
		expect(enabledRemoveColumnButton).to.have.length(1);
		expect(enabledRemoveColumnButton.prop("id")).to.equal("remove-fields-button-enabled");
		enabledRemoveColumnButton.simulate("click");

		// validate the first row is deleted
		tableBody = wrapper.find(".editor_control_area");
		expect(tableBody).to.have.length(1);
		tableData = tableBody.find("[value=\"Age\"]");
		expect(tableData).to.have.length(0);
	});

});
