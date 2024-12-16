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
import List from "../../../src/common-properties/controls/list";
import { renderWithIntl } from "../../_utils_/intl-utils";
import { Provider } from "react-redux";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import { setControls } from "../../_utils_/property-utils";
import { getTableRows, selectCheckboxes, selectCheckboxesUsingKeyboard, validateSelectedRowNumRows } from "./../../_utils_/table-utilsRTL";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import { TRUNCATE_LIMIT } from "./../../../src/common-properties/constants/constants.js";

import listParamDef from "../../test_resources/paramDefs/list_paramDef.json";
import { fireEvent } from "@testing-library/react";

const controlString = {
	"name": "test-list-string",
	"label": {
		"text": "test list string control"
	},
	"description": {
		"text": "list control description"
	},
	"controlType": "list",
	"valueDef": {
		"isList": true,
		"isMap": false,
		"propType": "string"
	}
};
const controlInteger = {
	"name": "test-list-integer",
	"label": {
		"text": "test list integer control"
	},
	"description": {
		"text": "list control description"
	},
	"controlType": "list",
	"valueDef": {
		"isList": true,
		"isMap": false,
		"propType": "integer"
	}
};

const controlEmpty = {
	"name": "test-list-empty",
	"label": {
		"text": "test empty list"
	},
	"description": {
		"text": "list control description"
	},
	"controlType": "list",
	"valueDef": {
		"isList": true,
		"isMap": false,
		"propType": "string"
	}
};

const listStringCurrentValues = ["list item 1", ""];
const listIntegerCurrentValues = [10, null];

const listLongStringCurrentValues = [propertyUtilsRTL.genLongString(TRUNCATE_LIMIT + 10)];

const listStringPopertyId = { name: "test-list-string" };
const listIntegerPopertyId = { name: "test-list-integer" };
const listEmptyPopertyId = { name: "test-list-empty" };

const mockList = jest.fn();
jest.mock("../../../src/common-properties/controls/list",
	() => (props) => mockList(props)
);

mockList.mockImplementation((props) => {
	const ListComp = jest.requireActual(
		"../../../src/common-properties/controls/list",
	).default;
	return <ListComp {...props} />;
});

describe("list renders correctly for array[string]", () => {
	const controller = new Controller();
	setControls(controller, [controlString]);

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues({ "test-list-string": listStringCurrentValues });
	});

	it("props should have been defined", () => {
		renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		expectJest(mockList).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": controlString,
			"propertyId": listStringPopertyId,
		});
	});

	it("should render a `list` control of array[string]", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const listWrapper = container.querySelector("div[data-id='properties-test-list-string']");
		const textfields = listWrapper.querySelectorAll(".cds--text-input");
		expect(textfields).to.have.length(2);

		textfields.forEach((textfield, index) => {
			const value = textfield.value;
			expect(value).to.equal(listStringCurrentValues[index]);
		});

		expect(container.querySelectorAll("button.properties-add-fields-button")).to.have.length(1);
		expect(getTableRows(container)).to.have.length(2);
	});

	it("should be able to modify value in `list` control textfield", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const listWrapper = container.querySelector("div[data-id='properties-test-list-string']");
		const textfields = listWrapper.querySelectorAll(".properties-textfield");
		expect(textfields).to.have.length(2);

		const inputValue = "new string value in the list control of array[string]";
		const input = textfields[1].querySelector("input");
		fireEvent.change(input, { target: { value: inputValue } });
		expect(controller.getPropertyValue(listStringPopertyId)).to.eql([
			listStringCurrentValues[0],
			inputValue
		]);
	});

	it("should add/remove Textfield rows to `list` control when clicking add/delete button", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const addButton = container.querySelector("button.properties-add-fields-button");

		// add 2 rows
		fireEvent.click(addButton);
		fireEvent.click(addButton);
		expect(controller.getPropertyValue(listStringPopertyId)).to.eql(listStringCurrentValues.concat(["", ""]));
		expect(container.querySelectorAll(".properties-textfield")).to.have.length(4); // Ensure new Textfields are added

		// select the third row in the table
		const tableData = getTableRows(container);
		expect(tableData).to.have.length(4);
		selectCheckboxes(container, [2]);
		// ensure Table toolbar has Delete button and select it
		const tableToolbar = container.querySelector("div.properties-table-toolbar");
		const deleteButton = tableToolbar.querySelectorAll("button.properties-action-delete");
		expect(deleteButton).to.have.length(1);
		fireEvent.click(deleteButton[0]);

		expect(controller.getPropertyValue(listStringPopertyId)).to.eql(listStringCurrentValues.concat([""]));
	});

	it("should be able to add row when no propertyValues are set", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		controller.setPropertyValues({});
		const addButton = container.querySelector("button.properties-add-fields-button");
		fireEvent.click(addButton);
		expect(controller.getPropertyValue(listStringPopertyId)).to.eql([""]);
	});

	it("should render a readonly text input for long values", () => {
		controller.setPropertyValues({ "test-list-string": listLongStringCurrentValues });
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const listWrapper = container.querySelector("div[data-id='properties-test-list-string']");
		const textfields = listWrapper.querySelectorAll(".properties-textfield");
		expect(textfields).to.have.length(1);
		expect(listWrapper.querySelectorAll(".properties-textinput-readonly")).to.have.length(1);
		const validationMsg = listWrapper.querySelectorAll("div.properties-validation-message.inTable");
		expect(validationMsg).to.have.length(1);
		expect(validationMsg[0].querySelectorAll("svg.canvas-state-icon-error")).to.have.length(1);
	});

	it("should select rows in `list` control table using keyboard", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		// select the first row in the table
		selectCheckboxesUsingKeyboard(container, [0]);

		// Verify row is selected
		const rows = getTableRows(container);
		expect(rows).to.have.length(2);
		const rowsSelected = validateSelectedRowNumRows(rows);
		expect(rowsSelected).to.have.length(1);
	});

	it("should render empty table content when list is empty", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(listParamDef);
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlEmpty}
					controller={renderedObject.controller}
					propertyId={listEmptyPopertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		// Verify empty table content is rendered
		expect(container.querySelectorAll("div.properties-empty-table")).to.have.length(1);
		expect(container.querySelector("div.properties-empty-table span")
			.textContent).to.be.equal("To begin, click \"Add value\"");
		expect(container.querySelectorAll("button.properties-empty-table-button")).to.have.length(1);
		expect(container.querySelector("button.properties-empty-table-button").textContent).to.be.equal("Add value");
	});
});

