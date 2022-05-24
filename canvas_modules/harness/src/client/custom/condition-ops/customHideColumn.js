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
import { isEqual } from "lodash";

function op() {
	return "customHideColumn";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const controlValue = controller.getPropertyValue({ "name": paramInfo.id.name });
	const atLeastOneRowHasValue = controlValue.some((row) => isEqual(row[paramInfo.id.col], value));
	if (atLeastOneRowHasValue) {
		return true;
	}
	// hide an entire column because value doesn't exist in any row
	controller.updateControlState(paramInfo.id, "hidden");
	return false;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
