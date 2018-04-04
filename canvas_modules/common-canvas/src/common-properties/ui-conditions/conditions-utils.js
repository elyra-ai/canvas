/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/*	eslint max-depth: ["error", 10]*/
/* eslint complexity: ["error", 27] */

import logger from "../../../utils/logger";
import UiConditions from "../ui-conditions/ui-conditions.js";
import { DEFAULT_VALIDATION_MESSAGE, STATES, DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from "../constants/constants.js";
import { PANEL_TREE_ROOT, CONDITION_TYPE, CONDITION_DEFINITION_INDEX } from "../constants/constants.js";
import moment from "moment";
import isEmpty from "lodash/isEmpty";
import cloneDeep from "lodash/cloneDeep";

// ========= APIs ==================
// ========= Validate all properties

/**
* This function will get all controls and validate each properties value.
*
* @param {object} properties controller. required
*/
function validatePropertiesValues(controller) {
	const controls = controller.getControls();
	validatePropertiesListValues(controller, controls);
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
		panels: controller.getPanelStates()
	};
	const controls = controller.getControls();
	validatePropertiesListConditions(controller, controls, newStates);
	// propagate parent panel states
	_propagateParentPanelStates(controller.panelTree, newStates, PANEL_TREE_ROOT);
	controller.setControlStates(newStates.controls);
	controller.setPanelStates(newStates.panels);
}

// ========= Validate a list of properties

/**
* This function will take a list of controls or properties names
* and validate each properties value.
*
* @param {object} properties controller. required
* @param {object} list of control objects or properties. required
*/
function validatePropertiesListValues(controller, controls) {
	if (Object.keys(controls).length > 0) {
		for (const controlKey in controls) {
			if (!controls.hasOwnProperty(controlKey)) {
				continue;
			}
			const control = controls[controlKey];
			// control is a subcontrol
			if (control.parameterName) {
				continue;
			}
			const propertyId = control.name ? { name: control.name } : { name: control };
			const controlValue = controller.getPropertyValue(propertyId);
			if (Array.isArray(controlValue) && control.subControls) {
			// validate the table as a whole
				validateInput(propertyId, controller);
				// validate each cell
				for (let rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
					for (let colIndex = 0; colIndex < control.subControls.length; colIndex++) {
						propertyId.row = rowIndex;
						propertyId.col = colIndex;
						validateInput(propertyId, controller);
					}
				}
			} else {
				validateInput(propertyId, controller);
			}
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
			if (!controls.hasOwnProperty(controlKey)) {
				continue;
			}
			const control = controls[controlKey];
			// control is a subcontrol
			if (control.parameterName) {
				continue;
			}
			const propertyId = control.name ? { name: control.name } : { name: control };
			const controlValue = controller.getPropertyValue(propertyId);
			if (Array.isArray(controlValue) && control.subControls) {
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
			} else {
				_validateConditionsByType(propertyId, newStates, controller);
			}
		}
	}
}

// ========= Validate a single property

