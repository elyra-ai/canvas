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
/*	eslint max-depth: ["error", 10]*/

import logger from "../../../utils/logger";
import * as UiConditions from "./ui-conditions";
import { formatMessage } from "../util/property-utils";
import { DEFAULT_VALIDATION_MESSAGE, STATES, PANEL_TREE_ROOT,
	CONDITION_TYPE, CONDITION_DEFINITION_INDEX,
	MESSAGE_KEYS
} from "../constants/constants";
import { isEmpty, cloneDeep, has, union, isEqual } from "lodash";
import seedrandom from "seedrandom";
import { getDateTimeFormat } from "../util/control-utils";


// ========= APIs ==================
// ========= Validate all properties

/**
* This function will get all controls and validate each properties value.
*
* @param {object} properties controller. required
* @param {boolean} showErrors. optional. Set to false to run conditions without displaying errors in the UI
*/
function validatePropertiesValues(controller, showErrors = true) {
	const controls = controller.getControls();
	validatePropertiesListValues(controller, controls, showErrors);
}

/**
* This function will get all controls and validate each one for visible,
* enables and filteredEnum.
*
* @param {object} properties controller. required
*/
function validatePropertiesConditions(controller) {
	const newStates = {
		controls: controller.getControlStates(),
		panels: controller.getPanelStates(),
		actions: controller.getActionStates()
	};

	const controls = controller.getControls();
	validatePropertiesListConditions(controller, controls, newStates);
	// propagate parent panel states
	_propagateParentPanelStates(controller.panelTree, newStates, PANEL_TREE_ROOT);

	// get property values before any states have been updated
	const prevPropertyValues = _getConditionPropertyValues(controller);

	controller.setControlStates(newStates.controls);
	controller.setPanelStates(newStates.panels);
	controller.setActionStates(newStates.actions);
	// get property values before any states have been updated
	const newPropertyValues = _getConditionPropertyValues(controller);
	// compared values to see if any values change based on state updates
	const updatedPropertyIds = _comparePropertyValues(prevPropertyValues, newPropertyValues);
	for (const updatePropertyId of updatedPropertyIds) {
		validateConditions(updatePropertyId, controller, 1);
	}
}

// ========= Validate a list of properties

/**
* This function will take a list of controls or properties names
* and validate each properties value.
*
* @param {object} properties controller. required
* @param {object} list of control objects or properties. required
* @param {boolean} showErrors. optional. Set to false to run conditions without displaying errors in the UI
*/
function validatePropertiesListValues(controller, controls, showErrors) {
	if (Object.keys(controls).length > 0) {
		for (const controlKey in controls) {
			if (!has(controls, controlKey)) {
				continue;
			}
			const control = controls[controlKey];
			// control is a subcontrol
			if (control.parameterName) {
				continue;
			}
			const propertyId = control.name ? { name: control.name } : { name: control };
			validateInput(propertyId, controller, showErrors);
		}
	}
}

/**
* This function will take a list of controls or properties names
* and validate each properties for visible, enabled or filteredEnum.
*
* @param {object} properties controller. required
* @param {object} list of control objects or properties. required
* @param {object} list of states for controls and panels. required
*/
function validatePropertiesListConditions(controller, controls, newStates) {
	if (Object.keys(controls).length > 0) {
		for (const controlKey in controls) {
			if (!has(controls, controlKey)) {
				continue;
			}
			const control = controls[controlKey];
			// control is a subcontrol
			if (control.parameterName) {
				continue;
			}
			const propertyId = control.name ? { name: control.name } : { name: control };
			const controlValue = controller.getPropertyValue(propertyId);
			if (control.subControls) {
				if (control.valueDef.isList || control.valueDef.isMap) {
					// validate the table as a whole
					_validateConditionsByType(propertyId, newStates, controller);
					// validate each cell
					if (Array.isArray(controlValue)) {
						for (let rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
							for (let colIndex = 0; colIndex < control.subControls.length; colIndex++) {
								propertyId.row = rowIndex;
								propertyId.col = colIndex;
								_validateConditionsByType(propertyId, newStates, controller);
							}
						}
					}
				} else {
					// An 'unrolled' structure not within a table
					const subPropId = {
						name: propertyId.name
					};
					for (let colIndex = 0; colIndex < control.subControls.length; colIndex++) {
						subPropId.col = colIndex;
						_validateConditionsByType(subPropId, newStates, controller);
					}
				}
			} else {
				_validateConditionsByType(propertyId, newStates, controller);
			}
		}
	}
}

// ========= Validate a single property

/**
* This function will validate a single properties value.
* If the propertyId is a table it will also validate each cell in the table
*
* @param {object} propertyId. required
* @param {object} properties controller. required
* @param {boolean} showErrors. optional. Set to false to run conditions without displaying errors in the UI
*/
function validateInput(inPropertyId, controller, showErrors = true) {
	const control = controller.getControl(inPropertyId);
	if (!control) {
		logger.warn("Control not found for " + inPropertyId.name);
		return;
	}
	const propertyId = cloneDeep(inPropertyId);
	const controlValue = controller.getPropertyValue(propertyId);
	if (Array.isArray(controlValue)) {
	// validate the table as a whole
		_validateInput(propertyId, controller, control, showErrors);
		// validate each cell
		if (control.subControls) {
			if (control.valueDef.isList || control.valueDef.isMap) {
				// Handle tables
				for (let rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
					for (let colIndex = 0; colIndex < control.subControls.length; colIndex++) {
						propertyId.row = rowIndex;
						propertyId.col = colIndex;
						_validateInput(propertyId, controller, control.subControls[colIndex], showErrors);
					}
				}
			} else {
				// Handle 'unrolled' structs outside of tables
				for (let colIndex = 0; colIndex < control.subControls.length; colIndex++) {
					const subPropId = {
						name: inPropertyId.name,
						col: colIndex
					};
					_validateInput(subPropId, controller, control.subControls[colIndex], showErrors);
				}
			}
		} else if (typeof propertyId.row === "undefined") { // validate each row in array for controls that are not within a table.
			for (let rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				propertyId.row = rowIndex;
				propertyId.col = 0;
				_validateInput(propertyId, controller, control, showErrors);
			}
		} else if (typeof propertyId.row !== "undefined" && control.controlType === "selectcolumns") { // validate each row in the array within a table.
			for (let rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				const newNestedPropertyId = {};
				newNestedPropertyId.row = rowIndex;
				propertyId.propertyId = newNestedPropertyId;
				_validateInput(propertyId, controller, control, showErrors);
			}
		}

	} else {
		_validateInput(propertyId, controller, control, showErrors);
	}
}

