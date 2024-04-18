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
import { toType } from "./../../util/property-utils.js";

function op() {
	return "cellNotEmpty";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const supportedControls = ["structuretable", "structureeditor", "structurelisteditor"];
	if (supportedControls.indexOf(paramInfo.control.controlType) >= 0) {
		const type = toType(paramInfo.value);
		return type !== "undefined" && type !== "null" && String(paramInfo.value).length > 0;
	}
	logger.warn("Ignoring unsupported condition operation 'cellNotEmpty' for control type " + paramInfo.control.controlType);
	return true;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