/**
* This function will validate a single properties value.
*
* @param {object} propertyId. required
* @param {object} properties controller. required
*/
function validateInput(propertyId, controller) {
	const control = controller.getControl(propertyId);
	if (!control) {
		logger.warn("Control not found for " + propertyId.name);
		return;
	}
	let errorSet = false;
	const validations = controller.getDefinitions(propertyId, CONDITION_TYPE.VALIDATION, CONDITION_DEFINITION_INDEX.CONTROLS);
	if (validations.length > 0) {
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
				let msgPropertyId = cloneDeep(propertyId);
				if (validation.definition.validation &&
					validation.definition.validation.fail_message &&
					validation.definition.validation.fail_message.focus_parameter_ref) {
					msgPropertyId = getParamRefPropertyId(validation.definition.validation.fail_message.focus_parameter_ref);
					if (typeof propertyId.row !== "undefined") {
						msgPropertyId.row = propertyId.row;
					}
				}
				errorMessage.validation_id = msgPropertyId.name;
				if (validation.definition.validation &&
					validation.definition.validation.id) {
					errorMessage.validation_id = validation.definition.validation.id;
				}
				if ((typeof output === "object") || (isError && !errorSet)) {
					controller.updateErrorMessage(msgPropertyId, errorMessage);
					if (isError) {
						errorSet = true;
					}
				} else if (!isError) {
					const msg = controller.getErrorMessage(msgPropertyId);
					if (!isEmpty(msg) && (msg.validation_id === errorMessage.validation_id)) {
						controller.updateErrorMessage(msgPropertyId, DEFAULT_VALIDATION_MESSAGE);
					}
				}
			}
		} catch (error) {
			logger.warn("Error thrown in validation: " + error);
		}
	}

	if (!errorSet && controller.isRequired(propertyId)) {
		errorSet = _requiredValidation(propertyId, controller);
	}

	if (!errorSet && control.role === "date") {
		_isValidDate(propertyId, controller, control.dateFormat);
	}

	if (!errorSet && control.role === "time") {
		_isValidTime(propertyId, controller, control.timeFormat);
	}
}

/**
* This function will validate a single properties for visible, enabled and
* filteredEnum.
*
* @param {object} propertyId. required
* @param {object} properties controller. required
*/
function validateConditions(inPropertyId, controller) {
	const control = controller.getControl(inPropertyId);
	if (!control) {
		logger.warn("Control not found for " + inPropertyId.name);
		return;
	}
	const newStates = {
		controls: controller.getControlStates(),
		panels: controller.getPanelStates()
	};
	const propertyId = cloneDeep(inPropertyId);
	// _validateConditionsByType(propertyId, newStates, controller);
	const controlValue = controller.getPropertyValue(propertyId);
	if (Array.isArray(controlValue) && control.subControls) {
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
	} else {
		_validateConditionsByType(propertyId, newStates, controller);
	}
	controller.setControlStates(newStates.controls);
	controller.setPanelStates(newStates.panels);
}

/**
* Filters the datamodel fields for a parameter.
*
* @param {object} propertyId. required
* @param {object} list of filter defintions. required.
* @param {object} properties controller. required
* @param {object} list of fields. required
*/
function filterConditions(propertyId, filterDefinitions, controller, fields) {
	// filters only have 1 definition
	if (filterDefinitions[propertyId.name] && filterDefinitions[propertyId.name][0]) {
		try {
			return UiConditions.filter(filterDefinitions[propertyId.name][0].definition, controller, fields);
		} catch (error) {
			logger.warn("Error thrown in filter: " + error);
		}
	}
	return fields;
}

// ========= miscellanious APIs

/**
* Takes an array of panel IDs and updates the states of the children of
* the panels identified by those IDs to be the same as the states of the panels.
*/
function updatePanelChildrenStatesForPanelIds(panelIds, controller) {
	const newStates = {
		controls: controller.getControlStates(),
		panels: controller.getPanelStates()
	};

	for (let i = 0; i < panelIds.length; i++) {
		const state = controller.getPanelState({ "name": panelIds[i] });
		_updatePanelChildrenState(newStates, { "name": panelIds[i] }, state, controller);
	}

	controller.setControlStates(newStates.controls);
	controller.setPanelStates(newStates.panels);
}

/**
* Update the stated of a property
*
* @param {object} a list of controls and panels states.  This will be modified to contain
*                 the updated state. required.
* @param {object} propertyId. required.
* @param {string} proposed new state value. required.
*/
function updateState(refState, propertyId, value) {
	let propState = refState[propertyId.name];
	if (!propState) {
		propState = {};
	}
	const newPropState = Object.assign({}, propState);
	if (newPropState.value === STATES.HIDDEN && (value === STATES.DISABLED || value === STATES.ENABLED)) {
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
		}
	} else {
		// Control level
		propState.value = newPropState.value;
	}
	refState[propertyId.name] = propState;
}

