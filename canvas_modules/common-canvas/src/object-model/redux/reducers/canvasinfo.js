/*
 * Copyright 2017-2020 Elyra Authors
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

import { SUPER_NODE } from "../../../common-canvas/constants/canvas-constants.js";

import nodes from "./nodes.js";
import comments from "./comments.js";
import links from "./links.js";

export default (state = {}, action) => {
	switch (action.type) {

	case "SET_CANVAS_INFO": {
		if (action.canvasInfo) {
			return action.canvasInfo;
		}
		return state;
	}

	// Save incoming sub-pipeline to the pipeline flow pipelines array.
	case "ADD_PIPELINE": {
		return Object.assign({}, state, { pipelines: state.pipelines.concat(action.data) });
	}

	// Add pipelines from the external pipeline flow into the canvas info pipelines array
	case "ADD_EXTERNAL_PIPELINE_FLOW": {
		return Object.assign({}, state, { pipelines: state.pipelines.concat(action.newPipelines) });
	}

	case "REMOVE_EXTERNAL_PIPELINE_FLOW": {
		const canvasInfoPipelines = state.pipelines.filter((pipeline) => {
			if (pipeline.parentUrl) {
				return pipeline.parentUrl !== action.externalUrl;
			}
			return true;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "CONVERT_SN_EXTERNAL_TO_LOCAL": {
		const supernode = getSupernode(action.data.supernodeId, action.data.pipelineId, state.pipelines);
		const supernodesToConvert =
			getSupernodesToConvert([supernode], action.data.pipelineId,
				action.type, action.data.externalFlowUrl, state.pipelines);
		const pipelineIdsToConvert = getPipelineIdsToConvert(supernodesToConvert);

		let canvasInfoPipelines = state.pipelines.map((pipeline) => {
			let pLine = pipeline;

			// We need to alter the supernodes so subflow_ref.url field is removed.
			if (supernodesToConvert[pipeline.id] &&
					supernodesToConvert[pipeline.id].length > 0) {
				action.data.supernodesToConvert = supernodesToConvert[pipeline.id];
				pLine = Object.assign({}, pLine, {
					nodes: nodes(pipeline.nodes, action) });
			}

			// We need to add the parentUrl property to the subflow pipelines that
			// are being made local.
			if (pipelineIdsToConvert.some((pId) => pId === pipeline.id)) {
				delete pLine.parentUrl;
			}
			return pLine;
		});

		// If the pipeline is not loaded we will be provided by one (or more new
		// pipelines so we add them to the canvas info's pipelines.
		// referencd by its supernodes.
		if (action.data.newPipelines) {
			canvasInfoPipelines = canvasInfoPipelines.concat(action.data.newPipelines);
		}

		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "CONVERT_SN_LOCAL_TO_EXTERNAL": {
		const supernode = getSupernode(action.data.supernodeId, action.data.pipelineId, state.pipelines);
		const supernodesToConvert =
			getSupernodesToConvert([supernode], action.data.pipelineId,
				action.type, "", state.pipelines);
		const pipelineIdsToConvert = getPipelineIdsToConvert(supernodesToConvert);

		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			let pLine = pipeline;

			// We need to alter the supernodes so a subflow_ref.url field is added.
			if (supernodesToConvert[pipeline.id] &&
					supernodesToConvert[pipeline.id].length > 0) {
				action.data.supernodesToConvert = supernodesToConvert[pipeline.id];
				pLine = Object.assign({}, pLine, {
					nodes: nodes(pipeline.nodes, action) });
			}

			// We need to add the parentUrl property to the subflow pipelines that
			// are being made external.
			if (pipelineIdsToConvert.some((pId) => pId === pipeline.id)) {
				pLine = Object.assign({}, pLine, { parentUrl: action.data.externalFlowUrl });
			}
			return pLine;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	// Delete a pipeline from the pipeline flow pipelines array.
	case "DELETE_PIPELINE": {
		const canvasInfoPipelines = state.pipelines.filter((pipeline) => {
			return pipeline.id !== action.data.id;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "SET_PIPELINE_ZOOM": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (pipeline.id === action.pipelineId) {
				return Object.assign({}, pipeline, { zoom: { "k": action.data.zoom.k, "x": action.data.zoom.x, "y": action.data.zoom.y } });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "SET_LAYOUT_INFO": {
		return Object.assign({}, state, { pipelines: action.pipelines });
	}

	case "DELETE_SUPERNODE": {
		// Delete the supernode pipelines.
		let canvasInfoPipelines = state.pipelines;
		action.data.pipelineIds.forEach((pipelineId) => {
			canvasInfoPipelines = canvasInfoPipelines.filter((pipeline) => {
				return pipeline.id !== pipelineId;
			});
		});

		// Delete the supernode.
		canvasInfoPipelines = canvasInfoPipelines.map((pipeline) => {
			if (pipeline.id === action.pipelineId) {
				return Object.assign({}, pipeline, {
					nodes: nodes(pipeline.nodes, action),
					links: links(pipeline.links, action)
				});
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "SET_SUBDUE_STYLE":
		return Object.assign({}, state, { subdueStyle: action.data.subdueStyle });

	case "ADD_NODE":
	case "ADD_AUTO_NODE":
	case "REPLACE_NODES":
	case "REPLACE_NODE":
	case "SIZE_AND_POSITION_OBJECTS":
	case "SET_NODE_PROPERTIES":
	case "SET_NODE_PARAMETERS":
	case "SET_NODE_UI_PARAMETERS":
	case "SET_NODE_MESSAGE":
	case "SET_NODE_MESSAGES":
	case "SET_NODE_DECORATIONS":
	case "SET_LINK_DECORATIONS":
	case "ADD_NODE_ATTR":
	case "REMOVE_NODE_ATTR":
	case "SET_NODE_LABEL":
	case "SET_OBJECTS_CLASS_NAME":
	case "SET_INPUT_PORT_LABEL":
	case "SET_OUTPUT_PORT_LABEL":
	case "SET_INPUT_PORT_SUBFLOW_NODE_REF":
	case "SET_OUTPUT_PORT_SUBFLOW_NODE_REF":
	case "SET_SUPERNODE_FLAG":
	case "MOVE_OBJECTS":
	case "DELETE_OBJECT":
	case "ADD_LINK":
	case "SET_LINK_PROPERTIES":
	case "SET_LINK_SRC_INFO":
	case "SET_LINK_TRG_INFO":
	case "SET_LINKS_CLASS_NAME":
	case "DELETE_LINK":
	case "DELETE_LINKS":
	case "UPDATE_LINK":
	case "ADD_COMMENT":
	case "EDIT_COMMENT":
	case "SET_COMMENT_PROPERTIES":
	case "ADD_COMMENT_ATTR":
	case "REMOVE_COMMENT_ATTR": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (pipeline.id === action.pipelineId) {
				return Object.assign({}, pipeline, {
					nodes: nodes(pipeline.nodes, action),
					comments: comments(pipeline.comments, action),
					links: links(pipeline.links, action) });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}
	case "SET_OBJECTS_STYLE":
	case "SET_LINKS_STYLE": {
		const pipelineIds = Object.keys(action.data.pipelineObjIds);
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (pipelineIds.indexOf(pipeline.id) > -1) {
				action.data.objIds = action.data.pipelineObjIds[pipeline.id];
				action.data.pipelineId = pipeline.id;
				return Object.assign({}, pipeline, {
					nodes: nodes(pipeline.nodes, action),
					comments: comments(pipeline.comments, action),
					links: links(pipeline.links, action) });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}
	case "SET_OBJECTS_MULTI_STYLE":
	case "SET_LINKS_MULTI_STYLE": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (action.data.pipelineObjStyles.findIndex((entry) => entry.pipelineId === pipeline.id) > -1) {
				action.data.pipelineId = pipeline.id;
				return Object.assign({}, pipeline, {
					nodes: nodes(pipeline.nodes, action),
					comments: comments(pipeline.comments, action),
					links: links(pipeline.links, action) });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });

	}
	case "SET_NODES_MULTI_DECORATIONS": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (action.data.pipelineNodeDecorations.findIndex((entry) => entry.pipelineId === pipeline.id) > -1) {
				action.data.pipelineId = pipeline.id;
				return Object.assign({}, pipeline, {
					nodes: nodes(pipeline.nodes, action),
					comments: pipeline.comments,
					links: pipeline.links });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });

	}
	case "SET_LINKS_MULTI_DECORATIONS": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (action.data.pipelineLinkDecorations.findIndex((entry) => entry.pipelineId === pipeline.id) > -1) {
				action.data.pipelineId = pipeline.id;
				return Object.assign({}, pipeline, {
					nodes: pipeline.nodes,
					comments: pipeline.comments,
					links: links(pipeline.links, action) });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });

	}
	case "REMOVE_ALL_STYLES": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			return Object.assign({}, pipeline, {
				nodes: nodes(pipeline.nodes, action),
				comments: comments(pipeline.comments, action),
				links: links(pipeline.links, action) });
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}
	default:
		return state;
	}
};

function getSupernode(supernodeId, pipelineId, pipelines) {
	const pipeline = getPipeline(pipelineId, pipelines);
	return pipeline.nodes.find((n) => n.id === supernodeId);
}

function getSupernodesToConvert(supernodes, supernodePipelineId, type, url, pipelines) {
	let supernodesToConvert = {};
	supernodesToConvert[supernodePipelineId] = [];

	supernodes.forEach((sn) => {
		if ((type === "CONVERT_SN_LOCAL_TO_EXTERNAL" && !sn.subflow_ref.url) ||
				(type === "CONVERT_SN_EXTERNAL_TO_LOCAL" && sn.subflow_ref.url === url)) {
			supernodesToConvert[supernodePipelineId].push(sn);
			const sns = getChildSupernodes(sn, pipelines);
			if (sns.length > 0) {
				const res = getSupernodesToConvert(sns, sn.subflow_ref.pipeline_id_ref, type, url, pipelines);
				supernodesToConvert = Object.assign(supernodesToConvert, res);
			}
		}
	});
	return supernodesToConvert;
}

// Returns an array of pipeline IDs to convert from the object containing
// arrays of supernodes that are to be converted.
function getPipelineIdsToConvert(supernodesToConvert) {
	const pipelinesToConvert = [];

	for (const key in supernodesToConvert) {
		if (supernodesToConvert[key]) {
			const sns = supernodesToConvert[key];
			sns.forEach((sn) => {
				pipelinesToConvert.push(sn.subflow_ref.pipeline_id_ref);
			});
		}
	}

	return pipelinesToConvert;
}

// Returns and array of supernodes containd within the pipeline referenced by
// the parent supernode passed in, based on the set of existing pipelines
// passed in.
function getChildSupernodes(sn, pipelines) {
	const snPipelineId = sn.subflow_ref.pipeline_id_ref;
	const snPipeline = getPipeline(snPipelineId, pipelines);
	if (snPipeline) {
		return snPipeline.nodes.filter((n) => n.type === SUPER_NODE);
	}
	return [];
}

function getPipeline(id, pipelines) {
	return pipelines.find((p) => p.id === id);
}
