/*
 * Copyright 2017-2022 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default (state = [], action) => {
	switch (action.type) {
	case "SET_CANVAS_INFO": {
		// In some instances, with an external object model, the same canvas may
		// be set multiple times. Consequently, we only reset the breadcrumbs if
		// we're given a completely new canvas or the current breadcrumb does not
		// reference a pipeline Id in the incoming pipelineFlow, which might happen
		// if the pipeline has been removed.
		if (action.canvasInfoIdChanged ||
				!isCurrentBreadcrumbInPipelineFlow(state, action.canvasInfo)) {
			return [{ pipelineId: action.canvasInfo.primary_pipeline, pipelineFlowId: action.canvasInfo.id }];
		}
		return state;
	}

	case "SET_BREADCRUMBS":
		return action.data.breadcrumbs.map((a) => Object.assign({}, a));

	case "ADD_BREADCRUMB":
		return [
			...state,
			{
				pipelineId: action.data.pipelineId,
				supernodeId: action.data.supernodeId,
				supernodeParentPipelineId: action.data.supernodeParentPipelineId,
				externalUrl: action.data.externalUrl,
				label: action.data.label
			}
		];

	case "ADD_BREADCRUMBS":
		return [
			...state,
			...action.data.addBreadcrumbs
		];

	case "SET_TO_INDEXED_BREADCRUMB":
		return action.data.breadcrumbIndex >= 0 && action.data.breadcrumbIndex < state.length
			? state.slice(0, action.data.breadcrumbIndex + 1)
			: state;

	case "SET_TO_PREVIOUS_BREADCRUMB":
		return state.length > 1 ? state.slice(0, state.length - 1) : state;

	case "RESET_BREADCRUMB":
		return [
			{ pipelineId: action.data.pipelineId }
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
