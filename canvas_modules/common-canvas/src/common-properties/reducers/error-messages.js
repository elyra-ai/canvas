/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { UPDATE_ERROR_MESSAGE, SET_ERROR_MESSAGES, CLEAR_ERROR_MESSAGE } from "../actions";
import isEmpty from "lodash/isEmpty";
/* eslint max-depth: ["error", 6] */

/*
* Stores the state information for all controls.  States are stored as objects with keys being name, row, col.
* All keys need to be strings
*/
function messages(state = {}, action) {
	switch (action.type) {
	case UPDATE_ERROR_MESSAGE: {
		const newState = state;
		const propertyId = action.message.propertyId;
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
				newState[propertyId.name][strRow][strCol] = action.message.value;
			} else {
				newState[propertyId.name][strRow] = Object.assign(newState[propertyId.name][strRow], action.message.value);
			}
		} else {
			newState[propertyId.name] = Object.assign(newState[propertyId.name], action.message.value);
		}
		return Object.assign({}, state, newState);
	}
	case CLEAR_ERROR_MESSAGE: {
		const newState = state;
		if (newState[action.message.propertyId.name]) {
			if (typeof action.message.propertyId.row !== "undefined") {
				if (typeof action.message.propertyId.col !== "undefined") {
					delete newState[action.message.propertyId.name][action.message.propertyId.row][action.message.propertyId.col];
				} else {
					delete newState[action.message.propertyId.name][action.message.propertyId.row];
				}
			} else {
				delete newState[action.message.propertyId.name].type;
				delete newState[action.message.propertyId.name].text;
				delete newState[action.message.propertyId.name].validation_id;
				if (isEmpty(newState[action.message.propertyId.name])) {
					delete newState[action.message.propertyId.name];
				}
			}
		}
		return Object.assign({}, state, newState);
	}
	case SET_ERROR_MESSAGES: {
		return Object.assign({}, action.messages);
	}
	default: {
		return state;
	}
	}
}

export default messages;
