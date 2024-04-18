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

import { isValid, parse } from "date-fns";
import { DEFAULT_DATE_FORMAT } from "../../constants/constants";
import { ControlType } from "../../constants/form-constants";

function op() {
	return "isDateTime";
}

function evaluate(paramInfo, param2Info, value, controller) {
	if (paramInfo.value) { // only check if there is a value.
		if (paramInfo.control && paramInfo.control.controlType !== ControlType.DATEPICKER && paramInfo.control.controlType !== ControlType.DATEPICKERRANGE) {
			// always use iso format for time
			const timeDateFormat = (value === "time") ? "HH:mm:ss:xxx" : DEFAULT_DATE_FORMAT;
			const date = parse(paramInfo.value, timeDateFormat, new Date());
			return isValid(date);
		}
		return true;
	}
	return true;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
