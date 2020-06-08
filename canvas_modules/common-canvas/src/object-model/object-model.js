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

import LayoutDimensions from "./layout-dimensions.js";
import CanvasInHandler from "./canvas-in-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import CanvasOutHandler from "./canvas-out-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import PipelineInHandler from "./pipeline-in-handler.js";
import PipelineOutHandler from "./pipeline-out-handler.js";
import CanvasUtils from "../common-canvas/common-canvas-utils";
import APIPipeline from "./api-pipeline.js";

import difference from "lodash/difference";
import isEmpty from "lodash/isEmpty";
import has from "lodash/has";
import union from "lodash/union";
import uuid4 from "uuid/v4";
import { validatePipelineFlowAgainstSchema, validatePaletteAgainstSchema } from "./schemas-utils/schema-validator.js";
import { upgradePipelineFlow, extractVersion, LATEST_VERSION } from "@elyra/pipeline-schemas";
import { upgradePalette, extractPaletteVersion, LATEST_PALETTE_VERSION } from "./schemas-utils/upgrade-palette.js";
import { createCCStore } from "./redux/store.js";

import { ASSOCIATION_LINK, NODE_LINK, ERROR, WARNING, CREATE_PIPELINE,
	CLONE_PIPELINE, SUPER_NODE, HIGHLIGHT_BRANCH, HIGHLIGHT_UPSTREAM,
	HIGHLIGHT_DOWNSTREAM } from "../common-canvas/constants/canvas-constants.js";

export default class ObjectModel {

	constructor() {
		// Create a store defaulting to an empty canvas.
		const emptyCanvasInfo = this.getEmptyCanvasInfo();
		this.store = createCCStore(emptyCanvasInfo);

		// TODO - Remove this global variable when WML Canvas supports pipelineFlow
		this.oldCanvas = null;

		// Optional handler to generate the id of object model objects
		this.idGeneratorHandler = null;

		// Optional callback for notification of selection changes
		this.selectionChangeHandler = null;

		// Optional callback for layout of the canvas
		this.layoutHandler = null;
	}

	// ---------------------------------------------------------------------------
	// Standard methods
	// ---------------------------------------------------------------------------

	// Only used for testing
	dispatch(action) {
		this.store.dispatch(action);
	}

	subscribe(callback) {
		return this.store.subscribe(callback);
	}

	setSchemaValidation(schemaValidation) {
		this.schemaValidation = schemaValidation;
	}

	setSelectionChangeHandler(selectionChangeHandler) {
		this.selectionChangeHandler = selectionChangeHandler;
	}

	setLayoutHandler(layoutHandler) {
		this.layoutHandler = layoutHandler;
	}

	// ---------------------------------------------------------------------------
	// Unique ID generation
	// ---------------------------------------------------------------------------

	getUUID() {
		return uuid4();
	}

	setIdGeneratorHandler(idGeneratorHandler) {
		this.idGeneratorHandler = idGeneratorHandler;
	}

	getUniqueId(action, data) {
		let uniqueId;
		if (this.idGeneratorHandler) {
			uniqueId = this.idGeneratorHandler(action, data);
		}
		// generate v4 uuid if no custom id was generated
		return uniqueId ? uniqueId : this.getUUID();
	}

	// ---------------------------------------------------------------------------
	// Palette methods
	// ---------------------------------------------------------------------------

	clearPaletteData() {
		this.store.dispatch({ type: "CLEAR_PALETTE_DATA" });
	}

	// Deprecated  TODO - Remove this method when WML Canvas migrates to setPipelineFlowPalette() method
	setPaletteData(paletteData) {
		var newPalData = CanvasInHandler.convertPaletteToPipelineFlowPalette(paletteData);
		this.setPipelineFlowPalette(newPalData);
	}

	setPipelineFlowPalette(paletteData) {
		if (!paletteData || isEmpty(paletteData)) {
			this.store.dispatch({ type: "SET_PALETTE_DATA", data: {} });
			return;
		}
		// TODO - this method is called by App.js test harness. Remove this check and
		// code when we remove the x-* example palette files after WML Canvas migrates to use v2.0 palette.
		let palData = paletteData;
		if (CanvasInHandler.isVersion0Palette(palData)) {
			palData = CanvasInHandler.convertPaletteToPipelineFlowPalette(palData);
		}

		const newPalData = this.validateAndUpgradePalette(palData);
		this.store.dispatch({ type: "SET_PALETTE_DATA", data: newPalData });
	}

	getPaletteData() {
		return this.store.getState().palette;
	}

	setCategoryLoadingText(categoryId, loadingText) {
		this.store.dispatch({ type: "SET_CATEGORY_LOADING_TEXT", data: { categoryId: categoryId, loadingText: loadingText } });
	}

	setCategoryEmptyText(categoryId, emptyText) {
		this.store.dispatch({ type: "SET_CATEGORY_EMPTY_TEXT", data: { categoryId: categoryId, emptyText: emptyText } });
	}

	addNodeTypeToPalette(nodeTypeObj, categoryId, categoryLabel, categoryDescription, categoryImage) {
		this.addNodeTypesToPalette([nodeTypeObj], categoryId, categoryLabel, categoryDescription, categoryImage);
	}

	addNodeTypesToPalette(nodeTypeObjs, categoryId, categoryLabel, categoryDescription, categoryImage) {
		const nodeTypePaletteData = {
			"nodeTypes": nodeTypeObjs,
			"categoryId": categoryId,
			"categoryLabel": categoryLabel,
			"categoryDescription": categoryDescription,
			"categoryImage": categoryImage
		};

		this.store.dispatch({ type: "ADD_NODE_TYPES_TO_PALETTE", data: nodeTypePaletteData });

		if (this.schemaValidation) {
			validatePaletteAgainstSchema(this.getPaletteData(), LATEST_PALETTE_VERSION);
		}
	}

	removeNodesFromPalette(selObjectIds, categoryId) {
		this.store.dispatch({ type: "REMOVE_NODE_TYPES_FROM_PALETTE", data: { selObjectIds: selObjectIds, categoryId: categoryId } });
	}

	// Converts a nodeTemplate from the palette (which will be in the pipelineFlow
	// format) to a nodeTemplate compatible with the internal format stored in the
	// object model.
	convertNodeTemplate(nodeTemplate) {
		if (nodeTemplate) {
			const newNodeTemplate = Object.assign({}, nodeTemplate);

			if (newNodeTemplate.app_data) {
				// Ensure we've cloned the app_data not just refer to the original from the palette.
				newNodeTemplate.app_data = JSON.parse(JSON.stringify(nodeTemplate.app_data));

				if (newNodeTemplate.app_data.ui_data) {
					newNodeTemplate.label = nodeTemplate.app_data.ui_data.label;
					newNodeTemplate.image = nodeTemplate.app_data.ui_data.image;
					newNodeTemplate.description = nodeTemplate.app_data.ui_data.description;
					newNodeTemplate.class_name = nodeTemplate.app_data.ui_data.class_name;
					newNodeTemplate.decorations = nodeTemplate.app_data.ui_data.decorations;
					newNodeTemplate.messages = nodeTemplate.app_data.ui_data.messages;

					// We can remove the app_data.ui_data
					delete newNodeTemplate.app_data.ui_data;
				}
			}

			if (nodeTemplate.inputs) {
				newNodeTemplate.inputs = newNodeTemplate.inputs.map((port) => this.convertPort(port));
			}

			if (nodeTemplate.outputs) {
				newNodeTemplate.outputs = newNodeTemplate.outputs.map((port) => this.convertPort(port));
			}

			return newNodeTemplate;
		}
		return null;
	}

