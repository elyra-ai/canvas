/*
 * Copyright 2017-2025 Elyra Authors
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
import { renderWithIntl } from "../../_utils_/intl-utils";
import { Provider } from "react-redux";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";

import structureListEditorParamDef from "../../test_resources/paramDefs/structurelisteditor_paramDef.json";
import { fireEvent, waitFor } from "@testing-library/react";

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

propertyUtilsRTL.setControls(controller, [control]);

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

const mockStructureListEditor = jest.fn();
jest.mock("../../../src/common-properties/controls/structurelisteditor",
	() => (props) => mockStructureListEditor(props)
);

mockStructureListEditor.mockImplementation((props) => {
	const StructureListEditorComp = jest.requireActual(
		"../../../src/common-properties/controls/structurelisteditor",
	).default;
	return <StructureListEditorComp {...props} />;
});

/***********************/
/* rendering tests     */
/***********************/
describe("StructureListEditorControl renders correctly", () => {

	it("props should have been defined", () => {
		setPropertyValue();
		renderWithIntl(
			<Provider store={controller.getStore()}>
				<StructureListEditorControl
					store={controller.getStore()}
					control={control}
					controller={controller}
					propertyId={propertyId}
					buildUIItem={genUIItem}
					rightFlyout
				/>
			</Provider>
		);

		expectJest(mockStructureListEditor).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
			"buildUIItem": genUIItem,
			"rightFlyout": true
		});
	});

	it("should render a `StructureListEditorControl`", () => {
		setPropertyValue();
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		expect(container.querySelectorAll("div.properties-sle-wrapper")).to.have.length(1);
		const buttons = container.querySelectorAll("div.properties-sle");
		expect(buttons).to.have.length(1);
		const tableContent = container.querySelectorAll("div.properties-ft-control-container");
		expect(tableContent).to.have.length(1);
		// checks to see of readonly controls are rendered
		expect(tableContent[0].querySelectorAll("div.properties-readonly")).to.have.length(18); // 6 rows * 3 columns ( 1 readonly + 2 subpanel that are rendered as readonly)
	});


	it("should select add row button and new row should display", () => {
		setPropertyValue();
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// select the add column button
		const addColumnButton = container.querySelectorAll("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		fireEvent.click(addColumnButton[0]);
		// The table content should increase by 1
		const tableData = controller.getPropertyValue(propertyId);
		expect(tableData).to.have.length(7);

	});

	it("should select row and click Delete button in table toolbar, row should be removed", () => {
		setPropertyValue();
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// ensure the table toolbar doesn't exist
		let tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(0);

		// select the first row in the table
		const tableData = tableUtilsRTL.getTableRows(container);
		expect(tableData).to.have.length(6);
		tableUtilsRTL.selectCheckboxes(container, [0]);

		// ensure table toolbar has Delete button and select it
		tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const deleteButton = tableToolbar[0].querySelector("button.properties-action-delete");
		fireEvent.click(deleteButton);

		// validate the first row is deleted
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows).to.have.length(5);
		expect(tableRows[0][0]).to.equal("one");
	});

	it("should select multiple rows and see the 'Edit' button in table toolbar", () => {
		setPropertyValue();
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// select the first row in the table
		const tableData = tableUtilsRTL.getTableRows(container);
		expect(tableData).to.have.length(6);
		tableUtilsRTL.selectCheckboxes(container, [0]);

		// verify that the table toolbar doesn't have Edit button
		let tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		let editButton = tableToolbar[0].querySelectorAll("button.properties-action-multi-select-edit");
		expect(editButton).to.have.length(0);

		// multiple select the four row in the table
		tableUtilsRTL.selectCheckboxes(container, [1, 2, 3, 4, 5]);

		// verify that the table toolbar has Edit button
		tableToolbar = container.querySelector("div.properties-table-toolbar");
		editButton = tableToolbar.querySelectorAll("button.properties-action-multi-select-edit");
		expect(editButton).to.have.length(1);
	});

});


