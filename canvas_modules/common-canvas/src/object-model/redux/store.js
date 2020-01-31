/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
