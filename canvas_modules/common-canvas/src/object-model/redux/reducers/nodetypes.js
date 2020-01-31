/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint arrow-body-style: ["off"] */

export default (state = [], action) => {
	switch (action.type) {

	case "ADD_NODE_TYPES_TO_PALETTE":
		if (action.data.nodeTypes) {
			return [
				...state,
				...action.data.nodeTypes
			];
		}
		return state;

	case "REMOVE_NODE_TYPES_FROM_PALETTE": {
		return state.filter((nodeType) => {
			return action.data.selObjectIds.findIndex((objId) => objId === nodeType.id) === -1;
		});
	}

	default:
		return state;
	}
};