/**
* This function will validate a single properties for visible, enabled and
* filteredEnum.
*
* @param {object} propertyId. required
* @param {object} properties controller. required
* @param {int} runCount. Used to prevent an infinite loop of rerun conditions
*/
function validateConditions(inPropertyId, controller, runCount = 0) {
	const control = controller.getControl(inPropertyId);
	if (!control) {
		logger.warn("Control not found for " + inPropertyId.name);
		return;
	}
	const newStates = {
		controls: controller.getControlStates(),
		panels: controller.getPanelStates(),
		actions: controller.getActionStates()
	};
	const propertyId = cloneDeep(inPropertyId);
	const controlValue = controller.getPropertyValue(propertyId);
	if (Array.isArray(controlValue) && control.subControls) {
		if (!(control.valueDef.isList || control.valueDef.isMap)) {
			// An unrolled structure on a panel (e.g. not a row in a table)
			for (let colIndex = 0; colIndex < control.subControls.length; colIndex++) {
				propertyId.col = colIndex;
				_validateConditionsByType(propertyId, newStates, controller);
			}
		} else {
			// validate the table as a whole
			_validateConditionsByType(propertyId, newStates, controller);
			// validate each cell
			for (let rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				for (let colIndex = 0; colIndex < control.subControls.length; colIndex++) {
					propertyId.row = rowIndex;
					propertyId.col = colIndex;
					_validateConditionsByType(propertyId, newStates, controller);
				}
			}
		}
	} else {
		_validateConditionsByType(propertyId, newStates, controller);
	}
	// get property values before any states have been updated
	const prevPropertyValues = _getConditionPropertyValues(controller);

	controller.setControlStates(newStates.controls);
	controller.setPanelStates(newStates.panels);
	controller.setActionStates(newStates.actions);

	// get property values before any states have been updated
	const newPropertyValues = _getConditionPropertyValues(controller);
	// compared values to see if any values change based on state updates
	const updatedPropertyIds = _comparePropertyValues(prevPropertyValues, newPropertyValues, runCount);
	// rerun validation on controls where value changes based on state updates
	for (const updatePropertyId of updatedPropertyIds) {
		validateConditions(updatePropertyId, controller, runCount + 1);
	}
	if (runCount > 0) {
		// need to make sure all children of panels get correct states after rerun
		_propagateParentPanelStates(controller.panelTree, newStates, PANEL_TREE_ROOT);
	}
}

function _comparePropertyValues(prevPropertyValues, newPropertyValues, runCount) {
	const updatePropertyIds = [];
	if (runCount > 10) { // stop at top reruns.  After this it's most likely an infinite loop
		logger.warn("More than 10 iteration of processing conditions found. Check your conditions for loops. Updated properties: " + JSON.stringify(newPropertyValues));
		return [];
	}
	const keys = union(Object.keys(prevPropertyValues), Object.keys(newPropertyValues));
	for (const key of keys) {
		const prevPropertyValue = prevPropertyValues[key];
		const newPropertyValue = newPropertyValues[key];
		if (!isEqual(prevPropertyValue, newPropertyValue)) {
			updatePropertyIds.push({ name: key });
		}
	}
	return updatePropertyIds;
}

function _getConditionPropertyValues(controller) {
	const propertiesConfig = controller.getPropertiesConfig();
	const options = {};
	if (propertiesConfig.conditionDisabledPropertyHandling === "null") {
		options.filterDisabled = true;
	}
	if (propertiesConfig.conditionHiddenPropertyHandling === "null") {
		options.filterHidden = true;
	}
	if (isEmpty(options)) {
		return {};
	}
	return controller.getPropertyValues(options);
}

/**
* This function will validate a single properties for allow_change.
*
* @param {object} propertyId. required
* @param {object} properties controller. required
*/
function allowConditions(inPropertyId, controller) {
	let result = true;
	const control = controller.getControl(inPropertyId);
	if (!control) {
		logger.warn("Control not found for " + inPropertyId.name);
		return result;
	}
	const allowValidations = controller.getDefinitions(inPropertyId, CONDITION_TYPE.ALLOWCHANGE, CONDITION_DEFINITION_INDEX.CONTROLS);
	if (allowValidations.length > 0) {
		try {
			for (const validation of allowValidations) {
				result = UiConditions.validateInput(validation.definition, inPropertyId, controller);
				if (!result) {
					return result;
				}
			}
		} catch (error) {
			logger.warn("Error thrown in validation: " + error);
		}
	}
	return result;
}

