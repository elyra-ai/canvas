/*
 * Copyright 2024 Elyra Authors
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
import TableToolbar from "../../../src/common-properties/components/table-toolbar";
import { mountWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";
import sinon from "sinon";
import Controller from "../../../src/common-properties/properties-controller";
import { STATES } from "../../../src/common-properties/constants/constants";
import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "../../_utils_/table-utils";
import structureListEditorParamDef from "../../test_resources/paramDefs/structurelisteditor_paramDef.json";

const removeSelectedRows = sinon.spy();
const setScrollToRow = sinon.spy();
const handleRowClick = sinon.spy();

const controller = new Controller();
const propertyId = { name: "test-tabletoolbar" };
const multiSelectEditRowPropertyId = { name: `table-multi-select-edit-property-${propertyId.name}` };

const controlValue = [
	["Na", "Ascending"],
	["Age", "Descending"],
	["Sex", "Descending"],
	["Gender", "Ascending"],
	["Occupation", "Descending"],
	["Address", "Descending"]
];

const rows = [
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Na" },
			{ column: "sortOrder", content: "Ascending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Age" },
			{ column: "sortOrder", content: "Descending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Sex" },
			{ column: "sortOrder", content: "Descending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Gender" },
			{ column: "sortOrder", content: "Ascending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Occupation" },
			{ column: "sortOrder", content: "Descending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Address" },
			{ column: "sortOrder", content: "Descending" }
		]
	}
];

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}

function setCurrentControlValueSelected(inControlValue, inSelectedRows) {
	controller.updatePropertyValue(propertyId, getCopy(inControlValue));
	controller.updateSelectedRows(propertyId, inSelectedRows);
}

function setControlValues(selection) {
	controller.updatePropertyValue(propertyId, getCopy(controlValue));
	controller.updateSelectedRows(propertyId, selection);
}

describe("TableToolbar renderes correctly", () => {
	it("props should have been defined", () => {
		setControlValues([0, 1]);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={controller.getSelectedRows()}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				rightFlyout
				tableState={STATES.ENABLED}
				addRemoveRows
				moveableRows
				multiSelectEdit
				multiSelectEditRowPropertyId={multiSelectEditRowPropertyId}
			/>
		);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("selectedRows")).to.eql(controller.getSelectedRows());
		expect(wrapper.prop("removeSelectedRows")).to.equal(removeSelectedRows);
		expect(wrapper.prop("setScrollToRow")).to.equal(setScrollToRow);
		expect(wrapper.prop("setCurrentControlValueSelected")).to.equal(setCurrentControlValueSelected);
		expect(wrapper.prop("rightFlyout")).to.equal(true);
		expect(wrapper.prop("tableState")).to.equal(STATES.ENABLED);
		expect(wrapper.prop("addRemoveRows")).to.equal(true);
		expect(wrapper.prop("moveableRows")).to.equal(true);
		expect(wrapper.prop("multiSelectEdit")).to.equal(true);
		expect(wrapper.prop("multiSelectEditRowPropertyId")).to.equal(multiSelectEditRowPropertyId);
	});

	it("when no rows are selected, table toolbar doesn't exist", () => {
		const rowselections = [];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>);
		// validate table toolbar doesn't exist
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(0);
	});

	it("when 1+ rows are selected, table toolbar exists", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>);
		// validate table toolbar exists
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
	});

	it("Cancel button clears row selection", () => {
		const rowselections = [0, 1];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate table toolbar exists
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		// validate 2 rows are selected
		expect(controller.getSelectedRows(propertyId)).to.eql(rowselections);

		// Click on Cancel button in toolbar
		const cancelButton = tableToolbar.find("button.properties-action-cancel");
		cancelButton.simulate("click");

		// validate row selection is cleared
		expect(controller.getSelectedRows(propertyId)).to.eql([]);
	});

	it("should show Delete button when addRemoveRows: true", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				addRemoveRows
			/>
		);
		// validate the Delete buttons exists in the table toolbar
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const deleteButton = tableToolbar.find("button.properties-action-delete");
		expect(deleteButton).to.have.length(1);
	});

	it("should NOT show Delete button when addRemoveRows: false", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				addRemoveRows={false}
				moveableRows
			/>
		);
		// validate the Delete buttons exists in the table toolbar
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const deleteButton = tableToolbar.find("button.properties-action-delete");
		expect(deleteButton).to.have.length(0);
	});

	it("Delete button calls removeSelectedRows function from the props", () => {
		const rowselections = [0, 1];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				addRemoveRows
			/>
		);
		// validate table toolbar exists
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		// validate 2 rows are selected
		expect(controller.getSelectedRows(propertyId)).to.eql(rowselections);

		// Click on Delete button in toolbar
		const deleteButton = tableToolbar.find("button.properties-action-delete");
		deleteButton.simulate("click");

		// Verify removeSelectedRows function is called
		expect(removeSelectedRows.calledOnce).to.equal(true);
	});
});

describe("TableToolbar row move buttons work correctly", () => {
	it("should show row move buttons when moveableRows: true", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the row move buttons exist in the table toolbar
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton).to.have.length(1);
		expect(moveUpButton).to.have.length(1);
		expect(moveDownButton).to.have.length(1);
		expect(moveBottomButton).to.have.length(1);
	});

	it("should NOT show row move buttons when moveableRows: false", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows={false}
				addRemoveRows
			/>
		);
		// validate the row move buttons don't exist in the table toolbar
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton).to.have.length(0);
		expect(moveUpButton).to.have.length(0);
		expect(moveDownButton).to.have.length(0);
		expect(moveBottomButton).to.have.length(0);
	});

	it("should select top row and move down one row", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(true);
		expect(moveUpButton.prop("disabled")).to.equal(true);
		expect(moveDownButton.prop("disabled")).to.equal(false);
		expect(moveBottomButton.prop("disabled")).to.equal(false);

		// move down one row
		moveDownButton.simulate("click");
		// validate the first row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[1][0]).to.equal("Na");
	});

	it("should select top row and move down to bottom row", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(true);
		expect(moveUpButton.prop("disabled")).to.equal(true);
		expect(moveDownButton.prop("disabled")).to.equal(false);
		expect(moveBottomButton.prop("disabled")).to.equal(false);

		// move to bottom one row
		moveBottomButton.simulate("click");

		// validate the first row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[rows.length - 1][0]).to.equal("Na");
	});

	it("should select bottom row and move up one row", () => {
		const rowselections = [rows.length - 1];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(false);
		expect(moveUpButton.prop("disabled")).to.equal(false);
		expect(moveDownButton.prop("disabled")).to.equal(true);
		expect(moveBottomButton.prop("disabled")).to.equal(true);

		// move up one row
		moveUpButton.simulate("click");

		// validate the bottom row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[rows.length - 2][0]).to.equal("Address");
		expect(tableRows[rows.length - 1][0]).to.equal("Occupation");
	});

	it("should select bottom row and move up to top row", () => {
		const rowselections = [rows.length - 1];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(false);
		expect(moveUpButton.prop("disabled")).to.equal(false);
		expect(moveDownButton.prop("disabled")).to.equal(true);
		expect(moveBottomButton.prop("disabled")).to.equal(true);

		// move to top one row
		moveTopButton.simulate("click");

		// validate the last row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Address");
		expect(tableRows[rows.length - 1][0]).to.equal("Occupation");
	});

	it("should select middle row and all move buttons enabled ", () => {
		const rowselections = [2];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(false);
		expect(moveUpButton.prop("disabled")).to.equal(false);
		expect(moveDownButton.prop("disabled")).to.equal(false);
		expect(moveBottomButton.prop("disabled")).to.equal(false);
	});

	it("should disable move buttons for all propertyIds passed in controller method ", () => {
		// By default when middle row is selected, all move buttons are enabled
		const rowselections = [2];
		setControlValues(rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate all move buttons are enabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		let moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		let moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		let moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		let moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(false);
		expect(moveUpButton.prop("disabled")).to.equal(false);
		expect(moveDownButton.prop("disabled")).to.equal(false);
		expect(moveBottomButton.prop("disabled")).to.equal(false);

		// Disable move buttons for given propertyId
		const propertyIds = [propertyId];
		controller.setDisableRowMoveButtons(propertyIds);
		// Verify propertyIds are correctly set in the redux
		expect(controller.getDisableRowMoveButtons()).to.equal(propertyIds);
		expect(controller.isDisableRowMoveButtons(propertyId)).to.equal(true);

		// Validate all move buttons are disabled
		wrapper.update();
		const tableToolbarUpdated = wrapper.find("div.properties-table-toolbar");
		moveTopButton = tableToolbarUpdated.find("button.table-row-move-top-button");
		moveUpButton = tableToolbarUpdated.find("button.table-row-move-up-button");
		moveDownButton = tableToolbarUpdated.find("button.table-row-move-down-button");
		moveBottomButton = tableToolbarUpdated.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(true);
		expect(moveUpButton.prop("disabled")).to.equal(true);
		expect(moveDownButton.prop("disabled")).to.equal(true);
		expect(moveBottomButton.prop("disabled")).to.equal(true);

	});

	it("should disable all move buttons when first row is static and selected", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		controller.updateStaticRows(propertyId, rowselections);

		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(true);
		expect(moveUpButton.prop("disabled")).to.equal(true);
		expect(moveDownButton.prop("disabled")).to.equal(true);
		expect(moveBottomButton.prop("disabled")).to.equal(true);
	});

	it("should disable up move buttons when first row is static and second row is selected", () => {
		const rowselections = [1];
		setControlValues(rowselections);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		controller.updateStaticRows(propertyId, [0]);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(true);
		expect(moveUpButton.prop("disabled")).to.equal(true);
		expect(moveDownButton.prop("disabled")).to.equal(false);
		expect(moveBottomButton.prop("disabled")).to.equal(false);
	});

	it("should disable all move buttons when last row is static and selected", () => {
		const rowselections = [rows.length - 1];
		setControlValues(rowselections);
		controller.updateStaticRows(propertyId, rowselections);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(true);
		expect(moveUpButton.prop("disabled")).to.equal(true);
		expect(moveDownButton.prop("disabled")).to.equal(true);
		expect(moveBottomButton.prop("disabled")).to.equal(true);
	});

	it("should disable down move buttons when last row is static and second last row is selected", () => {
		const rowselections = [rows.length - 2];
		setControlValues(rowselections);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		controller.updateStaticRows(propertyId, [rows.length - 1]);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(false);
		expect(moveUpButton.prop("disabled")).to.equal(false);
		expect(moveDownButton.prop("disabled")).to.equal(true);
		expect(moveBottomButton.prop("disabled")).to.equal(true);
	});

	it("should enable all move buttons when last row is static and third last row is selected", () => {
		const rowselections = [rows.length - 3];
		setControlValues(rowselections);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		controller.updateStaticRows(propertyId, [rows.length - 1]);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(false);
		expect(moveUpButton.prop("disabled")).to.equal(false);
		expect(moveDownButton.prop("disabled")).to.equal(false);
		expect(moveBottomButton.prop("disabled")).to.equal(false);
	});

	it("should enable all move buttons when first row is static and third row is selected", () => {
		const rowselections = [2];
		setControlValues(rowselections);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		controller.updateStaticRows(propertyId, [0]);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(false);
		expect(moveUpButton.prop("disabled")).to.equal(false);
		expect(moveDownButton.prop("disabled")).to.equal(false);
		expect(moveBottomButton.prop("disabled")).to.equal(false);
	});

	it("should select bottom row and move up to top row after the static rows", () => {
		const rowselections = [rows.length - 1];
		setControlValues(rowselections);
		controller.updateStaticRows(propertyId, [0]);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(false);
		expect(moveUpButton.prop("disabled")).to.equal(false);
		expect(moveDownButton.prop("disabled")).to.equal(true);
		expect(moveBottomButton.prop("disabled")).to.equal(true);

		moveTopButton.simulate("click");

		// validate the last row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[1][0]).to.equal("Address");
		expect(tableRows[rows.length - 1][0]).to.equal("Occupation");
	});

	it("should select top row and move down to the row before the static rows", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		controller.updateStaticRows(propertyId, [rows.length - 1]);
		const wrapper = mountWithIntl(
			<TableToolbar
				store={controller.getStore()}
				controller={controller}
				propertyId={propertyId}
				selectedRows={rowselections}
				removeSelectedRows={removeSelectedRows}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
				tableState={STATES.ENABLED}
				moveableRows
			/>
		);
		// validate the proper buttons are enabled/disabled
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		const moveTopButton = tableToolbar.find("button.table-row-move-top-button");
		const moveUpButton = tableToolbar.find("button.table-row-move-up-button");
		const moveDownButton = tableToolbar.find("button.table-row-move-down-button");
		const moveBottomButton = tableToolbar.find("button.table-row-move-bottom-button");
		expect(moveTopButton.prop("disabled")).to.equal(true);
		expect(moveUpButton.prop("disabled")).to.equal(true);
		expect(moveDownButton.prop("disabled")).to.equal(false);
		expect(moveBottomButton.prop("disabled")).to.equal(false);

		moveBottomButton.simulate("click");

		// validate the first row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[rows.length - 2][0]).to.equal("Na");
	});
});

describe("TableToolbar multi select edit button works correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structureListEditorParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should edit multiple rows using the Edit button in table toolbar", () => {
		let summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");

		// select the first row in the table
		let tableRows = tableUtils.getTableRows(summaryPanel);
		expect(tableRows).to.have.length(4);
		tableUtils.selectCheckboxes(summaryPanel, [0]);
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the "Edit" button is not present in table toolbar because you selected only 1 row
		let tableToolbar = wrapper.find("div.properties-table-toolbar");
		let multiSelectEditButton = tableToolbar.find("button.properties-action-multi-select-edit");
		expect(multiSelectEditButton).to.have.length(0);

		// select four rows in the table
		tableUtils.selectCheckboxes(summaryPanel, [1, 2, 3]);
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the "Edit" button is present in table toolbar
		tableToolbar = wrapper.find("div.properties-table-toolbar");
		multiSelectEditButton = tableToolbar.find("button.properties-action-multi-select-edit");
		expect(multiSelectEditButton).to.have.length(1);

		// Click the multiSelectEditButton in table toolbar
		multiSelectEditButton.simulate("click");

		// A new panel opens which shows editable columns
		let wideFlyoutPanel = wrapper.find(".properties-wf-children");
		let editableColumns = wideFlyoutPanel.find(".properties-editstyle-inline").find(".properties-ctrl-wrapper");
		expect(editableColumns).to.have.length(2); // Animals column has edit_style: "subpanel". Can't edit from selectedEditCells.

		// Set 44 for Integer field
		let integerNumber = editableColumns.at(0).find("input");
		integerNumber.simulate("change", { target: { value: "44" } });


		// Save wide flyout
		wrapper.find(".properties-modal-buttons").find("button.properties-apply-button")
			.at(0)
			.simulate("click");

		// verify that the values have changed in the selected rows.
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");
		tableRows = tableUtils.getTableRows(summaryPanel);
		tableRows.forEach((row) => {
			const integerField = row.find("input").at(1);
			expect(integerField.props()).to.have.property("value", 44);
		});

		// Click the multiSelectEditButton in table toolbar
		multiSelectEditButton.simulate("click");

		// A new panel opens which shows editable columns
		wideFlyoutPanel = wrapper.find(".properties-wf-children");
		editableColumns = wideFlyoutPanel.find(".properties-editstyle-inline").find(".properties-ctrl-wrapper");
		expect(editableColumns).to.have.length(2); // Animals column has edit_style: "subpanel". Can't edit from selectedEditCells.

		// Set 100 for Integer field
		integerNumber = editableColumns.at(0).find("input");
		integerNumber.simulate("change", { target: { value: "100" } });

		// Cancel wide flyout
		wrapper.find(".properties-modal-buttons").find("button.properties-cancel-button")
			.at(0)
			.simulate("click");

		// verify that the values have NOT changed in the selected rows.
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");
		tableRows = tableUtils.getTableRows(summaryPanel);
		tableRows.forEach((row) => {
			const integerField = row.find("input").at(1);
			expect(integerField.prop("value")).to.not.equal(100);
		});
	});

	it("should disable Edit button in selected rows when table toolbar has Edit button", () => {
		let summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");

		// select the first row in the table
		let tableRows = tableUtils.getTableRows(summaryPanel);
		expect(tableRows).to.have.length(4);
		tableUtils.selectCheckboxes(summaryPanel, [0]);
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the "Edit" button is not present in table toolbar because you selected only 1 row
		let tableToolbar = wrapper.find("div.properties-table-toolbar");
		let multiSelectEditButton = tableToolbar.find("button.properties-action-multi-select-edit");
		expect(multiSelectEditButton).to.have.length(0);

		// verify Edit button in ALL rows is enabled
		tableRows = tableUtils.getTableRows(summaryPanel);
		tableRows.forEach((row) => {
			const editRowButton = row.find("button.properties-subpanel-button");
			expect(editRowButton.props()).to.have.property("disabled", false);
		});

		// select four rows in the table
		tableUtils.selectCheckboxes(summaryPanel, [1, 2, 3]);
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the "Edit" button is present in table toolbar
		tableToolbar = wrapper.find("div.properties-table-toolbar");
		multiSelectEditButton = tableToolbar.find("button.properties-action-multi-select-edit");
		expect(multiSelectEditButton).to.have.length(1);

		// verify Edit button in ALL rows is disabled
		tableRows = tableUtils.getTableRows(summaryPanel);
		tableRows.forEach((row) => {
			const checkbox = row.find(".properties-vt-row-checkbox").find("input");
			expect(checkbox.props()).to.have.property("checked", true); // row is selected
			const editRowButton = row.find("button.properties-subpanel-button");
			expect(editRowButton.props()).to.have.property("disabled", true); // edit button in a row is disabled
		});
	});
});