	// Converts an incoming port (either input or output ) from a nodetemplate
	// from the palette to an internal format port.
	convertPort(port) {
		const newPort = Object.assign({}, port);
		if (port.app_data && port.app_data.ui_data) {
			if (port.app_data.ui_data.label) {
				newPort.label = port.app_data.ui_data.label;
			}
			if (port.app_data.ui_data.cardinality) {
				newPort.cardinality = port.app_data.ui_data.cardinality;
			}
			if (port.app_data.ui_data.class_name) {
				newPort.class_name = port.app_data.ui_data.class_name;
			}
			// We can remvove this as it is not needed in the internal format.
			delete newPort.app_data.ui_data;
		}
		return newPort;
	}

	getPaletteNode(nodeOpIdRef) {
		let outNodeType = null;
		if (!isEmpty(this.getPaletteData())) {
			this.getPaletteData().categories.forEach((category) => {
				category.node_types.forEach((nodeType) => {
					if (nodeType.op === nodeOpIdRef) {
						outNodeType = nodeType;
					}
				});
			});
		}
		return outNodeType;
	}

	getCategoryForNode(nodeOpIdRef) {
		let result = null;
		this.getPaletteData().categories.forEach((category) => {
			category.node_types.forEach((nodeType) => {
				if (nodeType.op === nodeOpIdRef) {
					result = category;
				}
			});
		});
		return result;
	}

	validateAndUpgradePalette(newPalette) {
		// Clone the palette to ensure we don't modify the incoming parameter.
		let pal = JSON.parse(JSON.stringify(newPalette));

		const version = extractPaletteVersion(pal);

		if (this.schemaValidation) {
			validatePaletteAgainstSchema(pal, version);
		}

		if (version !== LATEST_PALETTE_VERSION) {
			pal = upgradePalette(pal);

			if (this.schemaValidation) {
				validatePaletteAgainstSchema(pal, LATEST_PALETTE_VERSION);
			}
		}
		return pal;
	}

	// ---------------------------------------------------------------------------
	// Pipeline Flow and Canvas methods
	// ---------------------------------------------------------------------------

	getAPIPipeline(pipelineId) {
		if (pipelineId) {
			return new APIPipeline(pipelineId, this);
		}
		return new APIPipeline(this.getCurrentBreadcrumb().pipelineId, this);
	}

	getSelectionAPIPipeline() {
		const id = this.getSelectedPipelineId();
		if (id) {
			return this.getAPIPipeline(id);
		}
		return null;
	}

	clearPipelineFlow() {
		this.setCanvasInfo(this.getEmptyCanvasInfo());
	}

	// Deprectaed TODO - Remove this method when WML Canvas supports pipeline Flow
	// TODO - Remember to also remove declaration of ObjectModel.oldCanvas from above
	setCanvas(canvas) {
		this.oldCanvas = canvas; // TODO - Remember to remvove the declaration of this global when WML Canvas UI supports pipleine flow.
		var canvasInfo = CanvasInHandler.convertCanvasToCanvasInfo(canvas);
		this.setCanvasInfo(canvasInfo);
	}

	// Deprectaed TODO - Remove this method when WML Canvas supports pipeline Flow
	getCanvas() {
		if (this.oldCanvas) {
			return CanvasOutHandler.getCanvasBasedOnCanvasInfo(this.oldCanvas, this.getCanvasInfo());
		}
		return {};
	}

	getEmptyCanvasInfo() {
		const newFlowId = this.getUUID();
		const newPipelineId = this.getUUID();

		return {
			"doc_type": "pipeline",
			"version": "3.0",
			"json_schema": "http://api.dataplatform.ibm.com/schemas/common-pipeline/pipeline-flow/pipeline-flow-v3-schema.json",
			"id": newFlowId,
			"primary_pipeline": newPipelineId,
			"pipelines": [
				{
					"id": newPipelineId,
					"runtime_ref": "",
					"nodes": [],
					"comments": [],
					"links": []
				}
			],
			"schemas": []
		};
	}

	setPipelineFlow(newPipelineFlow) {
		// TODO - Remove this if clause when we remove x-* test files.
		if (newPipelineFlow.objectData) { // Old canvas docs will have an 'objectData' field
			this.setCanvas(newPipelineFlow);
			return;
		}

		// If there's no current layout info then add some default layout before
		// setting canvas info. This is mainly necessary for Jest testcases.
		if (isEmpty(this.getLayoutInfo())) {
			this.setDefaultLayout();
		}

		const pipelineFlow = this.validateAndUpgrade(newPipelineFlow);
		const canvasInfo = PipelineInHandler.convertPipelineFlowToCanvasInfo(pipelineFlow, this.getCanvasLayout());
		canvasInfo.pipelines = this.prepareNodes(canvasInfo.pipelines, this.getNodeLayout(), this.getCanvasLayout());

		this.executeWithSelectionChange(this.store.dispatch, {
			type: "SET_CANVAS_INFO",
			canvasInfo: canvasInfo,
			currentCanvasInfo: this.getCanvasInfo() });
	}

	// Does all preparation needed for nodes before they are saved into Redux.
	prepareNodes(pipelines, nodeLayout, canvasLayout) {
		const newPipelines = this.setSupernodesBindingStatus(pipelines);
		return newPipelines.map((pipeline) => this.setPipelineObjectAttributes(pipeline, nodeLayout, canvasLayout));
	}

	// Loops through all the pipelines and adds the appropriate supernode binding
	// attribute to any binding nodes that are referenced by the ports of a supernode.
	setSupernodesBindingStatus(pipelines) {
		// First, clear all supernode binding statuses from nodes
		pipelines.forEach((pipeline) => {
			if (pipeline.nodes) {
				pipeline.nodes.forEach((node) => {
					delete node.isSupernodeInputBinding;
					delete node.isSupernodeOutputBinding;
				});
			}
		});
		// Set the supernode binding statuses as appropriate.
		pipelines.forEach((pipeline) => {
			if (pipeline.nodes) {
				pipeline.nodes.forEach((node) => {
					if (node.type === SUPER_NODE && node.subflow_ref && node.subflow_ref.pipeline_id_ref) {
						if (node.inputs) {
							node.inputs.forEach((input) => {
								if (input.subflow_node_ref) {
									const subNode = this.findNode(input.subflow_node_ref, node.subflow_ref.pipeline_id_ref, pipelines);
									if (subNode) {
										subNode.isSupernodeInputBinding = true;
									}
								}
							});
						}
						if (node.outputs) {
							node.outputs.forEach((output) => {
								if (output.subflow_node_ref) {
									const subNode = this.findNode(output.subflow_node_ref, node.subflow_ref.pipeline_id_ref, pipelines);
									if (subNode) {
										subNode.isSupernodeOutputBinding = true;
									}
								}
							});
						}
					}
				});
			}
		});
		return pipelines;
	}

	setPipelineObjectAttributes(inPipeline, nodeLayout, canvasLayout) {
		const pipeline = Object.assign({}, inPipeline);
		if (pipeline.nodes) {
			pipeline.nodes = pipeline.nodes.map((node) => this.setNodeAttributesWithLayout(node, nodeLayout, canvasLayout));
		} else {
			pipeline.nodes = [];
		}

		if (pipeline.comments) {
			pipeline.comments = pipeline.comments.map((comment) => this.setCommentAttributesWithLayout(comment, canvasLayout));
		} else {
			pipeline.comments = [];
		}

		return pipeline;
	}

	// Returns a copy of the node passed in with additional fields which contain
	// layout, dimension and supernode binding status info. This uses the redux
	// layout information. This is called from the api-pipeline class.
	setNodeAttributes(node) {
		return this.setNodeAttributesWithLayout(node, this.getNodeLayout(), this.getCanvasLayout());
	}