describe("list renders correctly for array[integer]", () => {
	const controller = new Controller();
	setControls(controller, [controlInteger]);

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues({ "test-list-integer": listIntegerCurrentValues });
	});

	it("props should have been defined", () => {
		renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		expectJest(mockList).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": controlString,
			"propertyId": listStringPopertyId,
		});
	});

	it("should render a `list` control of array[integer]", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlInteger}
					controller={controller}
					propertyId={listIntegerPopertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const listWrapper = container.querySelector("div[data-id='properties-test-list-integer']");
		const numberfields = listWrapper.querySelectorAll(".properties-table-cell-control");
		expect(numberfields).to.have.length(2);

		numberfields.forEach((textfield, index) => {
			let value = textfield.querySelector("input").value;
			if (value) {
				value = Number(value);
			} else {
				value = null;
			}
			expect(value).to.equal(listIntegerCurrentValues[index]);
		});

		expect(container.querySelectorAll("button.properties-add-fields-button")).to.have.length(1);
		expect(getTableRows(container)).to.have.length(2);
	});

	it("should be able to modify value in `list` control numberfield", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlInteger}
					controller={controller}
					propertyId={listIntegerPopertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const listWrapper = container.querySelector("div[data-id='properties-test-list-integer']");
		const numberfields = listWrapper.querySelectorAll(".properties-table-cell-control");
		expect(numberfields).to.have.length(2);

		const inputValue = "1234567890";
		const input = numberfields[1].querySelector("input");
		fireEvent.change(input, { target: { value: inputValue } });
		expect(controller.getPropertyValue(listIntegerPopertyId)).to.eql([
			listIntegerCurrentValues[0],
			1234567890
		]);
	});

	it("should add/remove Numberfield rows to `list` control when clicking add/delete button", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlInteger}
					controller={controller}
					propertyId={listIntegerPopertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const addButton = container.querySelector("button.properties-add-fields-button");

		// add 2 rows
		fireEvent.click(addButton);
		fireEvent.click(addButton);
		expect(controller.getPropertyValue(listIntegerPopertyId))
			.to.eql(listIntegerCurrentValues.concat([null, null]));
		expect(container.querySelectorAll(".properties-table-cell-control")).to.have.length(4); // Ensure new Numberfields are added

		// select the third row in the table
		const tableData = getTableRows(container);
		expect(tableData).to.have.length(4);
		selectCheckboxes(container, [2]);
		// ensure Table toolbar has Delete button and select it
		const tableToolbar = container.querySelector("div.properties-table-toolbar");
		const deleteButton = tableToolbar.querySelectorAll("button.properties-action-delete");
		expect(deleteButton).to.have.length(1);
		fireEvent.click(deleteButton[0]);

		// validate the third row is deleted
		expect(controller.getPropertyValue(listIntegerPopertyId))
			.to.eql(listIntegerCurrentValues.concat([null]));
	});
});

