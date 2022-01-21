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
	return "greaterThan";
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
			return paramInfo.value > param2Info.value;
		} else if (typeof value !== "undefined") {
			if (value === null) {
				return true;
			}
			return paramInfo.value > value;
		}
		throw new Error("Insufficient parameter for condition operation 'greaterThan'");
	case "object":
		if (paramInfo.value === null || param2Info.value === null || value === null) {
			return true;
		}
		return false;
	default:
		logger.warn("Ignoring condition operation 'greaterThan' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
		return true;
	}
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