/**
* Set default value for a field if conditions evaluate to true.
* This function sets parameter_ref and default value in conditionalDefaultValues object using pass-by-reference.
* Return value is never used anywhere. Calling function works on the updated conditionalDefaultValues object.
*
* @param {object} propertyId. required
* @param {object} properties controller. required
* @param {object} conditionalDefaultValues. required
*/
function setConditionalDefaultValue(inPropertyId, controller, conditionalDefaultValues) {
	const control = controller.getControl(inPropertyId);
	if (!control) {
		logger.warn("Control not found for " + inPropertyId.name);
		return null;
	}
	const validations = controller.getDefinitions(inPropertyId, CONDITION_TYPE.CONDITIONALDEFAULT, CONDITION_DEFINITION_INDEX.CONTROLS);
	if (validations.length > 0) {
		try {
			for (const validation of validations) {
				const parameterRef = validation.definition.default_value.parameter_ref;
				//  For a given parameter_ref, only the first default_value condition is used.
				if (!(parameterRef in conditionalDefaultValues)) {
					const result = UiConditions.validateInput(validation.definition, inPropertyId, controller);
					if (result) {
						// Condition evaluate to true
						conditionalDefaultValues[parameterRef] = validation.definition.default_value.value;
					}
				}
			}
		} catch (error) {
			logger.warn("Error thrown in validation: " + error);
		}
	}
	return null;
}

/**
* Filters the datamodel fields for the given parameter.
*
* @param {object} propertyId. required
* @param {object} list of filter definitions. required.
* @param {object} properties controller. required
* @param {object} list of fields to filter. required
* @return {object} list of filtered fields
*/
function filterConditions(propertyId, filterDefinitions, controller, fields) {
	// Check each definition
	let returnFields = fields;
	if (filterDefinitions && Array.isArray(filterDefinitions[propertyId.name])) {
		try {
			const defs = filterDefinitions[propertyId.name];
			for (let i = 0; i < defs.length; i++) {
				returnFields = UiConditions.filter(propertyId, filterDefinitions[propertyId.name][i].definition, controller, returnFields);
			}
		} catch (error) {
			logger.warn("Error thrown in filter for propertyId (" + propertyId.name + "): " + error);
		}
	}
	return returnFields;
}

// ========= miscellanious APIs

/**
* Takes an array of panel IDs and updates the states of the children of
* the panels identified by those IDs to be the same as the states of the panels.
*/
function updatePanelChildrenStatesForPanelIds(panelIds, controller) {
	const newStates = {
		controls: controller.getControlStates(),
		panels: controller.getPanelStates(),
		actions: controller.getActionStates()
	};

	for (let i = 0; i < panelIds.length; i++) {
		const state = controller.getPanelState({ "name": panelIds[i] });
		_updatePanelChildrenState(newStates, { "name": panelIds[i] }, state, controller);
	}

	controller.setControlStates(newStates.controls);
	controller.setPanelStates(newStates.panels);
	controller.setActionStates(newStates.actions);

}

/**
* Update the stated of a property
*
* @param {object} a list of controls and panels states.  This will be modified to contain
*                 the updated state. required.
* @param {object} propertyId. required.
* @param {string} proposed new state value. required.
*/
function updateState(refState, propertyId, value, controller) {
	let propState = refState[propertyId.name];
	if (!propState) {
		propState = {};
	}
	const newPropState = Object.assign({}, propState);
	const topLevelId = typeof propertyId.row === "undefined" && typeof propertyId.col === "undefined";
	if (topLevelId && newPropState.value === STATES.HIDDEN && (value === STATES.DISABLED || value === STATES.ENABLED)) {
		newPropState.value = STATES.HIDDEN;
	} else {
		newPropState.value = value;
	}

	// First allow for table level state, then column level state, and finally cell level state
	if (typeof propertyId.col !== "undefined") {
		const colId = propertyId.col.toString();
		if (!propState[colId]) {
			propState[colId] = {};
		}
		if (typeof propertyId.row !== "undefined") {
			const rowId = propertyId.row.toString();
			if (!propState[colId][rowId]) {
				propState[colId][rowId] = {};
			}
			// Table cell level
			propState[colId][rowId].value = newPropState.value;
		} else {
			// Table column level
			propState[colId].value = newPropState.value;
			// if all cells are "hidden", hide an entire column
			const hideColumn = (value === "hidden");
			const updateColumnVisibility = controller.getColumnVisibility(propertyId, propertyId.col) !== !hideColumn;
			if (typeof controller !== "undefined" && updateColumnVisibility) {
				controller.toggleColumnVisibility(propertyId, propertyId.col, !hideColumn);
			}
		}
	} else {
		// Control level
		propState.value = newPropState.value;
	}
	refState[propertyId.name] = propState;
}

/**
* Update the state of a value in an enumeration property.
*
* @param {object} a list of controls and panels states.  This will be modified to contain
*                 the updated state. required.
* @param {object} propertyId. required.
* @param {string} enumValue The enumeration value to operate upon. required.
* @param {string} proposed new state value. required.
*/
function updateEnumerationState(refState, propertyId, enumValue, value) {
	let propState = refState[propertyId.name];
	if (!propState) {
		propState = {};
	}
	if (!propState.values) {
		propState.values = {};
	}
	if (!propState.values[enumValue]) {
		propState.values[enumValue] = {};
	}
	const newPropState = Object.assign({}, propState);
	const topLevelId = typeof propertyId.row === "undefined" && typeof propertyId.col === "undefined";
	if (topLevelId && newPropState.values[enumValue].value === STATES.HIDDEN && (value === STATES.DISABLED || value === STATES.ENABLED)) {
		newPropState.values[enumValue].value = STATES.HIDDEN;
	} else {
		newPropState.values[enumValue].value = value;
	}

	// First allow for table level state, then column level state, and finally cell level state
	if (typeof propertyId.col !== "undefined") {
		const colId = propertyId.col.toString();
		if (!propState[colId]) {
			propState[colId] = {};
		}
		if (typeof propertyId.row !== "undefined") {
			const rowId = propertyId.row.toString();
			if (!propState[colId][rowId]) {
				propState[colId][rowId] = {};
			}
			if (!propState[colId][rowId].values) {
				propState[colId][rowId].values = {};
			}
			if (!propState[colId][rowId].values[enumValue]) {
				propState[colId][rowId].values[enumValue] = {};
			}
			// Table cell level
			propState[colId][rowId].values[enumValue].value = newPropState.values[enumValue].value;
		} else {
			// Table column level
			if (!propState[colId].values) {
				propState[colId].values = {};
			}
			if (!propState[colId].values[enumValue]) {
				propState[colId].values[enumValue] = {};
			}
			propState[colId].values[enumValue].value = newPropState.values[enumValue].value;
		}
	} else {
		// Control level
		propState.values[enumValue] = newPropState.values[enumValue];
	}
	refState[propertyId.name] = propState;
}