describe("list renders correctly as a nested control", () => {
	let wrapper;
	let renderedController;

	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(listParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render a `list` control inside a structurelisteditor starting with index 0", () => {
		const { container } = wrapper;
		const propertyId = { name: "complexListStructurelisteditor" };
		let summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-list-summary-panel");
		let table = summaryPanel.querySelector("div[data-id='properties-ci-complexListStructurelisteditor']");
		let tableData = renderedController.getPropertyValue(propertyId);
		const expectedOriginal = listParamDef.current_parameters.complexListStructurelisteditor;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		let onPanelList = summaryPanel.querySelectorAll("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		expect(onPanelList).to.have.length(0);
		selectCheckboxes(summaryPanel, [0]); // Select first row for onPanel edit

		// verify onPanel edit shows list control
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-list-summary-panel");
		table = summaryPanel.querySelector("div[data-id='properties-ci-complexListStructurelisteditor']");
		onPanelList = table.querySelector(".properties-onpanel-container")
			.querySelectorAll("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		expect(onPanelList).to.have.length(1);

		// select Add value button in empty nested list - this adds 1 row in the list
		let emptyTableButton = onPanelList[0].querySelectorAll("button.properties-empty-table-button");
		expect(emptyTableButton).to.have.length(1);
		fireEvent.click(emptyTableButton[0]);

		onPanelList = container.querySelector("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		// select the add column button in nested list
		let addColumnButton = onPanelList.querySelectorAll("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		fireEvent.click(addColumnButton[0]);

		// The table content should increase by 2
		tableData = renderedController.getPropertyValue(propertyId);
		let expected = [[0, "Ascending", ["", ""]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// edit nested list row index 0
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-list-summary-panel");
		onPanelList = summaryPanel.querySelector(".properties-onpanel-container")
			.querySelector("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		const textinputs = onPanelList.querySelectorAll(".cds--text-input__field-wrapper");
		expect(textinputs).to.have.length(2);
		fireEvent.change(textinputs[0].querySelector("input"), { target: { value: "new value list 0" } });
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [[0, "Ascending", ["new value list 0", ""]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// edit nested list row index 1
		fireEvent.change(textinputs[1].querySelector("input"), { target: { value: "new value list 1" } });

		tableData = renderedController.getPropertyValue(propertyId);
		expected = [[0, "Ascending", ["new value list 0", "new value list 1"]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// deselect the row
		selectCheckboxes(summaryPanel, [0]);

		// Add another row to main table
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-list-summary-panel");
		const mainTable = summaryPanel.querySelector("div[data-id='properties-complexListStructurelisteditor']");
		addColumnButton = mainTable.querySelectorAll("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		fireEvent.click(addColumnButton[0]);

		tableData = renderedController.getPropertyValue(propertyId);
		expected = [[0, "Ascending", ["new value list 0", "new value list 1"]], [1, "Ascending", []]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-list-summary-panel");
		onPanelList = summaryPanel.querySelectorAll("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		expect(onPanelList).to.have.length(0);
		selectCheckboxes(summaryPanel, [1]); // Select second row for onPaneledit

		// verify onPanel edit shows list control
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-list-summary-panel");
		table = summaryPanel.querySelector("div[data-id='properties-ci-complexListStructurelisteditor']");
		onPanelList = table.querySelector(".properties-onpanel-container")
			.querySelectorAll("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		expect(onPanelList).to.have.length(1);

		// select Add value button in empty nested list - this adds 1 row in the list
		emptyTableButton = onPanelList[0].querySelectorAll("button.properties-empty-table-button");
		expect(emptyTableButton).to.have.length(1);
		fireEvent.click(emptyTableButton[0]);

		// edit nested list row index 0
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-list-summary-panel");
		onPanelList = summaryPanel.querySelector(".properties-onpanel-container")
			.querySelector("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		const secondTextinputs = onPanelList.querySelectorAll(".cds--text-input__field-wrapper");
		expect(secondTextinputs).to.have.length(1);
		fireEvent.change(secondTextinputs[0].querySelector("input"), { target: { value: "new value list 10" } });
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [[0, "Ascending", ["new value list 0", "new value list 1"]], [1, "Ascending", ["new value list 10"]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});

	it("should render a `list` control inside a structuretable", () => {
		const { container } = wrapper;
		const propertyId = { name: "complexListStructuretable" };
		const summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "nested-list-summary-panel");
		let table = summaryPanel.querySelector("div[data-id='properties-ci-complexListStructuretable']");
		let tableData = renderedController.getPropertyValue(propertyId);
		const expectedOriginal = listParamDef.current_parameters.complexListStructuretable;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit
		const editButton = table.querySelectorAll("button.properties-subpanel-button");
		fireEvent.click(editButton[0]);


		// subPanel table
		let subPanelTable = container.querySelector("div[data-id='properties-complexListStructuretables']");
		// select Add value button in empty nested list - this adds 1 row in the list
		let emptyTableButton = subPanelTable.querySelectorAll("button.properties-empty-table-button");
		expect(emptyTableButton).to.have.length(1);
		fireEvent.click(emptyTableButton[0]);

		subPanelTable = container.querySelector("div[data-id='properties-complexListStructuretables']");
		// select the add value button in nested list
		const addColumnButton = subPanelTable.querySelectorAll("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		fireEvent.click(addColumnButton[0]);

		// The table content should increase by 2
		tableData = renderedController.getPropertyValue(propertyId);
		let expected = [["Cholesterol", 5, "Ascending", ["", ""]], ["Na", 6, "Ascending", []]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// edit nested list row index 0
		subPanelTable = container.querySelector("div[data-id='properties-complexListStructuretables']");
		let textinputs = subPanelTable.querySelectorAll(".cds--text-input__field-wrapper");
		expect(textinputs).to.have.length(2);
		fireEvent.change(textinputs[0].querySelector("input"), { target: { value: "new value list 0" } });
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [["Cholesterol", 5, "Ascending", ["new value list 0", ""]], ["Na", 6, "Ascending", []]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// edit nested list row index 1
		fireEvent.change(textinputs[1].querySelector("input"), { target: { value: "new value list 1" } });
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [["Cholesterol", 5, "Ascending", ["new value list 0", "new value list 1"]], ["Na", 6, "Ascending", []]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// click on edit subpanel button of second row
		table = summaryPanel.querySelector("div[data-id='properties-ci-complexListStructuretable']");
		const editBtns = table.querySelectorAll("button.properties-subpanel-button");
		expect(editBtns).to.have.length(2);
		fireEvent.click(editBtns[1]);

		// subPanel table of second row
		subPanelTable = container.querySelectorAll("div[data-id='properties-complexListStructuretables']")[1];
		// select Add value button in empty nested list - this adds 1 row in the list
		emptyTableButton = subPanelTable.querySelectorAll("button.properties-empty-table-button");
		expect(emptyTableButton).to.have.length(1);
		fireEvent.click(emptyTableButton[0]);

		tableData = renderedController.getPropertyValue(propertyId);
		expected = [["Cholesterol", 5, "Ascending", ["new value list 0", "new value list 1"]], ["Na", 6, "Ascending", [""]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// edit nested list row index 0
		subPanelTable = container.querySelectorAll("div[data-id='properties-complexListStructuretables']")[1];
		textinputs = subPanelTable.querySelectorAll(".cds--text-input__field-wrapper");
		expect(textinputs).to.have.length(1);
		fireEvent.change(textinputs[0].querySelector("input"), { target: { value: "new value list 10" } });
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [["Cholesterol", 5, "Ascending", ["new value list 0", "new value list 1"]], ["Na", 6, "Ascending", ["new value list 10"]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});

	it("readonly list should have button disabled", () => {
		const { container } = wrapper;
		const readOnlyWrapper = container.querySelector(".string-list-control-class-readonly");
		expect(readOnlyWrapper.querySelector("button").disabled).to.equal(true);
	});
});

describe("list classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(listParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("list should have custom classname defined", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll(".string-list-control-class")).to.have.length(1);
	});

	it("list should have custom classname defined in table cells", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "nested-list-summary-panel");
		// Verify the list in subpanel and onpanel
		expect(container.querySelectorAll(".table-on-panel-list-control-class")).to.have.length(1);
		expect(container.querySelectorAll(".table-subpanel-list-control-class")).to.have.length(2);
	});
});

describe("All checkboxes in list must have labels", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(listParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("checkbox in header should have label", () => {
		const { container } = wrapper;
		const listOfStrings = container.querySelector("div[data-id='properties-ctrl-list_string']");
		const headerCheckboxLabel = listOfStrings.querySelector(".properties-vt-header-checkbox").textContent;
		const secondColumnLabel = listOfStrings
			.querySelector("div[role='columnheader']")
			.textContent;
		expect(headerCheckboxLabel).to.equal(`Select all ${secondColumnLabel}`);
	});

	it("checkbox in row should have label", () => {
		const { container } = wrapper;
		const listOfStrings = container.querySelector("div[data-id='properties-ctrl-list_string']");
		const rowCheckboxes = listOfStrings.querySelectorAll(".properties-vt-row-checkbox");
		const textfields = listOfStrings.querySelectorAll(".properties-textfield");
		expect(textfields).to.have.length(3);
		const tableName = listOfStrings.querySelector(".properties-control-label").textContent;

		textfields.forEach((textfield, index) => {
			const rowCheckboxLabel = rowCheckboxes[index].textContent;
			expect(rowCheckboxLabel).to.equal(`Select row ${index + 1} from ${tableName}`);
		});
	});
});
