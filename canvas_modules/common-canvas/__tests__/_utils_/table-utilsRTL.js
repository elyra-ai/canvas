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

function getTableHeaderRows(container) {
	return container.querySelectorAll("div[data-role='properties-header-row']");
}

function getTableRows(container) {
	const rows = within(container).getAllByRole("row");
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
* @param col - index of column to sort
*/
function clickHeaderColumnSort(container, col) {
	const sortable = container.querySelectorAll(".ReactVirtualized__Table__sortableHeaderColumn");
	fireEvent.click(sortable[col]);
}

function selectCheckboxes(container, rows) {
	const checkboxes = getTableRows(container);
	//  find(".properties-vt-row-checkbox");

	for (const row of rows) {
		const checkbox = checkboxes[row].querySelector(".properties-vt-row-checkbox");
		fireEvent.mouseEnter(checkbox);
		fireEvent.mouseDown(checkbox);
		fireEvent.mouseLeave(checkbox);
	}
}

function validateSelectedRowNum(rows) {
	const res = [];
	for (const row of rows) {
		const checkboxes = row.querySelectorAll("input[type='checkbox']");
		for (const checkbox of checkboxes) {
			if (checkbox.checked === true) {
				res.push(checkbox);
			}
		}
	}
	return res;
}

module.exports = {
	getTableHeaderRows: getTableHeaderRows,
	getTableRows: getTableRows,
	clickTableRows: clickTableRows,
	clickHeaderColumnSort: clickHeaderColumnSort,
	selectCheckboxes: selectCheckboxes,
	validateSelectedRowNum: validateSelectedRowNum
};
