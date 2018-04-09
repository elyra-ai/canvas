/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import StructureListEditorControl from "../../../src/common-properties/controls/structurelisteditor";
import SubPanelButton from "../../../src/common-properties/panels/sub-panel/button.jsx";
import { mountWithIntl } from "enzyme-react-intl";
import { ReactWrapper } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import isEqual from "lodash/isEqual";

import structureListEditorParamDef from "../../test_resources/paramDefs/structurelisteditor_paramDef.json";

const CONDITIONS_TEST_FORM_DATA = require("../../test_resources/json/conditions-test-formData.json");

const controller = new Controller();

const control = {
	"name": "keys",
	"label": {
		"text": "structurelisteditorList"
	},
	"controlType": "structurelisteditor",
	"valueDef": {
		"propType": "structure",
		"isList": true,
		"isMap": false,
		"defaultValue": []
	},
	"addRemoveRows": true,
	"subControls": [
		{
			"name": "name",
			"label": {
				"text": "Name"
			},
			"controlType": "textfield",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false
			},
			"role": "new_column",
			"filterable": true,
			"visible": true,
			"width": 20,
			"editStyle": "subpanel"
		},
		{
			"name": "description",
			"label": {
				"text": "Description"
			},
			"controlType": "textfield",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false
			},
			"role": "new_column",
			"sortable": true,
			"visible": true,
			"width": 20,
			"editStyle": "subpanel"
		},
		{
			"name": "readonly",
			"label": {
				"text": "ReadOnly"
			},
			"controlType": "readonly",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false
			},
			"visible": true,
			"width": 20,
			"editStyle": "inline"
		}
	],
	"keyIndex": -1,
	"defaultRow": [
		null,
		null
	],
	"childItem": {
		"itemType": "additionalLink",
		"panel": {
			"id": "structurelisteditorListInput",
			"panelType": "general",
			"uiItems": [
				{
					"itemType": "control",
					"control": {
						"name": "name",
						"label": {
							"text": "Name"
						},
						"controlType": "textfield",
						"valueDef": {
							"propType": "string",
							"isList": false,
							"isMap": false
						},
						"filterable": true
					}
				},
				{
					"itemType": "control",
					"control": {
						"name": "description",
						"label": {
							"text": "Description"
						},
						"controlType": "textfield",
						"valueDef": {
							"propType": "string",
							"isList": false,
							"isMap": false
						},
						"sortable": true
					}
				}
			]
		},
		"text": "...",
		"secondaryText": "structurelisteditorListInput"
	},
	"moveableRows": true,
	"required": true
};

const propertyId = { name: "keys" };

propertyUtils.setControls(controller, [control]);

function setPropertyValue() {
	controller.setPropertyValues(
		{ "keys": [
			["Hello", "World", "Hello World"],
			["one", "two", "one or two"],
			["apple", "orange", "apple or orange"],
			["ford", "honda", "for or honda"],
			["BP", "Ascending", "BP ascending"],
			["Cholesterol", "Ascending", "Cholesterol Ascending"]
		] }
	);
}

function genUIItem() {
	const key = "panel.___structurelisteditorList_";
	const label = "...";
	const title = "sub-panel-button.___structurelisteditorList_";
	const subPanel = (<div id={key}
		className="control-panel"
		key={key}
	/>);

	const panel = (<SubPanelButton id={"sub-panel-button.___structurelisteditorList_"}
		label={label}
		title={title}
		panel={subPanel}
		controller={controller}
	/>);
	return (<SubPanelButton id={"sub-panel-button.___structurelisteditorList_"}
		label={label}
		title={title}
		panel={panel}
		controller={controller}
	/>);
}

