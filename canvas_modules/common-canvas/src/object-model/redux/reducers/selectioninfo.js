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
	case "SET_CANVAS_INFO": {
		// In some instances, with an external object model, the same canvas info may
		// be set multiple times. Consequently, we only clear the selections if
		// we're given a completely new canvas.
		if (action.canvasInfo && action.currentCanvasInfo &&
				action.canvasInfo.id !== action.currentCanvasInfo.id) {
			return {};
		}
		return state;
	}

	case "CLEAR_SELECTIONS":
		return {};

	case "SET_SELECTIONS":
		return {
			pipelineId: action.data.pipelineId,
			selections: [...action.data.selections]
		};

	case "DELETE_OBJECT": {
		if (state.selections) {
			const newSelections = state.selections.filter((objId) => {
				return action.data.id !== objId;
			});
			return {
				pipelineId: state.pipelineId,
				selections: newSelections
			};
		}
		return state;
	}

	default:
		return state;
	}
};
