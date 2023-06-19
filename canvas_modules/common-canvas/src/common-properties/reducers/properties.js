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

import { UPDATE_PROPERTY_VALUE, SET_PROPERTY_VALUES, REMOVE_PROPERTY_VALUE } from "../actions";

function properties(state = {}, action) {
	const propertyId = action.property && action.property.propertyId ? action.property.propertyId : null;
	switch (action.type) {
	case UPDATE_PROPERTY_VALUE: {
		if (propertyId === null) {
			return state;
		}
		var newState = state;
		if (typeof propertyId.row !== "undefined") {
			if (typeof newState[propertyId.name] === "undefined") {
				newState[propertyId.name] = [];
			}
			if (typeof propertyId.col !== "undefined") {
				if (typeof newState[propertyId.name][propertyId.row] === "undefined") {
					newState[propertyId.name][propertyId.row] = [];
				}

				if (typeof propertyId.propertyId !== "undefined") {
					updateNestedPropertyValue(propertyId.propertyId, newState[propertyId.name][propertyId.row][propertyId.col], action.property.value);
				} else {
					newState[propertyId.name][propertyId.row][propertyId.col] = action.property.value;
				}
			} else if (typeof propertyId.propertyId !== "undefined") { // nested structureeditor
				updateNestedPropertyValue(propertyId.propertyId, newState[propertyId.name][propertyId.row], action.property.value);
			} else {
				newState[propertyId.name][propertyId.row] = action.property.value;
			}
		} else {
			newState[propertyId.name] = action.property.value;
		}
		return Object.assign({}, state, newState);
	}
	case SET_PROPERTY_VALUES: {
		return Object.assign({}, action.properties);
	}
	case REMOVE_PROPERTY_VALUE: {
		const nextState = state;
		if (propertyId !== null && typeof propertyId.name !== "undefined") {
			delete nextState[propertyId.name];
		}
		return Object.assign({}, state, nextState);
	}
	default:
		return state;
	}
}

function updateNestedPropertyValue(propertyId, newState, value) {
	if (typeof propertyId.row !== "undefined") {
		if (typeof propertyId.col !== "undefined") {
			if (typeof newState[propertyId.row] === "undefined") {
				newState[propertyId.row] = [];
			}

			if (typeof propertyId.propertyId !== "undefined") {
				updateNestedPropertyValue(propertyId.propertyId, newState[propertyId.row][propertyId.col], value);
			} else {
				newState[propertyId.row][propertyId.col] = value;
			}
		} else {
			newState[propertyId.row] = value;
		}
	}
}

export default properties;
