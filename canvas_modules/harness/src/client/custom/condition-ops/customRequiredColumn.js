/*
 * Copyright 2017-2025 Elyra Authors
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

let cachedCheckbox = null;
let cachedTableData = null;

function op() {
	return "customRequiredColumn";
}

/**
 * Custom condition to toggle "required" column based on checkbox
 *
 * @param {Object} paramInfo checkbox property
 * @param {Object} param2Info table cell property. Example, for myTable, column conditions on that table are referred to using myTable[0], myTable[1], etc.
 * @param {Object} controller The properties controller
 * @return {Boolean}
 */
function evaluate(paramInfo, param2Info, value, controller) {
	// Check if table is empty
	const tableValue = controller.getPropertyValue({ name: param2Info.id.name });
	const emptyTable = tableValue.length === 0;

	const runAllCellValidation = (cachedCheckbox !== paramInfo.value) || (cachedTableData !== JSON.stringify(tableValue));
	cachedCheckbox = paramInfo.value;
	cachedTableData = JSON.stringify(tableValue);

	if (runAllCellValidation && Array.isArray(tableValue)) {
		tableValue.forEach((row, idx) => {
			controller.validateInput({ name: param2Info.id.name, row: idx, col: param2Info.id.col }); // validate all fields in table
		});
	}

	// When checkbox is checked, show error message if param2Info value is empty
	if (paramInfo.value && !emptyTable) {
		const dataType = typeof param2Info.value;
		switch (dataType) {
		case "undefined":
			return false;
		case "string":
			return param2Info.value.length !== 0;
		case "number":
			return param2Info.value !== null;
		case "object":
			if (param2Info.value === null) {
				return false;
			}
			const column = param2Info.id.col; // eslint-disable-line  no-case-declarations
			return param2Info.value[column] !== null && typeof param2Info.value[column] !== "undefined";
		default:
			return true;
		}
	}

	// When checkbox is unchecked, don't show any error message
	return true;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
