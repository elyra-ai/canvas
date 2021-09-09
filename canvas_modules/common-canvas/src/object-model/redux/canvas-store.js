/*
 * Copyright 2017-2021 Elyra Authors
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
import selectioninfo from "./reducers/selectioninfo.js";
import layoutinfo from "./reducers/layoutinfo.js";
import canvasinfo from "./reducers/canvasinfo.js";
import canvasconfig from "./reducers/canvasconfig.js";
import breadcrumbs from "./reducers/breadcrumbs.js";
import palette from "./reducers/palette.js";
import notifications from "./reducers/notifications.js";
import notificationpanel from "./reducers/notificationpanel.js";
import externalpipelineflows from "./reducers/externalpipelineflows.js";
import tooltip from "./reducers/tooltip.js";
import canvastoolbar from "./reducers/canvastoolbar.js";
import contextmenu from "./reducers/contextmenu.js";
import rightflyout from "./reducers/rightflyout.js";
import LayoutDimensions from "../layout-dimensions.js";
import { ASSOC_STRAIGHT, LINK_SELECTION_NONE } from "../../common-canvas/constants/canvas-constants";

import { isEmpty } from "lodash";

export default class CanavasStore {
	constructor(emptyCanvasInfo) {
		// Put selectioninfo reducer first so selections are handled before
		// canvasinfo actions. Also, put layoutinfo reducer before canvasinfo
		// because node heights and width are calculated based on layoutinfo.
		var combinedReducer = combineReducers({
			selectioninfo,
			layoutinfo,
			canvasinfo,
			canvasconfig,
			breadcrumbs,
			palette,
			notifications,
			notificationpanel,
			externalpipelineflows,
			tooltip,
			canvastoolbar,
			contextmenu,
			rightflyout
		});

		const initialState = {
			selectioninfo: {},
			layoutinfo: this.getDefaultLayoutInfo(),
			canvasinfo: emptyCanvasInfo,
			canvasconfig: this.getDefaultCanvasConfig(),
			breadcrumbs: [{ pipelineId: emptyCanvasInfo.primary_pipeline, pipelineFlowId: emptyCanvasInfo.id }],
			palette: { content: {} }, // Don't initialize isOpen here, it must be done in CanvasController.setCanvasConfig based on paletteInitialState
			notifications: [],
			notificationpanel: { isOpen: false, config: {} },
			externalpipelineflows: [],
			tooltip: {},
			canvastoolbar: {},
			contextmenu: { menuDef: [] },
			rightflyout: {}
		};

		let enableDevTools = false;
		if (typeof window !== "undefined") {
			enableDevTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
		}

		this.store = createStore(combinedReducer, initialState, enableDevTools);
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
		return this.copyData(this.store.getState().palette);
	}

	getPaletteData() {
		return this.copyData(this.store.getState().palette.content);
	}

	getCanvasInfo() {
		return this.copyData(this.store.getState().canvasinfo);
	}

	getBreadcrumbs() {
		return this.copyData(this.store.getState().breadcrumbs);
	}

	getLayoutInfo() {
		return this.copyData(this.store.getState().layoutinfo);
	}

	getCanvasConfig() {
		// Canvas config cannot be copied because it may contain JSX objects
		// so create copy using Object.assign.
		return Object.assign({}, this.store.getState().canvasconfig);
	}

	getNodeLayout() {
		return this.copyData(this.store.getState().layoutinfo.nodeLayout);
	}

	getCanvasLayout() {
		return this.copyData(this.store.getState().layoutinfo.canvasLayout);
	}

	isTooltipOpen() {
		return !isEmpty(this.store.getState().tooltip);
	}

	getTooltip() {
		return this.copyData(this.store.getState().tooltip);
	}

	isRightFlyoutOpen() {
		return this.store.getState().rightflyout.isOpen;
	}

	getNotificationPanel() {
		return this.copyData(this.store.getState().notificationpanel);
	}

	getNotifications() {
		// Notification messages may contain JSX objects and a callback function
		// so create copy using Object.assign instead of this.copyData method.
		return this.store.getState().notifications.map((n, i) => Object.assign({}, n));
	}

	isNotificationPanelOpen() {
		return this.getNotificationPanel().isOpen;
	}

	getContextMenu() {
		return this.copyData(this.store.getState().contextmenu);
	}

	isContextMenuDisplayed() {
		return !isEmpty(this.store.getState().contextmenu.menuDef);
	}

	getSelectionInfo() {
		return this.copyData(this.store.getState().selectioninfo);
	}

	getExternalPipelineFlows() {
		return this.copyData(this.store.getState().externalpipelineflows);
	}

	getExternalPipelineFlow(url) {
		const epf = this.store.getState().externalpipelineflows.find((pf) => pf.url === url);
		if (epf) {
			return this.copyData(epf);
		}
		return null;
	}

	copyData(data) {
		return JSON.parse(JSON.stringify(data));
	}

	getDefaultLayoutInfo() {
		return Object.assign({}, LayoutDimensions.getLayout(this.getDefaultCanvasConfig()));
	}

	getDefaultCanvasConfig() {
		return {
			// Do not initialize paletteInitialState here. It needs to be undefined
			// for openPaletteIfNecessary to work.
			// TODO Remove this when paletteInitialState is removed from common-canvas.
			// paletteInitialState: false,
			enableInteractionType: "Mouse",
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Curve",
			enableLinkDirection: "LeftRight",
			enableParentClass: "",
			enableLinkSelection: LINK_SELECTION_NONE,
			enableLinkReplaceOnNewConnection: false,
			enableAssocLinkCreation: false,
			enableAssocLinkType: ASSOC_STRAIGHT,
			enableDragWithoutSelect: false,
			enableInternalObjectModel: true,
			enablePaletteLayout: "Flyout",
			enableToolbarLayout: "Top",
			enableInsertNodeDroppedOnLink: false,
			enableHighlightNodeOnNewLinkDrag: false,
			enableHighlightUnavailableNodes: false,
			enablePositionNodeOnRightFlyoutOpen: false,
			enableMoveNodesOnSupernodeResize: true,
			enableExternalPipelineFlows: true,
			enableDisplayFullLabelOnHover: false,
			enableDropZoneOnExternalDrag: false,
			enableRightFlyoutUnderToolbar: false,
			enablePanIntoViewOnOpen: false,
			enableZoomIntoSubFlows: false,
			enableBrowserEditMenu: true,
			enableAutoLinkOnlyFromSelNodes: false,
			enableSaveZoom: "None",
			enableSnapToGridType: "None",
			enableSnapToGridX: null,
			enableSnapToGridY: null,
			enableAutoLayoutVerticalSpacing: null,
			enableAutoLayoutHorizontalSpacing: null,
			enableBoundingRectangles: false,
			enableCanvasUnderlay: "None",
			enableSingleOutputPortDisplay: false,
			enableNarrowPalette: true,
			emptyCanvasContent: null,
			dropZoneCanvasContent: null,
			schemaValidation: false,
			enableCanvasLayout: {},
			enableNodeLayout: {},
			tipConfig: {
				"palette": true,
				"nodes": true,
				"ports": true,
				"links": true
			}
		};
	}
}