/***********************/
/* rendering tests     */
/***********************/
describe("StructureListEditor render from paramdef", () => {
	var wrapper;
	var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureListEditorParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("hide not visible column but display on-panel container", () => {
		const { container } = wrapper;
		let summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "onPanelNotVisibleTable-summary-panel");
		const tableRows = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableRows).to.have.length(1);
		const expressionField = tableRows[0].querySelectorAll("td[data-label='condition']");
		expect(expressionField).to.have.length(0);
		// no rows are selected so should not see on panel container displayed
		let onPanelContainer = summaryPanel.querySelectorAll("div[data-id='properties-onPanelNotVisibleTable_0_2']");
		expect(onPanelContainer).to.have.length(0);
		// select the first row and not visible expression control column displays control below table
		tableUtilsRTL.clickTableRows(summaryPanel, [0]);
		summaryPanel = container.querySelector("div.properties-wf-content.show");
		onPanelContainer = summaryPanel.querySelectorAll("div[data-id='properties-onPanelNotVisibleTable_0_2']");
		expect(onPanelContainer).to.have.length(1);
	});

	it("Error messages should not change when adding rows", () => {
		const { container } = wrapper;
		const summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "inlineEditingTableError-summary-panel");
		const checkboxCell = summaryPanel.querySelectorAll("input[type='checkbox']")[1];
		checkboxCell.setAttribute("checked", false);
		fireEvent.click(checkboxCell);

		const errorMessage = {
			"propertyId": {
				"col": 3,
				"name": "inlineEditingTableError",
				"row": 0
			},
			"required": false,
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "checkbox cannot be off",
		};
		let actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(errorMessage).to.eql(actual);

		// add a row and the error message should still be there
		const addColumnButton = summaryPanel.querySelectorAll("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		fireEvent.click(addColumnButton[0]);

		actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(errorMessage).to.eql(actual);
		const messages = renderedController.getAllErrorMessages();
		const rowErrorMsg = { "0": { "3": { propertyId: {
			col: 3,
			name: "inlineEditingTableError",
			row: 0
		}, required: false, type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } } };
		expect(messages.inlineEditingTableError).to.eql(rowErrorMsg);

		// table has 2 rows
		expect(tableUtilsRTL.getTableRows(container)).to.have.length(2);

		// select the first row in the table
		tableUtilsRTL.selectCheckboxes(container, [0]);

		// ensure table toolbar has Delete button and select it
		const tableToolbar = container.querySelector("div.properties-table-toolbar");
		const deleteButton = tableToolbar.querySelectorAll("button.properties-action-delete");
		expect(deleteButton).to.have.length(1);
		fireEvent.click(deleteButton[0]);

		// verify row is deleted
		expect(tableUtilsRTL.getTableRows(container)).to.have.length(1);
	});
	it("Error messages should not change when deleting rows", () => {
		const { container } = wrapper;
		let summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "inlineEditingTableError-summary-panel");

		// add two rows to the table.
		const addColumnButton = summaryPanel.querySelector("button.properties-add-fields-button");
		fireEvent.click(addColumnButton);
		summaryPanel = container.querySelector("div.properties-wf-content.show");
		let tableData = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableData).to.have.length(2);
		fireEvent.click(addColumnButton);
		summaryPanel = container.querySelector("div.properties-wf-content.show");
		tableData = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableData).to.have.length(3);

		// set the error in the last row
		const checkboxCell = summaryPanel.querySelectorAll("input[type='checkbox']")[7];
		checkboxCell.setAttribute("checked", false);
		fireEvent.click(checkboxCell);

		const errorMessage = {
			"propertyId": {
				"col": 3,
				"name": "inlineEditingTableError",
				"row": 2
			},
			"required": false,
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "checkbox cannot be off",
		};
		let actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(errorMessage).to.eql(actual);

		// remove the first row and ensure the error message is associated with the correct row.
		tableUtilsRTL.selectCheckboxes(container, [0]);
		const tableToolbar = container.querySelector("div.properties-table-toolbar");
		let deleteButton = tableToolbar.querySelectorAll("button.properties-action-delete");
		fireEvent.click(deleteButton[0]);

		const messages = renderedController.getAllErrorMessages();
		const rowErrorMsg = { "1": { "3": { propertyId: {
			"col": 3,
			"name": "inlineEditingTableError",
			"row": 1
		}, required: false, type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } } };
		expect(messages.inlineEditingTableError).to.eql(rowErrorMsg);

		// remove the error row and ensure the error message is removed from the table.
		summaryPanel = container.querySelector("div.properties-wf-content.show");
		tableData = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableData).to.have.length(2);
		tableUtilsRTL.selectCheckboxes(container, [1]);
		deleteButton = container.querySelectorAll("button.properties-action-delete");
		fireEvent.click(deleteButton[0]);
		actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(actual).to.equal(null);
	});
	it("Error messages should not change when moving rows", () => {
		const { container } = wrapper;
		let summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "inlineEditingTableError-summary-panel");
		let tableData = tableUtilsRTL.getTableRows(summaryPanel);

		// add four rows to the table.
		const addColumnButton = summaryPanel.querySelector("button.properties-add-fields-button");
		fireEvent.click(addColumnButton);
		summaryPanel = container.querySelector("div.properties-wf-content.show");
		tableData = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableData).to.have.length(2);
		fireEvent.click(addColumnButton);
		summaryPanel = container.querySelector("div.properties-wf-content.show");
		tableData = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableData).to.have.length(3);
		fireEvent.click(addColumnButton);
		summaryPanel = container.querySelector("div.properties-wf-content.show");
		tableData = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableData).to.have.length(4);
		fireEvent.click(addColumnButton);
		summaryPanel = container.querySelector("div.properties-wf-content.show");
		tableData = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableData).to.have.length(5);

		// set the checkbox error in the last row
		const checkboxCells = summaryPanel.querySelectorAll("input[type='checkbox']");
		const checkboxCell = checkboxCells[checkboxCells.length - 1];
		checkboxCell.setAttribute("checked", false);
		fireEvent.click(checkboxCell);
		let errorMessage = {
			"propertyId": {
				"col": 3,
				"name": "inlineEditingTableError",
				"row": 4
			},
			"required": false,
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "checkbox cannot be off",
		};
		let actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(errorMessage).to.eql(actual);

		// set the toggle text error in the first row.
		// the table error message a summary of of all cells in error.
		const toggleCell = summaryPanel.querySelectorAll("div.properties-toggletext button")[0];
		fireEvent.click(toggleCell);
		errorMessage = {
			"propertyId": {
				"col": 3,
				"name": "inlineEditingTableError",
				"row": 4
			},
			"required": false,
			"validation_id": "tableerrortest3",
			"type": "error",
			"text": "There are 2 error cells. ",
		};

		actual = renderedController.getErrorMessage({ name: "inlineEditingTableError" });
		expect(errorMessage).to.eql(actual);

		// select the first row and move it to the bottom and make sure the error messages stay aligned.
		tableUtilsRTL.selectCheckboxes(summaryPanel, [0]);
		summaryPanel = container.querySelector("div.properties-wf-content.show");
		const moveRowBottom = container.querySelector("div.properties-table-toolbar").querySelector("button.table-row-move-bottom-button");
		fireEvent.click(moveRowBottom);
		let messages = renderedController.getAllErrorMessages();
		let rowErrorMsg = {
			"3": { "3": { propertyId: {
				col: 3,
				name: "inlineEditingTableError",
				row: 3
			}, required: false, type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } },
			"4": { "2": { propertyId: {
				col: 2,
				name: "inlineEditingTableError",
				row: 4
			}, required: false, type: "error", text: "order cannot be descending", validation_id: "tableerrortest2" } }
		};
		expect(messages.inlineEditingTableError).to.eql(rowErrorMsg);

		// Clear row selection
		const cancelButton = container.querySelector("div.properties-table-toolbar").querySelector("button.properties-action-cancel");
		fireEvent.click(cancelButton);

		// select the second from the last row and move it to the top and make sure the error messages stay aligned.
		tableData = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableData).to.have.length(5);
		tableUtilsRTL.selectCheckboxes(summaryPanel, [3]);
		summaryPanel = container.querySelector("div.properties-wf-content.show");
		const moveRowTop = container.querySelector("div.properties-table-toolbar").querySelector("button.table-row-move-top-button");
		fireEvent.click(moveRowTop);

		messages = renderedController.getAllErrorMessages();
		rowErrorMsg = {
			"0": { "3": {
				propertyId: {
					"col": 3,
					"name": "inlineEditingTableError",
					"row": 0
				}, required: false, type: "error", text: "checkbox cannot be off", validation_id: "tableerrortest3" } },
			"4": { "2": {
				propertyId: {
					"col": 2,
					"name": "inlineEditingTableError",
					"row": 4
				}, required: false, type: "error", text: "order cannot be descending", validation_id: "tableerrortest2" } }
		};
		expect(messages.inlineEditingTableError).to.eql(rowErrorMsg);
	});

	it("Multiple select edit should change values of selected rows", async() => {
		const { container } = wrapper;
		let summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");

		// select the first row in the table

		let tableRows = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableRows).to.have.length(4);
		tableUtilsRTL.selectCheckboxes(summaryPanel, [0]);
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the "Edit" button is not present in table toolbar
		let tableToolbar = container.querySelector("div.properties-table-toolbar");
		let multiSelectEditButton = tableToolbar.querySelectorAll("button.properties-action-multi-select-edit");
		expect(multiSelectEditButton).to.have.length(0);

		// multiple select four rows in the table
		tableUtilsRTL.selectCheckboxes(summaryPanel, [1, 2, 3]);
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the "Edit" button is present in table toolbar
		tableToolbar = container.querySelector("div.properties-table-toolbar");
		multiSelectEditButton = tableToolbar.querySelectorAll("button.properties-action-multi-select-edit");
		expect(multiSelectEditButton).to.have.length(1);

		// verify that the Edit button in selected rows is disabled
		const selectedRows = tableUtilsRTL.getTableRows(container);
		selectedRows.forEach((row) => {
			const checkbox = row.querySelector(".properties-vt-row-checkbox").querySelector("input");
			expect(checkbox.checked).to.equal(true);
			const editRowButton = row.querySelector("button.properties-subpanel-button");
			expect(editRowButton.disabled).to.equal(true);
		});

		// Click the multiSelectEditButton in table toolbar
		fireEvent.click(multiSelectEditButton[0]);

		// A new panel opens which shows editable columns
		const editableColumns = container.querySelector(".properties-editstyle-inline").querySelectorAll(".properties-ctrl-wrapper");
		expect(editableColumns).to.have.length(2); // Animals column has edit_style: "subpanel". Can't edit from selectedEditCells.

		// Set 44 for Integer field
		const integerNumber = editableColumns[0].querySelector("input");
		fireEvent.change(integerNumber, { target: { value: "44" } });

		// Save wide flyout
		fireEvent.click(container.querySelector(".properties-modal-buttons").querySelectorAll("button.properties-apply-button")[0]);


		// verify that the values have changed in the selected rows.
		await waitFor(() => {
			summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");
			tableRows = tableUtilsRTL.getTableRows(summaryPanel);
			expect(tableRows[0].querySelectorAll("input")[1].value).to.equal("44");
			expect(tableRows[3].querySelectorAll("input")[1].value).to.equal("44");
		});

	});

	it("Should render the default value set in the parameter for a structure with type 'object' when current_parameters is not set", () => {
		const defaultStructureObjectPropertyId = { name: "structurelisteditorDefaultObjectType" };
		const internalCurrentValues = renderedController.getPropertyValue(defaultStructureObjectPropertyId);
		const expectedInternalValues = [
			[1, "row1name", "row1desc", "string", "row1read"],
			[2, "row2name", "row2desc", "number", "row2read"],
			[3, "row3name", "row3desc", "boolean", "row3read"]];
		expect(JSON.stringify(internalCurrentValues)).to.equal(JSON.stringify(expectedInternalValues));

		const externalCurrentValues = renderedController.getPropertyValue(defaultStructureObjectPropertyId, { applyProperties: true });
		const parameter = propertyUtilsRTL.getParameterFromParamDef(defaultStructureObjectPropertyId.name, structureListEditorParamDef);
		expect(parameter).to.not.equal(null);
		const externalExpectedValues = parameter.default;
		expect(JSON.stringify(externalCurrentValues)).to.equal(JSON.stringify(externalExpectedValues));
	});

	it("should render empty table content when StructureListEditor is empty", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "structurelisteditorTableInput-summary-panel");
		let tableWrapper = container.querySelectorAll("div[data-id='properties-ctrl-structurelisteditorTableInput']");
		expect(tableWrapper).to.have.length(1);

		// Select all rows in configureTableInput
		fireEvent.click(tableWrapper[0].querySelector(".properties-vt-header-checkbox input"));
		tableWrapper = container.querySelector("div[data-id='properties-ctrl-structurelisteditorTableInput']");
		const rows = tableUtilsRTL.getTableRows(tableWrapper);
		const selectedRows = tableUtilsRTL.validateSelectedRowNumRows(rows);
		expect(selectedRows.length).to.equal(rows.length);

		// Remove all rows
		const deleteButton = container.querySelector("div.properties-table-toolbar").querySelector("button.properties-action-delete");
		fireEvent.click(deleteButton);
		tableWrapper = container.querySelector("div[data-id='properties-ctrl-structurelisteditorTableInput']");

		// Verify empty table content is rendered
		expect(tableWrapper.querySelectorAll("div.properties-empty-table")).to.have.length(1);
		expect(tableWrapper.querySelector("div.properties-empty-table span").textContent).to.be.equal("To begin, click \"Add value\"");
		expect(tableWrapper.querySelectorAll("button.properties-empty-table-button")).to.have.length(1);
		expect(tableWrapper.querySelector("button.properties-empty-table-button").textContent).to.be.equal("Add value");
	});
});

