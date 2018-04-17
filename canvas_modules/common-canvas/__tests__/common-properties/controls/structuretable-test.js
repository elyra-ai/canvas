/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import StructureTableControl from "../../../src/common-properties/controls/structuretable";
import { mountWithIntl } from "enzyme-react-intl";
import { ReactWrapper } from "enzyme";

import { expect } from "chai";
import sinon from "sinon";
import propertyUtils from "../../_utils_/property-utils";
import Controller from "../../../src/common-properties/properties-controller";
import isEqual from "lodash/isEqual";

import structuretableParamDef from "../../test_resources/paramDefs/structuretable_paramDef.json";
import structuretableMultiInputParamDef from "../../test_resources/paramDefs/structuretable_multiInput_paramDef.json";
import filterColumnParamDef from "../../test_resources/paramDefs/Filter_paramDef.json";

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
		const wrapper = mountWithIntl(
			<StructureTableControl
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
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		expect(wrapper.find("#structure-table")).to.have.length(1);
		const buttons = wrapper.find(".structure-table-content-row");
		expect(buttons).to.have.length(1);
		expect(buttons.find("#add-fields-button")).to.have.length(1);
		expect(buttons.find(".remove-fields-button")).to.have.length(1);
		expect(buttons.find(".remove-fields-button").prop("disabled")).to.equal(true);
		const tableContent = wrapper.find(".structure-table-content-row");
		expect(tableContent).to.have.length(1);
		expect(tableContent.find("#table-row-move-button-container")).to.have.length(1);
		expect(tableContent.find(".table-row-move-button[disabled=true]")).to.have.length(4);
	});

	it("should select no rows and all move buttons disabled `structuretable` control", () => {
		const wrapper = mountWithIntl(
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container > div");
		expect(buttonContainer).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=true]")).to.have.length(4);
	});

	it("should select top row and move down one row", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		// select the first row in the table
		let tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		let tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.first().simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container > div");
		expect(buttonContainer).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=true]")).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=false]")).to.have.length(2);
		buttonContainer.find(".table-row-move-button[disabled=false]")
			.at(0)
			.simulate("click");

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
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		// select the first row in the table
		let tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		let tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.first().simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container > div");
		expect(buttonContainer).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=true]")).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=false]")).to.have.length(2);
		buttonContainer.find(".table-row-move-button[disabled=false]")
			.at(1)
			.simulate("click");

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
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		// select the last row in the table
		let tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		let tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.at(5).simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container > div");
		expect(buttonContainer).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=false]")).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=true]")).to.have.length(2);
		buttonContainer.find(".table-row-move-button[disabled=false]")
			.at(1)
			.simulate("click");

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
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		// select the last row in the table
		let tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		let tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.at(5).simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container > div");
		expect(buttonContainer).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=false]")).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=true]")).to.have.length(2);
		buttonContainer.find(".table-row-move-button[disabled=false]")
			.at(0)
			.simulate("click");

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

	it("should select top row and correct move buttons enabled `structuretable` control", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		// select the first row in the table
		const tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		const tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.first().simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container > div");
		expect(buttonContainer).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=false]")).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=true]")).to.have.length(2);
	});

	it("should select bottom row and correct move buttons enabled `structuretable` control", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		// select the first row in the table
		const tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		const tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.last().simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container > div");
		expect(buttonContainer).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=false]")).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=true]")).to.have.length(2);
	});

	it("should select middle row and all move buttons enabled `structuretable` control", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		// select the first row in the table
		const tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		const tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.at(2).simulate("click");

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("#table-row-move-button-container > div");
		expect(buttonContainer).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=false]")).to.have.length(4);
	});

	it("should select add columns button and field picker should display", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
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
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		// ensure the remove column button is disabled
		const removeColumnButton = wrapper.find(".remove-fields-button");
		expect(removeColumnButton.prop("disabled")).to.equal(true);

		// select the first row in the table
		let tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		let tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.first().simulate("click");

		// ensure removed button is enabled and select it
		const enabledRemoveColumnButton = wrapper.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		expect(enabledRemoveColumnButton.prop("disabled")).to.be.undefined;
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
			<StructureTableControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
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

		const enabledRemoveColumnButton = input.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);

		enabledRemoveColumnButton.simulate("click");
		wrapper.update();
		dataRows = input.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(0);
		expect(renderedController.getPropertyValue(conditionsPropertyId)).to.have.length(0);

		enabledRemoveColumnButton.simulate("blur");
		wrapper.update();

		const structuretableSortOrderErrorMessages = {
			"validation_id": "structuretableReadonlyColumnStartValue",
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
			"validation_id": "structuretableReadonlyColumnDefaultIndex",
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

		const enabledRemoveColumnButton = modalWrapper.find(".remove-fields-button");
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

		modalWrapper.find(".remove-fields-button").simulate("click");
		wrapper.update();
		dataRows = modalWrapper
			.find("#flexible-table-structuretableReadonlyColumnDefaultIndex")
			.find(".reactable-data")
			.find("tr");

		expect(dataRows).to.have.length(0);
		expect(renderedController.getPropertyValue(conditionsPropertyId)).to.have.length(0);

		const structuretableRenameFieldsErrorMessages = {
			"validation_id": "required_structuretableReadonlyColumnDefaultIndex_14.984105999808826",
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
		const locController = new Controller();
		const wrapper = propertyUtils.createEditorForm("mount", JSON.parse(JSON.stringify(CONDITIONS_TEST_FORM_DATA)), locController);
		const conditionsPropertyId = { name: "structuretableRenameFields" };
		const input = wrapper.find("#flexible-table-structuretableRenameFields");
		expect(input).to.have.length(1);
		expect(locController.getPropertyValue(conditionsPropertyId)).to.have.length(2);

		const dataRows = input.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(2);
		dataRows.first().simulate("click");
		const cell = dataRows.first().find("#editor-control-new_name_0");
		cell.simulate("change", { target: { value: "" } });
		const rowValues = locController.getPropertyValue(conditionsPropertyId);
		const expected = [
			["Age", ""],
			["BP", "BP-1"]
		];
		expect(isEqual(rowValues, expected)).to.be.true;

		// TODO nothing being checked here for validations
	});

	it("structuretableRenameFields control should have disabled dropdown control", () => {
		const locController = new Controller();
		const wrapper = propertyUtils.createEditorForm("mount", JSON.parse(JSON.stringify(CONDITIONS_TEST_FORM_DATA)), locController);
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
		const locController = new Controller();
		const wrapper = propertyUtils.createEditorForm("mount", JSON.parse(JSON.stringify(CONDITIONS_TEST_FORM_DATA)), locController);
		const storageTable = wrapper.find("#flexible-table-field_types");
		let disabledDropdowns = storageTable.find(".Dropdown-disabled");
		expect(disabledDropdowns).to.have.length(4);
		const input = storageTable.find("#editor-control-override_0");
		expect(input).to.have.length(1);
		storageTable.find("input[id='editor-control-override_0']").simulate("change", { target: { checked: false } });
		wrapper.update();
		disabledDropdowns = storageTable.find(".Dropdown-disabled");
		expect(disabledDropdowns).to.have.length(5);
	});

	it("structuretable should hide cells", () => {
		const locController = new Controller();
		const wrapper = propertyUtils.createEditorForm("mount", JSON.parse(JSON.stringify(CONDITIONS_TEST_FORM_DATA)), locController);
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
		const input = row.find("#editor-control-override_0");
		expect(input).to.have.length(1);
		wrapper.find("input[id='editor-control-override_0']").simulate("change", { target: { checked: false } });
		wrapper.update();
		row = dataRows.first();
		hiddenDropdowns = row.find(".Dropdown-control-panel");
		expect(hiddenDropdowns).to.have.length(2);
		expect(hiddenDropdowns.at(1)).to.have.style("display", "none");
	});
});

