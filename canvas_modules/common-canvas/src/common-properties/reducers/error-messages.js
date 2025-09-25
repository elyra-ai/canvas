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

import { UPDATE_ERROR_MESSAGE, SET_ERROR_MESSAGES, CLEAR_ERROR_MESSAGE } from "../actions";
import { DEFAULT_ERROR_MESSAGE_KEYS } from "../constants/constants";
import { isEmpty, difference } from "lodash";
/* eslint max-depth: ["error", 6] */

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
			const newNameState = newState[propertyId.name];
			updateNestedPropertyValue(propertyId, newNameState, action.message.value);
		} else {
			newState[propertyId.name] = Object.assign({}, action.message.value);
		}
		return Object.assign({}, state, newState);
	}
	case CLEAR_ERROR_MESSAGE: {
		const newState = state;
		const propertyId = action.message.propertyId;
		if (newState[propertyId.name]) {
			if (typeof propertyId.row !== "undefined") {
				if (typeof propertyId.col !== "undefined") {
					if (typeof propertyId.propertyId !== "undefined" && typeof propertyId.propertyId.row !== "undefined") { // clear subcell
						clearNestedPropertyMessage(propertyId.propertyId, newState[propertyId.name][propertyId.row][propertyId.col]);
						clearCellMessage(propertyId.col, newState[propertyId.name][propertyId.row]);
						updateParentErrorMessage(propertyId.col, propertyId.row, newState[propertyId.name]);
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
				delete newState[propertyId.name].tableText;
				if (isEmpty(newState[propertyId.name])) {
					delete newState[propertyId.name];
				}
			}
		}
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

		if (typeof newState[strRow] === "undefined") {
			newState[strRow] = {};
		} else if (typeof newState[strRow].displayError !== "undefined") {
			delete newState[strRow].displayError;
		}
		delete newState[strRow].tableText;

		if (typeof propertyId.col !== "undefined") {
			const strCol = propertyId.col.toString();
			if (typeof newState[strRow][strCol] === "undefined") {
				newState[strRow][strCol] = {};
			} else if (typeof newState[strRow][strCol].displayError !== "undefined") {
				delete newState[strRow][strCol].displayError;
			}
			delete newState[strRow][strCol].tableText;
			newState[strRow][strCol] = Object.assign({}, newState[strRow][strCol], value);
			if (typeof propertyId.propertyId !== "undefined") {
				updateNestedPropertyValue(propertyId.propertyId, newState[strRow][strCol], Object.assign({}, value));
			}
		} else if (typeof propertyId.propertyId !== "undefined") { // nested structureeditor
			updateNestedPropertyValue(propertyId.propertyId, newState[strRow], value);
		} else {
			newState[strRow] = Object.assign({}, newState[strRow], value);
		}
	}
}

function clearNestedPropertyMessage(propertyId, newState) {
	if (typeof propertyId.col !== "undefined") {
		if (typeof propertyId.propertyId !== "undefined" && typeof propertyId.propertyId.row !== "undefined") { // clear subcell
			clearNestedPropertyMessage(propertyId.propertyId, newState[propertyId.row][propertyId.col]);
			clearCellMessage(propertyId.col, newState[propertyId.row]);
			updateParentErrorMessage(propertyId.col, propertyId.row, newState);
		} else {
			delete newState[propertyId.row][propertyId.col];
			clearCellMessage(propertyId.row, newState);
		}
	} else {
		delete newState[propertyId.row];
		delete newState.tableText;
	}
}

// Check that no cells have error before deleting the error from the parent row/col
function clearCellMessage(col, newState) {
	const cellErrors = difference(Object.keys(newState[col]), DEFAULT_ERROR_MESSAGE_KEYS);
	if (cellErrors.length === 0) {
		delete newState[col];
		delete newState.tableText;
	}
}

// Once an error is cleared from the nested cell, and there is still another error present,
// ensure that the parent error reflects the error still present, instead of the error that was removed
function updateParentErrorMessage(errIdx, delIdx, newState) {
	// delete newState.tableText;
	const errorState = newState[delIdx];
	const cellErrors = difference(Object.keys(errorState[errIdx]), DEFAULT_ERROR_MESSAGE_KEYS);
	if (typeof errorState[errIdx].type !== "undefined") {
		const remainingCellErrorIdx = cellErrors[0]; // Set the parent error to the first cell
		const cellError = difference(Object.keys(errorState[errIdx][remainingCellErrorIdx]), DEFAULT_ERROR_MESSAGE_KEYS);
		if (cellError.length === 0) {
			const remainingError = errorState[errIdx][remainingCellErrorIdx];
			delete remainingError.tableText;
			errorState[errIdx] = Object.assign({}, errorState[errIdx], remainingError);
		} else { // go deeper to find the nested error
			const remainingError = errorState[errIdx][remainingCellErrorIdx][cellError[0]];
			delete remainingError.tableText;
			errorState[errIdx] = Object.assign({}, errorState[errIdx], remainingError);
		}
	}
}

export default messages;
