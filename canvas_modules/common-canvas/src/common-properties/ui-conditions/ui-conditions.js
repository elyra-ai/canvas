/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 34] */

import logger from "../../../utils/logger";
import PropertyUtils from "../util/property-utils.js";

const ERROR = "error";
const WARNING = "warning";

function validateInput(definition, userInput, dataModel, cellCoordinates) {
	var data = definition;
	if (data.validation) {
		return validation(data.validation, userInput, dataModel, cellCoordinates);
	} else if (data.enabled) {
		return enabled(data.enabled, userInput);
	} else if (data.visible) {
		return visible(data.visible, userInput);
	}
	throw new Error("Invalid user input validation definition schema");
}

/**
 * A single validation. The fail_message is displayed upon validation failure.
 * @param {Object} validationData contains an object that adheres to the validation_definition
 *	 "validation_definition": {
 *		 "properties": {
 *			 "validation": {
 *				 "description": "A single validation. The fail_message is displayed upon validation failure.",
 *				 "type": "object",
 *				 "properties": {
 *					 "fail_message": {
 *						 "description": "Error/warning",
 *						 "type": "object",
 *						 "$ref": "#/definitions/failMessage_definition"
 *					 },
 *					 "evaluate": {
 *						 "description": "Evaluates to a boolean result",
 *						 "type": "object",
 *						 "$ref": "#/definitions/evaluate_definition"
 *					 }
 *				 },
 *				 "required": ["fail_message", "evaluate"]
 *			 }
 *		 },
 *		 "required": ["validation"]
 *	 }
 * @param {Any} userInput Contains the control value entered by the user
 * @param {Object} dataModel Optional data model
 * @param {Object} cellCoordinates Cell coordinates for tables
 * @return {boolean} true if valid, failMessage {Object} if false.
 */
function validation(validationData, userInput, dataModel, cellCoordinates) {
	// logger.info("Validation check");
	// var data = JSON.parse(validationData);
	var data = validationData;
	if (data.fail_message && data.evaluate) {
		return evaluate(data.evaluate, userInput, dataModel, cellCoordinates) || failedMessage(data.fail_message);
	}
	throw new Error("Invalid validation schema");
}

/**
 * Enablement test. Disables controls if evaluate is false.
 * @param {Object} enabledData contains an object that adheres to the enabled_definition
 *	 "enabled_definition": {
 *		 "properties": {
 *			 "enabled": {
 *				 "description": "Enablement test. Disables controls if evaluate is false.",
 *				 "type": "object",
 *				 "properties": {
 *					 "parameter_refs": {
 *						 "description": "Array of parameter names affected by this operation",
 *						 "type": "array",
 *						 "minItems": 1,
 *						 "items": {
 *							 "type": "string"
 *						 },
 *						 "uniqueItems": true
 *					 },
 *					 "evaluate": {
 *						 "description": "Evaluates to a boolean result",
 *						 "type": "object",
 *						 "$ref": "#/definitions/evaluate_definition"
 *					 }
 *				 },
 *				"required": ["parameter_refs, evaluate"]
 *			 }
 *		 },
 *		"required": ["enabled"]
 *	 }
 * @return {boolean} true if valid.
 */
function enabled(enabledData, userInput) {
	// logger.info("Enablement check");
	// var data = JSON.parse(enabledData);
	var data = enabledData;
	if (data.parameter_refs && data.evaluate) {
		return evaluate(data.evaluate, userInput);
	}
	throw new Error("Invalid enabled schema");
}

/**
 * Visibility test. Hides controls if evaluate is false.
 * @param {Object} data contains an object that adheres to the visible_definition
 *	 "visible_definition": {
 *		 "properties": {
 *			 "visible": {
 *				 "description": "Visibility test. Hides controls if evaluate is false.",
 *				 "type": "object",
 *				 "properties": {
 *					 "parameter_refs": {
 *						 "description": "Array of parameter names affected by this operation",
 *						 "type": "array",
 *						 "minItems": 1,
 *						 "items": {
 *							 "type": "string"
 *						 },
 *						 "uniqueItems": true
 *					 },
 *					 "evaluate": {
 *						 "description": "Evaluates to a boolean result",
 *						 "type": "object",
 *						 "$ref": "#/definitions/evaluate_definition"
 *					 }
 *				 },
 *				"required": ["parameter_refs, evaluate"]
 *			 }
 *		 },
 *		"required": ["visible"]
 *	 }
 * @return {boolean} true if valid.
 */
