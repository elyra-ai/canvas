/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { SET_DATASET_METADATA } from "../actions";

function datasetMetadata(state = [], action) {
	switch (action.type) {
	case SET_DATASET_METADATA:
		if (typeof action.datasetMetadata === "undefined") {
			return [];
		}
		return JSON.parse(JSON.stringify(action.datasetMetadata));
	default:
		return state;
	}
}

export default datasetMetadata;
