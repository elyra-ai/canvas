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
import { ReactWrapper } from "enzyme";

import selectcolumnsParamDef from "../../test_resources/paramDefs/selectcolumns_paramDef.json";
import selectcolumnsMultiInputParamDef from "../../test_resources/paramDefs/selectcolumns_multiInput_paramDef.json";
import rowDisplayParamDef from "../../test_resources/paramDefs/displayRows_paramDef.json";

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
	}
};

const moveableRowControl = {
	"name": "test-moveableRows-columnSelect",
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
	"moveableRows": true
};

propertyUtils.setControls(controller, [control, moveableRowControl]);
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

function updateSelectedRows(row) {
	return selectedRows[row];
}

const openFieldPicker = sinon.spy();

describe("selectcolumns renders correctly", () => {
	setPropertyValue();
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
		expect(wrapper.find(".remove-fields-button")).to.have.length(1);
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
				rightFlyout
			/>
		);
		// select the second row in the table
		const tableData = wrapper.find(".column-select-table-row");
		expect(tableData).to.have.length(3);
		tableData.at(1).simulate("click");
		// ensure removed button is enabled and select it
		const enabledRemoveColumnButton = wrapper.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		expect(enabledRemoveColumnButton.prop("disabled")).to.be.undefined;
		enabledRemoveColumnButton.simulate("click");
		// validate the second row is deleted
		expect(controller.getPropertyValue(propertyId)).to.have.same.members(["Age", "K"]);
	});

	it("should ensure moveableRows are rendered", () => {
		const wrapper = mountWithIntl(
			<ColumnSelectControl
				control={moveableRowControl}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPicker}
				rightFlyout
			/>
		);
		// see if moveable rows container and buttons rendered and are disabled
		expect(wrapper.find("#table-row-move-button-container")).to.have.length(1);
		const moveButtons = wrapper.find(".table-row-move-button");
		expect(moveButtons).to.have.length(4);
		expect(moveButtons.at(0).prop("disabled")).to.equal(true);
		expect(moveButtons.at(1).prop("disabled")).to.equal(true);
		expect(moveButtons.at(2).prop("disabled")).to.equal(true);
		expect(moveButtons.at(3).prop("disabled")).to.equal(true);
	});

	it("selectcolumns control will have updated options by the controller", () => {

		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsParamDef);
		const wrapper = renderedObject.wrapper;
		const selectColumnsController = renderedObject.controller;

		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(2); // get the filter category
		const addFieldsButtons = filterCategory.find("Button"); // field picker buttons

		const datasetMetadata = selectColumnsController.getDatasetMetadata();

		const newField1 = {
			"name": "age5",
			"type": "integer",
			"metadata": {
				"description": "",
				"measure": "range",
				"modeling_role": "both"
			}
		};

		const newField2 = {
			"name": "BP5",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "discrete",
				"modeling_role": "input"
			}
		};

		const newField3 = {
			"name": "Na5",
			"type": "double",
			"metadata": {
				"description": "",
				"measure": "range",
				"modeling_role": "input"
			}
		};

		const newField4 = {
			"name": "drug5",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "set",
				"modeling_role": "target"
			}
		};

		datasetMetadata[0].fields.push(newField1);
		datasetMetadata[0].fields.push(newField2);
		datasetMetadata[0].fields.push(newField3);
		datasetMetadata[0].fields.push(newField4);

		selectColumnsController.setDatasetMetadata(datasetMetadata);

		addFieldsButtons.at(0).simulate("click"); // open filter picker for `Filter by Type` control
		propertyUtils.fieldPicker([], ["age", "age2", "age3", "age4", "age5"]);
		wrapper.unmount();
	});

});