/**
* Generate a propertyId from a parameter_ref.  The new propertyId will include the row
* value from the control propertyId. If the controlPropertyId is a member of an
* unrolled structure, that propertyId will be returned.
*
* @param {string} parameter_ref value. required.
* @param {object} control propertyId. optional.
* @return {object} generated propertyId.
*/
function getParamRefPropertyId(paramRef, controlPropertyId) {
	const baseParam = {
		name: paramRef
	};
	const offset = paramRef.indexOf("[");
	if (offset > -1) {
		baseParam.name = paramRef.substring(0, offset);
		const colOffset = paramRef.substring(offset + 1);
		baseParam.col = parseInt(colOffset.substring(0, paramRef.indexOf("]")), 10);

		const nestedOffset = colOffset.indexOf("[");
		if (nestedOffset > -1) {
			const nestedColOffset = colOffset.substring(nestedOffset + 1);
			const nestedCol = parseInt(nestedColOffset.substring(0, paramRef.indexOf("]")), 10);
			baseParam.propertyId = { col: nestedCol };
		}
	}
	if (controlPropertyId) {
		baseParam.row = controlPropertyId.row;
		if (controlPropertyId.propertyId) {
			baseParam.propertyId = controlPropertyId.propertyId;
		}
	}
	return baseParam;
}

/**
* This function will inject validation definitions for controls with the following attributes.
*    Required: validation definition to ensure that the required parameter is not is not empty.
*    Date format: validation definition to ensure parameter has a proper date format.
*    Time format: validation definition to ensure parameter has a propert time format.
*
* @param {object} a list of control objects. required.
* @param {object} a list of validation definition objects. required.
* @return {object} a modified validation defintion object with any injected definitions.
*/
function injectDefaultValidations(controls, validationDefinitions, requiredDefinitionsIds, intl) {
	for (const keyName in controls) {
		if (!has(controls, keyName)) {
			continue;
		}
		const control = controls[keyName];
		// for the validation id we need a repeatable random number to ensure uniqueness within the form.
		const rng = seedrandom(keyName);
		const controlValId = 1000 * rng();

		if (control.required === true) {
			_injectRequiredDefinition(control, validationDefinitions, requiredDefinitionsIds, keyName, controlValId, intl);
		}
		if (control.role === "date" || control.role === "time") {
			_injectDateTimeDefinition(control, validationDefinitions, keyName, controlValId, intl);
		}
		if (control.role === "column") {
			// used for selectcolumns control
			let locKeyName = keyName;
			if (control.valueDef.isList) {
				locKeyName += "[0]";
			}
			_injectInvalidFieldDefinition(control, validationDefinitions, locKeyName, controlValId, intl);
		}

		if (control.subControls) {
			const subControls = {};
			for (let idx = 0; idx < control.subControls.length; idx++) {
				const subKeyName = keyName + "[" + idx + "]";
				subControls[subKeyName] = control.subControls[idx];
			}
			injectDefaultValidations(subControls, validationDefinitions, requiredDefinitionsIds, intl);
		}
	}
}


// ========= internal functions

// This function will traverse the panel tree and propogate the state so that a higher order
// panel state will be set for lower order panels.  The disableOnly flag will only propagate the
// disable state.
function 	_propagateParentPanelStates(panelTree, newStates, currentPanel, disabledOnly) {
	const currentPanelState = newStates.panels[currentPanel];
	const allowUpdate = (disabledOnly) ? (currentPanelState && (currentPanelState.value === STATES.DISABLED))
		: (currentPanelState && (currentPanelState.value === STATES.HIDDEN || currentPanelState.value === STATES.DISABLED));
		// only propagate if parent panel is hidden or disabled
	if (allowUpdate && panelTree[currentPanel]) {
		// propagate panel state to children controls
		if (panelTree[currentPanel].controls) {
			for (const control of panelTree[currentPanel].controls) {
				if (disabledOnly) {
					if (newStates.controls[control].value !== STATES.HIDDEN) {
						updateState(newStates.controls, { name: control }, currentPanelState.value);
					}
				} else {
					updateState(newStates.controls, { name: control }, currentPanelState.value);
				}
			}
		}
		// propagate panel state to children actions
		if (panelTree[currentPanel].actions) {
			for (const action of panelTree[currentPanel].actions) {
				if (disabledOnly) {
					if (newStates.actions[action].value !== STATES.HIDDEN) {
						updateState(newStates.actions, { name: action }, currentPanelState.value);
					}
				} else {
					updateState(newStates.actions, { name: action }, currentPanelState.value);
				}
			}
		}
	}
	//  check all children panels
	if (panelTree[currentPanel] && panelTree[currentPanel].panels) {
		for (const panel of panelTree[currentPanel].panels) {
			if (allowUpdate) {
				if (disabledOnly) {
					if (newStates.panels[panel].value !== STATES.HIDDEN) {
						updateState(newStates.panels, { name: panel }, currentPanelState.value);
					}
				} else {
					updateState(newStates.panels, { name: panel }, currentPanelState.value);
				}
			}
			_propagateParentPanelStates(panelTree, newStates, panel, disabledOnly);
		}
	}
}

