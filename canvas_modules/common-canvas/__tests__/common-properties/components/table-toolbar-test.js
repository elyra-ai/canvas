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
import { renderWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import sinon from "sinon";
import Controller from "../../../src/common-properties/properties-controller";
import { STATES } from "../../../src/common-properties/constants/constants";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "../../_utils_/table-utilsRTL";
import structureListEditorParamDef from "../../test_resources/paramDefs/structurelisteditor_paramDef.json";
import { fireEvent, within } from "@testing-library/react";

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

const mockTableToolbar = jest.fn();
jest.mock("../../../src/common-properties/components/table-toolbar",
	() => (props) => mockTableToolbar(props)
);

mockTableToolbar.mockImplementation((props) => {
	const TableToolbarComp = jest.requireActual(
		"../../../src/common-properties/components/table-toolbar",
	).default;
	return <TableToolbarComp {...props} />;
});

describe("TableToolbar renderes correctly", () => {
	it("props should have been defined", () => {
		setControlValues([0, 1]);
		renderWithIntl(
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
		expectJest(mockTableToolbar).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"propertyId": propertyId,
			"selectedRows": controller.getSelectedRows(),
			"removeSelectedRows": removeSelectedRows,
			"setScrollToRow": setScrollToRow,
			"setCurrentControlValueSelected": setCurrentControlValueSelected,
			"rightFlyout": true,
			"tableState": STATES.ENABLED,
			"addRemoveRows": true,
			"moveableRows": true,
			"multiSelectEdit": true,
			"multiSelectEditRowPropertyId": multiSelectEditRowPropertyId
		});
	});

	it("when no rows are selected, table toolbar doesn't exist", () => {
		const rowselections = [];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate table toolbar doesn't exist
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(0);
	});

	it("when 1+ rows are selected, table toolbar exists", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate table toolbar exists
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
	});

	it("Cancel button clears row selection", () => {
		const rowselections = [0, 1];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate table toolbar exists
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		// validate 2 rows are selected
		expect(controller.getSelectedRows(propertyId)).to.eql(rowselections);

		// Click on Cancel button in toolbar
		const cancelButton = tableToolbar[0].querySelector("button.properties-action-cancel");
		fireEvent.click(cancelButton);

		// validate row selection is cleared
		expect(controller.getSelectedRows(propertyId)).to.eql([]);
	});

	it("should show Delete button when addRemoveRows: true", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the Delete buttons exists in the table toolbar
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const deleteButton = tableToolbar[0].getElementsByClassName("properties-action-delete");
		expect(deleteButton).to.have.length(1);
	});

	it("should NOT show Delete button when addRemoveRows: false", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the Delete buttons exists in the table toolbar
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const deleteButton = tableToolbar[0].getElementsByClassName("properties-action-delete");
		expect(deleteButton).to.have.length(0);
	});

	it("Delete button calls removeSelectedRows function from the props", () => {
		const rowselections = [0, 1];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate table toolbar exists
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		// validate 2 rows are selected
		expect(controller.getSelectedRows(propertyId)).to.eql(rowselections);

		// Click on Delete button in toolbar
		const deleteButton = tableToolbar[0].querySelector("button.properties-action-delete");
		fireEvent.click(deleteButton);

		// Verify removeSelectedRows function is called
		expect(removeSelectedRows.calledOnce).to.equal(true);
	});
});