/**
* Generate a propertyId from a parameter_ref.  The new propertyId will include the row
* value from the control propertyId.
*
* @param {string} parameter_ref value. required.
* @param {object} control propertyId. required.
* @return {object} generated propertyId.
*/
function getParamRefPropertyId(paramRef, controlPropertyId) {
	const baseParam = {
		name: paramRef
	};
	const offset = paramRef.indexOf("[");
	if (offset > -1) {
		baseParam.name = paramRef.substring(0, offset);
		baseParam.col = parseInt(paramRef.substring(offset + 1, paramRef.indexOf("]")), 10);
	}
	if (controlPropertyId) {
		baseParam.row = controlPropertyId.row;
	}
	return baseParam;
}

// ========= internal functions

// This function will travers the panel tree and propogate the state so that a higher order
// panel state will be set for lower order panels.  The disableOnly flag will only propagate the
// disable state.
function 	_propagateParentPanelStates(panelTree, newStates, currentPanel, disabledOnly) {
	const currentPanelState = newStates.panels[currentPanel];
	const allowUpdate = (disabledOnly) ? (currentPanelState && (currentPanelState.value === STATES.DISABLED))
		: (currentPanelState && (currentPanelState.value === STATES.HIDDEN || currentPanelState.value === STATES.DISABLED));
	// only propagate if parent panel is hidden or disabled
	if (allowUpdate) {
		// propagate panel state to children controls
		if (panelTree[currentPanel] && panelTree[currentPanel].controls) {
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
			for (const definition of definitions) {
				const evalState = UiConditions.validateInput(definition.definition, propertyId, controller);
				// After the evalution, there is different processing of the result based on the condition type.
				switch (condType) {
				case CONDITION_TYPE.VISIBLE:
					_updateControlState(evalState, definition.definition.visible, propertyId, newStates, controller, true);
					break;
				case CONDITION_TYPE.ENABLED:
					_updateControlState(evalState, definition.definition.enabled, propertyId, newStates, controller, false);
					break;
				case CONDITION_TYPE.FILTEREDENUM:
					_updateFilteredState(definition.definition, propertyId, newStates, evalState);
					break;
				default:
					break;
				}
				// if this control has been filtered, then stop evaluating other filters for control.
				if (evalState && condType === CONDITION_TYPE.FILTEREDENUM) {
					break;
				}
			}
		} catch (error) {
			logger.warn("Error thrown in validation: " + error);
		}
	}
}

