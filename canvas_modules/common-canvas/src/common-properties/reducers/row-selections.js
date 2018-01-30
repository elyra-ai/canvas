/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { UPDATE_SELECTED_ROWS, CLEAR_SELECTED_ROWS } from "../actions";

/*
* Stores the state information for all controls.  States are stored as objects with keys being name, row, col.
* All keys need to be strings
*/
function states(state = {}, action) {
	switch (action.type) {
	case UPDATE_SELECTED_ROWS: {
		const newState = state;
		newState[action.info.name] = action.info.selectedRows;
		return Object.assign({}, state, newState);
	}
	case CLEAR_SELECTED_ROWS: {
		let newState = state;
		if (action.info.name) {
			delete newState[action.info.name];
		} else {
			newState = [];
		}
		return Object.assign({}, state, newState);
	}
	default: {
		return state;
	}
	}
}

export default states;