// This will validate a single propertyID value
function _validateInput(propertyId, controller, control, showErrors) {
	let errorSet = false;
	const validations = controller.getDefinitions(propertyId, CONDITION_TYPE.VALIDATION, CONDITION_DEFINITION_INDEX.CONTROLS);
	if (validations.length > 0) {
		const requiredDefinitionsIds = controller.getRequiredDefinitionIds();
		try {
			let output = false;
			for (const validation of validations) {
				let errorMessage = DEFAULT_VALIDATION_MESSAGE;
				output = UiConditions.validateInput(validation.definition, propertyId, controller);
				let isError = false;
				if (typeof output === "object") {
					isError = true;
					errorMessage = {
						type: output.type,
						text: output.text
					};
				}
				// msgPropertyId is where the message should be set
				let msgPropertyId = cloneDeep(propertyId);
				if (validation.definition.validation &&
					validation.definition.validation.fail_message &&
					validation.definition.validation.fail_message.focus_parameter_ref) {
					msgPropertyId = getParamRefPropertyId(validation.definition.validation.fail_message.focus_parameter_ref, msgPropertyId);
				}
				// don't set column if not a subcontrol
				if (typeof msgPropertyId.col !== "undefined" && typeof control.columnIndex === "undefined") {
					delete msgPropertyId.col;
				}
				errorMessage.validation_id = msgPropertyId.name;
				if (validation.definition.validation &&
					validation.definition.validation.id) {
					errorMessage.validation_id = validation.definition.validation.id;
				}

				if (typeof msgPropertyId.row === "undefined") {
					delete msgPropertyId.row;
				}
				errorMessage.propertyId = msgPropertyId;

				// Determine if this condition is for required parameters
				errorMessage.required = requiredDefinitionsIds.indexOf(validation.definition.validation.id) > -1;
				// Only show warning messages for "colDoesExists" condition
				if (!showErrors && !validation.alwaysShow) {
					errorMessage.displayError = false;
				}

				// if error message has not been set for this msgPropertyId/focus_parameter_ref, clear errorSet
				if (!controller.getErrorMessage(msgPropertyId, true, true, false)) {
					errorSet = false;
				}
				// Before setting an error message for table cell, clear the error message for table (if any)
				// only if there are no nested propertyId
				if (typeof msgPropertyId.row !== "undefined" || typeof msgPropertyId.col !== "undefined") {
					const tablePropertyId = controller.convertPropertyId(msgPropertyId.name);
					const tableErrorMessage = controller.getErrorMessage(tablePropertyId);
					if (tableErrorMessage !== null && !msgPropertyId.propertyId) {
						controller.updateErrorMessage(tablePropertyId, null);
					}
				}

				if (isError && !errorSet) {
					controller.updateErrorMessage(msgPropertyId, errorMessage);
					if (isError) {
						errorSet = true;
					}
				} else if (!isError) {
					const msg = controller.getErrorMessage(msgPropertyId, false, false, false);
					if (!isEmpty(msg) && (msg.validation_id === errorMessage.validation_id)) {
						controller.updateErrorMessage(msgPropertyId, DEFAULT_VALIDATION_MESSAGE);
					}
				}
			}
		} catch (error) {
			logger.warn("Error thrown in validation: " + error);
		}
	}
}

// This function allows a single interface to perform all conditions validation.
// It enables common code for the various APIs by delaying the exapnsion of all three
// conditions test until this point.
function _validateConditionsByType(propertyId, newStates, controller) {
	_validateDefinitionsByType(propertyId, newStates, controller, CONDITION_TYPE.VISIBLE);
	_validateDefinitionsByType(propertyId, newStates, controller, CONDITION_TYPE.ENABLED);
	_validateDefinitionsByType(propertyId, newStates, controller, CONDITION_TYPE.FILTEREDENUM);
}

// This is a common routine that will get the appropriate definitions for the property id
// by type and validate that set of definitions.
function _validateDefinitionsByType(propertyId, newStates, controller, condType) {
	const definitions = controller.getDefinitions(propertyId, condType, CONDITION_DEFINITION_INDEX.CONTROLS);
	_validateByType(definitions, propertyId, newStates, controller, condType);
}

// This function will validate a set of definitions for the propertyId.  This is needed because
// it is invoked in various places in the code where we have a set of definitions that need to be validated.
function _validateByType(definitions, propertyId, newStates, controller, condType) {
	if (definitions.length > 0) {
		try {
			definitions.forEach((definition, idx) => {
				const evalState = UiConditions.validateInput(definition.definition, propertyId, controller);
				// After the evalution, there is different processing of the result based on the condition type.
				switch (condType) {
				case CONDITION_TYPE.VISIBLE:
					_updateControlState(evalState, definition.definition.visible, propertyId, newStates, controller, true);
					break;
				case CONDITION_TYPE.ENABLED:
					_updateControlState(evalState, definition.definition.enabled, propertyId, newStates, controller, false);
					break;
				case CONDITION_TYPE.FILTEREDENUM: {
					const lastDefinition = _isLastDefintiionForParameter(definitions, idx);
					_updateFilteredState(definition.definition, propertyId, newStates, evalState, lastDefinition);
					break;
				}
				default:
					break;
				}
			});
		} catch (error) {
			logger.warn("Error thrown in validation: " + error);
		}
	}
}

