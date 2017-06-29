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

function validateInput(definition, userInput) {
	var data = definition;
	if (data.validation) {
		return validation(data.validation, userInput);
	} else if (data.enabled) {
		return enabled(data.enabled, userInput);
	} else if (data.visible) {
		return visible(data.visible, userInput);
	}
	throw new Error("Invalid user input validation definition schema");
}

/**
 * A single validation. The fail-message is displayed upon validation failure.
 * @param {Object} data contains an object that adheres to the validation_definition
 *	 "validation_definition": {
 *		 "properties": {
 *			 "validation": {
 *				 "description": "A single validation. The fail-message is displayed upon validation failure.",
 *				 "type": "object",
 *				 "properties": {
 *					 "failMessage": {
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
 *				 "required": ["failMessage", "evaluate"]
 *			 }
 *		 },
 *		 "required": ["validation"]
 *	 }
 * @return {boolean} true if valid, failMessage if false.
 */
function validation(validationData, userInput) {
	logger.info("Validation check");
	// var data = JSON.parse(validationData);
	var data = validationData;
	if (data["fail-message"] && data.evaluate) {
		return evaluate(data.evaluate, userInput) || failedMessage(data["fail-message"]);
	}
	throw new Error("Invalid validation schema");
}

/**
 * Enablement test. Disables controls if evaluate is false.
 * @param {Object} data contains an object that adheres to the enabled_definition
 *	 "enabled_definition": {
 *		 "properties": {
 *			 "enabled": {
 *				 "description": "Enablement test. Disables controls if evaluate is false.",
 *				 "type": "object",
 *				 "properties": {
 *					 "paramNames": {
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
 *				"required": ["paramNames, evaluate"]
 *			 }
 *		 },
 *		"required": ["enabled"]
 *	 }
 * @return {boolean} true if valid.
 */
function enabled(enabledData, userInput) {
	logger.info("Enablement check");
	// var data = JSON.parse(enabledData);
	var data = enabledData;
	if (data.paramNames && data.evaluate) {
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
 *					 "paramNames": {
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
 *				"required": ["paramNames, evaluate"]
 *			 }
 *		 },
 *		"required": ["visible"]
 *	 }
 * @return {boolean} true if valid.
 */
function visible(visibleData, userInput) {
	logger.info("Visibility check");
	// var data = JSON.parse(visibleData);
	var data = visibleData;
	if (data.paramNames && data.evaluate) {
		return evaluate(data.evaluate, userInput);
	}
	throw new Error("Invalid visible schema");
}

/**
 * Evaluate Definition
 */
function evaluate(data, userInput) {
	if (data.or) {
		return or(data.or, userInput);
	} else if (data.and) {
		return and(data.and, userInput);
	} else if (data.condition) { // condition
		return condition(data.condition, userInput);
	}
	throw new Error("Failed to parse definition");
}

/**
 * The 'or' condition. Any sub-condition evaluates to true.
 * Can nest any number of additional conditional types.
 * @param {Object} data an array of items
 * @return {boolean}
 */
function or(data, userInput) {
	for (let i = 0; i < data.length; i++) {
		if (evaluate(data[i], userInput) === true) {
			logger.info("Or is true");
			return true;
		}
	}
	logger.info("Or is false");
	return false;
}

/**
 * The 'and' condition. All sub-conditions evaluate to true.
 * Can nest any number of additional conditional types.
 * @param {Object} data an array of items
 * @return {boolean}
 */
function and(data, userInput) {
	for (let i = 0; i < data.length; i++) {
		if (evaluate(data[i], userInput) === false) {
			logger.info("And is false");
			return false;
		}
	}
	logger.info("And is true");
	return true;
}

/**
 * A parameter condition. Evaluates to true or false.
 * @param {Object} op A single operator for the properties of the condition.
 * @param {Object} param required parameter the condition checks for
 * @param {Object} param2 optional parameter the condition checks for
 * @param {Object} value optional value the condition checks for
 * @return {boolean} true if the parameter(s) satisfy the condition
 */