describe("TableToolbar row move buttons work correctly", () => {
	it("should show row move buttons when moveableRows: true", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the row move buttons exist in the table toolbar
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button");
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button");
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button");
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button");
		expect(moveTopButton).to.have.length(1);
		expect(moveUpButton).to.have.length(1);
		expect(moveDownButton).to.have.length(1);
		expect(moveBottomButton).to.have.length(1);
	});

	it("should NOT show row move buttons when moveableRows: false", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the row move buttons don't exist in the table toolbar
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button");
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button");
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button");
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button");
		expect(moveTopButton).to.have.length(0);
		expect(moveUpButton).to.have.length(0);
		expect(moveDownButton).to.have.length(0);
		expect(moveBottomButton).to.have.length(0);
	});

	it("should select top row and move down one row", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(true);
		expect(moveUpButton.disabled).to.equal(true);
		expect(moveDownButton.disabled).to.equal(false);
		expect(moveBottomButton.disabled).to.equal(false);

		// move down one row
		fireEvent.click(moveDownButton);
		// validate the first row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[1][0]).to.equal("Na");
	});

	it("should select top row and move down to bottom row", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(true);
		expect(moveUpButton.disabled).to.equal(true);
		expect(moveDownButton.disabled).to.equal(false);
		expect(moveBottomButton.disabled).to.equal(false);

		// move to bottom one row
		fireEvent.click(moveBottomButton);
		// moveBottomButton.simulate("click");

		// validate the first row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[rows.length - 1][0]).to.equal("Na");
	});

	it("should select bottom row and move up one row", () => {
		const rowselections = [rows.length - 1];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(false);
		expect(moveUpButton.disabled).to.equal(false);
		expect(moveDownButton.disabled).to.equal(true);
		expect(moveBottomButton.disabled).to.equal(true);

		// move up one row
		fireEvent.click(moveUpButton);

		// validate the bottom row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[rows.length - 2][0]).to.equal("Address");
		expect(tableRows[rows.length - 1][0]).to.equal("Occupation");
	});

	it("should select bottom row and move up to top row", () => {
		const rowselections = [rows.length - 1];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(false);
		expect(moveUpButton.disabled).to.equal(false);
		expect(moveDownButton.disabled).to.equal(true);
		expect(moveBottomButton.disabled).to.equal(true);

		// move to top one row
		fireEvent.click(moveTopButton);

		// validate the last row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Address");
		expect(tableRows[rows.length - 1][0]).to.equal("Occupation");
	});

	it("should select middle row and all move buttons enabled ", () => {
		const rowselections = [2];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(false);
		expect(moveUpButton.disabled).to.equal(false);
		expect(moveDownButton.disabled).to.equal(false);
		expect(moveBottomButton.disabled).to.equal(false);
	});

	it("should disable move buttons for all propertyIds passed in controller method ", () => {
		// By default when middle row is selected, all move buttons are enabled
		const rowselections = [2];
		setControlValues(rowselections);
		const wrapper = renderWithIntl(
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
		const { container, rerender } = wrapper;
		// validate all move buttons are enabled
		const tableToolbar = container.querySelectorAll("div.properties-table-toolbar");
		expect(tableToolbar).to.have.length(1);
		let moveTopButton = tableToolbar[0].querySelector("button.table-row-move-top-button");
		let moveUpButton = tableToolbar[0].querySelector("button.table-row-move-up-button");
		let moveDownButton = tableToolbar[0].querySelector("button.table-row-move-down-button");
		let moveBottomButton = tableToolbar[0].querySelector("button.table-row-move-bottom-button");
		expect(moveTopButton.disabled).to.equal(false);
		expect(moveUpButton.disabled).to.equal(false);
		expect(moveDownButton.disabled).to.equal(false);
		expect(moveBottomButton.disabled).to.equal(false);

		// Disable move buttons for given propertyId
		const propertyIds = [propertyId];
		controller.setDisableRowMoveButtons(propertyIds);
		// Verify propertyIds are correctly set in the redux
		expect(controller.getDisableRowMoveButtons()).to.equal(propertyIds);
		expect(controller.isDisableRowMoveButtons(propertyId)).to.equal(true);

		// Validate all move buttons are disabled
		rerender(<TableToolbar
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
		const tableToolbarUpdated = container.querySelector("div.properties-table-toolbar");
		moveTopButton = tableToolbarUpdated.querySelector("button.table-row-move-top-button");
		moveUpButton = tableToolbarUpdated.querySelector("button.table-row-move-up-button");
		moveDownButton = tableToolbarUpdated.querySelector("button.table-row-move-down-button");
		moveBottomButton = tableToolbarUpdated.querySelector("button.table-row-move-bottom-button");
		expect(moveTopButton.disabled).to.equal(true);
		expect(moveUpButton.disabled).to.equal(true);
		expect(moveDownButton.disabled).to.equal(true);
		expect(moveBottomButton.disabled).to.equal(true);

	});

	it("should disable all move buttons when first row is static and selected", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		controller.updateStaticRows(propertyId, rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(true);
		expect(moveUpButton.disabled).to.equal(true);
		expect(moveDownButton.disabled).to.equal(true);
		expect(moveBottomButton.disabled).to.equal(true);
	});

	it("should disable up move buttons when first row is static and second row is selected", () => {
		const rowselections = [1];
		setControlValues(rowselections);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		controller.updateStaticRows(propertyId, [0]);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(true);
		expect(moveUpButton.disabled).to.equal(true);
		expect(moveDownButton.disabled).to.equal(false);
		expect(moveBottomButton.disabled).to.equal(false);
	});

	it("should disable all move buttons when last row is static and selected", () => {
		const rowselections = [rows.length - 1];
		setControlValues(rowselections);
		controller.updateStaticRows(propertyId, rowselections);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(true);
		expect(moveUpButton.disabled).to.equal(true);
		expect(moveDownButton.disabled).to.equal(true);
		expect(moveBottomButton.disabled).to.equal(true);
	});

	it("should disable down move buttons when last row is static and second last row is selected", () => {
		const rowselections = [rows.length - 2];
		setControlValues(rowselections);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		controller.updateStaticRows(propertyId, [rows.length - 1]);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(false);
		expect(moveUpButton.disabled).to.equal(false);
		expect(moveDownButton.disabled).to.equal(true);
		expect(moveBottomButton.disabled).to.equal(true);
	});

	it("should enable all move buttons when last row is static and third last row is selected", () => {
		const rowselections = [rows.length - 3];
		setControlValues(rowselections);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		controller.updateStaticRows(propertyId, [rows.length - 1]);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(false);
		expect(moveUpButton.disabled).to.equal(false);
		expect(moveDownButton.disabled).to.equal(false);
		expect(moveBottomButton.disabled).to.equal(false);
	});

	it("should enable all move buttons when first row is static and third row is selected", () => {
		const rowselections = [2];
		setControlValues(rowselections);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		controller.updateStaticRows(propertyId, [0]);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(false);
		expect(moveUpButton.disabled).to.equal(false);
		expect(moveDownButton.disabled).to.equal(false);
		expect(moveBottomButton.disabled).to.equal(false);
	});

	it("should select bottom row and move up to top row after the static rows", () => {
		const rowselections = [rows.length - 1];
		setControlValues(rowselections);
		controller.updateStaticRows(propertyId, [0]);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(false);
		expect(moveUpButton.disabled).to.equal(false);
		expect(moveDownButton.disabled).to.equal(true);
		expect(moveBottomButton.disabled).to.equal(true);

		fireEvent.click(moveTopButton);

		// validate the last row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[1][0]).to.equal("Address");
		expect(tableRows[rows.length - 1][0]).to.equal("Occupation");
	});

	it("should select top row and move down to the row before the static rows", () => {
		const rowselections = [0];
		setControlValues(rowselections);
		controller.updateStaticRows(propertyId, [rows.length - 1]);
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// validate the proper buttons are enabled/disabled
		const tableToolbar = container.getElementsByClassName("properties-table-toolbar");
		const moveTopButton = tableToolbar[0].getElementsByClassName("table-row-move-top-button")[0];
		const moveUpButton = tableToolbar[0].getElementsByClassName("table-row-move-up-button")[0];
		const moveDownButton = tableToolbar[0].getElementsByClassName("table-row-move-down-button")[0];
		const moveBottomButton = tableToolbar[0].getElementsByClassName("table-row-move-bottom-button")[0];
		expect(moveTopButton.disabled).to.equal(true);
		expect(moveUpButton.disabled).to.equal(true);
		expect(moveDownButton.disabled).to.equal(false);
		expect(moveBottomButton.disabled).to.equal(false);

		// moveBottomButton.simulate("click");
		fireEvent.click(moveBottomButton);

		// validate the first row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[rows.length - 2][0]).to.equal("Na");
	});
});

