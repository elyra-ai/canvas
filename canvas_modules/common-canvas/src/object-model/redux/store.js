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

import { combineReducers, createStore } from "redux";
import selectioninfo from "./reducers/selectioninfo.js";
import layoutinfo from "./reducers/layoutinfo.js";
import canvasinfo from "./reducers/canvasinfo.js";
import breadcrumbs from "./reducers/breadcrumbs.js";
import palette from "./reducers/palette.js";
import notifications from "./reducers/notifications.js";

var store;

export function createCCStore(emptyCanvasInfo) {

	// Put selectioninfo reducer first so selections are handled before
	// canvasinfo actions. Also, put layoutinfo reducer before canvasinfo
	// because node heights and width are calculated based on layoutinfo.
	var combinedReducer = combineReducers({ selectioninfo, layoutinfo, canvasinfo, breadcrumbs, palette, notifications });

	const initialState = {
		selectioninfo: {},
		layoutinfo: {},
		canvasinfo: emptyCanvasInfo,
		breadcrumbs: [{ pipelineId: emptyCanvasInfo.primary_pipeline, pipelineFlowId: emptyCanvasInfo.id }],
		palette: {},
		notifications: []
	};

	let enableDevTools = false;
	if (typeof window !== "undefined") {
		enableDevTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
	}

	store = createStore(combinedReducer, initialState, enableDevTools);
	return store;
}

export function getStore() {
	return store;
}