function condition(data, userInput) {
	var op = data.op;
	var param = data.param;
	var param2 = data.param2 ? data.param2 : null;
	var value = data.value ? data.value : null;

	// validate if userInput has param's input
	if (typeof userInput[param] === "undefined") {
		throw new Error("param " + param + " not found in userInput");
	}

	var paramInput = userInput[param];

	switch (op) {
	case "isEmpty":
		if (typeof paramInput === "object") {
			if (paramInput.length === 1) {
				logger.info("Condition isEmpty: '" + paramInput + "' is " + (paramInput[0].length === 0));
				return paramInput[0].length === 0;
			}
			logger.info("Condition isEmpty: '" + paramInput + "' is " + (paramInput.length === 0));
			return paramInput.length === 0;
		}
		// string
		logger.info("Condition isEmpty: '" + paramInput + "' is " + (paramInput.trim().length === 0));
		return paramInput.trim().length === 0;
	case "isNotEmpty":
		if (typeof paramInput === "object") {
			if (paramInput.length === 1) {
				logger.info("Condition isNotEmpty: '" + paramInput + "' is " + (paramInput[0].length !== 0));
				return paramInput[0].length !== 0;
			}
			logger.info("Condition isNotEmpty: '" + paramInput + "' is " + (paramInput.length !== 0));
			return paramInput.length !== 0;
		}
		// string
		logger.info("Condition isNotEmpty: '" + paramInput + "' is " + (paramInput.trim().length !== 0));
		return paramInput.trim().length !== 0;
	case "greaterThan":
		if (typeof paramInput === "object") {
			return true;
		}
		if (param2 !== null && userInput[param2] && !isNaN(paramInput) && !isNaN(userInput[param2])) {
			logger.info("Condition greaterThan: " + paramInput + " > " + userInput[param2] + " is " + (parseInt(paramInput, 10) > parseInt(userInput[param2], 10)));
			return parseInt(paramInput, 10) > parseInt(userInput[param2], 10);
		} else if (value !== null && !isNaN(value)) {
			logger.info("Condition greaterThan: " + paramInput + " > " + value + " is " + (parseInt(paramInput, 10) > parseInt(value, 10)));
			return parseInt(paramInput, 10) > parseInt(value, 10);
		}
		throw new Error("Insufficient parameter for condition op: greaterThan");
	case "lessThan":
		if (typeof paramInput === "object") {
			return true;
		}
		if (param2 !== null && userInput[param2] && !isNaN(paramInput) && !isNaN(userInput[param2])) {
			logger.info("Condition lessThan: " + paramInput + " < " + userInput[param2] + " is " + (parseInt(paramInput, 10) < parseInt(userInput[param2], 10)));
			return parseInt(paramInput, 10) < parseInt(userInput[param2], 10);
		} else if (value !== null && !isNaN(value)) {
			logger.info("Condition lessThan: " + paramInput + " < " + value + " is " + (parseInt(paramInput, 10) < parseInt(value, 10)));
			return parseInt(paramInput, 10) < parseInt(value, 10);
		}
		throw new Error("Insufficient parameter for condition op: lessThan");
	case "equals":
		if (typeof paramInput === "object") {
			return true;
		}
		if (param2 !== null && userInput[param2]) {
			// eslint-disable-next-line eqeqeq
			logger.info("Condition equals: " + paramInput + " == " + userInput[param2] + " is " + (paramInput == userInput[param2]));
			// eslint-disable-next-line eqeqeq
			return paramInput == userInput[param2];
		} else if (value !== null) {
			// eslint-disable-next-line eqeqeq
			logger.info("Condition equals: " + paramInput + " == " + value + " is " + (paramInput == value));
			// eslint-disable-next-line eqeqeq
			return paramInput == value;
		}
		throw new Error("Insufficient parameter for condition op: equals");
	case "notEquals":
		if (typeof paramInput === "object") {
			return true;
		}
		if (param2 !== null && userInput[param2]) {
			// eslint-disable-next-line eqeqeq
			logger.info("Condition notEquals: " + paramInput + " != " + userInput[param2] + " is " + (paramInput != userInput[param2]));
			// eslint-disable-next-line eqeqeq
			return paramInput != userInput[param2];
		} else if (value !== null) {
			// eslint-disable-next-line eqeqeq
			logger.info("Condition notEquals: " + paramInput + " != " + value + " is " + (paramInput != value));
			// eslint-disable-next-line eqeqeq
			return paramInput != value;
		}
		throw new Error("Insufficient parameter for condition op: notEquals");
	case "contains":
		if (param2 !== null && userInput[param2]) {
			logger.info("Condition contains: " + paramInput + " contains " + userInput[param2] + " is " + (paramInput.indexOf(userInput[param2]) >= 0));
			return paramInput.indexOf(userInput[param2]) >= 0;
		} else if (value !== null) {
			logger.info("Condition contains: " + paramInput + " contains " + value + " is " + (paramInput.indexOf(value) >= 0));
			return paramInput.indexOf(value) >= 0;
		}
		throw new Error("Insufficient parameter for condition op: contains");
	case "notContains":
		if (param2 !== null && userInput[param2]) {
			logger.info("Condition notContains: " + paramInput + " notContains " + userInput[param2] + " is " + (paramInput.indexOf(userInput[param2]) < 0));
			return !paramInput.indexOf(userInput[param2]) < 0;
		} else if (value !== null) {
			logger.info("Condition notContains: " + paramInput + " notContains " + value + " is " + (paramInput.indexOf(value) < 0));
			return paramInput.indexOf(value) < 0;
		}
		throw new Error("Insufficient parameter for condition op: notContains");
	case "checked":
		logger.info("Condition checked: " + param + " is " + paramInput === "true");
		return paramInput === "true";
	case "notChecked":
		logger.info("Condition not checked: " + param + " is " + paramInput === "false");
		return paramInput === "false";
	default:
		return false;
	}

}

/**
 *
 * @param {Object} failedMessage message object with "focusParam" and "message"
 * @return {String} failed message
 */
function failedMessage(failedErrorMessage) {
	if (failedErrorMessage.focusParam && failedErrorMessage.message.default) {
		return failedErrorMessage.message.default;
	}
	return "Failed to parse failedMessage";
}

module.exports = {
	validateInput: validateInput
};
