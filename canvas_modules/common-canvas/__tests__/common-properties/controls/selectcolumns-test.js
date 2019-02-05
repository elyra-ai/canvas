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
import { mountWithIntl, shallowWithIntl } from "enzyme-react-intl";
import { Provider } from "react-redux";
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

const openFieldPickerSpy = sinon.spy();

describe("selectcolumns renders correctly", () => {
	setPropertyValue();
	it("props should have been defined", () => {
		const wrapper = shallowWithIntl(
			<SelectColumns
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				openFieldPicker={openFieldPickerSpy}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("openFieldPicker")).to.equal(openFieldPickerSpy);
	});

	it("should render a `selectcolumns` control", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SelectColumns
					control={control}
					controller={controller}
					propertyId={propertyId}
					openFieldPicker={openFieldPickerSpy}
				/>
			</Provider>
		);
		expect(wrapper.find("button.properties-add-fields-button")).to.have.length(1);
		expect(wrapper.find("button.properties-remove-fields-button")).to.have.length(1);
		expect(wrapper.find("tr.column-select-table-row")).to.have.length(3);
	});

	it("should select add columns button and openFieldPicker should be invoked", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SelectColumns
					control={control}
					controller={controller}
					propertyId={propertyId}
					openFieldPicker={openFieldPickerSpy}
				/>
			</Provider>
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
			<Provider store={controller.getStore()}>
				<SelectColumns
					control={control}
					controller={controller}
					propertyId={propertyId}
					openFieldPicker={openFieldPickerSpy}
					rightFlyout
				/>
			</Provider>
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
			<Provider store={controller.getStore()}>
				<SelectColumns
					control={control}
					controller={controller}
					propertyId={propertyId}
					openFieldPicker={openFieldPickerSpy}
					rightFlyout
				/>
			</Provider>
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
		expect(heightStyle).to.eql({ "height": "9em" });
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
		expect(heightStyle).to.eql({ "height": "15em" });
	});
});

describe("selectcolumns control functions correctly in a table", () => {
	let wrapper;
	let scController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
		scController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should not display invalid fields warnings for selectColumns control in a table", () => {
		// open the summary on_panel and add a row to the table
		const summaryPanelWrapper = wrapper.find("div[data-id='properties-selectcolumns-tables-structurelist-summary']");
		summaryPanelWrapper.find("button").simulate("click");

		// select the add column button
		let tableWrapper = wrapper.find("div[data-id='properties-ft-structurelist_sub_panel']");
		expect(tableWrapper.length).to.equal(1);
		const addFieldsButtons = tableWrapper.find("button.properties-add-fields-button"); // add row button
		addFieldsButtons.at(0).simulate("click"); // add row button

		// Need to reassign tableWrapper after adding row.
		tableWrapper = wrapper.find("div[data-id='properties-ft-structurelist_sub_panel']");
		const editButton = tableWrapper.find(".properties-subpanel-button").at(0);
		editButton.simulate("click"); // open the subpanel for the added row

		const fieldPicker = propertyUtils.openFieldPicker(wrapper, "properties-ft-fields2");
		propertyUtils.fieldPicker(fieldPicker, ["Na"]);

		// There should be no error messages
		expect(scController.getErrorMessages()).to.eql({});
	});

});

describe("measurement icons should be rendered correctly in selectcolumns", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnsParamDef);
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});
	fit("measurement icons should render in selectcolumns control if dm_image is enabled", () => {
		const tableWrapper = wrapper.find("div[data-id='properties-ft-fields1_panel']");
		expect(tableWrapper.find("div.properties-field-type-icon")).to.have.length(1);
	});
	it("measurement icons should render in fieldpicker of selectcolumns control where dm_image is set to measure", () => {
		const tableWrapper = wrapper.find("div[data-id='properties-ft-fields1_panel']");
		expect(tableWrapper.find("div.properties-field-type-icon")).to.have.length(1);
	});
});
