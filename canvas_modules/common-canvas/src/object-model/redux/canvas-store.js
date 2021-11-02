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
import { cloneDeep, isEmpty } from "lodash";

import ConfigUtils from "../config-utils.js";

import tooltip from "./reducers/tooltip.js";
import palette from "./reducers/palette.js";
import canvasinfo from "./reducers/canvasinfo.js";
import contextmenu from "./reducers/contextmenu.js";
import rightflyout from "./reducers/rightflyout.js";
import bottompanel from "./reducers/bottompanel.js";
import breadcrumbs from "./reducers/breadcrumbs.js";
import canvasconfig from "./reducers/canvasconfig.js";
import canvastoolbar from "./reducers/canvastoolbar.js";
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
			contextmenu,
			rightflyout,
			bottompanel
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
			contextmenu: { menuDef: [] },
			rightflyout: {},
			bottompanel: {}
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
		return cloneDeep(this.store.getState().palette);
	}

	getPaletteData() {
		return cloneDeep(this.store.getState().palette.content);
	}

	getCanvasInfo() {
		return cloneDeep(this.store.getState().canvasinfo);
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

	isRightFlyoutOpen() {
		return this.store.getState().rightflyout.isOpen;
	}

	isBottomPanelOpen() {
		return this.store.getState().bottompanel.isOpen;
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

	getContextMenu() {
		return this.cloneData(this.store.getState().contextmenu);
	}

	isContextMenuDisplayed() {
		return !isEmpty(this.store.getState().contextmenu.menuDef);
	}

	getSelectionInfo() {
		return this.cloneData(this.store.getState().selectioninfo);
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