	// Returns a copy of the comment passed in with position adjusted for
	// snap to grid, if necessary. This is called from the api-pipeline class.
	setCommentAttributes(comment) {
		return this.setCommentAttributesWithLayout(comment, this.getCanvasLayout());
	}

	// Returns a copy of the node passed using the layout info provided. The
	// returned node is augmented with additional fields which contain
	// layout, dimension and supernode binding status info.
	setNodeAttributesWithLayout(node, nodeLayout, canvasLayout) {
		let newNode = Object.assign({}, node);
		newNode = this.setNodeLayoutAttributes(newNode, nodeLayout);
		if (canvasLayout.linkDirection === "TopBottom" ||
				canvasLayout.linkDirection === "BottomTop") {
			newNode = this.setNodeDimensionAttributesVertical(newNode, canvasLayout);
		} else {
			newNode = this.setNodeDimensionAttributesLeftRight(newNode, canvasLayout);
		}
		if (canvasLayout.snapToGridType === "During" ||
				canvasLayout.snapToGridType === "After") {
			newNode.x_pos = CanvasUtils.snapToGrid(newNode.x_pos, canvasLayout.snapToGridX);
			newNode.y_pos = CanvasUtils.snapToGrid(newNode.y_pos, canvasLayout.snapToGridY);
		}
		return newNode;
	}

	// Returns a copy of the comment passed using the layout info provided. The
	// returned comment has its position adjusted for snap to grid, if necessary.
	setCommentAttributesWithLayout(comment, canvasLayout) {
		const newComment = Object.assign({}, comment);
		if (canvasLayout.snapToGridType === "During" ||
				canvasLayout.snapToGridType === "After") {
			newComment.x_pos = CanvasUtils.snapToGrid(newComment.x_pos, canvasLayout.snapToGridX);
			newComment.y_pos = CanvasUtils.snapToGrid(newComment.y_pos, canvasLayout.snapToGridY);
		}
		return newComment;
	}

	// Returns the node passed in with additional fields which contains
	// the layout info.
	setNodeLayoutAttributes(node, nodeLayout) {
		node.layout = nodeLayout;

		// If using the layoutHandler we must make a copy of the layout for each node
		// so the original layout info doesn't get overwritten.
		if (this.layoutHandler) {
			const customLayout = this.layoutHandler(node);
			if (customLayout && !isEmpty(customLayout)) {
				const decs = CanvasUtils.getCombinedDecorations(node.layout.decorations, customLayout.decorations);
				node.layout = Object.assign({}, node.layout, customLayout, { decorations: decs });
			}
		}
		return node;
	}

	// Returns the node passed in with additional fields which contains
	// the height occupied by the input ports and output ports, based on the
	// layout info passed in, as well as the node width.
	setNodeDimensionAttributesLeftRight(node, canvasLayout) {
		if (canvasLayout.connectionType === "ports") {
			node.inputPortsHeight = node.inputs
				? (node.inputs.length * (node.layout.portArcRadius * 2)) + ((node.inputs.length - 1) * node.layout.portArcSpacing) + (node.layout.portArcOffset * 2)
				: 0;

			node.outputPortsHeight = node.outputs
				? (node.outputs.length * (node.layout.portArcRadius * 2)) + ((node.outputs.length - 1) * node.layout.portArcSpacing) + (node.layout.portArcOffset * 2)
				: 0;

			node.height = Math.max(node.inputPortsHeight, node.outputPortsHeight, node.layout.defaultNodeHeight);

			if (node.type === SUPER_NODE && node.is_expanded) {
				node.height += canvasLayout.supernodeTopAreaHeight + canvasLayout.supernodeSVGAreaPadding;
				// If an expanded height is provided make sure it is at least as big
				// as the node height.
				if (node.expanded_height) {
					node.expanded_height = Math.max(node.expanded_height, node.height);
				}
			}
		} else { // 'halo' connection type
			node.inputPortsHeight = 0;
			node.outputPortsHeight = 0;
			node.height = node.layout.defaultNodeHeight;
		}
		node.width = node.layout.defaultNodeWidth;

		if (node.type === SUPER_NODE && node.is_expanded) {
			node.width = CanvasUtils.getSupernodeExpandedWidth(node, canvasLayout);
			node.height = CanvasUtils.getSupernodeExpandedHeight(node, canvasLayout);
		}

		return node;
	}

	// Returns the node passed in with additional fields which contains
	// the height occupied by the input ports and output ports, based on the
	// layout info passed in, as well as the node width.
	setNodeDimensionAttributesVertical(node, canvasLayout) {
		if (canvasLayout.connectionType === "ports") {
			node.inputPortsWidth = node.inputs
				? (node.inputs.length * (node.layout.portArcRadius * 2)) + ((node.inputs.length - 1) * node.layout.portArcSpacing) + (node.layout.portArcOffset * 2)
				: 0;

			node.outputPortsWidth = node.outputs
				? (node.outputs.length * (node.layout.portArcRadius * 2)) + ((node.outputs.length - 1) * node.layout.portArcSpacing) + (node.layout.portArcOffset * 2)
				: 0;

			node.width = Math.max(node.inputPortsWidth, node.outputPortsWidth, node.layout.defaultNodeWidth);

			if (node.type === SUPER_NODE && node.is_expanded) {
				node.width += (2 * canvasLayout.supernodeSVGAreaPadding);
				// If an expanded height is provided make sure it is at least as big
				// as the node height.
				if (node.expanded_width) {
					node.expanded_width = Math.max(node.expanded_width, node.width);
				}
			}
		} else { // 'halo' connection type
			node.inputPortsWidth = 0;
			node.outputPortsWidth = 0;
			node.width = node.layout.defaultNodeWidth;
		}
		node.height = node.layout.defaultNodeHeight;

		if (node.type === SUPER_NODE && node.is_expanded) {
			node.width = CanvasUtils.getSupernodeExpandedWidth(node, canvasLayout);
			node.height = CanvasUtils.getSupernodeExpandedHeight(node, canvasLayout);
		}

		return node;
	}

	validateAndUpgrade(newPipelineFlow) {
		// Clone the pipelineFlow to ensure we don't modify the incoming parameter.
		let pipelineFlow = JSON.parse(JSON.stringify(newPipelineFlow));

		const version = extractVersion(pipelineFlow);

		if (this.schemaValidation) {
			validatePipelineFlowAgainstSchema(pipelineFlow, version);
		}

		if (version !== LATEST_VERSION) {
			pipelineFlow = upgradePipelineFlow(pipelineFlow);

			if (this.schemaValidation) {
				validatePipelineFlowAgainstSchema(pipelineFlow, LATEST_VERSION);
			}
		}
		return pipelineFlow;
	}

	// Returns a pipeline flow based on the initial pipeline flow we were given
	// with the changes to canvasinfo made by the user. We don't do this in the
	// redux code because that would result is continuous update of the pipelineflow
	// as the consuming app makes getPipelineFlow() calls which are difficult to
	// handle when testing.
	getPipelineFlow() {
		const pipelineFlow =
			PipelineOutHandler.createPipelineFlow(this.getCanvasInfo());

		if (this.schemaValidation) {
			validatePipelineFlowAgainstSchema(pipelineFlow);
		}

		return pipelineFlow;
	}

	// Returns an array of pipelines based on the array of pipeline IDs
	// passed in.
	getPipelines(pipelineIds) {
		const pipelines = [];
		pipelineIds.forEach((pipelineId) => {
			pipelines.push(this.getCanvasInfoPipeline(pipelineId));
		});
		return pipelines;
	}

	// Returns the pipeline for the ID passed or the primary pipeline if no
	// pipeline ID was provided otherwise null.
	getCanvasInfoPipeline(pipelineId) {
		const canvasInfo = this.getCanvasInfo();
		if (!canvasInfo) {
			return null;
		}
		let pId = pipelineId;
		if (!pId) {
			pId = this.getPrimaryPipelineId();
		}

		const pipeline = canvasInfo.pipelines.find((p) => {
			return p.id === pId;
		});

		return (typeof pipeline === "undefined") ? null : pipeline;
	}

