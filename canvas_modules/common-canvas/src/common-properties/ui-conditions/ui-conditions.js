/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

function validateInput(definition, userInput) {
	var data = definition;
	if(data.validation) {
		return validation(data.validation, userInput);
	} else if (data.enabled) {
		return enabled(data.enabled, userInput);
	} else if (data.visible) {
		return visible(data.visible, userInput);
	} else {
		throw "Invalid user input validation definition schema";
	}
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
	console.log("Validation check");
	// var data = JSON.parse(validationData);
	var data = validationData;
	if (data["fail-message"] && data.evaluate) {
		return evaluate(data.evaluate, userInput) || failedMessage(data["fail-message"]);
	} else {
		throw "Invalid validation schema";
	}
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
	console.log("Enablement check");
	// var data = JSON.parse(enabledData);
	var data = enabledData;
	if (data.paramNames && data.evaluate) {
		return evaluate(data.evaluate, userInput);
	} else {
		throw "Invalid enabled schema";
	}
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
	console.log("Visibility check");
	// var data = JSON.parse(visibleData);
	var data = visibleData;
	if (data.paramNames && data.evaluate) {
		return evaluate(data.evaluate, userInput);
	} else {
		throw "Invalid visible schema";
	}
}

/**
 * Evaluate Definition
 */
function evaluate(data, userInput) {
	if(data.or) {
		return or(data.or, userInput);
	} else if (data.and) {
		return and(data.and, userInput);
	} else if (data.op && data.param) { // condition
		return condition(data, userInput);
	} else {
		throw "Failed to parse definition";
	}
}

/**
 * The 'or' condition. Any sub-condition evaluates to true.
 * Can nest any number of additional conditional types.
 * @param {Object} data an array of items
 * @return {boolean}
 */
