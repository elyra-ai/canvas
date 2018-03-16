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
import { DEFAULT_VALIDATION_MESSAGE, STATES, DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT, CONTROL_TYPE } from "../constants/constants.js";
import moment from "moment";
import isEmpty from "lodash/isEmpty";

function validateConditions(controller, definitions, dataModel, initial) {
	_validateVisible(controller, definitions.visibleDefinition, dataModel, initial);
	_validateEnabled(controller, definitions.enabledDefinitions, dataModel, initial);
	_validateFilteredEnums(controller, definitions.filteredEnumDefinitions, dataModel);
}

function _validateVisible(controller, visibleDefinition, dataModel, initial) {
	// visibleDefinition
	if (Object.keys(visibleDefinition).length > 0) {
		const propertyValues = controller.getPropertyValues();
		const newStates = {
			controls: controller.getControlStates(),
			panels: controller.getPanelStates()
		};
		for (const visibleKey in visibleDefinition) {
			if (!visibleDefinition.hasOwnProperty(visibleKey)) {
				continue;
			}
			for (const visDefinition of visibleDefinition[visibleKey]) {
				const baseId = _getPropertyId(visibleKey);
				const controlType = controller.getControlType(baseId);
				let cellCoords = null;
				try {
					// table value.  Might need to also support not table arrays
					if (baseId.col) {
						for (let rowIdx = 0; rowIdx < propertyValues[baseId.name].length; rowIdx++) {
							cellCoords = {
								rowIndex: rowIdx,
								colIndex: baseId.col
							};
							_setValidateVisible(visDefinition.definition, propertyValues, controlType, dataModel, cellCoords, newStates, controller, initial);
						}
					} else {
						_setValidateVisible(visDefinition.definition, propertyValues, controlType, dataModel, cellCoords, newStates, controller, initial);
					}

				} catch (error) {
					logger.warn("Error thrown in validation: " + error);
				}
			}
		}
		controller.setControlStates(newStates.controls);
		controller.setPanelStates(newStates.panels);
	}
}

function _setValidateVisible(definition, propertyValues, controlType, dataModel, cellCoords, newStates, controller, initial) {
	const visOutput = UiConditions.validateInput(definition, propertyValues, controlType, dataModel,
		cellCoords);
	if (visOutput === true) { // control|panel should be visible
		if (definition.visible.parameter_refs) {
			for (const paramRef of definition.visible.parameter_refs) {
				const visReferenceId = _getPropertyId(paramRef, cellCoords);
				const currentState = _getState(newStates.controls, visReferenceId);
				// check for visible or enabled so we aren't resetting the state all the time
				if (visReferenceId && currentState !== STATES.VISIBLE && currentState !== STATES.ENABLED) {
					_updateStateIfPanel(newStates, visReferenceId, STATES.VISIBLE);
				}
			}
		}
		if (definition.visible.group_refs) {
			for (const groupRef of definition.visible.group_refs) {
				const groupVisReferenceId = _getPropertyId(groupRef);
				const currentState = _getState(newStates.panels, groupVisReferenceId);
				// check for visible or enabled so we aren't resetting the state all the time
				if (groupVisReferenceId && currentState !== STATES.VISIBLE && currentState !== STATES.ENABLED) {
					const updated = _updateStateIfParent(newStates, groupVisReferenceId, STATES.VISIBLE, controller);
					// only update the children if parent's state changed or is set for the first time
					if (updated || initial) {
						_updatePanelChildrenState(newStates, groupVisReferenceId, STATES.VISIBLE, controller);
					}
				}
			}
		}
	} else { // control|panel should be hidden
		if (definition.visible.parameter_refs) {
			for (const paramRef of definition.visible.parameter_refs) {
				const hidReferenceId = _getPropertyId(paramRef, cellCoords);
				if (hidReferenceId) {
					_updateStateIfPanel(newStates, hidReferenceId, STATES.HIDDEN);
				}
			}
		}
		if (definition.visible.group_refs) {
			for (const groupRef of definition.visible.group_refs) {
				const groupHidReferenceId = _getPropertyId(groupRef);
				if (groupHidReferenceId) {
					const updated = _updateStateIfParent(newStates, groupHidReferenceId, STATES.HIDDEN, controller);
					// only update the children if parent's state changed or is set for the first time
					if (updated || initial) {
						_updatePanelChildrenState(newStates, groupHidReferenceId, STATES.HIDDEN, controller);
					}
				}
			}
		}
	}
}

