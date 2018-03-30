/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { SET_TITLE } from "../actions";

function componentMetadata(state = [], action) {
	switch (action.type) {
	case SET_TITLE: {
		const newState = state;
		newState.title = action.title;
		return Object.assign({}, state, newState);
	}
	default:
		return state;
	}
}

export default componentMetadata;
