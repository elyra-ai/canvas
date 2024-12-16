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
	return "notMatches";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const dataType = typeof paramInfo.value;
	var regExp = "";
	if (typeof param2Info !== "undefined" && param2Info !== null) {
		regExp = param2Info.value;
	} else if (typeof value !== "undefined" && value !== null) {
		regExp = value;
	} else {
		logger.warn("Ignoring condition operation 'notMatches' for parameter_ref " + paramInfo.param + " no regular expression specified in condition.");
		return true;
	}
	if (dataType === "string" || dataType === "undefined") {
		// the added regexp before and after the value strips out whitespace or positions at the start and end of the string.
		const regex = new RegExp(regExp);
		return !regex.test(paramInfo.value);
	}
	logger.warn("Ignoring condition operation 'notMatches' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
	return true;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