/***********************/
/* rendering tests     */
/***********************/
describe("StructureListEditorControl renders correctly", () => {

	it("props should have been defined", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				rightFlyout
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("buildUIItem")).to.equal(genUIItem);
	});

	it("should render a `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				rightFlyout
			/>
		);

		expect(wrapper.find("#structure-table")).to.have.length(1);
		const buttons = wrapper.find("#structure-list-editor-table-buttons");
		expect(buttons).to.have.length(1);
		const tableContent = wrapper.find(".structure-table-content-row");
		expect(tableContent).to.have.length(1);
		expect(tableContent.find("#table-row-move-button-container")).to.have.length(1);
		expect(tableContent.find(".table-row-move-button[disabled=true]")).to.have.length(4);
		// checks to see of readonly controls are rendered
		expect(tableContent.find(".readonly-control")).to.have.length(6);
	});

	it("should select no rows and all move buttons disabled `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
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
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
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
			.text()).to.equal("one");
		expect(tableData.at(1).children()
			.at(0)
			.text()).to.equal("Hello");
	});

	it("should select top row and move down to bottom row", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
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
			.text()).to.equal("one");
		expect(tableData.at(5).children()
			.at(0)
			.text()).to.equal("Hello");
	});

	it("should select bottom row and move up one row", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
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
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
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

	it("should select top row and correct move buttons enabled `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
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
		expect(buttonContainer.find(".table-row-move-button[disabled=true]")).to.have.length(2);
		expect(buttonContainer.find(".table-row-move-button[disabled=false]")).to.have.length(2);
	});

	it("should select bottom row and correct move buttons enabled `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
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

	it("should select middle row and all move buttons enabled `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
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

	it("should select add row button and new row should display", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				rightFlyout
			/>
		);

		// select the add column button
		const addColumnButton = wrapper.find("#add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");

		// The table content should increase by 1
		const tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		const tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(7);

	});

	it("should select row and remove button row should be removed", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				rightFlyout
			/>
		);

		// ensure the remove column button is disabled
		const removeColumnButton = wrapper.find(".remove-fields-button");
		expect(removeColumnButton.prop("disabled")).to.equal(true);

		// select the first row in the table
		var tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		var tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.at(0).simulate("click");

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
			.text()).to.equal("one");
	});

	it("should search correct keyword in table", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				rightFlyout
			/>
		);
		const input = wrapper.find("#flexible-table-search");
		input.simulate("change", { target: { value: "one" } });
		expect(wrapper.find(".table-row")).to.have.length(1);
		input.simulate("change", { target: { value: "ONE" } });
		expect(wrapper.find(".table-row")).to.have.length(1);

	});
});

/***********************/
/* error checking tests*/
/***********************/
describe("condition messages renders correctly with structurelisteditor table", () => {
	it("structurelisteditor control should have error message when notEquals []", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);
		const conditionsPropertyId = { name: "structurelisteditorTableInput" };
		const input = wrapper.find("#editor-control-structurelisteditorTableInput");
		expect(input).to.have.length(1);
		expect(controller.getPropertyValue(conditionsPropertyId)).to.have.length(1);

		expect(wrapper.find(".validation-warning-message-icon-structure-list-editor")).to.have.length(0);
		expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(0);
		// const dataRows = input.find(".public_fixedDataTable_bodyRow");
		const dataRows = input.find(".table-row");
		expect(dataRows).to.have.length(1);
		dataRows.first().simulate("click");
		const removeRowButton = input.find(".remove-fields-button");
		expect(removeRowButton).to.have.length(1);

		removeRowButton.simulate("click");
		expect(controller.getPropertyValue(conditionsPropertyId)).to.have.length(0);
		wrapper.update();

		expect(wrapper.find(".validation-warning-message-icon-structure-list-editor")).to.have.length(1);
		expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(1);
	});
});

