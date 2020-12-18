/*
 * Copyright 2017-2020 Elyra Authors
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
import StructureListEditorControl from "../../../src/common-properties/controls/structurelisteditor";
import SubPanelButton from "../../../src/common-properties/panels/sub-panel/button.jsx";
import { mountWithIntl, shallowWithIntl } from "../../_utils_/intl-utils";
import { Provider } from "react-redux";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";

import structureListEditorParamDef from "../../test_resources/paramDefs/structurelisteditor_paramDef.json";


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

const mseControl = {
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
			"filterable": true,
			"visible": true,
			"width": 20,
			"editStyle": "inline"
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
			"sortable": true,
			"visible": true,
			"width": 20,
			"editStyle": "inline"
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
		"name",
		"text",
		"address"
	],
	"moveableRows": true,
	"rowSelection": "multiple-edit",
	"required": true
};


const propertyId = { name: "keys" };
const propertyIdNestedStructurelisteditorObject = { name: "nestedStructurelisteditor" };
const propertyIdNestedStructurelisteditorArrayArray = { name: "nestedStructuretable" };
const propertyIdNestedStructureeditor = { name: "nestedStructureeditorTable" };

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
		const wrapper = shallowWithIntl(
			<StructureListEditorControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				rightFlyout
			/>
		);
		expect(wrapper.dive().prop("control")).to.equal(control);
		expect(wrapper.dive().prop("controller")).to.equal(controller);
		expect(wrapper.dive().prop("propertyId")).to.equal(propertyId);
		expect(wrapper.dive().prop("buildUIItem")).to.equal(genUIItem);
	});

	it("should render a `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<StructureListEditorControl
					control={control}
					controller={controller}
					propertyId={propertyId}
					buildUIItem={genUIItem}
					rightFlyout
				/>
			</Provider>
		);
		expect(wrapper.find("div.properties-sle-wrapper")).to.have.length(1);
		const buttons = wrapper.find("div.properties-sle");
		expect(buttons).to.have.length(1);
		const tableContent = wrapper.find("div.properties-ft-control-container");
		expect(tableContent).to.have.length(1);
		// checks to see of readonly controls are rendered
		expect(tableContent.find("div.properties-readonly")).to.have.length(18); // 6 rows * 3 columns ( 1 readonly + 2 subpanel that are rendered as readonly)
	});


	it("should select add row button and new row should display", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<StructureListEditorControl
					control={control}
					controller={controller}
					propertyId={propertyId}
					buildUIItem={genUIItem}
					rightFlyout
				/>
			</Provider>
		);

		// select the add column button
		const addColumnButton = wrapper.find("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");

		// The table content should increase by 1
		const tableData = controller.getPropertyValue(propertyId);
		expect(tableData).to.have.length(7);

	});

	it("should select row and remove button row should be removed", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<StructureListEditorControl
					control={control}
					controller={controller}
					propertyId={propertyId}
					buildUIItem={genUIItem}
					rightFlyout
				/>
			</Provider>
		);

		// ensure the remove column button is disabled
		let removeColumnButton = wrapper.find("button.properties-remove-fields-button");
		expect(removeColumnButton.prop("disabled")).to.equal(true);

		// select the first row in the table
		const tableData = tableUtils.getTableRows(wrapper);
		expect(tableData).to.have.length(6);
		tableUtils.selectCheckboxes(wrapper, [0]);

		// ensure removed button is enabled and select it
		removeColumnButton = wrapper.find("button.properties-remove-fields-button");
		expect(removeColumnButton.prop("disabled")).to.equal(false);
		removeColumnButton.simulate("click");

		// validate the first row is deleted
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows).to.have.length(5);
		expect(tableRows[0][0]).to.equal("one");
	});

	it("should select multiple rows and see the select summary row", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<StructureListEditorControl
					control={mseControl}
					controller={controller}
					propertyId={propertyId}
					buildUIItem={genUIItem}
					rightFlyout
				/>
			</Provider>
		);

		// select the first row in the table
		const tableData = tableUtils.getTableRows(wrapper);
		expect(tableData).to.have.length(6);
		tableUtils.selectCheckboxes(wrapper, [0]);

		// verify that the select summary row is not present
		let selectedEditRow = wrapper.find("div.properties-at-selectedEditRows");
		expect(selectedEditRow).to.have.length(0);

		// multiple select the four row in the table
		tableUtils.selectCheckboxes(wrapper, [1, 2, 3, 4, 5]);

		// verify that the select summary row is present
		selectedEditRow = wrapper.find("div.properties-at-selectedEditRows");
		expect(selectedEditRow).to.have.length(1);
	});

});


/***********************/
/* rendering tests     */
/***********************/
describe("StructureListEditor render from paramdef", () => {
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

	it("hide not visible column but display on-panel container", () => {
		let summaryPanel = propertyUtils.openSummaryPanel(wrapper, "onPanelNotVisibleTable-summary-panel");
		const tableRows = tableUtils.getTableRows(summaryPanel);
		expect(tableRows).to.have.length(1);
		const expressionField = tableRows.at(0).find("td[data-label='condition']");
		expect(expressionField).to.have.length(0);
		// no rows are selected so should not see on panel container displayed
		let onPanelContainer = summaryPanel.find("div[data-id='properties-onPanelNotVisibleTable_0_2']");
		expect(onPanelContainer).to.have.length(0);
		// select the first row and not visible expression control column displays control below table
		tableUtils.clickTableRows(summaryPanel, [0]);
		summaryPanel = wrapper.find("div.properties-wf-content.show");
		onPanelContainer = summaryPanel.find("div[data-id='properties-onPanelNotVisibleTable_0_2']");
		expect(onPanelContainer).to.have.length(1);
	});

	it("Error messages should not change when adding rows", () => {
		let summaryPanel = propertyUtils.openSummaryPanel(wrapper, "inlineEditingTableError-summary-panel");
		const checkboxCell = summaryPanel.find("input[type='checkbox']").at(1);
		checkboxCell.getDOMNode().checked = false;
		checkboxCell.simulate("change");

		const errorMessage = {
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "checkbox cannot be off",
		};
		let actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(errorMessage).to.eql(actual);

		// add a row and the error message should still be there
		const addColumnButton = summaryPanel.find("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");

		actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(errorMessage).to.eql(actual);
		const messages = renderedController.getErrorMessages();
		const rowErrorMsg = { "0": { "3": { type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } } };
		expect(messages.inlineEditingTableError).to.eql(rowErrorMsg);

		// select the localhost row in the table
		tableUtils.clickTableRows(wrapper, [0]);

		// ensure removed button is enabled and select it
		summaryPanel = wrapper.find("div.properties-wf-content.show");
		const removeColumnButton = summaryPanel.find("button.properties-remove-fields-button");
		expect(removeColumnButton.prop("disabled")).to.equal(false);
		removeColumnButton.simulate("click");
	});
	it("Error messages should not change when deleting rows", () => {
		let summaryPanel = propertyUtils.openSummaryPanel(wrapper, "inlineEditingTableError-summary-panel");

		// add two rows to the table.
		const addColumnButton = summaryPanel.find("button.properties-add-fields-button");
		addColumnButton.simulate("click");
		summaryPanel = wrapper.find("div.properties-wf-content.show");
		let tableData = tableUtils.getTableRows(summaryPanel);
		expect(tableData).to.have.length(2);
		addColumnButton.simulate("click");
		summaryPanel = wrapper.find("div.properties-wf-content.show");
		tableData = tableUtils.getTableRows(summaryPanel);
		expect(tableData).to.have.length(3);

		// set the error in the last row
		const checkboxCell = summaryPanel.find("input[type='checkbox']").at(3);
		checkboxCell.getDOMNode().checked = false;
		checkboxCell.simulate("change");

		const errorMessage = {
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "checkbox cannot be off",
		};
		let actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(errorMessage).to.eql(actual);

		// remove the first row and ensure the error message is associated with the correct row.
		tableUtils.clickTableRows(summaryPanel, [0]);
		const removeColumnButton = summaryPanel.find("button.properties-remove-fields-button");
		removeColumnButton.simulate("click");

		const messages = renderedController.getErrorMessages();
		const rowErrorMsg = { "1": { "3": { type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } } };
		expect(messages.inlineEditingTableError).to.eql(rowErrorMsg);

		// remove the error row and ensure the error message is removed from the table.
		summaryPanel = wrapper.find("div.properties-wf-content.show");
		tableData = tableUtils.getTableRows(summaryPanel);
		expect(tableData).to.have.length(2);
		tableUtils.clickTableRows(summaryPanel, [1]);
		removeColumnButton.simulate("click");
		actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(actual).to.equal(null);
	});
	it("Error messages should not change when moving rows", () => {
		let summaryPanel = propertyUtils.openSummaryPanel(wrapper, "inlineEditingTableError-summary-panel");
		let tableData = tableUtils.getTableRows(summaryPanel);

		// add four rows to the table.
		const addColumnButton = summaryPanel.find("button.properties-add-fields-button");
		addColumnButton.simulate("click");
		summaryPanel = wrapper.find("div.properties-wf-content.show");
		tableData = tableUtils.getTableRows(summaryPanel);
		expect(tableData).to.have.length(2);
		addColumnButton.simulate("click");
		summaryPanel = wrapper.find("div.properties-wf-content.show");
		tableData = tableUtils.getTableRows(summaryPanel);
		expect(tableData).to.have.length(3);
		addColumnButton.simulate("click");
		summaryPanel = wrapper.find("div.properties-wf-content.show");
		tableData = tableUtils.getTableRows(summaryPanel);
		expect(tableData).to.have.length(4);
		addColumnButton.simulate("click");
		summaryPanel = wrapper.find("div.properties-wf-content.show");
		tableData = tableUtils.getTableRows(summaryPanel);
		expect(tableData).to.have.length(5);

		// set the checkbox error in the last row
		const checkboxCell = summaryPanel.find("input[type='checkbox']").last();
		checkboxCell.getDOMNode().checked = false;
		checkboxCell.simulate("change");
		let errorMessage = {
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "checkbox cannot be off",
		};
		let actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(errorMessage).to.eql(actual);

		// set the toggle text error in the first row.
		// the table error message a summary of of all cells in error.
		const toggleCell = summaryPanel.find("div.properties-toggletext button").at(0);
		toggleCell.simulate("click");
		errorMessage = {
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "There are 2 error cells. ",
		};

		actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(errorMessage).to.eql(actual);

		// select the first row and move it to the bottom and make sure the error messages stay aligned.
		tableUtils.clickTableRows(summaryPanel, [0]);
		summaryPanel = wrapper.find("div.properties-wf-content.show");
		const moveRowBottom = summaryPanel.find("button.table-row-move-button").at(3);
		moveRowBottom.simulate("click");
		let messages = renderedController.getErrorMessages();
		let rowErrorMsg = {
			"3": { "3": { type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } },
			"4": { "2": { type: "error", text: "order cannot be descending", validation_id: "tableerrortest2" } }
		};
		expect(messages.inlineEditingTableError).to.eql(rowErrorMsg);

		// select the second from the last row and move it to the top and make sure the error messages stay aligned.
		tableData = tableUtils.getTableRows(summaryPanel);
		expect(tableData).to.have.length(5);
		tableUtils.clickTableRows(summaryPanel, [3]);
		summaryPanel = wrapper.find("div.properties-wf-content.show");
		const moveRowTop = summaryPanel.find("button.table-row-move-button").at(0);
		moveRowTop.simulate("click");

		messages = renderedController.getErrorMessages();
		rowErrorMsg = {
			"0": { "3": { type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } },
			"4": { "2": { type: "error", text: "order cannot be descending", validation_id: "tableerrortest2" } }
		};
		expect(messages.inlineEditingTableError).to.eql(rowErrorMsg);
	});

	it("Multiple select edit should change values of selected rows", () => {

		let summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");

		// select the first row in the table

		let tableRows = tableUtils.getTableRows(summaryPanel);
		expect(tableRows).to.have.length(4);
		tableUtils.selectCheckboxes(summaryPanel, [0]);
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the select summary row is not present
		let selectedEditRow = summaryPanel.find("div.properties-at-selectedEditRows");
		expect(selectedEditRow).to.have.length(0);

		// multiple select the four row in the table
		tableUtils.selectCheckboxes(summaryPanel, [1, 2, 3]);
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the select summary row is present
		selectedEditRow = summaryPanel.find("div.properties-at-selectedEditRows");
		expect(selectedEditRow).to.have.length(1);

		// change a value in the select summary row.
		const selectedEditCells = selectedEditRow.find(".properties-table-cell-control");
		expect(selectedEditCells).to.have.length(3);
		const integerNumber = selectedEditCells.at(0).find("input");
		integerNumber.simulate("change", { target: { value: "44" } });

		// verify that the values have changed in the selected rows.
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");
		tableRows = tableUtils.getTableRows(summaryPanel);
		// need to add one to the row count because multiple rows are still selected
		// and the selectedSummaryRow is still rendered as the first row, so the tableRows
		// contains the selectedSummaryRow and the table data rows are indexed +1.
		expect(tableRows.at(1).find("input")
			.at(1)
			.prop("value")).to.equal(44);
		expect(tableRows.at(4).find("input")
			.at(1)
			.prop("value")).to.equal(44);

	});

});

