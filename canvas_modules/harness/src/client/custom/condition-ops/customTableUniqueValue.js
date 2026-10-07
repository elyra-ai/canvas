/*
 * Copyright 2026 Elyra Authors
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

function op() {
	return "customTableUniqueValue";
}

/**
 * A custom validation condition that returns true when the cell value is unique
 * within its column across all rows of the parent table.
 *
 * @param {Object} paramInfo  { param, id, value, control }
 * @param {Object} param2Info unused
 * @param {Object} value      unused
 * @param {Object} controller The properties controller
 * @return {boolean} true if the value is unique (no validation error)
 */
function evaluate(paramInfo, param2Info, value, controller) {
	const propertyId = paramInfo.id;
	// propertyId.row and propertyId.col identify the current cell
	if (typeof propertyId.row === "undefined" || typeof propertyId.col === "undefined") {
		return true;
	}
	const tableValue = controller.getPropertyValue({ name: propertyId.name });
	if (!Array.isArray(tableValue)) {
		return true;
	}
	const cellValue = paramInfo.value;
	if (cellValue === null || typeof cellValue === "undefined" || cellValue === "") {
		return true;
	}
	const col = propertyId.col;
	const row = propertyId.row;
	for (let r = 0; r < tableValue.length; r++) {
		if (r !== row && Array.isArray(tableValue[r]) && tableValue[r][col] === cellValue) {
			return false;
		}
	}
	return true;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