describe("StructureListEditor single select table renders and functions correctly", () => {
	let wrapper;

	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureListEditorParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	// Removed table toolbar from single select tables.
	it("Should not render table toolbar", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "inlineEditingTableWarning-summary-panel");
		tableUtilsRTL.clickTableRows(container, [0]);
		const tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(0);
	});

	// Testing delete icons for single select table
	it("should delete rows correctly", async() => {
		const { container } = wrapper;
		const summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "inlineEditingTableWarning-summary-panel");

		// Adding a row
		const addColumnButton = summaryPanel.querySelectorAll("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		fireEvent.click(addColumnButton[0]);

		expect(tableUtilsRTL.getTableRows(container)).to.have.length(2);

		// Testing delete row icon
		const deleteButtons = container.querySelectorAll(".delete-button");
		expect(deleteButtons).to.have.length(2);
		tableUtilsRTL.clickTableRows(container, [0]); // need to click on the table that we want to delete
		fireEvent.click(deleteButtons[0]);

		expect(tableUtilsRTL.getTableRows(container)).to.have.length(1);
	});
});

describe("StructureListEditor renders correctly with nested controls", () => {
	let wrapper;
	let renderedController;

	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureListEditorParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render a `structurelisteditor` control inside a structurelisteditor", () => {
		const { container } = wrapper;
		const summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		const table = summaryPanel.querySelector("div[data-id='properties-ci-nestedStructurelisteditor']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructurelisteditorObject, { applyProperties: true });
		const expectedOriginal = structureListEditorParamDef.current_parameters.nestedStructurelisteditor;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit for main table
		let editButton = table.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton);

		// subPanel table
		let subPanelTable = container.querySelectorAll("div[data-id='properties-ft-nested_structure']");
		expect(subPanelTable).to.have.length(1);
		const addValueBtn = subPanelTable[0].querySelector("button.properties-add-fields-button");
		fireEvent.click(addValueBtn);

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
		subPanelTable = container.querySelector("div[data-id='properties-ft-nested_structure']");
		editButton = subPanelTable.querySelectorAll("button.properties-subpanel-button");
		expect(editButton).to.have.length(2);
		fireEvent.click(editButton[1]);

		// Modify value of the nested structure
		const nameInput = container.querySelector("div[data-id='properties-ctrl-nested_name']");
		const input = nameInput.querySelector("input");
		fireEvent.change(input, { target: { value: "world" } });

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
		const { container } = wrapper;
		let summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		let table = summaryPanel.querySelector("div[data-id='properties-ci-nestedStructuretable']");
		let tableData = renderedController.getPropertyValue(propertyIdNestedStructurelisteditorArrayArray);
		const expectedOriginal = structureListEditorParamDef.current_parameters.nestedStructuretable;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// Add row to main table
		let addValueBtn = table.querySelector("button.properties-add-fields-button");
		fireEvent.click(addValueBtn);

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
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		table = summaryPanel.querySelector("div[data-id='properties-ft-nestedStructuretable']");
		const editButtons = table.querySelectorAll("button.properties-subpanel-button");
		expect(editButtons).to.have.length(2);
		fireEvent.click(editButtons[1]); // edit the second row

		// subPanel table - this is an empty table
		let subPanelTable = container.querySelectorAll("div[data-id='properties-ctrl-nestedStructuretableArrayArrays']");
		expect(subPanelTable).to.have.length(1);
		// select Add value button in empty subPanel table - this adds 1 row in the list
		const emptyTableButton = subPanelTable[0].querySelectorAll("button.properties-empty-table-button");
		expect(emptyTableButton).to.have.length(1);
		fireEvent.click(emptyTableButton[0]);

		subPanelTable = container.querySelector("div[data-id='properties-ctrl-nestedStructuretableArrayArrays']");
		addValueBtn = subPanelTable.querySelector("button.properties-add-fields-button");
		fireEvent.click(addValueBtn);

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
		const { container } = wrapper;
		let summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		let table = summaryPanel.querySelector("div[data-id='properties-ci-nestedStructureeditorTable']");
		let actual = renderedController.getPropertyValue(propertyIdNestedStructureeditor);
		const expectedOriginal = structureListEditorParamDef.current_parameters.nestedStructureeditorTable;
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expectedOriginal));

		// Add row to main table
		const addValueBtn = table.querySelector("button.properties-add-fields-button");
		fireEvent.click(addValueBtn);

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

		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		table = summaryPanel.querySelector("div[data-id='properties-ft-nestedStructureeditorTable']");
		const tableRows = table.querySelectorAll("div[data-role='properties-data-row']");
		expect(tableRows).to.have.length(2);
		const secondRow = tableRows[1];

		// Edit second row values inline
		const nameInput = secondRow.querySelector("div[data-id='properties-nestedStructureeditorTable_1_0']");
		fireEvent.change(nameInput.querySelector("input"), { target: { value: "second name" } });

		// click on subpanel edit for main table
		const editButton = secondRow.querySelector("button.properties-subpanel-button");
		fireEvent.click(editButton); // edit the second row

		// subPanel table
		const subPanelTable = container.querySelectorAll("div[data-id='properties-ci-userInfo']");
		expect(subPanelTable).to.have.length(1);

		const addressInput = subPanelTable[0].querySelector("div[data-id='properties-ctrl-userAddress']");
		fireEvent.change(addressInput.querySelector("input"), { target: { value: "new address for row 2" } });

		const zipInput = subPanelTable[0].querySelector("div[data-id='properties-ctrl-userZip']");
		fireEvent.change(zipInput.querySelector("input"), { target: { value: 12345 } });

		const annotationInput = subPanelTable[0].querySelector("div[data-id='properties-ctrl-annotation']");
		fireEvent.change(annotationInput.querySelector("textarea"), { target: { value: "fake address" } });

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

