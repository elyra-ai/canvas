/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import SelectColumns from "../../../src/common-properties/controls/selectcolumns";
import { mountWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import sinon from "sinon";
import propertyUtils from "../../_utils_/property-utils";
import Controller from "../../../src/common-properties/properties-controller";

import selectcolumnsParamDef from "../../test_resources/paramDefs/selectcolumns_paramDef.json";
import selectcolumnsMultiInputParamDef from "../../test_resources/paramDefs/selectcolumns_multiInput_paramDef.json";
import rowDisplayParamDef from "../../test_resources/paramDefs/displayRows_paramDef.json";

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

const openFieldPickerSpy = sinon.spy();

describe("selectcolumns renders correctly", () => {
	setPropertyValue();
	it("props should have been defined", () => {
		const wrapper = mountWithIntl(
			<SelectColumns
				control={control}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPickerSpy}
				updateSelectedRows={updateSelectedRows}
				selectedRows={selectedRows}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("updateSelectedRows")).to.equal(updateSelectedRows);
		expect(wrapper.prop("openFieldPicker")).to.equal(openFieldPickerSpy);
		expect(wrapper.prop("selectedRows")).to.equal(selectedRows);
	});

	it("should render a `selectcolumns` control", () => {
		const wrapper = mountWithIntl(
			<SelectColumns
				control={control}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPickerSpy}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows()}
			/>
		);
		expect(wrapper.find("button.properties-add-fields-button")).to.have.length(1);
		expect(wrapper.find("button.properties-remove-fields-button")).to.have.length(1);
		expect(wrapper.find("tr.column-select-table-row")).to.have.length(3);
	});

	it("should select add columns button and openFieldPicker should be invoked", () => {
		const wrapper = mountWithIntl(
			<SelectColumns
				control={control}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPickerSpy}
				updateSelectedRows={updateSelectedRows}
				selectedRows={getSelectedRows()}
			/>
		);

		// select the add column button
		const addColumnButton = wrapper.find("button.properties-add-fields-button");
		expect(addColumnButton).to.have.length(1);
		addColumnButton.simulate("click");

		// validate the openFieldPicker is invoked
		expect(openFieldPickerSpy).to.have.property("callCount", 1);
	});

	it("should select row and remove button row should be removed", () => {
		setPropertyValue();
		const wrapper = mountWithIntl(
			<SelectColumns
				control={control}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPickerSpy}
				rightFlyout
			/>
		);
		// select the second row in the table
		const tableData = wrapper.find("tr.column-select-table-row");
		expect(tableData).to.have.length(3);
		tableData.at(1).simulate("click");

		// ensure removed button is enabled and select it
		const enabledRemoveColumnButton = wrapper.find("button.properties-remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		expect(enabledRemoveColumnButton.prop("disabled")).to.equal(false);
		enabledRemoveColumnButton.simulate("click");
		// validate the second row is deleted
		expect(controller.getPropertyValue(propertyId)).to.have.same.members(["Age", "K"]);
	});
	it("selectColumns renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad selectColumns value"
		});
		const wrapper = mountWithIntl(
			<SelectColumns
				control={control}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPickerSpy}
				rightFlyout
			/>
		);
		const selectColumnsWrapper = wrapper.find("div[data-id='properties-test-columnSelect']");
		const messageWrapper = selectColumnsWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
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
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-fields_filter_type");
		propertyUtils.fieldPicker(fieldPicker, ["age"], ["age", "age2", "age3", "age4"]);
	});
	it("should filter role values from selectcolumn control", () => {
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-fields_filter_roles");
		propertyUtils.fieldPicker(fieldPicker, [], ["age", "drug", "age2", "drug2", "age3", "drug3", "age4", "drug4"]);
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
		// open the summary panel
		// let summaryPanelWrapper = wrapper.find("div[data-id='properties-selectcolumns-values2']");
		// summaryPanelWrapper.find("button").simulate("click");
		const wideflyout = propertyUtils.openSummaryPanel(wrapper, "selectcolumns-values2");
		// open the select columns field picker
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-fields");

		propertyUtils.fieldPicker(fieldPicker, [], [
			{ "name": "age", "schema": "Schema-1" },
			{ "name": "AGE", "schema": "Schema-1" },
			{ "name": "BP", "schema": "Schema-1" },
			{ "name": "Na", "schema": "Schema-1" },
			{ "name": "drug", "schema": "Schema-1" },
			{ "name": "age2", "schema": "Schema-1" },
			{ "name": "BP2", "schema": "Schema-1" },
			{ "name": "Na2", "schema": "Schema-1" },
			{ "name": "drug2", "schema": "Schema-1" },
			{ "name": "age3", "schema": "Schema-1" },
			{ "name": "BP3", "schema": "Schema-1" },
			{ "name": "Na3", "schema": "Schema-1" },
			{ "name": "drug3", "schema": "Schema-1" },
			{ "name": "age", "schema": "Schema-2" },
			{ "name": "AGE", "schema": "Schema-2" },
			{ "name": "BP", "schema": "Schema-2" },
			{ "name": "Na", "schema": "Schema-2" },
			{ "name": "drug", "schema": "Schema-2" },
			{ "name": "intAndRange", "schema": "Schema-2" },
			{ "name": "stringAndDiscrete", "schema": "Schema-2" },
			{ "name": "stringAndSet", "schema": "Schema-2" }
		]);

		wideflyout.find("button.properties-apply-button")
			.at(0)
			.simulate("click");
		const panel = wrapper.find("div[data-id='properties-selectcolumns-values2']");
		expect(panel.find("tr.properties-summary-row")).to.have.length(2);
		expect(panel.find("tr.properties-summary-row").at(0)
			.find("span")
			.at(0)
			.text()).to.equal("Schema-2.age");
		expect(panel.find("tr.properties-summary-row").at(1)
			.find("span")
			.at(0)
			.text()).to.equal("Schema-2.AGE");
	});

	it("should filter by type in selectcolumns control", () => {
		// open the "filter by type" select columns field picker
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-fields_filter_type");
		const fieldTable = [
			{ "name": "age", "schema": "Schema-1" },
			{ "name": "AGE", "schema": "Schema-1" },
			{ "name": "age2", "schema": "Schema-1" },
			{ "name": "age3", "schema": "Schema-1" },
			{ "name": "age", "schema": "Schema-2" },
			{ "name": "AGE", "schema": "Schema-2" },
			{ "name": "intAndRange", "schema": "Schema-2" }
		];
		propertyUtils.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by types in selectcolumns control", () => {
		// open the "filter by types" select columns field picker
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-fields_filter_types");
		const fieldTable = [
			{ "name": "age", "schema": "Schema-1" },
			{ "name": "AGE", "schema": "Schema-1" },
			{ "name": "Na", "schema": "Schema-1" },
			{ "name": "age2", "schema": "Schema-1" },
			{ "name": "Na2", "schema": "Schema-1" },
			{ "name": "age3", "schema": "Schema-1" },
			{ "name": "Na3", "schema": "Schema-1" },
			{ "name": "age", "schema": "Schema-2" },
			{ "name": "AGE", "schema": "Schema-2" },
			{ "name": "Na", "schema": "Schema-2" },
			{ "name": "intAndRange", "schema": "Schema-2" }
		];
		propertyUtils.fieldPicker(fieldPicker, [], fieldTable);
	});


	it("should filter by measurement in selectcolumns control", () => {
		// open the "filter by types" select columns field picker
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-fields_filter_measurement");
		const fieldTable = [
			{ "name": "BP", "schema": "Schema-1" },
			{ "name": "BP2", "schema": "Schema-1" },
			{ "name": "BP3", "schema": "Schema-1" },
			{ "name": "BP", "schema": "Schema-2" },
			{ "name": "stringAndDiscrete", "schema": "Schema-2" }
		];
		propertyUtils.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by measurements in selectcolumns control", () => {
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-fields_filter_measurements");
		const fieldTable = [
			{ "name": "BP", "schema": "Schema-1" },
			{ "name": "drug", "schema": "Schema-1" },
			{ "name": "BP2", "schema": "Schema-1" },
			{ "name": "drug2", "schema": "Schema-1" },
			{ "name": "BP3", "schema": "Schema-1" },
			{ "name": "drug3", "schema": "Schema-1" },
			{ "name": "BP", "schema": "Schema-2" },
			{ "name": "drug", "schema": "Schema-2" },
			{ "name": "stringAndDiscrete", "schema": "Schema-2" },
			{ "name": "stringAndSet", "schema": "Schema-2" }
		];
		propertyUtils.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by type and measurement in selectcolumns control", () => {
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-fields_filter_and");
		const fieldTable = [
			{ "name": "drug", "schema": "Schema-1" },
			{ "name": "drug2", "schema": "Schema-1" },
			{ "name": "drug3", "schema": "Schema-1" },
			{ "name": "drug", "schema": "Schema-2" },
			{ "name": "stringAndSet", "schema": "Schema-2" }
		];
		propertyUtils.fieldPicker(fieldPicker, [], fieldTable);
	});

	it("should filter by type or measurement in selectcolumns control", () => {
		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-fields_filter_or");
		const fieldTable = [
			{ "name": "drug", "schema": "Schema-1" },
			{ "name": "drug2", "schema": "Schema-1" },
			{ "name": "drug3", "schema": "Schema-1" },
			{ "name": "drug", "schema": "Schema-2" },
			{ "name": "stringAndSet", "schema": "Schema-2" },
			{ "name": "age", "schema": "Schema-1" },
			{ "name": "AGE", "schema": "Schema-1" },
			{ "name": "age2", "schema": "Schema-1" },
			{ "name": "age3", "schema": "Schema-1" },
			{ "name": "age", "schema": "Schema-2" },
			{ "name": "AGE", "schema": "Schema-2" },
			{ "name": "intAndRange", "schema": "Schema-2" }
		];
		propertyUtils.fieldPicker(fieldPicker, [], fieldTable);
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
		const columnSelect = wrapper.find("div[data-id='properties-ft-columnSelect']");
		const heightDiv = columnSelect.find("div.properties-ft-container-wrapper");
		const heightStyle = heightDiv.at(0).prop("style");
		// console.log("STYLE: " + JSON.stringify(heightStyle));
		expect(heightStyle).to.eql({ "height": "106px" });
	});

	it("should display 5 rows in select columns in subpanel", () => {
		// open the summary on_panel and add a row to the table
		const summaryPanelWrapper = wrapper.find("div[data-id='properties-structurelist-summary-panel2']");
		summaryPanelWrapper.find("button").simulate("click");
		let tableWrapper = wrapper.find("div[data-id='properties-structurelist2']");
		const addFieldsButtons = tableWrapper.find("button.properties-add-fields-button"); // add row button
		addFieldsButtons.at(0).simulate("click"); // add row button

		// open the subpanel for the added row
		tableWrapper = wrapper.find("div[data-id='properties-structurelist2']");
		const editButton = tableWrapper.find(".properties-subpanel-button").at(0);
		editButton.simulate("click");
		const selectColumnsWrapper = wrapper.find("div[data-id='properties-structurelist2_0_1']");

		const heightDiv = selectColumnsWrapper.find("div.properties-ft-container-wrapper");
		const heightStyle = heightDiv.prop("style");
		// console.log("STYLE: " + JSON.stringify(heightStyle));
		expect(heightStyle).to.eql({ "height": "178px" });
	});
});