// Returns true if the defintion is the last definition for the target.parameter_ref from the list of 'definitions'
// This is only used for 'enum_filter' conditions
function _isLastDefintiionForParameter(definitions, index) {
	const currentDefinition = definitions[index];
	const currentParameter = currentDefinition.definition.enum_filter.target.parameter_ref;

	let lastDefinition = true;
	definitions.forEach((definition, idx) => {
		// definitions are evaluated in order, so assume any defition before 'idx' are already evaluated
		if (idx > index && definition.definition.enum_filter.target.parameter_ref === currentParameter) {
			lastDefinition = false;
		}
	});
	return lastDefinition;
}

// This function will update the control state of the control and all it children panels and controls.
function _updateControlState(stateOn, definition, propertyId, newStates, controller, visibleControl) {
	if (definition.parameter_refs) {
		_updateRefsState(stateOn, definition, propertyId, newStates, controller, visibleControl, definition.parameter_refs, "control");
	}
	if (definition.action_refs) {
		_updateRefsState(stateOn, definition, propertyId, newStates, controller, visibleControl, definition.action_refs, "action");
	}
	if (definition.group_refs) {
		_updateGroupRefsControlState(stateOn, definition, propertyId, newStates, controller, visibleControl);
	}
}

// This function will update the control state of the refs in the condition and all it children panels and controls.
function _updateGroupRefsControlState(stateOn, definition, propertyId, newStates, controller, visibleControl) {
	const newOnState = (visibleControl) ? STATES.VISIBLE : STATES.ENABLED;
	const newOffState = (visibleControl) ? STATES.HIDDEN : STATES.DISABLED;
	const notAllowedState = (visibleControl) ? STATES.ENABLED : STATES.HIDDEN;

	for (const groupRef of definition.group_refs) {
		const groupReferenceId = getParamRefPropertyId(groupRef);
		const currentState = _getState(newStates.panels, groupReferenceId);
		// check for visible or enabled so we aren't resetting the state all the time
		if (stateOn === true) { // control|panel should be visible || enabled
			if (groupReferenceId && currentState !== newOnState && currentState !== notAllowedState) {
				const updated = _updateStateIfParent(newStates, groupReferenceId, newOnState, controller);
				// only update the children if parent's state changed or is set for the first time
				if (updated) {
					_updatePanelChildrenState(newStates, groupReferenceId, newOnState, controller);
				}
			}
		} else if (groupReferenceId && (visibleControl || (!visibleControl && currentState !== notAllowedState))) {
			const updated = _updateStateIfParent(newStates, groupReferenceId, newOffState, controller);
			// only update the children if parent's state changed or is set for the first time
			if (updated) {
				_updatePanelChildrenState(newStates, groupReferenceId, newOffState, controller);
			}
		}
	}
}

// This function will update the control state of the refs in the condition and all it children panels and controls.
function _updateRefsState(stateOn, definition, propertyId, newStates, controller, visibleControl, refsList, refsType) {
	const newOnState = (visibleControl) ? STATES.VISIBLE : STATES.ENABLED;
	const newOffState = (visibleControl) ? STATES.HIDDEN : STATES.DISABLED;
	const notAllowedState = (visibleControl) ? STATES.ENABLED : STATES.HIDDEN;
	const refStates = (refsType === "control") ? newStates.controls : newStates.actions;
	for (const ref of refsList) {
		const referenceId = getParamRefPropertyId(ref, propertyId);
		const currentState = _getState(refStates, referenceId);
		// check for visible or enabled so we aren't resetting the state all the time
		if (Array.isArray(definition.values)) {
			// Short-circuit for disabling individual enumeration items
			for (const value of definition.values) {
				if (stateOn === true) { // control|panel should be visible || enabled
					updateEnumerationState(refStates, referenceId, value, newOnState);
				} else { // control|panel should be hidden || disabled
					updateEnumerationState(refStates, referenceId, value, newOffState);
				}
			}
		} else if (stateOn === true) { // control|panel should be visible || enabled
			if (referenceId && currentState !== newOnState && currentState !== notAllowedState) {
				updateState(refStates, referenceId, newOnState, controller);
			}
		} else if (referenceId && (visibleControl || (!visibleControl && currentState !== notAllowedState))) {
			_updateStateIfPanel(newStates, referenceId, newOffState, refStates, controller);
		}
	}
}

// Filtered state is stored in objects rather than arrays
function _updateFilteredState(definition, inPropertyId, newStates, filtered, lastDefinition) {
	if (definition.enum_filter.target && definition.enum_filter.target.parameter_ref) {
		const refState = newStates.controls;
		const propertyId = getParamRefPropertyId(definition.enum_filter.target.parameter_ref, inPropertyId);
		let propState = refState[propertyId.name];
		if (!propState) {
			propState = {};
		}
		// First allow for table level state, then column level state, and finally cell level state
		if (typeof propertyId.col !== "undefined") {
			const colId = propertyId.col.toString();
			if (!propState[colId]) {
				propState[colId] = {};
			}
			if (typeof propertyId.row !== "undefined") {
				const rowId = propertyId.row.toString();
				if (!propState[colId][rowId]) {
					propState[colId][rowId] = {};
				}
				// Cells
				const enumFilters = _getFilteredEnumItems(definition, filtered, propState[colId][rowId].enumFilter, propState[colId][rowId].enumFilterApplied, lastDefinition);
				propState[colId][rowId].enumFilter = enumFilters.values;
				propState[colId][rowId].enumFilterApplied = enumFilters.filterApplied;
			} else {
				// Columns
				const enumFilters = _getFilteredEnumItems(definition, filtered, propState[colId].enumFilter, propState[colId].enumFilterApplied, lastDefinition);
				propState[colId].enumFilter = enumFilters.values;
				propState[colId].enumFilterApplied = enumFilters.filterApplied;
			}
		} else {
			// Control-level state
			const enumFilters = _getFilteredEnumItems(definition, filtered, propState.enumFilter, propState.enumFilterApplied, lastDefinition);
			propState.enumFilter = enumFilters.values;
			propState.enumFilterApplied = enumFilters.filterApplied;
		}
		refState[propertyId.name] = propState;
	}
}