/***********************/
/* rendering tests     */
/***********************/
describe("should render table using CommonProperties element", () => {
	var wrapper;
	// var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structureListEditorParamDef);
		wrapper = renderedObject.wrapper;
		// renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("table does not render with add-remove buttons", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(2); // Summary link Configure Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementById("flexible-table-inlineEditingTableNoButtons"); // needed since modal dialogs are outside `wrapper`
		const noButtonTable = new ReactWrapper(tableHtml, true);
		const addButtons = noButtonTable.find("#field-picker-buttons-container");
		expect(addButtons).to.have.length(0);
	});
	it("only allow integer values in integer numberfield cell", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(1); // Summary link Configure No Add Buttons Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementById("flexible-table-inlineEditingTable"); // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		const integerCell = inlineEditTable.find("#editor-control-valueName_0");
		expect(integerCell).to.have.length(1);
		expect(integerCell.prop("value")).to.equal("1");
		// enter a valid integer
		integerCell.simulate("change", { target: { value: "2" } });
		expect(integerCell.prop("value")).to.equal("2");

		// enter an invalid integer
		integerCell.simulate("change", { target: { value: "2.3" } });
		expect(integerCell.prop("value")).to.equal("2");
	});
	it("only allow double values in double numberfield cell", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(1); // Summary link Configure Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementById("flexible-table-inlineEditingTable"); // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		const doubleCell = inlineEditTable.find("#editor-control-doubleName_0");
		expect(doubleCell).to.have.length(1);
		expect(doubleCell.prop("value")).to.equal("1.234");

		// enter a valid double integer
		doubleCell.simulate("change", { target: { value: "2.3" } });
		expect(doubleCell.prop("value")).to.equal("2.3");
	});
	it("hide not visible column but display on-panel container", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(3); // Summary link Configure on-Panel Not Visible
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const modalWrapper = new ReactWrapper(tableHtml, true);
		const onPanelTable = modalWrapper.find("#flexible-table-onPanelNotVisibleTable");
		const tableRows = onPanelTable.find(".reactable-data").find("tr");
		expect(tableRows).to.have.length(1);
		const expressionField = tableRows.at(0).find("td[label='condition']");
		expect(expressionField).to.have.length(0);
		// no rows are selected so should not see on panel container displayed
		let onPanelContainer = modalWrapper.find("#ExpressionEditor-onPanelNotVisibleTable_0_2");
		expect(onPanelContainer).to.have.length(0);
		// select the first row and not visible expression control column displays control below table
		tableRows.at(0).simulate("click");
		onPanelContainer = modalWrapper.find("#ExpressionEditor-onPanelNotVisibleTable_0_2");
		expect(onPanelContainer).to.have.length(1);
	});
});