function visible(visibleData, userInput) {
	// logger.info("Visibility check");
	// var data = JSON.parse(visibleData);
	var data = visibleData;
	if (data.parameter_refs && data.evaluate) {
		return evaluate(data.evaluate, userInput);
	}
	throw new Error("Invalid visible schema");
}

/**
 * Evaluate Definition
 */
function evaluate(data, userInput, dataModel, cellCoordinates) {
	if (data.or) {
		return or(data.or, userInput, dataModel, cellCoordinates);
	} else if (data.and) {
		return and(data.and, userInput, dataModel, cellCoordinates);
	} else if (data.condition) { // condition
		return condition(data.condition, userInput, dataModel, cellCoordinates);
	}
	throw new Error("Failed to parse definition");
}

/**
 * The 'or' condition. Any sub-condition evaluates to true.
 * Can nest any number of additional conditional types.
 * @param {Object} data an array of items
 * @param {string} userInput User-entered value to evaluate
 * @param {Object} dataModel optional dataset metadata
 * @param {Object} cellCoordinates optional cell coordinates for tables
 * @return {boolean}
 */
function or(data, userInput, dataModel, cellCoordinates) {
	for (let i = 0; i < data.length; i++) {
		if (evaluate(data[i], userInput, dataModel, cellCoordinates) === true) {
			// logger.info("Or is true");
			return true;
		}
	}
	// logger.info("Or is false");
	return false;
}

/**
 * The 'and' condition. All sub-conditions evaluate to true.
 * Can nest any number of additional conditional types.
 * @param {Object} data an array of items
 * @param {string} userInput User-entered value to evaluate
 * @param {Object} dataModel optional dataset metadata
 * @param {Object} cellCoordinates optional cell coordinates for tables
 * @return {boolean}
 */
function and(data, userInput, dataModel, cellCoordinates) {
	for (let i = 0; i < data.length; i++) {
		if (evaluate(data[i], userInput, dataModel, cellCoordinates) === false) {
			// logger.info("And is false");
			return false;
		}
	}
	// logger.info("And is true");
	return true;
}

/**
 * A parameter condition. Evaluates to true or false.
 * @param {Object} data.op A single operator for the properties of the condition.
 * @param {Object} data.parameter_ref required parameter the condition checks for
 * @param {Object} data.parameter_2_ref optional parameter the condition checks for
 * @param {Object} data.value optional value the condition checks for
 * @param {Object} dataModel optional dataset metadata
 * @param {Object} cellCoordinates optional cell coordinates for tables
 * @return {boolean} true if the parameter(s) satisfy the condition
 */
function condition(data, userInput, dataModel, cellCoordinates) {
	var op = data.op;
	var param = data.parameter_ref;
	var param2 = data.parameter_2_ref ? data.parameter_2_ref : null;
	var value = typeof data.value !== "undefined" ? data.value : null;

	// validate if userInput has param's input
	if (typeof userInput[param] === "undefined") {
		throw new Error("param " + param + " not found in userInput");
	}

	var paramInput = userInput[param];
	const valid = _validateParams(userInput, param, ERROR);
	if (typeof valid === "object") {
		return valid;
	}

	switch (op) {
	case "isEmpty":
		return _handleEmpty(paramInput);
	case "isNotEmpty":
		return _handleNotEmpty(paramInput);
	case "greaterThan":
		return _handleGreaterThan(paramInput, userInput, param2, value);
	case "lessThan":
		return _handleLessThan(paramInput, userInput, param2, value);
	case "equals":
		return _handleEquals(paramInput, userInput, param2, value);
	case "notEquals":
		return _handleNotEquals(paramInput, userInput, param2, value);
	case "contains":
		return _handleContains(paramInput, userInput, param2, value);
	case "notContains":
		return _handleNotContains(paramInput, userInput, param2, value);
	case "checked":
		return _handleChecked(paramInput, param);
	case "notChecked":
		return _handleNotChecked(paramInput, param);
	case "colNotExists":
		return _handleColNotExists(paramInput, dataModel, cellCoordinates);
	case "cellNotEmpty":
		return _handleCellNotEmpty(paramInput, cellCoordinates);
	default:
		logger.warn("Ignoring unknown condition operation '" + op + "'");
		return true;
	}
}

function _validateParams(userInput, param, errorType) {
	var failMessage;
	if (userInput[param] === null || userInput[param] === "") {
		const internalError = {
			focus_parameter_ref: param,
			message: {
				default: param + " is missing an input value for validation."
			},
			type: errorType
		};
		failMessage = failedMessage(internalError);
	}
	return failMessage;
}

