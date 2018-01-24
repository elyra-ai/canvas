/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import propertyUtils from "../_utils_/property-utils";
import panelParamDef from "../test_resources/paramDefs/panel_paramDef.json";

describe("textPanel render correctly", () => {
	const wrapper = propertyUtils.flyoutEditorForm(panelParamDef);
	it("should have displayed correct number of textPanel elements", () => {
		const staticText = wrapper.find(".properties-text-panel");
		expect(staticText).to.have.length(4);
		const labels = wrapper.find(".panel-label");
		expect(labels).to.have.length(4);
		const descriptions = wrapper.find(".panel-description");
		expect(descriptions).to.have.length(4);
	});
	it("should have displayed correct text in textPanel elements", () => {
		const labels = wrapper.find(".panel-label");
		expect(labels.at(0).text()).to.equal("Oranges");
		let descriptions = wrapper.find(".panel-description");
		expect(descriptions.at(0).text()).to.equal("An orange tree can grow to reach 30 feet and live for over a hundred years.");
		expect(descriptions.at(1).text()).to.equal("Percent: 9.090909 with 6 decimals. Percent: 9.09 with 2 decimals");
		expect(descriptions.at(2).text()).to.equal("Sum: 22 with (number, number). Sum: 24 with (number, 2, number)");
		expect(descriptions.at(3).text()).to.equal("Apples ripen six to 10 times faster at room temperature than if they are refrigerated.");
		const input = wrapper.find("[type='number']");
		input.simulate("change", { target: { value: 0.52 } });
		descriptions = wrapper.find(".panel-description");
		expect(descriptions.at(1).text()).to.equal("Percent: 192.307692 with 6 decimals. Percent: 192.31 with 2 decimals");
		expect(descriptions.at(2).text()).to.equal("Sum: 1.04 with (number, number). Sum: 3.04 with (number, 2, number)");
	});
});
describe("columnSelection panel works correctly", () => {
	const wrapper = propertyUtils.flyoutEditorForm(panelParamDef);
	it("Select 'age' from 'Select Field' control", () => {
		const columnSelectionCategory = wrapper.find(".category-title-container-right-flyout-panel").at(2); // COLUMN SELECTION category
		const expectedOptions = [
			{ label: "...", value: "" },
			{ label: "age", value: "age" },
			{ label: "BP", value: "BP" },
			{ label: "Na", value: "Na" },
			{ label: "drug", value: "drug" }
		];
		const newValue = { label: "age", value: "age" };
		propertyUtils.dropDown(columnSelectionCategory, 0, newValue, expectedOptions);
	});
	it("Select 'BP' from 'Select Fields' control", () => {
		const columnSelectionCategory = wrapper.find(".category-title-container-right-flyout-panel").at(2); // COLUMN SELECTION category
		const addFieldsButtons = columnSelectionCategory.find("Button"); // field picker buttons
		addFieldsButtons.at(0).simulate("click"); // open filter picker for `Select Fields` control
		propertyUtils.fieldPicker(["BP"], ["BP", "Na", "drug"]);
		const rows = columnSelectionCategory.find(".column-select-table-row");
		expect(rows).to.have.length(1);
	});
});