	// Returns an associative array (indexed by the node ID) of pipeline arrays.
	// The pipeline arrays are any descendent pipelines of the supernode being
	// processed from the array of supernodes passed in.
	getReferencedPipelines(supernodes) {
		const pipelines = {};
		supernodes.forEach((supernode) => {
			if (has(supernode, "subflow_ref.pipeline_id_ref")) {
				let pipelineIds = [supernode.subflow_ref.pipeline_id_ref];
				pipelineIds = pipelineIds.concat(this.getDescendentPipelineIds(supernode.subflow_ref.pipeline_id_ref));
				pipelines[supernode.id] = this.getPipelines(pipelineIds);
			}
		});
		return pipelines;
	}

	getDescendentPipelineIds(pipelineId) {
		let pipelineIds = [];
		this.getAPIPipeline(pipelineId).getSupernodes()
			.forEach((supernode) => {
				const subPipelineId = this.getSupernodePipelineID(supernode);
				if (subPipelineId) {
					pipelineIds.push(subPipelineId);
					pipelineIds = pipelineIds.concat(this.getDescendentPipelineIds(subPipelineId));
				}
			});
		return pipelineIds;
	}

	// Returns a list of the given pipelineId ancestors, from "oldest" to "youngest".
	// This is a list of objects containing the pipeline id and its corresponding supernode label and id.
	// Includes itself.
	getAncestorPipelineIds(pipelineId) {
		const primaryPipelineId = this.getPrimaryPipelineId();
		if (primaryPipelineId === pipelineId) {
			return [{ pipelineId: primaryPipelineId }];
		}
		const ancestors = [{ pipelineId: primaryPipelineId }];
		return ancestors.concat(this.getAncestorsBetween(primaryPipelineId, pipelineId));
	}

	getAncestorsBetween(upperPipelineId, lowerPipelineId) {
		let ancestors = [];
		this.getAPIPipeline(upperPipelineId).getSupernodes()
			.forEach((supernode) => {
				const subPipelineId = this.getSupernodePipelineID(supernode);
				if (subPipelineId) {
					if (this.isAncestorOfPipeline(subPipelineId, lowerPipelineId) || subPipelineId === lowerPipelineId) {
						ancestors.push({ pipelineId: subPipelineId, label: supernode.label, supernodeId: supernode.id, parentPipelineId: upperPipelineId });
					}
					ancestors = ancestors.concat(this.getAncestorsBetween(subPipelineId, lowerPipelineId));
				}
			});
		return ancestors;
	}

	// Returns true if ancestorId is an ancestor pipeline of pipelineId.
	isAncestorOfPipeline(ancestorId, pipelineId) {
		const decendents = this.getDescendentPipelineIds(ancestorId);
		if (decendents.indexOf(pipelineId) > -1) {
			return true;
		}
		return false;
	}

	getSupernodePipelineID(supernode) {
		if (has(supernode, "subflow_ref.pipeline_id_ref")) {
			return supernode.subflow_ref.pipeline_id_ref;
		}
		return null;
	}

	// Return the supernode object that has a subflow_ref to the given pipelineId.
	// There should only be one supernode referencing the pipeline.
	getSupernodeObjReferencing(pipelineId) {
		let supernodeRef;
		if (pipelineId === this.getPrimaryPipelineId()) {
			const supernodes = this.getAPIPipeline(pipelineId).getSupernodes();
			supernodeRef = supernodes.find((supernode) => has(supernode, "subflow_ref.pipeline_id_ref") && supernode.subflow_ref.pipeline_id_ref === pipelineId).id;
		} else {
			const ancestorPipelines = this.getAncestorPipelineIds(pipelineId);
			const supernodePipelineObj = ancestorPipelines.find((pipelineObj) => pipelineObj.pipelineId === pipelineId && has(pipelineObj, "supernodeId"));
			supernodeRef = supernodePipelineObj;
		}
		return supernodeRef;
	}

	setCanvasInfo(inCanvasInfo) {
		// If there's no current layout info then add some default layout before
		// setting canvas info. This is mainly necessary for Jest testcases.
		if (isEmpty(this.getLayoutInfo())) {
			this.setDefaultLayout();
		}
		const canvasInfo = Object.assign({}, inCanvasInfo);
		canvasInfo.pipelines = this.prepareNodes(canvasInfo.pipelines, this.getNodeLayout(), this.getCanvasLayout());
		this.store.dispatch({ type: "SET_CANVAS_INFO", canvasInfo: canvasInfo, currentCanvasInfo: this.getCanvasInfo() });
	}

	isPrimaryPipelineEmpty() {
		const primaryPipeline = this.getAPIPipeline(this.getCanvasInfo().primary_pipeline);
		return primaryPipeline.isEmpty();
	}

	getPipelineFlowId() {
		return this.getCanvasInfo().id;
	}

	getPrimaryPipelineId() {
		return this.getCanvasInfo().primary_pipeline;
	}

	addPipeline(pipeline) {
		this.store.dispatch({ type: "ADD_PIPELINE", data: pipeline });
	}

	deletePipeline(pipelineId) {
		this.store.dispatch({ type: "DELETE_PIPELINE", data: { id: pipelineId } });
	}

	// Clones the contents of the input node (which is expected to be a supernode)
	// and returns an array of cloned pipelines from the inPipelines array that
	// correspond to descendents of the supernode passed in. The returned
	// pipelines are in the internal 'canvasinfo' format.
	cloneSuperNodeContents(node, inPipelines) {
		let subPipelines = [];
		if (node.type === SUPER_NODE &&
				has(node, "subflow_ref.pipeline_id_ref")) {
			const targetPipeline = inPipelines.find((inPipeline) => inPipeline.id === node.subflow_ref.pipeline_id_ref);
			const clonedPipeline = this.clonePipelineWithNewId(targetPipeline);
			node.subflow_ref.pipeline_id_ref = clonedPipeline.id;
			const canvInfoPipeline =
				PipelineInHandler.convertPipelineToCanvasInfoPipeline(clonedPipeline, this.getCanvasLayout());

			subPipelines.push(canvInfoPipeline);

			clonedPipeline.nodes.forEach((clonedNode) => {
				if (clonedNode.type === SUPER_NODE) {
					const extraPipelines = this.cloneSuperNodeContents(clonedNode, inPipelines);
					subPipelines = subPipelines.concat(extraPipelines);
				}
			});
		}
		return subPipelines;
	}

	// Clone the pipeline and assigns it a new id.
	clonePipelineWithNewId(pipeline) {
		const clonedPipeline = JSON.parse(JSON.stringify(pipeline));
		return Object.assign({}, clonedPipeline, { id: this.getUniqueId(CLONE_PIPELINE, { "pipeline": clonedPipeline }) });
	}

	// Returns an array of pipelines, that conform to the schema, for the
	// supernode passed in or an empty array if the supernode doesn't reference
	// a pipeline.
	getSubPipelinesForSupernode(supernode) {
		const schemaPipelines = [];
		if (supernode.type === SUPER_NODE &&
				has(supernode, "subflow_ref.pipeline_id_ref")) {
			let subPipelines = [supernode.subflow_ref.pipeline_id_ref];
			subPipelines = subPipelines.concat(this.getDescendentPipelineIds(supernode.subflow_ref.pipeline_id_ref));

			subPipelines.forEach((subPiplineId) => {
				const canvInfoPipeline = this.getCanvasInfoPipeline(subPiplineId);
				const schemaPipeline = PipelineOutHandler.createPipeline(canvInfoPipeline);
				schemaPipelines.push(schemaPipeline);
			});
		}
		return schemaPipelines;
	}

