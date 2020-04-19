/*
 * Copyright 2017-2020 IBM Corporation
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

import { expect } from "chai";


function openFieldPicker(wrapper, dataIdName) {
	const tableWrapper = wrapper.find("div[data-id=\"" + dataIdName + "\"]");
	const addFieldsButtons = tableWrapper.find("button.properties-add-fields-button"); // field picker buttons
	addFieldsButtons.at(0).simulate("click"); // open filter picker
	return wrapper.find("div.properties-fp-table");
}

// expectedFields is optional
// fieldsToSelect is an array of field names or objects with name and schema. ex: { "name": "age", "schema": "schema1" }
function fieldPicker(fieldpickerWrapper, fieldsToSelect, expectedFields) {
	const rows = getTableRows(fieldpickerWrapper);
	if (expectedFields) {
		expect(rows).to.have.length(expectedFields.length);
		for (let i = 0; i < expectedFields.length; ++i) {
			if (typeof expectedFields[i] === "object") {
				const fieldName = rows.at(i).find(".properties-fp-field-name")
					.text();
				expect(fieldName).to.equal(expectedFields[i].name);
				const fieldSchema = rows.at(i).find(".properties-fp-schema").length > 0
					? rows.at(i).find(".properties-fp-schema")
						.text()
					: null;
				expect(fieldSchema).to.equal(expectedFields[i].schema);
			} else {
				const field = rows.at(i).find(".properties-fp-field-name")
					.text();
				expect(field).to.equal(expectedFields[i]);
			}
		}
	}
	for (const field of fieldsToSelect) {
		let schemaName = null;
		let fieldName = null;
		if (field.indexOf(".") !== -1) { // If field to select with name and schema
			schemaName = field.split(".")[0];
			fieldName = field.split(".")[1];
		} else {
			fieldName = field;
		}
		for (let i = 0; i < rows.length; i++) {
			const currField = rows.at(i).find(".properties-fp-field-name")
				.text();
			let currSchema = null;
			if (schemaName) {
				currSchema = rows.at(i).find(".properties-fp-schema").length > 0
					? rows.at(i).find(".properties-fp-schema")
						.text()
					: null;
			}
			if (currField === fieldName && currSchema === schemaName) {
				const checkbox = rows.at(i).find(".properties-vt-row-checkbox");
				expect(checkbox).to.have.length(1);
				checkbox.simulate("mouseEnter");
				checkbox.simulate("mouseDown");
				checkbox.simulate("mouseLeave");
				break;
			}
		}
	}
	fieldpickerWrapper.find("button[data-id='properties-apply-button']").simulate("click"); // applies the field picker
}

function verifyFieldPickerRow(row, field, schema) {
	expect(row.find(".properties-fp-field-name")
		.text()).to.equal(field);
	expect(row.find(".properties-fp-schema")
		.text()).to.equal(schema);
}

function getTableHeaderRows(wrapper) {
	return wrapper.find("div[role='properties-header-row']");
}

function getTableRows(wrapper) {
	return wrapper.find("div[role='properties-data-row']");
}

/*
* @param wrapper
* @param rows - array of row numbers to check
*/
function clickTableRows(wrapper, rows) {
	const tableRows = getTableRows(wrapper);
	for (const row of rows) {
		tableRows.at(row).simulate("mouseEnter");
		tableRows.at(row).simulate("mouseDown");
		tableRows.at(row).simulate("mouseLeave");
	}
	wrapper.update();
}

/*
* @param wrapper
* @param rows - array of row numbers to check
*/
function dblClickTableRows(wrapper, rows) {
	const tableRows = wrapper.find(".properties-vt-double-click");
	for (const row of rows) {
		tableRows.at(row).simulate("dblclick");
	}
}

/*
* @param wrapper
* @param col - index of column to sort
*/
function clickHeaderColumnSort(wrapper, col) {
	const sortable = wrapper.find(".ReactVirtualized__Table__sortableHeaderColumn");
	sortable.at(col).simulate("click");
}

/*
* @param wrapper
* @param rows - array of row numbers to check
*/
function selectCheckboxes(wrapper, rows) {
	const checkboxes = getTableRows(wrapper).find(".properties-vt-row-checkbox");
	for (const row of rows) {
		checkboxes.at(row).simulate("mouseEnter");
		checkboxes.at(row).simulate("mouseDown");
		checkboxes.at(row).simulate("mouseLeave");
	}
}

/*
* Select the checkbox from the table header that is the `Select row` column
*  This is usually the first column
* @param wrapper
*/
function selectHeaderCheckbox(wrapper) {
	const checkbox = getTableHeaderRows(wrapper)
		.find(".properties-vt-header-checkbox");
	checkbox.simulate("mouseEnter");
	checkbox.simulate("mouseDown");
	checkbox.simulate("mouseLeave");
}

/*
* Select the checkbox from the table header that is not the `Select row` column
* @param wrapper
* @param index - the column index that contains a checkbox to select
* @param checked - true to select the checkbox, false to deselect checkbox
*/
function selectHeaderColumnCheckbox(wrapper, index, checked) {
	const columns = getTableHeaderRows(wrapper)
		.find(".properties-vt-column");
	const column = columns.at(index);
	const tableCheckboxHeader = column.find(".tooltip-trigger").find("input");
	tableCheckboxHeader.simulate("change", { target: { checked: checked } });
}

/*
* Select the FieldPicker checkbox to select all rows
* @param wrapper
*/
function selectFieldPickerHeaderCheckbox(wrapper) {
	const checkbox = getTableHeaderRows(wrapper)
		.find(".properties-vt-header-checkbox")
		.find("input");
	checkbox.simulate("change", { target: { checked: true } });
}

function validateSelectedRowNum(wrapper) {
	return wrapper.find("input[type='checkbox']").filterWhere((checkBox) => checkBox.prop("checked") === true);
}


module.exports = {
	openFieldPicker: openFieldPicker,
	fieldPicker: fieldPicker,
	verifyFieldPickerRow: verifyFieldPickerRow,
	getTableHeaderRows: getTableHeaderRows,
	getTableRows: getTableRows,
	clickTableRows: clickTableRows,
	dblClickTableRows: dblClickTableRows,
	clickHeaderColumnSort: clickHeaderColumnSort,
	selectHeaderCheckbox: selectHeaderCheckbox,
	selectCheckboxes: selectCheckboxes,
	selectHeaderColumnCheckbox: selectHeaderColumnCheckbox,
	selectFieldPickerHeaderCheckbox: selectFieldPickerHeaderCheckbox,
	validateSelectedRowNum: validateSelectedRowNum
};
