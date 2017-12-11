/*
 * action types
 */

export const SET_PROPERTY_VALUES = "SET_PROPERTY_VALUES";
export const UPDATE_PROPERTY_VALUE = "UPDATE_PROPERTY_VALUE";
export const SET_CONTROL_STATES = "SET_CONTROL_STATES";
export const UPDATE_CONTROL_STATE = "UPDATE_CONTROL_STATE";
export const SET_ERROR_MESSAGES = "SET_ERROR_MESSAGES";
export const UPDATE_ERROR_MESSAGE = "UPDATE_ERROR_MESSAGE";
export const CLEAR_ERROR_MESSAGE = "CLEAR_ERROR_MESSAGE";


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

export function setErrorMessages(messages) {
	return { type: SET_ERROR_MESSAGES, messages };
}

export function updateErrorMessage(message) {
	return { type: UPDATE_ERROR_MESSAGE, message };
}
export function clearErrorMessage(message) {
	return { type: CLEAR_ERROR_MESSAGE, message };
}
