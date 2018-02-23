/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { UPDATE_PANEL_STATE, SET_PANEL_STATES } from "../actions";

/*
* Stores the state information for all controls.  States are stored as objects with keys being name, row, col.
* All keys need to be strings
*/
function states(state = {}, action) {
	switch (action.type) {
	case UPDATE_PANEL_STATE: {
		const newState = state;
		let propState = newState[action.state.panelId.name];
		if (typeof propState === "undefined") {
			propState = {};
		}
		newState[action.state.panelId.name] = {
			value: action.state.value
		};
		return Object.assign({}, state, newState);
	}
	case SET_PANEL_STATES: {
		return Object.assign({}, action.states);
	}
	default: {
		return state;
	}
	}
}

export default states;
