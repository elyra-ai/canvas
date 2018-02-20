/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../../_utils_/property-utils";
import customControlParamDef from "../../test_resources/paramDefs/custom_paramDef.json";
import { expect } from "chai";

describe("custom control renders correctly", () => {
	var wrapper;
	var controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(JSON.parse(JSON.stringify(customControlParamDef)));
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show the correct custom controls", () => {
		const customCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // CUSTOM category
		const customToggles = customCategory.find(".custom-toggle");
		expect(customToggles).to.have.length(3);// includes table toggles
		const tableCustomToggles = customCategory.find(".table-row .custom-toggle");
		expect(tableCustomToggles).to.have.length(2);
		// This summary text comes from the custom control
		const cellText = customCategory.find(".table-text .text");
		expect(cellText).to.have.length(2);
		expect(cellText.at(0).text()).to.equal("20-low");
		expect(cellText.at(1).text()).to.equal("50-high");
	});
	it("updating custom controls should work correctly", () => {
		const customCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // CUSTOM category
		let customToggle = customCategory.find("#structuretable_1_1");
		customToggle.simulate("change", { target: { checked: false } });
		customToggle = customCategory.find("#custom_toggle");
		customToggle.simulate("change", { target: { checked: false } });
		expect(controller.getPropertyValue({ name: "custom_toggle" })).to.equal(false);
		expect(controller.getPropertyValue({ name: "structuretable", row: 1, col: 1 })).to.equal(false);
		expect(controller.getPropertyValue({ name: "structuretable", row: 0, col: 1 })).to.equal(false);
		customToggle = customCategory.find("#structuretable_0_1");
		customToggle.simulate("change", { target: { checked: true } });
		expect(controller.getPropertyValue({ name: "structuretable", row: 0, col: 1 })).to.equal(true);
	});
	it("validate custom table is rendered below standard table", () => {
		const customCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // CUSTOM category
		let customTable = customCategory.find(".custom-table");
		expect(customTable).to.have.length(0);
		const row = customCategory.find(".table-row");
		row.at(0).simulate("click");
		customTable = customCategory.find(".custom-table");
		expect(customTable).to.have.length(1);
		const rows = customTable.find("tr");
		// table should have 1 data row and a header row
		expect(rows).to.have.length(2);
	});
});