// This function will update the control state of the control and all it children panels and controls.
function _updateControlState(stateOn, definition, propertyId, newStates, controller, visibleControl) {
	const newOnState = (visibleControl) ? STATES.VISIBLE : STATES.ENABLED;
	const newOffState = (visibleControl) ? STATES.HIDDEN : STATES.DISABLED;
	const notAllowedState = (visibleControl) ? STATES.ENABLED : STATES.HIDDEN;
	if (stateOn === true) { // control|panel should be visible || enabled
		if (definition.parameter_refs) {
			for (const paramRef of definition.parameter_refs) {
				const referenceId = getParamRefPropertyId(paramRef, propertyId);
				const currentState = _getState(newStates.controls, referenceId);
				// check for visible or enabled so we aren't resetting the state all the time
				if (referenceId && currentState !== newOnState && currentState !== notAllowedState) {
					updateState(newStates.controls, referenceId, newOnState);
				}
			}
		}
		if (definition.group_refs) {
			for (const groupRef of definition.group_refs) {
				const groupReferenceId = getParamRefPropertyId(groupRef);
				const currentState = _getState(newStates.panels, groupReferenceId);
				// check for visible or enabled so we aren't resetting the state all the time
				if (groupReferenceId && currentState !== newOnState && currentState !== notAllowedState) {
					const updated = _updateStateIfParent(newStates, groupReferenceId, newOnState, controller);
					// only update the children if parent's state changed or is set for the first time
					if (updated) {
						_updatePanelChildrenState(newStates, groupReferenceId, newOnState, controller);
					}
				}
			}
		}
	} else { // control|panel should be hidden || disabled
		if (definition.parameter_refs) {
			for (const paramRef of definition.parameter_refs) {
				const referenceId = getParamRefPropertyId(paramRef, propertyId);
				const currentState = _getState(newStates.panels, referenceId);
				if (referenceId && (visibleControl || (!visibleControl && currentState !== notAllowedState))) {
					_updateStateIfPanel(newStates, referenceId, newOffState);
				}
			}
		}
		if (definition.group_refs) {
			for (const groupRef of definition.group_refs) {
				const groupReferenceId = getParamRefPropertyId(groupRef);
				const currentState = _getState(newStates.panels, groupReferenceId);
				if (groupReferenceId && (visibleControl || (!visibleControl && currentState !== notAllowedState))) {
					const updated = _updateStateIfParent(newStates, groupReferenceId, newOffState, controller);
					// only update the children if parent's state changed or is set for the first time
					if (updated) {
						_updatePanelChildrenState(newStates, groupReferenceId, newOffState, controller);
					}
				}
			}
		}
	}
}