describe("condition messages renders correctly with columnselect control", () => {
	it("columnselect control should have error message from empty input", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);
		const conditionsPropertyId = { name: "columnSelectInputFieldList" };
		const input = wrapper.find("#flexible-table-columnSelectInputFieldList");
		expect(input).to.have.length(1);

		// select the second row in the table
		var tableData = input.find(".column-select-table-row");
		expect(tableData).to.have.length(2);
		tableData.at(1).simulate("click");
		wrapper.update();
		// ensure removed button is enabled and select it
		var enabledRemoveColumnButton = input.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		expect(enabledRemoveColumnButton.prop("disabled")).to.be.undefined;
		enabledRemoveColumnButton.simulate("click");
		wrapper.update();
		// validate the second row is deleted
		expect(controller.getPropertyValue(conditionsPropertyId)).to.have.same.members(["Age"]);

		tableData = input.find(".column-select-table-row");
		expect(tableData).to.have.length(1);
		tableData.at(0).simulate("click");
		wrapper.update();
		// ensure removed button is enabled and select it
		enabledRemoveColumnButton = input.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		expect(enabledRemoveColumnButton.prop("disabled")).to.be.undefined;
		enabledRemoveColumnButton.simulate("click");
		wrapper.update();
		// validate the first row is deleted
		expect(controller.getPropertyValue(conditionsPropertyId)).to.have.length(0);

		const columnSelectInputFieldListErrorMessages = {
			"validation_id": "columnSelectInputFieldList",
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
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should filter type value from selectcolumn control", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(2); // get the filter category
		const addFieldsButtons = filterCategory.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker for `Filter by Type` control
		propertyUtils.fieldPicker(["age"], ["age", "age2", "age3", "age4"]);
	});
	it("should filter role values from selectcolumn control", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(2); // get the filter category
		const addFieldsButtons = filterCategory.find("Button"); // field picker buttons
		addFieldsButtons.at(2).simulate("click"); // open filter picker for `Filter by Modeling Roles` control
		propertyUtils.fieldPicker([], ["age", "drug", "age2", "drug2", "age3", "drug3", "age4", "drug4"]);
	});
});

describe("selectcolumns with multi input schemas renders correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsMultiInputParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should prefix the correct schema for fields selected", () => {
		const valuesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // VALUES category
		valuesCategory.find(".control-summary-link-buttons").at(0)
			.find(".button")
			.simulate("click");

		const wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const addFieldsButtons = valuesCategory.find("#add-fields-button"); // field picker buttons
		expect(addFieldsButtons).to.have.length(2);
		addFieldsButtons.at(0).simulate("click");

		propertyUtils.fieldPicker([], [
			{ "name": "age", "schema": "0" },
			{ "name": "AGE", "schema": "0" },
			{ "name": "Na", "schema": "0" },
			{ "name": "drug", "schema": "0" },
			{ "name": "age2", "schema": "0" },
			{ "name": "BP2", "schema": "0" },
			{ "name": "Na2", "schema": "0" },
			{ "name": "drug2", "schema": "0" },
			{ "name": "age3", "schema": "0" },
			{ "name": "BP3", "schema": "0" },
			{ "name": "Na3", "schema": "0" },
			{ "name": "drug3", "schema": "0" },
			{ "name": "age", "schema": "1" },
			{ "name": "AGE", "schema": "1" },
			{ "name": "BP", "schema": "1" },
			{ "name": "Na", "schema": "1" },
			{ "name": "drug", "schema": "1" },
			{ "name": "intAndRange", "schema": "1" },
			{ "name": "stringAndDiscrete", "schema": "1" },
			{ "name": "stringAndSet", "schema": "1" }
		]);

		wideflyoutWrapper.find("#properties-apply-button").simulate("click");
		const summary = valuesCategory.find(".control-summary.control-panel").at(0);
		expect(summary.find(".control-summary-list-rows")).to.have.length(2);
		expect(summary.find(".control-summary-list-rows").at(0)
			.find("span")
			.at(0)
			.text()).to.equal("1.age");
		expect(summary.find(".control-summary-list-rows").at(1)
			.find("span")
			.at(0)
			.text()).to.equal("1.AGE");
	});
});

