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

import { ControlType } from "../../constants/form-constants";
import logger from "./../../../../utils/logger";

function op() {
	return "lessThan";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const dataType = typeof paramInfo.value;
	switch (dataType) {
	case "undefined":
	case "number":
		if (typeof param2Info !== "undefined") {
			if (typeof param2Info.value !== "number") {
				return false;
			}
			return paramInfo.value < param2Info.value;
		} else if (typeof value !== "undefined") {
			if (value === null) {
				return true;
			}
			return paramInfo.value < value;
		}
		throw new Error("Insufficient parameter for condition operation 'lessThan'");
	case "object":
		if (paramInfo.value === null || param2Info.value === null || value === null) {
			return true;
		}
		return false;
	case "string": {
		if (paramInfo.control && paramInfo.control.controlType === ControlType.DATEPICKER) {
			const param1Date = new Date(paramInfo.value);
			if (!isNaN(param1Date) && param2Info) {
				const param2Date = new Date(param2Info.value);
				if (!isNaN(param2Date)) {
					return param1Date.getTime() < param2Date.getTime();
				}
				throw new Error("Insufficient parameter for condition operation 'lessThan'");
			} else if (!isNaN(param1Date) && value) {
				const valueDate = new Date(value);
				if (!isNaN(valueDate)) {
					return param1Date.getTime() < valueDate.getTime();
				}
				throw new Error("Insufficient parameter for condition operation 'lessThan'");
			}
			throw new Error("Insufficient parameter for condition operation 'lessThan'");
		}
		return true;
	}
	default:
		logger.warn("Ignoring condition operation 'lessThan' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
		return true;
	}
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
