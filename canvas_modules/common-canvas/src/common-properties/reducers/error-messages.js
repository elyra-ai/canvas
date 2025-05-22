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

import { UPDATE_ERROR_MESSAGE, SET_ERROR_MESSAGES, CLEAR_ERROR_MESSAGE } from "../actions";
import { isEmpty } from "lodash";
/* eslint max-depth: ["error", 6] */

const DEFAULT_ERROR_MESSAGE_KEYS = [
	"propertyId",
	"required",
	"text",
	"type",
	"validation_id",
	"displayError"
];

/*
* Stores the state information for all controls.  States are stored as objects with keys being name, row, col.
* All keys need to be strings
*/
function messages(state = {}, action) {
	switch (action.type) {
	case UPDATE_ERROR_MESSAGE: {
		const newState = state;
		const propertyId = action.message.propertyId;
		if (typeof newState[propertyId.name] === "undefined") {
			newState[propertyId.name] = {};
		}
		if (typeof propertyId.row !== "undefined") {
			const strRow = propertyId.row.toString();
			if (typeof newState[propertyId.name][strRow] === "undefined") {
				newState[propertyId.name][strRow] = {};
			}
			if (typeof propertyId.col !== "undefined") {
				const strCol = propertyId.col.toString();
				if (typeof newState[propertyId.name][strRow][strCol] === "undefined") {
					newState[propertyId.name][strRow][strCol] = {};
				}
				newState[propertyId.name][strRow][strCol] = Object.assign({}, newState[propertyId.name][strRow][strCol], action.message.value);

				if (typeof propertyId.propertyId !== "undefined") {
					updateNestedPropertyValue(propertyId.propertyId, newState[propertyId.name][strRow][strCol], action.message.value);
				}
			} else if (typeof propertyId.propertyId !== "undefined") { // nested structureeditor
				updateNestedPropertyValue(propertyId.propertyId, newState[propertyId.name][strRow], action.message.value);
			} else {
				newState[propertyId.name][strRow] = Object.assign({}, action.message.value);
			}
		} else {
			newState[propertyId.name] = Object.assign({}, action.message.value);
		}
		console.log("!!! newState set", newState);
		return Object.assign({}, state, newState);
	}
	case CLEAR_ERROR_MESSAGE: {
		const newState = state;
		const propertyId = action.message.propertyId;
		console.log("!!! cleared error", action);
		if (newState[propertyId.name]) {
			if (typeof propertyId.row !== "undefined") {
				if (typeof propertyId.col !== "undefined") {
					if (typeof propertyId.propertyId !== "undefined" && typeof propertyId.propertyId.row !== "undefined") { // clear subcell
						clearNestedPropertyMessage(propertyId.propertyId, newState[propertyId.name][propertyId.row][propertyId.col]);
						// TODO: If all nested properties cleared, remove the col error
						console.log("!!! nested", newState[propertyId.name][propertyId.row][propertyId.col]);
						clearColumnMessage(propertyId.col, newState[propertyId.name][propertyId.row]);
					} else {
						delete newState[propertyId.name][propertyId.row][propertyId.col];
					}
				} else {
					delete newState[propertyId.name][propertyId.row];
				}
			} else {
				delete newState[propertyId.name].type;
				delete newState[propertyId.name].text;
				delete newState[propertyId.name].validation_id;
				delete newState[propertyId.name].required;
				delete newState[propertyId.name].propertyId;
				delete newState[propertyId.name].displayError;
				if (isEmpty(newState[propertyId.name])) {
					delete newState[propertyId.name];
				}
			}
		}
		console.log("!!! cleared", newState);
		return Object.assign({}, state, newState);
	}
	case SET_ERROR_MESSAGES: {
		return Object.assign({}, action.messages);
	}
	default: {
		return state;
	}
	}
}

function updateNestedPropertyValue(propertyId, newState, value) {
	if (typeof propertyId.row !== "undefined") {
		const strRow = propertyId.row.toString();

		if (typeof propertyId.col !== "undefined") {
			const strCol = propertyId.col.toString();
			if (typeof propertyId.propertyId !== "undefined") {
				updateNestedPropertyValue(propertyId.propertyId, newState[strRow][strCol], Object.assign({}, value));
			} else {
				newState[strRow][strCol] = Object.assign({}, newState[strRow][strCol], value);
			}
		} else {
			newState[strRow] = Object.assign({}, newState[strRow], value);
		}
	}
}

function clearNestedPropertyMessage(propertyId, newState) {
	if (typeof propertyId.col !== "undefined") {
		if (typeof propertyId.propertyId !== "undefined" && typeof propertyId.propertyId.row !== "undefined") { // clear subcell
			clearNestedPropertyMessage(propertyId.propertyId, newState[propertyId.row][propertyId.col]);
			clearColumnMessage(propertyId.col, newState[propertyId.row]);
		} else {
			delete newState[propertyId.row][propertyId.col];
		}
	} else {
		delete newState[propertyId.row];
	}
}

function clearColumnMessage(col, newState) {
	if (Object.keys(newState[col]).length < DEFAULT_ERROR_MESSAGE_KEYS.length ||
	(Object.keys(newState[col]).length === DEFAULT_ERROR_MESSAGE_KEYS.length && typeof newState[col].displayError !== "undefined")) {
		delete newState[col];
	}
}

export default messages;
