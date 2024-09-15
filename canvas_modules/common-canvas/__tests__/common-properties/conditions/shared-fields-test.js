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

import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import { expect } from "chai";
import sharedFieldsParamDef from "../../test_resources/paramDefs/sharedFields_paramDef.json";
import { fireEvent } from "@testing-library/react";


describe("Condition dmSharedFields test cases", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(sharedFieldsParamDef);
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});


	it("Test the available fields.", () => {
		const { container } = wrapper;
		// Validate the available fields in the selectColumns control
		let fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-input_fields");
		tableUtilsRTL.fieldPicker(fieldPicker, [], ["Age", "BP", "Cholesterol"]);

		// Validate the available fields in the table control
		const summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "structuretable_filter-summary-panel");
		fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-structuretable_filter");
		const tableRows = tableUtilsRTL.getTableRows(fieldPicker);
		expect(tableRows).to.have.length(3); // Other fields should be filtered out
		// close summary panel
		fireEvent.click(summaryPanel.querySelector("button.properties-apply-button"));

		// Check the available fields in the weight dropdown
		const weightDropDown = container.querySelector("div[data-id='properties-regression_weight_field']");
		const weightDropDownButton = weightDropDown.querySelector("button.cds--list-box__field");
		fireEvent.click(weightDropDownButton);
		const weightDropDownItems = container.querySelectorAll(".cds--list-box__menu-item__option");
		let options = [];
		weightDropDownItems.forEach((element) => {
			options.push(element.textContent);
		});
		let expectedOptions = ["...", "K", "BP"];
		expect(options).to.eql(expectedOptions);

		// Check the available fields in the offset dropdown
		const offsetDropDown = container.querySelector("div[data-id='properties-offset_field']");
		const offSetDropDownButton = offsetDropDown.querySelector("button.cds--list-box__field");
		fireEvent.click(offSetDropDownButton);
		const offsetDropDownItems = offsetDropDown.querySelectorAll(".cds--list-box__menu-item__option");
		options = [];
		offsetDropDownItems.forEach((element) => {
			options.push(element.textContent);
		});
		expectedOptions = ["...", "Na"];
		expect(options).to.eql(expectedOptions);
	});

	it("Test allow a change to a field to filter another field's choices.", () => {
		const { container } = wrapper;
		let selectedFields = tableUtilsRTL.getTableRows(container.querySelector("div[data-id='properties-input_fields']"));
		expect(selectedFields).to.have.length(2); // Age and Cholesterol already selected
		// Select another field `BP` in the selectColumns control
		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-input_fields");
		tableUtilsRTL.fieldPicker(fieldPicker, ["BP"], ["Age", "BP", "Cholesterol"]);
		selectedFields = tableUtilsRTL.getTableRows(container.querySelector("div[data-id='properties-input_fields']"));
		expect(selectedFields).to.have.length(3); // Age, BP, and Cholesterol selected

		const weightDropDown = container.querySelector("div[data-id='properties-regression_weight_field']");
		const weightDropDownButton = weightDropDown.querySelector("button.cds--list-box__field");
		fireEvent.click(weightDropDownButton);
		const weightDropDownItems = container.querySelectorAll(".cds--list-box__menu-item__option");
		const options = [];
		weightDropDownItems.forEach((element) => {
			options.push(element.textContent);
		});
		const expectedOptions = ["...", "K"];
		expect(options).to.eql(expectedOptions);
	});

	it("Shares fields between dmSharedFields and columnSelection panel", () => {
		const { container } = wrapper;
		// Validate the available fields in the selectColumns control
		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-column_selection_fields");
		tableUtilsRTL.fieldPicker(fieldPicker, [], ["Age", "Sex", "BP", "Na", "K", "Drug"]);

		// Check the available fields in the single chooser dropdown
		const weightDropDown = container.querySelector("div[data-id='properties-column_selection_chooser']");
		const weightDropDownButton = weightDropDown.querySelector("button.cds--list-box__field");
		fireEvent.click(weightDropDownButton);
		const weightDropDownItems = container.querySelectorAll(".cds--list-box__menu-item__option");
		let options = [];
		weightDropDownItems.forEach((element) => {
			options.push(element.textContent);
		});
		let expectedOptions = ["...", "Sex", "Cholesterol", "Na", "K", "Drug"];
		expect(options).to.eql(expectedOptions);

		// Check the available fields in the offset dropdown
		const offsetDropDown = container.querySelector("div[data-id='properties-dmSharedFields_chooser']");
		const offSetDropDownButton = offsetDropDown.querySelector("button.cds--list-box__field");
		fireEvent.click(offSetDropDownButton);
		const offsetDropDownItems = offsetDropDown.querySelectorAll(".cds--list-box__menu-item__option");
		options = [];
		offsetDropDownItems.forEach((element) => {
			options.push(element.textContent);
		});
		expectedOptions = ["...", "Age", "Sex", "BP", "Na", "K", "Drug"];
		expect(options).to.eql(expectedOptions);
	});
});
