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

import { combineReducers, createStore } from "redux";
import selectioninfo from "./reducers/selectioninfo.js";
import layoutinfo from "./reducers/layoutinfo.js";
import canvasinfo from "./reducers/canvasinfo.js";
import breadcrumbs from "./reducers/breadcrumbs.js";
import palette from "./reducers/palette.js";
import notifications from "./reducers/notifications.js";
import externalpipelineflows from "./reducers/externalpipelineflows.js";

export default class CanavasStore {
	constructor(emptyCanvasInfo) {
		// Put selectioninfo reducer first so selections are handled before
		// canvasinfo actions. Also, put layoutinfo reducer before canvasinfo
		// because node heights and width are calculated based on layoutinfo.
		var combinedReducer = combineReducers({ selectioninfo, layoutinfo, canvasinfo, breadcrumbs, palette, notifications, externalpipelineflows });

		const initialState = {
			selectioninfo: {},
			layoutinfo: {},
			canvasinfo: emptyCanvasInfo,
			breadcrumbs: [{ pipelineId: emptyCanvasInfo.primary_pipeline, pipelineFlowId: emptyCanvasInfo.id }],
			palette: {},
			notifications: [],
			externalpipelineflows: []
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

	getPaletteData() {
		return this.copyData(this.store.getState().palette);
	}

	getCanvasInfo() {
		return this.copyData(this.store.getState().canvasinfo);
	}

	getBreadcrumbs() {
		return this.copyData(this.store.getState().breadcrumbs);
	}

	getLayoutInfo() {
		return this.copyData(this.store.getState()).layoutinfo;
	}

	getNodeLayout() {
		return this.copyData(this.store.getState().layoutinfo.nodeLayout);
	}

	getCanvasLayout() {
		return this.copyData(this.store.getState().layoutinfo.canvasLayout);
	}

	getNotifications() {
		// Notification messages may contain JSX objects and a callback function
		// so create copy using Object.assign instead of this.copyData method.
		return this.store.getState().notifications.map((n, i) => Object.assign({}, n));
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
}