/***********************/
/* error checking tests*/
/***********************/
describe("should render table with error checking using CommonProperties element", () => {
	var wrapper;
	var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structureListEditorParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("warning message generated when editing numberfield cell", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(4); // Summary link Configure Warning Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		const integerCell = inlineEditTable.find("#editor-control-valueName_0");
		expect(integerCell).to.have.length(1);
		expect(integerCell.prop("value")).to.equal("1");
		// enter a valid integer
		integerCell.simulate("change", { target: { value: "3" } });
		expect(integerCell.prop("value")).to.equal("3");
		wrapper.update();

		const errorMessage = {
			"validation_id": "tablewarningtest2",
			"type": "warning",
			"text": "field1 should not equal 3",
		};
		const actual = renderedController.getErrorMessage({ name: "inlineEditingTableWarning" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--warning")).to.have.length(1);
	});

	it("error message generated on OR condition when editing numberfield cell", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(6); // Summary link Configure Error 2 Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		const doubleCell = inlineEditTable.find("#editor-control-doubleName_0");
		expect(doubleCell).to.have.length(1);
		expect(doubleCell.prop("value")).to.equal("1.234");

		// enter a valid double integer
		doubleCell.simulate("change", { target: { value: "2.3" } });
		expect(doubleCell.prop("value")).to.equal("2.3");
		wrapper.update();

		const errorMessage = {
			"validation_id": "tableerror2test1",
			"type": "error",
			"text": "fields are 2 or 2.3",
		};
		const actual = renderedController.getErrorMessage({ name: "inlineEditingTableError2" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(1);
	});

	it("error message generated on AND condition when editing numberfield cell", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(5); // Summary link Configure Error Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		const doubleCell = inlineEditTable.find("#editor-control-doubleName_0");
		expect(doubleCell).to.have.length(1);
		expect(doubleCell.prop("value")).to.equal("1.234");
		const integerCell = inlineEditTable.find("#editor-control-valueName_0");
		expect(integerCell).to.have.length(1);
		expect(integerCell.prop("value")).to.equal("1");
		// enter a valid integer
		integerCell.simulate("change", { target: { value: "2" } });
		expect(integerCell.prop("value")).to.equal("2");

		// enter a valid double integer
		doubleCell.simulate("change", { target: { value: "2.3" } });
		expect(doubleCell.prop("value")).to.equal("2.3");
		wrapper.update();

		const errorMessage = {
			"validation_id": "tableerrortest1",
			"type": "error",
			"text": "fields are 2 and 2.3",
		};
		const actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(1);
	});
	it("error message generated on when editing toggletext cell", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(5); // Summary link Configure Error Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		const toggleCell = inlineEditTable.find(".toggletext_icon");
		toggleCell.simulate("click");
		expect(inlineEditTable.find(".toggletext_text").text()).to.equal("Descending");

		const errorMessage = {
			"validation_id": "tableerrortest2",
			"type": "error",
			"text": "order cannot be descending",
		};
		const actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(1);
	});
	it("error message generated on when editing checkbox cell", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(5); // Summary link Configure Error Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		const checkboxCell = inlineEditTable.find("input[type='checkbox']").at(1);
		checkboxCell.simulate("change", { target: { checked: false, id: "string" } });

		const errorMessage = {
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "checkbox cannot be off",
		};
		const actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(1);
	});
	it("error message generated on when editing oneofselect cell", () => {
		const expectedOptions = [
			{ label: "dog", value: "dog" },
			{ label: "cat", value: "cat" },
			{ label: "pig", value: "pig" },
			{ label: "horse", value: "horse" }
		];
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(6); // Summary link Configure Error 2 Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		const newValue = { label: "horse", value: "horse" };
		propertyUtils.dropDown(inlineEditTable, 0, newValue, expectedOptions);


		const errorMessage = {
			"validation_id": "tableerror2test3",
			"type": "error",
			"text": "animal equals horse",
		};
		const actual = renderedController.getErrorMessage({ name: "inlineEditingTableError2" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(1);
	});
	it("error message generated on when editing textfield cell", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(6); // Summary link Configure Error 2 Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		const textfieldCell = inlineEditTable.find("input[type='text']");
		textfieldCell.simulate("change", { target: { value: "pear" } });
		expect(textfieldCell.prop("value")).to.equal("pear");

		const errorMessage = {
			"validation_id": "tableerror2test4",
			"type": "error",
			"text": "fruit equals pear",
		};
		const actual = renderedController.getErrorMessage({ name: "inlineEditingTableError2" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(1);
	});
	it("Error messages should not change when adding rows", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(5); // Summary link Configure Error Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		const checkboxCell = inlineEditTable.find("input[type='checkbox']").at(1);
		checkboxCell.simulate("change", { target: { checked: false, id: "string" } });

		const errorMessage = {
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "checkbox cannot be off",
		};
		let actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(1);

		// add a row and the error message should still be there
		const addColumnButton = inlineEditTable.find("#add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");
		const tableData = inlineEditTable.find(".reactable-data").children();
		expect(tableData).to.have.length(2);

		actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(1);
		const messages = renderedController.getErrorMessages();
		const rowErrorMsg = { "0": { "3": { type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } } };
		expect(isEqual(JSON.parse(JSON.stringify(messages.inlineEditingTableError)),
			JSON.parse(JSON.stringify(rowErrorMsg)))).to.be.true;

		// remove the added row
		tableData.at(1).simulate("click");
		const enabledRemoveColumnButton = inlineEditTable.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		enabledRemoveColumnButton.simulate("click");


	});
	it("Error messages should not change when deleting rows", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(5); // Summary link Configure Error Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		let tableData = inlineEditTable.find(".reactable-data").children();

		// add two rows to the table.
		const addColumnButton = inlineEditTable.find("#add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");
		tableData = inlineEditTable.find(".reactable-data").children();
		expect(tableData).to.have.length(2);
		addColumnButton.simulate("click");
		tableData = inlineEditTable.find(".reactable-data").children();
		expect(tableData).to.have.length(3);

		// set the error in the last row
		const checkboxCell = inlineEditTable.find("input[type='checkbox']").at(3);
		checkboxCell.simulate("change", { target: { checked: false, id: "string" } });

		const errorMessage = {
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "checkbox cannot be off",
		};
		let actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(1);

		// remove the first row and ensure the error message is associated with the correct row.
		tableData.at(0).simulate("click");
		let enabledRemoveColumnButton = inlineEditTable.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		enabledRemoveColumnButton.simulate("click");
		const messages = renderedController.getErrorMessages();
		const rowErrorMsg = { "1": { "3": { type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } } };
		expect(isEqual(JSON.parse(JSON.stringify(messages.inlineEditingTableError)),
			JSON.parse(JSON.stringify(rowErrorMsg)))).to.be.true;

		// remove the error row and ensure the error message is removed from the table.
		tableData = inlineEditTable.find(".reactable-data").children();
		expect(tableData).to.have.length(2);
		tableData.at(1).simulate("click");
		enabledRemoveColumnButton = inlineEditTable.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		enabledRemoveColumnButton.simulate("click");
		actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(actual).to.equal(null);
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(0);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(0);

	});
	it("Error messages should not change when moving rows", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(5); // Summary link Configure Error Inline Editing Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const inlineEditTable = new ReactWrapper(tableHtml, true);
		let tableData = inlineEditTable.find(".reactable-data").children();

		// add four rows to the table.
		const addColumnButton = inlineEditTable.find("#add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");
		tableData = inlineEditTable.find(".reactable-data").children();
		expect(tableData).to.have.length(2);
		addColumnButton.simulate("click");
		tableData = inlineEditTable.find(".reactable-data").children();
		expect(tableData).to.have.length(3);
		addColumnButton.simulate("click");
		tableData = inlineEditTable.find(".reactable-data").children();
		expect(tableData).to.have.length(4);
		addColumnButton.simulate("click");
		tableData = inlineEditTable.find(".reactable-data").children();
		expect(tableData).to.have.length(5);


		// set the checkbox error in the last row
		const checkboxCell = inlineEditTable.find("input[type='checkbox']").last();
		checkboxCell.simulate("change", { target: { checked: false, id: "string" } });
		let errorMessage = {
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "checkbox cannot be off",
		};
		let actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(1);

		// set the toggle text error in the first row.
		// the table error message is always the error from the lowest row.
		const toggleCell = inlineEditTable.find(".toggletext_icon").at(0);
		toggleCell.simulate("click");
		expect(inlineEditTable.find(".toggletext_text").at(0)
			.text()).to.equal("Descending");
		errorMessage = {
			"validation_id": "tableerrortest2",
			"type": "error",
			"text": "order cannot be descending",
		};
		actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(isEqual(JSON.parse(JSON.stringify(errorMessage)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(inlineEditTable.find(".validation-error-message-icon")).to.have.length(1);
		expect(inlineEditTable.find(".form__validation--error")).to.have.length(1);

		// select the first row and move it to the bottom and make sure the error messages stay aligned.
		tableData.at(0).simulate("click");
		const moveRowBottom = inlineEditTable.find(".table-row-move-button").at(3);
		moveRowBottom.simulate("click");
		let messages = renderedController.getErrorMessages();
		let rowErrorMsg = {
			"3": { "3": { type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } },
			"4": { "2": { type: "error", text: "order cannot be descending", validation_id: "tableerrortest2" } }
		};
		// console.log(messages.inlineEditingTableError);
		expect(isEqual(JSON.parse(JSON.stringify(messages.inlineEditingTableError)),
			JSON.parse(JSON.stringify(rowErrorMsg)))).to.be.true;


		// select the second from the last row and move it to the top and make sure the error messages stay aligned.
		tableData = inlineEditTable.find(".reactable-data").children();
		expect(tableData).to.have.length(5);
		tableData.at(3).simulate("click");
		const moveRowTop = inlineEditTable.find(".table-row-move-button").at(0);
		moveRowTop.simulate("click");

		messages = renderedController.getErrorMessages();
		rowErrorMsg = {
			"0": { "3": { type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } },
			"4": { "2": { type: "error", text: "order cannot be descending", validation_id: "tableerrortest2" } }
		};
		// console.log(messages.inlineEditingTableError);
		expect(isEqual(JSON.parse(JSON.stringify(messages.inlineEditingTableError)),
			JSON.parse(JSON.stringify(rowErrorMsg)))).to.be.true;
	});
});