function _handleEmpty(paramInput) {
	if (typeof paramInput === "object") {
		if (paramInput.length === 1) {
			// logger.info("Condition isEmpty: '" + paramInput + "' is " + (paramInput[0].length === 0));
			return paramInput[0].length === 0;
		}
		// logger.info("Condition isEmpty: '" + paramInput + "' is " + (paramInput.length === 0));
		return paramInput.length === 0;
	}
	// string
	// logger.info("Condition isEmpty: '" + paramInput + "' is " + (paramInput.trim().length === 0));
	return paramInput === null || paramInput.trim().length === 0;
}

function _handleNotEmpty(paramInput) {
	if (typeof paramInput === "object") {
		if (paramInput.length === 1) {
			// logger.info("Condition isNotEmpty: '" + paramInput + "' is " + (paramInput[0].length !== 0));
			return paramInput[0].length !== 0;
		}
		// logger.info("Condition isNotEmpty: '" + paramInput + "' is " + (paramInput.length !== 0));
		return paramInput.length !== 0;
	}
	// string
	// logger.info("Condition isNotEmpty: '" + paramInput + "' is " + (paramInput.trim().length !== 0));
	return paramInput.toString().trim().length !== 0;
}

function _handleGreaterThan(paramInput, userInput, param2, value) {
	if (typeof paramInput === "object") {
		return true;
	}
	if (param2 !== null && typeof userInput[param2] !== "undefined") {
		const notValid = _validateParams(userInput, param2, WARNING);
		if (typeof notValid === "object") {
			return notValid;
		}

		if (typeof paramInput !== typeof userInput[param2]) {
			return false;
		}
		// logger.info("Condition greaterThan: " + paramInput + " > " + userInput[param2] + " is " + paramInput > userInput[param2]);
		return paramInput > userInput[param2];
	} else if (value !== null) {
		if (typeof paramInput !== typeof value) {
			return false;
		}
		// logger.info("Condition greaterThan: " + paramInput + " > " + value + " is " + paramInput > value);
		return paramInput > value;
	}
	throw new Error("Insufficient parameter for condition op: greaterThan");
}

function _handleLessThan(paramInput, userInput, param2, value) {
	if (typeof paramInput === "object") {
		return true;
	}
	if (param2 !== null && typeof userInput[param2] !== "undefined") {
		const notValid = _validateParams(userInput, param2, WARNING);
		if (typeof notValid === "object") {
			return notValid;
		}

		if (typeof paramInput !== typeof userInput[param2]) {
			return false;
		}
		// logger.info("Condition lessThan: " + paramInput + " < " + userInput[param2] + " is " + paramInput < userInput[param2]);
		return paramInput < userInput[param2];
	} else if (value !== null) {
		if (typeof paramInput !== typeof value) {
			return false;
		}
		// logger.info("Condition lessThan: " + paramInput + " < " + value + " is " + paramInput < value);
		return paramInput < value;
	}
	throw new Error("Insufficient parameter for condition op: lessThan");
}

function _handleEquals(paramInput, userInput, param2, value) {
	if (typeof paramInput === "object") {
		return true;
	}
	if (param2 !== null && typeof userInput[param2] !== "undefined") {
		const notValid = _validateParams(userInput, param2, WARNING);
		if (typeof notValid === "object") {
			return notValid;
		}

		if (typeof paramInput !== typeof userInput[param2]) {
			return false;
		}
		// logger.info("Condition equals: " + paramInput + " == " + userInput[param2] + " is " + (paramInput === userInput[param2]));
		return paramInput === userInput[param2];
	} else if (value !== null) {
		if (typeof paramInput !== typeof value) {
			return false;
		}
		// logger.info("Condition equals: " + paramInput + " == " + value + " is " + (inputValue === value));
		return paramInput === value;
	}
	throw new Error("Insufficient parameter for condition op: equals");
}

function _handleNotEquals(paramInput, userInput, param2, value) {
	if (typeof paramInput === "object") {
		return true;
	}
	if (param2 !== null && typeof userInput[param2] !== "undefined") {
		const notValid = _validateParams(userInput, param2, WARNING);
		if (typeof notValid === "object") {
			return notValid;
		}

		// logger.info("Condition notEquals: " + paramInput + " != " + userInput[param2] + " is " + (paramInput !== userInput[param2]));
		return paramInput !== userInput[param2];
	} else if (value !== null) {
		// logger.info("Condition notEquals: " + paramInput + " != " + value + " is " + (inputValue !== value));
		return paramInput !== value;
	}
	throw new Error("Insufficient parameter for condition op: notEquals");
}