describe("structuretable control with readonly numbered column renders correctly", () => {
	beforeEach(() => {
		setPropertyValue();
	});
	it("should have displayed the correct generatedValues with default index values", () => {
		const wrapper = mountWithIntl(
			<StructureTableControl
				control={readonlyControlDefault}
				controller={controller}
				propertyId={propertyIdReadonlyControl}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		const rows = wrapper.find(".table-row");
		expect(rows).to.have.length(3);

		const expectedData = "[[\"Cholesterol\",1,\"Ascending\"],[\"Age\",2,\"Descending\"],[\"Drug\",3,\"Ascending\"]]";
		const controllerData = controller.getPropertyValue(propertyIdReadonlyControl);
		expect(JSON.stringify(controllerData)).to.equal(expectedData);
	});

	it("should have displayed the correct generatedValues with startValue", () => {
		const wrapper = mountWithIntl(
			<StructureTableControl
				control={readonlyControlStartValue}
				controller={controller}
				propertyId={propertyIdReadonlyControlStartValue}
				buildUIItem={genUIItem}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);

		const rows = wrapper.find(".table-row");
		expect(rows).to.have.length(3);

		const expectedData = "[[3,\"Cholesterol\",\"Ascending\"],[4,\"Age\",\"Descending\"],[5,\"Drug\",\"Ascending\"]]";
		const controllerData = controller.getPropertyValue(propertyIdReadonlyControlStartValue);
		expect(JSON.stringify(controllerData)).to.equal(expectedData);
	});
});

describe("structuretable control with filtering works correctly", () => {
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
		const tablesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // TABLES category
		tablesCategory.find(".control-summary-link-buttons").at(0)
			.find(".button")
			.simulate("click");
		const wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const addFieldsButtons = wideflyoutWrapper.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker
		propertyUtils.fieldPicker(["0.BP", "data.BP", "2.BP"]);
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
				.find("span")
				.at(0)
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

		propertyUtils.fieldPicker(["data.Age", "Cholesterol"]);

		const tableRows = wideflyoutWrapper.find("#flexible-table-structuretableSortableColumns").find(".table-row");
		expect(tableRows).to.have.length(2);

		let row = tableRows.at(1).find("td");
		expect(row).to.have.length(8); // includes scrollbar column
		expect(row.at(1).text()).to.equal("Cholesterol");
		expect(row.at(5).find(".Dropdown-placeholder")
			.text()).to.equal("...");

		let selectschema = row.at(5).find("Dropdown");
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
		expect(row.at(5).find(".Dropdown-placeholder")
			.text()).to.equal("data");

		row = tableRows.at(0).find("td");
		expect(row).to.have.length(8); // includes scrollbar column
		expect(row.at(1).text()).to.equal("data.Age");
		expect(row.at(5).find(".Dropdown-placeholder")
			.text()).to.equal("...");

		selectschema = row.at(5).find("Dropdown");
		expect(selectschema).to.have.length(1);
		selectschema.at(0).getNode()
			.setValue("0", "0");

		expect(row.at(5).find(".Dropdown-placeholder")
			.text()).to.equal("0");

		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		const thirdSummary = tablesCategory.find(".control-summary.control-panel").at(2);
		expect(thirdSummary.find(".control-summary-list-rows")).to.have.length(2);

		let summaryRow = thirdSummary.find(".control-summary-list-rows").at(1)
			.find(".control-summary-table-row-multi-data");
		expect(summaryRow.at(0)
			.find("span")
			.at(0)
			.text()
			.trim()).to.equal("Cholesterol");
		expect(summaryRow.at(1)
			.find("span")
			.at(0)
			.text()
			.trim()).to.equal("data");

		summaryRow = thirdSummary.find(".control-summary-list-rows").at(0)
			.find(".control-summary-table-row-multi-data");
		expect(summaryRow.at(0)
			.find("span")
			.at(0)
			.text()
			.trim()).to.equal("data.Age");
		expect(summaryRow.at(1)
			.find("span")
			.at(0)
			.text()
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
				.find(".field-type")
				.text()).to.equal("string");
		}
	});
});


