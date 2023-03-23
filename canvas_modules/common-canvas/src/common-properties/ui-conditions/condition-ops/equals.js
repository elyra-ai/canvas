/*
 * Copyright 2017-2022 Elyra Authors
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

function op() {
	return "equals";
}

function evaluate(paramInfo, param2Info, value, controller) {
	if (paramInfo.control.controlType !== "passwordfield") {
		const dataType = typeof paramInfo.value;
		if (param2Info) {
			if (paramInfo.value === null || param2Info.value === null) {
				return paramInfo.value === param2Info.value;
			}
			switch (dataType) {
			case "undefined":
			case "boolean":
			case "number":
				return paramInfo.value === param2Info.value;
			case "string":
				return paramInfo.value.trim() === param2Info.value.trim();
			case "object":
				if (paramInfo.value instanceof Date) {
					return new Date(paramInfo.value).getTime() === new Date(param2Info.value).getTime();
				}
				return JSON.stringify(paramInfo.value) === JSON.stringify(param2Info.value);
			default:
				logger.warn("Ignoring condition operation 'equals' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		} else if (typeof value !== "undefined") {
			if (paramInfo.value === null || value === null) {
				return paramInfo.value === value;
			}
			switch (dataType) {
			case "undefined":
			case "boolean":
			case "number":
				return paramInfo.value === value;
			case "string":
				return paramInfo.value.trim() === value.toString().trim();
			case "object":
				if (paramInfo.value instanceof Date) {
					return new Date(paramInfo.value).getTime() === new Date(value).getTime();
				}
				return JSON.stringify(paramInfo.value) === JSON.stringify(value);
			default:
				logger.warn("Ignoring condition operation 'equals' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		}
		throw new Error("Insufficient parameter for condition operation equals");
	}
	logger.warn("Ignoring unsupported condition operation 'equals' for control type " + paramInfo.control.controlType);
	return true;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
