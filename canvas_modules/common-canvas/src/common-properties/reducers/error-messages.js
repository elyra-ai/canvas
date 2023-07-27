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
				newState[propertyId.name][strRow][strCol] = action.message.value;
			} else {
				newState[propertyId.name][strRow] = Object.assign({}, action.message.value);
			}
		} else {
			newState[propertyId.name] = Object.assign({}, action.message.value);
		}
		return Object.assign({}, state, newState);
	}
	case CLEAR_ERROR_MESSAGE: {
		const newState = state;
		if (newState[action.message.propertyId.name]) {
			if (typeof action.message.propertyId.row !== "undefined") {
				if (typeof action.message.propertyId.col !== "undefined") {
					delete newState[action.message.propertyId.name][action.message.propertyId.row][action.message.propertyId.col];
				} else {
					delete newState[action.message.propertyId.name][action.message.propertyId.row];
				}
			} else {
				delete newState[action.message.propertyId.name].type;
				delete newState[action.message.propertyId.name].text;
				delete newState[action.message.propertyId.name].validation_id;
				delete newState[action.message.propertyId.name].required;
				delete newState[action.message.propertyId.name].propertyId;
				delete newState[action.message.propertyId.name].displayError;
				if (isEmpty(newState[action.message.propertyId.name])) {
					delete newState[action.message.propertyId.name];
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

export default messages;
