/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../../_utils_/property-utils";
import customControlParamDef from "../../test_resources/paramDefs/custom-ctrl-op_paramDef.json";
import { expect } from "chai";

describe("custom control renders correctly", () => {
	var wrapper;
	var controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(customControlParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show the correct custom controls", () => {
		const customToggles = wrapper.find("div.custom-toggle");
		expect(customToggles).to.have.length(3);// includes table toggles
		const tableCustomToggles = wrapper.find("tr.table-row div.custom-toggle");
		expect(tableCustomToggles).to.have.length(2);
		// This summary text comes from the custom control
		const cellText = wrapper.find("div.properties-table-cell-control div.text");
		expect(cellText).to.have.length(2);
		expect(cellText.at(0).text()).to.equal("20-low");
		expect(cellText.at(1).text()).to.equal("50-high");
	});
	it("updating custom controls should work correctly", () => {
		let tableToggle = wrapper.find("input#structuretable_1_1");
		tableToggle.getDOMNode().checked = false;
		tableToggle.simulate("change");
		const customToggle = wrapper.find("input#custom_toggle");
		customToggle.getDOMNode().checked = false;
		customToggle.simulate("change");
		expect(controller.getPropertyValue({ name: "custom_toggle" })).to.equal(false);
		expect(controller.getPropertyValue({ name: "structuretable", row: 1, col: 1 })).to.equal(false);
		expect(controller.getPropertyValue({ name: "structuretable", row: 0, col: 1 })).to.equal(false);
		tableToggle = wrapper.find("input#structuretable_0_1");
		tableToggle.getDOMNode().checked = true;
		tableToggle.simulate("change");
		expect(controller.getPropertyValue({ name: "structuretable", row: 0, col: 1 })).to.equal(true);
	});
	it("validate custom table is rendered below standard table", () => {
		let customTable = wrapper.find("div.custom-table");
		expect(customTable).to.have.length(0);
		const tableData = wrapper.find("tbody.reactable-data").children();
		const row = tableData.at(0).find("input")
			.at(0);
		row.getDOMNode().checked = true;
		row.simulate("change"); // Select Row
		customTable = wrapper.find("div.custom-table");
		expect(customTable).to.have.length(1);
		const rows = customTable.find("tr");
		// table should have 1 data row and a header row
		expect(rows).to.have.length(2);
	});
});