function _handleContains(paramInput, userInput, param2, value) {
	if (param2 !== null && typeof userInput[param2] !== "undefined") {
		const notValid = _validateParams(userInput, param2, WARNING);
		if (typeof notValid === "object") {
			return notValid;
		}

		// logger.info("Condition contains: " + paramInput + " contains " + userInput[param2] + " is " + (paramInput.indexOf(userInput[param2]) >= 0));
		return paramInput.toString().indexOf(userInput[param2].toString()) >= 0;
	} else if (value !== null) {
		// logger.info("Condition contains: " + paramInput + " contains " + value + " is " + (paramInput.indexOf(value) >= 0));
		return paramInput.toString().indexOf(value.toString()) >= 0;
	}
	throw new Error("Insufficient parameter for condition op: contains");
}

function _handleNotContains(paramInput, userInput, param2, value) {
	if (param2 !== null && typeof userInput[param2] !== "undefined") {
		const notValid = _validateParams(userInput, param2, WARNING);
		if (typeof notValid === "object") {
			return notValid;
		}

		// logger.info("Condition notContains: " + paramInput + " notContains " + userInput[param2] + " is " + (paramInput.indexOf(userInput[param2]) < 0));
		return paramInput.toString().indexOf(userInput[param2].toString()) < 0;
	} else if (value !== null) {
		// logger.info("Condition notContains: " + paramInput + " notContains " + value + " is " + (paramInput.indexOf(value) < 0));
		return paramInput.toString().indexOf(value.toString()) < 0;
	}
	throw new Error("Insufficient parameter for condition op: notContains");
}

function _handleChecked(paramInput, param) {
	// logger.info("Condition checked: " + param + " is " + (paramInput !== "" && paramInput === "true") || (paramInput !== "" && paramInput !== "false");
	return (paramInput !== "" && paramInput === true) || (paramInput !== "" && paramInput !== false);
}

function _handleNotChecked(paramInput, param) {
	// logger.info("Condition not checked: " + param + " is " + (paramInput !== "" && paramInput === "false") || paramInput === "";
	return (paramInput !== "" && paramInput === false) || paramInput === "";
}

function _handleColNotExists(paramInput, dataModel, cellCoordinates) {
	// logger.info("Condition col not exists: paramInput === " + paramInput);
	if (!dataModel) {
		return true;
	}
	let value = paramInput;
	if (PropertyUtils.toType(paramInput) === "array" && cellCoordinates &&
			PropertyUtils.toType(cellCoordinates.rowIndex) === "number" &&
			PropertyUtils.toType(cellCoordinates.colIndex) === "number" &&
			cellCoordinates.rowIndex > -1 && cellCoordinates.colIndex > -1 &&
			paramInput.length > cellCoordinates.rowIndex &&
			paramInput[cellCoordinates.rowIndex].length > cellCoordinates.colIndex) {
		value = paramInput[cellCoordinates.rowIndex][cellCoordinates.colIndex];
	}
	if (!cellCoordinates || cellCoordinates.skipVal !== value) {
		for (const field of dataModel.fields) {
			if (field.name === value) {
				return false;
			}
		}
	}
	return true;
}

function _handleCellNotEmpty(paramInput, cellCoordinates) {
	let value = paramInput;
	if (PropertyUtils.toType(paramInput) === "array" && cellCoordinates) {
		if (PropertyUtils.toType(cellCoordinates.rowIndex) === "number" &&
				PropertyUtils.toType(cellCoordinates.colIndex) === "number" &&
				cellCoordinates.rowIndex > -1 && cellCoordinates.colIndex > -1 &&
				paramInput.length > cellCoordinates.rowIndex &&
				paramInput[cellCoordinates.rowIndex].length > cellCoordinates.colIndex) {
			value = (paramInput[cellCoordinates.rowIndex][cellCoordinates.colIndex]).trim();
		} else {
			// An empty array means there are no rows to test
			return true;
		}
	}
	return PropertyUtils.toType(value) !== "undefined" && String(value).length > 0;
}

/**
 *
 * @param {Object} failedMessage message object with "focus_parameter_ref" and "message"
 * @return {String} failed message
 */
function failedMessage(failedErrorMessage) {
	if (failedErrorMessage.focus_parameter_ref && failedErrorMessage.message) {
		return {
			"text": failedErrorMessage.message.default,
			"type": failedErrorMessage.type
		};
	}
	return "Failed to parse failedMessage";
}

module.exports = {
	validateInput: validateInput
};
