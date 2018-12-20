/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { UPDATE_PROPERTY_VALUE, SET_PROPERTY_VALUES, REMOVE_PROPERTY_VALUE } from "../actions";

function properties(state = {}, action) {
	const propertyId = action.property && action.property.propertyId ? action.property.propertyId : null;
	switch (action.type) {
	case UPDATE_PROPERTY_VALUE: {
		var newState = state;
		if (typeof propertyId.row !== "undefined") {
			if (typeof propertyId.col !== "undefined") {
				newState[propertyId.name][propertyId.row][propertyId.col] = action.property.value;
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
		if (typeof propertyId.name !== "undefined") {
			delete nextState[propertyId.name];
		}
		return Object.assign({}, state, nextState);
	}
	default:
		return state;
	}
}

export default properties;
