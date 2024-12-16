/*
 * Copyright 2017-2025 Elyra Authors
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

/*
 * action types
 */

export const SET_PROPERTY_VALUES = "SET_PROPERTY_VALUES";
export const UPDATE_PROPERTY_VALUE = "UPDATE_PROPERTY_VALUE";
export const REMOVE_PROPERTY_VALUE = "REMOVE_PROPERTY_VALUE";
export const SET_CONTROL_STATES = "SET_CONTROL_STATES";
export const UPDATE_CONTROL_STATE = "UPDATE_CONTROL_STATE";
export const SET_PANEL_STATES = "SET_PANEL_STATES";
export const UPDATE_PANEL_STATE = "UPDATE_PANEL_STATE";
export const SET_ACTION_STATES = "SET_ACTION_STATES";
export const UPDATE_ACTION_STATE = "UPDATE_ACTION_STATE";
export const SET_ERROR_MESSAGES = "SET_ERROR_MESSAGES";
export const UPDATE_ERROR_MESSAGE = "UPDATE_ERROR_MESSAGE";
export const CLEAR_ERROR_MESSAGE = "CLEAR_ERROR_MESSAGE";
export const SET_DATASET_METADATA = "SET_DATASET_METADATA";
export const UPDATE_SELECTED_ROWS = "UPDATE_SELECTED_ROWS";
export const CLEAR_SELECTED_ROWS = "CLEAR_SELECTED_ROWS";
export const SET_TITLE = "SET_TITLE";
export const SET_ACTIVE_TAB = "SET_ACTIVE_TAB";
export const DISABLE_ROW_MOVE_BUTTONS = "DISABLE_ROW_MOVE_BUTTONS";
export const SET_SAVE_BUTTON_DISABLE = "SET_SAVE_BUTTON_DISABLE";
export const SET_WIDE_FLYOUT_PRIMARY_BUTTON_DISABLED = "SET_WIDE_FLYOUT_PRIMARY_BUTTON_DISABLED";
export const SET_ADD_REMOVE_ROWS = "SET_ADD_REMOVE_ROWS";
export const UPDATE_STATIC_ROWS = "UPDATE_STATIC_ROWS";
export const CLEAR_STATIC_ROWS = "CLEAR_STATIC_ROWS";
export const SET_TABLE_BUTTON_ENABLED = "SET_TABLE_BUTTON_ENABLED";
export const SET_HIDE_EDIT_BUTTON = "SET_HIDE_EDIT_BUTTON";
export const SET_ACTIVE_TEARSHEET = "SET_ACTIVE_TEARSHEET";


/*
 * action creators
 */
export function setHideEditButton(disableState) {
	return { type: SET_HIDE_EDIT_BUTTON, info: disableState };
}

export function setPropertyValues(properties) {
	return { type: SET_PROPERTY_VALUES, properties };
}

export function updatePropertyValue(property) {
	return { type: UPDATE_PROPERTY_VALUE, property };
}

export function removePropertyValue(property) {
	return { type: REMOVE_PROPERTY_VALUE, property };
}


export function setControlStates(states) {
	return { type: SET_CONTROL_STATES, states };
}

export function updateControlState(state) {
	return { type: UPDATE_CONTROL_STATE, state };
}

export function setPanelStates(states) {
	return { type: SET_PANEL_STATES, states };
}

export function updatePanelState(state) {
	return { type: UPDATE_PANEL_STATE, state };
}

export function setActionStates(states) {
	return { type: SET_ACTION_STATES, states };
}

export function updateActionState(state) {
	return { type: UPDATE_ACTION_STATE, state };
}


export function setErrorMessages(messages) {
	return { type: SET_ERROR_MESSAGES, messages };
}

export function updateErrorMessage(message) {
	return { type: UPDATE_ERROR_MESSAGE, message };
}

export function clearErrorMessage(message) {
	return { type: CLEAR_ERROR_MESSAGE, message };
}

export function setDatasetMetadata(datasetMetadata) {
	return { type: SET_DATASET_METADATA, datasetMetadata };
}

export function updateSelectedRows(info) {
	return { type: UPDATE_SELECTED_ROWS, info };
}

export function clearSelectedRows(info) {
	return { type: CLEAR_SELECTED_ROWS, info };
}

export function setTitle(title) {
	return { type: SET_TITLE, title };
}

export function setActiveTab(activeTab) {
	return { type: SET_ACTIVE_TAB, activeTab };
}

export function disableRowMoveButtons(propertyIds) {
	return { type: DISABLE_ROW_MOVE_BUTTONS, propertyIds };
}

export function setSaveButtonDisable(disableState) {
	return { type: SET_SAVE_BUTTON_DISABLE, disableState };
}

export function setWideFlyoutPrimaryButtonDisabled(info) {
	return { type: SET_WIDE_FLYOUT_PRIMARY_BUTTON_DISABLED, info };
}

export function setAddRemoveRows(info) {
	return { type: SET_ADD_REMOVE_ROWS, info };
}

export function updateStaticRows(info) {
	return { type: UPDATE_STATIC_ROWS, info };
}

export function clearStaticRows(info) {
	return { type: CLEAR_STATIC_ROWS, info };
}

export function setTableButtonEnabled(info) {
	return { type: SET_TABLE_BUTTON_ENABLED, info };
}

export function setTearsheetState(tearsheetId) {
	return { type: SET_ACTIVE_TEARSHEET, tearsheetId };
}
