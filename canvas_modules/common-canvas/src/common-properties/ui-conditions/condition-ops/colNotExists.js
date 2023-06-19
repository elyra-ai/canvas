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

import logger from "./../../../../utils/logger";
import { fieldValueMatchesProto } from "./../../util/property-utils";
import { isEqual } from "lodash";
import { ParamRole } from "./../../constants/form-constants";

function op() {
	return "colNotExists";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const supportedControls = ["textfield"];
	if (supportedControls.indexOf(paramInfo.control.controlType) >= 0) {
		const dataModelFields = controller.getDatasetMetadataFields();
		if (!dataModelFields) {
			return true;
		}
		let columnExists = true;
		// check if there are any matching values in dataModel
		for (const field of dataModelFields) {
			if (fieldValueMatchesProto(paramInfo.value, field)) {
				columnExists = false;
				break;
			}
		}
		// check other columns in row and allow value to be same as `paramInfo` value.  Allows consumers to rename a field without showing an error.
		if (!columnExists) {
			const fieldColumnValues = _findFieldColumnValues(paramInfo, controller);
			for (const columnValue of fieldColumnValues) {
				if (isEqual(paramInfo.value, columnValue)) {
					columnExists = true;
					break;
				}
			}
		}
		return columnExists;
	}
	logger.warn("Ignoring unsupported condition operation 'colNotExists' for control type " + paramInfo.control.controlType);
	return true;
}

/*
* Finds all values in the same row as paramInfo and returns any with the role=column.
* An empty array is returned if not a table control.
*/
function _findFieldColumnValues(paramInfo, controller) {
	const fieldColumnValues = [];
	// If a cell value, check to see if any other columns have role=column
	if (typeof paramInfo.control.columnIndex !== "undefined") {
		const rowValue = controller.getPropertyValue({ name: paramInfo.id.name, row: paramInfo.id.row });
		if (Array.isArray(rowValue)) {
			rowValue.forEach((value, idx) => {
				if (idx !== paramInfo.control.columnIndex) { // skip paramInfo value
					const colControl = controller.getControl({ name: paramInfo.id.name, col: idx });
					if (colControl.role === ParamRole.COLUMN) {
						fieldColumnValues.push(value);
					}
				}
			});
		}
	}
	return fieldColumnValues;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
