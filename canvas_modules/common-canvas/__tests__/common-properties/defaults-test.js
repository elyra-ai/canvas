/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../_utils_/property-utils";
import defaultsParamDef from "../test_resources/paramDefs/defaults_paramDef.json";
import { ReactWrapper } from "enzyme";
import { expect } from "chai";

// base test cases
describe("default values renders correctly", () => {
	var wrapper;
	// var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(defaultsParamDef);
		wrapper = renderedObject.wrapper;
		// renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("should render number field with default value", () => {
		const defaultField = wrapper.find("#editor-control-default_num");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("25");
	});
	it("should render 0 number field with no default value", () => {
		const defaultField = wrapper.find("#editor-control-noDefault_num");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("0");
	});
	it("should render string field with default value", () => {
		const defaultField = wrapper.find("#editor-control-default_text");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("This is a default text");
	});
	it("should render an empty string field with no default value", () => {
		const defaultField = wrapper.find("#editor-control-noDefault_text");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("");
	});
	it("should render array field with default value", () => {
		const defaultField = wrapper.find("#editor-control-default_array");
		expect(defaultField).to.have.length(1);
		expect(defaultField.text()).to.equal("a\nb");
	});
	it("should render an empty array field with no default value", () => {
		const defaultField = wrapper.find("#editor-control-noDefault_array");
		expect(defaultField).to.have.length(1);
		expect(defaultField.text()).to.equal("");
	});
	it("should render array field with default value", () => {
		const defaultField = wrapper.find("#editor-control-default_undefined");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("This is an undefined parameter");
	});
	it("should render string field with a parameter_ref default value", () => {
		const defaultField = wrapper.find("#editor-control-default_parameterRef");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("this is the control value");
	});
	it("should render an empty string field with no parameter_ref default value", () => {
		const defaultField = wrapper.find("#editor-control-noDefault_parameterRef");
		expect(defaultField).to.have.length(1);
		expect(defaultField.prop("value")).to.equal("");
	});
});

// tables test cases
describe("add rows in tables with correct default values", () => {

	var wrapper;
	var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(defaultsParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("should render datamodel table with new rows with correct default values", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(0); // Summary link Default datamodel fields
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const tableHtml = document.getElementById("flexible-table-field_types"); // needed since modal dialogs are outside `wrapper`
		const table = new ReactWrapper(tableHtml, true);
		const tableRows = table.find(".table-row");
		expect(tableRows).to.have.length(4);
		const rowOne = tableRows.at(0);
		expect(rowOne.find(".Dropdown-placeholder").text()).to.equal("integer");
		const rowTwo = tableRows.at(1);
		expect(rowTwo.find(".Dropdown-placeholder").text()).to.equal("string");
		const rowThree = tableRows.at(2);
		expect(rowThree.find(".Dropdown-placeholder").text()).to.equal("password");
		const rowFour = tableRows.at(2);
		expect(rowFour.find(".Dropdown-placeholder").text()).to.equal("password");
	});

	it("should render structure list editor table with new rows with correct default values", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(1); // Summary link Default Structure List Editor
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const modelHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const modalWrapper = new ReactWrapper(modelHtml, true);
		const table = modalWrapper.find("#flexible-table-structureListEditorDefault");
		let tableRows = table.find(".table-row");
		expect(tableRows).to.have.length(1);
		const rowOne = tableRows.at(0);
		expect(rowOne.find(".toggletext_text").text()).to.equal("Ascending");

		// add a row
		const addButton = table.find("#add-fields-button");
		addButton.simulate("click");
		tableRows = table.find(".table-row");
		expect(tableRows).to.have.length(2);
		const rowTwo = tableRows.at(1);
		expect(rowTwo.find(".toggletext_text").text()).to.equal("Ascending");

		// change the parameter_ref control value and then add a new row.
		const radioButton = modalWrapper.find("input[value='Descending'][name='sLE_DefaultSortOrder']");
		radioButton.simulate("change", { target: { checked: true, value: "Descending" } });
		expect(renderedController.getPropertyValue({ name: "sLE_DefaultSortOrder" })).to.equal("Descending");
		addButton.simulate("click");
		tableRows = table.find(".table-row");
		expect(tableRows).to.have.length(3);
		const rowThree = tableRows.at(2);
		expect(rowThree.find(".toggletext_text").text()).to.equal("Descending");
	});

	it("should render column structure table with new rows with correct default values", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(2); // Summary link Default Parameter Structure Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const modelHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const modalWrapper = new ReactWrapper(modelHtml, true);
		const table = modalWrapper.find("#flexible-table-columnStructureTableDefault");
		let tableRows = table.find(".table-row");
		expect(tableRows).to.have.length(0);

		// add a row
		const addFieldsButtons = modalWrapper.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker
		propertyUtils.fieldPicker(["Age"]);
		modalWrapper.find("#properties-apply-button").simulate("click");
		tableRows = table.find(".table-row");
		expect(tableRows).to.have.length(1);
		const rowOne = tableRows.at(0);
		expect(rowOne.find(".toggletext_text").text()).to.equal("Ascending");

		// change the parameter_ref control value and then add a new row.
		const radioButton = modalWrapper.find("input[value='Descending'][name='CST_DefaultSortOrder']");
		radioButton.simulate("change", { target: { checked: true, value: "Descending" } });
		expect(renderedController.getPropertyValue({ name: "CST_DefaultSortOrder" })).to.equal("Descending");
		addFieldsButtons.at(0).simulate("click"); // open filter picker
		propertyUtils.fieldPicker(["Sex"]);
		modalWrapper.find("#properties-apply-button").simulate("click");
		tableRows = table.find(".table-row");
		expect(tableRows).to.have.length(2);
		const rowTwo = tableRows.at(1);
		expect(rowTwo.find(".toggletext_text").text()).to.equal("Descending");
	});

	it("should render column structure table where new rows have correct defaultRow", () => {
		const tableSummary = wrapper.find(".control-summary-link-buttons").at(3); // Summary link Default Row Structure Table
		tableSummary.find("a").simulate("click"); // open the summary panel (modal)
		const modelHtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const modalWrapper = new ReactWrapper(modelHtml, true);
		const table = modalWrapper.find("#flexible-table-columnStructureTableDefaultRow");
		let tableRows = table.find(".table-row");
		expect(tableRows).to.have.length(2);

		// add a row
		const addFieldsButtons = modalWrapper.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker
		propertyUtils.fieldPicker(["Sex"]);
		modalWrapper.find("#properties-apply-button").simulate("click");
		tableRows = table.find(".table-row");
		expect(tableRows).to.have.length(3);

		const expectedRows = [
			["Age", "Mean"],
			["BP", "Mean, Min, Max"],
			["Sex", "Min, Max"]
		];

		for (let idx = 0; idx < tableRows.length; idx++) {
			const tableCell = tableRows.at(idx).find("td");
			expect(tableCell.at(0).text()).to.equal(expectedRows[idx][0]);
			expect(tableCell.at(1).text()).to.equal(expectedRows[idx][1]);
		}
	});
});
