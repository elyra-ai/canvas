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
		let propState = newState[action.state.propertyId.name];
		if (typeof propState === "undefined") {
			propState = {};
		}
		if (typeof action.state.propertyId.row !== "undefined") {
			const strRow = action.state.propertyId.row.toString();
			if (typeof propState[strRow] === "undefined") {
				propState[strRow] = {};
			}
			if (typeof action.state.propertyId.col !== "undefined") {
				const strCol = action.state.propertyId.col.toString();
				if (typeof propState[strRow][strCol] === "undefined") {
					propState[strRow][strCol] = {};
				}
				newState[action.state.propertyId.name][strRow][strCol] = {
					value: action.state.value
				};
			} else {
				newState[action.state.propertyId.name][strRow] = {
					value: action.state.value
				};
			}
		} else {
			newState[action.state.propertyId.name] = {
				value: action.state.value
			};
		}
		return Object.assign({}, state, newState);
	}
	case SET_CONTROL_STATES: {
		return Object.assign({}, state, action.states);
	}
	default: {
		return state;
	}
	}
}

export default states;