function _validateEnabled(controller, enabledDefinitions, dataModel, initial) {
	// enabledDefinitions
	if (Object.keys(enabledDefinitions).length > 0) {
		const propertyValues = controller.getPropertyValues();
		const newStates = {
			controls: controller.getControlStates(),
			panels: controller.getPanelStates()
		};

		for (const enabledKey in enabledDefinitions) {
			if (!enabledDefinitions.hasOwnProperty(enabledKey)) {
				continue;
			}
			for (const enbDefinition of enabledDefinitions[enabledKey]) {
				const baseId = _getPropertyId(enabledKey);
				const controlType = controller.getControlType(baseId);
				let cellCoords = null;
				try {
					// table value.  Might need to also support not table arrays
					if (baseId.col) {
						for (let rowIdx = 0; rowIdx < propertyValues[baseId.name].length; rowIdx++) {
							cellCoords = {
								rowIndex: rowIdx,
								colIndex: baseId.col
							};
							_setValidateEnabled(enbDefinition.definition, propertyValues, controlType, dataModel, cellCoords, newStates, controller, initial);
						}
					} else {
						_setValidateEnabled(enbDefinition.definition, propertyValues, controlType, dataModel, cellCoords, newStates, controller, initial);
					}
				} catch (error) {
					logger.warn("Error thrown in validation: " + error);
				}
			}
		}
		controller.setControlStates(newStates.controls);
		controller.setPanelStates(newStates.panels);
	}
}

function _setValidateEnabled(definition, propertyValues, controlType, dataModel, cellCoords, newStates, controller, initial) {
	const enbOutput = UiConditions.validateInput(definition, propertyValues, controlType, dataModel,
		cellCoords);
	if (enbOutput === true) { // control|panel should be enabled
		if (definition.enabled.parameter_refs) {
			for (const paramRef of definition.enabled.parameter_refs) {
				const enbReferenceId = _getPropertyId(paramRef, cellCoords);
				if (paramRef && _getState(newStates.controls, enbReferenceId) !== STATES.HIDDEN) {
					_updateStateIfPanel(newStates, enbReferenceId, STATES.ENABLED);
				}
			}
		}
		if (definition.enabled.group_refs) {
			for (const groupRef of definition.enabled.group_refs) {
				const groupEnbReferenceId = _getPropertyId(groupRef);
				if (groupRef && _getState(newStates.panels, groupEnbReferenceId) !== STATES.HIDDEN) {
					const updated = _updateStateIfParent(newStates, groupEnbReferenceId, STATES.ENABLED, controller);
					// only update the children if parent's state changed or is set for the first time
					if (updated || initial) {
						_updatePanelChildrenState(newStates, groupEnbReferenceId, STATES.ENABLED, controller);
					}
				}
			}
		}
	} else { // control|panel should be disabled
		if (definition.enabled.parameter_refs) {
			for (const paramRef of definition.enabled.parameter_refs) {
				const disReferenceId = _getPropertyId(paramRef, cellCoords);
				if (disReferenceId && _getState(newStates.controls, disReferenceId) !== STATES.HIDDEN) { // if control is hidden, no need to disable it
					_updateStateIfPanel(newStates, disReferenceId, STATES.DISABLED);
				}
			}
		}
		if (definition.enabled.group_refs) {
			for (const groupRef of definition.enabled.group_refs) {
				const groupDisReferenceId = _getPropertyId(groupRef);
				if (groupRef && _getState(newStates.panels, groupDisReferenceId) !== STATES.HIDDEN) {
					const updated = _updateStateIfParent(newStates, groupDisReferenceId, STATES.DISABLED, controller);
					// only update the children if parent's state changed or is set for the first time
					if (updated || initial) {
						_updatePanelChildrenState(newStates, groupDisReferenceId, STATES.DISABLED, controller);
					}
				}
			}
		}
	}
}

