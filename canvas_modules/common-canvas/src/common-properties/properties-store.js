/*
 * Copyright 2017-2022 Elyra Authors
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

import { createStore, combineReducers } from "redux";
import { has, get, isEqual, cloneDeep } from "lodash";

import { setPropertyValues, updatePropertyValue, removePropertyValue } from "./actions";
import { setControlStates, updateControlState } from "./actions";
import { setPanelStates, updatePanelState } from "./actions";
import { setActionStates, updateActionState } from "./actions";

import { clearSelectedRows, updateSelectedRows, disableRowMoveButtons } from "./actions";
import { clearStaticRows, updateStaticRows } from "./actions";
import { setErrorMessages, updateErrorMessage, clearErrorMessage } from "./actions";
import { setDatasetMetadata, setSaveButtonDisable, setWideFlyoutPrimaryButtonDisabled, setAddRemoveRows, setTableButtonEnabled, setHideEditButton } from "./actions";
import { setTitle, setActiveTab } from "./actions";
import propertiesReducer from "./reducers/properties";
import controlStatesReducer from "./reducers/control-states";
import panelStatesReducer from "./reducers/panel-states";
import actionStatesReducer from "./reducers/action-states";
import errorMessagesReducer from "./reducers/error-messages";
import datasetMetadataReducer from "./reducers/dataset-metadata";
import rowSelectionsReducer from "./reducers/row-selections";
import rowFreezeReducer from "./reducers/row-static";
import componentMetadataReducer from "./reducers/component-metadata";
import disableRowMoveButtonsReducer from "./reducers/disable-row-move-buttons";
import saveButtonDisableReducer from "./reducers/save-button-disable";
import wideFlyoutPrimaryButtonDisableReducer from "./reducers/wide-flyout-primary-button-disable";
import propertiesSettingsReducer from "./reducers/properties-settings";
import * as PropertyUtils from "./util/property-utils.js";
import { CONDITION_MESSAGE_TYPE, MESSAGE_KEYS } from "./constants/constants.js";

/* eslint max-depth: ["error", 6] */

export default class PropertiesStore {
	constructor() {
		this.combinedReducer = combineReducers({ propertiesReducer, controlStatesReducer, panelStatesReducer,
			errorMessagesReducer, datasetMetadataReducer, rowSelectionsReducer, componentMetadataReducer,
			disableRowMoveButtonsReducer, actionStatesReducer, saveButtonDisableReducer, wideFlyoutPrimaryButtonDisableReducer, propertiesSettingsReducer, rowFreezeReducer });
		let enableDevTools = false;
		if (typeof window !== "undefined") {
			enableDevTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
		}
		this.store = createStore(this.combinedReducer, enableDevTools);
	}

	dispatch(action) {
		this.store.dispatch(action);
	}

	getStore() {
		return this.store;
	}
	subscribe(callback) {
		this.store.subscribe(callback);
	}

	getPropertyValue(propertyId) {
		const state = this.store.getState();
		const propValue = state.propertiesReducer[propertyId.name];
		return this.getNestedPropertyValue(propertyId, propValue);
	}

