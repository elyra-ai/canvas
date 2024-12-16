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

function op() {
	return "lengthEquals";
}

function evaluate(paramInfo, param2Info, value, controller) {
	let compareValue = value;
	let valueLength;
	if (param2Info) {
		compareValue = param2Info.value;
	}
	if (typeof paramInfo.value === "string" || Array.isArray(paramInfo.value)) {
		valueLength = paramInfo.value.length;
	} else if (typeof paramInfo.value === "undefined" || paramInfo.value === null) {
		valueLength = 0;
	}
	if (typeof compareValue === "number" && typeof valueLength === "number") {
		return valueLength === compareValue;
	}
	logger.warn("Ignoring condition operation 'lengthEquals' for parameter_ref " + paramInfo.param);
	return true;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
