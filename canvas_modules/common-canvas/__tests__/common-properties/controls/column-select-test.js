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
import { mountWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import sinon from "sinon";
import propertyUtils from "../../_utils_/property-utils";
import Controller from "../../../src/common-properties/properties-controller";
import isEqual from "lodash/isEqual";

import selectcolumnsParamDef from "../../test_resources/paramDefs/selectcolumns_paramDef.json";


const CONDITIONS_TEST_FORM_DATA = require("../../test_resources/json/conditions-test-formData.json");

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
		const wrapper = mountWithIntl(
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
		const wrapper = mountWithIntl(
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
		const wrapper = mountWithIntl(
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
		const wrapper = mountWithIntl(
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
		const wrapper = mountWithIntl(
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

describe("condition messages renders correctly with columnselect control", () => {
	it("columnselect control should have error message from empty input", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);
		const conditionsPropertyId = { name: "columnSelectInputFieldList" };
		const input = wrapper.find("#flexible-table-columnSelectInputFieldList");
		expect(input).to.have.length(1);

		// select the first row in the table
		var tableData = input.find(".column-select-table-row");
		expect(tableData).to.have.length(2);
		tableData.at(0).simulate("click"); // TODO Doesn't actually do anything
		// ensure removed button is enabled and select it
		var enabledRemoveColumnButton = input.find("#remove-fields-button-enabled");
		expect(enabledRemoveColumnButton).to.have.length(1);
		expect(enabledRemoveColumnButton.prop("id")).to.equal("remove-fields-button-enabled");
		enabledRemoveColumnButton.simulate("click");
		// validate the first row is deleted
		expect(controller.getPropertyValue(conditionsPropertyId)).to.have.same.members(["BP"]);

		tableData = input.find(".column-select-table-row");
		expect(tableData).to.have.length(1);
		tableData.at(0).simulate("click"); // TODO Doesn't actually do anything
		// ensure removed button is enabled and select it
		enabledRemoveColumnButton = input.find("#remove-fields-button-enabled");
		expect(enabledRemoveColumnButton).to.have.length(1);
		expect(enabledRemoveColumnButton.prop("id")).to.equal("remove-fields-button-enabled");
		enabledRemoveColumnButton.simulate("click");
		// validate the first row is deleted
		expect(controller.getPropertyValue(conditionsPropertyId)).to.have.length(0);

		input.simulate("blur");
		wrapper.update();

		const columnSelectInputFieldListErrorMessages = {
			"type": "error",
			"text": "Select one or more input fields."
		};
		const actual = controller.getErrorMessage(conditionsPropertyId);
		expect(isEqual(JSON.parse(JSON.stringify(columnSelectInputFieldListErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);
	});
});

describe("selectcolumns control filters values correctly", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsParamDef);
	const wrapper = renderedObject.wrapper;

	it("should filter values from selectcolumn control", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(2); // get the filter category
		const addFieldsButtons = filterCategory.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker for `Filter by Type` control
		propertyUtils.fieldPicker(["age"], ["age", "age2", "age3", "age4"]);
	});
});
