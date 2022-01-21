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

import { UPDATE_SELECTED_ROWS, CLEAR_SELECTED_ROWS } from "../actions";
/* eslint max-depth: ["error", 6] */

/*
* Stores the state information for all controls.  States are stored as objects with keys being name, row, col.
* All keys need to be strings
*/
function states(state = {}, action) {
	switch (action.type) {
	case UPDATE_SELECTED_ROWS: {
		const newState = state;
		const propertyId = action.info.propertyId;
		if (!newState[propertyId.name]) {
			newState[propertyId.name] = {};
		}
		if (Number.isInteger(propertyId.row)) {
			const strRow = String(propertyId.row);
			if (!newState[propertyId.name][strRow]) {
				newState[propertyId.name][strRow] = {};
			}
			if (Number.isInteger(propertyId.col)) {
				const strCol = String(propertyId.col);
				if (!newState[propertyId.name][strRow][strCol]) {
					newState[propertyId.name][strRow][strCol] = {};
				}
				newState[propertyId.name][strRow][strCol].selectedRows = action.info.selectedRows;
			} else {
				newState[propertyId.name][strRow].selectedRows = action.info.selectedRows;
			}
		} else {
			newState[propertyId.name].selectedRows = action.info.selectedRows;
		}
		return Object.assign({}, state, newState);
	}
	case CLEAR_SELECTED_ROWS: {
		const newState = state;
		const propertyId = action.info.propertyId;
		if (action.info.propertyId) {
			if (newState[propertyId.name]) {
				if (Number.isInteger(propertyId.row) && newState[propertyId.name][String(propertyId.row)]) {
					const strRow = String(propertyId.row);
					if (Number.isInteger(propertyId.col) && newState[propertyId.name][strRow][String(propertyId.col)]) {
						newState[propertyId.name][strRow][String(propertyId.col)].selectedRows = [];
					} else {
						newState[propertyId.name][strRow].selectedRows = [];
					}
				} else {
					newState[propertyId.name].selectedRows = [];
				}
			}
			return Object.assign({}, state, newState);
		}
		return {};
	}
	default: {
		return state;
	}
	}
}

export default states;
