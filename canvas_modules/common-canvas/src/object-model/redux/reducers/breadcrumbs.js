/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

export default (state = [], action) => {
	switch (action.type) {
	case "SET_CANVAS_INFO": {
		// In some instances, with an external object model, the same canvas may
		// be set multiple times. Consequently, we only reset the breadcrumbs if
		// we're given a completely new canvas or the current breadcrumb does not
		// reference a pipeline Id in the incoming pipelineFlow, which might happen
		// if the pipeline has been removed.
		if ((action.canvasInfo && action.currentCanvasInfo &&
					action.canvasInfo.id !== action.currentCanvasInfo.id) ||
				!isCurrentBreadcrumbInPipelineFlow(state, action.canvasInfo)) {
			return [{ pipelineId: action.canvasInfo.primary_pipeline, pipelineFlowId: action.canvasInfo.id }];
		}
		return state;
	}

	case "ADD_NEW_BREADCRUMB":
		return [
			...state,
			{ pipelineId: action.data.pipelineId, pipelineFlowId: action.data.pipelineFlowId }
		];

	case "SET_TO_PREVIOUS_BREADCRUMB":
		return state.length > 1 ? state.slice(0, state.length - 1) : state;

	case "RESET_BREADCRUMB":
		return [
			{ pipelineId: action.data.pipelineId, pipelineFlowId: action.data.pipelineFlowId }
		];

	default:
		return state;
	}
};

// Returns true if the 'current' breadcrumb from the breadcrumbs
// passed in is in the pipelineFlow's set of pipelines.
const isCurrentBreadcrumbInPipelineFlow = (brdcrumbs, pipelineFlow) => {
	if (pipelineFlow &&
			pipelineFlow.pipelines &&
			Array.isArray(brdcrumbs) &&
			brdcrumbs.length > 0 &&
			brdcrumbs[brdcrumbs.length - 1].pipelineId) {
		const piId = brdcrumbs[brdcrumbs.length - 1].pipelineId;
		const idx = pipelineFlow.pipelines.findIndex((pipeline) => pipeline.id === piId);
		return idx > -1;
	}
	return false;
};
