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
import { fieldValueMatchesProto } from "./../../util/property-utils.js";
import { isEmpty } from "lodash";

function op() {
	return "colDoesExists";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const dataModelFields = controller.getDatasetMetadataFields();
	if (!dataModelFields) {
		return false;
	}

	const controlType = paramInfo.control.controlType;
	switch (controlType) {
	case "selectcolumns":
	case "selectcolumn": {
		if (Array.isArray(paramInfo.value) && typeof paramInfo.control.editStyle !== "undefined") { // Control is inside a table.
			if (paramInfo.value.length > 0) {
				let allValid = true;
				paramInfo.value.forEach((paramValue) => {
					allValid = allValid && typeof valueInDataset(dataModelFields, paramValue) !== "undefined";
				});
				return allValid;
			}
			return true;
		}
		return typeof valueInDataset(dataModelFields, paramInfo.value) !== "undefined";
	}
	default:
		logger.warn("Ignoring unsupported condition operation 'colDoesExists' for control type " + controlType);
		return true;
	}
}

// Return the field if found in dataset, else undefined
function valueInDataset(dataset, field) {
	// Don't validate empty, null or undefined value
	return (
		(typeof field === "undefined" || field === null || isEmpty(field))
			? true
			: dataset.find(function(dataModelField) {
				return fieldValueMatchesProto(field, dataModelField);
			})
	);
}


// Public Methods ------------------------------------------------------------->

export { op, evaluate };
