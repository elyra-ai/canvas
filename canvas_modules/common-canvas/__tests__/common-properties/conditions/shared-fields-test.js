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

import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";
import { expect } from "chai";
import sharedFieldsParamDef from "../../test_resources/paramDefs/sharedFields_paramDef.json";


describe("Condition dmSharedFields test cases", () => {
	let wrapper;
	beforeEach(() => {
		// TODO revert this test to use rightFlyout once https://github.com/carbon-design-system/carbon/issues/16944 is fixed
		const renderedObject = propertyUtils.flyoutEditorForm(sharedFieldsParamDef, { rightFlyout: false, containerType: "Tearsheet" });
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});


	it("Test the available fields.", () => {
		// Validate the available fields in the selectColumns control
		let fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-input_fields");
		tableUtils.fieldPicker(fieldPicker, [], ["Age", "BP", "Cholesterol"]);

		// Validate the available fields in the table control
		// const summaryPanel = propertyUtils.openSummaryPanel(wrapper, "structuretable_filter-summary-panel");
		fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-structuretable_filter");
		const tableRows = tableUtils.getTableRows(fieldPicker);
		expect(tableRows).to.have.length(3); // Other fields should be filtered out
		// close summary panel
		// summaryPanel.find("button.properties-apply-button").simulate("click");

		// Check the available fields in the weight dropdown
		const weightDropDown = wrapper.find("div[data-id='properties-regression_weight_field'] Dropdown");
		let options = weightDropDown.prop("items"); // by Type
		let expectedOptions = [
			{ label: "...", value: "" },
			{ label: "K", value: "K" },
			{ label: "BP", value: "BP" }
		];
		expect(options).to.eql(expectedOptions);

		// Check the available fields in the offset dropdown
		const offsetDropDown = wrapper.find("div[data-id='properties-offset_field'] Dropdown");
		options = offsetDropDown.prop("items"); // by Type
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "Na", value: "Na" }
		];
		expect(options).to.eql(expectedOptions);
	});

	it("Test allow a change to a field to filter another field's choices.", () => {
		let selectedFields = tableUtils.getTableRows(wrapper.find("div[data-id='properties-input_fields']"));
		expect(selectedFields).to.have.length(2); // Age and Cholesterol already selected
		// Select another field `BP` in the selectColumns control
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ft-input_fields");
		tableUtils.fieldPicker(fieldPicker, ["BP"], ["Age", "BP", "Cholesterol"]);
		selectedFields = tableUtils.getTableRows(wrapper.find("div[data-id='properties-input_fields']"));
		expect(selectedFields).to.have.length(3); // Age, BP, and Cholesterol selected

		const weightDropDown = wrapper.find("div[data-id='properties-regression_weight_field'] Dropdown");
		const options = weightDropDown.prop("items"); // by Type
		const expectedOptions = [
			{ label: "...", value: "" },
			{ label: "K", value: "K" }
		];
		expect(options).to.eql(expectedOptions);
	});

	it("Shares fields between dmSharedFields and columnSelection panel", () => {
		// Validate the available fields in the selectColumns control
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-column_selection_fields");
		tableUtils.fieldPicker(fieldPicker, [], ["Age", "Sex", "BP", "Na", "K", "Drug"]);

		// Check the available fields in the single chooser dropdown
		const weightDropDown = wrapper.find("div[data-id='properties-column_selection_chooser'] Dropdown");
		let options = weightDropDown.prop("items"); // by Type
		let expectedOptions = [
			{ label: "...", value: "" },
			{ label: "Sex", value: "Sex" },
			{ label: "Cholesterol", value: "Cholesterol" },
			{ label: "Na", value: "Na" },
			{ label: "K", value: "K" },
			{ label: "Drug", value: "Drug" }
		];
		expect(options).to.eql(expectedOptions);

		// Check the available fields in the offset dropdown
		const offsetDropDown = wrapper.find("div[data-id='properties-dmSharedFields_chooser'] Dropdown");
		options = offsetDropDown.prop("items"); // by Type
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "Age", value: "Age" },
			{ label: "Sex", value: "Sex" },
			{ label: "BP", value: "BP" },
			{ label: "Na", value: "Na" },
			{ label: "K", value: "K" },
			{ label: "Drug", value: "Drug" }
		];
		expect(options).to.eql(expectedOptions);
	});
});
