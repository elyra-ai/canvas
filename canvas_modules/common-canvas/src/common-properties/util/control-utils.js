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
import { v4 as uuid4 } from "uuid";
import { TRUNCATE_LIMIT, DEFAULT_DATEPICKER_FORMAT, DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from "../constants/constants";
import { ControlType } from "../constants/form-constants";

/**
* Used to return a unique id for a control that requires an html id
* @param propertyId (required)
* @param id (optional)
* @return returns a unique id used for control DOM ids
*/
function getControlId(propertyId, id) {
	const uuid = id ? id : uuid4();
	return `${getDataId(propertyId)}-${uuid}`;
}

function getDataId(propertyId) {
	let id = propertyId.name;
	if (typeof propertyId.row !== "undefined") {
		id += "_" + propertyId.row;
		if (typeof propertyId.col !== "undefined") {
			id += "_" + propertyId.col;
		}
	} else if (typeof propertyId.col !== "undefined") {
		id += "_" + propertyId.col;
	}
	return "properties-" + id;
}

function	getCharLimit(control, defaultLimit) {
	let limit = defaultLimit;
	if (control.charLimit) {
		limit = control.charLimit;
	}
	return limit;
}

function splitNewlines(text, splitValue) {
	if (text.length > 0) {
		const split = text.split(splitValue);
		if (Array.isArray(split)) {
			return split;
		}
		return [split];
	}
	return [];
}

// returns an object
//	value = string: the concatenated string
//	truncated = boolean: indicating if any value was too long and had to be truncated
function joinNewlines(list, joinValue) {
	let truncated = false;
	if (Array.isArray(list)) {
		if (list.length === 0) {
			return { value: "", truncated };
		}

		let concatenatedValue = "";
		list.forEach((value, index) => {
			const truncatedValue = truncateDisplayValue(value);
			const join = index === list.length - 1 ? "" : joinValue; // Do not add joinValue to last value in array
			concatenatedValue += truncatedValue + join;
			if (!truncated) { // we only need this to be set true once
				truncated = truncatedValue.length !== value.length;
			}
		});
		return {
			value: concatenatedValue,
			truncated
		};
	}
	return { value: list, truncated };
}

// truncate the value that gets displayed if its too long
function truncateDisplayValue(value) {
	if (value.length > TRUNCATE_LIMIT) {
		return value.substring(0, TRUNCATE_LIMIT) + "...";
	}
	return value;
}

function getValidationProps(messageInfo, inTable) {
	const validationProps = {};
	// inline in tables don't show carbon error/warn
	if (!messageInfo || inTable) {
		return validationProps;
	}
	if (messageInfo.type === "error") {
		validationProps.invalid = true;
		validationProps.invalidText = messageInfo.text;
	} else if (messageInfo.type === "warning") {
		validationProps.warn = true;
		validationProps.warnText = messageInfo.text;
	}
	return validationProps;
}

// Get the format of the date/time control
function getDateTimeFormat(control) {
	let dtFormat;
	if (control.controlType === ControlType.DATEPICKER || control.controlType === ControlType.DATEPICKERRANGE) {
		dtFormat = (control.dateFormat) ? control.dateFormat : DEFAULT_DATEPICKER_FORMAT;
	} else if (control.controlType === ControlType.DATEFIELD) {
		dtFormat = (control.dateFormat) ? control.dateFormat : DEFAULT_DATE_FORMAT;
	} else { // time
		dtFormat = (control.timeFormat) ? control.timeFormat : DEFAULT_TIME_FORMAT;
	}
	return dtFormat;
}

export {
	getCharLimit,
	getControlId,
	getDataId,
	splitNewlines,
	joinNewlines,
	truncateDisplayValue,
	getValidationProps,
	getDateTimeFormat
};
