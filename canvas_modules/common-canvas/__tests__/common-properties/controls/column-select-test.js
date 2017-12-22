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
import { render, mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import Controller from "../../../src/common-properties/properties-controller";

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
	"valueDef": {
		"propType": "string",
		"isList": true,
		"isMap": false,
		"defaultValue": []
	},
	"separateLabel": true
};

const moveableRowControl = {
	"name": "test-columnSelect",
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
	"separateLabel": true,
	"moveableRows": true
};

const propertyId = { name: "test-columnSelect" };

function setPropertyValue() {
	controller.setPropertyValues(
		{ "test-columnSelect": ["Age", "BP", "K"] }
	);
}

var selectedRows = [];
function getSelectedRows() {
	return selectedRows;
}

function getSelectedRows2() {
	return [0];
}

function updateSelectedRows(row) {
	return selectedRows[row];
}

const openFieldPicker = sinon.spy();
setPropertyValue();
describe("ColumnStructureTableControl renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<ColumnSelectControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPicker}
				updateSelectedRows={updateSelectedRows}
				selectedRows={selectedRows}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("updateSelectedRows")).to.equal(updateSelectedRows);
		expect(wrapper.prop("openFieldPicker")).to.equal(openFieldPicker);
		expect(wrapper.prop("selectedRows")).to.equal(selectedRows);
	});

	it("should render a `ColumnSelectControl`", () => {
		const wrapper = render(
			<ColumnSelectControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPicker}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows()}
			/>
		);
		expect(wrapper.find("#add-fields-button")).to.have.length(1);
		expect(wrapper.find("#remove-fields-button-disabled")).to.have.length(1);
		expect(wrapper.find(".column-select-table-row")).to.have.length(3);
	});

	it("should select add columns button and openFieldPicker should be invoked", () => {
		const wrapper = mount(
			<ColumnSelectControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPicker}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows()}
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
		setPropertyValue();
		const wrapper = mount(
			<ColumnSelectControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPicker}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows2()}
			/>
		);
		// select the first row in the table
		const tableData = wrapper.find(".column-select-table-row");
		expect(tableData).to.have.length(3);
		tableData.at(0).simulate("click"); // TODO Doesn't actually do anything
		// ensure removed button is enabled and select it
		const enabledRemoveColumnButton = wrapper.find("#remove-fields-button-enabled");
		expect(enabledRemoveColumnButton).to.have.length(1);
		expect(enabledRemoveColumnButton.prop("id")).to.equal("remove-fields-button-enabled");
		enabledRemoveColumnButton.simulate("click");
		// validate the first row is deleted
		expect(controller.getPropertyValue(propertyId)).to.have.same.members(["BP", "K"]);
	});

	it("should ensure moveableRows are rendered", () => {
		const wrapper = mount(
			<ColumnSelectControl
				control={moveableRowControl}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPicker}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows()}
			/>
		);
		// see if moveable rows container and buttons rendered and are disabled
		expect(wrapper.find("#table-row-move-button-container")).to.have.length(1);
		expect(wrapper.find(".table-row-move-button-disable")).to.have.length(4);
	});

});
