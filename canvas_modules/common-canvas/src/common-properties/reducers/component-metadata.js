/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { SET_TITLE, SET_ACTIVE_TAB, UPDATE_EXPRESSION_VALIDATE } from "../actions";


function componentMetadata(state = [], action) {
	switch (action.type) {
	case SET_TITLE: {
		const newState = state;
		newState.title = action.title;
		return Object.assign({}, state, newState);
	}
	case SET_ACTIVE_TAB: {
		const newState = state;
		newState.activeTab = action.activeTab;
		return Object.assign({}, state, newState);
	}
	case UPDATE_EXPRESSION_VALIDATE: {
		const newState = state;
		newState[action.info.name] = { expressionValidate: action.info.expressionValidate };
		return Object.assign({}, state, newState);
	}
	default:
		return state;
	}
}

export default componentMetadata;