function or(data, userInput) {
	for (let i = 0; i < data.length; i++) {
		if(evaluate(data[i], userInput) === true) {
			console.log("Or is true");
			return true;
		}
	}
	console.log("Or is false");
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
		if(evaluate(data[i], userInput) === false) {
			console.log("And is false");
			return false;
		}
	}
	console.log("And is true");
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
	if(typeof userInput[param] === "undefined") {
		throw "param " + param + " not found in userInput";
	}

	var paramInput = userInput[param];

	switch(op) {
		case "isEmpty":
			if(typeof paramInput === "object") {
				if(paramInput.length === 1) {
					console.log("Condition isEmpty: '" + paramInput + "' is " + (paramInput[0].length === 0));
					return paramInput[0].length === 0;
				} else {
					console.log("Condition isEmpty: '" + paramInput + "' is " + (paramInput.length === 0));
					return paramInput.length === 0;
				}
			} else { // string
				console.log("Condition isEmpty: '" + paramInput + "' is " + (paramInput.trim().length === 0));
				return paramInput.trim().length === 0;
			}
		case "isNotEmpty":
			if(typeof paramInput === "object") {
				if(paramInput.length === 1) {
					console.log("Condition isNotEmpty: '" + paramInput + "' is " + (paramInput[0].length !== 0));
					return paramInput[0].length !== 0;
				} else {
					console.log("Condition isNotEmpty: '" + paramInput + "' is " + (paramInput.length !== 0));
					return paramInput.length !== 0;
				}
			} else { // string
				console.log("Condition isNotEmpty: '" + paramInput + "' is " + (paramInput.trim().length !== 0));
				return paramInput.trim().length !== 0;
			}
		case "greaterThan":
			if(typeof paramInput === "object") {
				return true;
			} else {
				if(param2 !== null && userInput[param2] && !isNaN(paramInput) && ~isNaN(userInput[param2])) {
					console.log("Condition greaterThan: " + paramInput + " > " + userInput[param2] + " is " + (parseInt(paramInput) > parseInt(userInput[param2])));
					return parseInt(paramInput) > parseInt(userInput[param2]);
				} else if (value !== null && !isNaN(value)) {
					console.log("Condition greaterThan: " + paramInput + " > " + value + " is " + (parseInt(paramInput) > parseInt(value)));
					return parseInt(paramInput) > parseInt(value);
				} else {
					throw "Insufficient parameter for condition op: greaterThan";
				}
			}
		case "lessThan":
			if(typeof paramInput === "object") {
				return true;
			} else {
				if(param2 !== null && userInput[param2] && !isNaN(paramInput) && ~isNaN(userInput[param2])) {
					console.log("Condition lessThan: " + paramInput + " < " + userInput[param2] + " is " + (parseInt(paramInput) < parseInt(userInput[param2])));
					return parseInt(paramInput) < parseInt(userInput[param2]);
				} else if (value !== null && !isNaN(value)) {
					console.log("Condition lessThan: " + paramInput + " < " + value + " is " + (parseInt(paramInput) < parseInt(value)));
					return parseInt(paramInput) < parseInt(value);
				} else {
					throw "Insufficient parameter for condition op: lessThan";
				}
			}
		case "equals":
			if(typeof paramInput === "object") {
				return true;
			} else {
				if(param2 !== null && userInput[param2]) {
					console.log("Condition equals: " + paramInput + " == " + userInput[param2] + " is " + (paramInput == userInput[param2]));
					return paramInput == userInput[param2];
				} else if (value !== null) {
					console.log("Condition equals: " + paramInput + " == " + value + " is " + (paramInput == value));
					return paramInput == value;
				} else {
					throw "Insufficient parameter for condition op: equals";
				}
			}
		case "notEquals":
			if(typeof paramInput === "object") {
				return true;
			} else {
				if(param2 !== null && userInput[param2]) {
					console.log("Condition notEquals: " + paramInput + " != " + userInput[param2] + " is " + (paramInput != userInput[param2]));
					return paramInput != userInput[param2];
				} else if (value !== null) {
					console.log("Condition notEquals: " + paramInput + " != " + value + " is " + (paramInput != value));
					return paramInput != value;
				} else {
					throw "Insufficient parameter for condition op: notEquals";
				}
			}
		case "contains":
			if(param2 !== null && userInput[param2]) {
				console.log("Condition contains: " + paramInput + " contains " + userInput[param2] + " is " + (paramInput.indexOf(userInput[param2]) >= 0));
				return paramInput.indexOf(userInput[param2]) >= 0;
			} else if (value !== null) {
				console.log("Condition contains: " + paramInput + " contains " + value + " is " + (paramInput.indexOf(value) >= 0));
				return paramInput.indexOf(value) >= 0;
			} else {
				throw "Insufficient parameter for condition op: contains";
			}
		case "notContains":
			if(param2 !== null && userInput[param2]) {
				console.log("Condition notContains: " + paramInput + " notContains " + userInput[param2] + " is " + (paramInput.indexOf(userInput[param2]) < 0));
				return !paramInput.indexOf(userInput[param2]) < 0;
			} else if (value !== null) {
				console.log("Condition notContains: " + paramInput + " notContains " + value + " is " + (paramInput.indexOf(value) < 0));
				return paramInput.indexOf(value) < 0 ;
			} else {
				throw "Insufficient parameter for condition op: notContains";
			}
		case "checked":
			console.log("Condition checked: " + param + " is " + paramInput === "true");
			return paramInput === "true";
		case "notChecked":
			console.log("Condition not checked: " + param + " is " + paramInput === "false");
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
function failedMessage(failedMessage) {
	if (failedMessage.focusParam && failedMessage.message) {
		// if(failedMessage.message.default && failedMessage.message.resourceKey) {
		// 	return failedMessage.focusParam + ": " +
		// 	failedMessage.message.default + ". " +
		// 	failedMessage.message.resourceKey;
		// }
		return "FailedMessage: " + failedMessage.message.default;
	} else {
		return "Failed to parse failedMessage";
	}
}

module.exports = {
	validateInput: validateInput
};
