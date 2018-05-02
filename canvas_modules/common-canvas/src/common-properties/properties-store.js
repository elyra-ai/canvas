/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { createStore, combineReducers } from "redux";
import { setPropertyValues, updatePropertyValue } from "./actions";
import { setControlStates, updateControlState } from "./actions";
import { setPanelStates, updatePanelState } from "./actions";
import { clearSelectedRows, updateSelectedRows } from "./actions";
import { setErrorMessages, updateErrorMessage, clearErrorMessage } from "./actions";
import { setDatasetMetadata } from "./actions";
import { setTitle } from "./actions";
import propertiesReducer from "./reducers/properties";
import controlStatesReducer from "./reducers/control-states";
import panelStatesReducer from "./reducers/panel-states";
import errorMessagesReducer from "./reducers/error-messages";
import datasetMetadataReducer from "./reducers/dataset-metadata";
import rowSelectionsReducer from "./reducers/row-selections";
import componentMetadataReducer from "./reducers/component-metadata";
import PropertyUtils from "./util/property-utils.js";
import isEqual from "lodash/isEqual";
import { CONDITION_MESSAGE_TYPE } from "./constants/constants.js";

/* eslint max-depth: ["error", 6] */

export default class PropertiesStore {
	constructor() {
		this.combinedReducer = combineReducers({ propertiesReducer, controlStatesReducer, panelStatesReducer,
			errorMessagesReducer, datasetMetadataReducer, rowSelectionsReducer, componentMetadataReducer });
		this.store = createStore(this.combinedReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
	}

	dispatch(action) {
		this.store.dispatch(action);
	}
	subscribe(callback) {
		this.store.subscribe(callback);
	}
	getPropertyValue(propertyId) {
		const state = this.store.getState();
		const propValue = state.propertiesReducer[propertyId.name];
		if (typeof propertyId.row !== "undefined" && (typeof propValue !== "undefined" && propValue !== null)) {
			const rowValue = propValue[propertyId.row];
			if (typeof propertyId.col !== "undefined" && (typeof rowValue !== "undefined" && rowValue !== null)) {
				return rowValue[propertyId.col];
			}
			return rowValue;
		}
		return propValue;
	}
	getPropertyValues() {
		const state = this.store.getState();
		return PropertyUtils.copy(state.propertiesReducer);
	}
	setPropertyValues(values) {
		this.store.dispatch(setPropertyValues(values));
	}

	updatePropertyValue(propertyId, value) {
		this.store.dispatch(updatePropertyValue({ propertyId: propertyId, value: value }));
	}

	getControlState(propertyId) {
		if (typeof propertyId === "undefined") {
			return null;
		}
		const state = this.store.getState();
		let locState = state.controlStatesReducer[propertyId.name];
		// in a table return state of parent if set.
		if (locState && (locState.value === "hidden" || locState.value === "disabled")) {
			return locState.value;
		}

		// First check for control-level, then column level, and finally cell level property addressing
		const colId = typeof propertyId.col !== "undefined" ? propertyId.col.toString() : null;
		const rowId = typeof propertyId.row !== "undefined" ? propertyId.row.toString() : null;
		if (colId !== null && locState && locState[colId] &&
				(typeof locState[colId].value !== "undefined" || (locState[colId][rowId] &&
					typeof locState[colId][rowId].value !== "undefined"))) {
			// Column level state
			locState = locState[colId];
			if (rowId !== null && locState && locState[rowId] && typeof locState[rowId].value !== "undefined") {
				// Cell level state
				locState = locState[rowId];
			}
		}
		if (locState) {
			return locState.value;
		}
		return null;
	}

	getControlStates() {
		const state = this.store.getState();
		// get a copy and not direct reference
		return PropertyUtils.copy(state.controlStatesReducer);
	}

	setControlStates(values) {
		// check to see if values are equal before firing event
		if (!isEqual(this.getControlStates(), values)) {
			this.store.dispatch(setControlStates(values));
		}
	}

	updateControlState(propertyId, value) {
		this.store.dispatch(updateControlState({ propertyId: propertyId, value: value }));
	}

	getPanelState(panelId) {
		if (typeof panelId === "undefined") {
			return null;
		}
		const state = this.store.getState();
		const locState = state.panelStatesReducer[panelId.name];
		if (locState && locState.value) {
			return locState.value;
		}
		return null;
	}
	getPanelStates() {
		const state = this.store.getState();
		// get a copy and not direct reference
		return PropertyUtils.copy(state.panelStatesReducer);
	}
	setPanelStates(values) {
		// check to see if values are equal before firing event
		if (!isEqual(this.getPanelStates(), values)) {
			this.store.dispatch(setPanelStates(values));
		}
	}
	updatePanelState(panelId, value) {
		this.store.dispatch(updatePanelState({ panelId: panelId, value: value }));
	}

	/*
	* Retrieves filtered enumeration values for the given propertyId.
	*/
	getFilteredEnumItems(propertyId) {
		if (typeof propertyId === "undefined") {
			return null;
		}
		// First check for control-level, then column level, and finally cell level property addressing
		const state = this.store.getState();
		let locState = state.controlStatesReducer[propertyId.name];
		if (typeof propertyId.col !== "undefined" && locState && locState[propertyId.col.toString()]) {
			// Column level filtering
			locState = locState[propertyId.col.toString()];
			if (typeof propertyId.row !== "undefined" && locState[propertyId.row.toString()]) {
				// Cell level filtering
				locState = locState[propertyId.row.toString()];
			}
		}
		if (locState) {
			return locState.enumFilter;
		}
		return null;
	}

	/*
	* Returns the message for a propertyId.  Iterates over row and cell level messages
	* and returns the first error message it finds to show for a table. If no error,
	* returns the first warning message it finds
	*/
	getErrorMessage(propertyId) {
		if (typeof propertyId === "undefined") {
			return null;
		}
		const state = this.store.getState();
		let controlMsg = state.errorMessagesReducer[propertyId.name];
		if (typeof propertyId.row !== "undefined" && controlMsg) {
			controlMsg = controlMsg[propertyId.row.toString()];
			if (typeof propertyId.col !== "undefined" && controlMsg) {
				return controlMsg[propertyId.col.toString()]; // return cell message
			}
			if (controlMsg && controlMsg.text) {
				return { validation_id: controlMsg.validation_id, type: controlMsg.type, text: controlMsg.text }; // return row message
			}
		}
		if (controlMsg && controlMsg.text) {
			return { validation_id: controlMsg.validation_id, type: controlMsg.type, text: controlMsg.text }; // return prop message
		} else if (controlMsg) {
			// search message for param and return first error message found, else first warning
			let firstError = null;
			for (const rowKey in controlMsg) {
				if (!controlMsg.hasOwnProperty(rowKey)) {
					continue;
				}
				const rowMessage = controlMsg[rowKey];
				if (rowMessage && rowMessage.text) {
					firstError = { validation_id: rowMessage.validation_id, type: rowMessage.type, text: rowMessage.text }; // return row message
				} else if (rowMessage) { // table cell
					for (const colKey in rowMessage) {
						if (!rowMessage.hasOwnProperty(colKey)) {
							continue;
						}
						const colMessage = rowMessage[colKey];
						if (colMessage && colMessage.text) {
							firstError = { validation_id: colMessage.validation_id, type: colMessage.type, text: colMessage.text }; // return row message
						}

						if (colMessage.type === CONDITION_MESSAGE_TYPE.ERROR) {
							return firstError;
						}
					}
				}

				if (rowMessage.type === CONDITION_MESSAGE_TYPE.ERROR) {
					return firstError;
				}
			}
			return firstError;
		}
		return null;
	}
	getErrorMessages() {
		const state = this.store.getState();
		return PropertyUtils.copy(state.errorMessagesReducer);
	}
	setErrorMessages(values) {
		// check to see if values are equal before firing event
		if (!isEqual(this.getErrorMessages(), values)) {
			this.store.dispatch(setErrorMessages(values));
		}
	}
	updateErrorMessage(propertyId, value) {
		if (!isEqual(this.getErrorMessage(propertyId), value)) {
			this.store.dispatch(updateErrorMessage({ propertyId: propertyId, value: value }));
		}
	}
	clearErrorMessage(propertyId) {
		if (this.getErrorMessage(propertyId) !== null) {
			this.store.dispatch(clearErrorMessage({ propertyId: propertyId }));
		}
	}

	/*
	* DataModel methods
	*/
	setDatasetMetadata(datasetMetadata) {
		this.store.dispatch(setDatasetMetadata(datasetMetadata));
	}
	getDatasetMetadata() {
		const state = this.store.getState();
		return PropertyUtils.copy(state.datasetMetadataReducer);
	}

	/*
	* Row Selection Methods
	*/
	getSelectedRows(controlName) {
		const state = this.store.getState();
		if (typeof state.rowSelectionsReducer[controlName] === "undefined") {
			return [];
		}
		return state.rowSelectionsReducer[controlName];
	}

	updateSelectedRows(controlName, selection) {
		this.store.dispatch(updateSelectedRows({ name: controlName, selectedRows: selection }));
	}

	clearSelectedRows(controlName) {
		this.store.dispatch(clearSelectedRows({ name: controlName }));
	}

	setTitle(title) {
		this.store.dispatch(setTitle(title));
	}

	getTitle() {
		const state = this.store.getState();
		return state.componentMetadataReducer.title;
	}
}