describe("structuretable control displays with no header", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
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
		const tableCheckboxHeader = wrapper.find("#field_types2"); // find the table header
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
		const tableCheckboxHeader = wrapper.find("input[type='checkbox']").at(0); // find the table header checkbox
		tableCheckboxHeader.simulate("change", { target: { checked: true, id: "field_types2" } });
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
		// set the column header checkbox to true
		const tableCheckboxHeader = wrapper.find("input[type='checkbox']").at(0); // find the table header checkbox
		tableCheckboxHeader.simulate("change", { target: { checked: false, id: "field_types2" } });
		// validate all rows checkboxes are true
		columnValues = renderedController.getPropertyValue(colPropertyId);
		expect(columnValues[0][2]).to.be.equal(false);
		expect(columnValues[1][2]).to.be.equal(false);
		expect(columnValues[2][2]).to.be.equal(false);
	});

});


describe("structuretable control handles updated data model", () => {
	let wrapper;
	let propController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		propController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("dynamically add a datamodel field and add it into the table", () => {
		// update the data model.
		const dm = propController.getDatasetMetadata();
		// Add field to the first schema
		const newFieldName = "Added Field " + (dm[0].fields.length);
		const newField = {
			"name": newFieldName,
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "discrete",
				"modeling_role": "target"
			}
		};
		dm[0].fields.push(newField);
		propController.setDatasetMetadata(dm[0]);


		// navigate to the summary panel
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(0); // Select Configure Sort Order
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const wideflyoutWrapper = new ReactWrapper(wfhtml, true);

		// open field picker and select the new data model field added by the action button
		const addFieldsButtons = wideflyoutWrapper.find("#field-picker-buttons-container Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker
		propertyUtils.fieldPicker(["Added Field 8"], ["Age", "Sex", "BP", "Cholesterol", "Na", "K", "Drug", "Ag", "Added Field 8"]);
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		wrapper.find("#properties-apply-button").simulate("click");

		// validate the new field is in the structure table and in the summary list.
		const tableValues = propController.getPropertyValue({ name: "structuretableReadonlyColumnStartValue" });
		expect(tableValues).to.have.length(2);
		expect(tableValues[1][0]).to.equal("Added Field 8");

	});
});
