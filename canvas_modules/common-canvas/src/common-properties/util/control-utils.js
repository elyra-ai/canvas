/*
 * Copyright 2017-2020 IBM Corporation
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

function joinNewlines(list, joinValue) {
	if (Array.isArray(list)) {
		return list.length === 0 ? "" : list.join(joinValue);
	}
	return list;
}

module.exports = {
	getCharLimit: getCharLimit,
	getControlId: getControlId,
	getDataId: getDataId,
	splitNewlines: splitNewlines,
	joinNewlines: joinNewlines
};
