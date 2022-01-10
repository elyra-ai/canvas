/*
 * Copyright 2017-2020 Elyra Authors
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

import { set } from "lodash";
import { SET_ADD_REMOVE_ROWS, SET_TABLE_BUTTON_ENABLED } from "../actions";

/*
* Stores the state information for all controls.  States are stored as objects with keys being name, row, col.
* All keys need to be strings
*/
function states(state = {}, action) {
	const propertyId = action.info && action.info.propertyId ? action.info.propertyId : null;
	switch (action.type) {
	case SET_ADD_REMOVE_ROWS: {
		if (propertyId === null) {
			return state;
		}
		const newState = state;
		if (typeof newState[propertyId.name] === "undefined") {
			newState[propertyId.name] = {};
		}

		// console.log("!!! set state before " + JSON.stringify(action));
		// console.log("!!! set state before " + JSON.stringify(newState[propertyId.name]));
		if (typeof propertyId.row !== "undefined") {
			updateNestedPropertySetting(propertyId, newState[propertyId.name], "addRemoveRows", action.info.value);
		} else {
			newState[propertyId.name].addRemoveRows = action.info.value;
		}
		// console.log("!!! set state after " + JSON.stringify(newState[propertyId.name]));
		return Object.assign({}, state, newState);
	}
	case SET_TABLE_BUTTON_ENABLED: {
		if (propertyId === null) {
			return state;
		}
		const newState = state;
		if (typeof newState[propertyId.name] === "undefined") {
			newState[propertyId.name] = { };
		}

		if (typeof propertyId.row !== "undefined") {
			updateNestedPropertySetting(propertyId, newState[propertyId.name], `tableButtons.${action.info.buttonId}`, action.info.value);
		} else {
			set(newState[propertyId.name], `tableButtons.${action.info.buttonId}`, action.info.value);
		}
		return Object.assign({}, state, newState);
	}
	default: {
		return state;
	}
	}
}

function updateNestedPropertySetting(propertyId, newState, setting, value) {
	if (typeof propertyId.row !== "undefined") {
		if (typeof newState[propertyId.row] === "undefined") {
			newState[propertyId.row] = {};
		}
		if (typeof propertyId.col !== "undefined") {
			if (typeof newState[propertyId.row][propertyId.col] === "undefined") {
				newState[propertyId.row][propertyId.col] = {};
			}
			if (typeof propertyId.propertyId !== "undefined") {
				updateNestedPropertySetting(propertyId.propertyId, newState[propertyId.row][propertyId.col], setting, value);
			} else {
				// console.log("!!! before set path col " + [propertyId.row, propertyId.col, setting]);
				// console.log("!!! before set " + JSON.stringify(newState[propertyId.row][propertyId.col]));
				set(newState[propertyId.row][propertyId.col], setting, value);
				// set(newState, [propertyId.row, propertyId.col, setting], value);
				// console.log("!!! after set " + JSON.stringify(newState[propertyId.row][propertyId.col]));
			}
		} else if (typeof propertyId.propertyId !== "undefined") { // nested structureeditor
			updateNestedPropertySetting(propertyId.propertyId, newState[propertyId.row], setting, value);
		} else {
			// console.log("!!! before set path row " + [propertyId.row, setting]);
			// console.log("!!! before set " + JSON.stringify(newState[propertyId.row]));
			set(newState[propertyId.row], setting, value);
			// set(newState, [propertyId.row, setting], value);
			// console.log("!!! after set " + JSON.stringify(newState[propertyId.row]));
		}
	}
}

export default states;