	createCanvasInfoPipeline(pipelineInfo) {
		const newPipelineId = this.getUniqueId(CREATE_PIPELINE, { pipeline: pipelineInfo });
		const newCanvasInfoPipeline = Object.assign({}, pipelineInfo);
		newCanvasInfoPipeline.id = newPipelineId;
		return newCanvasInfoPipeline;
	}

	getCanvasInfo() {
		return this.store.getState().canvasinfo;
	}

	setSubdueStyle(newStyle) {
		this.store.dispatch({ type: "SET_SUBDUE_STYLE", data: { subdueStyle: newStyle } });
	}

	removeAllStyles(temporary) {
		this.store.dispatch({ type: "REMOVE_ALL_STYLES", data: { temporary: temporary } });
	}

	findNode(nodeId, pipelineId, pipelines) {
		const targetPipeline = pipelines.find((p) => {
			return (p.id === pipelineId);
		});

		if (targetPipeline && targetPipeline.nodes) {
			return targetPipeline.nodes.find((node) => {
				return (node.id === nodeId);
			});
		}
		return null;
	}

	// ---------------------------------------------------------------------------
	// Breadcrumbs methods
	// ---------------------------------------------------------------------------

	// Adds a new breadcrumb, for the pipelineInfo passed in, to the array of
	// breadcrumbs, or reset the breadcrumbs to the primary pipeline if navigating
	// to the primary pipeline.
	addNewBreadcrumb(pipelineInfo) {
		if (pipelineInfo && pipelineInfo.pipelineId !== this.getPrimaryPipelineId()) {
			this.store.dispatch({ type: "ADD_NEW_BREADCRUMB", data: pipelineInfo });
		} else {
			this.resetBreadcrumb();
		}
	}

	// Sets the breadcrumbs to the previous breadcrumb in the breadcrumbs array.
	setPreviousBreadcrumb() {
		this.store.dispatch({ type: "SET_TO_PREVIOUS_BREADCRUMB" });
	}

	// Sets the breadcrumbs to the primary pipeline in the breadcrumbs array.
	resetBreadcrumb() {
		this.store.dispatch({ type: "RESET_BREADCRUMB", data: { pipelineId: this.getPrimaryPipelineId(), pipelineFlowId: this.getPipelineFlowId() } });
	}

	getBreadcrumbs() {
		return this.store.getState().breadcrumbs;
	}

	getCurrentBreadcrumb() {
		const crumbs = this.getBreadcrumbs();
		return crumbs[crumbs.length - 1];
	}

	getPreviousBreadcrumb() {
		const crumbs = this.getBreadcrumbs();
		if (crumbs.length < 2) {
			return null;
		}
		return crumbs[crumbs.length - 2];
	}

	// Returns true if the pipelineId passed in is not the primary pipeline
	// breadcrumb. In other words, we are showing a sub-flow full screen.
	isInSubFlowBreadcrumb(pipelineId) {
		const idx = this.getBreadcrumbs().findIndex((crumb) => {
			return crumb.pipelineId === pipelineId;
		});
		return (idx > 0); // Return true if index is not the parent
	}


	// ---------------------------------------------------------------------------
	// Layout Info methods
	// ---------------------------------------------------------------------------

	setLayoutType(type, config) {
		const layoutInfo = Object.assign({}, LayoutDimensions.getLayout(type, config));
		const newPipelines = this.prepareNodes(this.getCanvasInfo().pipelines, layoutInfo.nodeLayout, layoutInfo.canvasLayout);

		this.store.dispatch({ type: "SET_LAYOUT_INFO",
			layoutinfo: layoutInfo,
			pipelines: newPipelines
		});
	}

	setDefaultLayout() {
		const layoutInfo = LayoutDimensions.getLayout();
		const newPipelines = this.prepareNodes(this.getCanvasInfo().pipelines, layoutInfo.nodeLayout, layoutInfo.canvasLayout);

		this.store.dispatch({ type: "SET_LAYOUT_INFO",
			layoutinfo: layoutInfo,
			pipelines: newPipelines
		});
	}

	getLayoutInfo() {
		return this.store.getState().layoutinfo;
	}

	getNodeLayout() {
		return this.store.getState().layoutinfo.nodeLayout;
	}

	getCanvasLayout() {
		return this.store.getState().layoutinfo.canvasLayout;
	}


	// ---------------------------------------------------------------------------
	// Notification Messages methods
	// ---------------------------------------------------------------------------

	clearNotificationMessages() {
		this.store.dispatch({ type: "CLEAR_NOTIFICATION_MESSAGES" });
	}

	setNotificationMessages(messages) {
		const newMessages = [];
		messages.forEach((message) => {
			const newMessageObj = Object.assign({}, message);
			if (newMessageObj.type === null || newMessageObj.type === "" || typeof newMessageObj.type === "undefined") {
				newMessageObj.type = "unspecified";
			}
			newMessages.push(newMessageObj);
		});
		this.store.dispatch({ type: "SET_NOTIFICATION_MESSAGES", data: newMessages });
	}

	getNotificationMessages(messageType) {
		const notificationMessages = this.store.getState().notifications;
		if (messageType) {
			return notificationMessages.filter((message) => {
				return message.type === messageType;
			});
		}
		return notificationMessages;
	}

	deleteNotificationMessages(ids) {
		const filterIds = Array.isArray(ids) ? ids : [ids];
		const newMessages = this.getNotificationMessages().filter((message) => !filterIds.includes(message.id));
		this.store.dispatch({ type: "SET_NOTIFICATION_MESSAGES", data: newMessages });
	}

	// ---------------------------------------------------------------------------
	// Selection methods
	// ---------------------------------------------------------------------------

	getSelectedObjectIds() {
		return this.getSelectionInfo().selections || [];
	}

	getSelectedNodesIds() {
		var objs = [];
		const apiPipeline = this.getSelectedPipeline();
		apiPipeline.getNodes().forEach((node) => {
			if (this.getSelectedObjectIds().includes(node.id)) {
				objs.push(node.id);
			}
		});
		return objs;
	}

	getSelectedNodes() {
		const objs = [];
		const apiPipeline = this.getSelectedPipeline();
		apiPipeline.getNodes().forEach((node) => {
			if (this.getSelectedObjectIds().includes(node.id)) {
				objs.push(node);
			}
		});

		return objs;
	}

	getSelectedComments() {
		const objs = [];
		const apiPipeline = this.getSelectedPipeline();
		apiPipeline.getComments().forEach((com) => {
			if (this.getSelectedObjectIds().includes(com.id)) {
				objs.push(com);
			}
		});

		return objs;
	}

	getSelectedObjects() {
		return this.getSelectedNodes().concat(this.getSelectedComments());
	}

	getSelectionInfo() {
		return this.store.getState().selectioninfo;
	}

	getSelectedPipeline() {
		return this.getAPIPipeline(this.getSelectedPipelineId());
	}

	getSelectedPipelineId() {
		return this.getSelectionInfo().pipelineId;
	}

	clearSelections() {
		this.executeWithSelectionChange(this.store.dispatch, { type: "CLEAR_SELECTIONS" });
	}

	isSelected(objectId, pipelineId) {
		return pipelineId === this.getSelectedPipelineId() &&
			this.getSelectedObjectIds().indexOf(objectId) >= 0;
	}

	toggleSelection(objectId, toggleRequested, pipelineId) {
		let newSelections = [objectId];

		if (pipelineId === this.getSelectedPipelineId() &&
				toggleRequested) {
			// If already selected then remove otherwise add
			if (this.isSelected(objectId, pipelineId)) {
				newSelections = this.getSelectedObjectIds().slice();
				const index = newSelections.indexOf(objectId);
				newSelections.splice(index, 1);
			}	else {
				newSelections = this.getSelectedObjectIds().concat(objectId);
			}
		}
		this.setSelections(newSelections, pipelineId);
	}