/*
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

function _updatePanelChildrenState(newStates, referenceId, state, controller) {
	if (controller.panelTree[referenceId.name]) {
		const panelTree = controller.panelTree[referenceId.name];
		for (const panel of panelTree.panels) {
			_updateStateIfParent(newStates, { name: panel }, state, controller, referenceId);
		}
		for (const control of panelTree.controls) {
			_updateState(newStates.controls, { name: control }, state, CONTROL_TYPE.PANEL);
		}
	}
}

// Only parent panels can override state of its children
function _updateStateIfParent(newStates, panel, state, controller, referenceId) {
	const panelName = panel.name;
	let setBy = panel.name;
	if (referenceId) {
		setBy = referenceId.name;
	}
	if (newStates.panels[panelName]) {
		const prevSetBy = newStates.panels[panelName].setBy;
		const prevValue = newStates.panels[panelName].value;
		if (controller.isPanelParent(prevSetBy, setBy) ||
			(controller.isPanelParent(prevSetBy, setBy) === false && (prevValue === STATES.ENABLED || prevValue === STATES.VISIBLE))) {
			// if prevState is disabled, cannot set newState to visible. if prevState is hidden, cannot set newState to enabled
			if (((prevValue === STATES.ENABLED || prevValue === STATES.VISIBLE) && (state === STATES.DISABLED || state === STATES.HIDDEN)) ||
				(prevValue === STATES.DISABLED && state === STATES.ENABLED) ||
				(prevValue === STATES.HIDDEN && state === STATES.VISIBLE)) {
				_updateState(newStates.panels, panel, state, setBy);
				return true;
			}
		}
	} else {
		_updateState(newStates.panels, panel, state, setBy);
		return true;
	}
	return false;
}

// A control can only update a control's state if it was not previously set by a parent panel
function _updateStateIfPanel(newStates, referenceId, state) {
	const controlName = referenceId.name;
	if (newStates.controls[controlName]) {
		let prevSetBy = newStates.controls[controlName].setBy;
		let prevValue = newStates.controls[controlName].value;
		if (typeof referenceId.col !== "undefined") {
			// control is in a table
			if (newStates.controls[controlName][referenceId.col]) {
				if (typeof referenceId.row !== "undefined" && newStates.controls[controlName][referenceId.col][referenceId.row]) {
					prevSetBy = newStates.controls[controlName][referenceId.col][referenceId.row].setBy;
					prevValue = newStates.controls[controlName][referenceId.col][referenceId.row].value;
				} else if (newStates.controls[controlName][referenceId.col].setBy) {
					prevSetBy = newStates.controls[controlName][referenceId.col].setBy;
					prevValue = newStates.controls[controlName][referenceId.col].value;
				} else { // first time setting control state for each row in the column
					_updateState(newStates.controls, referenceId, state, CONTROL_TYPE.CONTROL);
				}
			} else { // first time setting control state for the column
				_updateState(newStates.controls, referenceId, state, CONTROL_TYPE.CONTROL);
			}
		}
		// Only update control state from enabled/visible to disabled/hidden if not previosly set by a panel
		// Can only set a state to enabled if it was previously disabled. The same applies to hidden and visible
		if (prevSetBy !== CONTROL_TYPE.PANEL || (prevSetBy === CONTROL_TYPE.PANEL && (prevValue === STATES.ENABLED || prevValue === STATES.VISIBLE))) {
			if (((prevValue === STATES.ENABLED || prevValue === STATES.VISIBLE) && (state === STATES.DISABLED || state === STATES.HIDDEN)) ||
				(prevValue === STATES.DISABLED && state === STATES.ENABLED) ||
				(prevValue === STATES.HIDDEN && state === STATES.VISIBLE)) {
				_updateState(newStates.controls, referenceId, state, CONTROL_TYPE.CONTROL);
			}
		}
	} else { // first time setting control state
		_updateState(newStates.controls, referenceId, state, CONTROL_TYPE.CONTROL);
	}
}

function _validateFilteredEnums(controller, filteredEnumDefinitions, dataModel) {
	// filtered enumerations
	let lastKey;
	if (Object.keys(filteredEnumDefinitions).length > 0) {
		const propertyValues = controller.getPropertyValues();
		const newStates = controller.getControlStates();
		for (const filteredKey in filteredEnumDefinitions) {
			if (!filteredEnumDefinitions.hasOwnProperty(filteredKey)) {
				continue;
			}
			for (const filteredDefinition of filteredEnumDefinitions[filteredKey]) {
				if (lastKey === filteredKey) {
					const target = filteredDefinition.definition.enum_filter.target.parameter_ref;
					if (newStates[target].enumFilter !== null) {
						// We can skip this evaluation because a prior evaluation
						//  for the same target already triggered a filter.
						continue;
					}
				}
				const baseId = _getPropertyId(filteredKey);
				const controlType = controller.getControlType(baseId);
				let cellCoords = null;
				try {
					// Table value
					if (baseId.col) {
						for (let rowIdx = 0; rowIdx < propertyValues[baseId.name].length; rowIdx++) {
							cellCoords = {
								rowIndex: rowIdx,
								colIndex: baseId.col
							};
							_setValidateFilteredEnum(filteredDefinition.definition, propertyValues, controlType, dataModel, cellCoords, newStates);
						}
					} else {
						_setValidateFilteredEnum(filteredDefinition.definition, propertyValues, controlType, dataModel, cellCoords, newStates);
					}

				} catch (error) {
					logger.warn("Error thrown in validation: " + error);
				}
				lastKey = filteredKey;
			}
		}
		controller.setControlStates(newStates);
	}
}

function _setValidateFilteredEnum(definition, propertyValues, controlType, dataModel, cellCoords, newStates) {
	const filtered = UiConditions.validateInput(definition, propertyValues, controlType, dataModel, cellCoords);
	if (definition.enum_filter.target && definition.enum_filter.target.parameter_ref) {
		const referenceId = _getPropertyId(definition.enum_filter.target.parameter_ref, cellCoords);
		_updateFilteredState(definition, newStates, referenceId, filtered);
	}
}

// Filtered state is stored in objects rather than arrays
function _updateFilteredState(definition, refState, propertyId, filtered) {
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

function _getFilteredEnumItems(definition, filtered) {
	if (filtered) {
		return definition.enum_filter.target.values;
	}
	return null;
}

// state is stored in objects rather than arrays
function _updateState(refState, propertyId, value, setBy) {
	let propState = refState[propertyId.name];
	if (!propState) {
		propState = {};
	}

	// need to retain info on which panel or control updated the state
	// so we can ensure a child panel does not update a parent panel's state
	const newPropState = Object.assign({}, propState);
	switch (value) {
	case STATES.HIDDEN:
		newPropState.hidden = true;
		newPropState.hiddenSetBy = setBy;
		break;
	case STATES.VISIBLE:
		newPropState.hidden = false;
		newPropState.value = STATES.VISIBLE;
		newPropState.hiddenSetBy = "";
		break;
	case STATES.DISABLED:
		newPropState.disabled = true;
		newPropState.disabledSetBy = setBy;
		break;
	case STATES.ENABLED:
		newPropState.disabled = false;
		newPropState.value = STATES.ENABLED;
		newPropState.disabledSetBy = "";
		break;
	default: logger.warn("Error while setting condition state: " + value);
	}

	// a control can be both hidden and disabled through panel conditions, hidden has higher precedence
	if (newPropState.hidden) {
		newPropState.value = STATES.HIDDEN;
		newPropState.setBy = newPropState.hiddenSetBy;
	} else if (newPropState.disabled) {
		newPropState.value = STATES.DISABLED;
		newPropState.setBy = newPropState.disabledSetBy;
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
			propState[colId][rowId].hidden = newPropState.hidden;
			propState[colId][rowId].disabled = newPropState.disabled;
			propState[colId][rowId].value = newPropState.value;
			propState[colId][rowId].setBy = newPropState.setBy;
		} else {
			// Table column level
			propState[colId].hidden = newPropState.hidden;
			propState[colId].disabled = newPropState.disabled;
			propState[colId].value = newPropState.value;
			propState[colId].setBy = newPropState.setBy;
		}
	} else {
		// Control level
		propState.hidden = newPropState.hidden;
		propState.disabled = newPropState.disabled;
		propState.value = newPropState.value;
		propState.setBy = newPropState.setBy;
	}
	refState[propertyId.name] = propState;
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

// Return propertyId as a string
function _getPropertyId(paramRef, cellCoords) {
	const baseParam = {
		name: paramRef
	};
	const offset = paramRef.indexOf("[");
	if (offset > -1) {
		baseParam.name = paramRef.substring(0, offset);
		baseParam.col = parseInt(paramRef.substring(offset + 1, paramRef.indexOf("]")), 10);
	}
	if (cellCoords && typeof cellCoords.rowIndex !== "undefined") {
		baseParam.row = cellCoords.rowIndex;
	}
	return baseParam;
}

function validateInput(propertyId, controller, validationDefinitions, datasetMetadata) {
	if (!validationDefinitions) {
		return;
	}
	const control = controller.getControl(propertyId);
	if (!control) {
		logger.warn("Control not found for " + propertyId.name);
		return;
	}

	let errorSet = false;
	const validations = _extractValidationDefinitions(propertyId, validationDefinitions);
	// const validations = validationDefinitions[propertyId.name];
	const userInput = controller.getPropertyValues();
	if (Array.isArray(validations)) {
		try {
			let output = false;
			for (const validation of validations) {
				let errorMessage = DEFAULT_VALIDATION_MESSAGE;
				output = UiConditions.evaluateInput(validation.definition, userInput, control, datasetMetadata, controller.getRequiredParameters(),
					propertyId, controller);
				let isError = false;
				// logger.info("validated input field " + JSON.stringify(propertyId) + " to be " + JSON.stringify(output));
				if (typeof output === "object") {
					isError = true;
					errorMessage = {
						type: output.type,
						text: output.text
					};
				}
				let msgPropertyId = propertyId;
				if (validation.definition.validation &&
					validation.definition.validation.fail_message &&
					validation.definition.validation.fail_message.focus_parameter_ref) {
					msgPropertyId = _getPropertyId(validation.definition.validation.fail_message.focus_parameter_ref);
					if (typeof propertyId.row !== "undefined") {
						msgPropertyId.row = propertyId.row;
					}
				}
				errorMessage.validation_id = msgPropertyId.name;
				if (validation.definition.validation &&
					validation.definition.validation.id) {
					errorMessage.validation_id = validation.definition.validation.id;
				}
				if ((typeof output === "object" && output.isActiveCell) || (isError && !errorSet)) {
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

function _requiredValidation(propertyId, controller) {
	const controlValue = controller.getPropertyValue(propertyId);
	let errorSet = false;
	if (controlValue === null || controlValue === "" ||
			(Array.isArray(controlValue) && controlValue.length === 0)) {
		const control = controller.getControl(propertyId);
		const label = control && control.label && control.label.text ? control.label.text : propertyId.name;
		const errorMessage = {
			validation_id: propertyId.name,
			type: "error",
			text: "Required parameter '" + label + "' has no value"
		};
		controller.updateErrorMessage(propertyId, errorMessage);
		errorSet = true;
	} else {
		controller.updateErrorMessage(propertyId, DEFAULT_VALIDATION_MESSAGE);
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

function _extractValidationDefinitions(propertyId, validationDefinitions) {
	let retVal = [];
	for (const validationKey in validationDefinitions) {
		if (!validationDefinitions.hasOwnProperty(validationKey)) {
			continue;
		}
		const baseId = _getPropertyId(validationKey);
		if (baseId.name === propertyId.name) {
			if (typeof propertyId.col === "undefined") {
				retVal = retVal.concat(validationDefinitions[validationKey]);
			} else if (baseId.col === propertyId.col) {
				retVal = retVal.concat(validationDefinitions[validationKey]);
			}
		}
	}
	return retVal;
}

/*
* Filters the datamodel fields for a parameter.
*/
function filterConditions(propertyId, filterDefinitions, controller, datasetMetadata) {
	// filters only have 1 definition
	if (filterDefinitions[propertyId.name] && filterDefinitions[propertyId.name][0]) {
		try {
			return UiConditions.filter(filterDefinitions[propertyId.name][0].definition, controller, datasetMetadata);
		} catch (error) {
			logger.warn("Error thrown in filter: " + error);
		}
	}
	return datasetMetadata;
}


module.exports.validateConditions = validateConditions;
module.exports.validateInput = validateInput;
module.exports.filterConditions = filterConditions;
module.exports.updateState = _updateState;
module.exports.updatePanelChildrenStatesForPanelIds = updatePanelChildrenStatesForPanelIds;
