/*
 * Copyright 2017-2023 Elyra Authors
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
import { mountWithIntl, shallowWithIntl } from "../../_utils_/intl-utils";
import { Provider } from "react-redux";
import { expect } from "chai";
import { setControls } from "../../_utils_/property-utils";
import { getTableRows, selectCheckboxes, selectCheckboxesUsingKeyboard, validateSelectedRowNum } from "./../../_utils_/table-utils";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import { TRUNCATE_LIMIT } from "./../../../src/common-properties/constants/constants.js";

import listParamDef from "../../test_resources/paramDefs/list_paramDef.json";

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

const listLongStringCurrentValues = [propertyUtils.genLongString(TRUNCATE_LIMIT + 10)];

const listStringPopertyId = { name: "test-list-string" };
const listIntegerPopertyId = { name: "test-list-integer" };
const listEmptyPopertyId = { name: "test-list-empty" };

describe("list renders correctly for array[string]", () => {
	const controller = new Controller();
	setControls(controller, [controlString]);

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues({ "test-list-string": listStringCurrentValues });
	});

	it("props should have been defined", () => {
		const wrapper = shallowWithIntl(
			<List
				store={controller.getStore()}
				control={controlString}
				controller={controller}
				propertyId={listStringPopertyId}
			/>
		);
		expect(wrapper.dive().prop("control")).to.equal(controlString);
		expect(wrapper.dive().prop("controller")).to.equal(controller);
		expect(wrapper.dive().prop("propertyId")).to.equal(listStringPopertyId);
	});

	it("should render a `list` control of array[string]", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const listWrapper = wrapper.find("div[data-id='properties-test-list-string']");
		const textfields = listWrapper.find("TextfieldControl");
		expect(textfields).to.have.length(2);

		textfields.forEach((textfield, index) => {
			const value = textfield.prop("value");
			expect(value).to.equal(listStringCurrentValues[index]);
		});

		expect(wrapper.find("button.properties-add-fields-button")).to.have.length(1);
		expect(wrapper.find("button.properties-remove-fields-button")).to.have.length(1);
		expect(getTableRows(wrapper)).to.have.length(2);
	});

	it("should be able to modify value in `list` control textfield", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const listWrapper = wrapper.find("div[data-id='properties-test-list-string']");
		const textfields = listWrapper.find("TextfieldControl");
		expect(textfields).to.have.length(2);

		const inputValue = "new string value in the list control of array[string]";
		const input = textfields.at(1).find("input");
		input.simulate("change", { target: { value: inputValue } });
		expect(controller.getPropertyValue(listStringPopertyId)).to.eql([
			listStringCurrentValues[0],
			inputValue
		]);
	});

	it("should add/remove Textfield rows to `list` control when clicking add/remove button", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const addButton = wrapper.find("button.properties-add-fields-button");
		let removeButton = wrapper.find("button.properties-remove-fields-button");

		// add 2 rows
		addButton.simulate("click");
		addButton.simulate("click");
		expect(controller.getPropertyValue(listStringPopertyId)).to.eql(listStringCurrentValues.concat(["", ""]));
		expect(wrapper.find("TextfieldControl")).to.have.length(4); // Ensure new Textfields are added
		expect(removeButton.prop("disabled")).to.equal(true);

		// select the third row in the table
		const tableData = getTableRows(wrapper);
		expect(tableData).to.have.length(4);
		selectCheckboxes(wrapper, [2]);
		// ensure removed button is enabled and select it
		removeButton = wrapper.find("button.properties-remove-fields-button");
		expect(removeButton.prop("disabled")).to.equal(false);
		removeButton.simulate("click");
		// validate the third row is deleted
		expect(controller.getPropertyValue(listStringPopertyId)).to.eql(listStringCurrentValues.concat([""]));
	});

	it("should be able to add row when no propertyValues are set", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		controller.setPropertyValues({});
		const addButton = wrapper.find("button.properties-add-fields-button");
		addButton.simulate("click");
		expect(controller.getPropertyValue(listStringPopertyId)).to.eql([""]);
	});

	it("should render a readonly text input for long values", () => {
		controller.setPropertyValues({ "test-list-string": listLongStringCurrentValues });
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const listWrapper = wrapper.find("div[data-id='properties-test-list-string']");
		const textfields = listWrapper.find("TextfieldControl");
		expect(textfields).to.have.length(1);
		expect(listWrapper.find(".properties-textinput-readonly")).to.have.length(1);
		const validationMsg = listWrapper.find("div.properties-validation-message.inTable");
		expect(validationMsg).to.have.length(1);
		expect(validationMsg.find("svg.canvas-state-icon-error")).to.have.length(1);
	});

	it("should select rows in `list` control table using keyboard", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);

		// select the first row in the table
		selectCheckboxesUsingKeyboard(wrapper, [0]);

		// Verify row is selected
		const rows = getTableRows(wrapper);
		expect(rows).to.have.length(2);
		const rowsSelected = validateSelectedRowNum(rows);
		expect(rowsSelected).to.have.length(1);
	});

	it("should render empty table content when list is empty", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(listParamDef);
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlEmpty}
					controller={renderedObject.controller}
					propertyId={listEmptyPopertyId}
				/>
			</Provider>
		);

		// Verify empty table content is rendered
		expect(wrapper.find("div.properties-empty-table")).to.have.length(1);
		expect(wrapper.find("div.properties-empty-table span")
			.text()).to.be.equal("To begin, click \"Add value\"");
		expect(wrapper.find("button.properties-empty-table-button")).to.have.length(1);
		expect(wrapper.find("button.properties-empty-table-button").text()).to.be.equal("Add value");
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
		const wrapper = shallowWithIntl(
			<List
				store={controller.getStore()}
				control={controlInteger}
				controller={controller}
				propertyId={listIntegerPopertyId}
			/>
		);
		expect(wrapper.dive().prop("control")).to.equal(controlInteger);
		expect(wrapper.dive().prop("controller")).to.equal(controller);
		expect(wrapper.dive().prop("propertyId")).to.equal(listIntegerPopertyId);
	});

	it("should render a `list` control of array[integer]", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlInteger}
					controller={controller}
					propertyId={listIntegerPopertyId}
				/>
			</Provider>
		);
		const listWrapper = wrapper.find("div[data-id='properties-test-list-integer']");
		const numberfields = listWrapper.find("NumberfieldControl");
		expect(numberfields).to.have.length(2);

		numberfields.forEach((textfield, index) => {
			const value = textfield.prop("value");
			expect(value).to.equal(listIntegerCurrentValues[index]);
		});

		expect(wrapper.find("button.properties-add-fields-button")).to.have.length(1);
		expect(wrapper.find("button.properties-remove-fields-button")).to.have.length(1);
		expect(getTableRows(wrapper)).to.have.length(2);
	});

	it("should be able to modify value in `list` control numberfield", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlInteger}
					controller={controller}
					propertyId={listIntegerPopertyId}
				/>
			</Provider>
		);
		const listWrapper = wrapper.find("div[data-id='properties-test-list-integer']");
		const numberfields = listWrapper.find("NumberfieldControl");
		expect(numberfields).to.have.length(2);

		const inputValue = "1234567890";
		const input = numberfields.at(1).find("input");
		input.simulate("change", { target: { value: inputValue } });
		expect(controller.getPropertyValue(listIntegerPopertyId)).to.eql([
			listIntegerCurrentValues[0],
			1234567890
		]);
	});

	it("should add/remove Numberfield rows to `list` control when clicking add/remove button", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlInteger}
					controller={controller}
					propertyId={listIntegerPopertyId}
				/>
			</Provider>
		);
		const addButton = wrapper.find("button.properties-add-fields-button");
		let removeButton = wrapper.find("button.properties-remove-fields-button");

		// add 2 rows
		addButton.simulate("click");
		addButton.simulate("click");
		expect(controller.getPropertyValue(listIntegerPopertyId))
			.to.eql(listIntegerCurrentValues.concat([null, null]));
		expect(wrapper.find("NumberfieldControl")).to.have.length(4); // Ensure new Numberfields are added
		expect(removeButton.prop("disabled")).to.equal(true);

		// select the third row in the table
		const tableData = getTableRows(wrapper);
		expect(tableData).to.have.length(4);
		selectCheckboxes(wrapper, [2]);
		// ensure removed button is enabled and select it
		removeButton = wrapper.find("button.properties-remove-fields-button");
		expect(removeButton.prop("disabled")).to.equal(false);
		removeButton.simulate("click");
		// validate the third row is deleted
		expect(controller.getPropertyValue(listIntegerPopertyId))
			.to.eql(listIntegerCurrentValues.concat([null]));
	});
});

describe("list renders correctly as a nested control", () => {
	let wrapper;
	let renderedController;

	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(listParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render a `list` control inside a structurelisteditor", () => {
		const propertyId = { name: "complexListStructurelisteditor" };
		let summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-list-summary-panel");
		let table = summaryPanel.find("div[data-id='properties-ci-complexListStructurelisteditor']");
		let tableData = renderedController.getPropertyValue(propertyId);
		const expectedOriginal = listParamDef.current_parameters.complexListStructurelisteditor;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		let onPanelList = summaryPanel.find(".properties-onpanel-container")
			.find("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		expect(onPanelList).to.have.length(0);
		selectCheckboxes(summaryPanel, [0]); // Select first row for onPanel edit

		// verify onPanel edit shows list control
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-list-summary-panel");
		table = summaryPanel.find("div[data-id='properties-ci-complexListStructurelisteditor']");
		onPanelList = table.find(".properties-onpanel-container")
			.find("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		expect(onPanelList).to.have.length(1);

		// select Add value button in empty nested list - this adds 1 row in the list
		let emptyTableButton = onPanelList.find("button.properties-empty-table-button");
		expect(emptyTableButton).to.have.length(1);
		emptyTableButton.simulate("click");

		wrapper.update();
		onPanelList = wrapper.find("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		// select the add column button in nested list
		let addColumnButton = onPanelList.find("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");

		// The table content should increase by 2
		tableData = renderedController.getPropertyValue(propertyId);
		let expected = [[1, "Ascending", ["", ""]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// edit nested list row index 0
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-list-summary-panel");
		onPanelList = summaryPanel.find(".properties-onpanel-container")
			.find("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		const textinputs = onPanelList.find(".cds--text-input__field-wrapper");
		expect(textinputs).to.have.length(2);
		textinputs.at(0).find("input")
			.simulate("change", { target: { value: "new value list 0" } });
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [[1, "Ascending", ["new value list 0", ""]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// edit nested list row index 1
		textinputs.at(1).find("input")
			.simulate("change", { target: { value: "new value list 1" } });
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [[1, "Ascending", ["new value list 0", "new value list 1"]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// deselect the row
		selectCheckboxes(summaryPanel, [0]);

		// Add another row to main table
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-list-summary-panel");
		const mainTable = summaryPanel.find("div[data-id='properties-complexListStructurelisteditor']");
		addColumnButton = mainTable.find("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [[1, "Ascending", ["new value list 0", "new value list 1"]], [2, "Ascending", []]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-list-summary-panel");
		onPanelList = summaryPanel.find(".properties-onpanel-container")
			.find("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		expect(onPanelList).to.have.length(0);
		selectCheckboxes(summaryPanel, [1]); // Select second row for onPaneledit

		// verify onPanel edit shows list control
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-list-summary-panel");
		table = summaryPanel.find("div[data-id='properties-ci-complexListStructurelisteditor']");
		onPanelList = table.find(".properties-onpanel-container")
			.find("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		expect(onPanelList).to.have.length(1);

		// select Add value button in empty nested list - this adds 1 row in the list
		emptyTableButton = onPanelList.find("button.properties-empty-table-button");
		expect(emptyTableButton).to.have.length(1);
		emptyTableButton.simulate("click");

		wrapper.update();

		// edit nested list row index 0
		summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-list-summary-panel");
		onPanelList = summaryPanel.find(".properties-onpanel-container")
			.find("div[data-id='properties-ctrl-complexListStructurelisteditor_list']");
		const secondTextinputs = onPanelList.find(".cds--text-input__field-wrapper");
		expect(secondTextinputs).to.have.length(1);
		secondTextinputs.find("input").simulate("change", { target: { value: "new value list 10" } });
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [[1, "Ascending", ["new value list 0", "new value list 1"]], [2, "Ascending", ["new value list 10"]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});

	it("should render a `list` control inside a structuretable", () => {
		const propertyId = { name: "complexListStructuretable" };
		const summaryPanel = propertyUtils.openSummaryPanel(wrapper, "nested-list-summary-panel");
		let table = summaryPanel.find("div[data-id='properties-ci-complexListStructuretable']");
		let tableData = renderedController.getPropertyValue(propertyId);
		const expectedOriginal = listParamDef.current_parameters.complexListStructuretable;
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expectedOriginal));

		// click on subpanel edit
		const editButton = table.find("button.properties-subpanel-button").at(0);
		editButton.simulate("click");

		// subPanel table
		let subPanelTable = wrapper.find("div[data-id='properties-complexListStructuretables']");
		// select Add value button in empty nested list - this adds 1 row in the list
		let emptyTableButton = subPanelTable.find("button.properties-empty-table-button");
		expect(emptyTableButton).to.have.length(1);
		emptyTableButton.simulate("click");

		wrapper.update();
		subPanelTable = wrapper.find("div[data-id='properties-complexListStructuretables']");
		// select the add value button in nested list
		const addColumnButton = subPanelTable.find("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");

		// The table content should increase by 2
		tableData = renderedController.getPropertyValue(propertyId);
		let expected = [["Cholesterol", 5, "Ascending", ["", ""]], ["Na", 6, "Ascending", []]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// edit nested list row index 0
		subPanelTable = wrapper.find("div[data-id='properties-complexListStructuretables']");
		let textinputs = subPanelTable.find(".cds--text-input__field-wrapper");
		expect(textinputs).to.have.length(2);
		textinputs.at(0).find("input")
			.simulate("change", { target: { value: "new value list 0" } });
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [["Cholesterol", 5, "Ascending", ["new value list 0", ""]], ["Na", 6, "Ascending", []]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// edit nested list row index 1
		textinputs.at(1).find("input")
			.simulate("change", { target: { value: "new value list 1" } });
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [["Cholesterol", 5, "Ascending", ["new value list 0", "new value list 1"]], ["Na", 6, "Ascending", []]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// click on edit subpanel button of second row
		table = summaryPanel.find("div[data-id='properties-ci-complexListStructuretable']");
		const editBtns = table.find("button.properties-subpanel-button");
		expect(editBtns).to.have.length(2);
		editBtns.at(1).simulate("click");

		// subPanel table of second row
		subPanelTable = wrapper.find("div[data-id='properties-complexListStructuretables']").at(1);
		// select Add value button in empty nested list - this adds 1 row in the list
		emptyTableButton = subPanelTable.find("button.properties-empty-table-button");
		expect(emptyTableButton).to.have.length(1);
		emptyTableButton.simulate("click");

		wrapper.update();

		tableData = renderedController.getPropertyValue(propertyId);
		expected = [["Cholesterol", 5, "Ascending", ["new value list 0", "new value list 1"]], ["Na", 6, "Ascending", [""]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));

		// edit nested list row index 0
		subPanelTable = wrapper.find("div[data-id='properties-complexListStructuretables']").at(1);
		textinputs = subPanelTable.find(".cds--text-input__field-wrapper");
		expect(textinputs).to.have.length(1);
		textinputs.find("input").simulate("change", { target: { value: "new value list 10" } });
		tableData = renderedController.getPropertyValue(propertyId);
		expected = [["Cholesterol", 5, "Ascending", ["new value list 0", "new value list 1"]], ["Na", 6, "Ascending", ["new value list 10"]]];
		expect(JSON.stringify(tableData)).to.equal(JSON.stringify(expected));
	});
});

describe("list classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(listParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("list should have custom classname defined", () => {
		expect(wrapper.find(".string-list-control-class")).to.have.length(1);
	});

	it("list should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "nested-list-summary-panel");
		// Verify the list in subpanel and onpanel
		expect(wrapper.find(".table-on-panel-list-control-class")).to.have.length(1);
		expect(wrapper.find(".table-subpanel-list-control-class")).to.have.length(2);
	});
});

describe("All checkboxes in list must have labels", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(listParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("checkbox in header should have label", () => {
		const listOfStrings = wrapper.find("div[data-id='properties-ctrl-list_string']");
		const headerCheckboxLabel = listOfStrings.find(".properties-vt-header-checkbox").text();
		const secondColumnLabel = listOfStrings
			.find("div[role='columnheader']")
			.at(0)
			.text();
		expect(headerCheckboxLabel).to.equal(`Select all ${secondColumnLabel}`);
	});

	it("checkbox in row should have label", () => {
		const listOfStrings = wrapper.find("div[data-id='properties-ctrl-list_string']");
		const rowCheckboxes = listOfStrings.find(".properties-vt-row-checkbox");
		const textfields = listOfStrings.find("TextfieldControl");
		expect(textfields).to.have.length(3);
		const tableName = listOfStrings.find(".properties-control-label").text();

		textfields.forEach((textfield, index) => {
			const rowCheckboxLabel = rowCheckboxes.at(index).text();
			expect(rowCheckboxLabel).to.equal(`Select row ${index + 1} from ${tableName}`);
		});
	});
});