	setSelections(newSelections, pipelineId) {
		// This will return the default API pipeline if a pipelineId is not provided.
		const selPipelineId = this.getAPIPipeline(pipelineId).pipelineId;
		this.executeWithSelectionChange(this.store.dispatch, { type: "SET_SELECTIONS", data: { pipelineId: selPipelineId, selections: newSelections } });
	}

	deleteSelectedObjects() {
		const apiPipeline = this.getSelectedPipeline();
		apiPipeline.deleteObjects(this.getSelectedObjectIds());
	}

	selectAll(pipelineId) {
		const selected = [];
		const pipeId = pipelineId ? pipelineId : this.getAPIPipeline().pipelineId; // If no pipelineId is provided use the default pipelineId.
		const pipeline = this.getAPIPipeline(pipeId);
		for (const node of pipeline.getNodes()) {
			if (!this.isSupernodeBinding(node)) { // Dont allow supernode binding nodes to be selected
				selected.push(node.id);
			}
		}
		for (const comment of pipeline.getComments()) {
			selected.push(comment.id);
		}
		this.setSelections(selected, pipeId);
	}

	isSupernodeBinding(node) {
		return node.isSupernodeInputBinding || node.isSupernodeOutputBinding;
	}

	selectInRegion(minX, minY, maxX, maxY, pipelineId) {
		const pipeline = this.getAPIPipeline(pipelineId);
		var regionSelections = [];
		for (const node of pipeline.getNodes()) {
			if (!this.isSupernodeBinding(node) && // Don't include binding nodes in select
					minX < node.x_pos + node.width &&
					maxX > node.x_pos &&
					minY < node.y_pos + node.height &&
					maxY > node.y_pos) {
				regionSelections.push(node.id);
			}
		}
		for (const comment of pipeline.getComments()) {
			if (minX < comment.x_pos + comment.width &&
					maxX > comment.x_pos &&
					minY < comment.y_pos + comment.height &&
					maxY > comment.y_pos) {
				regionSelections.push(comment.id);
			}
		}
		this.setSelections(regionSelections, pipelineId);
	}

	findNodesInSubGraph(startNodeId, endNodeId, selection, pipelineId) {
		const pipeline = this.getAPIPipeline(pipelineId);
		let retval = false;

		selection.push(startNodeId);
		if (startNodeId === endNodeId) {
			retval = true;
		} else {
			for (const link of pipeline.getLinks()) {
				if (link.srcNodeId === startNodeId) {
					const newRetval = this.findNodesInSubGraph(link.trgNodeId, endNodeId, selection, pipelineId);
					if (newRetval !== true) {
						selection.pop();
					}
					// This handles the case where there are multiple outward paths.
					// Some of the outward paths could be true and some false. This
					// will make sure that the node in the selection list of one of the
					// paths contains the end nodeId.
					retval = retval || newRetval;
				}
			}
		}

		return retval;
	}

	selectSubGraph(endNodeId, pipelineId) {
		const selection = [];
		let selectedObjectIds = [endNodeId];

		if (pipelineId === this.getSelectedPipelineId()) {
			const currentSelectedObjects = this.getSelectedObjectIds();

			// Get all the nodes in the path from a currently selected object to the end node
			let foundPath = false;
			for (const startNodeId of currentSelectedObjects) {
				foundPath = foundPath || this.findNodesInSubGraph(startNodeId, endNodeId, selection, pipelineId);
			}
			if (!foundPath) {
				// If no subgraph found which is also the case if current selection was empty, just select endNode
				selection.push(endNodeId);
			}

			// Do not put multiple copies of a nodeId in selected nodeId list.
			selectedObjectIds = this.getSelectedObjectIds().slice();
			for (const selected of selection) {
				if (!this.isSelected(selected, pipelineId)) {
					selectedObjectIds.push(selected);
				}
			}
		}

		this.setSelections(selectedObjectIds, pipelineId);
	}

	// Return true is nodeIds are contiguous.
	// Depth-first search algorithm to determine if selected nodes ids all belong
	// in one group. If selected nodes does not belong in the same group, then
	// nodeIds are not contiguous.
	areSelectedNodesContiguous() {
		const nodeIds = this.getSelectedNodesIds();
		const connectedNodesIdsGroup = [nodeIds[0]];
		const apiPipeline = this.getSelectedPipeline();
		for (const nodeId of nodeIds) {
			this.addConnectedNodeIdToGroup(nodeId, connectedNodesIdsGroup, nodeIds, apiPipeline);
		}
		return connectedNodesIdsGroup.length === nodeIds.length;
	}

	// Recursive function to add all connected nodes into the group.
	addConnectedNodeIdToGroup(nodeId, connectedNodesIdsGroup, nodeIds, apiPipeline) {
		if (connectedNodesIdsGroup.includes(nodeId)) {
			const nodeLinks = apiPipeline.getLinksContainingId(nodeId).filter((link) => {
				return link.type === NODE_LINK || link.type === ASSOCIATION_LINK;
			});

			for (const link of nodeLinks) {
				if (nodeIds.includes(link.trgNodeId) && nodeIds.includes(link.srcNodeId)) {
					if (!connectedNodesIdsGroup.includes(link.trgNodeId)) {
						connectedNodesIdsGroup.push(link.trgNodeId);
						this.addConnectedNodeIdToGroup(link.trgNodeId, connectedNodesIdsGroup, nodeIds, apiPipeline);
					}
					if (!connectedNodesIdsGroup.includes(link.srcNodeId)) {
						connectedNodesIdsGroup.push(link.srcNodeId);
						this.addConnectedNodeIdToGroup(link.srcNodeId, connectedNodesIdsGroup, nodeIds, apiPipeline);
					}
				}
			}
		}
	}

	// Creates an empty pipeline.  Used for shaper and supernodes without sub pipeline defined
	createEmptyPipeline() {
		const primaryPipeline = this.getCanvasInfoPipeline(this.getPrimaryPipelineId());
		const subPipelineInfo = {
			"runtime_ref": primaryPipeline.runtime_ref,
			"nodes": [],
			"comments": [],
			"links": []
		};
		const canvasInfoSubPipeline = this.createCanvasInfoPipeline(subPipelineInfo);
		return canvasInfoSubPipeline;
	}

	executeWithSelectionChange(func, arg) {
		let previousSelection = {
			nodes: [],
			comments: [],
			pipelineId: ""
		};

		if (this.selectionChangeHandler) {
			previousSelection = {
				nodes: this.getSelectedNodes(),
				comments: this.getSelectedComments(),
				pipelineId: this.getSelectedPipelineId()
			};
		}

		func(arg);

		if (this.selectionChangeHandler) {

			// determine delta in selected nodes and comments
			const selectedNodes = this.getSelectedNodes();
			const selectedComments = this.getSelectedComments();
			const newSelection = {
				selection: this.getSelectedObjectIds(),
				selectedNodes: selectedNodes,
				selectedComments: selectedComments,
				addedNodes: difference(selectedNodes, previousSelection.nodes),
				addedComments: difference(selectedComments, previousSelection.comments),
				deselectedNodes: difference(previousSelection.nodes, selectedNodes),
				deselectedComments: difference(previousSelection.comments, selectedComments),
				previousPipelineId: previousSelection.pipelineId,
				selectedPipelineId: this.getSelectedPipelineId()
			};

			// only trigger event if selection has changed
			if (!isEmpty(newSelection.addedNodes) ||
					!isEmpty(newSelection.addedComments) ||
					!isEmpty(newSelection.deselectedNodes) ||
					!isEmpty(newSelection.deselectedComments)) {
				this.selectionChangeHandler(newSelection);
			}
		}
	}