describe("selectcolumns control filters values correctly with multi input", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsMultiInputParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should filter by type in selectcolumns control", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the filter category
		const addFieldsButtons = filterCategory.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker for `Filter by Type` control
		const fieldTable = [
			{ "name": "age", "schema": "0" },
			{ "name": "AGE", "schema": "0" },
			{ "name": "age2", "schema": "0" },
			{ "name": "age3", "schema": "0" },
			{ "name": "age", "schema": "1" },
			{ "name": "AGE", "schema": "1" },
			{ "name": "intAndRange", "schema": "1" }
		];
		propertyUtils.fieldPicker([], fieldTable);
	});

	it("should filter by types in selectcolumns control", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the filter category
		const addFieldsButtons = filterCategory.find("Button"); // field picker buttons
		addFieldsButtons.at(1).simulate("click"); // open filter picker for `Filter by Types` control
		const fieldTable = [
			{ "name": "age", "schema": "0" },
			{ "name": "AGE", "schema": "0" },
			{ "name": "Na", "schema": "0" },
			{ "name": "age2", "schema": "0" },
			{ "name": "Na2", "schema": "0" },
			{ "name": "age3", "schema": "0" },
			{ "name": "Na3", "schema": "0" },
			{ "name": "age", "schema": "1" },
			{ "name": "AGE", "schema": "1" },
			{ "name": "Na", "schema": "1" },
			{ "name": "intAndRange", "schema": "1" }
		];
		propertyUtils.fieldPicker([], fieldTable);
	});


	it("should filter by measurement in selectcolumns control", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the filter category
		const addFieldsButtons = filterCategory.find("Button"); // field picker buttons
		addFieldsButtons.at(2).simulate("click");
		const fieldTable = [
			{ "name": "BP", "schema": "0" },
			{ "name": "BP2", "schema": "0" },
			{ "name": "BP3", "schema": "0" },
			{ "name": "BP", "schema": "1" },
			{ "name": "stringAndDiscrete", "schema": "1" }
		];
		propertyUtils.fieldPicker([], fieldTable);
	});

	it("should filter by measurements in selectcolumns control", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the filter category
		const addFieldsButtons = filterCategory.find("Button"); // field picker buttons
		addFieldsButtons.at(3).simulate("click");
		const fieldTable = [
			{ "name": "BP", "schema": "0" },
			{ "name": "drug", "schema": "0" },
			{ "name": "BP2", "schema": "0" },
			{ "name": "drug2", "schema": "0" },
			{ "name": "BP3", "schema": "0" },
			{ "name": "drug3", "schema": "0" },
			{ "name": "BP", "schema": "1" },
			{ "name": "drug", "schema": "1" },
			{ "name": "stringAndDiscrete", "schema": "1" },
			{ "name": "stringAndSet", "schema": "1" }
		];
		propertyUtils.fieldPicker([], fieldTable);
	});

	it("should filter by type and measurement in selectcolumns control", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the filter category
		const addFieldsButtons = filterCategory.find("Button"); // field picker buttons
		addFieldsButtons.at(4).simulate("click");
		const fieldTable = [
			{ "name": "drug", "schema": "0" },
			{ "name": "drug2", "schema": "0" },
			{ "name": "drug3", "schema": "0" },
			{ "name": "drug", "schema": "1" },
			{ "name": "stringAndSet", "schema": "1" }
		];
		propertyUtils.fieldPicker([], fieldTable);
	});

	it("should filter by type or measurement in selectcolumns control", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the filter category
		const addFieldsButtons = filterCategory.find("Button"); // field picker buttons
		addFieldsButtons.at(5).simulate("click");
		const fieldTable = [
			{ "name": "drug", "schema": "0" },
			{ "name": "drug2", "schema": "0" },
			{ "name": "drug3", "schema": "0" },
			{ "name": "drug", "schema": "1" },
			{ "name": "stringAndSet", "schema": "1" },
			{ "name": "age", "schema": "0" },
			{ "name": "AGE", "schema": "0" },
			{ "name": "age2", "schema": "0" },
			{ "name": "age3", "schema": "0" },
			{ "name": "age", "schema": "1" },
			{ "name": "AGE", "schema": "1" },
			{ "name": "intAndRange", "schema": "1" }
		];
		propertyUtils.fieldPicker([], fieldTable);
	});
});

describe("selectcolumns control displays the proper number of rows", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(rowDisplayParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should display 3 rows", () => {
		const columnSelect = wrapper.find(".flexible-table-control-container").at(0);
		const heightDiv = columnSelect.find("#flexible-table-container-wrapper");
		const heightStyle = heightDiv.at(0).prop("style");
		// console.log("STYLE: " + JSON.stringify(heightStyle));
		expect(isEqual(JSON.parse(JSON.stringify(heightStyle)),
			JSON.parse(JSON.stringify({ "height": "108px" })))).to.be.true;
	});

	it("should display 5 rows", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(2);
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		let tableHtml = document.getElementById("moveablerow-table-structurelist2"); 	// needed since modal dialogs are outside `wrapper`
		let complexTable = new ReactWrapper(tableHtml, true);
		const addButton = complexTable.find("#add-fields-button").at(0);
		addButton.simulate("click"); 		// Add a row to the table
		const editButton = complexTable.find(".table-subcell").at(0);
		editButton.simulate("click"); 		// Invoke the sub-sub-panel
		tableHtml = document.getElementById("flexible-table-fields2"); 		// needed since modal dialogs are outside `wrapper`
		complexTable = new ReactWrapper(tableHtml, true);
		const heightDiv = complexTable.find("#flexible-table-container-wrapper");
		if (heightDiv.length > 2) {
			const heightStyle = heightDiv.at(2).prop("style");
			// console.log("STYLE: " + JSON.stringify(heightStyle));
			expect(isEqual(JSON.parse(JSON.stringify(heightStyle)),
				JSON.parse(JSON.stringify({ "height": "180px" })))).to.be.true;
		}
	});
});
