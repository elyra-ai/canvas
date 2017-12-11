/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { UPDATE_PROPERTY_VALUE, SET_PROPERTY_VALUES } from "../actions";

function properties(state = {}, action) {
	switch (action.type) {
	case UPDATE_PROPERTY_VALUE:
		var newState = state;
		if (typeof action.property.propertyId.row !== "undefined") {
			if (typeof action.property.propertyId.col !== "undefined") {
				newState[action.property.propertyId.name][action.property.propertyId.row][action.property.propertyId.col] = action.property.value;
			} else {
				newState[action.property.propertyId.name][action.property.propertyId.row] = action.property.value;
			}
		} else {
			newState[action.property.propertyId.name] = action.property.value;
		}
		return Object.assign({}, state, newState);
	case SET_PROPERTY_VALUES:
		return Object.assign({}, state, action.properties);
	default:
		return state;
	}
}

export default properties;
