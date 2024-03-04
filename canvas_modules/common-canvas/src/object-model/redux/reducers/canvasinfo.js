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
/* eslint arrow-body-style: ["off"] */

import nodes from "./nodes.js";
import comments from "./comments.js";
import links from "./links.js";

export default (state = {}, action) => {
	switch (action.type) {

	case "SET_CANVAS_INFO": {
		if (action.canvasInfo) {
			return Object.assign({}, action.canvasInfo);
		}
		return state;
	}

	case "SET_CANVAS_CONFIG_INFO":
	case "REPLACE_PIPELINES": {
		return Object.assign({}, state, { pipelines: action.data.pipelines });
	}

	// Add pipelines from the external pipeline flow into the canvas info pipelines array
	case "ADD_EXTERNAL_PIPELINE_FLOW": {
		const pipelines = action.newPipelines.map((p) => Object.assign({}, p));
		const canvasInfoPipelines = state.pipelines.concat(pipelines);
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
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

	case "REPLACE_SN_AND_PIPELINES": {
		// First filter out all the old pipelines.
		let canvasInfoPipelines = state.pipelines.filter((pipeline) => {
			const removePipeline = action.data.pipelinesToRemove.some((p) => p.id === pipeline.id);
			return !removePipeline;
		});

		// Next change the topSupernode because that will have been altered
		canvasInfoPipelines = canvasInfoPipelines.map((pipeline) => {
			if (pipeline.id === action.data.pipelineId) {
				return Object.assign({}, pipeline, { nodes: nodes(pipeline.nodes, action) });
			}
			return pipeline;
		});

		// Then add the new pipelines
		canvasInfoPipelines = canvasInfoPipelines.concat(action.data.pipelinesToAdd);

		// Finally, add the pipelines into the canvas info.
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "SET_PIPELINE_PARENT_URL": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (action.data.pipelines.some((p) => p.id === pipeline.id)) {
				const newPipeline = Object.assign({}, pipeline);
				if (action.data.url) {
					newPipeline.parentUrl = action.data.url;
				} else {
					delete newPipeline.parentUrl;
				}
				return newPipeline;
			}
			return pipeline;
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

	case "SET_ZOOM": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (pipeline.id === action.pipelineId) {
				return Object.assign({}, pipeline, { zoom: { "k": action.data.zoom.k, "x": action.data.zoom.x, "y": action.data.zoom.y } });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "ADD_SUPERNODES": {
		let canvasInfoPipelines = [
			...state.pipelines,
			...action.data.pipelinesToAdd
		];

		canvasInfoPipelines = canvasInfoPipelines.map((pipeline) => {
			if (pipeline.id === action.data.pipelineId) {
				return Object.assign({}, pipeline, {
					nodes: nodes(pipeline.nodes, action)
				});
			}
			return pipeline;
		});

		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "DELETE_SUPERNODES": {
		let canvasInfoPipelines = state.pipelines.filter((pipeline) => {
			const removePipeline = action.data.pipelinesToDelete.some((p) => p.id === pipeline.id);
			return !removePipeline;
		});

		canvasInfoPipelines = canvasInfoPipelines.map((pipeline) => {
			if (pipeline.id === action.data.pipelineId) {
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

	case "HIDE_COMMENTS": {
		return { ...state, hideComments: true };
	}

	case "SHOW_COMMENTS": {
		return { ...state, hideComments: false };
	}

	case "ADD_NODE":
	case "REPLACE_NODES":
	case "REPLACE_NODE":
	case "SIZE_AND_POSITION_OBJECTS":
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
	case "SET_OBJECTS_COLOR_CLASS_NAME":
	case "SET_INPUT_PORT_LABEL":
	case "SET_OUTPUT_PORT_LABEL":
	case "SET_INPUT_PORT_SUBFLOW_NODE_REF":
	case "SET_OUTPUT_PORT_SUBFLOW_NODE_REF":
	case "MOVE_OBJECTS":
	case "DELETE_OBJECT":
	case "ADD_LINK":
	case "SET_LINKS":
	case "SET_LINK_PROPERTIES":
	case "SET_LINK_SRC_INFO":
	case "SET_LINK_TRG_INFO":
	case "SET_LINKS_CLASS_NAME":
	case "DELETE_LINK":
	case "DELETE_LINKS":
	case "UPDATE_LINKS":
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

	case "DELETE_AND_UPDATE_OBJECTS": {
		let canvasInfoPipelines = state.pipelines
			.map((pipeline) => {
				if (pipeline.id === action.pipelineId) {
					// Update Links
					let newLinks = links(pipeline.links,
						{ type: "UPDATE_LINKS", data: { linksToUpdate: action.data.linksToUpdate || [] } });

					// Delete Links
					newLinks = links(newLinks,
						{ type: "DELETE_LINKS", data: { linksToDelete: action.data.linksToDelete || [] } });

					// Delete Supernodes
					let newNodes = nodes(pipeline.nodes,
						{ type: "DELETE_SUPERNODES", data: { supernodesToDelete: action.data.supernodesToDelete || [] } });

					newLinks = links(newLinks,
						{ type: "DELETE_SUPERNODES", data: { supernodesToDelete: action.data.supernodesToDelete || [] } });

					// Delete Nodes
					newNodes = nodes(newNodes,
						{ type: "DELETE_NODES", data: { nodesToDelete: action.data.nodesToDelete || [] } });

					// Delete Comments
					const newComments = comments(pipeline.comments,
						{ type: "DELETE_COMMENTS", data: { commentsToDelete: action.data.commentsToDelete || [] } });

					return Object.assign({}, pipeline, {
						nodes: newNodes,
						comments: newComments,
						links: newLinks });
				}
				return pipeline;
			});

		canvasInfoPipelines = canvasInfoPipelines.filter((pipeline) => {
			const removePipeline = action.data.pipelinesToDelete.some((p) => p.id === pipeline.id);
			return !removePipeline;
		});

		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "ADD_PASTED_OBJECTS":
	case "ADD_AND_UPDATE_OBJECTS": {
		let canvasInfoPipelines = state.pipelines
			.map((pipeline) => {
				if (pipeline.id === action.pipelineId) {

					// Add Supernodes
					let newNodes = nodes(pipeline.nodes,
						{ type: "ADD_SUPERNODES", data: { supernodesToAdd: action.data.supernodesToAdd || [] } });

					// Add Nodes
					newNodes = nodes(newNodes,
						{ type: "ADD_NODES", data: { nodesToAdd: action.data.nodesToAdd || [] } });

					// Add Comments
					const newComments = comments(pipeline.comments,
						{ type: "ADD_COMMENTS", data: { commentsToAdd: action.data.commentsToAdd || [] } });

					// Add Links
					let newLinks = links(pipeline.links,
						{ type: "ADD_LINKS", data: { linksToAdd: action.data.linksToAdd || [] } });

					// Update Links
					newLinks = links(newLinks,
						{ type: "UPDATE_LINKS", data: { linksToUpdate: action.data.linksToUpdate || [] } });

					return Object.assign({}, pipeline, {
						nodes: newNodes,
						comments: newComments,
						links: newLinks });
				}
				return pipeline;
			});

		canvasInfoPipelines = [
			...canvasInfoPipelines,
			...action.data.pipelinesToAdd
		];

		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "DELETE_PASTED_OBJECTS": {
		const canvasInfoPipelines = state.pipelines
			// Filter out the pipelines to delete
			.filter((pipeline) => (!isPipelineToDelete(pipeline, action.data.pipelinesToDelete)))
			// Modify the pipeline to remove nodes, comments and links
			.map((pipeline) => {
				if (pipeline.id === action.pipelineId) {
					// Remove pasted nodes
					const newNodes = nodes(pipeline.nodes,
						{ type: "DELETE_NODES", data: action.data });

					// Remove pasted comments
					const newComments = comments(pipeline.comments,
						{ type: "DELETE_COMMENTS", data: action.data });

					// Remove pasted links
					const newLinks = links(pipeline.links,
						{ type: "REMOVE_LINKS", data: action.data });

					return Object.assign({}, pipeline, {
						nodes: newNodes,
						comments: newComments,
						links: newLinks });
				}
				return pipeline;
			});

		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "SET_SUPERNODE_EXPAND_STATE": {
		const canvasInfoPipelines = state.pipelines
			.map((pipeline) => {
				if (pipeline.id === action.pipelineId) {
					// Add nodes, comments and links to main pipeline
					let newNodes = nodes(pipeline.nodes,
						{ type: "SET_SUPERNODE_EXPAND_STATE", data: action.data });

					newNodes = nodes(newNodes,
						{ type: "SET_NODE_POSITIONS", data: { nodePositions: action.data.objectPositions } });

					const newComments = comments(pipeline.comments,
						{ type: "SET_COMMENT_POSITIONS", data: { commentPositions: action.data.objectPositions } });

					const newLinks = links(pipeline.links,
						{ type: "SET_LINK_POSITIONS", data: action.data });

					return Object.assign({}, pipeline, {
						nodes: newNodes,
						comments: newComments,
						links: newLinks });
				}
				return pipeline;
			});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "DECONSTRUCT_SUPERNODE": {
		const canvasInfoPipelines = state.pipelines
			// Filter out the pipeline to delete
			.filter((p) => p.id !== action.data.pipelineToDelete.id)
			// Modify the pipeline where the supernode exists
			.map((pipeline) => {
				if (pipeline.id === action.data.pipelineId) {
					// Add nodes, comments and links to main pipeline
					let newNodes = nodes(pipeline.nodes,
						{ type: "ADD_NODES", data: action.data });

					let newComments = comments(pipeline.comments,
						{ type: "ADD_COMMENTS", data: action.data });

					let newLinks = links(pipeline.links,
						{ type: "ADD_LINKS", data: action.data });

					// Delete supernode
					newNodes = nodes(newNodes,
						{ type: "DELETE_SUPERNODES", data: { supernodesToDelete: [action.data.supernodeToDelete] } });

					newLinks = links(newLinks,
						{ type: "DELETE_SUPERNODES", data: { supernodesToDelete: [action.data.supernodeToDelete] } });

					// Set object positions to their expanded positions
					newNodes = nodes(newNodes,
						{ type: "SET_NODE_POSITIONS", data: { nodePositions: action.data.newObjectPositions } });

					newComments = comments(newComments,
						{ type: "SET_COMMENT_POSITIONS", data: { commentPositions: action.data.newObjectPositions } });

					newLinks = links(newLinks,
						{ type: "SET_LINK_POSITIONS", data: { linkPositions: action.data.newLinkPositions } });


					return Object.assign({}, pipeline, {
						nodes: newNodes,
						comments: newComments,
						links: newLinks });
				}
				return pipeline;
			});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "RECONSTRUCT_SUPERNODE": {
		// Add back the pipeline that was deleted.
		let canvasInfoPipelines = [
			...state.pipelines,
			action.data.pipelineToDelete
		];

		canvasInfoPipelines = canvasInfoPipelines
			.map((pipeline) => {
				if (pipeline.id === action.data.pipelineId) {
					// Remove nodes, comments and links from main pipeline that were previosuly added
					let newNodes = nodes(pipeline.nodes,
						{ type: "DELETE_NODES", data: { nodesToDelete: action.data.nodesToAdd } });

					let newComments = comments(pipeline.comments,
						{ type: "DELETE_COMMENTS", data: { commentsToDelete: action.data.commentsToAdd } });

					let newLinks = links(pipeline.links,
						{ type: "REMOVE_LINKS", data: { linksToDelete: action.data.linksToAdd } });

					// Add back the supernode
					newNodes = nodes(newNodes,
						{ type: "ADD_SUPERNODES", data: { supernodesToAdd: [action.data.supernodeToDelete] } });

					// Add back removed links
					newLinks = links(newLinks,
						{ type: "ADD_LINKS", data: { linksToAdd: action.data.linksToRemove } });

					// newLinks = links(newLinks,
					// 	{ type: "DELETE_SUPERNODES", data: { supernodesToDelete: [action.data.supernodeToDelete] } });

					// Set object positions to their expanded positions
					newNodes = nodes(newNodes,
						{ type: "SET_NODE_POSITIONS", data: { nodePositions: action.data.oldObjectPositions } });

					newComments = comments(newComments,
						{ type: "SET_COMMENT_POSITIONS", data: { commentPositions: action.data.oldObjectPositions } });

					newLinks = links(newLinks,
						{ type: "SET_LINK_POSITIONS", data: { linkPositions: action.data.oldLinkPositions } });

					return Object.assign({}, pipeline, {
						nodes: newNodes,
						comments: newComments,
						links: newLinks });
				}
				return pipeline;
			});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "SET_OBJECTS_STYLE":
	case "SET_LINKS_STYLE":
	case "SET_OBJECTS_BRANCH_HIGHLIGHT":
	case "SET_LINKS_BRANCH_HIGHLIGHT": {
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

	case "UNSET_OBJECTS_BRANCH_HIGHLIGHT": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			return Object.assign({}, pipeline, {
				nodes: nodes(pipeline.nodes, action),
				comments: comments(pipeline.comments, action),
				links: links(pipeline.links, action) });
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

function isPipelineToDelete(pipeline, pipelinesToDelete) {
	return (pipelinesToDelete.some((p) => p.id === pipeline.id));
}
