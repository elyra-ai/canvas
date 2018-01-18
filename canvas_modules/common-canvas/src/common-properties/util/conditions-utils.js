/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/*	eslint max-depth: ["error", 10]*/


import logger from "../../../utils/logger";
import UiConditions from "../ui-conditions/ui-conditions.js";
import { DEFAULT_VALIDATION_MESSAGE, STATES } from "../constants/constants.js";

function validateConditions(controller, visibleDefinition, enabledDefinitions, dataModel) {
	_validateVisible(controller, visibleDefinition, dataModel);
	_validateEnabled(controller, enabledDefinitions, dataModel);
}

function _validateVisible(controller, visibleDefinition, dataModel) {
	// visibleDefinition
	if (Object.keys(visibleDefinition).length > 0) {
		const propertyValues = controller.getPropertyValues();
		const newStates = controller.getControlStates();
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
							_setValidateVisible(visDefinition.definition, propertyValues, controlType, dataModel, cellCoords, newStates);
						}
					} else {
						_setValidateVisible(visDefinition.definition, propertyValues, controlType, dataModel, cellCoords, newStates);
					}

				} catch (error) {
					logger.warn("Error thrown in validation: " + error);
				}
			}
		}
		controller.setControlStates(newStates);
	}
}
function _setValidateVisible(definition, propertyValues, controlType, dataModel, cellCoords, newStates) {
	const visOutput = UiConditions.validateInput(definition, propertyValues, controlType, dataModel,
		cellCoords);
	if (visOutput === true) { // control should be visible
		for (const paramRef of definition.visible.parameter_refs) {
			const referenceId = _getPropertyId(paramRef, cellCoords);
			const currentState = _getState(newStates, referenceId);
			// check for visible or enabled so we aren't resetting the state all the time
			if (referenceId && currentState !== STATES.VISIBLE && currentState !== STATES.ENABLED) {
				_updateState(newStates, referenceId, STATES.VISIBLE);
			}
		}
	} else { // control should be hidden
		for (const paramRef of definition.visible.parameter_refs) {
			const referenceId = _getPropertyId(paramRef, cellCoords);
			if (referenceId) {
				_updateState(newStates, referenceId, STATES.HIDDEN);
			}
		}
	}
}

function _validateEnabled(controller, enabledDefinitions, dataModel) {
	// enabledDefinitions
	if (Object.keys(enabledDefinitions).length > 0) {
		const propertyValues = controller.getPropertyValues();
		const newStates = controller.getControlStates();
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
							_setValidateEnabled(enbDefinition.definition, propertyValues, controlType, dataModel, cellCoords, newStates);
						}
					} else {
						_setValidateEnabled(enbDefinition.definition, propertyValues, controlType, dataModel, cellCoords, newStates);
					}
				} catch (error) {
					logger.warn("Error thrown in validation: " + error);
				}
			}
		}
		controller.setControlStates(newStates);
	}
}

function _setValidateEnabled(definition, propertyValues, controlType, dataModel, cellCoords, newStates) {
	const enbOutput = UiConditions.validateInput(definition, propertyValues, controlType, dataModel,
		cellCoords);
	if (enbOutput === true) { // control should be enabled
		for (const paramRef of definition.enabled.parameter_refs) {
			const referenceId = _getPropertyId(paramRef, cellCoords);
			if (paramRef && _getState(newStates, referenceId) !== STATES.HIDDEN) {
				_updateState(newStates, referenceId, STATES.ENABLED);
			}
		}
	} else { // control should be disabled
		for (const paramRef of definition.enabled.parameter_refs) {
			const referenceId = _getPropertyId(paramRef, cellCoords);
			if (referenceId && _getState(newStates, referenceId) !== STATES.HIDDEN) { // if control is hidden, no need to disable it
				_updateState(newStates, referenceId, STATES.DISABLED);
			}
		}
	}
}
// state is stored in objects rather then arrays
function _updateState(refState, propertyId, value) {
	let propState = refState[propertyId.name];
	if (!propState) {
		propState = {};
	}
	if (typeof propertyId.row !== "undefined") {
		if (!propState[propertyId.row.toString()]) {
			propState[propertyId.row.toString()] = {};
		}
		if (typeof propertyId.col !== "undefined") {
			if (!propState[propertyId.row.toString()][propertyId.col.toString()]) {
				propState[propertyId.row.toString()][propertyId.col.toString()] = {};
			}
			propState[propertyId.row.toString()][propertyId.col.toString()] = {
				value: value
			};
		} else {
			propState[propertyId.row.toString()] = {
				value: value
			};
		}
	} else {
		propState = {
			value: value
		};
	}
	refState[propertyId.name] = propState;
}

// state is stored in objects rather then arrays
function _getState(refState, propertyId) {
	let propState = refState[propertyId.name];
	if (typeof propertyId.row !== "undefined" && propState) {
		propState = propState[propertyId.row.toString()];
		if (typeof propertyId.col !== "undefined" && propState) {
			propState = propState[propertyId.col.toString()];
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
			let errorMessage = DEFAULT_VALIDATION_MESSAGE;
			let validationSet = false;

			for (const validation of validations) {
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
				if (!validationSet || (typeof output === "object" && output.isActiveCell) || (isError && !errorSet)) {
					controller.updateErrorMessage(propertyId, errorMessage);
					validationSet = true;
					if (isError) {
						errorSet = true;
					}
				}
				_doGroupValidationUpdate(validation, errorMessage, output, propertyId, controller);
			}
		} catch (error) {
			logger.warn("Error thrown in validation: " + error);
		}
	}

	if (!errorSet && controller.isRequired(propertyId)) {
		_requiredValidation(propertyId, controller);
	}
}

function _doGroupValidationUpdate(validation, errorMessage, output, propertyId, controller) {
	if (typeof validation.params === "object") {
		for (const control of validation.params) {
			let groupMessage = errorMessage;
			if (output === true) {
				groupMessage = DEFAULT_VALIDATION_MESSAGE;
			}
			if (control !== propertyId.name) {
				const controlPropertyId = { name: control };
				controller.updateErrorMessage(controlPropertyId, groupMessage);
				// Special case: do not remove required property error message for secondary controls if group validation does not fail
				if (controller.isRequired(controlPropertyId) && groupMessage === DEFAULT_VALIDATION_MESSAGE) {
					_requiredValidation(controlPropertyId, controller);
				}
			}
		}
	}
}

function _requiredValidation(propertyId, controller) {
	const controlValue = controller.getPropertyValue(propertyId);
	if (controlValue === null || controlValue === "" ||
			(Array.isArray(controlValue) && controlValue.length === 0)) {
		const errorMessage = {
			type: "error",
			text: "Required parameter " + propertyId.name + " has no value"
		};
		controller.updateErrorMessage(propertyId, errorMessage);
	} else {
		controller.updateErrorMessage(propertyId, DEFAULT_VALIDATION_MESSAGE);
	}
}

function _extractValidationDefinitions(propertyId, validationDefinitions) {
	let retVal = [];
	for (const validationKey in validationDefinitions) {
		if (!validationDefinitions.hasOwnProperty(validationKey)) {
			continue;
		}
		const baseId = _getPropertyId(validationKey);
		if (baseId.name === propertyId.name) {
			// TODO seems like we should go down to the col id
			// if (typeof propertyId.col === "undefined") {
			//	retVal = retVal.concat(validationDefinitions[validationKey]);
			// } else if (baseId.col === propertyId.col) {
			//	retVal = retVal.concat(validationDefinitions[validationKey]);
			// }
			retVal = retVal.concat(validationDefinitions[validationKey]);
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