// Filtered state is stored in objects rather than arrays
function _updateFilteredState(definition, inPropertyId, newState, filtered) {
	if (definition.enum_filter.target && definition.enum_filter.target.parameter_ref) {
		const refState = newState.controls;
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
				propState[colId][rowId].enumFilter = _getFilteredEnumItems(definition, filtered);
			} else {
			// Columns
				propState[colId].enumFilter = _getFilteredEnumItems(definition, filtered);
			}
		} else {
		// Control-level state
			propState.enumFilter = _getFilteredEnumItems(definition, filtered);
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
			updateState(newStates.controls, ctrlPropertyId, state);
			// re-run ref conditions to see if they should override this new state.
			if (state === STATES.ENABLED) {
				_runRefsValidateDefinitions(ctrlPropertyId, controller, CONDITION_TYPE.ENABLED, newStates);
				_runRefsValidateDefinitions(ctrlPropertyId, controller, CONDITION_TYPE.VISIBLE, newStates);
			} else if (state === STATES.VISIBLE) {
				// need to run the controls visible conditions in case a higher level panel changed the state.
				_validateDefinitionsByType(ctrlPropertyId, newStates, controller, CONDITION_TYPE.VISIBLE);
				_runRefsValidateDefinitions(ctrlPropertyId, controller, CONDITION_TYPE.VISIBLE, newStates);
				// if parent panel is disable then set control to disabled.
				if (newStates.panels[referenceId.name].value === STATES.DISABLED) {
					updateState(newStates.controls, ctrlPropertyId, STATES.DISABLED);
				} else {
					// otherwise run any enable definition that would set the control.
					_runRefsValidateDefinitions(ctrlPropertyId, controller, CONDITION_TYPE.ENABLED, newStates);
				}
			}
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
function _updateStateIfPanel(newStates, referenceId, state) {
	const controlName = referenceId.name;
	if (newStates.controls[controlName]) {
		let prevValue = newStates.controls[controlName].value;
		if (typeof referenceId.col !== "undefined") {
			// control is in a table
			if (newStates.controls[controlName][referenceId.col]) {
				if (typeof referenceId.row !== "undefined" && newStates.controls[controlName][referenceId.col][referenceId.row]) {
					prevValue = newStates.controls[controlName][referenceId.col][referenceId.row].value;
				} else { // first time setting control state for each row in the column
					updateState(newStates.controls, referenceId, state);
				}
			} else { // first time setting control state for the column
				updateState(newStates.controls, referenceId, state);
			}
		}
		// Can only set a state to enabled if it was previously disabled. The same applies to hidden and visible
		if (((prevValue === STATES.ENABLED || prevValue === STATES.VISIBLE) && (state === STATES.DISABLED || state === STATES.HIDDEN)) ||
				(prevValue === STATES.DISABLED && state === STATES.ENABLED) ||
				(prevValue === STATES.HIDDEN && state === STATES.VISIBLE)) {
			updateState(newStates.controls, referenceId, state);
		}
	} else { // first time setting control state
		updateState(newStates.controls, referenceId, state);
	}
}

function _getFilteredEnumItems(definition, filtered) {
	if (filtered) {
		return definition.enum_filter.target.values;
	}
	return null;
}

// state is stored in objects rather then arrays
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

function _requiredValidation(propertyId, controller) {
	const controlValue = controller.getPropertyValue(propertyId);
	let errorSet = false;
	const errorMessage = {
		validation_id: "required_" + propertyId.name + "_F26$7s#9)", // TODO replace suffix with random number from fixed seed.
	};
	if (controlValue === null || controlValue === "" || typeof controlValue === "undefined" ||
			(Array.isArray(controlValue) && controlValue.length === 0)) {
		const control = controller.getControl(propertyId);
		const label = control && control.label && control.label.text ? control.label.text : propertyId.name;
		errorMessage.type = "error";
		errorMessage.text = "Required parameter '" + label + "' has no value";
		controller.updateErrorMessage(propertyId, errorMessage);
		errorSet = true;
	} else {
		const msg = controller.getErrorMessage(propertyId);
		if (!isEmpty(msg) && (msg.validation_id === errorMessage.validation_id)) {
			controller.updateErrorMessage(propertyId, DEFAULT_VALIDATION_MESSAGE);
		}
	}
	return errorSet;
}

function _isValidDate(propertyId, controller, dtFormat) {
	const controlValue = controller.getPropertyValue(propertyId);
	let errorSet = false;

	// controlValue may not be set for a non-required field.
	if (controlValue) {
		const mom = moment.utc(controlValue, moment.ISO_8601, true);
		if (!mom.isValid()) {
			const dateFormat = dtFormat || DEFAULT_DATE_FORMAT;
			const errorMessage = {
				validation_id: propertyId.name,
				type: "error",
				text: "Invalid date. Format should be " + dateFormat
			};
			controller.updateErrorMessage(propertyId, errorMessage);
			errorSet = true;
		}
	}

	if (errorSet === false) {
		controller.updateErrorMessage(propertyId, DEFAULT_VALIDATION_MESSAGE);
	}

	return errorSet;
}

function _isValidTime(propertyId, controller, tmFormat) {
	const controlValue = controller.getPropertyValue(propertyId);
	let errorSet = false;

	// controlValue may not be set for a non-required field.
	if (controlValue) {
		const mom = moment.utc(controlValue, "HH:mm:ssZ", true);
		if (!mom.isValid()) {
			const timeFormat = tmFormat || DEFAULT_TIME_FORMAT;
			const errorMessage = {
				validation_id: propertyId.name,
				type: "error",
				text: "Invalid time. Format should be " + timeFormat
			};
			controller.updateErrorMessage(propertyId, errorMessage);
			errorSet = true;
		}
	}

	if (errorSet === false) {
		controller.updateErrorMessage(propertyId, DEFAULT_VALIDATION_MESSAGE);
	}

	return errorSet;
}


module.exports.validatePropertiesValues = validatePropertiesValues;
module.exports.validateConditions = validateConditions;
module.exports.validatePropertiesConditions = validatePropertiesConditions;
module.exports.validateInput = validateInput;
module.exports.filterConditions = filterConditions;
module.exports.updateState = updateState;
module.exports.getParamRefPropertyId = getParamRefPropertyId;
module.exports.updatePanelChildrenStatesForPanelIds = updatePanelChildrenStatesForPanelIds;
