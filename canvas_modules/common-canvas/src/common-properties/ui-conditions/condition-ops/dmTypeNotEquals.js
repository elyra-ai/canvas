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

import logger from "./../../../../utils/logger";
import { getMetadataFieldMatch } from "./../conditions-utils.js";

function op() {
	return "dmTypeNotEquals";
}


/**
 * Find the metadata for the given field and return if it matches the given data type
 * @param {Object} paramInfo first entry in the globals row, and the name of the desired field is a string attribute
 * @param {Object} paramInfo2 alternate parameter for the target data type. Use value instead if possible.
 * @param {Object} value the target data type we are comparing the field to
 * @param {Object} controller properties controller
 */
function evaluate(paramInfo, param2Info, value, controller) {
	if (paramInfo.control.role !== "column") {
		logger.warn("Condition Operator dmTypeNotEquals only intended for use on columns");
	}
	const metadata = controller.getDatasetMetadataFields();
	var target = null;
	if (param2Info !== null && typeof param2Info !== "undefined" && param2Info.value !== null) {
		if (param2Info.control.role === "column") {
			target = getMetadataFieldMatch(param2Info, metadata, "type");
		}
		if (target === null) {
			target = param2Info.value;
		}
	} else if (value !== null && typeof value !== "undefined") {
		target = value;
	} else {
		return false;
	}
	if (!metadata) {
		return false;
	}
	if (typeof paramInfo.value === "string" || typeof paramInfo.value === "object") {
		var fieldType = getMetadataFieldMatch(paramInfo, metadata, "type");
		return fieldType !== target;
	} else if (typeof paramInfo.value !== "undefined") {
		logger.warn("dmTypeNotEquals cannot handle the given type: " + typeof paramInfo.value);
	}
	return false;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