	// ---------------------------------------------------------------------------
	// Utility methods
	// ---------------------------------------------------------------------------

	hasErrorMessage(node) {
		const messages = this.getNodeMessages(node);
		if (messages) {
			return (typeof messages.find((msg) => {
				return msg.type === ERROR;
			}) !== "undefined");
		}
		return false;
	}

	hasWarningMessage(node) {
		const messages = this.getNodeMessages(node);
		if (messages) {
			return (typeof messages.find((msg) => {
				return msg.type === WARNING;
			}) !== "undefined");
		}
		return false;
	}

	getNodeMessages(node) {
		return node ? node.messages : null;
	}

	// ---------------------------------------------------------------------------
	// Add decorations in batch
	// ---------------------------------------------------------------------------

	setNodesMultiDecorations(pipelineNodeDecorations) {
		this.store.dispatch({ type: "SET_NODES_MULTI_DECORATIONS", data: { pipelineNodeDecorations: pipelineNodeDecorations } });
	}

	setLinksMultiDecorations(pipelineLinkDecorations) {
		this.store.dispatch({ type: "SET_LINKS_MULTI_DECORATIONS", data: { pipelineLinkDecorations: pipelineLinkDecorations } });
	}

	// ---------------------------------------------------------------------------
	// Styling methods
	// ---------------------------------------------------------------------------

	setObjectsStyle(pipelineObjIds, newStyle, temporary) {
		this.store.dispatch({ type: "SET_OBJECTS_STYLE", data: { pipelineObjIds: pipelineObjIds, newStyle: newStyle, temporary: temporary } });
	}

	setObjectsMultiStyle(pipelineObjStyles, temporary) {
		this.store.dispatch({ type: "SET_OBJECTS_MULTI_STYLE", data: { pipelineObjStyles: pipelineObjStyles, temporary: temporary } });
	}

	setLinksStyle(pipelineLinkIds, newStyle, temporary) {
		this.store.dispatch({ type: "SET_LINKS_STYLE", data: { pipelineObjIds: pipelineLinkIds, newStyle: newStyle, temporary: temporary } });
	}

	setLinksMultiStyle(pipelineLinkStyles, temporary) {
		this.store.dispatch({ type: "SET_LINKS_MULTI_STYLE", data: { pipelineObjStyles: pipelineLinkStyles, temporary: temporary } });
	}

	getObjectStyle(objectId, temporary) {
		const obj = this.getObject(objectId);
		if (temporary) {
			return (obj && obj.style_temp ? obj.style_temp : null);
		}
		return (obj && obj.style ? obj.style : null);
	}

	// ---------------------------------------------------------------------------
	// Highlighting methods
	// ---------------------------------------------------------------------------

	// Returns an object containing nodes and links to be highlighted based on the
	// array of nodeIds passed in (which corresponds to the set of selected
	// nodes on the canvas when this method is called through a context menu
	// highlight option).
	// The nodes and links info returned are in the form of associative arrays
	// indexed by pipeline ID.
	getHighlightObjectIds(pipelineId, nodeIds, operator) {
		const highlightNodeIds = {};
		const highlightLinkIds = {};

		highlightNodeIds[pipelineId] = [];
		highlightLinkIds[pipelineId] = [];

		nodeIds.forEach((nodeId) => {
			// Automatically include the selected node
			highlightNodeIds[pipelineId].push(nodeId);

			switch (operator) {
			case HIGHLIGHT_BRANCH:
				this.getUpstreamObjIdsFrom(nodeId, pipelineId, highlightNodeIds, highlightLinkIds);
				this.getDownstreamObjIdsFrom(nodeId, pipelineId, highlightNodeIds, highlightLinkIds);
				break;
			case HIGHLIGHT_UPSTREAM: {
				this.getUpstreamObjIdsFrom(nodeId, pipelineId, highlightNodeIds, highlightLinkIds);
				break;
			}
			case HIGHLIGHT_DOWNSTREAM:
				this.getDownstreamObjIdsFrom(nodeId, pipelineId, highlightNodeIds, highlightLinkIds);
				break;
			default:
			}

			// Finally, if the selected node is a supernode, make sure to include all
			// the nodes and links within it.
			if (this.getAPIPipeline(pipelineId).isSupernode(nodeId)) {
				this.getSupernodeNodeIds(nodeId, pipelineId, highlightNodeIds, highlightLinkIds);
			}
		});

		return {
			nodes: highlightNodeIds,
			links: highlightLinkIds
		};
	}

	// If nodeId and pipelineId specify a supernode, this method populates the
	// highlightNodeIds and highlightLinkIds arrays with all the nodes and links
	// that are in the supernode and any of its descendent supernodes.
	getSupernodeNodeIds(nodeId, pipelineId, highlightNodeIds, highlightLinkIds) {
		const node = this.getAPIPipeline(pipelineId).getNode(nodeId);
		if (node.type === SUPER_NODE) {
			const supernodePipelineId = this.getSupernodePipelineID(node);

			highlightNodeIds[supernodePipelineId] = highlightNodeIds[supernodePipelineId] || [];
			highlightLinkIds[supernodePipelineId] = highlightLinkIds[supernodePipelineId] || [];

			const nodeIds = this.getAPIPipeline(supernodePipelineId).getNodeIds();
			const linkIds = this.getAPIPipeline(supernodePipelineId).getLinkIds();

			highlightNodeIds[supernodePipelineId] = union(highlightNodeIds[supernodePipelineId], nodeIds);
			highlightLinkIds[supernodePipelineId] = union(highlightLinkIds[supernodePipelineId], linkIds);

			nodeIds.forEach((nId) => {
				this.getSupernodeNodeIds(nId, supernodePipelineId, highlightNodeIds, highlightLinkIds);
			});
		}
	}