describe("StructureListEditor renders correctly with nested controls", () => {
	let wrapper;
	let renderedController;

	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structureListEditorParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render a `structurelisteditor` control inside a structurelisteditor", () => {
		const summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		const table = summaryPanel.find("div[data-id='properties-ci-nestedStructurelisteditor']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructurelisteditorObject, { applyProperties: true });
		const expectedOriginal = structureListEditorParamDef.current_parameters.nestedStructurelisteditor;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit for main table
		let editButton = table.find(".properties-subpanel-button").at(0);
		editButton.simulate("click");

		// subPanel table
		let subPanelTable = wrapper.find("div[data-id='properties-ft-nested_structure']");
		expect(subPanelTable).to.have.length(1);
		const addValueBtn = subPanelTable.find("button.properties-add-fields-button");
		addValueBtn.simulate("click");

		// Verify new row added
		tableData = renderedController.getPropertyValue(propertyIdNestedStructurelisteditorObject, { applyProperties: true });
		let expected = [
			{
				"readonly_numbered_column_index": 1,
				"name": "Hello",
				"data_type": "string",
				"nested_structure": [
					{
						"nested_name": "hi",
						"nested_data_type": "number"
					}, {
						"nested_name": null,
						"nested_data_type": ""
					}
				]
			}
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// click on subpanel edit for nested table
		subPanelTable = wrapper.find("div[data-id='properties-ft-nested_structure']");
		editButton = subPanelTable.find("button.properties-subpanel-button");
		expect(editButton).to.have.length(2);
		editButton.at(1).simulate("click");

		// Modify value of the nested structure
		const nameInput = wrapper.find("div[data-id='properties-ci-nested_name']");
		nameInput.find("input").simulate("change", { target: { value: "world" } });

		// Verify modified values for second row
		tableData = renderedController.getPropertyValue(propertyIdNestedStructurelisteditorObject, { applyProperties: true });
		expected = [
			{
				"readonly_numbered_column_index": 1,
				"name": "Hello",
				"data_type": "string",
				"nested_structure": [
					{
						"nested_name": "hi",
						"nested_data_type": "number"
					}, {
						"nested_name": "world",
						"nested_data_type": null
					}
				]
			}
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});

	it("should render a `structuretable` control inside a structurelisteditor", () => {
		let summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		let table = summaryPanel.find("div[data-id='properties-ci-nestedStructuretable']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructurelisteditorArrayArray);
		const expectedOriginal = structureListEditorParamDef.current_parameters.nestedStructuretable;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// Add row to main table
		let addValueBtn = table.find("button.properties-add-fields-button");
		addValueBtn.simulate("click");

		// Verify new row added
		tableData = renderedController.getPropertyValue(propertyIdNestedStructurelisteditorArrayArray);
		let expected = [
			[
				1,
				"Hello",
				"string",
				[
					["Cholesterol", 1, "Ascending"]
				]
			],
			[
				2, null, "", []
			]
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// click on subpanel edit for main table
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		table = summaryPanel.find("div[data-id='properties-ft-nestedStructuretable']");
		const editButtons = table.find("button.properties-subpanel-button");
		expect(editButtons).to.have.length(2);
		editButtons.at(1).simulate("click"); // edit the second row

		// subPanel table
		const subPanelTable = wrapper.find("div[data-id='properties-ft-nestedStructuretableArrayArrays']");
		expect(subPanelTable).to.have.length(1);
		addValueBtn = subPanelTable.find("button.properties-add-fields-button");
		addValueBtn.simulate("click");
		addValueBtn.simulate("click"); // add two rows

		// Verify new rows added
		tableData = renderedController.getPropertyValue(propertyIdNestedStructurelisteditorArrayArray);
		expected = [
			[
				1,
				"Hello",
				"string",
				[
					["Cholesterol", 1, "Ascending"]
				]
			],
			[
				2,
				null,
				null,
				[
					["", 1, "Ascending"],
					["", 2, "Ascending"]
				]
			]
		];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});

	it("should render a `structureeditor` control inside a structurelisteditor", () => {
		let summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		let table = summaryPanel.find("div[data-id='properties-ci-nestedStructureeditorTable']");
		let actual = renderedController.getPropertyValue(propertyIdNestedStructureeditor);
		const expectedOriginal = structureListEditorParamDef.current_parameters.nestedStructureeditorTable;
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expectedOriginal));

		// Add row to main table
		const addValueBtn = table.find("button.properties-add-fields-button");
		addValueBtn.simulate("click");

		// Verify new row added
		actual = renderedController.getPropertyValue(propertyIdNestedStructureeditor);
		let expected = [
			[
				"name",
				23,
				[
					"address1", 90210, ["rental address"]
				]
			],
			[
				null, null, []
			]
		];
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));

		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		table = summaryPanel.find("div[data-id='properties-ft-nestedStructureeditorTable']");
		const tableRows = table.find("div[role='properties-data-row']");
		expect(tableRows).to.have.length(2);
		const secondRow = tableRows.at(1);

		// Edit second row values inline
		const nameInput = secondRow.find("div[data-id='properties-nestedStructureeditorTable_1_0']");
		nameInput.find("input").simulate("change", { target: { value: "second name" } });

		// click on subpanel edit for main table
		const editButton = secondRow.find("button.properties-subpanel-button");
		editButton.simulate("click"); // edit the second row

		// subPanel table
		const subPanelTable = wrapper.find("div[data-id='properties-ci-userInfo']");
		expect(subPanelTable).to.have.length(1);

		const addressInput = subPanelTable.find("div[data-id='properties-ci-userAddress']");
		addressInput.find("input").simulate("change", { target: { value: "new address for row 2" } });

		const zipInput = subPanelTable.find("div[data-id='properties-ctrl-userZip']");
		zipInput.find("input").simulate("change", { target: { value: 12345 } });

		const annotationInput = subPanelTable.find("div[data-id='properties-ci-annotation']");
		annotationInput.find("textarea").simulate("change", { target: { value: "fake address" } });

		// Verify new row added
		actual = renderedController.getPropertyValue(propertyIdNestedStructureeditor);
		expected = [
			[
				"name",
				23,
				[
					"address1", 90210, ["rental address"]
				]
			],
			[
				"second name", null, ["new address for row 2", 12345, ["fake address"]]
			]
		];
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
	});
});
