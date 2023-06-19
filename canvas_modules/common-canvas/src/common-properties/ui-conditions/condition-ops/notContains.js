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
import { includes } from "lodash";

function op() {
	return "notContains";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const unsupportedControls = ["checkbox", "numberfield", "passwordfield", "datepicker", "datepickerRange"];
	if (unsupportedControls.indexOf(paramInfo.control.controlType) < 0) {
		const dataType = typeof paramInfo.value;
		if (typeof param2Info !== "undefined") {
			switch (dataType) {
			case "undefined":
				return true;
			case "string":
			case "object":
				return !includes(paramInfo.value, param2Info.value);
			default:
				logger.warn("Ignoring condition operation 'notContains' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		} else if (typeof value !== "undefined") {
			switch (dataType) {
			case "undefined":
				return true;
			case "string":
			case "object":
				return !includes(paramInfo.value, value);
			default:
				logger.warn("Ignoring condition operation 'notContains' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		}
		throw new Error("Insufficient parameter for condition operation notContains");
	}
	logger.warn("Ignoring unsupported condition operation 'notContains' for control type " + paramInfo.control.controlType);
	return true;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
