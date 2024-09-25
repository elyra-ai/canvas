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

import { combineReducers, createStore } from "redux";
import { cloneDeep, isEmpty } from "lodash";

import ConfigUtils from "../config-utils.js";

import tooltip from "./reducers/tooltip.js";
import palette from "./reducers/palette.js";
import canvasinfo from "./reducers/canvasinfo.js";
import contextmenu from "./reducers/contextmenu.js";
import leftflyout from "./reducers/leftflyout.js";
import rightflyout from "./reducers/rightflyout.js";
import bottompanel from "./reducers/bottompanel.js";
import toppanel from "./reducers/toppanel.js";
import breadcrumbs from "./reducers/breadcrumbs.js";
import canvasconfig from "./reducers/canvasconfig.js";
import canvastoolbar from "./reducers/canvastoolbar.js";
import texttoolbar from "./reducers/texttoolbar.js";
import notifications from "./reducers/notifications.js";
import selectioninfo from "./reducers/selectioninfo.js";
import notificationpanel from "./reducers/notificationpanel.js";
import externalpipelineflows from "./reducers/externalpipelineflows.js";

export default class CanavasStore {
	constructor(emptyCanvasInfo) {
		// Put selectioninfo reducer first so selections are handled before
		// canvasinfo actions. Also, put canvasconfig reducer before canvasinfo
		// because node heights and widths are calculated based on the node
		// layout info contained in the canvas config object's enableNodeLayout field.
		var combinedReducer = combineReducers({
			selectioninfo,
			canvasconfig,
			canvasinfo,
			breadcrumbs,
			palette,
			notifications,
			notificationpanel,
			externalpipelineflows,
			tooltip,
			canvastoolbar,
			texttoolbar,
			contextmenu,
			leftflyout,
			rightflyout,
			bottompanel,
			toppanel
		});

		const initialState = {
			selectioninfo: {},
			canvasinfo: emptyCanvasInfo,
			canvasconfig: ConfigUtils.getDefaultCanvasConfig(),
			breadcrumbs: [{ pipelineId: emptyCanvasInfo.primary_pipeline, pipelineFlowId: emptyCanvasInfo.id }],
			palette: { content: {} }, // Don't initialize isOpen here, it must be done in CanvasController.setCanvasConfig based on paletteInitialState
			notifications: [],
			notificationpanel: { isOpen: false, config: {} },
			externalpipelineflows: [],
			tooltip: {},
			canvastoolbar: {},
			texttoolbar: { isOpen: false },
			contextmenu: { isOpen: false, menuDef: [], source: {} },
			leftflyout: {},
			rightflyout: {},
			bottompanel: { panelHeight: 393 },
			toppanel: { }
		};

		// This code removed because it was causing slowdown in the test harness with the
		// debugger open in the latest version of Chrome.
		// if (typeof window !== "undefined") {
		// 	const enableDevTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
		// 	this.store = createStore(combinedReducer, initialState, enableDevTools);
		// } else {
		this.store = createStore(combinedReducer, initialState);
		// }

		this.dispatch = this.dispatch.bind(this);
	}

	dispatch(action) {
		this.store.dispatch(action);
	}

	subscribe(callback) {
		return this.store.subscribe(callback);
	}

	// Returns the redux store
	getStore() {
		return this.store;
	}

	getPalette() {
		return cloneDeep(this.store.getState().palette);
	}

	getPaletteData() {
		return cloneDeep(this.store.getState().palette.content);
	}

	getPaletteCategory(categoryId) {
		return cloneDeep(this.store.getState().palette.content.categories.find((c) => c.id === categoryId));
	}

	getCanvasInfo() {
		return cloneDeep(this.store.getState().canvasinfo);
	}

	getPipelineFlowId() {
		return this.store.getState().canvasinfo.id;
	}

	getPrimaryPipelineId() {
		return this.store.getState().canvasinfo.primary_pipeline;
	}

	getZoom(pipelineId) {
		const p = this.getNonClonedPipeline(pipelineId);
		if (p) {
			return cloneDeep(p.zoom);
		}
		return null;
	}

	isEmpty(pipelineId) {
		const pipeline = this.getNonClonedPipeline(pipelineId);

		if (pipeline.nodes && pipeline.nodes.length === 0 &&
				pipeline.comments && pipeline.comments.length === 0 &&
				pipeline.links && pipeline.links.length === 0) {
			return true;
		}
		return false;
	}

	// This is a service method for retrieving the internal pipeline. It does NOT
	// clone the pipeline therefore it should NOT be called from outside this
	// class because we don't want to surface the intenal data in redux to
	// the outside world.
	getNonClonedPipeline(pipelineId) {
		return this.store.getState().canvasinfo.pipelines.find((p) => p.id === pipelineId);
	}

	// This is a service method for retrieving selected objects of the type passed
	// in which can be "nodes", "comments" or "links". It does NOT clone the
	// resultant array therefore it should NOT be called from outside this
	// class because we don't want to surface the intenal data in redux to
	// the outside world.
	getNonClonedSelectedObjs(type) {
		const selectedPipelineId = this.getSelectedPipelineId();
		if (selectedPipelineId) {
			const pipeline = this.getNonClonedPipeline(selectedPipelineId);
			if (pipeline && pipeline[type]) {
				const selectedObjIds = this.getSelectedObjectIds();
				return pipeline[type].filter((o) => selectedObjIds.includes(o.id));
			}
		}
		return [];
	}

