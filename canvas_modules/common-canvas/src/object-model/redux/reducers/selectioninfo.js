/*
 * Copyright 2017-2020 IBM Corporation
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
