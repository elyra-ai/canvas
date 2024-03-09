/*
 * Copyright 2017-2024 Elyra Authors
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

import CanvasInHandler from "./canvas-in-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import CanvasOutHandler from "./canvas-out-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import PipelineInHandler from "./pipeline-in-handler.js";
import PipelineOutHandler from "./pipeline-out-handler.js";
import CanvasUtils from "../common-canvas/common-canvas-utils";
import ConfigUtils from "./config-utils.js";
import LocalStorage from "../common-canvas/local-storage.js";
import { prepareNodes, setNodeAttributesWithLayout, setCommentAttributesWithLayout } from "./object-model-utils.js";
import APIPipeline from "./api-pipeline.js";
import CanvasStore from "./redux/canvas-store.js";
import Logger from "../logging/canvas-logger.js";

import { cloneDeep, differenceWith, get, has, isEmpty, set, union } from "lodash";
import { v4 as uuid4 } from "uuid";
import { validatePipelineFlowAgainstSchema, validatePaletteAgainstSchema } from "./schemas-utils/schema-validator.js";
import { upgradePipelineFlow, extractVersion, LATEST_VERSION } from "@elyra/pipeline-schemas";
import { upgradePalette, extractPaletteVersion, LATEST_PALETTE_VERSION } from "./schemas-utils/upgrade-palette.js";


import { ASSOCIATION_LINK, COMMENT_LINK, NODE_LINK, ERROR, WARNING, SUCCESS, INFO, CREATE_PIPELINE,
	CLONE_COMMENT, CLONE_COMMENT_LINK, CLONE_NODE, CLONE_NODE_LINK, CLONE_PIPELINE, SUPER_NODE,
	HIGHLIGHT_BRANCH, HIGHLIGHT_UPSTREAM, HIGHLIGHT_DOWNSTREAM,
	// SNAP_TO_GRID_AFTER, SNAP_TO_GRID_DURING,
	SAVE_ZOOM_LOCAL_STORAGE, SAVE_ZOOM_PIPELINE_FLOW
} from "../common-canvas/constants/canvas-constants.js";

export default class ObjectModel {

	constructor() {
		this.logger = new Logger("Object Model");

		// Create a store defaulting to an empty canvas.
		const emptyCanvasInfo = this.getEmptyCanvasInfo();
		this.store = new CanvasStore(emptyCanvasInfo);

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
		this.setCanvasConfig({ schemaValidation });
	}

	setSelectionChangeHandler(selectionChangeHandler) {
		this.selectionChangeHandler = selectionChangeHandler;
	}

	setLayoutHandler(layoutHandler) {
		if (layoutHandler !== this.layoutHandler) {
			this.layoutHandler = layoutHandler;
			const newPipelines =
				prepareNodes(this.getCanvasInfo().pipelines, this.getNodeLayout(), this.getCanvasLayout(), this.layoutHandler);
			this.store.dispatch({ type: "REPLACE_PIPELINES", data: { pipelines: newPipelines } });
		}
	}

	// Returns the redux store
	getStore() {
		return this.store.getStore();
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
			this.clearPaletteData();
			return;
		}
		// TODO - this method is called by App.js test harness. Remove this check and
		// code when we remove the x-* example palette files after WML Canvas migrates to use v2.0 palette.
		let palData = paletteData;
		if (CanvasInHandler.isVersion0Palette(palData)) {
			palData = CanvasInHandler.convertPaletteToPipelineFlowPalette(palData);
		}

		const newPalData = this.validateAndUpgradePalette(palData);
		this.store.dispatch({ type: "SET_PALETTE_DATA", data: { content: newPalData } });
	}

	getPaletteData() {
		return this.store.getPaletteData();
	}

	togglePalette() {
		if (this.isPaletteOpen()) {
			this.closePalette();
		} else {
			this.openPalette();
		}
	}

	openPalette() {
		this.store.dispatch({ type: "SET_PALETTE_OPEN_STATE", data: { isOpen: true } });
	}

	// Initializes the palette state based on paletteInitialState.
	// TODO - Remove this when paletteInitialState is removed from common-canvas.
	openPaletteIfNecessary(canvasConfig) {
		if (canvasConfig &&
				typeof this.store.getPalette().isOpen === "undefined" &&
				typeof canvasConfig.paletteInitialState !== "undefined") {
			if (canvasConfig.paletteInitialState) {
				this.openPalette();
			} else {
				this.closePalette();
			}
		}
	}

	closePalette() {
		this.store.dispatch({ type: "SET_PALETTE_OPEN_STATE", data: { isOpen: false } });
	}

	isPaletteOpen() {
		// TODO - We can just return isOpen directly from here when
		// paletteInitialState is removed from common-canvas and isOpen can be
		// initialized correctly in canvas-store.
		const isOpen = this.store.getPalette().isOpen;
		return (typeof isOpen === "undefined" ? false : isOpen);
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

		if (this.store.getCanvasConfig().schemaValidation) {
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
		let node = null;
		if (nodeTemplate) {
			node = PipelineInHandler.convertNode(nodeTemplate, this.getCanvasLayout());

			// PipelineInHandler will not handle the conversion of sub_pipelines
			// in supernodes to internal format so...
			if (node.type === SUPER_NODE) {
				node = this.convertPipelineData(node);
			}
			return node;
		}
		return null;
	}

	convertPipelineData(supernode) {
		const pd = get(supernode, "sub_pipelines");
		let newPd;
		if (pd) {
			newPd = supernode.subflow_ref.url
				? []
				: PipelineInHandler.convertPipelinesToCanvasInfoPipelines(pd, this.getCanvasLayout());
			// Need to make sure pipeline IDs are unique.
			newPd = this.cloneSupernodeContents(supernode, newPd);
			newPd = prepareNodes(newPd, this.getNodeLayout(), this.getCanvasLayout(), this.layoutHandler, supernode);

		} else {
			const newPipeline = this.createEmptyPipeline();
			newPd = [newPipeline];
			set(supernode, "subflow_ref.pipeline_id_ref", newPipeline.id);
		}
		supernode.sub_pipelines = newPd;
		return supernode;
	}

	// Returns an object containing nodes and pipelines. The nodes are the
	// same as the array of nodes passed in except that, any supernodes within
	// the array will have their app_data.ui_data.sub_pipelines fields removed. The
	// pipelines returned will be any pipelines that were contained within the
	// app_data.ui_data.sub_pipelines fields.
	extractAddDataPipelines(inNodes) {
		const pipelines = [];
		const nodes = [];
		inNodes.forEach((n) => {
			if (CanvasUtils.isSupernode(n)) {
				const pDataArray = get(n, "sub_pipelines");
				if (pDataArray) {
					pipelines.push(...pDataArray);
					if (n.sub_pipelines) {
						delete n.sub_pipelines;
					}
				}
			}
			nodes.push(n);
		});

		return { nodes, pipelines };
	}

	getPaletteNode(nodeOpIdRef) {
		let outNodeType = null;
		if (nodeOpIdRef && !isEmpty(this.getPaletteData())) {
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

	getPaletteNodeById(nodeId) {
		let outNodeType = null;
		if (!isEmpty(this.getPaletteData())) {
			this.getPaletteData().categories.forEach((category) => {
				category.node_types.forEach((nodeType) => {
					if (nodeType.id === nodeId) {
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
		let pal = cloneDeep(newPalette);

		const version = extractPaletteVersion(pal);

		if (this.store.getCanvasConfig().schemaValidation) {
			validatePaletteAgainstSchema(pal, version);
		}

		if (version !== LATEST_PALETTE_VERSION) {
			pal = upgradePalette(pal);

			if (this.store.getCanvasConfig().schemaValidation) {
				validatePaletteAgainstSchema(pal, LATEST_PALETTE_VERSION);
			}
		}
		return pal;
	}

	setIsOpenCategory(categoryId, isOpen) {
		this.store.dispatch({ type: "SET_IS_OPEN_CATEGORY", data: { categoryId: categoryId, isOpen } });
	}

	setIsOpenAllCategories(isOpen) {
		this.store.dispatch({ type: "SET_IS_OPEN_ALL_CATEGORIES", data: { isOpen } });
	}

	isPaletteCategoryOpen(categoryId) {
		const category = this.store.getPaletteCategory(categoryId);
		if (category) {
			return category.is_open;
		}
		return null;
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

		const canvasInfo = this.preparePipelineFlow(newPipelineFlow);

		this.executeWithSelectionChange(this.store.dispatch, {
			type: "SET_CANVAS_INFO",
			canvasInfo: canvasInfo,
			canvasInfoIdChanged: this.hasCanvasInfoIdChanged(canvasInfo)
		});
	}

	// Ensures the pipelines being handled is loaded in memory which might not
	// be the case if it is an external pipeline. The data parameter is expected
	// to contain targetObject (which is the supernode) and externalPipelineFlow
	// which is the pipeline flow referenced by the supernode's URL. Returns
	// true if a pipeline flow was loaded and false if not.
	ensurePipelineIsLoaded(data) {
		const snPipelineUrl = this.getSupernodePipelineUrl(data.targetObject);
		const snPipelineId = CanvasUtils.getSupernodePipelineId(data.targetObject);

		// If the pipeline isn't loaded check to make sure the external pipeline
		// flow provided contains the target pipeline and, if so, load the pipeline
		// flow into memory.
		if (!this.isPipelineLoaded(snPipelineId, snPipelineUrl)) {
			// If no pipeline flow is provided from beforeEditActionHandler we cannot
			// continue otherwise an endless loop will occur. So throw and exception.
			if (!data.externalPipelineFlow) {
				const msg = "The external pipeline flow at '" + data.externalUrl +
					"' was not provided. Make sure you have implemented beforeEditActionHandler to support external pipeline flows.";
				this.logger.error(msg);
				throw msg;
			}

			// If the flow doesn't contain the pipeline we're looking for.
			if (!this.flowContainsPipeline(data.externalPipelineFlow, snPipelineId)) {
				const msg = "The external pipeline flow '" + data.externalPipelineFlow.id +
					"' does not contain a pipeline with ID: " + snPipelineId;
				this.logger.error(msg);
				throw msg;
			}

			this.addExternalPipelineFlow(data.externalPipelineFlow, snPipelineUrl, data.targetObject, true);
			return true;
		}
		return false;
	}

	// Returns an array of 'visible' supernodes that refer to external pipelines
	// which are not currently loaded into memory. 'Visible' in this context means
	// they are either in the primary pipeline flow or are within the sub-flow
	// of an expanded supernode.
	getVisibleExpandedExternalSupernodes() {
		const pipeline = this.getCurrentPipeline();
		const supernodes = this.getVisibleExpandedExternalSupernodesForPipeline(pipeline, this.getPipelines());
		return supernodes;
	}

	// Returns an array of 'visible' expanded supernodes for the pipeline passed
	// in given the current set of pipelines that are in memory.
	getVisibleExpandedExternalSupernodesForPipeline(pipeline, pipelines) {
		let supernodes = [];
		pipeline.nodes.forEach((n) => {
			if (n.type === SUPER_NODE && n.is_expanded) {
				const subFlowPipeline = pipelines.find((p) => p.id === CanvasUtils.getSupernodePipelineId(n));

				// If this expanded supernode refers to an external pipeline that is
				// not yet loaded then save to our output.
				if (n.subflow_ref.url && !subFlowPipeline) {
					supernodes.push(n);
				}
				// For expanded supernodes, check the referenced pipeline to see if
				// it has any nested expanded supernodes.
				if (subFlowPipeline) {
					const sns = this.getVisibleExpandedExternalSupernodesForPipeline(subFlowPipeline, pipelines);
					supernodes = supernodes.concat(sns);
				}
			}
		});
		return supernodes;
	}

	// Returns true if the pipelineFlow passd in contains the pipeline identified
	// by the pipelineId passed in.
	flowContainsPipeline(pipelineFlow, pipelineId) {
		if (pipelineFlow.pipelines) {
			return pipelineFlow.pipelines.some((p) => p.id === pipelineId);
		}
		return false;
	}

	// Adds the external pipeline flow, which has been retrieved using the url,
	// into memory. This means adding the pipelines into the standed set of
	// pipelines in the canvas info and saving the pipeline flow properties
	// (except for the pipelines property) using the externalpipelineflows
	// reducer. shouldAddPipelines is a boolean that controls whether pipelines
	// are added or not.
	addExternalPipelineFlow(externalPipelineFlow, url, supernode, shouldAddPipelines = true) {
		const convertedPf = this.preparePipelineFlow(externalPipelineFlow, supernode);
		convertedPf.pipelines.forEach((p) => (p.parentUrl = url));

		// Make a copy and remove the pipelines from the pipleine flow
		const newPipelineFlow = Object.assign({}, convertedPf);
		newPipelineFlow.pipelines = [];
		newPipelineFlow.url = url;

		this.store.dispatch({
			type: "ADD_EXTERNAL_PIPELINE_FLOW",
			newPipelineFlow: newPipelineFlow,
			newPipelines: shouldAddPipelines ? convertedPf.pipelines : []
		});
	}

	// Removes the external pipeline flow specified by the url passed in.
	removeExternalPipelineFlow(url) {
		this.store.dispatch({
			type: "REMOVE_EXTERNAL_PIPELINE_FLOW",
			externalUrl: url
		});
	}

	// Returns a new header object for the external pipeline flow. A dummy
	// pipeline will be added to the pipeline flow. This will be replaced by
	// the actual pipelines when th epipeline flow  is retrieved using
	// CommonCanvas.getExternalPipelineFlow.
	createExternalPipelineFlowTemplate(pipelineFlowId, pipelineId) {
		return {
			"doc_type": "pipeline",
			"version": "3.0",
			"json_schema": "https://api.dataplatform.ibm.com/schemas/common-pipeline/pipeline-flow/pipeline-flow-v3-schema.json",
			"id": pipelineFlowId,
			"primary_pipeline": pipelineId,
			"pipelines": [{ "id": "", "runtime_ref": "", "nodes": [] }],
			"schemas": [],
			"runtimes": []
		};
	}

	// Used by Cypress tests
	getExternalPipelineFlows() {
		return this.store.getExternalPipelineFlows();
	}

	// Returns a unique set of external pipeline flows corresponding
	// to the the set of pipelines passed in.
	getExternalPipelineFlowsForPipelines(pipelines) {
		const urls = this.getUniqueUrls(pipelines);
		return this.getExternalPipelineFlowsForUrls(urls);
	}

	// Returns a unique array of URLS from the array of pipelines passed in.
	getUniqueUrls(pipelines) {
		const urls = [];
		pipelines.forEach((p) => {
			if (p.parentUrl && !urls.includes(p.parentUrl)) {
				urls.push(p.parentUrl);
			}
		});
		return urls;
	}

	// Returns an array of external pipeline flows corresponding to the
	// array of URLs passed in.
	getExternalPipelineFlowsForUrls(urls) {
		const extPipelineFlows = [];
		urls.forEach((url) => {
			const extFlow = this.getExternalPipelineFlow(url);
			extFlow.url = url;
			extPipelineFlows.push(extFlow);
		});
		return extPipelineFlows;
	}

	getExternalPipelineFlow(url) {
		// Get the external pipeline flow
		let pipelineFlow = this.store.getExternalPipelineFlow(url);

		if (pipelineFlow) {
			// Remove the url field because it is not part of the pipeline flow specification
			delete pipelineFlow.url;

			// Extract the pipelines from the canvas info that correspond to the url
			// and add them to the pipeline flow.
			const canvasInfo = this.getCanvasInfo();
			pipelineFlow.pipelines = canvasInfo.pipelines.filter((p) => p.parentUrl === url);

			// Remove the parentUrl property because it is not part of the pipeline flow schema.
			pipelineFlow.pipelines.forEach((p) => delete p.parentUrl);

			pipelineFlow =
				PipelineOutHandler.createPipelineFlow(pipelineFlow);

			if (this.store.getCanvasConfig().schemaValidation) {
				validatePipelineFlowAgainstSchema(pipelineFlow);
			}
		}

		return pipelineFlow;
	}

	setParentUrl(pipelines, url) {
		this.store.dispatch({ type: "SET_PIPELINE_PARENT_URL", data: { pipelines: pipelines, url: url } });
	}

	replaceSupernodeAndPipelines(data) {
		this.store.dispatch({ type: "REPLACE_SN_AND_PIPELINES", data: data });
	}

	// Prepares a pipelineFlow to be loaded into memory in the canvas info. This
	// involves flattening the pipleine flow hierarchy and adding layout info
	// to the nodes in the pipelines.
	preparePipelineFlow(newPipelineFlow, supernode) {
		const pipelineFlow = this.validateAndUpgrade(newPipelineFlow);
		const canvasInfo = PipelineInHandler.convertPipelineFlowToCanvasInfo(pipelineFlow, this.getCanvasLayout());
		canvasInfo.pipelines =
			prepareNodes(canvasInfo.pipelines, this.getNodeLayout(), this.getCanvasLayout(), this.layoutHandler, supernode);
		return canvasInfo;
	}

	// Returns a copy of the node passed in with additional fields which contain
	// layout, dimension and supernode binding status info. This uses the redux
	// layout information.
	setNodeAttributes(node) {
		return setNodeAttributesWithLayout(node, this.getNodeLayout(), this.getCanvasLayout());
	}

	// Returns a copy of the comment passed in with position adjusted for
	// snap to grid, if necessary. This is called from the api-pipeline class.
	setCommentAttributes(comment) {
		return setCommentAttributesWithLayout(comment, this.getCanvasLayout());
	}

	validateAndUpgrade(newPipelineFlow) {
		// Clone the pipelineFlow to ensure we don't modify the incoming parameter.
		let pipelineFlow = cloneDeep(newPipelineFlow);

		const version = extractVersion(pipelineFlow);

		if (this.store.getCanvasConfig().schemaValidation) {
			validatePipelineFlowAgainstSchema(pipelineFlow, version);
		}

		if (version !== LATEST_VERSION) {
			pipelineFlow = upgradePipelineFlow(pipelineFlow);

			if (this.store.getCanvasConfig().schemaValidation) {
				validatePipelineFlowAgainstSchema(pipelineFlow, LATEST_VERSION);
			}
		}
		return pipelineFlow;
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

		const pipeline = canvasInfo.pipelines.find((p) => p.id === pId);

		return (typeof pipeline === "undefined") ? null : pipeline;
	}

	getDescendantPipelineIds(pipelineId) {
		let pipelineIds = [];
		this.getAPIPipeline(pipelineId).getSupernodes()
			.forEach((supernode) => {
				const snPipelineId = CanvasUtils.getSupernodePipelineId(supernode);
				if (snPipelineId) {
					pipelineIds.push(snPipelineId);
					pipelineIds = pipelineIds.concat(this.getDescendantPipelineIds(snPipelineId));
				}
			});
		return pipelineIds;
	}

	getDescendantPipelinesForSupernodes(supernodes) {
		let pipelines = [];
		supernodes.forEach((sn) => {
			pipelines = pipelines.concat(this.getDescendantPipelinesForSupernode(sn));
		});
		return pipelines;
	}

	getDescendantPipelinesForSupernode(supernode) {
		let pipelines = [];
		const snPipelineId = CanvasUtils.getSupernodePipelineId(supernode);
		if (snPipelineId) {
			const subPipeline = this.getCanvasInfoPipeline(snPipelineId);
			if (subPipeline) {
				pipelines.push(subPipeline);

				this.getAPIPipeline(snPipelineId).getSupernodes()
					.forEach((supernode2) => {
						pipelines = pipelines.concat(this.getDescendantPipelinesForSupernode(supernode2));
					});
			}
		}
		return pipelines;
	}

	// Returns an array of descendant pipelines, that conform to the schema, for
	// the supernode passed in or an empty array if the supernode doesn't
	// reference a pipeline. Only 'local' pipelines are returned not external
	// ones.
	getSchemaPipelinesForSupernode(supernode) {
		const pipelines = this.getDescendantPipelinesForSupernode(supernode)
			.filter((p) => !p.parentUrl);

		return pipelines.map((p) => PipelineOutHandler.createPipeline(p));
	}

	// Returns an array of pipelines to delete if all the supernodes passed in
	// were to be deleted.  That is the set of descendant pipelines referenced by
	// the supernodes passed in, minus any external pipelines that are also
	// referenced by other supernodes/pipelines outside of the array passed in.
	// This situation may occur when two supernodes reference the same
	// external pipeline and one is to be deleted but the other is to remain.
	getDescPipelinesToDelete(supernodesToDel, parentPipelineId) {
		const supernodeInfosToDel = this.getDescendantSupernodeInfos(supernodesToDel, parentPipelineId);
		const otherSupernodeInfos = this.getOtherSupernodeInfos(supernodesToDel, parentPipelineId);

		const pipelinesToDelete = [];
		supernodeInfosToDel.forEach((sid) => {
			if (this.shouldBeDeleted(sid, otherSupernodeInfos)) {
				const p = this.getCanvasInfoPipeline(sid.pipelineId);
				pipelinesToDelete.push(p);
			}
		});
		return pipelinesToDelete;
	}

	// Returns true if the supernode info object indicates a pipeline that
	// should be deleted because it is not referenced by any of the
	// otherSupernodeInfos passed in.
	shouldBeDeleted(supernodeInfo, otherSupernodeInfos) {
		let state = true;
		otherSupernodeInfos.forEach((osi) => {
			if (osi.pipelineId === supernodeInfo.pipelineId) {
				state = false;
			}
		});
		return state;
	}

	// Returns an array of all pipelines from the entire canvas info, minus any
	// pipelines that are descendants of the supernodes passed in (which all must
	// be in the pipeline identified by parentPipelineId)
	getOtherSupernodeInfos(supernodesToIgnore, parentPipelineId) {
		const primaryPipelineId = this.getPrimaryPipelineId();
		const primaryPipeline = this.getCanvasInfoPipeline(primaryPipelineId);
		const supernodes = CanvasUtils.filterSupernodes(primaryPipeline.nodes);
		return this.getDescendantSupernodeInfos(supernodes, primaryPipelineId,
			{ supernodesToIgnore: supernodesToIgnore, parentPipelineId: parentPipelineId });
	}

	// Returns an array of pipelines that are the descendants of the array of
	// supernodes passed in (which must all be in the pipeline identified by the
	// parentPipelineId passed in) minus any descendant pipelines of the
	// supernodes identified by the ignoreInfo object. This has these fields:
	// supernodesToIgnore - an array of supernodes whose descendant pipelines
	//                      should be ignored.
	// parentPipelineId - the ID of the pipeline the supernodes are in.
	getDescendantSupernodeInfos(supernodes, parentPipelineId, ignoreInfo) {
		const outSupernodeInfos = [];
		supernodes.forEach((sn) => {
			const descInfo = this.getDescendantSupernodeInfosForSupernode(sn, parentPipelineId, ignoreInfo);
			// Only insert new supernode infos into the array.
			descInfo.forEach((di) => {
				if (!this.isSupernodeInfoInArray(di, outSupernodeInfos)) {
					outSupernodeInfos.push(di);
				}
			});
		});
		return outSupernodeInfos;
	}

	// Returns an array of pipelines that are the descendants of the
	// supernode passed in (which must all be in the pipeline identified by the
	// parentPipelineId passed in) minus any descendant pipelines of the
	// supernodes identified by the ignoreInfo object. This has these fields:
	// supernodesToIgnore - an array of supernodes whose descendant pipelines
	//                      should be ignored.
	// parentPipelineId - the ID of the pipeline the supernodes are in.
	getDescendantSupernodeInfosForSupernode(supernode, parentPipelineId, ignoreInfo) {
		let supernodeInfos = [];
		if (this.continueNavigation(supernode, parentPipelineId, ignoreInfo)) {
			const pipelineId = CanvasUtils.getSupernodePipelineId(supernode);
			const pipeline = this.getCanvasInfoPipeline(pipelineId);
			// An external pipeline might not be loaded if the supernode is collapsed.
			if (pipeline) {
				supernodeInfos.push({ pipelineId: pipelineId, supernode: supernode, parentPipelineId: parentPipelineId });
				const supernodes = CanvasUtils.filterSupernodes(pipeline.nodes);
				supernodes.forEach((sn) => {
					supernodeInfos = supernodeInfos.concat(this.getDescendantSupernodeInfosForSupernode(sn, pipelineId, ignoreInfo));
				});
			}
		}

		return supernodeInfos;
	}

	// Returns true if the code should continue navigating down the supernode
	// hierarchy from the supernode (in parentPipelineId) passed based on the
	// ignoreInfo object.
	continueNavigation(sn, parentPipelineId, ignoreInfo) {
		if (ignoreInfo &&
				ignoreInfo.parentPipelineId === parentPipelineId &&
				ignoreInfo.supernodesToIgnore.some((sn2d) => sn2d.id === sn.id)) {
			return false;
		}
		return true;
	}

	// Returns true if the supernode info object passed in is in the
	// supernodeInfos array passed in.
	isSupernodeInfoInArray(di, supernodeInfos) {
		let found = false;
		supernodeInfos.forEach((si) => {
			if (this.isSupernodeInfoEqual(si, di)) {
				found = true;
			}
		});
		return found;
	}

	// Returns true if the two supernode info objects are the same.
	isSupernodeInfoEqual(si1, si2) {
		return si1.supernode.id === si2.supernode.id &&
			si1.parentPipelineId === si2.parentPipelineId;
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
				const snPipelineId = CanvasUtils.getSupernodePipelineId(supernode);
				if (snPipelineId) {
					if (this.isAncestorOfPipeline(snPipelineId, lowerPipelineId) || snPipelineId === lowerPipelineId) {
						ancestors.push({ pipelineId: snPipelineId, label: supernode.label, supernodeId: supernode.id, parentPipelineId: upperPipelineId });
					}
					ancestors = ancestors.concat(this.getAncestorsBetween(snPipelineId, lowerPipelineId));
				}
			});
		return ancestors;
	}

	// Returns true if ancestorId is an ancestor pipeline of pipelineId.
	isAncestorOfPipeline(ancestorId, pipelineId) {
		return this.getDescendantPipelineIds(ancestorId).includes(pipelineId);
	}

	// getSupernodePipelineId(supernode) {
	// 	if (supernode.type === SUPER_NODE &&
	// 			has(supernode, "subflow_ref.pipeline_id_ref")) {
	// 		return supernode.subflow_ref.pipeline_id_ref;
	// 	}
	// 	return null;
	// }

	getSupernodePipelineUrl(supernode) {
		if (supernode.type === SUPER_NODE &&
				has(supernode, "subflow_ref.url")) {
			return supernode.subflow_ref.url;
		}
		return null;
	}

	// Return the supernode object that has a subflow_ref to the given pipelineId.
	// There should only be one supernode referencing the pipeline.
	getSupernodeObjReferencing(pipelineId) {
		let supernodeRef;
		if (pipelineId === this.getPrimaryPipelineId()) {
			const supernodes = this.getAPIPipeline(pipelineId).getSupernodes();
			supernodeRef = supernodes.find((supernode) => CanvasUtils.getSupernodePipelineId(supernode) === pipelineId).id;
		} else {
			const ancestorPipelines = this.getAncestorPipelineIds(pipelineId);
			const supernodePipelineObj = ancestorPipelines.find((pipelineObj) => pipelineObj.pipelineId === pipelineId && has(pipelineObj, "supernodeId"));
			supernodeRef = supernodePipelineObj;
		}
		return supernodeRef;
	}

	setCanvasInfo(inCanvasInfo) {
		const canvasInfo = Object.assign({}, inCanvasInfo);
		canvasInfo.pipelines =
			prepareNodes(canvasInfo.pipelines, this.getNodeLayout(), this.getCanvasLayout(), this.layoutHandler);
		this.store.dispatch({ type: "SET_CANVAS_INFO", canvasInfo: canvasInfo, canvasInfoIdChanged: this.hasCanvasInfoIdChanged(canvasInfo) });
	}

	// Returns a pipeline flow based on the initial pipeline flow we were given
	// with the changes to canvasinfo made by the user. We don't do this in the
	// redux code because that would result is continuous update of the pipelineflow
	// as the consuming app makes getPipelineFlow() calls which are difficult to
	// handle when testing.
	getPipelineFlow() {
		const pipelineFlow =
			PipelineOutHandler.createPipelineFlow(this.getCanvasInfo());

		if (this.store.getCanvasConfig().schemaValidation) {
			validatePipelineFlowAgainstSchema(pipelineFlow);
		}

		return pipelineFlow;
	}

	getPipelines() {
		return this.getCanvasInfo().pipelines;
	}

	getPipelineFlowId() {
		return this.store.getPipelineFlowId();
	}

	getPrimaryPipelineId() {
		return this.store.getPrimaryPipelineId();
	}

	getPrimaryPipeline() {
		return this.getCanvasInfoPipeline(this.getPrimaryPipelineId());
	}

	getCurrentPipeline() {
		return this.getCanvasInfoPipeline(this.getCurrentPipelineId());
	}

	getCurrentPipelineId() {
		return this.getCurrentBreadcrumb().pipelineId;
	}

	isPrimaryPipelineEmpty() {
		return this.getAPIPipeline(this.getPrimaryPipelineId()).isEmpty();
	}

	deletePipeline(pipelineId) {
		this.store.dispatch({ type: "DELETE_PIPELINE", data: { id: pipelineId } });
	}

	// Returns true if the pipeline is loaded into memory. It may not be in
	// memory if it is an external pipeline.
	isPipelineLoaded(pipelineId, url) {
		const canvasInfo = this.getCanvasInfo();
		if (!canvasInfo) {
			return false;
		}

		return canvasInfo.pipelines.some((p) => this.isPipeline(p, pipelineId, url));
	}

	// Returns true if the pipeline passed in is the same as that specified by the
	// pipelineId and url parameters passed in. If url is not defined then only
	// the pipeline ID is used for comparison. A url will only be specified for
	// external pipelines.
	isPipeline(p, pipelineId, url) {
		if (p.id === pipelineId) {
			if (!p.parentUrl && !url) {
				return true;
			}
			return p.parentUrl === url;
		}
		return false;
	}

	// Clones the contents of the input node (which is expected to be a supernode
	// with a reference to one of the pipelines passed in) and returns an array
	// of cloned pipelines from the inPipelines array that correspond to
	// descendants of the supernode passed in.
	cloneSupernodeContents(node, inPipelines) {
		let subPipelines = [];
		const snPipelineId = CanvasUtils.getSupernodePipelineId(node);
		if (snPipelineId) {
			const targetPipeline = inPipelines.find((p) => p.id === snPipelineId);
			// A target pipeline may not exist if the supernode is external. In which
			// case, its pipelines will not be in the inPipelines array.
			if (targetPipeline) {
				const clonedPipeline = this.clonePipelineWithNewId(targetPipeline);
				node.subflow_ref.pipeline_id_ref = clonedPipeline.id;

				subPipelines.push(clonedPipeline);

				clonedPipeline.nodes.forEach((clonedNode) => {
					if (clonedNode.type === SUPER_NODE) {
						const extraPipelines = this.cloneSupernodeContents(clonedNode, inPipelines);
						subPipelines = subPipelines.concat(extraPipelines);
					}
				});
			}
		}
		return subPipelines;
	}

	// Clone the pipeline and assigns it a new id.
	clonePipelineWithNewId(pipeline) {
		const clonedPipeline = cloneDeep(pipeline);
		return Object.assign({}, clonedPipeline, { id: this.getUniqueId(CLONE_PIPELINE, { "pipeline": clonedPipeline }) });
	}

	createCanvasInfoPipeline(pipelineInfo) {
		const newPipelineId = this.getUniqueId(CREATE_PIPELINE, { pipeline: pipelineInfo });
		return Object.assign({}, pipelineInfo, { id: newPipelineId });
	}

	getCanvasInfo() {
		return this.store.getCanvasInfo();
	}

	// Returns true if the ID of the canvasInfo passed in is different to the
	// current canvasInfo ID.
	hasCanvasInfoIdChanged(canvasInfo) {
		return canvasInfo.id !== this.getCanvasInfo().id;
	}

	setSubdueStyle(newStyle) {
		this.store.dispatch({ type: "SET_SUBDUE_STYLE", data: { subdueStyle: newStyle } });
	}

	removeAllStyles(temporary) {
		this.store.dispatch({ type: "REMOVE_ALL_STYLES", data: { temporary: temporary } });
	}

	hideComments() {
		this.store.dispatch({ type: "HIDE_COMMENTS" });
	}

	showComments() {
		this.store.dispatch({ type: "SHOW_COMMENTS" });
	}

	isHidingComments() {
		return this.store.getCanvasInfo().hideComments;
	}

	findNode(nodeId, pipelineId, pipelines) {
		const targetPipeline = pipelines.find((p) => p.id === pipelineId);

		if (targetPipeline && targetPipeline.nodes) {
			return targetPipeline.nodes.find((node) => node.id === nodeId);
		}
		return null;
	}

	// ---------------------------------------------------------------------------
	// Breadcrumbs methods
	// ---------------------------------------------------------------------------

	createBreadcrumb(supernodeDatum, parentPipelineId) {
		return {
			pipelineId: supernodeDatum.subflow_ref.pipeline_id_ref,
			supernodeId: supernodeDatum.id,
			supernodeParentPipelineId: parentPipelineId,
			externalUrl: supernodeDatum.subflow_ref.url,
			label: supernodeDatum.label
		};
	}

	addBreadcrumb(data) {
		if (data && data.pipelineId !== this.getPrimaryPipelineId()) {
			this.store.dispatch({ type: "ADD_BREADCRUMB", data: data });
		} else {
			this.resetBreadcrumb();
		}
	}

	addBreadcrumbs(data) {
		this.store.dispatch({ type: "ADD_BREADCRUMBS", data: data });
	}

	setIndexedBreadcrumb(data) {
		this.store.dispatch({ type: "SET_TO_INDEXED_BREADCRUMB", data: data });
	}

	setBreadcrumbs(breadcrumbs) {
		this.store.dispatch({ type: "SET_BREADCRUMBS", data: { breadcrumbs: breadcrumbs } });
	}

	// Sets the breadcrumbs to the previous breadcrumb in the breadcrumbs array.
	setPreviousBreadcrumb() {
		this.store.dispatch({ type: "SET_TO_PREVIOUS_BREADCRUMB" });
	}

	// Sets the breadcrumbs to the primary pipeline in the breadcrumbs array.
	resetBreadcrumb() {
		this.store.dispatch({ type: "RESET_BREADCRUMB", data: { pipelineId: this.getPrimaryPipelineId() } });
	}

	getBreadcrumbs() {
		return this.store.getBreadcrumbs();
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
		const idx = this.getBreadcrumbs().findIndex((crumb) => crumb.pipelineId === pipelineId);
		return (idx > 0); // Return true if index is not the parent
	}

	// ---------------------------------------------------------------------------
	// Config methods
	// ---------------------------------------------------------------------------
	setCanvasConfig(config) {
		const oldConfig = this.getCanvasConfig();
		const newConfig = ConfigUtils.mergeCanvasConfigs(oldConfig, config);

		if (!ConfigUtils.compareCanvasConfigs(oldConfig, newConfig)) {
			const newPipelines = prepareNodes(
				this.getCanvasInfo().pipelines, newConfig.enableNodeLayout, newConfig.enableCanvasLayout, this.layoutHandler);

			this.store.dispatch({ type: "SET_CANVAS_CONFIG_INFO", data: {
				canvasConfig: newConfig,
				pipelines: newPipelines
			} });
		}
	}

	setToolbarConfig(config) {
		this.store.dispatch({ type: "SET_TOOLBAR_CONFIG", data: { toolbarConfig: config } });
	}

	// The toolbar.jsx React object retrieves some display attributes from the
	// canvas-controller, not from Redux. This method will refresh the toolbar
	// config which causes mapStateToProps to run in toolbar.jsx and that
	// will cause the toolbar to retrieve those attributes from canvas-contoller.
	refreshToolbar() {
		this.store.dispatch({ type: "REFRESH_TOOLBAR" });
	}

	setNotificationPanelConfig(config) {
		this.store.dispatch({ type: "SET_NOTIFICATION_PANEL_CONFIG", data: { notificationPanelConfig: config } });
	}

	getCanvasConfig() {
		return this.store.getCanvasConfig();
	}

	// ---------------------------------------------------------------------------
	// Layout Info methods
	// ---------------------------------------------------------------------------

	getNodeLayout() {
		return this.store.getNodeLayout();
	}

	getCanvasLayout() {
		return this.store.getCanvasLayout();
	}

	// ---------------------------------------------------------------------------
	// Notification Messages methods
	// ---------------------------------------------------------------------------

	clearNotificationMessages() {
		this.store.dispatch({ type: "CLEAR_NOTIFICATION_MESSAGES" });
	}

	setNotificationMessages(messages) {
		this.store.dispatch({ type: "SET_NOTIFICATION_MESSAGES", data: { messages: messages } });
	}

	getNotificationMessages(messageType) {
		const notificationMessages = this.store.getNotifications();
		if (messageType) {
			return notificationMessages.filter((message) => message.type === messageType);
		}
		return notificationMessages;
	}

	deleteNotificationMessages(ids) {
		this.store.dispatch({ type: "DELETE_NOTIFICATION_MESSAGES", data: { ids: ids } });
	}

	toggleNotificationPanel() {
		if (this.isNotificationPanelOpen()) {
			this.closeNotificationPanel();
		} else {
			this.openNotificationPanel();
		}
	}

	openNotificationPanel() {
		this.store.dispatch({ type: "SET_NOTIFICATION_PANEL_OPEN_STATE", data: { isOpen: true } });
	}

	closeNotificationPanel() {
		this.store.dispatch({ type: "SET_NOTIFICATION_PANEL_OPEN_STATE", data: { isOpen: false } });
	}

	isNotificationPanelOpen() {
		return this.store.isNotificationPanelOpen();
	}

	// ---------------------------------------------------------------------------
	// Context menu methods
	// ---------------------------------------------------------------------------

	openContextMenu(menuDef, source) {
		this.store.dispatch({ type: "OPEN_CONTEXT_MENU", data: { menuDef, source } });
	}

	closeContextMenu() {
		this.store.dispatch({ type: "CLOSE_CONTEXT_MENU" });
	}

	isContextMenuDisplayed() {
		return this.store.isContextMenuDisplayed();
	}

	getContextMenuSource() {
		return this.store.getContextMenuSource();
	}

	// ---------------------------------------------------------------------------
	// Right flyout methods
	// ---------------------------------------------------------------------------

	setRightFlyoutConfig(config) {
		this.store.dispatch({ type: "SET_RIGHT_FLYOUT_CONFIG", data: { config: config } });
	}

	isRightFlyoutOpen() {
		return this.store.isRightFlyoutOpen();
	}

	// ---------------------------------------------------------------------------
	// Bottom panel methods
	// ---------------------------------------------------------------------------

	setBottomPanelConfig(config) {
		this.store.dispatch({ type: "SET_BOTTOM_PANEL_CONFIG", data: { config: config } });
	}

	isBottomPanelOpen() {
		return this.store.isBottomPanelOpen();
	}

	setBottomPanelHeight(ht) {
		this.store.dispatch({ type: "SET_BOTTOM_PANEL_CONFIG", data: { config: { panelHeight: ht } } });
	}

	// ---------------------------------------------------------------------------
	// Top panel methods
	// ---------------------------------------------------------------------------

	setTopPanelConfig(config) {
		this.store.dispatch({ type: "SET_TOP_PANEL_CONFIG", data: { config: config } });
	}

	isTopPanelOpen() {
		return this.store.isTopPanelOpen();
	}

	// ---------------------------------------------------------------------------
	// Clone methods
	// ---------------------------------------------------------------------------
	cloneObjectsToPaste(nodes, comments, links) {
		const clonedNodesInfo = [];
		const clonedCommentsInfo = [];
		const clonedLinks = [];

		if (nodes) {
			nodes.forEach((node) => {
				let clonedNode = this.cloneNode(node);
				// Pipelines in app_data.ui_data.sub_pipelines in supernodes will be in schema
				// format (conforming to the pipeline flow schema) so they must be converted.
				if (clonedNode.type === SUPER_NODE) {
					clonedNode = this.convertPipelineData(clonedNode);
				}
				clonedNodesInfo.push({ originalId: node.id, node: clonedNode });
			});
		}

		if (comments) {
			comments.forEach((comment) => {
				clonedCommentsInfo.push({ originalId: comment.id, comment: this.cloneComment(comment) });
			});
		}

		if (links) {
			links.forEach((link) => {
				if (link.type === "nodeLink" || link.type === "associationLink") {
					const srcClonedNode = this.findClonedNode(link.srcNodeId, clonedNodesInfo);
					const trgClonedNode = this.findClonedNode(link.trgNodeId, clonedNodesInfo);
					const newLink = this.cloneNodeLink(link, srcClonedNode, trgClonedNode);
					clonedLinks.push(newLink);
				} else {
					const srcClonedComment = this.findClonedComment(link.srcNodeId, clonedCommentsInfo);
					const trgClonedNode = this.findClonedNode(link.trgNodeId, clonedNodesInfo);
					if (srcClonedComment && trgClonedNode) {
						const newLink = this.cloneCommentLink(link, srcClonedComment.id, trgClonedNode.id);
						clonedLinks.push(newLink);
					}
				}
			});
		}

		const clonedNodes = clonedNodesInfo.map((cni) => cni.node);
		const clonedComments = clonedCommentsInfo.map((cci) => cci.comment);

		return { clonedNodes, clonedComments, clonedLinks };
	}

	// Returns the cloned node from the array of cloned nodes, identified
	// by the node ID passed in which is the ID of the original node.
	findClonedNode(nodeId, clonedNodesInfo) {
		const clonedNodeInfo = clonedNodesInfo.find((cni) => cni.originalId === nodeId);
		if (clonedNodeInfo) {
			return clonedNodeInfo.node;
		}
		return null;
	}

	// Returns the cloned comment from the array of cloned comments, identified
	// by the comment ID passed in which is the ID of the original comment.
	findClonedComment(commentId, clonedCommentsInfo) {
		const clonedCommentInfo = clonedCommentsInfo.find((cci) => cci.originalId === commentId);
		if (clonedCommentInfo) {
			return clonedCommentInfo.comment;
		}
		return null;
	}

	// Clone the node provided, with a new unique ID.
	cloneNode(inNode) {
		let node = Object.assign({}, inNode, { id: this.getUniqueId(CLONE_NODE, { "node": inNode }) });

		// Add node height and width and, if appropriate, inputPortsHeight
		// and outputPortsHeight
		node = this.setNodeAttributes(node);
		return node;
	}

	// Clone the comment provided, with a new unique ID.
	cloneComment(inComment) {
		// Adjust for snap to grid, if necessary.
		const comment = this.setCommentAttributes(inComment);

		return Object.assign({}, comment, { id: this.getUniqueId(CLONE_COMMENT, { "comment": comment }) });
	}

	// Returns a clone of the link passed in using the source and target nodes
	// passed in. If a semi-detached or fully-detached link is being cloned the
	// srcNode and/or trgNode may be null.
	cloneNodeLink(link, srcNode, trgNode) {
		const id = this.getUniqueId(CLONE_NODE_LINK, { "link": link, "sourceNodeId": srcNode ? srcNode.id : null, "targetNodeId": trgNode ? trgNode.id : null });
		const clonedLink = Object.assign({}, link, { id: id });

		if (srcNode) {
			clonedLink.srcNodeId = srcNode.id;
			clonedLink.srcNodePortId = link.srcNodePortId;
		} else {
			clonedLink.srcPos = link.srcPos;
		}
		if (trgNode) {
			clonedLink.trgNodeId = trgNode.id;
			clonedLink.trgNodePortId = link.trgNodePortId;
		} else {
			clonedLink.trgPos = link.trgPos;
		}
		return clonedLink;
	}

	// Returns a clone of the link passed in with the source and targets set to
	// the IDs passed in.
	cloneCommentLink(link, srcNodeId, trgNodeId) {
		return {
			id: this.getUniqueId(CLONE_COMMENT_LINK, { "link": link, "commentId": srcNodeId, "targetNodeId": trgNodeId }),
			type: link.type,
			class_name: link.class_name,
			srcNodeId: srcNodeId,
			trgNodeId: trgNodeId
		};
	}

	// ---------------------------------------------------------------------------
	// Selection methods
	// ---------------------------------------------------------------------------

	getSelectedObjectIds() {
		return this.store.getSelectedObjectIds();
	}

	getSelectedNodesIds() {
		return this.getSelectedNodes().map((n) => n.id);
	}

	getSelectedNodes() {
		return this.store.getSelectedNodes();
	}

	getSelectedComments() {
		return this.store.getSelectedComments();
	}

	getSelectedLinks() {
		return this.store.getSelectedLinks();
	}

	getSelectedObjects() {
		return this.getSelectedNodes()
			.concat(this.getSelectedComments())
			.concat(this.getSelectedLinks());
	}

	getSelectionInfo() {
		return this.store.getSelectionInfo();
	}

	getSelectedPipeline() {
		return this.getAPIPipeline(this.getSelectedPipelineId());
	}

	getSelectedPipelineId() {
		return this.store.getSelectedPipelineId();
	}

	clearSelections() {
		this.executeWithSelectionChange(this.store.dispatch, { type: "CLEAR_SELECTIONS" });
	}

	// Simulates the selection of an object (identified by objId) in the
	// pipeline identified by pipelineId with the augmentation keys pressed
	// as indicated by isShiftKeyPressed and isCmndCtrlPressed.
	selectObject(objId, isShiftKeyPressed, isCmndCtrlPressed, pipelineId) {
		if (!this.isSelected(objId, pipelineId)) {
			if (isShiftKeyPressed) {
				this.selectSubGraph(objId, pipelineId);
			} else {
				this.toggleSelection(objId, isCmndCtrlPressed, pipelineId);
			}
		} else if (isCmndCtrlPressed) {
			this.toggleSelection(objId, isCmndCtrlPressed, pipelineId);
		}
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
		this.executeWithSelectionChange(
			this.store.dispatch, { type: "SET_SELECTIONS", data: { selections: newSelections }, pipelineId: selPipelineId }
		);
	}

	deleteSelectedObjects() {
		const apiPipeline = this.getSelectedPipeline();
		apiPipeline.deleteObjects(this.getSelectedObjectIds());
	}

	selectAll(includeLinks, pipelineId) {
		const selected = [];
		const apiPipeline = this.getAPIPipeline(pipelineId);
		for (const node of apiPipeline.getNodes()) {
			if (!CanvasUtils.isSuperBindingNode(node)) { // Dont allow supernode binding nodes to be selected
				selected.push(node.id);
			}
		}
		for (const comment of apiPipeline.getComments()) {
			selected.push(comment.id);
		}
		if (includeLinks) {
			for (const link of apiPipeline.getLinks()) {
				selected.push(link.id);
			}
		}
		this.setSelections(selected, apiPipeline.pipelineId);
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

	// Returns true if all the selected objects are links.
	areAllSelectedObjectsLinks() {
		return this.store.areAllSelectedObjectsLinks();
	}

	// Recursive function to add all connected nodes into the group.
	addConnectedNodeIdToGroup(nodeId, connectedNodesIdsGroup, nodeIds, apiPipeline) {
		if (connectedNodesIdsGroup.includes(nodeId)) {
			const nodeLinks = apiPipeline.getLinksContainingId(nodeId)
				.filter((link) => link.type === NODE_LINK || link.type === ASSOCIATION_LINK);

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

	// Creates an empty pipeline. Used for supernodes without sub pipeline defined
	createEmptyPipeline() {
		const primaryPipeline = this.getCanvasInfoPipeline(this.getPrimaryPipelineId());
		const subPipelineInfo = {
			"runtime_ref": primaryPipeline.runtime_ref,
			"nodes": [],
			"comments": [],
			"links": []
		};
		return this.createCanvasInfoPipeline(subPipelineInfo);
	}

	// Creates a pipeline from the parameters passed in. Used for supernodes without sub-pipeline defined.
	createPipeline(subflowNodes, subflowComments, subflowLinks) {
		const primaryPipeline = this.getCanvasInfoPipeline(this.getPrimaryPipelineId());
		const subPipelineInfo = {
			"runtime_ref": primaryPipeline.runtime_ref,
			"nodes": subflowNodes,
			"comments": subflowComments,
			"links": subflowLinks
		};

		return this.createCanvasInfoPipeline(subPipelineInfo);
	}

	executeWithSelectionChange(func, arg) {
		let previousSelection = {
			nodes: [],
			comments: [],
			pipelineId: ""
		};

		if (this.selectionChangeHandler) {
			previousSelection = {
				links: this.getSelectedLinks(),
				nodes: this.getSelectedNodes(),
				comments: this.getSelectedComments(),
				pipelineId: this.getSelectedPipelineId()
			};
		}

		func(arg);

		if (this.selectionChangeHandler) {

			// Determine delta in selected nodes, comments and links
			const selectedLinks = this.getSelectedLinks();
			const selectedNodes = this.getSelectedNodes();
			const selectedComments = this.getSelectedComments();
			const newSelection = {
				selection: this.getSelectedObjectIds(),
				selectedLinks: selectedLinks,
				selectedNodes: selectedNodes,
				selectedComments: selectedComments,
				addedLinks: differenceWith(selectedLinks, previousSelection.links, (s, p) => s.id === p.id),
				addedNodes: differenceWith(selectedNodes, previousSelection.nodes, (s, p) => s.id === p.id),
				addedComments: differenceWith(selectedComments, previousSelection.comments, (s, p) => s.id === p.id),
				deselectedLinks: differenceWith(previousSelection.links, selectedLinks, (s, p) => s.id === p.id),
				deselectedNodes: differenceWith(previousSelection.nodes, selectedNodes, (s, p) => s.id === p.id),
				deselectedComments: differenceWith(previousSelection.comments, selectedComments, (s, p) => s.id === p.id),
				previousPipelineId: previousSelection.pipelineId,
				selectedPipelineId: this.getSelectedPipelineId()
			};

			// only trigger event if selection has changed
			if (!isEmpty(newSelection.addedLinks) ||
					!isEmpty(newSelection.addedNodes) ||
					!isEmpty(newSelection.addedComments) ||
					!isEmpty(newSelection.deselectedLinks) ||
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
			return messages.some((msg) => msg.type === ERROR);
		}
		return false;
	}

	hasWarningMessage(node) {
		const messages = this.getNodeMessages(node);
		if (messages) {
			return messages.some((msg) => msg.type === WARNING);
		}
		return false;
	}

	getNodeMessages(node) {
		return node ? node.messages : null;
	}

	// Returns the maximum message type from all notification messages.
	getNotificationMessagesMaxType() {
		const notificationMessages = this.getNotificationMessages();
		const errorMessages = this.getNotificationMessages(ERROR);
		const warningMessages = this.getNotificationMessages(WARNING);
		const successMessages = this.getNotificationMessages(SUCCESS);
		const infoMessages = this.getNotificationMessages(INFO);

		let maxMessageType = null;
		if (notificationMessages.length > 0) {
			if (errorMessages.length > 0) {
				maxMessageType = ERROR;
			} else if (warningMessages.length > 0) {
				maxMessageType = WARNING;
			} else if (successMessages.length > 0) {
				maxMessageType = SUCCESS;
			} else if (infoMessages.length > 0) {
				maxMessageType = INFO;
			}
		}
		return maxMessageType;
	}

	// Returns true if the object passed in is a link.
	isLink(obj) {
		return obj.type === NODE_LINK || obj.type === COMMENT_LINK || obj.type === ASSOCIATION_LINK;
	}

	setZoom(zoom, pipelineId) {
		const enableSaveZoom = this.getCanvasConfig().enableSaveZoom;

		if (enableSaveZoom === SAVE_ZOOM_PIPELINE_FLOW) {
			this.store.dispatch({ type: "SET_ZOOM", data: { zoom: zoom, enableSaveZoom }, pipelineId });

		} else if (enableSaveZoom === SAVE_ZOOM_LOCAL_STORAGE) {
			this.setSavedZoomLocal(zoom, pipelineId);
		}
		// This will cause the toolbar to be updated so zoom icons can
		// be enabled/disabled.
		this.refreshToolbar();
	}

	// Returns the saved zoom based on the enableSaveZoom config parameter.
	getSavedZoom(pipelineId) {
		const enableSaveZoom = this.getCanvasConfig().enableSaveZoom;
		if (enableSaveZoom === SAVE_ZOOM_PIPELINE_FLOW) {
			return this.store.getZoom(pipelineId);

		} else if (enableSaveZoom === SAVE_ZOOM_LOCAL_STORAGE) {
			return this.getSavedZoomLocal(pipelineId);
		}
		return null;
	}

	// Clears any saved zoom values in Local Storage
	clearSavedZoomValues() {
		LocalStorage.delete("canvasSavedZoomValues");
	}

	// Saves the zoom object passed in for this pipeline in local storage.
	// The pipeline is identified by the pipelineFlowId and pipelineId passed in.
	setSavedZoomLocal(zoom, pipelineId) {
		const canvasSavedZoomValues = LocalStorage.get("canvasSavedZoomValues");
		const savedZooms = canvasSavedZoomValues ? JSON.parse(canvasSavedZoomValues) : {};
		set(savedZooms, [this.getPipelineFlowId(), pipelineId], zoom);
		LocalStorage.set("canvasSavedZoomValues", JSON.stringify(savedZooms));
	}

	// Returns the zoom for this pipeline saved in local storage. The pipeline is
	// identified by the pipelineFlowId and pipelineId passed in.
	getSavedZoomLocal(pipelineId) {
		const canvasSavedZoomValues = LocalStorage.get("canvasSavedZoomValues");
		if (canvasSavedZoomValues) {
			const savedZoom = JSON.parse(canvasSavedZoomValues);
			return get(savedZoom, [this.getPipelineFlowId(), pipelineId]);
		}
		return null;
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
	// that are in the supernode and any of its descendant supernodes.
	getSupernodeNodeIds(nodeId, pipelineId, highlightNodeIds, highlightLinkIds) {
		const node = this.getAPIPipeline(pipelineId).getNode(nodeId);
		if (node.type === SUPER_NODE) {
			const snPipelineId = CanvasUtils.getSupernodePipelineId(node);

			highlightNodeIds[snPipelineId] = highlightNodeIds[snPipelineId] || [];
			highlightLinkIds[snPipelineId] = highlightLinkIds[snPipelineId] || [];

			const nodeIds = this.getAPIPipeline(snPipelineId).getNodeIds();
			const linkIds = this.getAPIPipeline(snPipelineId).getLinkIds();

			highlightNodeIds[snPipelineId] = union(highlightNodeIds[snPipelineId], nodeIds);
			highlightLinkIds[snPipelineId] = union(highlightLinkIds[snPipelineId], linkIds);

			nodeIds.forEach((nId) => {
				this.getSupernodeNodeIds(nId, snPipelineId, highlightNodeIds, highlightLinkIds);
			});
		}
	}

	getUpstreamObjIdsFrom(nodeId, pipelineId, highlightNodeIds, highlightLinkIds) {
		highlightNodeIds[pipelineId] = highlightNodeIds[pipelineId] || [];
		highlightLinkIds[pipelineId] = highlightLinkIds[pipelineId] || [];

		const currentPipeline = this.getAPIPipeline(pipelineId);
		const node = currentPipeline.getNode(nodeId);
		const nodeLinks = currentPipeline
			.getAttachedLinksContainingTargetId(nodeId)
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
						const snPipelineId = CanvasUtils.getSupernodePipelineId(srcNode);
						const bindingNode = this.getAPIPipeline(snPipelineId).getNode(srcNodeOutputPort.subflow_node_ref);

						if (bindingNode) {
							highlightLinkIds[snPipelineId] = highlightLinkIds[snPipelineId] || [];
							highlightNodeIds[snPipelineId] = highlightNodeIds[snPipelineId] || [];
							highlightNodeIds[snPipelineId] = union(highlightNodeIds[snPipelineId], [bindingNode.id]);

							this.getUpstreamObjIdsFrom(bindingNode.id, snPipelineId, highlightNodeIds, highlightLinkIds);
						}
					} else {
						this.getUpstreamObjIdsFrom(link.srcNodeId, pipelineId, highlightNodeIds, highlightLinkIds);
					}
				}
			});
		} else if (currentPipeline.isEntryBindingNode(node) &&
								CanvasUtils.isSuperBindingNode(node)) {
			const supernodeObj = this.getSupernodeObjReferencing(pipelineId);
			const parentPipelineId = supernodeObj.parentPipelineId;
			const parentPipeline = this.getAPIPipeline(parentPipelineId);
			const supernode = parentPipeline.getNode(supernodeObj.supernodeId);

			supernode.inputs.forEach((inputPort) => {
				if (inputPort.subflow_node_ref === nodeId) {
					const supernodeLinks = parentPipeline.getAttachedLinksContainingTargetId(supernode.id);
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
									this.getUpstreamObjIdsFrom(bindingNodeId, CanvasUtils.getSupernodePipelineId(upstreamSupernode), highlightNodeIds, highlightLinkIds);
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
			.getAttachedLinksContainingSourceId(nodeId)
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
						const snPipelineId = CanvasUtils.getSupernodePipelineId(trgNode);
						const bindingNode = this.getAPIPipeline(snPipelineId).getNode(trgNodeInputPort.subflow_node_ref);

						if (bindingNode) {
							highlightLinkIds[snPipelineId] = highlightLinkIds[snPipelineId] || [];
							highlightNodeIds[snPipelineId] = highlightNodeIds[snPipelineId] || [];
							highlightNodeIds[snPipelineId] = union(highlightNodeIds[snPipelineId], [bindingNode.id]);

							this.getDownstreamObjIdsFrom(bindingNode.id, snPipelineId, highlightNodeIds, highlightLinkIds);
						}
					} else {
						this.getDownstreamObjIdsFrom(link.trgNodeId, pipelineId, highlightNodeIds, highlightLinkIds);
					}
				}
			});
		} else if (currentPipeline.isExitBindingNode(node)) {
			if (CanvasUtils.isSuperBindingNode(node)) {
				const supernodeObj = this.getSupernodeObjReferencing(pipelineId);
				const parentPipelineId = supernodeObj.parentPipelineId;
				const parentPipeline = this.getAPIPipeline(parentPipelineId);
				const supernode = parentPipeline.getNode(supernodeObj.supernodeId);

				supernode.outputs.forEach((outputPort) => {
					if (outputPort.subflow_node_ref === nodeId) {
						const supernodeLinks = parentPipeline.getAttachedLinksContainingSourceId(supernode.id);
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
										this.getDownstreamObjIdsFrom(bindingNodeId, CanvasUtils.getSupernodePipelineId(downstreamSupernode), highlightNodeIds, highlightLinkIds);
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
		if (CanvasUtils.getSupernodePipelineId(trgNode) && link.trgNodePortId) {
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
		if (CanvasUtils.getSupernodePipelineId(srcNode) && link.srcNodePortId) {
			srcNode.outputs.forEach((outputPort) => {
				if (outputPort.id === link.srcNodePortId) {
					port = outputPort;
					return;
				}
			});
		}
		return port;
	}

	setObjectsBranchHighlight(pipelineObjIds) {
		this.store.dispatch({ type: "SET_OBJECTS_BRANCH_HIGHLIGHT", data: { pipelineObjIds: pipelineObjIds } });
	}

	setLinksBranchHighlight(pipelineLinkIds) {
		this.store.dispatch({ type: "SET_LINKS_BRANCH_HIGHLIGHT", data: { pipelineObjIds: pipelineLinkIds } });
	}

	unsetAllBranchHighlight() {
		this.store.dispatch({ type: "UNSET_OBJECTS_BRANCH_HIGHLIGHT" });
	}

	// ---------------------------------------------------------------------------
	// Clipboard methods
	// ---------------------------------------------------------------------------

	// Copies the currently selected objects to the internal clipboard and
	// returns true if successful. Returns false if there is nothing to copy to
	// the clipboard.
	copyToClipboard(areDetachableLinksInUse) {
		var copyData = {};

		const apiPipeline = this.getSelectionAPIPipeline();
		if (!apiPipeline) {
			return false;
		}
		const nodes = this.getSelectedNodes();
		const comments = this.getSelectedComments();
		let links = apiPipeline.getLinksBetween(nodes, comments);

		// If detachable links are in use, we need to also add any links that
		// emanate from the selected nodes AND any links that are currently
		// selected, making sure we don't have any duplicates in the final
		// links array.
		if (areDetachableLinksInUse) {
			const emanatingLinks = apiPipeline.getNodeDataLinksContainingIds(nodes.map((n) => n.id));
			links = CanvasUtils.concatUniqueBasedOnId(emanatingLinks, links);
			links = CanvasUtils.concatUniqueBasedOnId(this.getSelectedLinks(), links);
		}

		if (nodes.length === 0 && comments.length === 0 && links.length === 0) {
			return false;
		}

		if (nodes && nodes.length > 0) {
			copyData.nodes = nodes;
			let pipelines = [];
			const supernodes = CanvasUtils.filterSupernodes(nodes);
			supernodes.forEach((supernode) => {
				pipelines = pipelines.concat(this.getSchemaPipelinesForSupernode(supernode));
				supernode.sub_pipelines = pipelines;
			});
		}

		if (comments && comments.length > 0) {
			copyData.comments = comments;
		}

		if (links && links.length > 0) {
			copyData.links = links.map((link) => {
				// To handle attached or semi-detached links (where the attached node
				// is not one of the nodes to be copied to the clipboard) we will need
				// to alter the source and/or target info so make a copy of the link
				// first.
				const newLink = Object.assign({}, link);
				// If the link is a node-node data link and it is attached to a source
				// node and that node is not to be clipboarded, set the srcPos
				// coordinates and remove the source node info.
				if (link.type === NODE_LINK &&
						link.srcNodeId &&
						nodes.findIndex((n) => n.id === link.srcNodeId) === -1) {
					delete newLink.srcNodeId;
					delete newLink.srcNodePortId;
					newLink.srcPos = CanvasUtils.getSrcPos(link, apiPipeline);
				}
				// If the link is a node-node data link and it is attached to a target
				// node and that node is not to be clipboarded, set the trgPos
				// coordinates and remove the target node info.
				if (link.type === NODE_LINK &&
						link.trgNodeId &&
						nodes.findIndex((n) => n.id === link.trgNodeId) === -1) {
					delete newLink.trgNodeId;
					delete newLink.trgNodePortId;
					newLink.trgPos = CanvasUtils.getTrgPos(link, apiPipeline);
				}
				return newLink;
			});
		}

		var clipboardData = JSON.stringify(copyData);
		LocalStorage.set("canvasClipboard", clipboardData);

		return true;
	}

	isClipboardEmpty() {
		const value = LocalStorage.get("canvasClipboard");
		if (value && value !== "") {
			return false;
		}
		return true;
	}

	// Returns an object containing arrays of canvas objects (node, comments and
	// links) that are currently on the clipboard.
	getObjectsToPaste() {
		const textToPaste = LocalStorage.get("canvasClipboard");

		if (!textToPaste) {
			return {};
		}

		const objects = JSON.parse(textToPaste);

		// If there are no nodes and no comments there's nothing to paste so just
		// return null.
		if (!objects.nodes && !objects.comments && !objects.links) {
			return null;
		}

		return objects;
	}

	// ---------------------------------------------------------------------------
	// Tooltip methods
	// ---------------------------------------------------------------------------
	setTooltipDef(tipDef) {
		this.store.dispatch({ type: "SET_TOOLTIP_DEF", data: { tooltipDef: tipDef } });
	}

	getTooltip() {
		return this.store.getTooltip();
	}

	isTooltipOpen() {
		return this.store.isTooltipOpen();
	}

	// ---------------------------------------------------------------------------
	// Text Toolbar methods
	// ---------------------------------------------------------------------------
	setTextToolbarDef(textToolbarDef) {
		this.store.dispatch({ type: "SET_TEXT_TOOLBAR_DEF", data: { textToolbarDef: textToolbarDef } });
	}

}