	getNestedPropertyValue(propertyId, propValue) {
		if (typeof propertyId.row !== "undefined" && (typeof propValue !== "undefined" && propValue !== null)) {
			const rowValue = propValue[propertyId.row];
			if (typeof propertyId.col !== "undefined" && (typeof rowValue !== "undefined" && rowValue !== null) && Array.isArray(rowValue)) {
				if (typeof propertyId.index !== "undefined") {
					return rowValue[propertyId.col][propertyId.index];
				}

				if (typeof propertyId.propertyId !== "undefined") {
					return this.getNestedPropertyValue(propertyId.propertyId, rowValue[propertyId.col]);
				}
				return rowValue[propertyId.col];
			}
			if (typeof propertyId.propertyId !== "undefined") { // nested structureeditor
				return this.getNestedPropertyValue(propertyId.propertyId, rowValue);
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

	removePropertyValue(propertyId) {
		this.store.dispatch(removePropertyValue({ propertyId: propertyId }));
	}

	getControlState(propertyId) {
		if (typeof propertyId === "undefined") {
			return null;
		}
		const state = this.store.getState();
		let locState = state.controlStatesReducer[propertyId.name];
		// in a table return state of parent if set.
		if (locState && (locState.value === "hidden" || locState.value === "disabled")) {
			return locState;
		}

		// First check for control-level, then column level, and finally cell level property addressing
		const colId = typeof propertyId.col !== "undefined" ? propertyId.col.toString() : null;
		const rowId = typeof propertyId.row !== "undefined" ? propertyId.row.toString() : null;
		if (colId !== null && locState && locState[colId] &&
				(typeof locState[colId].value !== "undefined" || (locState[colId][rowId] &&
					(typeof locState[colId][rowId].value !== "undefined" ||
						typeof locState[colId][rowId].values !== "undefined")))) {
			// Column level state
			locState = locState[colId];
			if (rowId !== null && locState && locState[rowId] &&
				(typeof locState[rowId].value !== "undefined" || typeof locState[rowId].values !== "undefined")) {
				// Cell level state
				locState = locState[rowId];
			}
		}
		if (locState) {
			return locState;
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

	getActionState(actionId) {
		if (typeof actionId === "undefined") {
			return null;
		}
		const state = this.store.getState();
		const locState = state.actionStatesReducer[actionId.name];
		if (locState && locState.value) {
			return locState.value;
		}
		return null;
	}
	getActionStates() {
		const state = this.store.getState();
		// get a copy and not direct reference
		return PropertyUtils.copy(state.actionStatesReducer);
	}
	setActionStates(values) {
		// check to see if values are equal before firing event
		if (!isEqual(this.getActionStates(), values)) {
			this.store.dispatch(setActionStates(values));
		}
	}
	updateActionState(actionId, value) {
		this.store.dispatch(updateActionState({ actionId: actionId, value: value }));
	}

	setSaveButtonDisable(disableState) {
		this.store.dispatch(setSaveButtonDisable(disableState));
	}

	getSaveButtonDisable() {
		const state = this.store.getState();
		return state.saveButtonDisableReducer.disable;
	}

	setWideFlyoutPrimaryButtonDisabled(panelId, disableState) {
		this.store.dispatch(setWideFlyoutPrimaryButtonDisabled({ panelId: panelId, disableState: disableState }));
	}

	getWideFlyoutPrimaryButtonDisabled(panelId) {
		if (typeof panelId === "undefined") {
			return null;
		}
		const state = this.store.getState();
		const disablePrimaryButtonForPanel = state.wideFlyoutPrimaryButtonDisableReducer[panelId.name];
		if (typeof disablePrimaryButtonForPanel !== "undefined") {
			return disablePrimaryButtonForPanel;
		}
		return null;
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
	* and returns an error message summary for all cell level errors.
	*/
	getErrorMessage(propertyId, intl) {
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
				return controlMsg;
			}
		}
		let controlMessage = null;
		let returnMessage = null;
		if (controlMsg && controlMsg.text) { // save the control level message
			controlMessage = controlMsg;
		}
		if (controlMsg) {
			const clonedControlMsg = cloneDeep(controlMsg); // Prevent modifying state directly
			returnMessage = this._getTableCellErrors(clonedControlMsg, intl);
		}
		if (controlMessage !== null && returnMessage !== null) {
			controlMessage.text = controlMessage.text + " " + returnMessage.text;
		} else if (controlMessage === null) {
			controlMessage = returnMessage;
		}
		return controlMessage;
	}

	// get the table cell level error messages. if more than one cell is in error, return summary message;
	_getTableCellErrors(controlMsg, intl) {
		let returnMessage = null;
		let errorMsgCount = 0;
		let warningMsgCount = 0;
		// search message for param and return first error message found, else first warning
		for (const rowKey in controlMsg) {
			if (!has(controlMsg, rowKey)) {
				continue;
			}
			if (rowKey === "text") {
				continue;
			}
			const rowMessage = controlMsg[rowKey];
			if (rowMessage && rowMessage.text) {
				returnMessage = rowMessage;
				errorMsgCount += (rowMessage.type === CONDITION_MESSAGE_TYPE.ERROR) ? 1 : 0;
				warningMsgCount += (rowMessage.type === CONDITION_MESSAGE_TYPE.WARNING) ? 1 : 0;
			}
			if (rowMessage) { // table cell
				for (const colKey in rowMessage) {
					if (!has(rowMessage, colKey)) {
						continue;
					}
					if (colKey === "text") {
						continue;
					}
					const colMessage = rowMessage[colKey];
					if (colMessage && colMessage.text) {
						returnMessage = colMessage;
						errorMsgCount += (colMessage.type === CONDITION_MESSAGE_TYPE.ERROR) ? 1 : 0;
						warningMsgCount += (colMessage.type === CONDITION_MESSAGE_TYPE.WARNING) ? 1 : 0;
					}
				}
			}
		}
		if ((errorMsgCount + warningMsgCount) !== 1 && returnMessage) {
			returnMessage.type = (errorMsgCount > 0) ? CONDITION_MESSAGE_TYPE.ERROR : CONDITION_MESSAGE_TYPE.WARNING;
			returnMessage.text = (errorMsgCount > 0)
				? PropertyUtils.formatMessage(intl,
					MESSAGE_KEYS.TABLE_SUMMARY_ERROR, { errorMsgCount: errorMsgCount })
				: "";
			returnMessage.text += (warningMsgCount > 0)
				? PropertyUtils.formatMessage(intl,
					MESSAGE_KEYS.TABLE_SUMMARY_WARNING, { warningMsgCount: warningMsgCount })
				: "";
		}
		return returnMessage;
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
		return state.datasetMetadataReducer;
	}

	/*
	* Row Selection Methods
	*/
	getSelectedRows(propertyId) {
		if (typeof propertyId === "undefined") {
			return [];
		}
		const state = this.store.getState();
		let rowSelections = state.rowSelectionsReducer[propertyId.name];
		if (Number.isInteger(propertyId.row) && rowSelections) {
			rowSelections = rowSelections[String(propertyId.row)]; // row selection
			if (Number.isInteger(propertyId.col) && rowSelections) {
				rowSelections = rowSelections[String(propertyId.col)]; // cell selection
			}
		}
		return rowSelections && rowSelections.selectedRows ? rowSelections.selectedRows : [];
	}

	updateSelectedRows(propertyId, selection) {
		this.store.dispatch(updateSelectedRows({ propertyId: propertyId, selectedRows: selection }));
	}

	clearSelectedRows(propertyId) {
		this.store.dispatch(clearSelectedRows({ propertyId: propertyId }));
	}

	getStaticRows(propertyId) {
		if (typeof propertyId === "undefined") {
			return [];
		}
		const state = this.store.getState();
		let rowStatic = state.rowFreezeReducer[propertyId.name];
		if (Number.isInteger(propertyId.row) && rowStatic) {
			rowStatic = rowStatic[String(propertyId.row)]; // row selection
			if (Number.isInteger(propertyId.col) && rowStatic) {
				rowStatic = rowStatic[String(propertyId.col)]; // cell selection
			}
		}
		return rowStatic && rowStatic.staticRows ? rowStatic.staticRows : [];
	}

	updateStaticRows(propertyId, staticRows) {
		this.store.dispatch(updateStaticRows({ propertyId: propertyId, staticRows: staticRows }));
	}

	clearStaticRows(propertyId) {
		this.store.dispatch(clearStaticRows({ propertyId: propertyId }));
	}

	/**
	 * Disable table row move buttons for all propertyIds in given array
	 * @param propertyIds Array of propertyIds
	 */
	setDisableRowMoveButtons(propertyIds) {
		this.store.dispatch(disableRowMoveButtons(propertyIds));
	}

	getDisableRowMoveButtons() {
		const state = this.store.getState();
		return state.disableRowMoveButtonsReducer.propertyIds;
	}

	setTitle(title) {
		this.store.dispatch(setTitle(title));
	}

	getTitle() {
		const state = this.store.getState();
		return state.componentMetadataReducer.title;
	}

	setActiveTab(activeTab) {
		this.store.dispatch(setActiveTab(activeTab));
	}

	getActiveTab() {
		const state = this.store.getState();
		return state.componentMetadataReducer.activeTab;
	}

	/**
	* Set the addRemoveRows attribute to 'enabled' for the given propertyId
	* @param propertyId The unique property identifier
	* @param enabled boolean value to enable or disable addRemoveRows
	*/
	setAddRemoveRows(propertyId, enabled) {
		this.store.dispatch(setAddRemoveRows({ propertyId: propertyId, value: enabled }));
	}

	/**
	* Returns true if addRemoveRows is enabled for the given propertyID
	* @param propertyId The unique property identifier
	* @return boolean
	*/
	getAddRemoveRows(propertyId) {
		const state = this.store.getState();
		const defaultValue = true; // Default to true to show the addRemoveRows buttons
		if (state.propertiesSettingsReducer[propertyId.name]) {
			if (typeof propertyId.row !== "undefined") {
				return getNestedPropertySetting(propertyId, state.propertiesSettingsReducer[propertyId.name], "addRemoveRows", defaultValue);
			}
			return state.propertiesSettingsReducer[propertyId.name].addRemoveRows;
		}
		return defaultValue;
	}

	setTableButtonEnabled(propertyId, buttonId, enabled) {
		this.store.dispatch(setTableButtonEnabled({ propertyId: propertyId, buttonId: buttonId, value: enabled }));
	}

	getTableButtons(propertyId) {
		const state = this.store.getState();
		const defaultValue = {};
		if (state.propertiesSettingsReducer[propertyId.name]) {
			if (typeof propertyId.row !== "undefined") {
				return getNestedPropertySetting(propertyId, state.propertiesSettingsReducer[propertyId.name], "tableButtons", defaultValue);
			}
			return state.propertiesSettingsReducer[propertyId.name].tableButtons || defaultValue;
		}
		return defaultValue;
	}

	getTableButtonEnabled(propertyId, buttonId) {
		const state = this.store.getState();
		const defaultValue = false; // Disable button by default
		if (state.propertiesSettingsReducer[propertyId.name]) {
			if (typeof propertyId.row !== "undefined") {
				return getNestedPropertySetting(propertyId, state.propertiesSettingsReducer[propertyId.name], `tableButtons.${buttonId}`, defaultValue);
			}
			return state.propertiesSettingsReducer[propertyId.name].tableButtons[buttonId];
		}
		return defaultValue;
	}

	/**
	* Set the hideEditButton attribute to 'true' for the given propertyId
	* @param propertyId The unique property identifier
	* @param enabled boolean value for disable or enable edit button by state hideEditButton
	*/
	setHideEditButton(propertyId, enabled) {
		this.store.dispatch(setHideEditButton({ propertyId: propertyId, value: enabled }));
	}

	/**
	* Returns true if hideEditButton is true for the given propertyID
	* @param propertyId The unique property identifier
	* @return boolean
	*/
	getHideEditButton(propertyId) {
		const state = this.store.getState();
		const defaultValue = false; // Default to false to show disable edit buttons
		if (state.propertiesSettingsReducer[propertyId.name]) {
			if (typeof propertyId.row !== "undefined") {
				return getNestedPropertySetting(propertyId, state.propertiesSettingsReducer[propertyId.name], "hideEditButton", defaultValue);
			}
			return state.propertiesSettingsReducer[propertyId.name].hideEditButton;
		}
		return defaultValue;
	}
}

function getNestedPropertySetting(propertyId, state, setting, defaultValue) {
	if (typeof propertyId.row !== "undefined" && state[propertyId.row]) {
		if (typeof propertyId.col !== "undefined" && state[propertyId.row][propertyId.col]) {
			if (typeof propertyId.propertyId !== "undefined") {
				return getNestedPropertySetting(propertyId.propertyId, state[propertyId.row][propertyId.col], setting, defaultValue);
			}
			return get(state[propertyId.row][propertyId.col], setting);
		} else if (typeof propertyId.propertyId !== "undefined") { // nested structureeditor
			return getNestedPropertySetting(propertyId.propertyId, state[propertyId.row], setting, defaultValue);
		}
		return get(state[propertyId.row], setting);
	}
	return defaultValue;
}
