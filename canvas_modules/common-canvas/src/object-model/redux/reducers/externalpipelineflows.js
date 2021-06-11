/*
 * Copyright 2021 Elyra Authors
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
	case "ADD_EXTERNAL_PIPELINE_FLOW": {
		return [...state, action.newPipelineFlow];
	}

	case "REMOVE_EXTERNAL_PIPELINE_FLOW": {
		return state.filter((pf) => pf.id !== action.pipelineFlowId);
	}

	case "CONVERT_SN_EXTERNAL_TO_LOCAL": {
		return state.filter((pf) => pf.url !== action.data.externalFlowUrl);
	}

	case "CONVERT_SN_LOCAL_TO_EXTERNAL": {
		delete action.data.externalPipelineFlow.pipelines;
		return [...state, action.data.externalPipelineFlow];
	}

	case "DELETE_SUPERNODE": {
		if (action.data.supernode.subflow_ref.url) {
			return state.filter((epf) => epf.url !== action.data.supernode.subflow_ref.url);
		}
		return state;
	}

	default:
		return state;
	}
};