// This function will updatethe state all the children of a panel when that parent panel state
// has changed.  It will update the state of the child.  If the state is transitioning to
// enabled or visible, then the child state may need to be set by other conditions or panels states.
function _updatePanelChildrenState(newStates, referenceId, state, controller) {
	if (controller.panelTree[referenceId.name]) {
		const panelTree = controller.panelTree[referenceId.name];
		for (const panel of panelTree.panels) {
			const panelPropertyId = { name: panel };
			updateState(newStates.panels, panelPropertyId, state);
			// recurse to get the children of the panel
			_updatePanelChildrenState(newStates, panelPropertyId, state, controller);
			// after recursing down the panelTree, re-run defintions to ensure the panel is in the proper state.
			if (state === STATES.ENABLED) {
				_runRefsValidateDefinitions(panelPropertyId, controller, CONDITION_TYPE.ENABLED, newStates);
			} else if (state === STATES.VISIBLE) {
				// if the current panel is in disable state.
				if (newStates.panels[referenceId.name].disabled) {
					// propagate the state to all the children in the panel.
					_propagateParentPanelStates(controller.panelTree, newStates, referenceId.name, true);
				}
				_runRefsValidateDefinitions(panelPropertyId, controller, CONDITION_TYPE.ENABLED, newStates);
				_runRefsValidateDefinitions(panelPropertyId, controller, CONDITION_TYPE.VISIBLE, newStates);
			}
		}
		for (const control of panelTree.controls) {
			const ctrlPropertyId = { name: control };
			_updatePanelChildrenObjectState(newStates, referenceId, state, controller, ctrlPropertyId, newStates.controls);
		}
		for (const action of panelTree.actions) {
			const ctrlPropertyId = { name: action };
			_updatePanelChildrenObjectState(newStates, referenceId, state, controller, ctrlPropertyId, newStates.actions);
		}

	}
}

// In this context "Object" menas either a control or an action.
function _updatePanelChildrenObjectState(newStates, referenceId, state, controller, objectId, objectStates) {
	updateState(objectStates, objectId, state);
	// re-run ref conditions to see if they should override this new state.
	if (state === STATES.ENABLED) {
		_runRefsValidateDefinitions(objectId, controller, CONDITION_TYPE.ENABLED, newStates);
		_runRefsValidateDefinitions(objectId, controller, CONDITION_TYPE.VISIBLE, newStates);
	} else if (state === STATES.VISIBLE) {
		// need to run the controls visible conditions in case a higher level panel changed the state.
		_validateDefinitionsByType(objectId, newStates, controller, CONDITION_TYPE.VISIBLE);
		_runRefsValidateDefinitions(objectId, controller, CONDITION_TYPE.VISIBLE, newStates);
		// if parent panel is disable then set control to disabled.
		if (newStates.panels[referenceId.name].value === STATES.DISABLED) {
			updateState(objectStates, objectId, STATES.DISABLED);
		} else {
			// otherwise run any enable definition that would set the control.
			_runRefsValidateDefinitions(objectId, controller, CONDITION_TYPE.ENABLED, newStates);
		}
	}
}

// validate all conditions of the type that set the propertyID state as a result of the condition.
function _runRefsValidateDefinitions(propertyId, controller, dfnType, newStates) {
	const refsDefinitions = controller.getDefinitions(propertyId, dfnType, CONDITION_DEFINITION_INDEX.REFS);
	if (refsDefinitions.length > 0) {
		_validateByType(refsDefinitions, propertyId, newStates, controller, dfnType);
	}

}

// Only parent panels can override state of its children
function _updateStateIfParent(newStates, panel, state, controller, referenceId) {
	const panelName = panel.name;
	if (newStates.panels[panelName]) {
		const prevValue = newStates.panels[panelName].value;
		// if prevState is disabled, cannot set newState to visible. if prevState is hidden, cannot set newState to enabled
		if (((prevValue === STATES.ENABLED || prevValue === STATES.VISIBLE) && (state === STATES.DISABLED || state === STATES.HIDDEN)) ||
				(prevValue === STATES.DISABLED && state === STATES.ENABLED) ||
				(prevValue === STATES.HIDDEN && state === STATES.VISIBLE)) {
			updateState(newStates.panels, panel, state);
			return true;
		}
	} else {
		updateState(newStates.panels, panel, state);
		return true;
	}
	return false;
}

// A control can only set a state to enabled if it was previously disabled. The same applies to hidden and visible
function _updateStateIfPanel(newStates, referenceId, state, refStates, controller) {
	const controlName = referenceId.name;
	if (refStates[controlName]) {
		let prevValue = refStates[controlName].value;
		if (typeof referenceId.col !== "undefined") {
			// control is in a table
			if (refStates[controlName][referenceId.col]) {
				if (typeof referenceId.row !== "undefined" && refStates[controlName][referenceId.col][referenceId.row]) {
					prevValue = refStates[controlName][referenceId.col][referenceId.row].value;
				} else { // first time setting control state for each row in the column
					updateState(refStates, referenceId, state, controller);
				}
			} else { // first time setting control state for the column
				updateState(refStates, referenceId, state, controller);
			}
		}
		// Can only set a state to enabled if it was previously disabled. The same applies to hidden and visible
		if (((prevValue === STATES.ENABLED || prevValue === STATES.VISIBLE) && (state === STATES.DISABLED || state === STATES.HIDDEN)) ||
				(prevValue === STATES.DISABLED && state === STATES.ENABLED) ||
				(prevValue === STATES.DISABLED && state === STATES.HIDDEN) ||
				(prevValue === STATES.HIDDEN && state === STATES.VISIBLE)) {
			updateState(refStates, referenceId, state, controller);
		}
	} else { // first time setting control state
		updateState(refStates, referenceId, state, controller);
	}
}