describe("TableToolbar multi select edit button works correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureListEditorParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should edit multiple rows using the Edit button in table toolbar", () => {
		const { container } = wrapper;
		let summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");

		// select the first row in the table
		let tableRows = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableRows).to.have.length(4);
		tableUtilsRTL.selectCheckboxes(summaryPanel, [0]);
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the "Edit" button is not present in table toolbar because you selected only 1 row
		let tableToolbar = container.querySelector("div.properties-table-toolbar");
		let multiSelectEditButton = tableToolbar.querySelector("button.properties-action-multi-select-edit");
		expect(multiSelectEditButton).to.not.exist;

		// select four rows in the table
		tableUtilsRTL.selectCheckboxes(summaryPanel, [1, 2, 3]);
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the "Edit" button is present in table toolbar
		tableToolbar = container.querySelector("div.properties-table-toolbar");
		multiSelectEditButton = tableToolbar.querySelector("button.properties-action-multi-select-edit");
		expect(multiSelectEditButton).to.exist;

		// Click the multiSelectEditButton in table toolbars
		fireEvent.click(multiSelectEditButton);

		// A new panel opens which shows editable columns
		let wideFlyoutPanel = container.getElementsByClassName("properties-wf-children");
		let editableColumns = [];
		for (let i = 0; i < wideFlyoutPanel.length; i++) {
			const col = wideFlyoutPanel[i].querySelector(".properties-ctrl-wrapper");
			if (col.parentElement.className.includes("properties-control-panel")) {
				editableColumns.push(col);
			}
		}
		expect(editableColumns).to.have.length(2); // Animals column has edit_style: "subpanel". Can't edit from selectedEditCells.

		// Set 44 for Integer field
		let integerNumber = within(editableColumns[1]).getAllByRole("spinbutton")[0];
		fireEvent.change(integerNumber, { target: { value: "44" } });

		// Save wide flyout
		let buttons = container.getElementsByClassName("properties-apply-button");
		fireEvent.click(buttons[1]);
		// verify that the values have changed in the selected rows.
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");
		tableRows = tableUtilsRTL.getTableRows(summaryPanel);
		tableRows.forEach((row) => {
			const integerField = within(row).getAllByRole("spinbutton")[0];
			expect(integerField.value).to.equal("44");
		});

		// Click the multiSelectEditButton in table toolbar
		fireEvent.click(multiSelectEditButton);

		// A new panel opens which shows editable columns
		wideFlyoutPanel = container.getElementsByClassName("properties-wf-children");
		editableColumns = [];
		for (let i = 0; i < wideFlyoutPanel.length; i++) {
			const col = wideFlyoutPanel[i].querySelector(".properties-ctrl-wrapper");
			if (col.parentElement.className.includes("properties-control-panel")) {
				editableColumns.push(col);
			}
		}
		expect(editableColumns).to.have.length(2); // Animals column has edit_style: "subpanel". Can't edit from selectedEditCells.

		// Set 100 for Integer field
		integerNumber = within(editableColumns[1]).getAllByRole("spinbutton")[0];
		fireEvent.change(integerNumber, { target: { value: "100" } });

		// Cancel wide flyout
		buttons = container.getElementsByClassName("properties-cancel-button");
		fireEvent.click(buttons[0]);

		// verify that the values have NOT changed in the selected rows.
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");
		tableRows = tableUtilsRTL.getTableRows(summaryPanel);
		tableRows.forEach((row) => {
			const integerField = within(row).getAllByRole("spinbutton")[0];
			expect(integerField.value).to.not.equal("100");
		});
	});

	it("should disable Edit button in selected rows when table toolbar has Edit button", () => {
		const { container } = wrapper;
		let summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");

		// select the first row in the table
		let tableRows = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableRows).to.have.length(4);
		tableUtilsRTL.selectCheckboxes(summaryPanel, [0]);
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the "Edit" button is not present in table toolbar because you selected only 1 row
		let tableToolbar = container.querySelector("div.properties-table-toolbar");
		let multiSelectEditButton = tableToolbar.querySelector("button.properties-action-multi-select-edit");
		expect(multiSelectEditButton).to.not.exist;

		// verify Edit button in ALL rows is enabled
		tableRows = tableUtilsRTL.getTableRows(summaryPanel);
		tableRows.forEach((row) => {
			const editRowButton = row.querySelector("button.properties-subpanel-button");
			expect(editRowButton.disabled).to.equal(false);
		});

		// select four rows in the table
		tableUtilsRTL.selectCheckboxes(summaryPanel, [1, 2, 3]);
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "SLE_mse_panel");

		// verify that the "Edit" button is present in table toolbar
		tableToolbar = container.querySelector("div.properties-table-toolbar");
		multiSelectEditButton = tableToolbar.querySelector("button.properties-action-multi-select-edit");
		expect(multiSelectEditButton).to.exist;

		// verify Edit button in ALL rows is disabled
		tableRows = tableUtilsRTL.getTableRows(summaryPanel);
		tableRows.forEach((row) => {
			const checkbox = row.querySelector(".properties-vt-row-checkbox").querySelector("input");
			expect(checkbox.checked).to.equal(true); // row is selected
			const editRowButton = row.querySelector("button.properties-subpanel-button");
			expect(editRowButton.disabled).to.equal(true); // edit button in a row is disabled
		});
	});
});