	getUpstreamObjIdsFrom(nodeId, pipelineId, highlightNodeIds, highlightLinkIds) {
		highlightNodeIds[pipelineId] = highlightNodeIds[pipelineId] || [];
		highlightLinkIds[pipelineId] = highlightLinkIds[pipelineId] || [];

		const currentPipeline = this.getAPIPipeline(pipelineId);
		const node = currentPipeline.getNode(nodeId);
		const nodeLinks = currentPipeline
			.getLinksContainingTargetId(nodeId)
			.filter((l) => l.type === NODE_LINK);

		if (nodeLinks.length > 0) {
			nodeLinks.forEach((link) => {
				// Prevent endless looping with circular graphs by detecting if we
				// have encountered this link before.
				if (!highlightLinkIds[pipelineId].includes(link.id)) {
					const srcNode = currentPipeline.getNode(link.srcNodeId);

					highlightLinkIds[pipelineId] = union(highlightLinkIds[pipelineId], [link.id]);
					highlightNodeIds[pipelineId] = union(highlightNodeIds[pipelineId], [link.srcNodeId]);

					const srcNodeOutputPort = this.getSupernodeOutputPortForLink(srcNode, link);
					if (srcNodeOutputPort) {
						const subflowPipelineId = srcNode.subflow_ref.pipeline_id_ref;
						const bindingNode = this.getAPIPipeline(subflowPipelineId).getNode(srcNodeOutputPort.subflow_node_ref);

						if (bindingNode) {
							highlightLinkIds[subflowPipelineId] = highlightLinkIds[subflowPipelineId] || [];
							highlightNodeIds[subflowPipelineId] = highlightNodeIds[subflowPipelineId] || [];
							highlightNodeIds[subflowPipelineId] = union(highlightNodeIds[subflowPipelineId], [bindingNode.id]);

							this.getUpstreamObjIdsFrom(bindingNode.id, subflowPipelineId, highlightNodeIds, highlightLinkIds);
						}
					} else {
						this.getUpstreamObjIdsFrom(link.srcNodeId, pipelineId, highlightNodeIds, highlightLinkIds);
					}
				}
			});
		} else if (currentPipeline.isEntryBindingNode(node) &&
								this.isSupernodeBinding(node)) {
			const supernodeObj = this.getSupernodeObjReferencing(pipelineId);
			const parentPipelineId = supernodeObj.parentPipelineId;
			const parentPipeline = this.getAPIPipeline(parentPipelineId);
			const supernode = parentPipeline.getNode(supernodeObj.supernodeId);

			supernode.inputs.forEach((inputPort) => {
				if (inputPort.subflow_node_ref === nodeId) {
					const supernodeLinks = parentPipeline.getLinksContainingTargetId(supernode.id);
					supernodeLinks.forEach((supernodeLink) => {
						if (supernodeLink.trgNodePortId === inputPort.id) {
							highlightNodeIds[parentPipelineId] = highlightNodeIds[parentPipelineId] || [];
							highlightLinkIds[parentPipelineId] = highlightLinkIds[parentPipelineId] || [];

							highlightNodeIds[parentPipelineId] = union(highlightNodeIds[parentPipelineId], [supernodeLink.srcNodeId]);
							highlightLinkIds[parentPipelineId] = union(highlightLinkIds[parentPipelineId], [supernodeLink.id]);

							// If srcNodeId is supernode, need to find the corresponding exit binding node.
							if (parentPipeline.isSupernode(supernodeLink.srcNodeId)) {
								const upstreamSupernode = parentPipeline.getNode(supernodeLink.srcNodeId);
								const upstreamSupernodeOutputPort = this.getSupernodeOutputPortForLink(upstreamSupernode, supernodeLink);
								if (upstreamSupernodeOutputPort) {
									const bindingNodeId = upstreamSupernodeOutputPort.subflow_node_ref;
									this.getUpstreamObjIdsFrom(bindingNodeId, upstreamSupernode.subflow_ref.pipeline_id_ref, highlightNodeIds, highlightLinkIds);
								}
							} else {
								this.getUpstreamObjIdsFrom(supernodeLink.srcNodeId, parentPipelineId, highlightNodeIds, highlightLinkIds);
							}
						}
					});
				}
			});
		}
	}

	getDownstreamObjIdsFrom(nodeId, pipelineId, highlightNodeIds, highlightLinkIds) {
		highlightNodeIds[pipelineId] = highlightNodeIds[pipelineId] || [];
		highlightLinkIds[pipelineId] = highlightLinkIds[pipelineId] || [];

		const currentPipeline = this.getAPIPipeline(pipelineId);
		const node = currentPipeline.getNode(nodeId);
		const nodeLinks = currentPipeline
			.getLinksContainingSourceId(nodeId)
			.filter((l) => l.type === NODE_LINK);

		if (nodeLinks.length > 0) {
			nodeLinks.forEach((link) => {
				// Prevent endless looping with circular graphs by detecting if we
				// have encountered this link before.
				if (!highlightLinkIds[pipelineId].includes(link.id)) {
					const trgNode = currentPipeline.getNode(link.trgNodeId);

					highlightLinkIds[pipelineId] = union(highlightLinkIds[pipelineId], [link.id]);
					highlightNodeIds[pipelineId] = union(highlightNodeIds[pipelineId], [link.trgNodeId]);

					const trgNodeInputPort = this.getSupernodeInputPortForLink(trgNode, link);
					if (trgNodeInputPort) {
						const subflowPipelineId = trgNode.subflow_ref.pipeline_id_ref;
						const bindingNode = this.getAPIPipeline(subflowPipelineId).getNode(trgNodeInputPort.subflow_node_ref);

						if (bindingNode) {
							highlightLinkIds[subflowPipelineId] = highlightLinkIds[subflowPipelineId] || [];
							highlightNodeIds[subflowPipelineId] = highlightNodeIds[subflowPipelineId] || [];
							highlightNodeIds[subflowPipelineId] = union(highlightNodeIds[subflowPipelineId], [bindingNode.id]);

							this.getDownstreamObjIdsFrom(bindingNode.id, subflowPipelineId, highlightNodeIds, highlightLinkIds);
						}
					} else {
						this.getDownstreamObjIdsFrom(link.trgNodeId, pipelineId, highlightNodeIds, highlightLinkIds);
					}
				}
			});
		} else if (currentPipeline.isExitBindingNode(node)) {
			if (this.isSupernodeBinding(node)) {
				const supernodeObj = this.getSupernodeObjReferencing(pipelineId);
				const parentPipelineId = supernodeObj.parentPipelineId;
				const parentPipeline = this.getAPIPipeline(parentPipelineId);
				const supernode = parentPipeline.getNode(supernodeObj.supernodeId);

				supernode.outputs.forEach((outputPort) => {
					if (outputPort.subflow_node_ref === nodeId) {
						const supernodeLinks = parentPipeline.getLinksContainingSourceId(supernode.id);
						supernodeLinks.forEach((supernodeLink) => {
							if (supernodeLink.srcNodePortId === outputPort.id) {
								highlightNodeIds[parentPipelineId] = highlightNodeIds[parentPipelineId] || [];
								highlightLinkIds[parentPipelineId] = highlightLinkIds[parentPipelineId] || [];

								highlightNodeIds[parentPipelineId] = union(highlightNodeIds[parentPipelineId], [supernodeLink.trgNodeId]);
								highlightLinkIds[parentPipelineId] = union(highlightLinkIds[parentPipelineId], [supernodeLink.id]);

								// If trgNodeId is supernode, need to find the corresponding entry binding node.
								if (parentPipeline.isSupernode(supernodeLink.trgNodeId)) {
									const downstreamSupernode = parentPipeline.getNode(supernodeLink.trgNodeId);
									const downstreamSupernodeInputPort = this.getSupernodeInputPortForLink(downstreamSupernode, supernodeLink);
									if (downstreamSupernodeInputPort) {
										const bindingNodeId = downstreamSupernodeInputPort.subflow_node_ref;
										this.getDownstreamObjIdsFrom(bindingNodeId, downstreamSupernode.subflow_ref.pipeline_id_ref, highlightNodeIds, highlightLinkIds);
									}
								} else {
									this.getDownstreamObjIdsFrom(supernodeLink.trgNodeId, parentPipelineId, highlightNodeIds, highlightLinkIds);
								}
							}
						});
					}
				});
			}
		}
	}

	// Returns an input port from the node passed in (provided it is a supernode) which is
	// referenced by the link passed in. Returns null if the node is not a supernode or the link
	// does not have a reference to one of the node's input ports.
	getSupernodeInputPortForLink(trgNode, link) {
		let port = null;
		if (has(trgNode, "subflow_ref.pipeline_id_ref") && link.trgNodePortId) {
			trgNode.inputs.forEach((inputPort) => {
				if (inputPort.id === link.trgNodePortId) {
					port = inputPort;
					return;
				}
			});
		}
		return port;
	}

	// Returns an output port from the node passed in (provided it is a supernode) which is
	// referenced by the link passed in. Returns null if the node is not a supernode or the link
	// does not have a reference to one of the node's output ports.
	getSupernodeOutputPortForLink(srcNode, link) {
		let port = null;
		if (has(srcNode, "subflow_ref.pipeline_id_ref") && link.srcNodePortId) {
			srcNode.outputs.forEach((outputPort) => {
				if (outputPort.id === link.srcNodePortId) {
					port = outputPort;
					return;
				}
			});
		}
		return port;
	}

	// Pythagorean Theorem.
	getDistanceFromPosition(x, y, node) {
		const a = node.x_pos - x;
		const b = node.y_pos - y;
		return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
	}
}
