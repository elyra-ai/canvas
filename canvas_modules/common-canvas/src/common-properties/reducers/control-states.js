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

import { UPDATE_CONTROL_STATE, SET_CONTROL_STATES } from "../actions";

/*
* Stores the state information for all controls.  States are stored as objects with keys being name, row, col.
* All keys need to be strings
*/
function states(state = {}, action) {
	switch (action.type) {
	case UPDATE_CONTROL_STATE: {
		const newState = state;
		const propertyId = action.state.propertyId;
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
				newState[propertyId.name][strRow][strCol] = {
					value: action.state.value
				};
			} else {
				newState[propertyId.name][strRow] = {
					value: action.state.value
				};
			}
		} else {
			newState[propertyId.name] = {
				value: action.state.value
			};
		}
		return Object.assign({}, state, newState);
	}
	case SET_CONTROL_STATES: {
		return Object.assign({}, action.states);
	}
	default: {
		return state;
	}
	}
}

export default states;
