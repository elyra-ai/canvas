/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