	getNodes(pipelineId) {
		const pipeline = this.getNonClonedPipeline(pipelineId);
		if (pipeline && pipeline.nodes) {
			return cloneDeep(pipeline.nodes);
		}
		return [];
	}

	getNode(nodeId, pipelineId) {
		const pipeline = this.getNonClonedPipeline(pipelineId);
		let node = null;
		if (pipeline && pipeline.nodes) {
			const internalNode = pipeline.nodes.find((n) => (n.id === nodeId));
			if (internalNode) {
				node = cloneDeep(internalNode);
			}
		}
		return node;
	}

	getComments(pipelineId) {
		const pipeline = this.getNonClonedPipeline(pipelineId);
		if (pipeline && pipeline.comments) {
			return cloneDeep(pipeline.comments);
		}
		return [];
	}

	getComment(commentId, pipelineId) {
		const pipeline = this.getNonClonedPipeline(pipelineId);
		let com = null;
		if (pipeline && pipeline.comments) {
			const internalCom = pipeline.comments.find((c) => (c.id === commentId));
			if (internalCom) {
				com = cloneDeep(internalCom);
			}
		}
		return com;
	}

	getLinks(pipelineId) {
		const pipeline = this.getNonClonedPipeline(pipelineId);
		if (pipeline && pipeline.links) {
			return cloneDeep(pipeline.links);
		}
		return [];
	}

	getLink(linkId, pipelineId) {
		const pipeline = this.getNonClonedPipeline(pipelineId);
		let link = null;
		if (pipeline && pipeline.links) {
			const internalLink = pipeline.links.find((l) => (l.id === linkId));
			if (internalLink) {
				link = cloneDeep(internalLink);
			}
		}
		return link;
	}

	getBreadcrumbs() {
		return cloneDeep(this.store.getState().breadcrumbs);
	}

	getCanvasConfig() {
		// Canvas config cannot be cloned because it may contain JSX objects
		// so create copy using Object.assign.
		return Object.assign({}, this.store.getState().canvasconfig);
	}

	getNodeLayout() {
		return this.cloneData(this.store.getState().canvasconfig.enableNodeLayout);
	}

	getCanvasLayout() {
		return this.cloneData(this.store.getState().canvasconfig.enableCanvasLayout);
	}

	isTooltipOpen() {
		return !isEmpty(this.store.getState().tooltip);
	}

	getTooltip() {
		return this.cloneData(this.store.getState().tooltip);
	}

	isLeftFlyoutOpen() {
		return this.store.getState().leftflyout.isOpen;
	}

	isRightFlyoutOpen() {
		return this.store.getState().rightflyout.isOpen;
	}

	isBottomPanelOpen() {
		return this.store.getState().bottompanel.isOpen;
	}

	isTopPanelOpen() {
		return this.store.getState().toppanel.isOpen;
	}

	getNotificationPanel() {
		return this.cloneData(this.store.getState().notificationpanel);
	}

	getNotifications() {
		// Notification messages may contain JSX objects and a callback function
		// so create copy using Object.assign instead of this.cloneData method.
		return this.store.getState().notifications.map((n, i) => Object.assign({}, n));
	}

	isNotificationPanelOpen() {
		return this.getNotificationPanel().isOpen;
	}

	getContextMenuSource() {
		return this.cloneData(this.store.getState().contextmenu.source);
	}

	isContextMenuDisplayed() {
		return this.store.getState().contextmenu.isOpen;
	}

	getSelectionInfo() {
		return this.cloneData(this.store.getState().selectioninfo);
	}

	getSelectedPipelineId() {
		return this.getSelectionInfo().pipelineId;
	}

	getSelectedObjectIds() {
		const selectedObjIds = this.store.getState().selectioninfo.selections || [];
		return this.cloneData(selectedObjIds);
	}

	getSelectedNodes() {
		return cloneDeep(this.getNonClonedSelectedObjs("nodes"));
	}

	getSelectedComments() {
		return cloneDeep(this.getNonClonedSelectedObjs("comments"));
	}

	getSelectedLinks() {
		return cloneDeep(this.getNonClonedSelectedObjs("links"));
	}

	// Returns true if all the selected objects are links. That is, if the
	// number of selected links is the same as the number of selected objects.
	areAllSelectedObjectsLinks() {
		return this.getNonClonedSelectedObjs("links").length === this.getSelectedObjectIds().length;
	}

	getExternalPipelineFlows() {
		return this.cloneData(this.store.getState().externalpipelineflows);
	}

	getExternalPipelineFlow(url) {
		const epf = this.store.getState().externalpipelineflows.find((pf) => pf.url === url);
		if (epf) {
			return this.cloneData(epf);
		}
		return null;
	}

	cloneData(data) {
		return cloneDeep(data);
	}
}