describe("structurelisteditor classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureListEditorParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("structurelisteditor should have custom classname defined", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "structurelisteditorTableInput-summary-panel");
		expect(wrapper.container.querySelectorAll(".structurelisteditor-control-class")).to.have.length(1);
	});

	it("structurelisteditor should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		const parent = wrapper.container.querySelectorAll(".nested-parent-structurelisteditor-control-class");
		expect(parent).to.have.length(1);
		expect(parent[0].querySelectorAll(".nested-child-cell-structurelisteditor-control-class")).to.have.length(1);
		// click on subpanel edit for first row
		const editButton = parent[0].querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton);
		expect(wrapper.container.querySelectorAll(".double-nested-subpanel-structurelisteditor-control-class")).to.have.length(1);
	});
});

describe("structurelisteditor columns resize correctly", () => {
	it("resize button should be available for specified columns", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureListEditorParamDef);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		// open the summary panel
		propertyUtilsRTL.openSummaryPanel(wrapper, "structurelisteditorResizableColumns-summary-panel");
		// Verify table content is rendered
		const tableWrapper = container.querySelectorAll("div[data-id='properties-ci-structurelisteditorResizableColumns']");
		expect(tableWrapper).to.have.length(1);

		const headerRow = tableWrapper[0].querySelectorAll("div[data-role='properties-header-row']");
		expect(headerRow).to.have.length(1);
		// Verify 2 columns in header are resizable
		expect(headerRow[0].querySelectorAll(".properties-vt-header-resize")).to.have.length(2);
		// Verify "integer Field" column can be resized
		const integerFieldColumn = tableWrapper[0].querySelector("div[aria-label='integer Field']");
		expect(integerFieldColumn.querySelectorAll(".properties-vt-header-resize")).to.have.length(1);
		// Verify "Animals" column can be resized
		const animalsColumn = tableWrapper[0].querySelector("div[aria-label='Animals']");
		expect(animalsColumn.querySelectorAll(".properties-vt-header-resize")).to.have.length(1);
	});
});
