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

import { fireEvent, within } from "@testing-library/react";
import { expect } from "chai";

function openFieldPicker(container, dataIdName) {
	const tableWrapper = container.querySelector("div[data-id=\"" + dataIdName + "\"]");
	const addFieldsButtons = tableWrapper.querySelector("button.properties-add-fields-button"); // field picker buttons
	fireEvent.click(addFieldsButtons);
	return container.querySelector("div.properties-fp-table");
}

// When table has 0 rows, click on Add columns button to open FieldPicker
function openFieldPickerForEmptyTable(container, dataIdName) {
	const tableWrapper = container.querySelector("div[data-id=\"" + dataIdName + "\"]");
	const emptyTableButton = tableWrapper.querySelector("button.properties-empty-table-button");
	fireEvent.click(emptyTableButton); // open field picker
	return container.querySelector("div.properties-fp-table");
}

// expectedFields is optional
// fieldsToSelect is an array of field names or objects with name and schema. ex: { "name": "age", "schema": "schema1" }
function fieldPicker(fieldpickerContainer, fieldsToSelect, expectedFields) {
	const rows = getTableRows(fieldpickerContainer);
	if (expectedFields) {
		expect(rows).to.have.length(expectedFields.length);
		for (let i = 0; i < expectedFields.length; ++i) {
			if (typeof expectedFields[i] === "object") {
				const fieldName = rows[i].querySelector(".properties-fp-field-name")
					.textContent;
				expect(fieldName).to.equal(expectedFields[i].name);
				const fieldSchema = rows[i].querySelectorAll(".properties-fp-schema").length > 0
					? rows[i].querySelector(".properties-fp-schema")
						.textContent
					: null;
				expect(fieldSchema).to.equal(expectedFields[i].schema);
			} else {
				const field = rows[i].querySelector(".properties-fp-field-name")
					.textContent;
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
			const currField = rows[i].querySelector(".properties-fp-field-name")
				.textContent;
			let currSchema = null;
			if (schemaName) {
				currSchema = rows[i].querySelectorAll(".properties-fp-schema").length > 0
					? rows[i].querySelector(".properties-fp-schema")
						.textContent
					: null;
			}
			if (currField === fieldName && currSchema === schemaName) {
				const checkbox = rows[i].querySelector(".properties-vt-row-checkbox");
				expect(checkbox).to.exist;
				fireEvent.mouseEnter(checkbox);
				fireEvent.mouseDown(checkbox);
				fireEvent.mouseLeave(checkbox);
				break;
			}
		}
	}
	fireEvent.click(fieldpickerContainer.querySelector("button[data-id='properties-apply-button']")); // applies the field picker
}

function verifyFieldPickerRow(row, field, schema) {
	expect(row.querySelector(".properties-fp-field-name").textContent).to.equal(field);
	expect(row.querySelector(".properties-fp-schema").textContent).to.equal(schema);
}

function getTableHeaderRows(container) {
	return container.querySelectorAll("div[data-role='properties-header-row']");
}

function getTableRows(container) {
	if (!container) {
		return [];
	}
	let rows;
	try {
		rows = within(container).getAllByRole("row");
	} catch (error) {
		rows = Array.from(container.querySelectorAll(".properties-data-row"));
	}
	const res = [];
	for (let i = 0; i < rows.length; i++) {
		if (rows[i].outerHTML.includes("properties-data-row")) {
			res.push(rows[i]);
		}
	}
	return res;
}

function clickTableRows(container, rows) {
	const tableRows = getTableRows(container);
	for (const row of rows) {
		fireEvent.mouseEnter(tableRows[row]);
		fireEvent.mouseDown(tableRows[row]);
		fireEvent.mouseLeave(tableRows[row]);
	}
}

/*
* @param wrapper
* @param rows - array of row numbers to check
*/
function dblClickTableRows(container, rows) {
	const tableRows = container.querySelectorAll(".properties-vt-double-click");
	for (const row of rows) {
		fireEvent.dblClick(tableRows[row]);
	}
}


/*
* @param wrapper
* @param col - index of column to sort
*/
function clickHeaderColumnSort(container, col) {
	const sortable = container.querySelectorAll(".ReactVirtualized__Table__sortableHeaderColumn");
	fireEvent.click(sortable[col]);
}

function selectCheckboxes(container, rows) {
	let checkboxes;
	if (container.length > 0) {
		checkboxes = container;
	} else {
		checkboxes = getTableRows(container);
	}

	for (const row of rows) {
		const checkbox = checkboxes[row].querySelector(".properties-vt-row-checkbox");
		fireEvent.mouseEnter(checkbox);
		fireEvent.mouseDown(checkbox);
		fireEvent.mouseLeave(checkbox);
	}
}

// Select checkbox using space or enter keys
function selectCheckboxesUsingKeyboard(container, rows) {
	const checkboxes = getTableRows(container);
	for (const row of rows) {
		const checkbox = checkboxes[row].querySelector(".properties-vt-row-checkbox");
		fireEvent.focus(checkbox);
		fireEvent.keyDown(checkbox, { code: "Enter" });
		fireEvent.blur(checkbox);
	}
}

function selectCheckboxesRows(tableRows, rows) {
	for (const row of rows) {
		const checkbox = tableRows[row].querySelector(".properties-vt-row-checkbox");
		fireEvent.mouseEnter(checkbox);
		fireEvent.mouseDown(checkbox);
		fireEvent.mouseLeave(checkbox);
	}
}

/*
* Select/deselect multiple rows by shift + selecting row number
* @param wrapper
* @param rows - single row number.
*/
function shiftSelectCheckbox(container, rowNumber) {
	const rows = getTableRows(container);
	const checkboxes = [];
	rows.forEach((row) => {
		checkboxes.push(row.querySelector(".properties-vt-row-checkbox"));
	});
	// row index start from 0 instead of 1 so subtract 1 from rowNumber
	fireEvent.mouseEnter(checkboxes[rowNumber - 1]);
	fireEvent.mouseDown(checkboxes[rowNumber - 1], { shiftKey: true });
	fireEvent.mouseLeave(checkboxes[rowNumber - 1]);
}

function shiftSelectCheckboxRows(rows, rowNumber) {
	const checkboxes = [];
	for (const row of rows) {
		checkboxes.push(row.querySelector(".properties-vt-row-checkbox"));
	}
	// row index start from 0 instead of 1 so subtract 1 from rowNumber
	fireEvent.mouseEnter(checkboxes[rowNumber - 1]);
	fireEvent.mouseDown(checkboxes[rowNumber - 1], { shiftKey: true });
	fireEvent.mouseLeave(checkboxes[rowNumber - 1]);
}

/*
* Select the checkbox from the table header that is not the `Select row` column
* @param wrapper
* @param index - the column index that contains a checkbox to select
* @param checked - true to select the checkbox, false to deselect checkbox
*/
function selectHeaderColumnCheckbox(container, index, checked) {
	const columns = getTableHeaderRows(container)[0]
		.querySelectorAll(".properties-vt-column");
	const column = columns[index];
	const tableCheckboxHeader = column.querySelector(".tooltip-trigger").querySelector("input");
	fireEvent.click(tableCheckboxHeader);
	if (!checked) {
		fireEvent.click(tableCheckboxHeader);
	}
}

function selectFieldPickerHeaderCheckbox(container) {
	const checkboxes = getTableHeaderRows(container);
	const checkbox = checkboxes[0].querySelector(".properties-vt-header-checkbox").querySelector("input");
	fireEvent.click(checkbox);
}

function validateSelectedRowNum(container) {
	const res = [];
	const rows = container.querySelectorAll("input[type='checkbox']");
	for (const row of rows) {
		if (row.checked === true) {
			res.push(row);
		}
	}
	return res;
}

function validateSelectedRowNumRows(rows) {
	const res = [];
	for (const row of rows) {
		const checkbox = row.querySelector("input[type='checkbox']");
		if (checkbox.checked === true) {
			res.push(checkbox);
		}
	}
	return res;
}

function validateSelectedCheckbox(checkboxes) {
	const res = [];
	for (const checkbox of checkboxes) {
		if (checkbox.checked === true) {
			res.push(checkbox);
		}
	}
	return res;
}

module.exports = {
	openFieldPicker: openFieldPicker,
	openFieldPickerForEmptyTable: openFieldPickerForEmptyTable,
	fieldPicker: fieldPicker,
	verifyFieldPickerRow: verifyFieldPickerRow,
	getTableHeaderRows: getTableHeaderRows,
	getTableRows: getTableRows,
	clickTableRows: clickTableRows,
	dblClickTableRows: dblClickTableRows,
	clickHeaderColumnSort: clickHeaderColumnSort,
	selectCheckboxes: selectCheckboxes,
	selectCheckboxesUsingKeyboard: selectCheckboxesUsingKeyboard,
	selectCheckboxesRows: selectCheckboxesRows,
	shiftSelectCheckbox: shiftSelectCheckbox,
	shiftSelectCheckboxRows: shiftSelectCheckboxRows,
	selectHeaderColumnCheckbox: selectHeaderColumnCheckbox,
	selectFieldPickerHeaderCheckbox: selectFieldPickerHeaderCheckbox,
	validateSelectedRowNum: validateSelectedRowNum,
	validateSelectedRowNumRows: validateSelectedRowNumRows,
	validateSelectedCheckbox: validateSelectedCheckbox,
};
