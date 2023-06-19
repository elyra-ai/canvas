/*
 * Copyright 2017-2023 Elyra Authors
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

// This reducer handles external pipeline flows. In this reducer pipeline flows
// are the pipeline flows WITHOUT their pipelines. The pipelines are stored in
// the pipelines array of the canvas info (handed by the canvasinfo reducer)
// and are glued back into the pipeline flow whenever the host app makes a
// getExternalPipelineFlow(url) call to the canvas controller API.

export default (state = [], action) => {
	switch (action.type) {
	case "ADD_EXTERNAL_PIPELINE_FLOW": {
		const newPipelineFlow = Object.assign({}, action.newPipelineFlow);
		return [...state, newPipelineFlow];
	}

	case "REMOVE_EXTERNAL_PIPELINE_FLOW": {
		return state.filter((epf) => epf.url !== action.externalUrl);
	}

	case "REPLACE_SN_AND_PIPELINES": {
		const subset = state.filter((epf) => {
			const remove = action.data.extPipelineFlowsToDelete.some((efd) => efd.url === epf.url);
			return !remove;
		});

		const newset = [...subset, ...action.data.extPipelineFlowsToAdd];
		return newset;
	}

	case "ADD_OBJECTS_AND_UPDATE":
	case "ADD_SUPERNODES": {
		return [...state, ...action.data.extPipelineFlowsToAdd];
	}

	case "DELETE_PASTED_OBJECTS":
	case "DELETE_OBJECTS_AND_UPDATE":
	case "DELETE_SUPERNODES": {
		return state.filter((epf) => {
			const removePFlow = action.data.extPipelineFlowsToDelete.some((pf) => epf.url === pf.url);
			return !removePFlow;
		});
	}

	case "DECONSTRUCT_SUPERNODE": {
		return state.filter((epf) => epf.id !== action.data.extPipelineFlowToDelete.id);
	}

	case "RECONSTRUCT_SUPERNODE": {
		return [...state, action.data.extPipelineFlowToDelete];
	}

	case "SET_CANVAS_INFO": {
		// If we are handling new canvasInfo we need to clear out any old
		// external pipeline flows.
		if (action.canvasInfoIdChanged) {
			return [];
		}
		return state;
	}

	default:
		return state;
	}
};
