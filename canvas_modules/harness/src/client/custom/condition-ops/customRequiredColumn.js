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
	// When checkbox is checked, show error message if param2Info value is empty
	if (paramInfo.value) {
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
			const column = param2Info.id.col;
			return param2Info.value[column] !== null && typeof param2Info.value[column] !== "undefined";
		default:
			// console.log("Ignoring condition operation 'customRequiredColumn' for parameter_ref " + param2Info.param + " with input data type " + dataType);
			return true;
		}
	}

	// When checkbox is unchecked, don't show any error message
	return true;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
