/*
 * action types
 */

export const SET_PROPERTY_VALUES = "SET_PROPERTY_VALUES";
export const UPDATE_PROPERTY_VALUE = "UPDATE_PROPERTY_VALUE";
export const SET_CONTROL_STATES = "SET_CONTROL_STATES";
export const UPDATE_CONTROL_STATE = "UPDATE_CONTROL_STATE";
export const SET_PANEL_STATES = "SET_PANEL_STATES";
export const UPDATE_PANEL_STATE = "UPDATE_PANEL_STATE";
export const SET_ERROR_MESSAGES = "SET_ERROR_MESSAGES";
export const UPDATE_ERROR_MESSAGE = "UPDATE_ERROR_MESSAGE";
export const CLEAR_ERROR_MESSAGE = "CLEAR_ERROR_MESSAGE";
export const SET_DATASET_METADATA = "SET_DATASET_METADATA";
export const UPDATE_SELECTED_ROWS = "UPDATE_SELECTED_ROWS";
export const CLEAR_SELECTED_ROWS = "CLEAR_SELECTED_ROWS";
export const SET_TITLE = "SET_TITLE";
export const SET_ACTIVE_TAB = "SET_ACTIVE_TAB";

/*
 * action creators
 */

export function setPropertyValues(properties) {
	return { type: SET_PROPERTY_VALUES, properties };
}

export function updatePropertyValue(property) {
	return { type: UPDATE_PROPERTY_VALUE, property };
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