function _getFilteredEnumItems(definition, filtered, previousValues, filterApplied, lastDefinition) {
	const enumFilter = {
		values: previousValues,
		filterApplied: lastDefinition ? false : filterApplied || true // default to true if null
	};

	let filterValues = null; // original values
	if (filtered) {
		filterValues = definition.enum_filter.target.values;
	}

	// values should be null if there are no other definitions that already modified this parameter
	if (filterValues || !filterApplied) {
		enumFilter.values = filterValues;
		enumFilter.filterApplied = true;
	}

	// reset the filters for the next validation cycle
	if (lastDefinition) {
		enumFilter.filterApplied = false;
	}

	return enumFilter;
}

// state is stored in objects rather than arrays
function _getState(refState, propertyId) {
	let propState = refState[propertyId.name];
	if (typeof propertyId.col !== "undefined" && propState) {
		propState = propState[propertyId.col.toString()];
		if (typeof propertyId.row !== "undefined" && propState) {
			propState = propState[propertyId.row.toString()];
		}
	}
	if (propState) {
		return propState.value;
	}
	return null;
}

function _injectRequiredDefinition(control, valDefinitions, requiredDefinitionsIds, keyName, controlValId, intl) {
	// inject required validation definition
	const label = (control.label && control.label.text) ? control.label.text : keyName;
	const errorMsg = formatMessage(intl,
		MESSAGE_KEYS.REQUIRED_ERROR, { label: label });
	const definitionId = "required_" + keyName + "_" + controlValId;
	const injectedDefinition = {
		params: keyName,
		definition: {
			validation: {
				id: definitionId,
				fail_message: {
					type: "error",
					message: {
						default: errorMsg
					},
					focus_parameter_ref: keyName
				},
				evaluate: {
					condition: {
						parameter_ref: keyName,
						op: "isNotEmpty"
					}
				}
			}
		}
	};
		// add the new definition to the set of validation definitions for this control.
	if (valDefinitions.controls[keyName]) {
		valDefinitions.controls[keyName].push(injectedDefinition);
	} else {
		valDefinitions.controls[keyName] = [injectedDefinition];
	}
	requiredDefinitionsIds.push(definitionId); // Save to list of required definition IDs
}

function _injectDateTimeDefinition(control, valDefinitions, keyName, controlValId, intl) {
	// inject date format validation definition
	const dtFormat = getDateTimeFormat(control);
	const errorMsg = formatMessage(intl,
		MESSAGE_KEYS.DATETIME_FORMAT_ERROR, { role: control.role, format: dtFormat });
	const injectedDefinition = {
		params: keyName,
		definition: {
			validation: {
				id: "Format_" + keyName + "_" + controlValId,
				fail_message: {
					type: "error",
					message: {
						default: errorMsg
					},
					focus_parameter_ref: keyName
				},
				evaluate: {
					condition: {
						parameter_ref: keyName,
						op: "isDateTime",
						value: control.role
					}
				}
			}
		}
	};
	// add the new definition to the set of validation definitions for this control.
	if (valDefinitions.controls[keyName]) {
		valDefinitions.controls[keyName].push(injectedDefinition);
	} else {
		valDefinitions.controls[keyName] = [injectedDefinition];
	}
}

function _injectInvalidFieldDefinition(control, valDefinitions, keyName, controlValId, intl) {
	// inject invalid field validation definition
	const label = (control.label && control.label.text) ? control.label.text : keyName;
	const errorMsg = formatMessage(intl,
		MESSAGE_KEYS.INVALID_FIELD_ERROR, { label: label });
	// Note: Please don't update "validField_" in validation id. It is used as identifier in another condition.
	const injectedDefinition = {
		params: keyName,
		definition: {
			validation: {
				id: "validField_" + keyName + "_" + controlValId,
				fail_message: {
					type: "warning",
					message: {
						default: errorMsg
					},
					focus_parameter_ref: keyName
				},
				evaluate: {
					condition: {
						parameter_ref: keyName,
						op: "colDoesExists"
					}
				}
			}
		},
		alwaysShow: true
	};
		// add the new definition to the set of validation definitions for this control.
	if (valDefinitions.controls[keyName]) {
		valDefinitions.controls[keyName].push(injectedDefinition);
	} else {
		valDefinitions.controls[keyName] = [injectedDefinition];
	}
}

// key should be 'type', 'measure', or 'modeling_role'. Return the matching metadata given the paramInfo
function getMetadataFieldMatch(paramInfo, metadata, key) {
	if (paramInfo.value) {
		if (typeof paramInfo.value === "string") {
			for (let i = 0; i < metadata.length; i++) {
				var field = metadata[i];
				if (field.name === paramInfo.value) {
					if (key === "type") {
						return field.type;
					}
					return field.metadata[key];
				}
			}
		} else if (typeof paramInfo.value === "object") {
			for (var j = 0; j < metadata.length; j++) {
				var field2 = metadata[j];
				if (field2.origName === paramInfo.value.field_name && field2.schema === paramInfo.value.link_ref) {
					if (key === "type") {
						return field2.type;
					}
					return field2.metadata[key];
				}
			}
		}
	}
	return null;
}

export {
	validatePropertiesValues,
	validateConditions,
	validatePropertiesConditions,
	validateInput,
	filterConditions,
	allowConditions,
	setConditionalDefaultValue,
	updateState,
	getParamRefPropertyId,
	injectDefaultValidations,
	updatePanelChildrenStatesForPanelIds,
	getMetadataFieldMatch
};
