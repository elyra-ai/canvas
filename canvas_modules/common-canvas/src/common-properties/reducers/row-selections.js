/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
