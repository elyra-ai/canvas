/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import StructureListEditorControl from "../../../src/common-properties/editor-controls/structure-list-editor-control.jsx";
import SubPanelButton from "../../../src/common-properties/editor-panels/sub-panel-button.jsx";
import { render, mount } from "enzyme";
import { expect } from "chai";

import Controller from "../../../src/common-properties/properties-controller";

const controller = new Controller();

const control = {
	"name": "structurelisteditorList",
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
	"separateLabel": true,
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
						"filterable": true,
						"separateLabel": true
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
						"sortable": true,
						"separateLabel": true
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

function setPropertyValue() {
	controller.setPropertyValues(
		{ "keys": [
			["Hello", "World"],
			["one", "two"],
			["apple", "orange"],
			["ford", "honda"],
			["BP", "Ascending"],
			["Cholesterol", "Ascending"]
		] }
	);
}

function getSelectedRows(controlName) {
	return [];
}

function getSelectedRowsTop(controlName) {
	return [0];
}

function getSelectedRowsBottom(controlName) {
	return [5];
}

function getSelectedRowsMiddle(controlName) {
	return [2];
}

function updateSelectedRows(row) {
	return [];
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
	/>);
	return (<SubPanelButton id={"sub-panel-button.___structurelisteditorList_"}
		label={label}
		title={title}
		panel={panel}
	/>);
}


describe("StructureListEditorControl renders correctly", () => {

	it("props should have been defined", () => {
		setPropertyValue();
		const selectedRows = getSelectedRows();
		const wrapper = mount(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={selectedRows}
				buildUIItem={genUIItem}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("selectedRows")).to.equal(selectedRows);
		expect(wrapper.prop("buildUIItem")).to.equal(genUIItem);
	});

	it("should render a `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = render(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows()}
				buildUIItem={genUIItem}
			/>
		);

		expect(wrapper.find("#structure-table")).to.have.length(1);
		const buttons = wrapper.find("#structure-list-editor-table-buttons");
		expect(buttons).to.have.length(1);
		const tableContent = wrapper.find(".structure-table-content-row");
		expect(tableContent).to.have.length(1);
		expect(tableContent.find("#table-row-move-button-container")).to.have.length(1);
		expect(tableContent.find(".table-row-move-button-disable")).to.have.length(4);
	});

	it("should select no rows and all move buttons disabled `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows()}
				buildUIItem={genUIItem}
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
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop()}
				buildUIItem={genUIItem}
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
			.text()).to.equal("one");
		expect(tableData.at(1).children()
			.at(0)
			.text()).to.equal("Hello");
	});

	it("should select top row and move down to bottom row", () => {
		setPropertyValue();
		const wrapper = mount(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop()}
				buildUIItem={genUIItem}
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
			.text()).to.equal("one");
		expect(tableData.at(5).children()
			.at(0)
			.text()).to.equal("Hello");
	});

	it("should select bottom row and move up one row", () => {
		setPropertyValue();
		const wrapper = mount(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsBottom()}
				buildUIItem={genUIItem}
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
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsBottom()}
				buildUIItem={genUIItem}
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

	it("should select top row and correct move buttons enabled `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop()}
				buildUIItem={genUIItem}
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

	it("should select bottom row and correct move buttons enabled `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsBottom()}
				buildUIItem={genUIItem}
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

	it("should select middle row and all move buttons enabled `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsMiddle()}
				buildUIItem={genUIItem}
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

	it("should select add row button and new row should display", () => {
		setPropertyValue();
		const wrapper = mount(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop()}
				buildUIItem={genUIItem}
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
		const wrapper = mount(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop()}
				buildUIItem={genUIItem}
			/>
		);

		// ensure the remove column button is disabled
		const removeColumnButton = wrapper.find("#remove-fields-button-disabled");
		expect(removeColumnButton).to.have.length(1);

		// select the first row in the table
		var tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		var tableData = tableBody.find(".reactable-data").children();
		expect(tableData).to.have.length(6);
		tableData.at(2).simulate("click");

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
			.text()).to.equal("one");
	});

	it("should search correct keyword in table", () => {
		setPropertyValue();
		const wrapper = mount(
			<StructureListEditorControl
				control={control}
				controller={controller}
				propertyId={propertyId}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRowsTop()}
				buildUIItem={genUIItem}
			/>
		);
		const input = wrapper.find("#flexible-table-search");
		input.simulate("change", { target: { value: "one" } });
		expect(wrapper.find(".table-row")).to.have.length(1);
		input.simulate("change", { target: { value: "ONE" } });
		expect(wrapper.find(".table-row")).to.have.length(1);

	});
});
